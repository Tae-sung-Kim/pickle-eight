import {
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_BIRTH,
} from '@/features/fortune/constants/fortune-input.constant';
import type { FortuneBirthErrorType } from '@/features/fortune/types/fortune.type';

/**
 * 고정 문구 모음 (합니다체).
 * plan 고지 1~17, 로또 연결 문구, ui-ux-design.md "승인됨" 문구를 그대로 옮겼다.
 * 고지 문구를 바꿀 때는 사용자 승인을 받는다. 문구 작성 단계(C)에서는 고치지 않는다.
 * 예외: 이 파일의 FORTUNE_BIRTH_ERROR_MESSAGES(before-min, after-max, future,
 * lunar-no-leap, out-of-table), FORTUNE_SUPPORTED_RANGE_NOTICE,
 * FORTUNE_LEAP_MONTH_HINT_TEMPLATE 세 상수만 C-3d가 다듬는다(현재는 초안).
 * 상담전화 5곳과 결과 하단 위기 안내 문장은 공용 `@/constants/crisis-phone.constant`에 있다.
 * "보장", "예측" 단어는 부정 고지문까지 쓰지 않는다(plan 결정 8).
 */

/** 지원 출생 범위의 날짜 표기. 연도는 지원 범위 상수에서 만든다(손으로 쓰지 않는다) */
const formatYmd = (ymd: {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}): string => `${ymd.year}년 ${ymd.month}월 ${ymd.day}일`;

const MIN_BIRTH_TEXT = formatYmd(FORTUNE_MIN_BIRTH);
const MAX_BIRTH_TEXT = formatYmd(FORTUNE_MAX_BIRTH);

// 사주 괄호 설명(방식 A·B 안내와 방식 구분 설명이 이 상수를 이어 붙여 쓴다)
export const FORTUNE_SAJU_GLOSS = '사주(태어난 연·월·일·시로 세우는 네 기둥)';

// 1 상시 면책 (모든 운세 페이지 h1 바로 아래, 허브 포함)
export const FORTUNE_DISCLAIMER_TEXT =
  '본 운세 서비스는 오락 및 엔터테인먼트 목적으로 제공되며, 전문적인 법률·의학·재정적 조언을 대신할 수 없습니다.';

// 2 결과 하단
export const FORTUNE_RESULT_DISCLAIMER_TEXT =
  '운세는 오락과 참고를 위한 콘텐츠이며, 결과는 앞날을 알려 주거나 어떤 결과를 약속하지 않습니다. 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있으며, 건강·법률·투자 등 중요한 결정은 전문가와 상담하시기 바랍니다.';

// 3 방식 A 안내 (본문, 띠 변형, 별자리 변형)
export const FORTUNE_METHOD_A_NOTICE = `이 결과는 생년월일과 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, ${FORTUNE_SAJU_GLOSS}를 계산한 결과가 아닙니다.`;
export const FORTUNE_METHOD_A_TTI_NOTICE = `이 결과는 띠와 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, ${FORTUNE_SAJU_GLOSS}를 계산한 결과가 아닙니다. 같은 띠에는 같은 내용이 표시됩니다.`;
export const FORTUNE_METHOD_A_STAR_SIGN_NOTICE = `이 결과는 별자리와 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, ${FORTUNE_SAJU_GLOSS}를 계산한 결과가 아닙니다. 같은 별자리에는 같은 내용이 표시됩니다.`;

// 4 방식 B 안내 (2단계 사주 결과 근처)
export const FORTUNE_METHOD_B_NOTICE = `만세력으로 구한 ${FORTUNE_SAJU_GLOSS}와 오늘의 일진을 비교해 서비스가 정한 해석 규칙으로 보여 드립니다. 해석은 학파와 서비스마다 다를 수 있습니다.`;

// 5 점수 안내
export const FORTUNE_SCORE_NOTICE =
  '점수는 서비스가 정한 규칙으로 만든 수치이며 정확도를 뜻하지 않습니다.';

// 6, 7 입력 영역 안내 (패널 바로 위)
export const FORTUNE_PRIVACY_INPUT_NOTICE =
  '입력하신 생년월일과 태어난 시간은 서버로 전송되거나 저장되지 않습니다. 이 화면을 벗어나면 사라집니다.';
export const FORTUNE_AGE_INPUT_NOTICE =
  '운세는 만 14세 이상 이용자를 대상으로 합니다. 운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.';

