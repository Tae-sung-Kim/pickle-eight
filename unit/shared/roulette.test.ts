import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  RouletteComponent,
  type RoulettePropsType,
} from '@/components/common/roulette.component';
import type { RouletteItemType } from '@/types/roulette.type';

function makeItems(n: number, color?: string): RouletteItemType[] {
  return Array.from({ length: n }, (_, i) => ({
    key: `k${i}`,
    label: `칸${i}`,
    ...(color === undefined ? {} : { colorClassName: color }),
  }));
}

function render(
  props: Partial<RoulettePropsType> & { items: RouletteItemType[] }
) {
  return renderToStaticMarkup(
    createElement(RouletteComponent, {
      targetIndex: null,
      spinId: 0,
      ...props,
    })
  );
}

function needleClass(html: string): string {
  const m = html.match(/<polygon[^>]*class="([^"]*)"/);
  return m?.[1] ?? '';
}

describe('RouletteComponent 바늘 색', () => {
  it('기본은 점심 색', () => {
    expect(needleClass(render({ items: makeItems(4) }))).toBe(
      'fill-menu-meal stroke-background'
    );
  });

  it('accentClassName 지정 시 바늘이 해당 fill 색(투명도 제외)', () => {
    const html = render({
      items: makeItems(4),
      accentClassName: 'fill-menu-lotto/20 stroke-menu-lotto',
    });
    expect(needleClass(html)).toBe('fill-menu-lotto stroke-background');
    expect(html).not.toContain('menu-meal');
  });

  it('빈 문자열·공백이면 기본색', () => {
    for (const a of ['', '   ']) {
      expect(
        needleClass(render({ items: makeItems(4), accentClassName: a }))
      ).toBe('fill-menu-meal stroke-background');
    }
  });
});

describe('RouletteComponent 칸 색', () => {
  it('colorClassName이 번갈아 색보다 우선', () => {
    const html = render({ items: makeItems(4, 'fill-menu-lotto/10') });
    expect(html.match(/fill-menu-lotto\/10/g)?.length).toBe(4);
    expect(html).not.toContain('fill-card');
  });

  it('colorClassName이 홀수 마지막 fill-muted보다 우선', () => {
    const html = render({ items: makeItems(3, 'fill-menu-lotto/10') });
    expect(html.match(/fill-menu-lotto\/10/g)?.length).toBe(3);
    expect(html).not.toMatch(/class="[^"]*\bfill-muted\b(?!\/)/);
  });

  it('colorClassName 없으면 홀수 마지막이 fill-muted', () => {
    const html = render({ items: makeItems(3) });
    expect(html).toMatch(/<path[^>]*class="[^"]*\bfill-muted\b/);
  });

  it('공백 colorClassName은 무시', () => {
    const html = render({ items: makeItems(4, '   ') });
    expect(html).toContain('fill-card');
    expect(html).toContain('fill-background');
  });

  it('칸 1개 원에 칸 색 적용', () => {
    const html = render({ items: makeItems(1, 'fill-menu-lotto/10') });
    expect(html).toMatch(/<circle[^>]*class="[^"]*fill-menu-lotto\/10/);
  });
});

describe('RouletteComponent isResultHidden', () => {
  const base = { items: makeItems(4), targetIndex: 1, spinId: 0 };

  it('true/false 모두 렌더 시 throw 없음', () => {
    for (const hidden of [true, false]) {
      expect(() => render({ ...base, isResultHidden: hidden })).not.toThrow();
    }
  });

  const textCount = (html: string) => html.match(/<text[\s>]/g)?.length ?? 0;
  const pathFills = (html: string) =>
    [...html.matchAll(/<path[^>]*class="([^"]*)"/g)].map((m) => m[1]);

  it('생략과 false는 같은 마크업 (메뉴 룰렛 회귀)', () => {
    expect(render(base)).toBe(render({ ...base, isResultHidden: false }));
  });

  it('false 또는 생략이면 칸 글자가 칸 수만큼 있다', () => {
    for (const html of [
      render(base),
      render({ ...base, isResultHidden: false }),
    ]) {
      expect(textCount(html)).toBe(4);
      for (let i = 0; i < 4; i += 1) expect(html).toContain(`칸${i}`);
    }
  });

  it('true면 첫 렌더 마크업에 칸 글자 text와 항목 글자가 없다', () => {
    const html = render({ ...base, isResultHidden: true });
    expect(textCount(html)).toBe(0);
    for (let i = 0; i < 4; i += 1) expect(html).not.toContain(`칸${i}`);
  });

  it('true여도 칸 수만큼 path와 바늘은 그대로', () => {
    const shown = render({ ...base, isResultHidden: false });
    const hidden = render({ ...base, isResultHidden: true });
    expect(pathFills(hidden)).toHaveLength(pathFills(shown).length);
    expect(pathFills(hidden)).toHaveLength(4);
    expect(needleClass(hidden)).toBe(needleClass(shown));
  });

  it('true면 칸 면이 모두 같은 색이고 강조 칸이 없다', () => {
    for (const n of [3, 4, 5, 28]) {
      const html = render({
        items: makeItems(n),
        targetIndex: 1,
        spinId: 0,
        accentClassName: 'fill-menu-lucky/20 stroke-menu-lucky',
        isResultHidden: true,
      });
      const fills = pathFills(html).map(
        (c) => c.match(/\bfill-[a-z]+(?:\/\d+)?/)?.[0]
      );
      expect(fills, `n=${n}`).toHaveLength(n);
      expect(new Set(fills).size, `n=${n}`).toBe(1);
      expect(html).not.toContain('fill-menu-lucky/20');
      expect(html).not.toContain('stroke-width="3"');
    }
  });

  it('true면 칸이 1개인 원에도 칸 글자가 없다', () => {
    const html = render({
      items: makeItems(1),
      targetIndex: 0,
      spinId: 0,
      isResultHidden: true,
    });
    expect(textCount(html)).toBe(0);
    expect(html).not.toContain('칸0');
  });
});

describe('RouletteComponent 운빨 뽑기 강조 토큰 (AC-19)', () => {
  const ACCENT = 'fill-menu-lucky/20 stroke-menu-lucky';

  it('바늘이 fill-menu-lucky', () => {
    const html = render({ items: makeItems(4), accentClassName: ACCENT });
    expect(needleClass(html)).toBe('fill-menu-lucky stroke-background');
    expect(html).not.toContain('menu-meal');
  });

  it('허용 토큰 밖의 menu 색이 나오지 않는다', () => {
    const html = render({ items: makeItems(5), accentClassName: ACCENT });
    const found = new Set(
      html.match(/(?:fill|stroke)-menu-[a-z]+(?:\/\d+)?/g) ?? []
    );
    const allowed = new Set([
      'fill-menu-lucky',
      'fill-menu-lucky/20',
      'stroke-menu-lucky',
    ]);
    for (const t of found) expect(allowed.has(t), t).toBe(true);
  });
});

describe('RouletteComponent 견고성', () => {
  it.each([0, 1, 3])('칸 %i개 렌더 시 throw 없음', (n) => {
    expect(() => render({ items: makeItems(n) })).not.toThrow();
  });

  it('잘못된 spinDurationSec·spinTurns 렌더 시 throw 없음', () => {
    const bad: [number, number][] = [
      [Number.NaN, Number.NaN],
      [-1, 0],
      [99, 1.5],
      [Number.POSITIVE_INFINITY, 100],
    ];
    for (const [d, t] of bad) {
      expect(() =>
        render({ items: makeItems(3), spinDurationSec: d, spinTurns: t })
      ).not.toThrow();
    }
  });
});
