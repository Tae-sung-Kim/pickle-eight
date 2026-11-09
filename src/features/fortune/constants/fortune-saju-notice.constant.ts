import type { FortuneTenGodKeyType } from '@/features/fortune/types/fortune-saju.type';

/**
 * 사주 화면 전용 문장(design-saju-v2 V10.1). 기존 fortune-notice.constant.ts는 고치지 않고 import만 쓴다.
 * TODO(SJ-C3): 값은 SJ-C3 초안이다(사용자 검수 대기). SJ-G2 승인 전에는 출시하지 않고, 승인 뒤 이 TODO를 지운다.
 * 'same-day'·'next-day'·"정자시"는 이 파일에 쓰지 않는다.
 */

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_CALC_BASIS_PILLARS =
  '연주(태어난 해의 기둥)는 입춘 시각, 월주(태어난 달의 기둥)는 절기(입춘·경칩 등 달이 바뀌는 기준이 되는 날)가 드는 시각을 기준으로 나눕니다. 입춘이나 절기가 드는 날에 태어나셨는데 태어난 시간을 모르시면 두 경우를 함께 보여 드립니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_CALC_BASIS_DAY_HOUR =
  '일주(태어난 날의 기둥)는 한국 시간 자정에 바뀝니다. 시주(태어난 시간의 기둥)는 시계 시각으로 정하며 23:00부터 00:59까지를 자시로 봅니다. 23:00~23:59(야자시)에 태어나셨다면 일주는 태어난 날 그대로 두고, 시주의 천간만 다음 날 일주의 천간을 기준으로 구합니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_CALC_BASIS_SCHOOLS =
  '23시대 출생을 처리하는 방식은 학설이 갈립니다. 23시에 일주를 다음 날로 바꾸는 방식(자시 통합)을 쓰는 만세력도 있지만 이 서비스는 그 방식을 쓰지 않으므로, 23시대에 태어나신 분은 다른 만세력과 일주나 시주가 다를 수 있습니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_CALC_BASIS_ZI_START =
  '이 서비스는 자시를 시계 시각 23:00부터 봅니다. 23:30부터 보는 만세력도 있어, 시주가 바뀌는 시각의 앞뒤 30분 안에 태어나신 분은 결과가 다를 수 있습니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2. 연도 숫자는 FORTUNE_SAJU_DST_NOTICE_YEARS와 일치해야 한다
export const FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION =
  '태어난 곳의 경도(동서 위치), 출생 당시의 표준시와 서머타임은 보정하지 않고 입력하신 시각 그대로 계산합니다. 1948~1961년과 1987~1988년에 태어나신 분께는 결과 화면에서 한 번 더 안내합니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_CALC_BASIS_STATEMENT =
  '계산과 해석의 기준은 학파마다 다르며, 위 내용은 이 서비스의 기준입니다.';

// 초안(SJ-C3, 사용자 검수 SJ-G2 대기). 기준 설계 V3.2
export const FORTUNE_SAJU_TIME_UNKNOWN_NOTICE =
  '태어난 시간을 모르시면 시주 없이 연·월·일 기둥만 보여 드립니다. 오늘의 사주 운세는 태어난 날의 천간(일간)으로 정하므로 시간을 모르셔도 볼 수 있습니다.';

/**
 * 십신 한 줄 설명 10개(합니다체). 초안(SJ-C1), 사용자 검수(SJ-G1) 전. 작성 이력은 docs/fortune/copy-log.md
 */
export const FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS: Record<
  FortuneTenGodKeyType,
  string
> = {
  bigyeon:
    '오늘 일진의 천간이 내 일간과 오행과 음양이 모두 같은 날로, 내 방식과 속도를 돌아보는 분위기를 나타냅니다.',
  geopjae:
    '오늘 일진의 천간이 내 일간과 오행은 같고 음양이 다른 날로, 나와 닮은 상대와 나누고 견주는 분위기를 나타냅니다.',
  siksin:
    '오늘 일진의 천간이 내 일간이 생하는 오행이고 음양이 같은 날로, 여유롭게 표현하고 즐기는 분위기를 나타냅니다.',
  sanggwan:
    '오늘 일진의 천간이 내 일간이 생하는 오행이고 음양이 다른 날로, 재치 있게 표현하고 틀을 벗어나 보는 분위기를 나타냅니다.',
  pyeonjae:
    '오늘 일진의 천간이 내 일간이 극하는 오행이고 음양이 같은 날로, 활동 범위를 넓히고 사람과 기회가 오가는 분위기를 나타냅니다.',
  jeongjae:
    '오늘 일진의 천간이 내 일간이 극하는 오행이고 음양이 다른 날로, 꾸준히 관리하고 차분히 정돈하는 분위기를 나타냅니다.',
  pyeongwan:
    '오늘 일진의 천간이 내 일간을 극하는 오행이고 음양이 같은 날로, 긴장 속에 책임을 맡고 단련하는 분위기를 나타냅니다.',
  jeonggwan:
    '오늘 일진의 천간이 내 일간을 극하는 오행이고 음양이 다른 날로, 질서와 약속을 지키며 신뢰를 쌓는 분위기를 나타냅니다.',
  pyeonin:
    '오늘 일진의 천간이 내 일간을 생하는 오행이고 음양이 같은 날로, 새롭고 색다른 배움에 마음이 가는 분위기를 나타냅니다.',
  jeongin:
    '오늘 일진의 천간이 내 일간을 생하는 오행이고 음양이 다른 날로, 차근차근 배우고 돌보며 안정을 찾는 분위기를 나타냅니다.',
};

