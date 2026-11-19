/**
 * 점심 허브 SEO 값 (design 10장, plan Q13). 금지 표현 검사 대상이라 상수로 한곳에 둔다.
 * title은 템플릿이 " | 운빨연구소"를 붙인다.
 * description은 design 10장 승인 문구에서 "지도 앱에서"만 "지도에서"로 바꾼 확정 문구다.
 */
export const LUNCH_HUB_PATH = '/lunch/today';

export const LUNCH_HUB_SEO = {
  heading: '오늘 뭐 먹지',
  title: '오늘 뭐 먹지 - 점심 메뉴 룰렛',
  description:
    '룰렛으로 오늘의 점심 메뉴를 무작위로 골라 보는 오락 서비스입니다. 뽑힌 메뉴는 지도에서 바로 검색할 수 있습니다.',
  pathname: LUNCH_HUB_PATH,
  /** "주변 음식점 찾기", "점심 식당 찾기"는 넣지 않는다(plan) */
  keywords: [
    '오늘 뭐 먹지',
    '점심 뭐 먹지',
    '점심 메뉴 추천',
    '점심 룰렛',
    '점심 메뉴 룰렛',
    '오늘 점심 메뉴',
    '점심 메뉴 고르기',
  ],
  ogImageAlt: '오늘 뭐 먹지 점심 메뉴 룰렛 안내 이미지',
} as const;

/** BreadcrumbList: 홈 > 점심(그룹 href) > 오늘 뭐 먹지 */
export const LUNCH_BREADCRUMB = {
  group: { name: '점심', pathname: LUNCH_HUB_PATH },
  page: { name: '오늘 뭐 먹지', pathname: LUNCH_HUB_PATH },
} as const;
