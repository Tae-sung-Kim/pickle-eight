import { readFileSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  declineCookies,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';

// 공유 3차(타로) 대표 흐름(AC-1~3). 문구·범위 규칙은 unit/, 실기기(AC-10)와 그림 닮음은 수동.

test.beforeEach(() => test.setTimeout(120_000));

const DAILY_PATH = '/tarot/daily';
const THREE_PATH = '/tarot/three-card';
const CRISIS_TITLE = '카드를 보기 전에 전해 드릴 안내가 있습니다';

const group = (page: Page) => page.getByRole('group', { name: '결과 공유' });
const panel = (page: Page) => page.locator('[data-share-panel]');
const overflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );

async function open(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), path).toBeLessThan(400);
  await declineCookies(page);
  await waitForHydration(page);
}

const dailyHeading = (page: Page) =>
  page.getByRole('heading', { level: 2, name: /\(.+\)$/ });

/** 저장 버튼을 눌러 받은 PNG 버퍼. 540x675의 정수 배율(4:5)인지 IHDR로 확인한다 */
async function savePng(page: Page): Promise<void> {
  await expect(panel(page)).toHaveAttribute('data-share-status', 'ready', {
    timeout: 30_000,
  });
  const download = page.waitForEvent('download');
  await group(page)
    .getByRole('button', { name: '이미지 저장', exact: true })
    .click();
  const buf = readFileSync((await (await download).path()) as string);
  expect(buf.length).toBeGreaterThan(0);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  expect(w % 540).toBe(0);
  expect(h * 4).toBe(w * 5);
}

test('AC-1: 오늘의 타로는 뽑기 전 공유 버튼이 없고, 뒤집기 뒤 PNG가 저장되며 320px에서 가로 스크롤이 없다', async ({
  page,
}) => {
  const errors = watchPageErrors(page);
  await open(page, DAILY_PATH);
  await expect(group(page)).toHaveCount(0);

  await page.getByRole('button', { name: '카드 뽑기', exact: true }).click();
  await expect(dailyHeading(page)).toBeVisible();
  await expect(group(page)).toBeVisible({ timeout: 15_000 });
  await savePng(page);

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(group(page)).toBeVisible();
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors.pageErrors).toEqual([]);
});

test('AC-1 보강: 같은 날 복원된 오늘의 카드에는 공유 버튼이 없다 (구현 기준, plan 74행과 불일치 보고)', async ({
  page,
}) => {
  await open(page, DAILY_PATH);
  await page.getByRole('button', { name: '카드 뽑기', exact: true }).click();
  await expect(group(page)).toBeVisible({ timeout: 15_000 });

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByText(/오늘 뽑은 카드입니다/)).toBeVisible();
  await expect(dailyHeading(page)).toBeVisible();
  await expect(group(page)).toHaveCount(0);
});

test('AC-2: 세 장 뽑기는 뒤집기 뒤 3장 PNG가 저장되며 320px에서 가로 스크롤이 없다', async ({
  page,
}) => {
  const errors = watchPageErrors(page);
  await open(page, THREE_PATH);
  await expect(group(page)).toHaveCount(0);

  await page.getByRole('button', { name: '세 장 뽑기', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 2, name: '세 장의 결과' })
  ).toBeVisible();
  await expect(group(page)).toBeVisible({ timeout: 20_000 });
  await savePng(page);

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(group(page)).toBeVisible();
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors.pageErrors).toEqual([]);
});

for (const [name, path, drawLabel, resultHeading] of [
  ['오늘의 타로', DAILY_PATH, '카드 뽑기', null],
  ['세 장', THREE_PATH, '세 장 뽑기', '세 장의 결과'],
] as const) {
  test(`AC-3: ${name} 위기 표현으로 뽑아 계속 본 뒤 입력창을 지워도 공유 버튼이 없다`, async ({
    page,
  }) => {
    await open(page, path);
    const question = page.getByLabel('질문 (선택)');
    await question.fill('죽고 싶어');
    await page.getByRole('button', { name: drawLabel, exact: true }).click();

    const region = page.getByRole('region', { name: CRISIS_TITLE });
    await expect(region).toBeVisible();
    await region.getByRole('button', { name: '계속 보기' }).click();
    await expect(region).toBeHidden();
    await expect(
      resultHeading
        ? page.getByRole('heading', { level: 2, name: resultHeading })
        : dailyHeading(page)
    ).toBeVisible();
    await expect(group(page)).toHaveCount(0, { timeout: 5_000 });

    // 입력창을 지워도 뽑을 때 저장한 위기 상태가 유지된다
    if (await question.isVisible()) await question.fill('');
    await expect(group(page)).toHaveCount(0, { timeout: 5_000 });
  });
}

test('AC-3 보강: 타로 카드는 78장', () => {
  expect(TAROT_CARDS.length).toBe(78);
});
