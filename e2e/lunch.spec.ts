import { expect, type Page, test } from '@playwright/test';
import { MENU_LIST } from '@/constants/menu.constant';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import { LUNCH_FAQ } from '@/features/lunch/constants/lunch-faq.constant';
import { LUNCH_LUCK_LINES } from '@/features/lunch/constants/lunch-luck.constant';
import { LUNCH_MENUS } from '@/features/lunch/constants/lunch-menu.constant';
import * as notice from '@/features/lunch/constants/lunch-notice.constant';
import { LUNCH_HUB_SEO } from '@/features/lunch/constants/lunch-seo.constant';
import { buildMetadata } from '@/lib/seo';

// 화면 검사 (데스크톱·모바일). 데이터 검사는 lunch-copy.spec.ts가 맡는다.

const PATH = '/lunch/today';
const MENU_NAMES = LUNCH_MENUS.map((m) => m.name);
const CATEGORY_LABELS = LUNCH_CATEGORIES.map((c) => c.label);
const ALL_LUCK = Object.values(LUNCH_LUCK_LINES).flat();
const SPIN = notice.LUNCH_SPIN_BUTTON_LABEL;
const RESPIN = notice.LUNCH_RESPIN_BUTTON_LABEL;
const CLEAR_BROTH = notice.LUNCH_CLEAR_BROTH_BUTTON_LABEL;
const MAP_HOST_RE =
  /^(https:\/\/)?((m\.)?map\.(kakao|naver)\.com|www\.google\.com\/maps\/)/;

test.beforeEach(() => {
  // 개발 서버 첫 컴파일이 느릴 수 있다
  test.setTimeout(90_000);
});

// ---------- 도우미 ----------

const main = (page: Page) => page.getByRole('main');
const spinButton = (page: Page) =>
  page.getByRole('button', { name: new RegExp(`^(${SPIN}|${RESPIN})$`) });
const resultRegion = (page: Page) =>
  page.getByRole('region', { name: new RegExp(`^(${MENU_NAMES.join('|')})$`) });
const announce = (page: Page) =>
  page.getByRole('status').filter({ hasText: '뽑힌 메뉴는' });
const chip = (page: Page, label: string) =>
  page.getByRole('button', { name: label, exact: true });

/** 고정 난수: crypto.getRandomValues가 항상 0을 채운다 (브라우저 안에서만) */
async function fixRandomZero(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(crypto, 'getRandomValues', {
      configurable: true,
      value: (arr: ArrayBufferView) => {
        new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength).fill(0);
        return arr;
      },
    });
  });
}

/** 외부 지도 사이트를 가로챈다. 실제 접속 없음. 이동한 요청의 referer를 모은다 */
async function stubMaps(
  page: Page
): Promise<{ referers: (string | undefined)[] }> {
  const seen = { referers: [] as (string | undefined)[] };
  await page
    .context()
    .route(
      /^https:\/\/((m\.)?map\.(kakao|naver)\.com\/|www\.google\.com\/maps\/)/,
      (route) => {
        seen.referers.push(route.request().headers().referer);
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><title>stub</title><p>stub</p>',
        });
      }
    );
  return seen;
}

/** 이동, h1 확인, hydration 확인(칩을 눌러 반응할 때까지), 쿠키 배너 닫기 */
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
  const decline = page.getByRole('button', { name: '쿠키 거부' });
  if (await decline.isVisible()) {
    await decline.click();
    await expect(decline).toBeHidden();
  }
}

