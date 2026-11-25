import { expect, type Page, test } from '@playwright/test';
import {
  declineCookies,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';

// 한국 시간 낮 12시 (UTC 03:00)로 브라우저 시각을 고정한다. 설계 7.3절
const at = (ymd: string) => new Date(`${ymd}T12:00:00+09:00`);

const prevButton = (page: Page) =>
  page.getByRole('button', { name: '이전 달' });
const nextButton = (page: Page) =>
  page.getByRole('button', { name: '다음 달' });
const monthHeading = (page: Page) =>
  page.getByRole('main').getByRole('heading', { name: /^\d{4}년 \d{1,2}월$/ });

async function openHub(page: Page, ymd: string) {
  await page.clock.install({ time: at(ymd) });
  const response = await page.goto('/no-son-days');
  expect(response?.status()).toBeLessThan(400);
  await declineCookies(page);
  await waitForHydration(page);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test('AC-1, 2: 허브 구성과 달력 이동, 칸 표기, 공통 검사, 320px 7열', {
  tag: '@smoke',
}, async ({ page }) => {
  const errors = watchPageErrors(page);
  await openHub(page, '2026-11-25');

  // 공통: h1 한 개, 메타
  const h1 = page.getByRole('heading', { level: 1, name: '손 없는 날 달력' });
  await expect(h1).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page).toHaveTitle(/손 없는 날/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /.+/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/no-son-days$/
  );

  // AC-1: h1 바로 아래 면책 고지
  const notice = page.getByRole('complementary').filter({
    hasText: '민간 풍습',
  });
  await expect(notice).toBeVisible();
  const h1Box = await h1.boundingBox();
  const noticeBox = await notice.boundingBox();
  expect(noticeBox?.y ?? 0).toBeGreaterThan(h1Box?.y ?? 0);

  // AC-1: 오늘 판정, 다음 손 없는 날(양력 날짜 요일, 음력, 남은 날수), 달력이 상태 카드 뒤
  await expect(
    page.getByText(/^오늘은 손 없는 날(입니다|이 아닙니다)$/)
  ).toBeVisible();
  await expect(
    page.getByText('다음 손 없는 날', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(/^\d{1,2}월 \d{1,2}일 [일월화수목금토]요일$/)
  ).toHaveCount(2);
  await expect(page.getByText(/^음력 윤?\d{1,2}월 \d{1,2}일$/)).toHaveCount(2);
  await expect(page.getByText(/^(내일|\d+일 뒤)$/)).toBeVisible();

  // AC-1: 이번 달 달력, 7열
  await expect(monthHeading(page)).toHaveText('2026년 11월');
  await expect(page.getByRole('columnheader')).toHaveCount(7);

  // AC-2: 칸에 양력·음력, 손 없는 날은 글자로 구분
  const cells = page.getByRole('cell').filter({ hasText: /\d+\.\d+/ });
  await expect(cells.first()).toBeVisible();
  const noSonCells = page.getByRole('cell').filter({
    hasText: /손 없는 날$/,
  });
  expect(await noSonCells.count()).toBeGreaterThanOrEqual(5);
  expect(await noSonCells.count()).toBeLessThanOrEqual(6);
  await expect(page.getByText(/^11월 손 없는 날 \d+일: /)).toBeVisible();

  // AC-2: 달 이동
  await nextButton(page).click();
  await expect(monthHeading(page)).toHaveText('2026년 12월');
  await prevButton(page).click();
  await prevButton(page).click();
  await expect(monthHeading(page)).toHaveText('2026년 10월');

  // 공통: 광고가 꺼져 있으면 전역 하단 광고 감싸는 요소가 숨겨져 간격이 남지 않는다
  const wrappers = await page.evaluate(() =>
    [...document.querySelectorAll('div.empty\\:hidden')]
      .filter((el) => el.children.length === 0)
      .map((el) => getComputedStyle(el).display)
  );
  for (const display of wrappers) expect(display).toBe('none');

  // AC-1: 320px에서 가로 스크롤 없이 7열
  await page.setViewportSize({ width: 320, height: 800 });
  await expectNoHorizontalScroll(page);
  const heads = page.getByRole('columnheader');
  await expect(heads).toHaveCount(7);
  const first = await heads.first().boundingBox();
  const last = await heads.last().boundingBox();
  expect((last?.x ?? 0) + (last?.width ?? 0)).toBeLessThanOrEqual(320);
  expect(first?.x ?? -1).toBeGreaterThanOrEqual(0);

  expect(errors.pageErrors).toEqual([]);
  expect(errors.hydration).toEqual([]);
});

test('AC-2: 윤달 칸 표기가 320px에서 줄바꿈 없이 보인다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  // 2028년 윤5월 구간
  await openHub(page, '2028-07-05');
  await expect(monthHeading(page)).toHaveText('2028년 7월');
  const leap = page.getByRole('cell').filter({ hasText: /윤\d+\.\d+/ });
  await expect(leap.first()).toBeVisible();
  const label = leap.first().getByText(/^윤\d+\.\d+$/);
  const lineHeight = await label.evaluate((el) =>
    Number.parseFloat(getComputedStyle(el).lineHeight)
  );
  const box = await label.boundingBox();
  expect(box?.height ?? 0).toBeLessThanOrEqual(lineHeight + 1);
  await expectNoHorizontalScroll(page);
});

test('AC-2: 표시 범위 끝에서 이동 버튼이 비활성이다', async ({ page }) => {
  await openHub(page, '2026-01-10');
  await expect(monthHeading(page)).toHaveText('2026년 1월');
  await expect(prevButton(page)).toHaveAttribute('aria-disabled', 'true');
  await prevButton(page).click({ force: true });
  await expect(monthHeading(page)).toHaveText('2026년 1월');
  await expect(nextButton(page)).toHaveAttribute('aria-disabled', 'false');
});

test('AC-2: 2049년 12월과 범위 밖 오늘 상태', async ({ page }) => {
  await openHub(page, '2050-01-01');
  await expect(
    page.getByText(/표시 범위\(2026년 1월~2049년 12월\) 밖/)
  ).toBeVisible();
  await expect(monthHeading(page)).toHaveText('2049년 12월');
  await expect(nextButton(page)).toHaveAttribute('aria-disabled', 'true');
  await nextButton(page).click({ force: true });
  await expect(monthHeading(page)).toHaveText('2049년 12월');
  await expect(prevButton(page)).toHaveAttribute('aria-disabled', 'false');
});

test('AC-3: 연도 링크로 연도 화면에 가면 12개월 목록과 음력이 보인다', async ({
  page,
}) => {
  const errors = watchPageErrors(page);
  await openHub(page, '2026-11-25');

  await page.getByRole('link', { name: '2027년 손 없는 날' }).click();
  await expect(page).toHaveURL(/\/no-son-days\/2027$/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: '2027년 손 없는 날' })
  ).toBeVisible();
  await expect(page).toHaveTitle(/2027/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/no-son-days\/2027$/
  );

  // 1월~12월 카드
  for (let m = 1; m <= 12; m += 1) {
    await expect(
      page.getByRole('heading', { level: 2, name: `${m}월`, exact: true })
    ).toBeVisible();
  }
  await expect(
    page.getByText(/^\d{1,2}일 \([일월화수목금토]\)$/).first()
  ).toBeVisible();
  await expect(
    page.getByText(/^음력 윤?\d{1,2}월 \d{1,2}일$/).first()
  ).toBeVisible();

  // 현재 연도는 링크가 아니라 현재 표시
  await expect(page.getByText('2027', { exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(
    page.getByRole('link', { name: '2027년 손 없는 날' })
  ).toHaveCount(0);

  // 월 바로가기는 lg 이상에서 숨김
  await expect(
    page.getByRole('navigation', { name: '월 바로가기' })
  ).toBeHidden();

  // 320px 가로 스크롤 없음, 월 바로가기 보임
  await page.setViewportSize({ width: 320, height: 800 });
  await expectNoHorizontalScroll(page);
  await expect(
    page.getByRole('navigation', { name: '월 바로가기' })
  ).toBeVisible();

  expect(errors.pageErrors).toEqual([]);
});

for (const width of [1024, 1280]) {
  test(`헤더: ${width}px에서 메뉴가 줄바꿈·넘침 없이 한 줄이다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openHub(page, '2026-11-25');

    const header = page.getByRole('banner');
    const links = header.getByRole('link');
    const n = await links.count();
    const boxes = [];
    for (let i = 0; i < n; i += 1) {
      const b = await links.nth(i).boundingBox();
      if (b && b.width > 0) boxes.push(b);
    }
    expect(boxes.length).toBeGreaterThan(6);
    const tops = boxes.map((b) => b.y);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(24);
    for (const b of boxes) expect(b.x + b.width).toBeLessThanOrEqual(width);
    const headerBox = await header.boundingBox();
    expect(headerBox?.height ?? 0).toBeLessThanOrEqual(65);
    await expect(
      header.getByRole('link', { name: '손 없는 날' })
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
}
