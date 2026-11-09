import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { chatJSON, isGenerationMock, textModel } from "./router";
import { corpusForWorkbook } from "./corpus";
import { updateArtifact } from "./shared";
import {
  buildFlashcardsPrompt,
  buildMindmapPrompt,
  buildNotesPrompt,
  buildQuizPrompt,
  buildStudyGuidePrompt,
} from "./prompts";
import {
  cleanMindmap,
  flashcardsSchema,
  mindmapSchema,
  notesSchema,
  quizSchema,
  studyGuideSchema,
} from "./schemas";
import type { z } from "zod";

/**
 * "Simple" artifact kinds: one LLM call → validated JSON stored as the
 * artifact data. Slides and audio have their own runners.
 */

type SimpleKindConfig = {
  countMap: Record<string, number>;
  schema: z.ZodType;
  buildPrompt: (ctx: { count: number; sourceText: string }) => string;
  toData: (parsed: unknown) => Record<string, unknown>;
};

export const SIMPLE_KINDS: Record<string, SimpleKindConfig> = {
  notes: {
    countMap: { fewer: 4, standard: 6, more: 8 },
    schema: notesSchema,
    buildPrompt: buildNotesPrompt,
    toData: (parsed) => parsed as Record<string, unknown>,
  },
  quizzes: {
    countMap: { fewer: 5, standard: 8, more: 12 },
    schema: quizSchema,
    buildPrompt: buildQuizPrompt,
    toData: (parsed) => parsed as Record<string, unknown>,
  },
  flashcards: {
    countMap: { fewer: 8, standard: 12, more: 16 },
    schema: flashcardsSchema,
    buildPrompt: buildFlashcardsPrompt,
    toData: (parsed) => parsed as Record<string, unknown>,
  },
  mindmaps: {
    countMap: { fewer: 3, standard: 4, more: 6 },
    schema: mindmapSchema,
    buildPrompt: ({ sourceText }) => buildMindmapPrompt({ sourceText }),
    toData: (parsed) => cleanMindmap(parsed as z.infer<typeof mindmapSchema>) as unknown as Record<string, unknown>,
  },
  "study-guides": {
    countMap: { fewer: 1, standard: 1, more: 1 },
    schema: studyGuideSchema,
    buildPrompt: ({ sourceText }) => buildStudyGuidePrompt({ sourceText }),
    toData: (parsed) => parsed as Record<string, unknown>,
  },
};

export function simpleCountFor(kind: string, count: string): number {
  const map = SIMPLE_KINDS[kind]?.countMap ?? {};
  return map[count] ?? map.standard ?? 6;
}

export async function runSimpleKindGeneration(artifactId: string, kind: string) {
  const config = SIMPLE_KINDS[kind];
  if (!config) return;

  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact) return;

  const params = (artifact.params ?? {}) as { count?: string; sourceIds?: string[]; slideCount?: number; focus?: string; difficulty?: string };
  const count = params.slideCount ?? simpleCountFor(kind, params.count ?? "standard");

  try {
    let data: Record<string, unknown>;
    if (isGenerationMock()) {
      throw new Error("Mod demo tidak menyokong penjanaan jenis ini.");
    } else {
      const corpus = await corpusForWorkbook(artifact.workbookId, params.sourceIds, artifact.userId ?? undefined);
      if (!corpus.trim()) {
        throw new Error("Tiada kandungan sumber untuk dijana. Tambah sumber dahulu.");
      }
      const prompt = config.buildPrompt({ count, sourceText: corpus }) + (params.focus ? `\nFokus pembelajaran yang diminta: ${JSON.stringify(params.focus)}. Gunakan hanya fakta dalam sumber.` : "") + (kind === "quizzes" ? `\nFokus yang diminta pengguna: ${JSON.stringify(params.focus || "Liputi konsep utama sumber")}\nTahap kesukaran: ${{ easy: "Mudah: mengingat dan memahami", medium: "Sederhana: memahami dan mengaplikasi", hard: "Mencabar: mengaplikasi dan menganalisis" }[params.difficulty || "medium"] || "Sederhana"}. Kekalkan semua fakta berdasarkan sumber.` : "");
      const messages = [
        { role: "system" as const, content: "Anda ialah guru pakar sekolah Malaysia. Balas HANYA JSON yang sah mengikut skema yang diminta." },
        { role: "user" as const, content: prompt },
      ];
      let parsed: unknown = null;
      let lastError: unknown = null;
      for (const budget of [8000, 12000]) {
        try {
          const raw = await chatJSON(messages, { maxTokens: budget });
          parsed = config.schema.parse(raw);
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!parsed) throw lastError instanceof Error ? lastError : new Error("Penjanaan gagal.");
      data = config.toData(parsed);
    }

    const title = typeof data.title === "string" && data.title ? data.title : artifact.title;
    await updateArtifact(artifactId, { title, data, model: textModel(), status: "ready", error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Penjanaan gagal.";
    await updateArtifact(artifactId, { status: "failed", error: message.slice(0, 500) });
  }
}
