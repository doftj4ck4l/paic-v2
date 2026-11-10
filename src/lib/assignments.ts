import { randomBytes } from "crypto";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { assignmentCompletions, assignments, classMembers, classes, workbookClassShares, workbooks } from "@/db/schema";
import type { SessionUser } from "@/lib/auth-session";
import { createNotification, createNotificationsForUsers } from "@/lib/notifications";
import { SHARED_WORKBOOKS, WORKBOOKS } from "@/lib/demo-data";
import { isClassTeacher } from "@/lib/classes";
import { awardXp, XP_PER_ASSIGNMENT } from "@/lib/xp";

export type AssignmentView = {
  id: string;
  classId: string;
  className: string;
  workbookId: string;
  workbookTitle: string;
  title: string;
  instructions: string;
  dueAt: string | null;
  createdAt: string;
  completed: boolean;
  completedCount: number;
  memberCount: number;
};

export type ClassMaterial = {
  workbookId: string;
  title: string;
  sharedAt: string;
};

export type OwnedWorkbookOption = { id: string; title: string };

/** Workbook titles — DB workbooks first, demo corpus as fallback. */
export async function workbookTitles(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const rows = await db.select({ id: workbooks.id, title: workbooks.title }).from(workbooks).where(inArray(workbooks.id, unique));
  for (const row of rows) map.set(row.id, row.title);
  for (const id of unique) {
    if (map.has(id)) continue;
    const demo = WORKBOOKS.find((w) => w.id === id) ?? SHARED_WORKBOOKS.find((w) => w.id === id);
    if (demo) map.set(id, demo.title);
  }
  return map;
}

type AssignmentRow = {
  id: string;
  classId: string;
  className: string;
  workbookId: string;
  title: string;
  instructions: string;
  dueAt: Date | null;
  createdAt: Date;
};

async function enrich(rows: AssignmentRow[], viewerId: string): Promise<AssignmentView[]> {
  const ids = rows.map((row) => row.id);
  const classIds = [...new Set(rows.map((row) => row.classId))];
  const [titles, completions, memberCounts] = await Promise.all([
    workbookTitles(rows.map((row) => row.workbookId)),
    ids.length
      ? db
          .select({ assignmentId: assignmentCompletions.assignmentId, studentId: assignmentCompletions.studentId })
          .from(assignmentCompletions)
          .where(inArray(assignmentCompletions.assignmentId, ids))
      : Promise.resolve([]),
    classIds.length
      ? db
          .select({ classId: classMembers.classId, memberCount: count(classMembers.studentId) })
          .from(classMembers)
          .where(inArray(classMembers.classId, classIds))
          .groupBy(classMembers.classId)
      : Promise.resolve([]),
  ]);
  const memberByClass = new Map(memberCounts.map((row) => [row.classId, Number(row.memberCount)]));

  return rows.map((row) => {
    const forThis = completions.filter((completion) => completion.assignmentId === row.id);
    return {
      id: row.id,
      classId: row.classId,
      className: row.className,
      workbookId: row.workbookId,
      workbookTitle: titles.get(row.workbookId) ?? "Buku kerja",
      title: row.title,
      instructions: row.instructions,
      dueAt: row.dueAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      completed: forThis.some((completion) => completion.studentId === viewerId),
      completedCount: forThis.length,
      memberCount: memberByClass.get(row.classId) ?? 0,
    };
  });
}

const assignmentColumns = {
  id: assignments.id,
  classId: assignments.classId,
  className: classes.name,
  workbookId: assignments.workbookId,
  title: assignments.title,
  instructions: assignments.instructions,
  dueAt: assignments.dueAt,
  createdAt: assignments.createdAt,
};

/** All assignments of one class, viewer-aware (own completion vs completion counts). */
export async function listAssignmentsForClass(user: SessionUser, classId: string): Promise<AssignmentView[]> {
  const rows = await db
    .select(assignmentColumns)
    .from(assignments)
    .innerJoin(classes, eq(classes.id, assignments.classId))
    .where(eq(assignments.classId, classId))
    .orderBy(sql`${assignments.dueAt} asc nulls last`, desc(assignments.createdAt));
  return enrich(rows, user.id);
}

/** Home feed: assignments across the student's classes, or given by the teacher. */
export async function listAssignmentsForUser(user: SessionUser): Promise<AssignmentView[]> {
  if (user.role === "teacher") {
    const rows = await db
      .select(assignmentColumns)
      .from(assignments)
      .innerJoin(classes, eq(classes.id, assignments.classId))
      .where(eq(assignments.createdBy, user.id))
      .orderBy(desc(assignments.createdAt));
    return enrich(rows, user.id);
  }

  const rows = await db
    .select(assignmentColumns)
    .from(assignments)
    .innerJoin(classes, eq(classes.id, assignments.classId))
    .innerJoin(classMembers, and(eq(classMembers.classId, assignments.classId), eq(classMembers.studentId, user.id)))
    .orderBy(sql`${assignments.dueAt} asc nulls last`, desc(assignments.createdAt));
  return enrich(rows, user.id);
}

