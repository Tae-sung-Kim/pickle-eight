/**
 * 고정 문구 모음 (합니다체, 확정 문구).
 * 고지 문구를 바꿀 때는 사용자 승인을 받는다. 문구 작성 단계(CT)에서는 고치지 않는다.
 * 출시 전에 상담전화 다섯 번호(109, 1577-0199, 1588-9191, 1388, 1366)와 24시간 운영 여부를 다시 확인한다(plan 출시 전 확인 항목).
 */

export const TAROT_ORIENTATION_LABELS = {
  upright: '정방향',
  reversed: '역방향',
} as const;

// 상시 면책 (사용자 지정 문구, 원문 그대로. h1 바로 아래)
export const TAROT_DISCLAIMER_TEXT =
  '본 타로 서비스는 오락 및 엔터테인먼트 목적으로 제공되며, 전문적인 법률·의학·재정적 조언을 대신할 수 없습니다.';

// 결과 하단 면책
export const TAROT_RESULT_DISCLAIMER_TEXT =
  '타로는 오락과 자기 성찰을 위한 콘텐츠이며, 결과는 미래를 예측하거나 보장하지 않습니다. 건강·법률·투자 등 중요한 결정은 전문가와 상담하시기 바랍니다.';

// 위기 안내 (상시). 상담전화 목록·결과 하단 안내 첫 줄은 공용 상수(src/constants/crisis-phone.constant.ts)를 쓴다.
// 아래 두 문구는 터치 상태 링크에서만 쓴다(PC 상태 글자에는 넣지 않는다).
export const TAROT_CRISIS_PHONE_ARIA_LABEL = '자살예방 상담전화 109 전화 연결';
export const TAROT_CRISIS_OTHER_PHONES_TITLE = '다른 상담전화';
// 위기 패널 본문
export const TAROT_CRISIS_PANEL_BODY =
  '마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담전화에서 이야기를 나눠 보시기 바랍니다. 세 곳 모두 24시간 운영합니다.';

// 위기 안내 패널 (입력 감지 시)
export const TAROT_CRISIS_NOTICE_TITLE =
  '카드를 보기 전에 전해 드릴 안내가 있습니다';
export const TAROT_CRISIS_CALL_LABEL = '109 전화 연결';
export const TAROT_CRISIS_CONTINUE_LABEL = '계속 보기';
export const TAROT_CRISIS_NOTICE_SUB =
  '입력한 질문은 저장되거나 전송되지 않습니다.';

// 전문가 상담 안내 (입력 감지 시 결과에 덧붙임)
export const TAROT_EXPERT_NOTICE_TEXT =
  '건강, 법률, 투자와 관련된 고민은 전문가와 상담하시기 바랍니다. 타로 결과는 참고용입니다.';

// 질문 입력 근처 민감정보 안내 (상세 안내 7항과 같은 문구)
export const TAROT_SENSITIVE_INPUT_NOTICE =
  '입력한 질문은 서버나 이 기기에 저장되지 않습니다. 상대방 이름·연락처 같은 개인정보나 민감한 내용은 입력하지 않으시기 바랍니다.';

// 상세 안내 (페이지 하단, 제목 h2 + 글머리 8항)
export const TAROT_DETAIL_NOTICE_TITLE = '이용 안내';
export const TAROT_DETAIL_NOTICE_ITEMS = [
  '본 서비스는 오락과 자기 성찰 목적으로 제공됩니다.',
  '타로 결과는 과학적으로 입증된 것이 아니며, 미래나 결과를 예측하거나 보장하지 않습니다.',
  '건강, 법률, 투자, 심리 위기와 관련된 문제는 해당 분야 전문가와 상담하시기 바랍니다.',
  '타로 결과만으로 중요한 결정을 내리지 않으시기 바랍니다.',
  '본 서비스는 특정 타로 덱 제작사나 출판사와 제휴·후원 관계가 없습니다.',
  '카드는 무작위로 뽑히며 질문 내용과 관계가 없습니다.',
  TAROT_SENSITIVE_INPUT_NOTICE,
  '오늘의 카드는 날짜와 카드 정보만 이 기기에 저장됩니다. 다른 기기에서는 다른 카드가 나올 수 있습니다.',
] as const;

// 오늘의 카드 저장 안내 (AC-8)
export const TAROT_DAILY_STORAGE_NOTICE =
  '오늘의 카드는 이 기기에 저장됩니다(한국 시간 자정 기준). 다른 기기에서는 다른 카드가 나올 수 있습니다.';
export const TAROT_DAILY_STORAGE_FAILED_NOTICE =
  '이 브라우저에서는 오늘의 카드를 저장할 수 없습니다. 새로고침하면 다른 카드가 나올 수 있습니다.';
export const TAROT_DAILY_RESTORED_NOTICE =
  '오늘 뽑은 카드입니다. 한국 시간 자정이 지나면 새 카드를 뽑을 수 있습니다.';

// JavaScript 꺼짐 안내 (noscript)
export const TAROT_NOSCRIPT_NOTICE =
  '카드 뽑기에는 JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다.';

// 재뽑기 안내 (3장 타로, AC-13)
export const TAROT_REDRAW_NOTICE =
  '같은 질문으로 반복해서 뽑기보다 한 번의 결과를 차분히 돌아보시기 바랍니다.';

// 역방향 스위치
export const TAROT_QUESTION_LINE_PREFIX = '질문:';

export const TAROT_REVERSED_TOGGLE_LABEL = '역방향 사용';
export const TAROT_REVERSED_TOGGLE_HINT =
  '끄면 모든 카드가 정방향으로 나옵니다.';

// 버튼 라벨 (명사형)
export const TAROT_DRAW_BUTTON_LABEL = '카드 뽑기';
export const TAROT_DRAW_THREE_BUTTON_LABEL = '세 장 뽑기';
export const TAROT_REDRAW_BUTTON_LABEL = '다시 뽑기';

// 3장 타로 결과 묶음 제목 (sr-only h2)
export const TAROT_THREE_CARD_RESULT_TITLE = '세 장의 결과';

// FAQ 섹션 제목 (h2)
export const TAROT_FAQ_TITLE = '자주 묻는 질문';

// 카드 접근성 이름
export const TAROT_CARD_BACK_LABEL = '타로 카드 뒷면';

/**
 * aria-live 공지 문구 틀. revealed 상태일 때만 채운다. 질문 텍스트는 넣지 않는다.
 * 자리표시자
 * - {card}: "{이름} ({영문})"
 * - {orientation}: "정방향" | "역방향"
 * - {past}, {present}, {future}: "{이름} ({영문}) {방향}"
 */
export const TAROT_ANNOUNCE_TEMPLATES = {
  dailyDrawn: '{card}, {orientation} 카드가 나왔습니다.',
  dailyRestored: '오늘 뽑은 카드는 {card}, {orientation}입니다.',
  threeCard: '과거 {past}, 현재 {present}, 미래 {future} 카드가 나왔습니다.',
} as const;
