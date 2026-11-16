import {
  type Browser,
  expect as baseExpect,
  type Locator,
  type Page,
  type Request,
  test,
} from '@playwright/test';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import { FORTUNE_CONSENT_VERSION } from '@/features/fortune/constants/fortune-consent.constant';
import { FORTUNE_SAJU_FAQ } from '@/features/fortune/constants/fortune-faq.constant';
import { FORTUNE_SAJU_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';
import {
  FORTUNE_AGE_BLOCKED_TEXTS,
  FORTUNE_AGE_INPUT_NOTICE,
  FORTUNE_CONSENT_RESET_TEXTS,
  FORTUNE_CONSENT_TEXTS,
  FORTUNE_DETAIL_NOTICE_TITLE,
  FORTUNE_DISCLAIMER_TEXT,
  FORTUNE_DST_NOTICE,
  FORTUNE_LOTTO_NOTICE,
  FORTUNE_METHOD_B_NOTICE,
  FORTUNE_NOSCRIPT_NOTICE,
  FORTUNE_RESULT_DISCLAIMER_TEXT,
  FORTUNE_SAJU_GLOSS,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  FORTUNE_SAJU_CALC_BASIS_DAY_HOUR,
  FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION,
  FORTUNE_SAJU_CALC_BASIS_PILLARS,
  FORTUNE_SAJU_CALC_BASIS_SCHOOLS,
  FORTUNE_SAJU_CALC_BASIS_STATEMENT,
  FORTUNE_SAJU_CALC_BASIS_ZI_START,
  FORTUNE_SAJU_PANEL_TEXTS,
  FORTUNE_SAJU_SOLAR_TERM_NAMES,
  FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS,
  FORTUNE_SAJU_TIME_QUESTION_TEXT,
  FORTUNE_SAJU_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-saju-notice.constant';
import { FORTUNE_SAJU_SEO } from '@/features/fortune/constants/fortune-seo.constant';
import { getFortuneSajuBoundary } from '@/features/fortune/utils/fortune-saju.util';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

test.describe.configure({ timeout: 120_000 });

// ---------- 기준 값 ----------

/** 2045-06-01 이전에 태어난 2026년생까지 만 14세 이상이 되는 기기 시계 */
const LATER_NOW = '2045-06-01T09:00:00+09:00';
/** 2026-11-05. 만 14세 미만 시험용(2025년생) */
const EARLY_NOW = '2026-11-05T09:00:00+09:00';

const COOKIE_KEY_SUFFIX = '_cookie_consent_v1';
const CONSENT_KEY_SUFFIX = '_fortune_consent_v1';
const SEED_PATH = '/robots.txt';

const RESULT_HEADING = '연·월·일·시 기둥';
const DATE_SUBMIT = FORTUNE_SAJU_PANEL_TEXTS.dateSubmitLabel;
const TIME_HEADING = FORTUNE_SAJU_PANEL_TEXTS.timeFormTitle;
const TIME_SUBMIT = FORTUNE_SAJU_PANEL_TEXTS.timeFormSubmit;
const TIME_UNKNOWN = FORTUNE_SAJU_PANEL_TEXTS.timeFormUnknown;

/** 십신 열 가지 이름(UI 표기). 키와의 대응은 FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS 키 순서와 같다 */
const TEN_GOD_NAME_TO_KEY: Readonly<Record<string, string>> = {
  비견: 'bigyeon',
  겁재: 'geopjae',
  식신: 'siksin',
  상관: 'sanggwan',
  편재: 'pyeonjae',
  정재: 'jeongjae',
  편관: 'pyeongwan',
  정관: 'jeonggwan',
  편인: 'pyeonin',
  정인: 'jeongin',
};

/** 천간 10자의 오행·음양. 십신 기대값을 앱 코드와 따로 계산하는 데 쓴다 (R: 갑을 목, 병정 화, 무기 토, 경신 금, 임계 수) */
const STEMS = '갑을병정무기경신임계';
const STEM_ELEMENT_INDEX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

/** 일간(my)과 오늘 일진 천간(other)의 십신 이름. 상생 목→화→토→금→수, 상극은 한 칸 건너뜀 */
function expectedTenGod(myStem: string, otherStem: string): string {
  const my = STEMS.indexOf(myStem);
  const other = STEMS.indexOf(otherStem);
  const myEl = STEM_ELEMENT_INDEX[my];
  const otherEl = STEM_ELEMENT_INDEX[other];
  const isSamePolarity = my % 2 === other % 2;
  const diff = (otherEl - myEl + 5) % 5;
  switch (diff) {
    case 0:
      return isSamePolarity ? '비견' : '겁재';
    case 1: // 내가 생함
      return isSamePolarity ? '식신' : '상관';
    case 2: // 내가 극함
      return isSamePolarity ? '편재' : '정재';
    case 3: // 나를 극함
      return isSamePolarity ? '편관' : '정관';
    default: // 4: 나를 생함
      return isSamePolarity ? '편인' : '정인';
  }
}

// ---------- 도우미 ----------

let sitePrefixPromise: Promise<string> | null = null;

function getSitePrefix(browser: Browser, baseURL: string): Promise<string> {
  sitePrefixPromise ??= (async () => {
    const context = await browser.newContext({ baseURL });
    try {
      const page = await context.newPage();
      await page.goto(FORTUNE_ROUTES.hub);
      await page.getByRole('button', { name: '쿠키 거부' }).click();
      const key = await page.evaluate(
        (suffix) =>
          Object.keys(localStorage).find((name) => name.endsWith(suffix)) ??
          null,
        COOKIE_KEY_SUFFIX
      );
      if (key === null) throw new Error('쿠키 동의 키를 찾지 못했다');
      return key.slice(0, -COOKIE_KEY_SUFFIX.length);
    } finally {
      await context.close();
    }
  })();
  return sitePrefixPromise;
}

async function getPrefixFor(page: Page): Promise<string> {
  const browser = page.context().browser();
  const baseURL = test.info().project.use.baseURL;
  if (!browser || !baseURL) throw new Error('browser 또는 baseURL이 없다');
  return getSitePrefix(browser, baseURL);
}

function storedConsent(): string {
  return JSON.stringify({
    v: 1,
    version: FORTUNE_CONSENT_VERSION,
    agreedAt: new Date().toISOString(),
  });
}

/** 저장소 값을 심는다. 쿠키 동의는 항상 거부 상태로 두어 배너가 가리지 않게 한다 */
async function prepare(page: Page, options: { consent: boolean }) {
  const prefix = await getPrefixFor(page);
  await page.goto(SEED_PATH);
  await page.evaluate(
    ([consentKey, cookieKey, consentValue, cookieValue]) => {
      sessionStorage.clear();
      localStorage.clear();
      if (consentValue) sessionStorage.setItem(consentKey, consentValue);
      localStorage.setItem(cookieKey, cookieValue);
    },
    [
      `${prefix}${CONSENT_KEY_SUFFIX}`,
      `${prefix}${COOKIE_KEY_SUFFIX}`,
      options.consent ? storedConsent() : '',
      'declined',
    ]
  );
}

async function readConsentRaw(page: Page): Promise<string | null> {
  const key = `${await getPrefixFor(page)}${CONSENT_KEY_SUFFIX}`;
  return page.evaluate((name) => sessionStorage.getItem(name), key);
}

async function storageSnapshot(page: Page): Promise<string> {
  return page.evaluate(() =>
    JSON.stringify({
      local: Object.keys(localStorage)
        .sort()
        .map((key) => [key, localStorage.getItem(key)]),
      session: Object.keys(sessionStorage)
        .sort()
        .map((key) => [key, sessionStorage.getItem(key)]),
      cookie: document.cookie,
    })
  );
}

/** 시계를 고정하고 동의를 심은 뒤 사주 페이지의 생년월일 입력 패널이 보일 때까지 연다 */
async function openSaju(page: Page, now: string = LATER_NOW) {
  await page.clock.setFixedTime(new Date(now));
  await prepare(page, { consent: true });
  const res = await page.goto(FORTUNE_ROUTES.saju);
  expect(res?.status(), '응답').toBeLessThan(400);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_SAJU_PANEL_TEXTS.dateTitle,
      exact: true,
    })
  ).toBeVisible();
}

