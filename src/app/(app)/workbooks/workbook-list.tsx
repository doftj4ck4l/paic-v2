"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, BookSearch, Ellipsis, LayoutGrid, List, Search, Settings, UsersRound, X } from "lucide-react";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import {
  SHARED_WORKBOOKS,
  SUBJECTS,
  communityStudentById,
  subjectById,
  type DemoWorkbook,
  type SubjectId,
} from "@/lib/demo-data";
import { useSocial } from "@/lib/demo-social";
import styles from "./workbooks.module.css";

const COVER_ART: Partial<Record<SubjectId, string>> = {
  science: "/assets/thiings/workbook-flask.png",
  math: "/assets/thiings/workbook-calculator.png",
  language: "/assets/thiings/workbook-pencil.png",
};

export function WorkbookTile({ workbook }: { workbook: DemoWorkbook }) {
  const subject = subjectById(workbook.subjectId);
  const Icon = SUBJECT_ICONS[subject.id];
  return (
    <ContentTile
      href={`/workbooks/${workbook.id}`}
      tint={subject.id}
      art={COVER_ART[subject.id] ?? subject.asset}
      badge={<><Icon size={14} aria-hidden="true" />{subject.name}</>}
      title={workbook.title}
      description={workbook.topic}
      footer={<strong>{workbook.progress}% siap</strong>}
      footerEnd={<span>{workbook.teacherName}</span>}
      progress={{ value: workbook.progress, label: `Kemajuan ${workbook.title}` }}
      menu={
        <details className={styles.cardMenu} onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
        }}>
          <summary aria-label={`Pilihan ${workbook.title}`}><Ellipsis size={17} aria-hidden="true" /></summary>
          <div className={styles.menuContent}>
            <Link href={`/workbooks/${workbook.id}`}><BookOpen size={15} aria-hidden="true" />Buka buku kerja</Link>
            <Link href={`/workbooks/${workbook.id}/settings`}><Settings size={15} aria-hidden="true" />Tetapan buku kerja</Link>
          </div>
        </details>
      }
    />
  );
}

export function WorkbookList({ workbooks }: { workbooks: DemoWorkbook[] }) {
  const { subscribed } = useSocial();
  const [scope, setScope] = useState<"mine" | "subscribed">("mine");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const subscribedWorkbooks = useMemo(
    () => SHARED_WORKBOOKS.filter((w) => subscribed.includes(w.id)),
    [subscribed],
  );

  const filtered = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
    return workbooks.filter((workbook) => {
      const matchesSubject = subject === "all" || workbook.subjectId === subject;
      const searchText = `${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [workbooks, query, subject]);

  const filteredShared = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
    return subscribedWorkbooks.filter((workbook) => {
      const matchesSubject = subject === "all" || workbook.subjectId === subject;
      const author = communityStudentById(workbook.authorId).name;
      const searchText = `${workbook.title} ${workbook.topic} ${author} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [subscribedWorkbooks, query, subject]);

  function resetFilters() { setQuery(""); setSubject("all"); }

  const showingMine = scope === "mine";

  return (
    <section className={styles.library} aria-label="Koleksi buku kerja">
      <div className={styles.scopeRow}>
        <div className={styles.scopeTabs} role="group" aria-label="Skop buku kerja">
          <button type="button" className={styles.scopeTab} aria-pressed={showingMine} onClick={() => setScope("mine")}>
            Buku kerja saya
          </button>
          <button type="button" className={styles.scopeTab} aria-pressed={!showingMine} onClick={() => setScope("subscribed")}>
            Langganan{subscribedWorkbooks.length > 0 ? ` (${subscribedWorkbooks.length})` : ""}
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <label htmlFor="workbook-search" className={styles.srOnly}>Cari buku kerja</label>
          <input id="workbook-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={showingMine ? "Cari buku kerja…" : "Cari buku kerja dilanggan…"} autoComplete="off" />
          {query && <button type="button" aria-label="Kosongkan carian" onClick={() => setQuery("")}><X size={16} /></button>}
        </div>
        <div className={styles.filters} role="group" aria-label="Tapis mengikut subjek">
          <button type="button" onClick={() => setSubject("all")} aria-pressed={subject === "all"} className={styles.filter}>Semua</button>
          {SUBJECTS.map((item) => {
            const Icon = SUBJECT_ICONS[item.id];
            return <button key={item.id} type="button" onClick={() => setSubject(item.id)} aria-pressed={subject === item.id} className={styles.filter}><Icon size={15} aria-hidden="true" />{item.name}</button>;
          })}
        </div>
      </div>

      {showingMine ? (
        filtered.length === 0 ? (
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
        )
      ) : subscribedWorkbooks.length === 0 ? (
        <div className={styles.empty}>
          <span><UsersRound size={31} aria-hidden="true" /></span>
          <h2>Belum ada langganan</h2>
          <p>Langgan buku kerja rakan anda di Komuniti — bahan mereka akan muncul di sini.</p>
          <Link href="/community">Buka Komuniti</Link>
        </div>
      ) : filteredShared.length === 0 ? (
        <div className={styles.empty}>
          <span><BookSearch size={33} aria-hidden="true" /></span>
          <h2>Tiada langganan sepadan</h2>
          <p>Cuba kata kunci lain atau pilih subjek yang berbeza.</p>
          <button type="button" onClick={resetFilters}>Tetapkan semula carian</button>
        </div>
      ) : (
        <div className={styles.workbookGrid} data-view={view}>
          {filteredShared.map((workbook) => <SharedWorkbookTile key={workbook.id} workbook={workbook} />)}
        </div>
      )}

      <div className={styles.libraryFooter}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {showingMine
            ? `Menunjukkan ${filtered.length} daripada ${workbooks.length} buku kerja contoh.`
            : `Menunjukkan ${filteredShared.length} daripada ${subscribedWorkbooks.length} buku kerja dilanggan.`}
        </p>
        <div className={styles.viewControls} role="group" aria-label="Paparan buku kerja">
          <button type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}><LayoutGrid size={17} aria-hidden="true" />Grid</button>
          <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"}><List size={18} aria-hidden="true" />Senarai</button>
        </div>
      </div>
    </section>
  );
}