async function spinOnce(page: Page): Promise<string> {
  await spinButton(page).click();
  await expect(announce(page)).toBeVisible({ timeout: 5000 });
  const text = (await announce(page).textContent()) ?? '';
  const m = /뽑힌 메뉴는 (.+)\((.+)\)입니다/.exec(text);
  expect(m, `알림 문장: ${text}`).not.toBeNull();
  return m?.[1] ?? '';
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function storageSnapshot(page: Page) {
  return page.evaluate(() => {
    const dump = (s: Storage) =>
      Object.fromEntries(
        Object.keys(s)
          .filter(
            (k) => !/_cookie_consent_v1$|_age_gate_verified_sess_v1$/.test(k)
          )
          .map((k) => [k, s.getItem(k)])
      );
    return {
      local: dump(localStorage),
      session: dump(sessionStorage),
      cookie: document.cookie,
    };
  });
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(Number.parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_, d: string) =>
      String.fromCodePoint(Number.parseInt(d, 10))
    )
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

const mapsOnly = (page: Page) =>
  main(page).getByRole('link', { name: /^(카카오맵|네이버지도|구글 지도)/ });

// ======================================================================
// 공통
// ======================================================================
test.describe('공통', () => {
  test('응답 400 미만, pageerror 없음, h1 하나, title·description 메타', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await openPage(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      LUNCH_HUB_SEO.heading
    );
    await expect(page).toHaveTitle(/오늘 뭐 먹지/);
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect((desc ?? '').length).toBeGreaterThan(20);
    expect(errors).toEqual([]);
  });

  test('AC-36: index 허용, canonical·og가 buildMetadata 결과와 같다', async ({
    page,
  }) => {
    const expected = buildMetadata({
      title: LUNCH_HUB_SEO.title,
      description: LUNCH_HUB_SEO.description,
      pathname: LUNCH_HUB_SEO.pathname,
      keywords: [...LUNCH_HUB_SEO.keywords],
      ogImage: { alt: LUNCH_HUB_SEO.ogImageAlt },
    });
    await openPage(page);
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots ?? '').not.toContain('noindex');
    // 사이트 주소(env)는 테스트 프로세스와 서버가 다를 수 있어 경로만 비교한다
    const pathOf = (u: unknown) => new URL(String(u)).pathname;
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(pathOf(canonical)).toBe(pathOf(expected.alternates?.canonical));
    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute('content');
    expect(pathOf(ogUrl)).toBe(
      pathOf((expected.openGraph as { url?: unknown } | null)?.url)
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /오늘 뭐 먹지/
    );
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('AC-37: /sitemap.xml에 /lunch/today가 포함된다', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBeLessThan(400);
    expect(await res.text()).toContain(`${PATH}</loc>`);
  });

  test('AC-38: 메뉴·홈의 점심 항목에 준비 중 표시가 없다', async ({ page }) => {
    const group = MENU_LIST.find((g) => g.group === 'lunch');
    expect(group?.comingSoon).toBeFalsy();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const lunchLinks = page.getByRole('link', { name: /점심/ });
    await expect(lunchLinks.first()).toBeAttached();
    await expect(page.getByText('준비 중')).toHaveCount(0);
  });

  test('AC-35: JSON-LD는 BreadcrumbList와 FAQPage 두 개뿐, FAQ가 화면과 같다', async ({
    page,
  }) => {
    await openPage(page);
    const texts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const items: Record<string, unknown>[] = [];
    for (const t of texts) {
      const v = JSON.parse(t);
      for (const it of Array.isArray(v) ? v : [v]) {
        if (Array.isArray(it?.['@graph'])) items.push(...it['@graph']);
        else items.push(it);
      }
    }
    // Organization·WebSite는 루트 레이아웃의 사이트 공통 항목이다
    const types = items
      .map((i) => String(i['@type']))
      .filter((t) => t !== 'Organization' && t !== 'WebSite');
    expect(types.sort()).toEqual(['BreadcrumbList', 'FAQPage']);
    const faq = items.find((i) => i['@type'] === 'FAQPage') as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faq.mainEntity.map((q) => q.name)).toEqual(
      LUNCH_FAQ.map((f) => f.question)
    );
    for (const [i, f] of LUNCH_FAQ.entries()) {
      expect(faq.mainEntity[i].acceptedAnswer.text).toBe(f.answer);
      await expect(
        main(page).getByText(f.answer, { exact: true })
      ).toBeVisible();
    }
  });
});

