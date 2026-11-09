import type { Metadata } from "next";
import { notFound } from "next/navigation";
import content from "@/components/studio/content-width.module.css";
import { COMMUNITY_STUDENTS } from "@/lib/demo-data";
import { StudentProfile } from "./student-profile";
import styles from "../../community.module.css";

export function generateStaticParams() {
  return COMMUNITY_STUDENTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const student = COMMUNITY_STUDENTS.find((s) => s.id === id);
  return { title: student ? `${student.name} — Komuniti` : "Pelajar — Komuniti" };
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = COMMUNITY_STUDENTS.find((s) => s.id === id);
  if (!student) notFound();

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <StudentProfile student={student} />
        <p className={styles.attribution}>
          3D icons by{" "}
          <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">
            Thiings
          </a>
        </p>
      </main>
    </div>
  );
}
