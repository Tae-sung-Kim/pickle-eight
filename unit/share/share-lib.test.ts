import { describe, expect, it, vi } from 'vitest';

vi.mock('html-to-image', () => ({
  getFontEmbedCSS: vi.fn(),
  toCanvas: vi.fn(),
}));

import {
  SHARE_CAPTURE,
  SHARE_CARD_LIST_LIMITS,
  SHARE_CARD_SIZE,
  SHARE_MASK_CHAR,
  SHARE_TEXTS,
} from '@/constants/share.constant';
import {
  buildShareUrl,
  classifyShareError,
  isShareCanvasBlank,
  maskShareName,
  parseCssColor,
  resolveShareMode,
  toShareCardKey,
  toShareDisplayUrl,
  truncateShareList,
} from '@/lib/share';
import { captureShareCard, ShareCaptureError } from '@/lib/share-capture';
import { parseShareUserAgent, SHARE_ENV_FALLBACK } from '@/lib/share-env';
import type { ShareEnvType } from '@/types/share.type';

const env = (o: Partial<ShareEnvType> = {}): ShareEnvType => ({
  ...SHARE_ENV_FALLBACK,
  ...o,
});

describe('resolveShareMode', () => {
  it('카카오 Android는 다른 조건보다 먼저 guide', () => {
    expect(
      resolveShareMode(
        env({ isKakaoAndroid: true, isCoarsePointer: true, hasWebShare: true })
      )
    ).toEqual({ kind: 'guide' });
  });
  it('모바일 파일 공유 가능/불가', () => {
    const base = { isCoarsePointer: true, hasWebShare: true };
    expect(resolveShareMode(env({ ...base, canShareFiles: true }))).toEqual({
      kind: 'mobile',
      canShareFiles: true,
    });
    expect(resolveShareMode(env(base))).toEqual({
      kind: 'mobile',
      canShareFiles: false,
    });
  });
  it('터치지만 share 없으면 desktop', () => {
    expect(resolveShareMode(env({ isCoarsePointer: true }))).toEqual({
      kind: 'desktop',
      canCopyImage: false,
    });
  });
  it('PC 이미지 복사 가능/불가, 전부 false', () => {
    expect(resolveShareMode(env({ canCopyImage: true }))).toEqual({
      kind: 'desktop',
      canCopyImage: true,
    });
    expect(resolveShareMode(env())).toEqual({
      kind: 'desktop',
      canCopyImage: false,
    });
  });
});

describe('parseShareUserAgent', () => {
  const cases: [string, string, boolean, boolean][] = [
    [
      '카카오 Android',
      'Mozilla/5.0 (Linux; Android 13) KAKAOTALK 10.0',
      true,
      true,
    ],
    [
      '카카오 iOS',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17) KAKAOTALK 10.0',
      false,
      true,
    ],
    [
      '네이버 앱',
      'Mozilla/5.0 (Linux; Android 13) NAVER(inapp; search)',
      false,
      true,
    ],
    ['인스타그램', 'Mozilla/5.0 (iPhone) Instagram 300.0', false, true],
    [
      'Chrome',
      'Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537.36',
      false,
      false,
    ],
    [
      'Safari',
      'Mozilla/5.0 (Macintosh) Version/17 Safari/605.1.15',
      false,
      false,
    ],
  ];
  it.each(cases)('%s', (_n, ua, kakaoAndroid, inApp) => {
    expect(parseShareUserAgent(ua)).toEqual({
      isKakaoAndroid: kakaoAndroid,
      isInApp: inApp,
    });
  });
});

describe('URL', () => {
  it('buildShareUrl은 절대 URL, 잘못된 경로는 throw', () => {
    expect(buildShareUrl('/meal')).toMatch(/^https?:\/\/.+\/meal$/);
    for (const p of ['meal', '/a?b=1', '/a#x', '']) {
      expect(() => buildShareUrl(p)).toThrow();
      expect(() => toShareDisplayUrl(p)).toThrow();
    }
  });
  it('toShareDisplayUrl은 프로토콜 제외', () => {
    const d = toShareDisplayUrl('/meal');
    expect(d).not.toMatch(/^https?:/);
    expect(d.endsWith('/meal')).toBe(true);
  });
});

describe('maskShareName', () => {
  it('빈 문자열, 1글자, 2글자 이상, 이모지', () => {
    expect(maskShareName('')).toBe('');
    expect(maskShareName('김')).toBe(SHARE_MASK_CHAR);
    expect(maskShareName('김철수')).toBe('김**');
    expect(maskShareName('😀😀😀')).toBe('😀**');
  });
});

describe('truncateShareList', () => {
  it('한계 이하/초과/음수', () => {
    expect(truncateShareList([1, 2], 3)).toEqual({
      items: [1, 2],
      hiddenCount: 0,
    });
    expect(truncateShareList([1, 2, 3, 4], 2)).toEqual({
      items: [1, 2],
      hiddenCount: 2,
    });
    expect(truncateShareList([1], -1)).toEqual({ items: [], hiddenCount: 1 });
  });
});

