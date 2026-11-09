/**
 * OpenAI-compatible client for the Pixelspace Router (text + image models).
 * Credentials come from env; see .env.example.
 */

export type ChatMessage = { role: "system" | "user"; content: string };

export function isRouterConfigured(): boolean {
  return Boolean(process.env.ROUTER_BASE_URL && process.env.ROUTER_API_KEY);
}

export function isGenerationMock(): boolean {
  return process.env.GENERATION_MOCK === "1";
}

function config() {
  const baseUrl = (process.env.ROUTER_BASE_URL ?? "").replace(/\/+$/, "");
  const apiKey = process.env.ROUTER_API_KEY ?? "";
  if (!baseUrl || !apiKey) {
    throw new Error("Penjanaan AI belum dikonfigurasi pada pelayan ini.");
  }
  return { baseUrl, apiKey };
}

export function textModel(): string {
  return process.env.MODEL_TEXT ?? "gemini-2.5-flash";
}

export function imageModel(): string {
  return process.env.MODEL_IMAGE ?? "gemini-3.1-flash-image";
}

/** Extract the first JSON object from model output (handles ``` fences). */
export function extractJson(text: string): unknown {
  let value = text.trim();
  if (value.startsWith("```")) {
    value = value.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model tidak memulangkan JSON yang sah.");
  }
  return JSON.parse(value.slice(start, end + 1));
}

export async function chatJSON(
  messages: ChatMessage[],
  { maxTokens = 8000, model = textModel() }: { maxTokens?: number; model?: string } = {},
): Promise<unknown> {
  const { baseUrl, apiKey } = config();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.6 }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`Ralat model (${response.status}): ${body}`);
  }
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  };
  const choice = payload.choices?.[0];
  const reason = (choice?.finish_reason ?? "").toLowerCase();
  if (reason === "length" || reason === "max_tokens") {
    throw new Error("Penjanaan terhenti kerana had panjang. Cuba bilangan slaid yang lebih kecil.");
  }
  const content = choice?.message?.content ?? "";
  if (!content.trim()) {
    throw new Error("Model memulangkan jawapan kosong.");
  }
  return extractJson(content);
}

export async function generateImage(
  prompt: string,
  { model = imageModel() }: { model?: string } = {},
): Promise<Uint8Array> {
  const { baseUrl, apiKey } = config();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`Ralat imej (${response.status}): ${body}`);
  }
  const payload = (await response.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const url = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
  const match = url.match(/^data:image\/[a-z+]+;base64,(.+)$/i);
  if (!match) {
    throw new Error("Model imej tidak memulangkan imej yang sah.");
  }
  return Buffer.from(match[1], "base64");
}
