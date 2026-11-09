"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Chip, EmptyState } from "@/components/studio/ui";
import { WorkbookCard, SUBJECT_TINT } from "@/components/studio/cards";
import { SUBJECTS, TOPICS, WORKBOOKS, subjectById, type SubjectId } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function Explorer() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");

  const q = query.trim().toLowerCase();

  const topics = useMemo(() => {
    return TOPICS.filter((t) => {
      const matchesSubject = subject === "all" || t.subjectId === subject;
      const matchesQuery = q.length === 0 || `${t.name} ${t.blurb}`.toLowerCase().includes(q);
      return matchesSubject && matchesQuery;
    });
  }, [q, subject]);

  const workbooks = useMemo(() => {
    return WORKBOOKS.filter((w) => {
      const matchesSubject = subject === "all" || w.subjectId === subject;
      const matchesQuery = q.length === 0 || `${w.title} ${w.topic}`.toLowerCase().includes(q);
      return matchesSubject && matchesQuery;
    });
  }, [q, subject]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="relative sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari topik, subjek atau buku kerja…"
            aria-label="Cari bahan pembelajaran"
            className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tapis mengikut subjek">
          <button
            type="button"
            onClick={() => setSubject("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              subject === "all"
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            Semua subjek
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                subject === s.id
                  ? "border-transparent bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <section aria-labelledby="topics-title">
        <h2 id="topics-title" className="mb-3 text-lg font-extrabold tracking-tight">
          Topik pembelajaran
        </h2>
        {topics.length === 0 ? (
          <EmptyState title="Tiada topik sepadan" description="Cuba kata kunci atau subjek lain." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const s = subjectById(t.subjectId);
              return (
                <Link
                  key={t.id}
                  href={`/explore/topics/${t.id}`}
                  className={cn(
                    "group flex flex-col gap-3 rounded-[22px] border border-border p-4 shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg",
                    SUBJECT_TINT[t.subjectId],
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card/80">
                      <Image
                        src={s.asset}
                        alt=""
                        width={36}
                        height={36}
                        className="drop-shadow-[0_6px_8px_rgba(16,17,47,0.16)]"
                      />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold">{t.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.name}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.blurb}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <Chip tone="neutral">{t.workbookCount} buku kerja</Chip>
                    {t.quizCount > 0 && <Chip tone="purple">{t.quizCount} kuiz</Chip>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="workbooks-title">
        <h2 id="workbooks-title" className="mb-3 text-lg font-extrabold tracking-tight">
          Buku kerja komuniti sekolah
        </h2>
        {workbooks.length === 0 ? (
          <EmptyState title="Tiada buku kerja sepadan" description="Cuba kata kunci atau subjek lain." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workbooks.map((w) => (
              <WorkbookCard key={w.id} workbook={w} />
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Bahan awam yang diluluskan sekolah dipaparkan di sini · perkongsian penuh dalam Fasa 5.
        </p>
      </section>
    </div>
  );
}
