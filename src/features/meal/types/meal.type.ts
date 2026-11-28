import type { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';

export type MealKeyType = 'lunch' | 'dinner' | 'breakfast';

export type MealWeatherRegionKeyType =
  (typeof MEAL_WEATHER_REGIONS)[number]['key'];

export type MealType = Readonly<{
  key: MealKeyType;
  /** 화면 이름: '점심' | '저녁' | '아침·브런치' */
  label: string;
  /** 운세 라벨: '오늘의 점심운' | '오늘의 저녁운' | '오늘의 아침운' */
  luckLabel: string;
}>;

/** 점심 카테고리 6개. 저녁은 이 6개에 야식을 더한다 */
export type MealStandardCategoryKeyType =
  | 'korean' // 한식
  | 'chinese' // 중식
  | 'japanese' // 일식
  | 'western' // 양식
  | 'bunsik' // 분식
  | 'world'; // 세계·기타

/** 저녁 카테고리 7개 = 점심 6개 + 야식 */
export type MealDinnerCategoryKeyType =
  | MealStandardCategoryKeyType
  | 'lateNight'; // 야식

/** 아침·브런치 카테고리 */
export type MealBreakfastCategoryKeyType =
  | 'korean' // 한식
  | 'porridge' // 죽·수프
  | 'bread' // 빵·토스트
  | 'sandwich' // 샌드위치
  | 'brunch' // 브런치 요리
  | 'quick'; // 간편식

export type MealCategoryKeyType =
  | MealStandardCategoryKeyType
  | MealDinnerCategoryKeyType
  | MealBreakfastCategoryKeyType;

/** 끼니 → 그 끼니의 카테고리 키 (타입 전용) */
export type MealCategoryKeyByMealType = {
  lunch: MealStandardCategoryKeyType;
  dinner: MealDinnerCategoryKeyType;
  breakfast: MealBreakfastCategoryKeyType;
};

export type MealCategoryType<
  K extends MealCategoryKeyType = MealCategoryKeyType,
> = Readonly<{
  key: K;
  /** 화면 이름. 예: '한식', '세계·기타' */
  label: string;
}>;

/** 메뉴 속성. 'soup': 국물 있음, 'dry': 국물 없음 */
export type MealBrothType = 'soup' | 'dry';

/** 필터 값. 'all'은 국물 조건 없음 */
export type MealBrothFilterType = 'all' | MealBrothType;

export type MealMenuType<K extends MealCategoryKeyType = MealCategoryKeyType> =
  Readonly<{
    /** 끼니 안에서 유일. 소문자 영문·하이픈. React key와 직전 메뉴 비교에만 쓰고 화면·URL에 쓰지 않는다 */
    id: string;
    /** 화면 표시 이름. 일반 음식 이름만. 예: '김치찌개' */
    name: string;
    category: K;
    broth: MealBrothType;
    /** 지도 검색어. 없으면 name을 쓴다. 넣을 때는 name을 그대로 포함해야 한다 */
    mapQuery?: string;
  }>;

export type MealFilterType = Readonly<{
  categories: readonly MealCategoryKeyType[];
  broth: MealBrothFilterType;
}>;

export type MealMapProviderKeyType = 'kakao' | 'naver' | 'google';

export type MealMapLinkType = Readonly<{
  provider: MealMapProviderKeyType;
  /** 링크 이름. 예: '카카오맵에서 찾아보기' */
  label: string;
  href: string;
}>;

/** 동네 이름 입력 검사 오류 이유 */
export type MealAreaInputErrorType =
  | 'invalid_char'
  | 'too_long'
  | 'too_many_digits';

/** 동네 이름 입력 검사 결과. valid의 value는 정리된 문자열 */
export type MealAreaInputResultType =
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'valid'; value: string }>
  | Readonly<{ status: 'invalid'; reason: MealAreaInputErrorType }>;

export type MealFaqItemType = Readonly<{ question: string; answer: string }>;

/** 태그가 붙는 날씨 4종 */
export type MealWeatherTagType = 'snow' | 'rain' | 'hot' | 'cold';
/** 분류 결과. normal은 태그 없음 */
export type MealWeatherConditionType = MealWeatherTagType | 'normal';

/** 분류 입력. 기상청 응답을 변환한 값 */
export type MealWeatherObservationType = Readonly<{
  precipitationCodes: readonly number[]; // PTY 값들
  hasSnowfall: boolean; // SNO > 0
  maxCelsius: number | null; // TMX (실황 대체 시 T1H)
  minCelsius: number | null; // TMN (실황 대체 시 T1H)
}>;

/** GET /api/meal/weather 200 응답 */
export type MealWeatherResponseType = Readonly<{
  condition: MealWeatherConditionType;
  forecastDate: string; // 'YYYY-MM-DD', 한국 시간 기준 대상 날짜. 지금은 화면에서 쓰지 않는다
  minCelsius: number | null; // 오늘 TMN 반올림 정수. 단기예보 없으면 null
  maxCelsius: number | null; // 오늘 TMX 반올림 정수. 단기예보 없으면 null
  currentCelsius: number | null; // 실황 T1H 반올림 정수. 실황 없으면 null
}>;

/** 뽑기 시점의 날씨 상태. 회전 상태에 함께 저장한다 */
export type MealWeatherSnapshotType =
  | Readonly<{ status: 'off' }> // 지역 미선택 또는 스위치 꺼짐
  | Readonly<{ status: 'unavailable' }> // 지역 선택 + 켜짐, 그러나 조회 중·실패
  | Readonly<{
      status: 'ready';
      condition: MealWeatherConditionType;
      forecastDate: string;
      minCelsius: number | null;
      maxCelsius: number | null;
      currentCelsius: number | null;
    }>;
