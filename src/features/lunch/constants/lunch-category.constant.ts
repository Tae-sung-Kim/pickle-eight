import type { LunchCategoryType } from '@/features/lunch/types/lunch.type';

/** 카테고리 6개. 배열 순서가 칩 순서다 */
export const LUNCH_CATEGORIES = [
  { key: 'korean', label: '한식' },
  { key: 'chinese', label: '중식' },
  { key: 'japanese', label: '일식' },
  { key: 'western', label: '양식' },
  { key: 'bunsik', label: '분식' },
  { key: 'world', label: '세계·기타' },
] as const satisfies readonly LunchCategoryType[];
