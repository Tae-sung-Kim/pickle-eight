import { expect, type Page, test } from '@playwright/test';
import {
  declineCookies,
  passLottoAgeGate,
  waitForHydration,
} from './helpers/common.util';

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

const gameRows = (page: Page) => page.getByText(/^\d+게임$/);

async function openLotto(page: Page, path: string) {
  await page.goto(path);
  await passLottoAgeGate(page);
  await declineCookies(page);
  await waitForHydration(page);
}

const footerNotice = (page: Page) =>
  page
    .locator('footer')
    .filter({ hasText: '비공식 서비스' })
    .getByText('당첨을 보장하지 않습니다');

test('번호 생성: 기본 5게임, 최대 20게임, 당첨 비보장 고지', {
  tag: '@smoke',
}, async ({ page, request }) => {
  const res = await request.get('/api/lotto/draws?latest=1');
  expect(res.ok(), `최신 회차 조회 실패 (${res.status()})`).toBe(true);
  const latest = (await res.json()).data.lastDrawNumber as number;

  // 정적 페이지는 푸터가 서버 HTML에 있어 hydration을 기다리지 않는다.
  for (const path of [
    '/lotto',
    '/lotto/history',
    '/lotto/check',
    '/lotto/my-numbers',
    `/lotto/${latest}`,
  ]) {
    await page.goto(path);
    if (path === '/lotto') await passLottoAgeGate(page);
    await expect(footerNotice(page), path).toBeVisible();
  }

  for (const path of [
    '/lotto/analysis',
    '/lotto/simulator',
    '/lotto/generator',
  ]) {
    await openLotto(page, path);
    await expect(footerNotice(page), path).toBeVisible();
  }

  await page.getByRole('button', { name: '번호 뽑기' }).click();
  await expect(gameRows(page)).toHaveCount(5);

  await page.locator('#lotto-order-count').fill('99');
  await expect(page.locator('#lotto-order-count')).toHaveValue('20');
  await page.getByRole('button', { name: '번호 뽑기' }).click();
  await expect(gameRows(page)).toHaveCount(20);
});

test('고급 옵션을 켜면 조건이 보이고 생성된다', async ({ page }) => {
  await openLotto(page, '/lotto/generator');
  await expect(page.getByText('합계 최소')).toHaveCount(0);
  await page.getByRole('switch', { name: '고급 옵션 사용' }).click();
  await expect(page.getByText('합계 최소')).toBeVisible();
  await page.getByRole('button', { name: '번호 뽑기' }).click();
  await expect(gameRows(page)).toHaveCount(5);
});

test('채점 후 전체 저장하면 나의 번호에 나타난다', async ({ page }) => {
  const picked = [1, 7, 13, 22, 30, 41];
  await openLotto(page, '/lotto/check');

  const inputs = page.getByPlaceholder('--');
  for (const [i, n] of picked.entries()) {
    await inputs.nth(i).fill(String(n));
  }
  await page.getByRole('button', { name: '채점하기' }).click();
  const save = page.getByRole('button', { name: '전체 저장' });
  await expect(save).toBeVisible();
  await save.click();
  await expect(page.getByText(/게임을 저장했습니다/)).toBeVisible();

  // localStorage는 같은 컨텍스트라 이동해도 유지된다
  await openLotto(page, '/lotto/my-numbers');
  const balls = page
    .locator('main li span.rounded-full')
    .filter({ hasText: /^\d{1,2}$/ });
  await expect(balls.first()).toBeVisible();
  const shown = (await balls.allTextContents())
    .map((t) => t.trim())
    .slice(0, 6)
    .map(Number);
  expect(shown).toEqual(picked);
});

test('옛 생성기 URL 2개는 /lotto/generator로 이동한다', async ({ page }) => {
  for (const old of ['/lotto/normal-generator', '/lotto/advanced-generator']) {
    await page.goto(old);
    await expect(page).toHaveURL(/\/lotto\/generator$/);
  }
});

test('PC 헤더에 준비 중 배지가 없다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'PC 헤더만 확인');
  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('header').getByText('준비 중')).toHaveCount(0);
  await expect(page.getByText('준비 중')).toHaveCount(0);
});

test('핫/콜드 분석: 범위 조회 결과 목록이 5개씩 보인다', async ({
  page,
  request,
}) => {
  const res = await request.get('/api/lotto/draws?latest=1');
  expect(res.ok(), `최신 회차 조회 실패 (${res.status()})`).toBe(true);
  const to = (await res.json()).data.lastDrawNumber as number;
  const from = to - 99;

  await openLotto(page, '/lotto/analysis');
  await page.getByRole('button', { name: '회차 범위 모드' }).click();
  await page
    .getByText('From(회차)')
    .locator('xpath=following::input[1]')
    .fill(String(from));
  await page
    .getByText('To(회차)')
    .locator('xpath=following::input[1]')
    .fill(String(to));
  await page.getByRole('button', { name: '조회' }).click();

  for (const title of [
    '자주 나온 번호(전체 빈도)',
    '오랫동안 안 나온 번호(지연)',
  ]) {
    await expect(
      page.getByText(title).locator('xpath=following-sibling::ul[1]/li')
    ).toHaveCount(5);
  }
});

test('SEO: 서버 HTML의 메타, h1, JSON-LD, sitemap', async ({ request }) => {
  for (const path of LOTTO_PAGES) {
    await test.step(path, async () => {
      const res = await request.get(path);
      expect(res.status()).toBeLessThan(400);
      const html = await res.text();
      expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/);
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
      expect(title, `제목 없음: ${path}`).not.toBe('');
      expect(
        title.split(SITE_NAME).length - 1,
        `제목: ${title}`
      ).toBeLessThanOrEqual(1);
      expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]+"/);
      expect(html).toMatch(/<link[^>]+rel="canonical"[^>]+href="[^"]+"/);
      expect(html).toMatch(/<meta[^>]+property="og:title"/);
      expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
      const ld = [
        ...html.matchAll(
          /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
        ),
      ];
      for (const m of ld) expect(() => JSON.parse(m[1])).not.toThrow();
    });
  }
  await test.step('sitemap', async () => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('/lotto');
  });
});
