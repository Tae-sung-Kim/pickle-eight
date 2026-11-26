import { readFileSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { FORTUNE_CONSENT_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  declineCookies,
  passLottoAgeGate,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';

// 공유 2차 대표 흐름(AC-1~4). 문구·범위 규칙은 unit/share/, 실기기(AC-11)는 수동.

test.beforeEach(() => test.setTimeout(120_000));

const NOW = '2026-11-05T09:00:00+09:00';
const CAPTURE_FAILED = '이미지를 만들지 못했어요. 링크로 공유해 주세요';
const LINK_COPIED = '링크를 복사했어요';

const panel = (page: Page) => page.locator('[data-share-panel]');
const group = (page: Page) => page.getByRole('group', { name: '결과 공유' });
const shareBtn = (page: Page, name: string) =>
  group(page).getByRole('button', { name, exact: true });
const waitReady = (page: Page) =>
  expect(panel(page)).toHaveAttribute('data-share-status', 'ready', {
    timeout: 30_000,
  });
const overflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );

type ShareWindowType = {
  __shares: Array<{
    files: Array<{ type: string; size: number }>;
    text?: string;
    url?: string;
  }>;
  __shareAbort: boolean;
  __shareSettled: number;
};

/** 모바일 환경과 navigator.share를 모의한다 */
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
          get: (t, prop) => (prop === 'matches' ? true : Reflect.get(t, prop)),
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
            type: f.type,
            size: f.size,
          })),
          text: data.text,
          url: data.url,
        });
        await new Promise((r) => setTimeout(r, 300));
        w.__shareSettled += 1;
        if (w.__shareAbort) throw new DOMException('cancel', 'AbortError');
      },
    });
  });
}

const shareCalls = (page: Page) =>
  page.evaluate(() => (window as unknown as ShareWindowType).__shares);

async function openFortune(page: Page, path: string, panelTitle: string) {
  await page.clock.setFixedTime(new Date(NOW));
  const res = await page.goto(path);
  expect(res?.status(), path).toBeLessThan(400);
  await declineCookies(page);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_CONSENT_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  for (const item of FORTUNE_CONSENT_TEXTS.items) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
  await page
    .getByRole('button', {
      name: FORTUNE_CONSENT_TEXTS.grantButton,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: panelTitle, exact: true })
  ).toBeVisible();
}

async function submitBirth(page: Page, submit: string) {
  await page.getByRole('radio', { name: '양력', exact: true }).check({
    force: true,
  });
  await page.getByLabel('연도', { exact: true }).fill('1990');
  await page.getByLabel('월', { exact: true }).fill('5');
  await page.getByLabel('일', { exact: true }).fill('15');
  await page.getByRole('button', { name: submit, exact: true }).click();
}

const SHARE_NAMES = /^(링크 복사|이미지 저장|이미지 복사|공유하기)$/;

test('AC-1: 오늘의 운세 결과 전에는 공유 버튼이 없고, 결과 뒤 링크 복사와 PNG 저장이 되며 320px에서 가로 스크롤이 없다', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors = watchPageErrors(page);
  await openFortune(page, FORTUNE_ROUTES.today, '생년월일 입력');
  await expect(page.getByRole('button', { name: SHARE_NAMES })).toHaveCount(0);

  await submitBirth(page, '운세 보기');
  await expect(panel(page)).toHaveAttribute('data-share-mode', 'desktop');
  await expect(shareBtn(page, '링크 복사')).toBeVisible();
  await expect(shareBtn(page, '이미지 저장')).toBeVisible();
  await waitReady(page);

  await shareBtn(page, '링크 복사').click();
  await expect(page.getByText(LINK_COPIED).first()).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await shareBtn(page, '이미지 저장').click();
  const buf = readFileSync((await (await downloadPromise).path()) as string);
  expect(buf.length).toBeGreaterThan(0);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(group(page)).toBeVisible();
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors.pageErrors).toEqual([]);
});

