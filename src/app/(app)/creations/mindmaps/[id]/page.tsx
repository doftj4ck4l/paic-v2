import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { CREATIONS } from "@/lib/demo-data";
import { MindMapViewer } from "./mindmap-viewer";

export const metadata: Metadata = { title: "Peta Minda AI" };

export default async function MindMapViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creation = CREATIONS.find((c) => c.id === id && c.kind === "mindmaps");
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
      <MindMapViewer />
    </PageShell>
  );
}
