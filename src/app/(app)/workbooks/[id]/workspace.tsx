"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  NotebookPen,
  ListChecks,
  Presentation,
  Network,
  Headphones,
  BookOpenCheck,
  Check,
  Eye,
  Layers,
  MessageSquareText,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { ChatTab } from "./chat-tab";
import { WorkbookSourcesProvider, useWorkbookSources } from "@/lib/workbook/use-sources";
import { QuizzesTab } from "./quizzes-tab";
import { ModulesTab } from "./modules-tab";
import { SUBJECT_ICONS } from "@/components/studio/content-tile";
import { toggleSavedWorkbook, useSavedWorkbooks } from "@/lib/saved-workbooks";
import content from "@/components/studio/content-width.module.css";
import {
  subjectById,
  type DemoCreation,
  type SubjectId,
} from "@/lib/demo-data";
import { SourcesTab } from "./sources-tab";
import type { AppWorkbook } from "@/lib/workbooks";
import type { SourceSnapshot } from "@/lib/workbook/use-sources";
import styles from "./workbook.module.css";

type TabId = "sumber" | "sembang" | DemoCreation["kind"];

const COVER_ART: Partial<Record<SubjectId, string>> = {
  science: "/assets/thiings/workbook-flask.png",
  math: "/assets/thiings/workbook-calculator.png",
  language: "/assets/thiings/workbook-pencil.png",
};

const MODULE_ICONS = { notes: NotebookPen, quizzes: ListChecks, flashcards: Layers, slides: Presentation, mindmaps: Network, audio: Headphones, "study-guides": BookOpenCheck };

const MODULE_TABS: { kind: DemoCreation["kind"]; label: string }[] = [
  { kind: "notes", label: "Nota" },
  { kind: "quizzes", label: "Kuiz" },
  { kind: "flashcards", label: "Kad Imbas" },
  { kind: "slides", label: "Slaid" },
  { kind: "mindmaps", label: "Peta Minda" },
  { kind: "audio", label: "Audio" },
  { kind: "study-guides", label: "Panduan Ulang Kaji" },
];