// ======================================================================
// 서버 HTML (JS 없이)
// ======================================================================
test.describe('서버 HTML', () => {
  test('AC-34: JS 없이 받은 HTML에 h1, 설명, 고지, 사용 순서, FAQ가 있다', async ({
    request,
  }) => {
    const res = await request.get(PATH);
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    const text = htmlToText(html);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text).toContain(LUNCH_HUB_SEO.heading);
    expect(text).toContain(notice.LUNCH_PAGE_DESCRIPTION);
    expect(text).toContain(notice.LUNCH_DISCLAIMER_TEXT);
    expect(text).toContain(notice.LUNCH_RANDOM_NOTICE_TEXT);
    expect(text).toContain(notice.LUNCH_NO_REWARD_NOTICE_TEXT);
    expect(text).toContain(notice.LUNCH_INTRO_TEXT);
    expect(text).toContain(notice.LUNCH_STEPS_TITLE);
    for (const step of notice.LUNCH_STEPS) expect(text).toContain(step);
    expect(text).toContain(notice.LUNCH_FAQ_TITLE);
    for (const f of LUNCH_FAQ) {
      expect(text).toContain(f.question);
      expect(text).toContain(f.answer);
    }
    expect(html).not.toMatch(/<meta name="robots" content="[^"]*noindex/);
    // 사이트 공통 2개(Organization, WebSite) + 페이지 2개(BreadcrumbList, FAQPage)
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).not.toMatch(
      /"@type":"(Restaurant|LocalBusiness|Place|Product|Review)"/
    );
  });

  test('AC-30: 약관 9장·13장, 방침 6장에 점심 문구가 있다', async ({
    request,
  }) => {
    const terms = htmlToText(await (await request.get('/terms')).text());
    expect(terms).toContain('9. 점심 메뉴 룰렛 서비스');
    expect(terms).toContain('13. 책임 제한 및 제3자 서비스');
    expect(terms).toContain('오락을 목적으로 제공됩니다');
    expect(terms).toContain('같은 확률로 무작위로 정해지며');
    expect(terms).toContain('어떤 보상과도 관련이 없습니다');
    expect(terms).toContain('새 탭에서 열리며');
    expect(terms).toContain('위치 정보를 요청하지 않으며');
    expect(terms).toContain(
      '지도 검색 페이지(카카오맵, 네이버지도, 구글 지도)'
    );

    const privacy = htmlToText(await (await request.get('/privacy')).text());
    expect(privacy).toContain('6. 외부 서비스 이용 및 처리위탁');
    expect(privacy).toContain(
      '점심 메뉴 룰렛의 지도 검색 링크(카카오맵, 네이버지도, 구글 지도)'
    );
    expect(privacy).toContain('위치 정보를 요청하지 않으며');
    expect(privacy).toContain('서버로 전송하거나 저장하지 않습니다');
  });
});

