"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, LogOut, Settings, UserRound } from "lucide-react";
import { clearDemoLevelCookie } from "@/lib/demo-session";
import type { DemoStudent } from "@/lib/demo-profile";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Utama" },
  { href: "/pending/buku-kerja", label: "Buku Kerja" },
  { href: "/pending/jelajah", label: "Jelajah" },
  { href: "/pending/tugasan", label: "Tugasan" },
  { href: "/pending/kemajuan", label: "Kemajuan" },
];

export function LearningNav({ student }: { student: DemoStudent }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function signOut() {
    clearDemoLevelCookie();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-teal text-[13px] font-black text-white">
            &gt;&gt;
          </span>
          <span className="text-[15px] font-bold tracking-tight">Pixelspace</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "font-semibold text-teal"
                    : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span
            className="flex items-center gap-1.5 text-sm font-semibold"
            title={`Rentetan ${student.streakDays} hari`}
          >
            <Flame className="size-4 fill-teal text-teal" aria-hidden="true" />
            {student.streakDays} hari
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu akaun"
              className="grid size-8 place-items-center rounded-full bg-[#E7F6F4] text-sm font-bold text-teal ring-1 ring-border transition-shadow hover:ring-2 hover:ring-teal/40"
            >
              {student.preferredName.slice(0, 1)}
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Tutup menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg">
                  <div className="border-b border-border bg-secondary/60 px-4 py-3">
                    <p className="text-sm font-bold">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.yearLabel} · {student.className}
                    </p>
                  </div>
                  <div className="border-b border-border p-1.5 md:hidden">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/pending/profil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <UserRound className="size-4 text-muted-foreground" /> Profil
                    </Link>
                    <Link
                      href="/pending/tetapan"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <Settings className="size-4 text-muted-foreground" /> Tetapan
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" /> Log keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
