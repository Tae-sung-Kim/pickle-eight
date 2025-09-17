import { EMOJI_CATEGORY_ENUM } from "@/constants/emoji-translation.constant";

export type EmojiCategoryType =
  (typeof EMOJI_CATEGORY_ENUM)[keyof typeof EMOJI_CATEGORY_ENUM];

export type EmojiTranslationProblemType = {
  readonly emojis: string;
  readonly category: EmojiCategoryType | string; // API may echo the category; keep string fallback
  answer: string;
  readonly hint?: string;
};

export type EmojiQuizGradeType = {
  readonly correct: boolean;
  readonly score: number;
  readonly feedback: string;
};

export type EmojiGenerateValuesType = {
  readonly category: EmojiCategoryType;
  readonly model?: string; // optional GPT model id
};

export type EmojiGradeQuizInputType = {
  readonly emojis: string;
  readonly answer: string;
  readonly userGuess: string;
};

export type EmojiControlsSectionType = {
  category: string;
  onCategoryChange: (value: EmojiGenerateValuesType['category']) => void;
  canUse: boolean;
  used: number;
  limit: number;
  isGenerating: boolean;
  onGenerate: () => void;
};

export type EmojiTranslationFormType = {
  onSubmit: (guess: string) => void;
  isPending: boolean;
};

export type EmojiTranslationResultNoticeType = {
  error: Error | null;
  result: EmojiQuizGradeType | null;
};
