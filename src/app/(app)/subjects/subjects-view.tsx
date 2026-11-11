"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, Check, Copy, Plus, Users, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectPortalProvider } from "@/components/ui/select";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import type { SessionUser } from "@/lib/auth-session";
import type { ClassSummary } from "@/lib/classes";
import { SUBJECTS, findSubject } from "@/lib/demo-data";
import styles from "./classes.module.css";
import content from "@/components/studio/content-width.module.css";

function CodeChip({ code, itemId, copiedId, onCopy }: { code: string; itemId: string; copiedId: string | null; onCopy: (id: string, code: string) => void }) {
  const copied = copiedId === itemId;
  return (
    <button
      type="button"
      className={styles.codeChip}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCopy(itemId, code);
      }}
      aria-label={`Salin kod ${code}`}
    >
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {code}
    </button>
  );
}

function SubjectTile({
  item,
  isTeacher,
  copiedId,
  onCopy,
}: {
  item: ClassSummary;
  isTeacher: boolean;
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}) {
  const subject = findSubject(item.subjectId);
  const Icon = ((item.subjectId && (SUBJECT_ICONS as Record<string, LucideIcon>)[item.subjectId]) || Users) as LucideIcon;
  return (
    <ContentTile
      href={`/subjects/${item.id}`}
      tint={subject?.id ?? "science"}
      art={subject?.asset ?? "/assets/thiings/graduation.png"}
      badge={<><Icon size={13} aria-hidden="true" /> {subject?.name ?? "Subjek"}</>}
      title={item.name}
      description={`${item.formLevel ? `${item.formLevel} · ` : ""}${item.memberCount} pelajar`}
      footer={<strong>{item.workbookCount} buku kerja</strong>}
      footerEnd={
        isTeacher && item.joinCode ? (
          <CodeChip code={item.joinCode} itemId={item.id} copiedId={copiedId} onCopy={onCopy} />
        ) : (
          <span>Cikgu {item.teacherName}</span>
        )
      }
    />
  );
}

function CreateClassDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [formLevel, setFormLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);

  const attach = useCallback((element: HTMLDialogElement | null) => { ref.current = element; setContainer(element); }, []);

  function pickSubject(next: string) {
    setSubjectId(next);
    if (!name.trim()) {
      const subject = findSubject(next);
      if (subject) setName(`${subject.name} ${formLevel}`.trim());
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !subjectId) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, formLevel, subjectId }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
    if (!response?.ok || !payload?.id) {
      setError(payload?.error ?? "Subjek tidak dapat dicipta. Cuba lagi.");
      setBusy(false);
      return;
    }
    onCreated(payload.id);
  }

  return (
    <dialog
      ref={attach}
      className={styles.dialog}
      aria-label="Subjek baharu"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
    >
      <div className={styles.dialogInner}>
        <button type="button" className={styles.closeDialog} aria-label="Tutup" onClick={onClose}><X size={17} /></button>
        <SelectPortalProvider container={container}>
        <form className={styles.dialogBody} onSubmit={submit}>
          <h2>Subjek baharu</h2>
          <p>Pelajar di sekolah anda menyertai subjek ini menggunakan kod unik yang dijana selepas ia dicipta.</p>
          <div className={styles.field}>
            <label htmlFor="subject-pick">Subjek</label>
            <Select
              id="subject-pick"
              value={subjectId}
              onValueChange={pickSubject}
              options={SUBJECTS.map((subject) => ({ value: subject.id, label: subject.name }))}
              placeholder="Pilih subjek"
              ariaLabel="Subjek"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="class-name">Nama subjek</label>
            <Input id="class-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Sains 4 Bestari" maxLength={60} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="class-form">Tahun / Tingkatan <small>(pilihan)</small></label>
            <Input id="class-form" value={formLevel} onChange={(event) => setFormLevel(event.target.value)} placeholder="Contoh: Tahun 4" maxLength={40} />
          </div>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.dialogActions}>
            <Button type="button" variant="white" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={busy || !subjectId || name.trim().length < 2}>{busy ? "Mencipta…" : "Cipta subjek"}</Button>
          </div>
        </form>
        </SelectPortalProvider>
      </div>
    </dialog>
  );
}

