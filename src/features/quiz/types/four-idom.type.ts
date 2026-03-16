export type FourIdiomQuizDifficultyType = 'easy' | 'normal' | 'hard';

export type FourIdiomType = {
  id: string;
  answer: string;
  meaning: string;
  difficulty: FourIdiomQuizDifficultyType;
  question?: string;
  hint?: string;
};
