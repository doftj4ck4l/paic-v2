"use client";

import { useMemo, useState } from "react";
import { QuizRow } from "@/components/studio/cards";
import { EmptyState } from "@/components/studio/ui";
import { QUIZZES, type DemoQuizStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FILTERS: { id: DemoQuizStatus | "all"; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "new", label: "Baharu" },
  { id: "in-progress", label: "Dalam proses" },
  { id: "done", label: "Selesai" },
];

export function QuizList() {
  const [filter, setFilter] = useState<DemoQuizStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? QUIZZES : QUIZZES.filter((q) => q.status === filter)),
    [filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tapis kuiz">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "focus-ring rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              filter === f.id
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="Tiada kuiz di sini"
          description="Kuiz baharu daripada guru anda akan muncul di sini."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q) => (
            <QuizRow key={q.id} quiz={q} />
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
        Menunjukkan {filtered.length} daripada {QUIZZES.length} kuiz contoh.
      </p>
    </div>
  );
}
