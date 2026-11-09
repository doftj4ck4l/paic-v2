import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppWorkbook } from "@/lib/workbooks";
import { getCurrentUser } from "@/lib/auth-session";
import { sourcePayload, sourcePayloadReadOnly } from "@/lib/ingestion/access";
import type { SourceSnapshot } from "@/lib/workbook/use-sources";
import { WorkbookWorkspace } from "./workspace";

export const metadata: Metadata = { title: "Ruang Kerja Buku Kerja" };

export default async function WorkbookWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workbook = await getAppWorkbook(id);
  if (!workbook) notFound();
  const user = await getCurrentUser();

  const isOwner = Boolean(user && workbook.isDb && workbook.ownerId === user.id);
  const isViewer = Boolean(user && (!workbook.isDb || workbook.visibility === "published"));
  // Unpublished DB workbooks stay private to their owner.
  if (!isOwner && !isViewer) notFound();

  // Server-side prefetch so the Sumber tab renders instantly on first paint.
  let initialSources: SourceSnapshot | null = null;
  if (user) {
    const payload = isOwner ? await sourcePayload(id, user.id) : await sourcePayloadReadOnly(id, workbook);
    initialSources = { sources: payload.sources, draftCount: payload.draftCount, available: payload.embeddingAvailable };
  }

  return (
    <WorkbookWorkspace workbook={workbook} viewerId={user?.id ?? null} initialSources={initialSources} />
  );
}
