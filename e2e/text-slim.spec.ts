import {
  expect as baseExpect,
  type Locator,
  type Page,
  test,
} from '@playwright/test';
import {
  CRISIS_PHONES,
  CRISIS_RESULT_LINE,
} from '@/constants/crisis-phone.constant';
import { DREAM_DETAIL_NOTICE_ITEMS } from '@/features/dream/constants/dream-notice.constant';
import {
  FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING,
  FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE,
  FORTUNE_COMPATIBILITY_TTI_GRADE_RULE_PARAGRAPHS,
} from '@/features/fortune/constants/fortune-compatibility-guide.constant';
import {
  FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT,
  FORTUNE_COMPATIBILITY_PRIVACY_INPUT_NOTICE,
} from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_HUB_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_CONSENT_TEXTS,
  FORTUNE_DETAIL_NOTICE_ITEMS,
  FORTUNE_DISCLAIMER_TEXT,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_SAJU_PANEL_TEXTS } from '@/features/fortune/constants/fortune-saju-notice.constant';
import { LUCKY_DRAW_GUIDE_TITLE } from '@/features/lucky-draw/constants/lucky-draw-notice.constant';
import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { TAROT_DAILY_FAQ } from '@/features/tarot/constants/tarot-faq.constant';
import { declineCookies, watchPageErrors } from './helpers/common.util';

const expect = baseExpect.configure({ timeout: 10_000 });
test.describe.configure({ timeout: 120_000 });

const details = (page: Page, heading: string): Locator =>
  page
    .locator('details')
    .filter({ has: page.getByRole('heading', { name: heading, exact: true }) });

const summaryOf = (d: Locator): Locator => d.locator('summary');

test('AC-1: FAQ 질문은 보이고 답은 닫혀 있으며 클릭·Enter·Space로 열고 닫힌다', async ({
  page,
}) => {
  const { pageErrors } = watchPageErrors(page);
  const targets = [
    ['/fortune', FORTUNE_HUB_FAQ[0]],
    ['/tarot/daily', TAROT_DAILY_FAQ[0]],
    ['/meal', MEAL_FAQ[0]],
  ] as const;

  for (const [path, faq] of targets) {
    await test.step(path, async () => {
      await page.goto(path);
      await declineCookies(page);
      const d = details(page, faq.question);
      const answer = d.getByText(faq.answer, { exact: true });
      await expect(d).toBeVisible();
      await expect(d).toHaveJSProperty('open', false);
      await expect(answer).toBeHidden();

      await summaryOf(d).click();
      await expect(d).toHaveJSProperty('open', true);
      await expect(answer).toBeVisible();
      await summaryOf(d).click();
      await expect(answer).toBeHidden();
    });
  }

  // 키보드: /fortune 에서 Tab으로 summary에 닿고 Enter, Space로 토글
  await page.goto('/fortune');
  await declineCookies(page);
  const first = details(page, FORTUNE_HUB_FAQ[0].question);
  const summary = summaryOf(first);
  let focused = false;
  for (let i = 0; i < 60 && !focused; i += 1) {
    await page.keyboard.press('Tab');
    focused = await summary.evaluate((el) => el === document.activeElement);
  }
  expect(focused).toBe(true);
  await expect(summary).toHaveCSS('box-shadow', /rgb/);
  await page.keyboard.press('Enter');
  await expect(first).toHaveJSProperty('open', true);
  await page.keyboard.press('Enter');
  await expect(first).toHaveJSProperty('open', false);
  await page.keyboard.press('Space');
  await expect(first).toHaveJSProperty('open', true);
  await page.keyboard.press('Space');
  await expect(first).toHaveJSProperty('open', false);

  expect(pageErrors).toEqual([]);
});

test('4단계: 삭제된 FAQ 5건은 화면·HTML에 없고 운빨 허브 FAQ는 1개 남는다', async ({
  page,
}) => {
  const removed: [string, string][] = [
    ['/tarot/daily', '타로 원카드는 어떻게 읽습니까?'],
    ['/lucky-draw/ladder', '결과는 어떻게 정해지나요?'],
    ['/meal', '오늘 뭐 먹지는 어떤 서비스인가요?'],
    ['/lucky-draw', '입력한 이름은 저장되나요?'],
    ['/lucky-draw', '결과로 상품이나 포인트를 받을 수 있나요?'],
  ];
  for (const [path, q] of removed) {
    await page.goto(path);
    await declineCookies(page);
    await expect(page.getByText(q), `${path} ${q}`).toHaveCount(0);
    expect(await page.content(), `${path} html`).not.toContain(q);
  }
  await page.goto('/lucky-draw');
  await expect(
    page.getByRole('heading', { name: '자주 묻는 질문' })
  ).toBeVisible();
  // FAQ 1개 + 접힌 이용 안내 1개
  await expect(page.locator('details')).toHaveCount(2);
});

