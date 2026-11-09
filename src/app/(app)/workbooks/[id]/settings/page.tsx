import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { WORKBOOKS, subjectById } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Tetapan Buku Kerja" };

export default async function WorkbookSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workbook = WORKBOOKS.find((w) => w.id === id);
  if (!workbook) notFound();
  const subject = subjectById(workbook.subjectId);

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title="Tetapan buku kerja"
        description={`Urus maklumat dan status untuk "${workbook.title}".`}
        backHref={`/workbooks/${workbook.id}`}
        backLabel="Kembali ke ruang kerja"
      />

      <div className="flex flex-col gap-4">
        <div className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-bold">Maklumat</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Tajuk</dt>
              <dd className="mt-1 text-sm font-semibold">{workbook.title}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Subjek</dt>
              <dd className="mt-1">
                <Chip tone="purple">{subject.name}</Chip>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted-foreground">Topik</dt>
              <dd className="mt-1 text-sm">{workbook.topic}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Guru</dt>
              <dd className="mt-1 text-sm">{workbook.teacherName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Kemajuan</dt>
              <dd className="mt-1 text-sm">{workbook.progress}% siap</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-bold">Tindakan</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled
              title="Menukar nama disambung dalam Fasa 3"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground opacity-60"
            >
              Tukar nama
            </button>
            <button
              type="button"
              disabled
              title="Pengarkiban disambung dalam Fasa 3"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground opacity-60"
            >
              Arkib
            </button>
            <button
              type="button"
              disabled
              title="Pemadaman disambung dalam Fasa 3"
              className="inline-flex h-10 items-center rounded-xl border border-[#ffd6d6] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b3383e] opacity-70"
            >
              Padam
            </button>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Pengurusan penuh (tukar nama, arkib, padam) disambung bersama pangkalan data dalam Fasa 3.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          <Link href={`/workbooks/${workbook.id}`} className="font-semibold text-[#00786a] hover:underline">
            Kembali ke ruang kerja
          </Link>{" "}
          untuk meneruskan pembelajaran.
        </p>
      </div>
    </PageShell>
  );
}
