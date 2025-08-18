import { useMutation } from '@tanstack/react-query';
import { GptTodayMessageResponse } from '@/types';
import { apiInstance } from '@/services';

/**
 * GPT 오늘의 문구/운세 요청 훅
 */
export function useGptTodayMessageQuery() {
  return useMutation<GptTodayMessageResponse, Error, void>({
    mutationFn: async () => {
      const res = await apiInstance.post<GptTodayMessageResponse>(
        '/gpt/today-message'
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
