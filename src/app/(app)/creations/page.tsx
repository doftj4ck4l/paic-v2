import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import content from "@/components/studio/content-width.module.css";
import { CREATIONS } from "@/lib/demo-data";
import { CreationsLibrary } from "./creations-library";
import styles from "./creations.module.css";

export const metadata: Metadata = { title: "Hasil Karya" };

export default function CreationsPage() {
  const readyCount = CREATIONS.filter((c) => c.status === "ready").length;

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <section className={styles.hero} aria-labelledby="creations-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" /> HASIL PEMBELAJARAN AI</span>
            <h1 id="creations-title">Karya AI anda,<br /><span>tersusun kemas.</span></h1>
            <p>Nota, kuiz, kad imbas, slaid, peta minda dan audio — semuanya dijana daripada sumber buku kerja anda.</p>
            <div className={styles.heroActions}>
              <Link href="/workbooks/kitaran-air/studio" className={styles.primaryButton}>Jana bahan baharu <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link href="/workbooks" className={styles.secondaryButton}>Buku kerja saya <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artBlob} />
            <span className={styles.orbit} />
            <Image src="/assets/thiings/tool-notes.png" alt="" width={195} height={195} loading="eager" className={styles.notesArt} />
            <span className={styles.slidesSticker}><Image src="/assets/thiings/tool-slides.png" alt="" width={66} height={66} /></span>
            <span className={styles.quizSticker}><Image src="/assets/thiings/tool-quiz.png" alt="" width={68} height={68} /></span>
            <span className={styles.audioSticker}><Image src="/assets/thiings/tool-audio.png" alt="" width={50} height={50} /></span>
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
            <span className={styles.itemsNote}><Sparkles size={16} /><strong>{CREATIONS.length} bahan</strong><span>dijana AI</span></span>
            <span className={styles.aiNote}><strong>{readyCount}</strong> sedia dibuka <ArrowRight size={14} /></span>
          </div>
        </section>
        <CreationsLibrary />
        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
