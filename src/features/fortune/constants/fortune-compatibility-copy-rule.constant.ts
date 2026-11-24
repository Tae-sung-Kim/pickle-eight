/**
 * 궁합 표현 규칙 검사 전용 목록. 화면 코드는 이 파일을 import하지 않는다.
 * 기존 FORTUNE_FORBIDDEN_TERMS, FORTUNE_FORBIDDEN_PATTERNS도 궁합 문구에 그대로 적용한다.
 */

/** 궁합 추가 금지 표현(부분 일치) */
export const FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS: readonly string[] = [
  '결혼',
  '임신',
  '이별',
  '이혼',
  '바람',
  '운명의 상대',
  '천생연분',
  '100%',
];

/** 메타 전용 금지어(title, description, keywords 등에 쓰지 않는다) */
export const FORTUNE_COMPATIBILITY_META_FORBIDDEN_TERMS: readonly string[] = [
  '연애 궁합',
  '이름 궁합',
  '혈액형 궁합',
  'MBTI 궁합',
];
