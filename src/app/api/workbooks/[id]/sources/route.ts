import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { accessibleWorkbook, sourceView } from "@/lib/ingestion/access";
import { embeddingConfigured } from "@/lib/ingestion/embeddings";
import { kickSourceWorker } from "@/lib/ingestion/worker";
import {
  createFileSource,
  createTextSource,
  createUrlSource,
  createYoutubeSource,
  listSources,
  updateSource,
  mergeSourceMeta,
} from "@/lib/sources";
import { assessSource } from "@/lib/ingestion/relevance";
import { compileTextbookContent } from "@/lib/textbooks";

const jsonSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), title: z.string().trim().max(160).optional(), text: z.string().min(30).max(800_000) }),
  z.object({ type: z.literal("url"), url: z.string().url(), title: z.string().trim().max(160).optional() }),
  z.object({ type: z.literal("youtube"), url: z.string().url() }),
  z.object({ type: z.literal("textbook"), bookId: z.coerce.number().int().positive() }),
]);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  if (!await accessibleWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const rows = await listSources(id, user.id);
  const pending = (row: typeof rows[number]) => row.status === "draft" || (row.meta as Record<string, unknown> | null)?.review === "pending";
  const drafts = _request.nextUrl.searchParams.get("drafts") === "1";
  void kickSourceWorker();
  return NextResponse.json({ sources: rows.filter(row => drafts ? pending(row) : !pending(row)).map(row => sourceView(row, user.id)), draftCount: rows.filter(pending).length, embeddingAvailable: embeddingConfigured() });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const workbook = await accessibleWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Tiada fail diterima." }, { status: 400 });
      }
      const row = await createFileSource(id, user.id, file);
      return NextResponse.json({ source: sourceView(row, user.id) }, { status: 201 });
    }

    const parsed = jsonSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
    }

    const body = parsed.data;
    let row;
    if (body.type === "text") {
      row = await createTextSource(id, user.id, body.title ?? "Nota teks", body.text);
    } else if (body.type === "url") {
      row = await createUrlSource(id, user.id, body.url, body.title);
    } else if (body.type === "youtube") {
      row = await createYoutubeSource(id, user.id, body.url);
    } else {
      const compiled = await compileTextbookContent(body.bookId);
      row = await createTextSource(id, user.id, `Buku teks: ${compiled.title}`, compiled.text);
      row.kind = "textbook"; await updateSource(row.id, { kind: "textbook" });
    }
    if (body.type === "url" && row.status === "draft") {
      const assessment = await assessSource(row, workbook);
      if (assessment) { row.meta = { ...(row.meta as Record<string, unknown> | null), ...assessment }; await mergeSourceMeta(row.id, assessment); }
    }
    return NextResponse.json({ source: sourceView(row, user.id) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sumber gagal ditambah.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
