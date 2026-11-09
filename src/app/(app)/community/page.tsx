import type { Metadata } from "next";
import content from "@/components/studio/content-width.module.css";
import { getDemoStudent } from "@/lib/demo-profile";
import { CommunityHub } from "./community-hub";
import styles from "./community.module.css";

export const metadata: Metadata = { title: "Komuniti" };

export default async function CommunityPage() {
  const student = await getDemoStudent();
  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <CommunityHub studentName={student.preferredName} streakDays={student.streakDays} level={student.level} />
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
