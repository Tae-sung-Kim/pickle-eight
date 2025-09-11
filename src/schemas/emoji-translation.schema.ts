import { z } from 'zod';

export const EmojiTranslationGenerateSchema = z.object({
  action: z.literal('generate').optional(),
  category: z.enum(['영화', '음식', '일상', '랜덤']).optional(),
  model: z.string().optional(),
});

const gradeSchema = z.object({
  action: z.literal('grade'),
  emojis: z.string().min(1),
  answer: z.string().min(1),
  userGuess: z.string().min(1),
});

export const EmojiTranslationRequestSchema = z.union([
  EmojiTranslationGenerateSchema,
  gradeSchema,
]);
