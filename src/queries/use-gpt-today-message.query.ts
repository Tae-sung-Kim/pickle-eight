import { useMutation } from '@tanstack/react-query';
import { GptTodayMessageResponseType } from '@/types';
import { http } from '@/lib';

/**
 * GPT 오늘의 문구/운세 요청 훅
 */
export function useGptTodayMessageQuery() {
  return useMutation<GptTodayMessageResponseType, Error, void>({
    mutationFn: async () => {
      const res = await http.post<GptTodayMessageResponseType>(
        '/gpt/today-message?mode=multi'
      );
      if (
        !res.data?.fortune ||
        !res.data?.cheer ||
        !res.data?.todo ||
        !res.data?.menu
      ) {
        throw new Error('오늘의 메시지 생성 실패');
      }
      return res.data;
    },
  });
}
