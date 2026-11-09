import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { sourceChunks, sources } from "@/db/schema";
import { embedTexts, embeddingModel } from "./embeddings";

export function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || a.length !== b.length) return -1;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  return normA && normB ? dot / Math.sqrt(normA * normB) : -1;
}

/** Portable exact cosine retrieval for workbook-sized libraries; returns citation metadata. */
export async function retrieveSourceChunks(workbookId: string, ownerId: string, query: string, selectedIds: string[], limit = 6) {
  if (!query.trim() || !selectedIds.length) return [];
  const rows = await db.select({ chunk: sourceChunks, title: sources.title, meta: sources.meta }).from(sourceChunks)
    .innerJoin(sources, eq(sources.id, sourceChunks.sourceId))
    .where(and(eq(sourceChunks.workbookId, workbookId), eq(sourceChunks.ownerId, ownerId), eq(sources.ownerId, ownerId), eq(sources.status, "ready"), eq(sourceChunks.embeddingModel, embeddingModel()), inArray(sourceChunks.sourceId, selectedIds)));
  if (!rows.length) return [];
  const [vector] = await embedTexts([query]);
  return rows.map(({ chunk, title, meta }) => ({ sourceId: chunk.sourceId, title, url: (meta as { url?: string } | null)?.url, chunkIndex: chunk.chunkIndex, text: chunk.content, score: cosineSimilarity(vector, chunk.embedding) }))
    .filter(row => row.score > -1).sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(limit, 20)));
}
