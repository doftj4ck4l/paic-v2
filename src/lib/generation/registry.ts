import { isGenerationAvailable } from "./shared";
import { runSlidesGeneration, slideCountFor } from "./slides";
import { runSimpleKindGeneration, simpleCountFor, SIMPLE_KINDS } from "./kinds";
import { runAudioGeneration } from "./audio";

export const ARTIFACT_KINDS = ["slides", "notes", "quizzes", "flashcards", "mindmaps", "study-guides", "audio"] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export function isArtifactKind(value: string): value is ArtifactKind {
  return (ARTIFACT_KINDS as readonly string[]).includes(value);
}

export function countFor(kind: ArtifactKind, count: string): number {
  if (kind === "slides") return slideCountFor(count);
  if (kind === "audio") return 1;
  return simpleCountFor(kind, count);
}

export { isGenerationAvailable };

export function runArtifactGeneration(artifactId: string, kind: ArtifactKind) {
  if (kind === "slides") return runSlidesGeneration(artifactId);
  if (kind === "audio") return runAudioGeneration(artifactId);
  return runSimpleKindGeneration(artifactId, kind);
}

export { SIMPLE_KINDS };
