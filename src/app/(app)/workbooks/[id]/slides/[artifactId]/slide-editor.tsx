"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, Check, Circle, Copy, ImagePlus, Italic, Bold, LoaderCircle,
  Minus, Play, Plus, Redo2, Sparkles, Square, Trash2, Triangle, Type, Undo2, Underline, Upload, X,
} from "lucide-react";
import type { DeckData, DeckSlide, SlideElement } from "@/lib/generation/schemas";
import { CANVAS_H, CANVAS_W, newElementId, sanitizeSlideHtml, structuredToElements } from "@/lib/workbook/slide-elements";
import { Presentation } from "../../presentation";
import { SlideCanvas } from "../../slide-canvas";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { WorkbookDialog } from "../../workbook-dialog";
import styles from "./slide-editor.module.css";

const COLOR_SWATCHES = ["#10112f", "#23264a", "#4a5670", "#00786a", "#00856f", "#00a58d", "#b7791f", "#c2410c", "#b91c1c", "#7c3aed", "#2563eb", "#ffffff"];
const FILL_SWATCHES = ["#00856f", "#00a58d", "#d5f983", "#ffd166", "#f97362", "#7c3aed", "#2563eb", "#10112f", "#e2e8f0", "#ffffff"];
const BACKGROUND_SWATCHES = ["#ffffff", "#eefaf5", "#eff6ff", "#fff9ef", "#f6f2ff", "#10112f"];
const TYPE_OPTIONS = [
  { value: "title", label: "Tajuk" }, { value: "objectives", label: "Objektif" }, { value: "concept", label: "Konsep" },
  { value: "worked_example", label: "Contoh" }, { value: "check", label: "Semak" }, { value: "summary", label: "Ringkasan" },
];
const LAYOUT_OPTIONS = [
  { value: "cover", label: "Muka hadapan" }, { value: "text", label: "Teks" }, { value: "split_visual", label: "Teks & ilustrasi" },
];
const WEIGHT_OPTIONS = [
  { value: "400", label: "Biasa" }, { value: "500", label: "Sederhana" }, { value: "600", label: "Tebal" }, { value: "700", label: "Sangat tebal" }, { value: "800", label: "Paling tebal" },
];
const RADIUS_OPTIONS = [{ value: "0", label: "Tepi tajam" }, { value: "12", label: "Sedikit bulat" }, { value: "22", label: "Bulat" }, { value: "999", label: "Kapsul" }];
const LINE_OPTIONS = [{ value: "1.2", label: "Rapat" }, { value: "1.5", label: "Normal" }, { value: "1.8", label: "Lapang" }];

type Interaction = {
  mode: "drag" | "resize" | "rotate";
  elementId: string;
  handle?: string;
  start: { x: number; y: number };
  origin: { x: number; y: number; w: number; h: number; rotation: number };
};

function normalizeDeck(deck: DeckData): DeckData {
  return {
    ...deck,
    slides: (deck.slides ?? []).map((slide, index) => (slide.elements?.length ? slide : { ...slide, elements: structuredToElements(slide, index) })),
  };
}

function blankSlide(): DeckSlide {
  return {
    type: "concept", layout: "text", title: "Slaid baharu", body: "", bullets: [], notes: "", visual_prompt: "", image_status: "none",
    elements: [
      { id: newElementId(), type: "shape", x: 90, y: 84, w: 62, h: 8, z: 1, shape: "rect", fill: "#00856f", radius: 4 },
      { id: newElementId(), type: "text", x: 90, y: 118, w: 1080, h: 110, z: 2, html: "Slaid baharu", style: { fontSize: 42, fontWeight: 800, color: "#23264a", align: "left", lineHeight: 1.2 } },
      { id: newElementId(), type: "text", x: 90, y: 268, w: 1080, h: 280, z: 2, html: "<ul><li>Poin pertama</li><li>Poin kedua</li></ul>", style: { fontSize: 23, fontWeight: 550, color: "#31375c", align: "left", lineHeight: 1.8 } },
    ],
  };
}

