import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { QUIZZES, quizById, subjectById } from "@/lib/demo-data";
import { QuizPlayer } from "@/components/studio/quiz-player";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export const metadata: Metadata = { title: "Kuiz" };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!QUIZZES.some((q) => q.id === id)) notFound();
  const quiz = quizById(id);
  const subject = subjectById(quiz.subjectId);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title={quiz.title}
        description={`${subject.name} · ${quiz.teacherName} · Tarikh akhir ${quiz.due}`}
        backHref="/home"
        backLabel="Kembali ke Utama"
        actions={
          <Chip tone="amber">
            <Sparkles className="size-3.5" aria-hidden="true" /> Dijana AI daripada sumber
          </Chip>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-[18px] border border-border bg-card px-4 py-3 shadow-soft">
        <BookOpen className="size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          Sumber kuiz: <strong className="font-bold text-foreground">{quiz.sourceWorkbookTitle}</strong> — tersekat pada
          mana-mana soalan? Tekan “Tanya Pixel AI” untuk penjelasan bersitasi.
        </p>
      </div>
      <QuizPlayer aiExplain sourceWorkbookId={quiz.sourceWorkbookId} onFinishHref={`/quizzes/${quiz.id}/hasil`} />
      <p className="mt-4 text-xs text-muted-foreground">
        Percubaan anda disimpan dalam demo ini sahaja. Rekod percubaan sebenar disambung dalam Fasa 4.
      </p>
    </PageShell>
  );
}
