import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Languages, LockKeyhole, Bell, CircleHelp } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";

export const metadata: Metadata = { title: "Tetapan" };

const SECTIONS = [
  { href: "/settings/security", label: "Keselamatan", detail: "Kata laluan dan sesi aktif", icon: LockKeyhole },
  { href: "/settings/preferences", label: "Keutamaan", detail: "Bahasa, gerakan dan pemberitahuan", icon: Languages },
  { href: "/notifications", label: "Pemberitahuan", detail: "Tugasan, kelas dan penjanaan", icon: Bell },
  { href: "/help", label: "Bantuan", detail: "Soalan lazim dan sokongan", icon: CircleHelp },
];

export default function SettingsPage() {
  return (
    <PageShell className="max-w-[680px]">
      <PageHeader title="Tetapan" description="Urus keselamatan, bahasa dan keutamaan pembelajaran anda." />
      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3.5 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <s.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{s.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{s.detail}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
