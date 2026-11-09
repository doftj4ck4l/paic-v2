"use client";

import { useState } from "react";
import { Info, KeyRound, Loader2 } from "lucide-react";
import { SUBJECT_CLASSES, subjectById } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function JoinSubjectForm() {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 4) {
      setError("Masukkan kod subjek yang sah (cth. EN-4B-2026).");
      setMessage(null);
      return;
    }
    setError(null);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    const match = SUBJECT_CLASSES.find((c) => c.joinCode === cleaned);
    if (match) {
      const subject = subjectById(match.subjectId);
      setJoined((prev) => [...new Set([...prev, match.subjectId])]);
      setMessage(
        `Berjaya! Anda kini menyertai ${subject.name} bersama ${match.teacherName} (${match.className}). Semua buku kerja dan kuiz guru tersebut kini tersedia dalam halaman Subjek.`,
      );
    } else {
      setError("Kod subjek tidak dijumpai. Semak semula dengan guru anda.");
    }
  }

  const notJoined = SUBJECT_CLASSES.filter(
    (c) => !c.joined && !joined.includes(c.subjectId),
  );

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-bold">Sertai subjek baharu</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Masukkan kod subjek daripada guru anda untuk mengakses buku kerja dan kuiz mereka. Kod
          contoh demo: <strong>EN-4B-2026</strong> (English · Teacher Sarah)
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <KeyRound
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="cth. EN-4B-2026"
              aria-label="Kod subjek"
              aria-invalid={!!error}
              className="focus-ring h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm uppercase shadow-soft outline-none transition-shadow focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Sertai subjek
          </button>
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p
            className="flex items-start gap-1.5 rounded-xl bg-[#E7F6F4] px-3.5 py-2.5 text-xs leading-relaxed text-[#046b69]"
            role="status"
          >
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {message}
          </p>
        )}
      </form>

      {notJoined.length > 0 && (
        <div className="rounded-[22px] border border-dashed border-border bg-card/60 p-5">
          <h2 className="text-sm font-bold">Belum disertai</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Subjek berikut belum dipautkan. Minta kod daripada guru anda untuk menyertai.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {notJoined.map((c) => {
              const subject = subjectById(c.subjectId);
              return (
                <li
                  key={c.subjectId}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground",
                  )}
                >
                  <span className="size-2 rounded-full bg-[#d5d9ea]" aria-hidden="true" />
                  {subject.name} · {c.teacherName}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
