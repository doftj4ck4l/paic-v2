import type { DeckSlide } from "./schemas";

export const SLIDES_SYSTEM_PROMPT =
  "Anda ialah guru pakar yang mereka bentuk dek slaid kelas untuk pelajar sekolah Malaysia. " +
  "Anda hanya memulangkan JSON yang sah mengikut skema yang diminta — tiada markdown, tiada komen.";

export function buildSlidesPrompt({
  count,
  topic,
  sourceText,
}: {
  count: number;
  topic?: string | null;
  sourceText: string;
}): string {
  const topicLine = topic ? `\nFokus topik: ${topic}` : "";
  return `Hasilkan dek slaid kelas ${count} slaid dalam Bahasa Melayu daripada SUMBER di bawah.${topicLine}

Balas HANYA JSON dalam bentuk ini:
{
  "title": "tajuk dek ringkas",
  "slides": [
    {
      "type": "title|objectives|concept|worked_example|check|summary",
      "layout": "cover|text|split_visual",
      "title": "tajuk slaid",
      "body": "ayat pengenalan pendek (pilihan)",
      "bullets": ["poin ringkas", "poin ringkas"],
      "notes": "nota penyampai untuk guru (2-3 ayat)",
      "visual_prompt": "brief ilustrasi dalam Bahasa Inggeris, atau kosong"
    }
  ]
}

Peraturan:
- Slaid pertama ialah slaid tajuk (type "title", layout "cover").
- Tepat ${count} slaid. Dua hingga lima bulet setiap slaid, setiap bulet bawah 12 patah perkataan.
- "visual_prompt": huraian ringkas ilustrasi rata (flat vector) untuk slaid itu — beri pada lebih kurang separuh slaid sahaja. Ilustrasi TIDAK boleh mengandungi teks, huruf, nombor, orang, muka atau logo.
- "notes": nota penyampai ringkas dan berguna untuk guru.
- Semua fakta mesti berdasarkan SUMBER. Jangan reka fakta dan jangan tambah sitasi.
- Gunakan Bahasa Melayu yang mudah dan sesuai untuk murid sekolah.

SUMBER:
${sourceText.trim().slice(0, 12000)}`;
}

export function buildIllustrationPrompt(slide: DeckSlide, themeStyle: string): string {
  const subject = slide.visual_prompt || slide.title;
  return (
    "Create a clean flat vector illustration for a school presentation slide. " +
    `Subject: ${subject}. Style: ${themeStyle}. ` +
    "Do not include text, letters, numbers, people, faces, logos or watermarks. " +
    "Compose in landscape 16:9 with generous negative space."
  );
}

export const SLIDE_THEME_STYLE: Record<string, string> = {
  clean: "calm off-white background, teal and sage accents, soft gradients, minimalist",
  bold: "deep teal panels, warm orange accents, high contrast, bold shapes",
  warm: "soft sand and cream background, warm orange and sage accents, gentle",
};
