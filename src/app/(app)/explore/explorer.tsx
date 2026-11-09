"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Compass, ListChecks, Search, X } from "lucide-react";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { WorkbookTile } from "@/app/(app)/workbooks/workbook-list";
import { SUBJECTS, TOPICS, WORKBOOKS, subjectById, type SubjectId } from "@/lib/demo-data";
import styles from "./explore.module.css";

export function Explorer() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const words = useMemo(() => query.trim().toLocaleLowerCase("ms").split(/\s+/).filter(Boolean), [query]);
  const matches = (text: string) => words.every((word) => text.toLocaleLowerCase("ms").includes(word));

  const topics = TOPICS.filter((topic) => (subject === "all" || topic.subjectId === subject) && matches(`${topic.name} ${topic.blurb} ${subjectById(topic.subjectId).name}`));
  const workbooks = WORKBOOKS.filter((workbook) => (subject === "all" || workbook.subjectId === subject) && matches(`${workbook.title} ${workbook.topic} ${workbook.teacherName} ${subjectById(workbook.subjectId).name}`));

  function reset() { setQuery(""); setSubject("all"); }

  return (
    <div className={styles.library} id="explore-library">
      <div className={styles.searchRow}>
        <div className={styles.search}>
          <Search size={21} aria-hidden="true" />
          <label htmlFor="explore-search" className={styles.srOnly}>Cari bahan pembelajaran</label>
          <input id="explore-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari topik, subjek atau buku kerja…" autoComplete="off" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Kosongkan carian"><X size={17} /></button>}
        </div>
        <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true"><strong>{topics.length}</strong> topik <span>·</span> <strong>{workbooks.length}</strong> buku kerja</p>
      </div>

      <section role="group" aria-label="Tapis mengikut subjek" className={styles.subjectSection}>
        <div className={styles.sectionHeading}>
          <div><h2>Pilih destinasi anda</h2><p>Dari nombor hingga alam semula jadi. Apa yang ingin anda teroka?</p></div>
          <button type="button" className={styles.allSubjects} aria-pressed={subject === "all"} onClick={() => setSubject("all")}>Semua subjek</button>
        </div>
        <div className={styles.subjectGrid}>
          {SUBJECTS.map((item) => (
            <button type="button" key={item.id} className={styles.subjectCard} data-subject={item.id} onClick={() => setSubject(item.id)} aria-pressed={subject === item.id}>
              <Image src={item.asset} alt="" width={86} height={86} />
              <strong>{item.name}</strong>
              <span>{TOPICS.filter((topic) => topic.subjectId === item.id).length} topik</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.topicsSection} aria-labelledby="topics-title">
        <div className={styles.sectionHeading}><div><h2 id="topics-title">Topik untuk diteroka</h2><p>{subject === "all" ? "Satu idea kecil boleh membuka dunia yang besar." : `Terokai topik ${subjectById(subject).name} mengikut minat anda.`}</p></div><span className={styles.countPill}>{topics.length} topik</span></div>
        {topics.length === 0 ? <div className={styles.empty}><Compass size={32} aria-hidden="true" /><h3>Tiada topik sepadan</h3><p>Cuba kata kunci atau subjek lain.</p><button type="button" onClick={reset}>Tetapkan semula carian</button></div> : (
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

      <section className={styles.workbooksSection} aria-labelledby="community-title">
        <div className={styles.sectionHeading}><div><h2 id="community-title">Belajar bersama komuniti</h2><p>Buku kerja yang dikongsi untuk membantu anda melangkah lebih jauh.</p></div><Link href="/workbooks" className={styles.textLink}>Buku kerja saya <ArrowRight size={17} /></Link></div>
        {workbooks.length === 0 ? <div className={styles.empty}><BookOpen size={30} aria-hidden="true" /><h3>Tiada buku kerja sepadan</h3><p>Cuba kata kunci atau subjek lain.</p><button type="button" onClick={reset}>Tetapkan semula carian</button></div> : (
          <div className={styles.communityGrid}>{workbooks.map((workbook) => <WorkbookTile key={workbook.id} workbook={workbook} />)}</div>
        )}
      </section>
    </div>
  );
}
