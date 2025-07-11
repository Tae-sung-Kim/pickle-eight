import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from '@/constants';
import { QuizStoreStateType } from '@/types';
import { create } from 'zustand';

/**
 * zustand를 이용한 퀴즈 상태 관리 훅
 */
export const useQuizStore = create<QuizStoreStateType>((set) => ({
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

export type QuizCategoryType = (typeof QUIZ_CATEGORIES)[number];

export type QuizDifficultyType = (typeof QUIZ_DIFFICULTIES)[number];
