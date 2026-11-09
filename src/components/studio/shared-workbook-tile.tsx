"use client";

import { ArrowRight, Flame, Users, UsersRound } from "lucide-react";
import { ContentTile } from "@/components/studio/content-tile";
import { communityStudentById, subjectById, type DemoSharedWorkbook } from "@/lib/demo-data";
import { useSocial } from "@/lib/demo-social";
import styles from "./shared-workbook-tile.module.css";

export function SharedWorkbookTile({ workbook }: { workbook: DemoSharedWorkbook }) {
  const { subscribed } = useSocial();
  const author = communityStudentById(workbook.authorId);
  const subject = subjectById(workbook.subjectId);
  const isSubscribed = subscribed.includes(workbook.id);
  return (
    <ContentTile
      href={`/community/workbooks/${workbook.id}`}
      tint={subject.id}
      art={workbook.asset}
      badge={<><UsersRound size={14} aria-hidden="true" />{author.name}</>}
      title={workbook.title}
      description={workbook.topic}
      footer={
        <>
          <span><Users size={13} aria-hidden="true" />{workbook.subscribers + (isSubscribed ? 1 : 0)} pelanggan</span>
          {isSubscribed && workbook.yourStreak ? <span><Flame size={13} aria-hidden="true" />{workbook.yourStreak} hari</span> : null}
        </>
      }
      footerEnd={<ArrowRight size={16} className={styles.arrow} aria-hidden="true" />}
    />
  );
}
