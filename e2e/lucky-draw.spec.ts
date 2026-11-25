import { expect, type Page, test } from '@playwright/test';
import {
  recordRequests,
  storageSnapshot,
  watchPageErrors,
} from './helpers/common.util';
import {
  button,
  cardAt,
  cardList,
  closedCards,
  fillLines,
  hasHorizontalOverflow,
  LD_HUB,
  LD_LADDER,
  LD_LOTS,
  LD_ROULETTE,
  LD_TOOLS,
  lines,
  main,
  openedCards,
  openTool,
  pickReveal,
  radio,
  readOpenedLabels,
  rouletteAccentCount,
  rouletteTextCount,
  status,
  tokensInDom,
} from './helpers/lucky-draw.util';

const DISCLAIMER =
  '이 도구는 오락 목적으로 제공됩니다. 결과는 무작위로 정해지며, 추천이나 평가가 아니고 어떤 결과도 보장하지 않습니다.';
const RESULT_NOTICE =
  '결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 관련이 없습니다.';

test.beforeEach(() => test.setTimeout(90_000));

const reduceMotion = (page: Page) =>
  page.emulateMedia({ reducedMotion: 'reduce' });
const spinBtn = (page: Page) => button(page, '돌리기');
const shuffleBtn = (page: Page) =>
  page.getByRole('button', { name: /^(다시 )?섞기$/ });
const startBtn = (page: Page) => button(page, '시작');
const pickerButtons = (page: Page) =>
  page.getByRole('group', { name: '이름 고르기' }).getByRole('button');
const ladderList = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: '전체 결과' }) });
const openRestBtn = (page: Page) => button(page, '남은 카드 모두 열기');

test.describe('허브와 공통', () => {
  test('AC-7: 네 페이지 모두 noindex가 아니고 사이트맵에 있다', async ({
    page,
    request,
  }) => {
    const paths = [LD_HUB, ...LD_TOOLS.map((t) => t.path)];
    for (const path of paths) {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(
        page.locator('meta[name="robots"][content*="noindex"]'),
        `${path} robots`
      ).toHaveCount(0);
    }
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBeLessThan(400);
    const xml = await sitemap.text();
    for (const path of paths) {
      expect(xml, path).toMatch(new RegExp(`${path}</loc>`));
    }
  });

  test('AC-1, 4, 5, 38, 39: 허브에 h1, 도구 링크, 고지, 역할 비교가 있고 서버 HTML에도 있다', {
    tag: '@smoke',
  }, async ({ page, request }) => {
    const ROLE_COMPARE =
      '이름과 결과를 짝지을 때는 사다리 타기, 하나만 고를 때는 돌림판, 항목을 한 장씩 뽑을 때는 제비뽑기를 쓰세요.';
    const errors = watchPageErrors(page);
    const res = await page.goto(LD_HUB);
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole('heading', { level: 1, name: '운빨 뽑기' })
    ).toHaveCount(1);
    for (const t of LD_TOOLS) {
      await expect(main(page).locator(`a[href="${t.path}"]`)).toBeVisible();
    }
    await expect(main(page).getByText(DISCLAIMER).first()).toBeVisible();
    await expect(main(page).getByText(ROLE_COMPARE)).toBeVisible();
    await expect(
      main(page).getByText('뒷면 카드를 한 장씩 열어 항목을 하나씩 뽑아요.')
    ).toBeVisible();
    expect(errors.pageErrors).toEqual([]);
    expect(errors.hydration).toEqual([]);
    // JavaScript 없이 받은 HTML에도 있다
    const html = await (await request.get(LD_HUB)).text();
    expect(html).toContain(ROLE_COMPARE);
    expect(html).toContain('제비뽑기는 뒷면 카드를 한 장씩 엽니다.');
    expect(html).not.toContain('제비뽑기는 결과 가리기');
  });

  test('AC-2, 4, 8, 38, 39: 세 도구 페이지는 h1 하나, 메타, 고지가 있고 제비뽑기 서버 HTML에 FAQ가 있다', async ({
    page,
    request,
  }) => {
    for (const t of LD_TOOLS) {
      const errors = watchPageErrors(page);
      const res = await page.goto(t.path);
      expect(res?.status(), t.path).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole('heading', { level: 1, name: t.h1 })
      ).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(t.h1));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        /.+/
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`${t.path}$`)
      );
      await expect(main(page).getByText(DISCLAIMER).first()).toBeVisible();
      await expect(main(page).getByText(RESULT_NOTICE).first()).toBeVisible();
      expect(errors.pageErrors).toEqual([]);
    }
    const html = await (await request.get(LD_LOTS)).text();
    for (const q of [
      '카드는 어떻게 섞이나요?',
      '한 번 연 카드를 다시 열 수 있나요?',
      '같은 이름을 여러 번 넣어도 되나요?',
      '순서 정하기에도 쓸 수 있나요?',
    ]) {
      expect(html).toContain(q);
    }
    // 열기 전 카드와 항목 글자는 서버 HTML에 없다
    expect(html).not.toMatch(/번째 카드 열기/);
  });

  test('AC-48: 약관 운빨 뽑기 장은 장 번호가 이어지고 제비뽑기가 카드 방식이다', async ({
    page,
  }) => {
    const res = await page.goto('/terms');
    expect(res?.status()).toBeLessThan(400);
    const nums = (
      await page.getByRole('heading', { level: 2 }).allTextContents()
    )
      .map((t) => Number.parseInt(t, 10))
      .filter((n) => !Number.isNaN(n));
    expect(nums.length).toBeGreaterThanOrEqual(10);
    nums.forEach((n, i) => {
      expect(n).toBe(i + 1);
    });
    const chapter = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /운빨 뽑기 서비스/ }),
    });
    await expect(chapter.getByRole('heading', { level: 2 })).toHaveText(
      /^10\. 운빨 뽑기 서비스$/
    );
    const text = ((await chapter.textContent()) ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('카드를 열어야 항목이 표시됩니다');
    expect(text).not.toContain('결과 가리기');
    await expect(
      page.getByRole('heading', { level: 2, name: /^12\. 광고 및 쿠키$/ })
    ).toBeVisible();
    await expect(page.getByText(/제비뽑기\(카드 한 장씩 열기\)/)).toBeVisible();
  });

  test('AC-7: 홈·헤더·모바일 메뉴에 운빨 뽑기가 보이고 준비 중 배지가 없다', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByText('준비 중')).toHaveCount(0);
    if (testInfo.project.name === 'desktop') {
      await expect(
        page
          .locator('header')
          .getByRole('link', { name: /운빨 뽑기/ })
          .first()
      ).toBeVisible();
    }
    await expect(
      page.getByRole('link', { name: /운빨 뽑기/ }).first()
    ).toBeVisible();
  });
});

