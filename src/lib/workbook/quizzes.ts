import { z } from "zod";
import { quizSchema } from "@/lib/generation/schemas";
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const quizQuestionDraft = z.object({ question: z.string().max(300), options: z.array(z.string().max(120)).min(2).max(4), answer: z.number().int().min(0).max(3), explanation: z.string().max(300).default(""), aiExplain: z.string().max(600).optional(), citation: z.string().max(120).default("") });
export const quizEditSchema = z.object({ title: z.string().trim().min(3).max(160), description: z.string().trim().max(400).default(""), difficulty: difficultySchema.default("medium"), cover: z.enum(["mountain", "globe", "map", "quiz"]).default("globe"), status: z.enum(["draft", "ready"]), questions: z.array(quizQuestionDraft).max(14) });
export function validateQuizForSave(value: unknown) {
  const body = quizEditSchema.parse(value);
  if (body.status === "ready") {
    if (body.questions.some(question => !question.question.trim() || question.options.some(option => !option.trim()) || question.answer >= question.options.length)) throw new Error("Lengkapkan setiap soalan, semua pilihan dan jawapan yang betul sebelum menandakan kuiz sedia.");
    const valid = quizSchema.parse({ title: body.title, questions: body.questions });
    return { ...body, questions: valid.questions };
  }
  return body;
}
