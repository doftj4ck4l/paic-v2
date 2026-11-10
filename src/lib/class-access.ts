import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { assignments, classMembers, workbookClassShares } from "@/db/schema";
import type { AppWorkbook } from "@/lib/workbooks";

/** Class ids the user is enrolled in as a student. */
export async function studentClassIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ classId: classMembers.classId })
    .from(classMembers)
    .where(eq(classMembers.studentId, userId));
  return rows.map((row) => row.classId);
}

/**
 * True when the user can read the workbook because a class they belong to
 * has it assigned (tugasan) or shared as a class material (bahan).
 */
export async function hasClassAccess(userId: string, workbookId: string): Promise<boolean> {
  const classIds = await studentClassIds(userId);
  if (!classIds.length) return false;

  const [assigned] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(and(eq(assignments.workbookId, workbookId), inArray(assignments.classId, classIds)))
    .limit(1);
  if (assigned) return true;

  const [shared] = await db
    .select({ workbookId: workbookClassShares.workbookId })
    .from(workbookClassShares)
    .where(and(eq(workbookClassShares.workbookId, workbookId), inArray(workbookClassShares.classId, classIds)))
    .limit(1);
  return Boolean(shared);
}

/** Shared read gate: owner, demo workbook, published workbook, or class access. */
export async function canViewWorkbook(workbook: AppWorkbook, userId: string | null): Promise<boolean> {
  if (!workbook.isDb || workbook.visibility === "published") return true;
  if (!userId) return false;
  if (workbook.ownerId === userId) return true;
  return hasClassAccess(userId, workbook.id);
}
