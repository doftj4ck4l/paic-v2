import type { Metadata } from "next";
import { ClipboardCheck, ListChecks, type LucideIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { requireUser } from "@/lib/auth-session";
import { listUserActivity } from "@/lib/attempts";
import { formatRelativeTime } from "@/lib/assignment-status";

export const metadata: Metadata = { title: "Sejarah Aktiviti" };

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  quiz: ListChecks,
  assignment: ClipboardCheck,
};

const TONES: Record<string, "teal" | "purple" | "amber" | "neutral"> = {
  quiz: "purple",
  assignment: "amber",
};

const LABELS: Record<string, string> = {
  quiz: "Kuiz",
  assignment: "Tugasan",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const items = await listUserActivity(user.id, 50);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title="Sejarah aktiviti"
        description="Rekod pembelajaran anda — percubaan kuiz dan tugasan yang diselesaikan."
        backHref="/progress"
        backLabel="Kembali ke Kemajuan"
      />

      {items.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Belum ada aktiviti direkodkan. Main kuiz atau siapkan tugasan untuk melihat sejarah di sini.
        </p>
      ) : (
        <ol className="relative flex flex-col gap-3 border-l-2 border-border pl-5">
          {items.map((item) => {
            const Icon = ICONS[item.type] ?? ListChecks;
            return (
              <li key={item.id} className="relative">
                <span className="absolute -left-[31px] grid size-6 place-items-center rounded-full border border-border bg-card">
                  <Icon className="size-3 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-border bg-card p-4 shadow-soft">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Chip tone={TONES[item.type]}>{LABELS[item.type]}</Chip>
                    <span className="text-[11px] font-semibold text-muted-foreground">{formatRelativeTime(item.at)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </PageShell>
  );
}