type BirthType = Readonly<{
  year: number;
  month: number;
  day: number;
  calendar?: 'solar' | 'lunar';
}>;

async function fillDate(page: Page, birth: BirthType) {
  await page
    .getByRole('radio', {
      name: birth.calendar === 'lunar' ? '음력' : '양력',
      exact: true,
    })
    .check({ force: true });
  await page.getByLabel('연도', { exact: true }).fill(String(birth.year));
  await page.getByLabel('월', { exact: true }).fill(String(birth.month));
  await page.getByLabel('일', { exact: true }).fill(String(birth.day));
}

async function submitDate(page: Page, birth: BirthType) {
  await fillDate(page, birth);
  await page.getByRole('button', { name: DATE_SUBMIT, exact: true }).click();
}

const timeHeading = (page: Page) =>
  page.getByRole('heading', { level: 3, name: TIME_HEADING, exact: true });
const resultHeading = (page: Page) =>
  page.getByRole('heading', { level: 2, name: RESULT_HEADING, exact: true });

/** 날짜 제출 → 시간 단계 대기 → 시·분 제출 → 결과 대기 */
async function submitWithTime(
  page: Page,
  birth: BirthType,
  hour: number,
  minute: number
) {
  await submitDate(page, birth);
  await expect(timeHeading(page)).toBeVisible();
  await enterTime(page, hour, minute);
}

/** 시간 단계가 이미 열린 상태에서 시·분만 다시 넣는다 */
async function enterTime(page: Page, hour: number, minute: number) {
  await page.getByLabel('시', { exact: true }).fill(String(hour));
  await page.getByLabel('분', { exact: true }).fill(String(minute));
  await page.getByRole('button', { name: TIME_SUBMIT, exact: true }).click();
  await expect(resultHeading(page)).toBeVisible();
}

async function submitUnknownTime(page: Page, birth: BirthType) {
  await submitDate(page, birth);
  await expect(timeHeading(page)).toBeVisible();
  await page.getByRole('button', { name: TIME_UNKNOWN, exact: true }).click();
  await expect(resultHeading(page)).toBeVisible();
}

type PillarsType = Readonly<{
  year: string;
  month: string;
  day: string;
  hour: string | null;
}>;

/** 기둥 표의 한글 간지(한자는 읽지 않는다). 시주가 없으면 null */
async function readPillars(page: Page): Promise<PillarsType> {
  const table = page.getByRole('table', { name: RESULT_HEADING });
  await expect(table).toBeVisible();
  const raw = await table.evaluate((el) => {
    const rows = Array.from(el.querySelectorAll('tbody tr'));
    const ko = (cell: Element) =>
      cell.querySelector('span > span')?.textContent?.trim() ?? '';
    const stems = Array.from(rows[0].querySelectorAll('td')).map(ko);
    const branches = Array.from(rows[1].querySelectorAll('td')).map(ko);
    return { stems, branches };
  });
  const pillar = (i: number) => `${raw.stems[i]}${raw.branches[i]}`;
  return {
    year: pillar(0),
    month: pillar(1),
    day: pillar(2),
    hour: raw.branches.length === 4 ? pillar(3) : null,
  };
}

/** dl의 dt 라벨 옆 dd 글자 */
function ddOf(page: Page, label: string): Locator {
  return page
    .getByText(label, { exact: true })
    .locator('xpath=following-sibling::dd[1]');
}

async function readTodayAndTenGod(page: Page) {
  const today = (
    (await ddOf(page, FORTUNE_SAJU_PANEL_TEXTS.todayPillarLabel)
      .first()
      .textContent()) ?? ''
  ).trim();
  const myStem = (
    (await ddOf(page, FORTUNE_SAJU_PANEL_TEXTS.myDayStemLabel)
      .first()
      .textContent()) ?? ''
  ).trim();
  const tenGod = (
    (await ddOf(page, FORTUNE_SAJU_PANEL_TEXTS.tenGodLabel)
      .first()
      .textContent()) ?? ''
  ).trim();
  return {
    todayPillar: today.slice(0, 2),
    myStem: myStem.slice(0, 1),
    tenGod: tenGod.slice(0, 2),
  };
}

/** 점수 눈금 애니메이션이 끝나 글자가 두 번 연속 같을 때까지 기다린 뒤 읽는다 */
async function readStable(read: () => Promise<string>): Promise<string> {
  let previous = '';
  await expect
    .poll(async () => {
      const current = await read();
      const isSame = current === previous && current.length > 0;
      previous = current;
      return isSame;
    })
    .toBe(true);
  return previous;
}

/** "오늘의 결과" 제목부터 결과 하단 면책 앞까지의 글자 */
async function readReadingText(page: Page): Promise<string> {
  return readStable(async () => {
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    const body = await page.locator('body').innerText();
    const end = body.indexOf(FORTUNE_RESULT_DISCLAIMER_TEXT.slice(0, 20));
    // 결과 공지(sr-only)에도 같은 글자가 있어 결과 제목은 하단 면책 바로 앞의 것을 쓴다
    const start = end > 0 ? body.lastIndexOf('오늘의 결과', end) : -1;
    return start >= 0 && end > start ? body.slice(start, end) : '';
  });
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

function recordRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return requests;
}

/** 서버 HTML에서 script·style·주석·태그를 지우고 글자만 남긴다 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const squeeze = (text: string) => text.replace(/\s+/g, ' ').trim();

/** 시간 모름 안내(결과 표 아래 문단). 같은 문장이 계산 기준 목록(li)에도 있어 문단으로 한정한다 */
const unknownNotice = (page: Page) =>
  page
    .getByRole('paragraph')
    .filter({ hasText: FORTUNE_SAJU_TIME_UNKNOWN_NOTICE });

// =====================================================================
// 공통 검사
// =====================================================================