describe('classifyShareError', () => {
  it.each([
    [{ name: 'AbortError' }, 'abort'],
    [{ name: 'NotAllowedError' }, 'not-allowed'],
    [{ name: 'TypeError' }, 'unsupported'],
    [{ name: 'NotSupportedError' }, 'unsupported'],
    [{ name: 'Other' }, 'unknown'],
    ['AbortError', 'unknown'],
    [null, 'unknown'],
    [undefined, 'unknown'],
  ])('%j -> %s', (e, kind) => {
    expect(classifyShareError(e)).toBe(kind);
  });
});

describe('isShareCanvasBlank', () => {
  const opt = { minInkPixels: 3, colorDistance: 24 };
  const bg: [number, number, number] = [255, 255, 255];
  const px = (n: number, rgba: number[]): number[] =>
    Array.from({ length: n }, () => rgba).flat();
  it('배경만이면 true', () => {
    expect(
      isShareCanvasBlank(
        new Uint8ClampedArray(px(10, [255, 255, 255, 255])),
        bg,
        opt
      )
    ).toBe(true);
  });
  it('전부 투명이면 true', () => {
    expect(
      isShareCanvasBlank(new Uint8ClampedArray(px(10, [0, 0, 0, 0])), bg, opt)
    ).toBe(true);
  });
  it('글자 픽셀 충분하면 false, 미만이면 true', () => {
    const data = (ink: number) =>
      new Uint8ClampedArray([
        ...px(ink, [0, 0, 0, 255]),
        ...px(10, [255, 255, 255, 255]),
      ]);
    expect(isShareCanvasBlank(data(3), bg, opt)).toBe(false);
    expect(isShareCanvasBlank(data(2), bg, opt)).toBe(true);
  });
  it('거리 이하의 옅은 차이는 잉크가 아님', () => {
    expect(
      isShareCanvasBlank(
        new Uint8ClampedArray(px(10, [250, 250, 250, 255])),
        bg,
        opt
      )
    ).toBe(true);
  });
});

describe('parseCssColor', () => {
  it('rgb, rgba, 공백 구분', () => {
    expect(parseCssColor('rgb(1, 2, 3)')).toEqual([1, 2, 3]);
    expect(parseCssColor('rgba(10,20,30,0.5)')).toEqual([10, 20, 30]);
    expect(parseCssColor(' rgb(1 2 3 / 50%) ')).toEqual([1, 2, 3]);
  });
  it('잘못된 값은 null', () => {
    for (const v of ['', '#fff', 'red', 'rgb(1,2)', 'oklch(0.5 0.1 20)']) {
      expect(parseCssColor(v)).toBeNull();
    }
  });
});

describe('toShareCardKey', () => {
  it('내용이 바뀌면 키가 바뀌고 undefined도 문자열', () => {
    expect(toShareCardKey({ a: 1 })).not.toBe(toShareCardKey({ a: 2 }));
    expect(toShareCardKey({ a: 1 })).toBe(toShareCardKey({ a: 1 }));
    expect(toShareCardKey(undefined)).toBe('null');
  });
});

describe('share-capture', () => {
  it('요소가 없으면 no-element', async () => {
    const err = await captureShareCard(null).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ShareCaptureError);
    expect((err as ShareCaptureError).code).toBe('no-element');
    expect((err as ShareCaptureError).message).toBe('share/no-element');
  });
});

describe('share.constant', () => {
  it('카드 비율은 4:5, 픽셀비 2', () => {
    expect(SHARE_CARD_SIZE.width * 5).toBe(SHARE_CARD_SIZE.height * 4);
    expect(SHARE_CARD_SIZE.pixelRatio).toBe(2);
  });
  it('한계값과 캡처 설정은 양수', () => {
    for (const v of [
      ...Object.values(SHARE_CARD_LIST_LIMITS),
      SHARE_CAPTURE.maxAttempts,
      SHARE_CAPTURE.prepareTimeoutMs,
      SHARE_CAPTURE.blankMinInkPixels,
    ]) {
      expect(v).toBeGreaterThan(0);
    }
  });
  it('문구는 비어 있지 않고 메신저 이름이 없다', () => {
    const all: string[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === 'string') all.push(v);
      else Object.values(v as object).forEach(walk);
    };
    walk(SHARE_TEXTS);
    expect(all.length).toBeGreaterThan(0);
    for (const s of all) {
      expect(s.trim()).not.toBe('');
      expect(s).not.toMatch(/카카오|네이버|인스타/);
    }
  });
  it('자리표시자는 moreTemplate에만 있고 previewConfirm은 3개 동작', () => {
    const { moreTemplate, previewConfirm, ...rest } = SHARE_TEXTS;
    expect(moreTemplate).toContain('{n}');
    expect(Object.keys(previewConfirm).sort()).toEqual([
      'copy-image',
      'download',
      'share',
    ]);
    for (const s of Object.values(rest)) {
      if (typeof s === 'string') expect(s).not.toMatch(/[{}]/);
    }
  });
});
