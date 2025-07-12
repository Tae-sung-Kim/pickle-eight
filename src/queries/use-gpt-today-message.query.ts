import { useMutation } from '@tanstack/react-query';
import { TodayMessageType } from '@/types';
import { apiInstance } from '@/services';

/**
 * GPT 오늘의 문구/운세 요청 훅
 */
export function useGptTodayMessageQuery() {
  return useMutation<string, Error, { type: TodayMessageType }>({
    mutationFn: async ({ type }) => {
      const res = await apiInstance.post<{ message: string }>(
        '/gpt-today-message',
        { type }
      );
      if (!res.data?.message) {
        throw new Error('오늘의 메시지 생성 실패');
      }
      return res.data.message;
    },
  });
}