test.describe('공통 /fortune/saju', () => {
  test('응답 400 미만, pageerror 없음, h1 하나, title·description·canonical·OG 존재', async ({
    page,
  }) => {
    const pageErrors = watchErrors(page);
    await prepare(page, { consent: true });
    const res = await page.goto(FORTUNE_ROUTES.saju);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      FORTUNE_SAJU_SEO.heading
    );
    expect(await page.title()).toContain(FORTUNE_SAJU_SEO.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      FORTUNE_SAJU_SEO.description
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/fortune\/saju$/
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      new RegExp(FORTUNE_SAJU_SEO.title.slice(0, 10))
    );
    await expect(
      page.locator('meta[property="og:description"]')
    ).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /.+/
    );
    await expect(
      page.getByRole('heading', { level: 2, name: '생년월일 입력' })
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('빈 상태: 입력 전에는 시간 단계·결과·경계 안내가 없다', async ({
    page,
  }) => {
    await openSaju(page);
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(resultHeading(page)).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: TIME_SUBMIT, exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByText(FORTUNE_SAJU_PANEL_TEXTS.todayPillarLabel, {
        exact: true,
      })
    ).toHaveCount(0);
  });

  test('에러 상태: 빈 값에서 오류 안내가 나오고 시간 단계·결과가 나오지 않는다', async ({
    page,
  }) => {
    const pageErrors = watchErrors(page);
    await openSaju(page);
    await page.getByRole('button', { name: DATE_SUBMIT, exact: true }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(resultHeading(page)).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
});

// =====================================================================
// AC-46, AC-47: 연령 판정
// =====================================================================

test.describe('AC-46, AC-47 연령 판정', () => {
  test('AC-46: 시각 입력칸은 연령 판정을 통과한 뒤에만 나온다 (미달이면 연령 안내만)', async ({
    page,
  }) => {
    await openSaju(page, EARLY_NOW);
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(page.getByLabel('시', { exact: true })).toHaveCount(0);

    await submitDate(page, { year: 2025, month: 1, day: 1 });
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: FORTUNE_AGE_BLOCKED_TEXTS.title,
        exact: true,
      })
    ).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(page.getByLabel('시', { exact: true })).toHaveCount(0);
    await expect(resultHeading(page)).toHaveCount(0);
    await expect(
      page.getByRole('link', {
        name: FORTUNE_AGE_BLOCKED_TEXTS.homeLinkLabel,
        exact: true,
      })
    ).toBeVisible();
  });

  test('AC-46: 만 14세 이상이면 생년월일 확인 뒤 태어난 시간 단계가 열린다 (날짜 → 연령 → 시간 순서)', async ({
    page,
  }) => {
    await openSaju(page);
    await expect(timeHeading(page)).toHaveCount(0);
    await submitDate(page, { year: 1990, month: 6, day: 15 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(page.getByLabel('시', { exact: true })).toBeVisible();
    await expect(page.getByLabel('분', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: TIME_UNKNOWN, exact: true })
    ).toBeVisible();
  });

  test('AC-46: 만 14세 생일 전날은 미달(연령 안내), 생일 당일은 통과(시간 단계)이다', async ({
    page,
  }) => {
    await openSaju(page, '2040-06-01T09:00:00+09:00');
    await submitDate(page, { year: 2026, month: 6, day: 2 });
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: FORTUNE_AGE_BLOCKED_TEXTS.title,
        exact: true,
      })
    ).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
  });

  test('AC-46: 만 14세 생일 당일은 통과한다', async ({ page }) => {
    await openSaju(page, '2040-06-01T09:00:00+09:00');
    await submitDate(page, { year: 2026, month: 6, day: 1 });
    await expect(timeHeading(page)).toBeVisible();
  });

  test('AC-47: 연령 판정과 안내 화면은 네트워크·저장소·URL에 흔적이 없고 새로고침하면 입력칸이 비어 있다', async ({
    page,
  }) => {
    await openSaju(page, EARLY_NOW);
    const url = page.url();
    const before = await storageSnapshot(page);
    const requests = recordRequests(page);

    await submitDate(page, { year: 2025, month: 1, day: 1 });
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: FORTUNE_AGE_BLOCKED_TEXTS.title,
        exact: true,
      })
    ).toBeVisible();

    expect(page.url()).toBe(url);
    expect(page.url()).not.toContain('?');
    expect(page.url()).not.toContain('#');
    expect(await storageSnapshot(page)).toBe(before);
    const nonGet = requests.filter((r) => r.method() !== 'GET');
    expect(nonGet.map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
    const withBirth = requests.filter(
      (r) => /year=|birth|2025-01-01/.test(r.url()) || r.postData() !== null
    );
    expect(withBirth.map((r) => r.url())).toEqual([]);

    await page.reload();
    await expect(
      page.getByRole('heading', { level: 2, name: '생년월일 입력' })
    ).toBeVisible();
    await expect(page.getByLabel('연도', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('월', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('일', { exact: true })).toHaveValue('');
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: FORTUNE_AGE_BLOCKED_TEXTS.title,
        exact: true,
      })
    ).toHaveCount(0);
  });

  test('AC-47: 정상 입력으로 결과를 본 뒤에도 sessionStorage·localStorage·쿠키는 변하지 않고 URL에 입력이 없다', async ({
    page,
  }) => {
    await openSaju(page);
    const url = page.url();
    const before = await storageSnapshot(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    expect(page.url()).toBe(url);
    expect(await storageSnapshot(page)).toBe(before);
  });
});

// =====================================================================
// AC-49, AC-91: 입력 3단계와 지원 범위
// =====================================================================

