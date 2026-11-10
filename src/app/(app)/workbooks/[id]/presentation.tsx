"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, LayoutGrid, NotebookPen, Pause, Play, Sparkles, Timer, X } from "lucide-react";
import type { DeckData } from "@/lib/generation/schemas";
import { SlideCanvas } from "./slide-canvas";
import styles from "./presentation.module.css";

type TransitionKind = "fade" | "push" | "cube";
const TRANSITIONS: { id: TransitionKind; label: string }[] = [
  { id: "fade", label: "Fade" },
  { id: "push", label: "Slaid" },
  { id: "cube", label: "Kubus" },
];
const AUTOPLAY_MS = 8000;
const IDLE_MS = 2600;

const variants: Record<TransitionKind, { enter: (direction: number) => Record<string, number>; center: Record<string, number>; exit: (direction: number) => Record<string, number> }> = {
  fade: {
    enter: () => ({ opacity: 0, scale: 0.965, y: 14 }),
    center: { opacity: 1, scale: 1, y: 0 },
    exit: () => ({ opacity: 0, scale: 1.015, y: -10 }),
  },
  push: {
    enter: (direction) => ({ x: direction * 640, opacity: 0.4 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -420, opacity: 0 }),
  },
  cube: {
    enter: (direction) => ({ rotateY: direction * -32, opacity: 0, scale: 0.9 }),
    center: { rotateY: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({ rotateY: direction * 26, opacity: 0, scale: 0.9 }),
  },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Presentation({ artifactId, deck, startIndex = 0, onClose }: { artifactId: string; deck: DeckData; startIndex?: number; onClose: () => void }) {
  const total = deck.slides.length;
  const [index, setIndex] = useState(() => Math.min(Math.max(0, startIndex), Math.max(0, total - 1)));
  const [direction, setDirection] = useState(1);
  const [transition, setTransition] = useState<TransitionKind>("fade");
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = deck.slides[Math.min(index, total - 1)];

  const go = useCallback((next: number) => {
    setIndex((current) => {
      const target = Math.max(0, Math.min(total - 1, next));
      setDirection(target >= current ? 1 : -1);
      return target;
    });
  }, [total]);

  useEffect(() => {
    const element = containerRef.current;
    element?.requestFullscreen?.().catch(() => { /* overlay fallback */ });
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => { /* already gone */ });
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Elapsed timer for the presenter.
  useEffect(() => {
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Autoplay: advance every AUTOPLAY_MS.
  useEffect(() => {
    if (!autoplay || showGrid || blackout) return;
    const timer = setTimeout(() => go(index + 1 >= total ? 0 : index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, index, total, go, showGrid, blackout]);

  // Prefetch the next two slide images so transitions never flash.
  useEffect(() => {
    for (const offset of [1, 2]) {
      const target = deck.slides[index + offset];
      if (!target || target.image_status !== "ready") continue;
      const image = new Image();
      image.src = `/api/artifacts/${artifactId}/assets/${target.image_key || `slide-${index + offset}.png`}`;
    }
  }, [artifactId, deck.slides, index]);

  // Auto-hide chrome after idle.
  const wake = useCallback(() => {
    setChromeVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setChromeVisible(false), IDLE_MS);
  }, []);
  useEffect(() => {
    idleTimer.current = setTimeout(() => setChromeVisible(false), IDLE_MS);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      wake();
      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") { event.preventDefault(); go(index + 1); }
      else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(index - 1); }
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(total - 1);
      else if (event.key === "Escape") { if (showGrid) setShowGrid(false); else onClose(); }
      else if (event.key === "b" || event.key === "B") setBlackout((value) => !value);
      else if (event.key === "n" || event.key === "N") setShowNotes((value) => !value);
      else if (event.key === "g" || event.key === "G") setShowGrid((value) => !value);
      else if (event.key === "f" || event.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { /* noop */ });
        else containerRef.current?.requestFullscreen?.().catch(() => { /* noop */ });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total, onClose, showGrid, wake]);

  const nextSlide = deck.slides[index + 1];
  const hasVisual = slide ? slide.image_status === "ready" || Boolean(slide.elements?.some((element) => element.type === "image")) : false;
  const duration = reduced ? 0 : 0.45;

  const stage = useMemo(() => (slide ? (
    <motion.div
      key={index}
      custom={direction}
      variants={{
        enter: variants[transition].enter,
        center: variants[transition].center,
        exit: variants[transition].exit,
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration, ease: [0.22, 0.75, 0.3, 1] }}
      className={`${styles.stage} ${hasVisual && !reduced ? styles.kenburns : ""}`}
      data-dir={direction}
    >
      <SlideCanvas artifactId={artifactId} slide={slide} index={index} total={total} deckTitle={deck.title} className={styles.stageCanvas} fullImage={deck.format === "images"} />
    </motion.div>
  ) : null), [artifactId, deck.title, direction, duration, hasVisual, index, reduced, slide, total, transition]);

  return (
    <div
      ref={containerRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Persembahan: ${deck.title}`}
      onMouseMove={wake}
      onTouchStart={wake}
      style={{ cursor: chromeVisible ? "default" : "none" }}
    >
      <div className={styles.ambient} aria-hidden="true">
        {slide && <SlideCanvas artifactId={artifactId} slide={slide} index={index} total={total} deckTitle={deck.title} className={styles.ambientCanvas} fullImage={deck.format === "images"} />}
      </div>

      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <header className={styles.topBar} data-visible={chromeVisible}>
        <p className={styles.deckTitle}>{deck.title}</p>
        <div className={styles.topActions}>
          <div className={styles.transitionPicker} role="group" aria-label="Jenis peralihan">
            {TRANSITIONS.map((item) => (
              <button key={item.id} type="button" aria-pressed={transition === item.id} onClick={() => setTransition(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.toolButton} aria-pressed={autoplay} onClick={() => setAutoplay((value) => !value)} title={`Auto-main ${AUTOPLAY_MS / 1000}s`}>
            {autoplay ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            <span>Auto</span>
          </button>
          <button type="button" className={styles.toolButton} aria-pressed={showGrid} onClick={() => setShowGrid((value) => !value)} title="Gambaran keseluruhan (G)">
            <LayoutGrid size={16} aria-hidden="true" />
            <span>Gambaran</span>
          </button>
          <button type="button" className={styles.toolButton} aria-pressed={showNotes} onClick={() => setShowNotes((value) => !value)} title="Nota penyampai (N)">
            <NotebookPen size={16} aria-hidden="true" />
            <span>Nota</span>
          </button>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Tutup persembahan">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <button type="button" className={styles.edgeButton} data-side="left" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Slaid sebelumnya">
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <div className={styles.stageWrap} onClick={() => go(index + 1)}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {stage}
          </AnimatePresence>
        </div>
        <button type="button" className={styles.edgeButton} data-side="right" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Slaid seterusnya">
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      </div>

      {showNotes && slide && (
        <aside className={styles.notesPanel}>
          <div className={styles.notesHead}>
            <span><NotebookPen size={14} aria-hidden="true" /> Nota penyampai</span>
            <span className={styles.timer}><Timer size={14} aria-hidden="true" /> {formatTime(elapsed)}</span>
          </div>
          <p className={styles.notesText}>{slide.notes || "Tiada nota untuk slaid ini."}</p>
          {nextSlide && (
            <div className={styles.nextPreview}>
              <span>Slaid seterusnya</span>
              <SlideCanvas artifactId={artifactId} slide={nextSlide} index={index + 1} total={total} deckTitle={deck.title} className={styles.nextCanvas} fullImage={deck.format === "images"} />
            </div>
          )}
        </aside>
      )}

      <footer className={styles.bottomBar} data-visible={chromeVisible}>
        <span className={styles.counter}>
          {index + 1} / {total}
        </span>
        <span className={styles.hint}>
          <Sparkles size={13} aria-hidden="true" />
          {index + 1 < total ? "Klik atau → untuk teruskan" : "Slaid terakhir — Esc untuk keluar"}
        </span>
      </footer>

      <AnimatePresence>
        {showGrid && (
          <motion.div className={styles.gridOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <div className={styles.gridHead}>
              <strong>Semua slaid</strong>
              <button type="button" className={styles.iconButton} onClick={() => setShowGrid(false)} aria-label="Tutup gambaran">
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.gridScroll}>
              {deck.slides.map((item, itemIndex) => (
                <button
                  key={`${itemIndex}-${item.title}`}
                  type="button"
                  className={styles.gridCard}
                  data-active={itemIndex === index}
                  onClick={() => { go(itemIndex); setShowGrid(false); }}
                >
                  <span className={styles.gridNumber}>{itemIndex + 1}</span>
                  <SlideCanvas artifactId={artifactId} slide={item} index={itemIndex} total={total} deckTitle={deck.title} className={styles.gridCanvas} fullImage={deck.format === "images"} />
                  <span className={styles.gridTitle}>{item.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {blackout && <button type="button" className={styles.blackout} onClick={() => setBlackout(false)} aria-label="Tutup skrin hitam" />}
    </div>
  );
}
