import { useMutation } from '@tanstack/react-query';
import {
  QuizCategoryType,
  QuizDifficultyType,
  QuizQuestionType,
} from '@/types';
import { apiInstance } from '@/services';

/**
 * GPT 기반 퀴즈 생성 API를 호출하는 서비스 훅
 */
export function useGptQuizQuery() {
  return useMutation<
    QuizQuestionType,
    Error,
    { category: QuizCategoryType; difficulty: QuizDifficultyType }
  >({
    mutationFn: async ({ category, difficulty }) => {
      const res = await apiInstance.post('/gpt-quiz', { category, difficulty });
      if (!res.data) {
        throw new Error('퀴즈 생성 실패');
      }
      return res.data;
    },
  });
}