test.describe('AC-49, AC-91 입력 단계와 지원 범위', () => {
  test('AC-49: 입력은 생년월일 → 태어난 시간 → 결과 3단계이고 성별·출생지·이름 입력칸이 없다', async ({
    page,
  }) => {
    await openSaju(page);
    const allowed = new Set(['연도', '월', '일', '시', '분']);
    const names = async () =>
      (
        await page
          .getByRole('textbox')
          .or(page.getByRole('spinbutton'))
          .or(page.getByRole('combobox'))
          .evaluateAll((els) =>
            els.map(
              (el) =>
                el.getAttribute('aria-label') ??
                (el as HTMLInputElement).labels?.[0]?.textContent?.trim() ??
                ''
            )
          )
      ).filter(Boolean);
    expect((await names()).filter((n) => !allowed.has(n))).toEqual([]);
    await expect(page.getByLabel(/성별|출생지|출생 지역|이름/)).toHaveCount(0);

    // 1단계: 날짜
    await expect(page.getByLabel('연도', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('radio', { name: '양력', exact: true })
    ).toBeAttached();
    await expect(
      page.getByRole('radio', { name: '음력', exact: true })
    ).toBeAttached();
    await expect(timeHeading(page)).toHaveCount(0);
    // 2단계: 시간
    await submitDate(page, { year: 1990, month: 6, day: 15 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(resultHeading(page)).toHaveCount(0);
    expect((await names()).filter((n) => !allowed.has(n))).toEqual([]);
    // 3단계: 결과
    await enterTime(page, 14, 30);
    await expect(
      page.getByText('양력 1990년 6월 15일 기준', { exact: true }).first()
    ).toBeVisible();
  });

  test('AC-49: 음력을 고르면 윤달 선택이 나오고 윤달이 있는 달(2023년 2월)은 평달과 윤달의 양력이 다르며 "(윤달)"이 표시된다', async ({
    page,
  }) => {
    await openSaju(page);
    await page
      .getByRole('radio', { name: '음력', exact: true })
      .check({ force: true });
    await expect(page.getByLabel(/윤달/)).toBeAttached();

    const confirmText = async (leap: boolean) => {
      await fillDate(page, {
        year: 2023,
        month: 2,
        day: 10,
        calendar: 'lunar',
      });
      const leapBox = page.getByLabel(/윤달/);
      if (leap) await leapBox.check();
      else await leapBox.uncheck();
      await page
        .getByRole('button', { name: DATE_SUBMIT, exact: true })
        .click();
      await expect(timeHeading(page)).toBeVisible();
      await page
        .getByRole('button', { name: TIME_UNKNOWN, exact: true })
        .click();
      await expect(resultHeading(page)).toBeVisible();
      // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 읽는다
      const body = await page.locator('body').innerText();
      return body;
    };
    const normal = await confirmText(false);
    const leapBody = await confirmText(true);
    expect(leapBody).toContain('(윤달)');
    expect(normal).not.toContain('(윤달)');
    const solarOf = (body: string) =>
      /양력 (\d{4}년 \d{1,2}월 \d{1,2}일)/.exec(body)?.[1];
    expect(solarOf(normal)).toBeTruthy();
    expect(solarOf(leapBody)).toBeTruthy();
    expect(solarOf(normal)).not.toBe(solarOf(leapBody));
  });

  test('AC-49, AC-91: 지원 범위 밖(1919-12-31, 2029-01-01)은 오류 안내만 나오고 시간 단계·결과가 없다', async ({
    page,
  }) => {
    await openSaju(page);
    for (const birth of [
      { year: 1919, month: 12, day: 31 },
      { year: 2029, month: 1, day: 1 },
    ]) {
      await submitDate(page, birth);
      await expect(page.getByRole('alert').first()).toBeVisible();
      await expect(timeHeading(page)).toHaveCount(0);
      await expect(resultHeading(page)).toHaveCount(0);
    }
  });

  test('AC-91: 1920-01-01 00:30과 2028-12-31 23:30은 결과가 나온다 (자월, 시주 포함)', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 1920, month: 1, day: 1 }, 0, 30);
    const first = await readPillars(page);
    expect(first.month.endsWith('자')).toBe(true);
    expect(first.hour).not.toBeNull();

    await submitWithTime(page, { year: 2028, month: 12, day: 31 }, 23, 30);
    const last = await readPillars(page);
    expect(last.hour).not.toBeNull();
    await expect(
      ddOf(page, FORTUNE_SAJU_PANEL_TEXTS.tenGodLabel).first()
    ).toBeVisible();
  });

  test('AC-91, AC-84: 기기 시계가 2029-01-02(KST)여도 오늘 일진·십신이 정상이고 연도 상한은 2028이다', async ({
    page,
  }) => {
    await openSaju(page, '2029-01-02T09:00:00+09:00');
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const info = await readTodayAndTenGod(page);
    expect(info.todayPillar).toMatch(/^[가-힣]{2}$/);
    expect(info.tenGod).toBe(expectedTenGod(info.myStem, info.todayPillar[0]));
    await submitDate(page, { year: 2029, month: 1, day: 1 });
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

// =====================================================================
// AC-50 ~ AC-53: 기둥 표와 경계일
// =====================================================================

test.describe('AC-50 ~ AC-53 기둥 표', () => {
  test('AC-50: 2000-01-01(시간 모름)은 일주 무오, 연주 기묘이고 2000-02-10은 연주 경진이다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 2000, month: 1, day: 1 });
    const a = await readPillars(page);
    expect(a.day).toBe('무오');
    expect(a.year).toBe('기묘');
    expect(a.hour).toBeNull();

    await submitUnknownTime(page, { year: 2000, month: 2, day: 10 });
    expect((await readPillars(page)).year).toBe('경진');
  });

  test('AC-51: 2025-02-03 23:09는 연주 갑진, 23:30은 연주 을사이고 일주 계묘·시주 갑자는 같다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 2025, month: 2, day: 3 }, 23, 9);
    const early = await readPillars(page);
    expect([early.year, early.day, early.hour]).toEqual([
      '갑진',
      '계묘',
      '갑자',
    ]);
    await enterTime(page, 23, 30);
    const late = await readPillars(page);
    expect([late.year, late.day, late.hour]).toEqual(['을사', '계묘', '갑자']);
  });

  test('AC-51: 입춘 당일 + 시간 모름이면 두 후보를 함께 보여 주고, 고르기 전에는 결과가 없으며, 고르면 해당 연주가 나온다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitDate(page, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await page.getByRole('button', { name: TIME_UNKNOWN, exact: true }).click();

    // 조사는 별도 검사(UI 4.3 후보 라벨)에서 본다. 여기서는 간지로 두 후보를 찾는다
    const first = page.getByRole('button', { name: /^연주 갑진(으)?로 보기$/ });
    const second = page.getByRole('button', {
      name: /^연주 을사(으)?로 보기$/,
    });
    await expect(first).toBeVisible();
    await expect(second).toBeVisible();
    await expect(
      page.getByText(/입춘/).filter({ hasText: '두 경우를 함께' }).first()
    ).toBeVisible();
    // 미리 선택·추천 없음, 결과 없음
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await expect(second).toHaveAttribute('aria-pressed', 'false');
    await expect(resultHeading(page)).toHaveCount(0);
    // 같은 크기
    const [a, b] = await Promise.all([
      first.boundingBox(),
      second.boundingBox(),
    ]);
    expect(Math.abs((a?.height ?? 0) - (b?.height ?? 1))).toBeLessThanOrEqual(
      1
    );
    // 순서: 절기 전 → 절기 후
    expect((a?.x ?? 0) + (a?.y ?? 0) < (b?.x ?? 0) + (b?.y ?? 0)).toBe(true);

    await first.click();
    await expect(resultHeading(page)).toBeVisible();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    expect((await readPillars(page)).year).toBe('갑진');
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => (await readPillars(page)).year).toBe('을사');
  });

  test('UI 4.3: 입춘 당일 후보 버튼 라벨은 설계 예시대로 "연주 갑진으로 보기", "연주 을사로 보기"이고 후보 묶음의 이름은 경계 안내 문장이다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitDate(page, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await page.getByRole('button', { name: TIME_UNKNOWN, exact: true }).click();
    await expect(
      page.getByRole('button', { name: '연주 갑진으로 보기', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '연주 을사로 보기', exact: true })
    ).toBeVisible();
    // UI 9: role="group" aria-labelledby={경계 안내 id}
    const group = page.getByRole('group', { name: /입춘/ });
    await expect(group).toHaveCount(1);
    await expect(group.getByRole('button')).toHaveCount(2);
  });

  test('AC-52: 시간 모름이면 시주 없이 연·월·일 기둥과 안내가 나오고, 시간을 넣으면 시주가 나오며 한자가 함께 표시된다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const unknown = await readPillars(page);
    expect(unknown.hour).toBeNull();
    const table = page.getByRole('table', { name: RESULT_HEADING });
    await expect(
      table.getByText(FORTUNE_SAJU_PANEL_TEXTS.hourUnknownCell, { exact: true })
    ).toBeVisible();
    await expect(unknownNotice(page)).toBeVisible();
    await expect(table.getByRole('columnheader')).toHaveText([
      '연주',
      '월주',
      '일주',
      '시주',
    ]);
    await expect(table.getByText('일간', { exact: true })).toBeVisible();

    await enterTime(page, 14, 30);
    const withHour = await readPillars(page);
    expect(withHour.hour).toMatch(/^[가-힣]{2}$/);
    await expect(unknownNotice(page)).toHaveCount(0);
    // 한글과 한자가 함께 표시된다(한자는 화면 읽기에서는 숨김)
    const tableText = await table.evaluate((el) => el.textContent ?? '');
    expect(tableText).toMatch(/[一-鿿]/);
    expect(tableText).toMatch(/[가-힣]/);
    // 화면 어디에도 "사주 네 기둥", "사주 4기둥", 내부 용어가 없다
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 읽는다
    const body = await page.locator('main, body').first().innerText();
    expect(body).not.toMatch(/사주 ?네 ?기둥(?!\))|사주 ?4기둥|3기둥|4기둥/);
  });

  test('AC-53: 절기가 드는 날 + 시간 모름이면 월주를 하나로 정할 수 없다는 안내와 두 후보가 함께 보인다', async ({
    page,
  }) => {
    // 2026년 월 절기(입춘 제외) 날짜를 계산 기준 표에서 찾는다
    let found: { month: number; day: number; term: number } | null = null;
    for (let month = 1; month <= 12 && !found; month += 1) {
      for (let day = 1; day <= 31 && !found; day += 1) {
        const date = new Date(Date.UTC(2026, month - 1, day));
        if (date.getUTCMonth() !== month - 1) continue;
        const boundary = getFortuneSajuBoundary({ year: 2026, month, day });
        if (boundary?.kind === 'month') {
          found = { month, day, term: boundary.termIndex / 2 };
        }
      }
    }
    expect(found, '2026년 월 절기일').not.toBeNull();
    if (!found) return;

    await openSaju(page);
    await submitDate(page, { year: 2026, month: found.month, day: found.day });
    await expect(timeHeading(page)).toBeVisible();
    await page.getByRole('button', { name: TIME_UNKNOWN, exact: true }).click();
    const candidates = page.getByRole('button', {
      name: /^월주 .{2}(으)?로 보기$/,
    });
    await expect(candidates).toHaveCount(2);
    const labels = await candidates.allInnerTexts();
    expect(new Set(labels).size).toBe(2);
    await expect(
      page
        .getByText(FORTUNE_SAJU_SOLAR_TERM_NAMES[found.term])
        .filter({ hasText: '월주를 하나로 정할 수 없습니다' })
        .first()
    ).toBeVisible();
    await expect(resultHeading(page)).toHaveCount(0);
    await candidates.first().click();
    await expect(resultHeading(page)).toBeVisible();
  });

  test('AC-51, AC-53: 경계일이어도 시간을 입력하면 후보 선택 없이 바로 결과가 나온다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 2025, month: 2, day: 3 }, 12, 0);
    await expect(
      page.getByRole('button', { name: /^연주 .{2}(으)?로 보기$/ })
    ).toHaveCount(0);
    expect((await readPillars(page)).year).toBe('갑진');
  });
});

