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
import {
  FORTUNE_HUB_FAQ,
  FORTUNE_SAJU_FAQ,
  FORTUNE_STAR_SIGN_FAQ,
  FORTUNE_TODAY_FAQ,
  FORTUNE_TTI_FAQ,
} from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_AGE_BLOCKED_TEXTS,
  FORTUNE_BIRTH_ERROR_MESSAGES,
  FORTUNE_CONSENT_TEXTS,
  FORTUNE_DECLINED_TEXTS,
  FORTUNE_DISCLAIMER_TEXT,
  FORTUNE_FINDER_BASIS_NOTICE,
  FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE,
  FORTUNE_LOTTO_NOTICE,
  FORTUNE_METHOD_B_NOTICE,
  FORTUNE_NOSCRIPT_NOTICE,
  FORTUNE_PRIVACY_INPUT_NOTICE,
  FORTUNE_RESULT_DISCLAIMER_TEXT,
  FORTUNE_SEOLLAL_TEMPLATE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  FORTUNE_SAJU_PANEL_TEXTS,
  FORTUNE_SAJU_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-saju-notice.constant';
import {
  FORTUNE_HUB_SEO,
  FORTUNE_SAJU_SEO,
  FORTUNE_STAR_SIGN_SEO,
  FORTUNE_TODAY_SEO,
  FORTUNE_TTI_SEO,
} from '@/features/fortune/constants/fortune-seo.constant';
import {
  declineCookies,
  recordRequests,
  storageSnapshot,
  watchPageErrors,
} from './helpers/common.util';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

test.describe.configure({ timeout: 120_000 });

/** 2026-11-05 09:00 KST. 날짜가 바뀌어도 결과가 흔들리지 않게 고정한다 */
const NOW = '2026-11-05T09:00:00+09:00';
/** 2025~2027년생을 입력해도 만 14세 이상이 되는 기기 시계 */
const LATER_NOW = '2045-06-01T09:00:00+09:00';
const SCORE_PATTERN = /^\d+점$/;

type BirthType = Readonly<{
  year: number;
  month: number;
  day: number;
  lunar?: boolean;
}>;

// ---------- 열기·입력 ----------

const consentHeading = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: FORTUNE_CONSENT_TEXTS.title,
    exact: true,
  });

/** 시계를 고정하고 페이지를 연 뒤 쿠키 배너를 거절한다 */
async function open(page: Page, path: string, now: string = NOW) {
  await page.clock.setFixedTime(new Date(now));
  const res = await page.goto(path);
  expect(res?.status(), `${path} 응답`).toBeLessThan(400);
  await declineCookies(page);
}

/** 이용 동의 화면에서 세 항목을 체크하고 동의한다 */
async function grantConsent(page: Page, panel: string) {
  await expect(consentHeading(page)).toBeVisible();
  for (const item of FORTUNE_CONSENT_TEXTS.items) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
  await page
    .getByRole('button', {
      name: FORTUNE_CONSENT_TEXTS.grantButton,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: panel, exact: true })
  ).toBeVisible();
}

async function openGranted(
  page: Page,
  path: string,
  panel: string,
  now: string = NOW
) {
  await open(page, path, now);
  await grantConsent(page, panel);
}

async function enterBirth(page: Page, birth: BirthType) {
  await page
    .getByRole('radio', { name: birth.lunar ? '음력' : '양력', exact: true })
    .check({ force: true });
  await page.getByLabel('연도', { exact: true }).fill(String(birth.year));
  await page.getByLabel('월', { exact: true }).fill(String(birth.month));
  await page.getByLabel('일', { exact: true }).fill(String(birth.day));
}

async function submitBirth(page: Page, submit: string, birth: BirthType) {
  await enterBirth(page, birth);
  await page.getByRole('button', { name: submit, exact: true }).click();
}

const timeHeading = (page: Page) =>
  page.getByRole('heading', { level: 3, name: '태어난 시각', exact: true });

async function submitTime(page: Page, hour: number, minute: number) {
  await page.getByLabel('시', { exact: true }).fill(String(hour));
  await page.getByLabel('분', { exact: true }).fill(String(minute));
  await page.getByRole('button', { name: '시각 반영', exact: true }).click();
}

const todayResult = (page: Page) =>
  page.getByRole('region', { name: '오늘의 결과', exact: true });

// ---------- 상담전화 ----------