// ======================================================================
// 기본 화면, 필터
// ======================================================================
test.describe('필터와 빈 상태', () => {
  test('AC-3: 기본은 칩 6개 모두 선택, 국물 상관없음, 버튼 룰렛 돌리기', async ({
    page,
  }) => {
    await openPage(page);
    for (const label of CATEGORY_LABELS) {
      await expect(chip(page, label)).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(
      page.getByRole('radio', { name: notice.LUNCH_BROTH_OPTION_LABELS.all })
    ).toBeChecked();
    await expect(spinButton(page)).toHaveText(SPIN);
    await expect(spinButton(page)).toBeEnabled();
    await expect(
      page.getByText(`후보 메뉴 ${LUNCH_MENUS.length}개`)
    ).toBeVisible();
  });

  test('AC-5: 칩을 모두 끄면 버튼 비활성, 안내 표시, 국물 조건 없애기 없음', async ({
    page,
  }) => {
    await openPage(page);
    for (const label of CATEGORY_LABELS) await chip(page, label).click();
    await expect(spinButton(page)).toBeDisabled();
    await expect(
      main(page).getByText(notice.LUNCH_EMPTY_NO_CATEGORY_TEXT)
    ).toBeVisible();
    await expect(page.getByRole('button', { name: CLEAR_BROTH })).toHaveCount(
      0
    );
  });

  test('U7: 양식만 + 국물 있음이면 후보 0개, 국물 조건 없애기 뒤 포커스가 뽑기 버튼', async ({
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
    const clear = page.getByRole('button', { name: CLEAR_BROTH });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(
      page.getByRole('radio', { name: notice.LUNCH_BROTH_OPTION_LABELS.all })
    ).toBeChecked();
    await expect(
      main(page).getByText(notice.LUNCH_EMPTY_NO_CANDIDATE_TEXT)
    ).toHaveCount(0);
    await expect(clear).toHaveCount(0);
    await expect(spinButton(page)).toBeEnabled();
    await expect(spinButton(page)).toBeFocused();
  });
});

// ======================================================================
// 룰렛 동작
// ======================================================================
test.describe('룰렛 동작', () => {
  test('AC-1, AC-2, AC-8, AC-9, AC-12: 돌리면 후보 안의 메뉴 하나, 알림, 점심운, 포커스 유지', async ({
    page,
  }) => {
    await openPage(page);
    const name = await spinOnce(page);
    expect(MENU_NAMES).toContain(name);
    const region = resultRegion(page);
    await expect(region).toHaveCount(1);
    await expect(region.getByRole('heading', { level: 2, name })).toBeVisible();
    await expect(region.getByText(notice.LUNCH_LUCK_LABEL)).toBeVisible();
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    const text = await region.innerText();
    expect(ALL_LUCK.filter((l) => text.includes(l))).toHaveLength(1);
    for (const w of ['가격', '별점', '칼로리', '후기', '효능', '건강']) {
      expect(text, w).not.toContain(w);
    }
    await expect(region.getByRole('button')).toHaveCount(0);
    await expect(spinButton(page)).toBeFocused();
    await expect(spinButton(page)).toHaveText(RESPIN);
  });

  test('AC-4: 한식만 켜고 10회 돌리면 모두 한식 메뉴', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    for (const label of CATEGORY_LABELS.filter((l) => l !== '한식')) {
      await chip(page, label).click();
    }
    const korean = LUNCH_MENUS.filter((m) => m.category === 'korean').map(
      (m) => m.name
    );
    for (let i = 0; i < 10; i++) {
      const name = await spinOnce(page);
      expect(korean, `${i + 1}번째 결과`).toContain(name);
    }
  });

  test('AC-6: 동작 줄이기에서는 돌림판 transform이 중간값을 거치지 않는다', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    await page.evaluate(() => {
      const seen = new Set<string>();
      (window as unknown as { __seen: Set<string> }).__seen = seen;
      for (const svg of document.querySelectorAll('svg[style]')) {
        seen.add((svg as SVGElement).style.transform);
      }
      new MutationObserver((ms) => {
        for (const m of ms) {
          const t = m.target as Element;
          if (t.tagName.toLowerCase() === 'svg') {
            seen.add((t as SVGElement).style.transform);
          }
        }
      }).observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });
    });
    const name = await spinOnce(page);
    expect(MENU_NAMES).toContain(name);
    const seen = await page.evaluate(() => [
      ...(window as unknown as { __seen: Set<string> }).__seen,
    ]);
    // 시작값과 최종값 외에는 없어야 한다
    expect(seen.length, seen.join(' | ')).toBeLessThanOrEqual(2);
  });

  test('AC-7: 회전 중 버튼·칩·국물은 잠기고 결과는 한 번만 나온다', async ({
    page,
  }) => {
    await openPage(page);
    const btn = spinButton(page);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await expect(btn.locator('..')).toHaveAttribute('aria-busy', 'true');
    await expect(chip(page, '한식')).toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByRole('radio', { name: notice.LUNCH_BROTH_OPTION_LABELS.dry })
    ).toHaveAttribute('aria-disabled', 'true');
    await chip(page, '한식').dispatchEvent('click');
    await btn.dispatchEvent('click');
    await expect(announce(page)).toBeVisible({ timeout: 5000 });
    await expect(chip(page, '한식')).toHaveAttribute('aria-pressed', 'true');
    await expect(resultRegion(page)).toHaveCount(1);
    await expect(btn.locator('..')).toHaveAttribute('aria-busy', 'false');
  });

  test('AC-18: 다시 뽑기는 같은 버튼, 도는 동안 결과 카드가 사라진다', async ({
    page,
  }) => {
    await openPage(page);
    await spinOnce(page);
    const handle = await spinButton(page).elementHandle();
    expect(handle).not.toBeNull();
    await expect(spinButton(page)).toHaveText(RESPIN);
    await spinButton(page).click();
    await expect(resultRegion(page)).toHaveCount(0);
    await expect(resultRegion(page)).toHaveCount(1, { timeout: 5000 });
    expect(
      await handle?.evaluate((el) => el.isConnected && el.textContent)
    ).toBe(RESPIN);
    await expect(spinButton(page)).toHaveText(RESPIN);
  });

  test('AC-19: 고정 난수에서 첫 결과는 첫 메뉴, 다시 뽑기는 직전 제외 후 첫 메뉴', async ({
    page,
  }) => {
    await fixRandomZero(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    expect(await spinOnce(page)).toBe(LUNCH_MENUS[0].name);
    await spinButton(page).click();
    await expect(
      resultRegion(page).getByRole('heading', { name: LUNCH_MENUS[1].name })
    ).toBeVisible({ timeout: 5000 });
  });

  test('AC-20: 조건을 바꾸면 결과와 알림이 사라지고 버튼이 룰렛 돌리기로 돌아간다', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    await spinOnce(page);
    await expect(spinButton(page)).toHaveText(RESPIN);
    await chip(page, '중식').click();
    await expect(resultRegion(page)).toHaveCount(0);
    await expect(announce(page)).toHaveCount(0);
    await expect(spinButton(page)).toHaveText(SPIN);
  });

  test('AC-21: 새로고침하면 처음 상태로 돌아간다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    await chip(page, '중식').click();
    await spinOnce(page);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const label of CATEGORY_LABELS) {
      await expect(chip(page, label)).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(
      page.getByRole('radio', { name: notice.LUNCH_BROTH_OPTION_LABELS.all })
    ).toBeChecked();
    await expect(resultRegion(page)).toHaveCount(0);
    await expect(spinButton(page)).toHaveText(SPIN);
  });
});

