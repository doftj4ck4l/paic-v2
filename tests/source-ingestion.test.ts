import test from "node:test";
import assert from "node:assert/strict";
import { chunkSourceText, normalizeText, validateSourceText } from "../src/lib/ingestion/text";
import { isPublicAddress, validatePublicUrl } from "../src/lib/ingestion/web";
import { embedTexts } from "../src/lib/ingestion/embeddings";
import { cosineSimilarity } from "../src/lib/ingestion/retrieval";

test("chunking preserves all normalized characters, with overlap and no empty chunks", () => {
  const text = normalizeText(Array.from({ length: 80 }, (_, index) => `Perenggan ${index}: Sejatan membentuk wap air; pemeluwapan membentuk awan.\n\n`).join(""));
  const chunks = chunkSourceText(text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.trim() && chunk.length <= 1500));
  let covered = chunks[0];
  for (const chunk of chunks.slice(1)) {
    let overlap = Math.min(200, covered.length, chunk.length);
    while (overlap > 0 && covered.slice(-overlap) !== chunk.slice(0, overlap)) overlap--;
    assert.ok(overlap >= 150, "neighboring chunks retain context");
    covered += chunk.slice(overlap);
  }
  assert.equal(covered, text);
  assert.deepEqual(chunkSourceText("  \n "), []);
  assert.throws(() => chunkSourceText(text, 100, 100));
});
test("empty snippets and challenge pages never pass extraction quality checks", () => {
  assert.throws(() => validateSourceText("No text to extract"));
  assert.throws(() => validateSourceText("Verify you are human. Captcha verification required. ".repeat(8)));
  assert.throws(() => validateSourceText("A required part of this site couldn’t load. This may be due to a browser extension, network issues, or browser settings. Please check your connection, disable any ad blockers, or try using a different browser."));
  assert.ok(validateSourceText("Air bergerak antara lautan dan atmosfera melalui proses sejatan dan kerpasan. ".repeat(8)));
});
test("web extraction rejects private addresses, non-web protocols and credential URLs", async () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.2.1", "169.254.169.254", "::1", "::ffff:127.0.0.1", "2001:db8::1", "100.64.1.1"]) assert.equal(isPublicAddress(address), false, address);
  assert.equal(isPublicAddress("1.1.1.1"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
  for (const url of ["http://127.0.0.1/a", "http://localhost/a", "file:///etc/passwd", "https://user:pass@example.com", "https://example.com:444"]) await assert.rejects(validatePublicUrl(url));
});
test("embedding responses must include exactly one finite vector per input, sorted by index", async () => {
  const previous = global.fetch;
  const oldBase = process.env.EMBEDDING_BASE_URL, oldKey = process.env.EMBEDDING_API_KEY;
  process.env.EMBEDDING_BASE_URL = "https://embedding.invalid/v1"; process.env.EMBEDDING_API_KEY = "test";
  try {
    global.fetch = async () => Response.json({ data: [{ index: 1, embedding: [0, 1] }, { index: 0, embedding: [1, 0] }] });
    assert.deepEqual(await embedTexts(["satu", "dua"]), [[1, 0], [0, 1]]);
    global.fetch = async () => Response.json({ data: [{ index: 0, embedding: [] }] });
    await assert.rejects(embedTexts(["satu"]));
    global.fetch = async () => Response.json({ data: [{ index: 0, embedding: [1] }, { index: 0, embedding: [2] }] });
    await assert.rejects(embedTexts(["satu", "dua"]));
    await assert.rejects(embedTexts([" "]));
  } finally { global.fetch = previous; if (oldBase === undefined) delete process.env.EMBEDDING_BASE_URL; else process.env.EMBEDDING_BASE_URL = oldBase; if (oldKey === undefined) delete process.env.EMBEDDING_API_KEY; else process.env.EMBEDDING_API_KEY = oldKey; }
});
test("retrieval scores use matching dimensions and reject empty vectors", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([], []), -1);
  assert.equal(cosineSimilarity([1], [1, 0]), -1);
});


test("provider JSON handles plain JSON and incorrectly labelled gzip, with clear errors", async () => {
  const { readProviderJSON } = await import("../src/lib/ingestion/provider");
  const { gzipSync } = await import("node:zlib");
  const value = { results: [{ title: "Kitaran Air", text: "Kandungan sebenar" }] };
  assert.deepEqual(await readProviderJSON(Response.json(value)), value);
  assert.deepEqual(await readProviderJSON(new Response(gzipSync(JSON.stringify(value)))), value);
  await assert.rejects(readProviderJSON(new Response("Upstream unavailable")), /respons tidak sah/);
});

test("ready sources recover an automatic empty selection and late embeddings join an explicit selection", async () => {
  const { reconcileSelection } = await import("../src/lib/workbook/source-selection");
  assert.deepEqual(reconcileSelection(["a", "b"], [], [], false), ["a", "b"]);
  assert.deepEqual(reconcileSelection(["a", "b"], [], [], true), []);
  assert.deepEqual(reconcileSelection(["a", "b"], ["a"], ["b"], true), ["a", "b"]);
  assert.deepEqual(reconcileSelection(["a"], ["a", "deleted"], ["still-processing"], true), ["a"]);
});
test("chat citations can only reference the source excerpts supplied to the model", async () => {
  const { finalizeChatAnswer } = await import("../src/lib/workbook/chat");
  const references = [{ index: 1, sourceId: "a", title: "Nota", excerpt: "Teks sumber" }];
  const result = finalizeChatAnswer("Jawapan [1]. Rujukan palsu [99].", references);
  assert.equal(result.answer.includes("[99]"), false);
  assert.deepEqual(result.citations, references);
  assert.deepEqual(finalizeChatAnswer("Jawapan tanpa rujukan.", references).citations, []);
});


test("streamed WAV files get final sizes for browser duration and seeking", async () => {
  const { normalizeWaveHeader } = await import("../src/lib/generation/wav");
  const bytes = Buffer.alloc(100);
  bytes.write("RIFF", 0); bytes.writeUInt32LE(0xffffffff, 4); bytes.write("WAVE", 8);
  bytes.write("fmt ", 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(24000, 24); bytes.writeUInt32LE(48000, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36); bytes.writeUInt32LE(0xffffffff, 40);
  const fixed = Buffer.from(normalizeWaveHeader(bytes));
  assert.equal(fixed.readUInt32LE(4), 92); assert.equal(fixed.readUInt32LE(40), 56);
  assert.equal(bytes.readUInt32LE(4), 0xffffffff, "original input is preserved");
  assert.deepEqual(normalizeWaveHeader(new Uint8Array([1, 2, 3])), new Uint8Array([1, 2, 3]));
});
