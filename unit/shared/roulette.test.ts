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
