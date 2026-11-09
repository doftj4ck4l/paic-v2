import { and, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, workbooks } from "@/db/schema";
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

/** The workbook has 7 AI module kinds (notes, quizzes, flashcards, slides, mindmaps, audio, study guides). */
const MODULE_KIND_TOTAL = 7;

/**
 * Real progress for DB workbooks: the share of the 7 module kinds that have at
 * least one ready artifact. Readiness of the workbook's AI material, not study
 * activity — computed live from the artifacts table.
 */
async function progressByWorkbook(ids: string[]): Promise<Map<string, number>> {
  if (!ids.length) return new Map();
  const rows = await db
    .select({ workbookId: artifacts.workbookId, kinds: countDistinct(artifacts.kind) })
    .from(artifacts)
    .where(and(inArray(artifacts.workbookId, ids), eq(artifacts.status, "ready")))
    .groupBy(artifacts.workbookId);
  return new Map(rows.map((row) => [row.workbookId, Math.min(100, Math.round((Number(row.kinds) / MODULE_KIND_TOTAL) * 100))]));
}

export function toAppWorkbook(row: DbWorkbookRow, progress = 0): AppWorkbook {
  const days = Math.max(0, Math.floor((Date.now() - row.updatedAt.getTime()) / 86_400_000));
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subjectId as SubjectId,
    topic: row.topic,
    progress,
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
  const progress = await progressByWorkbook(rows.map((row) => row.id));
  return [...rows.map((row) => toAppWorkbook(row, progress.get(row.id) ?? 0)), ...DEMO_APP_WORKBOOKS];
}

/** A single workbook by id — DB first, then the seeded demo set. */
export async function getAppWorkbook(id: string): Promise<AppWorkbook | null> {
  const [row] = await db.select().from(workbooks).where(eq(workbooks.id, id));
  if (row) {
    const progress = await progressByWorkbook([id]);
    return toAppWorkbook(row, progress.get(id) ?? 0);
  }
  const demo = WORKBOOKS.find((w) => w.id === id);
  return demo ? demoToAppWorkbook(demo) : null;
}

/** Workbooks created by a specific user (DB only). */
export async function listOwnedWorkbooks(userId: string): Promise<AppWorkbook[]> {
  const rows = await db.select().from(workbooks).where(eq(workbooks.ownerId, userId)).orderBy(desc(workbooks.updatedAt));
  const progress = await progressByWorkbook(rows.map((row) => row.id));
  return rows.map((row) => toAppWorkbook(row, progress.get(row.id) ?? 0));
}

/** Published DB workbooks (for Jelajah scopes), newest first. */
export async function listPublishedWorkbooks(): Promise<AppWorkbook[]> {
  const rows = await db
    .select()
    .from(workbooks)
    .where(eq(workbooks.visibility, "published"))
    .orderBy(desc(workbooks.publishedAt));
  const progress = await progressByWorkbook(rows.map((row) => row.id));
  return rows.map((row) => toAppWorkbook(row, progress.get(row.id) ?? 0));
}
