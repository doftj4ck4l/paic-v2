import { randomInt } from "crypto";
import { and, asc, count, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { assignments, classMembers, classes, users, workbookClassShares } from "@/db/schema";
import type { SessionUser } from "@/lib/auth-session";
import { createNotification } from "@/lib/notifications";

/** Unambiguous join-code alphabet (no O/0/I/1/L). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function sanitizeJoinCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function generateJoinCode() {
  let code = "";
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export async function uniqueJoinCodeFor(excludeClassId?: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateJoinCode();
    const where = excludeClassId
      ? and(eq(classes.joinCode, code), ne(classes.id, excludeClassId))
      : eq(classes.joinCode, code);
    const [existing] = await db.select({ id: classes.id }).from(classes).where(where);
    if (!existing) return code;
  }
  throw new Error("Could not allocate a join code");
}

export type ClassSummary = {
  id: string;
  name: string;
  subjectId: string | null;
  formLevel: string;
  teacherName: string;
  memberCount: number;
  workbookCount: number;
  joinCode: string | null;
  createdAt: string;
  joinedAt: string | null;
};

export type ClassMemberView = {
  id: string;
  name: string;
  className: string;
  yearLabel: string;
  xp: number;
  joinedAt: string;
};

export type ClassDetail = {
  id: string;
  name: string;
  subjectId: string | null;
  formLevel: string;
  teacherId: string;
  teacherName: string;
  memberCount: number;
  joinCode: string | null;
  createdAt: string;
  joinedAt: string | null;
  members: ClassMemberView[];
};

function displayNameOf(row: { name: string; displayName: string | null }) {
  return row.displayName?.trim() || row.name.split(" ")[0];
}

export async function createClass(user: SessionUser, input: { name: string; formLevel: string; subjectId: string }) {
  const id = `cls_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const joinCode = await uniqueJoinCodeFor();
  await db.insert(classes).values({
    id,
    schoolId: user.schoolId,
    teacherId: user.id,
    subjectId: input.subjectId,
    name: input.name,
    formLevel: input.formLevel,
    joinCode,
  });
  return { id, joinCode };
}

/** Distinct workbooks (assigned or shared) per class. */
async function workbookCountByClass(classIds: string[]): Promise<Map<string, number>> {
  if (!classIds.length) return new Map();
  const [assigned, shared] = await Promise.all([
    db
      .select({ classId: assignments.classId, workbookId: assignments.workbookId })
      .from(assignments)
      .where(inArray(assignments.classId, classIds)),
    db
      .select({ classId: workbookClassShares.classId, workbookId: workbookClassShares.workbookId })
      .from(workbookClassShares)
      .where(inArray(workbookClassShares.classId, classIds)),
  ]);
  const sets = new Map<string, Set<string>>();
  for (const row of [...assigned, ...shared]) {
    const set = sets.get(row.classId) ?? new Set<string>();
    set.add(row.workbookId);
    sets.set(row.classId, set);
  }
  return new Map([...sets.entries()].map(([classId, set]) => [classId, set.size]));
}

export async function listClassesForUser(user: SessionUser): Promise<ClassSummary[]> {
  if (user.role === "teacher") {
    const rows = await db
      .select({
        id: classes.id,
        name: classes.name,
        subjectId: classes.subjectId,
        formLevel: classes.formLevel,
        joinCode: classes.joinCode,
        createdAt: classes.createdAt,
        memberCount: count(classMembers.studentId),
      })
      .from(classes)
      .leftJoin(classMembers, eq(classMembers.classId, classes.id))
      .where(and(eq(classes.teacherId, user.id), isNull(classes.archivedAt)))
      .groupBy(classes.id)
      .orderBy(desc(classes.createdAt));
    const workbookCounts = await workbookCountByClass(rows.map((row) => row.id));
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      subjectId: row.subjectId,
      formLevel: row.formLevel,
      teacherName: user.preferredName,
      memberCount: Number(row.memberCount),
      workbookCount: workbookCounts.get(row.id) ?? 0,
      joinCode: row.joinCode,
      createdAt: row.createdAt.toISOString(),
      joinedAt: null,
    }));
  }

  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      subjectId: classes.subjectId,
      formLevel: classes.formLevel,
      createdAt: classes.createdAt,
      joinedAt: classMembers.joinedAt,
      teacherName: users.name,
      teacherDisplayName: users.displayName,
    })
    .from(classMembers)
    .innerJoin(classes, eq(classes.id, classMembers.classId))
    .innerJoin(users, eq(users.id, classes.teacherId))
    .where(and(eq(classMembers.studentId, user.id), isNull(classes.archivedAt)))
    .orderBy(desc(classMembers.joinedAt));

  const classIds = rows.map((row) => row.id);
  const [counts, workbookCounts] = await Promise.all([
    classIds.length
      ? db
          .select({ classId: classMembers.classId, memberCount: count(classMembers.studentId) })
          .from(classMembers)
          .where(inArray(classMembers.classId, classIds))
          .groupBy(classMembers.classId)
      : Promise.resolve([]),
    workbookCountByClass(classIds),
  ]);
  const countByClass = new Map(counts.map((row) => [row.classId, Number(row.memberCount)]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    subjectId: row.subjectId,
    formLevel: row.formLevel,
    teacherName: displayNameOf({ name: row.teacherName, displayName: row.teacherDisplayName }),
    memberCount: countByClass.get(row.id) ?? 0,
    workbookCount: workbookCounts.get(row.id) ?? 0,
    joinCode: null,
    createdAt: row.createdAt.toISOString(),
    joinedAt: row.joinedAt.toISOString(),
  }));
}