// =====================================================================
// AC-54, AC-55: 오늘 일진·십신·점수
// =====================================================================

test.describe('AC-54, AC-55 오늘 일진·십신·점수', () => {
  test('AC-54: 결과에 오늘 일진, 내 일간, 십신 이름과 한 줄 설명, 오늘의 사주 운세(점수·항목별 문구)와 방식 B 안내가 있다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const info = await readTodayAndTenGod(page);
    expect(Object.keys(TEN_GOD_NAME_TO_KEY)).toContain(info.tenGod);
    // 십신 한 줄 설명
    const key = TEN_GOD_NAME_TO_KEY[
      info.tenGod
    ] as keyof typeof FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS;
    await expect(
      page.getByText(FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS[key], { exact: true })
    ).toBeVisible();
    // 점수·항목
    const reading = await readReadingText(page);
    for (const label of ['총운', '재물', '애정', '직장·학업', '건강']) {
      expect(reading, label).toContain(label);
    }
    const scores = [...reading.matchAll(/(\d+)\s*점/g)].map((m) =>
      Number(m[1])
    );
    expect(scores.length).toBeGreaterThanOrEqual(5);
    for (const score of scores) {
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(30);
      expect(score).toBeLessThanOrEqual(95);
    }
    await expect(
      page.getByText(FORTUNE_METHOD_B_NOTICE, { exact: true })
    ).toBeVisible();
  });

  test('AC-54: 오늘 일진은 한국 시간 자정에 바뀐다 (2026-11-05 23:59 계미, 2026-11-06 00:00 갑신)', async ({
    page,
  }) => {
    await openSaju(page, '2026-11-05T23:59:00+09:00');
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    expect((await readTodayAndTenGod(page)).todayPillar).toBe('계미');
    await expect(
      page.getByText('2026년 11월 5일', { exact: false }).first()
    ).toBeVisible();

    await openSaju(page, '2026-11-06T00:00:00+09:00');
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    expect((await readTodayAndTenGod(page)).todayPillar).toBe('갑신');
  });

  test('AC-54: 접속 시각이 23시대여도 그날 일진을 쓰고(2026-11-05 23:30 계미), 시계를 UTC 자정 전후로 옮겨도 KST 날짜를 따른다', async ({
    page,
  }) => {
    // 2026-11-05 15:30 UTC = 2026-11-06 00:30 KST
    await openSaju(page, '2026-11-05T15:30:00Z');
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    expect((await readTodayAndTenGod(page)).todayPillar).toBe('갑신');
  });

  test('AC-54: 같은 일간·같은 날이면 십신과 결과 문구가 같고, 태어난 시각(23시대 포함)은 일간과 결과에 영향이 없고 시주만 달라진다', async ({
    page,
  }) => {
    await openSaju(page);
    // 10일 차이는 일간이 같다
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const a = await readTodayAndTenGod(page);
    const readingA = await readReadingText(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 25 });
    const b = await readTodayAndTenGod(page);
    const readingB = await readReadingText(page);
    expect(b.myStem).toBe(a.myStem);
    expect(b.tenGod).toBe(a.tenGod);
    expect(readingB).toBe(readingA);

    // 같은 날 12:00과 23:30: 일간·결과는 같고 시주만 다르다
    await submitWithTime(page, { year: 1990, month: 6, day: 15 }, 12, 0);
    const noon = await readPillars(page);
    const noonInfo = await readTodayAndTenGod(page);
    const noonReading = await readReadingText(page);
    await enterTime(page, 23, 30);
    const night = await readPillars(page);
    const nightInfo = await readTodayAndTenGod(page);
    const nightReading = await readReadingText(page);
    expect(night.day).toBe(noon.day);
    expect(night.hour).not.toBe(noon.hour);
    expect(nightInfo).toEqual(noonInfo);
    expect(nightReading).toBe(noonReading);
    expect(noonInfo.myStem).toBe(a.myStem);
  });

  test('AC-55: 십신은 일간과 오늘 일진 천간의 오행 관계·음양 일치 표와 같고(열 가지 일간 전부), 지지 음양·지지 십신은 보이지 않는다', async ({
    page,
  }) => {
    await openSaju(page);
    const seen = new Set<string>();
    const stems = new Set<string>();
    for (let day = 10; day <= 19; day += 1) {
      await submitUnknownTime(page, { year: 2000, month: 3, day });
      const pillars = await readPillars(page);
      const info = await readTodayAndTenGod(page);
      expect(info.myStem, `3월 ${day}일 일간`).toBe(pillars.day[0]);
      expect(info.tenGod, `3월 ${day}일 십신`).toBe(
        expectedTenGod(info.myStem, info.todayPillar[0])
      );
      seen.add(info.tenGod);
      stems.add(info.myStem);
    }
    expect(stems.size).toBe(10);
    expect(seen.size).toBe(10);
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 읽는다
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/지지 ?십신|지지 ?음양|지지의 음양/);
    await expect(
      page.getByText(FORTUNE_SAJU_PANEL_TEXTS.tenGodLabel, { exact: true })
    ).toHaveCount(1);
  });
});

// =====================================================================
// AC-56, AC-57: 계산 기준과 23시대, 표준시 안내
// =====================================================================

