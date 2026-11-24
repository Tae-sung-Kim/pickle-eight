import type { FortuneGuideType } from '@/features/fortune/constants/fortune-guide.constant';
import type {
  FortuneCompatibilityElementRelationKeyType,
  FortuneCompatibilityTtiRuleRelationKeyType,
} from '@/features/fortune/types/fortune-compatibility.type';

/**
 * 궁합 가이드 문단 초안(합니다체). 승인 전에는 화면에 연결하지 않는다.
 * 조합 목록("쥐-소" 등)과 원소표의 별자리 이름은 규칙 상수에서 만들어 붙이므로 문구에 손으로 쓰지 않는다.
 * 등급 규칙은 서비스 자체 규칙이며 원진은 자료마다 조금 다르다는 점을 밝힌다(design.md 8.1).
 */

/** 관계 하나의 설명(h3 + 단락). 조합 목록은 화면이 규칙 상수에서 붙인다 */
export type FortuneCompatibilityRelationGuideType = Readonly<{
  heading: string;
  paragraph: string;
}>;

/** 띠 궁합 가이드: 관계 정의(h2 + 단락) */
export const FORTUNE_COMPATIBILITY_TTI_GUIDE: FortuneGuideType = [
  {
    heading: '띠 관계 살펴보기',
    paragraphs: [
      '띠 관계는 12띠 사이에 전해 내려오는 전통적인 분류입니다. 이 서비스는 육합, 삼합, 방합, 충, 원진 다섯 가지 관계를 규칙으로 두고, 어디에도 해당하지 않는 조합은 그 밖의 관계로 나눕니다. 한 쌍이 여러 관계에 들면 육합, 삼합, 방합, 충, 원진 순서로 앞의 관계를 따릅니다.',
      '같은 띠끼리는 따로 같은 띠 전용 설명을 보여 드립니다. 아래 목록에서 두 띠의 순서는 서로 바꿔도 같은 관계입니다.',
    ],
  },
];

/** 띠 관계별 설명. 키는 규칙 관계 5개와 그 밖의 관계 */
export const FORTUNE_COMPATIBILITY_TTI_RELATION_GUIDE: Readonly<
  Record<
    FortuneCompatibilityTtiRuleRelationKeyType | 'other',
    FortuneCompatibilityRelationGuideType
  >
> = {
  yukhap: {
    heading: '육합',
    paragraph:
      '육합은 12띠를 둘씩 짝지은 관계입니다. 서로의 부족한 부분을 채워 주는 짝으로 전해 오며, 이 서비스에서는 잘 맞는 편으로 봅니다.',
  },
  samhap: {
    heading: '삼합',
    paragraph:
      '삼합은 12띠를 셋씩 네 무리로 묶은 관계입니다. 같은 무리의 띠끼리는 지향하는 방향이 닮아 함께할 때 힘이 모인다고 전해지며, 이 서비스에서는 잘 맞는 편으로 봅니다.',
  },
  banghap: {
    heading: '방합',
    paragraph:
      '방합은 계절과 방위가 같은 띠를 셋씩 묶은 관계입니다. 같은 계절의 기운을 나누는 사이로 전해지며, 이 서비스에서는 잘 맞는 편으로 봅니다.',
  },
  chung: {
    heading: '충',
    paragraph:
      '충은 12띠에서 서로 마주 보는 위치에 있는 띠의 관계입니다. 성향이 크게 달라 부딪히기 쉬운 사이로 전해지지만, 서로 다른 점을 알아 두면 조율하는 데 도움이 됩니다. 이 서비스에서는 조율이 필요한 편으로 봅니다.',
  },
  wonjin: {
    heading: '원진',
    paragraph:
      '원진은 서로 어긋나거나 마음이 닿기 어렵다고 전해지는 관계입니다. 어느 두 띠를 원진으로 보는지는 자료마다 조금 다르며, 이 서비스는 여러 자료가 공통으로 쓰는 표를 따랐습니다. 이 서비스에서는 조율이 필요한 편으로 봅니다.',
  },
  other: {
    heading: '그 밖의 관계',
    paragraph:
      '위의 다섯 가지 관계에 해당하지 않는 조합입니다. 특별히 이끌리거나 부딪히는 관계로 분류되지 않아 이 서비스에서는 무난한 편으로 봅니다.',
  },
};