// ======================================================================
// 지도 링크 (새 탭, 외부 사이트는 가로챔)
// ======================================================================
test.describe('지도 링크', () => {
  test('AC-13~17: 링크 3개, 새 탭 속성, popup 열림, 원래 탭 유지, noopener·noreferrer', async ({
    page,
  }) => {
    const seen = await stubMaps(page);
    await openPage(page);
    const name = await spinOnce(page);
    const links = mapsOnly(page);
    await expect(links).toHaveCount(3);
    await expect(
      main(page).getByRole('link', { name: /카카오맵/ })
    ).toBeVisible();
    await expect(
      main(page).getByRole('link', { name: /네이버지도/ })
    ).toBeVisible();
    await expect(
      main(page).getByRole('link', { name: /구글 지도/ })
    ).toBeVisible();

    for (const i of [0, 1, 2]) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      for (const token of ['noopener', 'noreferrer', 'nofollow']) {
        expect(rel).toContain(token);
      }
      await expect(link).toHaveAccessibleName(/새 탭에서 외부 사이트 열림/);
      const href = (await link.getAttribute('href')) ?? '';
      const url = new URL(href);
      expect(url.protocol).toBe('https:');
      expect(['map.kakao.com', 'map.naver.com', 'www.google.com']).toContain(
        url.hostname
      );
      expect(url.hash).toBe('');
      const isGoogle = url.hostname === 'www.google.com';
      if (isGoogle) {
        expect(url.pathname).toBe('/maps/search/');
        expect([...url.searchParams.keys()].sort()).toEqual(['api', 'query']);
        expect(url.searchParams.get('api')).toBe('1');
        expect(url.searchParams.get('query')).toBe(name);
        expect(href).toBe(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
        );
      } else {
        expect(url.search).toBe('');
        expect(decodeURIComponent(url.pathname)).toContain(name);
      }

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        link.click(),
      ]);
      await popup.waitForLoadState('domcontentloaded');
      expect(popup.url()).toMatch(MAP_HOST_RE);
      const pu = new URL(popup.url());
      if (isGoogle) {
        expect([...pu.searchParams.keys()].sort()).toEqual(['api', 'query']);
        expect(pu.searchParams.get('query')).toBe(name);
      } else {
        expect(decodeURIComponent(pu.pathname)).toContain(name);
        expect(pu.search).toBe('');
      }
      expect(await popup.evaluate(() => window.opener)).toBeNull();
      await popup.close();

      expect(new URL(page.url()).pathname).toBe(PATH);
      await expect(
        resultRegion(page).getByRole('heading', { name })
      ).toBeVisible();
      await expect(spinButton(page)).toHaveText(RESPIN);
    }
    expect(seen.referers.length).toBeGreaterThanOrEqual(3);
    expect(seen.referers.filter(Boolean)).toEqual([]);
  });

  test('AC-17, AC-31: 키보드만으로 칩, 국물, 돌리기, 다시 뽑기, 링크 실행', async ({
    page,
  }) => {
    await stubMaps(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);

    const kor = chip(page, '한식');
    await kor.focus();
    await page.keyboard.press('Space');
    await expect(kor).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Space');
    await expect(kor).toHaveAttribute('aria-pressed', 'true');

    const soup = page.getByRole('radio', {
      name: notice.LUNCH_BROTH_OPTION_LABELS.soup,
    });
    await soup.focus();
    await page.keyboard.press('Space');
    await expect(soup).toBeChecked();
    const all = page.getByRole('radio', {
      name: notice.LUNCH_BROTH_OPTION_LABELS.all,
    });
    await all.focus();
    await page.keyboard.press('Space');
    await expect(all).toBeChecked();

    await spinButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(announce(page)).toBeVisible({ timeout: 5000 });
    await expect(spinButton(page)).toHaveText(RESPIN);
    await expect(spinButton(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(announce(page)).toBeVisible({ timeout: 5000 });
    await expect(resultRegion(page)).toHaveCount(1);

    await page.keyboard.press('Tab');
    const first = mapsOnly(page).first();
    await expect(first).toBeFocused();
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.keyboard.press('Enter'),
    ]);
    await popup.close();
    expect(new URL(page.url()).pathname).toBe(PATH);
  });
});