test('AC-4: 접힌 답이 페이지 HTML에 있고 FAQPage JSON-LD가 화면 FAQ와 같다', async ({
  page,
}) => {
  await page.goto('/fortune');
  const html = await page.content();
  for (const faq of FORTUNE_HUB_FAQ) {
    expect(html).toContain(faq.answer);
  }

  const raw = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const nodes = raw.flatMap((t) => [JSON.parse(t)].flat());
  const faqNode = nodes.find(
    (n: { '@type'?: string }) => n['@type'] === 'FAQPage'
  ) as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
  const ld = faqNode.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);

  const screen = await page
    .locator('details')
    .evaluateAll((els) =>
      els.map((el) => [
        el.querySelector('summary h3')?.textContent ?? '',
        el.querySelector('p:not(summary p)')?.textContent ?? '',
      ])
    );
  // 2단계 접기 블록(운세 종류 자세히 보기, 이용 안내 더 보기)은 FAQ가 아니라서 뺀다
  const faqOnly = screen.filter(
    ([q]) => q !== '운세 종류 자세히 보기' && q !== '이용 안내 더 보기'
  );
  expect(faqOnly).toEqual(ld);
});

test.describe('JS 끔', () => {
  test.use({ javaScriptEnabled: false });

  test('AC-4: JS 없이 /fortune/tti 서버 HTML에 12띠 표가 닫힌 details 안에 있다', async ({
    page,
  }) => {
    await page.goto('/fortune/tti');
    // 개발 서버 스트리밍은 JS 없이 hidden 상태라 존재·닫힘 속성만 본다(펼침은 운영 빌드에서 수동 확인)
    await expect(page.locator('details table')).toBeAttached();
    await expect(page.locator('details[open]')).toHaveCount(0);
  });
});

test('AC-2: 12띠 표와 별자리 기간표와 원소 설명이 접혀 있고 열고 닫힌다', async ({
  page,
}) => {
  await page.goto('/fortune/tti');
  await declineCookies(page);
  const tti = details(page, '12띠와 출생 연도 대응');
  await expect(tti.getByRole('table')).toBeHidden();
  await summaryOf(tti).click();
  await expect(tti.getByRole('table')).toBeVisible();
  await summaryOf(tti).click();
  await expect(tti.getByRole('table')).toBeHidden();

  await page.goto('/fortune/star-sign');
  const star = details(page, '12별자리 일반적인 기간');
  await expect(star.getByRole('table')).toBeHidden();
  // 접힌 상태에서도 summary 줄에 보인다
  await expect(
    summaryOf(star).getByText('날짜는 해마다 하루 정도 달라질 수 있습니다.')
  ).toBeVisible();
  await summaryOf(star).click();
  await expect(star.getByRole('table')).toBeVisible();

  await page.goto('/fortune/compatibility/star-sign');
  const element = details(
    page,
    FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE[0].heading
  );
  const body = element.getByText(
    FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE[0].paragraphs[0],
    { exact: true }
  );
  await expect(body).toBeHidden();
  await summaryOf(element).click();
  await expect(body).toBeVisible();
  await summaryOf(element).click();
  await expect(body).toBeHidden();
});

test('AC-6: 법적 상시 고지와 상담전화는 접히지 않고 보이며 360px에서 가로 스크롤이 없다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['/fortune', '/fortune/tti', '/tarot/daily']) {
    await page.goto(path);
    await declineCookies(page);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      ),
      path
    ).toBe(false);
  }

  await page.goto('/fortune');
  const notice = page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true });
  await expect(notice.first()).toBeVisible();
  await expect(
    page.locator('details').getByText(FORTUNE_DISCLAIMER_TEXT)
  ).toHaveCount(0);
  const list = page.getByRole('list', { name: CRISIS_RESULT_LINE });
  await expect(list).toBeVisible();
  await expect(list.getByRole('listitem')).toHaveCount(CRISIS_PHONES.length);
  await expect(
    page.locator('details').getByRole('list', { name: CRISIS_RESULT_LINE })
  ).toHaveCount(0);
});

// ---- 2단계 ----

