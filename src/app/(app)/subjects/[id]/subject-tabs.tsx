"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../subjects.module.css";

export function SubjectTabs({ subjectId }: { subjectId: string }) {
  const pathname = usePathname();
  const items = [
    { href: `/subjects/${subjectId}`, label: "Ringkasan" },
    { href: `/subjects/${subjectId}/workbooks`, label: "Buku Kerja" },
    { href: `/subjects/${subjectId}/quizzes`, label: "Kuiz" },
    { href: `/subjects/${subjectId}/materials`, label: "Bahan" },
    { href: `/subjects/${subjectId}/announcements`, label: "Pengumuman" },
  ];
  return (
    <nav className={styles.tabs} aria-label="Sub-navigasi subjek">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={styles.tab}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
