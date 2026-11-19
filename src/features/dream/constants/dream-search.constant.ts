/** 검색칸 최대 글자 수 */
export const DREAM_SEARCH_MAX_LENGTH = 50;

/**
 * 정규화된 검색어 끝에서 떼어 내는 접미어. 긴 것부터 비교한다.
 * 모든 항목은 공백 없는 형태다.
 */
export const DREAM_SEARCH_SUFFIXES: readonly string[] = [
  '꿈해몽',
  '꿈풀이',
  '해몽',
  '풀이',
  '꿈',
];
