import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { isGenerationAvailable, sweepStaleGenerations } from "@/lib/generation/shared";
import { ARTIFACT_KINDS } from "@/lib/generation/registry";
import type { DeckData } from "@/lib/generation/schemas";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const kind = request.nextUrl.searchParams.get("kind") ?? "slides";
  if ((ARTIFACT_KINDS as readonly string[]).includes(kind)) {
    await sweepStaleGenerations(id, kind);
  }

  const rows = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.workbookId, id))
    .orderBy(desc(artifacts.createdAt));

  const items = rows
    .filter((row) => row.kind === kind)
    .map((row) => {
      const data = row.data as (DeckData & { image_status?: string }) | null;
      const slideCount = Array.isArray(data?.slides) ? data.slides.length : 0;
      const imagesReady = Array.isArray(data?.slides) ? data.slides.filter((s) => s.image_status === "ready").length : 0;
      const imagesPending = Array.isArray(data?.slides) ? data.slides.filter((s) => s.image_status === "pending").length : 0;
      return {
        id: row.id,
        workbookId: row.workbookId,
        kind: row.kind,
        title: row.title,
        status: row.status,
        error: row.error,
        createdAt: row.createdAt,
        slideCount,
        imagesReady,
        imagesPending,
      };
    });

  return NextResponse.json({ artifacts: items, available: isGenerationAvailable() });
}
