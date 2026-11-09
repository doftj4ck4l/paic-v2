import Link from "next/link";
import { FileText, Package, Play, Presentation } from "lucide-react";
import { materialsForSubject, subjectClassById } from "@/lib/demo-data";
import styles from "../../subjects.module.css";

const ICONS = { workbook: FileText, notes: FileText, video: Play, slides: Presentation } as const;
const KIND_LABEL = { workbook: "Buku kerja", notes: "Nota", video: "Video", slides: "Slaid" } as const;

export default async function SubjectMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const materials = materialsForSubject(klass.subjectId);

  if (materials.length === 0) {
    return (
      <div className={styles.empty}>
        <Package size={32} aria-hidden="true" />
        <h3>Tiada bahan lagi</h3>
        <p>Bahan daripada {klass.teacherName} akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <section aria-label="Bahan subjek">
      <div className={styles.panelHeading}>
        <div>
          <h2>{materials.length} bahan</h2>
          <p>Dikongsi oleh {klass.teacherName} untuk pembelajaran anda.</p>
        </div>
      </div>
      <div className={styles.rowList}>
        {materials.map((m) => {
          const Icon = ICONS[m.kind];
          const inner = (
            <>
              <span className={styles.rowIcon}>
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className={styles.rowBody}>
                <strong>{m.title}</strong>
                <span>Ditambah {m.addedAt}</span>
              </span>
              <span className={styles.kindChip}>{KIND_LABEL[m.kind]}</span>
            </>
          );
          return m.workbookId ? (
            <Link key={m.id} href={`/workbooks/${m.workbookId}`} className={styles.row}>
              {inner}
            </Link>
          ) : (
            <div key={m.id} className={styles.row}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
