import { expect, type Page, test } from '@playwright/test';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import { RESULT_NEXT_LINKS_TITLE } from '@/constants/result-next-links.constant';
import { FORTUNE_CONSENT_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import { FORTUNE_SAJU_PANEL_TEXTS } from '@/features/fortune/constants/fortune-saju-notice.constant';
import { TAROT_RESULT_DISCLAIMER_TEXT } from '@/features/tarot/constants/tarot-notice.constant';
import {
  declineCookies,
  passLottoAgeGate,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';
import { main, openPage, spinButton, spinOnce } from './helpers/meal.util';

// 결과 화면 다음 기능 링크. 기능 종류별 대표 흐름 1개씩(사주, 타로, 뭐 먹지, 로또).
test.beforeEach(() => test.setTimeout(90_000));

const nextNav = (page: Page) =>
  page.getByRole('navigation', { name: RESULT_NEXT_LINKS_TITLE });
const nextLinks = (page: Page) => nextNav(page).getByRole('link');

test('AC-1: 사주 결과 뒤에 다른 기능 링크 2개가 보이고 누르면 이동한다', async ({
  page,
}) => {
  const { pageErrors } = watchPageErrors(page);
  await page.clock.setFixedTime(new Date('2045-06-01T09:00:00+09:00'));
  await page.goto(FORTUNE_ROUTES.saju);
  await declineCookies(page);
  for (const item of FORTUNE_CONSENT_TEXTS.items) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
  await page
    .getByRole('button', {
      name: FORTUNE_CONSENT_TEXTS.grantButton,
      exact: true,
    })
    .click();
  await page.getByRole('radio', { name: '양력', exact: true }).check({
    force: true,
  });
  await page.getByLabel('연도', { exact: true }).fill('1990');
  await page.getByLabel('월', { exact: true }).fill('6');
  await page.getByLabel('일', { exact: true }).fill('15');
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.dateSubmitLabel,
      exact: true,
    })
    .click();
  await expect(nextNav(page)).toHaveCount(0);
  await page.getByLabel('시', { exact: true }).fill('12');
  await page.getByLabel('분', { exact: true }).fill('30');
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormSubmit,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: '연·월·일·시 기둥' })
  ).toBeVisible();
  await expect(nextNav(page)).toBeVisible();
  await expect(nextLinks(page)).toHaveCount(2);
  await nextLinks(page).first().click();
  await expect(page).toHaveURL(/\/fortune\/today$/);
  expect(pageErrors).toEqual([]);
});

test('AC-2: 타로 카드를 뽑으면 면책·상담전화가 보이고 링크 블록이 가리지 않는다', async ({
  page,
}) => {
  await page.goto('/tarot/daily');
  await declineCookies(page);
  await waitForHydration(page);
  await expect(nextNav(page)).toHaveCount(0);
  await page.getByRole('button', { name: '카드 뽑기', exact: true }).click();
  const nav = nextNav(page);
  await expect(nav).toBeVisible();
  await expect(nextLinks(page)).toHaveCount(2);
  const disclaimer = page.getByText(TAROT_RESULT_DISCLAIMER_TEXT);
  await expect(disclaimer).toBeVisible();
  const phones = page.getByRole('list').filter({
    has: page.getByText(CRISIS_PHONES[0].name),
  });
  await expect(phones.first()).toBeVisible();
  // 블록과 고지·전화 목록의 박스가 겹치지 않는다
  const navBox = await nav.boundingBox();
  for (const el of [disclaimer, phones.first()]) {
    const box = await el.boundingBox();
    expect(box && navBox).toBeTruthy();
    const apart =
      (box?.y ?? 0) + (box?.height ?? 0) <= (navBox?.y ?? 0) + 1 ||
      (navBox?.y ?? 0) + (navBox?.height ?? 0) <= (box?.y ?? 0) + 1;
    expect(apart, '링크 블록이 고지와 겹침').toBe(true);
  }
});

test('AC-3: 뭐 먹지 결과 뒤 링크 2개에 Tab 포커스가 가고 Enter로 이동한다', async ({
  page,
}) => {
  await openPage(page);
  await expect(nextNav(page)).toHaveCount(0);
  await spinOnce(page);
  await expect(spinButton(page)).toBeEnabled();
  await expect(nextLinks(page)).toHaveCount(2);
  await expect(
    main(page).getByRole('navigation', { name: RESULT_NEXT_LINKS_TITLE })
  ).toBeVisible();
  const first = nextLinks(page).first();
  await expect(async () => {
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused({ timeout: 500 });
  }).toPass();
  await expect(first).toBeFocused();
  const ring = await first.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(ring, '포커스 표시(ring)').not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/lucky-draw\/ladder$/);
});

test('AC-4: 로또 번호 생성 후 링크 2개는 /lotto/ 아래이고 고지가 가려지지 않는다', async ({
  page,
}) => {
  await page.goto('/lotto/generator');
  await passLottoAgeGate(page);
  await declineCookies(page);
  await waitForHydration(page);
  await expect(nextNav(page)).toHaveCount(0);
  await page.getByRole('button', { name: '번호 뽑기' }).click();
  const nav = nextNav(page);
  await expect(nav).toBeVisible();
  const hrefs = await nextLinks(page).evaluateAll((els) =>
    els.map((el) => el.getAttribute('href'))
  );
  expect(hrefs).toHaveLength(2);
  for (const h of hrefs) expect(h).toMatch(/^\/lotto\/[a-z-]+$/);
  const notice = page
    .locator('footer')
    .filter({ hasText: '비공식 서비스' })
    .getByText('당첨을 보장하지 않습니다');
  await expect(notice).toBeVisible();
  const [a, b] = await Promise.all([nav.boundingBox(), notice.boundingBox()]);
  expect(a && b).toBeTruthy();
  expect(
    (a?.y ?? 0) + (a?.height ?? 0) <= (b?.y ?? 0) + 1 ||
      (b?.y ?? 0) + (b?.height ?? 0) <= (a?.y ?? 0) + 1,
    '링크 블록이 고지와 겹침'
  ).toBe(true);
});
