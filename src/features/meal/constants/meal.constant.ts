import type { MealKeyType, MealType } from '@/features/meal/types/meal.type';

/** 끼니 3개. 배열 순서가 선택지 순서다 */
export const MEAL_LIST = [
  { key: 'lunch', label: '점심', luckLabel: '오늘의 점심운' },
  { key: 'dinner', label: '저녁', luckLabel: '오늘의 저녁운' },
  { key: 'breakfast', label: '아침·브런치', luckLabel: '오늘의 아침운' },
] as const satisfies readonly MealType[];

/** 처음 열었을 때 선택된 끼니 */
export const MEAL_DEFAULT_KEY: MealKeyType = 'lunch';
