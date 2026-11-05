import type { TarotSpreadPositionType } from '@/features/tarot/types/tarot.type';

export const TAROT_THREE_CARD_COUNT = 3;

/**
 * 쓰리카드 위치. 순서대로 과거, 현재, 미래.
 * guide(위치 안내 한 줄)는 CT-3a 초안이다. 사용자 검수 전까지 상태는 초안이다.
 */
export const TAROT_SPREAD_POSITIONS: readonly TarotSpreadPositionType[] = [
  {
    key: 'past',
    label: '과거',
    guide: '지금 상황에 영향을 준 지난 흐름을 돌아보는 자리입니다.',
  },
  {
    key: 'present',
    label: '현재',
    guide: '지금 마주한 상황과 마음을 살펴보는 자리입니다.',
  },
  {
    key: 'future',
    label: '미래',
    guide: '지금의 흐름이 이어질 때 나타날 수 있는 모습을 참고하는 자리입니다.',
  },
];
