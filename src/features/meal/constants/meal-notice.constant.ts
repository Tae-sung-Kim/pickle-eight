import { MEAL_AREA_MAX_LENGTH } from '@/features/meal/constants/meal-area.constant';

/**
 * 화면 문구(확정). ui-ux-design.md 7장 문구 표를 그대로 옮겼다.
 * "보장", "추천"이 들어간 고지 5문장은 meal-copy-rule의 허용 문장이다.
 */

// --- 고지 5문장 (허용 문장) ---
/** 상시 오락 고지 (h1 바로 아래) */
export const MEAL_DISCLAIMER_TEXT =
  '본 서비스는 오락 목적으로 제공되며, 메뉴 선택 결과나 식당의 영업 여부를 보장하지 않습니다.';

/** 무작위 고지 (룰렛 영역 아래) */
export const MEAL_RANDOM_NOTICE_TEXT =
  '결과는 무작위로 정해지며, 특정 메뉴나 식당을 추천하거나 평가하지 않습니다.';

/** 보상 없음 고지 (U5 승인 문구, 무작위 고지 바로 다음 줄) */
export const MEAL_NO_REWARD_NOTICE_TEXT =
  '룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다.';

/** 외부 링크 안내 (지도 링크 바로 아래) */
export const MEAL_EXTERNAL_LINK_NOTICE_TEXT =
  '지도 검색 페이지는 카카오·네이버·구글이 각각 운영하는 외부 사이트이며 새 탭에서 열립니다. 이동 후에는 해당 사이트의 정책이 적용되고, 검색어로는 뽑힌 메뉴 이름과 적은 경우 동네 이름만 전달됩니다. 검색 결과와 영업 정보는 해당 서비스 기준입니다.';

/** 결과 하단 짧은 고지 (결과 카드 맨 아래) */
export const MEAL_RESULT_NOTICE_TEXT =
  '이 결과는 오락 목적의 무작위 뽑기이며, 특정 메뉴나 식당을 추천하거나 평가하지 않습니다.';

// --- 머리 영역 ---
export const MEAL_PAGE_DESCRIPTION =
  '돌림판을 돌려 오늘의 점심, 저녁, 아침 메뉴를 뽑아 봅니다.';
export const MEAL_INTRO_TEXT =
  '점심, 저녁, 아침·브런치 메뉴가 고민될 때 돌림판으로 오늘의 메뉴를 하나 뽑아 보는 서비스입니다. 끼니를 하나 고르고 카테고리와 국물 조건을 정하면 그 끼니의 메뉴 가운데 직전에 뽑힌 메뉴를 제외한 나머지가 같은 확률로 정해지고, 뽑힌 메뉴는 지도에서 바로 찾아볼 수 있습니다.';
export const MEAL_STEPS_TITLE = '이렇게 이용합니다';
export const MEAL_STEPS = [
  '끼니를 고릅니다.',
  '카테고리와 국물 조건을 고릅니다.',
  '룰렛 돌리기를 누릅니다.',
  '뽑힌 메뉴를 지도에서 찾아봅니다.',
] as const;

// --- 끼니 선택 ---
export const MEAL_PICKER_GROUP_LABEL = '끼니';

// --- 필터 ---
export const MEAL_CATEGORY_GROUP_LABEL = '카테고리';
export const MEAL_BROTH_GROUP_LABEL = '국물';
export const MEAL_BROTH_OPTION_LABELS = {
  all: '상관없음',
  soup: '국물 있음',
  dry: '국물 없음',
} as const;
export const MEAL_CANDIDATE_COUNT_TEMPLATE = '후보 메뉴 {n}개';

// --- 빈 상태 ---
export const MEAL_EMPTY_NO_CANDIDATE_TEXT =
  '조건에 맞는 메뉴가 없습니다. 국물 조건을 바꾸거나 카테고리를 더 고르세요.';

// --- 버튼 라벨 ---
export const MEAL_SPIN_BUTTON_LABEL = '룰렛 돌리기';
export const MEAL_RESPIN_BUTTON_LABEL = '다시 뽑기';
export const MEAL_CLEAR_BROTH_BUTTON_LABEL = '국물 조건 없애기';

// --- 결과 ---
export const MEAL_PLACEHOLDER_IDLE_TEXT =
  '룰렛을 돌리면 오늘의 메뉴가 이곳에 나옵니다.';
export const MEAL_PLACEHOLDER_SPINNING_TEXT = '룰렛이 도는 중입니다.';

/** 결과 알림(sr-only) 문장 */
export function getMealResultAnnouncement(
  menuName: string,
  categoryLabel: string
): string {
  return `뽑힌 메뉴는 ${menuName}(${categoryLabel})입니다.`;
}

/** 끼니 변경 알림(sr-only) 문장. ARC-1 확정 */
export function getMealChangeAnnouncement(mealLabel: string): string {
  return `${mealLabel} 메뉴로 바꿨어요.`;
}

// --- 지도 ---
export const MEAL_MAP_LINKS_TITLE = '지도에서 찾아보기';

// --- 동네 입력 ---
export const MEAL_AREA_INPUT_LABEL = '동네 이름 (선택)';
export const MEAL_AREA_INPUT_PLACEHOLDER = '예: 강남역, 역삼동';
export const MEAL_AREA_CLEAR_BUTTON_LABEL = '동네 이름 지우기';
export const MEAL_AREA_ERROR_TEXT = {
  invalidChar:
    '한글, 영문, 숫자, 띄어쓰기, 가운뎃점(·), 하이픈(-)만 쓸 수 있습니다. 이 입력은 검색어에 넣지 않습니다.',
  tooManyDigits:
    '전화번호나 상세 번지처럼 보이는 숫자는 적을 수 없습니다. 이 입력은 검색어에 넣지 않습니다.',
  tooLong: `동네 이름은 ${MEAL_AREA_MAX_LENGTH}자까지 적을 수 있습니다. 이 입력은 검색어에 넣지 않습니다.`,
} as const;
export const MEAL_AREA_NOTICE_LINES = [
  '동네 이름은 적지 않아도 됩니다. 적으면 뽑힌 메뉴 이름과 함께 지도 검색어로 쓰입니다.',
  '적은 내용은 이 화면에만 있고 서버로 보내거나 저장하지 않으며, 새로고침하면 사라집니다.',
  '지도 링크를 누르면 검색어(동네 이름과 메뉴 이름)가 해당 지도 사이트로 전달되고, 그 뒤에는 그 사이트의 약관과 개인정보처리방침이 적용됩니다.',
  '상세 주소, 건물 번호, 전화번호 같은 개인 정보는 적지 마세요.',
  '위치 권한은 요청하지 않습니다. 지도 결과가 적은 동네 안의 가게인지는 확인하지 않으며, 결과는 지도 사이트가 정합니다.',
] as const;
export const MEAL_AREA_PREVIEW_LABEL = '지도 검색어';
export const MEAL_AREA_RESULT_NOTICE_TEXT =
  '적은 동네 이름은 저장하지 않으며, 지도 링크를 누를 때만 검색어로 해당 지도 사이트에 전달됩니다.';

// --- noscript ---
export const MEAL_NOSCRIPT_TEXT =
  '끼니 선택과 돌림판은 JavaScript가 켜져 있어야 동작합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다. 소개와 자주 묻는 질문은 그대로 읽으실 수 있습니다.';
