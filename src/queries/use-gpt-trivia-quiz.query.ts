import { http } from "@/lib/http";
import { TriviaQuizCategoryType, TriviaQuizDifficultyType, TriviaQuizQuestionType } from "@/types/trivia-quiz.type";
import { useMutation } from '@tanstack/react-query';

/**
 * GPT 기반 퀴즈 생성 API를 호출하는 서비스 훅
 */
export function useGptTriviaQuizQuery() {
  return useMutation<
    TriviaQuizQuestionType,
    Error,
    {
      category: TriviaQuizCategoryType;
      difficulty: TriviaQuizDifficultyType;
      model?: string;
    }
  >({
    mutationFn: async ({ category, difficulty, model }) => {
      const res = await http.post('/gpt/trivia-quiz', {
        category,
        difficulty,
        ...(model ? { model } : {}),
      });
      if (!res.data) {
        throw new Error('퀴즈 생성 실패');
      }
      return res.data;
    },
  });
}
