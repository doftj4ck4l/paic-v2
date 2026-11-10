import { z } from "zod";
import { audioScriptSchema, cleanMindmap, deckSchema, flashcardsSchema, mindmapSchema, notesSchema, studyGuideSchema } from "@/lib/generation/schemas";
export const MODULE_KINDS = ["notes", "flashcards", "slides", "mindmaps", "audio", "study-guides"] as const;
export type ModuleKind = typeof MODULE_KINDS[number];
export type MapNode = { title: string; children?: MapNode[] };
export type EditableModuleData = {
  title: string; description?: string;
  sections?: { heading: string; bullets: string[]; citation: string }[];
  cards?: { front: string; back: string }[];
  slides?: { title: string; body: string; bullets: string[]; notes: string; type: "title" | "objectives" | "concept" | "worked_example" | "check" | "summary"; layout: "cover" | "text" | "split_visual"; visual_prompt: string; image_status?: "ready" | "none" | "pending" | "failed"; image_key?: string }[];
  children?: MapNode[]; overview?: string; objectives?: string[]; concepts?: { term: string; definition: string }[]; example?: { question: string; steps: string[] }; checklist?: string[]; transcript?: string[]; audio_status?: "ready" | "none" | "pending" | "failed";
};
export type ModuleEdit = { id?: string; kind: ModuleKind; title: string; description: string; status: "draft" | "ready"; data: EditableModuleData };
const text = (max: number) => z.string().max(max);
const strings = (max: number, count: number) => z.array(text(max)).max(count);
const media = z.enum(["ready", "none", "pending", "failed"]).optional();
const drafts = {
  notes: z.object({ sections: z.array(z.object({ heading: text(140), bullets: strings(220, 6), citation: text(120).default("") })).max(10) }),
  flashcards: z.object({ cards: z.array(z.object({ front: text(140), back: text(320) })).max(20) }),
  slides: z.object({ slides: z.array(z.object({ title: text(140), body: text(600).default(""), bullets: strings(160, 6).default([]), notes: text(600).default(""), type: z.enum(["title", "objectives", "concept", "worked_example", "check", "summary"]), layout: z.enum(["cover", "text", "split_visual"]), visual_prompt: text(300).default(""), image_status: media, image_key: z.string().regex(/^slide-\d+\.png$/).optional() })).max(14) }),
  audio: z.object({ transcript: strings(500, 14), audio_status: media }),
  "study-guides": z.object({ overview: text(700), objectives: strings(220, 6), concepts: z.array(z.object({ term: text(80), definition: text(300) })).max(6), example: z.object({ question: text(300), steps: strings(300, 6) }), checklist: strings(200, 8) }),
};
function mapDraft(raw: unknown, depth = 0, ready = false): MapNode {
  const row = z.object({ title: text(depth ? 90 : 120), children: z.array(z.unknown()).max(6).optional() }).parse(raw);
  if (ready && !row.title.trim()) throw new Error("Lengkapkan tajuk setiap cabang peta minda.");
  if (depth >= 3 && row.children?.length) throw new Error("Peta minda menyokong sehingga tiga aras cabang.");
  return { title: row.title, ...(row.children ? { children: row.children.map(child => mapDraft(child, depth + 1, ready)) } : {}) };
}
export function validateModuleForSave(input: unknown): ModuleEdit {
  const body = z.object({ kind: z.enum(MODULE_KINDS), title: z.string().trim().min(3).max(160), description: text(400).default(""), status: z.enum(["draft", "ready"]), data: z.record(z.string(), z.unknown()) }).parse(input);
  const raw = { ...body.data, title: body.title };
  let data: EditableModuleData = body.kind === "mindmaps" ? mapDraft(raw, 0, body.status === "ready") : { ...drafts[body.kind].parse(raw), title: body.title };
  if (body.status === "ready") {
    if (body.kind === "notes") {
      if (data.sections!.some(section => !section.heading.trim() || !section.bullets.some(bullet => bullet.trim()))) throw new Error("Lengkapkan tajuk dan isi setiap bahagian nota.");
      data = notesSchema.parse(data);
    } else if (body.kind === "flashcards") data = flashcardsSchema.parse(data);
    else if (body.kind === "slides") { const slides = data.slides!; const valid = deckSchema.parse(data); const meaningful = valid.slides.filter((slide) => slide.title.trim() || (slide.elements?.length ?? 0) > 0); if (meaningful.length < 2) throw new Error("Dek sedia memerlukan sekurang-kurangnya 2 slaid dengan kandungan."); data = { ...valid, slides: valid.slides.map((slide,index) => ({ ...slide, image_status: slides[index].image_status, image_key: slides[index].image_key })) }; }
    else if (body.kind === "mindmaps") data = cleanMindmap(mindmapSchema.parse(data));
    else if (body.kind === "study-guides") data = studyGuideSchema.parse(data);
    else data = { ...audioScriptSchema.parse(data), audio_status: data.audio_status };
  }
  return { ...body, data: { ...data, title: body.title, description: body.description } };
}
export function blankModule(kind: ModuleKind, title: string): ModuleEdit {
  const data: EditableModuleData = { title };
  if (kind === "notes") data.sections = [{ heading: "", bullets: [""], citation: "" }];
  if (kind === "flashcards") data.cards = [{ front: "", back: "" }];
  if (kind === "slides") data.slides = [{ type: "title", layout: "cover", title: "", body: "", bullets: [], notes: "", visual_prompt: "", image_status: "none" }];
  if (kind === "mindmaps") data.children = [{ title: "", children: [] }, { title: "", children: [] }];
  if (kind === "audio") { data.transcript = [""]; data.audio_status = "none"; }
  if (kind === "study-guides") Object.assign(data, { overview: "", objectives: ["", ""], concepts: [{ term: "", definition: "" }, { term: "", definition: "" }], example: { question: "", steps: [""] }, checklist: ["", ""] });
  return { kind, title, description: "", status: "draft", data };
}
export function moduleSummary(kind: string, raw: unknown) {
  const data = (raw && typeof raw === "object" ? raw : {}) as EditableModuleData;
  const itemCount = kind === "notes" ? data.sections?.length : kind === "flashcards" ? data.cards?.length : kind === "slides" ? data.slides?.length : kind === "mindmaps" ? data.children?.length : kind === "audio" ? data.transcript?.length : data.objectives?.length;
  const description = data.description || (kind === "notes" ? data.sections?.[0]?.bullets.join(" · ") : kind === "flashcards" ? data.cards?.[0]?.front : kind === "slides" ? data.slides?.[0]?.body : kind === "mindmaps" ? data.children?.map(node => node.title).join(" · ") : kind === "audio" ? data.transcript?.[0] : data.overview) || "";
  return { itemCount: itemCount || 0, hasContent: Boolean(itemCount), description: description.slice(0,400), audioStatus: data.audio_status || null, checklistCount: data.checklist?.length || 0 };
}
