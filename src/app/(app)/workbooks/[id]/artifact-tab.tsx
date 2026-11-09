"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Layers,
  ListChecks,
  Network,
  NotebookPen,
  Presentation,
  Sparkles,
  Trash2,
  Wand2,
  Headphones,
} from "lucide-react";
import { QuizPlayer } from "@/components/studio/quiz-player";
import { FlashcardPlayer } from "@/components/studio/flashcard-player";
import { MindMapViewer } from "@/components/studio/mindmap-viewer";
import { StudyGuideView } from "@/components/studio/study-guide-view";
import type { ArtifactKind } from "@/lib/generation/registry";
import type { DemoStudyGuide } from "@/lib/demo-data";
import type { AudioData } from "@/lib/generation/schemas";
import type { DeckData, MindmapNode } from "@/lib/generation/schemas";
import { SlidesView } from "./viewers/slides-view";
import { NotesView, type NotesData } from "./viewers/notes-view";
import { AudioView } from "./viewers/audio-view";
import styles from "./workbook.module.css";

type ArtifactSummary = {
  id: string;
  title: string;
  status: "generating" | "ready" | "failed";
  error: string | null;
  slideCount: number;
  imagesReady: number;
  imagesPending: number;
};

type FullArtifact = {
  id: string;
  title: string;
  status: "generating" | "ready" | "failed";
  error: string | null;
  data: Record<string, unknown> | null;
};

type CountOption = { value: "fewer" | "standard" | "more"; label: string; hint: string };

type KindUi = {
  noun: string;
  description: string;
  icon: typeof Presentation;
  countOptions: CountOption[];
  showTheme?: boolean;
  generatingLabel: string;
  meta: (data: Record<string, unknown>) => string;
  render: (props: { artifactId: string; workbookId: string; data: Record<string, unknown> }) => React.ReactNode;
};

type ViewerMindmapNode = { id: string; label: string; children?: ViewerMindmapNode[] };

function toMindmapNodes(node: MindmapNode, prefix = "n"): ViewerMindmapNode {
  return {
    id: `${prefix}-${node.title.slice(0, 8)}`,
    label: node.title,
    children: node.children?.map((child, i) => toMindmapNodes(child, `${prefix}${i}`)),
  };
}

