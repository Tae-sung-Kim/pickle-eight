/** 페이지별 SEO 값. 금지 표현 검사 대상이라 상수로 한곳에 둔다 */

export type TarotPageSeoType = Readonly<{
  /** h1 */
  heading: string;
  /** h1 아래 설명 한 줄 */
  headerDescription: string;
  title: string;
  description: string;
  /** `/`로 시작 */
  pathname: string;
  keywords: readonly string[];
  /** OG 이미지 alt */
  ogImageAlt: string;
}>;

export const TAROT_DAILY_SEO: TarotPageSeoType = {
  heading: '오늘의 타로',
  headerDescription:
    '카드 한 장으로 가볍게 보는 오늘의 흐름입니다. 짧게 읽고 하루를 시작해 보시기 바랍니다.',
  title: '오늘의 타로 - 가볍게 보는 오늘의 흐름, 무료 타로 카드 한 장',
  description:
    '로그인 없이 타로 카드 한 장을 뽑아 가볍게 오늘의 흐름을 살펴볼 수 있습니다. 연애·직업·재물·일상 중 분야를 고르면 같은 카드를 그 분야의 관점으로 읽을 수 있습니다. 오락·참고용 콘텐츠입니다.',
  pathname: '/tarot/daily',
  keywords: [
    '오늘의 타로',
    '오늘의 타로 카드',
    '무료 타로',
    '타로 카드 한 장',
    '타로 원카드',
    '타로 카드 뽑기',
    '타로 역방향 뜻',
  ],
  ogImageAlt: '오늘의 타로 카드 뽑기',
};

export const TAROT_THREE_CARD_SEO: TarotPageSeoType = {
  heading: '3장 타로 (과거·현재·미래)',
  headerDescription:
    '카드 세 장의 과거·현재·미래 흐름을 한 편의 이야기로 이어 읽으며 고민을 깊이 정리해 봅니다.',
  title: '3장 타로 (과거·현재·미래) - 무료 쓰리카드 타로로 고민 정리',
  description:
    '카드 세 장의 과거·현재·미래 흐름을 한 편의 이야기로 엮어 고민을 차분히 정리해 볼 수 있습니다. 분야를 고르면 이야기의 관점이 달라집니다. 오락·참고용 콘텐츠입니다.',
  pathname: '/tarot/three-card',
  keywords: [
    '3장 타로',
    '쓰리카드 타로',
    '과거 현재 미래 타로',
    '무료 타로',
    '타로 카드 뽑기',
    '타로 역방향 뜻',
  ],
  ogImageAlt: '3장 타로 과거 현재 미래 카드 뽑기',
};

/** BreadcrumbList 2단계(타로 그룹). 그룹 href가 /tarot/daily 라 오늘의 타로에서는 2·3단계 URL이 같다 */
export const TAROT_BREADCRUMB_GROUP = {
  name: '타로',
  pathname: '/tarot/daily',
} as const;
