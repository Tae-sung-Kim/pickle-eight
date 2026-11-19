/**
 * 허브 SEO 값. 금지 표현 검사 대상이라 상수로 한곳에 둔다.
 * 구조(허브 title에 "꿈 해몽", 상세 title에 소재 이름)는 바꾸지 않는다.
 * T-12(DR-N)에서 design.md 8장 초안 그대로 확정. description의 예시 소재(돼지, 뱀, 치아)는 데이터에 있다.
 */
export const DREAM_HUB_SEO = {
  heading: '꿈 해몽',
  title: '꿈 해몽: 꿈 소재 사전',
  description:
    '돼지꿈, 뱀꿈, 치아처럼 꿈에 나온 소재를 검색하거나 카테고리에서 골라 민간에서 전해 온 풀이와 요즘 생각해 볼 점을 읽어 보실 수 있습니다. 오락과 자기 성찰을 위한 참고 콘텐츠입니다.',
  pathname: '/dream',
  keywords: [
    '꿈 해몽',
    '꿈해몽',
    '꿈풀이',
    '꿈 해몽 사전',
    '꿈 풀이 사전',
    '꿈 소재 찾기',
  ],
  ogImageAlt: '꿈 해몽 꿈 소재 사전 안내 이미지',
} as const;

/** 상세 SEO 템플릿. {keywordName}, {summary}를 채운다 */
export const DREAM_TOPIC_SEO_TEMPLATE = {
  title: '{keywordName} 해몽: 민간 풀이와 생각해 볼 점',
  description:
    '{summary} 민간에서 전해 온 풀이와 요즘 생각해 볼 점을 함께 정리했습니다.',
  ogImageAlt: '{keywordName} 해몽 안내 이미지',
  ogImageTag: '꿈 해몽',
} as const;

/** BreadcrumbList 2단계(꿈 해몽 그룹) */
export const DREAM_BREADCRUMB_GROUP = {
  name: '꿈 해몽',
  pathname: '/dream',
} as const;

/** 루트 레이아웃 category("로또" 포함)를 덮어쓰는 값 */
export const DREAM_METADATA_CATEGORY = '엔터테인먼트, 꿈 해몽';
