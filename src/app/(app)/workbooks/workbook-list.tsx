"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, BookSearch, Calculator, Crown, Ellipsis, FlaskConical, Globe, LayoutGrid, List, MessageCircle, Search, Settings, X } from "lucide-react";
import { SUBJECTS, subjectById, type DemoWorkbook, type SubjectId } from "@/lib/demo-data";
import styles from "./workbooks.module.css";

const SUBJECT_ICONS = { math: Calculator, science: FlaskConical, language: BookOpen, english: MessageCircle, history: Crown, geography: Globe };
const COVER_ART: Partial<Record<SubjectId, string>> = {
  science: "/assets/thiings/workbook-flask.png",
  math: "/assets/thiings/workbook-calculator.png",
  language: "/assets/thiings/workbook-pencil.png",
};

function WorkbookTile({ workbook }: { workbook: DemoWorkbook }) {
  const subject = subjectById(workbook.subjectId);
  const Icon = SUBJECT_ICONS[subject.id];
  return (
    <article className={styles.card} data-subject={subject.id}>
      <Link href={`/workbooks/${workbook.id}`} className={styles.cardLink}>
        <div className={styles.cover}>
          <svg className={styles.coverWave} viewBox="0 0 460 105" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30C75-10 106 115 206 63S333-18 381 51s64 59 79 50v25H0Z" fill="currentColor" /></svg>
          <span className={styles.subjectBadge}><Icon size={19} aria-hidden="true" />{subject.name}</span>
          <Image src={COVER_ART[subject.id] ?? subject.asset} alt="" width={1024} height={1024} sizes="(max-width: 600px) 210px, 220px" className={styles.coverArt} />
          <span className={styles.coverRays} aria-hidden="true"><i /><i /></span>
        </div>
        <div className={styles.cardBody}>
          <h2>{workbook.title}</h2>
          <p className={styles.topic}>{workbook.topic}</p>
          <div className={styles.progressDetails}><strong>{workbook.progress}% siap</strong><span>{workbook.teacherName}</span></div>
          <div className={styles.progressTrack} role="progressbar" aria-label={`Kemajuan ${workbook.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={workbook.progress}><span style={{ width: `${workbook.progress}%` }} /></div>
        </div>
      </Link>
      <details className={styles.cardMenu} onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}>
        <summary aria-label={`Pilihan ${workbook.title}`}><Ellipsis size={21} aria-hidden="true" /></summary>
        <div className={styles.menuContent}>
          <Link href={`/workbooks/${workbook.id}`}><BookOpen size={16} aria-hidden="true" />Buka buku kerja</Link>
          <Link href={`/workbooks/${workbook.id}/settings`}><Settings size={16} aria-hidden="true" />Tetapan buku kerja</Link>
        </div>
      </details>
    </article>
  );
}

export function WorkbookList({ workbooks }: { workbooks: DemoWorkbook[] }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
    return workbooks.filter((workbook) => {
      const matchesSubject = subject === "all" || workbook.subjectId === subject;
      const searchText = `${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [workbooks, query, subject]);

  function resetFilters() { setQuery(""); setSubject("all"); }

  return (
    <section className={styles.library} aria-label="Koleksi buku kerja">
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={21} aria-hidden="true" />
          <label htmlFor="workbook-search" className={styles.srOnly}>Cari buku kerja</label>
          <input id="workbook-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari buku kerja…" autoComplete="off" />
          {query && <button type="button" aria-label="Kosongkan carian" onClick={() => setQuery("")}><X size={16} /></button>}
        </div>
        <div className={styles.filters} role="group" aria-label="Tapis mengikut subjek">
          <button type="button" onClick={() => setSubject("all")} aria-pressed={subject === "all"} className={styles.filter}>Semua</button>
          {SUBJECTS.map((item) => {
            const Icon = SUBJECT_ICONS[item.id];
            return <button key={item.id} type="button" onClick={() => setSubject(item.id)} aria-pressed={subject === item.id} className={styles.filter}><Icon size={19} aria-hidden="true" />{item.name}</button>;
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span><BookSearch size={33} aria-hidden="true" /></span>
          <h2>Tiada buku kerja dijumpai</h2>
          <p>Cuba kata kunci lain atau pilih subjek yang berbeza.</p>
          <button type="button" onClick={resetFilters}>Tetapkan semula carian</button>
        </div>
      ) : (
        <div className={styles.workbookGrid} data-view={view}>
          {filtered.map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} />)}
        </div>
      )}

      <div className={styles.libraryFooter}>
        <p role="status" aria-live="polite" aria-atomic="true">Menunjukkan {filtered.length} daripada {workbooks.length} buku kerja contoh.</p>
        <div className={styles.viewControls} role="group" aria-label="Paparan buku kerja">
          <button type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}><LayoutGrid size={17} aria-hidden="true" />Grid</button>
          <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"}><List size={18} aria-hidden="true" />Senarai</button>
        </div>
      </div>
    </section>
  );
}
