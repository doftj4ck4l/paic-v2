import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { sourceChunks, sources } from "@/db/schema";
import { chunkSourceText, textHash } from "@/lib/ingestion/text";
import { embedTexts, embeddingModel } from "@/lib/ingestion/embeddings";

/**
 * Re-embeds existing ready sources' chunks with the currently configured
 * embedding model (e.g. after switching to qwen3-vl-embedding-8b). Textbook
 * sources are skipped — they are searched live against the textbook KB.
 *
 * Usage: npx tsx --env-file-if-exists=.env src/db/backfill-embeddings.ts
 */

const BATCH = 16;

async function main() {
  const model = embeddingModel();
  const rows = await db.select().from(sources).where(eq(sources.status, "ready"));
  // Textbook sources are searched live against the KB — drop any legacy local chunks.
  for (const source of rows.filter((row) => row.kind === "textbook")) {
    const removed = await db.delete(sourceChunks).where(eq(sourceChunks.sourceId, source.id)).returning({ id: sourceChunks.id });
    if (removed.length) console.log(`removed ${removed.length} legacy chunk(s) from textbook source ${source.id}`);
  }
  const targets = rows.filter((row) => row.kind !== "textbook" && row.fullText?.trim());
  console.log(`${targets.length} ready source(s) to check; target model: ${model}`);
  let updated = 0;
  for (const source of targets) {
    const chunks = chunkSourceText(source.fullText!);
    if (!chunks.length) continue;
    const existing = await db.select().from(sourceChunks).where(eq(sourceChunks.sourceId, source.id));
    const current = existing.filter((chunk) => chunk.embeddingModel === model && chunk.embedding.length);
    if (current.length >= chunks.length) {
      console.log(`skip ${source.id} — already indexed with ${model}`);
      continue;
    }
    console.log(`re-embedding ${source.id} — ${source.title} (${chunks.length} chunks, had ${current.length} current)`);
    for (let start = 0; start < chunks.length; start += BATCH) {
      const batch = chunks.slice(start, start + BATCH).map((text, offset) => ({ text, index: start + offset }));
      const vectors = await embedTexts(batch.map((row) => row.text));
      for (let i = 0; i < batch.length; i++) {
        const values = {
          id: `${source.id}:${batch[i].index}`,
          sourceId: source.id,
          workbookId: source.workbookId,
          ownerId: source.ownerId,
          chunkIndex: batch[i].index,
          content: batch[i].text,
          contentHash: textHash(batch[i].text),
          embedding: vectors[i],
          embeddingModel: model,
        };
        await db.insert(sourceChunks).values(values).onConflictDoUpdate({ target: sourceChunks.id, set: values });
      }
      console.log(`  ${Math.min(start + BATCH, chunks.length)}/${chunks.length}`);
    }
    await db.delete(sourceChunks).where(and(eq(sourceChunks.sourceId, source.id), ne(sourceChunks.embeddingModel, model)));
    await db
      .update(sources)
      .set({ updatedAt: new Date(), meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify({ embeddingModel: model, indexedAt: new Date().toISOString() })}::jsonb` })
      .where(eq(sources.id, source.id));
    updated++;
  }
  console.log(`done — ${updated} source(s) re-embedded with ${model}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("backfill failed", error);
  process.exit(1);
});
