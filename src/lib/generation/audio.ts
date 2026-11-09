import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { chatJSON, isGenerationMock, textModel } from "./router";
import { corpusForWorkbook } from "./corpus";
import { assetKey, putAsset } from "@/lib/storage";
import { patchArtifactData, updateArtifact } from "./shared";
import { buildAudioPrompt } from "./prompts";
import { normalizeWaveHeader } from "./wav";
import { audioScriptSchema, type AudioData } from "./schemas";

/**
 * Audio lesson: LLM writes a Bahasa Melayu narration script, then the router's
 * TTS model (qwen3-tts) renders it to a WAV stored as an artifact asset.
 */

export const TTS_VOICE = process.env.TTS_VOICE ?? "serena";

function ttsConfig() {
  const baseUrl = (process.env.ROUTER_BASE_URL ?? "").replace(/\/+$/, "");
  const apiKey = process.env.ROUTER_API_KEY ?? "";
  if (!baseUrl || !apiKey) {
    throw new Error("Penjanaan audio belum dikonfigurasi pada pelayan ini.");
  }
  return { baseUrl, apiKey };
}

async function synthesizeSpeech(text: string): Promise<Uint8Array> {
  const { baseUrl, apiKey } = ttsConfig();
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.MODEL_TTS ?? "qwen3-tts",
      input: text,
      voice: TTS_VOICE,
    }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!response.ok) {
    throw new Error(`Penjanaan fail audio tidak tersedia (${response.status}).`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 1000) {
    throw new Error("Model audio memulangkan fail yang terlalu kecil.");
  }
  return normalizeWaveHeader(bytes);
}

export async function runAudioGeneration(artifactId: string) {
  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact) return;

  const params = (artifact.params ?? {}) as { sourceIds?: string[]; focus?: string };

  try {
    if (isGenerationMock()) {
      throw new Error("Mod demo tidak menyokong penjanaan audio.");
    }
    const corpus = await corpusForWorkbook(artifact.workbookId, params.sourceIds, artifact.userId ?? undefined);
    if (!corpus.trim()) {
      throw new Error("Tiada kandungan sumber untuk dijana. Tambah sumber dahulu.");
    }

    // 1) Script
    const messages = [
      { role: "system" as const, content: "Anda ialah guru pakar sekolah Malaysia. Balas HANYA JSON yang sah." },
      { role: "user" as const, content: buildAudioPrompt({ sourceText: corpus }) + (params.focus ? `\nFokus: ${JSON.stringify(params.focus)}. Semua fakta mesti berdasarkan sumber.` : "") },
    ];
    let script = null;
    let lastError: unknown = null;
    for (const budget of [6000, 9000]) {
      try {
        script = audioScriptSchema.parse(await chatJSON(messages, { maxTokens: budget }));
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!script) throw lastError instanceof Error ? lastError : new Error("Penjanaan skrip audio gagal.");

    const data: AudioData = { title: script.title, transcript: script.transcript, audio_status: "pending" };
    await updateArtifact(artifactId, { title: script.title, data, model: textModel() });

    // 2) Speech
    try {
      const narration = script.transcript.join(" ");
      const bytes = await synthesizeSpeech(narration);
      await putAsset(assetKey(artifactId, "audio.wav"), bytes);
      await patchArtifactData(artifactId, (current) => ({ ...current, audio_status: "ready" }));
      await updateArtifact(artifactId, { status: "ready", error: null });
    } catch (error) {
      console.warn("[generation] audio synthesis failed:", error);
      await patchArtifactData(artifactId, (current) => ({ ...current, audio_status: "none" }));
      await updateArtifact(artifactId, {
        status: "ready",
        error: null,
        title: script.title,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Penjanaan audio gagal.";
    await updateArtifact(artifactId, { status: "failed", error: message.slice(0, 500) });
  }
}
