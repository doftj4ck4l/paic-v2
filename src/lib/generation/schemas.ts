import { z } from "zod";

/** Deck JSON contract for hybrid slides (structured text + optional illustration). */

export const SLIDE_TYPES = ["title", "objectives", "concept", "worked_example", "check", "summary"] as const;
export const SLIDE_LAYOUTS = ["cover", "text", "split_visual"] as const;

const clamp = (value: string, max: number) => value.trim().slice(0, max);

/** Freeform elements (visual editor). Coordinates live in the 1280×720 canvas space. */
export const slideElementSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal("text"),
    x: z.number().finite(), y: z.number().finite(), w: z.number().min(20).max(1600), h: z.number().min(16).max(1200),
    z: z.number().int().min(0).max(200).default(0),
    rotation: z.number().min(-180).max(180).optional(),
    html: z.string().max(8000),
    style: z.object({
      fontSize: z.number().min(8).max(160),
      fontWeight: z.number().min(100).max(900),
      color: z.string().max(40),
      align: z.enum(["left", "center", "right"]),
      lineHeight: z.number().min(0.8).max(3),
      italic: z.boolean().optional(),
      underline: z.boolean().optional(),
    }),
  }),
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal("image"),
    x: z.number().finite(), y: z.number().finite(), w: z.number().min(20).max(1600), h: z.number().min(20).max(1200),
    z: z.number().int().min(0).max(200).default(0),
    rotation: z.number().min(-180).max(180).optional(),
    assetKey: z.string().min(1).max(200),
    radius: z.number().min(0).max(400).optional(),
    shadow: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal("shape"),
    x: z.number().finite(), y: z.number().finite(), w: z.number().min(4).max(1600), h: z.number().min(4).max(1200),
    z: z.number().int().min(0).max(200).default(0),
    rotation: z.number().min(-180).max(180).optional(),
    shape: z.enum(["rect", "circle", "line", "triangle"]),
    fill: z.string().max(40),
    radius: z.number().min(0).max(400).optional(),
  }),
]);

export const slideBackgroundSchema = z.object({
  kind: z.enum(["theme", "color", "image"]),
  value: z.string().max(200).optional(),
  assetKey: z.string().max(200).optional(),
});

export const slideSchema = z.object({
  id: z.string().min(1).max(40).optional(),
  type: z.enum(SLIDE_TYPES).catch("concept"),
  layout: z.enum(SLIDE_LAYOUTS).catch("text"),
  title: z.string().transform((v) => clamp(v, 140)),
  body: z.string().optional().default("").transform((v) => clamp(v, 600)),
  bullets: z
    .array(z.string())
    .optional()
    .default([])
    .transform((items) => items.map((b) => clamp(b, 160)).filter(Boolean).slice(0, 6)),
  notes: z.string().optional().default("").transform((v) => clamp(v, 600)),
  visual_prompt: z.string().optional().default("").transform((v) => clamp(v, 300)),
  elements: z.array(slideElementSchema).max(60).optional(),
  background: slideBackgroundSchema.optional(),
});

export const deckSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk dek diperlukan."),
  format: z.enum(["text", "images"]).optional(),
  slides: z.array(slideSchema).min(2, "Dek perlu sekurang-kurangnya dua slaid.").max(14),
});

export type GeneratedSlide = z.infer<typeof slideSchema>;
export type GeneratedDeck = z.infer<typeof deckSchema>;
export type SlideElement = z.infer<typeof slideElementSchema>;
export type SlideBackground = z.infer<typeof slideBackgroundSchema>;

export type DeckSlide = GeneratedSlide & { image_key?: string; image_status: "none" | "pending" | "ready" | "failed" };
export type DeckData = { title: string; format?: "text" | "images"; slides: DeckSlide[] };

/** Slides that receive an AI illustration: the cover + slides that asked for one, capped. */
export function slidesNeedingIllustration(deck: GeneratedDeck, maxVisuals = 6): number[] {
  const indexes: number[] = [];
  deck.slides.forEach((slide, index) => {
    if (indexes.length >= maxVisuals) return;
    const wantsVisual = index === 0 || slide.visual_prompt.length > 0 || slide.layout === "split_visual";
    if (wantsVisual) indexes.push(index);
  });
  return indexes;
}

/* ================= Notes ================= */

export const notesSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk nota diperlukan."),
  sections: z
    .array(
      z.object({
        heading: z.string().transform((v) => clamp(v, 140)).refine((v) => v.length > 0),
        bullets: z.array(z.string()).transform((items) => items.map((b) => clamp(b, 220)).filter(Boolean).slice(0, 6)),
        citation: z.string().optional().default("").transform((v) => clamp(v, 120)),
      }),
    )
    .min(2, "Nota perlu sekurang-kurangnya dua bahagian.")
    .max(10),
});
export type GeneratedNotes = z.infer<typeof notesSchema>;

