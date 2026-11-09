"use client";

import { useState } from "react";
import { Check, Info, KeyRound, Loader2 } from "lucide-react";
import { SUBJECT_CLASSES, subjectById } from "@/lib/demo-data";
import styles from "./subjects.module.css";

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
    <div>
      <div className={styles.joinCard}>
        <p>
          Kod contoh demo: <strong>EN-4B-2026</strong> (English · Teacher Sarah). Selepas menyertai,
          subjek tersebut muncul dalam senarai anda bersama semua bahan gurunya.
        </p>
        <form onSubmit={onSubmit} className={styles.joinForm} noValidate>
          <div className={styles.joinRow}>
            <div className={styles.joinInput}>
              <KeyRound size={17} aria-hidden="true" />
              <label htmlFor="join-code" className={styles.srOnly}>Kod subjek</label>
              <input
                id="join-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="cth. EN-4B-2026"
                autoComplete="off"
                aria-invalid={!!error}
              />
            </div>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Check size={16} aria-hidden="true" />
              )}
              Sertai subjek
            </button>
          </div>
          {error && (
            <p className={styles.joinError} role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className={styles.joinStatus} role="status">
              <Info size={15} aria-hidden="true" />
              {message}
            </p>
          )}
        </form>
      </div>

      {notJoined.length > 0 && (
        <div className={styles.pendingCard}>
          <h3>Belum disertai</h3>
          <p>Subjek berikut belum dipautkan. Minta kod daripada guru anda untuk menyertai.</p>
          <ul className={styles.pendingChips}>
            {notJoined.map((c) => {
              const subject = subjectById(c.subjectId);
              return (
                <li key={c.subjectId} className={styles.pendingChip}>
                  <i aria-hidden="true" />
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
