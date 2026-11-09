import { createHash } from "crypto";

export function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function validateSourceText(text: string) {
  const normalized = normalizeText(text);
  if (normalized.length < 200 || normalized.split(/\s+/).length < 30) {
    throw new Error("Kandungan terlalu sedikit untuk dibaca. Cuba halaman artikel lain atau muat naik fail asal.");
  }
  if (normalized.length < 3000 && /verify you are human|checking your browser|enable javascript and cookies|just a moment|access denied|captcha verification|required part of this site.{0,20}load|disable any ad blockers|this site can.t be reached|page not found|temporarily unavailable|please log in to continue|sign in to access this content/i.test(normalized)) {
    throw new Error("Halaman menyekat pembacaan automatik. Pilih sumber lain atau muat naik fail yang boleh dibaca.");
  }
  return normalized.slice(0, 400_000);
}

export function chunkSourceText(text: string, size = 1500, overlap = 180): string[] {
  if (size < 100 || overlap < 0 || overlap >= size) throw new Error("Invalid chunk settings");
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);
    if (end < normalized.length) {
      const paragraph = normalized.lastIndexOf("\n\n", end);
      const space = normalized.lastIndexOf(" ", end);
      const boundary = paragraph > start + size * .55 ? paragraph : space;
      if (boundary > start + size * .55) end = boundary;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

export function textHash(text: string) { return createHash("sha256").update(text).digest("hex"); }
