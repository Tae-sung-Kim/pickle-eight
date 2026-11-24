import { SHARE_MASK_CHAR } from '@/constants/share.constant';
import { canonicalUrl, SITE_URL } from '@/lib/seo';
import type {
  ShareEnvType,
  ShareErrorKindType,
  ShareModeType,
} from '@/types/share.type';

/** 경로 판정. 위에서부터 첫 일치 (design 2.3) */
export function resolveShareMode(
  env: ShareEnvType
): Exclude<ShareModeType, { kind: 'unknown' }> {
  if (env.isKakaoAndroid) return { kind: 'guide' };
  if (env.isCoarsePointer && env.hasWebShare) {
    return { kind: 'mobile', canShareFiles: env.canShareFiles };
  }
  return { kind: 'desktop', canCopyImage: env.canCopyImage };
}

function assertSharePathname(pathname: string): void {
  if (
    !pathname.startsWith('/') ||
    pathname.includes('?') ||
    pathname.includes('#')
  ) {
    throw new Error('share/invalid-pathname');
  }
}

export function buildShareUrl(pathname: string): string {
  assertSharePathname(pathname);
  return canonicalUrl(pathname);
}

/** 카드 꼬리 표시용. 프로토콜 제외 */
export function toShareDisplayUrl(pathname: string): string {
  assertSharePathname(pathname);
  return `${SITE_URL}${pathname}`.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
}

/** 코드 포인트 기준. 1글자는 전부, 2글자 이상은 첫 글자만 남긴다 */
export function maskShareName(label: string): string {
  const chars: string[] = Array.from(label);
  if (chars.length <= 1) return chars.length === 0 ? '' : SHARE_MASK_CHAR;
  return chars[0] + SHARE_MASK_CHAR.repeat(chars.length - 1);
}

export function truncateShareList<T>(
  items: readonly T[],
  limit: number
): Readonly<{ items: readonly T[]; hiddenCount: number }> {
  const safeLimit: number = Math.max(0, Math.floor(limit));
  if (items.length <= safeLimit) return { items, hiddenCount: 0 };
  return {
    items: items.slice(0, safeLimit),
    hiddenCount: items.length - safeLimit,
  };
}

export function classifyShareError(error: unknown): ShareErrorKindType {
  if (typeof error !== 'object' || error === null) return 'unknown';
  const name: unknown = (error as { name?: unknown }).name;
  if (name === 'AbortError') return 'abort';
  if (name === 'NotAllowedError') return 'not-allowed';
  if (name === 'TypeError' || name === 'NotSupportedError') {
    return 'unsupported';
  }
  return 'unknown';
}

/**
 * 배경색과 colorDistance 넘게 다른 픽셀이 minInkPixels 미만이면 빈 이미지.
 * 반투명 픽셀은 배경 위에 섞어서 비교하고, 완전 투명 픽셀은 잉크로 세지 않는다.
 */
export function isShareCanvasBlank(
  data: Uint8ClampedArray,
  background: readonly [number, number, number],
  options: Readonly<{ minInkPixels: number; colorDistance: number }>
): boolean {
  let ink = 0;
  for (let i = 0; i + 3 < data.length; i += 4) {
    const alpha: number = data[i + 3] / 255;
    if (alpha === 0) continue;
    const dr: number =
      data[i] * alpha + background[0] * (1 - alpha) - background[0];
    const dg: number =
      data[i + 1] * alpha + background[1] * (1 - alpha) - background[1];
    const db: number =
      data[i + 2] * alpha + background[2] * (1 - alpha) - background[2];
    if (Math.sqrt(dr * dr + dg * dg + db * db) > options.colorDistance) {
      ink += 1;
      if (ink >= options.minInkPixels) return false;
    }
  }
  return true;
}

const CSS_RGB_PATTERN =
  /^rgba?\(\s*(\d{1,3}(?:\.\d+)?)[\s,]+(\d{1,3}(?:\.\d+)?)[\s,]+(\d{1,3}(?:\.\d+)?)(?:[\s,/]+[\d.]+%?)?\s*\)$/i;

export function parseCssColor(
  value: string
): readonly [number, number, number] | null {
  const match: RegExpMatchArray | null = value.trim().match(CSS_RGB_PATTERN);
  if (!match) return null;
  const [r, g, b] = [match[1], match[2], match[3]].map((v) =>
    Math.min(255, Math.max(0, Math.round(Number(v))))
  );
  return [r, g, b];
}

/** 카드 내용과 옵션이 바뀌면 키가 바뀐다 */
export function toShareCardKey(value: unknown): string {
  return JSON.stringify(value) ?? 'null';
}
