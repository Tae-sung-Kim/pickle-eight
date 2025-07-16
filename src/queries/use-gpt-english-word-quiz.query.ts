import { useMutation } from '@tanstack/react-query';
import { GptEnglishWordQuizResponse } from '@/types';
import { apiInstance } from '@/services';

export const useGptEnglishWordQuizQuery = () => {
  return useMutation<GptEnglishWordQuizResponse, Error, void>({
    mutationFn: async () => {
      const res = await apiInstance.post<GptEnglishWordQuizResponse>(
        '/gpt-english-word-quiz'
      );

      if (!res.data) {
        throw new Error('영어 단어 퀴즈를 생성하는데 실패했습니다.');
      }

      return res.data;
    },
  });
};
