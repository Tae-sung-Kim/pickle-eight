import { http } from "@/lib/http";
import { GptTodayMessageResponseType } from "@/types/openai-api.type";
import { useMutation } from '@tanstack/react-query';

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
