import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PageShell, Section } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { SubjectTile, WorkbookCard, SUBJECT_TINT } from "@/components/studio/cards";
import { SUBJECTS, TOPICS, WORKBOOKS, type SubjectId } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ id: s.id }));
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) notFound();

  const topics = TOPICS.filter((t) => t.subjectId === subject.id);
  const workbooks = WORKBOOKS.filter((w) => w.subjectId === subject.id);
  const otherSubjects = SUBJECTS.filter((s) => s.id !== subject.id).slice(0, 3);

  return (
    <PageShell>
      <PageHeader
        title={subject.name}
        description={subject.blurb}
        backHref="/explore"
        backLabel="Kembali ke Jelajah"
        actions={<Chip tone="purple">{subject.workbookCount} buku kerja</Chip>}
      />

      <div className={cn("flex items-center gap-5 rounded-[24px] border border-border p-5 shadow-soft", SUBJECT_TINT[subject.id as SubjectId])}>
        <Image src={subject.asset} alt="" width={84} height={84} className="drop-shadow-[0_12px_14px_rgba(16,17,47,0.18)]" />
        <div>
          <h2 className="text-lg font-extrabold">Mula belajar {subject.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {topics.length} topik · {subject.workbookCount} buku kerja dalam katalog
          </p>
        </div>
      </div>

      <Section title="Topik" description="Pilih topik untuk melihat bahan dan latihan.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/explore/topics/${t.id}`}
              className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <span className="text-sm font-extrabold">{t.name}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{t.blurb}</span>
              <span className="mt-auto flex gap-1.5 pt-1">
                <Chip tone="neutral">{t.workbookCount} buku kerja</Chip>
                {t.quizCount > 0 && <Chip tone="purple">{t.quizCount} kuiz</Chip>}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {workbooks.length > 0 && (
        <Section title="Buku kerja subjek ini">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workbooks.map((w) => (
              <WorkbookCard key={w.id} workbook={w} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Subjek lain">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {otherSubjects.map((s) => (
            <SubjectTile key={s.id} subject={s} />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
