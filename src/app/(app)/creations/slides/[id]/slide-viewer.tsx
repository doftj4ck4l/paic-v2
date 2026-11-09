"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { SLIDES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function SlideViewer() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isTitle = index === 0 || index === SLIDES.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div
        className={cn(
          "relative flex min-h-[320px] flex-col justify-center gap-5 overflow-hidden rounded-[28px] border p-8 shadow-soft sm:p-12",
          isTitle
            ? "border-transparent bg-gradient-to-br from-[#51408f] to-[#382670] text-white"
            : "border-border bg-card",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-16 -top-16 size-56 rounded-full",
            isTitle ? "bg-white/10" : "bg-[#E7F6F4]",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-20 -left-10 size-44 rounded-full",
            isTitle ? "bg-white/5" : "bg-accent",
          )}
        />
        <div className="relative z-10">
          {slide.subtitle && (
            <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", isTitle ? "text-white/70" : "text-[#00786a]")}>
              {slide.subtitle}
            </p>
          )}
          <h2 className={cn("mt-2 font-extrabold tracking-tight", isTitle ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
            {slide.title}
          </h2>
          <ul className="mt-5 flex flex-col gap-2.5">
            {slide.bullets.map((b) => (
              <li key={b} className={cn("flex items-start gap-2.5 text-sm leading-relaxed sm:text-base", isTitle ? "text-white/90" : "")}>
                <span
                  className={cn("mt-2 size-1.5 shrink-0 rounded-full", isTitle ? "bg-[#8fe3d5]" : "bg-[#00b6a2]")}
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-soft hover:bg-secondary disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Sebelum
        </button>
        <div className="flex items-center gap-0.5" role="tablist" aria-label="Navigasi slaid">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slaid ${i + 1}: ${s.title}`}
              onClick={() => setIndex(i)}
              className="focus-ring grid size-8 place-items-center rounded-full"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-[#00b6a2]" : "w-2 bg-[#d5d9ea]",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
          disabled={index === SLIDES.length - 1}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-4 text-sm font-semibold text-white shadow-soft disabled:opacity-40"
        >
          Seterusnya <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Expand className="size-3.5" aria-hidden="true" />
        Slaid {index + 1} daripada {SLIDES.length} · mod pembentangan penuh dan muat turun PPTX dalam Fasa 4.
      </p>
    </div>
  );
}