type WorkspaceProps = { workbook: AppWorkbook; viewerId: string | null; initialTab?: TabId; initialSources?: SourceSnapshot | null };
export function WorkbookWorkspace(props: WorkspaceProps) {
  return <WorkbookSourcesProvider key={props.workbook.id} workbookId={props.workbook.id} initial={props.initialSources}><WorkbookWorkspaceInner {...props} /></WorkbookSourcesProvider>;
}
function WorkbookWorkspaceInner({ workbook, viewerId, initialTab = "sumber" }: WorkspaceProps) {
  const sourceState = useWorkbookSources(workbook.id);
  const [visited, setVisited] = useState<TabId[]>([initialTab]);
  const isOwner = workbook.isDb && workbook.ownerId === viewerId;
  // Non-owners (including everyone on demo workbooks) get the read-only experience.
  const readOnly = !isOwner;
  const [visibility, setVisibility] = useState(workbook.visibility);
  const [publishing, setPublishing] = useState(false);
  const isPublished = visibility === "published";

  async function togglePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/workbooks/${workbook.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !isPublished }),
      });
      if (res.ok) {
        const payload = (await res.json()) as { visibility: "private" | "published" };
        setVisibility(payload.visibility);
      }
    } finally {
      setPublishing(false);
    }
  }
  const subject = subjectById(workbook.subjectId);
  const SubjectIcon = SUBJECT_ICONS[subject.id];
  const modules = MODULE_TABS;
  const [readyModules, setReadyModules] = useState<number | null>(null);
  // Live progress: share of the 7 module kinds that are ready (falls back to the
  // server-computed value until the artifact counts load).
  const liveProgress = readyModules === null ? workbook.progress : Math.round((readyModules / modules.length) * 100);

  useEffect(() => {
    let cancelled = false;
    async function refreshCounts() {
      try {
        const response = await fetch(`/api/workbooks/${workbook.id}/artifacts`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && payload.counts) setReadyModules(Object.values(payload.counts as Record<string, number>).filter(n => n > 0).length);
      } catch { /* A later poll retries this summary. */ }
    }
    void refreshCounts();
    const timer = setInterval(() => void refreshCounts(), 8000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [workbook.id]);

  const [tab, updateTab] = useState<TabId>(() => {
    if (initialTab === "sumber" || initialTab === "sembang") return initialTab;
    return modules.some((m) => m.kind === initialTab) ? initialTab : "sumber";
  });
  const sourceCount = sourceState.loading ? null : sourceState.ready.length;
  function setTab(next: TabId) { updateTab(next); setVisited(current => current.includes(next) ? current : [...current, next]); }
  const [chatRequest, setChatRequest] = useState<string | null>(null);
  function askChat(query: string) { setChatRequest(query); setTab("sembang"); }
  const savedWorkbooks = useSavedWorkbooks();
  const isSaved = savedWorkbooks.includes(workbook.id);
  // Real published workbooks and demo student-shared ones can be saved to Disimpan.
  const saveable = readOnly && (workbook.isDb || workbook.ownerRole === "student");

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <div className={styles.topRow}>
          <Link href="/workbooks" className={styles.back}>
            <ArrowLeft size={15} aria-hidden="true" /> Buku Kerja saya
          </Link>
          <div className={styles.topActions}>
            {isOwner && (
              <button
                type="button"
                onClick={() => void togglePublish()}
                disabled={publishing}
                data-shared={isPublished}
                className={styles.shareButton}
              >
                {isPublished ? <Check size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                {publishing ? "Mengemas kini…" : isPublished ? "Diterbitkan" : "Terbitkan"}
              </button>
            )}
            {saveable && (
              <button
                type="button"
                onClick={() => toggleSavedWorkbook(workbook.id)}
                data-shared={isSaved}
                className={styles.shareButton}
              >
                <Bookmark size={14} aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Disimpan" : "Simpan"}
              </button>
            )}
            {!readOnly && (
              <Link href={`/workbooks/${workbook.id}/settings`} className={styles.settingsButton}>
                <Settings2 size={14} aria-hidden="true" /> Tetapan
              </Link>
            )}
          </div>
        </div>

        <section className={styles.detailHero} aria-labelledby="workbook-title">
          <span className={styles.detailArt}>
            <Image src={COVER_ART[subject.id] ?? subject.asset} alt="" width={1024} height={1024} />
          </span>
          <div className={styles.detailCopy}>
            <h1 id="workbook-title">{workbook.title}</h1>
            <div className={styles.detailChips}>
              <span className={styles.detailChip}>
                <SubjectIcon size={13} aria-hidden="true" />
                {subject.name}
              </span>
              <span className={styles.detailChip}>
                <Users size={13} aria-hidden="true" />
                {workbook.yearLabel}
              </span>
              <span className={styles.detailChip}>
                <TrendingUp size={13} aria-hidden="true" />
                {liveProgress}% siap
              </span>
              {readOnly && (
                <span className={styles.detailChip}>
                  <Eye size={13} aria-hidden="true" />
                  Baca sahaja
                </span>
              )}
            </div>
            <p>{workbook.topic}</p>
          </div>
          <span className={styles.heroIllustration} aria-hidden="true"><Image src={workbook.subjectId === "geography" ? "/assets/thiings/workbook-globe.png" : COVER_ART[subject.id] ?? subject.asset} alt="" width={260} height={260} /><Sparkles size={25} /><Sparkles size={17} /></span>
          <div className={styles.detailStats}>
            <span className={styles.detailStat}>
              <Layers size={15} aria-hidden="true" />
              <strong>{sourceCount ?? "…"}</strong> sumber
            </span>
            <span className={styles.detailStat}>
              <Sparkles size={15} aria-hidden="true" />
              <strong>{readyModules ?? "…"}</strong> modul siap
            </span>
          </div>
        </section>

        <div className={styles.tabs} role="group" aria-label="Bahagian buku kerja">
          <button type="button" className={styles.tab} aria-pressed={tab === "sumber"} onClick={() => setTab("sumber")}>
            <BookOpen size={14} /> Sumber
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "sembang"} onClick={() => setTab("sembang")}>
            <MessageSquareText size={14} /> Sembang AI
          </button>
          {modules.map((m) => { const Icon = MODULE_ICONS[m.kind]; return (
            <button key={m.kind} type="button" className={styles.tab} aria-pressed={tab === m.kind} onClick={() => setTab(m.kind)}>
              <Icon size={14} />{m.label}
            </button>
          ); })}
        </div>

        <div className={styles.content}>
          {tab === "sumber" && <SourcesTab workbookId={workbook.id} workbook={{ ...workbook, visibility }} readOnly={readOnly} />}

          {visited.includes("sembang") && <div hidden={tab !== "sembang"}><ChatTab workbookId={workbook.id} pendingQuery={chatRequest} onQueryConsumed={() => setChatRequest(null)} /></div>}

          {modules.map((m) =>
            visited.includes(m.kind) ? (
              <div key={m.kind} hidden={tab !== m.kind} className={styles.module}>
                {m.kind === "quizzes" ? <QuizzesTab workbook={workbook} readOnly={readOnly} onAskAI={askChat} /> : <ModulesTab workbook={workbook} kind={m.kind} active={tab === m.kind} readOnly={readOnly} />}
              </div>
            ) : null,
          )}
        </div>

        <p className={styles.attribution}>
          3D icons by{" "}
          <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">
            Thiings
          </a>
        </p>
      </main>


    </div>
  );
}
