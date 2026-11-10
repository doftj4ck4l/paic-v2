import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./legal.module.css";

export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">&gt;&gt;</span>
          <span>
            <strong>Pixelspace</strong>
            <small>AI Classroom</small>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Pautan">
          <Link href="/privacy">Dasar Privasi</Link>
          <Link href="/terms">Terma Penggunaan</Link>
          <Link href="/">Kembali ke laman utama</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <article className={styles.article}>
          <span className={styles.eyebrow}>DOKUMEN RASMI</span>
          <h1>{title}</h1>
          <p className={styles.updated}>Dikemas kini: {updated}</p>
          <p className={styles.intro}>{intro}</p>
          {children}
        </article>
      </main>
      <footer className={styles.footer}>
        <p>© 2026 Pixelspace · <a href="mailto:hello@pixelspace.com.my">hello@pixelspace.com.my</a></p>
        <p className={styles.footerNote}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </footer>
    </div>
  );
}

export function LegalSection({ heading, points }: { heading: string; points: string[] }) {
  return (
    <section className={styles.section}>
      <h2>{heading}</h2>
      <ul>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
