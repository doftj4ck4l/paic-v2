import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, BookOpen } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { CREATIONS, NOTE_SECTIONS } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Nota AI" };

export default async function NotesViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creation = CREATIONS.find((c) => c.id === id && c.kind === "notes");
  if (!creation) notFound();

  return (
    <PageShell className="max-w-[820px]">
      <PageHeader
        title={creation.title}
        description={`${creation.workbookTitle} · ${creation.time} · ${creation.meta}`}
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
            <Chip tone="teal">Sedia</Chip>
          </>
        }
      />

      <article className="flex flex-col gap-4">
        {NOTE_SECTIONS.map((section, i) => (
          <section key={section.id} className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#E7F6F4] text-xs font-extrabold text-[#00786a]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-[15px] font-extrabold tracking-tight">{section.heading}</h2>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm leading-relaxed">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#00b6a2]" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
                {section.citation && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <FileText className="size-3" aria-hidden="true" />
                    Sumber: {section.citation.label}
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}
      </article>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Nota ini dijana daripada sumber buku kerja dan boleh disemak melalui sitasi di atas. Eksport
        PDF/DOCX akan datang dalam Fasa 4.
      </p>
    </PageShell>
  );
}
