export type SelectionSource = { id: string; status: string };
export function reconcileSelection(readyIds: string[], current: string[] | undefined, pending: string[], explicit: boolean) {
  // An automatic empty selection from before embedding must not lock every tool.
  const base = current === undefined || (!explicit && current.length === 0) ? readyIds : current;
  return [...new Set([...base.filter(id => readyIds.includes(id)), ...pending.filter(id => readyIds.includes(id))])];
}
const key = (workbookId: string) => `paicv3_sources_${workbookId}`;
function readArray(storageKey: string): string[] | undefined {
  try { const raw = localStorage.getItem(storageKey); if (raw === null) return undefined; const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : undefined; } catch { return undefined; }
}
export function readSourceSelection(workbookId: string) { return readArray(key(workbookId)); }
export function writeSourceSelection(workbookId: string, ids: string[], explicit = true) {
  localStorage.setItem(key(workbookId), JSON.stringify(ids));
  if (explicit) localStorage.setItem(`${key(workbookId)}_explicit`, "1");
  window.dispatchEvent(new CustomEvent("paicv3:source-selection", { detail: workbookId }));
}
export function markSourcesPending(workbookId: string, ids: string[]) {
  const storageKey = `paicv3_sources_pending_${workbookId}`;
  localStorage.setItem(storageKey, JSON.stringify([...new Set([...(readArray(storageKey) ?? []), ...ids])]));
}
export function syncSourceSelection(workbookId: string, sources: SelectionSource[]) {
  const ready = sources.filter(row => row.status === "ready").map(row => row.id);
  const pendingKey = `paicv3_sources_pending_${workbookId}`;
  const pending = readArray(pendingKey) ?? [];
  const next = reconcileSelection(ready, readSourceSelection(workbookId), pending, localStorage.getItem(`${key(workbookId)}_explicit`) === "1");
  if (JSON.stringify(next) !== JSON.stringify(readSourceSelection(workbookId))) writeSourceSelection(workbookId, next, false);
  localStorage.setItem(pendingKey, JSON.stringify(pending.filter(id => !ready.includes(id))));
  return next;
}
