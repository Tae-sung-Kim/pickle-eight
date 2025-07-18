import { useMutation } from '@tanstack/react-query';
import { apiInstance } from '@/services';
import { FourIdiomQuizDifficultyType, FourIdiomType } from '@/types';

export interface FourIdiomQuizRequest {
  difficulty: FourIdiomQuizDifficultyType;
}

export function useGptFourIdiomQuizQuery() {
  return useMutation<FourIdiomType, Error, FourIdiomQuizRequest>({
    mutationFn: async (data) => {
      const res = await apiInstance.post<FourIdiomType>(
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
