export type DueState = "done" | "overdue" | "soon" | "future";

/** Due-date bucket for a student's assignment row. */
export function dueState(dueAt: string | null, completed: boolean): DueState | null {
  if (!dueAt) return null;
  if (completed) return "done";
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  if (due < now) return "overdue";
  if (due - now < 2 * 86_400_000) return "soon";
  return "future";
}

export function formatDue(dueAt: string) {
  return new Date(dueAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Baru sahaja";
  if (minutes < 60) return `${minutes} minit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
}

/** Short badge text for the due state. */
export function dueLabel(dueAt: string | null, completed: boolean) {
  const state = dueState(dueAt, completed);
  if (!dueAt) return null;
  if (state === "done") return "Selesai";
  if (state === "overdue") return "Lewat";
  if (state === "soon") return "Hampir tiba";
  return formatDue(dueAt);
}