export async function createAssignment(
  user: SessionUser,
  classId: string,
  input: { workbookId: string; title: string; instructions: string; dueAt: string | null },
) {
  if (!(await isClassTeacher(user, classId))) return { error: "Kelas tidak ditemui." as const };

  const [workbook] = await db
    .select({ id: workbooks.id, title: workbooks.title })
    .from(workbooks)
    .where(and(eq(workbooks.id, input.workbookId), eq(workbooks.ownerId, user.id)));
  if (!workbook) return { error: "Buku kerja tidak ditemui dalam pustaka anda." as const };

  const id = `asg_${randomBytes(8).toString("hex")}`;
  const dueAt = input.dueAt ? new Date(`${input.dueAt}T23:59:59`) : null;
  await db.insert(assignments).values({
    id,
    classId,
    workbookId: input.workbookId,
    createdBy: user.id,
    title: input.title,
    instructions: input.instructions,
    dueAt,
  });

  const [classRow] = await db.select({ name: classes.name }).from(classes).where(eq(classes.id, classId));
  const memberRows = await db
    .select({ studentId: classMembers.studentId })
    .from(classMembers)
    .where(eq(classMembers.classId, classId));
  await createNotificationsForUsers(
    memberRows.map((row) => row.studentId),
    {
      type: "assignment",
      title: `Tugasan baharu: ${input.title}`,
      body: `${classRow?.name ?? "Kelas"} · ${workbook.title}`,
      href: `/classes/${classId}?tab=assignments`,
    },
  );
  return { id };
}

export async function deleteAssignment(user: SessionUser, assignmentId: string) {
  const [row] = await db
    .select({ id: assignments.id, classId: assignments.classId })
    .from(assignments)
    .where(eq(assignments.id, assignmentId));
  if (!row) return { error: "Tugasan tidak ditemui." as const };
  if (!(await isClassTeacher(user, row.classId))) return { error: "Tugasan tidak ditemui." as const };

  await db.delete(assignments).where(eq(assignments.id, assignmentId));
  return { ok: true as const };
}

export async function setAssignmentCompletion(user: SessionUser, assignmentId: string, completed: boolean) {
  const [row] = await db
    .select({
      id: assignments.id,
      classId: assignments.classId,
      title: assignments.title,
      teacherId: classes.teacherId,
      className: classes.name,
    })
    .from(assignments)
    .innerJoin(classes, eq(classes.id, assignments.classId))
    .where(eq(assignments.id, assignmentId));
  if (!row) return { error: "Tugasan tidak ditemui." as const };

  const [membership] = await db
    .select({ classId: classMembers.classId })
    .from(classMembers)
    .where(and(eq(classMembers.classId, row.classId), eq(classMembers.studentId, user.id)));
  if (!membership) return { error: "Tugasan tidak ditemui." as const };

  if (completed) {
    const inserted = await db
      .insert(assignmentCompletions)
      .values({ assignmentId, studentId: user.id })
      .onConflictDoNothing()
      .returning({ studentId: assignmentCompletions.studentId });
    if (inserted.length) {
      await awardXp(user.id, XP_PER_ASSIGNMENT);
      await createNotification(row.teacherId, {
        type: "completion",
        title: `${user.preferredName} menyelesaikan “${row.title}”`,
        body: row.className,
        href: `/classes/${row.classId}?tab=progress`,
      });
    }
  } else {
    const deleted = await db
      .delete(assignmentCompletions)
      .where(and(eq(assignmentCompletions.assignmentId, assignmentId), eq(assignmentCompletions.studentId, user.id)))
      .returning({ studentId: assignmentCompletions.studentId });
    if (deleted.length) await awardXp(user.id, -XP_PER_ASSIGNMENT);
  }
  return { ok: true as const, completed };
}

/** Workbooks shared to a class as materials (Bahan tab). */
export async function listClassMaterials(classId: string): Promise<ClassMaterial[]> {
  const rows = await db
    .select({ workbookId: workbookClassShares.workbookId, sharedAt: workbookClassShares.sharedAt, title: workbooks.title })
    .from(workbookClassShares)
    .innerJoin(workbooks, eq(workbooks.id, workbookClassShares.workbookId))
    .where(eq(workbookClassShares.classId, classId))
    .orderBy(desc(workbookClassShares.sharedAt));
  return rows.map((row) => ({ workbookId: row.workbookId, title: row.title, sharedAt: row.sharedAt.toISOString() }));
}

export async function shareWorkbookWithClass(user: SessionUser, classId: string, workbookId: string, shared: boolean) {
  if (!(await isClassTeacher(user, classId))) return { error: "Kelas tidak ditemui." as const };

  const [workbook] = await db
    .select({ id: workbooks.id })
    .from(workbooks)
    .where(and(eq(workbooks.id, workbookId), eq(workbooks.ownerId, user.id)));
  if (!workbook) return { error: "Buku kerja tidak ditemui dalam pustaka anda." as const };

  if (shared) {
    await db.insert(workbookClassShares).values({ workbookId, classId }).onConflictDoNothing();
  } else {
    await db
      .delete(workbookClassShares)
      .where(and(eq(workbookClassShares.classId, classId), eq(workbookClassShares.workbookId, workbookId)));
  }
  return { ok: true as const, shared };
}
