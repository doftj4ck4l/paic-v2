import { readProviderJSON } from "./provider";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";
import { lookup } from "dns/promises";
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { isIP } from "net";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { normalizeText, validateSourceText } from "./text";

export function isPublicAddress(address: string): boolean {
  const value = address.toLowerCase();
  if (isIP(value) === 6) return /^[23][0-9a-f]{3}:/.test(value) && !value.startsWith("2001:db8:") && !value.startsWith("2001:0:");
  if (isIP(value) !== 4) return false;
  const [a, b, c] = value.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)))) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
}

export async function validatePublicUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port && !["80", "443"].includes(url.port)) throw new Error("Guna pautan web awam HTTP atau HTTPS yang sah.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) throw new Error("Pautan rangkaian peribadi tidak dibenarkan.");
  const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) throw new Error("Pautan rangkaian peribadi tidak dibenarkan.");
  url.hash = "";
  return { url, addresses };
}

export async function fetchPublicResource(input: string, redirects = 0): Promise<{ body: Buffer; contentType: string; url: string }> {
  if (redirects > 5) throw new Error("Terlalu banyak pengalihan pautan.");
  const { url, addresses } = await validatePublicUrl(input);
  const result = await new Promise<{ body: Buffer; status: number; location?: string; type: string; encoding?: string }>((resolve, reject) => {
    const makeRequest = url.protocol === "https:" ? httpsRequest : httpRequest;
    // Pin the validated DNS result; redirects are independently revalidated.
    const req = makeRequest(url, {
      headers: { "User-Agent": "Pixelspace/1.0 (+learning source reader)", Accept: "text/html,application/pdf,text/plain;q=0.9,*/*;q=0.5", "Accept-Encoding": "identity" },
      lookup: (_host, options, callback) => {
        const selected = addresses[0];
        if (options.all) callback(null, [selected]);
        else callback(null, selected.address, selected.family);
      },
    }, (res) => {
      const status = res.statusCode ?? 500;
      if (status >= 300 && status < 400 && res.headers.location) { res.resume(); resolve({ body: Buffer.alloc(0), status, location: res.headers.location, type: "" }); return; }
      if (status < 200 || status >= 300) { res.resume(); reject(new Error(status === 403 || status === 401 ? "Halaman ini menyekat akses. Cuba sumber awam yang lain." : `Halaman tidak dapat dimuatkan (${status}).`)); return; }
      const parts: Buffer[] = [];
      let bytes = 0;
      res.on("data", (part: Buffer) => { bytes += part.length; if (bytes > 12 * 1024 * 1024) req.destroy(new Error("Fail melebihi had 12 MB untuk pembacaan web.")); else parts.push(part); });
      res.on("end", () => resolve({ body: Buffer.concat(parts), status, type: String(res.headers["content-type"] ?? ""), encoding: String(res.headers["content-encoding"] ?? "") }));
      res.on("error", reject);
    });
    const timer = setTimeout(() => req.destroy(new Error("Halaman mengambil masa terlalu lama. Cuba lagi atau pilih sumber lain.")), 25_000);
    req.on("close", () => clearTimeout(timer));
    req.on("error", reject);
    req.end();
  });
  if (result.location) return fetchPublicResource(new URL(result.location, url).toString(), redirects + 1);
  let body = result.body;
  const decompressOptions = { maxOutputLength: 12 * 1024 * 1024 };
  if (result.encoding === "gzip" || body[0] === 0x1f && body[1] === 0x8b) body = gunzipSync(body, decompressOptions);
  else if (result.encoding === "br") body = brotliDecompressSync(body, decompressOptions);
  else if (result.encoding === "deflate") body = inflateSync(body, decompressOptions);
  return { body, contentType: result.type, url: url.toString() };
}

export type ExtractedPage = { title: string; text: string; url: string; method: string; language?: string };

export async function extractWebPage(input: string): Promise<ExtractedPage> {
  const { url } = await validatePublicUrl(input);
  let providerError = "";
  if (process.env.TINYFISH_API_KEY && !/\.pdf$/i.test(url.pathname)) {
    try {
      const response = await fetch("https://api.fetch.tinyfish.ai", {
        method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": process.env.TINYFISH_API_KEY },
        body: JSON.stringify({ urls: [url.toString()], format: "markdown" }), signal: AbortSignal.timeout(55_000),
      });
      if (!response.ok) throw new Error(`Pembaca web tidak tersedia (${response.status}).`);
      const payload = await readProviderJSON<{ results?: { title?: string; text?: string; final_url?: string; language?: string }[]; errors?: { error?: string }[] }>(response);
      const page = payload.results?.[0];
      if (page?.text) {
        const final = await validatePublicUrl(page.final_url || url.toString());
        return { title: (page.title || final.url.hostname).slice(0, 160), text: validateSourceText(page.text), url: final.url.toString(), method: "tinyfish", language: page.language };
      }
      throw new Error("Pembaca web tidak menemui kandungan artikel.");
    } catch (error) { providerError = error instanceof Error ? error.message : "Pembacaan web gagal."; }
  }
  const resource = await fetchPublicResource(url.toString());
  if (resource.contentType.includes("pdf") || resource.body.subarray(0, 5).toString() === "%PDF-") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(resource.body));
    try {
      const { text } = await extractText(pdf, { mergePages: true });
      if (normalizeText(text).length < 200) throw new Error("PDF ini ialah imbasan atau tiada lapisan teks. Muat naik versi berteks atau tampal teksnya.");
      return { title: decodeURIComponent(new URL(resource.url).pathname.split("/").pop() || url.hostname), text: validateSourceText(text), url: resource.url, method: "pdf" };
    } finally { /* unpdf manages the document lifecycle. */ }
  }
  if (resource.contentType.startsWith("text/plain") || resource.contentType.includes("markdown")) return { title: url.hostname, text: validateSourceText(resource.body.toString("utf8")), url: resource.url, method: "text" };
  if (resource.contentType && !/html|xhtml/i.test(resource.contentType)) throw new Error("Jenis halaman ini tidak disokong. Guna artikel web, PDF berteks atau fail teks.");
  const dom = new JSDOM(resource.body.toString("utf8"), { url: resource.url });
  try {
    const title = dom.window.document.title || url.hostname;
    const article = new Readability(dom.window.document.cloneNode(true) as Document).parse();
    let text = article?.textContent ?? "";
    if (text.trim().length < 200) {
      dom.window.document.querySelectorAll("script,style,nav,header,footer,aside,form,noscript").forEach((element) => element.remove());
      text = (dom.window.document.querySelector("main,article") ?? dom.window.document.body)?.textContent ?? "";
    }
    try { return { title: (article?.title || title).slice(0, 160), text: validateSourceText(text), url: resource.url, method: "readability" }; }
    catch { throw new Error(providerError || "Teks artikel tidak dapat diekstrak. Halaman mungkin memerlukan log masuk atau JavaScript. Cuba pautan artikel lain."); }
  } finally { dom.window.close(); }
}
