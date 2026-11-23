import { expect, type Page } from '@playwright/test';
import { MEAL_LIST } from '@/features/meal/constants/meal.constant';
import {
  MEAL_CATEGORIES,
  MEAL_DEFAULT_CATEGORIES,
} from '@/features/meal/constants/meal-category.constant';
import { MEAL_LUCK_LINES } from '@/features/meal/constants/meal-luck.constant';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import * as notice from '@/features/meal/constants/meal-notice.constant';
import type { MealKeyType } from '@/features/meal/types/meal.type';
import { declineCookies } from './common.util';

// /meal 화면 테스트용 헬퍼 (e2e/meal.spec.ts 전용)

export const MEAL_PATH = '/meal';
export const MEALS: readonly MealKeyType[] = ['lunch', 'dinner', 'breakfast'];
export const SPIN = notice.MEAL_SPIN_BUTTON_LABEL;
export const RESPIN = notice.MEAL_RESPIN_BUTTON_LABEL;
const ALL_NAMES = MEALS.flatMap((m) => MEAL_MENUS[m].map((x) => x.name));

export const mealLabel = (meal: MealKeyType) =>
  MEAL_LIST.find((m) => m.key === meal)?.label ?? '';
export const main = (page: Page) => page.getByRole('main');
export const spinButton = (page: Page) =>
  page.getByRole('button', { name: new RegExp(`^(${SPIN}|${RESPIN})$`) });
export const resultRegion = (page: Page) =>
  page.getByRole('region', { name: new RegExp(`^(${ALL_NAMES.join('|')})$`) });
export const announce = (page: Page, text: RegExp | string) =>
  page.getByRole('status').filter({ hasText: text });
export const chip = (page: Page, label: string) =>
  page.getByRole('button', { name: label, exact: true });
export const radio = (page: Page, meal: MealKeyType) =>
  page.getByRole('radio', { name: mealLabel(meal), exact: true });
export const mapLinks = (page: Page) =>
  main(page).getByRole('link', { name: /^(카카오맵|네이버지도|구글 지도)/ });

/** 이동, h1 확인, 칩이 반응할 때까지(하이드레이션) 반복, 쿠키 배너 닫기 */
export async function openPage(page: Page): Promise<void> {
  const res = await page.goto(MEAL_PATH);
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

/** 끼니 칸(label)을 눌러 바꾼다 */
export async function pickMeal(page: Page, meal: MealKeyType): Promise<void> {
  await main(page).getByText(mealLabel(meal), { exact: true }).first().click();
  await expect(radio(page, meal)).toBeChecked();
}

/** 결과 알림 문장에서 뽑힌 메뉴 이름과 카테고리 이름을 읽는다 */
export async function readResult(
  page: Page
): Promise<{ name: string; cat: string }> {
  const status = announce(page, '뽑힌 메뉴는');
  await expect(status).toBeVisible({ timeout: 10_000 });
  const text = (await status.textContent()) ?? '';
  const m = /뽑힌 메뉴는 (.+)\((.+)\)입니다/.exec(text);
  expect(m, `알림 문장: ${text}`).not.toBeNull();
  return { name: m?.[1] ?? '', cat: m?.[2] ?? '' };
}

export async function spinOnce(page: Page) {
  await spinButton(page).click();
  return readResult(page);
}

/** 뽑힌 결과가 그 끼니의 메뉴·운세 라벨·운세 문구와 맞는지 확인한다 */
export async function expectResultOf(
  page: Page,
  meal: MealKeyType,
  r: { name: string; cat: string }
): Promise<void> {
  const menu = MEAL_MENUS[meal].find((x) => x.name === r.name);
  expect(menu, `${meal} 목록에 없는 메뉴 ${r.name}`).toBeTruthy();
  const category = MEAL_CATEGORIES[meal].find((c) => c.key === menu?.category);
  expect(category?.label).toBe(r.cat);
  const region = resultRegion(page);
  await expect(region).toHaveCount(1);
  await expect(
    region.getByRole('heading', { level: 2, name: r.name })
  ).toBeVisible();
  const luckLabel = MEAL_LIST.find((m) => m.key === meal)?.luckLabel ?? '';
  await expect(region.getByText(luckLabel, { exact: true })).toBeVisible();
  const lines: Readonly<Record<string, readonly string[]>> =
    MEAL_LUCK_LINES[meal];
  const own = lines[menu?.category ?? ''] ?? [];
  const pattern = own
    .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  await expect(region).toContainText(new RegExp(pattern));
}

/** 외부 지도 사이트는 실제로 접속하지 않고 가로챈다 */
export async function stubMaps(page: Page): Promise<void> {
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

type GeoWindowType = { __geo: number };

/** navigator.geolocation 호출 횟수를 센다 */
export async function watchGeolocation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as GeoWindowType;
    w.__geo = 0;
    const proto = Geolocation.prototype as unknown as Record<
      string,
      (...a: unknown[]) => unknown
    >;
    for (const fn of ['getCurrentPosition', 'watchPosition']) {
      const orig = proto[fn];
      proto[fn] = function (this: unknown, ...args: unknown[]) {
        w.__geo += 1;
        return orig.apply(this, args);
      };
    }
  });
}