// 8 이용 동의 화면 (보관 안내는 ui-ux-design.md 수정본)
export const FORTUNE_CONSENT_TEXTS = {
  title: '이용 전 확인해 주세요',
  intro:
    '운세를 이용하시려면 아래 세 가지를 직접 확인해 주시기 바랍니다. 세 가지를 모두 확인하셔야 이용하실 수 있으며, 확인은 이용자의 선택에 따라 진행됩니다.',
  /** 체크 항목 묶음의 sr-only legend (ui-ux-design.md 이용 동의 화면 명세) */
  fieldsetLegend: '이용 전 확인 항목 세 가지',
  items: [
    '만 14세 이상입니다.',
    '운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택에 대한 책임은 이용자 본인에게 있음을 확인합니다.',
    '입력한 생년월일은 서버로 전송되거나 저장되지 않고 이 브라우저의 메모리에서만 사용됨을 확인합니다.',
  ],
  storageNotice:
    '동의 여부와 동의한 안내문의 버전, 동의 시각만 이 탭에 저장되며, 탭을 닫으면 지워집니다. 생년월일은 저장되지 않습니다. 저장된 동의는 하단의 동의 다시 설정에서 지울 수 있습니다.',
  blockedNotice: '세 가지를 모두 확인해 주셔야 이용하실 수 있습니다.',
  grantButton: '동의하고 시작',
  declineButton: '동의하지 않음',
} as const;

// 동의 다시 설정 (ui-ux-design.md 승인 문구)
export const FORTUNE_CONSENT_RESET_TEXTS = {
  button: '동의 다시 설정',
  description:
    '이 탭에 저장된 이용 동의를 지우고 이용 전 확인 화면으로 돌아갑니다.',
} as const;

// 9 이용 불가 안내 화면
export const FORTUNE_DECLINED_TEXTS = {
  title: '운세를 이용하실 수 없습니다',
  body: '이용 안내에 동의하지 않으셔서 운세를 보여 드릴 수 없습니다. 이 서비스는 만 14세 이상 이용자가 오락과 참고를 위해 이용하도록 만들어졌습니다. 마음이 바뀌시면 이용 전 확인 화면으로 돌아가실 수 있습니다.',
  backButton: '이용 전 확인 화면으로 돌아가기',
} as const;

// 10 연령 안내 화면
export const FORTUNE_AGE_BLOCKED_TEXTS = {
  title: '연령 안내',
  body: '입력하신 생년월일을 기준으로 만 14세 미만으로 확인되어 운세를 보여 드릴 수 없습니다. 이 서비스는 만 14세 이상 이용자를 대상으로 합니다. 운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다. 입력하신 내용은 저장되거나 전송되지 않습니다.',
  homeLinkLabel: '홈으로',
} as const;

// 11~15 계산 기준·시각 모름·설날 병기·표준시
export const FORTUNE_CALC_BASIS_TTI =
  '이 서비스는 입춘 시각을 기준으로 띠를 나눕니다. 설날을 기준으로 하면 1월 하순~2월 중순에 태어난 분의 띠가 다를 수 있습니다.';
export const FORTUNE_CALC_BASIS_STAR_SIGN =
  '별자리는 태양의 위치로 정해져 해마다 바뀌는 날이 하루 정도 달라집니다. 별자리가 바뀌는 날에 태어난 분은 태어난 시각으로 판정합니다.';
export const FORTUNE_TIME_UNKNOWN_NOTICE =
  '태어난 시각을 모르시면 두 가지 결과를 모두 확인해 보시기 바랍니다.';
/** {띠}는 띠 이름(예: 뱀띠)으로 바꿔 쓴다 */
export const FORTUNE_SEOLLAL_TEMPLATE =
  '설날을 기준으로 하면 {띠}로 보기도 합니다.';
/** 2단계(사주) 해당 출생 연도에 쓴다 */
export const FORTUNE_DST_NOTICE =
  '출생 당시의 표준시와 서머타임 적용에 따라 태어난 시간의 계산 결과가 다를 수 있습니다.';

// 지원 출생 연도 안내 (D14, 초안: C-3d 다듬음, U-2 승인 대기). 한 문장. 연도는 지원 범위 상수에서 만든다
export const FORTUNE_SUPPORTED_RANGE_NOTICE = `계산에 쓰는 절기 자료가 제공되는 기간에 맞춰 생년월일은 ${MIN_BIRTH_TEXT}부터 ${MAX_BIRTH_TEXT}까지 입력하실 수 있습니다.`;

// 윤달 있는 달 안내 (초안: C-3d 다듬음, U-2 승인 대기). {연도}, {월}을 숫자로 바꿔 쓴다
export const FORTUNE_LEAP_MONTH_HINT_TEMPLATE =
  '음력 {연도}년 {월}월에는 윤달이 있습니다. 윤달에 태어나셨다면 윤달을 선택해 주시기 바랍니다.';

