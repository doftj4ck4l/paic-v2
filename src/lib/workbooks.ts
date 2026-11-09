import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workbooks } from "@/db/schema";
import { WORKBOOKS, type DemoWorkbook, type SubjectId } from "@/lib/demo-data";

/**
 * App view model for a workbook — the demo shape plus ownership fields.
 * Seeded demo workbooks (in code) and user-created DB workbooks are merged
 * everywhere through these helpers.
 */
export type AppWorkbook = DemoWorkbook & {
  ownerId: string | null;
  ownerRole: "student" | "teacher" | null;
  visibility: "private" | "published";
  publishedAt: Date | null;
  createdAt: Date | null;
  isDb: boolean;
};

export type DbWorkbookRow = typeof workbooks.$inferSelect;

export function toAppWorkbook(row: DbWorkbookRow): AppWorkbook {
  const days = Math.max(0, Math.floor((Date.now() - row.updatedAt.getTime()) / 86_400_000));
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subjectId as SubjectId,
    topic: row.topic,
    progress: 0,
    teacherName: row.ownerName || "Anda",
    yearLabel: row.yearLabel,
    updatedDaysAgo: days,
    ownerId: row.ownerId,
    ownerRole: row.ownerRole === "teacher" ? "teacher" : "student",
    visibility: row.visibility === "published" ? "published" : "private",
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    isDb: true,
  };
}

export function demoToAppWorkbook(workbook: DemoWorkbook): AppWorkbook {
  return {
    ...workbook,
    ownerId: null,
    ownerRole: "teacher",
    visibility: "published",
    publishedAt: null,
    createdAt: null,
    isDb: false,
  };
}

const DEMO_APP_WORKBOOKS = WORKBOOKS.map(demoToAppWorkbook);

/** All workbooks for the library: the user's own DB workbooks + demo ones. */
export async function listWorkbooksForUser(userId: string): Promise<AppWorkbook[]> {
  const rows = await db.select().from(workbooks).where(eq(workbooks.ownerId, userId)).orderBy(desc(workbooks.updatedAt));
  return [...rows.map(toAppWorkbook), ...DEMO_APP_WORKBOOKS];
}

/** A single workbook by id — DB first, then the seeded demo set. */
export async function getAppWorkbook(id: string): Promise<AppWorkbook | null> {
  const [row] = await db.select().from(workbooks).where(eq(workbooks.id, id));
  if (row) return toAppWorkbook(row);
  const demo = WORKBOOKS.find((w) => w.id === id);
  return demo ? demoToAppWorkbook(demo) : null;
}

/** Workbooks created by a specific user (DB only). */
export async function listOwnedWorkbooks(userId: string): Promise<AppWorkbook[]> {
  const rows = await db.select().from(workbooks).where(eq(workbooks.ownerId, userId)).orderBy(desc(workbooks.updatedAt));
  return rows.map(toAppWorkbook);
}

/** Published DB workbooks (for Jelajah scopes), newest first. */
export async function listPublishedWorkbooks(): Promise<AppWorkbook[]> {
  const rows = await db
    .select()
    .from(workbooks)
    .where(eq(workbooks.visibility, "published"))
    .orderBy(desc(workbooks.publishedAt));
  return rows.map(toAppWorkbook);
}
