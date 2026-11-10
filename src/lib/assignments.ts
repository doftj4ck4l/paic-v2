import { randomBytes } from "crypto";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { assignmentCompletions, assignments, classMembers, classes, workbookClassShares, workbooks } from "@/db/schema";
import type { SessionUser } from "@/lib/auth-session";
import { createNotification, createNotificationsForUsers } from "@/lib/notifications";
import { SHARED_WORKBOOKS, WORKBOOKS } from "@/lib/demo-data";
import { isClassTeacher } from "@/lib/classes";
import { sanitizeModuleKinds } from "@/lib/module-kinds";
import { listSources } from "@/lib/sources";
import { getAppWorkbook } from "@/lib/workbooks";
import { awardXp, XP_PER_ASSIGNMENT } from "@/lib/xp";

export type AssignmentView = {
  id: string;
  classId: string;
  className: string;
  workbookId: string;
  workbookTitle: string;
  workbookSubjectId: string | null;
  title: string;
  instructions: string;
  /** Mapped module kinds; null means every module. */
  moduleKinds: string[] | null;
  dueAt: string | null;
  createdAt: string;
  completed: boolean;
  completedCount: number;
  memberCount: number;
};

export type ClassMaterial = {
  workbookId: string;
  title: string;
  subjectId: string | null;
  sharedAt: string;
};

export type OwnedWorkbookOption = { id: string; title: string; subjectId: string | null };

/** Workbook titles — DB workbooks first, demo corpus as fallback. */
export async function workbookTitles(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const [id, meta] of await workbookMeta(ids)) map.set(id, meta.title);
  return map;
}

export type WorkbookMeta = { title: string; subjectId: string | null };

/** Workbook titles + subjects — DB workbooks first, demo corpus as fallback. */
export async function workbookMeta(ids: string[]): Promise<Map<string, WorkbookMeta>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, WorkbookMeta>();
  if (!unique.length) return map;
  const rows = await db
    .select({ id: workbooks.id, title: workbooks.title, subjectId: workbooks.subjectId })
    .from(workbooks)
    .where(inArray(workbooks.id, unique));
  for (const row of rows) map.set(row.id, { title: row.title, subjectId: row.subjectId });
  for (const id of unique) {
    if (map.has(id)) continue;
    const demo = WORKBOOKS.find((w) => w.id === id) ?? SHARED_WORKBOOKS.find((w) => w.id === id);
    if (demo) map.set(id, { title: demo.title, subjectId: demo.subjectId });
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
  moduleKinds: string[] | null;
  dueAt: Date | null;
  createdAt: Date;
};

async function enrich(rows: AssignmentRow[], viewerId: string): Promise<AssignmentView[]> {
  const ids = rows.map((row) => row.id);
  const classIds = [...new Set(rows.map((row) => row.classId))];
  const [meta, completions, memberCounts] = await Promise.all([
    workbookMeta(rows.map((row) => row.workbookId)),
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
      workbookTitle: meta.get(row.workbookId)?.title ?? "Buku kerja",
      workbookSubjectId: meta.get(row.workbookId)?.subjectId ?? null,
      title: row.title,
      instructions: row.instructions,
      moduleKinds: row.moduleKinds,
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
  moduleKinds: assignments.moduleKinds,
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
  input: { workbookId: string; title: string; instructions: string; moduleKinds: string[]; dueAt: string | null },
) {
  if (!(await isClassTeacher(user, classId))) return { error: "Subjek tidak ditemui." as const };

  const [workbook] = await db
    .select({ id: workbooks.id, title: workbooks.title })
    .from(workbooks)
    .where(and(eq(workbooks.id, input.workbookId), eq(workbooks.ownerId, user.id)));
  if (!workbook) return { error: "Buku kerja tidak ditemui dalam pustaka anda." as const };

  const moduleKinds = sanitizeModuleKinds(input.moduleKinds);
  if (moduleKinds.length === 0) return { error: "Pilih sekurang-kurangnya satu modul." as const };

  const id = `asg_${randomBytes(8).toString("hex")}`;
  const dueAt = input.dueAt ? new Date(`${input.dueAt}T23:59:59`) : null;
  await db.insert(assignments).values({
    id,
    classId,
    workbookId: input.workbookId,
    createdBy: user.id,
    title: input.title,
    instructions: input.instructions,
    moduleKinds,
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
      title: `Buku kerja ditugaskan: ${input.title}`,
      body: `${classRow?.name ?? "Subjek"} · ${moduleKinds.length} modul`,
      href: `/subjects/${classId}?tab=assignments`,
    },
  );
  return { id };
}

/** Workbook ids the class can access — assigned or shared. */
export async function classWorkbookIds(classId: string): Promise<string[]> {
  const [assigned, shared] = await Promise.all([
    db.select({ workbookId: assignments.workbookId }).from(assignments).where(eq(assignments.classId, classId)),
    db.select({ workbookId: workbookClassShares.workbookId }).from(workbookClassShares).where(eq(workbookClassShares.classId, classId)),
  ]);
  return [...new Set([...assigned, ...shared].map((row) => row.workbookId))];
}

export type ClassSourceGroup = {
  workbookId: string;
  workbookTitle: string;
  sources: { id: string; title: string; kind: string; status: string; sizeLabel: string | null; excerpt: string; videoId: string | null }[];
};

/** Ready sources of every workbook the class can access, grouped by workbook. */
export async function listClassSources(classId: string): Promise<ClassSourceGroup[]> {
  const workbookIds = await classWorkbookIds(classId);
  if (!workbookIds.length) return [];

  const groups = await Promise.all(
    workbookIds.map(async (workbookId) => {
      const workbook = await getAppWorkbook(workbookId);
      if (!workbook) return null;
      const rows = (await listSources(workbookId, workbook.isDb ? workbook.ownerId ?? undefined : undefined)).filter(
        (row) => row.status === "ready",
      );
      return {
        workbookId,
        workbookTitle: workbook.title,
        sources: rows.map((row) => ({
          id: row.id,
          title: row.title,
          kind: row.kind,
          status: row.status,
          sizeLabel: row.sizeLabel,
          excerpt: (row.fullText ?? "").slice(0, 160),
          videoId: ((row.meta as Record<string, unknown> | null)?.videoId as string | undefined) ?? null,
        })),
      } satisfies ClassSourceGroup;
    }),
  );
  return groups.filter((group): group is ClassSourceGroup => Boolean(group));
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
        href: `/subjects/${row.classId}?tab=progress`,
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
    .select({ workbookId: workbookClassShares.workbookId, sharedAt: workbookClassShares.sharedAt, title: workbooks.title, subjectId: workbooks.subjectId })
    .from(workbookClassShares)
    .innerJoin(workbooks, eq(workbooks.id, workbookClassShares.workbookId))
    .where(eq(workbookClassShares.classId, classId))
    .orderBy(desc(workbookClassShares.sharedAt));
  return rows.map((row) => ({ workbookId: row.workbookId, title: row.title, subjectId: row.subjectId, sharedAt: row.sharedAt.toISOString() }));
}

export async function shareWorkbookWithClass(user: SessionUser, classId: string, workbookId: string, shared: boolean) {
  if (!(await isClassTeacher(user, classId))) return { error: "Subjek tidak ditemui." as const };

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
