import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const CHIP_TONES = {
  teal: "bg-[#E7F6F4] text-[#00786a]",
  purple: "bg-accent text-accent-foreground",
  amber: "bg-[#FEF3C7] text-[#92400E]",
  green: "bg-[#E7F6F4] text-[#0f7a5f]",
  red: "bg-[#FFE9E9] text-[#b3383e]",
  neutral: "bg-secondary text-muted-foreground",
} as const;

export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof CHIP_TONES;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        CHIP_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-[#e5eaf6]", className)}
    >
      <span
        className="block h-full rounded-full bg-gradient-to-r from-[#007a66] to-[#00856f]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