export function SlideEditor({
  artifactId,
  workbookId,
  initialDeck,
  initialTitle,
  initialDescription,
  initialStatus,
}: {
  artifactId: string;
  workbookId: string;
  initialDeck: DeckData;
  initialTitle: string;
  initialDescription: string;
  initialStatus: "draft" | "ready";
}) {
  const router = useRouter();
  const [deck, setDeck] = useState<DeckData>(() => normalizeDeck(initialDeck));
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"draft" | "ready">(initialStatus);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [error, setError] = useState("");
  const [presenting, setPresenting] = useState(false);
  const [imageDialog, setImageDialog] = useState<null | { replaceId?: string }>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [dragSlide, setDragSlide] = useState<number | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const scalerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ axis: "x" | "y"; at: number }[]>([]);
  const pastRef = useRef<DeckData[]>([]);
  const futureRef = useRef<DeckData[]>([]);
  const [, bump] = useState(0);
  const nodesRef = useRef(new Map<string, HTMLDivElement>());
  const frameRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const imagesMode = deck.format === "images";
  const slide = deck.slides[Math.min(index, deck.slides.length - 1)];
  const selectedElement = slide?.elements?.find((element) => element.id === selectedId) ?? null;

  function canvasPoint(clientX: number, clientY: number) {
    const rect = scalerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left) / canvasScale, y: (clientY - rect.top) / canvasScale };
  }

  function beginInteraction(mode: Interaction["mode"], element: SlideElement, event: React.PointerEvent, handle?: string) {
    if (editingId) return;
    event.stopPropagation();
    event.preventDefault();
    setSelectedId(element.id);
    const point = canvasPoint(event.clientX, event.clientY);
    const next: Interaction = { mode, elementId: element.id, handle, start: point, origin: { x: element.x, y: element.y, w: element.w, h: element.h, rotation: element.rotation ?? 0 } };
    interactionRef.current = next;
    setInteraction(next);
  }

  useEffect(() => {
    if (!interaction) return;
    const SNAP = 7;
    const others = (slide.elements ?? []).filter((element) => element.id !== interaction.elementId);
    const targetsX = [0, CANVAS_W / 2, CANVAS_W, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
    const targetsY = [0, CANVAS_H / 2, CANVAS_H, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];

    function bestSnap(values: number[], targets: number[]) {
      let best: { delta: number; at: number } | null = null;
      for (const value of values) for (const target of targets) {
        const delta = target - value;
        if (Math.abs(delta) <= SNAP && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, at: target };
      }
      return best;
    }

    function onMove(event: PointerEvent) {
      const current = interactionRef.current;
      if (!current) return;
      const node = nodesRef.current.get(current.elementId);
      if (!node) return;
      const point = canvasPoint(event.clientX, event.clientY);
      const dx = point.x - current.start.x;
      const dy = point.y - current.start.y;
      const origin = current.origin;
      const guides: { axis: "x" | "y"; at: number }[] = [];

      if (current.mode === "drag") {
        let x = origin.x + dx;
        let y = origin.y + dy;
        const snapX = bestSnap([x, x + origin.w / 2, x + origin.w], targetsX);
        const snapY = bestSnap([y, y + origin.h / 2, y + origin.h], targetsY);
        if (snapX) { x += snapX.delta; guides.push({ axis: "x", at: snapX.at }); }
        if (snapY) { y += snapY.delta; guides.push({ axis: "y", at: snapY.at }); }
        x = Math.max(-origin.w + 40, Math.min(CANVAS_W - 40, x));
        y = Math.max(-origin.h + 40, Math.min(CANVAS_H - 40, y));
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
      } else if (current.mode === "resize") {
        let { x, y, w, h } = origin;
        const handle = current.handle ?? "se";
        if (handle.includes("e")) w = Math.max(24, origin.w + dx);
        if (handle.includes("s")) h = Math.max(18, origin.h + dy);
        if (handle.includes("w")) { w = Math.max(24, origin.w - dx); x = origin.x + (origin.w - w); }
        if (handle.includes("n")) { h = Math.max(18, origin.h - dy); y = origin.y + (origin.h - h); }
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.width = `${w}px`;
        node.style.height = `${h}px`;
      } else {
        const center = canvasPoint(...(() => { const rect = scalerRef.current!.getBoundingClientRect(); return [rect.left + (origin.x + origin.w / 2) * canvasScale, rect.top + (origin.y + origin.h / 2) * canvasScale] as [number, number]; })());
        let angle = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI + 90;
        angle = Math.round(angle / 5) * 5;
        node.style.transform = `rotate(${angle}deg)`;
      }
      setSnapGuides(guides);
    }

    function onUp() {
      const current = interactionRef.current;
      interactionRef.current = null;
      setInteraction(null);
      setSnapGuides([]);
      if (!current) return;
      const node = nodesRef.current.get(current.elementId);
      if (!node) return;
      const patch: Partial<SlideElement> = { x: parseFloat(node.style.left) || 0, y: parseFloat(node.style.top) || 0 };
      if (current.mode === "resize") {
        patch.w = Math.max(24, parseFloat(node.style.width) || current.origin.w);
        patch.h = Math.max(18, parseFloat(node.style.height) || current.origin.h);
      }
      if (current.mode === "rotate") {
        const match = /rotate\(([-\d.]+)deg\)/.exec(node.style.transform || "");
        patch.rotation = match ? Number(match[1]) : current.origin.rotation;
      }
      patchElement(current.elementId, patch);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction, canvasScale]);

  const commit = useCallback((updater: (current: DeckData) => DeckData, record = true) => {
    setDeck((current) => {
      const next = updater(current);
      if (record) {
        pastRef.current = [...pastRef.current.slice(-49), current];
        futureRef.current = [];
        bump((value) => value + 1);
      }
      setSaveState("dirty");
      return next;
    });
  }, []);

  const patchSlide = useCallback((slideIndex: number, patch: Partial<DeckSlide>, record = true) => {
    commit((current) => ({ ...current, slides: current.slides.map((item, itemIndex) => (itemIndex === slideIndex ? { ...item, ...patch } : item)) }), record);
  }, [commit]);

  const patchElement = useCallback((elementId: string, patch: Partial<SlideElement>) => {
    commit((current) => ({
      ...current,
      slides: current.slides.map((item, itemIndex) => itemIndex !== index ? item : {
        ...item,
        elements: (item.elements ?? []).map((element) => (element.id === elementId ? { ...element, ...patch } as SlideElement : element)),
      }),
    }));
  }, [commit, index]);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (!past.length) return;
    const previous = past[past.length - 1];
    pastRef.current = past.slice(0, -1);
    setDeck((current) => { futureRef.current = [current, ...futureRef.current].slice(0, 50); return previous; });
    setSaveState("dirty");
    bump((value) => value + 1);
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (!future.length) return;
    const next = future[0];
    futureRef.current = future.slice(1);
    setDeck((current) => { pastRef.current = [...pastRef.current, current]; return next; });
    setSaveState("dirty");
    bump((value) => value + 1);
  }, []);

  // Canvas scale measurement.
  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const update = () => setCanvasScale(element.clientWidth / CANVAS_W);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Autosave (debounced).
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const safeTitle = (title.trim().length >= 3 ? title.trim() : deck.title || "Dek slaid").slice(0, 160);
        const response = await fetch(`/api/artifacts/${artifactId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "slides", title: safeTitle, description: initialDescription, status, data: { ...deck, title: safeTitle } }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal menyimpan.");
        }
        setSaveState("saved");
        setError("");
      } catch (err) {
        setError((err as Error).message);
        setSaveState("error");
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [saveState, deck, title, status, artifactId, initialDescription]);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if (typing) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        if (selectedId) { event.preventDefault(); deleteElement(selectedId); }
        return;
      }
      if (mod && event.key.toLowerCase() === "d" && selectedId) { event.preventDefault(); duplicateElement(selectedId); return; }
      if (event.key === "Escape") { setSelectedId(null); setEditingId(null); return; }
      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const element = selectedElement;
        if (!element) return;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        patchElement(selectedId, { x: element.x + dx, y: element.y + dy });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selectedElement, undo, redo, index]);

  function registerElement(id: string, node: HTMLDivElement | null) {
    if (node) nodesRef.current.set(id, node);
    else nodesRef.current.delete(id);
  }

  function addElement(element: SlideElement) {
    patchSlide(index, { elements: [...(slide.elements ?? []), element] });
    setSelectedId(element.id);
  }

  function deleteElement(elementId: string) {
    patchSlide(index, { elements: (slide.elements ?? []).filter((element) => element.id !== elementId) });
    setSelectedId(null);
  }

  function duplicateElement(elementId: string) {
    const element = slide.elements?.find((item) => item.id === elementId);
    if (!element) return;
    const clone = { ...element, id: newElementId(), x: element.x + 28, y: element.y + 28, z: element.z + 1 } as SlideElement;
    patchSlide(index, { elements: [...(slide.elements ?? []), clone] });
    setSelectedId(clone.id);
  }

  function insertText() {
    addElement({ id: newElementId(), type: "text", x: 340, y: 300, w: 600, h: 120, z: 5, html: "Teks baharu", style: { fontSize: 30, fontWeight: 700, color: "#23264a", align: "left", lineHeight: 1.4 } });
  }

  function insertShape(shape: "rect" | "circle" | "line" | "triangle") {
    addElement({ id: newElementId(), type: "shape", x: 480, y: 260, w: shape === "line" ? 320 : 260, h: shape === "line" ? 8 : 200, z: 4, shape, fill: "#00856f", radius: shape === "rect" ? 18 : undefined });
  }

  function addSlide(after = index) {
    const next = blankSlide();
    commit((current) => {
      const slides = [...current.slides];
      slides.splice(after + 1, 0, next);
      return { ...current, slides };
    });
    setIndex(after + 1);
    setSelectedId(null);
  }

  function duplicateSlide(slideIndex: number) {
    const source = deck.slides[slideIndex];
    const clone: DeckSlide = {
      ...source,
      elements: (source.elements ?? []).map((element) => ({ ...element, id: newElementId() })),
      title: `${source.title} (salinan)`.slice(0, 140),
    };
    commit((current) => {
      const slides = [...current.slides];
      slides.splice(slideIndex + 1, 0, clone);
      return { ...current, slides };
    });
    setIndex(slideIndex + 1);
  }

  function deleteSlide(slideIndex: number) {
    if (deck.slides.length <= 1) return;
    commit((current) => ({ ...current, slides: current.slides.filter((_, itemIndex) => itemIndex !== slideIndex) }));
    setIndex(Math.max(0, Math.min(slideIndex, deck.slides.length - 2)));
    setSelectedId(null);
  }

  function reorderSlide(from: number, to: number) {
    if (from === to) return;
    commit((current) => {
      const slides = [...current.slides];
      const [moved] = slides.splice(from, 1);
      slides.splice(to, 0, moved);
      return { ...current, slides };
    });
    setIndex(to);
  }

  async function generateSlideImage() {
    setImageBusy(true); setError("");
    try {
      const prompt = imagesMode ? slide.title || "slaid pembelajaran" : (slide.visual_prompt || slide.title || "ilustrasi pembelajaran");
      const response = await fetch(`/api/artifacts/${artifactId}/slide-image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: prompt.slice(0, 500), mode: "slide", slideIndex: index, fullSlide: imagesMode }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Imej tidak dapat dijana.");
      const assetKey = payload.assetKey as string;
      if (!imagesMode) {
        const existing = slide.elements?.find((element) => element.type === "image");
        if (existing) patchElement(existing.id, { assetKey });
        else addElement({ id: newElementId(), type: "image", x: 780, y: 120, w: 420, h: 480, z: 3, assetKey, radius: 20 });
      }
      patchSlide(index, { image_key: assetKey, image_status: "ready" });
    } catch (err) { setError((err as Error).message); } finally { setImageBusy(false); }
  }

  async function uploadImage(file: File) {
    setImageBusy(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`/api/artifacts/${artifactId}/assets`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Muat naik gagal.");
      insertImage(payload.assetKey as string);
      setImageDialog(null);
    } catch (err) { setError((err as Error).message); } finally { setImageBusy(false); }
  }

  async function generateMediaImage() {
    if (imagePrompt.trim().length < 4) return;
    setImageBusy(true); setError("");
    try {
      const response = await fetch(`/api/artifacts/${artifactId}/slide-image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: imagePrompt.trim(), mode: "media" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Imej tidak dapat dijana.");
      const target = imageDialog?.replaceId;
      if (target) patchElement(target, { assetKey: payload.assetKey });
      else insertImage(payload.assetKey as string);
      setImageDialog(null); setImagePrompt("");
    } catch (err) { setError((err as Error).message); } finally { setImageBusy(false); }
  }

  function insertImage(assetKey: string) {
    addElement({ id: newElementId(), type: "image", x: 430, y: 190, w: 420, h: 320, z: 4, assetKey, radius: 18, shadow: true });
  }

  function applyExec(command: string) {
    document.execCommand(command);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href={`/workbooks/${workbookId}?tab=slides`} className={styles.iconButton} aria-label="Kembali ke buku kerja">
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
          <input
            className={styles.titleInput}
            value={title}
            maxLength={160}
            aria-label="Tajuk dek"
            onChange={(event) => { setTitle(event.target.value); setSaveState("dirty"); }}
          />
          <span className={styles.saveChip} data-state={saveState}>
            {saveState === "saving" ? <><LoaderCircle size={12} className={styles.spin} /> Menyimpan…</> : saveState === "dirty" ? "Perubahan belum disimpan" : saveState === "error" ? "Gagal menyimpan" : <><Check size={12} /> Disimpan</>}
          </span>
        </div>
        <div className={styles.topRight}>
          <button type="button" className={styles.iconButton} onClick={undo} disabled={!pastRef.current.length} aria-label="Undo (⌘Z)"><Undo2 size={16} aria-hidden="true" /></button>
          <button type="button" className={styles.iconButton} onClick={redo} disabled={!futureRef.current.length} aria-label="Redo (⌘⇧Z)"><Redo2 size={16} aria-hidden="true" /></button>
          <button type="button" className={styles.iconButton} onClick={() => setPresenting(true)} aria-label="Main persembahan" title="Main persembahan"><Play size={16} aria-hidden="true" /></button>
          <Segmented ariaLabel="Status dek" value={status} onChange={(value) => { setStatus(value); setSaveState("dirty"); }} options={[{ value: "draft", label: "Draf" }, { value: "ready", label: "Sedia" }]} />
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.rail} aria-label="Senarai slaid">
          {deck.slides.map((item, itemIndex) => (
            <div
              key={`${itemIndex}-${item.title}`}
              className={styles.railItem}
              data-active={itemIndex === index}
              draggable
              onDragStart={() => setDragSlide(itemIndex)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (dragSlide !== null) reorderSlide(dragSlide, itemIndex); setDragSlide(null); }}
            >
              <span className={styles.railNumber}>{itemIndex + 1}</span>
              <button type="button" className={styles.railThumb} onClick={() => { setIndex(itemIndex); setSelectedId(null); setEditingId(null); }}>
                <SlideCanvas artifactId={artifactId} slide={item} index={itemIndex} total={deck.slides.length} deckTitle={deck.title} className={styles.railCanvas} fullImage={imagesMode} />
              </button>
              <span className={styles.railActions}>
                <button type="button" aria-label={`Duplikasi slaid ${itemIndex + 1}`} onClick={() => duplicateSlide(itemIndex)}><Copy size={12} aria-hidden="true" /></button>
                <button type="button" aria-label={`Padam slaid ${itemIndex + 1}`} onClick={() => deleteSlide(itemIndex)} disabled={deck.slides.length <= 1}><Trash2 size={12} aria-hidden="true" /></button>
              </span>
            </div>
          ))}
          <button type="button" className={styles.addSlide} onClick={() => addSlide()}>
            <Plus size={15} aria-hidden="true" /> Tambah slaid
          </button>
        </aside>

        <main className={styles.canvasArea}>
          {imagesMode ? (
            <div className={styles.insertBar} role="status">
              <Sparkles size={14} aria-hidden="true" /> Dek imej penuh — setiap slaid direka AI. Jana semula imej di panel kanan.
            </div>
          ) : (
          <div className={styles.insertBar} role="toolbar" aria-label="Sisip kandungan">
            <button type="button" onClick={insertText}><Type size={14} aria-hidden="true" /> Teks</button>
            <button type="button" onClick={() => setImageDialog({})}><ImagePlus size={14} aria-hidden="true" /> Imej</button>
            <span className={styles.insertGroup} role="group" aria-label="Bentuk">
              <button type="button" onClick={() => insertShape("rect")} aria-label="Segi empat" title="Segi empat"><Square size={14} aria-hidden="true" /></button>
              <button type="button" onClick={() => insertShape("circle")} aria-label="Bulatan" title="Bulatan"><Circle size={14} aria-hidden="true" /></button>
              <button type="button" onClick={() => insertShape("triangle")} aria-label="Segi tiga" title="Segi tiga"><Triangle size={14} aria-hidden="true" /></button>
              <button type="button" onClick={() => insertShape("line")} aria-label="Garis" title="Garis"><Minus size={14} aria-hidden="true" /></button>
            </span>
            {editingId && (
              <span className={styles.formatGroup} role="group" aria-label="Format teks">
                <button type="button" onMouseDown={(event) => { event.preventDefault(); applyExec("bold"); }} aria-label="Tebal"><Bold size={14} aria-hidden="true" /></button>
                <button type="button" onMouseDown={(event) => { event.preventDefault(); applyExec("italic"); }} aria-label="Condong"><Italic size={14} aria-hidden="true" /></button>
                <button type="button" onMouseDown={(event) => { event.preventDefault(); applyExec("underline"); }} aria-label="Garis bawah"><Underline size={14} aria-hidden="true" /></button>
                <button type="button" onMouseDown={(event) => { event.preventDefault(); applyExec("insertUnorderedList"); }} aria-label="Senarai bulet">•</button>
              </span>
            )}
            {selectedElement?.type === "text" && !editingId && (
              <span className={styles.formatGroup} role="group" aria-label="Selaraskan">
                {(["left", "center", "right"] as const).map((align) => (
                  <button key={align} type="button" aria-pressed={selectedElement.style.align === align} onClick={() => patchElement(selectedElement.id, { style: { ...selectedElement.style, align } } as Partial<SlideElement>)} aria-label={`Selaras ${align}`}>
                    {align === "left" ? <AlignLeft size={14} aria-hidden="true" /> : align === "center" ? <AlignCenter size={14} aria-hidden="true" /> : <AlignRight size={14} aria-hidden="true" />}
                  </button>
                ))}
              </span>
            )}
          </div>
          )}

          <div
            className={styles.canvasFrame}
            ref={frameRef}
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
            onPointerDown={(event) => { if (event.target === event.currentTarget) { setSelectedId(null); setEditingId(null); } }}
          >
            <div className={styles.canvasScaler} ref={scalerRef} style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${canvasScale})` }}>
              <SlideCanvas
                artifactId={artifactId}
                slide={slide}
                index={index}
                total={deck.slides.length}
                deckTitle={deck.title}
                fullImage={imagesMode}
                interactive={!imagesMode}
                selectedId={selectedId}
                editingId={editingId}
                onElementPointerDown={(id, event) => {
                  if (editingId && editingId !== id) setEditingId(null);
                  const element = slide.elements?.find((item) => item.id === id);
                  if (element && !editingId) beginInteraction("drag", element, event);
                  else setSelectedId(id);
                }}
                onStartEditElement={(id) => setEditingId(id)}
                onCommitText={(elementId, html) => patchElement(elementId, { html: sanitizeSlideHtml(html) } as Partial<SlideElement>)}
                registerElement={registerElement}
              />
              {selectedElement && !editingId && !interaction && (
                <div
                  className={styles.selection}
                  style={{ left: selectedElement.x - 3, top: selectedElement.y - 3, width: selectedElement.w + 6, height: selectedElement.h + 6, transform: selectedElement.rotation ? `rotate(${selectedElement.rotation}deg)` : undefined }}
                >
                  <button type="button" className={styles.rotateHandle} aria-label="Putar" onPointerDown={(event) => beginInteraction("rotate", selectedElement, event)} />
                  {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                    <button key={handle} type="button" data-handle={handle} aria-label={`Ubah saiz ${handle}`} className={styles.resizeHandle} onPointerDown={(event) => beginInteraction("resize", selectedElement, event, handle)} />
                  ))}
                </div>
              )}
              {snapGuides.map((guide, guideIndex) => (
                <span key={guideIndex} className={styles.snapGuide} data-axis={guide.axis} style={guide.axis === "x" ? { left: guide.at } : { top: guide.at }} aria-hidden="true" />
              ))}
            </div>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}
        </main>

        <aside className={styles.panel} aria-label="Panel sifat">
          {selectedElement ? (
            <div className={styles.panelBody}>
              <div className={styles.panelHead}>
                <strong>{selectedElement.type === "text" ? "Teks" : selectedElement.type === "image" ? "Imej" : "Bentuk"}</strong>
                <button type="button" className={styles.panelClose} onClick={() => setSelectedId(null)}>Kembali ke slaid</button>
              </div>

              <div className={styles.fieldGrid}>
                <label>X<input type="number" value={Math.round(selectedElement.x)} onChange={(event) => patchElement(selectedElement.id, { x: Number(event.target.value) || 0 })} /></label>
                <label>Y<input type="number" value={Math.round(selectedElement.y)} onChange={(event) => patchElement(selectedElement.id, { y: Number(event.target.value) || 0 })} /></label>
                <label>L<input type="number" value={Math.round(selectedElement.w)} onChange={(event) => patchElement(selectedElement.id, { w: Math.max(20, Number(event.target.value) || 20) })} /></label>
                <label>T<input type="number" value={Math.round(selectedElement.h)} onChange={(event) => patchElement(selectedElement.id, { h: Math.max(16, Number(event.target.value) || 16) })} /></label>
              </div>

              <div className={styles.rowButtons}>
                <button type="button" onClick={() => patchElement(selectedElement.id, { z: selectedElement.z + 1 })}>Ke depan</button>
                <button type="button" onClick={() => patchElement(selectedElement.id, { z: Math.max(0, selectedElement.z - 1) })}>Ke belakang</button>
                <button type="button" onClick={() => duplicateElement(selectedElement.id)}><Copy size={13} aria-hidden="true" /> Salin</button>
                <button type="button" className={styles.danger} onClick={() => deleteElement(selectedElement.id)}><Trash2 size={13} aria-hidden="true" /> Padam</button>
              </div>

              {selectedElement.type === "text" && (
                <>
                  <label className={styles.field}>Saiz teks
                    <input type="number" min={8} max={160} value={Math.round(selectedElement.style.fontSize)} onChange={(event) => patchElement(selectedElement.id, { style: { ...selectedElement.style, fontSize: Math.max(8, Math.min(160, Number(event.target.value) || 22)) } } as Partial<SlideElement>)} />
                  </label>
                  <label className={styles.field}>Ketebalan
                    <Select ariaLabel="Ketebalan" value={String(selectedElement.style.fontWeight)} onValueChange={(value) => patchElement(selectedElement.id, { style: { ...selectedElement.style, fontWeight: Number(value) } } as Partial<SlideElement>)} options={WEIGHT_OPTIONS} />
                  </label>
                  <label className={styles.field}>Jarak baris
                    <Select ariaLabel="Jarak baris" value={String(selectedElement.style.lineHeight)} onValueChange={(value) => patchElement(selectedElement.id, { style: { ...selectedElement.style, lineHeight: Number(value) } } as Partial<SlideElement>)} options={LINE_OPTIONS} />
                  </label>
                  <div className={styles.field}>Warna teks
                    <div className={styles.swatches}>
                      {COLOR_SWATCHES.map((color) => (
                        <button key={color} type="button" style={{ background: color }} aria-label={`Warna ${color}`} aria-pressed={selectedElement.style.color === color} onClick={() => patchElement(selectedElement.id, { style: { ...selectedElement.style, color } } as Partial<SlideElement>)} />
                      ))}
                    </div>
                  </div>
                  <div className={styles.rowButtons}>
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setEditingId(selectedElement.id)}>Edit teks pada slaid</button>
                  </div>
                </>
              )}

              {selectedElement.type === "image" && (
                <>
                  <label className={styles.field}>Sudut tepi
                    <Select ariaLabel="Sudut tepi" value={String(selectedElement.radius ?? 0)} onValueChange={(value) => patchElement(selectedElement.id, { radius: Number(value) })} options={RADIUS_OPTIONS} />
                  </label>
                  <div className={styles.rowButtons}>
                    <button type="button" aria-pressed={selectedElement.shadow} onClick={() => patchElement(selectedElement.id, { shadow: !selectedElement.shadow })}>Bayang {selectedElement.shadow ? "aktif" : "mati"}</button>
                    <button type="button" onClick={() => setImageDialog({ replaceId: selectedElement.id })}><ImagePlus size={13} aria-hidden="true" /> Ganti imej</button>
                  </div>
                </>
              )}

              {selectedElement.type === "shape" && (
                <>
                  <label className={styles.field}>Bentuk
                    <Select ariaLabel="Bentuk" value={selectedElement.shape} onValueChange={(value) => patchElement(selectedElement.id, { shape: value as "rect" | "circle" | "line" | "triangle" })} options={[{ value: "rect", label: "Segi empat" }, { value: "circle", label: "Bulatan" }, { value: "triangle", label: "Segi tiga" }, { value: "line", label: "Garis" }]} />
                  </label>
                  <div className={styles.field}>Warna
                    <div className={styles.swatches}>
                      {FILL_SWATCHES.map((color) => (
                        <button key={color} type="button" style={{ background: color }} aria-label={`Warna ${color}`} aria-pressed={selectedElement.fill === color} onClick={() => patchElement(selectedElement.id, { fill: color })} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.panelBody}>
              <div className={styles.panelHead}><strong>Slaid {index + 1}</strong><span className={styles.panelMeta}>{deck.slides.length} slaid</span></div>
              <label className={styles.field}>Jenis
                <Select ariaLabel="Jenis slaid" value={slide.type} onValueChange={(value) => patchSlide(index, { type: value as DeckSlide["type"] })} options={TYPE_OPTIONS} />
              </label>
              <label className={styles.field}>Susun atur
                <Select ariaLabel="Susun atur" value={slide.layout} onValueChange={(value) => patchSlide(index, { layout: value as DeckSlide["layout"] })} options={LAYOUT_OPTIONS} />
              </label>
              <div className={styles.field}>Latar belakang
                <div className={styles.swatches}>
                  <button type="button" className={styles.themeSwatch} aria-pressed={!slide.background || slide.background.kind === "theme"} onClick={() => patchSlide(index, { background: { kind: "theme" } })}>Tema</button>
                  {BACKGROUND_SWATCHES.map((color) => (
                    <button key={color} type="button" style={{ background: color }} aria-label={`Latar ${color}`} aria-pressed={slide.background?.kind === "color" && slide.background.value === color} onClick={() => patchSlide(index, { background: { kind: "color", value: color } })} />
                  ))}
                </div>
              </div>
              <label className={styles.field}>Nota penyampai
                <textarea rows={4} maxLength={600} value={slide.notes} onChange={(event) => patchSlide(index, { notes: event.target.value })} />
              </label>
              <div className={styles.rowButtons}>
                <button type="button" onClick={() => void generateSlideImage()} disabled={imageBusy}>
                  {imageBusy ? <LoaderCircle size={13} className={styles.spin} aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />} {imagesMode ? "Jana semula slaid imej" : "Jana imej AI"}
                </button>
                <button type="button" onClick={() => duplicateSlide(index)}><Copy size={13} aria-hidden="true" /> Duplikasi slaid</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {presenting && <Presentation artifactId={artifactId} deck={{ ...deck, title: title.trim() || deck.title }} startIndex={index} onClose={() => setPresenting(false)} />}

      {imageDialog && (
        <WorkbookDialog title="Tambah imej" onClose={() => { if (!imageBusy) { setImageDialog(null); setImagePrompt(""); } }}>
          <div className={styles.imageDialog}>
            <h2>Tambah imej</h2>
            <p>Muat naik imej anda atau jana imej baharu dengan AI.</p>
            <button type="button" className={styles.uploadZone} onClick={() => fileRef.current?.click()} disabled={imageBusy}>
              {imageBusy ? <LoaderCircle size={20} className={styles.spin} aria-hidden="true" /> : <Upload size={20} aria-hidden="true" />}
              Muat naik imej (PNG, JPG, WEBP · maks 8 MB)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = ""; }}
            />
            <div className={styles.imageDivider}><span>atau</span></div>
            <label className={styles.field}>Huraian imej AI
              <textarea rows={3} maxLength={600} value={imagePrompt} placeholder="cth. peta Malaysia dengan ikon cuaca, gaya rata" onChange={(event) => setImagePrompt(event.target.value)} />
            </label>
            <button type="button" className={styles.primaryWide} onClick={() => void generateMediaImage()} disabled={imageBusy || imagePrompt.trim().length < 4}>
              {imageBusy ? <LoaderCircle size={15} className={styles.spin} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />} Jana imej AI
            </button>
          </div>
        </WorkbookDialog>
      )}
    </div>
  );
}
