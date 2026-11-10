import type { DeckSlide, SlideElement } from "@/lib/generation/schemas";

/** Fixed design canvas every slide renders on (scaled to fit). */
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export function newElementId() {
  return `el_${Math.random().toString(36).slice(2, 10)}`;
}

/** Allowlist-sanitized slide HTML (defense against crafted API payloads). */
export function sanitizeSlideHtml(html: string): string {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<div id="slide-root">${html}</div>`, "text/html");
  const root = doc.getElementById("slide-root");
  if (!root) return "";
  const allowed = "b,i,u,strong,em,br,ul,ol,li,span,p,div";
  const selector = allowed.split(",").map((tag) => `:not(${tag})`).join("");
  for (let guard = 0; guard < 12; guard++) {
    const bad = root.querySelector(`*${selector}`);
    if (!bad) break;
    bad.replaceWith(...bad.childNodes);
  }
  for (const element of root.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name === "style") {
        const safe = attribute.value
          .split(";")
          .map((part) => part.trim())
          .filter((part) => /^(color|font-size|background-color|text-decoration|font-weight|font-style)\s*:/i.test(part))
          .join("; ");
        if (safe) element.setAttribute("style", safe);
        else element.removeAttribute("style");
      } else {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return root.innerHTML;
}

export function bulletsHtml(bullets: string[]) {
  if (!bullets.length) return "";
  return `<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textElement(partial: Partial<Extract<SlideElement, { type: "text" }>> & { x: number; y: number; w: number; h: number }): SlideElement {
  return {
    id: newElementId(),
    type: "text",
    z: 2,
    html: "",
    style: { fontSize: 22, fontWeight: 600, color: "#23264a", align: "left", lineHeight: 1.5 },
    ...partial,
  };
}

function shapeElement(partial: Partial<Extract<SlideElement, { type: "shape" }>> & { x: number; y: number; w: number; h: number; shape: "rect" | "circle" | "line" | "triangle" }): SlideElement {
  return { id: newElementId(), type: "shape", z: 1, fill: "#00856f", ...partial };
}

/**
 * Deterministic conversion of an AI-generated structured slide into editable
 * elements (positions follow the built-in templates).
 */
export function structuredToElements(slide: DeckSlide, index: number): SlideElement[] {
  const elements: SlideElement[] = [];
  const isCover = slide.layout === "cover" || slide.type === "title";
  const hasImage = slide.image_status === "ready";
  const split = slide.layout === "split_visual" && hasImage;
  const imageKey = slide.image_key || `slide-${index}.png`;

  if (isCover) {
    elements.push(textElement({ x: 90, y: 210, w: 720, h: 170, html: escapeHtml(slide.title), style: { fontSize: 56, fontWeight: 800, color: "#ffffff", align: "left", lineHeight: 1.15 } }));
    if (slide.body) elements.push(textElement({ x: 90, y: 400, w: 640, h: 60, html: escapeHtml(slide.body), style: { fontSize: 22, fontWeight: 600, color: "#ccf3ea", align: "left", lineHeight: 1.5 } }));
    if (slide.bullets.length) elements.push(textElement({ x: 90, y: 470, w: 640, h: 150, html: bulletsHtml(slide.bullets), style: { fontSize: 17, fontWeight: 500, color: "#eafff9", align: "left", lineHeight: 1.7 } }));
    if (hasImage) elements.push({ id: newElementId(), type: "image", x: 780, y: 150, w: 420, h: 420, z: 1, assetKey: imageKey });
    return elements;
  }

  elements.push(shapeElement({ x: 90, y: 84, w: 62, h: 8, shape: "rect", radius: 4, fill: "#00856f" }));
  elements.push(textElement({ x: 90, y: 108, w: split ? 640 : 1100, h: 96, html: escapeHtml(slide.title), style: { fontSize: 42, fontWeight: 800, color: "#23264a", align: "left", lineHeight: 1.2 } }));
  if (slide.body) elements.push(textElement({ x: 90, y: 226, w: split ? 640 : 1100, h: 70, html: escapeHtml(slide.body), style: { fontSize: 21, fontWeight: 500, color: "#4a5670", align: "left", lineHeight: 1.6 } }));
  if (slide.bullets.length) elements.push(textElement({ x: 90, y: slide.body ? 312 : 250, w: split ? 640 : 1100, h: 300, html: bulletsHtml(slide.bullets), style: { fontSize: 23, fontWeight: 550, color: "#31375c", align: "left", lineHeight: 1.8 } }));
  if (split) elements.push({ id: newElementId(), type: "image", x: 770, y: 96, w: 420, h: 528, z: 1, assetKey: imageKey, radius: 20 });
  return elements;
}