/**
 * 상담전화는 기기별이다. desktop = PC(tel: 링크 display:none, 번호는 글자),
 * mobile = 터치(번호가 tel: 링크). 두 프로젝트의 실제 값을 쓴다
 */
async function expectCrisisPhones(page: Page, isPc: boolean) {
  const list = page.getByRole('list', { name: CRISIS_RESULT_LINE });
  await expect(list).toBeVisible();
  await expect(list.getByRole('listitem')).toHaveCount(CRISIS_PHONES.length);
  const telLinks = page.locator('a[href^="tel:"]');
  await expect(telLinks).toHaveCount(CRISIS_PHONES.length);
  for (const [index, phone] of CRISIS_PHONES.entries()) {
    await expect(telLinks.nth(index)).toHaveAttribute('href', phone.href);
    await expect(
      list
        .getByText(phone.displayNumber, { exact: true })
        .filter({ visible: true })
    ).toHaveCount(1);
  }
  if (isPc) {
    await expect(list.getByRole('link')).toHaveCount(0);
    return;
  }
  const links = list.getByRole('link');
  await expect(links).toHaveCount(CRISIS_PHONES.length);
  // 눌러도 통화 앱으로 넘어가지 않게 막고, 눌린 href만 확인한다
  await page.evaluate(() => {
    const store = window as unknown as { __telClicks: string[] };
    store.__telClicks = [];
    document.addEventListener(
      'click',
      (event) => {
        const anchor = (event.target as Element).closest('a[href^="tel:"]');
        if (anchor) {
          store.__telClicks.push(anchor.getAttribute('href') ?? '');
          event.preventDefault();
        }
      },
      true
    );
  });
  for (const index of CRISIS_PHONES.keys()) await links.nth(index).click();
  const clicked = await page.evaluate(
    () => (window as unknown as { __telClicks: string[] }).__telClicks
  );
  expect(clicked).toEqual(CRISIS_PHONES.map((phone) => phone.href));
}

// ---------- 사주 ----------

const SAJU_RESULT_HEADING = '연·월·일·시 기둥';
const sajuResult = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: SAJU_RESULT_HEADING,
    exact: true,
  });

async function openSaju(page: Page) {
  await openGranted(
    page,
    FORTUNE_ROUTES.saju,
    FORTUNE_SAJU_PANEL_TEXTS.dateTitle,
    LATER_NOW
  );
}

async function submitSajuDate(page: Page, birth: BirthType) {
  await enterBirth(page, birth);
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.dateSubmitLabel,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', {
      level: 3,
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormTitle,
      exact: true,
    })
  ).toBeVisible();
}

/** 기둥 표의 한글 간지 개수. 시주가 없으면 3, 있으면 4 */
async function countPillars(page: Page): Promise<number> {
  const table = page.getByRole('table', { name: SAJU_RESULT_HEADING });
  await expect(table).toBeVisible();
  return table.evaluate(
    (el) => el.querySelectorAll('tbody tr:nth-child(2) td').length
  );
}

// =====================================================================
// 허브 → 오늘의 운세
// =====================================================================

