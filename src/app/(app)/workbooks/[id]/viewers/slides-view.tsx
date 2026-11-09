"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, NotebookPen, Sparkles } from "lucide-react";
import type { DeckData, DeckSlide } from "@/lib/generation/schemas";
import styles from "../workbook.module.css";

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
      <img src={`/api/artifacts/${artifactId}/assets/slide-${index}.png`} alt={`Ilustrasi: ${title}`} className={styles.slideArtImage} />
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

export function SlidesView({ artifactId, deck }: { artifactId: string; deck: DeckData }) {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const total = deck.slides.length;
  const slide = deck.slides[Math.min(index, total - 1)];
  if (!slide) return null;

  return (
    <div className={styles.deckWrap}>
      <div className={styles.deckViewerTools}>
        <button type="button" onClick={() => setShowNotes((v) => !v)} aria-pressed={showNotes} className={styles.deckNotesButton}>
          <NotebookPen size={14} aria-hidden="true" /> Nota penyampai
        </button>
      </div>

      <SlideCanvas artifactId={artifactId} slide={slide} index={index} total={total} />

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
