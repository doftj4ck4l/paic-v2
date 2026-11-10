import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, assignmentCompletions, assignments, classes, quizAttempts } from "@/db/schema";
import { workbookTitles } from "@/lib/assignments";

export type AttemptView = {
  id: string;
  workbookId: string;
  artifactId: string;
  workbookTitle: string;
  artifactTitle: string;
  score: number;
  total: number;
  percent: number;
  completedAt: string;
};

/** Recent quiz attempts by one learner, newest first. */
export async function listUserAttempts(userId: string, limit = 20): Promise<AttemptView[]> {
  const rows = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(limit);
  if (!rows.length) return [];

  const [titles, artifactRows] = await Promise.all([
    workbookTitles(rows.map((row) => row.workbookId)),
    db
      .select({ id: artifacts.id, title: artifacts.title })
      .from(artifacts)
      .where(inArray(artifacts.id, [...new Set(rows.map((row) => row.artifactId))])),
  ]);
  const artifactTitles = new Map(artifactRows.map((row) => [row.id, row.title]));

  return rows.map((row) => ({
    id: row.id,
    workbookId: row.workbookId,
    artifactId: row.artifactId,
    workbookTitle: titles.get(row.workbookId) ?? "Buku kerja",
    artifactTitle: artifactTitles.get(row.artifactId) ?? "Kuiz",
    score: row.score,
    total: row.total,
    percent: row.total > 0 ? Math.round((row.score / row.total) * 100) : 0,
    completedAt: row.completedAt.toISOString(),
  }));
}

export type ActivityItem = {
  id: string;
  type: "quiz" | "assignment";
  title: string;
  detail: string;
  at: string;
};

/** Merged learning activity: quiz attempts + completed assignments. */
export async function listUserActivity(userId: string, limit = 40): Promise<ActivityItem[]> {
  const [attempts, completions] = await Promise.all([
    listUserAttempts(userId, limit),
    db
      .select({
        assignmentId: assignmentCompletions.assignmentId,
        completedAt: assignmentCompletions.completedAt,
        title: assignments.title,
        className: classes.name,
      })
      .from(assignmentCompletions)
      .innerJoin(assignments, eq(assignments.id, assignmentCompletions.assignmentId))
      .innerJoin(classes, eq(classes.id, assignments.classId))
      .where(eq(assignmentCompletions.studentId, userId))
      .orderBy(desc(assignmentCompletions.completedAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...attempts.map((attempt) => ({
      id: `quiz_${attempt.id}`,
      type: "quiz" as const,
      title: attempt.artifactTitle,
      detail: `Skor ${attempt.score}/${attempt.total} (${attempt.percent}%) · ${attempt.workbookTitle}`,
      at: attempt.completedAt,
    })),
    ...completions.map((completion) => ({
      id: `assignment_${completion.assignmentId}`,
      type: "assignment" as const,
      title: completion.title,
      detail: `Tugasan selesai · ${completion.className}`,
      at: completion.completedAt.toISOString(),
    })),
  ];

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
