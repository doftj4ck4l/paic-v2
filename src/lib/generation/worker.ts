import { randomBytes } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { isArtifactKind, runArtifactGeneration } from "./registry";
const state = globalThis as unknown as { __artifactWorker?: { active: number; pumping: boolean; timer?: ReturnType<typeof setInterval> } };
const worker = state.__artifactWorker ??= { active: 0, pumping: false };
async function run(id: string) {
  const token = randomBytes(12).toString("hex");
  const [claimed] = await db.update(artifacts).set({ updatedAt: new Date(), params: sql`coalesce(${artifacts.params}, '{}'::jsonb) || ${JSON.stringify({ workerToken: token, leaseUntil: new Date(Date.now() + 180000).toISOString() })}::jsonb` }).where(and(eq(artifacts.id, id), eq(artifacts.status, "generating"), sql`${artifacts.params}->>'job' = 'generate'`, sql`(${artifacts.params}->>'leaseUntil' IS NULL OR (${artifacts.params}->>'leaseUntil')::timestamptz < now())`)).returning();
  if (!claimed) return;
  const heartbeat = setInterval(() => {
    void db.update(artifacts).set({ updatedAt: new Date(), params: sql`coalesce(${artifacts.params}, '{}'::jsonb) || ${JSON.stringify({ leaseUntil: new Date(Date.now() + 180000).toISOString() })}::jsonb` }).where(and(eq(artifacts.id, id), eq(artifacts.status, "generating"), sql`${artifacts.params}->>'workerToken' = ${token}`)).catch(() => undefined);
  }, 45000);
  heartbeat.unref?.();
  try {
    if (!isArtifactKind(claimed.kind)) throw new Error("Jenis bahan tidak dikenali.");
    await runArtifactGeneration(id, claimed.kind);
  } catch {
    await db.update(artifacts).set({ status: "failed", error: "Penjanaan terganggu. Sila cuba lagi.", updatedAt: new Date() }).where(and(eq(artifacts.id, id), eq(artifacts.status, "generating"), sql`${artifacts.params}->>'workerToken' = ${token}`));
  } finally {
    clearInterval(heartbeat);
    await db.update(artifacts).set({ params: sql`coalesce(${artifacts.params}, '{}'::jsonb) || '{"workerToken":null,"leaseUntil":null}'::jsonb` }).where(and(eq(artifacts.id, id), sql`${artifacts.params}->>'workerToken' = ${token}`));
  }
}
export async function kickArtifactWorker() {
  if (worker.pumping || worker.active >= 3) return;
  worker.pumping = true;
  try {
    const rows = await db.select({ id: artifacts.id }).from(artifacts).where(and(eq(artifacts.status, "generating"), sql`${artifacts.params}->>'job' = 'generate'`, sql`(${artifacts.params}->>'leaseUntil' IS NULL OR (${artifacts.params}->>'leaseUntil')::timestamptz < now())`)).orderBy(asc(artifacts.createdAt)).limit(3 - worker.active);
    for (const row of rows) {
      worker.active++;
      void run(row.id).catch(() => undefined).finally(() => { worker.active--; void kickArtifactWorker(); });
    }
  } catch { console.error("[artifact-worker] Cannot read pending generation jobs"); }
  finally { worker.pumping = false; }
}
export function startArtifactWorker() {
  if (!worker.timer) { worker.timer = setInterval(() => void kickArtifactWorker(), 15000); worker.timer.unref?.(); }
  void kickArtifactWorker();
}
