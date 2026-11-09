"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, NotebookPen, Presentation, Sparkles, Trash2, Wand2 } from "lucide-react";
import type { DeckData, DeckSlide } from "@/lib/generation/schemas";
import styles from "./workbook.module.css";

type ArtifactSummary = {
  id: string;
  title: string;
  status: "generating" | "ready" | "failed";
  error: string | null;
  slideCount: number;
  imagesReady: number;
  imagesPending: number;
  createdAt: string;
};

type FullArtifact = {
  id: string;
  title: string;
  status: "generating" | "ready" | "failed";
  error: string | null;
  data: DeckData | null;
};

const COUNT_OPTIONS = [
  { value: "fewer", label: "Ringkas", hint: "6 slaid" },
  { value: "standard", label: "Standard", hint: "10 slaid" },
  { value: "more", label: "Banyak", hint: "12 slaid" },
] as const;

const THEME_OPTIONS = [
  { value: "clean", label: "Kemas" },
  { value: "bold", label: "Berani" },
  { value: "warm", label: "Mesra" },
] as const;

const TYPE_LABEL: Record<string, string> = {
  title: "Tajuk",
  objectives: "Objektif",
  concept: "Konsep",
  worked_example: "Contoh",
  check: "Semak",
  summary: "Ringkasan",
};

function SlideArt({ artifactId, index, status, title }: { artifactId: string; index: number; status: DeckSlide["image_status"]; title: string }) {
  if (status === "ready") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private auth-gated asset route
      <img src={`/api/artifacts/${artifactId}/assets/slide-${index}`} alt={`Ilustrasi: ${title}`} className={styles.slideArtImage} />
    );
  }
  if (status === "pending") {
    return (
      <span className={styles.slideArtPending}>
        <Sparkles size={18} aria-hidden="true" />
        Ilustrasi sedang dijana…
      </span>
    );
  }
  return null;
}

