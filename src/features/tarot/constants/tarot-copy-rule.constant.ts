import {
  TAROT_DETAIL_NOTICE_ITEMS,
  TAROT_RESULT_DISCLAIMER_TEXT,
} from '@/features/tarot/constants/tarot-notice.constant';

/**
 * 표현 규칙 검사 전용 목록 (QA의 e2e/tarot-copy.spec.ts에서 쓴다).
 * 화면 코드는 이 파일을 import하지 않는다(번들에 들어가지 않게).
 */

/** 금지 표현(부분 일치). 면책 영역의 부정 고지 문장만 TAROT_COPY_ALLOWED_SENTENCES로 예외를 둔다 */
export const TAROT_FORBIDDEN_TERMS: readonly string[] = [
  '100%',
  '적중',
  '정확히 맞',
  '백발백중',
  '족집게',
  '무조건',
  '반드시',
  '확실히',
  '보장',
  '틀림없',
  '운명이 바뀐',
  '인생이 바뀐',
  '운명을 바꿔',
  '대박',
  '합격합니다',
  '헤어집니다',
  '성공합니다',
];

/** 미래를 확정하는 어미 패턴 */
export const TAROT_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /게 됩니다/,
  /게 될 거예요/,
  /게 될 것입니다/,
];

/** 상표성 명칭. 대소문자를 구분하지 않고 찾는다 */
export const TAROT_TRADEMARK_TERMS: readonly string[] = [
  'Rider-Waite',
  'Rider Waite',
  '라이더-웨이트',
  '라이더 웨이트',
  '웨이트',
];

/**
 * 예외로 허용하는 부정 고지 문장. 검사 전 대상 문자열에서 이 문장을 먼저 지운 뒤 찾는다.
 * 문장은 tarot-notice.constant.ts의 면책 문구에서만 가져온다.
 */
export const TAROT_COPY_ALLOWED_SENTENCES: readonly string[] = [
  TAROT_RESULT_DISCLAIMER_TEXT,
  TAROT_DETAIL_NOTICE_ITEMS[1],
];
