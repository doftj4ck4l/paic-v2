import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Info, Play, Presentation } from "lucide-react";
import { Chip } from "@/components/studio/ui";
import { materialsForSubject, subjectClassById } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Bahan Subjek" };

const ICONS = { workbook: FileText, notes: FileText, video: Play, slides: Presentation } as const;

export default async function SubjectMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const materials = materialsForSubject(klass.subjectId);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {materials.length} bahan dikongsi oleh {klass.teacherName}.
      </p>
      <ul className="flex flex-col gap-2.5">
        {materials.map((m) => {
          const Icon = ICONS[m.kind];
          const inner = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{m.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Ditambah {m.addedAt}</span>
              </span>
              <Chip tone="neutral">{m.kind}</Chip>
            </>
          );
          return (
            <li key={m.id}>
              {m.workbookId ? (
                <Link
                  href={`/workbooks/${m.workbookId}`}
                  className="focus-ring flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-[#00b6a2]"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5" aria-hidden="true" />
        Muat naik dan perkongsian bahan penuh disambung dalam Fasa 5.
      </p>
    </div>
  );
}
