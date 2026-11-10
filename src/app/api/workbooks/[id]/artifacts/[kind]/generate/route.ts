import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook } from "@/lib/ingestion/access";
import { listSources } from "@/lib/sources";
import { startArtifactWorker } from "@/lib/generation/worker";
import { countFor, isArtifactKind, isGenerationAvailable } from "@/lib/generation/registry";

const bodySchema = z.object({
  count: z.enum(["fewer", "standard", "more"]).default("standard"),
  theme: z.enum(["clean", "bold", "warm"]).default("clean"),
  focus: z.string().trim().max(200).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  sourceIds: z.array(z.string()).optional(),
  format: z.enum(["text", "images"]).optional(),
  feedback: z.string().trim().max(300).optional(),
  artifactId: z.string().min(1).max(60).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id, kind } = await params;
  if (!isArtifactKind(kind)) {
    return NextResponse.json({ error: "Jenis artifak tidak dikenali." }, { status: 404 });
  }

  const workbook = await editableWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });

  if (!isGenerationAvailable()) {
    return NextResponse.json(
      { error: "Penjanaan AI belum dikonfigurasi pada pelayan ini." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const ready = (await listSources(id, user.id)).filter(row => row.status === "ready" && row.fullText?.trim());
  const selected = parsed.data.sourceIds ?? ready.map(row => row.id);
  if (!selected.length || selected.some(sourceId => !ready.some(row => row.id === sourceId))) return NextResponse.json({ error: "Pilih sumber yang telah siap diembed dalam tab Sumber dahulu." }, { status: 422 });
  parsed.data.sourceIds = selected;

  const jobParams = {
    ...parsed.data,
    itemCount: countFor(kind, parsed.data.count),
    job: "generate",
    leaseUntil: null,
  };

  // Regenerate an existing deck in place (owner-confirmed from the UI).
  if (parsed.data.artifactId) {
    const [existing] = await db.select().from(artifacts).where(and(eq(artifacts.id, parsed.data.artifactId), eq(artifacts.userId, user.id)));
    if (!existing || existing.workbookId !== id || existing.kind !== kind) {
      return NextResponse.json({ error: "Artifak tidak dijumpai." }, { status: 404 });
    }
    await db.update(artifacts).set({ status: "generating", error: null, updatedAt: new Date(), params: { ...jobParams, artifactId: undefined } }).where(eq(artifacts.id, existing.id));
    startArtifactWorker();
    return NextResponse.json({ id: existing.id, status: "generating" }, { status: 202 });
  }

  const artifactId = `art_${randomBytes(8).toString("hex")}`;
  await db.insert(artifacts).values({
    id: artifactId,
    workbookId: id,
    userId: user.id,
    kind,
    title: "Menjana…",
    status: "generating",
    params: jobParams,
  });

  startArtifactWorker();

  return NextResponse.json({ id: artifactId, status: "generating" }, { status: 201 });
}
