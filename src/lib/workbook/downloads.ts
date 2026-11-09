import { getAsset } from "@/lib/storage";
import type { SourceRow } from "@/lib/sources";
export function downloadName(title: string) { return Array.from(title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim()).slice(0, 100).join("") || "sumber"; }
export async function sourceDownload(source: SourceRow) {
  if (source.fileKey) {
    const asset = await getAsset(source.fileKey);
    if (asset) return { name: downloadName(source.title), bytes: new Uint8Array(asset.bytes), type: asset.contentType === "application/octet-stream" ? source.kind === "pdf" ? "application/pdf" : "application/octet-stream" : asset.contentType };
  }
  if (!source.fullText?.trim()) throw new Error("Teks sumber belum tersedia untuk dimuat turun.");
  const url = (source.meta as { url?: string } | null)?.url;
  return { name: `${downloadName(source.title).replace(/\.(pdf|docx|txt|md)$/i, "")}.txt`, bytes: new TextEncoder().encode(`${source.title}\n${url ? `Sumber asal: ${url}\n` : ""}\n${source.fullText}`), type: "text/plain;charset=utf-8" };
}
export function attachmentHeader(name: string) { return `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(name).replace(/'/g, "%27")}`; }
