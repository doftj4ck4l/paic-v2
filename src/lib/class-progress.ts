import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { assignmentCompletions, assignments, classMembers, quizAttempts, users, workbookClassShares } from "@/db/schema";

export type StudentProgressRow = {
  id: string;
  name: string;
  className: string;
  completedCount: number;
  totalAssignments: number;
  attemptCount: number;
  bestPercent: number | null;
  lastActivityAt: string | null;
};

export type AssignmentProgressRow = {
  id: string;
  title: string;
  workbookId: string;
  completedCount: number;
  memberCount: number;
  attemptCount: number;
  avgPercent: number | null;
};

export type ClassProgress = {
  students: StudentProgressRow[];
  assignments: AssignmentProgressRow[];
  attemptTotal: number;
};

/** Teacher-facing progress: per-student rows + per-assignment quiz stats. */
export async function getClassProgress(classId: string): Promise<ClassProgress> {
  const [memberRows, assignmentRows, materialRows] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, displayName: users.displayName, className: users.className })
      .from(classMembers)
      .innerJoin(users, eq(users.id, classMembers.studentId))
      .where(eq(classMembers.classId, classId)),
    db
      .select({ id: assignments.id, title: assignments.title, workbookId: assignments.workbookId })
      .from(assignments)
      .where(eq(assignments.classId, classId)),
    db
      .select({ workbookId: workbookClassShares.workbookId })
      .from(workbookClassShares)
      .where(eq(workbookClassShares.classId, classId)),
  ]);

  const memberIds = memberRows.map((row) => row.id);
  const assignmentIds = assignmentRows.map((row) => row.id);
  const workbookIds = [...new Set([...assignmentRows.map((row) => row.workbookId), ...materialRows.map((row) => row.workbookId)])];

  const [completions, attempts] = await Promise.all([
    assignmentIds.length
      ? db
          .select({ assignmentId: assignmentCompletions.assignmentId, studentId: assignmentCompletions.studentId, completedAt: assignmentCompletions.completedAt })
          .from(assignmentCompletions)
          .where(inArray(assignmentCompletions.assignmentId, assignmentIds))
      : Promise.resolve([]),
    memberIds.length && workbookIds.length
      ? db
          .select()
          .from(quizAttempts)
          .where(and(inArray(quizAttempts.userId, memberIds), inArray(quizAttempts.workbookId, workbookIds)))
      : Promise.resolve([]),
  ]);

  const students: StudentProgressRow[] = memberRows
    .map((member) => {
      const ownCompletions = completions.filter((completion) => completion.studentId === member.id);
      const ownAttempts = attempts.filter((attempt) => attempt.userId === member.id);
      const best = ownAttempts.reduce((max, attempt) => {
        const percent = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
        return Math.max(max, percent);
      }, -1);
      const dates = [
        ...ownCompletions.map((completion) => completion.completedAt.toISOString()),
        ...ownAttempts.map((attempt) => attempt.completedAt.toISOString()),
      ].sort();
      return {
        id: member.id,
        name: member.displayName?.trim() || member.name,
        className: member.className ?? "—",
        completedCount: ownCompletions.length,
        totalAssignments: assignmentRows.length,
        attemptCount: ownAttempts.length,
        bestPercent: best >= 0 ? best : null,
        lastActivityAt: dates.length ? dates[dates.length - 1] : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignmentStats: AssignmentProgressRow[] = assignmentRows.map((assignment) => {
    const forThis = completions.filter((completion) => completion.assignmentId === assignment.id);
    const relatedAttempts = attempts.filter((attempt) => attempt.workbookId === assignment.workbookId);
    const avg = relatedAttempts.length
      ? Math.round(
          relatedAttempts.reduce((sum, attempt) => sum + (attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0), 0) /
            relatedAttempts.length,
        )
      : null;
    return {
      id: assignment.id,
      title: assignment.title,
      workbookId: assignment.workbookId,
      completedCount: forThis.length,
      memberCount: memberRows.length,
      attemptCount: relatedAttempts.length,
      avgPercent: avg,
    };
  });

  return { students, assignments: assignmentStats, attemptTotal: attempts.length };
}
