import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/**
 * Asset store for generated artifact images.
 * Local dev: ./.assets — Production: a mounted volume (ASSETS_DIR=/app/assets).
 */
const ROOT = process.env.ASSETS_DIR ?? "./.assets";

function resolveKey(key: string) {
  const safe = key.replace(/\.\./g, "").replace(/^\/+/, "");
  return path.join(ROOT, safe);
}

export async function putAsset(key: string, bytes: Uint8Array): Promise<void> {
  const file = resolveKey(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
}

export async function getAsset(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveKey(key));
  } catch {
    return null;
  }
}

export function assetKey(artifactId: string, slideIndex: number) {
  return `artifacts/${artifactId}/slide-${slideIndex}.png`;
}
