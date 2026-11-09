"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  Flame,
  GraduationCap,
  Heart,
  Share2,
  Sparkles,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import { StreakPath } from "@/components/studio/streak-path";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import { FollowButton } from "@/components/studio/follow-button";
import {
  COMMUNITY_CLUBS,
  COMMUNITY_FEED,
  COMMUNITY_STUDENTS,
  SHARED_WORKBOOKS,
  SUBJECTS,
  WEEK_STREAK,
  WORKBOOKS,
  communityLevel,
  communityStudentById,
  subjectById,
  type SubjectId,
} from "@/lib/demo-data";
import { toggleClub, toggleLike, useSocial } from "@/lib/demo-social";
import styles from "./community.module.css";

type TabId = "untuk-anda" | "popular" | "subjek" | "kelab" | "disimpan";

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

export function CommunityHub({
  studentName,
  streakDays,
  level,
}: {
  studentName: string;
  streakDays: number;
  level: "primary" | "secondary";
}) {
  const social = useSocial();
  const [tab, setTab] = useState<TabId>("untuk-anda");
  const [subject, setSubject] = useState<SubjectId | "all">("all");

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

  const featured = SHARED_WORKBOOKS.filter((w) => w.featured);
  const popularCreators = [...COMMUNITY_STUDENTS].sort((a, b) => b.subscribers - a.subscribers).slice(0, 3);
  const popularWorkbooks = [...SHARED_WORKBOOKS].sort((a, b) => b.saves - a.saves);
  const subjectWorkbooks = subject === "all" ? SHARED_WORKBOOKS : SHARED_WORKBOOKS.filter((w) => w.subjectId === subject);
  const savedWorkbooks = SHARED_WORKBOOKS.filter((w) => social.saved.includes(w.id));
  const followedStudents = COMMUNITY_STUDENTS.filter((s) => social.followed.includes(s.id));

  function goTo(next: TabId) {
    setTab(next);
    document.getElementById("komuniti-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="community-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>
              <UsersRound size={14} aria-hidden="true" /> KOMUNITI PIXELSPACE
            </span>
            <span className={styles.levelChip}>
              <GraduationCap size={13} aria-hidden="true" />
              {level === "primary" ? "Rendah" : "Menengah"}
            </span>
          </div>
          <h1 id="community-title">
            Belajar lebih seronok
            <br />
            <span>bersama!</span>
          </h1>
          <p>Temui buku kerja menarik, sertai kelab dan kongsi hasil pembelajaran anda.</p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={() => goTo("popular")}>
              Terokai komuniti <ArrowRight size={17} aria-hidden="true" />
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
          <button type="button" className={styles.tab} aria-pressed={tab === "untuk-anda"} onClick={() => setTab("untuk-anda")}>
            Untuk Anda
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "popular"} onClick={() => setTab("popular")}>
            Popular
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "subjek"} onClick={() => setTab("subjek")}>
            Subjek
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "kelab"} onClick={() => setTab("kelab")}>
            Kelab
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "disimpan"} onClick={() => setTab("disimpan")}>
            Disimpan
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === "untuk-anda" && (
          <div className={styles.stack}>
            <section aria-labelledby="featured-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="featured-title">Buku kerja pilihan minggu ini</h2>
                  <p>Dipilih oleh komuniti — ketuk Simpan untuk simpan ke koleksi anda.</p>
                </div>
                <button type="button" className={styles.textLink} onClick={() => goTo("popular")}>
                  Lihat semua <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.sharedGrid}>
                {featured.map((workbook) => (
                  <SharedWorkbookTile key={workbook.id} workbook={workbook} />
                ))}
              </div>
            </section>

            <section aria-labelledby="feed-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="feed-title">Suapan komuniti</h2>
                  <p>Aktiviti terkini daripada rakan dan pencipta yang anda ikuti.</p>
                </div>
              </div>
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
            </section>
          </div>
        )}

        {tab === "popular" && (
          <div className={styles.stack}>
            <section aria-labelledby="creators-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="creators-title">Pencipta popular</h2>
                  <p>Pelajar yang paling banyak dikuti kerana bahan pembelajaran mereka.</p>
                </div>
              </div>
              <div className={styles.studentGrid}>
                {popularCreators.map((student) => {
                  const followed = social.followed.includes(student.id);
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
                        <span><BookOpen aria-hidden="true" />{student.badges.length} lencana</span>
                      </div>
                      <div className={styles.studentFooter}>
                        <span>{student.subscribers + (followed ? 1 : 0)} pengikut</span>
                        <FollowButton studentId={student.id} size="small" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="popular-workbooks-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="popular-workbooks-title">Buku kerja paling disimpan</h2>
                  <p>Bahan yang paling banyak membantu pelajar lain.</p>
                </div>
              </div>
              <div className={styles.sharedGrid}>
                {popularWorkbooks.map((workbook) => (
                  <SharedWorkbookTile key={workbook.id} workbook={workbook} />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "subjek" && (
          <div className={styles.stack}>
            <section aria-label="Tapis mengikut subjek">
              <div className={styles.tabs} role="group" aria-label="Subjek komuniti">
                <button type="button" className={styles.tab} aria-pressed={subject === "all"} onClick={() => setSubject("all")}>
                  Semua
                </button>
                {SUBJECTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.tab}
                    aria-pressed={subject === item.id}
                    onClick={() => setSubject(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </section>
            {subjectWorkbooks.length === 0 ? (
              <div className={styles.empty}>
                <BookOpen size={30} aria-hidden="true" />
                <h3>Tiada buku kerja untuk subjek ini lagi</h3>
                <p>Jadilah yang pertama berkongsi bahan {subjectById(subject as SubjectId).name}!</p>
                <Link href="/workbooks">Kongsi buku kerja</Link>
              </div>
            ) : (
              <div className={styles.sharedGrid}>
                {subjectWorkbooks.map((workbook) => (
                  <SharedWorkbookTile key={workbook.id} workbook={workbook} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "kelab" && (
          <div className={styles.clubGrid}>
            {COMMUNITY_CLUBS.map((club) => {
              const joined = social.clubs.includes(club.id);
              const subjectInfo = subjectById(club.subjectId);
              return (
                <article key={club.id} className={styles.clubCard}>
                  <div className={styles.clubTop}>
                    <span className={styles.clubArt} aria-hidden="true">
                      <Image src={club.art} alt="" width={1024} height={1024} />
                    </span>
                    <div>
                      <h3>{club.name}</h3>
                      <p>{subjectInfo.name} · {club.members + (joined ? 1 : 0)} ahli</p>
                    </div>
                  </div>
                  <p className={styles.clubDesc}>{club.description}</p>
                  <div className={styles.clubFooter}>
                    <span className={styles.clubActivity}>
                      <Sparkles size={12} aria-hidden="true" />
                      {club.activity}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleClub(club.id)}
                      aria-pressed={joined}
                      data-joined={joined}
                      className={styles.clubJoin}
                    >
                      {joined ? <><Check size={13} aria-hidden="true" />Ahli</> : "Sertai"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "disimpan" && (
          <div className={styles.stack}>
            {followedStudents.length > 0 && (
              <section aria-labelledby="followed-title">
                <div className={styles.sectionHeading}>
                  <div>
                    <h2 id="followed-title">Pencipta diikuti</h2>
                    <p>Bahan baharu daripada mereka akan muncul di Suapan anda.</p>
                  </div>
                </div>
                <ul className={styles.followStrip}>
                  {followedStudents.map((student) => (
                    <li key={student.id}>
                      <Link href={`/community/students/${student.id}`}>
                        <span className={styles.followAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
                        <span>
                          <strong>{student.name}</strong>
                          <span>{student.className}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section aria-labelledby="saved-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="saved-title">Buku kerja disimpan</h2>
                  <p>Koleksi peribadi anda — hanya anda yang melihat senarai ini.</p>
                </div>
              </div>
              {savedWorkbooks.length === 0 ? (
                <div className={styles.empty}>
                  <Bookmark size={30} aria-hidden="true" />
                  <h3>Belum ada simpanan</h3>
                  <p>Terokai buku kerja komuniti dan ketuk ikon simpan pada mana-mana kad.</p>
                  <button type="button" onClick={() => goTo("popular")}>Terokai komuniti</button>
                </div>
              ) : (
                <div className={styles.sharedGrid}>
                  {savedWorkbooks.map((workbook) => (
                    <SharedWorkbookTile key={workbook.id} workbook={workbook} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <p className={styles.privacyNote}>
        <Sparkles size={12} aria-hidden="true" />
        Komuniti menunjukkan nama paparan dan kelas sahaja. Bahan peribadi dan sembang AI tidak pernah
        dipaparkan tanpa kebenaran.
      </p>
    </>
  );
}
