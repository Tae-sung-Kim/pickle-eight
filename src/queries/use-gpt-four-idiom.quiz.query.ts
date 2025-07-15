import { useMutation } from '@tanstack/react-query';
import { apiInstance } from '@/services';

export type FourIdiomQuiz = {
  question: string;
  answer: string;
  hint: string;
};

/**
 * GPT 기반 사자성어 퀴즈 생성 API를 호출하는 서비스 훅
 */
export type FourIdiomQuizDifficulty = 'easy' | 'normal' | 'hard';

export interface FourIdiomQuizRequest {
  difficulty: FourIdiomQuizDifficulty;
}

export function useGptFourIdiomQuizQuery() {
  return useMutation<FourIdiomQuiz, Error, FourIdiomQuizRequest>({
    mutationFn: async (data) => {
      const res = await apiInstance.post<FourIdiomQuiz>(
        '/gpt-four-idiom-quiz',
        { ...data }
      );
      if (!res.data) {
        throw new Error('사자성어 퀴즈 생성 실패');
      }
      return res.data;
    },
  });
}
