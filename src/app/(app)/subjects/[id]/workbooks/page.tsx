import type { Metadata } from "next";
import { WorkbookCard } from "@/components/studio/cards";
import { WORKBOOKS, subjectClassById } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Buku Kerja Subjek" };

export default async function SubjectWorkbooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const workbooks = WORKBOOKS.filter((w) => w.subjectId === klass.subjectId);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {workbooks.length} buku kerja dikongsi oleh {klass.teacherName}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workbooks.map((w) => (
          <WorkbookCard key={w.id} workbook={w} />
        ))}
      </div>
    </div>
  );
}
