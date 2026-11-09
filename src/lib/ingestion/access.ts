import { getAppWorkbook } from "@/lib/workbooks";
import { listSources, type SourceRow } from "@/lib/sources";
import { embeddingConfigured } from "./embeddings";

export async function accessibleWorkbook(id: string, userId: string) {
  const workbook = await getAppWorkbook(id);
  return workbook && (!workbook.isDb || workbook.ownerId === userId) ? workbook : null;
}
export function canReadSource(source: SourceRow, userId: string) {
  return source.ownerId === userId || (!source.ownerId && source.id.startsWith("src_demo_"));
}
export function isPendingSource(row: SourceRow) {
  return row.status === "draft" || (row.meta as Record<string, unknown> | null)?.review === "pending";
}
/**
 * Shared payload for the sources API and the workbook page's server-side
 * prefetch — keeps both paths byte-identical.
 */
export async function sourcePayload(workbookId: string, viewerId: string) {
  const rows = await listSources(workbookId, viewerId);
  const pending = rows.filter(isPendingSource);
  return {
    sources: rows.filter((row) => !isPendingSource(row)).map((row) => sourceView(row, viewerId)),
    drafts: pending.map((row) => sourceView(row, viewerId)),
    draftCount: pending.length,
    embeddingAvailable: embeddingConfigured(),
  };
}
export function sourceView(source: SourceRow, viewerId: string, full = false) {
  const meta = (source.meta ?? {}) as Record<string, unknown>;
  return {
    id: source.id, title: source.title, kind: source.kind, status: source.status, sizeLabel: source.sizeLabel,
    error: source.error, createdAt: source.createdAt, chars: source.fullText?.length ?? 0,
    excerpt: (source.fullText ?? "").slice(0, 200), preview: (source.fullText ?? "").slice(0, 2400),
    ...(full ? { fullText: source.fullText } : {}), canDelete: source.ownerId === viewerId,
    meta: Object.fromEntries(["url", "videoId", "method", "language", "stage", "progress", "completedChunks", "totalChunks", "embeddingModel", "relevanceScore", "relevanceReason", "review", "errorCode"].filter((key) => meta[key] !== undefined).map((key) => [key, meta[key]])),
  };
}
