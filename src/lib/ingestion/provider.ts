import { gunzipSync } from "node:zlib";

/** Some search/fetch gateways return an extra gzip layer without matching headers. */
export async function readProviderJSON<T>(response: Response): Promise<T> {
  const limit = 12 * 1024 * 1024;
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Pembaca web memulangkan respons kosong. Cuba lagi.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("Respons pembaca web terlalu besar. Pilih artikel yang lebih pendek."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body = Buffer.concat(chunks);
  try {
    for (let layer = 0; layer < 2 && body[0] === 0x1f && body[1] === 0x8b; layer++) body = gunzipSync(body, { maxOutputLength: limit });
    return JSON.parse(body.toString("utf8").replace(/^\uFEFF/, "")) as T;
  }
  catch { throw new Error("Pembaca web memulangkan respons tidak sah. Cuba lagi atau gunakan pautan lain."); }
}
