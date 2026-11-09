import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { WORKBOOKS } from "@/lib/demo-data";
import { enqueueArtifactJob, isSlidesGenerationAvailable, runSlidesGeneration, slideCountFor } from "@/lib/generation/slides";

const bodySchema = z.object({
  count: z.enum(["fewer", "standard", "more"]).default("standard"),
  theme: z.enum(["clean", "bold", "warm"]).default("clean"),
  sourceIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const workbook = WORKBOOKS.find((w) => w.id === id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });

  if (!isSlidesGenerationAvailable()) {
    return NextResponse.json(
      { error: "Penjanaan AI belum dikonfigurasi pada pelayan ini." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const artifactId = `art_${randomBytes(8).toString("hex")}`;
  await db.insert(artifacts).values({
    id: artifactId,
    workbookId: id,
    userId: user.id,
    kind: "slides",
    title: "Menjana…",
    status: "generating",
    params: {
      ...parsed.data,
      count: parsed.data.count,
      slideCount: slideCountFor(parsed.data.count),
    },
  });

  enqueueArtifactJob(() => runSlidesGeneration(artifactId));

  return NextResponse.json({ id: artifactId, status: "generating" }, { status: 201 });
}
