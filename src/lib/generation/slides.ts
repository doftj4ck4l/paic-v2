import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { SLIDE_THEME_STYLE, buildIllustrationPrompt, buildSlidesPrompt, SLIDES_SYSTEM_PROMPT } from "./prompts";
import { chatJSON, generateImage, isGenerationMock, isRouterConfigured, textModel } from "./router";
import { deckSchema, slidesNeedingIllustration, type DeckData, type DeckSlide, type GeneratedDeck } from "./schemas";
import { corpusForWorkbook } from "./corpus";
import { assetKey, putAsset } from "@/lib/storage";

/* ---------------- In-process job queue ---------------- */

type Job = () => Promise<void>;
const queue: Job[] = [];
let running = false;

export function enqueueArtifactJob(job: Job) {
  queue.push(job);
  void pump();
}

async function pump() {
  if (running) return;
  running = true;
  try {
    while (queue.length > 0) {
      const job = queue.shift()!;
      try {
        await job();
      } catch (error) {
        console.error("[generation] job failed:", error);
      }
    }
  } finally {
    running = false;
  }
}

/* ---------------- Slides generation ---------------- */

const COUNT_MAP: Record<string, number> = { fewer: 6, standard: 10, more: 12 };
const IMAGE_CONCURRENCY = 3;

export function slideCountFor(count: string): number {
  return COUNT_MAP[count] ?? 10;
}

export function isSlidesGenerationAvailable(): boolean {
  return isRouterConfigured() || isGenerationMock();
}

async function updateArtifact(id: string, values: Partial<typeof artifacts.$inferInsert>) {
  await db
    .update(artifacts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(artifacts.id, id));
}

/** Serializes read-modify-write cycles on the artifact's deck data. */
let dataLock: Promise<unknown> = Promise.resolve();
function withDataLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = dataLock.then(fn, fn);
  dataLock = run.catch(() => {});
  return run;
}

async function setSlideImageStatus(id: string, index: number, status: DeckSlide["image_status"]): Promise<void> {
  await withDataLock(async () => {
    const [row] = await db.select().from(artifacts).where(eq(artifacts.id, id));
    const current = row?.data as DeckData | null;
    if (!current) return;
    const slides = current.slides.map((slide, i) => (i === index ? { ...slide, image_status: status } : slide));
    await updateArtifact(id, { data: { ...current, slides } });
  });
}

