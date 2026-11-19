import type { DreamFaqItemType } from '@/features/dream/types/dream.type';

/**
 * 허브 FAQ(3개). 화면과 JSON-LD가 같은 배열을 쓴다.
 * 답에는 "예측", "보장"을 쓰지 않는다. 문구는 T-12(DR-N)에서 초안 그대로 확정했다.
 */
export const DREAM_HUB_FAQ: readonly DreamFaqItemType[] = [
  {
    question: '꿈 해몽은 어떤 방식으로 풀이하나요?',
    answer:
      '민간에서 전해 온 해몽 관념을 바탕으로 이 서비스가 새로 쓴 풀이와, 요즘 생활과 이어 생각해 볼 점을 함께 보여 드립니다. 소재마다 풀이는 하나이며 상황에 따라 달라지지 않습니다.',
  },
  {
    question: '찾는 꿈 소재는 어디에서 찾나요?',
    answer:
      '검색칸에 소재 이름이나 비슷한 말을 입력하거나, 아래 카테고리 목록에서 골라 보실 수 있습니다.',
  },
  {
    question: '꿈 풀이로 앞으로의 일을 알 수 있나요?',
    answer:
      '꿈 풀이는 앞으로의 일을 알려 주는 근거가 아니라 읽고 생각해 보는 참고 글입니다. 풀이를 근거로 중요한 결정을 내리지 않으시기 바랍니다.',
  },
];
