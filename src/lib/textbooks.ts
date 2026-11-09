import { Pool } from "pg";

/**
 * Read-only access to the textbook knowledge base (books + chunks) used by
 * the "Buku teks" source option — mirrors paic2's textbooks router.
 */

let pool: Pool | null = null;

function getPool(): Pool | null {
  const dsn = (process.env.TEXTBOOK_DB_URL ?? "").trim();
  if (!dsn) return null;
  if (!pool) {
    pool = new Pool({ connectionString: dsn, max: 3, connectionTimeoutMillis: 8000 });
  }
  return pool;
}

export type TextbookBook = {
  id: number;
  title: string;
  subject: string | null;
  level: string | null;
  language: string | null;
  pageCount: number | null;
};

export function textbooksConfigured(): boolean {
  return Boolean((process.env.TEXTBOOK_DB_URL ?? "").trim());
}

export async function listTextbooks(query?: string): Promise<TextbookBook[]> {
  const db = getPool();
  if (!db) return [];
  const params: string[] = [];
  let where = "";
  if (query && query.trim()) {
    params.push(`%${query.trim()}%`);
    where = `WHERE title ILIKE $1 OR subject ILIKE $1`;
  }
  const result = await db.query(
    `SELECT id, title, subject, level, language, page_count FROM books ${where} ORDER BY subject NULLS LAST, level NULLS LAST, title LIMIT 100`,
    params,
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject,
    level: row.level,
    language: row.language,
    pageCount: row.page_count,
  }));
}

/** Compile a book's chunks into one text body with headings (paic2-style). */
export async function compileTextbookContent(bookId: number): Promise<{ title: string; text: string }> {
  const db = getPool();
  if (!db) throw new Error("Buku teks belum dikonfigurasi pada pelayan ini.");
  const book = await db.query("SELECT id, title FROM books WHERE id = $1", [bookId]);
  if (book.rows.length === 0) throw new Error("Buku teks tidak dijumpai.");
  const rows = await db.query(
    `SELECT chapter, page_start, page_end, content FROM chunks WHERE book_id = $1 ORDER BY COALESCE(page_start, 0), chunk_index`,
    [bookId],
  );
  if (rows.rows.length === 0) throw new Error("Buku ini belum diindeks.");
  const parts: string[] = [];
  for (const row of rows.rows) {
    const loc: string[] = [];
    if (row.chapter) loc.push(`Bab ${row.chapter}`);
    if (row.page_start) loc.push(row.page_end ? `hlm. ${row.page_start}-${row.page_end}` : `hlm. ${row.page_start}`);
    const header = [book.rows[0].title, ...loc].join(" — ");
    parts.push(`## ${header}\n\n${String(row.content ?? "").trim()}`);
  }
  return { title: book.rows[0].title, text: parts.join("\n\n---\n\n").slice(0, 1_200_000) };
}

export type TextbookChunkHit = {
  bookId: number;
  content: string;
  chapter: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  score: number;
};

/**
 * Hybrid search over the textbook KB's pre-computed chunks — full-text (tsv)
 * always, semantic (pgvector) when a query vector is provided. The KB's
 * embeddings match our embedding model (4096-d), so no re-embedding is needed.
 */
export async function searchTextbookChunks(bookIds: number[], query: string, vector: number[] | null, limit = 8): Promise<TextbookChunkHit[]> {
  const db = getPool();
  if (!db || !bookIds.length || !query.trim()) return [];
  const hits = new Map<string, TextbookChunkHit & { textScore: number; vectorScore: number }>();
  try {
    const textRows = await db.query(
      `SELECT c.id, c.book_id, c.chapter, c.page_start, c.page_end, c.content, ts_rank(c.tsv, plainto_tsquery('simple', $1)) AS text_score
       FROM chunks c WHERE c.book_id = ANY($2::bigint[]) AND c.tsv @@ plainto_tsquery('simple', $1)
       ORDER BY text_score DESC LIMIT $3`,
      [query, bookIds, limit],
    );
    for (const row of textRows.rows) {
      hits.set(String(row.id), { bookId: Number(row.book_id), content: String(row.content ?? ""), chapter: row.chapter ?? null, pageStart: row.page_start ?? null, pageEnd: row.page_end ?? null, score: Math.min(1, Number(row.text_score) * 10), textScore: Number(row.text_score), vectorScore: 0 });
    }
  } catch { /* full-text unavailable — semantic results may still land below */ }
  if (vector?.length) {
    try {
      const literal = "[" + vector.map((x) => `${x.toFixed(5)}`).join(",") + "]";
      const vectorRows = await db.query(
        `SELECT c.id, c.book_id, c.chapter, c.page_start, c.page_end, c.content, 1 - (c.embedding <=> $1::vector) AS vector_score
         FROM chunks c WHERE c.book_id = ANY($2::bigint[]) AND c.embedding IS NOT NULL
         ORDER BY c.embedding <=> $1::vector LIMIT $3`,
        [literal, bookIds, limit],
      );
      for (const row of vectorRows.rows) {
        const score = Math.max(0, Number(row.vector_score));
        const key = String(row.id);
        const existing = hits.get(key);
        if (existing) { existing.vectorScore = score; existing.score = Math.max(existing.score, score); }
        else hits.set(key, { bookId: Number(row.book_id), content: String(row.content ?? ""), chapter: row.chapter ?? null, pageStart: row.page_start ?? null, pageEnd: row.page_end ?? null, score, textScore: 0, vectorScore: score });
      }
    } catch { /* semantic search unavailable — text results remain */ }
  }
  return [...hits.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
