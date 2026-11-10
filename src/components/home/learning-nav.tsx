"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Compass,
  Flame,
  House,
  LogOut,
  Palette,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/auth-session";
import styles from "./learning-nav.module.css";

const NAV_LINKS = [
  { href: "/home", label: "Utama", icon: House },
  { href: "/workbooks", label: "Buku Kerja", icon: BookOpen },
  { href: "/classes", label: "Kelas", icon: Users },
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/creations", label: "Hasil Karya", icon: Palette },
];

export function LearningNav({ student, unreadCount = 0 }: { student: SessionUser; unreadCount?: number }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      accountButton.current?.focus();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  async function signOut() {
    await authClient.signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload required so the client router cannot replay the signed-out redirect cache
    window.location.assign("/login");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
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
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={styles.navLink}>
              <span className={styles.navIcon}><link.icon aria-hidden="true" /></span>{link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.utilities}>
          <span className={styles.streak} title={`Rentetan ${student.streakDays} hari`}><Flame aria-hidden="true" />{student.streakDays} hari</span>
          <Link href="/notifications" className={styles.notifications} aria-label={unreadCount > 0 ? `Pemberitahuan — ${unreadCount} belum dibaca` : "Pemberitahuan"}><Bell aria-hidden="true" />{unreadCount > 0 && <i aria-hidden="true" />}</Link>
          <div className={styles.account}>
            <button ref={accountButton} type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="account-menu" aria-label="Menu akaun" className={styles.avatar}>{student.preferredName.slice(0, 1)}</button>
            {menuOpen && (
              <>
                <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setMenuOpen(false)} />
                <div id="account-menu" className={styles.menu}>
                  <div className={styles.menuProfile}><strong>{student.fullName}</strong><span>{student.role === "teacher" ? `Cikgu · ${student.school}` : `${student.yearLabel} · ${student.className}`}</span></div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={17} />Profil</Link>
                  <Link href="/progress" onClick={() => setMenuOpen(false)} aria-current={isActive("/progress") ? "page" : undefined}><ChartNoAxesColumnIncreasing size={17} />Kemajuan</Link>
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
