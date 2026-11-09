"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Heart,
  Search,
  Share2,
  Sparkles,
  Trophy,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { StreakPath } from "@/components/studio/streak-path";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import { FollowButton } from "@/components/studio/follow-button";
import {
  COMMUNITY_FEED,
  COMMUNITY_STUDENTS,
  SHARED_WORKBOOKS,
  WEEK_STREAK,
  WORKBOOKS,
  communityLevel,
  communityStudentById,
  sharedWorkbooksByAuthor,
  subjectById,
  type DemoSharedWorkbook,
} from "@/lib/demo-data";
import { toggleLike, useSocial } from "@/lib/demo-social";
import styles from "./community.module.css";

type TabId = "suapan" | "pelajar" | "buku-kerja";

type FeedKind = "shared" | "streak" | "achievement" | "update" | "you";

type FeedEntry = {
  id: string;
  name: string;
  action: string;
  time: string;
  kind: FeedKind;
  likes: number;
  you?: boolean;
  studentId?: string;
  href?: string;
  linkLabel?: string;
  linkMeta?: string;
  art?: string;
  tint?: string;
};

const KIND_ICON = { shared: Share2, streak: Flame, achievement: Trophy, update: Sparkles, you: Share2 } as const;
const KIND_LABEL = { shared: "Berkongsi", streak: "Rentetan", achievement: "Pencapaian", update: "Kemas kini", you: "Kiriman anda" } as const;

function dayLabel(time: string) {
  if (time.includes("jam") || time.includes("Baru")) return "Hari ini";
  if (time === "Semalam") return "Semalam";
  return "Beberapa hari lalu";
}

