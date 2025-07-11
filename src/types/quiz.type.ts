import { z } from 'zod';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from '@/constants';

/**
 * 카테고리
 */
export type QuizCategoryType =
  | '역사'
  | '상식'
  | '사회'
  | '과학'
  | '스포츠'
  | '예술'
  | '기타';

export type QuizDifficultyType = '하' | '중' | '상' | '최상';

/**
 * 4지선다 보기
 */
export type QuizOptionType = {
  id: string;
  text: string;
};

/**
 * 퀴즈 문제 구조체
 */
export type QuizQuestionType = {
  id: string;
  category: QuizCategoryType;
  difficulty: QuizDifficultyType;
  question: string;
  options: QuizOptionType[];
  answerId: string;
  explanation: string;
};

/**
 * 퀴즈 결과 기록
 */
export interface QuizResult {
  questionId: string;
  selectedId: string;
  correct: boolean;
  answeredAt: string;
}

export type QuizStoreStateType = {
  questions: QuizQuestionType[];
  results: QuizResult[];
  currentIdx: number;
  addQuestion: (q: QuizQuestionType) => void;
  answer: (result: QuizResult) => void;
  reset: () => void;
};

export type RawQuizJsonType = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const quizFormSchema = z.object({
  category: z.enum(QUIZ_CATEGORIES),
  difficulty: z.enum(QUIZ_DIFFICULTIES),
});

export type QuizFormValuesType = z.infer<typeof quizFormSchema>;