test(
  'AC-1: 허브에서 오늘의 운세로 들어가 동의하고 생년월일을 넣으면 결과와 상담전화가 나온다',
  {
    tag: '@smoke',
  },
  async ({ page }, testInfo) => {
    const { pageErrors } = watchPageErrors(page);
    await open(page, FORTUNE_ROUTES.hub);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    for (const [label, href] of [
      ['오늘의 운세', FORTUNE_ROUTES.today],
      ['띠별 운세', FORTUNE_ROUTES.tti],
      ['별자리 운세', FORTUNE_ROUTES.starSign],
      ['사주', FORTUNE_ROUTES.saju],
    ] as const) {
      await expect(
        page
          .getByRole('main')
          .getByRole('link', { name: new RegExp(`^${label}`) })
      ).toHaveAttribute('href', href);
    }
    await expect(
      page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();

    await page
      .getByRole('main')
      .getByRole('link', { name: /^오늘의 운세/ })
      .click();
    await expect(page).toHaveURL(new RegExp(`${FORTUNE_ROUTES.today}$`));
    await grantConsent(page, '생년월일 입력');
    await submitBirth(page, '운세 보기', { year: 1990, month: 6, day: 15 });

    const result = todayResult(page);
    await expect(result).toBeVisible();
    for (const name of [
      '총운',
      '재물',
      '애정',
      '직장·학업',
      '건강',
      '오늘의 조언',
      '주의할 점',
    ]) {
      await expect(
        result.getByRole('heading', { level: 3, name, exact: true })
      ).toBeVisible();
    }
    await expect(result.getByText(SCORE_PATTERN)).toHaveCount(5);
    await expect(
      page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
    await expectCrisisPhones(page, testInfo.project.name === 'desktop');
    expect(pageErrors).toEqual([]);
  }
);

test('AC-2: 이용 동의를 하지 않으면 이용 불가 안내가 나오고 돌아가기로 동의 화면이 다시 나온다', async ({
  page,
}) => {
  await open(page, FORTUNE_ROUTES.today);
  await expect(consentHeading(page)).toBeVisible();
  await page
    .getByRole('button', {
      name: FORTUNE_CONSENT_TEXTS.declineButton,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_DECLINED_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_DECLINED_TEXTS.body, { exact: true })
  ).toBeVisible();
  await expect(page.locator('main input[type="text"]')).toHaveCount(0);
  await page
    .getByRole('button', {
      name: FORTUNE_DECLINED_TEXTS.backButton,
      exact: true,
    })
    .click();
  await expect(consentHeading(page)).toBeVisible();
});

test('AC-3: 만 14세 미만 생년월일은 연령 안내만 나오고 결과는 없다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.today, '생년월일 입력');
  await submitBirth(page, '운세 보기', { year: 2025, month: 1, day: 1 });
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_AGE_BLOCKED_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_AGE_BLOCKED_TEXTS.body, { exact: true })
  ).toBeVisible();
  await expect(todayResult(page)).toHaveCount(0);
});

test('AC-4: 빈 값·달력에 없는 날짜·지원 범위 밖은 상수와 같은 오류만 나온다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.today, '생년월일 입력');
  await page.getByRole('button', { name: '운세 보기', exact: true }).click();
  await expect(
    page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES.empty, { exact: true })
  ).toBeVisible();
  await submitBirth(page, '운세 보기', { year: 1990, month: 2, day: 31 });
  await expect(
    page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['invalid-date'], {
      exact: true,
    })
  ).toBeVisible();
  await submitBirth(page, '운세 보기', { year: 1919, month: 12, day: 31 });
  await expect(
    page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['before-min'], { exact: true })
  ).toBeVisible();
  await expect(todayResult(page)).toHaveCount(0);
});

test('AC-5: 음력 2023년 2월은 윤달을 따로 변환하고 윤달이 없는 3월은 윤달 칸이 꺼진다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.today, '생년월일 입력', LATER_NOW);
  await submitBirth(page, '운세 보기', {
    year: 2023,
    month: 2,
    day: 25,
    lunar: true,
  });
  await expect(
    page.getByText('음력 2023년 2월 25일 → 양력 2023년 3월 16일', {
      exact: true,
    })
  ).toBeVisible();
  const leap = page.getByRole('checkbox', { name: '윤달', exact: true });
  await leap.check();
  await page.getByRole('button', { name: '운세 보기', exact: true }).click();
  await expect(
    page.getByText('음력 2023년 2월 25일(윤달) → 양력 2023년 4월 15일', {
      exact: true,
    })
  ).toBeVisible();
  await page.getByLabel('월', { exact: true }).fill('3');
  await expect(leap).toBeDisabled();
});

test('AC-6: 결과를 봐도 저장소·URL·요청에 생년월일이 남지 않는다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.today, '생년월일 입력');
  await expect(
    page.getByText(FORTUNE_PRIVACY_INPUT_NOTICE, { exact: true }).first()
  ).toBeVisible();
  const url = page.url();
  const before = await storageSnapshot(page);
  const requests = recordRequests(page);

  await submitBirth(page, '운세 보기', { year: 1990, month: 6, day: 15 });
  await expect(todayResult(page)).toBeVisible();

  expect(page.url()).toBe(url);
  expect(await storageSnapshot(page)).toEqual(before);
  expect(
    requests
      .filter((req) => req.method !== 'GET' || req.body !== '')
      .map((req) => `${req.method} ${req.url}`)
  ).toEqual([]);
  expect(
    requests.filter((req) => /1990|birth/.test(req.url)).map((req) => req.url)
  ).toEqual([]);
});

// =====================================================================
// 띠별·별자리
// =====================================================================

