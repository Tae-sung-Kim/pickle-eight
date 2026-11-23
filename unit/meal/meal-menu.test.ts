import { describe, expect, test } from 'vitest';
import {
  MEAL_CATEGORIES,
  MEAL_DEFAULT_CATEGORIES,
} from '@/features/meal/constants/meal-category.constant';
import { MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES } from '@/features/meal/constants/meal-copy-rule.constant';
import {
  MEAL_MENU_COUNTS,
  MEAL_MENUS,
} from '@/features/meal/constants/meal-menu.constant';
import type { MealKeyType } from '@/features/meal/types/meal.type';
import { filterMealMenus } from '@/features/meal/utils/meal-pick.util';

const MEALS: readonly MealKeyType[] = ['lunch', 'dinner', 'breakfast'];

// 점심 국물 메뉴 (경계 메뉴 포함)
const EXPECTED_LUNCH_SOUP = new Set([
  '김치찌개',
  '된장찌개',
  '순대국',
  '설렁탕',
  '칼국수',
  '냉면',
  '짬뽕',
  '마라탕',
  '누룽지탕',
  '라멘',
  '우동',
  '어묵',
  '쌀국수',
  '샤브샤브',
  '똠얌꿍',
  '곰탕',
  '육개장',
  '삼계탕',
]);

// 끼니별 카테고리 칩 순서의 메뉴 수와 국물 수 (D4 확정 값)
const EXPECTED = {
  lunch: { total: 54, perCategory: [14, 6, 10, 8, 6, 10], soup: 18 },
  dinner: { total: 106, perCategory: [18, 11, 10, 8, 9, 10, 40], soup: 26 },
  breakfast: { total: 44, perCategory: [8, 6, 8, 6, 7, 9], soup: 7 },
} as const;

const CATEGORY_COUNT = { lunch: 6, dinner: 7, breakfast: 6 } as const;

// 저녁 야식 26개 (돌림판 칸 순서). 앞 14개는 다른 카테고리에서 옮겨 온 메뉴
const LATE_NIGHT_NAMES = [
  '족발',
  '보쌈',
  '곱창',
  '막창',
  '닭발',
  '삼겹살구이',
  '골뱅이무침',
  '오돌뼈',
  '파전',
  '닭갈비',
  '찜닭',
  '쭈꾸미볶음',
  '튀김',
  '치킨',
  '양념치킨',
  '후라이드치킨',
  '닭강정',
  '감자탕',
  '순대볶음',
  '닭똥집볶음',
  '오징어볶음',
  '감자튀김',
  '먹태구이',
  '두부김치',
  '닭꼬치',
  '김치전',
  '라면',
  '떡볶이',
  '라볶이',
  '순대',
  '어묵탕',
  '피자',
  '햄버거',
  '계란말이',
  '감자전',
  '부대찌개',
  '소시지구이',
  '마늘치킨',
  '불닭발',
  '핫도그',
];
const MOVED_NAMES = LATE_NIGHT_NAMES.slice(0, 14);

