import { readFileSync } from 'node:fs';
import {
  type BrowserContext,
  type Download,
  expect,
  type Page,
  test,
} from '@playwright/test';
import {
  declineCookies,
  passLottoAgeGate,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';
import {
  button,
  fillLines,
  LD_LADDER,
  LD_ROULETTE,
  lines,
  openTool,
  status,
} from './helpers/lucky-draw.util';
import { openPage, spinOnce } from './helpers/meal.util';

// 공유 기능 흐름. 순수 로직과 소스 규칙은 unit/share/가 맡는다.
// 실제 iOS 공유창, 한글 조합 입력, 카카오 인앱은 재현하지 못한다(수동 M 항목).

test.beforeEach(() => test.setTimeout(90_000));

const TEXT = {
  linkCopied: '링크를 복사했어요',
  imageCopied: '이미지를 복사했어요',
  captureFailed: '이미지를 만들지 못했어요. 링크로 공유해 주세요',
  guideInAppTitle: '이 브라우저에서는 공유할 수 없어요',
  guideClipboardTitle: '링크를 복사하지 못했어요',
  guideClose: '결과로 돌아가기',
  previewTitle: '공유할 이미지 미리보기',
};

const panel = (page: Page) => page.locator('[data-share-panel]');
const group = (page: Page) => page.getByRole('group', { name: '결과 공유' });
const shareBtn = (page: Page, name: string) =>
  group(page).getByRole('button', { name, exact: true });

/** 카드 이미지가 준비될 때까지 기다린다(준비 중에는 버튼이 aria-disabled) */
const waitReady = (page: Page) =>
  expect(panel(page)).toHaveAttribute('data-share-status', 'ready', {
    timeout: 30_000,
  });

const horizontalOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );

const pageSize = (page: Page) =>
  page.evaluate(() => ({
    w: document.documentElement.scrollWidth,
    h: document.documentElement.scrollHeight,
  }));

/** PNG 시그니처와 IHDR에서 크기를 읽는다 */
async function readPng(download: Download) {
  const path = await download.path();
  const buf = readFileSync(path);
  return {
    size: buf.length,
    signature: buf.subarray(1, 4).toString('ascii'),
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function grantClipboard(context: BrowserContext) {
  return context.grantPermissions(['clipboard-read', 'clipboard-write']);
}

type ShareWindowType = {
  __shares: Array<{
    files: Array<{ name: string; type: string; size: number }>;
    text?: string;
    url?: string;
  }>;
  __shareAbort: boolean;
  __shareSettled: number;
};

/** 모바일 환경과 navigator.share를 모의한다. 호출은 window.__shares에 쌓인다 */
async function mockMobileShare(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as ShareWindowType;
    w.__shares = [];
    w.__shareAbort = false;
    w.__shareSettled = 0;
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const result = original(query);
      if (/pointer:\s*coarse|hover:\s*none/.test(query)) {
        return new Proxy(result, {
          get: (target, prop) =>
            prop === 'matches' ? true : Reflect.get(target, prop),
        });
      }
      return result;
    };
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        w.__shares.push({
          files: (data.files ?? []).map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
          })),
          text: data.text,
          url: data.url,
        });
        await new Promise((resolve) => setTimeout(resolve, 400));
        w.__shareSettled += 1;
        if (w.__shareAbort) throw new DOMException('cancel', 'AbortError');
      },
    });
  });
}

const shareCalls = (page: Page) =>
  page.evaluate(() => (window as unknown as ShareWindowType).__shares);