// ======================================================================
// 개인정보, 위치, 저장
// ======================================================================
test.describe('위치·저장·동의', () => {
  test('AC-22: 위치 권한 요청이 없고 Permissions-Policy가 geolocation을 막는다', async ({
    page,
  }) => {
    await stubMaps(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __geo: number };
      w.__geo = 0;
      const g = navigator.geolocation;
      for (const m of ['getCurrentPosition', 'watchPosition'] as const) {
        const orig = g[m].bind(g) as (...x: unknown[]) => unknown;
        (g as unknown as Record<string, unknown>)[m] = (...a: unknown[]) => {
          w.__geo++;
          return orig(...a);
        };
      }
    });
    const res = await page.goto(PATH);
    expect(res?.headers()['permissions-policy']).toContain('geolocation=()');
    await openPage(page);
    await spinOnce(page);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      mapsOnly(page).first().click(),
    ]);
    await popup.close();
    const count = await page.evaluate(
      () => (window as unknown as { __geo: number }).__geo
    );
    expect(count).toBe(0);
  });

  test('AC-23: 저장소·쿠키·주소에 아무것도 쓰지 않는다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    const before = await storageSnapshot(page);
    await chip(page, '중식').click();
    const name = await spinOnce(page);
    await spinOnce(page);
    const after = await storageSnapshot(page);
    expect(after).toEqual(before);
    expect(JSON.stringify(after)).not.toContain(name);
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
  });

  test('AC-24: 쿠키 거부와 광고 요청 차단 상태에서도 흐름이 동작한다', async ({
    page,
  }) => {
    await page.route(
      /daumcdn\.net|\.daum\.net|t1\.kakaocdn|googlesyndication/,
      (r) => r.abort()
    );
    await stubMaps(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPage(page);
    const name = await spinOnce(page);
    expect(MENU_NAMES).toContain(name);
    await expect(mapsOnly(page)).toHaveCount(3);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      mapsOnly(page).first().click(),
    ]);
    await popup.close();
  });
});

