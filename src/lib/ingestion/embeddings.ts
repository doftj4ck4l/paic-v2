export function embeddingModel() { return process.env.MODEL_EMBEDDING || "embeddinggemma-2"; }
export function embeddingConfigured() { return Boolean((process.env.EMBEDDING_BASE_URL || process.env.ROUTER_BASE_URL) && (process.env.EMBEDDING_API_KEY || process.env.ROUTER_API_KEY)); }

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length || texts.some((text) => !text.trim())) throw new Error("Tiada teks yang sah untuk diindeks.");
  if (!embeddingConfigured()) throw new Error("Perkhidmatan embedding belum dikonfigurasi pada pelayan.");
  const base = (process.env.EMBEDDING_BASE_URL || process.env.ROUTER_BASE_URL || "").replace(/\/+$/, "");
  const key = process.env.EMBEDDING_API_KEY || process.env.ROUTER_API_KEY;
  const response = await fetch(`${base}/embeddings`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: embeddingModel(), input: texts }), signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`Embedding tidak berjaya (${response.status}). Teks anda disimpan; sila cuba semula.`);
  const payload = await response.json() as { data?: { index: number; embedding: number[] }[] };
  const data = [...(payload.data || [])].sort((a, b) => a.index - b.index);
  if (data.length !== texts.length || data.some((item, index) => item.index !== index || !Array.isArray(item.embedding) || !item.embedding.length || item.embedding.some((n) => !Number.isFinite(n))) || data.some((item) => item.embedding.length !== data[0].embedding.length)) throw new Error("Perkhidmatan embedding memulangkan vektor yang tidak lengkap. Sila cuba semula.");
  return data.map((item) => item.embedding);
}
