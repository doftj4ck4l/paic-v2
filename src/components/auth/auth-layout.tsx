import Link from "next/link";
import Image from "next/image";
import { ChartNoAxesCombined, ChevronRight, Layers, Sparkles } from "lucide-react";
import styles from "./auth-layout.module.css";

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Pixelspace AI Classroom — Utama">
      <span className={styles.brandMark} aria-hidden="true"><ChevronRight /><ChevronRight /></span>
      <span>Pixelspace<span className={styles.brandSubtitle}>AI Classroom</span></span>
      <Sparkles className={styles.brandSparkle} aria-hidden="true" />
    </Link>
  );
}

function PaperPlane() {
  return (
    <svg className={styles.paperPlane} viewBox="0 0 270 150" fill="none" aria-hidden="true">
      <path d="M15 124C-20 77 47 28 78 63c39 45-44 98-47 57M87 108c29 16 53-1 72-29" stroke="#8a79cf" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 9" />
      <path d="m161 30 103-22-40 66-23-27-17 22 4-33Z" fill="#a380ff" />
      <path d="m188 36 76-28-63 39-17 22Z" fill="#7854d1" />
      <path d="m161 30 103-22-76 28Z" fill="#d0b9ff" />
      <path d="m201 47 63-39-40 66Z" fill="#b798ff" />
    </svg>
  );
}

/**
 * Shared auth layout — the exact login-page design used by every auth page
 * (login, register, forgot password, reset password). Pass `header` to render
 * a custom (e.g. interactive) heading instead of the default title/subtitle.
 */
export function AuthLayout({
  title,
  subtitle,
  header,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.story} aria-labelledby="auth-story-title">
          <Brand />
          <PaperPlane />
          <div className={styles.storyContent}>
            <h2 id="auth-story-title">Belajar jadi<br />lebih <span className={styles.highlight}>seronok<i aria-hidden="true" /></span><br />bersama AI.</h2>
            <p className={styles.storyDescription}>Ruang pembelajaran AI untuk murid sekolah<br className={styles.desktopBreak} /> rendah dan menengah.</p>
            <ul className={styles.features}>
              <li><span className={styles.featureIcon}><Sparkles /></span><div><h3>Buku kerja pintar</h3><p>Belajar dengan bantuan AI</p></div></li>
              <li><span className={styles.featureIcon}><Layers /></span><div><h3>Kuiz, kad imbas &amp; slaid</h3><p>Cipta bahan ulang kaji dengan mudah</p></div></li>
              <li><span className={styles.featureIcon}><ChartNoAxesCombined /></span><div><h3>Pantau kemajuan</h3><p>Lihat perkembangan pembelajaran anda</p></div></li>
            </ul>
          </div>
          <div className={styles.scene} aria-hidden="true">
            <span className={styles.heroBlob} />
            <Image src="/assets/login/ai-backpack.png" alt="" width={1280} height={1280} loading="eager" className={styles.mascot} sizes="(max-width: 1000px) 230px, 480px" />
            <span className={styles.heroRays}><i /><i /></span>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.mobileBrand}><Brand /></div>
          <div className={styles.formContent}>
            <span className={styles.cardRays} aria-hidden="true"><i /><i /><i /></span>
            {header ?? (
              <>
                <h1>{title}</h1>
                <p className={styles.formSubtitle}>{subtitle}</p>
              </>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
