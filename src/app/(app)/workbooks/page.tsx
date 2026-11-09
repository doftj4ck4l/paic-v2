import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth-session";
import { listPublishedWorkbooks, listWorkbooksForUser } from "@/lib/workbooks";
import { WorkbookList } from "./workbook-list";
import styles from "./workbooks.module.css";
import content from "@/components/studio/content-width.module.css";

export const metadata: Metadata = { title: "Buku Kerja" };

export const dynamic = "force-dynamic";

export default async function WorkbooksPage() {
  const user = await requireUser();
  const [workbooks, published] = await Promise.all([listWorkbooksForUser(user.id), listPublishedWorkbooks()]);
  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <section className={styles.hero} aria-labelledby="workbooks-title">
          <div className={styles.heroCopy}>
            <div className={styles.titleRow}>
              <span className={styles.folder}><Image src="/assets/thiings/workbook-folder.png" alt="" width={46} height={46} /></span>
              <h1 id="workbooks-title"><span>Buku kerja saya</span></h1>
            </div>
            <p>Semua bahan pembelajaran anda di satu tempat — sumber, sembang AI bersitasi dan hasil pembelajaran.</p>
            <div className={styles.heroActions}>
              <Link href="/workbooks/new" className={styles.primaryButton}><Plus size={24} aria-hidden="true" />Buku kerja baharu</Link>
              <Link href="/workbooks/new?mode=ai" className={styles.secondaryButton}><Sparkles size={26} aria-hidden="true" />Bina dengan AI</Link>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <svg className={styles.heroBlob} viewBox="0 0 600 250" preserveAspectRatio="none"><path d="M15 85C-22 22 47-9 112 9s92 68 158 40S385 7 461 5s119 31 113 91-48 75-25 127H0c69-58 36-91 15-138Z" fill="currentColor" /></svg>
            <Image src="/assets/workbooks/books-robot.png" alt="" width={1536} height={1024} loading="eager" sizes="(max-width: 600px) 340px, (max-width: 1000px) 410px, 560px" />
          </div>
        </section>
        <WorkbookList workbooks={workbooks} published={published} />
        <p className={styles.attribution}>3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a></p>
      </main>
    </div>
  );
}
