import { expect, type Page } from '@playwright/test';
import { declineCookies, waitForHydration } from './common.util';

export const LD_HUB = '/lucky-draw';
export const LD_LADDER = '/lucky-draw/ladder';
export const LD_ROULETTE = '/lucky-draw/roulette';
export const LD_LOTS = '/lucky-draw/lots';
export const LD_TOOLS = [
  { path: LD_LADDER, h1: '사다리 타기' },
  { path: LD_ROULETTE, h1: '돌림판' },
  { path: LD_LOTS, h1: '제비뽑기' },
] as const;

/** 줄 입력 예시: lines('항목R', 3) -> 항목R01, 항목R02, 항목R03 (다른 문구와 겹치지 않는 토큰) */
export const lines = (prefix: string, n: number): string[] =>
  Array.from(
    { length: n },
    (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`
  );

export const main = (page: Page) => page.getByRole('main');
export const status = (page: Page, text: RegExp | string) =>
  page.getByRole('status').filter({ hasText: text });

/** 이동, h1 확인, React가 붙을 때까지 대기, 쿠키 배너 닫기 */
export async function openTool(page: Page, path: string): Promise<void> {
  const res = await page.goto(path);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await waitForHydration(page);
  await declineCookies(page);
}

/** textarea 값을 채운다. 하이드레이션 전 입력이 사라지는 경우를 값 확인으로 잡는다 */
export async function fillLines(
  page: Page,
  label: string,
  items: readonly string[]
): Promise<void> {
  const box = page.getByRole('textbox', { name: label, exact: true });
  await box.fill(items.join('\n'));
  await expect(box).toHaveValue(items.join('\n'));
}

export const radio = (page: Page, label: string) =>
  page.getByRole('radio', { name: label, exact: true });

/** 공개 방식 라디오는 sr-only라 라벨 글자를 눌러 고른다 */
export async function pickReveal(page: Page, label: string): Promise<void> {
  await page.getByText(label, { exact: true }).first().click();
  await expect(radio(page, label)).toBeChecked();
}

export const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

/** 가로 스크롤이 생겼는지 */
export const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );

/**
 * body HTML에 들어 있는 토큰만 돌려 준다. textarea 값, script, style, noscript는 뺀다.
 * 글자, aria-label, data-* 속성 어디에든 있으면 잡힌다.
 */
export async function tokensInDom(
  page: Page,
  tokens: readonly string[]
): Promise<string[]> {
  return page.evaluate((list) => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    for (const el of clone.querySelectorAll(
      'textarea, script, style, noscript'
    )) {
      el.remove();
    }
    const html = clone.innerHTML;
    return list.filter((t) => html.includes(t));
  }, tokens);
}

/** 제비뽑기 카드 목록(ol, 접근 이름 "카드 N장"). 섞기 전에는 없다 */
export const cardList = (page: Page) =>
  page.getByRole('list', { name: /^카드 \d+장$/ });

/** 위치 번호(1부터)의 카드 button. 열기 전후 같은 요소라 이름 대신 위치로 찾는다 */
export const cardAt = (page: Page, n: number) =>
  cardList(page)
    .getByRole('listitem')
    .nth(n - 1)
    .getByRole('button');

export const closedCards = (page: Page) =>
  cardList(page).getByRole('button', { name: /^\d+번째 카드 열기$/ });

export const openedCards = (page: Page) =>
  cardList(page).getByRole('button', { name: /^\d+번째 카드: / });

/** 열린 카드의 항목 글자만 읽는다 */
export async function readOpenedLabels(page: Page): Promise<string[]> {
  const names = await openedCards(page).evaluateAll((els) =>
    els.map((el) => el.getAttribute('aria-label') ?? '')
  );
  return names.map((n) => n.replace(/^\d+번째 카드: /, ''));
}

/** 돌림판 SVG 강조 칸(굵은 테두리 path)과 강조 색 클래스를 가진 요소 수 */
export const rouletteAccentCount = (page: Page) =>
  page.evaluate(
    () =>
      document.querySelectorAll(
        'main svg path[stroke-width="3"], main svg [class*="fill-menu-lucky/20"]'
      ).length
  );

/** 돌림판 SVG 안 글자(<text>) 수. 칸 글자와 가운데 글자 */
export const rouletteTextCount = (page: Page) =>
  page.locator('main svg text').count();
