import type { TarotQuestionTopicType } from '@/features/tarot/types/tarot.type';

export const TAROT_QUESTION_MAX_LENGTH = 100;

export const TAROT_QUESTION_LABEL = '질문 (선택)';
export const TAROT_QUESTION_PLACEHOLDER_DAILY =
  '예: 오늘 하루 무엇에 집중하면 좋습니까?';
export const TAROT_QUESTION_PLACEHOLDER_THREE_CARD =
  '예: 지금 고민하는 일의 흐름은 어떻습니까?';
export const TAROT_QUESTION_LIMIT_NOTICE = '100자까지 입력할 수 있습니다.';

export const TAROT_TOPIC_GROUP_LABEL = '분야';
export const TAROT_TOPIC_NOTICE =
  '분야는 질문 예시를 채우는 용도이며, 해석 문구는 분야와 관계없이 같습니다.';

/**
 * 분야 칩. examples(질문 예시)는 CT-3a 초안이다(분야당 3개, 사용자 검수 전).
 * 투자 종목, 매수 시점, 복권, 도박, 로또 번호를 묻는 예시는 넣지 않는다.
 */
export const TAROT_QUESTION_TOPICS: readonly TarotQuestionTopicType[] = [
  {
    key: 'love',
    label: '연애·인간관계',
    examples: [
      '가까운 사람과의 관계에서 요즘 살펴볼 점은 무엇입니까?',
      '대화가 자주 어긋나는 상대를 대할 때 어떤 마음가짐이 도움이 될 수 있습니까?',
      '새로운 인연을 만날 때 내가 놓치고 있는 부분은 무엇입니까?',
    ],
  },
  {
    key: 'career',
    label: '직업·학업',
    examples: [
      '지금 하는 일에서 집중해 볼 부분은 무엇입니까?',
      '공부를 꾸준히 이어 가는 데 필요한 마음가짐은 무엇입니까?',
      '진로를 고민하는 지금 먼저 정리해 볼 것은 무엇입니까?',
    ],
  },
  {
    key: 'money',
    label: '재물·생활',
    examples: [
      '요즘 나의 소비 습관에서 돌아볼 점은 무엇입니까?',
      '저축을 꾸준히 이어 가려면 어떤 태도가 도움이 될 수 있습니까?',
      '이번 달 생활 계획에서 놓치고 있는 부분은 무엇입니까?',
    ],
  },
  {
    key: 'daily',
    label: '일상 조언',
    examples: [
      '오늘 하루 마음에 담아 두면 좋을 점은 무엇입니까?',
      '요즘 지친 마음을 돌보려면 무엇을 해 보는 것이 도움이 될 수 있습니까?',
      '이번 주를 차분히 보내기 위해 살펴볼 점은 무엇입니까?',
    ],
  },
];
