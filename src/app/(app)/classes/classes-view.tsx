"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/lib/auth-session";
import type { ClassSummary } from "@/lib/classes";
import { CopyCodeButton } from "./copy-code-button";
import styles from "./classes.module.css";
import content from "@/components/studio/content-width.module.css";

function CreateClassDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, formLevel }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
    if (!response?.ok || !payload?.id) {
      setError(payload?.error ?? "Kelas tidak dapat dicipta. Cuba lagi.");
      setBusy(false);
      return;
    }
    onCreated(payload.id);
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Kelas baharu"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
    >
      <div className={styles.dialogInner}>
        <button type="button" className={styles.closeDialog} aria-label="Tutup" onClick={onClose}><X size={17} /></button>
        <form className={styles.dialogBody} onSubmit={submit}>
          <h2>Kelas baharu</h2>
          <p>Pelajar di sekolah anda boleh menyertai kelas ini menggunakan kod unik yang dijana selepas kelas dicipta.</p>
          <div className={styles.field}>
            <label htmlFor="class-name">Nama kelas</label>
            <Input id="class-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: 4 Bestari" maxLength={60} required autoFocus />
          </div>
          <div className={styles.field}>
            <label htmlFor="class-form">Tahun / Tingkatan <small>(pilihan)</small></label>
            <Input id="class-form" value={formLevel} onChange={(event) => setFormLevel(event.target.value)} placeholder="Contoh: Tahun 4" maxLength={40} />
          </div>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.dialogActions}>
            <Button type="button" variant="white" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={busy || name.trim().length < 2}>{busy ? "Mencipta…" : "Cipta kelas"}</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function TeacherClasses({ classes }: { classes: ClassSummary[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <>
      {creating && <CreateClassDialog onClose={() => setCreating(false)} onCreated={(id) => router.push(`/classes/${id}`)} />}
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.titleRow}>
            <span className={styles.iconTile}><Image src="/assets/thiings/graduation.png" alt="" width={40} height={40} /></span>
            <h1>Kelas saya</h1>
          </div>
          <p>Cipta kelas, kongsikan kod sertai dengan pelajar anda, dan beri tugasan daripada buku kerja anda — semuanya di satu tempat.</p>
          <div className={styles.heroActions}>
            <Button onClick={() => setCreating(true)}><Plus />Kelas baharu</Button>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <Image src="/assets/thiings/backpack.png" alt="" width={150} height={150} />
        </div>
      </div>

      <section className={styles.section} aria-label="Senarai kelas">
        <div className={styles.sectionHead}>
          <h2>Senarai kelas</h2>
          <span>{classes.length} kelas</span>
        </div>
        {classes.length === 0 ? (
          <div className={styles.empty}>
            <h3>Belum ada kelas</h3>
            <p>Cipta kelas pertama anda, kemudian kongsikan kod sertai kepada pelajar.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {classes.map((item) => (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}><Link href={`/classes/${item.id}`}>{item.name}</Link></h3>
                  {item.formLevel && <span className={styles.chip}>{item.formLevel}</span>}
                </div>
                <div className={styles.cardMeta}>
                  <span><strong>{item.memberCount}</strong> pelajar</span>
                </div>
                {item.joinCode && (
                  <div className={styles.codeRow}>
                    <span className={styles.codeLabel}>Kod</span>
                    <span className={styles.code}>{item.joinCode}</span>
                    <CopyCodeButton code={item.joinCode} />
                  </div>
                )}
                <div className={styles.cardActions}>
                  <Link href={`/classes/${item.id}`} className={styles.cardLink}>Urus kelas <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StudentClasses({ classes }: { classes: ClassSummary[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
    if (!response?.ok || !payload?.id) {
      setError(payload?.error ?? "Kelas tidak dapat disertai. Cuba lagi.");
      setBusy(false);
      return;
    }
    router.push(`/classes/${payload.id}`);
  }

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.titleRow}>
            <span className={styles.iconTile}><Image src="/assets/thiings/graduation.png" alt="" width={40} height={40} /></span>
            <h1>Kelas saya</h1>
          </div>
          <p>Sertai kelas cikgu anda dengan kod yang diberikan, dan lihat tugasan serta bahan pembelajaran di sini.</p>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <Image src="/assets/thiings/backpack.png" alt="" width={150} height={150} />
        </div>
      </div>

      <section className={styles.section} aria-label="Sertai kelas">
        <form className={styles.joinCard} onSubmit={join}>
          <h2>Sertai kelas baharu</h2>
          <p>Masukkan kod kelas daripada cikgu anda (contoh: BESTAR).</p>
          <div className={styles.joinRow}>
            <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="KOD KELAS" maxLength={12} aria-label="Kod kelas" />
            <Button type="submit" disabled={busy || code.trim().length < 4}>{busy ? "Menyertai…" : "Sertai"}</Button>
          </div>
          {error && <p className={styles.formError} role="alert">{error}</p>}
        </form>
      </section>

      <section className={styles.section} aria-label="Kelas disertai">
        <div className={styles.sectionHead}>
          <h2>Kelas disertai</h2>
          <span>{classes.length} kelas</span>
        </div>
        {classes.length === 0 ? (
          <div className={styles.empty}>
            <h3>Belum menyertai kelas</h3>
            <p>Minta kod kelas daripada cikgu anda, kemudian masukkannya di atas.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {classes.map((item) => (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}><Link href={`/classes/${item.id}`}>{item.name}</Link></h3>
                  {item.formLevel && <span className={styles.chip}>{item.formLevel}</span>}
                </div>
                <div className={styles.cardMeta}>
                  <span>Cikgu <strong>{item.teacherName}</strong></span>
                  <span><strong>{item.memberCount}</strong> pelajar</span>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/classes/${item.id}`} className={styles.cardLink}>Buka kelas <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function ClassesView({ user, classes }: { user: SessionUser; classes: ClassSummary[] }) {
  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        {user.role === "teacher" ? <TeacherClasses classes={classes} /> : <StudentClasses classes={classes} />}
        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
