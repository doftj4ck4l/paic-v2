import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { QUIZZES, quizById } from "@/lib/demo-data";
import { QuizPlayer } from "@/components/studio/quiz-player";

export const metadata: Metadata = { title: "Latihan Tambahan" };

export default async function QuizExtraPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!QUIZZES.some((q) => q.id === id)) notFound();
  const quiz = quizById(id);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title="Latihan tambahan"
        description={`Soalan daripada ${quiz.sourceWorkbookTitle} — tiada markah direkod, fokus pada pembelajaran.`}
        backHref={`/quizzes/${quiz.id}/hasil`}
        backLabel="Kembali ke keputusan"
        actions={<Chip tone="purple">Tidak dinilai</Chip>}
      />
      <QuizPlayer aiExplain sourceWorkbookId={quiz.sourceWorkbookId} onFinishHref={`/quizzes/${quiz.id}/hasil`} />
    </PageShell>
  );
}
