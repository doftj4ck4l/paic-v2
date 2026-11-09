"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, BookSearch, ChevronDown, Ellipsis, LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, Settings, X } from "lucide-react";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { SUBJECTS, subjectById, type DemoWorkbook, type SubjectId } from "@/lib/demo-data";
import type { AppWorkbook } from "@/lib/workbooks";
import { toggleSavedWorkbook, useSavedWorkbooks } from "@/lib/saved-workbooks";
import styles from "./workbooks.module.css";

const COVER_ART: Partial<Record<SubjectId, string>> = {
  science: "/assets/thiings/workbook-flask.png",
  math: "/assets/thiings/workbook-calculator.png",
  language: "/assets/thiings/workbook-pencil.png",
};

export function WorkbookTile({ workbook, owned = false, canSave = false }: { workbook: DemoWorkbook; owned?: boolean; canSave?: boolean }) {
  const subject = subjectById(workbook.subjectId);
  const Icon = SUBJECT_ICONS[subject.id];
  const saved = useSavedWorkbooks();
  const isSaved = saved.includes(workbook.id);
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
        canSave ? (
          <button
            type="button"
            onClick={() => toggleSavedWorkbook(workbook.id)}
            aria-pressed={isSaved}
            data-saved={isSaved}
            aria-label={isSaved ? `Buang ${workbook.title} daripada simpanan` : `Simpan ${workbook.title}`}
            className={styles.saveButton}
          >
            <Bookmark aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
          </button>
        ) : owned ? (
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
        ) : undefined
      }
    />
  );
}

type SortId = "recent" | "complete" | "az";

export function WorkbookList({ workbooks, published }: { workbooks: AppWorkbook[]; published: AppWorkbook[] }) {
  const savedIds = useSavedWorkbooks();
  const [scope, setScope] = useState<"mine" | "saved">("mine");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [sort, setSort] = useState<SortId>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!filterRef.current?.contains(event.target as Node)) setFiltersOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  const savedWorkbooks = useMemo(
    () => published.filter((w) => savedIds.includes(w.id)),
    [published, savedIds],
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
      const searchText = `${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`.toLocaleLowerCase("ms");
      return matchesSubject && words.every((word) => searchText.includes(word));
    });
  }, [savedWorkbooks, query, subject]);

  function resetFilters() { setQuery(""); setSubject("all"); }

  function sortWorkbooks<T extends DemoWorkbook>(list: T[]): T[] {
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "ms"));
    if (sort === "complete") return [...list].sort((a, b) => b.progress - a.progress);
    return [...list].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
  }


  const showingMine = scope === "mine";

  return (
    <section className={styles.library} aria-label="Koleksi buku kerja">
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <label htmlFor="workbook-search" className={styles.srOnly}>Cari buku kerja</label>
          <input id="workbook-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={showingMine ? "Cari buku kerja…" : "Cari buku kerja disimpan…"} autoComplete="off" />
          {query && <button type="button" aria-label="Kosongkan carian" onClick={() => setQuery("")}><X size={16} /></button>}
        </div>
        <div className={styles.scopeTabs} role="group" aria-label="Skop buku kerja">
          <button type="button" className={styles.scopeTab} aria-pressed={showingMine} onClick={() => setScope("mine")}>
            Buku kerja saya
          </button>
          <button type="button" className={styles.scopeTab} aria-pressed={!showingMine} onClick={() => setScope("saved")}>
            Disimpan{savedWorkbooks.length > 0 ? ` (${savedWorkbooks.length})` : ""}
          </button>
        </div>
        <div className={styles.filterMenu} ref={filterRef}>
          <button
            type="button"
            className={styles.filterTrigger}
            aria-expanded={filtersOpen}
            aria-haspopup="true"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Tapis
            {subject !== "all" && <span className={styles.filterCount}>1</span>}
            <ChevronDown size={14} className={styles.filterTriggerChevron} aria-hidden="true" />
          </button>
          {filtersOpen && (
            <div className={styles.filterPanel}>
              <label className={styles.filterGroup}>
                <span>Subjek</span>
                <span className={styles.filterSelectWrap}>
                  <select value={subject} onChange={(event) => setSubject(event.target.value as SubjectId | "all")} className={styles.filterSelect}>
                    <option value="all">Semua subjek</option>
                    {SUBJECTS.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.filterChevron} aria-hidden="true" />
                </span>
              </label>
              <button type="button" className={styles.filterReset} onClick={resetFilters} disabled={subject === "all" && !query.trim()}>
                <RotateCcw size={13} aria-hidden="true" /> Set semula tapisan
              </button>
            </div>
          )}
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
        filtered.length === 0 ? (
          <div className={styles.empty}>
            <span><BookSearch size={33} aria-hidden="true" /></span>
            <h2>Tiada buku kerja dijumpai</h2>
            <p>Cuba kata kunci lain atau pilih subjek yang berbeza.</p>
            <button type="button" onClick={resetFilters}>Tetapkan semula carian</button>
          </div>
        ) : (
          <div className={styles.workbookGrid} data-view={view}>
            {sortWorkbooks(filtered).map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} owned={workbook.isDb} />)}
          </div>
        )
      ) : savedWorkbooks.length === 0 ? (
        <div className={styles.empty}>
          <span><Bookmark size={31} aria-hidden="true" /></span>
          <h2>Belum ada simpanan</h2>
          <p>Simpan buku kerja yang diterbitkan di Jelajah — koleksi anda akan muncul di sini.</p>
          <Link href="/explore">Jelajah sekarang</Link>
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
          {sortWorkbooks(filteredSaved).map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} canSave />)}
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
