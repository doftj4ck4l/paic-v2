import Image from "next/image";
import Link from "next/link";
import { Chip, ProgressBar } from "@/components/studio/ui";
import {
  CREATION_KIND_LABEL,
  subjectById,
  type DemoCreation,
  type DemoSubject,
  type DemoWorkbook,
  type SubjectId,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const SUBJECT_TINT: Record<SubjectId, string> = {
  math: "bg-[#FFF7E6]",
  science: "bg-[#E7F6F4]",
  language: "bg-[#FFF4ED]",
  english: "bg-[#EFF6FF]",
  history: "bg-[#EEF2FF]",
  geography: "bg-[#F7FEE7]",
  islamic: "bg-[#E9F9EF]",
  moral: "bg-[#FFF0F5]",
  art: "bg-[#F6F0FF]",
  music: "bg-[#FFF0F9]",
  pj: "bg-[#F1FBEA]",
  rbt: "bg-[#F1F5F9]",
};

const STATUS_TONE = {
  "not-started": "neutral",
  "in-progress": "amber",
  submitted: "purple",
  graded: "teal",
} as const;

const STATUS_LABEL = {
  "not-started": "Belum mula",
  "in-progress": "Sedang dibuat",
  submitted: "Dihantar",
  graded: "Dinilai",
} as const;

export function WorkbookCard({ workbook, variant = "default" }: { workbook: DemoWorkbook; variant?: "default" | "illustrated" }) {
  const subject = subjectById(workbook.subjectId);
  const illustrated = variant === "illustrated";
  const artwork: Partial<Record<SubjectId, string>> = {
    science: "/assets/thiings/workbook-flask.png",
    math: "/assets/thiings/workbook-calculator.png",
    language: "/assets/thiings/workbook-pencil.png",
  };
  return (
    <Link
      href={`/workbooks/${workbook.id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className={cn("relative flex items-center justify-center", illustrated ? "h-40 overflow-hidden" : "h-24", SUBJECT_TINT[workbook.subjectId])}>
        <Image
          src={illustrated ? artwork[workbook.subjectId] ?? subject.asset : subject.asset}
          alt=""
          width={illustrated ? 160 : 64}
          height={illustrated ? 160 : 64}
          className={cn("drop-shadow-[0_10px_12px_rgba(16,17,47,0.16)] transition-transform group-hover:scale-105", illustrated && "mt-4")}
        />
        <Chip tone="neutral" className={cn("absolute top-3 bg-card/90", illustrated ? "left-4 text-xs" : "right-3")}>
          {subject.name}
        </Chip>
      </div>
      <div className={cn("flex flex-1 flex-col gap-3", illustrated ? "p-5" : "p-4")}>
        <div>
          <h3 className={cn("font-extrabold", illustrated ? "text-lg leading-snug tracking-tight" : "truncate text-[15px]")}>{workbook.title}</h3>
          <p className={cn("mt-0.5 text-xs text-muted-foreground", illustrated ? "line-clamp-2 leading-relaxed" : "line-clamp-1")}>{workbook.topic}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{workbook.progress}% siap</span>
            <span>{workbook.teacherName}</span>
          </div>
          <ProgressBar value={workbook.progress} label={`Kemajuan ${workbook.title}`} className="h-2.5" />
        </div>
      </div>
    </Link>
  );
}

export function SubjectTile({ subject }: { subject: DemoSubject }) {
  return (
    <Link
      href={`/explore/subjects/${subject.id}`}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-[24px] border border-border p-5 text-center shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg",
        SUBJECT_TINT[subject.id],
      )}
    >
      <Image
        src={subject.asset}
        alt=""
        width={56}
        height={56}
        className="drop-shadow-[0_10px_12px_rgba(16,17,47,0.16)]"
      />
      <span>
        <span className="block text-sm font-extrabold">{subject.name}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {subject.workbookCount} buku kerja
        </span>
      </span>
    </Link>
  );
}

export function ArtifactCard({ creation }: { creation: DemoCreation }) {
  const ready = creation.status === "ready";
  return (
    <Link
      href={ready ? `/creations/${creation.kind}/${creation.id}` : "/creations"}
      className="group flex items-center gap-4 rounded-[22px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary">
        <Image src={creation.asset} alt="" width={40} height={40} className="drop-shadow-[0_6px_8px_rgba(16,17,47,0.16)]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">{creation.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {creation.workbookTitle} · {creation.time}
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">{creation.meta}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <Chip tone={creation.status === "ready" ? "teal" : creation.status === "processing" ? "amber" : "red"}>
          {creation.status === "ready" ? "Sedia" : creation.status === "processing" ? "Sedang dijana" : "Gagal"}
        </Chip>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {CREATION_KIND_LABEL[creation.kind]}
        </span>
      </span>
    </Link>
  );
}


export function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "teal",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "teal" | "purple" | "amber";
}) {
  const tones = {
    teal: "bg-[#E7F6F4] text-[#00786a]",
    purple: "bg-accent text-accent-foreground",
    amber: "bg-[#FEF3C7] text-[#92400E]",
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-4 shadow-soft">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", tones[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-extrabold leading-tight">{value}</span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

export { SUBJECT_TINT, STATUS_TONE, STATUS_LABEL };
