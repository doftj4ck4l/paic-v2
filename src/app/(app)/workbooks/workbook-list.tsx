"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen, BookSearch, ChevronDown, Ellipsis, LayoutGrid, List, RotateCcw, Search, Settings, X } from "lucide-react";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import {
  SHARED_WORKBOOKS,
  SUBJECTS,
  communityStudentById,
  subjectById,
  type DemoSharedWorkbook,
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

function RemixTile({ workbook }: { workbook: DemoSharedWorkbook }) {
  const author = communityStudentById(workbook.authorId);
  const subject = subjectById(workbook.subjectId);
  return (
    <ContentTile
      href="/workbooks/kitaran-air"
      tint={subject.id}
      art={workbook.asset}
      badge={<><RotateCcw size={14} aria-hidden="true" />Versi saya</>}
      title={workbook.title}
      description={`Diadaptasi daripada buku kerja ${author.name}`}
      footer={<span>Salinan peribadi</span>}
      footerEnd={<ArrowRight size={16} className={styles.remixArrow} aria-hidden="true" />}
    />
  );
}

type SortId = "recent" | "complete" | "az";

export function WorkbookList({ workbooks }: { workbooks: DemoWorkbook[] }) {
  const { saved, remixed } = useSocial();
  const [scope, setScope] = useState<"mine" | "saved">("mine");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [sort, setSort] = useState<SortId>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  const savedWorkbooks = useMemo(
    () => SHARED_WORKBOOKS.filter((w) => saved.includes(w.id)),
    [saved],
  );
  const remixSources = useMemo(
    () => SHARED_WORKBOOKS.filter((w) => remixed.includes(w.id)),
    [remixed],
  );

  const filtered = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
    return workbooks.filter((workbook) => {
      const matchesSubject = subject === "all" || workbook.subjectId === subject;
      const searchText = `${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [workbooks, query, subject]);

  const filteredSaved = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean);
    return savedWorkbooks.filter((workbook) => {
      const matchesSubject = subject === "all" || workbook.subjectId === subject;
      const author = communityStudentById(workbook.authorId).name;
      const searchText = `${workbook.title} ${workbook.topic} ${author} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [savedWorkbooks, query, subject]);

  function resetFilters() { setQuery(""); setSubject("all"); }

  function sortWorkbooks<T extends DemoWorkbook>(list: T[]): T[] {
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "ms"));
    if (sort === "complete") return [...list].sort((a, b) => b.progress - a.progress);
    return [...list].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
  }

  function sortShared(list: typeof SHARED_WORKBOOKS): typeof SHARED_WORKBOOKS {
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "ms"));
    if (sort === "complete") return [...list].sort((a, b) => b.saves - a.saves);
    return list;
  }

  const showingMine = scope === "mine";
  const showRemixes = showingMine && query.trim() === "" && subject === "all" && remixSources.length > 0;

  return (
    <section className={styles.library} aria-label="Koleksi buku kerja">
      <div className={styles.scopeRow}>
        <div className={styles.scopeTabs} role="group" aria-label="Skop buku kerja">
          <button type="button" className={styles.scopeTab} aria-pressed={showingMine} onClick={() => setScope("mine")}>
            Buku kerja saya
          </button>
          <button type="button" className={styles.scopeTab} aria-pressed={!showingMine} onClick={() => setScope("saved")}>
            Disimpan{savedWorkbooks.length > 0 ? ` (${savedWorkbooks.length})` : ""}
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <label htmlFor="workbook-search" className={styles.srOnly}>Cari buku kerja</label>
          <input id="workbook-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={showingMine ? "Cari buku kerja…" : "Cari buku kerja disimpan…"} autoComplete="off" />
          {query && <button type="button" aria-label="Kosongkan carian" onClick={() => setQuery("")}><X size={16} /></button>}
        </div>
        <div className={styles.filters} role="group" aria-label="Tapis mengikut subjek">
          <button type="button" onClick={() => setSubject("all")} aria-pressed={subject === "all"} className={styles.filter}>Semua</button>
          {SUBJECTS.map((item) => {
            const Icon = SUBJECT_ICONS[item.id];
            return <button key={item.id} type="button" onClick={() => setSubject(item.id)} aria-pressed={subject === item.id} className={styles.filter}><Icon size={15} aria-hidden="true" />{item.name}</button>;
          })}
        </div>
        <span className={styles.sortField}>
          <label htmlFor="workbook-sort" className={styles.srOnly}>Susun buku kerja</label>
          <select id="workbook-sort" value={sort} onChange={(event) => setSort(event.target.value as SortId)} className={styles.sortSelect}>
            <option value="recent">Susun: Terbaharu</option>
            <option value="complete">Susun: Paling lengkap</option>
            <option value="az">Susun: A–Z</option>
          </select>
          <ChevronDown size={14} className={styles.sortChevron} aria-hidden="true" />
        </span>
      </div>

      {showingMine ? (
        filtered.length === 0 && !showRemixes ? (
          <div className={styles.empty}>
            <span><BookSearch size={33} aria-hidden="true" /></span>
            <h2>Tiada buku kerja dijumpai</h2>
            <p>Cuba kata kunci lain atau pilih subjek yang berbeza.</p>
            <button type="button" onClick={resetFilters}>Tetapkan semula carian</button>
          </div>
        ) : (
          <div className={styles.workbookGrid} data-view={view}>
            {showRemixes && remixSources.map((workbook) => <RemixTile key={`remix-${workbook.id}`} workbook={workbook} />)}
            {sortWorkbooks(filtered).map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} />)}
          </div>
        )
      ) : savedWorkbooks.length === 0 ? (
        <div className={styles.empty}>
          <span><Bookmark size={31} aria-hidden="true" /></span>
          <h2>Belum ada simpanan</h2>
          <p>Simpan buku kerja rakan anda di Komuniti — koleksi anda akan muncul di sini.</p>
          <Link href="/community">Buka Komuniti</Link>
        </div>
      ) : filteredSaved.length === 0 ? (
        <div className={styles.empty}>
          <span><BookSearch size={33} aria-hidden="true" /></span>
          <h2>Tiada simpanan sepadan</h2>
          <p>Cuba kata kunci lain atau pilih subjek yang berbeza.</p>
          <button type="button" onClick={resetFilters}>Tetapkan semula carian</button>
        </div>
      ) : (
        <div className={styles.workbookGrid} data-view={view}>
          {sortShared(filteredSaved).map((workbook) => <SharedWorkbookTile key={workbook.id} workbook={workbook} />)}
        </div>
      )}

      <div className={styles.libraryFooter}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {showingMine
            ? `Menunjukkan ${filtered.length} daripada ${workbooks.length} buku kerja contoh.`
            : `Menunjukkan ${filteredSaved.length} daripada ${savedWorkbooks.length} buku kerja disimpan.`}
        </p>
        <div className={styles.viewControls} role="group" aria-label="Paparan buku kerja">
          <button type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}><LayoutGrid size={17} aria-hidden="true" />Grid</button>
          <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"}><List size={18} aria-hidden="true" />Senarai</button>
        </div>
      </div>
    </section>
  );
}
