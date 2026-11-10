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

/**
 * Public Google OAuth client id (safe to embed — it ships in the browser either
 * way). Overridable via NEXT_PUBLIC_GOOGLE_CLIENT_ID for other environments.
 */
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "801610626488-7f9h4sq2kln1i2fhuh89936ab5hg4gb2.apps.googleusercontent.com";

export function googleSlidesConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

/** Build the deck as an editable PowerPoint (.pptx) — text stays real text. */
export async function buildDeckPptxBlob({ artifactId, deck }: { artifactId: string; deck: DeckData }): Promise<Blob> {
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

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

export function deckFileName(fileName: string) {
  return `${fileName.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80) || "dek-slaid"}.pptx`;
}

/** Download the deck as a .pptx file. */
export async function exportDeckPptx({ artifactId, deck, fileName }: { artifactId: string; deck: DeckData; fileName: string }) {
  const blob = await buildDeckPptxBlob({ artifactId, deck });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = deckFileName(fileName);
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Open the print view (browser print dialog → Save as PDF). */
export function openDeckPrint(artifactId: string) {
  window.open(`/print/slides/${artifactId}`, "_blank", "noopener");
}

/* ================= Google Slides ================= */

type GoogleTokenResponse = { access_token?: string; error?: string; error_description?: string };
type GoogleTokenClient = { requestAccessToken: (overrides?: { prompt?: string }) => void };

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

let gisLoader: Promise<void> | null = null;

/** Preload the Google Identity Services script (call on page mount). */
export function preloadGoogleIdentity(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Skrip Google tidak dapat dimuatkan. Semak sambungan anda."));
    document.head.appendChild(script);
  });
  return gisLoader;
}

function requestGoogleToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error("Google Identity belum sedia. Cuba lagi."));
      return;
    }
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error_description || response.error || "Kebenaran Google ditolak."));
      },
      error_callback: (error) => reject(new Error(error?.message || "Tetingkap kebenaran Google ditutup.")),
    });
    client.requestAccessToken({ prompt: "" });
  });
}

/**
 * Convert the deck into an editable Google Slides presentation in the user's
 * Drive (Drive converts the uploaded .pptx) and open it in a new tab.
 */
export async function openInGoogleSlides({ artifactId, deck, fileName }: { artifactId: string; deck: DeckData; fileName: string }) {
  const tab = window.open("about:blank", "_blank");
  if (tab) {
    tab.document.write("<p style=\"font-family:sans-serif;padding:28px;color:#23264a\">Menyediakan dek dalam Google Slides…</p>");
  }
  try {
    await preloadGoogleIdentity();
    const token = await requestGoogleToken();
    const blob = await buildDeckPptxBlob({ artifactId, deck });
    const boundary = `paicv3_${Math.random().toString(36).slice(2)}`;
    const metadata = { name: deckFileName(fileName), mimeType: "application/vnd.google-apps.presentation" };
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n`,
      blob,
      `\r\n--${boundary}--`,
    ]);
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    });
    const payload = (await response.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
    if (!response.ok || !payload.id) {
      throw new Error(payload.error?.message || "Muat naik ke Google Drive gagal. Sila cuba lagi.");
    }
    const editUrl = `https://docs.google.com/presentation/d/${payload.id}/edit`;
    if (tab) tab.location.href = editUrl;
    else window.open(editUrl, "_blank", "noopener");
  } catch (error) {
    if (tab) tab.close();
    throw error;
  }
}
