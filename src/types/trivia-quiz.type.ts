import { TRIVIA_QUIZ_CATEGORIES, TRIVIA_QUIZ_DIFFICULTIES } from "@/constants/trivia-quiz.constant";
import { z } from 'zod';

/**
 * 카테고리
 */
export type TriviaQuizCategoryType =
  | '역사'
  | '상식'
  | '사회'
  | '과학'
  | '스포츠'
  | '예술'
  | '기타';

export type TriviaQuizDifficultyType = '하' | '중' | '상' | '최상';

/**
 * 4지선다 보기
 */
export type TriviaQuizOptionType = {
  id: string;
  text: string;
};

/**
 * 퀴즈 문제 구조체
 */
export type TriviaQuizQuestionType = {
  id: string;
  category: TriviaQuizCategoryType;
  difficulty: TriviaQuizDifficultyType;
  question: string;
  options: TriviaQuizOptionType[];
  answerId: string;
  explanation: string;
};

/**
 * 퀴즈 결과 기록
 */
export interface TriviaQuizResult {
  questionId: string;
  selectedId: string;
  correct: boolean;
  answeredAt: string;
}

export type TriviaQuizStoreStateType = {
  questions: TriviaQuizQuestionType[];
  results: TriviaQuizResult[];
  currentIdx: number;
  addQuestion: (q: TriviaQuizQuestionType) => void;
  answer: (result: TriviaQuizResult) => void;
  reset: () => void;
};

export type TriviaRawQuizJsonType = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const TriviaQuizFormSchema = z.object({
  category: z.enum(TRIVIA_QUIZ_CATEGORIES),
  difficulty: z.enum(TRIVIA_QUIZ_DIFFICULTIES),
});

export type TriviaQuizFormValuesType = z.infer<typeof TriviaQuizFormSchema>;
