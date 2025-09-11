import { useMutation } from '@tanstack/react-query';
import { http } from '@/lib';
import { FourIdiomQuizDifficultyType, FourIdiomType } from '@/types';

export type FourIdiomQuizRequestType = {
  difficulty: FourIdiomQuizDifficultyType;
  model?: string;
};

export function useGptFourIdiomQuizQuery() {
  return useMutation<FourIdiomType, Error, FourIdiomQuizRequestType>({
    mutationFn: async (data) => {
      const res = await http.post<FourIdiomType>('/gpt/four-idiom-quiz', {
        ...data,
      });
      if (!res.data) {
        throw new Error('사자성어 퀴즈 생성 실패');
      }
      return res.data;
    },
  });
}
