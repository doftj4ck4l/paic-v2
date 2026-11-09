import { notFound } from "next/navigation";
import { Copy, Info } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { WORKBOOKS, subjectById } from "@/lib/demo-data";

export function generateStaticParams() {
  return WORKBOOKS.map((w) => ({ id: w.id }));
}

export default async function WorkbookPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workbook = WORKBOOKS.find((w) => w.id === id);
  if (!workbook) notFound();
  const subject = subjectById(workbook.subjectId);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title={workbook.title}
        description={workbook.topic}
        backHref="/explore"
        backLabel="Kembali ke Jelajah"
        actions={<Chip tone="purple">{subject.name}</Chip>}
      />

      <div className="flex flex-col gap-4">
        <div className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-bold">Mengenai buku kerja ini</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Subjek</dt>
              <dd className="mt-1 text-sm font-semibold">{subject.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Guru</dt>
              <dd className="mt-1 text-sm">{workbook.teacherName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted-foreground">Kandungan</dt>
              <dd className="mt-1 text-sm">
                4 sumber · sembang AI bersitasi · studio pembelajaran
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-border bg-card p-4 shadow-soft">
          <button
            type="button"
            disabled
            title="Menyalin buku kerja disambung dalam Fasa 5"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-5 text-sm font-semibold text-white opacity-60"
          >
            <Copy className="size-4" aria-hidden="true" /> Salin ke buku kerja saya
          </button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5" aria-hidden="true" />
            Menyalin bahan komuniti disambung dalam Fasa 5.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
