import { randomBytes } from "crypto";
import { execFile } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { sources } from "@/db/schema";
import { assetKey, putAsset } from "@/lib/storage";
import { normalizeText, textHash } from "@/lib/ingestion/text";
import { extractWebPage } from "@/lib/ingestion/web";
import { startSourceWorker } from "@/lib/ingestion/worker";

const execFileAsync = promisify(execFile);

export type SourceRow = typeof sources.$inferSelect;
export type SourceKind = "pdf" | "doc" | "text" | "web" | "youtube" | "textbook";

/* ---------------- CRUD ---------------- */

export async function listSources(workbookId: string, viewerId?: string) {
  return db.select().from(sources).where(and(eq(sources.workbookId, workbookId), viewerId ? or(eq(sources.ownerId, viewerId), isNull(sources.ownerId)) : isNull(sources.ownerId))).orderBy(desc(sources.createdAt));
}

export async function getSource(id: string): Promise<SourceRow | null> {
  const [row] = await db.select().from(sources).where(eq(sources.id, id));
  return row ?? null;
}

export async function deleteSource(id: string) {
  await db.delete(sources).where(eq(sources.id, id));
}

export async function insertSource(values: {
  workbookId: string;
  ownerId: string;
  title: string;
  kind: SourceKind;
  status?: string;
  fullText?: string;
  fileKey?: string;
  sizeLabel?: string;
  error?: string;
  meta?: Record<string, unknown>;
}): Promise<SourceRow> {
  if (values.fullText) {
    values.fullText = normalizeText(values.fullText);
    const hash = textHash(values.fullText);
    const existing = (await listSources(values.workbookId, values.ownerId)).find(row => row.ownerId === values.ownerId && row.fullText && textHash(row.fullText) === hash);
    if (existing?.status === "draft") return existing;
    if (existing) throw new Error("Sumber ini sudah ada dalam buku kerja. Semak senarai sumber anda.");
    values.meta = { ...values.meta, textHash: hash, review: "pending" };
  }
  const id = `src_${randomBytes(8).toString("hex")}`;
  await db.insert(sources).values({
    id,
    workbookId: values.workbookId,
    ownerId: values.ownerId,
    title: values.title,
    kind: values.kind,
    status: values.status ?? "draft",
    fullText: values.fullText ?? null,
    fileKey: values.fileKey ?? null,
    sizeLabel: values.sizeLabel ?? null,
    error: values.error ?? null,
    meta: values.meta ?? null,
  });
  const [row] = await db.select().from(sources).where(eq(sources.id, id));
  return row;
}

export async function updateSource(id: string, values: Partial<typeof sources.$inferInsert>) {
  await db
    .update(sources)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(sources.id, id));
}

/** Merge advisory metadata without overwriting an in-flight worker lease or review state. */
export async function mergeSourceMeta(id: string, values: Record<string, unknown>) {
  await db.update(sources).set({ meta: sql`coalesce(${sources.meta}, '{}'::jsonb) || ${JSON.stringify(values)}::jsonb`, updatedAt: new Date() }).where(eq(sources.id, id));
}

/* ---------------- Text extraction ---------------- */

export async function extractFileText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (["txt", "md", "csv"].includes(ext)) {
    return buffer.toString("utf8");
  }
  throw new Error(`Format fail .${ext} tidak disokong. Guna PDF, DOCX, TXT atau MD.`);
}

export async function fetchPageText(url: string) { return extractWebPage(url); }

/* ---------------- YouTube ---------------- */

export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be") return /^[A-Za-z0-9_-]{11}$/.test(parsed.pathname.slice(1)) ? parsed.pathname.slice(1) : null;
    if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") return /^[A-Za-z0-9_-]{11}$/.test(parsed.searchParams.get("v") ?? "") ? parsed.searchParams.get("v") : null;
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

