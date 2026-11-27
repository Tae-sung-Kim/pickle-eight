import { MENU_LIST } from '@/constants/menu.constant';

export const RESULT_NEXT_LINKS_TITLE = '다른 기능도 볼 수 있어요';
export const RESULT_NEXT_LINK_SUFFIX = '도 볼까요?';

const LOTTO = '/lotto';
const TAROT = '/tarot';
const FORTUNE = '/fortune';

/**
 * 결과 화면 -> 이동 링크 2개(메뉴 경로). 키는 결과 화면 경로.
 * - 로또 화면은 로또끼리만, 로또 외 화면은 로또로 잇지 않는다.
 * - 이미 이동 링크가 있는 화면(오늘의 운세, 띠별·별자리 운세, 궁합, 운빨 뽑기 3곳)은 넣지 않는다.
 */
export const RESULT_NEXT_LINK_TARGETS = {
  [`${FORTUNE}/saju`]: [`${FORTUNE}/today`, `${FORTUNE}/tti`],
  [`${TAROT}/daily`]: [`${TAROT}/three-card`, `${FORTUNE}/today`],
  [`${TAROT}/three-card`]: [`${TAROT}/daily`, '/dream'],
  '/dream/[slug]': ['/dream', `${TAROT}/daily`],
  '/meal': ['/lucky-draw/ladder', '/lucky-draw/roulette'],
  [`${LOTTO}/generator`]: [`${LOTTO}/check`, `${LOTTO}/my-numbers`],
  [`${LOTTO}/check`]: [`${LOTTO}/my-numbers`, `${LOTTO}/history`],
  [`${LOTTO}/history`]: [`${LOTTO}/analysis`, `${LOTTO}/check`],
  [`${LOTTO}/analysis`]: [`${LOTTO}/simulator`, `${LOTTO}/history`],
  [`${LOTTO}/simulator`]: [`${LOTTO}/analysis`, `${LOTTO}/generator`],
} as const satisfies Record<string, readonly [string, string]>;

export type ResultNextLinkFromType = keyof typeof RESULT_NEXT_LINK_TARGETS;

export const MENU_LABEL_BY_HREF: ReadonlyMap<string, string> = new Map(
  MENU_LIST.flatMap((group) => group.items.map((i) => [i.href, i.label]))
);
