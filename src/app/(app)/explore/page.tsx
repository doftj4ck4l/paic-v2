import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Compass } from "lucide-react";
import { SUBJECTS, TOPICS } from "@/lib/demo-data";
import content from "@/components/studio/content-width.module.css";
import { Explorer } from "./explorer";
import styles from "./explore.module.css";

export const metadata: Metadata = { title: "Jelajah" };

export default function ExplorePage() {
  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <section className={styles.hero} aria-labelledby="explore-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Compass size={14} aria-hidden="true" /> RUANG PENEMUAN ANDA</span>
            <h1 id="explore-title">Jelajah dunia<br /><span>pembelajaran.</span></h1>
            <p>Ikut rasa ingin tahu anda. Temui topik baharu, teroka subjek kegemaran dan belajar dengan cara anda sendiri.</p>
            <div className={styles.heroActions}>
              <a href="#explore-library" className={styles.primaryButton}>Mula menjelajah <ArrowDown size={17} aria-hidden="true" /></a>
              <Link href="/workbooks" className={styles.secondaryButton}>Buku kerja saya <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artBlob} />
            <span className={styles.orbit} />
            <Image src="/assets/thiings/subject-geography.png" alt="" width={270} height={270} loading="eager" className={styles.globe} />
            <span className={styles.rocket}><Image src="/assets/thiings/welcome-rocket.png" alt="" width={100} height={100} /></span>
            <span className={styles.books}><Image src="/assets/thiings/books.png" alt="" width={100} height={100} /></span>
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
            <span className={styles.subjectNote}><Compass size={16} /><strong>{SUBJECTS.length} subjek</strong><span>untuk diteroka</span></span>
            <span className={styles.topicNote}><strong>{TOPICS.length}</strong> topik pembelajaran <ArrowRight size={14} /></span>
          </div>
        </section>
        <Explorer />
        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
