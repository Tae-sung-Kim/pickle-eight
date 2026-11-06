import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';

/**
 * 페이지별 SEO 값 (design.md 13.1). 금지 표현·"사주" 용어 검사 대상이라 상수로 한곳에 둔다.
 * 허브와 방식 A 페이지(오늘·띠·별자리)의 title·description·OG alt·keywords에는 "사주"를 쓰지 않는다.
 * 사주(2단계) 항목은 출시 전이라 만들지 않는다.
 */

export type FortunePageSeoType = Readonly<{
  /** h1 */
  heading: string;
  /** h1 아래 설명 한 줄 */
  headerDescription: string;
  title: string;
  description: string;
  /** `/`로 시작. FORTUNE_ROUTES 값 */
  pathname: string;
  keywords: readonly string[];
  /** OG 이미지 alt */
  ogImageAlt: string;
}>;

export const FORTUNE_HUB_SEO: FortunePageSeoType = {
  heading: '운세',
  headerDescription:
    '생년월일로 보는 오늘의 운세와 12띠·12별자리의 오늘 운세를 한곳에서 고를 수 있습니다.',
  title: '운세 - 오늘의 운세, 띠별 운세, 별자리 운세',
  description:
    '생년월일로 보는 오늘의 운세와 12띠·12별자리의 오늘 운세를 한곳에서 볼 수 있습니다. 로그인 없이 이용할 수 있고 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_ROUTES.hub,
  keywords: ['운세', '무료 운세', '오늘의 운세', '띠별 운세', '별자리 운세'],
  ogImageAlt: '오늘의 운세와 띠별·별자리 운세 모아 보기',
};

export const FORTUNE_TODAY_SEO: FortunePageSeoType = {
  heading: '오늘의 운세',
  headerDescription:
    '생년월일로 오늘의 총운과 재물·애정·직장·건강 운세, 행운 요소를 살펴봅니다.',
  title: '오늘의 운세 - 생년월일로 보는 무료 오늘의 운세',
  description:
    '로그인 없이 생년월일만으로 오늘의 총운과 재물·애정·직장·건강 운세, 행운의 색·숫자·방향을 확인할 수 있습니다. 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_ROUTES.today,
  keywords: [
    '오늘의 운세',
    '무료 운세',
    '생년월일 운세',
    '생년월일로 보는 오늘의 운세',
  ],
  ogImageAlt: '생년월일로 보는 오늘의 운세',
};

export const FORTUNE_TTI_SEO: FortunePageSeoType = {
  heading: '띠별 운세',
  headerDescription:
    '12띠의 오늘 운세를 보고, 입춘 시각을 기준으로 내 띠를 찾아봅니다.',
  title: '띠별 운세 - 오늘의 띠별 운세와 내 띠 찾기',
  description:
    '쥐띠부터 돼지띠까지 12띠의 오늘의 운세를 볼 수 있습니다. 입춘 시각을 기준으로 내 띠를 찾고, 설날 기준과 다른 경우도 함께 알려 드립니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_ROUTES.tti,
  keywords: ['띠별 운세', '오늘의 띠별 운세', '내 띠 알아보기', '입춘 띠 기준'],
  ogImageAlt: '12띠 오늘의 띠별 운세',
};

export const FORTUNE_STAR_SIGN_SEO: FortunePageSeoType = {
  heading: '별자리 운세',
  headerDescription:
    '12별자리의 오늘 운세를 보고, 경계일의 시각까지 반영해 내 별자리를 찾아봅니다.',
  title: '별자리 운세 - 오늘의 별자리 운세와 내 별자리 확인',
  description:
    '12별자리의 오늘의 운세를 볼 수 있습니다. 해마다 조금씩 달라지는 별자리 경계 시각을 반영해 내 별자리를 찾아 드립니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_ROUTES.starSign,
  keywords: [
    '별자리 운세',
    '오늘의 별자리 운세',
    '내 별자리 확인',
    '별자리 날짜',
  ],
  ogImageAlt: '12별자리 오늘의 별자리 운세',
};

/** BreadcrumbList 2단계(운세 그룹). 허브는 홈 > 운세, 기능 페이지는 홈 > 운세 > 페이지 */
export const FORTUNE_BREADCRUMB_GROUP = {
  name: '운세',
  pathname: FORTUNE_ROUTES.hub,
} as const;
