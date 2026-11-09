import type { Metadata } from "next";
import { notFound } from "next/navigation";
import content from "@/components/studio/content-width.module.css";
import { SHARED_WORKBOOKS } from "@/lib/demo-data";
import { SharedWorkbookView } from "./shared-workbook-view";
import styles from "../../community.module.css";

export function generateStaticParams() {
  return SHARED_WORKBOOKS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const workbook = SHARED_WORKBOOKS.find((w) => w.id === id);
  return { title: workbook ? `${workbook.title} — Komuniti` : "Buku kerja — Komuniti" };
}

export default async function SharedWorkbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workbook = SHARED_WORKBOOKS.find((w) => w.id === id);
  if (!workbook) notFound();

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <SharedWorkbookView workbook={workbook} />
        <p className={styles.attribution}>
          3D icons by{" "}
          <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">
            Thiings
          </a>
        </p>
      </main>
    </div>
  );
}
