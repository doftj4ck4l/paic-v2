import test from "node:test";
import assert from "node:assert/strict";
import { validateQuizForSave } from "../src/lib/workbook/quizzes";
import { downloadName, attachmentHeader } from "../src/lib/workbook/downloads";
const question = { question: "Apakah planet ketiga?", options: ["Bumi", "Marikh", "Zuhrah", "Musytari"], answer: 0, explanation: "Rujuk sumber.", citation: "Nota" };
const quiz = { title: "Kuiz Bumi", description: "Kenali planet Bumi.", difficulty: "easy", cover: "globe", status: "ready", questions: [question, question, question] };
test("a ready quiz requires complete questions, valid options and a valid correct answer", () => {
  assert.equal(validateQuizForSave(quiz).questions.length, 3);
  assert.throws(() => validateQuizForSave({ ...quiz, questions: [question] }));
  assert.throws(() => validateQuizForSave({ ...quiz, questions: [question, question, { ...question, options: ["Bumi", "", "Marikh", "Zuhrah"] }] }));
  assert.throws(() => validateQuizForSave({ ...quiz, questions: [question, question, { ...question, options: ["Bumi", "Marikh"], answer: 3 }] }));
});
test("drafts can be saved before questions are complete, with bounded fields", () => {
  const saved = validateQuizForSave({ ...quiz, status: "draft", questions: [{ ...question, question: "", options: ["", "", "", ""] }] });
  assert.equal(saved.status, "draft"); assert.equal(saved.questions.length, 1);
  assert.throws(() => validateQuizForSave({ ...quiz, title: "" }));
  assert.throws(() => validateQuizForSave({ ...quiz, questions: Array.from({ length: 15 }, () => question) }));
});
test("download names and attachment headers retain Unicode without path or header control characters", () => {
  assert.equal(downloadName("Nota/Geografi\\Bumi\n.pdf"), "Nota-Geografi-Bumi-.pdf");
  assert.ok(attachmentHeader("Nota Bumi — Tahun 4.txt").includes("filename*=UTF-8''"));
  assert.equal(attachmentHeader("Nota Bumi.txt").includes("\n"), false);
});
