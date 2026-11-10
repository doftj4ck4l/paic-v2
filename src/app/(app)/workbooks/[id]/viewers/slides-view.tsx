"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, NotebookPen, Play } from "lucide-react";
import type { DeckData } from "@/lib/generation/schemas";
import { Presentation } from "../presentation";
import { SlideCanvas } from "../slide-canvas";
import styles from "../workbook.module.css";

export function SlidesView({ artifactId, deck }: { artifactId: string; deck: DeckData }) {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const total = deck.slides.length;
  const slide = deck.slides[Math.min(index, total - 1)];
  if (!slide) return null;

  return (
    <div className={styles.slidesViewer}>
      <div className={styles.deckViewerTools}>
        <button type="button" onClick={() => setPresenting(true)} className={styles.presentButton}>
          <Play size={14} aria-hidden="true" /> Main persembahan
        </button>
        <button type="button" onClick={() => setShowNotes((value) => !value)} aria-pressed={showNotes} className={styles.deckNotesButton}>
          <NotebookPen size={14} aria-hidden="true" /> Nota penyampai
        </button>
      </div>

      <SlideCanvas artifactId={artifactId} slide={slide} index={index} total={total} deckTitle={deck.title} className={styles.deckStage} fullImage={deck.format === "images"} />

      {showNotes && (
        <div className={styles.deckNotes} role="status">
          <strong>Nota penyampai</strong>
          <p>{slide.notes || "Tiada nota untuk slaid ini."}</p>
        </div>
      )}

      <div className={styles.deckNav}>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          aria-label="Slaid sebelumnya"
          className={styles.deckNavButton}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.deckDots} role="tablist" aria-label="Navigasi slaid">
          {deck.slides.map((item, itemIndex) => (
            <button
              key={`${itemIndex}-${item.title}`}
              type="button"
              role="tab"
              aria-selected={itemIndex === index}
              aria-label={`Slaid ${itemIndex + 1}: ${item.title}`}
              onClick={() => setIndex(itemIndex)}
              className={styles.deckDotButton}
            >
              <span className={styles.deckDot} data-active={itemIndex === index} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}
          disabled={index === total - 1}
          aria-label="Slaid seterusnya"
          className={styles.deckNavButton}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {presenting && <Presentation artifactId={artifactId} deck={deck} startIndex={index} onClose={() => setPresenting(false)} />}
    </div>
  );
}