const KIND_UI: Record<ArtifactKind, KindUi> = {
  slides: {
    noun: "slaid",
    description: "Dek slaid kelas dengan ilustrasi dijana AI untuk slaid terpilih.",
    icon: Presentation,
    countOptions: [
      { value: "fewer", label: "Ringkas", hint: "6 slaid" },
      { value: "standard", label: "Standard", hint: "10 slaid" },
      { value: "more", label: "Banyak", hint: "12 slaid" },
    ],
    showTheme: true,
    generatingLabel: "Menjana slaid…",
    meta: (data) => {
      const deck = data as DeckData;
      const illustrations = deck.slides?.filter((s) => s.image_status === "ready").length ?? 0;
      return `${deck.slides?.length ?? 0} slaid · ${illustrations} ilustrasi`;
    },
    render: ({ artifactId, data }) => <SlidesView artifactId={artifactId} deck={data as unknown as DeckData} />,
  },
  notes: {
    noun: "nota",
    description: "Nota ulang kaji berstruktur dengan rujukan sumber untuk setiap bahagian.",
    icon: NotebookPen,
    countOptions: [
      { value: "fewer", label: "Ringkas", hint: "4 bahagian" },
      { value: "standard", label: "Standard", hint: "6 bahagian" },
      { value: "more", label: "Terperinci", hint: "8 bahagian" },
    ],
    generatingLabel: "Menjana nota…",
    meta: (data) => `${((data as NotesData).sections ?? []).length} bahagian`,
    render: ({ data }) => <NotesView data={data as unknown as NotesData} />,
  },
  quizzes: {
    noun: "kuiz",
    description: "Kuiz objektif dengan penjelasan jawapan dan bantuan Pixel AI untuk yang tersekat.",
    icon: ListChecks,
    countOptions: [
      { value: "fewer", label: "Ringkas", hint: "5 soalan" },
      { value: "standard", label: "Standard", hint: "8 soalan" },
      { value: "more", label: "Cabaran", hint: "12 soalan" },
    ],
    generatingLabel: "Menjana kuiz…",
    meta: (data) => `${((data as { questions?: unknown[] }).questions ?? []).length} soalan`,
    render: ({ workbookId, data }) => {
      const questions = ((data as { questions?: { question: string; options: string[]; answer: number; explanation: string; aiExplain?: string; citation?: string }[] }).questions ?? []).map(
        (q, i) => ({ ...q, id: `q${i}` }),
      );
      return <QuizPlayer questions={questions} aiExplain sourceWorkbookId={workbookId} />;
    },
  },
  flashcards: {
    noun: "kad imbas",
    description: "Kad imbas depan-belakang untuk ulang kaji pantas pada bila-bila masa.",
    icon: Layers,
    countOptions: [
      { value: "fewer", label: "Ringkas", hint: "8 kad" },
      { value: "standard", label: "Standard", hint: "12 kad" },
      { value: "more", label: "Banyak", hint: "16 kad" },
    ],
    generatingLabel: "Menjana kad imbas…",
    meta: (data) => `${((data as { cards?: unknown[] }).cards ?? []).length} kad`,
    render: ({ data }) => {
      const cards = ((data as { cards?: { front: string; back: string }[] }).cards ?? []).map((c, i) => ({ ...c, id: `f${i}` }));
      return <FlashcardPlayer cards={cards} />;
    },
  },
  mindmaps: {
    noun: "peta minda",
    description: "Peta minda bercabang untuk melihat gambaran besar topik dengan pantas.",
    icon: Network,
    countOptions: [],
    generatingLabel: "Menjana peta minda…",
    meta: (data) => `${((data as { children?: unknown[] }).children ?? []).length} cabang utama`,
    render: ({ data }) => <MindMapViewer root={toMindmapNodes(data as unknown as MindmapNode)} />,
  },
  "study-guides": {
    noun: "panduan ulang kaji",
    description: "Panduan lengkap: objektif, konsep penting, contoh soalan dan senarai semak.",
    icon: BookOpenCheck,
    countOptions: [],
    generatingLabel: "Menjana panduan…",
    meta: (data) => `${((data as { checklist?: unknown[] }).checklist ?? []).length} senarai semak`,
    render: ({ data }) => <StudyGuideView guide={data as unknown as DemoStudyGuide} />,
  },
  audio: {
    noun: "pelajaran audio",
    description: "Pelajaran audio bersuara dengan transkrip — sesuai untuk ulang kaji sambil mendengar.",
    icon: Headphones,
    countOptions: [],
    generatingLabel: "Menjana audio…",
    meta: (data) => `${((data as { transcript?: unknown[] }).transcript ?? []).length} baris transkrip`,
    render: ({ artifactId, data }) => <AudioView artifactId={artifactId} data={data as unknown as AudioData} />,
  },
};

const THEME_OPTIONS = [
  { value: "clean", label: "Kemas" },
  { value: "bold", label: "Berani" },
  { value: "warm", label: "Mesra" },
] as const;

