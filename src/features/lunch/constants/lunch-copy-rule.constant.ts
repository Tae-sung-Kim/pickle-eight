import {
  LUNCH_DISCLAIMER_TEXT,
  LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
  LUNCH_NO_REWARD_NOTICE_TEXT,
  LUNCH_RANDOM_NOTICE_TEXT,
  LUNCH_RESULT_NOTICE_TEXT,
} from '@/features/lunch/constants/lunch-notice.constant';

/**
 * 표현 규칙 검사 전용 목록 (QA의 e2e 검사에서 쓴다).
 * 화면 코드는 이 파일을 import하지 않는다(번들에 들어가지 않게).
 */

/** 금지 표현(부분 일치) */
export const LUNCH_FORBIDDEN_TERMS: readonly string[] = [
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
];

/** 미래·결과를 확정하는 어미 패턴 */
export const LUNCH_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /게 됩니다/,
  /게 될 것입니다/,
  /될 겁니다/,
];

/**
 * 예외로 허용하는 고지 문장. 검사 전 대상 문자열에서 이 문장을 먼저 지운 뒤 찾는다.
 * 고지 5문장만 넣는다. 임의로 늘리지 않는다.
 */
export const LUNCH_COPY_ALLOWED_SENTENCES: readonly string[] = [
  LUNCH_DISCLAIMER_TEXT,
  LUNCH_RANDOM_NOTICE_TEXT,
  LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
  LUNCH_RESULT_NOTICE_TEXT,
  LUNCH_NO_REWARD_NOTICE_TEXT,
];
