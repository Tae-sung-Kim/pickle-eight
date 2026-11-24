/**
 * 궁합 메뉴·목록·흐름 짧은 문구 초안(합니다체). 승인 전에는 화면에 연결하지 않는다.
 * ui-ux-design.md "문구" 표의 초안과 design.md 5.6 값을 따른다.
 */

/** MENU_LIST 운세 그룹 항목 값 (주소는 FORTUNE_COMPATIBILITY_ROUTES.hub) */
export const FORTUNE_COMPATIBILITY_MENU_TEXTS = {
  label: '궁합 테스트',
  description: '두 사람의 생년월일로 띠 궁합과 별자리 궁합 보기.',
  example: '예: 두 사람의 띠가 서로 어떤 관계인지 확인',
} as const;

/** 허브 목록 */
export const FORTUNE_COMPATIBILITY_HUB_LIST_TEXTS = {
  heading: '궁합 고르기',
  ttiDescription: '두 사람의 띠가 서로 어떤 관계인지 살펴봅니다.',
  starSignDescription: '두 사람의 별자리를 네 원소로 비교해 봅니다.',
} as const;

/** 첫 번째 사람 확인 줄. {이름}은 판정된 띠·별자리 이름(예: 용띠). 생년월일은 보이지 않는다 */
export const FORTUNE_COMPATIBILITY_FIRST_PERSON_LINE_TEMPLATE =
  '첫 번째 사람: {이름}';

/**
 * 시각 모름 안내 줄의 새 문장. 기존 시각 모름 안내(FORTUNE_TIME_UNKNOWN_NOTICE) 뒤에 붙인다.
 * {사람}은 "첫 번째 사람" 또는 "두 번째 사람", {이름}은 후보로 정한 띠·별자리 이름.
 * 이름이 모두 "띠"나 "자리"로 끝나 조사 "로"가 항상 맞다.
 */
export const FORTUNE_COMPATIBILITY_TIME_UNKNOWN_LINE_TEMPLATE =
  '{사람}은 {이름}로 보고 있습니다.';

export const FORTUNE_COMPATIBILITY_PERSON_LABELS = {
  first: '첫 번째 사람',
  second: '두 번째 사람',
} as const;

/** OG 이미지 tag. 허브는 메뉴 라벨이 자동으로 쓰인다(design.md 5.6) */
export const FORTUNE_COMPATIBILITY_OG_TAGS = {
  tti: '띠 궁합',
  starSign: '별자리 궁합',
} as const;