async function youtubeTranscript(videoId: string): Promise<string | null> {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    for (const lang of ["ms", "id", "en", undefined]) {
      try {
        const segments = await YoutubeTranscript.fetchTranscript(videoId, lang ? { lang } : undefined);
        const text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
        if (text.length > 50) return text;
      } catch {
        // try the next language
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Download the audio with yt-dlp and transcribe it with the router's whisper model. */
export async function transcribeWithWhisper(url: string): Promise<string> {
  const baseUrl = (process.env.ROUTER_BASE_URL ?? "").replace(/\/+$/, "");
  const apiKey = process.env.ROUTER_API_KEY ?? "";
  if (!baseUrl || !apiKey) throw new Error("Penstranskripsi belum dikonfigurasi pada pelayan ini.");

  const dir = await mkdtemp(path.join(tmpdir(), "paicv3-yt-"));
  try {
    await execFileAsync(
      "yt-dlp",
      ["-x", "--audio-format", "mp3", "--no-playlist", "-o", path.join(dir, "audio.%(ext)s"), "--", url],
      { timeout: 240_000, maxBuffer: 4 * 1024 * 1024 },
    );
    const audio = await readFile(path.join(dir, "audio.mp3"));
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/mpeg" }), "audio.mp3");
    form.append("model", process.env.MODEL_STT ?? "whisper-large-v3-turbo");
    const response = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(600_000),
    });
    if (!response.ok) {
      throw new Error(`Transkripsi tidak tersedia (${response.status}). Cuba video dengan sari kata.`);
    }
    const payload = (await response.json()) as { text?: string };
    const text = (payload.text ?? "").trim();
    if (text.length < 50) throw new Error("Transkripsi terlalu pendek.");
    return text;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new Error("yt-dlp tidak dipasang pada pelayan ini (diperlukan untuk video tanpa sari kata).");
    }
    throw error;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/* ---------------- Public creators ---------------- */

export async function createFileSource(workbookId: string, ownerId: string, file: File): Promise<SourceRow> {
  const filename = file.name || "sumber";
  if (file.size > 25 * 1024 * 1024) throw new Error("Saiz fail melebihi 25 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractFileText(buffer, filename);
  if (text.trim().length < 50) throw new Error("Fail ini tiada teks yang boleh dibaca. Untuk PDF imbasan, muat naik versi berteks atau tampal teksnya.");
  const id = `src_${randomBytes(8).toString("hex")}`;
  const key = assetKey(workbookId, `sources/${id}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
  await putAsset(key, buffer);
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return insertSource({
    workbookId,
    ownerId,
    title: filename,
    kind: ext === "pdf" ? "pdf" : "doc",
    fullText: text.slice(0, 800_000),
    fileKey: key,
    sizeLabel: `${(file.size / 1024).toFixed(0)} KB`,
  });
}

export async function createTextSource(workbookId: string, ownerId: string, title: string, text: string): Promise<SourceRow> {
  if (text.trim().length < 30) throw new Error("Teks terlalu pendek untuk dijadikan sumber.");
  return insertSource({
    workbookId,
    ownerId,
    title: title.trim().slice(0, 160) || "Nota teks",
    kind: "text",
    fullText: text.trim().slice(0, 800_000),
    sizeLabel: `${text.trim().length.toLocaleString("ms")} aksara`,
  });
}

export async function createUrlSource(workbookId: string, ownerId: string, url: string, fallbackTitle?: string): Promise<SourceRow> {
  // YouTube links always become transcript sources, wherever they are added from.
  if (youtubeVideoId(url)) {
    return createYoutubeSource(workbookId, ownerId, url);
  }
  const page = await fetchPageText(url);
  const { title, text } = page;
  return insertSource({
    workbookId,
    ownerId,
    title: (fallbackTitle || title).slice(0, 160),
    kind: "web",
    fullText: text,
    sizeLabel: new URL(url).hostname,
    meta: { url: page.url, method: page.method, language: page.language, review: "pending" },
  });
}

export async function createYoutubeSource(workbookId: string, ownerId: string, url: string): Promise<SourceRow> {
  const videoId = youtubeVideoId(url);
  if (!videoId) throw new Error("Pautan YouTube tidak sah.");

  url = `https://www.youtube.com/watch?v=${videoId}`;
  // Fetch the video title via oEmbed (fast, no key).
  let title = `YouTube: ${videoId}`;
  try {
    const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (oembed.ok) {
      const payload = (await oembed.json()) as { title?: string };
      if (payload.title) title = payload.title.slice(0, 160);
    }
  } catch {
    // keep the fallback title
  }

  const transcript = await youtubeTranscript(videoId);
  if (transcript) {
    return insertSource({
      workbookId,
      ownerId,
      title,
      kind: "youtube",
      fullText: transcript,
      sizeLabel: "Sari kata",
      meta: { url, videoId, review: "pending" },
    });
  }

  // No captions — create a processing source and transcribe the audio in the background.
  const row = await insertSource({
    workbookId,
    ownerId,
    title,
    kind: "youtube",
    status: "processing",
    sizeLabel: "Transkripsi audio…",
    meta: { url, videoId, review: "pending", job: "transcribe", stage: "queued" },
  });
  startSourceWorker();
  return row;
}
