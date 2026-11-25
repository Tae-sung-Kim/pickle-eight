import { describe, expect, test } from 'vitest';
import {
  HOME_DESCRIPTION,
  HOME_GROUP_DESCRIPTIONS,
  HOME_HERO_DESCRIPTION,
  HOME_TITLE,
} from '@/constants/home.constant';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import { readSourceFiles } from '../helpers/source-scan.util';

// 화면 코드가 import하지 않는 검사 전용 목록
const FORBIDDEN_TERMS = [
  '보장',
  '적중',
  '확률',
  '반드시',
  '틀림없',
  '100%',
  '1등',
  '예측',
] as const;

const EXPECTED_GROUP_ORDER = [
  'fortune',
  'meal',
  'tarot',
  'lucky-draw',
  'dream',
  'no-son-days',
  'lotto',
] as const;

const EXPECTED_ITEM_HREFS: Record<string, readonly string[]> = {
  fortune: [
    '/fortune/today',
    '/fortune/tti',
    '/fortune/star-sign',
    '/fortune/compatibility',
    '/fortune/saju',
  ],
  meal: ['/meal'],
  tarot: ['/tarot/daily', '/tarot/three-card'],
  'lucky-draw': [
    '/lucky-draw/ladder',
    '/lucky-draw/roulette',
    '/lucky-draw/lots',
  ],
  dream: ['/dream'],
  'no-son-days': ['/no-son-days'],
  lotto: [
    '/lotto/generator',
    '/lotto/history',
    '/lotto/check',
    '/lotto/my-numbers',
    '/lotto/analysis',
    '/lotto/simulator',
  ],
};

const groupDescriptions = Object.entries(HOME_GROUP_DESCRIPTIONS) as [
  MENU_GROUP_NAME_ENUM,
  string,
][];

const allHomeTexts: [string, string][] = [
  ['HOME_TITLE', HOME_TITLE],
  ['HOME_DESCRIPTION', HOME_DESCRIPTION],
  ['HOME_HERO_DESCRIPTION', HOME_HERO_DESCRIPTION],
  ...groupDescriptions.map(([k, v]): [string, string] => [
    `HOME_GROUP_DESCRIPTIONS.${k}`,
    v,
  ]),
];

const labelOf = (group: string) =>
  MENU_LIST.find((g) => g.group === group)?.label ?? '';

describe('AC-4: 메뉴 순서', () => {
  test('그룹 순서가 확정안과 같다', () => {
    expect(MENU_LIST.map((g) => g.group)).toEqual([...EXPECTED_GROUP_ORDER]);
  });

  test('그룹마다 하위 항목 순서가 변하지 않았다', () => {
    for (const g of MENU_LIST) {
      expect(
        g.items.map((i) => i.href),
        g.group
      ).toEqual([...EXPECTED_ITEM_HREFS[g.group]]);
    }
  });

  test('홈·헤더·모바일·사이트맵이 MENU_LIST 순서를 그대로 쓴다', () => {
    const files = [
      'src/app/page.tsx',
      'src/components/layout/pc-menu.component.tsx',
      'src/components/layout/mobile-menu.component.tsx',
      'src/app/sitemap.ts',
    ];
    const sources = readSourceFiles(['.ts', '.tsx']);
    for (const f of files) {
      const src = sources.find((s) => s.path === f);
      expect(src, f).toBeDefined();
      expect(src?.content, f).toContain('MENU_LIST');
      expect(src?.content, f).not.toMatch(/\.sort\(|\.toSorted\(|\.reverse\(/);
    }
  });

  test('사이트맵: 메뉴 주소가 새 그룹 순서로 나오고 중복이 없다', async () => {
    process.env.SITEMAP_SKIP_FETCH = '1';
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain('/');
    expect(urls).toContain('/lotto');

    const groupHrefs = MENU_LIST.map((g) => g.href ?? g.items[0].href);
    const positions = groupHrefs.map((h) => urls.indexOf(h));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe('AC-5: 홈 문구 금지 표현', () => {
  test.each(allHomeTexts)('%s에 금지 표현이 없다', (_name, text) => {
    const hits = FORBIDDEN_TERMS.filter((t) => text.includes(t));
    expect(hits).toEqual([]);
  });
});

describe('AC-1 보조: 제목·히어로에 로또 없음', () => {
  test('HOME_TITLE, HOME_HERO_DESCRIPTION', () => {
    expect(HOME_TITLE).not.toContain('로또');
    expect(HOME_HERO_DESCRIPTION).not.toContain('로또');
  });
});

describe('그룹 설명 규칙 (design 4.3)', () => {
  test('enum 모든 값에 비어 있지 않은 설명이 있다', () => {
    for (const group of Object.values(MENU_GROUP_NAME_ENUM)) {
      expect(
        HOME_GROUP_DESCRIPTIONS[group]?.trim().length,
        group
      ).toBeGreaterThan(0);
    }
  });

  test('다른 그룹의 라벨을 넣지 않는다', () => {
    for (const [key, text] of groupDescriptions) {
      const own = labelOf(key);
      for (const g of MENU_LIST) {
        if (g.group === key || g.label === own) continue;
        expect(text.includes(g.label), `${key} 설명에 "${g.label}"`).toBe(
          false
        );
      }
    }
  });

  test('LOTTO 설명에 번호 만들기·당첨 결과·채점이 있다', () => {
    const text = HOME_GROUP_DESCRIPTIONS[MENU_GROUP_NAME_ENUM.LOTTO];
    for (const k of ['번호 만들기', '당첨 결과', '채점']) {
      expect(text, k).toContain(k);
    }
  });

  test('운세 설명에 사주 없음', () => {
    expect(HOME_GROUP_DESCRIPTIONS[MENU_GROUP_NAME_ENUM.FORTUNE]).not.toContain(
      '사주'
    );
  });

  test('꿈 해몽 설명에 로또·당첨·번호 없음', () => {
    const text = HOME_GROUP_DESCRIPTIONS[MENU_GROUP_NAME_ENUM.DREAM];
    for (const k of ['로또', '당첨', '번호']) expect(text).not.toContain(k);
  });

  test('뭐 먹지 설명에 추천·음주 관련 단어 없음', () => {
    const text = HOME_GROUP_DESCRIPTIONS[MENU_GROUP_NAME_ENUM.MEAL];
    for (const k of ['추천', '술', '주류', '맥주', '소주', '막걸리'])
      expect(text).not.toContain(k);
  });
});
