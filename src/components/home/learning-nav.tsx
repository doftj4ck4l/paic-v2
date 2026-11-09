"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronRight,
  Compass,
  Ellipsis,
  Flame,
  GraduationCap,
  House,
  ListChecks,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react";
import { clearDemoLevelCookie } from "@/lib/demo-session";
import type { DemoStudent } from "@/lib/demo-profile";
import { cn } from "@/lib/utils";
import styles from "./learning-nav.module.css";

const NAV_LINKS = [
  { href: "/", label: "Utama", icon: House },
  { href: "/workbooks", label: "Buku Kerja", icon: BookOpen },
  { href: "/subjects", label: "Subjek", icon: GraduationCap },
  { href: "/quizzes", label: "Kuiz", icon: ListChecks },
  { href: "/progress", label: "Kemajuan", icon: ChartNoAxesColumnIncreasing },
];

const MORE_LINKS = [
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/creations", label: "Hasil Karya", icon: Palette },
];

export function LearningNav({ student }: { student: DemoStudent }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const accountButton = useRef<HTMLButtonElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen && !moreOpen) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        accountButton.current?.focus();
      }
      if (moreOpen) {
        setMoreOpen(false);
        moreButton.current?.focus();
      }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen, moreOpen]);

  function signOut() {
    clearDemoLevelCookie();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const moreActive = MORE_LINKS.some((link) => isActive(link.href));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Pixelspace AI Classroom — Utama">
          <span className={styles.brandMark} aria-hidden="true"><ChevronRight /><ChevronRight /></span>
          <span>Pixelspace<small>AI Classroom</small></span>
        </Link>
        <nav className={styles.nav} aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={styles.navLink}>
              <span className={styles.navIcon}><link.icon aria-hidden="true" />{link.label === "Kuiz" && <i aria-hidden="true" />}</span>{link.label}
            </Link>
          ))}
          <div className={styles.more}>
            <button
              ref={moreButton}
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              aria-current={moreActive ? "page" : undefined}
              className={cn(styles.navLink, styles.moreButton)}
            >
              <span className={styles.navIcon}><Ellipsis aria-hidden="true" /></span>
              Lagi
              <ChevronDown className={styles.moreChevron} aria-hidden="true" />
            </button>
            {moreOpen && (
              <>
                <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setMoreOpen(false)} />
                <div id="more-menu" className={styles.moreMenu}>
                  {MORE_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMoreOpen(false)} aria-current={isActive(link.href) ? "page" : undefined}>
                      <link.icon size={17} aria-hidden="true" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>
        <div className={styles.utilities}>
          <span className={styles.streak} title={`Rentetan ${student.streakDays} hari`}><Flame aria-hidden="true" />{student.streakDays} hari</span>
          <Link href="/notifications" className={styles.notifications} aria-label="Pemberitahuan"><Bell aria-hidden="true" /><i aria-hidden="true" /></Link>
          <div className={styles.account}>
            <button ref={accountButton} type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="account-menu" aria-label="Menu akaun" className={styles.avatar}>{student.preferredName.slice(0, 1)}</button>
            {menuOpen && (
              <>
                <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setMenuOpen(false)} />
                <div id="account-menu" className={styles.menu}>
                  <div className={styles.menuProfile}><strong>{student.fullName}</strong><span>{student.yearLabel} · {student.className}</span></div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={17} />Profil</Link>
                  <Link href="/notifications" onClick={() => setMenuOpen(false)}><Bell size={17} />Pemberitahuan</Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)}><Settings size={17} />Tetapan</Link>
                  <button type="button" onClick={signOut}><LogOut size={17} />Log keluar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
