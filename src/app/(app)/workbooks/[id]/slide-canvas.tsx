"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DeckSlide, SlideElement } from "@/lib/generation/schemas";
import { CANVAS_H, CANVAS_W, sanitizeSlideHtml } from "@/lib/workbook/slide-elements";
import styles from "./slide-canvas.module.css";

const TYPE_LABEL: Record<string, string> = {
  title: "Tajuk",
  objectives: "Objektif",
  concept: "Konsep",
  worked_example: "Contoh",
  check: "Semak",
  summary: "Ringkasan",
};

const TINT: Record<string, string> = {
  worked_example: styles.tintAmber,
  check: styles.tintViolet,
  summary: styles.tintMint,
  objectives: styles.tintSky,
};

function SlideImage({ artifactId, slide, index, className }: { artifactId: string; slide: DeckSlide; index: number; className: string }) {
  if (slide.image_status === "ready") {
    // eslint-disable-next-line @next/next/no-img-element -- private auth-gated asset route
    return <img src={`/api/artifacts/${artifactId}/assets/${slide.image_key || `slide-${index}.png`}`} alt="" className={className} />;
  }
  if (slide.image_status === "pending") {
    return (
      <span className={styles.artPending}>
        <Sparkles size={26} aria-hidden="true" />
        Ilustrasi sedang dijana…
      </span>
    );
  }
  return null;
}

