import { describe, expect, test } from 'vitest';
import { MENU_LIST } from '@/constants/menu.constant';
import {
  MENU_LABEL_BY_HREF,
  RESULT_NEXT_LINK_SUFFIX,
  RESULT_NEXT_LINK_TARGETS,
  RESULT_NEXT_LINKS_TITLE,
} from '@/constants/result-next-links.constant';
import { FORTUNE_FORBIDDEN_TERMS } from '@/features/fortune/constants/fortune-copy-rule.constant';
import { MEAL_FORBIDDEN_TERMS } from '@/features/meal/constants/meal-copy-rule.constant';
import { TAROT_FORBIDDEN_TERMS } from '@/features/tarot/constants/tarot-copy-rule.constant';

const menuHrefs = new Set(
  MENU_LIST.filter((g) => !g.comingSoon).flatMap((g) =>
    g.items.map((i) => i.href)
  )
);
const entries = Object.entries(RESULT_NEXT_LINK_TARGETS);

describe('결과 화면 이동 링크 대상', () => {
  test.each(entries)('%s: 규칙 통과', (from, targets) => {
    expect(targets).toHaveLength(2);
    expect(new Set(targets).size).toBe(2);
    for (const href of targets) {
      expect(href).not.toBe(from);
      expect(href).toMatch(/^\/[^?#]*$/);
      expect(menuHrefs.has(href)).toBe(true);
      expect(MENU_LABEL_BY_HREF.get(href)).toBeTruthy();
      expect(href.startsWith('/lotto')).toBe(from.startsWith('/lotto'));
    }
  });

  test('문구에 금지어·재촉 표현이 없다', () => {
    const texts = [
      RESULT_NEXT_LINKS_TITLE,
      RESULT_NEXT_LINK_SUFFIX,
      ...entries
        .filter(([from]) => !from.startsWith('/lotto'))
        .flatMap(([, t]) => t.map((h) => MENU_LABEL_BY_HREF.get(h))),
    ].join(' ');
    const banned = [
      ...FORTUNE_FORBIDDEN_TERMS,
      ...TAROT_FORBIDDEN_TERMS,
      ...MEAL_FORBIDDEN_TERMS,
      '추천',
      '지금 바로',
      '꼭',
      '놓치지',
      '광고',
    ];
    expect(banned.filter((t) => texts.includes(t))).toEqual([]);
  });
});
