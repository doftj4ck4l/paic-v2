"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Check,
  ClipboardList,
  Flame,
  Headphones,
  Info,
  Layers,
  ListChecks,
  Network,
  NotebookPen,
  Presentation,
  Sparkles,
  UsersRound,
  Wand2,
  X,
} from "lucide-react";
import { FollowButton } from "@/components/studio/follow-button";
import {
  CREATION_KIND_LABEL,
  communityLevel,
  communityStudentById,
  subjectById,
  type DemoSharedWorkbook,
} from "@/lib/demo-data";
import { remixWorkbook, toggleSave, useSocial } from "@/lib/demo-social";
import styles from "../../community.module.css";

const MODULE_ICONS = {
  notes: NotebookPen,
  quizzes: ListChecks,
  flashcards: Layers,
  slides: Presentation,
  mindmaps: Network,
  audio: Headphones,
  "study-guides": ClipboardList,
} as const;

export function SharedWorkbookView({ workbook }: { workbook: DemoSharedWorkbook }) {
  const social = useSocial();
  const author = communityStudentById(workbook.authorId);
  const subject = subjectById(workbook.subjectId);
  const isSaved = social.saved.includes(workbook.id);
  const isRemixed = social.remixed.includes(workbook.id);
  const authorFollowed = social.followed.includes(author.id);
  const [remixOpen, setRemixOpen] = useState(false);

  useEffect(() => {
    if (!remixOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setRemixOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [remixOpen]);

  function confirmRemix() {
    remixWorkbook(workbook.id);
    setRemixOpen(false);
  }

  return (
    <>
      <div className={styles.topRow}>
        <Link href="/community" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> Komuniti
        </Link>
        <FollowButton studentId={author.id} />
      </div>

      <section className={styles.detailHero} aria-labelledby="shared-workbook-title">
        <span className={styles.detailArt}>
          <Image src={workbook.asset} alt="" width={1024} height={1024} />
        </span>
        <div className={styles.detailCopy}>
          <h1 id="shared-workbook-title">{workbook.title}</h1>
          <div className={styles.detailChips}>
            <span className={styles.detailChip}>
              <BookOpen size={13} aria-hidden="true" />
              {subject.name}
            </span>
            <span className={styles.detailChip}>
              <UsersRound size={13} aria-hidden="true" />
              <Link href={`/community/students/${author.id}`}>Oleh {author.name} · {author.className}</Link>
            </span>
            <span className={styles.detailChip}>
              <Flame size={13} aria-hidden="true" />
              Dikongsi {workbook.sharedAt}
            </span>
          </div>
          <p>{workbook.topic}</p>
        </div>
        <div className={styles.detailStats}>
          <span className={styles.detailStat}>
            <Bookmark size={15} aria-hidden="true" />
            <strong>{workbook.saves + (isSaved ? 1 : 0)}</strong> simpanan
          </span>
          <span className={styles.detailStat}>
            <Sparkles size={15} aria-hidden="true" />
            <strong>{workbook.modules.length}</strong> modul
          </span>
        </div>
      </section>

      <div className={styles.actionsRow}>
        {isRemixed ? (
          <Link href="/workbooks/kitaran-air" className={styles.subscribeButton}>
            <Wand2 size={16} aria-hidden="true" /> Buka versi saya
          </Link>
        ) : (
          <button type="button" onClick={() => setRemixOpen(true)} className={styles.subscribeButton}>
            <Wand2 size={16} aria-hidden="true" /> Buat versi saya
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleSave(workbook.id)}
          aria-pressed={isSaved}
          data-saved={isSaved}
          className={styles.saveToggle}
        >
          <Bookmark aria-hidden="true" />
          {isSaved ? "Disimpan" : "Simpan buku kerja"}
        </button>
        <p className={styles.actionsNote}>
          <Info size={12} aria-hidden="true" />
          <span>
            <strong>Buat versi saya</strong> menyalin bahan yang dibenarkan ke buku kerja peribadi anda dengan
            atribusi kepada {author.name}. Sembang AI dan kemajuan anda kekal berasingan.
          </span>
        </p>
      </div>

      {isRemixed && (
        <p className={styles.remixBanner}>
          <Check size={14} aria-hidden="true" />
          Versi anda telah dicipta — Diadaptasi daripada buku kerja oleh {author.name}.
        </p>
      )}

      <section className={styles.section} aria-labelledby="modules-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="modules-title">Apa ada dalam buku kerja ini</h2>
            <p>Modul AI yang dijana oleh {author.name} daripada sumber mereka.</p>
          </div>
        </div>
        <div className={styles.moduleChips}>
          {workbook.modules.map((kind) => {
            const Icon = MODULE_ICONS[kind];
            return (
              <span key={kind} className={styles.moduleChip}>
                <Icon size={15} aria-hidden="true" />
                {CREATION_KIND_LABEL[kind]}
              </span>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="author-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="author-title">Tentang penulis</h2>
          </div>
        </div>
        <div className={styles.authorCard}>
          <span className={styles.authorAvatar} aria-hidden="true">{author.name.slice(0, 1)}</span>
          <div className={styles.authorBody}>
            <strong>
              <Link href={`/community/students/${author.id}`}>{author.name}</Link>
            </strong>
            <span>
              {author.className} · Tahap {communityLevel(author.xp)} · Rentetan {author.streakDays} hari ·{" "}
              {author.subscribers + (authorFollowed ? 1 : 0)} pengikut
            </span>
          </div>
          <FollowButton studentId={author.id} size="small" />
        </div>
      </section>

      <p className={styles.privacyNote}>
        <Info size={12} aria-hidden="true" />
        Anda melihat penerbitan awam sahaja — dokumen peribadi, sembang AI dan bahan yang tidak dikongsi
        tidak dipaparkan di sini.
      </p>

      {/* Remix dialog */}
      {remixOpen && (
        <div className={styles.dialogBackdrop} role="dialog" aria-modal="true" aria-labelledby="remix-title">
          <button type="button" aria-label="Tutup" className={styles.dialogDismiss} onClick={() => setRemixOpen(false)} />
          <div className={styles.dialog}>
            <div className={styles.dialogHead}>
              <div>
                <h2 id="remix-title">Buat versi saya</h2>
                <p className={styles.dialogDesc}>
                  Cipta salinan peribadi daripada &quot;{workbook.title}&quot;. Anda boleh mengubah dan
                  menambah bahan sendiri.
                </p>
              </div>
              <button type="button" aria-label="Tutup dialog" className={styles.dialogClose} onClick={() => setRemixOpen(false)}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <ul className={styles.remixList}>
              <li><Check size={14} aria-hidden="true" /> {workbook.modules.length} modul yang dibenarkan disalin ke buku kerja anda</li>
              <li><Check size={14} aria-hidden="true" /> Atribusi &quot;Diadaptasi daripada buku kerja oleh {author.name}&quot; ditambah</li>
              <li><Check size={14} aria-hidden="true" /> Sembang AI, sumber peribadi dan kemajuan anda kekal berasingan</li>
              <li><Check size={14} aria-hidden="true" /> Versi anda peribadi — kongsi kemudian jika anda mahu</li>
            </ul>
            <p className={styles.dialogNote}>
              <Info size={12} aria-hidden="true" />
              Mod demo — versi dicipta dalam sesi ini sahaja dan dibuka dalam ruang kerja contoh.
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghostButton} onClick={() => setRemixOpen(false)}>Batal</button>
              <button type="button" className={styles.confirmButton} onClick={confirmRemix}>
                <Wand2 size={15} aria-hidden="true" /> Cipta versi saya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
