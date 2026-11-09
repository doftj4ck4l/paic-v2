"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { ProgressBar } from "@/components/studio/ui";
import { FLASHCARDS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function FlashcardPlayer() {
  const [order, setOrder] = useState(() => FLASHCARDS.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const card = FLASHCARDS[order[index]];
  const knownCount = useMemo(() => known.size, [known]);

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => (i + delta + order.length) % order.length);
  }

  function shuffle() {
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
  }

  function reset() {
    setOrder(FLASHCARDS.map((_, i) => i));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
  }

  function toggleKnown() {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="sr-only" role="status" aria-live="polite">
        Kad {index + 1} daripada {order.length}: {card.front}
      </p>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold text-muted-foreground">
          Kad {index + 1} / {order.length} · {knownCount} sudah diketahui
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold shadow-soft hover:bg-secondary"
          >
            <Shuffle className="size-3.5" aria-hidden="true" /> Kocok
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold shadow-soft hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Set semula
          </button>
        </div>
      </div>

      <ProgressBar value={(knownCount / order.length) * 100} label="Kad yang diketahui" className="h-2" />

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className={cn(
          "relative flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-[28px] border p-8 text-center shadow-soft transition-transform hover:-translate-y-0.5",
          flipped ? "border-[#bfe9e2] bg-[#f2fbf9]" : "border-border bg-card",
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {flipped ? "Jawapan" : "Soalan"} · ketuk untuk {flipped ? "balik" : "lihat jawapan"}
        </span>
        <span className={cn("max-w-md font-extrabold tracking-tight", flipped ? "text-lg leading-relaxed" : "text-2xl")}>
          {flipped ? card.back : card.front}
        </span>
        {known.has(card.id) && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#E7F6F4] px-2.5 py-1 text-[11px] font-semibold text-[#00786a]">
            <Check className="size-3" aria-hidden="true" /> Diketahui
          </span>
        )}
      </button>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Kad sebelumnya"
          className="grid size-11 place-items-center rounded-full border border-border bg-card shadow-soft hover:bg-secondary"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleKnown}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-soft transition-colors",
            known.has(card.id)
              ? "bg-[#E7F6F4] text-[#00786a]"
              : "bg-gradient-to-r from-[#007a66] to-[#00856f] text-white",
          )}
        >
          <Check className="size-4" aria-hidden="true" />
          {known.has(card.id) ? "Tandakan belum tahu" : "Saya sudah tahu"}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Kad seterusnya"
          className="grid size-11 place-items-center rounded-full border border-border bg-card shadow-soft hover:bg-secondary"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Kemajuan kad disimpan dalam demo ini sahaja. Ulang kaji berjadual (spaced repetition) dalam Fasa 4.
      </p>
    </div>
  );
}
