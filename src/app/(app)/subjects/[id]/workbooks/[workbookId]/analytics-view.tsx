"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  Check,
  Lightbulb,
  ListChecks,
  Sparkles,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { QuestionStat, StudentAnalyticsRow, WorkbookAnalytics } from "@/lib/workbook-analytics";
import { formatDue, formatRelativeTime } from "@/lib/assignment-status";
import { moduleKindLabel } from "@/lib/module-kinds";
import { findSubject } from "@/lib/demo-data";
import styles from "../../../classes.module.css";
import content from "@/components/studio/content-width.module.css";

/* ---------- stat cards ---------- */

function StatCard({ icon: Icon, tone, label, value, sub, trend }: { icon: LucideIcon; tone: string; label: string; value: string; sub: string; trend?: "up" | "down" | null }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon} data-tone={tone} aria-hidden="true"><Icon size={17} /></span>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <strong className={styles.statValue}>{value}</strong>
        {sub && (
          <span className={styles.statSub} data-trend={trend ?? undefined}>
            {trend === "up" && <TrendingUp size={12} aria-hidden="true" />}
            {trend === "down" && <TrendingDown size={12} aria-hidden="true" />}
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- charts ---------- */

function ProgressionChart({ points }: { points: { label: string; percent: number }[] }) {
  const W = 560;
  const H = 220;
  const padL = 46;
  const padR = 18;
  const padT = 32;
  const padB = 38;
  const innerW = W - padL - padR;
  const y = (percent: number) => padT + (1 - percent / 100) * (H - padT - padB);
  const x = (index: number) => (points.length === 1 ? padL + innerW / 2 : padL + (index * innerW) / (points.length - 1));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.percent)}`).join(" ");
  const area = points.length >= 2 ? `${line} L${x(points.length - 1)},${H - padB} L${x(0)},${H - padB} Z` : "";

  return (
    <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Prestasi keseluruhan mengikut pusingan percubaan">
      <defs>
        <linearGradient id="progressionFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0aa98f" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0aa98f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80, 100].map((value) => (
        <g key={value}>
          <line x1={padL} x2={W - padR} y1={y(value)} y2={y(value)} stroke="#eef0f9" strokeWidth="1" />
          <text x={padL - 9} y={y(value) + 3.5} textAnchor="end" fontSize="10" fill="#9aa0bd">{value}%</text>
        </g>
      ))}
      {area && <path d={area} fill="url(#progressionFill)" />}
      {points.length >= 2 && <path d={line} fill="none" stroke="#0aa98f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((point, index) => {
        const cx = x(index);
        const cy = y(point.percent);
        const bubbleX = Math.min(Math.max(cx, padL + 24), W - padR - 24);
        return (
          <g key={point.label}>
            <circle cx={cx} cy={cy} r="4.5" fill="#0aa98f" stroke="#ffffff" strokeWidth="2" />
            <rect x={bubbleX - 23} y={cy - 30} width="46" height="20" rx="10" fill="#ffffff" stroke="#e2e7f4" />
            <text x={bubbleX} y={cy - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#10112f">{point.percent}%</text>
            <text x={cx} y={H - 14} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#9aa0bd">{point.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ high, mid, low, avg }: { high: number; mid: number; low: number; avg: number | null }) {
  const total = high + mid + low;
  const r = 62;
  const C = 2 * Math.PI * r;
  const segments = [
    { count: high, color: "#0aa98f" },
    { count: mid, color: "#f0b429" },
    { count: low, color: "#ef6b6b" },
  ];
  let offset = 0;
  const arcs = segments.map((segment) => {
    const share = total ? segment.count / total : 0;
    const gap = segment.count > 0 && total > 1 ? 5 : 0;
    const length = Math.max(share * C - gap, 0);
    const arc = { ...segment, length, offset };
    offset += share * C;
    return arc;
  });

  return (
    <svg className={styles.donutSvg} viewBox="0 0 200 200" role="img" aria-label="Taburan skor pelajar">
      <g transform="rotate(-90 100 100)">
        {total === 0 ? (
          <circle cx="100" cy="100" r={r} fill="none" stroke="#eef0f9" strokeWidth="26" />
        ) : (
          arcs.map((arc, index) =>
            arc.count > 0 ? (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth="26"
                strokeLinecap="butt"
                strokeDasharray={`${arc.length} ${C - arc.length}`}
                strokeDashoffset={-arc.offset}
              />
            ) : null,
          )
        )}
      </g>
      <text x="100" y="94" textAnchor="middle" fontSize="11" fill="#9aa0bd">Purata</text>
      <text x="100" y="118" textAnchor="middle" fontSize="24" fontWeight="800" fill="#10112f">{avg === null ? "—" : `${avg}%`}</text>
    </svg>
  );
}

function Sparkline({ points, direction }: { points: number[]; direction: "up" | "down" | "flat" }) {
  const color = direction === "up" ? "#0aa98f" : direction === "down" ? "#ef6b6b" : "#9aa0bd";
  const W = 64;
  const H = 22;
  const x = (index: number) => 3 + (index * (W - 6)) / (points.length - 1);
  const y = (percent: number) => 3 + (1 - percent / 100) * (H - 6);
  const line = points.map((percent, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(percent)}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r="2.6" fill={color} />
    </svg>
  );
}

/* ---------- tables ---------- */

function bestTone(percent: number | null) {
  if (percent === null) return styles.badgeMuted;
  if (percent >= 80) return styles.badgeDone;
  if (percent >= 50) return styles.badgeAmber;
  return styles.badgeWarn;
}

function StudentTable({ students }: { students: StudentAnalyticsRow[] }) {
  return (
    <div className={styles.dataTable} role="table" aria-label="Prestasi pelajar">
      <div className={`${styles.dataRow} ${styles.dataRowStudents} ${styles.dataHead}`} role="row">
        <span>Pelajar</span>
        <span>Percubaan</span>
        <span>Skor Terbaik</span>
        <span>Purata Skor</span>
        <span>Trend</span>
        <span>Aktiviti terakhir</span>
      </div>
      {students.length === 0 ? (
        <p className={styles.tableEmpty}>Belum ada pelajar menyertai subjek ini.</p>
      ) : (
        students.map((student) => (
          <div key={student.id} className={`${styles.dataRow} ${styles.dataRowStudents}`} role="row">
            <span className={styles.rosterName}>
              <span className={styles.rosterAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
              <span>
                <strong>{student.name}</strong>
                <small>{student.completed ? "Selesai ✓" : student.className}</small>
              </span>
            </span>
            <span className={styles.dataCell}>{student.attemptCount > 0 ? student.attemptCount : "—"}</span>
            <span className={styles.dataCell}>
              {student.bestPercent === null ? "—" : <span className={`${styles.badge} ${bestTone(student.bestPercent)}`}>{student.bestPercent}%</span>}
            </span>
            <span className={styles.dataCell}>{student.avgPercent === null ? "—" : `${student.avgPercent}%`}</span>
            <span className={styles.dataCell}>
              {student.trend ? (
                <span className={styles.trendCell} data-direction={student.trend.direction}>
                  <Sparkline points={student.trend.points} direction={student.trend.direction} />
                  <em>{student.trend.delta > 0 ? `+${student.trend.delta}` : student.trend.delta}%</em>
                </span>
              ) : (
                "—"
              )}
            </span>
            <span className={styles.dataCell}>{student.lastActivityAt ? formatRelativeTime(student.lastActivityAt) : "—"}</span>
          </div>
        ))
      )}
    </div>
  );
}

function MasteryBars({ questions }: { questions: QuestionStat[] }) {
  if (questions.length === 0) {
    return <p className={styles.tableEmpty}>Tiada soalan kuiz sedia untuk dianalisis.</p>;
  }
  return (
    <div className={styles.masteryList}>
      {questions.map((question) => (
        <div key={`${question.quizTitle}_${question.index}`} className={styles.masteryRow}>
          <span className={styles.masteryLabel} title={question.question}>{question.question}</span>
          <span className={styles.masteryTrack} aria-hidden="true">
            <span
              className={styles.masteryFill}
              style={{ width: `${question.correctPercent}%` }}
              data-tone={question.correctPercent >= 75 ? "good" : question.correctPercent >= 40 ? "mid" : "low"}
            />
          </span>
          <span className={styles.masteryPct}>{question.correctPercent}%</span>
        </div>
      ))}
    </div>
  );
}

function QuizAnalysisCard({ quiz }: { quiz: WorkbookAnalytics["quizzes"][number] }) {
  const [sort, setSort] = useState<"correct" | "wrong">("correct");
  const rows = useMemo(
    () =>
      [...quiz.questions].sort((a, b) =>
        sort === "correct" ? b.correctPercent - a.correctPercent : a.correctPercent - b.correctPercent,
      ),
    [quiz.questions, sort],
  );

  return (
    <section className={styles.dataCard} aria-label={`Analisis ${quiz.title}`}>
      <div className={styles.dataCardHead}>
        <h3>{quiz.title}</h3>
        <div className={styles.quizStats}>
          <span className={`${styles.badge} ${styles.badgeMuted}`}>{quiz.attemptCount} percubaan</span>
          <span className={`${styles.badge} ${bestTone(quiz.avgPercent)}`}>Purata {quiz.avgPercent === null ? "—" : `${quiz.avgPercent}%`}</span>
          <span className={`${styles.badge} ${bestTone(quiz.bestPercent)}`}>Terbaik {quiz.bestPercent === null ? "—" : `${quiz.bestPercent}%`}</span>
        </div>
      </div>

      <div className={styles.filterChips} role="group" aria-label="Susun analisis soalan">
        <button type="button" className={styles.chipBtn} aria-pressed={sort === "correct"} onClick={() => setSort("correct")}>Kadar Betul</button>
        <button type="button" className={styles.chipBtn} aria-pressed={sort === "wrong"} onClick={() => setSort("wrong")}>Kadar Salah</button>
      </div>

      {quiz.attemptCount === 0 ? (
        <p className={styles.tableEmpty}>Belum ada percubaan — analisis akan muncul selepas pelajar menjawab.</p>
      ) : (
        <>
          <div className={styles.dataTable} role="table" aria-label={`Analisis soalan ${quiz.title}`}>
            <div className={`${styles.dataRow} ${styles.dataRowQuestions} ${styles.dataHead}`} role="row">
              <span>#</span>
              <span>Soalan</span>
              <span>Kadar Betul</span>
              <span>Bil. Jawapan</span>
            </div>
            {rows.map((question) => (
              <div key={question.index} className={`${styles.dataRow} ${styles.dataRowQuestions}`} role="row">
                <span className={styles.dataCell}>{question.index + 1}</span>
                <span className={styles.questionCell}>
                  <strong>{question.question}</strong>
                  {question.commonWrong && <small>Kesilapan biasa: “{question.commonWrong}”</small>}
                </span>
                <span className={styles.dataCell}>
                  <span className={`${styles.badge} ${bestTone(question.correctPercent)}`}>{question.correctPercent}%</span>
                </span>
                <span className={styles.dataCell}>{question.answeredCount}</span>
              </div>
            ))}
          </div>

          <div className={styles.attemptsBlock}>
            <h4>Percubaan pelajar ({quiz.studentAttempts.length})</h4>
            {quiz.studentAttempts.length === 0 ? (
              <p className={styles.tableEmpty}>Belum ada pelajar mencuba kuiz ini.</p>
            ) : (
              quiz.studentAttempts.map((student) => (
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
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

function InsightsCard({ insights, hasAttempts }: { insights: WorkbookAnalytics["insights"]; hasAttempts: boolean }) {
  const blocks = [
    {
      icon: TrendingUp,
      tone: "good",
      title: "Kekuatan",
      items: insights.strengths.length ? insights.strengths : [hasAttempts ? "Belum cukup data untuk mengenal pasti kekuatan." : "Tiada data lagi."],
    },
    {
      icon: TriangleAlert,
      tone: "focus",
      title: "Perlu Penekanan",
      items: insights.focus.length ? insights.focus : [hasAttempts ? "Tiada — semua soalan dikuasai melebihi 50%." : "Tiada data lagi."],
    },
    {
      icon: Lightbulb,
      tone: "idea",
      title: "Cadangan",
      items: insights.recommendations.length ? insights.recommendations : ["Teruskan memantau kemajuan pelajar."],
    },
  ];
  return (
    <section className={`${styles.dataCard} ${styles.insightsCard}`} aria-label="Insights AI" id="insights">
      <div className={styles.dataCardHead}>
        <h3 className={styles.insightsTitle}><Sparkles size={16} aria-hidden="true" />Insights AI</h3>
      </div>
      <div className={styles.insightList}>
        {blocks.map((block) => (
          <div key={block.title} className={styles.insightBlock}>
            <span className={styles.insightIcon} data-tone={block.tone} aria-hidden="true"><block.icon size={16} /></span>
            <div>
              <strong>{block.title}</strong>
              <ul>
                {block.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export function WorkbookAnalyticsView({
  classId,
  className,
  analytics,
}: {
  classId: string;
  className: string;
  analytics: WorkbookAnalytics;
}) {
  const subject = findSubject(analytics.subjectId);
  const allQuestions = analytics.quizzes.flatMap((quiz) => quiz.questions);

  const anchors = [
    { href: "#analitik", label: "Analitik", icon: ChartNoAxesColumnIncreasing },
    { href: "#pelajar", label: "Pelajar", icon: Users },
    { href: "#kuiz", label: "Kuiz", icon: ListChecks },
    { href: "#insights", label: "Insights AI", icon: Sparkles },
  ];

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <header className={styles.detailHero}>
          <div className={styles.detailHeroCopy}>
            <Link href={`/subjects/${classId}?tab=assignments`} className={styles.back}>
              <ArrowLeft size={14} aria-hidden="true" />Kembali ke {className}
            </Link>
            <div className={styles.detailTitleRow}>
              <h1>{analytics.workbookTitle}</h1>
              {subject && <span className={styles.chip}>{subject.name}</span>}
              {analytics.moduleKinds === null ? (
                <span className={styles.chip}>Semua modul</span>
              ) : (
                analytics.moduleKinds.map((kind) => (
                  <span key={kind} className={styles.chip}>{moduleKindLabel(kind)}</span>
                ))
              )}
            </div>
            <p className={styles.detailSub}>
              Analitik subjek {className}
              {analytics.dueAt ? ` · Tarikh akhir ${formatDue(analytics.dueAt)}` : ""}
            </p>
          </div>
          <div className={styles.detailHeroArt} aria-hidden="true">
            <span className={styles.detailBlob} />
            <Image src={subject?.asset ?? "/assets/thiings/graduation.png"} alt="" width={150} height={150} />
          </div>
        </header>

        <nav className={styles.anchorBar} aria-label="Bahagian analitik">
          {anchors.map((anchor) => (
            <a key={anchor.href} href={anchor.href} className={styles.anchorLink}>
              <anchor.icon size={15} aria-hidden="true" />{anchor.label}
            </a>
          ))}
        </nav>

        <section className={styles.statGrid} id="analitik" aria-label="Ringkasan">
          <StatCard icon={Users} tone="teal" label="Jumlah Pelajar" value={String(analytics.memberCount)} sub={`${analytics.activeStudents} aktif dalam subjek`} />
          <StatCard icon={Check} tone="green" label="Selesai" value={`${analytics.completedCount}/${analytics.memberCount}`} sub={`${analytics.completionRate}% kadar selesai`} />
          <StatCard icon={ListChecks} tone="purple" label="Percubaan Kuiz" value={String(analytics.attemptCount)} sub={`${analytics.attemptsPerStudent} percubaan / pelajar`} />
          <StatCard
            icon={ChartNoAxesColumnIncreasing}
            tone="teal"
            label="Purata Skor"
            value={analytics.avgPercent === null ? "—" : `${analytics.avgPercent}%`}
            sub={analytics.improvementDelta !== null ? `${analytics.improvementDelta >= 0 ? "+" : ""}${analytics.improvementDelta}% berbanding percubaan pertama` : "Belum cukup percubaan"}
            trend={analytics.improvementDelta === null ? null : analytics.improvementDelta >= 0 ? "up" : "down"}
          />
          <StatCard
            icon={Trophy}
            tone="amber"
            label="Skor Tertinggi"
            value={analytics.bestPercent === null ? "—" : `${analytics.bestPercent}%`}
            sub={analytics.bestStudentName ?? "Belum ada percubaan"}
          />
        </section>

        <div className={styles.chartGrid}>
          <section className={styles.dataCard} aria-label="Prestasi keseluruhan">
            <div className={styles.dataCardHead}>
              <h3>Prestasi Keseluruhan</h3>
              <span className={styles.cardNote}>Purata skor setiap pusingan percubaan</span>
            </div>
            {analytics.progression.length === 0 ? (
              <p className={styles.tableEmpty}>Belum ada percubaan kuiz untuk dipaparkan.</p>
            ) : (
              <ProgressionChart points={analytics.progression} />
            )}
          </section>

          <section className={styles.dataCard} aria-label="Taburan skor pelajar">
            <div className={styles.dataCardHead}>
              <h3>Taburan Skor Pelajar</h3>
            </div>
            <div className={styles.donutWrap}>
              <DonutChart high={analytics.distribution.high} mid={analytics.distribution.mid} low={analytics.distribution.low} avg={analytics.avgPercent} />
              <div className={styles.legend}>
                {[
                  { color: "#0aa98f", label: "≥ 80%", count: analytics.distribution.high },
                  { color: "#f0b429", label: "50–79%", count: analytics.distribution.mid },
                  { color: "#ef6b6b", label: "< 50%", count: analytics.distribution.low },
                ].map((item) => (
                  <div key={item.label} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: item.color }} aria-hidden="true" />
                    <div>
                      <strong>{item.label}</strong>
                      <small>
                        {item.count} pelajar
                        {analytics.distribution.withAttempts > 0 ? ` (${Math.round((item.count / analytics.distribution.withAttempts) * 100)}%)` : ""}
                      </small>
                    </div>
                  </div>
                ))}
                {analytics.memberCount > analytics.distribution.withAttempts && (
                  <p className={styles.legendNote}>{analytics.memberCount - analytics.distribution.withAttempts} pelajar belum mencuba</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className={styles.chartGrid}>
          <section className={styles.dataCard} id="pelajar" aria-label="Prestasi pelajar">
            <div className={styles.dataCardHead}>
              <h3>Prestasi Pelajar</h3>
            </div>
            <StudentTable students={analytics.students} />
          </section>

          <section className={styles.dataCard} aria-label="Tahap penguasaan">
            <div className={styles.dataCardHead}>
              <h3>Tahap Penguasaan</h3>
              <span className={styles.cardNote}>Kadar betul setiap soalan</span>
            </div>
            <MasteryBars questions={allQuestions} />
          </section>
        </div>

        <div className={styles.chartGrid} id="kuiz">
          <div className={styles.quizColumn}>
            {analytics.quizzes.length === 0 ? (
              <section className={styles.dataCard}>
                <p className={styles.tableEmpty}>Tiada kuiz sedia — jana kuiz dalam buku kerja ini untuk analisis jawapan pelajar.</p>
              </section>
            ) : (
              analytics.quizzes.map((quiz) => <QuizAnalysisCard key={quiz.artifactId} quiz={quiz} />)
            )}
          </div>
          <InsightsCard insights={analytics.insights} hasAttempts={analytics.attemptCount > 0} />
        </div>
      </main>
    </div>
  );
}
