import { TRIVIA_QUIZ_CATEGORIES, TRIVIA_QUIZ_DIFFICULTIES } from "@/constants/trivia-quiz.constant";
import { TriviaQuizStoreStateType } from "@/types/trivia-quiz.type";
import { create } from 'zustand';

/**
 * zustand를 이용한 퀴즈 상태 관리 훅
 */
export const useTriviaQuizStore = create<TriviaQuizStoreStateType>((set) => ({
  questions: [],
  results: [],
  currentIdx: 0,
  addQuestion: (q) =>
    set((state) => ({
      questions: [...state.questions, q],
      currentIdx: state.questions.length,
    })),
  answer: (result) =>
    set((state) => ({
      results: [...state.results, result],
    })),
  reset: () => set({ questions: [], results: [], currentIdx: 0 }),
}));

export type TriviaQuizCategoryType = (typeof TRIVIA_QUIZ_CATEGORIES)[number];

export type TriviaQuizDifficultyType =
  (typeof TRIVIA_QUIZ_DIFFICULTIES)[number];
