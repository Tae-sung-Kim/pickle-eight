import { expect, type Page, test } from '@playwright/test';

const SITE_NAME = '운빨연구소';
const LOTTO_PAGES = [
  '/lotto',
  '/lotto/generator',
  '/lotto/history',
  '/lotto/check',
  '/lotto/my-numbers',
  '/lotto/analysis',
  '/lotto/simulator',
] as const;

// 개발 모드에서는 /lotto/* 진입 때마다 성인 확인 창이 뜬다
async function passAgeGate(page: Page) {
  const confirm = page.getByRole('button', { name: '만 19세 이상입니다' });
  await confirm.click({ timeout: 5000 }).catch(() => {
    /* 창이 없으면 그대로 진행 */
  });
}

const gameRows = (page: Page) => page.getByText(/^\d+게임$/);

test.describe('페이지 열림', () => {
  for (const path of LOTTO_PAGES) {
    test(`${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await passAgeGate(page);

      // 제목에 사이트명이 두 번 붙지 않는다
      const title = await page.title();
      const count = title.split(SITE_NAME).length - 1;
      expect(count, `제목: ${title}`).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }
});

test('옛 생성기 URL은 /lotto/generator로 이동한다', async ({ page }) => {
  for (const old of ['/lotto/normal-generator', '/lotto/advanced-generator']) {
    await page.goto(old);
    await expect(page).toHaveURL(/\/lotto\/generator$/);
  }
});

test.describe('번호 생성기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lotto/generator');
    await passAgeGate(page);
  });

  test('기본 5게임을 생성한다', async ({ page }) => {
    await page.getByRole('button', { name: '번호 뽑기' }).click();
    await expect(gameRows(page)).toHaveCount(5);
  });

  test('게임 수는 최대 20으로 제한된다', async ({ page }) => {
    await page.locator('#lotto-order-count').fill('99');
    await expect(page.locator('#lotto-order-count')).toHaveValue('20');
    await page.getByRole('button', { name: '번호 뽑기' }).click();
    await expect(gameRows(page)).toHaveCount(20);
  });

  test('고급 옵션을 켜면 조건이 보이고 생성된다', async ({ page }) => {
    await expect(page.getByText('합계 최소')).toHaveCount(0);
    await page.getByRole('switch', { name: '고급 옵션 사용' }).click();
    await expect(page.getByText('합계 최소')).toBeVisible();
    await page.getByRole('button', { name: '번호 뽑기' }).click();
    await expect(gameRows(page)).toHaveCount(5);
  });

  test('PC 폭에서는 결과가 2단으로 보인다', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'PC 폭에서만 확인');
    await page.getByRole('button', { name: '번호 뽑기' }).click();
    const first = await gameRows(page).nth(0).boundingBox();
    const second = await gameRows(page).nth(1).boundingBox();
    expect(Math.abs((first?.y ?? 0) - (second?.y ?? 99999))).toBeLessThan(10);
    expect(second?.x ?? 0).toBeGreaterThan(first?.x ?? 0);
  });
});

test('PC 헤더에 준비 중 배지가 보인다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'PC 헤더만 확인');
  await page.goto('/');
  await expect(
    page.locator('header').getByText('준비 중').first()
  ).toBeVisible();
});

// DB(Supabase)에 연결된 환경에서만 통과한다
test('핫/콜드 API가 통계를 돌려준다', async ({ request }) => {
  const res = await request.get('/api/lotto/stats/hot-cold');
  expect(res.ok()).toBe(true);
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.data.latest).toBeGreaterThan(0);
  expect(Object.keys(json.data.frequency)).toHaveLength(45);
});
