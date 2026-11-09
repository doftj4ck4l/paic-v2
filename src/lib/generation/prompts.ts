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

/* ================= Shared source block ================= */

function sourceBlock(sourceText: string) {
  return `SUMBER:\n${sourceText.trim().slice(0, 12000)}`;
}

const JSON_ONLY = "Balas HANYA JSON yang sah mengikut skema yang diminta — tiada markdown, tiada komen.";

/* ================= Notes ================= */

export function buildNotesPrompt({ count, sourceText }: { count: number; sourceText: string }): string {
  return `Hasilkan nota ulang kaji berstruktur dalam Bahasa Melayu daripada SUMBER di bawah, dengan ${count} bahagian.

Balas HANYA JSON:
{
  "title": "tajuk nota",
  "sections": [
    { "heading": "tajuk bahagian", "bullets": ["poin ringkas", "poin ringkas"], "citation": "nama sumber rujukan (pilihan)" }
  ]
}

Peraturan:
- ${count} bahagian, setiap bahagian 2-5 poin ringkas (bawah 15 patah perkataan).
- Isi mesti tepat dan berdasarkan SUMBER — jangan reka fakta.
- "citation": nama sumber yang menyokong bahagian itu jika jelas (cth. "Bab 8 — Kitaran Air").
- Bahasa Melayu yang mudah untuk murid sekolah.

${sourceBlock(sourceText)}`;
}

/* ================= Quiz ================= */

export function buildQuizPrompt({ count, sourceText }: { count: number; sourceText: string }): string {
  return `Hasilkan kuiz objektif ${count} soalan dalam Bahasa Melayu daripada SUMBER di bawah.

Balas HANYA JSON:
{
  "title": "tajuk kuiz",
  "description": "penerangan ringkas tentang pengetahuan yang diuji",
  "questions": [
    {
      "question": "soalan",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "answer": 1,
      "explanation": "sebab jawapan betul (1-2 ayat)",
      "aiExplain": "penjelasan mesra untuk murid yang tidak faham (2-3 ayat, guna analogi mudah)",
      "citation": "sumber rujukan"
    }
  ]
}

Peraturan:
- Tepat ${count} soalan. Empat pilihan setiap soalan, satu jawapan betul ("answer" ialah indeks 0-3).
- "explanation" ringkas; "aiExplain" lebih mesra dan membantu murid yang tersalah.
- Semua fakta berdasarkan SUMBER. Jangan reka fakta.
- ${JSON_ONLY}

${sourceBlock(sourceText)}`;
}

/* ================= Flashcards ================= */

export function buildFlashcardsPrompt({ count, sourceText }: { count: number; sourceText: string }): string {
  return `Hasilkan ${count} kad imbas ulang kaji dalam Bahasa Melayu daripada SUMBER di bawah.

Balas HANYA JSON:
{ "title": "tajuk kad", "cards": [ { "front": "istilah atau soalan", "back": "jawapan ringkas" } ] }

Peraturan:
- Tepat ${count} kad. "front" pendek (istilah/soalan), "back" padat (1-2 ayat).
- Liputi istilah dan konsep terpenting daripada SUMBER.
- Bahasa Melayu mudah. Jangan reka fakta.
- ${JSON_ONLY}

${sourceBlock(sourceText)}`;
}

/* ================= Mind map ================= */

export function buildMindmapPrompt({ sourceText }: { sourceText: string }): string {
  return `Hasilkan peta minda dalam Bahasa Melayu daripada SUMBER di bawah.

Balas HANYA JSON:
{
  "title": "tajuk utama",
  "children": [
    { "title": "cabang utama", "children": [ { "title": "sub-cabang", "children": [ { "title": "butiran" } ] } ] }
  ]
}

Peraturan:
- 3-5 cabang utama, setiap cabang 2-4 sub-cabang, sub-cabang boleh ada butiran (maksimum 3 aras).
- Tajuk pendek (bawah 6 patah perkataan).
- Semua isi berdasarkan SUMBER. Jangan reka fakta.
- ${JSON_ONLY}

${sourceBlock(sourceText)}`;
}

/* ================= Study guide ================= */

export function buildStudyGuidePrompt({ sourceText }: { sourceText: string }): string {
  return `Hasilkan panduan ulang kaji lengkap dalam Bahasa Melayu daripada SUMBER di bawah.

Balas HANYA JSON:
{
  "title": "tajuk panduan",
  "overview": "gambaran keseluruhan (2-3 ayat)",
  "objectives": ["objektif pembelajaran", "..."],
  "concepts": [ { "term": "istilah", "definition": "takrif ringkas" } ],
  "example": { "question": "contoh soalan", "steps": ["langkah penyelesaian", "..."] },
  "checklist": ["senarai semak ulang kaji (saya boleh...)", "..."]
}

Peraturan:
- 3-5 objektif, 4-6 konsep penting, 3-5 langkah contoh, 4-6 senarai semak.
- Semua berdasarkan SUMBER. Jangan reka fakta.
- Bahasa Melayu mudah untuk murid.
- ${JSON_ONLY}

${sourceBlock(sourceText)}`;
}

/* ================= Audio lesson ================= */

export function buildAudioPrompt({ sourceText }: { sourceText: string }): string {
  return `Tulis skrip pelajaran audio dalam Bahasa Melayu daripada SUMBER di bawah — seperti guru bercakap kepada murid.

Balas HANYA JSON:
{ "title": "tajuk pelajaran audio", "transcript": ["Hai! Hari ini kita belajar tentang...", "..."] }

Peraturan:
- 6-10 baris ayat penuh (setiap baris 1-2 ayat, bawah 40 patah perkataan).
- Gaya mesra dan jelas — sapaan pembuka, penerangan langkah demi langkah, penutup ringkas.
- Sebut istilah penting dengan jelas. Jangan guna simbol matematik atau format khas — ini akan dibaca kuat.
- Semua fakta berdasarkan SUMBER. Jangan reka fakta.
- ${JSON_ONLY}

${sourceBlock(sourceText)}`;
}
