import { describe, expect, it } from 'vitest';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_SEO,
  FORTUNE_COMPATIBILITY_TTI_SEO,
} from '@/features/fortune/constants/fortune-compatibility-seo.constant';
import { FORTUNE_COMPATIBILITY_SHARE_TARGETS } from '@/features/fortune/constants/fortune-compatibility-share.constant';
import {
  LUCKY_DRAW_LADDER_SEO,
  LUCKY_DRAW_LOTS_SEO,
  LUCKY_DRAW_ROULETTE_SEO,
} from '@/features/lucky-draw/constants/lucky-draw-seo.constant';
import { LUCKY_DRAW_SHARE_TEXTS } from '@/features/lucky-draw/constants/lucky-draw-share.constant';
import { MEAL_HUB_SEO } from '@/features/meal/constants/meal-seo.constant';
import { MEAL_SHARE_TARGET } from '@/features/meal/constants/meal-share.constant';
import { canonicalUrl } from '@/lib/seo';
import { buildShareUrl, toShareDisplayUrl } from '@/lib/share';

// AC-9: 공유 주소 = 기능 소개 페이지 canonical, 쿼리와 해시 없음
const CASES: ReadonlyArray<readonly [string, string, string]> = [
  ['/meal', MEAL_SHARE_TARGET.pathname, MEAL_HUB_SEO.pathname],
  [
    '/lucky-draw/ladder',
    LUCKY_DRAW_SHARE_TEXTS.ladder.pathname,
    LUCKY_DRAW_LADDER_SEO.pathname,
  ],
  [
    '/lucky-draw/roulette',
    LUCKY_DRAW_SHARE_TEXTS.roulette.pathname,
    LUCKY_DRAW_ROULETTE_SEO.pathname,
  ],
  [
    '/lucky-draw/lots',
    LUCKY_DRAW_SHARE_TEXTS.lots.pathname,
    LUCKY_DRAW_LOTS_SEO.pathname,
  ],
  [
    '/fortune/compatibility/tti',
    FORTUNE_COMPATIBILITY_SHARE_TARGETS.tti.pathname,
    FORTUNE_COMPATIBILITY_TTI_SEO.pathname,
  ],
  [
    '/fortune/compatibility/star-sign',
    FORTUNE_COMPATIBILITY_SHARE_TARGETS.starSign.pathname,
    FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.pathname,
  ],
];

describe('공유 주소 6개', () => {
  it.each(CASES)(
    '%s: 공유 대상 = seo pathname = canonical',
    (path, shared, seo) => {
      expect(shared).toBe(path);
      expect(seo).toBe(path);
      expect(buildShareUrl(shared)).toBe(canonicalUrl(seo));
      expect(buildShareUrl(shared)).not.toMatch(/[?#]/);
      const display = toShareDisplayUrl(shared);
      expect(display).not.toMatch(/^[a-z]+:\/\//i);
      expect(display.endsWith(path)).toBe(true);
    }
  );

  it('쿼리, 해시, 슬래시 없는 값은 throw', () => {
    for (const p of ['meal', '/meal?a=1', '/meal#x', '']) {
      expect(() => buildShareUrl(p)).toThrow();
      expect(() => toShareDisplayUrl(p)).toThrow();
    }
  });
});
