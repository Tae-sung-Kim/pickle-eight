import type { FortuneGuideType } from '@/features/fortune/constants/fortune-guide.constant';

/**
 * 허브·띠·별자리 궁합 페이지 소개 문단 초안(합니다체). CP-2 승인 전에는 화면에 연결하지 않는다.
 * 관계 유형 문단·등급 규칙·출처 설명 등 나머지 가이드는 별도 작성 대상이다.
 */

export const FORTUNE_COMPATIBILITY_HUB_INTRO: FortuneGuideType = [
  {
    heading: '궁합 테스트 소개',
    paragraphs: [
      '궁합 테스트는 두 사람의 생년월일로 각자의 띠와 별자리를 찾고, 두 띠와 두 별자리가 서로 어떤 관계인지 설명해 드리는 서비스입니다. 점수 대신 잘 맞는 편, 무난한 편, 조율이 필요한 편의 세 등급과 관계 유형에 맞는 설명으로 보여 드립니다.',
      '결과는 서비스가 정한 규칙에 따라 미리 작성해 둔 문구를 고른 것이며, 같은 두 사람이 입력하면 같은 결과가 나옵니다. 오락과 참고를 위한 콘텐츠이므로 가볍게 이야기를 나누는 소재로 즐겨 주시기 바랍니다.',
    ],
  },
];

export const FORTUNE_COMPATIBILITY_TTI_INTRO: FortuneGuideType = [
  {
    heading: '띠 궁합이란',
    paragraphs: [
      '띠 궁합은 두 사람이 태어난 해의 띠가 서로 어떤 관계인지 살펴보는 방법입니다. 12띠 사이에는 육합, 삼합, 방합, 충, 원진 같은 전통적인 관계가 있고, 이 서비스는 그 관계를 바탕으로 설명을 보여 드립니다.',
      '띠는 입춘 시각을 기준으로 나눕니다. 생년월일을 입력하면 각자의 띠를 찾아 관계를 보여 드리며, 입력한 생년월일은 저장되지 않습니다.',
    ],
  },
];

export const FORTUNE_COMPATIBILITY_STAR_SIGN_INTRO: FortuneGuideType = [
  {
    heading: '별자리 궁합이란',
    paragraphs: [
      '별자리 궁합은 두 사람의 별자리가 속한 불, 흙, 공기, 물 네 원소가 서로 어떤 관계인지 살펴보는 방법입니다. 같은 원소끼리는 결이 비슷하고, 서로 보완하는 원소끼리는 부족한 점을 채워 주는 관계로 설명합니다.',
      '생년월일을 입력하면 각자의 별자리를 찾아 원소의 관계를 보여 드리며, 입력한 생년월일은 저장되지 않습니다.',
    ],
  },
];
