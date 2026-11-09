import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChartNoAxesColumnIncreasing, Check, ListChecks, Play, Search, Sparkles, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth-session";
import { ACHIEVEMENTS, QUIZZES, SUBJECTS, WORKBOOKS, subjectById } from "@/lib/demo-data";
import styles from "./home.module.css";
import content from "@/components/studio/content-width.module.css";

export const metadata: Metadata = { title: "Utama" };

const ACHIEVEMENT_ASSETS = {
  star: "/assets/thiings/achievement-star.png",
  medal: "/assets/thiings/achievement-medal.png",
  trophy: "/assets/thiings/achievement-trophy.png",
  target: "/assets/thiings/achievement-target.png",
  crown: "/assets/thiings/subject-history.png",
};

export default async function HomePage() {
  const student = await requireUser();
  const workbook = WORKBOOKS[0];
  const subject = subjectById(workbook.subjectId);
  const level = Math.floor(student.xp / student.xpPerLevel) + 1;
  const into = student.xp % student.xpPerLevel;

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <section className={styles.hero} aria-labelledby="welcome-title">
          <div className={styles.heroCopy}>
            <span className={styles.classBadge}>{student.yearLabel} · {student.className}</span>
            <h1 id="welcome-title">Selamat kembali,<br /><span className={styles.name}>{student.preferredName}!</span> <span className={styles.wave} role="img" aria-label="Hai">👋</span></h1>
            <p>Teruskan pengembaraan pembelajaran anda dengan bantuan AI, buku kerja pintar dan aktiviti interaktif.</p>
            <div className={styles.heroActions}>
              <Link href="/workbooks" className={styles.primaryButton}><span className={styles.playIcon}><Play size={13} fill="currentColor" /></span>Sambung belajar <ArrowRight size={18} /></Link>
              <Link href="#tanya-pixel-ai" className={styles.secondaryButton}><Sparkles size={23} />Tanya Pixel AI</Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.heroBlob} />
            <Image src="/assets/home/reading-robot.png" alt="" width={1536} height={1024} loading="eager" sizes="(max-width: 600px) 340px, (max-width: 900px) 420px, 560px" className={styles.robot} />
          </div>
        </section>

        <section className={styles.learningRow} aria-label="Sambung pembelajaran">
          <article className={styles.continueCard}>
            <div className={styles.waterArt} aria-hidden="true"><Image src="/assets/home/water-cycle.png" alt="" width={1280} height={1280} sizes="170px" /></div>
            <div className={styles.workbookContent}>
              <p className={styles.eyebrow}>SAMBUNG BELAJAR</p>
              <h2>{workbook.title}</h2>
              <p className={styles.workbookDescription}>{subject.name} · {workbook.topic}</p>
              <div className={styles.progressRow}>
                <div className={styles.progressTrack} role="progressbar" aria-label={`Kemajuan ${workbook.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={workbook.progress}><span style={{ width: `${workbook.progress}%` }} /></div>
                <strong>{workbook.progress}%</strong>
              </div>
              <Link href="/workbooks" className={styles.continueButton}>Teruskan <ArrowRight size={17} /></Link>
            </div>
          </article>

          <section className={styles.aiCard} id="tanya-pixel-ai" aria-labelledby="ai-title">
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={76} height={76} className={styles.aiStar} />
            <h2 id="ai-title"><Sparkles size={29} />Tanya Pixel AI</h2>
            <p>Dapatkan bantuan, penerangan atau<br className={styles.desktopBreak} /> idea aktiviti untuk semua subjek.</p>
            <form action="/workbooks/kitaran-air" method="get" className={styles.aiForm}>
              <Search size={20} aria-hidden="true" />
              <label htmlFor="ai-question" className={styles.srOnly}>Soalan untuk Pixel AI</label>
              <input id="ai-question" name="soalan" placeholder="Tanya apa-apa…" required maxLength={1000} />
              <button type="submit" aria-label="Hantar soalan"><ArrowRight size={23} /></button>
            </form>
          </section>
        </section>

        <section className={styles.subjects} aria-labelledby="subjects-title">
          <div className={styles.sectionHeading}>
            <div><h2 id="subjects-title">Jelajah subjek</h2><p>Pilih subjek untuk melihat buku kerja, aktiviti dan bahan AI.</p></div>
            <Link href="/explore" className={styles.textLink}>Semua subjek <ArrowRight size={17} /></Link>
          </div>
          <div className={styles.subjectGrid}>
            {SUBJECTS.map((item) => (
              <Link key={item.id} href={`/explore/subjects/${item.id}`} className={styles.subjectCard} data-subject={item.id}>
                <Image src={item.asset} alt="" width={95} height={95} className={styles.subjectIcon} />
                <h3>{item.name}</h3><p>{item.workbookCount} buku kerja</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.summaryRow} aria-label="Kuiz dan kemajuan">
          <section className={styles.summaryCard} aria-labelledby="assignments-title">
            <div className={styles.cardHeading}><h2 id="assignments-title"><ListChecks />Kuiz</h2></div>
            <div className={styles.assignments}>
              {QUIZZES.map((quiz) => (
                <Link key={quiz.id} href={quiz.status === "done" ? `/quizzes/${quiz.id}/hasil` : `/quizzes/${quiz.id}`} className={styles.assignment}>
                  <span className={styles.assignmentState} data-status={quiz.status} aria-hidden="true">{quiz.status === "done" && <Check size={16} />}{quiz.status === "in-progress" && <span />}</span>
                  <span className={styles.assignmentText}><strong>{quiz.title}</strong><span>{quiz.due} · {quiz.teacherName}</span></span>
                  <span className={styles.statusBadge} data-tone={quiz.status === "new" ? "today" : quiz.status === "in-progress" ? "soon" : "done"}>{quiz.score ?? (quiz.status === "new" ? "Baharu" : "Dalam proses")}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.summaryCard} aria-labelledby="progress-title">
            <div className={styles.cardHeading}><h2 id="progress-title"><ChartNoAxesColumnIncreasing />Kemajuan saya</h2><Link href="/progress" className={styles.textLink}>Butiran <ArrowRight size={16} /></Link></div>
            <div className={styles.levelRow}>
              <span className={styles.trophy}><Image src="/assets/thiings/achievement-trophy.png" alt="" width={56} height={56} /></span>
              <div className={styles.levelContent}>
                <div className={styles.levelHeading}><h3>Tahap {level}</h3><span>{into} / {student.xpPerLevel} XP</span></div>
                <div className={styles.progressTrack} role="progressbar" aria-label={`Kemajuan ke Tahap ${level + 1}`} aria-valuemin={0} aria-valuemax={student.xpPerLevel} aria-valuenow={into}><span style={{ width: `${(into / student.xpPerLevel) * 100}%` }} /></div>
                <p><Zap size={13} />{student.xpPerLevel - into} XP lagi ke Tahap {level + 1}</p>
              </div>
            </div>
            <div className={styles.achievements} aria-label="Pencapaian">
              {ACHIEVEMENTS.map((achievement) => (
                <Link key={achievement.id} href="/progress" className={styles.achievement} data-earned={achievement.earned} aria-label={`${achievement.label} — ${achievement.earned ? "Diperoleh" : "Belum diperoleh"}: ${achievement.detail}`} title={`${achievement.label} · ${achievement.detail}`}>
                  <Image src={ACHIEVEMENT_ASSETS[achievement.icon]} alt="" width={48} height={48} />
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
