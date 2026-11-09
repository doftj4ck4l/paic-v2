import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppWorkbook } from "@/lib/workbooks";
import { getCurrentUser } from "@/lib/auth-session";
import { sourcePayload } from "@/lib/ingestion/access";
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

  // Server-side prefetch so the Sumber tab renders instantly on first paint.
  // Mirrors the sources API's access rule (owner, or demo workbooks for anyone).
  let initialSources: SourceSnapshot | null = null;
  if (user && (!workbook.isDb || workbook.ownerId === user.id)) {
    const payload = await sourcePayload(id, user.id);
    initialSources = { sources: payload.sources, draftCount: payload.draftCount, available: payload.embeddingAvailable };
  }

  return (
    <WorkbookWorkspace workbook={workbook} viewerId={user?.id ?? null} initialSources={initialSources} />
  );
}
