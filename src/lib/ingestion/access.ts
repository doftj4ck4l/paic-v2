import { getAppWorkbook } from "@/lib/workbooks";
import type { SourceRow } from "@/lib/sources";

export async function accessibleWorkbook(id: string, userId: string) {
  const workbook = await getAppWorkbook(id);
  return workbook && (!workbook.isDb || workbook.ownerId === userId) ? workbook : null;
}
export function canReadSource(source: SourceRow, userId: string) {
  return source.ownerId === userId || (!source.ownerId && source.id.startsWith("src_demo_"));
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
