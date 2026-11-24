import { describe, expect, test } from 'vitest';
import {
  MEAL_MAP_HOSTS,
  MEAL_MAP_PROVIDERS,
} from '@/features/meal/constants/meal-map.constant';
import type {
  MealAreaInputResultType,
  MealMenuType,
} from '@/features/meal/types/meal.type';
import {
  buildMealMapLinks,
  getMealMapSearchText,
} from '@/features/meal/utils/meal-map-link.util';

const MENU: MealMenuType = {
  id: 'jjamppong',
  name: '짬뽕',
  category: 'chinese',
  broth: 'soup',
} as MealMenuType;
const EMPTY: MealAreaInputResultType = { status: 'empty' };
const AREA: MealAreaInputResultType = { status: 'valid', value: '강남역' };

describe('AC-1, 2, 5: 지도 검색어 조합과 링크', () => {
  test.each([
    ['empty', EMPTY],
    ['too_long', { status: 'invalid', reason: 'too_long' }],
    ['invalid_char', { status: 'invalid', reason: 'invalid_char' }],
  ] as const)('%s 입력은 메뉴 이름만 쓴다', (_label, area) => {
    const links = buildMealMapLinks(MENU, area);
    expect(links).toHaveLength(3);
    links.forEach((link, i) => {
      expect(link.href).toBe(
        MEAL_MAP_PROVIDERS[i].baseUrl + encodeURIComponent('짬뽕')
      );
    });
  });

  test('유효 입력은 동네 + 한 칸 + 메뉴', () => {
    expect(getMealMapSearchText(MENU, AREA)).toBe('강남역 짬뽕');
    const links = buildMealMapLinks(MENU, AREA);
    links.forEach((link, i) => {
      expect(link.href).toBe(
        MEAL_MAP_PROVIDERS[i].baseUrl + encodeURIComponent('강남역 짬뽕')
      );
      expect(link.href).toContain('%20');
    });
  });

  test('mapQuery가 있으면 동네 + mapQuery', () => {
    const menu = { ...MENU, mapQuery: '짬뽕 맛집용' } as MealMenuType;
    expect(getMealMapSearchText(menu, AREA)).toBe('강남역 짬뽕 맛집용');
    expect(getMealMapSearchText(menu, EMPTY)).toBe('짬뽕 맛집용');
  });

  test('중복 제거 없음', () => {
    expect(
      getMealMapSearchText(MENU, { status: 'valid', value: '강남역 짬뽕' })
    ).toBe('강남역 짬뽕 짬뽕');
  });

  test('URL 형태 유지: host와 구글 파라미터 키', () => {
    const hosts: string[] = Object.values(MEAL_MAP_HOSTS);
    for (const link of buildMealMapLinks(MENU, AREA)) {
      const url = new URL(link.href);
      expect(url.protocol).toBe('https:');
      expect(hosts).toContain(url.host);
      if (link.provider === 'google') {
        expect([...url.searchParams.keys()].sort()).toEqual(['api', 'query']);
        expect(url.searchParams.get('query')).toBe('강남역 짬뽕');
      } else {
        expect([...url.searchParams.keys()]).toEqual([]);
      }
    }
  });
});
