import type { Metadata } from "next";
import Image from "next/image";
import { Lock } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { ACHIEVEMENTS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pencapaian" };

const ACHIEVEMENT_ASSETS: Record<string, string> = {
  star: "/assets/thiings/achievement-star.png",
  medal: "/assets/thiings/achievement-medal.png",
  trophy: "/assets/thiings/achievement-trophy.png",
  target: "/assets/thiings/achievement-target.png",
  crown: "/assets/thiings/subject-history.png",
};

export default function AchievementsPage() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <PageShell className="max-w-[820px]">
      <PageHeader
        title="Pencapaian"
        description="Koleksi lencana pembelajaran anda — setiap satu dibuka melalui aktiviti sebenar."
        backHref="/progress"
        backLabel="Kembali ke Kemajuan"
        actions={<Chip tone="teal">{earned}/{ACHIEVEMENTS.length} diperoleh</Chip>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.id}
            className={cn(
              "flex flex-col items-center gap-3 rounded-[24px] border p-5 text-center shadow-soft",
              a.earned ? "border-border bg-card" : "border-border bg-secondary/60",
            )}
          >
            <span className="relative grid size-20 place-items-center rounded-2xl bg-secondary">
              <Image
                src={ACHIEVEMENT_ASSETS[a.icon]}
                alt=""
                width={54}
                height={54}
                className={cn(
                  "drop-shadow-[0_8px_10px_rgba(16,17,47,0.18)]",
                  !a.earned && "opacity-35 grayscale",
                )}
              />
              {!a.earned && (
                <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </span>
            <span>
              <span className={cn("block text-sm font-extrabold", !a.earned && "text-muted-foreground")}>
                {a.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {a.earned ? a.detail : "Belum dibuka"}
              </span>
            </span>
            <Chip tone={a.earned ? "teal" : "neutral"}>{a.earned ? "Diperoleh" : "Berkunci"}</Chip>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
