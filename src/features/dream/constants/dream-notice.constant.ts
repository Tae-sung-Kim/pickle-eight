/**
 * 화면 문구. "승인"은 plan 승인 원문, 나머지는 ui-ux-design.md 문구 표 초안을
 * T-12(DR-N)에서 사용자 승인으로 그대로 확정한 문구다.
 */

// --- plan 승인 원문 ---
/** 상시 면책 (h1 바로 아래) */
export const DREAM_DISCLAIMER_TEXT =
  '본 꿈 해몽 서비스는 오락과 자기 성찰을 위한 민간 풀이 콘텐츠입니다. 꿈의 내용이 현실의 일을 예측하거나 보장하지 않으며, 풀이를 근거로 중요한 결정을 내리지 않으시기 바랍니다.';

export const DREAM_BASIS_TITLE = '풀이 기준';
export const DREAM_BASIS_TEXT =
  '이 풀이는 민간에서 전해 온 해몽 관념을 바탕으로 이 서비스가 새로 작성한 문장입니다. 과학적으로 입증된 해석이 아니며, 특정 해몽서나 사이트와 제휴 관계가 없습니다.';

/** 하단 짧은 면책 */
export const DREAM_BOTTOM_NOTICE_TEXT =
  '꿈 풀이는 참고용입니다. 건강, 수면, 정신건강, 법률, 재정과 관련된 고민은 전문가와 상담하시기 바랍니다.';
export const DREAM_JUDGMENT_NOTICE_TEXT =
  '풀이를 따르는 판단과 선택은 이용자 본인의 몫입니다.';

export const DREAM_REPEAT_NOTICE_TEXT =
  '꿈이 자주 반복되어 잠이나 일상생활이 힘들다면 수면 또는 정신건강 전문가와 상담하시기 바랍니다.';
export const DREAM_DEATH_SUPPLEMENT_TEXT =
  '죽음이 나오는 꿈이 실제 죽음을 뜻하지는 않으며, 끝과 전환을 떠올리는 경우가 많다고 전해집니다.';

export const DREAM_CRISIS_INTRO_TEXT =
  '마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담 기관에 이야기해 보시기 바랍니다.';

// --- 확정(T-12, 초안 그대로 승인) ---
export const DREAM_HUB_DESCRIPTION =
  '꿈에 나온 소재를 찾아 민간에서 전해 온 풀이를 읽어 봅니다.';
export const DREAM_TOPIC_DESCRIPTION_TEMPLATE =
  '{category} 소재의 민간 풀이와 요즘 생각해 볼 점입니다.';

export const DREAM_SEARCH_LABEL = '꿈 소재 검색';
export const DREAM_SEARCH_PLACEHOLDER = '예: 돼지, 치아';
export const DREAM_SEARCH_NOTICE =
  '소재 이름만 입력해 주시기 바랍니다. 꿈 내용이나 개인적인 이야기는 적지 않으시기 바랍니다. 입력한 검색어는 서버로 보내거나 저장하지 않습니다.';
export const DREAM_SEARCH_NOSCRIPT_TEXT =
  '검색에는 JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다. 아래 카테고리 목록에서 소재를 골라 읽으실 수 있습니다.';

export const DREAM_RESULT_ALL_TEMPLATE = '전체 소재 {N}개';
export const DREAM_RESULT_QUERY_TEMPLATE = '“{query}” 검색 결과 {n}개';
export const DREAM_CATEGORY_COUNT_TEMPLATE = '{n}개';

export const DREAM_EMPTY_TITLE = '일치하는 꿈 소재가 없습니다';
export const DREAM_EMPTY_BODY =
  '소재 이름이나 비슷한 말로 다시 검색해 보시기 바랍니다. 긴 문장이나 꿈 내용 전체를 적는 검색은 지원하지 않습니다.';
export const DREAM_EMPTY_BUTTON_LABEL = '전체 목록 보기';

export const DREAM_CRISIS_PANEL_TITLE = '전해 드릴 안내가 있습니다';
export const DREAM_CRISIS_PANEL_BODY = `${DREAM_CRISIS_INTRO_TEXT} 검색 결과는 아래에서 그대로 보실 수 있습니다.`;
export const DREAM_CRISIS_PANEL_STORAGE_NOTICE =
  '입력한 검색어는 저장되거나 전송되지 않습니다.';
export const DREAM_CRISIS_CALL_LABEL = '109 전화 연결';
export const DREAM_CRISIS_OTHER_PHONES_TITLE = '다른 상담전화';

export const DREAM_BASIS_LINK_LABEL = '다른 소재 찾기';

export const DREAM_DETAIL_NOTICE_TITLE = '상세 안내';
/** 허브 상세 안내 6항. 2번 문장은 "예측", "보장"이 들어간 허용 예외 문장이다 */
export const DREAM_DETAIL_NOTICE_ITEMS = [
  '이 서비스의 꿈 해몽은 오락과 자기 성찰을 위한 읽을거리입니다.',
  '꿈의 내용이 현실의 일을 예측하거나 보장하지 않습니다.',
  '건강, 수면, 정신건강, 법률, 재정과 관련된 고민은 전문가와 상담하시기 바랍니다.',
  '풀이를 근거로 중요한 결정을 내리지 않으시기 바랍니다. 풀이를 따르는 판단과 선택은 이용자 본인의 몫입니다.',
  '풀이는 민간에서 전해 온 해몽 관념을 바탕으로 이 서비스가 새로 작성한 문장이며, 과학적으로 입증된 해석이 아닙니다.',
  '특정 해몽서나 사이트와 제휴 관계가 없습니다.',
] as const;

export const DREAM_FAQ_TITLE = '자주 묻는 질문';

export const DREAM_SECTION_TITLES = {
  folk: '민간 풀이',
  reflection: '요즘 생각해 볼 점',
  related: '관련 소재',
  faq: '자주 묻는 질문',
} as const;

export const DREAM_SOOTHING_TITLE = '불안하게 느껴지신다면';

export const DREAM_TTI_LINK_LABEL = '띠별 운세 보기';
export const DREAM_TTI_CONSENT_NOTICE =
  '운세 화면은 이용 동의 안내가 먼저 나옵니다.';

export const DREAM_CRISIS_PHONES_TITLE = '상담 안내';

export const DREAM_BACK_LINK_LABEL = '꿈 해몽으로 돌아가기';

export const DREAM_NOT_FOUND_TITLE = '찾으시는 꿈 소재가 없습니다';
export const DREAM_NOT_FOUND_DESCRIPTION =
  '주소가 바뀌었거나 없는 소재입니다. 꿈 해몽에서 소재를 다시 찾아 보시기 바랍니다.';
export const DREAM_NOT_FOUND_PRIMARY_LABEL = '꿈 소재 찾기';
export const DREAM_NOT_FOUND_SECONDARY_LABEL = '홈으로';
