/** Canonical workbook module kinds, in workspace tab order. */
export const MODULE_KINDS = [
  { kind: "notes", label: "Nota" },
  { kind: "quizzes", label: "Kuiz" },
  { kind: "flashcards", label: "Kad Imbas" },
  { kind: "slides", label: "Slaid" },
  { kind: "mindmaps", label: "Peta Minda" },
  { kind: "audio", label: "Audio" },
  { kind: "study-guides", label: "Panduan Ulang Kaji" },
] as const;

export type ModuleKind = (typeof MODULE_KINDS)[number]["kind"];

const KIND_SET = new Set<string>(MODULE_KINDS.map((entry) => entry.kind));

export function isModuleKind(value: string): value is ModuleKind {
  return KIND_SET.has(value);
}

export function moduleKindLabel(kind: string) {
  return MODULE_KINDS.find((entry) => entry.kind === kind)?.label ?? kind;
}

/** Keep only valid, de-duplicated kinds in canonical order. */
export function sanitizeModuleKinds(values: string[]): ModuleKind[] {
  const wanted = new Set(values.filter(isModuleKind));
  return MODULE_KINDS.filter((entry) => wanted.has(entry.kind)).map((entry) => entry.kind);
}
