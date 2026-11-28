import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  MEAL_MENU_COUNTS,
  MEAL_MENUS,
} from '@/features/meal/constants/meal-menu.constant';
import { MEAL_WEATHER_TAGS } from '@/features/meal/constants/meal-weather-tag.constant';
import type { MealKeyType } from '@/features/meal/types/meal.type';

const MEALS: MealKeyType[] = ['breakfast', 'lunch', 'dinner'];
const TAGS = ['snow', 'rain', 'hot', 'cold'] as const;
const ids = (meal: MealKeyType) => MEAL_MENUS[meal].map((m) => m.id as string);

describe('아침 메뉴 보충', () => {
  it('앞 80개는 보충 전(HEAD)과 같은 순서, 마지막 2개가 보충, 총 82개', () => {
    const before = execSync(
      'git show HEAD:src/features/meal/constants/meal-menu-breakfast.constant.ts',
      { encoding: 'utf8' }
    );
    const oldIds = [...before.matchAll(/\bid: '([^']+)'/g)].map((m) => m[1]);
    const now = ids('breakfast');
    expect(oldIds).toHaveLength(80);
    expect(now).toHaveLength(82);
    expect(now.slice(0, 80)).toEqual(oldIds);
    expect(now.slice(80)).toEqual(['kalguksu', 'kimchi-jeon']);
  });
});

describe('MEAL_MENU_COUNTS', () => {
  it('실제 길이와 같고 아침 82·점심 120·저녁 180', () => {
    for (const meal of MEALS) {
      expect(MEAL_MENU_COUNTS[meal]).toBe(MEAL_MENUS[meal].length);
    }
    expect(MEAL_MENU_COUNTS).toEqual({
      breakfast: 82,
      lunch: 120,
      dinner: 180,
    });
  });
});

describe('날씨 태그 상수', () => {
  it('보통 키가 없고 끼니×날씨 12칸이 있다', () => {
    for (const meal of MEALS) {
      expect(Object.keys(MEAL_WEATHER_TAGS[meal]).sort()).toEqual(
        [...TAGS].sort()
      );
    }
  });

  for (const meal of MEALS) {
    for (const tag of TAGS) {
      it(`${meal}/${tag}: 5개 이상, 중복 없음, 모두 해당 끼니 메뉴에 존재`, () => {
        const list = MEAL_WEATHER_TAGS[meal][tag];
        expect(list.length).toBeGreaterThanOrEqual(5);
        expect(new Set(list).size).toBe(list.length);
        const all = new Set(ids(meal));
        expect(list.filter((id) => !all.has(id))).toEqual([]);
      });
    }
  }

  it('저녁 태그는 야식 메뉴를 가리키지 않는다', () => {
    const late = new Set(
      MEAL_MENUS.dinner
        .filter((m) => m.category === 'lateNight')
        .map((m) => m.id as string)
    );
    for (const tag of TAGS) {
      expect(
        MEAL_WEATHER_TAGS.dinner[tag].filter((id) => late.has(id))
      ).toEqual([]);
    }
  });
});
