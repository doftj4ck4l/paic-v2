import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Flame, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Object3D } from "@/components/learning/object3d";
import { LearningNav } from "@/components/home/learning-nav";
import { getDemoStudent } from "@/lib/demo-profile";
import {
  ASSIGNMENTS,
  SUBJECTS,
  WORKBOOKS,
  subjectById,
  type TintColor,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Utama" };

const SUBJECT_TINT: Record<TintColor, string> = {
  amber: "bg-[#FFFBEB]",
  teal: "bg-[#E7F6F4]",
  orange: "bg-[#FFF4ED]",
  blue: "bg-[#EFF6FF]",
  white: "bg-[#EEF2FF]",
  cream: "bg-[#F7FEE7]",
};

const STATUS_CHIP: Record<string, string> = {
  today: "bg-[#FEF3C7] text-[#92400E]",
  soon: "bg-secondary text-muted-foreground",
  done: "bg-[#E7F6F4] text-teal",
};

const WEEK_BARS = [
  { h: 40, color: "bg-teal" },
  { h: 65, color: "bg-lilac" },
  { h: 30, color: "bg-lime" },
  { h: 80, color: "bg-teal" },
  { h: 55, color: "bg-lilac" },
  { h: 95, color: "bg-teal" },
  { h: 35, color: "bg-lime" },
];

export default async function HomePage() {
  const student = await getDemoStudent();
  const continueWorkbook = WORKBOOKS[0];
  const continueSubject = subjectById(continueWorkbook.subjectId);
  const level = Math.floor(student.xp / student.xpPerLevel) + 1;
  const into = student.xp % student.xpPerLevel;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LearningNav student={student} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 lg:gap-12 lg:px-6 lg:py-10">
        {/* 1. Welcome */}
        <section className="relative overflow-hidden rounded-3xl bg-[#E7F6F4] px-6 py-8 lg:px-12 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-teal shadow-soft">
                {student.yearLabel} · {student.className}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight lg:text-5xl">
                Selamat kembali, {student.preferredName}!
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground lg:text-base">
                Teruskan pengembaraan pembelajaran anda — buku kerja pintar, kuiz dan tutor AI
                dalam satu tempat.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/pending/buku-kerja">
                    Sambung belajar <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="white" size="lg" className="border border-border shadow-soft">
                  <Link href="/pending/jelajah">Jelajah topik</Link>
                </Button>
              </div>
            </div>

            {/* Floating 3D composition */}
            <div aria-hidden="true" className="relative hidden h-64 sm:block lg:h-80">
              <span className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 lg:size-72" />
              <Object3D
                src="/assets/thiings/welcome-rocket.png"
                size={170}
                float
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:h-44 lg:w-44"
              />
              <Object3D
                src="/assets/thiings/backpack.png"
                size={92}
                float
                className="absolute bottom-0 left-2 lg:left-6 [animation-delay:0.8s]"
              />
              <Object3D
                src="/assets/thiings/ai-sparkle.png"
                size={64}
                float
                className="absolute left-10 top-2 [animation-delay:1.6s]"
              />
              <Object3D
                src="/assets/thiings/apple.png"
                size={64}
                float
                className="absolute right-2 top-6 [animation-delay:0.4s]"
              />
              <Object3D
                src="/assets/thiings/books.png"
                size={84}
                float
                className="absolute bottom-2 right-6 [animation-delay:1.2s]"
              />
            </div>
          </div>
        </section>

        {/* 2 + 3. Continue learning + Ask AI */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg">
            <div className="grid sm:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center p-6 sm:pr-0">
                <span className="grid size-28 place-items-center rounded-2xl bg-[#E7F6F4]">
                  <Object3D src={continueSubject.asset} size={84} />
                </span>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
                  Sambung belajar
                </p>
                <div>
                  <h2 className="text-xl font-bold tracking-tight lg:text-2xl">
                    {continueWorkbook.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {continueWorkbook.topic} · {continueWorkbook.teacherName}
                  </p>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${continueWorkbook.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {continueWorkbook.progress}% siap
                  </span>
                  <Button asChild size="sm">
                    <Link href="/pending/buku-kerja">
                      Teruskan <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Ask AI */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-white shadow-soft">
            <Object3D
              src="/assets/thiings/ai-sparkle.png"
              size={92}
              float
              className="absolute -right-2 -top-2 opacity-90"
            />
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Sparkles className="size-5 text-[#C6F432]" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Tanya Pixel AI</h3>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-300">
              Dapatkan bantuan serta-merta untuk mana-mana subjek atau buku kerja anda.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 py-1.5 pl-4 pr-1.5">
              <span className="flex-1 truncate text-sm text-slate-400">Taip soalan anda…</span>
              <Button asChild variant="white" size="sm">
                <Link href="/pending/tanya-ai">Mula</Link>
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Aktif sepenuhnya dalam Fasa 3 · mod demo
            </p>
          </div>
        </section>

        {/* 4. Subject discovery */}
        <section aria-labelledby="subjects">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="subjects" className="text-xl font-bold tracking-tight lg:text-2xl">
                Jelajah subjek
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pilih subjek untuk melihat buku kerja dan aktiviti.
              </p>
            </div>
            <Link
              href="/pending/jelajah"
              className="shrink-0 text-sm font-semibold text-teal hover:underline"
            >
              Semua subjek
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.id}
                href="/pending/jelajah"
                className="press group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center shadow-soft"
              >
                <span
                  className={cn(
                    "grid size-16 place-items-center rounded-2xl",
                    SUBJECT_TINT[subject.color],
                  )}
                >
                  <Object3D src={subject.asset} size={46} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{subject.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {subject.workbookCount} buku kerja
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Assignments + progress (compact) */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold">Tugasan</h3>
              <Link
                href="/pending/tugasan"
                className="text-sm font-semibold text-teal hover:underline"
              >
                Lihat semua
              </Link>
            </div>
            <div className="mt-2 flex flex-col">
              {ASSIGNMENTS.map((a, i) => {
                const subject = subjectById(a.subjectId);
                return (
                  <Link
                    key={a.id}
                    href="/pending/tugasan"
                    className={cn(
                      "flex items-center gap-3.5 py-3 transition-colors hover:bg-secondary/50",
                      i > 0 && "border-t border-border",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
                      <Object3D src="/assets/thiings/clipboard.png" size={26} className="drop-shadow-none" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{a.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" aria-hidden="true" />
                        {a.dueLabel} · {subject.name}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        STATUS_CHIP[a.tone],
                      )}
                    >
                      {a.score ?? (a.tone === "today" ? "Hari ini" : "Esok")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold">Kemajuan</h3>
              <Link
                href="/pending/kemajuan"
                className="text-sm font-semibold text-teal hover:underline"
              >
                Butiran
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#F7FEE7]">
                <Object3D src="/assets/thiings/achievement-trophy.png" size={44} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-bold">Tahap {level}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {into}/{student.xpPerLevel} XP
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${(into / student.xpPerLevel) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3 text-teal" aria-hidden="true" />
                  {student.xpPerLevel - into} XP lagi ke Tahap {level + 1}
                </p>
              </div>
            </div>
            <div className="mt-5 flex h-14 items-end gap-2" aria-hidden="true">
              {WEEK_BARS.map((bar, i) => (
                <div
                  key={i}
                  className={cn("flex-1 rounded-t-md", bar.color)}
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Flame className="size-3 text-teal" aria-hidden="true" />
              Rentetan {student.streakDays} hari · XP mingguan
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 lg:px-6">
          <span className="flex items-center gap-2 text-sm font-bold">
            <span className="grid size-6 place-items-center rounded-md bg-teal text-[10px] font-black text-white">
              &gt;&gt;
            </span>
            Pixelspace AI Classroom
          </span>
          <span className="text-xs text-muted-foreground">
            Demo design validation build · {student.school}
          </span>
        </div>
      </footer>
    </div>
  );
}
