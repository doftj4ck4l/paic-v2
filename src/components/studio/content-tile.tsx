import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calculator, Crown, FlaskConical, Globe, MessageCircle } from "lucide-react";
import type { SubjectId } from "@/lib/demo-data";
import styles from "./content-tile.module.css";

export const SUBJECT_ICONS = {
  math: Calculator,
  science: FlaskConical,
  language: BookOpen,
  english: MessageCircle,
  history: Crown,
  geography: Globe,
} satisfies Record<SubjectId, typeof Calculator>;

type ContentTileProps = {
  href?: string;
  tint: string;
  art: string;
  badge: ReactNode;
  menu?: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
  footerEnd?: ReactNode;
  progress?: { value: number; label: string };
  className?: string;
};

export function ContentTile({ href, tint, art, badge, menu, title, description, footer, footerEnd, progress, className }: ContentTileProps) {
  const inner = (
    <>
      <div className={styles.cover} data-part="cover">
        <svg className={styles.wave} viewBox="0 0 460 105" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30C75-10 106 115 206 63S333-18 381 51s64 59 79 50v25H0Z" fill="currentColor" /></svg>
        <span className={styles.badge} data-part="badge">{badge}</span>
        <Image src={art} alt="" width={1024} height={1024} sizes="(max-width: 600px) 150px, 132px" className={styles.art} data-part="art" />
        <span className={styles.rays} aria-hidden="true" data-part="rays"><i /><i /></span>
      </div>
      <div className={styles.body} data-part="body">
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
        {(footer || footerEnd) && (
          <div className={styles.footer} data-part="footer">
            <span className={styles.footerStart}>{footer}</span>
            {footerEnd && <span className={styles.footerEnd}>{footerEnd}</span>}
          </div>
        )}
        {progress && (
          <div className={styles.progressTrack} role="progressbar" aria-label={progress.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.value}>
            <span style={{ width: `${progress.value}%` }} />
          </div>
        )}
      </div>
    </>
  );

  return (
    <article className={className ? `${styles.tile} ${className}` : styles.tile} data-tint={tint}>
      {href ? (
        <Link href={href} className={styles.link} data-part="link">{inner}</Link>
      ) : (
        <div className={styles.link} data-part="link">{inner}</div>
      )}
      {menu && <div className={styles.menuSlot} data-part="menu">{menu}</div>}
    </article>
  );
}
