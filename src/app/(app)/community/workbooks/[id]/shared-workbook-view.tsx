"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Copy,
  Flame,
  Headphones,
  Info,
  Layers,
  ListChecks,
  Network,
  NotebookPen,
  Presentation,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";
import { FollowButton } from "@/components/studio/follow-button";
import {
  CREATION_KIND_LABEL,
  communityLevel,
  communityStudentById,
  subjectById,
  type DemoSharedWorkbook,
} from "@/lib/demo-data";
import { toggleSubscribe, useSocial } from "@/lib/demo-social";
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
  const { subscribed, followed } = useSocial();
  const author = communityStudentById(workbook.authorId);
  const subject = subjectById(workbook.subjectId);
  const isSubscribed = subscribed.includes(workbook.id);
  const authorFollowed = followed.includes(author.id);

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
              <Link href={`/community/students/${author.id}`}>{author.name} · {author.className}</Link>
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
            <Users size={15} aria-hidden="true" />
            <strong>{workbook.subscribers + (isSubscribed ? 1 : 0)}</strong> pelanggan
          </span>
          <span className={styles.detailStat}>
            <Sparkles size={15} aria-hidden="true" />
            <strong>{workbook.modules.length}</strong> modul
          </span>
        </div>
      </section>

      <div className={styles.actionsRow}>
        <button
          type="button"
          onClick={() => toggleSubscribe(workbook.id)}
          aria-pressed={isSubscribed}
          data-subscribed={isSubscribed}
          className={styles.subscribeButton}
        >
          {isSubscribed ? "Dilanggan — ketuk untuk berhenti" : "Langgan buku kerja"}
        </button>
        {isSubscribed && workbook.yourStreak ? (
          <span className={styles.streakChip}>
            <Flame size={15} aria-hidden="true" /> {workbook.yourStreak} hari berturut belajar
          </span>
        ) : null}
        <button
          type="button"
          disabled
          title="Menyalin bahan komuniti disambung dalam Fasa 5"
          className={styles.copyButton}
        >
          <Copy size={15} aria-hidden="true" /> Salin ke buku kerja saya
        </button>
        <p className={styles.actionsNote}>
          <Info size={12} aria-hidden="true" />
          Langganan disimpan dalam demo ini sahaja. Buku kerja dilanggan muncul di halaman Buku Kerja
          anda (tab Langganan).
        </p>
      </div>

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
              {author.subscribers + (authorFollowed ? 1 : 0)} pelanggan
            </span>
          </div>
          <FollowButton studentId={author.id} size="small" />
        </div>
      </section>

      <p className={styles.privacyNote}>
        <Info size={12} aria-hidden="true" />
        Kandungan penuh modul dibuka selepas menyalin — ciri salin bahan komuniti disambung dalam Fasa 5.
      </p>
    </>
  );
}
