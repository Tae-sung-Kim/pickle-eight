import { expect, type Page, test } from '@playwright/test';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import { LUNCH_MENUS } from '@/features/lunch/constants/lunch-menu.constant';
import * as notice from '@/features/lunch/constants/lunch-notice.constant';
import { declineCookies, watchPageErrors } from './helpers/common.util';

// 점심 추천 화면 흐름 5개. 데이터·문구 검사는 unit/lunch/가 맡는다.

const PATH = '/lunch/today';
const MENU_NAMES = LUNCH_MENUS.map((m) => m.name);
const CATEGORY_LABELS = LUNCH_CATEGORIES.map((c) => c.label);
const SPIN = notice.LUNCH_SPIN_BUTTON_LABEL;
const RESPIN = notice.LUNCH_RESPIN_BUTTON_LABEL;
const CLEAR_BROTH = notice.LUNCH_CLEAR_BROTH_BUTTON_LABEL;

test.beforeEach(() => {
  // 개발 서버 첫 컴파일이 느릴 수 있다
  test.setTimeout(90_000);
});

const main = (page: Page) => page.getByRole('main');
const spinButton = (page: Page) =>
  page.getByRole('button', { name: new RegExp(`^(${SPIN}|${RESPIN})$`) });
const resultRegion = (page: Page) =>
  page.getByRole('region', { name: new RegExp(`^(${MENU_NAMES.join('|')})$`) });
const announce = (page: Page) =>
  page.getByRole('status').filter({ hasText: '뽑힌 메뉴는' });
const chip = (page: Page, label: string) =>
  page.getByRole('button', { name: label, exact: true });
const mapLinks = (page: Page) =>
  main(page).getByRole('link', { name: /^(카카오맵|네이버지도|구글 지도)/ });

/** 외부 지도 사이트는 실제로 접속하지 않고 가로챈다 */
async function stubMaps(page: Page): Promise<void> {
  await page
    .context()
    .route(
      /^https:\/\/((m\.)?map\.(kakao|naver)\.com\/|www\.google\.com\/maps\/)/,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><title>stub</title><p>stub</p>',
        })
    );
}

/** 이동, h1 확인, 칩이 반응할 때까지(하이드레이션) 반복, 쿠키 배너 닫기 */
async function openPage(page: Page): Promise<void> {
  const res = await page.goto(PATH);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const probe = chip(page, '한식');
  await expect(async () => {
    await probe.click();
    await expect(probe).toHaveAttribute('aria-pressed', 'false', {
      timeout: 1000,
    });
  }).toPass();
  await probe.click();
  await expect(probe).toHaveAttribute('aria-pressed', 'true');
  await declineCookies(page);
}

async function spinOnce(page: Page): Promise<string> {
  await spinButton(page).click();
  await expect(announce(page)).toBeVisible({ timeout: 5000 });
  const text = (await announce(page).textContent()) ?? '';
  const m = /뽑힌 메뉴는 (.+)\((.+)\)입니다/.exec(text);
  expect(m, `알림 문장: ${text}`).not.toBeNull();
  return m?.[1] ?? '';
}

