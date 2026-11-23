import type {
  MealBreakfastCategoryKeyType,
  MealCategoryKeyByMealType,
  MealCategoryType,
  MealDinnerCategoryKeyType,
  MealKeyType,
  MealStandardCategoryKeyType,
} from '@/features/meal/types/meal.type';

/** 점심 카테고리 6개. 저녁 앞 6개도 같은 순서다. 배열 순서가 칩 순서다 */
export const MEAL_STANDARD_CATEGORIES = [
  { key: 'korean', label: '한식' },
  { key: 'chinese', label: '중식' },
  { key: 'japanese', label: '일식' },
  { key: 'western', label: '양식' },
  { key: 'bunsik', label: '분식' },
  { key: 'world', label: '세계·기타' },
] as const satisfies readonly MealCategoryType<MealStandardCategoryKeyType>[];

/** 저녁 카테고리 7개. 배열 순서가 칩 순서다 */
export const MEAL_DINNER_CATEGORIES = [
  ...MEAL_STANDARD_CATEGORIES,
  { key: 'lateNight', label: '야식' },
] as const satisfies readonly MealCategoryType<MealDinnerCategoryKeyType>[];

/** 아침·브런치 카테고리 6개. 배열 순서가 칩 순서다 */
export const MEAL_BREAKFAST_CATEGORIES = [
  { key: 'korean', label: '한식' },
  { key: 'porridge', label: '죽·수프' },
  { key: 'bread', label: '빵·토스트' },
  { key: 'sandwich', label: '샌드위치' },
  { key: 'brunch', label: '브런치 요리' },
  { key: 'quick', label: '간편식' },
] as const satisfies readonly MealCategoryType<MealBreakfastCategoryKeyType>[];

/** 끼니별 칩 목록. 화면 코드는 이 값만 쓴다 */
export const MEAL_CATEGORIES: {
  readonly [K in MealKeyType]: readonly MealCategoryType<
    MealCategoryKeyByMealType[K]
  >[];
} = {
  lunch: MEAL_STANDARD_CATEGORIES,
  dinner: MEAL_DINNER_CATEGORIES,
  breakfast: MEAL_BREAKFAST_CATEGORIES,
};

/**
 * 끼니별 기본 선택 카테고리. 끼니의 첫 상태와 "겹치는 칩이 없을 때"로 돌아갈 때 쓴다.
 * 저녁은 야식을 뺀 6개다(야식 칩 기본 꺼짐).
 */
export const MEAL_DEFAULT_CATEGORIES: {
  readonly [K in MealKeyType]: readonly MealCategoryType<
    MealCategoryKeyByMealType[K]
  >[];
} = {
  lunch: MEAL_STANDARD_CATEGORIES,
  dinner: MEAL_STANDARD_CATEGORIES,
  breakfast: MEAL_BREAKFAST_CATEGORIES,
};
