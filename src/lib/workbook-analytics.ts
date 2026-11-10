import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, assignmentCompletions, assignments, classMembers, quizAttempts, users } from "@/db/schema";
import { classWorkbookIds, workbookTitles } from "@/lib/assignments";
import { getAppWorkbook } from "@/lib/workbooks";

export type StudentAnalyticsRow = {
  id: string;
  name: string;
  className: string;
  attemptCount: number;
  bestPercent: number | null;
  avgPercent: number | null;
  trend: { direction: "up" | "down" | "flat"; delta: number; points: number[] } | null;
  lastActivityAt: string | null;
  completed: boolean;
};

export type QuestionStat = {
  index: number;
  quizTitle: string;
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

export type ScoreDistribution = { high: number; mid: number; low: number; withAttempts: number };

export type AnalyticsInsights = {
  strengths: string[];
  focus: string[];
  recommendations: string[];
};

export type WorkbookAnalytics = {
  workbookTitle: string;
  subjectId: string | null;
  moduleKinds: string[] | null;
  dueAt: string | null;
  memberCount: number;
  completedCount: number;
  completionRate: number;
  activeStudents: number;
  attemptCount: number;
  attemptsPerStudent: number;
  avgPercent: number | null;
  bestPercent: number | null;
  bestStudentName: string | null;
  /** Last round average minus first round average (percentage points). */
  improvementDelta: number | null;
  progression: { label: string; percent: number }[];
  distribution: ScoreDistribution;
  students: StudentAnalyticsRow[];
  quizzes: QuizAnalytics[];
  insights: AnalyticsInsights;
};

type QuizQuestion = { question: string; options: string[]; answer: number };

function percentOf(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function truncate(text: string, max = 72) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Teacher-only analytics for one workbook inside a class. */
export async function getWorkbookAnalytics(classId: string, workbookId: string): Promise<WorkbookAnalytics | null> {
  const workbookIds = await classWorkbookIds(classId);
  if (!workbookIds.includes(workbookId)) return null;

  const [memberRows, assignmentRows, quizArtifacts, titles, workbook] = await Promise.all([
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
    getAppWorkbook(workbookId),
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
  const multipleQuizzes = quizArtifacts.length > 1;

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
        quizTitle: artifact.title,
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

  const percentsByStudent = new Map<string, number[]>();
  for (const member of memberRows) {
    const own = attempts
      .filter((attempt) => attempt.userId === member.id)
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime())
      .map((attempt) => percentOf(attempt.score, attempt.total));
    percentsByStudent.set(member.id, own);
  }

  const students: StudentAnalyticsRow[] = memberRows
    .map((member) => {
      const own = attempts.filter((attempt) => attempt.userId === member.id);
      const percents = percentsByStudent.get(member.id) ?? [];
      const best = percents.length ? Math.max(...percents) : null;
      const avg = percents.length ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length) : null;
      const delta = percents.length >= 2 ? percents[percents.length - 1] - percents[0] : 0;
      const dates = own.map((attempt) => attempt.completedAt.toISOString()).sort();
      return {
        id: member.id,
        name: member.displayName?.trim() || member.name,
        className: member.className ?? "—",
        attemptCount: own.length,
        bestPercent: best,
        avgPercent: avg,
        trend:
          percents.length >= 2
            ? { direction: delta > 4 ? "up" : delta < -4 ? "down" : "flat", delta, points: percents }
            : null,
        lastActivityAt: dates.length ? dates[dates.length - 1] : null,
        completed: completions.some((completion) => completion.studentId === member.id),
      } satisfies StudentAnalyticsRow;
    })
    .sort((a, b) => (b.bestPercent ?? -1) - (a.bestPercent ?? -1) || a.name.localeCompare(b.name));

  const maxRounds = Math.max(0, ...[...percentsByStudent.values()].map((percents) => percents.length));
  const progression = Array.from({ length: maxRounds }, (_, round) => {
    const values = [...percentsByStudent.values()].map((percents) => percents[round]).filter((value): value is number => value !== undefined);
    return {
      label: `P${round + 1}`,
      percent: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
    };
  });

  const withAttempts = students.filter((student) => student.bestPercent !== null);
  const distribution: ScoreDistribution = {
    high: withAttempts.filter((student) => (student.bestPercent ?? 0) >= 80).length,
    mid: withAttempts.filter((student) => (student.bestPercent ?? 0) >= 50 && (student.bestPercent ?? 0) < 80).length,
    low: withAttempts.filter((student) => (student.bestPercent ?? 0) < 50).length,
    withAttempts: withAttempts.length,
  };

  const allPercents = attempts.map((attempt) => percentOf(attempt.score, attempt.total));
  const bestAttempt = attempts.reduce<{ percent: number; userId: string } | null>(
    (best, attempt) => {
      const percent = percentOf(attempt.score, attempt.total);
      return !best || percent > best.percent ? { percent, userId: attempt.userId } : best;
    },
    null,
  );

  const allQuestions = quizzes.flatMap((quiz) => quiz.questions);
  const strengthQuestions = allQuestions
    .filter((question) => question.correctPercent >= 75)
    .sort((a, b) => b.correctPercent - a.correctPercent)
    .slice(0, 2);
  const focusQuestions = allQuestions
    .filter((question) => question.correctPercent < 50)
    .sort((a, b) => a.correctPercent - b.correctPercent)
    .slice(0, 3);
  const label = (question: QuestionStat) => truncate(multipleQuizzes ? `${question.quizTitle} — ${question.question}` : question.question);

  const completionRate = memberRows.length ? Math.round((completions.length / memberRows.length) * 100) : 0;

  return {
    workbookTitle: titles.get(workbookId) ?? "Buku kerja",
    subjectId: workbook?.subjectId ?? null,
    moduleKinds: assignment?.moduleKinds ?? null,
    dueAt: assignment?.dueAt?.toISOString() ?? null,
    memberCount: memberRows.length,
    completedCount: completions.length,
    completionRate,
    activeStudents: withAttempts.length,
    attemptCount: attempts.length,
    attemptsPerStudent: memberRows.length ? Math.round((attempts.length / memberRows.length) * 10) / 10 : 0,
    avgPercent: allPercents.length ? Math.round(allPercents.reduce((sum, value) => sum + value, 0) / allPercents.length) : null,
    bestPercent: bestAttempt ? bestAttempt.percent : null,
    bestStudentName: bestAttempt ? (nameById.get(bestAttempt.userId) ?? null) : null,
    improvementDelta: progression.length >= 2 ? progression[progression.length - 1].percent - progression[0].percent : null,
    progression,
    distribution,
    students,
    quizzes,
    insights: {
      strengths: strengthQuestions.map((question) => `Pelajar memahami dengan baik “${label(question)}” (${question.correctPercent}% betul).`),
      focus: focusQuestions.map((question) => `“${label(question)}” perlu diperkukuh (${question.correctPercent}% betul).`),
      recommendations: [
        focusQuestions.length
          ? `Sediakan ulang kaji berfokus dan kuiz tambahan untuk soalan ${focusQuestions.map((question) => question.index + 1).join(", ")}.`
          : "",
        attempts.length > 0 && completions.length === 0
          ? "Ingatkan pelajar menandakan selesai selepas menyiapkan kuiz."
          : "",
        attempts.length === 0 ? "Belum ada percubaan — galakkan pelajar mula menjawab kuiz." : "",
      ].filter(Boolean),
    },
  };
}
