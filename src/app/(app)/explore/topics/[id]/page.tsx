import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, ListChecks } from "lucide-react";
import { PageHeader, PageShell, Section } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { WorkbookCard } from "@/components/studio/cards";
import { TOPICS, WORKBOOKS, subjectById } from "@/lib/demo-data";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) notFound();
  const subject = subjectById(topic.subjectId);
  const related = WORKBOOKS.filter((w) => w.subjectId === topic.subjectId);

  return (
    <PageShell>
      <PageHeader
        title={topic.name}
        description={topic.blurb}
        backHref={`/explore/subjects/${subject.id}`}
        backLabel={`Kembali ke ${subject.name}`}
        actions={<Chip tone="purple">{subject.name}</Chip>}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-border bg-card p-4 shadow-soft">
        <Image src={subject.asset} alt="" width={52} height={52} className="drop-shadow-[0_8px_10px_rgba(16,17,47,0.16)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Terokai topik ini</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {topic.workbookCount} buku kerja · {topic.quizCount} kuiz tersedia
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/subjects/${subject.id}/quizzes`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold shadow-soft hover:bg-secondary"
          >
            <ListChecks className="size-3.5" aria-hidden="true" /> Latihan
          </Link>
          <Link
            href="/explore"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-4 text-xs font-semibold text-white shadow-soft"
          >
            <BookOpen className="size-3.5" aria-hidden="true" /> Bahan lain
          </Link>
        </div>
      </div>

      <Section title="Buku kerja berkaitan">
        {related.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bahan untuk topik ini akan datang.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((w) => (
              <WorkbookCard key={w.id} workbook={w} />
            ))}
          </div>
        )}
      </Section>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowRight className="size-3.5" aria-hidden="true" />
        Bahan komuniti untuk topik ini akan muncul apabila perkongsian diluluskan (Fasa 5).
      </p>
    </PageShell>
  );
}