export async function getClassForUser(user: SessionUser, classId: string): Promise<ClassDetail | null> {
  const [row] = await db
    .select({
      id: classes.id,
      name: classes.name,
      subjectId: classes.subjectId,
      formLevel: classes.formLevel,
      teacherId: classes.teacherId,
      joinCode: classes.joinCode,
      createdAt: classes.createdAt,
      teacherName: users.name,
      teacherDisplayName: users.displayName,
    })
    .from(classes)
    .innerJoin(users, eq(users.id, classes.teacherId))
    .where(and(eq(classes.id, classId), isNull(classes.archivedAt)));
  if (!row) return null;

  const isTeacher = row.teacherId === user.id;
  const [membership] = await db
    .select({ joinedAt: classMembers.joinedAt })
    .from(classMembers)
    .where(and(eq(classMembers.classId, classId), eq(classMembers.studentId, user.id)));
  if (!isTeacher && !membership) return null;

  const memberRows = await db
    .select({
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      className: users.className,
      yearLabel: users.yearLabel,
      xp: users.xp,
      joinedAt: classMembers.joinedAt,
    })
    .from(classMembers)
    .innerJoin(users, eq(users.id, classMembers.studentId))
    .where(eq(classMembers.classId, classId))
    .orderBy(asc(users.name));

  return {
    id: row.id,
    name: row.name,
    subjectId: row.subjectId,
    formLevel: row.formLevel,
    teacherId: row.teacherId,
    teacherName: displayNameOf({ name: row.teacherName, displayName: row.teacherDisplayName }),
    memberCount: memberRows.length,
    joinCode: isTeacher ? row.joinCode : null,
    createdAt: row.createdAt.toISOString(),
    joinedAt: membership?.joinedAt.toISOString() ?? null,
    members: isTeacher
      ? memberRows.map((member) => ({
          id: member.id,
          name: member.name,
          className: member.className ?? "—",
          yearLabel: member.yearLabel ?? "—",
          xp: member.xp,
          joinedAt: member.joinedAt.toISOString(),
        }))
      : [],
  };
}

export async function joinClassByCode(user: SessionUser, rawCode: string) {
  const code = sanitizeJoinCode(rawCode);
  if (code.length < 4) return { error: "Kod subjek tidak sah." as const };

  const [row] = await db
    .select({ id: classes.id, name: classes.name, schoolId: classes.schoolId, teacherId: classes.teacherId })
    .from(classes)
    .where(and(eq(classes.joinCode, code), isNull(classes.archivedAt)));
  if (!row) return { error: "Subjek tidak ditemui. Semak kod dengan cikgu anda." as const };
  if (row.schoolId !== user.schoolId) {
    return { error: "Subjek ini bukan untuk sekolah anda." as const };
  }

  const inserted = await db
    .insert(classMembers)
    .values({ classId: row.id, studentId: user.id })
    .onConflictDoNothing()
    .returning({ studentId: classMembers.studentId });
  if (inserted.length) {
    await createNotification(row.teacherId, {
      type: "join",
      title: `${user.preferredName} menyertai ${row.name}`,
      body: user.fullName,
      href: `/subjects/${row.id}?tab=students`,
    });
  }
  return { id: row.id, name: row.name };
}

export async function isClassTeacher(user: SessionUser, classId: string) {
  const [row] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.teacherId, user.id), isNull(classes.archivedAt)));
  return Boolean(row);
}

export async function isClassMember(userId: string, classId: string) {
  const [row] = await db
    .select({ classId: classMembers.classId })
    .from(classMembers)
    .where(and(eq(classMembers.classId, classId), eq(classMembers.studentId, userId)));
  return Boolean(row);
}
