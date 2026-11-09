import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioLines, Info, Play, BookOpen } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { AUDIO_TRANSCRIPT, CREATIONS } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Pelajaran Audio" };

export default async function AudioViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creation = CREATIONS.find((c) => c.id === id && c.kind === "audio");
  if (!creation) notFound();

  return (
    <PageShell className="max-w-[760px]">
      <PageHeader
        title={creation.title}
        description={`${creation.workbookTitle} · ${creation.time}`}
        backHref="/creations"
        backLabel="Kembali ke hasil karya"
        actions={
          <>
            <Link
              href={`/workbooks/${creation.workbookId}`}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold text-[#00786a] shadow-soft hover:bg-secondary"
            >
              <BookOpen className="size-3.5" aria-hidden="true" /> Buka dalam buku kerja
            </Link>
            <Chip tone="red">Gagal dijana</Chip>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-[#FFE9E9] px-4 py-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-[#b3383e]" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-[#7d2a30]">
            Penjanaan audio gagal dalam binaan demo ini kerana perkhidmatan TTS belum disambung
            (Fasa 4). Transkrip di bawah menunjukkan kandungan yang akan dijana.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-[24px] border border-border bg-card p-5 shadow-soft">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Play className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e5eaf6]">
              <span className="block h-full w-0 rounded-full bg-[#c8cede]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>0:00</span>
              <span>0:58</span>
            </div>
          </div>
          <AudioLines className="size-5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
        </div>

        <div className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-bold">Transkrip</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {AUDIO_TRANSCRIPT.map((line) => (
              <li key={line.id} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-[11px] text-muted-foreground">
                  {line.time}
                </span>
                {line.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