test('AC-7: 띠별 운세에서 생년월일로 찾으면 말띠 결과와 찾기 안내가 나온다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.tti, '띠 고르기');
  await expect(
    page.getByText(FORTUNE_FINDER_BASIS_NOTICE, { exact: true })
  ).toHaveCount(0);
  await submitBirth(page, '내 띠 찾기', { year: 1990, month: 5, day: 10 });
  await expect(
    page.getByText('입춘 시각을 기준으로 말띠입니다.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_FINDER_BASIS_NOTICE, { exact: true })
  ).toBeVisible();
});

test('AC-8: 입춘 전 설날 뒤 날짜는 설날 기준 띠를 병기하고 경계일은 시각을 묻는다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.tti, '띠 고르기', LATER_NOW);
  await submitBirth(page, '내 띠 찾기', { year: 2025, month: 2, day: 1 });
  await expect(
    page.getByText('입춘 시각을 기준으로 용띠입니다.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_SEOLLAL_TEMPLATE.replace('{띠}', '뱀띠'), {
      exact: true,
    })
  ).toBeVisible();

  await submitBirth(page, '내 띠 찾기', { year: 2025, month: 2, day: 3 });
  await expect(timeHeading(page)).toBeVisible();
  await submitTime(page, 23, 30);
  await expect(
    page.getByText('입춘 시각을 기준으로 뱀띠입니다.', { exact: true })
  ).toBeVisible();

  await submitBirth(page, '내 띠 찾기', { year: 2025, month: 2, day: 3 });
  await page.getByRole('button', { name: '시각 모름', exact: true }).click();
  for (const name of ['용띠로 보기', '뱀띠로 보기']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
});

test('AC-9: 별자리 운세에서 생년월일로 찾으면 황소자리 결과와 찾기 안내가 나온다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_ROUTES.starSign, '별자리 고르기');
  await submitBirth(page, '내 별자리 찾기', { year: 1990, month: 5, day: 15 });
  await expect(
    page.getByText('황소자리입니다.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE, { exact: true })
  ).toBeVisible();
});

// =====================================================================
// 사주
// =====================================================================

test('AC-10: 사주에 생년월일과 태어난 시각을 넣으면 기둥 표 결과가 나온다', {
  tag: '@smoke',
}, async ({ page }) => {
  const { pageErrors } = watchPageErrors(page);
  await openSaju(page);
  await submitSajuDate(page, { year: 1990, month: 6, day: 15 });
  await page.getByLabel('시', { exact: true }).fill('12');
  await page.getByLabel('분', { exact: true }).fill('30');
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormSubmit,
      exact: true,
    })
    .click();
  await expect(sajuResult(page)).toBeVisible();
  expect(await countPillars(page)).toBe(4);
  expect(pageErrors).toEqual([]);
});

test('AC-11: 시각을 모르면 시주 없이 안내가 나오고 지원 범위 끝 날짜도 결과가 나온다', async ({
  page,
}) => {
  await openSaju(page);
  await submitSajuDate(page, { year: 1990, month: 6, day: 15 });
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormUnknown,
      exact: true,
    })
    .click();
  await expect(sajuResult(page)).toBeVisible();
  expect(await countPillars(page)).toBe(3);
  await expect(
    page
      .getByRole('paragraph')
      .filter({ hasText: FORTUNE_SAJU_TIME_UNKNOWN_NOTICE })
  ).toBeVisible();

  await submitSajuDate(page, { year: 2028, month: 12, day: 31 });
  await page.getByLabel('시', { exact: true }).fill('23');
  await page.getByLabel('분', { exact: true }).fill('30');
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormSubmit,
      exact: true,
    })
    .click();
  await expect(sajuResult(page)).toBeVisible();
  expect(await countPillars(page)).toBe(4);
});

test('AC-12: 사주 결과 화면에 면책·로또 고지·기준 안내와 상담전화가 있다', async ({
  page,
}, testInfo) => {
  await openSaju(page);
  await submitSajuDate(page, { year: 1990, month: 6, day: 15 });
  await page
    .getByRole('button', {
      name: FORTUNE_SAJU_PANEL_TEXTS.timeFormUnknown,
      exact: true,
    })
    .click();
  await expect(sajuResult(page)).toBeVisible();
  for (const text of [
    FORTUNE_RESULT_DISCLAIMER_TEXT,
    FORTUNE_LOTTO_NOTICE,
    FORTUNE_METHOD_B_NOTICE,
  ]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
  }
  await expectCrisisPhones(page, testInfo.project.name === 'desktop');
});