export const countGeolocation = (page: Page) =>
  page.evaluate(() => (window as unknown as GeoWindowType).__geo);

const pressed = (page: Page, label: string, value: 'true' | 'false') =>
  expect(chip(page, label)).toHaveAttribute('aria-pressed', value);

const chipGroup = (page: Page) =>
  page.getByRole('group', { name: notice.MEAL_CATEGORY_GROUP_LABEL });

/** AC-36, 37, 38: 저녁 칩 7개, 야식 꺼짐, 후보는 야식 뺀 기본 전체 -> 켜면 야식만, 점심으로 가면 야식 칩 없음 */
export async function checkDinnerLateNight(page: Page): Promise<void> {
  const buttons = chipGroup(page).getByRole('button');
  await expect(buttons).toHaveCount(7);
  await expect(buttons.last()).toHaveText('야식');
  for (const c of MEAL_DEFAULT_CATEGORIES.dinner)
    await pressed(page, c.label, 'true');
  await pressed(page, '야식', 'false');
  const dinner = MEAL_MENUS.dinner;
  const baseCount = dinner.filter((m) => m.category !== 'lateNight').length;
  const lateCount = dinner.length - baseCount;
  await expect(main(page).getByText(`후보 메뉴 ${baseCount}개`)).toBeVisible();
  // 다른 카테고리에도 있는 이름은 이름만으로 야식 여부를 가릴 수 없어 뺀다
  const baseNames = new Set(
    dinner.filter((m) => m.category !== 'lateNight').map((m) => m.name)
  );
  const late = new Set(
    dinner
      .filter((m) => m.category === 'lateNight' && !baseNames.has(m.name))
      .map((m) => m.name)
  );
  for (let i = 0; i < 3; i++) {
    const r = await spinOnce(page);
    expect(late.has(r.name), `야식 꺼짐: ${r.name}`).toBe(false);
    await expectResultOf(page, 'dinner', r);
    await expect(spinButton(page)).not.toHaveAttribute(
      'aria-disabled',
      'true',
      {
        timeout: 10_000,
      }
    );
  }
  await chip(page, '야식').click();
  await pressed(page, '야식', 'true');
  await expect(main(page).getByText(`후보 메뉴 ${lateCount}개`)).toBeVisible();
  for (const c of MEAL_DEFAULT_CATEGORIES.dinner)
    await pressed(page, c.label, 'false');
  // 다른 칩을 누르면 야식이 꺼지고 그 칩만 켜진다
  await chip(page, '세계·기타').click();
  await pressed(page, '야식', 'false');
  await pressed(page, '세계·기타', 'true');
  await chip(page, '야식').click();
  await pressed(page, '야식', 'true');
  // 야식만 켠 채 점심으로 가면 야식 칩이 사라지고 점심 6개가 켜진다
  await pickMeal(page, 'lunch');
  await expect(chip(page, '야식')).toHaveCount(0);
  await expect(buttons).toHaveCount(6);
  for (const c of MEAL_DEFAULT_CATEGORIES.lunch)
    await pressed(page, c.label, 'true');
  await pickMeal(page, 'dinner');
  await pressed(page, '야식', 'false');
}

/** AC-40: 야식 칩이 Tab으로 닿고 Space·Enter로 켜지고 꺼진다 */
export async function checkLateNightKeyboard(page: Page): Promise<void> {
  await chip(page, '세계·기타').focus();
  await page.keyboard.press('Tab');
  await expect(chip(page, '야식')).toBeFocused();
  await page.keyboard.press('Space');
  await pressed(page, '야식', 'true');
  await page.keyboard.press('Enter');
  await pressed(page, '야식', 'false');
  // 야식을 끄면 칩이 모두 꺼지고, 후보는 야식 뺀 기본 전체다
  for (const c of MEAL_DEFAULT_CATEGORIES.dinner)
    await pressed(page, c.label, 'false');
  const baseCount = MEAL_MENUS.dinner.filter(
    (m) => m.category !== 'lateNight'
  ).length;
  await expect(main(page).getByText(`후보 메뉴 ${baseCount}개`)).toBeVisible();
}

/** AC-26, 40: 저녁 7칩(야식 켬) 320·390px 가로 스크롤 없음, 1280px 4열 2줄과 끼니별 칩 영역 높이 동일 */
export async function checkChipLayout(page: Page): Promise<void> {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await pickMeal(page, 'dinner');
    if ((await chip(page, '야식').getAttribute('aria-pressed')) === 'false')
      await chip(page, '야식').click();
    expect(await horizontalOverflow(page), `${width}px`).toBeLessThanOrEqual(0);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  const heights: number[] = [];
  for (const meal of MEALS) {
    await pickMeal(page, meal);
    const ys = new Set<number>();
    for (const b of await chipGroup(page).getByRole('button').all())
      ys.add(Math.round((await b.boundingBox())?.y ?? -1));
    expect(ys.size, `${meal} 칩 줄 수`).toBe(2);
    heights.push(
      Math.round((await chipGroup(page).boundingBox())?.height ?? 0)
    );
  }
  expect(new Set(heights).size, `칩 영역 높이 ${heights}`).toBe(1);
}

/** 가로 넘침 픽셀 수 (0 이하면 가로 스크롤 없음) */
export const horizontalOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
