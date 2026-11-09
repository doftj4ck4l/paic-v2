"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Compass, GraduationCap, ListChecks, RotateCcw, Search, UsersRound, X } from "lucide-react";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { WorkbookTile } from "@/app/(app)/workbooks/workbook-list";
import { SharedWorkbookTile } from "@/components/studio/shared-workbook-tile";
import {
  SHARED_WORKBOOKS,
  SUBJECTS,
  TOPICS,
  WORKBOOKS,
  communityStudentById,
  subjectById,
  type DemoWorkbook,
  type SubjectId,
} from "@/lib/demo-data";
import styles from "./explore.module.css";

type SortId = "recent" | "complete" | "az";
type ScopeId = "guru" | "pelajar" | "topik";
type PublishedWorkbook = DemoWorkbook & { ownerRole: "student" | "teacher" };

const SORT_OPTIONS: { value: SortId; label: string }[] = [
  { value: "recent", label: "Terbaharu" },
  { value: "complete", label: "Paling lengkap" },
  { value: "az", label: "A–Z" },
];

const SCOPES: { id: ScopeId; label: string; icon: typeof GraduationCap }[] = [
  { id: "guru", label: "Daripada Guru", icon: GraduationCap },
  { id: "pelajar", label: "Daripada Pelajar", icon: UsersRound },
  { id: "topik", label: "Topik", icon: Compass },
];

function yearRank(year: string) {
  const match = year.match(/(\d+)/);
  const n = match ? Number(match[1]) : 99;
  return year.startsWith("Tingkatan") ? 100 + n : n;
}

