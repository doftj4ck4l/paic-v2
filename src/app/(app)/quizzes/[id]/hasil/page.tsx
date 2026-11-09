import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Check, Layers, Sparkles, X } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { QUIZZES, QUIZ_QUESTIONS, quizById } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ id: q.id }));
}

export const metadata: Metadata = { title: "Keputusan Kuiz" };

// Seeded demo attempt for the results screen.
const SAMPLE_ANSWERS = [1, 0, 1, 2, 0, 1, 1, 3];

export default async function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!QUIZZES.some((q) => q.id === id)) notFound();
  const quiz = quizById(id);

  const score = SAMPLE_ANSWERS.filter((a, i) => a === QUIZ_QUESTIONS[i].answer).length;
  const percent = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const missed = QUIZ_QUESTIONS.filter((q, i) => SAMPLE_ANSWERS[i] !== q.answer);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title="Keputusan kuiz"
        description={`${quiz.title} · ${quiz.teacherName}`}
        backHref="/quizzes"
        backLabel="Kembali ke kuiz"
        actions={<Chip tone={percent >= 75 ? "teal" : "amber"}>{score}/{QUIZ_QUESTIONS.length} betul</Chip>}
      />

      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-border bg-card p-8 text-center shadow-soft">
        <span
          className={cn(
            "grid size-20 place-items-center rounded-full text-2xl font-extrabold",
            percent >= 75 ? "bg-[#E7F6F4] text-[#00786a]" : "bg-[#FEF3C7] text-[#92400E]",
          )}
          aria-hidden="true"
        >
          {percent}%
        </span>
        <h2 className="text-xl font-extrabold" role="status">
          {percent >= 75 ? "Syabas!" : "Teruskan usaha!"}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Markah anda direkodkan dalam demo ini sahaja — keputusan sebenar dihantar kepada guru
          dalam Fasa 5.
        </p>
      </div>

      {/* AI revision */}
      <section className="mt-6 rounded-[24px] border border-[#bfe9e2] bg-[#f2fbf9] p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-accent">
            <Sparkles className="size-4 text-accent-foreground" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold">Ulang kaji dengan Pixel AI</h2>
            <p className="text-[11px] text-muted-foreground">Rancangan ulang kaji daripada sumber kuiz</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#3d5a63]">
          {missed.length > 0
            ? `Anda terlepas ${missed.length} soalan. Fokus pada: ${missed
                .map((q) => q.options[q.answer])
                .slice(0, 3)
                .join(", ")}. Baca semula sumber, kemudian cuba latihan tambahan.`
            : "Prestasi penuh! Uji pemahaman anda dengan latihan tambahan supaya kekal segar."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href={`/workbooks/${quiz.sourceWorkbookId}`}
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-4 text-xs font-semibold text-white shadow-soft"
          >
            <BookOpen className="size-3.5" aria-hidden="true" /> Baca sumber dalam buku kerja
          </Link>
          <Link
            href="/creations/flashcards/kad-kitaran-air"
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground shadow-soft hover:bg-secondary"
          >
            <Layers className="size-3.5" aria-hidden="true" /> Jana kad imbas topik ini
          </Link>
          <Link
            href={`/quizzes/${quiz.id}/latihan`}
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground shadow-soft hover:bg-secondary"
          >
            Latihan tambahan <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Mod demo — penjanaan kad imbas dan rancangan ulang kaji AI sebenar disambung dalam Fasa 4.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Semak jawapan
        </h2>
        <ul className="flex flex-col gap-2">
          {QUIZ_QUESTIONS.map((q, i) => {
            const correct = SAMPLE_ANSWERS[i] === q.answer;
            return (
              <li key={q.id} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-sm shadow-soft">
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                    correct ? "bg-[#E7F6F4] text-[#00786a]" : "bg-[#FFE9E9] text-[#b3383e]",
                  )}
                  aria-hidden="true"
                >
                  {correct ? <Check className="size-3" /> : <X className="size-3" />}
                </span>
                <span>
                  <span className="block font-semibold">{q.question}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Jawapan betul: {q.options[q.answer]} — {q.explanation}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}