test.describe('AC-56 계산 기준과 23시대', () => {
  test('AC-56: 서버 HTML(JS 없이 받은 응답)의 계산 기준에 6항목이 모두 있다', async ({
    request,
  }) => {
    const res = await request.get(FORTUNE_ROUTES.saju);
    expect(res.status()).toBeLessThan(400);
    const text = squeeze(htmlToText(await res.text()));
    for (const [name, item] of [
      ['연주·월주', FORTUNE_SAJU_CALC_BASIS_PILLARS],
      ['일주·시주', FORTUNE_SAJU_CALC_BASIS_DAY_HOUR],
      ['학설', FORTUNE_SAJU_CALC_BASIS_SCHOOLS],
      ['자시 시작', FORTUNE_SAJU_CALC_BASIS_ZI_START],
      ['보정 안 함', FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION],
      ['학파별 기준', FORTUNE_SAJU_CALC_BASIS_STATEMENT],
    ] as const) {
      expect(text, name).toContain(squeeze(item));
    }
    expect(text).toContain('계산 기준');
    expect(text).toContain('23:00~23:59');
    expect(text).toContain('23:30');
    expect(text).not.toMatch(/정자시|same-day|next-day/);
  });

  test('AC-56: 화면 DOM의 계산 기준 영역에도 같은 항목이 있고 "계산 기준 보기" 링크가 그 영역으로 이동한다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitDate(page, { year: 1990, month: 6, day: 15 });
    const link = page.getByRole('link', {
      name: FORTUNE_SAJU_PANEL_TEXTS.calcBasisLinkLabel,
      exact: true,
    });
    await expect(link).toBeVisible();
    await link.click();
    await expect(
      page.getByRole('heading', { level: 2, name: '계산 기준', exact: true })
    ).toBeInViewport();
    await expect(
      page.getByText(FORTUNE_SAJU_CALC_BASIS_DAY_HOUR, { exact: true })
    ).toBeVisible();
  });

  test('AC-56: 2026-11-06 22:59는 시주 을해, 23:00·23:30·23:59는 일주 갑신·시주 병자(갑자 아님)이다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 2026, month: 11, day: 6 }, 22, 59);
    const p = await readPillars(page);
    expect([p.day, p.hour]).toEqual(['갑신', '을해']);
    for (const [h, m] of [
      [23, 0],
      [23, 30],
      [23, 59],
    ]) {
      await enterTime(page, h, m);
      const r = await readPillars(page);
      expect([r.day, r.hour], `${h}:${m}`).toEqual(['갑신', '병자']);
    }
  });

  test('AC-56: 2026-11-07 00:00·00:30은 일주 을유·시주 병자, 01:00은 시주 정축이고 11-06 23:30과 시주는 같지만 일주는 다르다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 2026, month: 11, day: 7 }, 0, 0);
    expect(await readPillars(page)).toMatchObject({
      day: '을유',
      hour: '병자',
    });
    await enterTime(page, 0, 30);
    const after = await readPillars(page);
    expect(after).toMatchObject({ day: '을유', hour: '병자' });
    await enterTime(page, 1, 0);
    expect((await readPillars(page)).hour).toBe('정축');

    await submitWithTime(page, { year: 2026, month: 11, day: 6 }, 23, 30);
    const before = await readPillars(page);
    expect(before.hour).toBe(after.hour);
    expect(before.day).not.toBe(after.day);
  });

  test('AC-56: 1999-12-31 23:30은 일주 정사·시주 임자, 2000-01-01 00:30은 일주 무오·시주 임자이다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 1999, month: 12, day: 31 }, 23, 30);
    expect(await readPillars(page)).toMatchObject({
      day: '정사',
      hour: '임자',
    });
    await submitWithTime(page, { year: 2000, month: 1, day: 1 }, 0, 30);
    expect(await readPillars(page)).toMatchObject({
      day: '무오',
      hour: '임자',
    });
  });

  test('AC-56: 화면 어디에도 정자시, same-day, next-day가 보이지 않는다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitWithTime(page, { year: 2026, month: 11, day: 6 }, 23, 30);
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 읽는다
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/정자시|same-day|next-day/);
  });
});

test.describe('AC-57 표준시·서머타임 안내', () => {
  const notice = (page: Page) =>
    page.getByText(FORTUNE_DST_NOTICE, { exact: true });

  const CASES: ReadonlyArray<
    Readonly<{
      y: number;
      m: number;
      d: number;
      h: number;
      min: number;
      has: boolean;
    }>
  > = [
    { y: 1947, m: 12, d: 31, h: 23, min: 30, has: false },
    { y: 1948, m: 1, d: 1, h: 0, min: 30, has: true },
    { y: 1961, m: 12, d: 31, h: 12, min: 0, has: true },
    { y: 1962, m: 1, d: 1, h: 12, min: 0, has: false },
    { y: 1986, m: 12, d: 31, h: 12, min: 0, has: false },
    { y: 1987, m: 1, d: 1, h: 12, min: 0, has: true },
    { y: 1988, m: 12, d: 31, h: 12, min: 0, has: true },
    { y: 1989, m: 1, d: 1, h: 12, min: 0, has: false },
  ];

  test('AC-57: 연도 경계 8건(1947/1948, 1961/1962, 1986/1987, 1988/1989)에서 안내가 나오거나 나오지 않는다', async ({
    page,
  }) => {
    await openSaju(page);
    for (const c of CASES) {
      await submitWithTime(
        page,
        { year: c.y, month: c.m, day: c.d },
        c.h,
        c.min
      );
      await expect(
        notice(page),
        `${c.y}-${c.m}-${c.d} ${c.h}:${c.min}`
      ).toHaveCount(c.has ? 1 : 0);
    }
  });

  test('AC-57: 시간 모름이면 해당 연도여도 안내가 없다 (대신 시주 없음 안내)', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1988, month: 7, day: 15 });
    await expect(notice(page)).toHaveCount(0);
    await expect(unknownNotice(page)).toBeVisible();
  });

  test('AC-57: 시각을 보정하지 않는다 (1988-07-15, 1989-07-15 00:30은 시지 자(子)이고 일주는 시간 모름과 같다)', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1988, month: 7, day: 15 });
    const unknown = await readPillars(page);
    await enterTime(page, 0, 30);
    const timed = await readPillars(page);
    expect(timed.hour?.endsWith('자')).toBe(true);
    expect(timed.day).toBe(unknown.day);
    await expect(notice(page)).toHaveCount(1);

    await submitWithTime(page, { year: 1989, month: 7, day: 15 }, 0, 30);
    expect((await readPillars(page)).hour?.endsWith('자')).toBe(true);
    await expect(notice(page)).toHaveCount(0);
  });

  test('AC-57: 음력 입력은 환산한 양력 연도로 판단한다 (음력 1986-12-20은 양력 1987년이라 안내가 나온다)', async ({
    page,
  }) => {
    await openSaju(page);
    await submitDate(page, {
      year: 1986,
      month: 12,
      day: 20,
      calendar: 'lunar',
    });
    await expect(timeHeading(page)).toBeVisible();
    await enterTime(page, 12, 0);
    await expect(notice(page)).toHaveCount(1);
  });
});

// =====================================================================
// AC-59: 면책·상담전화·로또 고지
// =====================================================================

