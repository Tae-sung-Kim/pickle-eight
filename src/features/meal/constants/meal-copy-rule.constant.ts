import {
  MEAL_DISCLAIMER_TEXT,
  MEAL_EXTERNAL_LINK_NOTICE_TEXT,
  MEAL_NO_REWARD_NOTICE_TEXT,
  MEAL_RANDOM_NOTICE_TEXT,
  MEAL_RESULT_NOTICE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';

/**
 * 표현 규칙 검사 전용 목록 (QA의 e2e 검사에서 쓴다).
 * 화면 코드는 이 파일을 import하지 않는다(번들에 들어가지 않게).
 */

/** 금지 표현(부분 일치) */
export const MEAL_FORBIDDEN_TERMS: readonly string[] = [
  // 단정·보장 (design 7.3)
  '반드시',
  '무조건',
  '보장',
  '확실',
  '100%',
  '대박',
  '틀림없',
  '정답',
  '예언',
  '예측',
  // 가게 추천·순위·광고처럼 읽히는 표현 (design 7.3)
  '최고',
  '맛집',
  '인기',
  '베스트',
  '1위',
  '광고',
  '추천합니다',
  '추천 메뉴',
  '추천 가게',
  '별점',
  '후기',
  '근처에서 찾기',
  // 가게 추천·순위·광고 추가
  '추천 식당',
  '추천 맛집',
  '순위',
  '랭킹',
  '평점',
  '리뷰',
  '협찬',
  '유명한',
  '가성비',
  // 메뉴 설명 (맛, 건강, 영양, 가격)
  '칼로리',
  '가격',
  '혼밥',
  '건강에',
  '다이어트',
  '영양',
  '효능',
  '맛있',
  '맛없',
  // 사행성·보상 연상
  '당첨',
  '상금',
  '복권',
  '로또',
  '베팅',
  '도박',
  '내기',
  '상품권',
  '적립',
  '쿠폰',
  // 음주 연상
  '안주',
  '한잔',
  '소주',
  '맥주',
  '해장',
  '숙취',
  '야식',
  '음주',
  // 건강·식사 상태 표현
  '든든',
  '건강한',
  '균형',
  '속 편한',
  '결식',
];

/**
 * 금지어 검사에서 예외로 허용하는 카테고리 라벨 (검사 전용).
 * '야식'은 금지어지만 저녁 카테고리 라벨 자리(칩, 결과 카드, 결과 알림 괄호)에서만 허용한다.
 * 카테고리 라벨 검사는 이 값을 건너뛰고, 결과 알림·결과 영역 텍스트는 이 라벨을 먼저 지운 뒤 검사한다.
 */
export const MEAL_ALLOWED_CATEGORY_LABELS: readonly string[] = ['야식'];

/**
 * 메뉴 이름 검사에서만 허용하는 금지어 (검사 전용).
 * '해장'은 효과를 말하는 문구에서는 금지지만, 해장국·뼈해장국처럼 실제 음식 이름은
 * 감자탕 같은 기존 메뉴와 일관되게 허용한다(사용자 결정 2026-11-23).
 * 메뉴 이름 검사는 이 값을 먼저 지운 뒤 금지어를 찾는다. 안내·FAQ·메타·운세 문구에는 쓰지 않는다.
 * 숙취·안주·한잔·소주·맥주·음주와 '술' 패턴은 메뉴 이름에도 그대로 적용한다.
 */
export const MEAL_ALLOWED_MENU_NAME_TERMS: readonly string[] = ['해장'];

/** 미래·결과를 확정하는 어미 패턴 */
export const MEAL_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /게 됩니다/,
  /게 될 것입니다/,
  /될 겁니다/,
  // "술", "술자리", "술안주"는 잡고 "기술", "예술"은 잡지 않는다
  /(?<![가-힣])술/,
];

/**
 * 아침·브런치 목록에 넣지 않는 메뉴 이름 (검사 전용).
 * 점심·저녁 목록은 검사 대상이 아니다(저녁은 안주 연상 메뉴를 빼지 않는다, 사용자 결정 2026-11-23).
 */
export const MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES: readonly string[] = [
  '탕수육',
  '깐풍기',
  '마라샹궈',
  '가라아게',
  '튀김',
  '어묵',
  '치킨',
  '족발',
  '보쌈',
  '곱창',
  '막창',
  '닭발',
  '삼겹살',
  '골뱅이',
  '오돌뼈',
  '파전',
  '부대찌개',
];

/**
 * 예외로 허용하는 고지 문장. 검사 전 대상 문자열에서 이 문장을 먼저 지운 뒤 찾는다.
 * 고지 5문장만 넣는다. 임의로 늘리지 않는다.
 */
export const MEAL_COPY_ALLOWED_SENTENCES: readonly string[] = [
  MEAL_DISCLAIMER_TEXT,
  MEAL_RANDOM_NOTICE_TEXT,
  MEAL_EXTERNAL_LINK_NOTICE_TEXT,
  MEAL_RESULT_NOTICE_TEXT,
  MEAL_NO_REWARD_NOTICE_TEXT,
];
