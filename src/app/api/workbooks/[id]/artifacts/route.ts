import { desc, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { isSlidesGenerationAvailable, sweepStaleGenerations } from "@/lib/generation/slides";
import type { DeckData } from "@/lib/generation/schemas";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const kind = request.nextUrl.searchParams.get("kind") ?? "slides";
  await sweepStaleGenerations(id, kind);

  const rows = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.workbookId, id))
    .orderBy(desc(artifacts.createdAt));

  const items = rows
    .filter((row) => row.kind === kind)
    .map((row) => {
      const data = row.data as DeckData | null;
      const slideCount = data?.slides?.length ?? 0;
      const imagesReady = data?.slides?.filter((s) => s.image_status === "ready").length ?? 0;
      const imagesPending = data?.slides?.filter((s) => s.image_status === "pending").length ?? 0;
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

  return NextResponse.json({ artifacts: items, available: isSlidesGenerationAvailable() });
}