for (const [name, path, title, submit] of [
  ['띠별 운세', FORTUNE_ROUTES.tti, '띠 고르기', '내 띠 찾기'],
  ['별자리 운세', FORTUNE_ROUTES.starSign, '별자리 고르기', '내 별자리 찾기'],
] as const) {
  test(`AC-2: ${name} 모바일 공유창에 PNG와 주소가 전달되고 닫아도 오류가 없다`, async ({
    page,
  }) => {
    await mockMobileShare(page);
    await openFortune(page, path, title);
    await submitBirth(page, submit);
    await expect(panel(page)).toHaveAttribute('data-share-mode', 'mobile');
    await expect(group(page).getByRole('button')).toHaveCount(1);
    await waitReady(page);

    await shareBtn(page, '공유하기').click();
    await expect.poll(() => shareCalls(page).then((c) => c.length)).toBe(1);
    const [call] = await shareCalls(page);
    expect(call.files).toHaveLength(1);
    expect(call.files[0].type).toBe('image/png');
    expect(call.files[0].size).toBeGreaterThan(0);
    expect(`${call.text ?? ''}${call.url ?? ''}`).toContain(path);

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
  });
}

test('AC-3: 운세에서 이미지 만들기가 실패하면 안내가 뜨고 링크 복사는 되며 빈 파일은 저장되지 않는다', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.toBlob = (cb: BlobCallback) => cb(null);
  });
  let downloads = 0;
  page.on('download', () => {
    downloads += 1;
  });
  await openFortune(page, FORTUNE_ROUTES.today, '생년월일 입력');
  await submitBirth(page, '운세 보기');
  await expect(panel(page)).toHaveAttribute('data-share-status', 'error', {
    timeout: 30_000,
  });
  await expect(page.getByRole('alert').getByText(CAPTURE_FAILED)).toBeVisible();

  await shareBtn(page, '링크 복사').click();
  await expect(page.getByText(LINK_COPIED).first()).toBeVisible();
  await shareBtn(page, '이미지 저장').click();
  await expect(page.getByText(CAPTURE_FAILED).first()).toBeVisible();
  expect(downloads).toBe(0);
});

test('AC-4: 로또 생성기는 번호 생성 뒤 공유 버튼이 보이고 PNG 저장, 모바일 공유창 전달, 빠른 두 번 클릭은 한 번만 실행된다', async ({
  page,
  browser,
}) => {
  const open = async (p: Page) => {
    await p.goto('/lotto/generator');
    await passLottoAgeGate(p);
    await declineCookies(p);
    await waitForHydration(p);
  };

  // PC: 번호 전에는 없고, 생성 뒤 PNG 저장
  await open(page);
  await expect(page.getByRole('button', { name: SHARE_NAMES })).toHaveCount(0);
  await page.getByRole('button', { name: '번호 뽑기' }).click();
  await expect(shareBtn(page, '이미지 저장')).toBeVisible();
  await waitReady(page);
  const downloadPromise = page.waitForEvent('download');
  await shareBtn(page, '이미지 저장').click();
  const buf = readFileSync((await (await downloadPromise).path()) as string);
  expect(buf.length).toBeGreaterThan(0);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');

  // 모바일 판정: 공유창에 PNG, 빠른 두 번 클릭은 한 번
  const mobile = await (await browser.newContext()).newPage();
  await mockMobileShare(mobile);
  await open(mobile);
  await mobile.getByRole('button', { name: '번호 뽑기' }).click();
  await expect(panel(mobile)).toHaveAttribute('data-share-mode', 'mobile');
  await waitReady(mobile);
  await shareBtn(mobile, '공유하기').dblclick();
  await expect.poll(() => shareCalls(mobile).then((c) => c.length)).toBe(1);
  const [call] = await shareCalls(mobile);
  expect(call.files).toHaveLength(1);
  expect(call.files[0].type).toBe('image/png');
  expect(call.files[0].size).toBeGreaterThan(0);
  expect(await shareCalls(mobile)).toHaveLength(1);
});
