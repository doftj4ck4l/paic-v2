import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, GraduationCap, ListChecks, Users } from "lucide-react";
import { ContentTile } from "@/components/studio/content-tile";
import content from "@/components/studio/content-width.module.css";
import {
  SUBJECT_CLASSES,
  WORKBOOKS,
  joinedSubjectClasses,
  quizzesForSubject,
  subjectById,
} from "@/lib/demo-data";
import { JoinSubjectForm } from "./join-subject-form";
import styles from "./subjects.module.css";

export const metadata: Metadata = { title: "Subjek" };

export default function SubjectsPage() {
  const joined = joinedSubjectClasses();

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <section className={styles.hero} aria-labelledby="subjects-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><GraduationCap size={14} aria-hidden="true" /> RUANG KELAS ANDA</span>
            <h1 id="subjects-title">Belajar bersama<br /><span>guru anda.</span></h1>
            <p>Semua buku kerja, kuiz dan bahan daripada guru kelas anda — dikumpulkan mengikut subjek.</p>
            <div className={styles.heroActions}>
              <a href="#join" className={styles.primaryButton}>Sertai subjek <ArrowDown size={17} aria-hidden="true" /></a>
              <Link href="/workbooks" className={styles.secondaryButton}>Buku kerja saya <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artBlob} />
            <span className={styles.orbit} />
            <Image src="/assets/thiings/graduation.png" alt="" width={210} height={210} loading="eager" className={styles.graduation} />
            <span className={styles.backpack}><Image src="/assets/thiings/backpack.png" alt="" width={68} height={68} /></span>
            <span className={styles.books}><Image src="/assets/thiings/books.png" alt="" width={72} height={72} /></span>
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
            <span className={styles.subjectNote}><GraduationCap size={16} /><strong>{SUBJECT_CLASSES.length} subjek</strong><span>di sekolah anda</span></span>
            <span className={styles.joinedNote}><strong>{joined.length}</strong> disertai <ArrowRight size={14} /></span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="joined-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="joined-title">Subjek yang disertai</h2>
              <p>Ketik subjek untuk melihat bahan dan kuiz guru.</p>
            </div>
            <span className={styles.countPill}>{joined.length} subjek</span>
          </div>
          <div className={styles.classGrid}>
            {joined.map((klass) => {
              const subject = subjectById(klass.subjectId);
              const workbookCount = WORKBOOKS.filter((w) => w.subjectId === klass.subjectId).length;
              const quizCount = quizzesForSubject(klass.subjectId).length;
              return (
                <ContentTile
                  key={klass.subjectId}
                  href={`/subjects/${klass.subjectId}`}
                  tint={klass.subjectId}
                  art={subject.asset}
                  badge={<><GraduationCap size={14} aria-hidden="true" />{klass.teacherName} · {klass.className}</>}
                  title={subject.name}
                  description={subject.blurb}
                  footer={
                    <>
                      <span><BookOpen size={13} aria-hidden="true" />{workbookCount} buku kerja</span>
                      <span><ListChecks size={13} aria-hidden="true" />{quizCount} kuiz</span>
                      <span><Users size={13} aria-hidden="true" />{klass.studentCount}</span>
                    </>
                  }
                  footerEnd={<ArrowRight size={16} className={styles.classArrow} aria-hidden="true" />}
                />
              );
            })}
          </div>
        </section>

        <section className={styles.section} id="join" aria-labelledby="join-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="join-title">Sertai subjek baharu</h2>
              <p>Masukkan kod subjek daripada guru anda untuk mengakses bahan mereka.</p>
            </div>
          </div>
          <JoinSubjectForm />
        </section>

        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