test.describe('뭐 먹지 PC 흐름', () => {
  test('AC-1, 14: 결과 전에는 공유 버튼이 없고, 결과 뒤 3버튼 링크 복사, PNG 저장(1080x1350), 이미지 복사가 동작하며 가로 스크롤이 없다', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    const errors = watchPageErrors(page);
    await openPage(page);
    await expect(panel(page)).toHaveCount(0);
    await expect(
      page.getByRole('button', {
        name: /^(링크 복사|이미지 저장|이미지 복사|공유하기)$/,
      })
    ).toHaveCount(0);

    await spinOnce(page);
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'desktop');
    await expect(shareBtn(page, '링크 복사')).toBeVisible();
    await expect(shareBtn(page, '이미지 저장')).toBeVisible();
    await waitReady(page);

    await shareBtn(page, '링크 복사').click();
    await expect(page.getByText(TEXT.linkCopied).first()).toBeVisible();

    const before = await pageSize(page);
    const downloadPromise = page.waitForEvent('download');
    await shareBtn(page, '이미지 저장').click();
    const png = await readPng(await downloadPromise);
    expect(png.size).toBeGreaterThan(0);
    expect(png.signature).toBe('PNG');
    expect(png.width).toBe(1080);
    expect(png.height).toBe(1350);
    await expect(page.getByText('이미지를 저장했어요').first()).toBeVisible();
    expect(await pageSize(page)).toEqual(before);

    const copyBtn = shareBtn(page, '이미지 복사');
    if ((await copyBtn.count()) > 0) {
      await copyBtn.click();
      await expect(page.getByText(TEXT.imageCopied).first()).toBeVisible();
    }

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(group(page)).toBeVisible();
      expect(await horizontalOverflow(page), `${width}px`).toBeLessThanOrEqual(
        0
      );
    }
    expect(errors.pageErrors).toEqual([]);
  });

  test('AC-3, 4: 이미지 만들기가 실패해도 링크 복사는 되고 빈 파일은 저장되지 않으며, 클립보드가 막히면 주소 안내가 나온다', async ({
    page,
    context,
  }) => {
    await grantClipboard(context);
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.toBlob = (cb: BlobCallback) => cb(null);
    });
    let downloads = 0;
    page.on('download', () => {
      downloads += 1;
    });
    await openPage(page);
    await spinOnce(page);

    await expect(panel(page)).toHaveAttribute('data-share-status', 'error', {
      timeout: 30_000,
    });
    await expect(
      page.getByRole('alert').getByText(TEXT.captureFailed)
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '이미지 다시 만들기' })
    ).toBeVisible();

    await shareBtn(page, '링크 복사').click();
    await expect(page.getByText(TEXT.linkCopied).first()).toBeVisible();

    await shareBtn(page, '이미지 저장').click();
    await expect(page.getByText(TEXT.captureFailed).first()).toBeVisible();
    expect(downloads).toBe(0);

    // 클립보드 쓰기 거부 -> 인라인 주소 안내
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await shareBtn(page, '링크 복사').click();
    await expect(page.getByText(TEXT.guideClipboardTitle)).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: '공유 주소' })
    ).toContainText('/meal');
    await page.getByRole('button', { name: TEXT.guideClose }).click();
    await expect(page.getByText(TEXT.guideClipboardTitle)).toHaveCount(0);
  });
});

test.describe('뭐 먹지 모바일 공유창', () => {
  test('AC-2: 공유 버튼 1개, 파일과 주소 전달, 빠른 두 번 클릭은 한 번, 취소는 조용하다', {
    tag: '@smoke',
  }, async ({ page }) => {
    await mockMobileShare(page);
    await openPage(page);
    await spinOnce(page);
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'mobile');
    await expect(group(page).getByRole('button')).toHaveCount(1);
    await waitReady(page);

    await shareBtn(page, '공유하기').dblclick();
    await expect.poll(() => shareCalls(page).then((c) => c.length)).toBe(1);
    const [call] = await shareCalls(page);
    expect(call.files).toHaveLength(1);
    expect(call.files[0].type).toBe('image/png');
    expect(call.files[0].size).toBeGreaterThan(0);
    expect(call.files[0].name).toMatch(/\.png$/);
    expect(`${call.text ?? ''}${call.url ?? ''}`).toContain('/meal');
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'mobile');

    // 처리 중 클릭은 무시되므로 첫 공유가 끝난 뒤, 사용자가 공유창을 닫으면 오류 안내가 없다
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as ShareWindowType).__shareSettled
        )
      )
      .toBe(1);
    await page.evaluate(() => {
      (window as unknown as ShareWindowType).__shareAbort = true;
    });
    await shareBtn(page, '공유하기').click();
    await expect.poll(() => shareCalls(page).then((c) => c.length)).toBe(2);
    await expect(shareBtn(page, '공유하기')).toBeVisible();
    await expect(group(page).getByRole('alert')).toHaveCount(0);
    await expect(page.getByText(/공유하지 못했어요/)).toHaveCount(0);
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'mobile');
  });
});

