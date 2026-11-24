import { expect, type Page, test } from '@playwright/test';
import { declineCookies, passLottoAgeGate } from './helpers/common.util';

// 확정 순서 (plan 확정 답변 3번)
const GROUP_LABELS = [
  '운세',
  '뭐 먹지',
  '타로',
  '운빨 뽑기',
  '꿈 해몽',
  '로또',
] as const;

// 서비스 목록 링크 안 라벨 요소. 링크 전체 이름은 설명이 섞여 쓰지 않는다
const homeLabel = (page: Page, label: string) =>
  page.getByRole('main').getByRole('link').getByText(label, { exact: true });

const bannerTitle = (page: Page) =>
  page.getByRole('heading', { level: 2, name: /\d+회 당첨 번호/ });

async function openHome(page: Page) {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
  await declineCookies(page);
}

test('AC-1, 2, 3: 홈 구성, 그룹 이동, 배너는 로또 메뉴 안에만 보인다', {
  tag: '@smoke',
}, async ({ page, request }) => {
  const res = await request.get('/api/lotto/draws?latest=1');
  expect(res.ok(), `최신 회차 조회 실패 (${res.status()})`).toBe(true);

  await openHome(page);

  // AC-1: h1 한 개, h1·히어로에 로또 없음, 준비 중 없음
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toBeVisible();
  await expect(h1).not.toContainText('로또');
  const hero = h1.locator('xpath=following-sibling::p');
  await expect(hero).toBeVisible();
  await expect(hero).not.toContainText('로또');
  await expect(page.getByText('준비 중')).toHaveCount(0);

  // AC-1: 그룹 라벨이 한 번씩, 위에서 아래로 확정 순서
  const ys: number[] = [];
  for (const label of GROUP_LABELS) {
    const el = homeLabel(page, label);
    await expect(el, label).toHaveCount(1);
    ys.push((await el.boundingBox())?.y ?? -1);
  }
  expect(ys.every((y) => y >= 0)).toBe(true);
  expect([...ys].sort((a, b) => a - b)).toEqual(ys);

  // AC-3: 홈에는 배너 없음
  await expect(bannerTitle(page)).toHaveCount(0);

  // AC-2: 운세 -> /fortune
  await homeLabel(page, '운세').click();
  await expect(page).toHaveURL(/\/fortune$/);

  // AC-2, 3: 로또 -> /lotto, 나이 확인 뒤 배너가 보인다
  await openHome(page);
  await homeLabel(page, '로또').click();
  await expect(page).toHaveURL(/\/lotto$/);
  await passLottoAgeGate(page);
  await expect(bannerTitle(page)).toBeVisible();
});
