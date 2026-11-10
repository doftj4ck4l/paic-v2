import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Flame, ListChecks, TrendingDown, TrendingUp, Minus, Users, Zap } from "lucide-react";
import { PageHeader, PageShell, Section } from "@/components/studio/shell";
import { Chip, ProgressBar } from "@/components/studio/ui";
import { ACHIEVEMENTS, SUBJECT_MASTERY, subjectById } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth-session";
import { listUserActivity } from "@/lib/attempts";
import { formatRelativeTime } from "@/lib/assignment-status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Kemajuan" };

export const dynamic = "force-dynamic";

const TREND_ICON = { up: TrendingUp, flat: Minus, down: TrendingDown } as const;
const TREND_CLASS = { up: "text-[#00786a]", flat: "text-muted-foreground", down: "text-[#b3383e]" } as const;

const ACTIVITY_ICONS = { quiz: ListChecks, assignment: ClipboardCheck } as const;

export default async function ProgressPage() {
  const student = await requireUser();

  if (student.role === "teacher") {
    return (
      <PageShell>
        <PageHeader
          title="Kemajuan"
          description="Pantau kemajuan pelajar anda melalui halaman Kelas."
        />
        <section className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-[#00786a]">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold">Kemajuan pelajar</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Tugasan selesai, percubaan kuiz dan aktiviti terakhir setiap pelajar ada di halaman Kelas — pilih kelas anda.
              </p>
            </div>
            <Link
              href="/classes"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-5 text-sm font-semibold text-white shadow-soft"
            >
              Buka Kelas <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const level = Math.floor(student.xp / student.xpPerLevel) + 1;
  const into = student.xp % student.xpPerLevel;
  const earned = ACHIEVEMENTS.filter((a) => a.earned).length;
  const activity = await listUserActivity(student.id, 4);

  return (
    <PageShell>
      <PageHeader
        title="Kemajuan saya"
        description="Tahap, penguasaan subjek dan rentetan pembelajaran anda — direkodkan daripada aktiviti sebenar."
        actions={
          <Chip tone="amber">
            <Flame className="size-3.5" aria-hidden="true" /> {student.streakDays} hari rentetan
          </Chip>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-[24px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#007a66] to-[#00856f] text-2xl font-extrabold text-white">
              {level}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-extrabold">Tahap {level}</h2>
                <span className="text-xs font-semibold text-muted-foreground">
                  {into}/{student.xpPerLevel} XP
                </span>
              </div>
              <ProgressBar value={(into / student.xpPerLevel) * 100} label="Kemajuan tahap" className="mt-2" />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="size-3.5 text-[#00b6a2]" aria-hidden="true" />
                {student.xpPerLevel - into} XP lagi ke Tahap {level + 1} · {student.xp} XP dikumpul
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Aktiviti terkini</h2>
            <Link href="/progress/history" className="text-xs font-semibold text-[#00786a] hover:underline">
              Lihat semua
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Belum ada aktiviti. Main kuiz dalam buku kerja anda untuk mula mengumpul XP.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? ListChecks;
                return (
                  <li key={item.id} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-[#00786a]">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.detail}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{formatRelativeTime(item.at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Section
        title="Penguasaan subjek"
        action={
          <Link href="/explore" className="text-xs font-semibold text-[#00786a] hover:underline">
            Latih topik lemah
          </Link>
        }
      >
        <div className="flex flex-col gap-3">
          {SUBJECT_MASTERY.map((m) => {
            const s = subjectById(m.subjectId);
            const Trend = TREND_ICON[m.trend];
            return (
              <Link
                key={m.subjectId}
                href={`/progress/subjects/${m.subjectId}`}
                className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <span className="w-28 shrink-0 truncate text-sm font-bold">{s.name}</span>
                <ProgressBar value={m.percent} label={`Penguasaan ${s.name}`} className="h-2.5 flex-1" />
                <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
                  {m.percent}%
                </span>
                <Trend className={cn("size-4 shrink-0", TREND_CLASS[m.trend])} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        title="Pencapaian"
        action={
          <Link href="/progress/achievements" className="inline-flex items-center gap-1 text-xs font-semibold text-[#00786a] hover:underline">
            Semua pencapaian <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <div className="rounded-[20px] border border-border bg-card p-4 shadow-soft">
          <p className="text-sm text-muted-foreground">
            {earned} daripada {ACHIEVEMENTS.length} pencapaian diperoleh. Teruskan belajar untuk
            membuka lagi!
          </p>
        </div>
      </Section>

      <Section
        title="Sejarah aktiviti"
        action={
          <Link href="/progress/history" className="inline-flex items-center gap-1 text-xs font-semibold text-[#00786a] hover:underline">
            Lihat semua <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Setiap percubaan kuiz dan tugasan yang diselesaikan direkodkan dalam sejarah aktiviti anda.
        </p>
      </Section>
    </PageShell>
  );
}
