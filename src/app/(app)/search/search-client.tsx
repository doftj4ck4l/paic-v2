"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Chip, EmptyState } from "@/components/studio/ui";
import { CREATION_KIND_LABEL, TOPICS, WORKBOOKS, CREATIONS, subjectById } from "@/lib/demo-data";

export function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q.length < 2) return null;
    return {
      workbooks: WORKBOOKS.filter((w) => `${w.title} ${w.topic}`.toLowerCase().includes(q)),
      topics: TOPICS.filter((t) => `${t.name} ${t.blurb}`.toLowerCase().includes(q)),
      creations: CREATIONS.filter((c) => c.title.toLowerCase().includes(q)),
    };
  }, [q]);

  const total = results
    ? results.workbooks.length + results.topics.length + results.creations.length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative sm:max-w-lg">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Cari buku kerja, topik atau hasil karya…"
          aria-label="Carian"
          className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {!results && (
        <p className="text-sm text-muted-foreground">
          Taip sekurang-kurangnya 2 aksara untuk mula mencari.
        </p>
      )}

      {results && total === 0 && (
        <EmptyState
          title={`Tiada hasil untuk "${query}"`}
          description="Cuba kata kunci lain — cth. nama subjek, topik atau tajuk buku kerja."
        />
      )}

      {results && total > 0 && (
        <div className="flex flex-col gap-6">
          {results.workbooks.length > 0 && (
            <section aria-label="Buku kerja">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Buku kerja ({results.workbooks.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {results.workbooks.map((w) => (
                  <li key={w.id}>
                    <Link
                      href={`/workbooks/${w.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft hover:border-[#00b6a2]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{w.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {subjectById(w.subjectId).name} · {w.topic}
                        </span>
                      </span>
                      <Chip tone="teal">{w.progress}%</Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.topics.length > 0 && (
            <section aria-label="Topik">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Topik ({results.topics.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {results.topics.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/explore/topics/${t.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft hover:border-[#00b6a2]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{t.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {subjectById(t.subjectId).name} · {t.blurb}
                        </span>
                      </span>
                      <Chip tone="purple">Topik</Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.creations.length > 0 && (
            <section aria-label="Hasil karya">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Hasil karya ({results.creations.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {results.creations.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/creations/${c.kind}/${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft hover:border-[#00b6a2]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{c.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {c.workbookTitle} · {c.time}
                        </span>
                      </span>
                      <Chip tone="neutral">{CREATION_KIND_LABEL[c.kind]}</Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