async function generateDeckWithRetry(prompt: string): Promise<GeneratedDeck> {
  const messages = [
    { role: "system" as const, content: SLIDES_SYSTEM_PROMPT },
    { role: "user" as const, content: prompt },
  ];
  let lastError: unknown = null;
  for (const budget of [8000, 12000]) {
    try {
      const raw = await chatJSON(messages, { maxTokens: budget });
      return deckSchema.parse(raw);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Penjanaan slaid gagal.");
}

function mockDeck(count: number): GeneratedDeck {
  const slides = [
    {
      type: "title" as const,
      layout: "cover" as const,
      title: "Kitaran Air",
      body: "Pembentangan Sains · Tahun 4",
      bullets: [],
      notes: "Mulakan dengan soalan: dari mana datangnya hujan?",
      visual_prompt: "",
    },
    {
      type: "objectives" as const,
      layout: "text" as const,
      title: "Apa yang akan kita pelajari?",
      body: "",
      bullets: ["Empat langkah kitaran air", "Mengapa air tidak habis", "Kepentingan air bersih"],
      notes: "Baca objektif bersama murid.",
      visual_prompt: "",
    },
    {
      type: "concept" as const,
      layout: "split_visual" as const,
      title: "Langkah 1 — Sejatan",
      body: "Matahari memanaskan air di laut dan tasik sehingga bertukar menjadi wap.",
      bullets: ["Matahari membekalkan haba", "Wap air naik ke atmosfera", "Tumbuhan juga menyumbang melalui transpirasi"],
      notes: "Analogi: air panas dalam cerek.",
      visual_prompt: "sun heating the ocean with vapour rising, flat vector, no text",
    },
    {
      type: "concept" as const,
      layout: "split_visual" as const,
      title: "Langkah 2 — Pemeluwapan",
      body: "Wap air menyejuk di udara dan bertukar menjadi titisan kecil yang membentuk awan.",
      bullets: ["Udara tinggi lebih sejuk", "Titisan berkumpul menjadi awan", "Debu membantu pembentukan titisan"],
      notes: "Tunjukkan eksperimen mangkuk dan ais.",
      visual_prompt: "clouds forming from water droplets, flat vector, no text",
    },
    {
      type: "concept" as const,
      layout: "text" as const,
      title: "Langkah 3 — Kerpasan",
      body: "",
      bullets: ["Awan menjadi berat dengan air", "Hujan turun ke bumi", "Salji dan batu di kawasan sejuk"],
      notes: "Tanya murid bentuk kerpasan di Malaysia.",
      visual_prompt: "rain falling from a cloud over a village, flat vector, no text",
    },
    {
      type: "concept" as const,
      layout: "text" as const,
      title: "Langkah 4 — Pengumpulan",
      body: "",
      bullets: ["Air mengalir ke sungai dan laut", "Sebahagian menyerap ke dalam tanah", "Kitaran bermula semula"],
      notes: "Tekankan kitaran berterusan.",
      visual_prompt: "",
    },
    {
      type: "check" as const,
      layout: "text" as const,
      title: "Semak pemahaman",
      body: "",
      bullets: ["Apakah proses air menjadi wap?", "Apa yang membentuk awan?", "Namakan tenaga utama kitaran air"],
      notes: "Soal jawab pantas sebelum penutup.",
      visual_prompt: "",
    },
    {
      type: "summary" as const,
      layout: "text" as const,
      title: "Ringkasan",
      body: "",
      bullets: ["Sejatan → Pemeluwapan → Kerpasan → Pengumpulan", "Matahari dan graviti menggerakkan kitaran", "Air di Bumi sentiasa dikitar semula"],
      notes: "Ulang sebut langkah bersama murid.",
      visual_prompt: "",
    },
  ];
  return deckSchema.parse({ title: "Kitaran Air (demo)", slides: slides.slice(0, Math.max(2, Math.min(count, slides.length))) });
}

export async function runSlidesGeneration(artifactId: string) {
  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact) return;

  const params = (artifact.params ?? {}) as { count?: string; theme?: string; sourceIds?: string[] };
  const count = slideCountFor(params.count ?? "standard");
  const themeStyle = SLIDE_THEME_STYLE[params.theme ?? "clean"] ?? SLIDE_THEME_STYLE.clean;

  try {
    let deck: GeneratedDeck;
    if (isGenerationMock()) {
      deck = mockDeck(count);
    } else {
      const corpus = corpusForWorkbook(artifact.workbookId, params.sourceIds);
      if (!corpus.trim()) {
        throw new Error("Tiada kandungan sumber untuk dijana. Tambah sumber dahulu.");
      }
      const prompt = buildSlidesPrompt({ count, sourceText: corpus });
      deck = await generateDeckWithRetry(prompt);
    }

    const visualIndexes = slidesNeedingIllustration(deck);
    const data: DeckData = {
      title: deck.title,
      slides: deck.slides.map((slide, index) => ({
        ...slide,
        image_status: visualIndexes.includes(index) ? "pending" : "none",
      })),
    };

    await updateArtifact(artifactId, { title: deck.title, data, model: isGenerationMock() ? "mock" : textModel() });

    // Render illustrations with limited concurrency (cover + requested slides).
    const semaphore = { active: 0, queue: [] as (() => void)[] };
    const acquire = () =>
      new Promise<void>((resolve) => {
        if (semaphore.active < IMAGE_CONCURRENCY) {
          semaphore.active += 1;
          resolve();
        } else {
          semaphore.queue.push(() => {
            semaphore.active += 1;
            resolve();
          });
        }
      });
    const release = () => {
      semaphore.active -= 1;
      const next = semaphore.queue.shift();
      if (next) next();
    };

    await Promise.all(
      visualIndexes.map(async (index) => {
        await acquire();
        try {
          if (isGenerationMock()) {
            await setSlideImageStatus(artifactId, index, "none");
            return;
          }
          const slide = data.slides[index];
          const bytes = await generateImage(buildIllustrationPrompt(slide, themeStyle));
          await putAsset(assetKey(artifactId, index), bytes);
          await setSlideImageStatus(artifactId, index, "ready");
        } catch (error) {
          console.warn(`[generation] illustration ${index} failed:`, error);
          await setSlideImageStatus(artifactId, index, "failed");
        } finally {
          release();
        }
      }),
    );

    await updateArtifact(artifactId, { status: "ready", error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Penjanaan gagal.";
    await updateArtifact(artifactId, { status: "failed", error: message.slice(0, 500) });
  }
}

/** Mark abandoned "generating" rows as failed (e.g. after a server restart). */
export async function sweepStaleGenerations(workbookId: string, kind: string) {
  const rows = await db.select().from(artifacts).where(eq(artifacts.workbookId, workbookId));
  const staleBefore = Date.now() - 10 * 60 * 1000;
  for (const row of rows) {
    if (row.kind === kind && row.status === "generating" && row.updatedAt.getTime() < staleBefore) {
      await updateArtifact(row.id, { status: "failed", error: "Penjanaan terhenti. Sila cuba lagi." });
    }
  }
}
