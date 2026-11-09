import test from "node:test";
import assert from "node:assert/strict";
import { blankModule, MODULE_KINDS, moduleSummary, validateModuleForSave } from "../src/lib/workbook/modules";
const data = {
  notes: { sections: [{ heading: "Sejatan", bullets: ["Air menjadi wap"], citation: "Nota" }, { heading: "Pemeluwapan", bullets: ["Wap menjadi titisan"], citation: "Nota" }] },
  flashcards: { cards: Array.from({ length: 4 }, (_,index) => ({ front: `Soalan ${index}`, back: "Jawapan" })) },
  slides: { slides: [{ type: "title", layout: "cover", title: "Kitaran air", body: "Pengenalan", bullets: [], notes: "", visual_prompt: "", image_status: "ready", image_key: "slide-3.png" }, { type: "concept", layout: "text", title: "Sejatan", body: "Air menjadi wap", bullets: [], notes: "", visual_prompt: "" }] },
  mindmaps: { children: [{ title: "Sejatan", children: [{ title: "Matahari" }] }, { title: "Pemeluwapan" }] },
  audio: { transcript: ["Air menjadi wap.", "Wap menyejuk.", "Hujan turun."] },
  "study-guides": { overview: "Kitaran air berterusan.", objectives: ["Terangkan sejatan", "Terangkan kerpasan"], concepts: [{ term: "Sejatan", definition: "Air menjadi wap" }, { term: "Kerpasan", definition: "Hujan turun" }], example: { question: "Bagaimana hujan terbentuk?", steps: ["Sejatan", "Pemeluwapan"] }, checklist: ["Faham sejatan", "Faham kerpasan"] },
};
for (const kind of MODULE_KINDS) {
  test(`${kind}: incomplete drafts save, complete content becomes ready`, () => {
    assert.equal(validateModuleForSave(blankModule(kind, "Bahan baharu")).status, "draft");
    assert.throws(() => validateModuleForSave({ ...blankModule(kind, "Bahan baharu"), status: "ready" }));
    const ready = validateModuleForSave({ kind, title: "Kitaran air", description: "Nota kelas", status: "ready", data: data[kind] });
    assert.equal(ready.status, "ready"); assert.equal(ready.data.title, "Kitaran air"); assert.ok(moduleSummary(kind, ready.data).itemCount > 0);
  });
}
test("slide media identifiers survive validation and reject paths outside the artifact", () => {
  const ready = validateModuleForSave({ kind: "slides", title: "Kitaran air", status: "ready", data: data.slides });
  assert.equal(ready.data.slides![0].image_key, "slide-3.png");
  assert.throws(() => validateModuleForSave({ ...ready, data: { slides: [{ ...data.slides.slides[0], image_key: "../other.png" }] } }));
});
test("mind maps reject excessive depth and unfinished named branches", () => {
  assert.throws(() => validateModuleForSave({ kind: "mindmaps", title: "Peta minda", status: "ready", data: { children: [{ title: "" }, { title: "Sejatan" }] } }));
  assert.throws(() => validateModuleForSave({ kind: "mindmaps", title: "Peta minda", status: "draft", data: { children: [{ title: "A", children: [{ title: "B", children: [{ title: "C", children: [{ title: "D" }] }] }] }] } }));
});