/** Structured template rendering (AI-generated decks without freeform elements). */
function TemplateLayer({ artifactId, slide, index, total, deckTitle }: { artifactId: string; slide: DeckSlide; index: number; total: number; deckTitle: string }) {
  const isCover = slide.layout === "cover" || slide.type === "title";
  const hasImage = slide.image_status === "ready" || slide.image_status === "pending";
  const split = slide.layout === "split_visual" && hasImage;

  if (isCover) {
    return (
      <div className={`${styles.layer} ${styles.cover}`}>
        <span className={styles.blobA} aria-hidden="true" />
        <span className={styles.blobB} aria-hidden="true" />
        <span className={styles.coverChip}>{TYPE_LABEL[slide.type] ?? "Slaid"}</span>
        <div className={styles.coverCopy}>
          <h1>{slide.title}</h1>
          {slide.body && <p>{slide.body}</p>}
          {slide.bullets.length > 0 && (
            <ul>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
        {hasImage && (
          <span className={styles.coverArt}>
            <SlideImage artifactId={artifactId} slide={slide} index={index} className={styles.coverArtImage} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.layer} ${TINT[slide.type] ?? ""}`}>
      <span className={styles.accentBar} aria-hidden="true" />
      <span className={styles.typeChip}>{TYPE_LABEL[slide.type] ?? "Konsep"}</span>
      <div className={split ? styles.split : undefined}>
        <div className={styles.copy}>
          <h2>{slide.title}</h2>
          {slide.body && <p className={styles.body}>{slide.body}</p>}
          {slide.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
        {split && (
          <span className={styles.artBox}>
            <SlideImage artifactId={artifactId} slide={slide} index={index} className={styles.artImage} />
          </span>
        )}
      </div>
      <span className={styles.footer}>
        <span>{deckTitle}</span>
        <span>
          {index + 1} / {total}
        </span>
      </span>
    </div>
  );
}

function ElementView({
  artifactId,
  element,
  interactive,
  selected,
  editing,
  onSelectElement,
  onElementPointerDown,
  onStartEditElement,
  onCommitText,
  registerElement,
}: {
  artifactId: string;
  element: SlideElement;
  interactive: boolean;
  selected: boolean;
  editing: boolean;
  onSelectElement?: (id: string | null) => void;
  onElementPointerDown?: (id: string, event: React.PointerEvent) => void;
  onStartEditElement?: (id: string) => void;
  onCommitText?: (elementId: string, html: string) => void;
  registerElement?: (id: string, node: HTMLDivElement | null) => void;
}) {
  const style: React.CSSProperties = { position: "absolute", left: element.x, top: element.y, width: element.w, height: element.h, zIndex: element.z, transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined };
  const wrapperProps = interactive
    ? {
        onPointerDown: (event: React.PointerEvent) => { event.stopPropagation(); onSelectElement?.(element.id); onElementPointerDown?.(element.id, event); },
        onDoubleClick: () => { if (element.type === "text") onStartEditElement?.(element.id); },
        "data-selected": selected || undefined,
      }
    : {};
  const wrapperClass = interactive ? `${styles.elementBox} ${selected ? styles.elementSelected : ""}` : undefined;
  // Sanitization needs the DOM (DOMParser); render text after mount so the
  // server HTML and the hydrated client tree stay consistent.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const kick = setTimeout(() => setMounted(true), 0); return () => clearTimeout(kick); }, []);

  let content: React.ReactNode = null;
  if (element.type === "shape") {
    const radius = element.shape === "circle" ? "50%" : element.shape === "line" ? 999 : element.radius ?? 0;
    content = <span style={{ position: "absolute", inset: 0, background: element.fill, borderRadius: radius }} aria-hidden="true" />;
  } else if (element.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- private auth-gated asset route
    content = <img src={`/api/artifacts/${artifactId}/assets/${element.assetKey}`} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: element.radius ?? 0, boxShadow: element.shadow ? "0 18px 40px rgba(16,17,47,0.18)" : undefined, objectFit: "cover" }} />;
  } else {
    const textStyle: React.CSSProperties = { fontSize: element.style.fontSize, fontWeight: element.style.fontWeight, color: element.style.color, textAlign: element.style.align, lineHeight: element.style.lineHeight, fontStyle: element.style.italic ? "italic" : undefined, textDecoration: element.style.underline ? "underline" : undefined };
    if (editing) {
      content = (
        <div
          autoFocus
          style={{ ...textStyle, position: "absolute", inset: 0 }}
          className={styles.editableText}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          dangerouslySetInnerHTML={{ __html: sanitizeSlideHtml(element.html) }}
          onBlur={(event) => onCommitText?.(element.id, event.currentTarget.innerHTML)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      );
    } else if (mounted) {
      content = <div style={{ ...textStyle, position: "absolute", inset: 0 }} className={styles.textElement} dangerouslySetInnerHTML={{ __html: sanitizeSlideHtml(element.html) }} />;
    } else {
      content = <div style={{ ...textStyle, position: "absolute", inset: 0 }} className={styles.textElement} />;
    }
  }

  return (
    <div ref={(node) => registerElement?.(element.id, node)} data-el={element.id} style={style} className={wrapperClass} {...wrapperProps}>
      {content}
    </div>
  );
}

export function SlideCanvas({
  artifactId,
  slide,
  index,
  total,
  deckTitle,
  className,
  fullImage = false,
  interactive = false,
  selectedId = null,
  editingId = null,
  onSelectElement,
  onElementPointerDown,
  onStartEditElement,
  onCommitText,
  registerElement,
}: {
  artifactId: string;
  slide: DeckSlide;
  index: number;
  total: number;
  deckTitle: string;
  className?: string;
  fullImage?: boolean;
  interactive?: boolean;
  selectedId?: string | null;
  editingId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onElementPointerDown?: (id: string, event: React.PointerEvent) => void;
  onStartEditElement?: (id: string) => void;
  onCommitText?: (elementId: string, html: string) => void;
  registerElement?: (id: string, node: HTMLDivElement | null) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const update = () => setScale(element.clientWidth / CANVAS_W);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const background = slide.background;
  const hasElements = Boolean(slide.elements?.length);

  return (
    <div ref={frame} className={`${styles.frame} ${className ?? ""}`} style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
      <div className={styles.canvas} style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}>
        {background?.kind === "color" && background.value && <div className={styles.bgColor} style={{ background: background.value }} />}
        {background?.kind === "image" && background.assetKey && (
          // eslint-disable-next-line @next/next/no-img-element -- private auth-gated asset route
          <img src={`/api/artifacts/${artifactId}/assets/${background.assetKey}`} alt="" className={styles.bgImage} />
        )}
        {fullImage ? (
          slide.image_status === "ready" ? (
            // eslint-disable-next-line @next/next/no-img-element -- private auth-gated asset route
            <img src={`/api/artifacts/${artifactId}/assets/${slide.image_key || `slide-${index}.png`}`} alt="" className={styles.fullSlideImage} />
          ) : (
            <div className={styles.fullSlidePending}>
              <Sparkles size={26} aria-hidden="true" />
              {slide.image_status === "failed" ? "Slaid ini tidak dapat dijana." : "Slaid sedang direka oleh AI…"}
            </div>
          )
        ) : hasElements ? (
          <>
            {(background?.kind ?? "theme") === "theme" && <div className={styles.bgTheme} />}
            {slide.elements!.map((element) => (
              <ElementView
                key={element.id}
                artifactId={artifactId}
                element={element}
                interactive={interactive}
                selected={selectedId === element.id}
                editing={editingId === element.id}
                onSelectElement={onSelectElement}
                onElementPointerDown={onElementPointerDown}
                onStartEditElement={onStartEditElement}
                onCommitText={onCommitText}
                registerElement={registerElement}
              />
            ))}
          </>
        ) : (
          <TemplateLayer artifactId={artifactId} slide={slide} index={index} total={total} deckTitle={deckTitle} />
        )}
      </div>
    </div>
  );
}
