import { useMutation } from '@tanstack/react-query';
import { apiInstance } from './axios-instance';
import { TodayMessageType } from '@/types';

/**
 * GPT 오늘의 문구/운세 요청 훅
 * @param type - "cheer" | "fortune"
 * @returns react-query mutation 객체
 */
export function useGptTodayMessageService(type: TodayMessageType) {
  const fallbackMessage =
    type === 'fortune'
      ? '오늘의 운세를 가져올 수 없습니다. 힘내세요!'
      : '오늘도 힘내세요! 당신은 할 수 있습니다.';

  return useMutation({
    mutationFn: async (): Promise<string> => {
      try {
        const res = await apiInstance.post<{ message: string }>(
          '/gpt-today-message',
          { type }
        );
        // 정상 메시지 반환, 없으면 fallback
        return res.data.message || fallbackMessage;
      } catch {
        // 에러 발생 시 fallback
        return fallbackMessage;
      }
    },
  });
}
