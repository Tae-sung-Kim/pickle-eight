import { expect, test } from '@playwright/test';
import { MEAL_CATEGORIES } from '@/features/meal/constants/meal-category.constant';
import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import * as notice from '@/features/meal/constants/meal-notice.constant';
import { storageSnapshot, watchPageErrors } from './helpers/common.util';
import {
  announce,
  checkChipLayout,
  checkDinnerLateNight,
  checkLateNightKeyboard,
  chip,
  countGeolocation,
  expectResultOf,
  horizontalOverflow,
  MEALS,
  main,
  mapLinks,
  mealLabel,
  openPage,
  MEAL_PATH as PATH,
  pickMeal,
  RESPIN,
  radio,
  readResult,
  resultRegion,
  SPIN,
  spinButton,
  spinOnce,
  stubMaps,
  watchGeolocation,
} from './helpers/meal.util';

// 메뉴 룰렛(/meal) 화면 흐름 10개. 데이터·문구 검사는 unit/meal/이 맡는다.

// 개발 서버 첫 컴파일이 느릴 수 있다
test.beforeEach(() => test.setTimeout(90_000));

test.describe('추천과 끼니', () => {
  test('AC-1, 6, 8, 10, 12, 23, 24: 기본 점심에서 돌리면 점심 메뉴와 고지가 보인다', {
    tag: '@smoke',
  }, async ({ page }) => {
    const errors = watchPageErrors(page);
    await openPage(page);
    await expect(
      page.getByRole('heading', { level: 1, name: '오늘 뭐 먹지' })
    ).toHaveCount(1);
    await expect(
      page.getByRole('group', { name: '끼니' }).getByRole('radio')
    ).toHaveCount(3);
    for (const m of MEALS) await expect(radio(page, m)).toBeVisible();
    await expect(radio(page, 'lunch')).toBeChecked();
    await expect(spinButton(page)).toHaveText(SPIN);
    await expect(
      main(page).getByText(notice.MEAL_DISCLAIMER_TEXT).first()
    ).toBeVisible();
    await expectResultOf(page, 'lunch', await spinOnce(page));
    await expect(spinButton(page)).toHaveText(RESPIN);
    await expect(
      main(page).getByText(notice.MEAL_RESULT_NOTICE_TEXT)
    ).toBeVisible();
    expect(errors.pageErrors).toEqual([]);
    expect(errors.hydration).toEqual([]);
  });

  test('AC-7, 10, 12, 13: 끼니를 바꾸면 결과가 지워지고 알림이 나오며, 그 끼니 목록에서 뽑는다', async ({
    page,
  }) => {
    await openPage(page);
    await spinOnce(page);
    await expect(resultRegion(page)).toHaveCount(1);
    for (const meal of ['dinner', 'breakfast'] as const) {
      await pickMeal(page, meal);
      await expect(resultRegion(page)).toHaveCount(0);
      await expect(
        announce(page, notice.getMealChangeAnnouncement(mealLabel(meal)))
      ).toBeAttached();
      await expect(spinButton(page)).toHaveText(SPIN);
      if (meal === 'dinner') await checkDinnerLateNight(page);
      await expectResultOf(page, meal, await spinOnce(page));
    }
  });

  test('AC-7: 회전 중에는 끼니 변경이 무시된다', async ({ page }) => {
    await openPage(page);
    // 회전은 1초라 Playwright 클릭 두 번 사이에 끝난다. 같은 틱에서 연달아 누른다
    await page.evaluate(
      ([spin, dinner]) => {
        const nodes = [...document.querySelectorAll('main button, main label')];
        const byText = (t: string) =>
          nodes.find((n) => n.textContent?.trim() === t) as HTMLElement;
        byText(spin).click();
        byText(dinner).click();
      },
      [SPIN, mealLabel('dinner')]
    );
    await expect(radio(page, 'lunch')).toBeChecked();
    await expect(radio(page, 'dinner')).not.toBeChecked();
    await readResult(page);
    await expect(radio(page, 'lunch')).toBeChecked();
  });

  test('AC-16: 조건에 맞는 메뉴가 없으면 버튼이 꺼지고 안내가 보이며, 국물 조건을 없애면 풀린다', async ({
    page,
  }) => {
    await openPage(page);
    for (const c of MEAL_CATEGORIES.lunch.filter((c) => c.key !== 'western')) {
      await chip(page, c.label).click();
    }
    await page
      .getByText(notice.MEAL_BROTH_OPTION_LABELS.soup, { exact: true })
      .click();
    await expect(spinButton(page)).toBeDisabled();
    const empty = main(page).getByText(notice.MEAL_EMPTY_NO_CANDIDATE_TEXT);
    await expect(empty).toBeVisible();
    await page
      .getByRole('button', { name: notice.MEAL_CLEAR_BROTH_BUTTON_LABEL })
      .click();
    await expect(empty).toHaveCount(0);
    await expect(spinButton(page)).toBeEnabled();
  });

  test('끼니를 바꾸면 국물 조건이 상관없음으로 돌아간다', async ({ page }) => {
    await openPage(page);
    const all = page.getByRole('radio', {
      name: notice.MEAL_BROTH_OPTION_LABELS.all,
    });
    await page
      .getByText(notice.MEAL_BROTH_OPTION_LABELS.soup, { exact: true })
      .click();
    await expect(all).not.toBeChecked();
    await pickMeal(page, 'dinner');
    await expect(all).toBeChecked();
  });
});

