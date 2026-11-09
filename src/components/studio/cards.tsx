import Image from "next/image";
import Link from "next/link";
import { CalendarClock, FileText, ListChecks, Users } from "lucide-react";
import { Chip, ProgressBar } from "@/components/studio/ui";
import {
  CREATION_KIND_LABEL,
  subjectById,
  type DemoQuizItem,
  type DemoSubjectClass,
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

export function WorkbookCard({ workbook }: { workbook: DemoWorkbook }) {
  const subject = subjectById(workbook.subjectId);
  return (
    <Link
      href={`/workbooks/${workbook.id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className={cn("relative flex h-24 items-center justify-center", SUBJECT_TINT[workbook.subjectId])}>
        <Image
          src={subject.asset}
          alt=""
          width={64}
          height={64}
          className="drop-shadow-[0_10px_12px_rgba(16,17,47,0.16)] transition-transform group-hover:scale-105"
        />
        <Chip tone="neutral" className="absolute right-3 top-3 bg-card/90">
          {subject.name}
        </Chip>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-[15px] font-extrabold">{workbook.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{workbook.topic}</p>
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

export function QuizRow({ quiz }: { quiz: DemoQuizItem }) {
  const subject = subjectById(quiz.subjectId);
  const tone = quiz.status === "new" ? "amber" : quiz.status === "in-progress" ? "purple" : "teal";
  const label = quiz.status === "new" ? "Baharu" : quiz.status === "in-progress" ? "Dalam proses" : "Selesai";
  return (
    <Link
      href={quiz.status === "done" ? `/quizzes/${quiz.id}/hasil` : `/quizzes/${quiz.id}`}
      className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", SUBJECT_TINT[quiz.subjectId])}>
        <Image src={subject.asset} alt="" width={32} height={32} className="drop-shadow-[0_5px_6px_rgba(16,17,47,0.16)]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{quiz.title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          {quiz.due} · {quiz.teacherName}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <Chip tone={tone}>{label}</Chip>
        {quiz.score && <span className="text-xs font-bold text-[#00786a]">{quiz.score}</span>}
      </span>
    </Link>
  );
}

export function SubjectClassCard({ klass, workbooks, quizzes }: { klass: DemoSubjectClass; workbooks: number; quizzes: number }) {
  const subject = subjectById(klass.subjectId);
  return (
    <Link
      href={`/subjects/${klass.subjectId}`}
      className="flex flex-col gap-4 rounded-[24px] border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="flex items-center gap-3.5">
        <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl p-2.5", SUBJECT_TINT[klass.subjectId])}>
          <Image src={subject.asset} alt="" width={38} height={38} className="drop-shadow-[0_5px_6px_rgba(16,17,47,0.16)]" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-extrabold">{subject.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {klass.teacherName} · {klass.className}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{klass.schedule}</p>
      <div className="flex items-center gap-4 border-t border-border pt-3.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5" aria-hidden="true" /> {workbooks} buku kerja
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-3.5" aria-hidden="true" /> {quizzes} kuiz
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden="true" /> {klass.studentCount}
        </span>
      </div>
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
