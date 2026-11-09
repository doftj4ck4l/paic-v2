"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, GraduationCap, Sparkles, Zap } from "lucide-react";
import { FollowButton } from "@/components/studio/follow-button";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import {
  communityLevel,
  sharedWorkbooksByAuthor,
  type DemoCommunityStudent,
} from "@/lib/demo-data";
import { useSocial } from "@/lib/demo-social";
import styles from "../../community.module.css";

const BADGE_ART = [
  "/assets/thiings/achievement-star.png",
  "/assets/thiings/achievement-medal.png",
  "/assets/thiings/achievement-trophy.png",
  "/assets/thiings/achievement-target.png",
];

type TabId = "buku-kerja" | "pencapaian";

export function StudentProfile({ student }: { student: DemoCommunityStudent }) {
  const social = useSocial();
  const [tab, setTab] = useState<TabId>("buku-kerja");
  const followed = social.followed.includes(student.id);
  const workbooks = sharedWorkbooksByAuthor(student.id);

  return (
    <>
      <div className={styles.topRow}>
        <Link href="/community" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> Komuniti
        </Link>
        <FollowButton studentId={student.id} />
      </div>

      <section className={styles.detailHero} aria-labelledby="student-title">
        <span className={styles.detailAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
        <div className={styles.detailCopy}>
          <h1 id="student-title">{student.name}</h1>
          <div className={styles.detailChips}>
            <span className={styles.detailChip}>
              <GraduationCap size={13} aria-hidden="true" />
              {student.className} · {student.yearLabel}
            </span>
            <span className={styles.detailChip}>
              <Flame size={13} aria-hidden="true" />
              Rentetan {student.streakDays} hari
            </span>
            <span className={styles.detailChip}>
              <Zap size={13} aria-hidden="true" />
              Tahap {communityLevel(student.xp)}
            </span>
          </div>
          <p>{student.bio}</p>
        </div>
        <div className={styles.detailStats}>
          <span className={styles.detailStat}>
            <Sparkles size={15} aria-hidden="true" />
            <strong>{student.subscribers + (followed ? 1 : 0)}</strong> pelanggan
          </span>
          <span className={styles.detailStat}>
            <GraduationCap size={15} aria-hidden="true" />
            <strong>{workbooks.length}</strong> buku kerja
          </span>
        </div>
      </section>

      <div className={styles.tabsWrap}>
        <div className={styles.tabs} role="group" aria-label="Bahagian profil">
          <button type="button" className={styles.tab} aria-pressed={tab === "buku-kerja"} onClick={() => setTab("buku-kerja")}>
            Buku kerja
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "pencapaian"} onClick={() => setTab("pencapaian")}>
            Pencapaian
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === "buku-kerja" &&
          (workbooks.length === 0 ? (
            <div className={styles.empty}>
              <Sparkles size={30} aria-hidden="true" />
              <h3>Belum ada buku kerja dikongsi</h3>
              <p>{student.name} belum berkongsi bahan dengan komuniti.</p>
            </div>
          ) : (
            <div className={styles.sharedGrid}>
              {workbooks.map((workbook) => (
                <SharedWorkbookTile key={workbook.id} workbook={workbook} />
              ))}
            </div>
          ))}

        {tab === "pencapaian" && (
          <div className={styles.badgeGrid}>
            {student.badges.map((badge, i) => (
              <div key={badge} className={styles.badgeCard}>
                <Image src={BADGE_ART[i % BADGE_ART.length]} alt="" width={92} height={92} />
                <div>
                  <strong>{badge}</strong>
                  <span>Pencapaian komuniti</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className={styles.privacyNote}>
        <Sparkles size={12} aria-hidden="true" />
        Profil komuniti menunjukkan nama pertama dan kelas sahaja — maklumat penuh dan rekod pembelajaran
        kekal peribadi.
      </p>
    </>
  );
}
