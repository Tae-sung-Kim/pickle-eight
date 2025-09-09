import { useMutation } from '@tanstack/react-query';
import { GptEnglishWordQuizResponse } from '@/types';
import { http } from '@/lib';

export const useGptEnglishWordQuizQuery = () => {
  return useMutation<GptEnglishWordQuizResponse, Error, void>({
    mutationFn: async () => {
      const res = await http.post<GptEnglishWordQuizResponse>(
        '/gpt/english-word-quiz'
      );

      if (!res.data) {
        throw new Error('영어 단어 퀴즈를 생성하는데 실패했습니다.');
      }

      return res.data;
    },
  });
};
