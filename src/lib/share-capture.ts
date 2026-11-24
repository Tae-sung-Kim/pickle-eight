import { getFontEmbedCSS, toCanvas } from 'html-to-image';
import { SHARE_CAPTURE, SHARE_CARD_SIZE } from '@/constants/share.constant';
import { isShareCanvasBlank, parseCssColor } from '@/lib/share';
import type { ShareCaptureErrorCodeType } from '@/types/share.type';

export class ShareCaptureError extends Error {
  readonly code: ShareCaptureErrorCodeType;

  constructor(code: ShareCaptureErrorCodeType) {
    super(`share/${code}`);
    this.name = 'ShareCaptureError';
    this.code = code;
  }
}

/** undefined: 아직 안 만듦, '': 실패 또는 시간 초과(skipFonts로 진행) */
let fontEmbedCss: string | undefined;
let hasWarmedUp = false;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  code: ShareCaptureErrorCodeType
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ShareCaptureError(code)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function filterNode(node: Node): boolean {
  if (!(node instanceof HTMLElement)) return true;
  if (node.dataset.capture === 'ignore') return false;
  if (node.classList.contains('pe-no-capture')) return false;
  return true;
}

/** 어떤 CSS 색 문법이든 1픽셀 캔버스로 풀어 RGB를 얻는다 */
function resolveBackground(element: HTMLElement): {
  css: string;
  rgb: readonly [number, number, number];
} {
  const css: string = getComputedStyle(element).backgroundColor;
  const parsed = parseCssColor(css);
  if (parsed) return { css, rgb: parsed };
  try {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx && css) {
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      if (a === 255) return { css, rgb: [r, g, b] };
    }
  } catch {
    // 색 해석 실패는 흰 배경으로 처리한다
  }
  return { css: 'rgb(255, 255, 255)', rgb: [255, 255, 255] };
}

async function resolveFontEmbedCss(element: HTMLElement): Promise<string> {
  if (fontEmbedCss !== undefined) return fontEmbedCss;
  try {
    fontEmbedCss = await withTimeout(
      getFontEmbedCSS(element),
      SHARE_CAPTURE.fontEmbedTimeoutMs,
      'timeout'
    );
  } catch {
    fontEmbedCss = '';
  }
  return fontEmbedCss;
}

function isCanvasBlank(
  canvas: HTMLCanvasElement,
  background: readonly [number, number, number]
): boolean {
  const { width, height } = SHARE_CAPTURE.blankSampleSize;
  const sample: HTMLCanvasElement = document.createElement('canvas');
  sample.width = width;
  sample.height = height;
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx) return true;
  ctx.drawImage(canvas, 0, 0, width, height);
  return isShareCanvasBlank(
    ctx.getImageData(0, 0, width, height).data,
    background,
    {
      minInkPixels: SHARE_CAPTURE.blankMinInkPixels,
      colorDistance: SHARE_CAPTURE.blankColorDistance,
    }
  );
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function renderCard(
  element: HTMLElement,
  isCancelled: () => boolean
): Promise<Blob> {
  await document.fonts?.ready;
  const embed: string = await resolveFontEmbedCss(element);
  const background = resolveBackground(element);

  const draw = (): Promise<HTMLCanvasElement> =>
    toCanvas(element, {
      width: SHARE_CARD_SIZE.width,
      height: SHARE_CARD_SIZE.height,
      pixelRatio: SHARE_CARD_SIZE.pixelRatio,
      backgroundColor: background.css,
      cacheBust: false,
      filter: filterNode,
      ...(embed ? { fontEmbedCSS: embed } : { skipFonts: true }),
    });

  if (!hasWarmedUp) {
    hasWarmedUp = true;
    try {
      await draw();
    } catch {
      // 워밍업 결과는 버린다
    }
  }

  let lastCode: ShareCaptureErrorCodeType = 'capture-failed';
  for (let attempt = 0; attempt < SHARE_CAPTURE.maxAttempts; attempt += 1) {
    if (isCancelled()) break;
    try {
      const canvas: HTMLCanvasElement = await draw();
      if (isCanvasBlank(canvas, background.rgb)) {
        lastCode = 'blank';
        continue;
      }
      const blob: Blob | null = await canvasToBlob(canvas);
      if (!blob) {
        lastCode = 'blob-null';
        continue;
      }
      return blob;
    } catch {
      lastCode = 'capture-failed';
    }
  }
  throw new ShareCaptureError(lastCode);
}

/** 카드 요소 하나를 1080x1350 PNG로 만든다. 실패하면 ShareCaptureError */
export async function captureShareCard(
  element: HTMLElement | null
): Promise<Blob> {
  if (!element) throw new ShareCaptureError('no-element');
  let cancelled = false;
  try {
    return await withTimeout(
      renderCard(element, () => cancelled),
      SHARE_CAPTURE.prepareTimeoutMs,
      'timeout'
    );
  } finally {
    cancelled = true;
  }
}
