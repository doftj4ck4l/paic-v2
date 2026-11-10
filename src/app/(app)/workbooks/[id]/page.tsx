import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppWorkbook } from "@/lib/workbooks";
import { canViewWorkbook } from "@/lib/class-access";
import { getCurrentUser } from "@/lib/auth-session";
import { sourcePayload, sourcePayloadReadOnly } from "@/lib/ingestion/access";
import type { SourceSnapshot } from "@/lib/workbook/use-sources";
import { WorkbookWorkspace } from "./workspace";

export const metadata: Metadata = { title: "Ruang Kerja Buku Kerja" };

const TAB_IDS = ["sumber", "sembang", "notes", "quizzes", "flashcards", "slides", "mindmaps", "audio", "study-guides"] as const;

export default async function WorkbookWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const workbook = await getAppWorkbook(id);
  if (!workbook) notFound();
  const user = await getCurrentUser();

  const isOwner = Boolean(user && workbook.isDb && workbook.ownerId === user.id);
  // Unpublished DB workbooks stay private to their owner and their classes.
  if (!(await canViewWorkbook(workbook, user?.id ?? null))) notFound();

  // Server-side prefetch so the Sumber tab renders instantly on first paint.
  let initialSources: SourceSnapshot | null = null;
  if (user) {
    const payload = isOwner ? await sourcePayload(id, user.id) : await sourcePayloadReadOnly(id, workbook);
    initialSources = { sources: payload.sources, draftCount: payload.draftCount, available: payload.embeddingAvailable };
  }

  const initialTab = TAB_IDS.includes(tab as (typeof TAB_IDS)[number]) ? (tab as (typeof TAB_IDS)[number]) : undefined;

  return (
    <WorkbookWorkspace workbook={workbook} viewerId={user?.id ?? null} initialSources={initialSources} initialTab={initialTab} />
  );
}
