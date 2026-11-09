import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook, sourcePayload, sourcePayloadReadOnly, sourceView, viewableWorkbook } from "@/lib/ingestion/access";
import { kickSourceWorker } from "@/lib/ingestion/worker";
import {
  createFileSource,
  createTextSource,
  createUrlSource,
  createYoutubeSource,
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  const owned = await editableWorkbook(id, user.id);
  if (owned) {
    const payload = await sourcePayload(id, user.id);
    const drafts = request.nextUrl.searchParams.get("drafts") === "1";
    void kickSourceWorker();
    return NextResponse.json({ sources: drafts ? payload.drafts : payload.sources, draftCount: payload.draftCount, embeddingAvailable: payload.embeddingAvailable });
  }
  const workbook = await viewableWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const payload = await sourcePayloadReadOnly(id, workbook);
  return NextResponse.json({ sources: payload.sources, draftCount: payload.draftCount, embeddingAvailable: payload.embeddingAvailable });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const workbook = await editableWorkbook(id, user.id);
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
      // Textbooks are already indexed in the textbook KB and chat/generation read
      // source text directly — mark ready immediately instead of re-embedding.
      const meta = { ...(row.meta as Record<string, unknown> | null), method: "textbook", bookId: body.bookId, review: "accepted" };
      if (row.status === "draft") {
        await updateSource(row.id, { kind: "textbook", status: "ready", meta });
        row.status = "ready";
      } else {
        await updateSource(row.id, { kind: "textbook", meta });
      }
      row.kind = "textbook"; row.meta = meta;
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
