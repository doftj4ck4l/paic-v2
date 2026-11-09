import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ListChecks } from "lucide-react";
import content from "@/components/studio/content-width.module.css";
import { SUBJECTS, WORKBOOKS, quizzesForSubject, subjectClassById } from "@/lib/demo-data";
import { SubjectTabs } from "./subject-tabs";
import styles from "../subjects.module.css";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ id: s.id }));
}

export default async function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) {
    // notFound() handled by pages; keep layout safe
    return null;
  }
  const klass = subjectClassById(subject.id);
  const workbookCount = WORKBOOKS.filter((w) => w.subjectId === subject.id).length;
  const quizCount = quizzesForSubject(subject.id).length;

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <Link href="/subjects" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> Subjek saya
        </Link>

        <section className={styles.detailHero} data-subject={subject.id} aria-labelledby="subject-title">
          <span className={styles.detailArt}>
            <Image src={subject.asset} alt="" width={66} height={66} />
          </span>
          <div className={styles.detailCopy}>
            <h1 id="subject-title">{subject.name}</h1>
            <div className={styles.detailChips}>
              <span className={styles.detailChip}>{klass.teacherName}</span>
              <span className={styles.detailChip}>{klass.className}</span>
            </div>
            <p>{subject.blurb} · {klass.schedule} · {klass.room}</p>
          </div>
          <div className={styles.detailStats}>
            <span className={styles.detailStat}>
              <BookOpen size={16} aria-hidden="true" />
              <strong>{workbookCount}</strong> buku kerja
            </span>
            <span className={styles.detailStat}>
              <ListChecks size={16} aria-hidden="true" />
              <strong>{quizCount}</strong> kuiz
            </span>
          </div>
        </section>

        <SubjectTabs subjectId={subject.id} />

        <div className={styles.content}>{children}</div>

        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
