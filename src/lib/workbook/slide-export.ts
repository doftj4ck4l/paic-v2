"use client";
import type { DeckData } from "@/lib/generation/schemas";

async function imageDataUrl(artifactId: string, key: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/artifacts/${artifactId}/assets/${key}`);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Export a deck as an editable PowerPoint (.pptx) — text stays real text. */
export async function exportDeckPptx({ artifactId, deck, fileName }: { artifactId: string; deck: DeckData; fileName: string }) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE16x9", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE16x9";
  const ink = "23264A", sub = "4A5670", accent = "00856F", cover = "007A66", coverSoft = "CCF3EA", coverInk = "EAFFF9", body = "31375C";

  for (const [index, slide] of deck.slides.entries()) {
    const page = pptx.addSlide();
    const isCover = slide.layout === "cover" || slide.type === "title";
    const key = slide.image_key || `slide-${index}.png`;

    if (deck.format === "images" && slide.image_status === "ready") {
      const image = await imageDataUrl(artifactId, key);
      if (image) { page.addImage({ data: image, x: 0, y: 0, w: 13.333, h: 7.5 }); continue; }
    }

    if (isCover) {
      page.background = { color: cover };
      page.addText(slide.title, { x: 0.75, y: 2.0, w: 7.4, h: 1.9, fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Arial", valign: "middle" });
      if (slide.body) page.addText(slide.body, { x: 0.75, y: 3.9, w: 7.2, h: 0.6, fontSize: 16, color: coverSoft, fontFace: "Arial" });
      if (slide.bullets.length) page.addText(slide.bullets.map((bullet) => ({ text: bullet, options: { bullet: true } })), { x: 0.75, y: 4.5, w: 7.2, h: 2.4, fontSize: 14, color: coverInk, fontFace: "Arial", lineSpacingMultiple: 1.3 });
      if (slide.image_status === "ready") {
        const art = await imageDataUrl(artifactId, key);
        if (art) page.addImage({ data: art, x: 8.7, y: 1.7, w: 3.9, h: 4.0, sizing: { type: "contain", w: 3.9, h: 4.0 } });
      }
      continue;
    }

    const split = slide.layout === "split_visual";
    page.background = { color: "FFFFFF" };
    page.addShape("rect", { x: 0.75, y: 0.6, w: 0.62, h: 0.1, fill: { color: accent } });
    page.addText(slide.title, { x: 0.75, y: 0.82, w: 11.8, h: 1.15, fontSize: 28, bold: true, color: ink, fontFace: "Arial", valign: "middle" });
    let y = 2.05;
    if (slide.body) {
      page.addText(slide.body, { x: 0.75, y, w: split ? 6.5 : 11.8, h: 0.95, fontSize: 14, color: sub, fontFace: "Arial" });
      y += 1.0;
    }
    if (slide.bullets.length) {
      page.addText(slide.bullets.map((bullet) => ({ text: bullet, options: { bullet: true } })), { x: 0.75, y, w: split ? 6.5 : 11.8, h: 7.1 - y, fontSize: 16, color: body, fontFace: "Arial", lineSpacingMultiple: 1.35 });
    }
    if (split && slide.image_status === "ready") {
      const art = await imageDataUrl(artifactId, key);
      if (art) page.addImage({ data: art, x: 7.85, y: 1.05, w: 4.7, h: 5.45, sizing: { type: "contain", w: 4.7, h: 5.45 } });
    }
  }

  await pptx.writeFile({ fileName: `${fileName.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80) || "dek-slaid"}.pptx` });
}

/** Open the print view (browser print dialog → Save as PDF). */
export function openDeckPrint(artifactId: string) {
  window.open(`/print/slides/${artifactId}`, "_blank", "noopener");
}