export function ArtifactTab({ workbookId, kind }: { workbookId: string; kind: ArtifactKind }) {
  const ui = KIND_UI[kind];
  const Icon = ui.icon;

  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [artifact, setArtifact] = useState<ArtifactSummary | null>(null);
  const [full, setFull] = useState<FullArtifact | null>(null);
  const [count, setCount] = useState<"fewer" | "standard" | "more">("standard");
  const [theme, setTheme] = useState<(typeof THEME_OPTIONS)[number]["value"]>("clean");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/workbooks/${workbookId}/artifacts?kind=${kind}`);
    if (!res.ok) return null;
    const payload = (await res.json()) as { artifacts: ArtifactSummary[]; available: boolean };
    setAvailable(payload.available);
    const latest = payload.artifacts[0] ?? null;
    setArtifact(latest);
    return latest;
  }, [workbookId, kind]);

  const loadFull = useCallback(async (id: string) => {
    const res = await fetch(`/api/artifacts/${id}`);
    if (!res.ok) return;
    setFull((await res.json()) as FullArtifact);
  }, []);

  useEffect(() => {
    (async () => {
      const latest = await refresh();
      if (latest && latest.status === "ready") await loadFull(latest.id);
      setLoading(false);
    })();
  }, [refresh, loadFull]);

  useEffect(() => {
    if (artifact?.status !== "generating") return;
    const timer = setInterval(async () => {
      const latest = await refresh();
      if (latest && latest.status !== "generating") {
        if (latest.status === "ready") await loadFull(latest.id);
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [artifact?.status, refresh, loadFull]);

  async function generate() {
    setSubmitting(true);
    setError(null);
    setFull(null);
    try {
      const res = await fetch(`/api/workbooks/${workbookId}/artifacts/${kind}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, theme }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Penjanaan gagal dimulakan.");
        return;
      }
      const latest = await refresh();
      if (latest?.status === "ready") await loadFull(latest.id);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!artifact) return;
    await fetch(`/api/artifacts/${artifact.id}`, { method: "DELETE" });
    setArtifact(null);
    setFull(null);
  }

  const data = full?.data ?? null;
  const meta = useMemo(() => (data ? ui.meta(data) : ""), [data, ui]);

  if (loading) {
    return (
      <div className={styles.slidesState}>
        <span className={styles.slidesSpinner} aria-hidden="true" />
        <p>Memuatkan…</p>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className={styles.generateCard}>
        <span className={styles.generateIcon} aria-hidden="true"><Icon /></span>
        <h3>Jana {ui.noun} AI</h3>
        <p>{ui.description}</p>
        {!available && <p className={styles.generateNotice}>Penjanaan AI belum dikonfigurasi pada pelayan ini.</p>}
        {(ui.countOptions.length > 0 || ui.showTheme) && (
          <div className={styles.generateOptions}>
            {ui.countOptions.length > 0 && (
              <div className={styles.generateGroup} role="group" aria-label={`Pilihan bilangan ${ui.noun}`}>
                {ui.countOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={styles.generatePill}
                    aria-pressed={count === option.value}
                    onClick={() => setCount(option.value)}
                  >
                    {option.label}
                    <span>{option.hint}</span>
                  </button>
                ))}
              </div>
            )}
            {ui.showTheme && (
              <div className={styles.generateGroup} role="group" aria-label="Gaya ilustrasi">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={styles.generatePill}
                    aria-pressed={theme === option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {error && <p className={styles.generateError} role="alert">{error}</p>}
        <button type="button" onClick={generate} disabled={submitting || !available} className={styles.generateButton}>
          <Wand2 size={16} aria-hidden="true" />
          {submitting ? "Memulakan…" : `Jana ${ui.noun}`}
        </button>
      </div>
    );
  }

  if (artifact.status === "generating") {
    return (
      <div className={styles.slidesState}>
        <span className={styles.slidesSpinner} aria-hidden="true" />
        <h3>{ui.generatingLabel}</h3>
        <p>
          {kind === "slides" && artifact.imagesPending > 0
            ? `${artifact.imagesReady}/${artifact.imagesReady + artifact.imagesPending} ilustrasi siap · `
            : ""}
          Ini mengambil masa sebentar.
        </p>
        <p className={styles.slidesHint}>Anda boleh teruskan meneroka — hasil akan siap di sini.</p>
      </div>
    );
  }

  if (artifact.status === "failed") {
    return (
      <div className={styles.slidesState}>
        <h3>Penjanaan gagal</h3>
        <p>{artifact.error ?? "Sila cuba lagi."}</p>
        <div className={styles.slidesActions}>
          <button type="button" onClick={generate} className={styles.generateButton}>Cuba lagi</button>
          <button type="button" onClick={remove} className={styles.slideGhostButton}>Padam</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.slidesState}>
        <span className={styles.slidesSpinner} aria-hidden="true" />
        <p>Memuatkan…</p>
      </div>
    );
  }

  return (
    <div className={styles.deckWrap}>
      <div className={styles.deckToolbar}>
        <div className={styles.deckMeta}>
          <strong>{artifact.title}</strong>
          <span>{meta}</span>
        </div>
        <div className={styles.deckActions}>
          <button type="button" onClick={generate} disabled={submitting} className={styles.deckNotesButton}>
            <Wand2 size={14} aria-hidden="true" /> Jana semula
          </button>
          <button type="button" onClick={remove} aria-label={`Padam ${ui.noun}`} className={styles.deckDeleteButton}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      {ui.render({ artifactId: artifact.id, workbookId, data })}
      <p className={styles.artifactNote}>
        <Sparkles size={12} aria-hidden="true" />
        Dijana AI daripada sumber buku kerja — semak rujukan sebelum digunakan.
      </p>
    </div>
  );
}