/* ================= Quizzes ================= */

export const quizSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk kuiz diperlukan."),
  description: z.string().optional().default("").transform((value) => clamp(value, 400)),
  questions: z
    .array(
      z.object({
        question: z.string().transform((v) => clamp(v, 300)).refine((v) => v.length > 0),
        options: z.array(z.string()).transform((items) => items.map((o) => clamp(o, 120)).filter(Boolean).slice(0, 4)),
        answer: z.coerce.number().int().catch(0),
        explanation: z.string().optional().default("").transform((v) => clamp(v, 300)),
        aiExplain: z.string().optional().default("").transform((v) => clamp(v, 600)),
        citation: z.string().optional().default("").transform((v) => clamp(v, 120)),
      }),
    )
    .min(3, "Kuiz perlu sekurang-kurangnya tiga soalan.")
    .max(14)
    .transform((questions) =>
      questions
        .filter((q) => q.options.length >= 2)
        .map((q) => ({ ...q, answer: Math.min(Math.max(0, q.answer), q.options.length - 1) })),
    ),
});
export type GeneratedQuiz = z.infer<typeof quizSchema>;

/* ================= Flashcards ================= */

export const flashcardsSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk kad diperlukan."),
  cards: z
    .array(
      z.object({
        front: z.string().transform((v) => clamp(v, 140)).refine((v) => v.length > 0),
        back: z.string().transform((v) => clamp(v, 320)).refine((v) => v.length > 0),
      }),
    )
    .min(4, "Perlu sekurang-kurangnya empat kad.")
    .max(20),
});
export type GeneratedFlashcards = z.infer<typeof flashcardsSchema>;

/* ================= Mind map ================= */

export type MindmapNode = { title: string; children?: MindmapNode[] };

export const mindmapSchema = z.object({
  title: z.string().transform((v) => clamp(v, 120)).refine((v) => v.length > 0, "Tajuk peta minda diperlukan."),
  children: z.array(z.unknown()).min(2, "Peta minda perlu sekurang-kurangnya dua cabang."),
});

function cleanNode(raw: unknown, depth: number): MindmapNode | null {
  if (depth > 3 || typeof raw !== "object" || raw === null) return null;
  const node = raw as Record<string, unknown>;
  const title = typeof node.title === "string" ? node.title.trim().slice(0, 90) : "";
  if (!title) return null;
  const children = Array.isArray(node.children)
    ? node.children.map((child) => cleanNode(child, depth + 1)).filter((n): n is MindmapNode => !!n).slice(0, 6)
    : [];
  return children.length > 0 ? { title, children } : { title };
}

export function cleanMindmap(parsed: z.infer<typeof mindmapSchema>): MindmapNode {
  const children = parsed.children.map((child) => cleanNode(child, 1)).filter((n): n is MindmapNode => !!n).slice(0, 6);
  if (children.length < 2) throw new Error("Peta minda perlu sekurang-kurangnya dua cabang.");
  return { title: parsed.title, children };
}

/* ================= Study guide ================= */

export const studyGuideSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk panduan diperlukan."),
  overview: z.string().transform((v) => clamp(v, 700)).refine((v) => v.length > 0, "Gambaran keseluruhan diperlukan."),
  objectives: z.array(z.string()).transform((items) => items.map((o) => clamp(o, 220)).filter(Boolean).slice(0, 6)).refine((items) => items.length >= 2, "Perlu objektif."),
  concepts: z
    .array(z.object({ term: z.string().transform((v) => clamp(v, 80)), definition: z.string().transform((v) => clamp(v, 300)) }))
    .transform((items) => items.filter((c) => c.term && c.definition).slice(0, 6))
    .refine((items) => items.length >= 2, "Perlu konsep penting."),
  example: z.object({
    question: z.string().transform((v) => clamp(v, 300)),
    steps: z.array(z.string()).transform((items) => items.map((s) => clamp(s, 300)).filter(Boolean).slice(0, 6)),
  }),
  checklist: z.array(z.string()).transform((items) => items.map((c) => clamp(c, 200)).filter(Boolean).slice(0, 8)).refine((items) => items.length >= 2, "Perlu senarai semak."),
});
export type GeneratedStudyGuide = z.infer<typeof studyGuideSchema>;

/* ================= Audio lesson ================= */

export const audioScriptSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk audio diperlukan."),
  transcript: z
    .array(z.string())
    .transform((items) => items.map((line) => clamp(line, 500)).filter(Boolean).slice(0, 14))
    .refine((items) => items.length >= 3, "Skrip audio terlalu pendek."),
});
export type GeneratedAudioScript = z.infer<typeof audioScriptSchema>;

export type AudioData = { title: string; transcript: string[]; audio_status: "pending" | "ready" | "failed" | "none" };
