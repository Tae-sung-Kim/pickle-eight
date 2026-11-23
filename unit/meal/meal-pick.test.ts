import { describe, expect, test } from 'vitest';
import { MEAL_LUCK_LINES } from '@/features/meal/constants/meal-luck.constant';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import type {
  MealCategoryKeyType,
  MealMenuType,
} from '@/features/meal/types/meal.type';
import {
  carryOverMealCategories,
  filterMealMenus,
  pickMealLuckLine,
  pickMealMenu,
  toggleMealCategory,
} from '@/features/meal/utils/meal-pick.util';

const STANDARD: MealCategoryKeyType[] = [
  'korean',
  'chinese',
  'japanese',
  'western',
  'bunsik',
  'world',
];
const BREAKFAST: MealCategoryKeyType[] = [
  'korean',
  'porridge',
  'bread',
  'sandwich',
  'brunch',
  'quick',
];

describe('carryOverMealCategories', () => {
  test('점심 → 저녁: 선택이 유지되고 칩 순서로 정렬된다', () => {
    expect(carryOverMealCategories(['world', 'korean'], 'dinner')).toEqual([
      'korean',
      'world',
    ]);
    expect(carryOverMealCategories(STANDARD, 'dinner')).toEqual(STANDARD);
  });

  test('점심 → 아침: 선택이 모두 아침에 있을 때만 유지(한식만), 아니면 아침 전체', () => {
    expect(carryOverMealCategories(['korean'], 'breakfast')).toEqual([
      'korean',
    ]);
    expect(carryOverMealCategories(['korean', 'chinese'], 'breakfast')).toEqual(
      BREAKFAST
    );
    expect(carryOverMealCategories(STANDARD, 'breakfast')).toEqual(BREAKFAST);
  });

  test('점심(한식 없음) → 아침: 아침 전체', () => {
    expect(
      carryOverMealCategories(['chinese', 'western'], 'breakfast')
    ).toEqual(BREAKFAST);
  });

  test('AC-38: 야식은 자동으로 켜지지 않고 점심·아침으로 가면 사라진다', () => {
    const ALL7: MealCategoryKeyType[] = [...STANDARD, 'lateNight'];
    expect(carryOverMealCategories(['korean', 'world'], 'dinner')).toEqual([
      'korean',
      'world',
    ]);
    expect(carryOverMealCategories(ALL7, 'lunch')).toEqual(STANDARD);
    expect(carryOverMealCategories(['korean', 'lateNight'], 'lunch')).toEqual(
      STANDARD
    );
    expect(carryOverMealCategories(['lateNight'], 'lunch')).toEqual(STANDARD);
    expect(carryOverMealCategories(['lateNight'], 'breakfast')).toEqual(
      BREAKFAST
    );
    expect(
      carryOverMealCategories(['korean', 'lateNight'], 'breakfast')
    ).toEqual(BREAKFAST);
    expect(carryOverMealCategories(['porridge'], 'dinner')).toEqual(STANDARD);
    expect(carryOverMealCategories(['korean', 'bread'], 'dinner')).toEqual(
      STANDARD
    );
    expect(carryOverMealCategories([], 'dinner')).toEqual(STANDARD);
    for (const meal of ['lunch', 'breakfast'] as const) {
      for (const sel of [ALL7, ['lateNight'], []] as MealCategoryKeyType[][]) {
        expect(carryOverMealCategories(sel, meal)).not.toContain('lateNight');
      }
    }
  });

  test('0개 → 새 끼니 전체', () => {
    expect(carryOverMealCategories([], 'lunch')).toEqual(STANDARD);
    expect(carryOverMealCategories([], 'breakfast')).toEqual(BREAKFAST);
  });
});

