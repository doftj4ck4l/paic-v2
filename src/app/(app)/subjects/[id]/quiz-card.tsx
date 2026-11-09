import { ArrowRight, ListChecks } from "lucide-react";
import { ContentTile } from "@/components/studio/content-tile";
import { subjectById, type DemoQuizItem } from "@/lib/demo-data";
import styles from "../subjects.module.css";

const STATUS_LABEL = {
  new: "Baharu",
  "in-progress": "Dalam proses",
  done: "Selesai",
} as const;

export function QuizCard({ quiz }: { quiz: DemoQuizItem }) {
  const subject = subjectById(quiz.subjectId);
  return (
    <ContentTile
      href={quiz.status === "done" ? `/quizzes/${quiz.id}/hasil` : `/quizzes/${quiz.id}`}
      tint={quiz.subjectId}
      art={subject.asset}
      badge={<><ListChecks size={14} aria-hidden="true" />Kuiz</>}
      title={quiz.title}
      description={`${quiz.due} · ${quiz.teacherName}`}
      footer={
        <span className={styles.statusChip} data-status={quiz.status}>
          {STATUS_LABEL[quiz.status]}
          {quiz.score ? ` · ${quiz.score}` : ""}
        </span>
      }
      footerEnd={<ArrowRight size={16} className={styles.quizArrow} aria-hidden="true" />}
    />
  );
}
