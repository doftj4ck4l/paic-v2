import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { Chip } from "@/components/studio/ui";
import { QuizRow, WorkbookCard } from "@/components/studio/cards";
import {
  SUBJECT_MASTERY,
  WORKBOOKS,
  announcementsForSubject,
  quizzesForSubject,
  subjectClassById,
} from "@/lib/demo-data";

export const metadata: Metadata = { title: "Subjek" };

export default async function SubjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const workbooks = WORKBOOKS.filter((w) => w.subjectId === klass.subjectId);
  const quizzes = quizzesForSubject(klass.subjectId);
  const announcements = announcementsForSubject(klass.subjectId);
  const mastery = SUBJECT_MASTERY.find((m) => m.subjectId === klass.subjectId);
  const latest = announcements[0];

  return (
    <div className="flex flex-col gap-6">
      {latest && (
        <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Megaphone className="size-4 text-[#00786a]" aria-hidden="true" />
            <h2 className="text-sm font-bold">Pengumuman terkini</h2>
          </div>
          <p className="mt-3 text-sm font-semibold">{latest.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{latest.body}</p>
          <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
            {latest.author} · {latest.time}
          </p>
          <Link
            href={`/subjects/${klass.subjectId}/announcements`}
            className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00786a] hover:underline"
          >
            Semua pengumuman <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}

      {quizzes.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">Kuiz untuk anda</h2>
            <Link href={`/subjects/${klass.subjectId}/quizzes`} className="focus-ring text-xs font-semibold text-[#00786a] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {quizzes.map((q) => (
              <QuizRow key={q.id} quiz={q} />
            ))}
          </div>
        </section>
      )}

      {workbooks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">Buku kerja guru</h2>
            <Link href={`/subjects/${klass.subjectId}/workbooks`} className="focus-ring text-xs font-semibold text-[#00786a] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workbooks.slice(0, 3).map((w) => (
              <WorkbookCard key={w.id} workbook={w} />
            ))}
          </div>
        </section>
      )}

      {mastery && (
        <section className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Penguasaan subjek</h2>
            <Chip tone={mastery.trend === "down" ? "red" : "teal"}>{mastery.percent}%</Chip>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Lihat topik mana yang perlu diulang kaji, kemudian mula latihan tambahan.
          </p>
          <Link
            href={`/progress/subjects/${klass.subjectId}`}
            className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00786a] hover:underline"
          >
            Buka kemajuan subjek <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}
