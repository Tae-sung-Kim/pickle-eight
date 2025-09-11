import { useMutation } from '@tanstack/react-query';
import { GptEnglishWordQuizResponse } from '@/types';
import { http } from '@/lib';

export type EnglishWordQuizRequest = { model?: string };

export const useGptEnglishWordQuizQuery = () => {
  return useMutation<
    GptEnglishWordQuizResponse,
    Error,
    EnglishWordQuizRequest | void
  >({
    mutationFn: async (payload) => {
      const body =
        payload && (payload as EnglishWordQuizRequest)?.model
          ? { model: (payload as EnglishWordQuizRequest).model }
          : undefined;
      const res = await http.post<GptEnglishWordQuizResponse>(
        '/gpt/english-word-quiz',
        body
      );

      if (!res.data) {
        throw new Error('영어 단어 퀴즈를 생성하는데 실패했습니다.');
      }

      return res.data;
    },
  });
};