export function Explorer({ publishedWorkbooks = [] }: { publishedWorkbooks?: PublishedWorkbook[] }) {
  const [scope, setScope] = useState<ScopeId>("guru");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [year, setYear] = useState<string>("all");
  const [author, setAuthor] = useState<string>("all");
  const [sort, setSort] = useState<SortId>("recent");

  const teacherWorkbooks = useMemo(
    () => [...WORKBOOKS, ...publishedWorkbooks.filter((w) => w.ownerRole === "teacher")],
    [publishedWorkbooks],
  );
  const studentPublished = useMemo(
    () => publishedWorkbooks.filter((w) => w.ownerRole === "student"),
    [publishedWorkbooks],
  );

  const yearOptions = useMemo(() => {
    const years = new Set<string>([
      ...TOPICS.map((t) => t.yearLabel),
      ...teacherWorkbooks.map((w) => w.yearLabel),
      ...SHARED_WORKBOOKS.map((w) => w.yearLabel),
      ...studentPublished.map((w) => w.yearLabel),
    ]);
    return [...years].filter(Boolean).sort((a, b) => yearRank(a) - yearRank(b));
  }, [teacherWorkbooks, studentPublished]);

  const authorOptions = useMemo(() => {
    const names =
      scope === "pelajar"
        ? [...SHARED_WORKBOOKS.map((w) => communityStudentById(w.authorId).name), ...studentPublished.map((w) => w.teacherName)]
        : teacherWorkbooks.map((w) => w.teacherName);
    return [...new Set(names)].filter(Boolean).sort((a, b) => a.localeCompare(b, "ms"));
  }, [scope, teacherWorkbooks, studentPublished]);

  const words = useMemo(() => query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean), [query]);
  const matches = (text: string) => words.every((word) => text.toLocaleLowerCase("ms").includes(word));

  function sortWorkbooks(list: PublishedWorkbook[] | DemoWorkbook[]): (typeof list)[number][] {
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "ms"));
    if (sort === "complete") return [...list].sort((a, b) => b.progress - a.progress);
    return [...list].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
  }

  const topics = useMemo(() => {
    const filtered = TOPICS.filter(
      (topic) =>
        (subject === "all" || topic.subjectId === subject) &&
        (year === "all" || topic.yearLabel === year) &&
        matches(`${topic.name} ${topic.blurb} ${subjectById(topic.subjectId).name}`),
    );
    if (sort === "az") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ms"));
    if (sort === "complete") return [...filtered].sort((a, b) => b.workbookCount - a.workbookCount);
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, year, query, sort]);

  const guruWorkbooks = useMemo(() => {
    const filtered = teacherWorkbooks.filter(
      (workbook) =>
        (subject === "all" || workbook.subjectId === subject) &&
        (year === "all" || workbook.yearLabel === year) &&
        (author === "all" || workbook.teacherName === author) &&
        matches(`${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`),
    );
    return sortWorkbooks(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherWorkbooks, subject, year, author, query, sort]);

  const pelajarShared = useMemo(() => {
    const filtered = SHARED_WORKBOOKS.filter(
      (workbook) =>
        (subject === "all" || workbook.subjectId === subject) &&
        (year === "all" || workbook.yearLabel === year) &&
        (author === "all" || communityStudentById(workbook.authorId).name === author) &&
        matches(`${workbook.title} ${workbook.topic} ${communityStudentById(workbook.authorId).name} ${subjectById(workbook.subjectId).name}`),
    );
    if (sort === "az") return [...filtered].sort((a, b) => a.title.localeCompare(b.title, "ms"));
    if (sort === "complete") return [...filtered].sort((a, b) => b.saves - a.saves);
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, year, author, query, sort]);

  const pelajarPublished = useMemo(() => {
    const filtered = studentPublished.filter(
      (workbook) =>
        (subject === "all" || workbook.subjectId === subject) &&
        (year === "all" || workbook.yearLabel === year) &&
        (author === "all" || workbook.teacherName === author) &&
        matches(`${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`),
    );
    return sortWorkbooks(filtered) as PublishedWorkbook[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentPublished, subject, year, author, query, sort]);

  const filtersActive = subject !== "all" || year !== "all" || author !== "all" || sort !== "recent";

  function reset() {
    setQuery("");
    setSubject("all");
    setYear("all");
    setAuthor("all");
    setSort("recent");
  }

  const resultLabel =
    scope === "topik"
      ? `${topics.length} topik`
      : `${scope === "guru" ? guruWorkbooks.length : pelajarShared.length + pelajarPublished.length} buku kerja`;

  return (
    <div className={styles.library} id="explore-library">
      <div className={styles.searchRow}>
        <div className={styles.search}>
          <Search size={21} aria-hidden="true" />
          <label htmlFor="explore-search" className={styles.srOnly}>Cari bahan pembelajaran</label>
          <input id="explore-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari topik atau buku kerja…" autoComplete="off" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Kosongkan carian"><X size={17} /></button>}
        </div>
        <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">{resultLabel}</p>
      </div>

      <div className={styles.scopeTabs} role="group" aria-label="Sumber bahan">
        {SCOPES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.scopeTab}
            aria-pressed={scope === item.id}
            onClick={() => {
              setScope(item.id);
              setAuthor("all");
            }}
          >
            <item.icon size={14} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.filterBar} role="group" aria-label="Tapis bahan pembelajaran">
        <span className={styles.filterField}>
          <label htmlFor="filter-subject" className={styles.srOnly}>Tapis mengikut subjek</label>
          <select id="filter-subject" value={subject} onChange={(event) => setSubject(event.target.value as SubjectId | "all")} className={styles.filterSelect}>
            <option value="all">Semua subjek</option>
            {SUBJECTS.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <ChevronDown className={styles.filterChevron} aria-hidden="true" />
        </span>

        <span className={styles.filterField}>
          <label htmlFor="filter-year" className={styles.srOnly}>Tapis mengikut tingkatan</label>
          <select id="filter-year" value={year} onChange={(event) => setYear(event.target.value)} className={styles.filterSelect}>
            <option value="all">Semua tingkatan</option>
            {yearOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className={styles.filterChevron} aria-hidden="true" />
        </span>

        {scope !== "topik" && (
          <span className={styles.filterField}>
            <label htmlFor="filter-author" className={styles.srOnly}>Tapis mengikut pengarang</label>
            <select id="filter-author" value={author} onChange={(event) => setAuthor(event.target.value)} className={styles.filterSelect}>
              <option value="all">{scope === "pelajar" ? "Semua pelajar" : "Semua guru"}</option>
              {authorOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className={styles.filterChevron} aria-hidden="true" />
          </span>
        )}

        <span className={styles.filterField}>
          <label htmlFor="filter-sort" className={styles.srOnly}>Susun mengikut</label>
          <select id="filter-sort" value={sort} onChange={(event) => setSort(event.target.value as SortId)} className={styles.filterSelect}>
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>Susun: {item.label}</option>
            ))}
          </select>
          <ChevronDown className={styles.filterChevron} aria-hidden="true" />
        </span>

        {filtersActive && (
          <button type="button" onClick={reset} className={styles.resetButton}>
            <RotateCcw size={13} aria-hidden="true" /> Set semula
          </button>
        )}
      </div>

      {scope === "guru" && (
        <section className={styles.topicsSection} aria-label="Buku kerja daripada guru">
          {guruWorkbooks.length === 0 ? (
            <div className={styles.empty}><BookOpen size={30} aria-hidden="true" /><h3>Tiada buku kerja sepadan</h3><p>Cuba kata kunci atau tapisan lain.</p><button type="button" onClick={reset}>Tetapkan semula tapisan</button></div>
          ) : (
            <div className={styles.communityGrid}>{guruWorkbooks.map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} />)}</div>
          )}
        </section>
      )}

      {scope === "pelajar" && (
        <section className={styles.topicsSection} aria-label="Buku kerja daripada pelajar">
          {pelajarShared.length === 0 && pelajarPublished.length === 0 ? (
            <div className={styles.empty}><BookOpen size={30} aria-hidden="true" /><h3>Tiada buku kerja sepadan</h3><p>Cuba kata kunci atau tapisan lain.</p><button type="button" onClick={reset}>Tetapkan semula tapisan</button></div>
          ) : (
            <div className={styles.communityGrid}>
              {pelajarShared.map((workbook) => <SharedWorkbookTile key={workbook.id} workbook={workbook} />)}
              {pelajarPublished.map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} />)}
            </div>
          )}
        </section>
      )}

      {scope === "topik" && (
        <section className={styles.topicsSection} aria-labelledby="topics-title">
          <div className={styles.sectionHeading}><div><h2 id="topics-title">Topik untuk diteroka</h2><p>{subject === "all" ? "Satu idea kecil boleh membuka dunia yang besar." : `Terokai topik ${subjectById(subject).name} mengikut minat anda.`}</p></div><span className={styles.countPill}>{topics.length} topik</span></div>
          {topics.length === 0 ? (
            <div className={styles.empty}><Compass size={32} aria-hidden="true" /><h3>Tiada topik sepadan</h3><p>Cuba kata kunci atau tapisan lain.</p><button type="button" onClick={reset}>Tetapkan semula tapisan</button></div>
          ) : (
            <div className={styles.topicGrid}>
              {topics.map((topic) => {
                const item = subjectById(topic.subjectId);
                const Icon = SUBJECT_ICONS[item.id];
                return (
                  <ContentTile
                    key={topic.id}
                    href={`/explore/topics/${topic.id}`}
                    tint={item.id}
                    art={item.asset}
                    badge={<><Icon size={14} aria-hidden="true" />{item.name}</>}
                    title={topic.name}
                    description={topic.blurb}
                    footer={<><span><BookOpen size={13} aria-hidden="true" />{topic.workbookCount} buku kerja</span>{topic.quizCount > 0 && <span><ListChecks size={13} aria-hidden="true" />{topic.quizCount} kuiz</span>}</>}
                    footerEnd={<ArrowRight size={16} className={styles.topicArrow} aria-hidden="true" />}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className={styles.workbooksSection} aria-labelledby="community-title">
        <div className={styles.sectionHeading}><div><h2 id="community-title">Buku kerja saya</h2><p>Semua buku kerja peribadi dan yang anda langgan.</p></div><Link href="/workbooks" className={styles.textLink}>Buka perpustakaan <ArrowRight size={17} /></Link></div>
      </section>
    </div>
  );
}
