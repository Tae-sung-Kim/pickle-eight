import { describe, expect, test } from 'vitest';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import {
  LUNCH_MENU_COUNT,
  LUNCH_MENUS,
} from '@/features/lunch/constants/lunch-menu.constant';

const MENU_NAMES = LUNCH_MENUS.map((m) => m.name);

// 국물 경계 메뉴 (L2)
const EXPECTED_SOUP = new Set([
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
]);

describe('AC-5 f: 점심 메뉴 데이터', () => {
  test('AC-40: 메뉴 48개, 카테고리 6개 이상 6개씩, 이름·id 중복 없음, id 형식', () => {
    expect(LUNCH_MENU_COUNT).toBe(48);
    expect(LUNCH_MENUS).toHaveLength(48);

    const keys = new Set<string>(LUNCH_CATEGORIES.map((c) => c.key));
    expect(keys.size).toBe(6);
    for (const key of keys) {
      const n = LUNCH_MENUS.filter((m) => m.category === key).length;
      expect(n, `${key} 메뉴 수`).toBeGreaterThanOrEqual(6);
    }
    for (const m of LUNCH_MENUS) {
      expect(keys.has(m.category), `${m.id} 카테고리`).toBe(true);
      expect(m.id, `${m.id} 형식`).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(m.id.length).toBeLessThanOrEqual(40);
    }
    expect(new Set(MENU_NAMES).size).toBe(48);
    expect(new Set(LUNCH_MENUS.map((m) => m.id)).size).toBe(48);
  });

  test('L2: 카테고리별 10/8/8/8/6/8, 국물 15개 건조 33개, 경계 메뉴 일치', () => {
    const count = (key: string) =>
      LUNCH_MENUS.filter((m) => m.category === key).length;
    expect(LUNCH_CATEGORIES.map((c) => count(c.key))).toEqual([
      10, 8, 8, 8, 6, 8,
    ]);
    const soup = LUNCH_MENUS.filter((m) => m.broth === 'soup');
    const dry = LUNCH_MENUS.filter((m) => m.broth === 'dry');
    expect(soup).toHaveLength(15);
    expect(dry).toHaveLength(33);
    expect(new Set(soup.map((m) => m.name))).toEqual(EXPECTED_SOUP);
    const byName = (n: string) => LUNCH_MENUS.find((m) => m.name === n)?.broth;
    expect(byName('냉면')).toBe('soup');
    expect(byName('백반')).toBe('dry');
    expect(byName('누룽지탕')).toBe('soup');
    expect(byName('소바')).toBe('dry');
    expect(byName('어묵')).toBe('soup');
  });
});