// =====================================================================
// 기기 시계, JS 끔, SEO
// =====================================================================

test('AC-13: 기기 시계가 2029-01-02여도 결과가 정상이고 2029-01-01은 범위 오류다', async ({
  page,
}) => {
  await openGranted(
    page,
    FORTUNE_ROUTES.today,
    '생년월일 입력',
    '2029-01-02T09:00:00+09:00'
  );
  await submitBirth(page, '운세 보기', { year: 1990, month: 6, day: 15 });
  await expect(todayResult(page)).toBeVisible();
  await submitBirth(page, '운세 보기', { year: 2029, month: 1, day: 1 });
  await expect(
    page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
  ).toBeVisible();
});

test.describe('JS 끔', () => {
  test.use({ javaScriptEnabled: false });

  test('AC-14: 서버 HTML에 h1·면책·FAQ·상담전화 5곳이 있고 결과·입력칸·동의 화면은 없다', async ({
    page,
  }) => {
    for (const [path, h1, faq] of [
      [FORTUNE_ROUTES.hub, FORTUNE_HUB_SEO.heading, FORTUNE_HUB_FAQ],
      [FORTUNE_ROUTES.today, FORTUNE_TODAY_SEO.heading, FORTUNE_TODAY_FAQ],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      const heading = page.getByRole('heading', {
        level: 1,
        includeHidden: true,
      });
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(h1);
      await expect(
        page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true }).first()
      ).toBeAttached();
      await expect(
        page.getByText(faq[0].answer, { exact: true }).first()
      ).toBeAttached();
      const telLinks = page.locator('a[href^="tel:"]');
      await expect(telLinks).toHaveCount(CRISIS_PHONES.length);
      for (const [index, phone] of CRISIS_PHONES.entries()) {
        await expect(telLinks.nth(index)).toHaveAttribute('href', phone.href);
      }
      await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
      await expect(page.locator('main input')).toHaveCount(0);
      await expect(consentHeading(page)).toHaveCount(0);
    }
    await expect(
      page.getByText(FORTUNE_NOSCRIPT_NOTICE, { exact: true }).first()
    ).toBeAttached();
  });
});

test('AC-15: 운세 5개 페이지의 메타·canonical·JSON-LD가 상수와 같고 sitemap에 모두 있다', async ({
  page,
  request,
}) => {
  const { pageErrors, hydration } = watchPageErrors(page);
  const pages = [
    [FORTUNE_ROUTES.hub, FORTUNE_HUB_SEO, FORTUNE_HUB_FAQ],
    [FORTUNE_ROUTES.today, FORTUNE_TODAY_SEO, FORTUNE_TODAY_FAQ],
    [FORTUNE_ROUTES.tti, FORTUNE_TTI_SEO, FORTUNE_TTI_FAQ],
    [FORTUNE_ROUTES.starSign, FORTUNE_STAR_SIGN_SEO, FORTUNE_STAR_SIGN_FAQ],
    [FORTUNE_ROUTES.saju, FORTUNE_SAJU_SEO, FORTUNE_SAJU_FAQ],
  ] as const;
  const head = (selector: string): Locator => page.locator(selector);

  for (const [path, seo, faq] of pages) {
    await test.step(path, async () => {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        seo.heading
      );
      expect(await page.title()).toContain(seo.title);
      await expect(head('meta[name="description"]')).toHaveAttribute(
        'content',
        seo.description
      );
      await expect(head('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`${path}$`)
      );
      await expect(head('meta[name="robots"][content*="noindex"]')).toHaveCount(
        0
      );
      const jsonLd = (
        await page
          .locator('script[type="application/ld+json"]')
          .allTextContents()
      ).join('\n');
      expect(jsonLd).toContain('BreadcrumbList');
      expect(jsonLd).toContain('FAQPage');
      expect(jsonLd).toContain(faq[0].question);
      expect(jsonLd).not.toMatch(/AggregateRating|"Review"/);
    });
  }

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBeLessThan(400);
  const xml = await sitemap.text();
  for (const [path] of pages) expect(xml).toContain(path);
  expect(pageErrors).toEqual([]);
  expect(hydration).toEqual([]);
});
