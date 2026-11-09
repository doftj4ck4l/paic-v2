import { z } from "zod";

/** Deck JSON contract for hybrid slides (structured text + optional illustration). */

export const SLIDE_TYPES = ["title", "objectives", "concept", "worked_example", "check", "summary"] as const;
export const SLIDE_LAYOUTS = ["cover", "text", "split_visual"] as const;

const clamp = (value: string, max: number) => value.trim().slice(0, max);

export const slideSchema = z.object({
  type: z.enum(SLIDE_TYPES).catch("concept"),
  layout: z.enum(SLIDE_LAYOUTS).catch("text"),
  title: z.string().transform((v) => clamp(v, 140)).refine((v) => v.length > 0, "Tajuk slaid diperlukan."),
  body: z.string().optional().default("").transform((v) => clamp(v, 600)),
  bullets: z
    .array(z.string())
    .optional()
    .default([])
    .transform((items) => items.map((b) => clamp(b, 160)).filter(Boolean).slice(0, 6)),
  notes: z.string().optional().default("").transform((v) => clamp(v, 600)),
  visual_prompt: z.string().optional().default("").transform((v) => clamp(v, 300)),
});

export const deckSchema = z.object({
  title: z.string().transform((v) => clamp(v, 160)).refine((v) => v.length > 0, "Tajuk dek diperlukan."),
  slides: z.array(slideSchema).min(2, "Dek perlu sekurang-kurangnya dua slaid.").max(14),
});

export type GeneratedSlide = z.infer<typeof slideSchema>;
export type GeneratedDeck = z.infer<typeof deckSchema>;

export type DeckSlide = GeneratedSlide & { image_status: "none" | "pending" | "ready" | "failed" };
export type DeckData = { title: string; slides: DeckSlide[] };

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
