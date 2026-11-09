import type {
  TarotTopicSelectionType,
  TarotTopicType,
} from '@/features/tarot/types/tarot.type';

/** 분야 칩 순서 고정 */
export const TAROT_TOPICS: readonly TarotTopicType[] = [
  { key: 'all', label: '전체' },
  { key: 'love', label: '연애·인간관계' },
  { key: 'career', label: '직업·학업' },
  { key: 'money', label: '재물·생활' },
  { key: 'daily', label: '일상 조언' },
];

export const TAROT_TOPIC_DEFAULT: TarotTopicSelectionType = 'all';

/** 칩 그룹 접근성 이름 */
export const TAROT_TOPIC_GROUP_LABEL = '분야';

export const TAROT_TOPIC_NOTICE =
  '분야를 고르면 같은 카드도 그 분야의 관점에서 읽는 문장이 달라집니다. 카드는 무작위로 뽑히며 분야와 관계없이 정해집니다.';

/** 3장 결과의 분야 표시줄 접두사 */
export const TAROT_TOPIC_LINE_PREFIX = '분야:';

/** 1장 분야 변경 알림(sr-only aria-live). 앞에 분야 이름이 붙는다 */
export const TAROT_TOPIC_APPLIED_NOTICE = '분야 문장으로 바꿨습니다.';
export const TAROT_TOPIC_CLEARED_NOTICE = '분야 문장을 숨겼습니다.';
