import { z } from "zod";

export const generateStorySchema = z.object({
  domain: z.string().min(1, "Domain is required").max(50, "Domain is too long"),
});

export const translateSchema = z.object({
  text: z.string().min(1, "Text is required").max(1000, "Text is too long"),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      question_index: z.number().int().nonnegative(),
      question: z.string(),
      userAnswer: z.string(),
      correctAnswer: z.string(),
      isCorrect: z.boolean(),
    }),
  ),
});

export const sendChatSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message is too long"),
});
