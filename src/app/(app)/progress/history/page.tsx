import type { Metadata } from "next";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  ListChecks,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { ACTIVITY_HISTORY } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Sejarah Aktiviti" };

const ICONS: Record<string, LucideIcon> = {
  workbook: BookOpen,
  quiz: ListChecks,
  assignment: ClipboardCheck,
  practice: Dumbbell,
  achievement: Award,
  creation: Sparkles,
};

const TONES: Record<string, "teal" | "purple" | "amber" | "neutral"> = {
  workbook: "teal",
  quiz: "purple",
  assignment: "amber",
  practice: "teal",
  achievement: "amber",
  creation: "purple",
};

export default function HistoryPage() {
  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title="Sejarah aktiviti"
        description="Rekod pembelajaran anda — daripada buku kerja, kuiz, tugasan dan latihan."
        backHref="/progress"
        backLabel="Kembali ke Kemajuan"
      />

      <ol className="relative flex flex-col gap-3 border-l-2 border-border pl-5">
        {ACTIVITY_HISTORY.map((h) => {
          const Icon = ICONS[h.kind] ?? BookOpen;
          return (
            <li key={h.id} className="relative">
              <span className="absolute -left-[31px] grid size-6 place-items-center rounded-full border border-border bg-card">
                <Icon className="size-3 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-border bg-card p-4 shadow-soft">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{h.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{h.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Chip tone={TONES[h.kind]}>{h.kind}</Chip>
                  <span className="text-[11px] font-semibold text-muted-foreground">{h.time}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs text-muted-foreground">
        Sejarah penuh disimpan dalam pangkalan data apabila Fasa 1–3 selesai.
      </p>
    </PageShell>
  );
}
