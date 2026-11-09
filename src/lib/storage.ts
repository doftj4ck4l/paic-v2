import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/**
 * Asset store for generated artifact images and audio.
 * Local dev: ./.assets — Production: a mounted volume (ASSETS_DIR=/app/assets).
 */
const ROOT = process.env.ASSETS_DIR ?? "./.assets";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
};

function resolveKey(key: string) {
  const safe = key.replace(/\.\./g, "").replace(/^\/+/, "");
  return path.join(ROOT, safe);
}

export async function putAsset(key: string, bytes: Uint8Array): Promise<void> {
  const file = resolveKey(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
}

export async function getAsset(key: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  try {
    const bytes = await readFile(resolveKey(key));
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return { bytes, contentType: CONTENT_TYPES[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export function assetKey(artifactId: string, name: string) {
  return `artifacts/${artifactId}/${name}`;
}
