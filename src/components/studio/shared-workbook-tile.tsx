"use client";

import { ArrowRight, Bookmark, Users } from "lucide-react";
import { ContentTile } from "@/components/studio/content-tile";
import { communityStudentById, subjectById, type DemoSharedWorkbook } from "@/lib/demo-data";
import { toggleSave, useSocial } from "@/lib/demo-social";
import styles from "./shared-workbook-tile.module.css";

export function SharedWorkbookTile({ workbook }: { workbook: DemoSharedWorkbook }) {
  const { saved } = useSocial();
  const author = communityStudentById(workbook.authorId);
  const subject = subjectById(workbook.subjectId);
  const isSaved = saved.includes(workbook.id);
  return (
    <ContentTile
      href={`/community/workbooks/${workbook.id}`}
      tint={subject.id}
      art={workbook.asset}
      badge={<><Users size={14} aria-hidden="true" />Oleh {author.name}</>}
      title={workbook.title}
      description={workbook.topic}
      footer={
        <>
          <span><Bookmark size={13} aria-hidden="true" />{workbook.saves + (isSaved ? 1 : 0)} simpanan</span>
          <span>{subject.name}</span>
        </>
      }
      footerEnd={<ArrowRight size={16} className={styles.arrow} aria-hidden="true" />}
      menu={
        <button
          type="button"
          onClick={() => toggleSave(workbook.id)}
          aria-pressed={isSaved}
          data-saved={isSaved}
          aria-label={isSaved ? `Buang ${workbook.title} daripada simpanan` : `Simpan ${workbook.title}`}
          className={styles.saveButton}
        >
          <Bookmark aria-hidden="true" />
        </button>
      }
    />
  );
}
