import { expect, type Page, test } from '@playwright/test';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import {
  DREAM_CRISIS_PANEL_TITLE,
  DREAM_EMPTY_BUTTON_LABEL,
  DREAM_EMPTY_TITLE,
  DREAM_SEARCH_LABEL,
  DREAM_SECTION_TITLES,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';
import { declineCookies, watchPageErrors } from './helpers/common.util';

// 꿈 해몽 화면 흐름 6개. 데이터·문구 검사는 unit/dream/이 맡는다.

const HUB = '/dream';
const TOTAL = DREAM_TOPICS.length;
const SLUGS = DREAM_TOPICS.map((t) => t.slug);
const FIRST = DREAM_TOPICS[0];
const PANEL_PHONES = CRISIS_PHONES.filter((p) => p.showInCrisisPanel);

test.beforeEach(() => {
  // 개발 서버 첫 컴파일이 느릴 수 있다
  test.setTimeout(90_000);
});

const searchBox = (page: Page) =>
  page.getByRole('searchbox', { name: DREAM_SEARCH_LABEL });
const main = (page: Page) => page.getByRole('main');
const topicLinks = (page: Page) => main(page).locator('a[href^="/dream/"]');

/** 이동, h1 확인, 검색 입력이 상태에 반영될 때까지(하이드레이션) 반복 */
async function openHub(page: Page): Promise<void> {
  const res = await page.goto(HUB);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(async () => {
    await searchBox(page).fill('zz');
    await expect(page.getByText(/검색 결과 \d+개/)).toBeVisible({
      timeout: 1000,
    });
  }).toPass();
  await searchBox(page).fill('');
  await expect(
    main(page).getByText(`전체 소재 ${TOTAL}개`).first()
  ).toBeVisible();
}

test.describe('허브와 상세', () => {
  test('AC-1~5: 검색하면 맞는 소재만 남고, 없으면 빈 상태 안내와 전체 목록 보기', {
    tag: '@smoke',
  }, async ({ page }) => {
    const errors = watchPageErrors(page);
    await openHub(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(topicLinks(page)).toHaveCount(TOTAL);

    await searchBox(page).fill('돼지');
    await expect(page.getByText(/“돼지” 검색 결과 \d+개/)).toBeVisible();
    await expect(main(page).locator('a[href="/dream/pig"]')).toHaveCount(1);
    expect(await topicLinks(page).count()).toBeLessThan(TOTAL);

    await searchBox(page).fill('가나다라마바사없는소재');
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
    await expect(topicLinks(page)).toHaveCount(0);
    await page.getByRole('button', { name: DREAM_EMPTY_BUTTON_LABEL }).click();
    await expect(searchBox(page)).toHaveValue('');
    await expect(topicLinks(page)).toHaveCount(TOTAL);
    expect(errors.pageErrors).toEqual([]);
    expect(errors.hydration).toEqual([]);
  });

  test('AC-13, AC-15: 상세에서 관련 소재로 이동하고 허브로 돌아온다', async ({
    page,
  }) => {
    await page.goto(`${HUB}/${FIRST.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      FIRST.keywordName
    );
    const links = page
      .getByRole('heading', { name: DREAM_SECTION_TITLES.related })
      .locator('xpath=following-sibling::ul[1]')
      .getByRole('link');
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThanOrEqual(2);
    expect(await links.count()).toBeLessThanOrEqual(4);
    const related = DREAM_TOPICS.find((t) => t.slug === FIRST.related[0]);
    expect(related).toBeTruthy();
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`/dream/${related?.slug}$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      related?.keywordName ?? ''
    );
    await page
      .getByRole('navigation', { name: '이동 경로' })
      .getByRole('link', { name: '꿈 해몽', exact: true })
      .click();
    await expect(page).toHaveURL(/\/dream$/);
  });

  test('위기 표현을 검색하면 상담 안내가 결과 위에 보이고 지우면 사라진다', async ({
    page,
  }) => {
    await openHub(page);
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
    await searchBox(page).fill('죽고 싶다');
    const title = page.getByText(DREAM_CRISIS_PANEL_TITLE);
    await expect(title).toBeVisible();
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
    const t = await title.boundingBox();
    const e = await page.getByText(DREAM_EMPTY_TITLE).boundingBox();
    expect(t?.y).toBeLessThan(e?.y ?? 0);
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    const text = await title.locator('xpath=..').innerText();
    for (const p of PANEL_PHONES) expect(text).toContain(p.displayNumber);
    await searchBox(page).fill('');
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
    await expect(topicLinks(page)).toHaveCount(TOTAL);
  });

  test('AC-35: 헤더 메뉴의 "꿈 해몽"으로 /dream에 들어간다', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const isMobile = testInfo.project.name === 'mobile';
    if (isMobile) {
      await page.getByRole('button', { name: '메뉴 열기' }).click();
    }
    const scope = isMobile ? page.getByRole('dialog') : page;
    const link = scope.getByRole('link', { name: '꿈 해몽', exact: true });
    await expect(link).toBeVisible();
    await expect(link).not.toContainText('준비 중');
    await link.click();
    await expect(page).toHaveURL(/\/dream$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('꿈 해몽');
  });

  test('AC-22, AC-30: 쿠키 거절과 광고 요청 차단 상태에서도 검색과 상세 열람이 동작한다', async ({
    page,
  }) => {
    const errors = watchPageErrors(page);
    await page.route(/daumcdn\.net|\.daum\.net|kakao/, (route) =>
      route.abort()
    );
    await page.goto(HUB);
    await declineCookies(page);
    await openHub(page);
    await searchBox(page).fill('이빨');
    const link = main(page).locator('a[href="/dream/teeth"]');
    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(/\/dream\/teeth$/);
    const teeth = DREAM_TOPICS.find((t) => t.slug === 'teeth');
    await expect(page.getByText(teeth?.summary ?? '')).toBeVisible();
    expect(errors.pageErrors).toEqual([]);
  });
});

test.describe('SEO', () => {
  test('AC-37~40: 서버 HTML의 메타·JSON-LD·h1과 sitemap', async ({
    request,
  }) => {
    for (const path of [HUB, `${HUB}/${FIRST.slug}`]) {
      await test.step(path, async () => {
        const res = await request.get(path);
        expect(res.status()).toBeLessThan(400);
        const html = (await res.text()).replace(/<style[\s\S]*?<\/style>/g, '');
        const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
        expect(html).not.toMatch(/<meta name="robots" content="[^"]*noindex/);
        const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
        expect(title.length).toBeGreaterThan(0);
        expect(title.split('운빨연구소').length - 1).toBeLessThanOrEqual(1);
        expect(html).toMatch(/<meta name="description" content="[^"]+"/);
        expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
        const canonical =
          /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? '';
        expect(new URL(canonical).pathname).toBe(path);
        expect(bodyHtml.match(/<h1[\s>]/g)).toHaveLength(1);
        const blocks = [
          ...html.matchAll(
            /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
          ),
        ];
        expect(blocks.length).toBeGreaterThan(0);
        for (const b of blocks) expect(() => JSON.parse(b[1])).not.toThrow();
        expect(html).toContain('"@type":"BreadcrumbList"');
      });
    }
    await test.step('sitemap', async () => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const xml = await res.text();
      const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (m) => new URL(m[1]).pathname
      );
      for (const p of [HUB, ...SLUGS.map((s) => `${HUB}/${s}`)]) {
        expect(paths).toContain(p);
      }
    });
  });
});