test.describe('AC-59 면책·상담전화·로또 고지', () => {
  test('AC-59: h1 바로 아래 상시 면책, 하단 면책, 이용 안내가 동의 전에도 보인다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: FORTUNE_DETAIL_NOTICE_TITLE })
    ).toBeVisible();
    // 상시 면책은 h1 다음, 입력 영역보다 앞
    const order = await page.evaluate(
      ([disclaimer]) => {
        const h1 = document.querySelector('h1');
        const p = Array.from(document.querySelectorAll('p')).find(
          (el) => el.textContent?.trim() === disclaimer
        );
        if (!h1 || !p) return null;
        return Boolean(
          h1.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING
        );
      },
      [FORTUNE_DISCLAIMER_TEXT]
    );
    expect(order).toBe(true);
  });

  test('AC-59: 상담전화 다섯 곳이 순서대로 DOM에 있고 기기에 맞게(터치는 링크, PC는 글자) 보인다', async ({
    page,
  }) => {
    await prepare(page, { consent: true });
    await page.goto(FORTUNE_ROUTES.saju);
    const hrefs = await page
      .locator('a[href^="tel:"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(CRISIS_PHONES.map((p) => p.href));
    for (const phone of CRISIS_PHONES) {
      await expect(
        page
          .getByText(new RegExp(`${phone.name}\\s*${phone.displayNumber}`))
          .filter({ visible: true })
          .first()
      ).toBeVisible();
    }
    const isTouch = test.info().project.name === 'mobile';
    const visibleLinks = await page
      .locator('a[href^="tel:"]')
      .evaluateAll(
        (els) =>
          els.filter((el) => (el as HTMLElement).offsetParent !== null).length
      );
    expect(visibleLinks).toBe(isTouch ? CRISIS_PHONES.length : 0);
  });

  test('AC-59: 결과 화면에도 하단 면책과 상담전화 다섯 곳, 로또 고지(행운 숫자)가 있다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    await expect(
      page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    expect(await page.locator('a[href^="tel:"]').count()).toBe(
      CRISIS_PHONES.length
    );
    await expect(
      page.getByText(FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
  });
});

// =====================================================================
// AC-72, AC-87: 이용 동의
// =====================================================================

test.describe('AC-72, AC-87 이용 동의', () => {
  test('AC-72: 동의 전에는 DOM에 생년월일 입력칸·결과가 없고 h1·면책·설명은 보인다', async ({
    page,
  }) => {
    const requests = recordRequests(page);
    await prepare(page, { consent: false });
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      FORTUNE_SAJU_SEO.heading
    );
    await expect(
      page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 2, name: '생년월일 입력' })
    ).toHaveCount(0);
    await expect(resultHeading(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: DATE_SUBMIT })).toHaveCount(
      0
    );
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: FORTUNE_SAJU_GUIDE[0].heading,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: '계산 기준' })
    ).toBeVisible();
    // 동의 전에는 결과 문구 풀 청크를 받지 않는다 (panel은 동의 뒤에 지연 로드)
    const chunkNames = requests
      .map((r) => r.url())
      .filter((u) => /saju-pools|pools\/saju/.test(u));
    expect(chunkNames).toEqual([]);
    // 세 항목을 모두 선택하기 전에는 진행할 수 없다
    const boxes = page.getByRole('checkbox');
    await expect(boxes).toHaveCount(3);
    for (const box of await boxes.all()) await expect(box).not.toBeChecked();
    await page
      .getByRole('button', { name: FORTUNE_CONSENT_TEXTS.grantButton })
      .click({ timeout: 2000 })
      .catch(() => undefined);
    await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
  });

  test('AC-72: 동의하면 입력 폼이 나오고 포커스가 첫 제목으로 간다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
    for (const box of await page.getByRole('checkbox').all()) {
      await box.check();
    }
    await page
      .getByRole('button', { name: FORTUNE_CONSENT_TEXTS.grantButton })
      .click();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '생년월일 입력',
        exact: true,
      })
    ).toBeFocused();
    await expect(page.getByLabel('연도', { exact: true })).toBeVisible();
  });

  test('AC-72: JS를 끈 서버 HTML에는 결과가 없고 "운세 이용에는 JavaScript가 필요합니다" 안내가 있다', async ({
    request,
  }) => {
    const html = await (await request.get(FORTUNE_ROUTES.saju)).text();
    const text = squeeze(htmlToText(html));
    // noscript 안 글자는 htmlToText가 태그만 지우므로 남는다
    expect(text).toContain(FORTUNE_NOSCRIPT_NOTICE);
    // 설명 문장에도 같은 낱말이 있어 구조(표·결과 제목)로 본다
    expect(html).not.toContain('<table');
    expect(html).not.toMatch(/<h[23][^>]*>\s*오행 분포\s*<\/h[23]>/);
    expect(html).not.toMatch(/<h2[^>]*>\s*연·월·일·시 기둥\s*<\/h2>/);
    expect(text).not.toMatch(/\d+점/);
  });

  test('AC-87: 같은 탭에서 이미 동의했으면 동의 화면 없이 입력 폼이 나오고 사주 방문이 동의 저장값을 바꾸지 않는다', async ({
    page,
  }) => {
    await prepare(page, { consent: true });
    const before = await readConsentRaw(page);
    expect(before).not.toBeNull();
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '생년월일 입력',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toHaveCount(0);
    expect(await readConsentRaw(page)).toBe(before);
    // 새로고침해도 다시 묻지 않는다
    await page.reload();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '생년월일 입력',
        exact: true,
      })
    ).toBeVisible();
    expect(await readConsentRaw(page)).toBe(before);
  });

  test('AC-87: 오늘의 운세에서 동의한 탭은 사주에서도 다시 묻지 않는다', async ({
    page,
  }) => {
    await prepare(page, { consent: true });
    await page.goto(FORTUNE_ROUTES.today);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '생년월일 입력',
        exact: true,
      })
    ).toBeVisible();
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '생년월일 입력',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toHaveCount(0);
  });

  test('AC-87: "동의 다시 설정"을 누르면 저장된 동의가 지워지고 동의 화면이 나오며 입력·결과가 사라진다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const reset = page.getByRole('button', {
      name: FORTUNE_CONSENT_RESET_TEXTS.button,
      exact: true,
    });
    await expect(reset).toBeVisible();
    await reset.click();
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
    expect(await readConsentRaw(page)).toBeNull();
    await expect(resultHeading(page)).toHaveCount(0);
    await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
  });

  test('AC-87: 동의 문구 버전이 다르면 다시 묻는다', async ({ page }) => {
    const prefix = await getPrefixFor(page);
    await prepare(page, { consent: false });
    await page.evaluate(
      ([key]) =>
        sessionStorage.setItem(
          key,
          JSON.stringify({
            v: 1,
            version: 'old-version',
            agreedAt: new Date().toISOString(),
          })
        ),
      [`${prefix}${CONSENT_KEY_SUFFIX}`]
    );
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByRole('heading', { level: 2, name: FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
  });

  test('AC-72(참고): 연령 안내 문구(FORTUNE_AGE_INPUT_NOTICE)가 입력 영역 안내로 보인다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await page.goto(FORTUNE_ROUTES.saju);
    await expect(
      page.getByText(FORTUNE_AGE_INPUT_NOTICE, { exact: true })
    ).toBeVisible();
  });
});

// =====================================================================
// AC-89: 검색 노출 (noindex 제외)
// =====================================================================

