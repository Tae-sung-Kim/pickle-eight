import { z } from 'zod';
import { EMOJI_CATEGORY_ENUM } from '@/constants';

export const EmojiTranslationGenerateSchema = z.object({
  action: z.literal('generate').optional(),
  category: z.nativeEnum(EMOJI_CATEGORY_ENUM).optional(),
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
