import { expect, type Page, test } from '@playwright/test';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import {
  MEAL_AREA_CLEAR_BUTTON_LABEL,
  MEAL_AREA_ERROR_TEXT,
  MEAL_AREA_INPUT_LABEL,
  MEAL_AREA_NOTICE_LINES,
  MEAL_AREA_PREVIEW_LABEL,
  MEAL_AREA_RESULT_NOTICE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import { recordRequests, storageSnapshot } from './helpers/common.util';
import {
  countGeolocation,
  horizontalOverflow,
  main,
  mapLinks,
  openPage,
  resultRegion,
  spinButton,
  spinOnce,
  stubMaps,
  watchGeolocation,
} from './helpers/meal.util';

const AREA = '강남역';

const areaInput = (page: Page) =>
  page.getByLabel(MEAL_AREA_INPUT_LABEL, { exact: true });
const previewLabel = (page: Page) =>
  main(page).getByText(MEAL_AREA_PREVIEW_LABEL, { exact: true });
const resultNotice = (page: Page) =>
  main(page).getByText(MEAL_AREA_RESULT_NOTICE_TEXT, { exact: true });

/** 메뉴 이름에 대응하는 지도 검색어 후보 (mapQuery가 있으면 그 값) */
function menuQueries(name: string): string[] {
  return Object.values(MEAL_MENUS)
    .flat()
    .filter((m) => m.name === name)
    .map((m) => m.mapQuery ?? m.name);
}

/** 링크 href에서 검색어를 읽는다 */
function queryOf(href: string): string {
  const url = new URL(href);
  return url.hostname === 'www.google.com'
    ? (url.searchParams.get('query') ?? '')
    : decodeURIComponent(url.pathname.split('/').pop() ?? '');
}

async function allQueries(page: Page): Promise<string[]> {
  const links = mapLinks(page);
  await expect(links).toHaveCount(3);
  const out: string[] = [];
  for (const i of [0, 1, 2]) {
    out.push(queryOf((await links.nth(i).getAttribute('href')) ?? ''));
  }
  return out;
}

/** 세 링크가 모두 같은 검색어인지 확인한다 */
async function expectQueries(page: Page, expected: readonly string[]) {
  for (const q of await allQueries(page)) {
    expect(expected).toContain(q);
  }
}

test.describe('뭐 먹지 동네 이름 입력', () => {
  test('AC-1, 2, 3, 7, 8: 비움 → 입력 → 재돌림, 링크 새 탭, 새로고침 후 비어 있고 입력은 사이트로 안 나간다', async ({
    page,
  }) => {
    await stubMaps(page);
    await watchGeolocation(page);
    const requests = recordRequests(page);
    await openPage(page);

    // AC-1: 비운 채 돌리면 미리보기 없고 링크는 메뉴 이름만
    await expect(areaInput(page)).toHaveValue('');
    const first = await spinOnce(page);
    await expect(previewLabel(page)).toHaveCount(0);
    await expect(resultNotice(page)).toHaveCount(0);
    await expectQueries(page, menuQueries(first.name));
    // 고지 5줄은 항상 보인다
    for (const line of MEAL_AREA_NOTICE_LINES) {
      await expect(main(page).getByText(line, { exact: true })).toBeVisible();
    }

    // AC-2: 입력하면 미리보기와 링크가 바로 바뀐다
    await areaInput(page).fill(AREA);
    await expect(previewLabel(page)).toBeVisible();
    await expect(resultNotice(page)).toBeVisible();
    await expect(
      resultRegion(page).getByText(
        new RegExp(`^${AREA} (${menuQueries(first.name).join('|')})$`)
      )
    ).toBeVisible();
    await expectQueries(
      page,
      menuQueries(first.name).map((q) => `${AREA} ${q}`)
    );

    // 다시 돌려도 입력이 남고 새 메뉴로 바뀐다
    const second = await spinOnce(page);
    await expect(areaInput(page)).toHaveValue(AREA);
    await expect(
      resultRegion(page).getByText(
        new RegExp(`^${AREA} (${menuQueries(second.name).join('|')})$`)
      )
    ).toBeVisible();
    await expectQueries(
      page,
      menuQueries(second.name).map((q) => `${AREA} ${q}`)
    );

    // AC-3: 새 탭, 이 페이지 주소에는 입력값 없음
    const pageUrl = page.url();
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      mapLinks(page).first().click(),
    ]);
    expect(decodeURIComponent(popup.url())).toContain(AREA);
    await popup.close();
    expect(page.url()).toBe(pageUrl);
    expect(decodeURIComponent(page.url())).not.toContain(AREA);

    // AC-8: 이 사이트로 나간 요청과 저장소에 입력 문자열이 없다
    const origin = new URL(page.url()).origin;
    const own = requests.filter((r) => r.url.startsWith(origin));
    expect(own.length).toBeGreaterThan(0);
    for (const r of own) {
      for (const text of [`${r.url}\n${r.body}`]) {
        expect(decodeURIComponent(text), r.url).not.toContain(AREA);
        expect(text, r.url).not.toContain(encodeURIComponent(AREA));
      }
    }
    const snap = await storageSnapshot(page);
    expect(JSON.stringify(snap)).not.toContain(AREA);
    expect(JSON.stringify(snap)).not.toContain(encodeURIComponent(AREA));

    // AC-7: 위치 API 호출 없음
    expect(await countGeolocation(page)).toBe(0);

    // AC-3: 새로고침하면 입력이 비어 있다
    await page.reload();
    await expect(areaInput(page)).toBeVisible();
    await expect(areaInput(page)).toHaveValue('');
    expect(await countGeolocation(page)).toBe(0);
  });

  test('AC-5: 허용되지 않는 입력은 오류 안내만 보이고 미리보기 없이 링크는 메뉴 이름만', async ({
    page,
  }) => {
    await stubMaps(page);
    await openPage(page);
    const input = areaInput(page);
    const cases = [
      { raw: 'https://a.com', text: MEAL_AREA_ERROR_TEXT.invalidChar },
      { raw: 'a/b', text: MEAL_AREA_ERROR_TEXT.invalidChar },
      { raw: 'a&b', text: MEAL_AREA_ERROR_TEXT.invalidChar },
      { raw: '강남역😀', text: MEAL_AREA_ERROR_TEXT.invalidChar },
      { raw: '가'.repeat(21), text: MEAL_AREA_ERROR_TEXT.tooLong },
    ];

    // 오류 상태에서도 돌릴 수 있고, 돌린 뒤에 오류 입력을 바꿔 넣어도 링크는 메뉴 이름만
    await input.fill(cases[0].raw);
    const { name } = await spinOnce(page);
    for (const c of cases) {
      await input.fill(c.raw);
      await expect(main(page).getByText(c.text, { exact: true })).toBeVisible();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(previewLabel(page)).toHaveCount(0);
      await expect(resultNotice(page)).toHaveCount(0);
      await expectQueries(page, menuQueries(name));
    }

    // 고치면 오류가 사라진다
    await input.fill(AREA);
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await expect(
      main(page).getByText(MEAL_AREA_ERROR_TEXT.invalidChar, { exact: true })
    ).toHaveCount(0);
    await expect(previewLabel(page)).toBeVisible();

    // 지우기 버튼
    await page
      .getByRole('button', { name: MEAL_AREA_CLEAR_BUTTON_LABEL })
      .click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(previewLabel(page)).toHaveCount(0);
  });

  test('AC-6 @smoke: 320px에서 가로 스크롤 없이 보이고 키보드로 입력란, 돌리기, 지도 링크에 닿는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await stubMaps(page);
    await openPage(page);

    const input = areaInput(page);
    // 돌리기 전에도 입력란이 보인다
    await expect(input).toBeVisible();
    const focused = (loc: ReturnType<Page['locator']>) =>
      loc.evaluate((el) => el === document.activeElement);

    // Tab만으로 돌리기 버튼 → 입력란
    const spin = spinButton(page);
    await spin.focus();
    await page.keyboard.press('Enter');
    await expect(previewLabel(page)).toHaveCount(0);
    let reached = false;
    for (let i = 0; i < 12 && !reached; i += 1) {
      await page.keyboard.press('Tab');
      reached = await focused(input);
    }
    expect(reached, '돌리기 뒤 Tab으로 입력란에 닿는다').toBe(true);
    await input.fill(AREA);
    await expect(
      main(page).getByText(MEAL_AREA_NOTICE_LINES[0], { exact: true })
    ).toBeVisible();
    await expect(previewLabel(page)).toBeVisible();

    // Tab만으로 지도 링크
    const firstLink = mapLinks(page).first();
    let linkReached = false;
    for (let i = 0; i < 12 && !linkReached; i += 1) {
      await page.keyboard.press('Tab');
      linkReached = await focused(firstLink);
    }
    expect(linkReached, 'Tab으로 첫 지도 링크에 닿는다').toBe(true);

    await expect(mapLinks(page)).toHaveCount(3);
    for (const i of [0, 1, 2]) {
      await expect(mapLinks(page).nth(i)).toBeVisible();
    }
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
