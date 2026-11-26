import { expect, test } from '@playwright/test';
import { declineCookies, watchPageErrors } from './helpers/common.util';

test.use({ viewport: { width: 360, height: 740 } });

test('AC-1, 2, 3: 360px 홈에서 헤더 이름·푸터 문구가 보이고 CSP 오류가 없다', async ({
  page,
}) => {
  const csp: string[] = [];
  page.on('console', (msg) => {
    if (/Content Security Policy/i.test(msg.text())) csp.push(msg.text());
  });
  const { pageErrors } = watchPageErrors(page);

  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(400);
  await declineCookies(page);

  const header = page.getByRole('banner');
  const name = header.getByRole('link').first().locator('span').last();
  await expect(name).toBeVisible();
  await expect(name).not.toBeEmpty();
  const menu = header.getByRole('button', { name: '메뉴 열기' });
  await expect(menu).toBeVisible();
  const a = await name.boundingBox();
  const b = await menu.boundingBox();
  if (!a || !b) throw new Error('boundingBox 없음');
  expect(a.x + a.width).toBeLessThanOrEqual(b.x);

  const footer = page.getByRole('contentinfo');
  await expect(footer.getByText('운을 데이터로, 재미로.')).toBeVisible();
  await expect(
    footer.getByText(
      '운세, 궁합, 타로, 꿈 해몽, 로또, 메뉴 고르기, 뽑기까지 가볍게 즐겨보세요.'
    )
  ).toBeVisible();

  expect(csp).toEqual([]);
  expect(pageErrors).toEqual([]);
});
