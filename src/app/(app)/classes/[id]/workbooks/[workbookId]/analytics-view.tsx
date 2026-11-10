"use client";

import Link from "next/link";
import { ArrowLeft, Check, ListChecks, Users } from "lucide-react";
import type { WorkbookAnalytics } from "@/lib/workbook-analytics";
import { formatDue, formatRelativeTime } from "@/lib/assignment-status";
import { moduleKindLabel } from "@/lib/module-kinds";
import styles from "../../../classes.module.css";
import content from "@/components/studio/content-width.module.css";

function scoreTone(percent: number | null) {
  if (percent === null) return styles.badgeMuted;
  if (percent >= 75) return styles.badgeDone;
  if (percent >= 40) return styles.badgeMuted;
  return styles.badgeWarn;
}

export function WorkbookAnalyticsView({
  classId,
  className,
  analytics,
}: {
  classId: string;
  className: string;
  analytics: WorkbookAnalytics;
}) {
  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <div className={styles.detailHead}>
          <Link href={`/classes/${classId}?tab=assignments`} className={styles.back}>
            <ArrowLeft size={14} aria-hidden="true" />Kembali ke {className}
          </Link>
          <div className={styles.detailTitleRow}>
            <h1>{analytics.workbookTitle}</h1>
            {analytics.moduleKinds === null ? (
              <span className={styles.chip}>Semua modul</span>
            ) : (
              analytics.moduleKinds.map((kind) => (
                <span key={kind} className={styles.chip}>{moduleKindLabel(kind)}</span>
              ))
            )}
          </div>
          <p className={styles.detailSub}>
            Analitik kelas {className}
            {analytics.dueAt ? ` · Tarikh akhir ${formatDue(analytics.dueAt)}` : ""}
          </p>
        </div>

        <section className={styles.summaryCards} aria-label="Ringkasan">
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}><Users size={14} aria-hidden="true" />Pelajar</span>
            <strong>{analytics.memberCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}><Check size={14} aria-hidden="true" />Selesai</span>
            <strong>{analytics.completedCount}/{analytics.memberCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}><ListChecks size={14} aria-hidden="true" />Percubaan kuiz</span>
            <strong>{analytics.attemptCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Purata skor</span>
            <strong>{analytics.avgPercent === null ? "—" : `${analytics.avgPercent}%`}</strong>
          </div>
        </section>

        <section className={styles.roster} aria-label="Kemajuan pelajar">
          <div className={`${styles.rosterRow} ${styles.progressRow} ${styles.rosterHead}`}>
            <span>Pelajar</span>
            <span>Percubaan</span>
            <span>Terbaik</span>
            <span>Aktiviti terakhir</span>
          </div>
          {analytics.students.length === 0 ? (
            <p className={styles.rosterEmpty}>Belum ada pelajar menyertai kelas ini.</p>
          ) : (
            analytics.students.map((student) => (
              <div key={student.id} className={`${styles.rosterRow} ${styles.progressRow}`}>
                <span className={styles.rosterName}>
                  <span className={styles.rosterAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
                  <span>
                    <strong>{student.name}</strong>
                    <small>{student.completed ? "Selesai ✓" : student.className}</small>
                  </span>
                </span>
                <span className={styles.rosterCell}>{student.attemptCount > 0 ? student.attemptCount : "—"}</span>
                <span className={styles.rosterCell}>
                  {student.bestPercent === null ? (
                    "Belum mencuba"
                  ) : (
                    <span className={`${styles.badge} ${scoreTone(student.bestPercent)}`}>{student.bestPercent}%</span>
                  )}
                </span>
                <span className={styles.rosterCell}>
                  {student.lastActivityAt ? formatRelativeTime(student.lastActivityAt) : "—"}
                </span>
              </div>
            ))
          )}
        </section>

        {analytics.quizzes.length === 0 ? (
          <div className={styles.placeholder}>
            <h3>Tiada kuiz sedia</h3>
            <p>Jana kuiz dalam buku kerja ini untuk melihat analisis jawapan pelajar di sini.</p>
          </div>
        ) : (
          analytics.quizzes.map((quiz) => (
            <section key={quiz.artifactId} className={styles.quizCard} aria-label={quiz.title}>
              <header className={styles.quizCardHead}>
                <h3>{quiz.title}</h3>
                <div className={styles.quizStats}>
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>{quiz.attemptCount} percubaan</span>
                  <span className={`${styles.badge} ${scoreTone(quiz.avgPercent)}`}>Purata {quiz.avgPercent === null ? "—" : `${quiz.avgPercent}%`}</span>
                  <span className={`${styles.badge} ${scoreTone(quiz.bestPercent)}`}>Terbaik {quiz.bestPercent === null ? "—" : `${quiz.bestPercent}%`}</span>
                </div>
              </header>

              <details className={styles.details}>
                <summary>Analisis soalan ({quiz.questions.length} soalan)</summary>
                {quiz.attemptCount === 0 ? (
                  <p className={styles.detailsEmpty}>Belum ada percubaan — analisis akan muncul selepas pelajar menjawab.</p>
                ) : (
                  <div className={styles.questionRows}>
                    {quiz.questions.map((question) => (
                      <div key={question.index} className={styles.questionRow}>
                        <span className={styles.questionText}>
                          {question.index + 1}. {question.question}
                        </span>
                        <span className={styles.questionBar} aria-hidden="true">
                          <span style={{ width: `${question.correctPercent}%` }} data-tone={question.correctPercent >= 75 ? "good" : question.correctPercent >= 40 ? "mid" : "low"} />
                        </span>
                        <span className={styles.questionMeta}>
                          {question.correctPercent}% betul · {question.answeredCount} jawapan
                          {question.commonWrong ? ` · kesilapan biasa: “${question.commonWrong}”` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </details>

              <details className={styles.details}>
                <summary>Percubaan pelajar ({quiz.studentAttempts.length})</summary>
                {quiz.studentAttempts.length === 0 ? (
                  <p className={styles.detailsEmpty}>Belum ada pelajar mencuba kuiz ini.</p>
                ) : (
                  <div className={styles.studentAttemptRows}>
                    {quiz.studentAttempts.map((student) => (
                      <div key={student.studentId} className={styles.studentAttemptRow}>
                        <strong>{student.studentName}</strong>
                        <span className={styles.attemptChips}>
                          {student.attempts.map((attempt, index) => (
                            <em key={index} className={styles.attemptChip}>
                              {attempt.score}/{attempt.total} · {formatRelativeTime(attempt.completedAt)}
                            </em>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </details>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