export function SubjectsView({ user, subjects }: { user: SessionUser; subjects: ClassSummary[] }) {
  const router = useRouter();
  const isTeacher = user.role === "teacher";
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code).catch(() => null);
    setCopiedId(id);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedId(null), 1800);
  }

  const totalMembers = subjects.reduce((sum, item) => sum + item.memberCount, 0);

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        {creating && <CreateClassDialog onClose={() => setCreating(false)} onCreated={(id) => router.push(`/subjects/${id}`)} />}

        <section className={styles.hero} aria-labelledby="subjects-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Users size={14} aria-hidden="true" /> RUANG {isTeacher ? "PENGAJARAN" : "PEMBELAJARAN"} ANDA</span>
            <h1 id="subjects-title">
              {isTeacher ? <>Urus subjek,<br /><span>ajar lebih mudah.</span></> : <>Sertai subjek,<br /><span>belajar lebih seronok.</span></>}
            </h1>
            <p>
              {isTeacher
                ? "Cipta subjek, kongsikan kod sertai dengan pelajar dan tugaskan buku kerja — semuanya di satu tempat."
                : "Masukkan kod daripada cikgu anda untuk menyertai subjek, kemudian buka buku kerja dan tugasan di sini."}
            </p>
            <div className={styles.heroActions}>
              {isTeacher ? (
                <button type="button" className={styles.primaryButton} onClick={() => setCreating(true)}>
                  <Plus size={17} aria-hidden="true" /> Subjek baharu
                </button>
              ) : (
                <a href="#join-subject" className={styles.primaryButton}>
                  Sertai subjek <ArrowDown size={17} aria-hidden="true" />
                </a>
              )}
              <Link href="/workbooks" className={styles.secondaryButton}>
                Buku kerja saya <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artBlob} />
            <span className={styles.orbit} />
            <Image src="/assets/thiings/graduation.png" alt="" width={270} height={270} loading="eager" className={styles.globe} />
            <span className={styles.rocket}><Image src="/assets/thiings/welcome-rocket.png" alt="" width={100} height={100} /></span>
            <span className={styles.books}><Image src="/assets/thiings/books.png" alt="" width={100} height={100} /></span>
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
            <span className={styles.subjectNote}><Users size={16} /><strong>{subjects.length} subjek</strong><span>{isTeacher ? "dicipta" : "disertai"}</span></span>
            <span className={styles.topicNote}><strong>{totalMembers}</strong> pelajar {isTeacher ? "menyertai" : "bersama anda"}</span>
          </div>
        </section>

        {!isTeacher && (
          <section className={styles.joinSection} id="join-subject" aria-label="Sertai subjek">
            <form className={styles.joinCard} onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const code = (new FormData(form).get("code") as string) ?? "";
              if (code.trim().length < 4) return;
              setJoinBusy(true);
              setJoinError(null);
              const response = await fetch("/api/subjects/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              }).catch(() => null);
              const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
              if (!response?.ok || !payload?.id) {
                setJoinError(payload?.error ?? "Subjek tidak dapat disertai. Cuba lagi.");
                setJoinBusy(false);
                return;
              }
              router.push(`/subjects/${payload.id}`);
            }}>
              <h2>Sertai subjek baharu</h2>
              <p>Masukkan kod subjek daripada cikgu anda (contoh: BESTAR).</p>
              <div className={styles.joinRow}>
                <Input name="code" placeholder="KOD SUBJEK" maxLength={12} aria-label="Kod subjek" />
                <Button type="submit" disabled={joinBusy}>{joinBusy ? "Menyertai…" : "Sertai"}</Button>
              </div>
              {joinError && <p className={styles.formError} role="alert">{joinError}</p>}
            </form>
          </section>
        )}

        <section className={styles.subjectsSection} aria-label="Senarai subjek">
          <div className={styles.sectionHeading}>
            <div>
              <h2>Senarai subjek</h2>
              <p>{isTeacher ? "Subjek yang anda ajar dan kongsikan dengan pelajar." : "Subjek yang anda sertai bersama cikgu anda."}</p>
            </div>
            <span className={styles.resultCount}>{subjects.length} subjek</span>
          </div>
          {subjects.length === 0 ? (
            <div className={styles.empty}>
              <h3>{isTeacher ? "Belum ada subjek" : "Belum menyertai subjek"}</h3>
              <p>
                {isTeacher
                  ? "Cipta subjek pertama anda, kemudian kongsikan kod sertai kepada pelajar."
                  : "Minta kod subjek daripada cikgu anda, kemudian masukkannya di atas."}
              </p>
            </div>
          ) : (
            <div className={styles.subjectGrid}>
              {subjects.map((item) => (
                <SubjectTile key={item.id} item={item} isTeacher={isTeacher} copiedId={copiedId} onCopy={copyCode} />
              ))}
            </div>
          )}
        </section>

        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