export function CommunityHub({ studentName, streakDays }: { studentName: string; streakDays: number }) {
  const social = useSocial();
  const [tab, setTab] = useState<TabId>("suapan");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const own: FeedEntry[] = social.shared
      .map((id) => WORKBOOKS.find((w) => w.id === id))
      .filter((w): w is NonNullable<typeof w> => !!w)
      .map((w) => ({
        id: `you-${w.id}`,
        name: "Anda",
        action: "berkongsi buku kerja",
        time: "Baru sahaja",
        kind: "you",
        likes: 0,
        you: true,
        href: `/workbooks/${w.id}`,
        linkLabel: w.title,
        linkMeta: `${subjectById(w.subjectId).name} · buku kerja anda`,
        art: subjectById(w.subjectId).asset,
        tint: w.subjectId,
      }));
    const feed: FeedEntry[] = COMMUNITY_FEED.map((item) => {
      const student = communityStudentById(item.studentId);
      const workbook = item.workbookId ? SHARED_WORKBOOKS.find((w) => w.id === item.workbookId) : undefined;
      return {
        id: item.id,
        name: student.name,
        action: item.action,
        time: item.time,
        kind: item.kind,
        likes: item.likes,
        studentId: student.id,
        href: workbook ? `/community/workbooks/${workbook.id}` : undefined,
        linkLabel: workbook?.title,
        linkMeta: workbook ? `${subjectById(workbook.subjectId).name} · oleh ${student.name}` : undefined,
        art: workbook?.asset,
        tint: workbook?.subjectId,
      };
    });
    const entries = [...own, ...feed];
    const order = ["Hari ini", "Semalam", "Beberapa hari lalu"];
    const map = new Map<string, FeedEntry[]>();
    for (const entry of entries) {
      const label = dayLabel(entry.time);
      map.set(label, [...(map.get(label) ?? []), entry]);
    }
    return order.filter((label) => map.has(label)).map((label) => ({ label, items: map.get(label)! }));
  }, [social.shared]);

  const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
  const students = COMMUNITY_STUDENTS.filter((s) =>
    words.every((word) => `${s.name} ${s.className} ${s.yearLabel}`.toLocaleLowerCase("ms").includes(word)),
  );

  function goTo(next: TabId) {
    setTab(next);
    document.getElementById("komuniti-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="community-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <UsersRound size={14} aria-hidden="true" /> KOMUNITI PIXELSPACE
          </span>
          <h1 id="community-title">
            Belajar bersama
            <br />
            <span>rakan sekelas.</span>
          </h1>
          <p>
            Ikut rakan, langgan buku kerja mereka dan bina rentetan belajar bersama. Setiap bahan
            dikongsi oleh pelajar sebenar di sekolah anda.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={() => goTo("pelajar")}>
              Cari pelajar <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link href="/workbooks" className={styles.secondaryButton}>
              Kongsi buku kerja <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <span className={styles.artBlob} />
          <span className={styles.orbit} />
          <Image src="/assets/thiings/idea.png" alt="" width={1024} height={1024} loading="eager" className={styles.mainArt} />
          <span className={styles.booksSticker}>
            <Image src="/assets/thiings/books.png" alt="" width={64} height={64} />
          </span>
          <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
          <span className={styles.streakCard}>
            <StreakPath days={WEEK_STREAK} streakDays={streakDays} />
          </span>
          <span className={styles.followNote}>
            <UsersRound size={16} />
            <strong>{social.followed.length} rakan</strong>
            <span>diikuti oleh {studentName}</span>
          </span>
        </div>
      </section>

      <div className={styles.tabsWrap} id="komuniti-tabs">
        <div className={styles.tabs} role="group" aria-label="Bahagian komuniti">
          <button type="button" className={styles.tab} aria-pressed={tab === "suapan"} onClick={() => setTab("suapan")}>
            Suapan
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "pelajar"} onClick={() => setTab("pelajar")}>
            Pelajar
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "buku-kerja"} onClick={() => setTab("buku-kerja")}>
            Buku kerja
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === "suapan" && (
          <div className={styles.feedWrap}>
            {groups.map((group) => (
              <section key={group.label} className={styles.feedGroup} aria-label={group.label}>
                <div className={styles.feedDay}>
                  <span>{group.label}</span>
                  <i aria-hidden="true" />
                </div>
                <ul className={styles.feedList}>
                  {group.items.map((entry) => {
                    const liked = social.liked.includes(entry.id);
                    const KindIcon = KIND_ICON[entry.kind];
                    return (
                      <li key={entry.id} className={styles.feedItem} data-kind={entry.kind} data-you={entry.you}>
                        <span className={styles.feedAvatar} data-you={entry.you} data-student={entry.studentId} aria-hidden="true">
                          {entry.name.slice(0, 1)}
                          <span className={styles.feedKindBadge} data-kind={entry.kind}>
                            <KindIcon aria-hidden="true" />
                          </span>
                        </span>
                        <div className={styles.feedBody}>
                          <span className={styles.feedType} data-kind={entry.kind}>
                            <KindIcon aria-hidden="true" />
                            {KIND_LABEL[entry.kind]}
                          </span>
                          <p>
                            <strong>{entry.name}</strong> {entry.action}
                            {entry.linkLabel ? ":" : ""}
                          </p>
                          {entry.href && entry.linkLabel && (
                            <Link href={entry.href} className={styles.feedLink}>
                              {entry.art && (
                                <span className={styles.feedThumb} data-tint={entry.tint}>
                                  <Image src={entry.art} alt="" width={64} height={64} />
                                </span>
                              )}
                              <span className={styles.feedLinkBody}>
                                <strong>{entry.linkLabel}</strong>
                                {entry.linkMeta && <span>{entry.linkMeta}</span>}
                              </span>
                              <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                        <div className={styles.feedAside}>
                          <span className={styles.feedTime}>{entry.time}</span>
                          <button
                            type="button"
                            onClick={() => toggleLike(entry.id)}
                            aria-pressed={liked}
                            data-liked={liked}
                            aria-label={`Suka kiriman ${entry.name}`}
                            className={styles.feedLike}
                          >
                            <Heart aria-hidden="true" />
                            {entry.likes + (liked ? 1 : 0)}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === "pelajar" && (
          <section aria-label="Cari pelajar">
            <div className={styles.studentSearch}>
              <Search size={18} aria-hidden="true" />
              <label htmlFor="community-search" className={styles.srOnly}>Cari pelajar</label>
              <input
                id="community-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau kelas…"
                autoComplete="off"
              />
              {query && (
                <button type="button" aria-label="Kosongkan carian" onClick={() => setQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
            {students.length === 0 ? (
              <div className={styles.empty}>
                <Search size={30} aria-hidden="true" />
                <h3>Tiada pelajar sepadan</h3>
                <p>Cuba nama atau kelas yang lain.</p>
              </div>
            ) : (
              <div className={styles.studentGrid}>
                {students.map((student) => {
                  const followed = social.followed.includes(student.id);
                  const sharedCount = sharedWorkbooksByAuthor(student.id).length;
                  return (
                    <article key={student.id} className={styles.studentCard}>
                      <div className={styles.studentTop}>
                        <span className={styles.studentAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
                        <div>
                          <h3>
                            <Link href={`/community/students/${student.id}`}>{student.name}</Link>
                          </h3>
                          <p>{student.className} · {student.yearLabel}</p>
                        </div>
                      </div>
                      <div className={styles.studentMeta}>
                        <span data-flame><Flame aria-hidden="true" />{student.streakDays} hari</span>
                        <span><Zap aria-hidden="true" />Tahap {communityLevel(student.xp)}</span>
                        <span><BookOpen aria-hidden="true" />{sharedCount} buku kerja</span>
                      </div>
                      <div className={styles.studentFooter}>
                        <span>{student.subscribers + (followed ? 1 : 0)} pelanggan</span>
                        <FollowButton studentId={student.id} size="small" />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "buku-kerja" && (
          <section aria-label="Buku kerja komuniti">
            <div className={styles.sharedGrid}>
              {SHARED_WORKBOOKS.map((workbook: DemoSharedWorkbook) => (
                <SharedWorkbookTile key={workbook.id} workbook={workbook} />
              ))}
            </div>
          </section>
        )}
      </div>

      <p className={styles.privacyNote}>
        <Sparkles size={12} aria-hidden="true" />
        Komuniti menunjukkan nama pertama dan kelas sahaja. Buku kerja hanya kelihatan selepas pelajar
        berkongsi secara terbuka.
      </p>
    </>
  );
}