// 16 상세 이용 안내 (페이지 하단)
export const FORTUNE_DETAIL_NOTICE_TITLE = '이용 안내';
export const FORTUNE_DETAIL_NOTICE_ITEMS: readonly string[] = [
  '본 서비스는 오락과 참고 목적으로 제공됩니다.',
  '운세는 과학적으로 입증된 것이 아니며, 앞날을 알려 주거나 어떤 결과를 약속하지 않습니다.',
  '운세 결과는 참고용이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.',
  '건강, 법률, 투자, 심리 위기와 관련된 문제는 해당 분야 전문가와 상담하시기 바랍니다.',
  '운세 결과만으로 중요한 결정을 내리지 않으시기 바랍니다.',
  '본 서비스는 특정 운세 서비스나 역술인과 제휴·후원 관계가 없습니다.',
  '운세의 계산과 해석 기준은 학파와 서비스마다 다릅니다. 본 서비스의 기준은 계산 기준 안내에서 확인하실 수 있습니다.',
  '입력하신 생년월일과 태어난 시간은 서버로 전송되거나 저장되지 않습니다.',
  '본 서비스는 만 14세 이상 이용자를 대상으로 하며, 이용 전에 이용 조건을 확인하는 절차가 있습니다. 생년월일을 입력했을 때 만 14세 미만으로 확인되면 이용하실 수 없습니다.',
];

// 로또 연결 (고지는 접거나 숨기지 않는다. "당첨"은 이 문구에서만 허용. 문구 변경은 사용자 승인)
export const FORTUNE_LOTTO_NOTICE =
  '행운 숫자는 재미를 위한 오락용 표시이며, 로또 추첨 결과나 당첨 확률과 관계가 없습니다. 번호 생성기는 운세와 상관없이 번호를 무작위로 만듭니다. 복권은 만 19세 이상만 구매할 수 있으며, 무리하지 않는 범위에서 즐기시기 바랍니다.';
export const FORTUNE_LOTTO_LINK_LABEL = '로또 번호 생성기 (무작위 생성)';
export const FORTUNE_LOTTO_LINK_HREF = '/lotto/generator';

// 기준 차이 안내 (AC-19). 띠별·별자리별 운세 결과 안
export const FORTUNE_DIFFERENT_BASIS_NOTICE =
  '띠별 운세는 같은 띠에게 같은 내용을 보여 드리며, 생년월일로 보는 오늘의 운세와 기준이 달라 점수와 문구가 다를 수 있습니다.';
export const FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE =
  '별자리 운세는 같은 별자리에게 같은 내용을 보여 드리며, 생년월일로 보는 오늘의 운세와 기준이 달라 점수와 문구가 다를 수 있습니다.';

// 찾기 결과 아래 안내: 생년월일은 찾는 데만 쓰인다 (fortune-v2 F-3, F-4)
export const FORTUNE_FINDER_BASIS_NOTICE =
  '생년월일은 내 띠를 찾는 데 쓰이며, 띠별 운세 문구는 누구에게나 같습니다.';
export const FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE =
  '생년월일은 내 별자리를 찾는 데 쓰이며, 별자리별 운세 문구는 누구에게나 같습니다.';

// 띠·별자리 → 오늘의 운세 링크 라벨 (D12)
export const FORTUNE_TODAY_LINK_LABEL = '생년월일로 보는 오늘의 운세';

// noscript 안내 (AC-72)
export const FORTUNE_NOSCRIPT_NOTICE =
  '운세 이용에는 JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다.';

export const FORTUNE_KST_LABEL = '한국 시간 기준';

// 입력 오류 문구. 입력값은 문구에 넣지 않는다. 범위 문장은 지원 범위 상수에서 만든다.
// before-min, after-max, lunar-no-leap, out-of-table, future는 초안(C-3d가 확정, U-2 승인)
const BIRTH_RANGE_ERROR = `${MIN_BIRTH_TEXT}부터 ${MAX_BIRTH_TEXT} 사이의 생년월일만 입력하실 수 있습니다.`;

export const FORTUNE_BIRTH_ERROR_MESSAGES: Record<
  FortuneBirthErrorType,
  string
> = {
  empty: '출생 연도, 월, 일을 모두 입력해 주시기 바랍니다.',
  'invalid-date':
    '달력에 없는 날짜입니다. 월과 일을 다시 확인해 주시기 바랍니다.',
  'before-min': BIRTH_RANGE_ERROR,
  'after-max': BIRTH_RANGE_ERROR,
  future: '오늘(한국 시간) 이후의 날짜는 입력하실 수 없습니다.',
  'lunar-no-leap':
    '입력하신 해의 그 달에는 윤달이 없습니다. 윤달 선택을 해제하거나 날짜를 다시 확인해 주시기 바랍니다.',
  'lunar-invalid-day':
    '음력으로 그 달에 없는 날입니다. 일을 다시 확인해 주시기 바랍니다.',
  'out-of-table':
    '이 날짜는 계산할 수 없습니다. 날짜를 다시 확인해 주시기 바랍니다.',
};
