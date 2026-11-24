import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import type { FortunePageSeoType } from '@/features/fortune/constants/fortune-seo.constant';

/**
 * 궁합 페이지별 SEO 값 초안 (design.md 6장). CP-2 승인 전에는 화면에 연결하지 않는다.
 * title·description·keywords·OG alt에는 metadata 금지어(copy-rule 파일 목록)와 "사주"를 쓰지 않는다.
 */

export const FORTUNE_COMPATIBILITY_HUB_SEO: FortunePageSeoType = {
  heading: '궁합 테스트',
  headerDescription:
    '두 사람의 생년월일로 띠 궁합과 별자리 궁합을 한곳에서 고를 수 있습니다.',
  title: '궁합 테스트 - 띠 궁합과 별자리 궁합 무료로 보기',
  description:
    '두 사람의 생년월일로 띠 궁합과 별자리 궁합을 무료로 볼 수 있습니다. 점수 대신 관계 유형과 설명으로 보여 드리며, 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_COMPATIBILITY_ROUTES.hub,
  keywords: ['궁합 테스트', '무료 궁합'],
  ogImageAlt: '두 사람의 띠 궁합과 별자리 궁합',
};

export const FORTUNE_COMPATIBILITY_TTI_SEO: FortunePageSeoType = {
  heading: '띠 궁합',
  headerDescription:
    '두 사람의 생년월일로 각자의 띠를 찾고 띠 사이의 관계를 살펴봅니다.',
  title: '띠 궁합 - 두 사람의 띠로 보는 띠별 궁합',
  description:
    '두 사람의 생년월일로 각자의 띠를 찾고 육합·삼합·방합·충·원진 관계로 띠 궁합을 보여 드립니다. 띠는 입춘 시각을 기준으로 나누며 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_COMPATIBILITY_ROUTES.tti,
  keywords: ['띠 궁합', '띠별 궁합'],
  ogImageAlt: '두 사람의 띠로 보는 띠 궁합',
};

export const FORTUNE_COMPATIBILITY_STAR_SIGN_SEO: FortunePageSeoType = {
  heading: '별자리 궁합',
  headerDescription:
    '두 사람의 생년월일로 각자의 별자리를 찾고 네 원소의 관계를 살펴봅니다.',
  title: '별자리 궁합 - 두 사람의 별자리 원소로 보는 궁합',
  description:
    '두 사람의 생년월일로 각자의 별자리를 찾고 불·흙·공기·물 네 원소의 관계로 별자리 궁합을 보여 드립니다. 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다.',
  pathname: FORTUNE_COMPATIBILITY_ROUTES.starSign,
  keywords: ['별자리 궁합'],
  ogImageAlt: '두 사람의 별자리 원소로 보는 별자리 궁합',
};
