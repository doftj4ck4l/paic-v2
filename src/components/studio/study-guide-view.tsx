"use client";

import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { STUDY_GUIDE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function StudyGuideView({ guide = STUDY_GUIDE }: { guide?: typeof STUDY_GUIDE } = {}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00786a]">Gambaran keseluruhan</h2>
        <p className="mt-2 text-sm leading-relaxed">{guide.overview}</p>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00786a]">Objektif pembelajaran</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {guide.objectives.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#00b6a2]" aria-hidden="true" />
              {o}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00786a]">Konsep penting</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {guide.concepts.map((c) => (
            <div key={c.term} className="rounded-2xl bg-secondary p-3.5">
              <dt className="text-sm font-bold">{c.term}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00786a]">Contoh soalan</h2>
        <p className="mt-2 text-sm font-semibold">{guide.example.question}</p>
        <ol className="mt-3 flex flex-col gap-2">
          {guide.example.steps.map((s, i) => (
            <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00786a]">Senarai semak ulang kaji</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {guide.checklist.map((item, i) => {
            const done = checked.has(i);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={done}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                    done ? "border-[#bfe9e2] bg-[#f2fbf9] text-[#046b69]" : "border-border bg-background hover:border-[#00b6a2]",
                  )}
                >
                  {done ? (
                    <Check className="size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                  )}
                  <span className={done ? "line-through opacity-80" : ""}>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {checked.size}/{guide.checklist.length} selesai · senarai semak disimpan dalam demo ini sahaja.
        </p>
      </section>
    </div>
  );
}
