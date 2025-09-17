import { EMOJI_CATEGORY_ENUM } from "@/constants/emoji-translation.constant";
import { z } from 'zod';

export const EmojiTranslationGenerateSchema = z.object({
  action: z.literal('generate').optional(),
  category: z.nativeEnum(EMOJI_CATEGORY_ENUM).optional(),
  model: z.string().optional(),
  // tuning & debug flags (all optional)
  strictModel: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  noRepair: z.boolean().optional(),
  noAuth: z.boolean().optional(),
  noDupCheck: z.boolean().optional(),
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
