import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { isGenerationMock, isRouterConfigured } from "./router";

export async function updateArtifact(id: string, values: Partial<typeof artifacts.$inferInsert>) {
  await db
    .update(artifacts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(artifacts.id, id));
}

/** Serializes read-modify-write cycles on an artifact's data JSON. */
let dataLock: Promise<unknown> = Promise.resolve();
export function withDataLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = dataLock.then(fn, fn);
  dataLock = run.catch(() => {});
  return run;
}

/** Patch an artifact's data object atomically (read → transform → write). */
export async function patchArtifactData(id: string, patch: (data: Record<string, unknown>) => Record<string, unknown>) {
  await withDataLock(async () => {
    const [row] = await db.select().from(artifacts).where(eq(artifacts.id, id));
    const current = (row?.data ?? {}) as Record<string, unknown>;
    await updateArtifact(id, { data: patch(current) });
  });
}

export function isGenerationAvailable(): boolean {
  return isRouterConfigured() || isGenerationMock();
}

/** Mark abandoned "generating" rows as failed (e.g. after a server restart). */
export async function sweepStaleGenerations(workbookId: string, kind: string) {
  const rows = await db.select().from(artifacts).where(eq(artifacts.workbookId, workbookId));
  const staleBefore = Date.now() - 10 * 60 * 1000;
  for (const row of rows) {
    if ((row.params as { job?: string } | null)?.job === "generate") continue;
    if (row.kind === kind && row.status === "generating" && row.updatedAt.getTime() < staleBefore) {
      await updateArtifact(row.id, { status: "failed", error: "Penjanaan terhenti. Sila cuba lagi." });
    }
  }
}