test.describe('AC-89 검색 노출 요소 (noindex 제외)', () => {
  test('AC-89: JSON-LD에 홈 > 운세 > 사주 BreadcrumbList와 화면 FAQ와 같은 FAQPage가 있다', async ({
    page,
  }) => {
    await page.goto(FORTUNE_ROUTES.saju);
    const raws = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const flat = raws.flatMap((raw) => {
      const value = JSON.parse(raw) as unknown;
      return (Array.isArray(value) ? value : [value]) as Array<
        Record<string, unknown>
      >;
    });
    const crumb = flat.find((v) => v['@type'] === 'BreadcrumbList') as
      | { itemListElement: Array<{ name: string; item: string }> }
      | undefined;
    expect(crumb?.itemListElement.map((e) => e.name).slice(1)).toEqual([
      '운세',
      '사주',
    ]);
    expect(crumb?.itemListElement[1].item).toMatch(/\/fortune$/);
    expect(crumb?.itemListElement[2].item).toMatch(/\/fortune\/saju$/);
    const faq = flat.find((v) => v['@type'] === 'FAQPage') as
      | { mainEntity: Array<{ name: string }> }
      | undefined;
    expect(faq?.mainEntity.map((e) => e.name)).toEqual(
      FORTUNE_SAJU_FAQ.map((f) => f.question)
    );
    // 화면 FAQ와 같다
    for (const item of FORTUNE_SAJU_FAQ) {
      await expect(
        page.getByText(item.question, { exact: true }).first()
      ).toBeVisible();
    }
    expect(JSON.stringify(flat)).not.toMatch(/Review|AggregateRating/);
  });

  test('AC-89: JS 없이 받은 서버 HTML에 설명·사용법·계산 기준·시간 모름 안내·차이·FAQ 5개·면책·이용 대상 안내가 있고 600자 이상이다', async ({
    request,
  }) => {
    const res = await request.get(FORTUNE_ROUTES.saju);
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    const text = squeeze(htmlToText(html));
    expect(text.length).toBeGreaterThanOrEqual(600);
    // 첫 "사주" 언급은 본문에서 괄호 설명이다 (제목·메뉴 영역의 "사주" 제외 위해 가이드 단락으로 확인)
    expect(text).toContain(squeeze(FORTUNE_SAJU_GUIDE[0].paragraphs[0]));
    expect(
      FORTUNE_SAJU_GUIDE[0].paragraphs[0].startsWith(FORTUNE_SAJU_GLOSS)
    ).toBe(true);
    for (const section of FORTUNE_SAJU_GUIDE) {
      expect(text, section.heading).toContain(section.heading);
      for (const p of section.paragraphs) expect(text).toContain(squeeze(p));
    }
    for (const item of FORTUNE_SAJU_FAQ) {
      expect(text, item.question).toContain(item.question);
      expect(text, item.question).toContain(squeeze(item.answer));
    }
    expect(text).toContain(FORTUNE_SAJU_TIME_UNKNOWN_NOTICE);
    expect(text).toContain(FORTUNE_DISCLAIMER_TEXT);
    expect(text).toContain(FORTUNE_RESULT_DISCLAIMER_TEXT);
    expect(text).toContain(FORTUNE_AGE_INPUT_NOTICE);
    // 개인 결과는 없다
    expect(html).not.toContain('<table');
    expect(html).not.toMatch(/<h2[^>]*>\s*연·월·일·시 기둥\s*<\/h2>/);
    expect(text).not.toMatch(/양력 \d{4}년 \d{1,2}월 \d{1,2}일 기준/);
    // 금지 표현
    expect(text).not.toMatch(/사주 ?네 ?기둥(?!\))|사주 ?4기둥|사주 ?풀이/);
    // h1 하나
    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    expect(h1Count).toBe(1);
  });

  test('AC-89: JS를 끈 브라우저에서도 본문 HTML이 DOM에 있다 (루트 loading.tsx 때문에 숨겨지는 문제는 알려진 한계로 분류)', async ({
    browser,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
    });
    try {
      const page = await context.newPage();
      const res = await page.goto(FORTUNE_ROUTES.saju);
      expect(res?.status()).toBeLessThan(400);
      const domText = squeeze(
        await page.evaluate(() => document.body.textContent ?? '')
      );
      expect(domText).toContain(FORTUNE_SAJU_FAQ[0].question);
      expect(domText).toContain(FORTUNE_SAJU_CALC_BASIS_DAY_HOUR);
      const visible = await page
        .getByText(FORTUNE_SAJU_FAQ[0].question, { exact: true })
        .first()
        .isVisible();
      if (!visible) {
        testInfo.annotations.push({
          type: '알려진 한계',
          description:
            'JS를 끄면 루트 loading.tsx 때문에 본문이 숨겨진다(사용자 결정 A안). 실패로 세지 않는다.',
        });
      }
    } finally {
      await context.close();
    }
  });
});

// =====================================================================
// 화면 상태 (UI 절 4)와 접근성 (UI 절 9)
// =====================================================================

test.describe('화면 상태와 접근성', () => {
  test('UI 4.2: 시간 단계 진입 시 포커스가 "태어난 시간" 제목으로 가고, 요약 줄과 안내가 있다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitDate(page, { year: 1990, month: 6, day: 15 });
    await expect(timeHeading(page)).toBeFocused();
    await expect(
      page.getByText('양력 1990년 6월 15일 기준', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_SAJU_TIME_QUESTION_TEXT, { exact: true })
    ).toBeVisible();
  });

  test('UI 4.4: 결과 진입 시 포커스가 "연·월·일·시 기둥" 제목으로 가고 오행 분포 5행(목·화·토·금·수)이 있다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    await expect(resultHeading(page)).toBeFocused();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: FORTUNE_SAJU_PANEL_TEXTS.elementsTitle,
      })
    ).toBeVisible();
    const total = await page
      .getByRole('heading', {
        level: 3,
        name: FORTUNE_SAJU_PANEL_TEXTS.elementsTitle,
      })
      .locator('xpath=ancestor::section[1]')
      .evaluate((section) => {
        const rows = Array.from(section.querySelectorAll('dt')).map((dt) => ({
          name: dt.textContent?.trim() ?? '',
          count: Number(dt.nextElementSibling?.textContent?.trim()),
        }));
        return rows;
      });
    expect(total.map((r) => r.name)).toEqual(['목', '화', '토', '금', '수']);
    // 시간 모름이면 표에 보이는 글자 6자
    expect(total.reduce((sum, r) => sum + r.count, 0)).toBe(6);
    await enterTime(page, 14, 30);
    const withHour = await page
      .getByRole('heading', {
        level: 3,
        name: FORTUNE_SAJU_PANEL_TEXTS.elementsTitle,
      })
      .locator('xpath=ancestor::section[1]')
      .evaluate((section) =>
        Array.from(section.querySelectorAll('dt')).reduce(
          (sum, dt) => sum + Number(dt.nextElementSibling?.textContent?.trim()),
          0
        )
      );
    expect(withHour).toBe(8);
  });

  test('UI 9: 결과가 나오면 aria-live 영역에 결과 공지가 한 번 읽힌다', async ({
    page,
  }) => {
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    await expect(
      page
        .locator('[aria-live="polite"]')
        .getByText(FORTUNE_SAJU_PANEL_TEXTS.resultAnnouncement, { exact: true })
    ).toHaveCount(1);
  });

  test('UI 9: 모바일 360px 너비에서도 기둥 표와 오행 분포가 가로로 넘치지 않는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openSaju(page);
    await submitUnknownTime(page, { year: 1990, month: 6, day: 15 });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
