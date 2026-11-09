"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { Chip, ProgressBar } from "@/components/studio/ui";
import { QUIZ_QUESTIONS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function QuizPlayer({
  onFinishHref = "/creations",
  aiExplain = false,
  sourceWorkbookId,
}: {
  onFinishHref?: string;
  aiExplain?: boolean;
  sourceWorkbookId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const question = QUIZ_QUESTIONS[index];
  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].answer).length;

  function choose(option: number) {
    if (picked !== null) return;
    setPicked(option);
    setAnswers((prev) => [...prev, option]);
  }

  function next() {
    if (index + 1 >= QUIZ_QUESTIONS.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setAiOpen(false);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
    setAiOpen(false);
  }

  if (done) {
    const percent = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-8 text-center shadow-soft">
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
          {percent >= 75 ? "Syabas!" : "Teruskan usaha!"} {score}/{QUIZ_QUESTIONS.length} betul
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {percent >= 75
            ? "Pemahaman anda tentang kitaran air sangat baik."
            : "Ulang kaji nota dan cuba lagi — anda boleh buat!"}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={restart}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold shadow-soft transition-colors hover:bg-secondary"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Cuba lagi
          </button>
          <Link
            href={onFinishHref}
            className="focus-ring inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-5 text-sm font-semibold text-white shadow-soft"
          >
            Lihat keputusan penuh
          </Link>
        </div>
        <div className="mt-4 w-full max-w-md text-left">
          <h3 className="text-sm font-bold">Semak jawapan</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {QUIZ_QUESTIONS.map((q, i) => {
              const correct = answers[i] === q.answer;
              return (
                <li key={q.id} className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3 text-sm">
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
                      Jawapan: {q.options[q.answer]} — {q.explanation}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-[24px] border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold text-muted-foreground">
          Soalan {index + 1} / {QUIZ_QUESTIONS.length}
        </p>
        <p className="text-xs font-bold text-[#00786a]" aria-live="polite">
          {score} betul
        </p>
      </div>
      <ProgressBar
        value={((index + (picked !== null ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}
        label="Kemajuan kuiz"
        className="h-2"
      />

      <h2 className="text-lg font-extrabold leading-snug">{question.question}</h2>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.answer;
          const isPicked = picked === i;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={cn(
                "focus-ring flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors",
                picked === null
                  ? "border-border bg-background hover:border-[#00b6a2]"
                  : isCorrect
                    ? "border-[#9fe3d5] bg-[#E7F6F4] text-[#046b69]"
                    : isPicked
                      ? "border-[#ffbdbd] bg-[#FFE9E9] text-[#b3383e]"
                      : "border-border bg-background opacity-60",
              )}
            >
              {option}
              {picked !== null && isCorrect && <Check className="size-4 shrink-0" aria-hidden="true" />}
              {picked !== null && isPicked && !isCorrect && <X className="size-4 shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4" role="status" aria-live="polite">
          <p className="text-sm leading-relaxed">
            <strong className="font-extrabold">
              {picked === question.answer ? "Betul! " : "Hampir… "}
            </strong>
            {question.explanation}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={next}
              className="focus-ring inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft"
            >
              {index + 1 >= QUIZ_QUESTIONS.length ? "Lihat keputusan" : "Soalan seterusnya"}
            </button>
            {aiExplain && (
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-[#bfe9e2] bg-[#f2fbf9] px-5 text-sm font-semibold text-[#00786a] shadow-soft"
              >
                <Sparkles className="size-4" aria-hidden="true" /> Tak faham? Tanya Pixel AI
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI explain drawer */}
      {aiExplain && aiOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#10112f]/40"
          role="dialog"
          aria-modal="true"
          aria-label="Penjelasan Pixel AI"
        >
          <button type="button" aria-label="Tutup" className="flex-1 cursor-default" onClick={() => setAiOpen(false)} />
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-soft-lg">
            <div className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-accent">
                  <Sparkles className="size-4 text-accent-foreground" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">Pixel AI menerangkan</h2>
                  <p className="text-[11px] text-muted-foreground">Bersandarkan sumber buku kerja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                aria-label="Tutup penjelasan"
                className="focus-ring grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm leading-relaxed">{question.aiExplain}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="teal">Sumber: {question.citation}</Chip>
                {sourceWorkbookId && (
                  <Link
                    href={`/workbooks/${sourceWorkbookId}`}
                    className="focus-ring rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-[#00786a] hover:underline"
                  >
                    Buka buku kerja
                  </Link>
                )}
              </div>
              <p className="rounded-xl bg-[#E7F6F4] px-3.5 py-2.5 text-xs leading-relaxed text-[#3d5a63]">
                Mod demo — penjelasan AI sebenar (bersitasi daripada sumber) disambung dalam Fasa 3.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
