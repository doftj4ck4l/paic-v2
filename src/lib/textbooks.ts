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