test.describe('카카오톡 Android 인앱', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 KAKAOTALK 2490150',
  });

  test('AC-4: 공유 버튼을 누르면 안내와 주소가 보이고 외부 실행 없이 결과로 돌아간다', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    let popups = 0;
    page.on('popup', () => {
      popups += 1;
    });
    await openPage(page);
    await spinOnce(page);
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'guide');
    const urlBefore = page.url();

    await shareBtn(page, '공유하기').click();
    await expect(page.getByText(TEXT.guideInAppTitle)).toBeVisible();
    await expect(page.getByText(/길게 눌러 복사/)).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: '공유 주소' })
    ).toContainText('/meal');
    expect(popups).toBe(0);
    expect(page.url()).toBe(urlBefore);

    await page.getByRole('button', { name: TEXT.guideClose }).click();
    await expect(page.getByText(TEXT.guideInAppTitle)).toHaveCount(0);
    await expect(shareBtn(page, '공유하기')).toBeVisible();
  });
});

test.describe('운빨 뽑기 이름 카드', () => {
  test('AC-17: 사다리 이미지 저장은 미리보기를 거치고, 기본으로 이름이 가려지며, 취소하면 아무것도 저장되지 않는다', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let downloads = 0;
    page.on('download', () => {
      downloads += 1;
    });
    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', lines('인물P', 3));
    await fillLines(page, '결과', lines('벌칙Q', 3));
    await button(page, '시작').click();
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'desktop');
    await waitReady(page);

    await shareBtn(page, '이미지 저장').click();
    const dialog = page.getByRole('dialog', { name: TEXT.previewTitle });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('img', { name: '공유될 이미지 미리보기' })
    ).toBeVisible();
    expect(downloads).toBe(0);
    await expect(
      dialog.getByRole('switch', { name: '이름 가리기' })
    ).toBeChecked();
    await expect(dialog).not.toContainText(/인물P\d\d/);
    await expect(dialog).toContainText(/인\*+/);

    await dialog.getByRole('button', { name: '취소' }).click();
    await expect(dialog).toHaveCount(0);
    expect(downloads).toBe(0);

    await shareBtn(page, '이미지 저장').click();
    await expect(dialog).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('button', { name: '이 내용으로 저장' }).click();
    const png = await readPng(await downloadPromise);
    expect(png.width).toBe(1080);
    expect(png.height).toBe(1350);
    await expect(dialog).toHaveCount(0);
  });

  test('AC-14: 돌림판 PNG는 1080x1350이고 저장 전후 레이아웃이 같으며 320px에서 가로 스크롤이 없다', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 800 });
    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', lines('항목R', 4));
    await button(page, '돌리기').click();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1, {
      timeout: 10_000,
    });
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'desktop');
    await waitReady(page);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    const before = await pageSize(page);
    await shareBtn(page, '이미지 저장').click();
    const dialog = page.getByRole('dialog', { name: TEXT.previewTitle });
    await expect(dialog).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('button', { name: '이 내용으로 저장' }).click();
    const png = await readPng(await downloadPromise);
    expect(png.size).toBeGreaterThan(0);
    expect(png.width).toBe(1080);
    expect(png.height).toBe(1350);
    await expect(dialog).toHaveCount(0);
    expect(await pageSize(page)).toEqual(before);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('로또 생성기 회귀', () => {
  test('AC-5: 공유하기는 기존 버튼이고, 지원하면 PNG를 공유창에 넘기고 지원하지 않으면 PNG를 내려받는다', async ({
    page,
  }) => {
    await mockMobileShare(page);
    await page.goto('/lotto/generator');
    await passLottoAgeGate(page);
    await declineCookies(page);
    await waitForHydration(page);
    await page.getByRole('button', { name: '번호 뽑기' }).click();
    const share = page.getByRole('button', { name: '공유하기' });
    await expect(share).toBeVisible();
    // 2차 F-3: 로또 생성기도 공통 공유 패널을 쓴다
    await expect(page.locator('[data-share-panel]')).toHaveCount(1);

    await share.click();
    await expect.poll(() => shareCalls(page).then((c) => c.length)).toBe(1);
    const [call] = await shareCalls(page);
    expect(call.files).toHaveLength(1);
    expect(call.files[0].type).toBe('image/png');
    expect(call.files[0].size).toBeGreaterThan(0);
    // 지원하지 않을 때 PNG 저장은 share-phase2.spec.ts AC-4(PC 모드)가 맡는다
  });
});
