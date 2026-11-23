/**
 * 끼니 허브 SEO 값. 금지 표현 검사 대상이라 상수로 한곳에 둔다.
 * title은 템플릿이 " | 운빨연구소"를 붙인다.
 */
export const MEAL_HUB_PATH = '/meal';

export const MEAL_HUB_SEO = {
  heading: '오늘 뭐 먹지',
  title: '오늘 뭐 먹지 - 점심·저녁·아침 메뉴 추천',
  description:
    '룰렛으로 오늘의 점심, 저녁, 아침 메뉴를 무작위로 골라 보는 오락 서비스입니다. 뽑힌 메뉴는 지도에서 바로 검색할 수 있습니다.',
  pathname: MEAL_HUB_PATH,
  /** "주변 음식점 찾기", "식당 찾기", 새 "추천" 키워드는 넣지 않는다. 점심 키워드는 옛 페이지 검색 문구를 잇기 위해 남긴다 */
  keywords: [
    '오늘 뭐 먹지',
    '점심 뭐 먹지',
    '점심 메뉴 추천',
    '점심 룰렛',
    '점심 메뉴 룰렛',
    '오늘 점심 메뉴',
    '점심 메뉴 고르기',
    '저녁 뭐 먹지',
    '저녁 메뉴 룰렛',
    '저녁 메뉴 고르기',
    '아침 뭐 먹지',
    '메뉴 룰렛',
  ],
  ogImageAlt: '오늘 뭐 먹지 안내 이미지',
} as const;

/** BreadcrumbList: 홈 > 오늘 뭐 먹지 (그룹 전용 주소가 없어 같은 주소를 두 번 넣지 않는다) */
export const MEAL_BREADCRUMB = {
  page: { name: '오늘 뭐 먹지', pathname: MEAL_HUB_PATH },
} as const;