describe('pickMealLuckLine', () => {
  test('해당 끼니·카테고리 목록에서만 고른다', () => {
    for (const meal of ['lunch', 'dinner', 'breakfast'] as const) {
      const byCategory: Readonly<Record<string, readonly string[]>> =
        MEAL_LUCK_LINES[meal];
      for (const [category, lines] of Object.entries(byCategory)) {
        for (let i = 0; i < lines.length; i++) {
          expect(
            pickMealLuckLine(meal, category as MealCategoryKeyType, () => i),
            `${meal} ${category}`
          ).toBe(lines[i]);
        }
      }
    }
  });

  test('AC-39: 야식 운세는 저녁에만 있다', () => {
    const lines = MEAL_LUCK_LINES.dinner.lateNight;
    expect(lines).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(pickMealLuckLine('dinner', 'lateNight', () => i)).toBe(lines[i]);
    }
    expect(pickMealLuckLine('lunch', 'lateNight', () => 0)).toBe('');
    expect(pickMealLuckLine('breakfast', 'lateNight', () => 0)).toBe('');
  });

  test('끼니에 없는 카테고리면 빈 문자열', () => {
    expect(pickMealLuckLine('breakfast', 'chinese', () => 0)).toBe('');
  });
});

describe('filterMealMenus / pickMealMenu', () => {
  const lunch: readonly MealMenuType[] = MEAL_MENUS.lunch;

  test('카테고리와 국물은 AND, 원래 순서 유지', () => {
    const r = filterMealMenus(lunch, { categories: ['korean'], broth: 'soup' });
    expect(r.length).toBeGreaterThan(0);
    expect(r).toEqual(
      lunch.filter((m) => m.category === 'korean' && m.broth === 'soup')
    );
    expect(filterMealMenus(lunch, { categories: [], broth: 'all' })).toEqual(
      lunch
    );
    expect(
      filterMealMenus(lunch, { categories: [], broth: 'all' })
    ).toHaveLength(lunch.length);
    expect(filterMealMenus(lunch, { categories: [], broth: 'soup' })).toEqual(
      lunch.filter((m) => m.broth === 'soup')
    );
    expect(
      filterMealMenus(MEAL_MENUS.breakfast, { categories: [], broth: 'all' })
    ).toHaveLength(MEAL_MENUS.breakfast.length);
    const dinner = filterMealMenus(MEAL_MENUS.dinner, {
      categories: [],
      broth: 'all',
    });
    expect(dinner).toHaveLength(
      MEAL_MENUS.dinner.filter((m) => m.category !== 'lateNight').length
    );
    expect(dinner.filter((m) => m.category === 'lateNight')).toHaveLength(0);
    expect(
      filterMealMenus(lunch, { categories: STANDARD, broth: 'all' })
    ).toHaveLength(lunch.length);
  });

  test('후보가 비면 null', () => {
    expect(pickMealMenu([], null)).toBeNull();
  });

  test('직전 메뉴를 빼고 뽑는다 (후보 2개 이상)', () => {
    const two = lunch.slice(0, 2);
    expect(pickMealMenu(two, two[0].id, () => 0)?.id).toBe(two[1].id);
  });

  test('후보가 1개면 직전 메뉴여도 뽑는다', () => {
    const one = lunch.slice(0, 1);
    expect(pickMealMenu(one, one[0].id, () => 0)?.id).toBe(one[0].id);
  });

  test('직전이 없으면 전체에서 뽑는다', () => {
    const three = lunch.slice(0, 3);
    expect(pickMealMenu(three, null, () => 2)?.id).toBe(three[2].id);
  });
});

describe('toggleMealCategory', () => {
  test('야식을 켜면 야식만 남는다', () => {
    expect(
      toggleMealCategory(['korean', 'world'], 'lateNight', 'dinner')
    ).toEqual(['lateNight']);
  });

  test('야식 상태에서 다른 칩을 누르면 그 칩만 남는다', () => {
    expect(toggleMealCategory(['lateNight'], 'korean', 'dinner')).toEqual([
      'korean',
    ]);
  });

  test('야식을 끄면 빈 선택', () => {
    expect(toggleMealCategory(['lateNight'], 'lateNight', 'dinner')).toEqual(
      []
    );
  });

  test('일반 칩끼리는 칩 순서를 유지한다', () => {
    expect(
      toggleMealCategory(['world', 'korean'], 'chinese', 'dinner')
    ).toEqual(['korean', 'chinese', 'world']);
    expect(
      toggleMealCategory(['korean', 'chinese'], 'korean', 'dinner')
    ).toEqual(['chinese']);
  });
});
