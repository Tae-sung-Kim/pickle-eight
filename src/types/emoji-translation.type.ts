/**
 * Shared types for Emoji Translation Quiz
 * Use English for code and documentation as per project rules.
 */

export type EmojiCategoryType = '영화' | '음식' | '일상' | '랜덤';

export type EmojiQuizProblemType = {
  readonly emojis: string;
  readonly category: EmojiCategoryType | string; // API may echo the category; keep string fallback
  readonly answer: string;
  readonly hint?: string;
};

export type EmojiQuizGradeType = {
  readonly correct: boolean;
  readonly score: number;
  readonly feedback: string;
};

export type GenerateValuesType = {
  readonly category: EmojiCategoryType;
};

export type GradeEmojiQuizInputType = {
  readonly emojis: string;
  readonly answer: string;
  readonly userGuess: string;
};
