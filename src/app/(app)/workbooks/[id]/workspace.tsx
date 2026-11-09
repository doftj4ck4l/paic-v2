"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  NotebookPen,
  ListChecks,
  Presentation,
  Network,
  Headphones,
  BookOpenCheck,
  Check,
  Info,
  Layers,
  MessageSquareText,
  Settings2,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { ChatTab } from "./chat-tab";
import { WorkbookSourcesProvider, useWorkbookSources } from "@/lib/workbook/use-sources";
import { ArtifactTab } from "./artifact-tab";
import { SUBJECT_ICONS } from "@/components/studio/content-tile";
import content from "@/components/studio/content-width.module.css";
import { shareWorkbook, useSocial } from "@/lib/demo-social";
import {
  subjectById,
  type DemoCreation,
  type SubjectId,
} from "@/lib/demo-data";
import { SourcesTab } from "./sources-tab";
import type { AppWorkbook } from "@/lib/workbooks";
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

type WorkspaceProps = { workbook: AppWorkbook; viewerId: string | null; initialTab?: TabId };
export function WorkbookWorkspace(props: WorkspaceProps) {
  return <WorkbookSourcesProvider key={props.workbook.id} workbookId={props.workbook.id}><WorkbookWorkspaceInner {...props} /></WorkbookSourcesProvider>;
}
function WorkbookWorkspaceInner({ workbook, viewerId, initialTab = "sumber" }: WorkspaceProps) {
  const sourceState = useWorkbookSources(workbook.id);
  const [visited, setVisited] = useState<TabId[]>([initialTab]);
  const isOwner = workbook.isDb && workbook.ownerId === viewerId;
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
  const { shared } = useSocial();
  const isShared = shared.includes(workbook.id);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareVisibility, setShareVisibility] = useState<"class" | "community">("class");

  useEffect(() => {
    if (!shareOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setShareOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shareOpen]);

  function confirmShare() {
    shareWorkbook(workbook.id);
    setShareOpen(false);
  }

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
            {!workbook.isDb && (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                data-shared={isShared}
                className={styles.shareButton}
              >
                {isShared ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
                {isShared ? "Dikongsi" : "Kongsi"}
              </button>
            )}
            <Link href={`/workbooks/${workbook.id}/settings`} className={styles.settingsButton}>
              <Settings2 size={14} aria-hidden="true" /> Tetapan
            </Link>
          </div>
        </div>

        <section className={styles.detailHero} data-subject={subject.id} aria-labelledby="workbook-title">
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
                {workbook.teacherName}
              </span>
              <span className={styles.detailChip}>
                <TrendingUp size={13} aria-hidden="true" />
                {workbook.progress}% siap
              </span>
            </div>
            <p>{workbook.topic}</p>
          </div>
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
          {tab === "sumber" && <SourcesTab workbookId={workbook.id} />}

          {visited.includes("sembang") && <div hidden={tab !== "sembang"}><ChatTab workbookId={workbook.id} onManageSources={() => setTab("sumber")} /></div>}

          {modules.map((m) =>
            visited.includes(m.kind) ? (
              <div key={m.kind} hidden={tab !== m.kind} className={styles.module}>
                <ArtifactTab workbookId={workbook.id} kind={m.kind} onManageSources={() => setTab("sumber")} />
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

      {/* Share dialog */}
      {shareOpen && (
        <div className={styles.dialogBackdrop} role="dialog" aria-modal="true" aria-labelledby="share-title">
          <button type="button" aria-label="Tutup" className={styles.dialogDismiss} onClick={() => setShareOpen(false)} />
          <div className={styles.dialog}>
            <div className={styles.dialogHead}>
              <div>
                <h2 id="share-title">Kongsi buku kerja</h2>
                <p className={styles.dialogDesc}>
                  Kongsi &quot;{workbook.title}&quot; dengan rakan sekelas atau seluruh komuniti Pixelspace.
                </p>
              </div>
              <button type="button" aria-label="Tutup dialog" className={styles.dialogClose} onClick={() => setShareOpen(false)}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <fieldset className={styles.radioGroup}>
              <legend>Pilih siapa boleh melihat</legend>
              <label className={styles.radioRow} data-checked={shareVisibility === "class"}>
                <input type="radio" name="share-visibility" checked={shareVisibility === "class"} onChange={() => setShareVisibility("class")} />
                <span>
                  <strong>Sekolah sahaja</strong>
                  <span>Hanya pelajar di sekolah anda (demo)</span>
                </span>
              </label>
              <label className={styles.radioRow} data-checked={shareVisibility === "community"}>
                <input type="radio" name="share-visibility" checked={shareVisibility === "community"} onChange={() => setShareVisibility("community")} />
                <span>
                  <strong>Komuniti Pixelspace</strong>
                  <span>Semua pelajar demo di halaman Komuniti</span>
                </span>
              </label>
            </fieldset>
            <div className={styles.dialogField}>
              <label htmlFor="share-note">Penerangan (pilihan)</label>
              <textarea id="share-note" rows={3} placeholder="cth. Nota ringkas untuk ulang kaji bab 8…" />
            </div>
            <p className={styles.dialogNote}>
              <Info size={12} aria-hidden="true" />
              Mod demo — perkongsian disimpan dalam sesi ini sahaja (Fasa 5).
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghostButton} onClick={() => setShareOpen(false)}>Batal</button>
              <button type="button" className={styles.confirmButton} onClick={confirmShare}>
                <Share2 size={15} aria-hidden="true" /> Kongsi sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
