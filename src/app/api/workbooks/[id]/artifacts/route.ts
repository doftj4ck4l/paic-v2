import { and, desc, eq, isNull, or } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { accessibleWorkbook } from "@/lib/ingestion/access";
import { kickArtifactWorker } from "@/lib/generation/worker";
import { isGenerationAvailable, sweepStaleGenerations } from "@/lib/generation/shared";
import { moduleSummary } from "@/lib/workbook/modules";
import { ARTIFACT_KINDS } from "@/lib/generation/registry";
import type { DeckData } from "@/lib/generation/schemas";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  if (!await accessibleWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  void kickArtifactWorker();
  const kind = request.nextUrl.searchParams.get("kind");
  if (kind && (ARTIFACT_KINDS as readonly string[]).includes(kind)) {
    await sweepStaleGenerations(id, kind);
  }

  const rows = await db
    .select()
    .from(artifacts)
    .where(and(eq(artifacts.workbookId, id), or(eq(artifacts.userId, user.id), isNull(artifacts.userId))))
    .orderBy(desc(artifacts.createdAt));

  if (!kind) {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      if (row.status === "ready") counts[row.kind] = (counts[row.kind] ?? 0) + 1;
    }
    return NextResponse.json({ counts, available: isGenerationAvailable() });
  }

  const items = rows
    .filter((row) => row.kind === kind)
    .map((row) => {
      const data = row.data as (DeckData & { image_status?: string }) | null;
      const slideCount = Array.isArray(data?.slides) ? data.slides.length : 0;
      const imagesReady = Array.isArray(data?.slides) ? data.slides.filter((s) => s.image_status === "ready").length : 0;
      const imagesPending = Array.isArray(data?.slides) ? data.slides.filter((s) => s.image_status === "pending").length : 0;
      return {
        ...moduleSummary(row.kind, row.data),
        id: row.id,
        workbookId: row.workbookId,
        kind: row.kind,
        title: row.title,
        status: row.status,
        error: row.error,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        description: moduleSummary(row.kind, row.data).description,
        questionCount: Array.isArray((row.data as { questions?: unknown[] } | null)?.questions) ? (row.data as { questions: unknown[] }).questions.length : 0,
        difficulty: (row.params as { difficulty?: string } | null)?.difficulty || "medium",
        cover: (row.params as { cover?: string } | null)?.cover || null,
        canEdit: row.userId === user.id,
        slideCount,
        imagesReady,
        imagesPending,
      };
    });

  return NextResponse.json({ artifacts: items, available: isGenerationAvailable() });
}
