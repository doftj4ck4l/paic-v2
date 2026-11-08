"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, ChartNoAxesColumnIncreasing, ChevronRight, ClipboardList, Compass, Flame, House, LogOut, Settings, UserRound } from "lucide-react";
import { clearDemoLevelCookie } from "@/lib/demo-session";
import type { DemoStudent } from "@/lib/demo-profile";
import styles from "./learning-nav.module.css";

const NAV_LINKS = [
  { href: "/", label: "Utama", icon: House },
  { href: "/pending/buku-kerja", label: "Buku Kerja", icon: BookOpen },
  { href: "/pending/jelajah", label: "Jelajah", icon: Compass },
  { href: "/pending/tugasan", label: "Tugasan", icon: ClipboardList },
  { href: "/pending/kemajuan", label: "Kemajuan", icon: ChartNoAxesColumnIncreasing },
];

export function LearningNav({ student }: { student: DemoStudent }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setMenuOpen(false); accountButton.current?.focus(); }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  function signOut() {
    clearDemoLevelCookie();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Pixelspace AI Classroom — Utama">
          <span className={styles.brandMark} aria-hidden="true"><ChevronRight /><ChevronRight /></span>
          <span>Pixelspace<small>AI Classroom</small></span>
        </Link>
        <nav className={styles.nav} aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={styles.navLink}>
              <span className={styles.navIcon}><link.icon aria-hidden="true" />{link.label === "Tugasan" && <i aria-hidden="true" />}</span>{link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.utilities}>
          <span className={styles.streak} title={`Rentetan ${student.streakDays} hari`}><Flame aria-hidden="true" />{student.streakDays} hari</span>
          <Link href="/pending/pengumuman" className={styles.notifications} aria-label="Pengumuman sekolah"><Bell aria-hidden="true" /><i aria-hidden="true" /></Link>
          <div className={styles.account}>
            <button ref={accountButton} type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="account-menu" aria-label="Menu akaun" className={styles.avatar}>{student.preferredName.slice(0, 1)}</button>
            {menuOpen && (
              <>
                <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setMenuOpen(false)} />
                <div id="account-menu" className={styles.menu}>
                  <div className={styles.menuProfile}><strong>{student.fullName}</strong><span>{student.yearLabel} · {student.className}</span></div>
                  <Link href="/pending/profil" onClick={() => setMenuOpen(false)}><UserRound size={17} />Profil</Link>
                  <Link href="/pending/tetapan" onClick={() => setMenuOpen(false)}><Settings size={17} />Tetapan</Link>
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
