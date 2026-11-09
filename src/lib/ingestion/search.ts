import { readProviderJSON } from "./provider";
import type { AppWorkbook } from "@/lib/workbooks";
import { subjectById } from "@/lib/demo-data";

export async function searchLearningSources(query: string, workbook?: AppWorkbook | null, language = "ms") {
  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (!apiKey) throw new Error("Carian web belum dikonfigurasi pada pelayan.");
  const endpoint = new URL("https://api.search.tinyfish.ai/");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("language", language);
  endpoint.searchParams.set("location", "MY");
  endpoint.searchParams.set("purpose", `Find readable, authoritative educational articles${workbook ? ` about ${workbook.title}: ${workbook.topic}, ${subjectById(workbook.subjectId).name}, ${workbook.yearLabel}` : " for Malaysian school students"}. Prefer age-appropriate explanatory content in ${language === "ms" ? "Bahasa Melayu" : "English"}, original sources and curriculum resources; avoid login pages and search listings.`);
  const response = await fetch(endpoint, { headers: { Accept: "application/json", "X-API-Key": apiKey }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Carian web tidak tersedia (${response.status}). Cuba sebentar lagi.`);
  const payload = await readProviderJSON<{ results?: { title?: string; url?: string; snippet?: string; site_name?: string }[] }>(response);
  const seen = new Set<string>();
  const gatedHosts = ["scribd.com", "slideshare.net", "studocu.com", "coursehero.com", "facebook.com", "instagram.com", "tiktok.com", "pinterest.com"];
  const quality = (url: string) => {
    const host = new URL(url).hostname;
    return /(^|\.)(gov|edu)(\.|$)/.test(host) || /sites\.google\.com$/.test(host) && url.includes("moe-dl.edu.my") ? 3 : /wikipedia\.org$|britannica\.com$/.test(host) ? 2 : 1;
  };
  return (payload.results ?? []).flatMap((item) => {
    try {
      const url = new URL(item.url ?? "");
      if (gatedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return [];
      if (!item.title || !["http:", "https:"].includes(url.protocol) || url.username || url.password) return [];
      url.hash = "";
      for (const key of [...url.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/i.test(key)) url.searchParams.delete(key);
      if (seen.has(url.toString())) return [];
      seen.add(url.toString());
      return [{ title: item.title.slice(0, 300), url: url.toString(), snippet: String(item.snippet || "").slice(0, 600), site: item.site_name || url.hostname }];
    } catch { return []; }
  }).sort((a, b) => quality(b.url) - quality(a.url)).slice(0, 8);
}