// ======================================================================
// 고지, 접근성
// ======================================================================
test.describe('고지와 접근성', () => {
  test('AC-25~28: 상시 고지가 h1 바로 아래, 무작위·보상 없음 고지는 결과 전에도 보인다', async ({
    page,
  }) => {
    await openPage(page);
    const h1 = page.getByRole('heading', { level: 1 });
    const disclaimer = main(page).getByText(notice.LUNCH_DISCLAIMER_TEXT);
    await expect(disclaimer).toBeVisible();
    const gap = await page.evaluate((text) => {
      const h = document.querySelector('h1');
      const d = [...document.querySelectorAll('p,div,li')].find(
        (e) => e.children.length === 0 && e.textContent?.includes(text)
      );
      if (!h || !d) return null;
      const between = [...document.querySelectorAll('h2,h3')].filter(
        (e) =>
          h.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING &&
          d.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING
      );
      return {
        below: h.getBoundingClientRect().top < d.getBoundingClientRect().top,
        headingsBetween: between.length,
      };
    }, notice.LUNCH_DISCLAIMER_TEXT);
    expect(gap).toEqual({ below: true, headingsBetween: 0 });
    await expect(h1).toHaveCount(1);
    await expect(
      main(page).getByText(notice.LUNCH_RANDOM_NOTICE_TEXT)
    ).toBeVisible();
    await expect(
      main(page).getByText(notice.LUNCH_NO_REWARD_NOTICE_TEXT)
    ).toBeVisible();

    await spinOnce(page);
    const region = resultRegion(page);
    await expect(
      region.getByText(notice.LUNCH_EXTERNAL_LINK_NOTICE_TEXT)
    ).toBeVisible();
    await expect(
      region.getByText(notice.LUNCH_RESULT_NOTICE_TEXT)
    ).toBeVisible();
  });

  test('AC-11, AC-12: 본문 화면 텍스트에 금지 단어가 없다 (고지 제외)', async ({
    page,
  }) => {
    await openPage(page);
    await spinOnce(page);
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    let text = await main(page).innerText();
    for (const s of [
      notice.LUNCH_DISCLAIMER_TEXT,
      notice.LUNCH_RANDOM_NOTICE_TEXT,
      notice.LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
      notice.LUNCH_RESULT_NOTICE_TEXT,
      notice.LUNCH_NO_REWARD_NOTICE_TEXT,
    ]) {
      text = text.split(s).join('');
    }
    for (const w of [
      '인기',
      '베스트',
      '추천 메뉴',
      '별점',
      '후기',
      '가격',
      '칼로리',
      '맛집',
      '반드시',
      '무조건',
      '100%',
    ]) {
      expect(text, w).not.toContain(w);
    }
  });

  test('AC-32: 버튼·라디오·링크에 접근성 이름이 있다', async ({ page }) => {
    await openPage(page);
    await spinOnce(page);
    const names = await main(page)
      .locator('button, a[href], input[type="radio"]')
      .evaluateAll((els) =>
        els.map((el) => ({
          tag: el.tagName,
          name:
            el.getAttribute('aria-label') ||
            // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
            (el as HTMLElement).innerText?.trim() ||
            (el as HTMLInputElement).labels?.[0]?.textContent?.trim() ||
            '',
        }))
      );
    expect(names.length).toBeGreaterThan(9);
    for (const n of names) expect(n.name, n.tag).not.toBe('');
  });

  test('돌림판 SVG는 보조기술에서 숨겨지고 위치 요청 안내가 없다', async ({
    page,
  }) => {
    await openPage(page);
    await expect(main(page).getByRole('img')).toHaveCount(0);
  });
});