test.describe('저장·권한·키보드', () => {
  test('AC-20, 21, 22: 쿠키를 거절해도 동작하고 저장소·URL에 선택값이 없으며 위치 권한을 묻지 않는다', async ({
    page,
  }) => {
    await watchGeolocation(page);
    await openPage(page);
    const before = await storageSnapshot(page);
    await pickMeal(page, 'dinner');
    await chip(page, '한식').click();
    const { name } = await spinOnce(page);
    await pickMeal(page, 'breakfast');
    await spinOnce(page);
    const after = await storageSnapshot(page);
    expect(after).toEqual(before);
    const all = `${after.local}${after.session}${after.cookie}`;
    for (const w of ['lunch', 'dinner', 'breakfast', '저녁', '아침', name]) {
      expect(all, w).not.toContain(w);
    }
    const url = new URL(page.url());
    expect([url.pathname, url.search, url.hash]).toEqual([PATH, '', '']);
    expect(await countGeolocation(page)).toBe(0);
  });

  test('AC-25: 키보드만으로 끼니 선택, 돌리기, 다시 뽑기를 할 수 있다', async ({
    page,
  }) => {
    await openPage(page);
    await radio(page, 'lunch').focus();
    await page.keyboard.press('ArrowRight');
    await expect(radio(page, 'dinner')).toBeChecked();
    await expect(radio(page, 'dinner')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(chip(page, '한식')).toBeFocused();
    await checkLateNightKeyboard(page);
    await spinButton(page).focus();
    await page.keyboard.press('Enter');
    const first = await readResult(page);
    await expectResultOf(page, 'dinner', first);
    const baseNames = new Set(
      MEAL_MENUS.dinner
        .filter((m) => m.category !== 'lateNight')
        .map((m) => m.name)
    );
    const lateNames = MEAL_MENUS.dinner
      .filter((m) => m.category === 'lateNight' && !baseNames.has(m.name))
      .map((m) => m.name);
    expect(lateNames).not.toContain(first.name);
    await expect(spinButton(page)).toHaveText(RESPIN);
    await spinButton(page).focus();
    await page.keyboard.press('Space');
    await expect(spinButton(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(spinButton(page)).not.toHaveAttribute(
      'aria-disabled',
      'true',
      {
        timeout: 10_000,
      }
    );
    await expect(resultRegion(page)).toHaveCount(1);
  });
});

test.describe('지도 링크와 레이아웃', () => {
  test('AC-17~19: 지도 링크 3개는 tel이 아니고 새 탭으로 열리며 세로로 쌓인다', async ({
    page,
  }) => {
    await stubMaps(page);
    await openPage(page);
    const { name } = await spinOnce(page);
    const links = mapLinks(page);
    await expect(links).toHaveCount(3);
    await expect(main(page).locator('a[href^="tel:"]')).toHaveCount(0);
    const ys: number[] = [];
    for (const i of [0, 1, 2]) {
      const link = links.nth(i);
      expect((await link.getAttribute('href')) ?? '').toContain(
        encodeURIComponent(name)
      );
      await expect(link).toHaveAttribute('target', '_blank');
      expect((await link.getAttribute('rel')) ?? '').toMatch(
        /noopener.*noreferrer|noreferrer.*noopener/
      );
      await expect(link).toHaveAccessibleName(/새 탭에서 외부 사이트 열림/);
      ys.push((await link.boundingBox())?.y ?? 0);
    }
    expect.soft(ys[0], '지도 링크는 세로로 쌓는다').toBeLessThan(ys[1]);
    expect.soft(ys[1], '지도 링크는 세로로 쌓는다').toBeLessThan(ys[2]);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      links.first().click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    expect(await popup.evaluate(() => window.opener)).toBeNull();
    await popup.close();
    expect(new URL(page.url()).pathname).toBe(PATH);
    await expect(
      resultRegion(page).getByRole('heading', { name })
    ).toBeVisible();
  });

  test('AC-26, 40: 320px 가로 스크롤 없음·끼니 칸 한 줄, 저녁 7칩, 640px 이상 4열과 칩 영역 높이 동일', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await openPage(page);
    for (const meal of MEALS) {
      await pickMeal(page, meal);
      await spinOnce(page); // 돌림판이 돈 뒤에도 가로로 넘치지 않아야 한다
      expect(await horizontalOverflow(page), meal).toBeLessThanOrEqual(0);
      const ys = await Promise.all(
        MEALS.map(
          async (m) => (await radio(page, m).locator('..').boundingBox())?.y
        )
      );
      expect(new Set(ys).size).toBe(1);
    }
    await checkChipLayout(page);
  });
});

test.describe('주소·SEO', () => {
  test('AC-2, 3, 4: 옛 주소가 301로 /meal에 가고 메뉴 링크와 sitemap이 새 주소다', async ({
    page,
    request,
  }) => {
    for (const old of ['/lunch/today', '/lunch']) {
      const res = await request.get(old, { maxRedirects: 0 });
      expect(res.status(), old).toBe(301);
      const to = new URL(res.headers().location, 'http://localhost');
      expect(to.pathname).toBe(PATH);
    }
    expect((await request.get('/lunch/today')).status()).toBe(200);
    const map = await (await request.get('/sitemap.xml')).text();
    expect(map).toContain(`${PATH}</loc>`);
    expect(map).not.toContain('/lunch/today</loc>');
    expect(map).not.toContain('/lunch</loc>');

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('준비 중')).toHaveCount(0);
    await expect(
      page.locator('a[href="/lunch/today"], a[href="/lunch"]')
    ).toHaveCount(0);
    const link = page
      .getByRole('link', { name: '뭐 먹지', exact: true })
      .first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/meal$/);
  });

  test('AC-5, 27~30: 서버 HTML의 본문·메타·JSON-LD(BreadcrumbList·FAQPage)', async ({
    request,
  }) => {
    const res = await request.get(PATH);
    expect(res.status()).toBeLessThan(400);
    const html = (await res.text()).replace(/<style[\s\S]*?<\/style>/g, '');
    const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
    expect(html).not.toMatch(/<meta name="robots" content="[^"]*noindex/);
    expect(/<title>([^<]*)<\/title>/.exec(html)?.[1]).toContain('오늘 뭐 먹지');
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    expect(new URL(canonical ?? '').pathname).toBe(PATH);
    expect(bodyHtml.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(bodyHtml).toContain(notice.MEAL_INTRO_TEXT);
    expect(bodyHtml).toContain(notice.MEAL_DISCLAIMER_TEXT);
    for (const f of MEAL_FAQ)
      expect(bodyHtml, f.question).toContain(f.question);
    type LdType = { '@type': string; itemListElement?: { name: string }[] };
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
      ),
    ]
      .flatMap((b) => JSON.parse(b[1]) as LdType | LdType[])
      // 사이트 공통(layout) 블록은 제외하고 이 페이지가 더한 것만 본다
      .filter((b) => !['WebSite', 'Organization'].includes(b['@type']));
    expect(blocks.map((b) => b['@type']).sort()).toEqual([
      'BreadcrumbList',
      'FAQPage',
    ]);
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    const names = crumbs?.itemListElement?.map((i) => i.name) ?? [];
    expect(names).toHaveLength(2);
    expect(names.slice(1)).toEqual(['오늘 뭐 먹지']);
  });
});
