import { MEAL_AREA_MAX_LENGTH } from '@/features/meal/constants/meal-area.constant';
import type { MealWeatherTagType } from '@/features/meal/types/meal.type';

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
  '결과는 무작위로 정해지며, 날씨 반영을 켜면 날씨에 따라 뽑힐 확률이 조금 달라집니다. 특정 메뉴나 식당을 평가하지 않습니다.';

/** 보상 없음 고지 (U5 승인 문구, 무작위 고지 바로 다음 줄) */
export const MEAL_NO_REWARD_NOTICE_TEXT =
  '룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다.';

/** 외부 링크 안내 (지도 링크 바로 아래) */
export const MEAL_EXTERNAL_LINK_NOTICE_TEXT =
  '지도 검색 페이지는 카카오·네이버·구글이 각각 운영하는 외부 사이트이며 새 탭에서 열립니다. 이동 후에는 해당 사이트의 정책이 적용되고, 검색어로는 뽑힌 메뉴 이름과 적은 경우 동네 이름만 전달됩니다. 검색 결과와 영업 정보는 해당 서비스 기준입니다.';

/** 결과 하단 짧은 고지 (결과 카드 맨 아래) */
export const MEAL_RESULT_NOTICE_TEXT =
  '이 결과는 날씨에 따라 확률이 조금 달라지는 오락 목적의 무작위 뽑기이며, 특정 메뉴나 식당을 평가하지 않습니다.';

// --- 머리 영역 ---
export const MEAL_PAGE_DESCRIPTION =
  '돌림판을 돌려 오늘의 점심, 저녁, 아침 메뉴를 뽑아 봅니다.';
export const MEAL_INTRO_TEXT =
  '점심, 저녁, 아침·브런치 메뉴가 고민될 때 돌림판으로 오늘의 메뉴를 하나 뽑아 보는 서비스입니다. 끼니를 하나 고르고 카테고리와 국물 조건을 정하면 그 끼니의 메뉴 가운데 직전에 뽑힌 메뉴를 제외한 나머지 가운데 무작위로 정해지며, 날씨 반영을 켜면 날씨에 따라 확률이 조금 달라집니다. 뽑힌 메뉴는 지도에서 바로 찾아볼 수 있습니다.';
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
/** "내 지역" 두 입력(시·도, 동네 이름) 공통 한 줄 안내. 두 입력이 aria-describedby로 함께 가리킨다 */
export const MEAL_REGION_TITLE = '내 지역';
export const MEAL_REGION_NOTICE_TEXT =
  '시·도는 날씨 조회에만 쓰이고, 동네 이름은 서버로 보내거나 저장하지 않습니다. 위치 권한은 요청하지 않습니다. 상세 주소나 전화번호는 적지 마세요.';
export const MEAL_AREA_NOTICE_LINES = [MEAL_REGION_NOTICE_TEXT] as const;
export const MEAL_AREA_PREVIEW_LABEL = '지도 검색어';
export const MEAL_AREA_RESULT_NOTICE_TEXT =
  '적은 동네 이름은 저장하지 않으며, 지도 링크를 누를 때만 검색어로 해당 지도 사이트에 전달됩니다.';

// --- 날씨 (meal-weather) ---
export const MEAL_WEATHER_REGION_LABEL = '날씨 지역';
export const MEAL_WEATHER_REGION_PLACEHOLDER = '시·도 선택';
export const MEAL_WEATHER_REGION_NONE_LABEL = '선택 안 함';
export const MEAL_WEATHER_SWITCH_LABEL = '날씨 반영';
export const MEAL_WEATHER_SWITCH_ON_TEXT = '켜짐';
export const MEAL_WEATHER_SWITCH_OFF_TEXT = '꺼짐';
export const MEAL_WEATHER_SWITCH_HELP_HEADING =
  '날씨 반영, 확률이 어떻게 달라지나요?';
/** 첫 줄은 안내 1(항상 보임), 둘째 줄은 안내 2 본문(접힘) */
export const MEAL_WEATHER_NOTICE_LINES = [
  MEAL_REGION_NOTICE_TEXT,
  '날씨 반영을 켜면 날씨에 어울리는 메뉴가 뽑힐 확률이 조금 높아집니다. 결과는 여전히 무작위입니다.',
] as const;

/** 날씨 한 줄 완성 문장. 메뉴 이름을 넣지 않는다 */
export const MEAL_WEATHER_LINES: Readonly<Record<MealWeatherTagType, string>> =
  {
    snow: '오늘은 눈이 와요. 눈 오는 날 메뉴가 조금 더 잘 뽑히게 돌렸어요. 결과는 여전히 무작위예요.',
    rain: '오늘은 비가 와요. 비 오는 날 메뉴가 조금 더 잘 뽑히게 돌렸어요. 결과는 여전히 무작위예요.',
    hot: '오늘은 더워요. 더운 날 메뉴가 조금 더 잘 뽑히게 돌렸어요. 결과는 여전히 무작위예요.',
    cold: '오늘은 추워요. 추운 날 메뉴가 조금 더 잘 뽑히게 돌렸어요. 결과는 여전히 무작위예요.',
  };

export function getMealWeatherLine(condition: MealWeatherTagType): string {
  return MEAL_WEATHER_LINES[condition];
}

/** 기온 줄. 최저·최고가 둘 다 있을 때만 범위를 내고, 현재는 따로 붙인다. 모두 없으면 null. spoken은 스크린리더용 */
export function getMealTemperatureText(t: {
  readonly minCelsius: number | null;
  readonly maxCelsius: number | null;
  readonly currentCelsius: number | null;
}): { visible: string; spoken: string } | null {
  const { minCelsius: lo, maxCelsius: hi, currentCelsius: now } = t;
  const visible: string[] = [];
  const spoken: string[] = [];
  if (lo !== null && hi !== null) {
    visible.push(`오늘 ${lo}° ~ ${hi}°`);
    spoken.push(`오늘 기온 ${lo}도에서 ${hi}도`);
  }
  if (now !== null) {
    visible.push(`현재 ${now}°`);
    spoken.push(`현재 ${now}도`);
  }
  return visible.length === 0
    ? null
    : { visible: visible.join(' · '), spoken: spoken.join(', ') };
}

/** 기상청 홈페이지(날씨누리). source-check.md 결정 (b) */
export const MEAL_WEATHER_SOURCE_URL = 'https://www.weather.go.kr/w/index.do';
/** 공공누리 제1유형 출처 표시. 작성연도는 확인 전이라 뺐다(copy-log.md) */
export const MEAL_WEATHER_SOURCE_TEXT = `날씨 정보: 기상청 단기예보(공공데이터포털, 공공누리 제1유형). 기상청 홈페이지: ${MEAL_WEATHER_SOURCE_URL}`;
export const MEAL_WEATHER_ACCURACY_TEXT = '날씨는 실제와 다를 수 있습니다.';
export const MEAL_WEATHER_UNAVAILABLE_TEXT =
  '날씨 정보를 가져오지 못해 날씨 없이 뽑았어요.';

// --- noscript ---
export const MEAL_NOSCRIPT_TEXT =
  '끼니 선택과 돌림판은 JavaScript가 켜져 있어야 동작합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다. 소개와 자주 묻는 질문은 그대로 읽으실 수 있습니다.';
