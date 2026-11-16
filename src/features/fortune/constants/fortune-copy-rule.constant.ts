import {
  FORTUNE_LOTTO_NOTICE,
  FORTUNE_METHOD_A_NOTICE,
  FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
  FORTUNE_METHOD_A_TTI_NOTICE,
  FORTUNE_SAJU_GLOSS,
} from '@/features/fortune/constants/fortune-notice.constant';

/**
 * 표현 규칙 검사 전용 목록 (QA의 e2e/fortune-copy.spec.ts에서 쓴다).
 * 화면 코드는 이 파일을 import하지 않는다(번들에 들어가지 않게).
 * 단어 "사주" 하나만으로 된 항목은 금지 목록에 넣지 않는다(위치 규칙은 아래 화이트리스트로 검사한다).
 */

/** 금지 표현(부분 일치, plan "금지 표현 목록"). 공백을 뺀 변형도 함께 둔다 */
export const FORTUNE_FORBIDDEN_TERMS: readonly string[] = [
  // 과장·확정
  '100%',
  '적중',
  '정확히 맞',
  '백발백중',
  '족집게',
  '무조건',
  '반드시',
  '확실히',
  '보장',
  '예측',
  '틀림없',
  '운명이 바뀐',
  '인생이 바뀐',
  '운명을 바꿔',
  '대박',
  '합격합니다',
  '헤어집니다',
  '성공합니다',
  // 로또·복권 ("당첨" 단독은 FORTUNE_LOTTO_NOTICE 문장 안에서만 허용)
  '당첨',
  '확률 100%',
  '예상 번호',
  '필승',
  '1등 번호',
  '로또 예측',
  '로또 대박',
  '로또 번호 추천',
  '오늘의 로또 번호',
  '복권 운',
  '구매하세요',
  '사세요',
  // 책임 과장
  '책임을 지지 않',
  '일절 책임',
  '모든 책임',
  '법적 책임이 없',
  '책임 없음',
  '동의로 책임이 면제',
  // 사주 오인(구 단위만. 단어 "사주"는 금지가 아니다)
  '사주 분석',
  '사주분석',
  '사주 풀이',
  '사주풀이',
  '정통',
  '정확한 맞춤',
  '맞춤 풀이',
  '전문가 수준',
  'AI 분석',
  'AI가',
  // 재물·투자
  '투자하세요',
  '주식',
  '코인',
  '비트코인',
  '매수',
  '대출',
  '부동산',
  '횡재',
  '벼락부자',
  // 건강
  '병에 걸',
  '수술',
  '사망',
  '죽음',
  // 불안 유발
  '재앙',
  '액운',
  '저주',
  '파산',
  '불행',
  '사고가 나',
  '사고를 당',
  // 타 서비스·상표
  '점신',
  '포스텔러',
  '토정비결',
];

/** 미래를 확정하는 어미 패턴 */
export const FORTUNE_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /게 됩니다/,
  /게 될 거예요/,
  /게 될 것입니다/,
];

/** 건강 문구(`health` 풀) 전용 병명·증상·약 목록(초안). 사용자가 추가·삭제할 수 있다 */
export const FORTUNE_HEALTH_TERMS: readonly string[] = [
  '감기',
  '두통',
  '암',
  '우울증',
  '불면증',
  '고혈압',
  '당뇨',
  '약을',
  '복용',
  '처방',
  '진통제',
  '영양제',
  '수술',
];

/** "사주"와 "네 기둥"을 겹쳐 쓴 표현. 모든 화면 문구·메타데이터에 없어야 한다(AC-52) */
export const FORTUNE_SAJU_REDUNDANT_TERMS: readonly string[] = [
  '사주 네 기둥',
  '사주 4기둥',
  '사주 네기둥',
  '사주4기둥',
];

/** 내부 용어. 화면 문구·메타데이터·서버 HTML에 없어야 한다(코드 주석·변수명은 대상 아님) */
export const FORTUNE_INTERNAL_PILLAR_TERMS: readonly string[] = [
  '4기둥',
  '3기둥',
];

/**
 * 예외로 허용하는 문장. 검사 전 대상 문자열에서 이 문장을 먼저 지운 뒤 찾는다.
 * 허용 예외는 로또 고지의 "당첨"뿐이다(방식 A 안내는 예외가 아니다).
 * 사주(2단계) 항목의 예외는 사주 페이지를 만들 때 더한다.
 */
export const FORTUNE_COPY_ALLOWED_SENTENCES: readonly string[] = [
  FORTUNE_LOTTO_NOTICE,
];

/**
 * 방식 A 화면(허브, 오늘의 운세, 띠, 별자리)에서 "사주"가 들어가도 되는 문장 화이트리스트.
 * 방식 A 안내 3문장(notice 상수와 같은 문장)과 허브 방식 구분 설명 문장(ui-ux-design.md 허브 설명 단락 2의
 * 첫 문장, FORTUNE_HUB_GUIDE와 같은 문장), 오늘의 운세 FAQ 방식 구분 문장(U-2 승인, 첫 언급에
 * 괄호 설명이 붙는다)만 등록돼 있다. 사용자 승인 문구를 넣을 때만 늘린다.
 * 검사를 통과시키려고 임의로 늘리지 않는다.
 */
export const FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A: readonly string[] = [
  FORTUNE_METHOD_A_NOTICE,
  FORTUNE_METHOD_A_TTI_NOTICE,
  FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
  // W1 허브 가이드 단락 2 첫 문장 (SJ-G3 승인)
  `오늘의 운세, 띠별 운세, 별자리 운세는 서비스가 정한 규칙에 따라 미리 작성해 둔 문구를 고르는 방식이며, ${FORTUNE_SAJU_GLOSS}를 계산하는 방식과는 다릅니다.`,
  // W2 허브 가이드 사주 소개 첫 문장
  `${FORTUNE_SAJU_GLOSS}는 만세력으로 연·월·일·시 기둥과 오행 분포를 계산하고, 내 일간(태어난 날의 천간)과 오늘 일진(오늘 날짜의 천간)을 비교한 오늘의 사주 운세를 보여 드립니다.`,
  // W3 허브 가이드 사주 소개 둘째 문장
  '태어난 시간을 모르셔도 시주 없이 보실 수 있고, 23시대 출생 처리 같은 계산 기준은 사주 페이지에서 확인하실 수 있습니다.',
  // W4 허브 FAQ 7번 질문(안 A, 괄호 설명 없이 "사주"로 시작하는 V8.3 규칙 4의 예외 1건)
  '사주는 다른 운세와 무엇이 다른가요?',
  // W5 허브 FAQ 7번 답 첫 문장
  `${FORTUNE_SAJU_GLOSS}는 만세력으로 연·월·일·시 기둥을 실제로 계산하고, 내 일간(태어난 날의 천간)과 오늘 일진(오늘 날짜의 천간)을 비교해 결과를 보여 드립니다.`,
  // 오늘의 운세 FAQ 방식 구분 문장(유지)
  `${FORTUNE_SAJU_GLOSS}를 계산해 해석하는 방식과는 다릅니다.`,
];

/** 사주 페이지 전용 추가 금지 표현(설계 V10.2). 기존 금지 목록과 함께 적용한다 */
export const FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS: readonly string[] = [
  '정확한',
  'AI',
  '정자시',
  'same-day',
  'next-day',
  '평생 운을 알려',
];