function SlideCanvas({ artifactId, slide, index, total }: { artifactId: string; slide: DeckSlide; index: number; total: number }) {
  const isCover = slide.layout === "cover" || slide.type === "title";
  const hasArt = slide.image_status === "ready" || slide.image_status === "pending";
  const split = slide.layout === "split_visual" && hasArt;

  if (isCover) {
    return (
      <div className={`${styles.slideCanvas} ${styles.slideCover}`}>
        <span className={styles.slideTypeChip} data-cover="true">{TYPE_LABEL[slide.type] ?? "Slaid"}</span>
        <div className={styles.slideCoverCopy}>
          <h3>{slide.title}</h3>
          {slide.body && <p>{slide.body}</p>}
          {slide.bullets.length > 0 && (
            <ul>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
        {hasArt && (
          <span className={styles.slideCoverArt}>
            <SlideArt artifactId={artifactId} index={index} status={slide.image_status} title={slide.title} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.slideCanvas}>
      <span className={styles.slideTypeChip}>{TYPE_LABEL[slide.type] ?? "Konsep"}</span>
      <div className={split ? styles.slideSplit : undefined}>
        <div className={styles.slideCopy}>
          <h3>{slide.title}</h3>
          {slide.body && <p className={styles.slideBody}>{slide.body}</p>}
          {slide.bullets.length > 0 && (
            <ul className={styles.slideBullets}>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
        {split && (
          <span className={styles.slideArtBox}>
            <SlideArt artifactId={artifactId} index={index} status={slide.image_status} title={slide.title} />
          </span>
        )}
      </div>
      <span className={styles.slideFooter}>
        {index + 1} / {total}
      </span>
    </div>
  );
}

export function SlidesTab({ workbookId }: { workbookId: string }) {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [artifact, setArtifact] = useState<ArtifactSummary | null>(null);
  const [full, setFull] = useState<FullArtifact | null>(null);
  const [count, setCount] = useState<(typeof COUNT_OPTIONS)[number]["value"]>("standard");
  const [theme, setTheme] = useState<(typeof THEME_OPTIONS)[number]["value"]>("clean");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/workbooks/${workbookId}/artifacts?kind=slides`);
    if (!res.ok) return null;
    const payload = (await res.json()) as { artifacts: ArtifactSummary[]; available: boolean };
    setAvailable(payload.available);
    const latest = payload.artifacts[0] ?? null;
    setArtifact(latest);
    return latest;
  }, [workbookId]);

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

  // Poll while generating
  useEffect(() => {
    if (artifact?.status !== "generating") return;
    const timer = setInterval(async () => {
      const latest = await refresh();
      if (latest && latest.status !== "generating") {
        if (latest.status === "ready") await loadFull(latest.id);
        setIndex(0);
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [artifact?.status, refresh, loadFull]);

  async function generate() {
    setSubmitting(true);
    setError(null);
    setFull(null);
    try {
      const res = await fetch(`/api/workbooks/${workbookId}/artifacts/slides/generate`, {
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
      // Fast generations may already be ready by the time we refresh.
      if (latest?.status === "ready") await loadFull(latest.id);
      setIndex(0);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!artifact) return;
    await fetch(`/api/artifacts/${artifact.id}`, { method: "DELETE" });
    setArtifact(null);
    setFull(null);
    setIndex(0);
  }

  const deck = full?.data ?? null;
  const slide = deck?.slides[index] ?? null;
  const total = deck?.slides.length ?? 0;

  const progressLabel = useMemo(() => {
    if (!artifact) return "";
    if (artifact.imagesPending > 0) {
      return `${artifact.imagesReady}/${artifact.imagesReady + artifact.imagesPending} ilustrasi siap`;
    }
    return `${artifact.slideCount} slaid`;
  }, [artifact]);

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
        <span className={styles.generateIcon} aria-hidden="true"><Presentation /></span>
        <h3>Jana slaid AI</h3>
        <p>
          AI akan membina dek slaid kelas daripada sumber buku kerja ini — slaid teks yang kemas
          dengan ilustrasi dijana untuk slaid terpilih.
        </p>
        {!available && (
          <p className={styles.generateNotice}>Penjanaan AI belum dikonfigurasi pada pelayan ini.</p>
        )}
        <div className={styles.generateOptions}>
          <div className={styles.generateGroup} role="group" aria-label="Bilangan slaid">
            {COUNT_OPTIONS.map((option) => (
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
        </div>
        {error && <p className={styles.generateError} role="alert">{error}</p>}
        <button type="button" onClick={generate} disabled={submitting || !available} className={styles.generateButton}>
          <Wand2 size={16} aria-hidden="true" />
          {submitting ? "Memulakan…" : "Jana slaid"}
        </button>
      </div>
    );
  }

  if (artifact.status === "generating") {
    return (
      <div className={styles.slidesState}>
        <span className={styles.slidesSpinner} aria-hidden="true" />
        <h3>Menjana slaid…</h3>
        <p>{progressLabel} · ini mengambil masa seminit atau dua.</p>
        <p className={styles.slidesHint}>Anda boleh teruskan meneroka — slaid akan siap di sini.</p>
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

  if (!deck || !slide) {
    return (
      <div className={styles.slidesState}>
        <span className={styles.slidesSpinner} aria-hidden="true" />
        <p>Memuatkan dek…</p>
      </div>
    );
  }

  return (
    <div className={styles.deckWrap}>
      <div className={styles.deckToolbar}>
        <div className={styles.deckMeta}>
          <strong>{deck.title}</strong>
          <span>{total} slaid · {artifact.imagesReady} ilustrasi</span>
        </div>
        <div className={styles.deckActions}>
          <button type="button" onClick={() => setShowNotes((v) => !v)} aria-pressed={showNotes} className={styles.deckNotesButton}>
            <NotebookPen size={14} aria-hidden="true" /> Nota penyampai
          </button>
          <button type="button" onClick={generate} disabled={submitting} className={styles.deckNotesButton}>
            <Wand2 size={14} aria-hidden="true" /> Jana semula
          </button>
          <button type="button" onClick={remove} aria-label="Padam dek" className={styles.deckDeleteButton}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <SlideCanvas artifactId={artifact.id} slide={slide} index={index} total={total} />

      {showNotes && (
        <div className={styles.deckNotes} role="status">
          <strong>Nota penyampai</strong>
          <p>{slide.notes || "Tiada nota untuk slaid ini."}</p>
        </div>
      )}

      <div className={styles.deckNav}>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Slaid sebelumnya"
          className={styles.deckNavButton}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.deckDots} role="tablist" aria-label="Navigasi slaid">
          {deck.slides.map((s, i) => (
            <button
              key={`${i}-${s.title}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slaid ${i + 1}: ${s.title}`}
              onClick={() => setIndex(i)}
              className={styles.deckDotButton}
            >
              <span className={styles.deckDot} data-active={i === index} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          aria-label="Slaid seterusnya"
          className={styles.deckNavButton}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
