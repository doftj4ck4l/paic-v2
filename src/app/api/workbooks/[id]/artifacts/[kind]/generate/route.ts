import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { accessibleWorkbook } from "@/lib/ingestion/access";
import { listSources } from "@/lib/sources";
import { startArtifactWorker } from "@/lib/generation/worker";
import { countFor, isArtifactKind, isGenerationAvailable } from "@/lib/generation/registry";

const bodySchema = z.object({
  count: z.enum(["fewer", "standard", "more"]).default("standard"),
  theme: z.enum(["clean", "bold", "warm"]).default("clean"),
  sourceIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id, kind } = await params;
  if (!isArtifactKind(kind)) {
    return NextResponse.json({ error: "Jenis artifak tidak dikenali." }, { status: 404 });
  }

  const workbook = await accessibleWorkbook(id, user.id);
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

  const artifactId = `art_${randomBytes(8).toString("hex")}`;
  await db.insert(artifacts).values({
    id: artifactId,
    workbookId: id,
    userId: user.id,
    kind,
    title: "Menjana…",
    status: "generating",
    params: {
      ...parsed.data,
      itemCount: countFor(kind, parsed.data.count),
      job: "generate",
      leaseUntil: null,
    },
  });

  startArtifactWorker();

  return NextResponse.json({ id: artifactId, status: "generating" }, { status: 201 });
}