describe('AC-9: 끼니별 메뉴 데이터', () => {
  test.each(MEALS)(
    '%s: 개수, 카테고리 수·최소 6개, id·이름 중복 없음',
    (meal) => {
      const menus = MEAL_MENUS[meal];
      const keys = new Set<string>(MEAL_CATEGORIES[meal].map((c) => c.key));
      expect(MEAL_CATEGORIES[meal]).toHaveLength(CATEGORY_COUNT[meal]);
      expect(keys.size).toBe(CATEGORY_COUNT[meal]);
      expect(menus).toHaveLength(MEAL_MENU_COUNTS[meal]);
      expect(menus).toHaveLength(EXPECTED[meal].total);
      if (meal !== 'dinner') {
        expect(menus.length).toBeGreaterThanOrEqual(40);
        expect(menus.length).toBeLessThanOrEqual(60);
      }
      for (const key of keys) {
        const n = menus.filter((m) => m.category === key).length;
        expect(n, `${meal} ${key}`).toBeGreaterThanOrEqual(6);
      }
      for (const m of menus) {
        expect(keys.has(m.category), `${m.id} 카테고리`).toBe(true);
        expect(m.id, `${m.id} 형식`).toMatch(/^[a-z]+(-[a-z]+)*$/);
        expect(m.id.length).toBeLessThanOrEqual(40);
        expect(m.name.trim()).not.toBe('');
        if (m.mapQuery) expect(m.mapQuery).toContain(m.name);
      }
      if (meal === 'dinner') {
        expect(new Set(menus.map((m) => `${m.category}:${m.name}`)).size).toBe(
          menus.length
        );
      } else {
        expect(new Set(menus.map((m) => m.name)).size).toBe(menus.length);
      }
      expect(new Set(menus.map((m) => m.id)).size).toBe(menus.length);
    }
  );

  test.each(MEALS)('%s: 카테고리별 수와 국물 수가 확정 값과 같다', (meal) => {
    const menus = MEAL_MENUS[meal];
    const counts = MEAL_CATEGORIES[meal].map(
      (c) => menus.filter((m) => m.category === c.key).length
    );
    expect(counts).toEqual(EXPECTED[meal].perCategory);
    expect(menus.filter((m) => m.broth === 'soup')).toHaveLength(
      EXPECTED[meal].soup
    );
    expect(menus.filter((m) => m.broth === 'dry')).toHaveLength(
      EXPECTED[meal].total - EXPECTED[meal].soup
    );
  });

  test('점심 국물 경계 메뉴 일치', () => {
    const lunch = MEAL_MENUS.lunch;
    expect(
      new Set(lunch.filter((m) => m.broth === 'soup').map((m) => m.name))
    ).toEqual(EXPECTED_LUNCH_SOUP);
    const byName = (n: string) => lunch.find((m) => m.name === n)?.broth;
    expect(byName('냉면')).toBe('soup');
    expect(byName('백반')).toBe('dry');
    expect(byName('누룽지탕')).toBe('soup');
    expect(byName('소바')).toBe('dry');
    expect(byName('어묵')).toBe('soup');
  });

  test('안주 연상 메뉴 17개가 아침에 없다 (점심·저녁은 검사 대상 아님)', () => {
    expect(MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES).toHaveLength(17);
    const names = new Set<string>(MEAL_MENUS.breakfast.map((m) => m.name));
    expect(
      MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES.filter((n) => names.has(n))
    ).toEqual([]);
  });

  test('AC-36~38: 저녁 카테고리 7개 칩 순서와 기본 선택(야식 제외 6개)', () => {
    expect(MEAL_CATEGORIES.dinner.map((c) => c.key)).toEqual([
      'korean',
      'chinese',
      'japanese',
      'western',
      'bunsik',
      'world',
      'lateNight',
    ]);
    expect(MEAL_CATEGORIES.dinner.at(-1)?.label).toBe('야식');
    expect(MEAL_CATEGORIES.dinner.slice(0, 6)).toEqual(MEAL_CATEGORIES.lunch);
    expect(MEAL_DEFAULT_CATEGORIES.lunch).toEqual(MEAL_CATEGORIES.lunch);
    expect(MEAL_DEFAULT_CATEGORIES.breakfast).toEqual(
      MEAL_CATEGORIES.breakfast
    );
    expect(MEAL_DEFAULT_CATEGORIES.dinner.map((c) => c.key)).toEqual(
      MEAL_CATEGORIES.dinner.slice(0, 6).map((c) => c.key)
    );
    for (const meal of ['lunch', 'breakfast'] as const) {
      expect(
        MEAL_CATEGORIES[meal].map((c) => c.key as string),
        meal
      ).not.toContain('lateNight');
    }
  });

  test('AC-36·37: 야식 26개가 lateNight이고 옮긴 14개는 원래 카테고리에 없다', () => {
    const dinner = MEAL_MENUS.dinner;
    const late = dinner.filter((m) => m.category === 'lateNight');
    expect(late.map((m) => m.name)).toEqual(LATE_NIGHT_NAMES);
    expect(late.filter((m) => m.broth === 'soup').map((m) => m.name)).toEqual([
      '감자탕',
      '라면',
      '어묵탕',
      '부대찌개',
    ]);
    for (const name of MOVED_NAMES) {
      expect(
        dinner.filter((m) => m.name === name).map((m) => m.category),
        name
      ).toEqual(['lateNight']);
    }
    for (const meal of ['lunch', 'breakfast'] as const) {
      expect(
        MEAL_MENUS[meal].some((m) => (m.category as string) === 'lateNight')
      ).toBe(false);
    }
    const cat = new Map(
      dinner
        .filter((m) => m.category !== 'lateNight')
        .map((m) => [m.name, m.category] as const)
    );
    expect(cat.get('부대찌개')).toBe('korean');
    expect(cat.get('탕수육')).toBe('chinese');
    expect(cat.get('가라아게')).toBe('japanese');
    expect(cat.get('어묵')).toBe('bunsik');
  });

  test('AC-36·37: 저녁 후보 수는 기본 66, 야식을 켜면 92, 국물 22/23', () => {
    const base = MEAL_DEFAULT_CATEGORIES.dinner.map((c) => c.key);
    const all = MEAL_CATEGORIES.dinner.map((c) => c.key);
    const d = MEAL_MENUS.dinner;
    const n = (categories: typeof all, broth: 'all' | 'soup') =>
      filterMealMenus(d, { categories, broth });
    expect(n(base, 'all')).toHaveLength(66);
    expect(n(['lateNight'], 'all')).toHaveLength(40);
    expect(n(all, 'all')).toHaveLength(106);
    expect(n(base, 'soup')).toHaveLength(22);
    expect(n(all, 'soup')).toHaveLength(26);
    expect(n(['lateNight'], 'soup').map((m) => m.name)).toEqual([
      '감자탕',
      '라면',
      '어묵탕',
      '부대찌개',
    ]);
  });
});