test('2단계 AC-1~3: 사주·타로·운세 허브 설명이 접히고 법적 고지와 책임·만 14세 항목은 접히지 않는다', async ({
  page,
}) => {
  const { pageErrors } = watchPageErrors(page);

  await page.goto('/fortune/saju');
  await declineCookies(page);
  const saju = details(page, '사주와 만세력');
  await expect(saju).toHaveJSProperty('open', false);
  await summaryOf(saju).click();
  await expect(saju).toHaveJSProperty('open', true);
  await summaryOf(saju).click();
  await expect(saju).toHaveJSProperty('open', false);
  await expect(details(page, '오늘의 운세와의 차이')).toBeVisible();
  // 5단계: 계산 기준 제목은 details 요약 안에 있고 기본은 닫힘
  await expect(details(page, '계산 기준')).toHaveJSProperty('open', false);

  await page.goto('/tarot/daily');
  await declineCookies(page);
  for (const name of ['오늘의 타로 읽는 법', '이용 안내']) {
    const d = details(page, name);
    await expect(d).toHaveJSProperty('open', false);
    await summaryOf(d).click();
    await expect(d).toHaveJSProperty('open', true);
  }
  const list = page.getByRole('list', { name: CRISIS_RESULT_LINE });
  await expect(list).toBeVisible();
  await expect(
    page.locator('details').getByRole('list', { name: CRISIS_RESULT_LINE })
  ).toHaveCount(0);

  await page.goto('/fortune');
  await declineCookies(page);
  const more = details(page, '운세 종류 자세히 보기');
  await expect(more).toHaveJSProperty('open', false);
  await summaryOf(more).click();
  await expect(more).toHaveJSProperty('open', true);
  // AC-48: 책임 항목(첫 항)과 만 14세 항목(마지막 항)은 닫힌 채로 보인다
  const items = FORTUNE_DETAIL_NOTICE_ITEMS;
  for (const text of [items[0], items[items.length - 1]]) {
    const li = page.getByText(text, { exact: true });
    await expect(li).toBeVisible();
    await expect(
      page.locator('details').getByText(text, { exact: true })
    ).toHaveCount(0);
  }
  await expect(
    page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true }).first()
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('2단계 AC-5: 삭제된 문구가 화면과 HTML에 없고 꿈 상세 안내 2항은 남는다', async ({
  page,
}) => {
  const removed: [string, string][] = [
    ['/fortune', '본 서비스는 오락과 참고 목적으로 제공됩니다.'],
    ['/fortune', '운세 결과만으로 중요한 결정을 내리지 않으시기 바랍니다.'],
    ['/fortune', '사주는 다른 운세와 무엇이 다른가요?'],
    ['/dream', '이 서비스의 꿈 해몽은 오락과 자기 성찰을 위한 읽을거리입니다.'],
    ['/tarot/daily', '분야를 고르면 해석이 달라집니까?'],
    ['/meal', '뽑힌 메뉴는 추천인가요?'],
  ];
  for (const [path, text] of removed) {
    await page.goto(path);
    expect(await page.content(), `${path} ${text}`).not.toContain(text);
  }
  await page.goto('/dream');
  const html = await page.content();
  for (const item of DREAM_DETAIL_NOTICE_ITEMS) expect(html).toContain(item);
});

test.describe('JS 끔 2단계', () => {
  test.use({ javaScriptEnabled: false });

  test('2단계 AC-4: 접힌 읽는 법과 동네 입력 안내가 서버 HTML에 있다', async ({
    page,
  }) => {
    await page.goto('/tarot/daily');
    await expect(
      page.locator('details', { hasText: '오늘의 타로 읽는 법' })
    ).toBeAttached();
    await page.goto('/meal');
    await expect(
      page.locator('details', { hasText: '동네 입력 안내 더 보기' })
    ).toBeAttached();
    await expect(page.locator('details[open]')).toHaveCount(0);
  });
});

// ---- 5단계 ----

const closed = (d: Locator) => expect(d).toHaveJSProperty('open', false);

test('5단계 (a): 오늘·별자리 운세 가이드 제목은 접혀 있고 본문은 서버 HTML에 있다', async ({
  page,
}) => {
  for (const [path, headings] of [
    [
      '/fortune/today',
      ['오늘의 운세 이용 방법', '결과 읽는 법', '결과가 정해지는 방식'],
    ],
    [
      '/fortune/star-sign',
      ['내 별자리 찾는 방법', '경계일에 태어난 경우', '입력 없이 바로 보기'],
    ],
  ] as const) {
    await page.goto(path);
    await declineCookies(page);
    for (const h of headings) {
      await closed(details(page, h));
    }
    const html = await page.content();
    const body = await details(page, headings[0])
      .locator('p')
      .first()
      .textContent();
    expect(body && html.includes(body.trim().slice(0, 20)), path).toBe(true);
  }
});

test('5단계 (b): 사주 계산 기준 보기 링크가 접힌 계산 기준을 열고 링크는 밖에서 보인다', async ({
  page,
}) => {
  await page.goto('/fortune/saju');
  await declineCookies(page);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_CONSENT_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  for (const item of FORTUNE_CONSENT_TEXTS.items) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
  await page
    .getByRole('button', {
      name: FORTUNE_CONSENT_TEXTS.grantButton,
      exact: true,
    })
    .click();
  await page.getByLabel('연도', { exact: true }).fill('1990');
  await page.getByLabel('월', { exact: true }).fill('6');
  await page.getByLabel('일', { exact: true }).fill('15');
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.dateSubmitLabel,
      exact: true,
    })
    .click();

  const basis = details(page, '계산 기준');
  await closed(basis);
  const label = FORTUNE_SAJU_PANEL_TEXTS.calcBasisLinkLabel;
  const link = page.getByRole('link', { name: label, exact: true });
  await expect(link).toBeVisible();
  await expect(
    page.locator('details').getByRole('link', { name: label })
  ).toHaveCount(0);
  await link.click();
  await expect(basis).toHaveJSProperty('open', true);
  await expect(
    page.getByRole('heading', { level: 2, name: '계산 기준', exact: true })
  ).toBeInViewport();
  await link.click();
  await expect(basis).toHaveJSProperty('open', true);
});