test.describe('사다리 타기', () => {
  test('AC-9, 10, 29: 시작 전에는 막히고 안내가 보이며 결과가 DOM에 없다', async ({
    page,
  }) => {
    await openTool(page, LD_LADDER);
    const p = lines('인물P', 3);
    const r = lines('벌칙Q', 3);
    await expect(startBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await fillLines(page, '참가자', p.slice(0, 1));
    await fillLines(page, '결과', r.slice(0, 1));
    await expect(startBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('참가자를 2명 이상 입력하세요.')).toBeVisible();
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', r.slice(0, 2));
    await expect(startBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByText('참가자 3명, 결과 2개예요. 같은 수로 맞춰 주세요.')
    ).toBeVisible();
    await fillLines(page, '참가자', lines('인물P', 11));
    await fillLines(page, '결과', lines('벌칙Q', 11));
    await expect(startBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText(/참가자는 최대 10명까지/)).toBeVisible();
    // 시작 전: 사다리 그림, 결과 제목, 결과 글자가 없다
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', r);
    await expect(startBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByRole('heading', { name: '결과', level: 2 })
    ).toHaveCount(0);
    await expect(page.locator('main svg line')).toHaveCount(0);
    expect(await tokensInDom(page, [...p, ...r])).toEqual([]);
  });

  test('AC-14, 15, 30, 45: 동작 줄이기에서 이름별 결과가 바로 한 번씩 나오고 전체 결과는 중복이 없다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await openTool(page, LD_LADDER);
    const p = lines('인물P', 4);
    const r = lines('벌칙Q', 4);
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', r);
    for (const label of ['일괄 공개', '결과 가리기', '한 명씩 열기']) {
      await expect(radio(page, label)).toHaveCount(1);
    }
    await expect(radio(page, '일괄 공개')).toBeChecked();
    await startBtn(page).click();
    await expect(button(page, '다시 시작')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '결과', level: 2 })
    ).toBeVisible();
    const names = ladderList(page).getByRole('term');
    const results = ladderList(page).getByRole('definition');
    await expect(names).toHaveCount(4);
    expect((await names.allTextContents()).sort()).toEqual(p);
    const got = await results.allTextContents();
    expect([...got].sort()).toEqual(r);
    for (let i = 0; i < p.length; i += 1) {
      await pickerButtons(page).nth(i).click();
      await expect(status(page, `${p[i]}의 결과:`)).toHaveCount(1, {
        timeout: 3000,
      });
      const text = (await status(page, `${p[i]}의 결과:`).textContent()) ?? '';
      const idx = (await names.allTextContents()).indexOf(p[i]);
      expect(text).toBe(`${p[i]}의 결과: ${got[idx]}`);
    }
  });

  test('AC-18, 14: 경로를 그리는 동안 이름 고르기와 입력이 막히고 끝나면 결과가 나온다', async ({
    page,
  }) => {
    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', lines('인물P', 3));
    await fillLines(page, '결과', lines('벌칙Q', 3));
    await startBtn(page).click();
    await pickerButtons(page).first().click();
    await expect(
      page.getByRole('textbox', { name: '참가자', exact: true })
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(pickerButtons(page).nth(1)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(status(page, '인물P01의 결과:')).toHaveCount(1, {
      timeout: 15_000,
    });
    await expect(pickerButtons(page).nth(1)).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  test('AC-31, 32: 결과 가리기는 결과 보기 전까지, 한 명씩 열기는 고른 이름만 결과가 DOM에 있다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await openTool(page, LD_LADDER);
    const p = lines('인물P', 4);
    const r = lines('벌칙Q', 4);
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', r);
    await pickReveal(page, '결과 가리기');
    await startBtn(page).click();
    await expect(button(page, '결과 보기')).toBeVisible();
    expect(await tokensInDom(page, r)).toEqual([]);
    await button(page, '결과 보기').click();
    await expect(ladderList(page).getByRole('definition')).toHaveCount(4);
    expect((await tokensInDom(page, r)).length).toBe(4);
    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', r);
    await pickReveal(page, '한 명씩 열기');
    await startBtn(page).click();
    expect(await tokensInDom(page, r)).toEqual([]);
    await pickerButtons(page).nth(1).click();
    await expect(status(page, `${p[1]}의 결과:`)).toHaveCount(1);
    expect((await tokensInDom(page, r)).length).toBe(1);
    await expect(ladderList(page).getByRole('term')).toHaveCount(1);
    await pickerButtons(page).nth(2).click();
    await expect(status(page, `${p[2]}의 결과:`)).toHaveCount(1);
    expect((await tokensInDom(page, r)).length).toBe(2);
  });
});

test.describe('돌림판', () => {
  test('AC-16, 30: 항목 수에 따라 돌리기가 막히고 29줄째는 추가되지 않는다', async ({
    page,
  }) => {
    await openTool(page, LD_ROULETTE);
    await expect(spinBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('두 개 이상 입력하세요.')).toBeVisible();
    await expect(radio(page, '일괄 공개')).toBeChecked();
    await expect(radio(page, '결과 가리기')).toHaveCount(1);
    await expect(radio(page, '한 명씩 열기')).toHaveCount(0);
    await fillLines(page, '항목', lines('항목R', 1));
    await expect(spinBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await fillLines(page, '항목', lines('항목R', 2));
    await expect(spinBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    await fillLines(page, '항목', lines('항목R', 28));
    await expect(spinBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('28 / 28개')).toBeVisible();
    await fillLines(page, '항목', lines('항목R', 29));
    await expect(page.getByText('28 / 28개')).toBeVisible();
    await expect(
      page.getByText(/최대 28개까지 입력할 수 있어요/)
    ).toBeVisible();
  });

  test('AC-17, 18, 21, 44: 돌리면 회전 중에는 막히고 멈춘 뒤 결과가 알림에 한 번 나오며 목록은 그대로다', async ({
    page,
  }) => {
    await openTool(page, LD_ROULETTE);
    const items = lines('항목R', 4);
    await fillLines(page, '항목', items);
    await expect(
      main(page).getByText('돌리기를 누르면 결과가 여기에 나와요.')
    ).toBeVisible();
    const t0 = Date.now();
    await spinBtn(page).click();
    await expect(status(page, '돌리는 중이에요.')).toHaveCount(1);
    await expect(spinBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByRole('textbox', { name: '항목', exact: true })
    ).toHaveAttribute('aria-disabled', 'true');
    const done = status(page, /^돌림판 결과: /);
    await expect(done).toHaveCount(1, { timeout: 10_000 });
    expect(Date.now() - t0).toBeGreaterThanOrEqual(800);
    const picked = ((await done.textContent()) ?? '').replace(
      '돌림판 결과: ',
      ''
    );
    expect(items).toContain(picked);
    await expect(
      main(page).locator('p', { hasText: picked }).first()
    ).toBeVisible();
    await expect(spinBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    // 빼기가 꺼져 있으면 뽑힌 항목이 목록에 남는다
    await expect(page.getByText('4 / 28개')).toBeVisible();
    await expect(page.getByRole('heading', { name: /남은 항목/ })).toHaveCount(
      0
    );
    await expect(
      page.getByRole('textbox', { name: '항목', exact: true })
    ).toHaveValue(items.join('\n'));
  });

  test('AC-20, 21, 45: 뽑힌 항목 빼기를 켜면 한 개 남을 때까지 줄고 처음부터로 결과 상자와 목록이 돌아온다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', lines('항목R', 3));
    const sw = page.getByRole('switch', { name: '뽑힌 항목 빼기' });
    await expect(sw).not.toBeChecked();
    await sw.click();
    await expect(sw).toBeChecked();
    await expect(
      page.getByRole('heading', { name: '남은 항목 3개' })
    ).toBeVisible();
    await spinBtn(page).click();
    await expect(
      page.getByRole('heading', { name: '남은 항목 2개' })
    ).toBeVisible();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1);
    await spinBtn(page).click();
    await expect(
      page.getByRole('heading', { name: '남은 항목 1개' })
    ).toBeVisible();
    await expect(spinBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText(/항목이 한 개 남았어요/)).toBeVisible();
    await button(page, '처음부터').click();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(0);
    await expect(
      main(page).getByText('돌리기를 누르면 결과가 여기에 나와요.')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '남은 항목 3개' })
    ).toBeVisible();
    await expect(spinBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('AC-31, 31a: 결과 가리기는 돌림판 칸 글자와 강조 칸까지 가리고 결과 보기로 연다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await openTool(page, LD_ROULETTE);
    const items = lines('항목R', 4);
    await fillLines(page, '항목', items);
    await pickReveal(page, '결과 가리기');
    expect(await rouletteTextCount(page)).toBe(0);
    expect(await rouletteAccentCount(page)).toBe(0);
    expect(await tokensInDom(page, items)).toEqual([]);
    await spinBtn(page).click();
    await expect(
      main(page).getByText('결과 보기를 누르면 칸 글자와 결과가 나와요.')
    ).toBeVisible();
    await expect(page.locator('main svg text')).toHaveCount(0);
    expect(await rouletteAccentCount(page)).toBe(0);
    expect(await tokensInDom(page, items)).toEqual([]);
    await expect(status(page, '돌림판 결과')).toHaveCount(0);
    await expect(spinBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await button(page, '결과 보기').click();
    const done = status(page, /^돌림판 결과: /);
    await expect(done).toHaveCount(1);
    const picked = ((await done.textContent()) ?? '').replace(
      '돌림판 결과: ',
      ''
    );
    expect(items).toContain(picked);
    await expect(page.locator('main svg text')).toHaveCount(5);
    await expect(page.locator('main svg text').last()).toHaveText(picked);
    await expect(page.locator('main svg path[stroke-width="3"]')).toHaveCount(
      1
    );
    expect((await tokensInDom(page, items)).length).toBeGreaterThanOrEqual(1);
    await expect(spinBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    // 일괄 공개로 바꾸면 바로 보이고, 다시 가리면 칸 글자도 사라진다
    await pickReveal(page, '일괄 공개');
    expect(await rouletteTextCount(page)).toBe(5);
    await pickReveal(page, '결과 가리기');
    expect(await rouletteTextCount(page)).toBe(0);
    expect(await rouletteAccentCount(page)).toBe(0);
    expect(await tokensInDom(page, items)).toEqual([]);
  });
});

test.describe('제비뽑기 (카드 한 장 뽑기)', () => {
  test('AC-22, 30: 항목 수에 따라 섞기가 막히고 31줄째는 추가되지 않으며 공개 방식 선택이 없다', async ({
    page,
  }) => {
    await openTool(page, LD_LOTS);
    await expect(shuffleBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(
      page.getByRole('group', { name: '결과 공개 방식' })
    ).toHaveCount(0);
    await expect(button(page, '결과 보기')).toHaveCount(0);
    await expect(button(page, '결과 가리기')).toHaveCount(0);
    await fillLines(page, '항목', lines('항목L', 1));
    await expect(shuffleBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await fillLines(page, '항목', lines('항목L', 2));
    await expect(shuffleBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    await fillLines(page, '항목', lines('항목L', 30));
    await expect(shuffleBtn(page)).not.toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('30 / 30개')).toBeVisible();
    await fillLines(page, '항목', lines('항목L', 31));
    await expect(page.getByText('30 / 30개')).toBeVisible();
    await expect(
      page.getByText(/최대 30개까지 입력할 수 있어요/)
    ).toBeVisible();
    await shuffleBtn(page).click();
    await expect(cardList(page).getByRole('listitem')).toHaveCount(30);
  });

  test('AC-23, 26a, 26c, 45: 섞기 전엔 카드가 없고, 섞은 뒤엔 번호 카드뿐이며, 연 카드에만 항목이 나온다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await openTool(page, LD_LOTS);
    const items = lines('항목L', 6);
    await fillLines(page, '항목', items);
    await expect(cardList(page)).toHaveCount(0);
    await expect(shuffleBtn(page)).toHaveText('섞기');
    expect(await tokensInDom(page, items)).toEqual([]);
    await shuffleBtn(page).click();
    await expect(cardList(page).getByRole('listitem')).toHaveCount(6);
    await expect(closedCards(page)).toHaveCount(6);
    for (let n = 1; n <= 6; n += 1) {
      await expect(
        cardList(page).getByRole('button', { name: `${n}번째 카드 열기` })
      ).toHaveCount(1);
    }
    await expect(openedCards(page)).toHaveCount(0);
    await expect(page.getByText('열린 카드 0 / 6장')).toBeVisible();
    expect(await tokensInDom(page, items)).toEqual([]);
    await expect(button(page, '다시 섞기')).toBeVisible();
    await cardAt(page, 2).click();
    await expect(cardAt(page, 2)).toHaveAccessibleName(
      /^2번째 카드: 항목L\d\d$/,
      { timeout: 1000 }
    );
    await expect(openedCards(page)).toHaveCount(1);
    await expect(closedCards(page)).toHaveCount(5);
    await expect(cardAt(page, 2)).toHaveAttribute('aria-disabled', 'true');
    const [label] = await readOpenedLabels(page);
    expect(items).toContain(label);
    expect(await tokensInDom(page, items)).toEqual([label]);
    await expect(page.getByText('열린 카드 1 / 6장')).toBeVisible();
    await expect(status(page, `2번째 카드: ${label}`)).toHaveCount(1);
    await cardAt(page, 2).click({ force: true });
    await expect(cardAt(page, 2)).toHaveAccessibleName(`2번째 카드: ${label}`);
    await expect(openedCards(page)).toHaveCount(1);
    await cardAt(page, 4).click();
    await expect(openedCards(page)).toHaveCount(2);
    expect((await tokensInDom(page, items)).length).toBe(2);
  });

  test('AC-24, 26b: 남은 카드 모두 열기는 입력 줄 그대로(같은 이름 포함) 열고 버튼이 꺼진다', async ({
    page,
  }) => {
    await openTool(page, LD_LOTS);
    await fillLines(page, '항목', ['동명이', '동명이', '다른이', '또다른이']);
    await shuffleBtn(page).click();
    await expect(closedCards(page)).toHaveCount(4);
    await cardAt(page, 3).click();
    await expect(openedCards(page)).toHaveCount(1);
    await expect(openRestBtn(page)).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await openRestBtn(page).click();
    await expect(openedCards(page)).toHaveCount(4);
    await expect(closedCards(page)).toHaveCount(0);
    expect([...(await readOpenedLabels(page))].sort()).toEqual(
      ['다른이', '동명이', '동명이', '또다른이'].sort()
    );
    await expect(openRestBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('모든 카드를 열었어요.')).toBeVisible();
    await expect(page.getByText('열린 카드 4 / 4장')).toBeVisible();
    await expect(
      status(
        page,
        '남은 카드를 모두 열었어요. 열린 카드에서 항목을 읽을 수 있어요.'
      )
    ).toHaveCount(1);
    await openRestBtn(page).click({ force: true });
    await expect(openedCards(page)).toHaveCount(4);
  });

  test('AC-26: 다시 섞기는 입력을 유지하고 열린 카드를 모두 닫으며, 입력을 바꾸면 카드가 사라지고 첫 섞기에는 닫힘 안내가 없다', async ({
    page,
  }) => {
    await openTool(page, LD_LOTS);
    const items = lines('항목L', 6);
    await fillLines(page, '항목', items);
    await shuffleBtn(page).click();
    await cardAt(page, 1).click();
    await cardAt(page, 6).click();
    await expect(openedCards(page)).toHaveCount(2);
    await button(page, '다시 섞기').click();
    await expect(cardList(page).getByRole('listitem')).toHaveCount(6);
    await expect(closedCards(page)).toHaveCount(6);
    await expect(openedCards(page)).toHaveCount(0);
    await expect(page.getByText('열린 카드 0 / 6장')).toBeVisible();
    expect(await tokensInDom(page, items)).toEqual([]);
    await expect(
      page.getByRole('textbox', { name: '항목', exact: true })
    ).toHaveValue(items.join('\n'));
    await expect(
      status(page, /새로 섞었어요\. 열린 카드는 모두 닫혔어요\./)
    ).toHaveCount(1);
    await fillLines(page, '항목', lines('항목L', 4));
    await expect(cardList(page)).toHaveCount(0);
    await expect(shuffleBtn(page)).toHaveText('섞기');
    await shuffleBtn(page).click();
    await expect(closedCards(page)).toHaveCount(4);
    await expect(status(page, /열린 카드는 모두 닫혔어요/)).toHaveCount(0);
    await expect(page.getByText(/열린 카드는 모두 닫혔어요/)).toHaveCount(0);
  });
});

test.describe('접근성과 반응형', () => {
  test('AC-43: 세 도구 모두 키보드만으로 조작할 수 있다', async ({ page }) => {
    await reduceMotion(page);
    await openTool(page, LD_LOTS);
    const items = lines('항목L', 4);
    const box = page.getByRole('textbox', { name: '항목', exact: true });
    await box.focus();
    await page.keyboard.type(items.join('\n'));
    await expect(box).toHaveValue(items.join('\n'));
    await page.keyboard.press('Tab');
    await expect(shuffleBtn(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(closedCards(page)).toHaveCount(4);
    await cardAt(page, 1).focus();
    await page.keyboard.press('Enter');
    await expect(cardAt(page, 1)).toHaveAccessibleName(/^1번째 카드: 항목L/);
    await expect(cardAt(page, 1)).toBeFocused();
    await cardAt(page, 3).focus();
    await page.keyboard.press('Space');
    await expect(cardAt(page, 3)).toHaveAccessibleName(/^3번째 카드: 항목L/);
    await expect(cardAt(page, 3)).toBeFocused();
    await expect(openedCards(page)).toHaveCount(2);
    await page.keyboard.press('Enter');
    await expect(openedCards(page)).toHaveCount(2);
    await openRestBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(openedCards(page)).toHaveCount(4);
    await expect(openRestBtn(page)).toHaveAttribute('aria-disabled', 'true');
    await button(page, '다시 섞기').focus();
    await page.keyboard.press('Space');
    await expect(closedCards(page)).toHaveCount(4);
    await expect(openedCards(page)).toHaveCount(0);

    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', lines('인물P', 2));
    await fillLines(page, '결과', lines('벌칙Q', 2));
    await startBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(button(page, '다시 시작')).toBeVisible();
    await pickerButtons(page).first().focus();
    await page.keyboard.press('Space');
    await expect(status(page, '인물P01의 결과:')).toHaveCount(1);

    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', lines('항목R', 3));
    await radio(page, '일괄 공개').focus();
    await page.keyboard.press('ArrowRight');
    await expect(radio(page, '결과 가리기')).toBeChecked();
    await radio(page, '결과 가리기').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(radio(page, '일괄 공개')).toBeChecked();
    await spinBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1);
  });

  test('AC-46: 320px에서 세 도구에 최대로 넣어도 가로 스크롤이 없다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await page.setViewportSize({ width: 320, height: 700 });
    await openTool(page, LD_LADDER);
    const p = lines('긴이름참가자', 10);
    await fillLines(page, '참가자', p);
    await fillLines(page, '결과', lines('결과항목', 10));
    await startBtn(page).click();
    await expect(pickerButtons(page)).toHaveCount(10);
    await expect(pickerButtons(page).filter({ hasText: p[9] })).toBeVisible();
    await expect(ladderList(page).getByRole('definition')).toHaveCount(10);
    expect(await hasHorizontalOverflow(page)).toBe(false);

    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', lines('항목R', 28));
    await spinBtn(page).click();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1);
    expect(await hasHorizontalOverflow(page)).toBe(false);

    await openTool(page, LD_LOTS);
    await fillLines(page, '항목', lines('항목L', 30));
    await shuffleBtn(page).click();
    await expect(cardList(page).getByRole('listitem')).toHaveCount(30);
    await openRestBtn(page).click();
    await expect(openedCards(page)).toHaveCount(30);
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe('저장과 개인정보', () => {
  test('AC-33, 34, 35, 37: 입력은 저장소, 주소, 네트워크, 위치로 나가지 않고 새로고침하면 비어 있다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __geo: number };
      w.__geo = 0;
      const geo = navigator.geolocation;
      if (!geo) return;
      for (const key of ['getCurrentPosition', 'watchPosition'] as const) {
        const orig = geo[key].bind(geo);
        (geo as unknown as Record<string, unknown>)[key] = (
          ...args: unknown[]
        ) => {
          w.__geo += 1;
          return (orig as (...a: unknown[]) => unknown)(...args);
        };
      }
    });
    const requests = recordRequests(page);
    const secrets = [
      '비밀인물Z01',
      '비밀인물Z02',
      '비밀결과Z01',
      '비밀결과Z02',
    ];
    const enc = secrets.map((s) => encodeURIComponent(s));

    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', secrets.slice(0, 2));
    await fillLines(page, '결과', secrets.slice(2));
    await startBtn(page).click();
    await pickerButtons(page).first().click();
    await expect(status(page, '의 결과:')).toHaveCount(1);

    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', secrets);
    await spinBtn(page).click();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1);

    await openTool(page, LD_LOTS);
    await fillLines(page, '항목', secrets);
    await shuffleBtn(page).click();
    await expect(closedCards(page)).toHaveCount(4);
    await cardAt(page, 1).click();
    await expect(openedCards(page)).toHaveCount(1);
    await openRestBtn(page).click();
    await expect(openedCards(page)).toHaveCount(4);
    await button(page, '다시 섞기').click();
    await expect(closedCards(page)).toHaveCount(4);

    const snap = await storageSnapshot(page);
    const all = JSON.stringify(snap) + page.url();
    for (const s of [...secrets, ...enc]) expect(all).not.toContain(s);
    for (const r of requests) {
      const blob = decodeURIComponent(r.url) + r.body;
      for (const s of secrets) expect(blob).not.toContain(s);
      for (const e of enc) expect(r.url + r.body).not.toContain(e);
    }
    expect(
      await page.evaluate(() => (window as unknown as { __geo: number }).__geo)
    ).toBe(0);

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: '항목', exact: true })
    ).toHaveValue('');
    await expect(cardList(page)).toHaveCount(0);
  });

  test('AC-36, 47: 쿠키 동의를 거절하고 광고 요청을 막아도 세 도구가 동작한다', async ({
    page,
  }) => {
    await reduceMotion(page);
    await page.route(/kakao|daumcdn|adfit|googlesyndication/, (route) =>
      route.abort()
    );
    await openTool(page, LD_LADDER);
    await fillLines(page, '참가자', lines('인물P', 2));
    await fillLines(page, '결과', lines('벌칙Q', 2));
    await startBtn(page).click();
    await expect(button(page, '다시 시작')).toBeVisible();
    await expect(page.locator('main ins, main iframe')).toHaveCount(0);

    await openTool(page, LD_ROULETTE);
    await fillLines(page, '항목', lines('항목R', 3));
    await spinBtn(page).click();
    await expect(status(page, /^돌림판 결과: /)).toHaveCount(1);

    await openTool(page, LD_LOTS);
    await fillLines(page, '항목', lines('항목L', 3));
    await shuffleBtn(page).click();
    await expect(closedCards(page)).toHaveCount(3);
    await cardAt(page, 1).click();
    await expect(openedCards(page)).toHaveCount(1);
  });
});
