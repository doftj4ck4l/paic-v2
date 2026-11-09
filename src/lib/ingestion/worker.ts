import { randomBytes } from "crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { sourceChunks, sources } from "@/db/schema";
import { embedTexts, embeddingModel } from "./embeddings";
import { chunkSourceText, textHash } from "./text";

const state = globalThis as unknown as { __sourceWorker?: { running: boolean; transcribing?: boolean; timer?: ReturnType<typeof setInterval> } };
const worker = state.__sourceWorker ??= { running: false };

async function progress(id: string, token: string, values: Record<string, unknown>) {
  const rows = await db.update(sources).set({ meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify({ ...values, leaseUntil: new Date(Date.now() + 180_000).toISOString() })}::jsonb`, updatedAt: new Date() })
    .where(and(eq(sources.id, id), eq(sources.status, "processing"), sql`${sources.meta}->>'workerToken' = ${token}`)).returning({ id: sources.id });
  if (!rows.length) throw new Error("Source job was cancelled");
}

async function processSource(id: string) {
  const token = randomBytes(12).toString("hex");
  const claimed = await db.update(sources).set({ meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify({ workerToken: token, leaseUntil: new Date(Date.now() + 180_000).toISOString(), stage: "chunking", progress: 5 })}::jsonb`, updatedAt: new Date() })
    .where(and(eq(sources.id, id), eq(sources.status, "processing"), sql`${sources.meta}->>'job' IN ('embed', 'transcribe')`, sql`(${sources.meta}->>'leaseUntil' IS NULL OR (${sources.meta}->>'leaseUntil')::timestamptz < now())`)).returning();
  const source = claimed[0];
  if (!source) return;
  try {
    const meta = source.meta as Record<string, unknown> | null;
    if (meta?.job === "transcribe") {
      await progress(id, token, { stage: "transcribing" });
      const { transcribeWithWhisper, youtubeVideoId } = await import("@/lib/sources");
      const videoId = youtubeVideoId(String(meta.url || ""));
      if (!videoId) throw new Error("Pautan YouTube tidak sah.");
      // Download/transcription can take several minutes; maintain the database lease.
      const heartbeat = setInterval(() => { void progress(id, token, {}).catch(() => undefined); }, 45_000);
      heartbeat.unref?.();
      try {
        const text = await transcribeWithWhisper(`https://www.youtube.com/watch?v=${videoId}`);
        await db.update(sources).set({ status: "draft", fullText: text, error: null, sizeLabel: "Transkripsi audio", updatedAt: new Date(), meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || '{"job":null,"stage":"extracted","review":"pending","leaseUntil":null,"workerToken":null}'::jsonb` }).where(and(eq(sources.id, id), eq(sources.status, "processing"), sql`${sources.meta}->>'workerToken' = ${token}`));
      } finally { clearInterval(heartbeat); }
      return;
    }
    const chunks = chunkSourceText(source.fullText ?? "");
    if (!chunks.length) throw new Error("Tiada teks untuk diindeks. Ekstrak sumber semula dahulu.");
    const model = embeddingModel();
    const existing = await db.select().from(sourceChunks).where(eq(sourceChunks.sourceId, id));
    const valid = new Map(existing.filter((chunk) => chunk.embeddingModel === model && chunk.embedding.length).map((chunk) => [chunk.chunkIndex, chunk]));
    let done = chunks.filter((text, index) => valid.get(index)?.contentHash === textHash(text)).length;
    await progress(id, token, { stage: "embedding", totalChunks: chunks.length, completedChunks: done, embeddingModel: model, progress: 10 + Math.round(done / chunks.length * 85) });
    for (let start = 0; start < chunks.length; start += 8) {
      const batch = chunks.slice(start, start + 8).map((text, offset) => ({ text, index: start + offset })).filter(({ text, index }) => valid.get(index)?.contentHash !== textHash(text));
      if (!batch.length) continue;
      const vectors = await embedTexts(batch.map((chunk) => chunk.text));
      await db.transaction(async (tx) => {
        for (let index = 0; index < batch.length; index++) {
          const chunk = batch[index];
          const values = { id: `${id}:${chunk.index}`, sourceId: id, workbookId: source.workbookId, ownerId: source.ownerId, chunkIndex: chunk.index, content: chunk.text, contentHash: textHash(chunk.text), embedding: vectors[index], embeddingModel: model };
          await tx.insert(sourceChunks).values(values).onConflictDoUpdate({ target: sourceChunks.id, set: values });
        }
      });
      done += batch.length;
      await progress(id, token, { stage: "embedding", completedChunks: done, progress: 10 + Math.round(done / chunks.length * 85) });
    }
    await db.update(sources).set({ status: "ready", error: null, updatedAt: new Date(), meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify({ stage: "ready", progress: 100, review: "accepted", completedChunks: chunks.length, totalChunks: chunks.length, embeddingModel: model, leaseUntil: null, workerToken: null, indexedAt: new Date().toISOString() })}::jsonb` }).where(and(eq(sources.id, id), eq(sources.status, "processing"), sql`${sources.meta}->>'workerToken' = ${token}`));
  } catch (error) {
    await db.update(sources).set({ status: "failed", error: error instanceof Error ? error.message.slice(0, 350) : "Embedding gagal. Sila cuba semula.", updatedAt: new Date(), meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify({ stage: "failed", errorCode: (source.meta as Record<string, unknown> | null)?.job === "transcribe" ? "transcription_failed" : "embedding_failed", leaseUntil: null, workerToken: null })}::jsonb` }).where(and(eq(sources.id, id), sql`${sources.meta}->>'workerToken' = ${token}`));
  }
}

export async function kickSourceWorker() {
  if (worker.running) return;
  worker.running = true;
  try {
    const jobs = await db.select({ id: sources.id }).from(sources).where(and(eq(sources.status, "processing"), sql`${sources.meta}->>'job' = 'embed'`)).orderBy(asc(sources.createdAt)).limit(30);
    for (const job of jobs) await processSource(job.id);
  } catch (error) { console.error("[source-worker]", error instanceof Error ? error.message : "Job worker unavailable"); }
  finally { worker.running = false; }
}

async function kickTranscriptionWorker() {
  if (worker.transcribing) return;
  worker.transcribing = true;
  try {
    const jobs = await db.select({ id: sources.id }).from(sources).where(and(eq(sources.status, "processing"), sql`${sources.meta}->>'job' = 'transcribe'`)).orderBy(asc(sources.createdAt)).limit(5);
    for (const job of jobs) await processSource(job.id);
  } catch (error) { console.error("[transcription-worker]", error instanceof Error ? error.message : "Transcription worker unavailable"); }
  finally { worker.transcribing = false; }
}

export function startSourceWorker() {
  if (!worker.timer) {
    worker.timer = setInterval(() => { void kickSourceWorker(); void kickTranscriptionWorker(); }, 20_000);
    worker.timer.unref?.();
  }
  void kickSourceWorker();
  void kickTranscriptionWorker();
}

export async function enqueueSourceEmbedding(ids: string[], workbookId: string, ownerId: string) {
  const rows = await db.select().from(sources).where(and(inArray(sources.id, ids), eq(sources.workbookId, workbookId), eq(sources.ownerId, ownerId)));
  if (rows.length !== ids.length) throw new Error("Sebahagian sumber tidak dijumpai atau tidak boleh diakses.");
  if (rows.some((row) => !["draft", "failed", "ready", "processing"].includes(row.status) || !(row.fullText ?? "").trim())) throw new Error("Tunggu sehingga semua sumber dipilih selesai diekstrak.");
  await db.transaction(async (tx) => {
    for (const row of rows) {
      if (row.status === "ready" || row.status === "processing") continue;
      await tx.update(sources).set({ status: "processing", error: null, updatedAt: new Date(), meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || '{"job":"embed","stage":"queued","progress":0,"review":"accepted","leaseUntil":null,"workerToken":null}'::jsonb` }).where(and(eq(sources.id, row.id), eq(sources.status, row.status), eq(sources.ownerId, ownerId)));
    }
  });
  startSourceWorker();
  return rows.map((row) => row.id);
}
