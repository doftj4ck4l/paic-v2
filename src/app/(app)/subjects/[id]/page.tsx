import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Megaphone, Sparkles } from "lucide-react";
import {
  SUBJECT_MASTERY,
  WORKBOOKS,
  announcementsForSubject,
  quizzesForSubject,
  subjectById,
  subjectClassById,
} from "@/lib/demo-data";
import { QuizCard } from "./quiz-card";
import styles from "../subjects.module.css";

export default async function SubjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const subject = subjectById(klass.subjectId);
  const quizzes = quizzesForSubject(klass.subjectId);
  const announcements = announcementsForSubject(klass.subjectId);
  const workbooks = WORKBOOKS.filter((w) => w.subjectId === klass.subjectId);
  const mastery = SUBJECT_MASTERY.find((m) => m.subjectId === klass.subjectId);
  const latest = announcements[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {latest && (
        <section aria-labelledby="announce-title">
          <div className={styles.panelHeading}>
            <div>
              <h2 id="announce-title">Pengumuman terkini</h2>
              <p>Daripada {latest.author}</p>
            </div>
            <Link href={`/subjects/${klass.subjectId}/announcements`} className={styles.textLink}>
              Semua pengumuman <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <article className={styles.announceCard}>
            <p className={styles.announceMeta}>
              <Megaphone size={14} aria-hidden="true" />
              {latest.author} · {latest.time}
            </p>
            <h3>{latest.title}</h3>
            <p>{latest.body}</p>
          </article>
        </section>
      )}

      {quizzes.length > 0 && (
        <section aria-labelledby="quizzes-title">
          <div className={styles.panelHeading}>
            <div>
              <h2 id="quizzes-title">Kuiz untuk anda</h2>
              <p>Disediakan oleh {klass.teacherName} — dijana AI daripada sumber buku kerja.</p>
            </div>
            <Link href={`/subjects/${klass.subjectId}/quizzes`} className={styles.textLink}>
              Lihat semua <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.quizGrid}>
            {quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        </section>
      )}

      {workbooks.length > 0 && (
        <section aria-labelledby="workbooks-title">
          <div className={styles.panelHeading}>
            <div>
              <h2 id="workbooks-title">Buku kerja guru</h2>
              <p>Bahan pembelajaran yang dikongsi untuk subjek ini.</p>
            </div>
            <Link href={`/subjects/${klass.subjectId}/workbooks`} className={styles.textLink}>
              Lihat semua <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.workbookRows}>
            {workbooks.slice(0, 3).map((w) => (
              <Link key={w.id} href={`/workbooks/${w.id}`} className={styles.workbookRow}>
                <span className={styles.workbookRowArt}>
                  <Image src={subject.asset} alt="" width={34} height={34} />
                </span>
                <span className={styles.workbookRowBody}>
                  <strong>{w.title}</strong>
                  <span>{w.topic} · {w.teacherName}</span>
                  <span className={styles.progressTrack} aria-hidden="true">
                    <span style={{ width: `${w.progress}%` }} />
                  </span>
                </span>
                <span className={styles.workbookRowPercent}>{w.progress}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {mastery && (
        <section className={styles.panelCard} aria-labelledby="mastery-title">
          <h2 id="mastery-title"><Sparkles size={16} aria-hidden="true" /> Penguasaan subjek</h2>
          <p>
            Penguasaan anda kini <strong>{mastery.percent}%</strong>. Lihat topik mana yang perlu
            diulang kaji, kemudian mula latihan tambahan.
          </p>
          <p style={{ marginTop: 12 }}>
            <Link href={`/progress/subjects/${klass.subjectId}`} className={styles.textLink}>
              Buka kemajuan subjek <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
