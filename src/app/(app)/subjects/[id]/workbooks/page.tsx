import { BookOpen } from "lucide-react";
import { WorkbookTile } from "@/app/(app)/workbooks/workbook-list";
import { WORKBOOKS, subjectClassById } from "@/lib/demo-data";
import wb from "@/app/(app)/workbooks/workbooks.module.css";
import styles from "../../subjects.module.css";

export default async function SubjectWorkbooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const workbooks = WORKBOOKS.filter((w) => w.subjectId === klass.subjectId);

  if (workbooks.length === 0) {
    return (
      <div className={styles.empty}>
        <BookOpen size={32} aria-hidden="true" />
        <h3>Tiada buku kerja lagi</h3>
        <p>Bahan daripada {klass.teacherName} akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <section aria-label="Buku kerja subjek">
      <div className={styles.panelHeading}>
        <div>
          <h2>{workbooks.length} buku kerja</h2>
          <p>Dikongsi oleh {klass.teacherName} untuk {klass.className}.</p>
        </div>
      </div>
      <div className={wb.workbookGrid} data-view="grid">
        {workbooks.map((w) => (
          <WorkbookTile key={w.id} workbook={w} />
        ))}
      </div>
    </section>
  );
}
