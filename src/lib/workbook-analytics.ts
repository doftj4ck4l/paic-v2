import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, assignmentCompletions, assignments, classMembers, quizAttempts, users } from "@/db/schema";
import { classWorkbookIds, workbookTitles } from "@/lib/assignments";

export type StudentAnalyticsRow = {
  id: string;
  name: string;
  className: string;
  attemptCount: number;
  bestPercent: number | null;
  lastActivityAt: string | null;
  completed: boolean;
};

export type QuestionStat = {
  index: number;
  question: string;
  answeredCount: number;
  correctPercent: number;
  commonWrong: string | null;
};

export type QuizAnalytics = {
  artifactId: string;
  title: string;
  attemptCount: number;
  avgPercent: number | null;
  bestPercent: number | null;
  questions: QuestionStat[];
  studentAttempts: {
    studentId: string;
    studentName: string;
    attempts: { score: number; total: number; completedAt: string }[];
  }[];
};

export type WorkbookAnalytics = {
  workbookTitle: string;
  moduleKinds: string[] | null;
  dueAt: string | null;
  memberCount: number;
  completedCount: number;
  attemptCount: number;
  avgPercent: number | null;
  students: StudentAnalyticsRow[];
  quizzes: QuizAnalytics[];
};

type QuizQuestion = { question: string; options: string[]; answer: number };

function percentOf(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

/** Teacher-only analytics for one workbook inside a class. */
export async function getWorkbookAnalytics(classId: string, workbookId: string): Promise<WorkbookAnalytics | null> {
  const workbookIds = await classWorkbookIds(classId);
  if (!workbookIds.includes(workbookId)) return null;

  const [memberRows, assignmentRows, quizArtifacts, titles] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, displayName: users.displayName, className: users.className })
      .from(classMembers)
      .innerJoin(users, eq(users.id, classMembers.studentId))
      .where(eq(classMembers.classId, classId)),
    db
      .select({ id: assignments.id, moduleKinds: assignments.moduleKinds, dueAt: assignments.dueAt })
      .from(assignments)
      .where(and(eq(assignments.classId, classId), eq(assignments.workbookId, workbookId)))
      .limit(1),
    db
      .select({ id: artifacts.id, title: artifacts.title, data: artifacts.data })
      .from(artifacts)
      .where(and(eq(artifacts.workbookId, workbookId), eq(artifacts.kind, "quizzes"), eq(artifacts.status, "ready"))),
    workbookTitles([workbookId]),
  ]);

  const memberIds = memberRows.map((row) => row.id);
  const assignment = assignmentRows[0] ?? null;

  const [attempts, completions] = await Promise.all([
    memberIds.length
      ? db
          .select()
          .from(quizAttempts)
          .where(and(inArray(quizAttempts.userId, memberIds), eq(quizAttempts.workbookId, workbookId)))
      : Promise.resolve([]),
    assignment
      ? db
          .select({ studentId: assignmentCompletions.studentId })
          .from(assignmentCompletions)
          .where(eq(assignmentCompletions.assignmentId, assignment.id))
      : Promise.resolve([]),
  ]);

  const nameById = new Map(memberRows.map((row) => [row.id, row.displayName?.trim() || row.name]));

  const quizzes: QuizAnalytics[] = quizArtifacts.map((artifact) => {
    const forQuiz = attempts.filter((attempt) => attempt.artifactId === artifact.id);
    const questions = ((artifact.data as { questions?: QuizQuestion[] } | null)?.questions ?? []).filter(
      (question) => Array.isArray(question.options) && question.options.length > 0,
    );

    const questionStats: QuestionStat[] = questions.map((question, index) => {
      const answered = forQuiz.filter((attempt) => typeof attempt.answers?.[index] === "number");
      const correct = answered.filter((attempt) => attempt.answers[index] === question.answer).length;
      const wrongCounts = new Map<number, number>();
      for (const attempt of answered) {
        const picked = attempt.answers[index];
        if (picked !== question.answer) wrongCounts.set(picked, (wrongCounts.get(picked) ?? 0) + 1);
      }
      const topWrong = [...wrongCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        index,
        question: question.question,
        answeredCount: answered.length,
        correctPercent: answered.length ? Math.round((correct / answered.length) * 100) : 0,
        commonWrong: topWrong ? (question.options[topWrong[0]] ?? null) : null,
      };
    });

    const byStudent = new Map<string, { score: number; total: number; completedAt: string }[]>();
    for (const attempt of forQuiz) {
      const list = byStudent.get(attempt.userId) ?? [];
      list.push({ score: attempt.score, total: attempt.total, completedAt: attempt.completedAt.toISOString() });
      byStudent.set(attempt.userId, list);
    }

    const percents = forQuiz.map((attempt) => percentOf(attempt.score, attempt.total));
    return {
      artifactId: artifact.id,
      title: artifact.title,
      attemptCount: forQuiz.length,
      avgPercent: percents.length ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length) : null,
      bestPercent: percents.length ? Math.max(...percents) : null,
      questions: questionStats,
      studentAttempts: [...byStudent.entries()]
        .map(([studentId, list]) => ({
          studentId,
          studentName: nameById.get(studentId) ?? "Pelajar",
          attempts: list.sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
        }))
        .sort((a, b) => a.studentName.localeCompare(b.studentName)),
    };
  });

  const students: StudentAnalyticsRow[] = memberRows
    .map((member) => {
      const own = attempts.filter((attempt) => attempt.userId === member.id);
      const best = own.reduce((max, attempt) => Math.max(max, percentOf(attempt.score, attempt.total)), -1);
      const dates = own.map((attempt) => attempt.completedAt.toISOString()).sort();
      return {
        id: member.id,
        name: member.displayName?.trim() || member.name,
        className: member.className ?? "—",
        attemptCount: own.length,
        bestPercent: best >= 0 ? best : null,
        lastActivityAt: dates.length ? dates[dates.length - 1] : null,
        completed: completions.some((completion) => completion.studentId === member.id),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const allPercents = attempts.map((attempt) => percentOf(attempt.score, attempt.total));

  return {
    workbookTitle: titles.get(workbookId) ?? "Buku kerja",
    moduleKinds: assignment?.moduleKinds ?? null,
    dueAt: assignment?.dueAt?.toISOString() ?? null,
    memberCount: memberRows.length,
    completedCount: completions.length,
    attemptCount: attempts.length,
    avgPercent: allPercents.length ? Math.round(allPercents.reduce((sum, value) => sum + value, 0) / allPercents.length) : null,
    students,
    quizzes,
  };
}