test.describe('추천과 필터', () => {
  test('AC-1, AC-2, AC-9: 룰렛을 돌리면 후보 안의 메뉴 하나와 면책이 보인다', {
    tag: '@smoke',
  }, async ({ page }) => {
    const errors = watchPageErrors(page);
    await openPage(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(spinButton(page)).toHaveText(SPIN);
    const name = await spinOnce(page);
    expect(MENU_NAMES).toContain(name);
    const region = resultRegion(page);
    await expect(region).toHaveCount(1);
    await expect(region.getByRole('heading', { level: 2, name })).toBeVisible();
    await expect(region.getByText(notice.LUNCH_LUCK_LABEL)).toBeVisible();
    await expect(spinButton(page)).toHaveText(RESPIN);
    await expect(
      main(page).getByText(notice.LUNCH_DISCLAIMER_TEXT).first()
    ).toBeVisible();
    expect(errors.pageErrors).toEqual([]);
    expect(errors.hydration).toEqual([]);
  });

  test('AC-5: 조건에 맞는 메뉴가 없으면 버튼이 꺼지고 안내가 보이며, 국물 조건을 없애면 풀린다', async ({
    page,
  }) => {
    await openPage(page);
    for (const label of CATEGORY_LABELS.filter((l) => l !== '양식')) {
      await chip(page, label).click();
    }
    await page
      .getByText(notice.LUNCH_BROTH_OPTION_LABELS.soup, { exact: true })
      .click();
    await expect(spinButton(page)).toBeDisabled();
    await expect(
      main(page).getByText(notice.LUNCH_EMPTY_NO_CANDIDATE_TEXT)
    ).toBeVisible();
    await page.getByRole('button', { name: CLEAR_BROTH }).click();
    await expect(
      main(page).getByText(notice.LUNCH_EMPTY_NO_CANDIDATE_TEXT)
    ).toHaveCount(0);
    await expect(spinButton(page)).toBeEnabled();
  });
});

test.describe('지도 링크', () => {
  test('AC-13~17: 지도 링크 3개가 새 탭으로 열리고 원래 탭은 유지된다', async ({
    page,
  }) => {
    await stubMaps(page);
    await openPage(page);
    const name = await spinOnce(page);
    const links = mapLinks(page);
    await expect(links).toHaveCount(3);
    for (const i of [0, 1, 2]) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      for (const token of ['noopener', 'noreferrer']) {
        expect(rel).toContain(token);
      }
      await expect(link).toHaveAccessibleName(/새 탭에서 외부 사이트 열림/);
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        link.click(),
      ]);
      await popup.waitForLoadState('domcontentloaded');
      expect(popup.url()).toMatch(
        /^https:\/\/((m\.)?map\.(kakao|naver)\.com|www\.google\.com\/maps\/)/
      );
      expect(await popup.evaluate(() => window.opener)).toBeNull();
      await popup.close();
      expect(new URL(page.url()).pathname).toBe(PATH);
      await expect(
        resultRegion(page).getByRole('heading', { name })
      ).toBeVisible();
    }
  });
});

test.describe('메뉴 진입', () => {
  test('AC-38: 메뉴의 "점심"으로 /lunch/today에 들어가고 준비 중 표시가 없다', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('준비 중')).toHaveCount(0);
    const isMobile = testInfo.project.name === 'mobile';
    if (isMobile) {
      await page.getByRole('button', { name: '메뉴 열기' }).click();
    }
    const scope = isMobile ? page.getByRole('dialog') : page;
    const link = scope.getByRole('link', { name: '점심', exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/lunch\/today$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('SEO', () => {
  test('AC-34~37: 서버 HTML의 메타·JSON-LD·h1과 sitemap', async ({
    request,
  }) => {
    await test.step(PATH, async () => {
      const res = await request.get(PATH);
      expect(res.status()).toBeLessThan(400);
      const html = (await res.text()).replace(/<style[\s\S]*?<\/style>/g, '');
      const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
      expect(html).not.toMatch(/<meta name="robots" content="[^"]*noindex/);
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
      expect(title).toContain('오늘 뭐 먹지');
      expect(title.split('운빨연구소').length - 1).toBeLessThanOrEqual(1);
      expect(html).toMatch(/<meta name="description" content="[^"]+"/);
      expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
      const canonical =
        /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? '';
      expect(new URL(canonical).pathname).toBe(PATH);
      expect(bodyHtml.match(/<h1[\s>]/g)).toHaveLength(1);
      const blocks = [
        ...html.matchAll(
          /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
        ),
      ];
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) expect(() => JSON.parse(b[1])).not.toThrow();
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('"@type":"FAQPage"');
    });
    await test.step('sitemap', async () => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      expect(await res.text()).toContain(`${PATH}</loc>`);
    });
  });
});
