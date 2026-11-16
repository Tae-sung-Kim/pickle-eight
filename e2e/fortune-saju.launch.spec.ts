import { expect, test } from '@playwright/test';

// SJ-QA4: 사주 출시 후 검사 (AC-88, AC-89)

test('AC-89: /fortune/saju 응답과 HTML에 noindex가 없고 title·description·canonical·h1 하나가 있다', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto('/fortune/saju');
  expect(res?.status() ?? 0).toBeLessThan(400);
  expect(res?.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex/i);
  const robots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('content') ?? ''));
  for (const content of robots) expect(content).not.toMatch(/noindex/i);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /.+/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/fortune\/saju$/
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('AC-89: sitemap.xml에 /fortune/saju가 있다', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBeLessThan(400);
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname
  );
  expect(paths).toContain('/fortune/saju');
});

test('AC-88: 360px 모바일 메뉴에서 운세 그룹 4항목이 가로로 넘치지 않고 높이가 비슷하다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/fortune');
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const heights: number[] = [];
  for (const label of ['오늘의 운세', '띠별 운세', '별자리 운세', '사주']) {
    const link = dialog.getByRole('link', { name: label, exact: true });
    await expect(link, label).toBeVisible();
    // 시트 열림 애니메이션이 끝나 링크 오른쪽 끝이 화면 안에 들어올 때까지 자동 재시도
    await expect
      .poll(async () => {
        const b = await link.boundingBox();
        return (b?.x ?? 0) + (b?.width ?? 0);
      }, label)
      .toBeLessThanOrEqual(360);
    const box = await link.boundingBox();
    heights.push(box?.height ?? 0);
  }
  // 한 줄 항목 높이의 1.5배를 넘는 항목(줄바꿈 깨짐)이 없다
  const min = Math.min(...heights);
  for (const h of heights) expect(h).toBeLessThanOrEqual(min * 1.5);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
});

test('AC-88: 허브 목록에 사주 링크가 보인다', async ({ page }) => {
  await page.goto('/fortune');
  const link = page
    .getByRole('main')
    .getByRole('link', { name: /^사주/ })
    .first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/fortune/saju');
});