/** 별자리 궁합 가이드: 원소 정의(h2 + 단락). 원소표(원소 | 별자리 3개)는 규칙 상수에서 만든다 */
export const FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE: FortuneGuideType = [
  {
    heading: '별자리 원소 살펴보기',
    paragraphs: [
      '12별자리는 불, 흙, 공기, 물 네 원소로 나뉘며 원소마다 별자리가 셋씩 들어 있습니다. 이 서비스는 두 별자리가 속한 원소끼리의 관계를 같은 원소, 보완, 대립, 그 밖의 관계로 나누어 설명합니다.',
      '같은 별자리끼리는 원소 관계로는 같은 원소이고, 설명은 같은 별자리 전용 문구를 보여 드립니다. 원소 관계의 보완과 대립은 대중에게 널리 알려진 분류를 따른 것이라 자료마다 다를 수 있습니다.',
    ],
  },
];

/** 원소 관계별 설명 */
export const FORTUNE_COMPATIBILITY_ELEMENT_RELATION_GUIDE: Readonly<
  Record<
    FortuneCompatibilityElementRelationKeyType,
    FortuneCompatibilityRelationGuideType
  >
> = {
  sameElement: {
    heading: '같은 원소',
    paragraph:
      '같은 원소에 속한 별자리끼리의 관계입니다. 기질과 반응하는 방식이 닮아 말하지 않아도 통하는 부분이 많다고 전해지며, 이 서비스에서는 잘 맞는 편으로 봅니다.',
  },
  complement: {
    heading: '보완',
    paragraph:
      '불과 공기, 흙과 물처럼 서로의 부족한 부분을 채워 준다고 알려진 원소의 관계입니다. 이 서비스에서는 잘 맞는 편으로 봅니다.',
  },
  opposite: {
    heading: '대립',
    paragraph:
      '불과 물, 공기와 흙처럼 성향이 크게 다르다고 알려진 원소의 관계입니다. 다른 점을 알아 두면 오히려 서로에게서 배울 수 있어 조율이 필요한 편으로 봅니다.',
  },
  other: {
    heading: '그 밖의 관계',
    paragraph:
      '불과 흙, 공기와 물처럼 위의 세 가지에 해당하지 않는 원소의 관계입니다. 특별히 이끌리거나 부딪히는 관계로 분류되지 않아 무난한 편으로 봅니다.',
  },
};

/** 등급 규칙 h2와 설명 단락(띠, 별자리 공통 틀). 표의 행은 화면이 등급·관계 상수에서 만든다 */
export const FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING = '등급 규칙';

export const FORTUNE_COMPATIBILITY_TTI_GRADE_RULE_PARAGRAPHS: readonly string[] =
  [
    '등급은 이 서비스가 직접 정한 규칙이며, 두 사람의 관계가 좋은지 나쁜지를 가르는 기준이 아닙니다. 육합, 삼합, 방합은 잘 맞는 편, 충과 원진은 조율이 필요한 편, 같은 띠와 그 밖의 관계는 무난한 편으로 나눕니다.',
    '띠 관계표는 여러 명리 자료가 공통으로 쓰는 표를 바탕으로 했습니다. 원진은 자료마다 해당하는 띠가 조금 다르므로, 다른 자료와 결과가 다를 수 있습니다.',
  ];

export const FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_RULE_PARAGRAPHS: readonly string[] =
  [
    '등급은 이 서비스가 직접 정한 규칙이며, 두 사람의 관계가 좋은지 나쁜지를 가르는 기준이 아닙니다. 같은 원소와 보완은 잘 맞는 편, 대립은 조율이 필요한 편, 그 밖의 관계는 무난한 편으로 나눕니다.',
    '별자리의 원소 구분은 널리 알려진 표를 따랐고, 보완과 대립 관계는 대중에게 알려진 분류를 바탕으로 했습니다. 자료마다 기준이 달라 다른 곳의 결과와 다를 수 있습니다.',
  ];

/** 표 caption(화면 읽기 전용) */
export const FORTUNE_COMPATIBILITY_TABLE_CAPTIONS = {
  tti: '띠 관계별 등급',
  starSign: '원소 관계별 등급',
  element: '원소별 별자리',
} as const;