/**
 * 패널 문구(설계 V10.1, 보완 메모 N1 세 키 포함).
 * N1 키 이름: summaryTemplate(입력 요약 줄), calcBasisLinkLabel(계산 기준 보기 링크), dateSubmitLabel(생년월일 확인 버튼).
 * 초안(SJ-C3, SJ-G2 대기). 시간 폼 texts 값은 UI 절 0.3 기준
 */
export const FORTUNE_SAJU_PANEL_TEXTS = {
  // N1
  summaryTemplate: '양력 {연}년 {월}월 {일}일 기준',
  calcBasisLinkLabel: '계산 기준 보기',
  dateSubmitLabel: '생년월일 확인',
  // 패널 제목
  dateTitle: '생년월일 입력',
  timeTitle: '태어난 시간',
  pillarsTitle: '연·월·일·시 기둥',
  elementsTitle: '오행 분포',
  // 시간 폼 texts(V4.3, UI 절 0.3)
  timeFormTitle: '태어난 시간',
  timeFormSubmit: '사주 보기',
  timeFormUnknown: '시간 모름',
  // 표 글자
  dayStemLabel: '일간',
  stemRowLabel: '천간',
  branchRowLabel: '지지',
  hourUnknownCell: '시간 모름',
  pillarYearLabel: '연주',
  pillarMonthLabel: '월주',
  pillarDayLabel: '일주',
  pillarHourLabel: '시주',
  // 오늘 일진·십신 비교
  todayPillarLabel: '오늘 일진(오늘 날짜의 천간)',
  myDayStemLabel: '내 일간(태어난 날의 천간)',
  tenGodLabel: '십신(오늘 일진과 내 일간의 관계)',
  // 결과 공지(sr)
  resultAnnouncement: '연·월·일·시 기둥과 오늘의 결과가 표시되었습니다.',
} as const;

// 초안(SJ-C3, SJ-G2 대기). 기준 설계 V10.1
export const FORTUNE_SAJU_TIME_QUESTION_TEXT =
  "시주(태어난 시간의 기둥)를 구하려면 태어난 시간이 필요합니다. 모르시면 '시간 모름'을 고르셔도 연·월·일 기둥과 오늘의 사주 운세를 보실 수 있습니다.";

/** `{절기}`, `{기둥}`(연주와 월주 / 월주)을 바꿔 쓴다. 초안(SJ-C3, SJ-G2 대기). 기준 설계 V10.1 */
export const FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE =
  '이 날은 절기 {절기}에 드는 날이라 태어난 시간을 모르면 {기둥}를 하나로 정할 수 없습니다. 두 경우를 함께 보여 드립니다.';

/** `{간지}`를 바꿔 쓴다. 초안(SJ-C3, SJ-G2 대기). 기준 설계 V10.1 */
export const FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES = {
  year: '연주 {간지}로 보기',
  month: '월주 {간지}로 보기',
} as const;

// 초안(SJ-C3, SJ-G2 대기). 기준 설계 V10.1(S2-5)
export const FORTUNE_SAJU_ELEMENTS_NOTE =
  '오행(목·화·토·금·수 다섯 가지 기운)은 글자마다 하나씩 정해져 있으며, 이 표는 위 표에 보이는 글자의 오행 개수를 센 것입니다. 좋고 나쁨을 뜻하지 않습니다.';

/** 짝수 인덱스 절기 이름 12개. 배열 순서 = 소한(0), 입춘(2) … 대설(22) */
export const FORTUNE_SAJU_SOLAR_TERM_NAMES = [
  '소한',
  '입춘',
  '경칩',
  '청명',
  '입하',
  '망종',
  '소서',
  '입추',
  '백로',
  '한로',
  '입동',
  '대설',
] as const;
