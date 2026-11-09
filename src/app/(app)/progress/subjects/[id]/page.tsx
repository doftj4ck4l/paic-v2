import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { PageHeader, PageShell, Section } from "@/components/studio/shell";
import { Chip, ProgressBar } from "@/components/studio/ui";
import { SUBJECTS, SUBJECT_MASTERY } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ id: s.id }));
}

const TREND_ICON = { up: TrendingUp, flat: Minus, down: TrendingDown } as const;
const TREND_LABEL = { up: "Meningkat", flat: "Konsisten", down: "Perlu perhatian" } as const;

export default async function SubjectProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) notFound();
  const mastery = SUBJECT_MASTERY.find((m) => m.subjectId === subject.id);
  const Trend = mastery ? TREND_ICON[mastery.trend] : Minus;

  return (
    <PageShell className="max-w-[820px]">
      <PageHeader
        title={`Kemajuan ${subject.name}`}
        description={subject.blurb}
        backHref="/progress"
        backLabel="Kembali ke Kemajuan"
        actions={
          mastery ? (
            <Chip tone={mastery.trend === "down" ? "red" : "teal"}>
              <Trend className="size-3.5" aria-hidden="true" />
              {mastery.percent}% · {mastery.trend ? TREND_LABEL[mastery.trend] : ""}
            </Chip>
          ) : undefined
        }
      />

      <Section title="Penguasaan mengikut topik">
        {mastery ? (
          <div className="flex flex-col gap-3">
            {mastery.topics.map((t) => (
              <div key={t.id} className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4 shadow-soft">
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{t.name}</span>
                <ProgressBar value={t.percent} label={`Penguasaan ${t.name}`} className="h-2.5 max-w-[280px] flex-1" />
                <span className={cn("w-9 shrink-0 text-right text-xs font-bold tabular-nums", t.percent < 60 ? "text-[#b3383e]" : "text-muted-foreground")}>
                  {t.percent}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Data penguasaan untuk subjek ini akan datang.</p>
        )}
      </Section>

      <Section title="Cadangan">
        <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-card p-4 shadow-soft">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Latih topik di bawah 60% untuk meningkatkan penguasaan anda dengan cepat.
          </p>
          <Link
            href={`/subjects/${subject.id}/quizzes`}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-4 text-xs font-semibold text-white shadow-soft"
          >
            Mula latihan <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
