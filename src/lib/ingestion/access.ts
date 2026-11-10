import { hasClassAccess } from "@/lib/class-access";
import { getAppWorkbook, type AppWorkbook } from "@/lib/workbooks";
import { listSources, type SourceRow } from "@/lib/sources";
import { embeddingConfigured } from "./embeddings";

export async function accessibleWorkbook(id: string, userId: string) {
  const workbook = await getAppWorkbook(id);
  return workbook && (!workbook.isDb || workbook.ownerId === userId) ? workbook : null;
}
/** Write access: only the owner of a DB workbook. Demo workbooks are read-only for everyone. */
export async function editableWorkbook(id: string, userId: string): Promise<AppWorkbook | null> {
  const workbook = await getAppWorkbook(id);
  return workbook && workbook.isDb && workbook.ownerId === userId ? workbook : null;
}
/**
 * Read access: the owner, any signed-in user on demo workbooks, any viewer of
 * a published workbook, or a student in a class the workbook is assigned or
 * shared to. Write paths use editableWorkbook.
 */
export async function viewableWorkbook(id: string, userId: string): Promise<AppWorkbook | null> {
  const workbook = await getAppWorkbook(id);
  if (!workbook) return null;
  if (!workbook.isDb || workbook.ownerId === userId || workbook.visibility === "published") return workbook;
  if (await hasClassAccess(userId, id)) return workbook;
  return null;
}
export function canReadSource(source: SourceRow, userId: string) {
  return source.ownerId === userId || (!source.ownerId && source.id.startsWith("src_demo_"));
}
export function isPendingSource(row: SourceRow) {
  return row.status === "draft" || (row.meta as Record<string, unknown> | null)?.review === "pending";
}
/** Viewer-safe source view: metadata + a short excerpt — never the full text. */
export function sourceViewPublic(source: SourceRow) {
  const meta = (source.meta ?? {}) as Record<string, unknown>;
  const excerpt = (source.fullText ?? "").slice(0, 200);
  return {
    id: source.id, title: source.title, kind: source.kind, status: source.status, sizeLabel: source.sizeLabel,
    error: null, createdAt: source.createdAt, chars: source.fullText?.length ?? 0,
    excerpt, preview: excerpt, canDelete: false,
    meta: Object.fromEntries(["url", "videoId", "method", "language", "embeddingModel"].filter((key) => meta[key] !== undefined).map((key) => [key, meta[key]])),
  };
}
/**
 * Read-only sources payload for viewers of a published or demo workbook:
 * only ready sources, owner-scoped, metadata + excerpt only.
 */
export async function sourcePayloadReadOnly(workbookId: string, workbook: AppWorkbook) {
  const ownerScope = workbook.isDb ? workbook.ownerId ?? undefined : undefined;
  const rows = (await listSources(workbookId, ownerScope)).filter((row) => row.status === "ready");
  return { sources: rows.map(sourceViewPublic), draftCount: 0, embeddingAvailable: false };
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