test('5단계 (c): 손 없는 날 규칙·달력은 접히고 월별 목록과 음력 출처는 보인다', async ({
  page,
}) => {
  const source = '음력 표는 한국천문연구원 음양력 정보를 바탕으로 합니다.';
  await page.goto('/no-son-days');
  await declineCookies(page);
  await closed(details(page, '손 없는 날, 이렇게 계산합니다'));
  await expect(page.getByText(source, { exact: true })).toBeVisible();

  await page.goto('/no-son-days/2027');
  await closed(details(page, '손 없는 날, 이렇게 계산합니다'));
  await expect(page.getByText(source, { exact: true })).toBeVisible();
  await expect(page.locator('details').getByText(source)).toHaveCount(0);
  await expect(
    page.getByRole('heading', { level: 2, name: /^1월/ }).first()
  ).toBeVisible();
  const cal = details(page, '달력으로 보기');
  await closed(cal);
  await summaryOf(cal).click();
  await expect(cal).toHaveJSProperty('open', true);
  await expect(
    cal.getByRole('button', { name: NO_SON_DAYS_VIEW.calendar.next })
  ).toBeVisible();
});

test('5단계 (d): 운빨 뽑기 3화면은 "이렇게 이용합니다"가 번호 줄까지 접힌다', async ({
  page,
}) => {
  for (const path of [
    '/lucky-draw/ladder',
    '/lucky-draw/roulette',
    '/lucky-draw/lots',
  ]) {
    await page.goto(path);
    await declineCookies(page);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: LUCKY_DRAW_GUIDE_TITLE,
        exact: true,
      })
    ).toBeVisible();
    await closed(details(page, LUCKY_DRAW_GUIDE_TITLE));
  }
});

test('5단계 (e): 궁합 등급 규칙은 접히고 note 첫 문장은 보인다', async ({
  page,
}) => {
  await page.goto('/fortune/compatibility/tti');
  await declineCookies(page);
  const rule = details(page, FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING);
  await closed(rule);
  await closed(details(page, '띠 궁합이란'));
  const note =
    FORTUNE_COMPATIBILITY_TTI_GRADE_RULE_PARAGRAPHS[0].split(/(?<=\.) /)[0];
  await expect(page.getByText(note, { exact: true })).toBeVisible();
  await summaryOf(rule).click();
  await expect(rule.getByRole('table')).toBeVisible();
});

test('5단계 (f): 접지 않는 고지가 보이고 320px에서 가로 스크롤이 없다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/fortune/compatibility/tti');
  await declineCookies(page);
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_PRIVACY_INPUT_NOTICE, { exact: true })
  ).toBeVisible();
  await expect(
    page
      .locator('details')
      .getByText(FORTUNE_COMPATIBILITY_PRIVACY_INPUT_NOTICE)
  ).toHaveCount(0);
  await expect(
    page
      .getByText(FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT, { exact: true })
      .first()
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    )
  ).toBe(false);

  // 이용 동의 화면은 접힌 블록 밖
  await page.goto('/fortune/today');
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_CONSENT_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.locator('details').getByText(FORTUNE_CONSENT_TEXTS.title)
  ).toHaveCount(0);
});
