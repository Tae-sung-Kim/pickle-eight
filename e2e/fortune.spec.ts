import {
  type Browser,
  expect as baseExpect,
  type Locator,
  type Page,
  type Request,
  type TestInfo,
  test,
} from '@playwright/test';
import {
  CRISIS_PHONES,
  CRISIS_RESULT_LINE,
} from '@/constants/crisis-phone.constant';
import { FORTUNE_CONSENT_VERSION } from '@/features/fortune/constants/fortune-consent.constant';
import {
  FORTUNE_COPY_ALLOWED_SENTENCES,
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
  FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A,
  FORTUNE_SAJU_REDUNDANT_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import {
  FORTUNE_HUB_FAQ,
  FORTUNE_STAR_SIGN_FAQ,
  FORTUNE_TODAY_FAQ,
  FORTUNE_TTI_FAQ,
} from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_HUB_GUIDE,
  FORTUNE_STAR_SIGN_GUIDE,
  FORTUNE_TODAY_GUIDE,
  FORTUNE_TTI_GUIDE,
} from '@/features/fortune/constants/fortune-guide.constant';
import {
  FORTUNE_AGE_BLOCKED_TEXTS,
  FORTUNE_AGE_INPUT_NOTICE,
  FORTUNE_BIRTH_ERROR_MESSAGES,
  FORTUNE_CALC_BASIS_STAR_SIGN,
  FORTUNE_CALC_BASIS_TTI,
  FORTUNE_CONSENT_RESET_TEXTS,
  FORTUNE_CONSENT_TEXTS,
  FORTUNE_DECLINED_TEXTS,
  FORTUNE_DETAIL_NOTICE_ITEMS,
  FORTUNE_DETAIL_NOTICE_TITLE,
  FORTUNE_DIFFERENT_BASIS_NOTICE,
  FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE,
  FORTUNE_DISCLAIMER_TEXT,
  FORTUNE_KST_LABEL,
  FORTUNE_LOTTO_LINK_HREF,
  FORTUNE_LOTTO_LINK_LABEL,
  FORTUNE_LOTTO_NOTICE,
  FORTUNE_METHOD_A_NOTICE,
  FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
  FORTUNE_METHOD_A_TTI_NOTICE,
  FORTUNE_NOSCRIPT_NOTICE,
  FORTUNE_PRIVACY_INPUT_NOTICE,
  FORTUNE_RESULT_DISCLAIMER_TEXT,
  FORTUNE_SCORE_NOTICE,
  FORTUNE_SEOLLAL_TEMPLATE,
  FORTUNE_SUPPORTED_RANGE_NOTICE,
  FORTUNE_TODAY_LINK_LABEL,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  FORTUNE_HUB_SEO,
  FORTUNE_STAR_SIGN_SEO,
  FORTUNE_TODAY_SEO,
  FORTUNE_TTI_SEO,
  type FortunePageSeoType,
} from '@/features/fortune/constants/fortune-seo.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_PERSONAL_POOL } from '@/features/fortune/constants/pools/personal.constant';
import {
  convertLunarToSolar,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
import { getFortuneBand } from '@/features/fortune/utils/fortune-seed.util';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

// ---------- 대상 페이지 ----------

type PageDefType = Readonly<{
  key: 'hub' | 'today' | 'tti' | 'star';
  path: string;
  h1: string;
  seo: FortunePageSeoType;
  faq: ReadonlyArray<{ question: string; answer: string }>;
  guide: ReadonlyArray<{ heading: string; paragraphs: readonly string[] }>;
}>;

type GatedDefType = PageDefType &
  Readonly<{
    key: 'today' | 'tti' | 'star';
    /** 동의 뒤 기능 영역 첫 h2 */
    panelHeading: string;
    /** 폼 주요 버튼 이름 */
    submit: string;
  }>;

const HUB: PageDefType = {
  key: 'hub',
  path: FORTUNE_ROUTES.hub,
  h1: FORTUNE_HUB_SEO.heading,
  seo: FORTUNE_HUB_SEO,
  faq: FORTUNE_HUB_FAQ,
  guide: FORTUNE_HUB_GUIDE,
};
const TODAY: GatedDefType = {
  key: 'today',
  path: FORTUNE_ROUTES.today,
  h1: FORTUNE_TODAY_SEO.heading,
  seo: FORTUNE_TODAY_SEO,
  faq: FORTUNE_TODAY_FAQ,
  guide: FORTUNE_TODAY_GUIDE,
  panelHeading: '생년월일 입력',
  submit: '운세 보기',
};
const TTI: GatedDefType = {
  key: 'tti',
  path: FORTUNE_ROUTES.tti,
  h1: FORTUNE_TTI_SEO.heading,
  seo: FORTUNE_TTI_SEO,
  faq: FORTUNE_TTI_FAQ,
  guide: FORTUNE_TTI_GUIDE,
  panelHeading: '띠 고르기',
  submit: '내 띠 찾기',
};
const STAR: GatedDefType = {
  key: 'star',
  path: FORTUNE_ROUTES.starSign,
  h1: FORTUNE_STAR_SIGN_SEO.heading,
  seo: FORTUNE_STAR_SIGN_SEO,
  faq: FORTUNE_STAR_SIGN_FAQ,
  guide: FORTUNE_STAR_SIGN_GUIDE,
  panelHeading: '별자리 고르기',
  submit: '내 별자리 찾기',
};
const ALL_PAGES: readonly PageDefType[] = [HUB, TODAY, TTI, STAR];
const GATED_PAGES: readonly GatedDefType[] = [TODAY, TTI, STAR];

// ---------- 시계 ----------

/** 2026-11-05 09:00 KST. 날짜가 바뀌어도 결과가 흔들리지 않게 고정한다 */
/** 2025~2027년생을 입력해도 만 14세 이상이 되는 기기 시계 */
const LATER_NOW = '2045-06-01T09:00:00+09:00';
const NOW = '2026-11-05T09:00:00+09:00';

// ---------- 동의·저장소 도우미 ----------

const COOKIE_KEY_SUFFIX = '_cookie_consent_v1';
const CONSENT_KEY_SUFFIX = '_fortune_consent_v1';
/** 앱 스크립트가 없는 같은 출처 문서. 여기서 저장소 값을 심은 뒤 대상 페이지를 연다 */
const SEED_PATH = '/robots.txt';

let sitePrefixPromise: Promise<string> | null = null;

/**
 * 저장 키 접두어(NEXT_PUBLIC_SITE_ENG_NAME)를 .env를 읽지 않고 알아낸다.
 * 쿠키 동의 배너의 "거부"를 누르면 생기는 localStorage 키에서 접미어를 뗀다. 워커마다 한 번만 한다
 */
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

type PrepareOptionsType = Readonly<{
  /** 이용 동의 sessionStorage 값을 design.md 6.3 형식으로 심는다 */
  consent?: boolean;
  /** 심을 동의 값 원문(손상값·버전 불일치 시험용). consent보다 우선한다 */
  rawConsent?: string;
  /** 쿠키 동의 상태. 'declined'면 배너가 뜨지 않는다. null이면 심지 않는다(배너가 뜬다) */
  cookie?: 'declined' | null;
}>;

function storedConsent(version = FORTUNE_CONSENT_VERSION): string {
  return JSON.stringify({
    v: 1,
    version,
    agreedAt: new Date().toISOString(),
  });
}

/** 대상 페이지를 열기 전에 저장소 값을 심는다 */
async function prepare(page: Page, options: PrepareOptionsType = {}) {
  const { consent = false, rawConsent, cookie = 'declined' } = options;
  const prefix = await getPrefixFor(page);
  await page.goto(SEED_PATH);
  await page.evaluate(
    ([consentKey, cookieKey, consentValue, cookieValue]) => {
      sessionStorage.clear();
      localStorage.clear();
      if (consentValue) sessionStorage.setItem(consentKey, consentValue);
      if (cookieValue) localStorage.setItem(cookieKey, cookieValue);
    },
    [
      `${prefix}${CONSENT_KEY_SUFFIX}`,
      `${prefix}${COOKIE_KEY_SUFFIX}`,
      rawConsent ?? (consent ? storedConsent() : ''),
      cookie ?? '',
    ]
  );
}

async function consentKeyName(page: Page): Promise<string> {
  return `${await getPrefixFor(page)}${CONSENT_KEY_SUFFIX}`;
}

async function readConsentRaw(page: Page): Promise<string | null> {
  const key = await consentKeyName(page);
  return page.evaluate((name) => sessionStorage.getItem(name), key);
}

type StorageSnapshotType = Readonly<{
  local: string;
  session: string;
  cookie: string;
}>;

async function storageSnapshot(page: Page): Promise<StorageSnapshotType> {
  return page.evaluate(() => ({
    local: JSON.stringify(
      Object.keys(localStorage)
        .sort()
        .map((key) => [key, localStorage.getItem(key)])
    ),
    session: JSON.stringify(
      Object.keys(sessionStorage)
        .sort()
        .map((key) => [key, sessionStorage.getItem(key)])
    ),
    cookie: document.cookie,
  }));
}

// ---------- 열기·기다리기 ----------

const panelHeading = (page: Page, def: GatedDefType) =>
  page.getByRole('heading', { level: 2, name: def.panelHeading, exact: true });
const consentHeading = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: FORTUNE_CONSENT_TEXTS.title,
    exact: true,
  });
const declinedHeading = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: FORTUNE_DECLINED_TEXTS.title,
    exact: true,
  });
const grantButton = (page: Page) =>
  page.getByRole('button', {
    name: FORTUNE_CONSENT_TEXTS.grantButton,
    exact: true,
  });
const declineButton = (page: Page) =>
  page.getByRole('button', {
    name: FORTUNE_CONSENT_TEXTS.declineButton,
    exact: true,
  });
const consentChecks = (page: Page) =>
  FORTUNE_CONSENT_TEXTS.items.map((item) =>
    page.getByRole('checkbox', { name: item, exact: true })
  );
const resetButton = (page: Page) =>
  page.getByRole('button', {
    name: FORTUNE_CONSENT_RESET_TEXTS.button,
    exact: true,
  });

/**
 * 운영 빌드는 Suspense 스트리밍 조각(div[hidden][id^="S:"])을 inline 스크립트로 교체한다.
 * 교체 전 순간에는 같은 문구가 두 번 잡히므로 JS 켬 검사에서는 교체가 끝날 때까지 기다린다.
 */
async function waitStreamingSettled(page: Page) {
  await page
    .waitForFunction(() => !document.querySelector('div[hidden][id^="S:"]'), {
      timeout: 5000,
    })
    .catch(() => {
      // 5초 안에 교체가 안 끝나면 그대로 진행한다(앱 문제 후보는 JS 끔 검사에서 따로 기록)
    });
}

async function gotoOk(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} 응답`).toBeLessThan(400);
  await waitStreamingSettled(page);
  return res;
}

const JS_OFF_VISIBLE_LIMITATION =
  '알려진 한계(사용자 결정 A안, 2026-11-06): JS를 끄면 루트 loading.tsx의 Suspense 조각이 hidden 상태로 남아 본문이 화면에 보이지 않는다. 서버 HTML 포함 여부는 별도 테스트가 검사한다. QA_RUN_KNOWN_LIMITATIONS=1이면 건너뛰지 않고 실행한다';

/** JS 끔 + 화면 표시 단언을 알려진 한계로 건너뛴다. 한계가 풀리면 이 호출을 지운다 */
function skipJsOffVisibleKnownLimitation() {
  test.info().annotations.push({
    type: 'known-limitation',
    description: JS_OFF_VISIBLE_LIMITATION,
  });
  test.fixme(
    process.env.QA_RUN_KNOWN_LIMITATIONS !== '1',
    JS_OFF_VISIBLE_LIMITATION
  );
}

/** JS를 끈 컨텍스트용. 스트리밍 교체를 기다리지 않는다 */
async function gotoStatic(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} 응답`).toBeLessThan(400);
  return res;
}

type OpenOptionsType = Readonly<{
  consent?: boolean;
  cookie?: 'declined' | null;
  /** 기기 시계. null이면 건드리지 않는다 */
  now?: string | null;
}>;

/** 게이트 적용 페이지를 연다. consent가 true면 기능 영역, false면 이용 동의 화면이 보일 때까지 기다린다 */
async function openGated(
  page: Page,
  def: GatedDefType,
  options: OpenOptionsType = {}
) {
  const { consent = true, cookie = 'declined', now = NOW } = options;
  if (now) await page.clock.setFixedTime(new Date(now));
  await prepare(page, { consent, cookie });
  await gotoOk(page, def.path);
  if (consent) await expect(panelHeading(page, def)).toBeVisible();
  else await expect(consentHeading(page)).toBeVisible();
}

async function checkAllConsent(page: Page) {
  for (const box of consentChecks(page)) await box.check();
}

/** 화면으로 이용 동의를 마친다 */
async function grantViaUi(page: Page) {
  await checkAllConsent(page);
  await grantButton(page).click();
}

// ---------- 입력 도우미 ----------

type BirthType = Readonly<{
  year: number | string;
  month: number | string;
  day: number | string;
  lunar?: boolean;
  leap?: boolean;
}>;

const yearInput = (page: Page) => page.getByLabel('연도', { exact: true });
const monthInput = (page: Page) => page.getByLabel('월', { exact: true });
const dayInput = (page: Page) => page.getByLabel('일', { exact: true });
const leapCheckbox = (page: Page) =>
  page.getByRole('checkbox', { name: '윤달', exact: true });

async function enterBirth(page: Page, birth: BirthType) {
  await page
    .getByRole('radio', { name: birth.lunar ? '음력' : '양력', exact: true })
    .check({ force: true });
  await yearInput(page).fill(String(birth.year));
  await monthInput(page).fill(String(birth.month));
  await dayInput(page).fill(String(birth.day));
  if (birth.leap) await leapCheckbox(page).check();
}

async function submitBirth(page: Page, def: GatedDefType, birth: BirthType) {
  await enterBirth(page, birth);
  await page.getByRole('button', { name: def.submit, exact: true }).click();
}

const hourInput = (page: Page) => page.getByLabel('시', { exact: true });
const minuteInput = (page: Page) => page.getByLabel('분', { exact: true });
const timeHeading = (page: Page) =>
  page.getByRole('heading', { level: 3, name: '태어난 시각', exact: true });

async function submitTime(page: Page, hour: number, minute: number) {
  await hourInput(page).fill(String(hour));
  await minuteInput(page).fill(String(minute));
  await page.getByRole('button', { name: '시각 반영', exact: true }).click();
}

const todayResult = (page: Page) =>
  page.getByRole('region', { name: '오늘의 결과', exact: true });
const ttiFound = (page: Page, name: string) =>
  page.getByText(`입춘 시각을 기준으로 ${name}입니다.`, { exact: true });
const starFound = (page: Page, name: string) =>
  page.getByText(`${name}입니다.`, { exact: true });

const SCORE_PATTERN = /^\d+점$/;

async function readScores(scope: Locator): Promise<number[]> {
  const texts = await scope.getByText(SCORE_PATTERN).allTextContents();
  return texts.map((text) => Number.parseInt(text, 10));
}

/** 목록에서 접힌 항목 제목(h3) 옆 총운 점수 */
async function readListTotal(page: Page, name: string): Promise<number> {
  const heading = page.getByRole('heading', { level: 3, name, exact: true });
  const text = await heading
    .locator('xpath=..')
    .getByText(SCORE_PATTERN)
    .textContent();
  return Number.parseInt(text ?? '', 10);
}

/** 접힌 목록 12개의 총운 점수 */
async function readListTotals(
  page: Page,
  names: readonly string[]
): Promise<number[]> {
  const totals: number[] = [];
  for (const name of names) totals.push(await readListTotal(page, name));
  return totals;
}

const TTI_NAMES = FORTUNE_ZODIAC.map((zodiac) => zodiac.name);
const STAR_NAMES = FORTUNE_STAR_SIGNS.map((sign) => sign.name);

/** 날짜 줄 "2026년 11월 5일 목요일 (한국 시간 기준)" */
const dateLine = (scope: Page | Locator, ymd: string) =>
  scope.getByText(
    new RegExp(
      `^${ymd.replace(/ /g, '\\s')}\\s.요일\\s\\(${FORTUNE_KST_LABEL}\\)$`
    )
  );

/** 기기 시계를 바꾸고 탭이 다시 보인 것처럼 알려 날짜를 갱신시킨다 */
async function advanceClock(page: Page, iso: string) {
  await page.clock.setFixedTime(new Date(iso));
  await page.evaluate(() =>
    document.dispatchEvent(new Event('visibilitychange'))
  );
}

// ---------- 감시 도우미 ----------

function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  const hydration: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text())) {
      hydration.push(message.text());
    }
  });
  return { pageErrors, hydration };
}

function recordConsole(page: Page): string[] {
  const messages: string[] = [];
  page.on('console', (message) => messages.push(message.text()));
  return messages;
}

function recordRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return requests;
}

/** Next 정적 자산 요청은 입력값과 무관하다 */
const isStaticAsset = (url: string) =>
  url.includes('/_next/static/') || url.includes('/_next/image');

/** 요청의 URL(쿼리는 _rsc 값 제외), 본문, 헤더 중 token이 들어간 것을 찾는다 */
async function findRequestLeaks(
  requests: readonly Request[],
  tokens: readonly string[]
): Promise<string[]> {
  const leaks: string[] = [];
  for (const request of requests) {
    if (isStaticAsset(request.url())) continue;
    const url = new URL(request.url());
    url.searchParams.delete('_rsc');
    const headers = await request.allHeaders().catch(() => ({}));
    const haystack = [
      `${url.pathname}${url.search}${url.hash}`,
      request.postData() ?? '',
      JSON.stringify(headers),
    ].join('\n');
    for (const token of tokens) {
      if (haystack.includes(token)) {
        leaks.push(`${request.method()} ${request.url()} -> ${token}`);
      }
    }
  }
  return leaks;
}

// ---------- 상담전화 도우미 (design.md 8.4, 17.2) ----------

type PhoneSpecType = Readonly<{
  name: string;
  number: string;
  href: string;
  desc: string;
}>;

const PHONES: readonly PhoneSpecType[] = CRISIS_PHONES.map((phone) => ({
  name: phone.name,
  number: phone.displayNumber,
  href: phone.href,
  desc: phone.description,
}));

/**
 * 상담전화 표시는 기기별이다.
 * desktop(Desktop Chrome) = PC 상태: tel: 링크는 display:none, 번호는 글자.
 * mobile(Pixel 7) = 터치 상태: 번호가 tel: 링크.
 * page.emulateMedia로 맞추지 않고 두 프로젝트의 실제 값을 쓴다
 */
const isPcProject = (testInfo: TestInfo) => testInfo.project.name === 'desktop';

const MIN_TOUCH = 44;
const phoneList = (page: Page) =>
  page.getByRole('list', { name: CRISIS_RESULT_LINE });
const phoneLinkName = (phone: PhoneSpecType) =>
  `${phone.name} ${phone.number} ${phone.desc}`;

/** 접근성 스냅샷에서 텍스트가 몇 번 나오는지 센다. 링크 안쪽 자식 줄은 뺀다 */
async function countInAccessibleNames(
  scope: Locator,
  text: string
): Promise<number> {
  const snapshot = await scope.ariaSnapshot();
  const kept: string[] = [];
  let linkIndent = -1;
  for (const line of snapshot.split('\n')) {
    const indent = line.length - line.trimStart().length;
    if (linkIndent >= 0 && indent > linkIndent) continue;
    linkIndent = line.trimStart().startsWith('- link') ? indent : -1;
    kept.push(line);
  }
  return kept.join('\n').split(text).length - 1;
}

async function countAccessibleLinks(scope: Locator): Promise<number> {
  const snapshot = await scope.ariaSnapshot();
  return snapshot.split('\n').filter((line) => line.includes('- link')).length;
}

/** tel: 이동을 막고 눌린 href를 기록한다 (통화 앱으로 넘어가지 않게) */
async function interceptTelClicks(page: Page) {
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
}

async function readTelClicks(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { __telClicks: string[] }).__telClicks
  );
}

/** 표시 방식(정적 검사): JS를 켜든 끄든 같다 */
async function expectPhoneDisplay(page: Page, testInfo: TestInfo) {
  const list = phoneList(page);
  await expect(list).toBeVisible();
  const items = list.getByRole('listitem');
  await expect(items).toHaveCount(PHONES.length);
  await expect(page.getByText(CRISIS_RESULT_LINE, { exact: true })).toHaveCount(
    1
  );

  if (isPcProject(testInfo)) {
    // 보이는 링크가 하나도 없다. display:none 링크는 DOM에는 남는다
    await expect(list.getByRole('link')).toHaveCount(0);
    await expect(
      list.locator('a[href^="tel:"]').filter({ visible: true })
    ).toHaveCount(0);
    for (const [index, phone] of PHONES.entries()) {
      const item = items.nth(index);
      await expect(item, phone.number).toBeVisible();
      // innerText는 display:none 요소를 뺀다. 이름·번호·설명이 한 번씩, DOM 순서대로 있다
      await expect(item).toContainText(
        new RegExp(`${phone.name}\\s+${phone.number}\\s+${phone.desc}`),
        { useInnerText: true }
      );
      await expect(
        list.getByText(phone.number, { exact: true }).filter({ visible: true })
      ).toHaveCount(1);
    }
  } else {
    const links = list.getByRole('link');
    await expect(links).toHaveCount(PHONES.length);
    for (const [index, phone] of PHONES.entries()) {
      const link = list.getByRole('link', {
        name: phoneLinkName(phone),
        exact: true,
      });
      await expect(link, phone.number).toBeVisible();
      await expect(link).toHaveAttribute('href', phone.href);
      await expect(links.nth(index)).toHaveAttribute('href', phone.href);
      // 터치 영역 44px 이상
      const box = await link.boundingBox();
      expect(box?.height ?? 0, `${phone.number} 높이`).toBeGreaterThanOrEqual(
        MIN_TOUCH
      );
      expect(box?.width ?? 0, `${phone.number} 너비`).toBeGreaterThanOrEqual(
        MIN_TOUCH
      );
      await expect(
        list.getByText(phone.number, { exact: true }).filter({ visible: true })
      ).toHaveCount(1);
    }
  }

  // DOM의 tel: 링크는 숨은 것까지 정확히 5개
  expect(await page.locator('a[href^="tel:"]').count()).toBe(PHONES.length);

  // 접근성 트리: 각 번호는 한 번만 나오고 링크는 터치에만 있다
  for (const phone of PHONES) {
    expect(
      await countInAccessibleNames(list, phone.number),
      `${phone.number} 접근성 이름 횟수`
    ).toBe(1);
  }
  expect(await countAccessibleLinks(list)).toBe(
    isPcProject(testInfo) ? 0 : PHONES.length
  );
}

/** 동작 검사(JS 켬): PC는 눌러도 tel:이 없고 선택·복사할 수 있으며 포커스를 받지 않는다. 터치는 링크가 눌린다 */
async function expectPhoneBehavior(page: Page, testInfo: TestInfo) {
  const list = phoneList(page);
  await expect(list).toBeVisible();
  await interceptTelClicks(page);

  if (isPcProject(testInfo)) {
    for (const phone of PHONES) {
      const number = list
        .getByText(phone.number, { exact: true })
        .filter({ visible: true });
      await number.click();
      await number.dblclick();
      const selected = await page.evaluate(
        () => window.getSelection()?.toString() ?? ''
      );
      expect(selected, `${phone.number} 선택된 글자`).toContain(phone.number);
    }
    expect(await readTelClicks(page)).toEqual([]);
    // 숨은 링크는 키보드로도 포커스를 받지 못한다
    const focusable = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]'),
        ].filter((anchor) => {
          anchor.focus();
          return document.activeElement === anchor;
        }).length
    );
    expect(focusable, '포커스를 받은 tel: 링크 수').toBe(0);
  } else {
    const clicked: string[] = [];
    for (const phone of PHONES) {
      await list
        .getByRole('link', { name: phoneLinkName(phone), exact: true })
        .click();
      clicked.push(phone.href);
      expect(await readTelClicks(page)).toEqual(clicked);
    }
  }
}

/** Tab 순서: PC는 번호가 탭 정지에 없고, 터치(외부 키보드)는 5곳이 순서대로 있다 */
async function expectPhoneTabOrder(
  page: Page,
  testInfo: TestInfo,
  presses: number
) {
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  const stops: string[] = [];
  for (let i = 0; i < presses; i += 1) {
    await page.keyboard.press('Tab');
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        if (el instanceof HTMLAnchorElement)
          return el.getAttribute('href') ?? '';
        return el?.tagName ?? '';
      })
    );
  }
  // 쪽 안에서 Tab이 한 바퀴 돈 뒤의 반복은 세지 않는다
  const telStops: string[] = [];
  for (const stop of stops) {
    if (!stop.startsWith('tel:')) continue;
    if (telStops.includes(stop)) break;
    telStops.push(stop);
  }
  if (isPcProject(testInfo)) {
    expect(telStops, 'PC 탭 순서의 tel: 정지').toEqual([]);
  } else {
    expect(telStops, '터치 탭 순서의 tel: 정지').toEqual(
      PHONES.map((phone) => phone.href)
    );
  }
}

// ---------- 문구 도우미 ----------

/** 페이지 본문에서 금지 표현을 찾는다(허용 문장은 먼저 지운다) */
function findForbidden(text: string): string[] {
  let target = text;
  for (const allowed of FORTUNE_COPY_ALLOWED_SENTENCES) {
    target = target.split(allowed).join('');
  }
  const hits: string[] = [];
  for (const term of [
    ...FORTUNE_FORBIDDEN_TERMS,
    ...FORTUNE_SAJU_REDUNDANT_TERMS,
  ]) {
    if (target.includes(term)) hits.push(term);
  }
  for (const pattern of FORTUNE_FORBIDDEN_PATTERNS) {
    if (pattern.test(target)) hits.push(String(pattern));
  }
  return hits;
}

/** 화면에 보이는 글자(display:none 제외, 블록마다 줄바꿈) */
const visibleText = (locator: Locator) =>
  locator.evaluate(
    // biome-ignore lint/performance/useDomNodeTextContent: 보이는 글자와 블록별 줄바꿈이 필요하다
    (el) => (el as HTMLElement).innerText
  );
const mainText = (page: Page) => visibleText(page.locator('main'));

// =====================================================================
// 공통 검사 (네 페이지)
// =====================================================================

for (const def of ALL_PAGES) {
  test.describe(`공통 ${def.path}`, () => {
    test('응답 400 미만, pageerror·하이드레이션 오류 없음, h1 하나', async ({
      page,
    }) => {
      const { pageErrors, hydration } = watchErrors(page);
      await prepare(page, { consent: false });
      await gotoOk(page, def.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(def.h1);
      expect(pageErrors).toEqual([]);
      expect(hydration).toEqual([]);
    });

    test('AC-61, AC-63: title·description·canonical·OG가 있고 noindex가 없으며 이미지에 alt가 있다', async ({
      page,
    }) => {
      await prepare(page, { consent: false });
      await gotoOk(page, def.path);
      expect(await page.title()).toContain(def.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        def.seo.description
      );
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(new URL(canonical ?? '').pathname).toBe(def.path);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:description"]')).toHaveCount(
        1
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      const robots = await page
        .locator('meta[name="robots"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('content')));
      for (const content of robots) {
        expect(content ?? '').not.toContain('noindex');
      }
      // 메타데이터에 "사주"가 없다(방식 A 화면, AC-10)
      expect(def.seo.title + def.seo.description).not.toContain('사주');
      const imgsWithoutAlt = await page
        .locator('img')
        .evaluateAll(
          (els) => els.filter((el) => !el.getAttribute('alt')?.trim()).length
        );
      expect(imgsWithoutAlt, 'alt 없는 이미지').toBe(0);
    });
  });
}

// =====================================================================
// 검색 노출: JSON-LD, sitemap, 메뉴 (AC-61, AC-64, AC-65, AC-80)
// =====================================================================

async function readJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raws = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return raws.flatMap((raw) => {
    const value = JSON.parse(raw) as unknown;
    return (Array.isArray(value) ? value : [value]) as Record<
      string,
      unknown
    >[];
  });
}

type CrumbType = { name: string; item: string };

for (const def of ALL_PAGES) {
  test(`AC-64: ${def.path} BreadcrumbList와 FAQPage JSON-LD가 있고 FAQ가 화면과 같으며 리뷰·평점이 없다`, async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await gotoOk(page, def.path);
    const blocks = await readJsonLd(page);

    const crumbs = blocks.find((block) => block['@type'] === 'BreadcrumbList');
    const list = (crumbs?.itemListElement ?? []) as CrumbType[];
    // 허브는 홈 > 운세 2단계, 기능 페이지는 홈 > 운세 > 페이지 3단계. "운세" 단계 URL은 /fortune
    expect(list).toHaveLength(def.key === 'hub' ? 2 : 3);
    expect(new URL(list[1].item).pathname).toBe('/fortune');
    expect(list[1].name).toBe('운세');
    if (def.key !== 'hub') {
      expect(new URL(list[2].item).pathname).toBe(def.path);
    }

    const faqBlock = blocks.find((block) => block['@type'] === 'FAQPage');
    const entities = (faqBlock?.mainEntity ?? []) as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;
    expect(entities.map((entity) => entity.name)).toEqual(
      def.faq.map((item) => item.question)
    );
    expect(entities.map((entity) => entity.acceptedAnswer.text)).toEqual(
      def.faq.map((item) => item.answer)
    );
    // 화면의 FAQ와 같다
    for (const item of def.faq) {
      await expect(
        page.getByRole('heading', { level: 3, name: item.question })
      ).toBeVisible();
      await expect(page.getByText(item.answer, { exact: true })).toBeVisible();
    }

    const json = JSON.stringify(blocks);
    expect(json).not.toContain('AggregateRating');
    expect(json).not.toContain('"Review"');
    expect(json).not.toContain('ratingValue');

    if (def.key === 'hub') {
      const itemList = blocks.find((block) => block['@type'] === 'ItemList');
      const elements = (itemList?.itemListElement ?? []) as Array<{
        url: string;
      }>;
      expect(elements.map((element) => new URL(element.url).pathname)).toEqual([
        FORTUNE_ROUTES.today,
        FORTUNE_ROUTES.tti,
        FORTUNE_ROUTES.starSign,
      ]);
    }
  });
}

test('AC-65, AC-80: sitemap.xml에 운세 네 페이지가 있고 /fortune/saju는 없다', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBeLessThan(400);
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname
  );
  for (const route of [
    FORTUNE_ROUTES.hub,
    FORTUNE_ROUTES.today,
    FORTUNE_ROUTES.tti,
    FORTUNE_ROUTES.starSign,
  ]) {
    expect(paths, route).toContain(route);
  }
  expect(paths.filter((path) => path.includes('saju'))).toEqual([]);
});

test.describe('AC-61, AC-80: 메뉴', () => {
  test('운세 그룹 링크는 /fortune으로 가고 "준비 중" 배지가 없으며 사주 링크가 없다', async ({
    page,
  }, testInfo) => {
    await prepare(page, { consent: false });
    await gotoOk(page, FORTUNE_ROUTES.hub);

    if (isPcProject(testInfo)) {
      const header = page.locator('header');
      const group = header.getByRole('link', { name: '운세', exact: true });
      await expect(group).toHaveCount(1);
      await expect(group).toHaveAttribute('href', FORTUNE_ROUTES.hub);
      await expect(group.getByText('준비 중')).toHaveCount(0);
      // 드롭다운을 열어 항목 링크를 본다
      await group.hover();
      for (const [label, href] of [
        ['오늘의 운세', FORTUNE_ROUTES.today],
        ['띠별 운세', FORTUNE_ROUTES.tti],
        ['별자리 운세', FORTUNE_ROUTES.starSign],
      ] as const) {
        await expect(
          header.getByRole('link', { name: label }).first()
        ).toHaveAttribute('href', href);
      }
      expect(await header.locator('a[href*="saju"]').count()).toBe(0);
    } else {
      await page.getByRole('button', { name: '메뉴 열기' }).click();
      const dialog = page.getByRole('dialog');
      const group = dialog.getByRole('link', { name: '운세', exact: true });
      await expect(group).toHaveAttribute('href', FORTUNE_ROUTES.hub);
      await expect(group.getByText('준비 중')).toHaveCount(0);
      for (const [label, href] of [
        ['오늘의 운세', FORTUNE_ROUTES.today],
        ['띠별 운세', FORTUNE_ROUTES.tti],
        ['별자리 운세', FORTUNE_ROUTES.starSign],
      ] as const) {
        await expect(
          dialog.getByRole('link', { name: label, exact: true })
        ).toHaveAttribute('href', href);
      }
      expect(await dialog.locator('a[href*="saju"]').count()).toBe(0);
    }
  });

  test('홈의 서비스 목록에서 운세는 /fortune으로 가고 "준비 중" 배지가 없다', async ({
    page,
  }) => {
    await page.route('**/api/**', (route) => route.abort());
    await prepare(page, { consent: false });
    await gotoOk(page, '/');
    const row = page
      .getByRole('list')
      .getByRole('link')
      .filter({ has: page.getByText('운세', { exact: true }) });
    await expect(row.first()).toHaveAttribute('href', FORTUNE_ROUTES.hub);
    await expect(row.first().getByText('준비 중')).toHaveCount(0);
  });
});

// =====================================================================
// 허브 (AC-79, AC-83, AC-33, AC-80)
// =====================================================================

test.describe('허브 /fortune', () => {
  test('AC-79, AC-80: h1 "운세"와 세 링크가 보이고 동의 화면·입력칸·선택·점수·문구가 DOM에 없으며 사주 링크가 없다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await gotoOk(page, HUB.path);
    await expect(
      page.getByRole('heading', { level: 1, name: '운세' })
    ).toBeVisible();
    for (const [label, href] of [
      ['오늘의 운세', FORTUNE_ROUTES.today],
      ['띠별 운세', FORTUNE_ROUTES.tti],
      ['별자리 운세', FORTUNE_ROUTES.starSign],
    ] as const) {
      const link = page
        .getByRole('main')
        .getByRole('link', { name: new RegExp(`^${label}`) });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toBeVisible();
    }
    await expect(consentHeading(page)).toHaveCount(0);
    await expect(declinedHeading(page)).toHaveCount(0);
    await expect(page.locator('main input')).toHaveCount(0);
    await expect(page.locator('main textarea')).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.locator('main').getByRole('button')).toHaveCount(0);
    await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '총운' })).toHaveCount(0);
    await expect(resetButton(page)).toHaveCount(0);
    expect(await page.locator('a[href*="saju"]').count()).toBe(0);
  });

  test('AC-33: 상시 면책이 h1 바로 아래에 처음부터 보이고 하단 면책(책임 관련 고지)은 목록·설명 뒤에 있다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await gotoOk(page, HUB.path);
    const h1 = page.getByRole('heading', { level: 1 });
    const disclaimer = page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true });
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toBeInViewport();
    const h1Box = await h1.boundingBox();
    const disclaimerBox = await disclaimer.boundingBox();
    expect(h1Box && disclaimerBox).toBeTruthy();
    expect(disclaimerBox?.y ?? 0).toBeGreaterThan(h1Box?.y ?? 0);
    expect(
      (disclaimerBox?.y ?? 0) - ((h1Box?.y ?? 0) + (h1Box?.height ?? 0))
    ).toBeLessThan(300);

    const bottom = page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, {
      exact: true,
    });
    await expect(bottom).toBeVisible();
    expect(FORTUNE_RESULT_DISCLAIMER_TEXT).toContain(
      '판단과 선택은 이용자 본인'
    );
    // 목록 뒤에 있다
    const listBox = await page
      .getByRole('heading', { level: 2, name: '운세 고르기' })
      .boundingBox();
    const bottomBox = await bottom.boundingBox();
    expect(bottomBox?.y ?? 0).toBeGreaterThan(listBox?.y ?? Infinity);
  });

  test('AC-83: 허브 방문은 이용 동의 상태를 만들거나 지우지 않는다', async ({
    page,
  }) => {
    // 동의가 없던 탭: 허브를 열어도 운세 키가 생기지 않는다
    await prepare(page, { consent: false });
    const before = await storageSnapshot(page);
    await gotoOk(page, HUB.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const afterNone = await storageSnapshot(page);
    expect(afterNone.session).toBe(before.session);
    expect(await readConsentRaw(page)).toBeNull();

    // 동의가 있던 탭: 허브를 열어도 값이 그대로다
    await prepare(page, { consent: true });
    await gotoOk(page, TODAY.path);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    const granted = await readConsentRaw(page);
    expect(granted).not.toBeNull();
    await gotoOk(page, HUB.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await readConsentRaw(page)).toBe(granted);
  });
});

// =====================================================================
// 오늘의 운세 (AC-1 ~ AC-11)
// =====================================================================

test.describe('오늘의 운세 /fortune/today', () => {
  test('AC-1, AC-34, AC-35: 동의 뒤 양력 생년월일을 입력하면 총운·항목별·행운·조언·주의가 나온다', async ({
    page,
  }, testInfo) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
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
    expect(await readScores(result)).toHaveLength(5);
    // 총운 점수 옆에 한 줄 요약이 있다(총운 항목 안에 문단 2개)
    await expect(dateLine(result, '2026년 11월 5일')).toBeVisible();
    for (const label of ['행운의 색', '행운의 방향', '오늘의 행운 숫자']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    // 결과 하단 고지와 상담전화
    await expect(
      page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
    await expectPhoneDisplay(page, testInfo);
    // 로또 고지가 숫자와 같은 화면에서 접힘 없이 보인다
    await expect(
      page.getByText(FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_SCORE_NOTICE, { exact: true })
    ).toBeVisible();
  });

  test('AC-2: 같은 생년월일은 새로고침해도 새 브라우저 컨텍스트에서도 같은 날 같은 결과다', async ({
    page,
    browser,
  }, testInfo) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    const first = await visibleText(todayResult(page));

    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    expect(await visibleText(todayResult(page))).toBe(first);

    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
    });
    try {
      const other = await context.newPage();
      await openGated(other, TODAY);
      await submitBirth(other, TODAY, { year: 1990, month: 6, day: 15 });
      await expect(todayResult(other)).toBeVisible();
      expect(await visibleText(todayResult(other))).toBe(first);
    } finally {
      await context.close();
    }
  });

  test.describe('AC-3: 한국 시간 기준 날짜', () => {
    test.use({ timezoneId: 'America/Los_Angeles' });

    test('기기 시간대가 달라도 기준 날짜는 한국 날짜이고 자정이 지나면 바뀐다', async ({
      page,
    }) => {
      // 2026-03-01 23:59:30 KST (LA는 2026-03-01 06:59)
      await openGated(page, TODAY, { now: '2026-03-01T23:59:30+09:00' });
      await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
      await expect(dateLine(todayResult(page), '2026년 3월 1일')).toBeVisible();
      // "한국 시간 기준" 안내가 날짜 줄에 붙어 있다
      await expect(
        todayResult(page).getByText(FORTUNE_KST_LABEL)
      ).toBeVisible();

      // 2026-03-02 00:00:30 KST (LA는 여전히 2026-03-01 07:00)
      await advanceClock(page, '2026-03-02T00:00:30+09:00');
      await expect(dateLine(todayResult(page), '2026년 3월 2일')).toBeVisible();
    });
  });

  test('AC-4, AC-5, AC-6: 연속 7일 총운이 모두 같지 않고 점수는 30~95 정수이며 구간 문구·행운 숫자 범위가 맞다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: '2026-11-01T09:00:00+09:00' });
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();

    const totals: number[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const day = 1 + offset;
      if (offset > 0) {
        await advanceClock(page, `2026-11-0${day}T09:00:00+09:00`);
        await expect(
          dateLine(todayResult(page), `2026년 11월 ${day}일`)
        ).toBeVisible();
      }
      const result = todayResult(page);
      const scores = await readScores(result);
      expect(scores).toHaveLength(5);
      for (const score of scores) {
        expect(Number.isInteger(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(30);
        expect(score).toBeLessThanOrEqual(95);
      }
      totals.push(scores[0]);

      // 점수 구간에 맞는 문구: 항목 문구가 그 구간 풀의 세 변형 중 하나다
      const keys = ['total', 'money', 'love', 'work', 'health'] as const;
      for (const [index, key] of keys.entries()) {
        const band = getFortuneBand(scores[index]);
        let found = 0;
        for (const variant of FORTUNE_PERSONAL_POOL[key][band]) {
          found += await result.getByText(variant, { exact: true }).count();
        }
        expect(found, `${day}일 ${key} 구간 ${band} 문구`).toBe(1);
      }
      // 한 줄 요약·조언·주의는 총운 구간의 공통 풀에서 나온다
      const totalBand = getFortuneBand(scores[0]);
      for (const part of ['summary', 'advice', 'caution'] as const) {
        let found = 0;
        for (const variant of FORTUNE_COMMON_POOL[part][totalBand]) {
          found += await result.getByText(variant, { exact: true }).count();
        }
        expect(found, `${day}일 ${part} 구간 ${totalBand} 문구`).toBe(1);
      }

      // 행운 숫자: 1~2개, 1~10
      const numbers = await page
        .getByText('오늘의 행운 숫자', { exact: true })
        .locator('xpath=following-sibling::dd[1]/span')
        .allTextContents();
      expect(numbers.length).toBeGreaterThanOrEqual(1);
      expect(numbers.length).toBeLessThanOrEqual(2);
      for (const text of numbers) {
        expect(text).toMatch(/^\d+$/);
        const value = Number.parseInt(text, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    }
    expect(
      new Set(totals).size,
      `7일 총운 ${totals.join(',')}`
    ).toBeGreaterThan(1);
  });

  test('AC-1: 결과를 본 뒤 잘못된 날짜를 넣으면 오류 안내만 보이고 이전 결과는 남지 않는다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    await submitBirth(page, TODAY, { year: 2029, month: 1, day: 1 });
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);
  });

  test('AC-7: 양력 입력과 같은 날의 음력 입력은 같은 결과이고 확인 줄이 환산 날짜를 보여 준다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: LATER_NOW });
    await submitBirth(page, TODAY, {
      year: 2025,
      month: 1,
      day: 1,
      lunar: true,
    });
    await expect(
      page.getByText('음력 2025년 1월 1일 → 양력 2025년 1월 29일', {
        exact: true,
      })
    ).toBeVisible();
    const lunarResult = await visibleText(todayResult(page));

    await submitBirth(page, TODAY, { year: 2025, month: 1, day: 29 });
    await expect(page.getByText(/^음력 .* → 양력/)).toHaveCount(0);
    await expect(todayResult(page)).toBeVisible();
    expect(await visibleText(todayResult(page))).toBe(lunarResult);

    await submitBirth(page, TODAY, {
      year: 2000,
      month: 1,
      day: 1,
      lunar: true,
    });
    await expect(
      page.getByText('음력 2000년 1월 1일 → 양력 2000년 2월 5일', {
        exact: true,
      })
    ).toBeVisible();
  });

  test('AC-8: 윤달이 없는 달은 윤달 선택이 비활성이고 윤달이 있는 달은 안내가 보이며 없는 날은 오류다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await page
      .getByRole('radio', { name: '음력', exact: true })
      .check({ force: true });
    await yearInput(page).fill('2023');
    await monthInput(page).fill('3');
    await expect(leapCheckbox(page)).toBeDisabled();
    await expect(page.getByText(/에는 윤달이 있습니다/)).toHaveCount(0);

    await monthInput(page).fill('2');
    await expect(leapCheckbox(page)).toBeEnabled();
    await expect(
      page.getByText(
        '음력 2023년 2월에는 윤달이 있습니다. 윤달에 태어나셨다면 윤달을 선택해 주시기 바랍니다.',
        { exact: true }
      )
    ).toBeVisible();
    await leapCheckbox(page).check();
    await expect(leapCheckbox(page)).toBeChecked();
    // 윤달이 없는 달로 바꾸면 선택이 풀리고 비활성이 된다
    await monthInput(page).fill('3');
    await expect(leapCheckbox(page)).toBeDisabled();
    await expect(leapCheckbox(page)).not.toBeChecked();

    // 29일까지인 달의 30일은 오류이고 결과가 나오지 않는다
    let found: { year: number; month: number } | null = null;
    for (let year = 2001; year <= 2025 && !found; year += 1) {
      for (let month = 1; month <= 12 && !found; month += 1) {
        if (getLunarMonthLength(year, month, false) === 29) {
          found = { year, month };
        }
      }
    }
    expect(found, '29일까지인 음력 달').not.toBeNull();
    await enterBirth(page, {
      year: found?.year ?? 2001,
      month: found?.month ?? 1,
      day: 30,
      lunar: true,
    });
    await page.getByRole('button', { name: TODAY.submit, exact: true }).click();
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['lunar-invalid-day'], {
        exact: true,
      })
    ).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);
  });

  test('AC-9: 비어 있음·없는 날짜·미래·1920년 이전·2029년 이후는 안내만 나오고 결과가 없다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    const errorOf = (key: keyof typeof FORTUNE_BIRTH_ERROR_MESSAGES) =>
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES[key], { exact: true });
    const submit = () =>
      page.getByRole('button', { name: TODAY.submit, exact: true }).click();

    // 빈 칸: 연·월·일 중 하나라도 비면 결과가 없다
    for (const empty of ['year', 'month', 'day'] as const) {
      await page.reload();
      await expect(panelHeading(page, TODAY)).toBeVisible();
      if (empty !== 'year') await yearInput(page).fill('1990');
      if (empty !== 'month') await monthInput(page).fill('6');
      if (empty !== 'day') await dayInput(page).fill('15');
      await submit();
      await expect(errorOf('empty')).toBeVisible();
      await expect(todayResult(page)).toHaveCount(0);
    }

    const cases: ReadonlyArray<
      Readonly<{
        key: keyof typeof FORTUNE_BIRTH_ERROR_MESSAGES;
        year: number;
        month: number;
        day: number;
      }>
    > = [
      { key: 'invalid-date', year: 2000, month: 2, day: 30 },
      { key: 'future', year: 2026, month: 12, day: 31 },
      { key: 'before-min', year: 1919, month: 12, day: 31 },
      { key: 'after-max', year: 2029, month: 1, day: 1 },
    ];
    for (const item of cases) {
      await enterBirth(page, item);
      await submit();
      await expect(errorOf(item.key), item.key).toBeVisible();
      await expect(todayResult(page)).toHaveCount(0);
    }
    // 범위 밖 안내에는 지원 범위가 들어 있다
    for (const key of ['before-min', 'after-max'] as const) {
      expect(FORTUNE_BIRTH_ERROR_MESSAGES[key]).toContain('1920년 1월 1일');
      expect(FORTUNE_BIRTH_ERROR_MESSAGES[key]).toContain('2028년 12월 31일');
    }
  });

  test('AC-9: 음력으로 입력해 양력으로 환산하면 2029년 이후인 날짜도 지원 범위 안내가 나온다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: '2029-01-02T09:00:00+09:00' });
    await submitBirth(page, TODAY, {
      year: 2028,
      month: 12,
      day: 1,
      lunar: true,
    });
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);
  });

  test('AC-10: 방식 A 안내가 결과 근처에 있고 "사주"는 허용 문장에만 있으며 금지 표현이 없다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    await expect(
      todayResult(page).getByText(FORTUNE_METHOD_A_NOTICE, { exact: true })
    ).toBeVisible();
    expect(FORTUNE_METHOD_A_NOTICE).toContain(
      '사주(태어난 연·월·일·시로 세우는 네 기둥)'
    );

    const text = await mainText(page);
    for (const banned of ['사주 분석', '사주 풀이', '정통', '정확한 맞춤']) {
      expect(text, banned).not.toContain(banned);
    }
    // "사주"가 든 줄은 모두 화이트리스트 문장을 포함한다
    const sajuLines = text.split('\n').filter((line) => line.includes('사주'));
    expect(sajuLines.length).toBeGreaterThan(0);
    for (const line of sajuLines) {
      expect(
        FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A.some((allowed) =>
          line.includes(allowed)
        ),
        `허용되지 않은 "사주" 사용: ${line}`
      ).toBe(true);
    }
    // 결과 제목에 "사주"가 없다
    await expect(page.getByRole('heading', { name: /사주/ })).toHaveCount(0);
  });

  test('AC-11: 결과 영역에 띠별 운세·별자리 운세 링크가 있다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    await expect(
      page.getByRole('link', { name: '띠별 운세', exact: true })
    ).toHaveAttribute('href', FORTUNE_ROUTES.tti);
    await expect(
      page.getByRole('link', { name: '별자리 운세', exact: true })
    ).toHaveAttribute('href', FORTUNE_ROUTES.starSign);
  });

  test('AC-35, AC-36: 행운 숫자는 "오늘의 행운 숫자"로 표시되고 로또 고지가 함께 보이며 생성기 링크는 쿼리 없이 이동한다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    const birthDays = [3, 9, 14, 18, 22, 27];
    for (const day of birthDays) {
      await submitBirth(page, TODAY, { year: 1985, month: 3, day });
      await expect(todayResult(page)).toBeVisible();
      const numbers = await page
        .getByText('오늘의 행운 숫자', { exact: true })
        .locator('xpath=following-sibling::dd[1]/span')
        .allTextContents();
      expect(numbers.length).toBeGreaterThanOrEqual(1);
      expect(numbers.length).toBeLessThanOrEqual(2);
      for (const text of numbers) {
        expect(Number.parseInt(text, 10)).toBeLessThanOrEqual(10);
      }
    }
    const main = await mainText(page);
    expect(main).not.toContain('당첨 번호');
    expect(main).not.toContain('오늘의 로또 번호');
    await expect(
      page.getByText(FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
    const link = page.getByRole('link', {
      name: FORTUNE_LOTTO_LINK_LABEL,
      exact: true,
    });
    await expect(link).toHaveAttribute('href', FORTUNE_LOTTO_LINK_HREF);
    // 번호를 채워 넣는 버튼·입력이 없다
    await expect(
      page.getByRole('button', { name: /번호.*(넣|채)/ })
    ).toHaveCount(0);
    // 로또 화면의 API 호출은 막고 이동만 본다
    await page.route('**/api/**', (route) => route.abort());
    await link.click();
    await expect(page).toHaveURL(/\/lotto\/generator$/);
  });
});

// =====================================================================
// 띠별 운세 (AC-12 ~ AC-19)
// =====================================================================

test.describe('띠별 운세 /fortune/tti', () => {
  test('AC-12, AC-13: 동의 뒤 12띠 모두의 오늘 운세가 있고 하나를 골라 펼칠 수 있다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    const list = page.getByRole('region', { name: '12띠 오늘의 운세' });
    await expect(list).toBeVisible();
    for (const name of TTI_NAMES) {
      const total = await readListTotal(page, name);
      expect(total, name).toBeGreaterThanOrEqual(30);
      expect(total, name).toBeLessThanOrEqual(95);
    }
    await expect(
      page.getByText(
        '띠를 고르면 그 띠의 조언과 행운 요소까지 펼쳐 볼 수 있습니다.',
        {
          exact: true,
        }
      )
    ).toBeVisible();

    // 생년월일 없이 칩만 눌러 펼친다
    const chip = page.getByRole('button', { name: '호랑이띠', exact: true });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    const expanded = page.getByRole('region', { name: /^호랑이띠/ });
    await expect(expanded).toBeVisible();
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
        expanded.getByRole('heading', { level: 4, name, exact: true })
      ).toBeVisible();
    }
    await expect(
      expanded.getByText(FORTUNE_METHOD_A_TTI_NOTICE, { exact: true })
    ).toBeVisible();
    await expect(page.getByLabel('연도', { exact: true })).toHaveValue('');
  });

  test('AC-14, AC-17, AC-19: 1990-06-15는 말띠, 1992-05-10은 원숭이띠이고 입춘 기준·기준 차이 안내가 있다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await submitBirth(page, TTI, { year: 1990, month: 6, day: 15 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    await submitBirth(page, TTI, { year: 1992, month: 5, day: 10 });
    await expect(ttiFound(page, '원숭이띠')).toBeVisible();
    await expect(
      page.getByText(FORTUNE_CALC_BASIS_TTI, { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_DIFFERENT_BASIS_NOTICE, { exact: true })
    ).toBeVisible();
  });

  test('AC-15: 2025-02-01은 용띠이고 "설날 기준으로는 뱀띠" 안내가 함께 보인다', async ({
    page,
  }) => {
    await openGated(page, TTI, { now: LATER_NOW });
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 1 });
    await expect(ttiFound(page, '용띠')).toBeVisible();
    await expect(
      page.getByText(FORTUNE_SEOLLAL_TEMPLATE.replace('{띠}', '뱀띠'), {
        exact: true,
      })
    ).toBeVisible();
  });

  test('AC-16: 입춘이 드는 날(2025-02-03)은 시각을 묻고 23:09는 용띠, 23:30은 뱀띠, 시각 모름은 두 후보다', async ({
    page,
  }) => {
    await openGated(page, TTI, { now: LATER_NOW });
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(
      page.getByText(/2025년 입춘은 2월 3일 23:10\(한국 시간\)입니다\./)
    ).toBeVisible();
    await submitTime(page, 23, 9);
    await expect(ttiFound(page, '용띠')).toBeVisible();

    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await submitTime(page, 23, 30);
    await expect(ttiFound(page, '뱀띠')).toBeVisible();

    // 시각 모름: 두 후보가 함께 보이고 선택할 수 있다
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await page.getByRole('button', { name: '시각 모름', exact: true }).click();
    const dragon = page.getByRole('button', {
      name: '용띠로 보기',
      exact: true,
    });
    const snake = page.getByRole('button', {
      name: '뱀띠로 보기',
      exact: true,
    });
    await expect(dragon).toBeVisible();
    await expect(snake).toBeVisible();
    await expect(dragon).toHaveAttribute('aria-pressed', 'false');
    await expect(snake).toHaveAttribute('aria-pressed', 'false');
    await snake.click();
    await expect(ttiFound(page, '뱀띠')).toBeVisible();
    await dragon.click();
    await expect(ttiFound(page, '용띠')).toBeVisible();

    // 2025-02-04는 시각 입력칸 없이 뱀띠
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 4 });
    await expect(ttiFound(page, '뱀띠')).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(hourInput(page)).toHaveCount(0);
  });

  test('AC-18: 같은 날 같은 띠의 운세는 다른 컨텍스트에서도 같고 날짜가 바뀌면 바뀔 수 있다', async ({
    page,
    browser,
  }, testInfo) => {
    await openGated(page, TTI);
    const first = await readListTotals(page, TTI_NAMES);
    await page.getByRole('button', { name: '쥐띠', exact: true }).click();
    const firstExpanded = await visibleText(
      page.getByRole('region', { name: /^쥐띠/ })
    );

    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
    });
    try {
      const other = await context.newPage();
      await openGated(other, TTI);
      expect(await readListTotals(other, TTI_NAMES)).toEqual(first);
      await other.getByRole('button', { name: '쥐띠', exact: true }).click();
      expect(
        await visibleText(other.getByRole('region', { name: /^쥐띠/ }))
      ).toBe(firstExpanded);
    } finally {
      await context.close();
    }

    await advanceClock(page, '2026-11-06T09:00:00+09:00');
    await expect(
      page.getByText('2026년 11월 6일', { exact: false }).first()
    ).toBeVisible();
    // 하루 뒤에는 12개 가운데 적어도 하나가 바뀐다
    await expect
      .poll(async () => {
        const names = TTI_NAMES.filter((name) => name !== '쥐띠');
        const next = await readListTotals(page, names);
        const prev = TTI_NAMES.map((name, i) => [name, first[i]] as const)
          .filter(([name]) => name !== '쥐띠')
          .map(([, score]) => score);
        return next.some((score, i) => score !== prev[i]);
      })
      .toBe(true);
  });
});

// =====================================================================
// 별자리 운세 (AC-20 ~ AC-26)
// =====================================================================

test.describe('별자리 운세 /fortune/star-sign', () => {
  test('AC-20, AC-21, AC-26: 동의 뒤 12별자리 모두의 오늘 운세가 있고 하나를 골라 펼칠 수 있으며 기간 안내가 있다', async ({
    page,
  }) => {
    await openGated(page, STAR);
    await expect(
      page.getByRole('region', { name: '12별자리 오늘의 운세' })
    ).toBeVisible();
    for (const name of STAR_NAMES) {
      const total = await readListTotal(page, name);
      expect(total, name).toBeGreaterThanOrEqual(30);
      expect(total, name).toBeLessThanOrEqual(95);
    }
    await expect(
      page.getByText(
        '날짜는 일반적인 기간이며 해마다 하루 정도 달라질 수 있습니다.',
        {
          exact: true,
        }
      )
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_CALC_BASIS_STAR_SIGN, { exact: true }).first() // 같은 문장이 목록 위 안내와 계산 기준 목록에 모두 있다
    ).toBeVisible();

    const chip = page.getByRole('button', { name: /^황소자리/ });
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    const expanded = page.getByRole('region', { name: /^황소자리/ });
    await expect(expanded).toBeVisible();
    await expect(
      expanded.getByText(FORTUNE_METHOD_A_STAR_SIGN_NOTICE, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE, { exact: true })
    ).toBeVisible();
    await expect(yearInput(page)).toHaveValue('');
  });

  test('AC-22: 1990-05-15는 황소자리, 1990-08-10은 사자자리, 2026-03-10은 물고기자리이고 시각 입력칸이 없다', async ({
    page,
  }) => {
    await openGated(page, STAR, { now: LATER_NOW });
    for (const [birth, name] of [
      [{ year: 1990, month: 5, day: 15 }, '황소자리'],
      [{ year: 1990, month: 8, day: 10 }, '사자자리'],
      [{ year: 2026, month: 3, day: 10 }, '물고기자리'],
    ] as const) {
      await submitBirth(page, STAR, birth);
      await expect(starFound(page, name)).toBeVisible();
      await expect(timeHeading(page)).toHaveCount(0);
      await expect(hourInput(page)).toHaveCount(0);
    }
  });

  test('AC-23: 2026-03-20은 시각을 묻고 23:00은 물고기자리, 23:59는 양자리, 시각 모름은 두 후보다', async ({
    page,
  }) => {
    await openGated(page, STAR, { now: LATER_NOW });
    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(
      page.getByText(
        /2026년 양자리 시작 시각은 3월 20일 23:46\(한국 시간\)입니다\./
      )
    ).toBeVisible();
    await submitTime(page, 23, 0);
    await expect(starFound(page, '물고기자리')).toBeVisible();

    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await submitTime(page, 23, 59);
    await expect(starFound(page, '양자리')).toBeVisible();

    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await page.getByRole('button', { name: '시각 모름', exact: true }).click();
    await expect(
      page.getByRole('button', { name: '물고기자리로 보기', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '양자리로 보기', exact: true })
    ).toBeVisible();
  });

  test('AC-24: 2027-03-21은 04:00 물고기자리·06:00 양자리이고 2027-03-20은 시각 입력칸 없이 물고기자리다', async ({
    page,
  }) => {
    await openGated(page, STAR, { now: LATER_NOW });
    await submitBirth(page, STAR, { year: 2027, month: 3, day: 21 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(
      page.getByText(
        /2027년 양자리 시작 시각은 3월 21일 05:25\(한국 시간\)입니다\./
      )
    ).toBeVisible();
    await submitTime(page, 4, 0);
    await expect(starFound(page, '물고기자리')).toBeVisible();

    await submitBirth(page, STAR, { year: 2027, month: 3, day: 21 });
    await submitTime(page, 6, 0);
    await expect(starFound(page, '양자리')).toBeVisible();

    await submitBirth(page, STAR, { year: 2027, month: 3, day: 20 });
    await expect(starFound(page, '물고기자리')).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
  });

  test('AC-25: 음력으로 입력한 경계일은 양력 변환 뒤 같은 방식으로 판정된다', async ({
    page,
  }) => {
    await openGated(page, STAR, { now: LATER_NOW });
    // 음력 2026-02-02 = 양력 2026-03-20
    await submitBirth(page, STAR, {
      year: 2026,
      month: 2,
      day: 2,
      lunar: true,
    });
    await expect(
      page.getByText('음력 2026년 2월 2일 → 양력 2026년 3월 20일', {
        exact: true,
      })
    ).toBeVisible();
    await expect(timeHeading(page)).toBeVisible();
    await submitTime(page, 23, 59);
    await expect(starFound(page, '양자리')).toBeVisible();
  });
});

// =====================================================================
// 개인정보·저장 (AC-27 ~ AC-32, AC-47)
// =====================================================================

test.describe('개인정보·저장', () => {
  test('AC-27, AC-28: 입력과 결과 확인 중 요청·URL·콘솔에 생년월일·시각이 없고 POST가 없다', async ({
    page,
  }) => {
    const requests = recordRequests(page);
    const messages = recordConsole(page);
    await openGated(page, TODAY, { now: LATER_NOW });
    await submitBirth(page, TODAY, { year: 1987, month: 7, day: 23 });
    await expect(todayResult(page)).toBeVisible();
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
    await submitBirth(page, TODAY, {
      year: 1987,
      month: 7,
      day: 23,
      lunar: true,
    });
    await expect(todayResult(page)).toBeVisible();

    await gotoOk(page, TTI.path);
    await expect(panelHeading(page, TTI)).toBeVisible();
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await submitTime(page, 23, 9);
    await expect(ttiFound(page, '용띠')).toBeVisible();

    await gotoOk(page, STAR.path);
    await expect(panelHeading(page, STAR)).toBeVisible();
    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await expect(timeHeading(page)).toBeVisible();
    await submitTime(page, 14, 37);
    await expect(starFound(page, '물고기자리')).toBeVisible();

    const leaks = await findRequestLeaks(requests, [
      '1987',
      '19870723',
      '07-23',
      '2025-02-03',
      '20250203',
      '2026-03-20',
      '20260320',
      '23:09',
      '2309',
      '14:37',
      '1437',
    ]);
    expect(leaks).toEqual([]);
    // 입력·결과 중에 일어난 요청은 GET뿐이다
    const nonGet = requests.filter(
      (request) => request.method() !== 'GET' && !isStaticAsset(request.url())
    );
    expect(
      nonGet.map((request) => `${request.method()} ${request.url()}`)
    ).toEqual([]);
    for (const message of messages) {
      expect(message).not.toContain('1987');
      expect(message).not.toContain('23:09');
    }
  });

  test('AC-28: 폼에 action·method가 없고 Enter로 제출해도 URL이 바뀌지 않는다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    const form = page.locator('form').first();
    expect(await form.getAttribute('action')).toBeNull();
    expect(await form.getAttribute('method')).toBeNull();
    await expect(yearInput(page)).toHaveAttribute('autocomplete', 'off');
    const before = page.url();
    await yearInput(page).fill('1990');
    await monthInput(page).fill('6');
    await dayInput(page).fill('15');
    await dayInput(page).press('Enter');
    await expect(todayResult(page)).toBeVisible();
    expect(page.url()).toBe(before);
  });

  test('AC-29, AC-78: 결과를 본 뒤 저장소에는 동의 키 하나만 있고 값은 v·version·agreedAt뿐이며 입력값이 없다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    const before = await storageSnapshot(page);
    expect(before.session).toBe('[]');
    await grantViaUi(page);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 1987, month: 7, day: 23 });
    await expect(todayResult(page)).toBeVisible();

    const after = await storageSnapshot(page);
    // localStorage·쿠키에는 새로 생긴 운세 키가 없다
    expect(after.local).toBe(before.local);
    expect(after.cookie).not.toContain('fortune');
    // sessionStorage에는 이용 동의 키 하나뿐이다
    const session = JSON.parse(after.session) as Array<[string, string]>;
    expect(session).toHaveLength(1);
    expect(session[0][0]).toBe(await consentKeyName(page));
    const value = JSON.parse(session[0][1]) as Record<string, unknown>;
    expect(Object.keys(value).sort()).toEqual(['agreedAt', 'v', 'version']);
    expect(value.v).toBe(1);
    expect(value.version).toBe(FORTUNE_CONSENT_VERSION);
    expect(String(value.agreedAt)).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
    );
    const all = after.local + after.session + after.cookie;
    for (const token of ['1987', '0723', '07-23', '만 13', '연령']) {
      expect(all, token).not.toContain(token);
    }
  });

  test('AC-30: 결과를 본 뒤 새로고침하거나 다른 페이지에 다녀오면 입력칸이 비어 있다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(yearInput(page)).toHaveValue('');
    await expect(monthInput(page)).toHaveValue('');
    await expect(dayInput(page)).toHaveValue('');
    await expect(todayResult(page)).toHaveCount(0);

    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    await gotoOk(page, HUB.path);
    await gotoOk(page, TODAY.path);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(yearInput(page)).toHaveValue('');
    await expect(todayResult(page)).toHaveCount(0);
  });

  for (const def of GATED_PAGES) {
    test(`AC-31: ${def.path} 입력칸 근처에 비전송·연령·책임 고지가 있고 이름·연락처 칸이 없다`, async ({
      page,
    }) => {
      await openGated(page, def);
      await expect(
        page.getByText(FORTUNE_PRIVACY_INPUT_NOTICE, { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText(FORTUNE_AGE_INPUT_NOTICE, { exact: true })
      ).toBeVisible();
      expect(FORTUNE_PRIVACY_INPUT_NOTICE).toContain(
        '서버로 전송되거나 저장되지 않습니다'
      );
      expect(FORTUNE_AGE_INPUT_NOTICE).toContain('만 14세 이상');
      expect(FORTUNE_AGE_INPUT_NOTICE).toContain('이용자 본인에게 있습니다');
      // 텍스트 입력은 연·월·일 세 칸뿐이다
      const labels = await page
        .locator('main input[type="text"]')
        .evaluateAll((els) =>
          els.map((el) => (el as HTMLInputElement).labels?.[0]?.textContent)
        );
      expect(labels).toEqual(['연도', '월', '일']);
      await expect(
        page.locator(
          'main input[type="email"], main input[type="tel"], main textarea'
        )
      ).toHaveCount(0);
    });
  }

  test('AC-32, AC-78: 쿠키 동의를 거절해도 이용 동의 뒤 기능이 정상이고 두 상태가 서로 영향을 주지 않는다', async ({
    page,
  }) => {
    // 쿠키 배너가 뜬 채로 연다
    await openGated(page, TODAY, { consent: false, cookie: null });
    const banner = page.getByRole('region', { name: '쿠키 동의 배너' });
    await expect(banner).toBeVisible();
    await expect(consentHeading(page)).toBeVisible();
    const cookieKey = `${await getPrefixFor(page)}${COOKIE_KEY_SUFFIX}`;
    const cookieValue = () =>
      page.evaluate((name) => localStorage.getItem(name), cookieKey);
    expect(await cookieValue()).toBeNull();

    // 배너가 떠 있어도 이용 동의 화면의 모든 컨트롤을 누를 수 있다(가려 막히지 않는다)
    await checkAllConsent(page);
    await grantButton(page).click();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    // 이용 동의는 쿠키 동의 상태를 바꾸지 않는다
    expect(await cookieValue()).toBeNull();
    await expect(banner).toBeVisible();

    // 쿠키를 거절해도 이용 동의 상태는 그대로이고 기능이 동작한다
    const consentBefore = await readConsentRaw(page);
    await page.getByRole('button', { name: '쿠키 거부' }).click();
    await expect(banner).toHaveCount(0);
    expect(await cookieValue()).toBe('declined');
    expect(await readConsentRaw(page)).toBe(consentBefore);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();

    // 쿠키 거절 상태에서도 새 탭은 이용 동의를 다시 묻는다(쿠키 상태가 동의 화면을 없애지 않는다)
    const tab = await page.context().newPage();
    await gotoOk(tab, TODAY.path);
    await expect(consentHeading(tab)).toBeVisible();
    await tab.close();
  });

  test('AC-32: 쿠키 거절 상태에서 띠·별자리도 정상 동작한다', async ({
    page,
  }) => {
    await openGated(page, TTI, { consent: false, cookie: null });
    await page.getByRole('button', { name: '쿠키 거부' }).click();
    await grantViaUi(page);
    await expect(panelHeading(page, TTI)).toBeVisible();
    await page.getByRole('button', { name: '닭띠', exact: true }).click();
    await expect(page.getByRole('region', { name: /^닭띠/ })).toBeVisible();
  });
});

// =====================================================================
// 연령 확인 (AC-42 ~ AC-47)
// =====================================================================

const ageBlockedHeading = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: FORTUNE_AGE_BLOCKED_TEXTS.title,
    exact: true,
  });

test.describe('연령 확인', () => {
  test('AC-42, AC-45: 만 13세(2012-11-06)는 연령 안내만 나오고 결과·계속 버튼·입력값 표시가 없다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 6 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '총운' })).toHaveCount(0);
    await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
    const section = page.getByRole('region', {
      name: FORTUNE_AGE_BLOCKED_TEXTS.title,
    });
    await expect(
      section.getByText(FORTUNE_AGE_BLOCKED_TEXTS.body, { exact: true })
    ).toBeVisible();
    expect(FORTUNE_AGE_BLOCKED_TEXTS.body).toContain('만 14세 미만');
    expect(FORTUNE_AGE_BLOCKED_TEXTS.body).toContain(
      '만 14세 이상 이용자를 대상'
    );
    expect(FORTUNE_AGE_BLOCKED_TEXTS.body).toContain(
      '이용자 본인에게 있습니다'
    );
    // 계속 이용할 장치(버튼)가 없고 홈 링크만 있다
    await expect(section.getByRole('button')).toHaveCount(0);
    await expect(
      section.getByRole('link', {
        name: FORTUNE_AGE_BLOCKED_TEXTS.homeLinkLabel,
      })
    ).toHaveAttribute('href', '/');
    // 입력한 생년월일을 다시 보이지 않는다
    expect(await visibleText(section)).not.toMatch(/2012|11월 6일/);
  });

  test('AC-43: 만 14세 생일 당일(2012-11-05)은 결과가 나오고 하단 고지가 보인다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 5 });
    await expect(todayResult(page)).toBeVisible();
    await expect(ageBlockedHeading(page)).toHaveCount(0);
    await expect(
      page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true })
    ).toBeVisible();
  });

  test('AC-43: 한국 시간 2026-11-04 23:59에는 2012-11-05가 연령 안내, 11-05 00:00 이후에는 결과다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: '2026-11-04T23:59:00+09:00' });
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 5 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);

    await page.clock.setFixedTime(new Date('2026-11-05T00:00:30+09:00'));
    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 5 });
    await expect(todayResult(page)).toBeVisible();
  });

  test('AC-44: 음력으로 입력한 생년월일도 양력 환산 뒤 같은 기준으로 판정한다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    // 2012-11-05(양력)로 환산되는 음력 날짜를 찾아 입력한다
    let target: { month: number; day: number } | null = null;
    for (let month = 8; month <= 10 && !target; month += 1) {
      for (let day = 1; day <= 29 && !target; day += 1) {
        const resolved = convertLunarToSolar(2012, month, day, false);
        if (
          resolved.ok &&
          resolved.solar.year === 2012 &&
          resolved.solar.month === 11 &&
          resolved.solar.day === 5
        ) {
          target = { month, day };
        }
      }
    }
    expect(target, '양력 2012-11-05에 해당하는 음력 날짜').not.toBeNull();
    const lunar = {
      year: 2012,
      month: target?.month ?? 0,
      day: target?.day ?? 0,
      lunar: true,
    };
    await submitBirth(page, TODAY, lunar);
    await expect(page.getByText(/→ 양력 2012년 11월 5일$/)).toBeVisible();
    await expect(todayResult(page)).toBeVisible();
    // 하루 전날이 아니라 다음 날(양력 11-06)에 해당하는 음력은 연령 안내다
    const next = convertLunarToSolar(
      2012,
      target?.month ?? 0,
      (target?.day ?? 0) + 1,
      false
    );
    expect(next.ok).toBe(true);
    await submitBirth(page, TODAY, {
      ...lunar,
      day: (target?.day ?? 0) + 1,
    });
    await expect(ageBlockedHeading(page)).toBeVisible();
  });

  test('AC-44: 2월 29일생은 평년에 3월 1일부터 한 살이 늘어난 것으로 판정한다', async ({
    page,
  }) => {
    // 2026년은 평년. 2012-02-29생은 2026-02-28까지 만 13세, 2026-03-01부터 만 14세
    await openGated(page, TODAY, { now: '2026-02-28T12:00:00+09:00' });
    await submitBirth(page, TODAY, { year: 2012, month: 2, day: 29 });
    await expect(ageBlockedHeading(page)).toBeVisible();

    await page.clock.setFixedTime(new Date('2026-03-01T12:00:00+09:00'));
    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 2012, month: 2, day: 29 });
    await expect(todayResult(page)).toBeVisible();
  });

  test('AC-46: 띠·별자리 찾기도 같은 방식으로 판정하고 시각 입력칸은 연령 통과 뒤에만 나온다', async ({
    page,
  }) => {
    // 입춘이 드는 날(2013-02-04)에 태어난 만 13세
    await openGated(page, TTI);
    await submitBirth(page, TTI, { year: 2013, month: 2, day: 4 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(hourInput(page)).toHaveCount(0);
    await expect(ttiFound(page, '뱀띠')).toHaveCount(0);

    // 춘분 무렵(2013-03-20)에 태어난 만 13세
    await openGated(page, STAR);
    await submitBirth(page, STAR, { year: 2013, month: 3, day: 20 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(timeHeading(page)).toHaveCount(0);
    await expect(hourInput(page)).toHaveCount(0);
  });

  test('AC-46: 12띠·12별자리를 직접 고르는 경로는 생년월일 입력이 없다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await page.getByRole('button', { name: '토끼띠', exact: true }).click();
    await expect(page.getByRole('region', { name: /^토끼띠/ })).toBeVisible();
    await expect(ageBlockedHeading(page)).toHaveCount(0);
  });

  test('AC-47: 연령 판정 중 요청·저장소·URL에 흔적이 없고 새로고침하면 입력칸이 비어 있다', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    const before = await storageSnapshot(page);
    const requests = recordRequests(page);
    const messages = recordConsole(page);
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 6 });
    await expect(ageBlockedHeading(page)).toBeVisible();

    expect(
      await findRequestLeaks(requests, ['2012', '20121106', '11-06'])
    ).toEqual([]);
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
    const after = await storageSnapshot(page);
    expect(after).toEqual(before);
    for (const message of messages) {
      expect(message).not.toContain('2012');
      expect(message).not.toContain('연령');
    }

    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(ageBlockedHeading(page)).toHaveCount(0);
    await expect(yearInput(page)).toHaveValue('');
    await expect(monthInput(page)).toHaveValue('');
    await expect(dayInput(page)).toHaveValue('');
  });

  test('AC-76: 이용 동의의 "만 14세 이상"을 고른 뒤에도 만 14세 미만 생년월일은 결과가 나오지 않는다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    await grantViaUi(page);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 2012, month: 11, day: 6 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(todayResult(page)).toHaveCount(0);
  });
});

// =====================================================================
// 이용 동의 게이트 (AC-67 ~ AC-78)
// =====================================================================

test.describe('이용 동의 게이트', () => {
  for (const def of GATED_PAGES) {
    test(`AC-67, AC-72(DOM): ${def.path} 동의 전에는 동의 화면이 나오고 입력칸·선택·점수·문구가 DOM에 없다`, async ({
      page,
    }) => {
      await openGated(page, def, { consent: false });
      // h1, 상시 면책, 설명 콘텐츠는 보인다
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(def.h1);
      await expect(
        page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 2, name: def.guide[0].heading })
      ).toBeVisible();
      // 기능 영역은 없다
      await expect(panelHeading(page, def)).toHaveCount(0);
      await expect(page.locator('main input[type="text"]')).toHaveCount(0);
      await expect(page.getByRole('radio')).toHaveCount(0);
      await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
      await expect(page.getByRole('heading', { name: '총운' })).toHaveCount(0);
      await expect(resetButton(page)).toHaveCount(0);
      for (const name of [...TTI_NAMES, ...STAR_NAMES]) {
        await expect(
          page.getByRole('button', { name: new RegExp(`^${name}`) })
        ).toHaveCount(0);
      }
    });

    test(`AC-68, AC-69, AC-70: ${def.path} 확인 항목 3개가 모두 해제로 시작하고 모두 고르기 전에는 진행되지 않으며 모두 고르면 기능이 열린다`, async ({
      page,
    }) => {
      await openGated(page, def, { consent: false });
      const boxes = consentChecks(page);
      expect(boxes).toHaveLength(3);
      for (const box of boxes) {
        await expect(box).toBeVisible();
        await expect(box).not.toBeChecked();
      }

      // 모두 해제 / 한 개 / 두 개: 진행하지 않는다
      await expect(grantButton(page)).toHaveAttribute('aria-disabled', 'true');
      for (const count of [0, 1, 2]) {
        if (count > 0) await boxes[count - 1].check();
        await grantButton(page).click({ force: true });
        await expect(consentHeading(page)).toBeVisible();
        await expect(panelHeading(page, def)).toHaveCount(0);
        await expect(
          page.getByText(FORTUNE_CONSENT_TEXTS.blockedNotice, { exact: true })
        ).toBeVisible();
        expect(await readConsentRaw(page)).toBeNull();
      }

      // 모두 고르면 진행된다
      await boxes[2].check();
      await expect(grantButton(page)).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
      await expect(
        page.getByText(FORTUNE_CONSENT_TEXTS.blockedNotice, { exact: true })
      ).toHaveCount(0);
      await grantButton(page).click();
      await expect(panelHeading(page, def)).toBeVisible();
      await expect(consentHeading(page)).toHaveCount(0);
      expect(await readConsentRaw(page)).not.toBeNull();
    });

    test(`AC-71: ${def.path} "동의하지 않음"은 이용 불가 안내를 보이고 돌아가기로 동의 화면이 다시 나온다`, async ({
      page,
    }) => {
      await openGated(page, def, { consent: false });
      await declineButton(page).click();
      await expect(declinedHeading(page)).toBeVisible();
      await expect(
        page.getByText(FORTUNE_DECLINED_TEXTS.body, { exact: true })
      ).toBeVisible();
      await expect(panelHeading(page, def)).toHaveCount(0);
      await expect(page.locator('main input[type="text"]')).toHaveCount(0);
      await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
      // "동의하지 않음"은 저장되지 않는다
      expect(await readConsentRaw(page)).toBeNull();
      await page
        .getByRole('button', {
          name: FORTUNE_DECLINED_TEXTS.backButton,
          exact: true,
        })
        .click();
      await expect(consentHeading(page)).toBeVisible();
      for (const box of consentChecks(page)) {
        await expect(box).not.toBeChecked();
      }
    });
  }

  test('AC-68: 확인 항목 세 개의 문장이 승인 문구와 같다', async ({ page }) => {
    await openGated(page, TODAY, { consent: false });
    expect(FORTUNE_CONSENT_TEXTS.items[0]).toContain('만 14세 이상');
    expect(FORTUNE_CONSENT_TEXTS.items[1]).toContain(
      '책임은 이용자 본인에게 있음'
    );
    expect(FORTUNE_CONSENT_TEXTS.items[2]).toContain(
      '서버로 전송되거나 저장되지 않고'
    );
    await expect(
      page.getByText(FORTUNE_CONSENT_TEXTS.storageNotice, { exact: true })
    ).toBeVisible();
  });

  test('AC-72: 동의 전에는 입력·결과 요청이 없고 동의 여부가 요청으로 전송되지 않는다', async ({
    page,
  }) => {
    const requests = recordRequests(page);
    await openGated(page, TODAY, { consent: false });
    await grantViaUi(page);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(declineButton(page)).toHaveCount(0);
    const nonGet = requests.filter(
      (request) => request.method() !== 'GET' && !isStaticAsset(request.url())
    );
    expect(
      nonGet.map((request) => `${request.method()} ${request.url()}`)
    ).toEqual([]);
    const leaks = await findRequestLeaks(requests, [
      'consent',
      '동의',
      '%EB%8F%99%EC%9D%98',
    ]);
    // 페이지 자체 경로(/fortune/...)와 정적 자산은 제외하고 동의 관련 요청만 본다
    expect(leaks.filter((leak) => !leak.includes('_fortune_'))).toEqual([]);
  });

  test('AC-73: 이용 동의·이용 불가 화면에 금지 표현이 없다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    const consentText = await mainText(page);
    expect(findForbidden(consentText)).toEqual([]);
    await declineButton(page).click();
    await expect(declinedHeading(page)).toBeVisible();
    expect(findForbidden(await mainText(page))).toEqual([]);
    // 동의가 법적 책임을 모두 없애 준다는 뜻으로 읽히는 표현이 없다
    for (const text of [consentText, await mainText(page)]) {
      expect(text).not.toMatch(/책임(이|을)? (면제|없)/);
    }
  });

  test('AC-74: 같은 탭에서는 새로고침·다른 운세 페이지 이동에도 다시 묻지 않고 새 탭에서는 묻는다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    await grantViaUi(page);
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(consentHeading(page)).toHaveCount(0);

    // 클라이언트 이동(링크)과 주소 이동 모두 다시 묻지 않는다
    await gotoOk(page, TTI.path);
    await expect(panelHeading(page, TTI)).toBeVisible();
    await gotoOk(page, STAR.path);
    await expect(panelHeading(page, STAR)).toBeVisible();

    // 새 탭(같은 컨텍스트)은 sessionStorage가 비어 있어 다시 묻는다
    const tab = await page.context().newPage();
    await gotoOk(tab, TODAY.path);
    await expect(consentHeading(tab)).toBeVisible();
    await tab.close();
  });

  test('AC-74: 새 브라우저 컨텍스트에서는 묻는다', async ({
    page,
    browser,
  }, testInfo) => {
    await openGated(page, TODAY);
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
    });
    try {
      const other = await context.newPage();
      await gotoOk(other, TODAY.path);
      await expect(consentHeading(other)).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('AC-74: 동의 문구 버전이 다르거나 값이 손상됐거나 필드가 더 있으면 다시 묻고 저장값을 지운다', async ({
    page,
  }) => {
    const iso = new Date().toISOString();
    const cases: ReadonlyArray<Readonly<{ label: string; raw: string }>> = [
      { label: '버전 불일치', raw: storedConsent('1999-01-01') },
      { label: 'JSON 손상', raw: '{not json' },
      {
        label: 'v 불일치',
        raw: JSON.stringify({
          v: 2,
          version: FORTUNE_CONSENT_VERSION,
          agreedAt: iso,
        }),
      },
      {
        label: '필드 초과',
        raw: JSON.stringify({
          v: 1,
          version: FORTUNE_CONSENT_VERSION,
          agreedAt: iso,
          extra: 1,
        }),
      },
      {
        label: '시각 형식 오류',
        raw: JSON.stringify({
          v: 1,
          version: FORTUNE_CONSENT_VERSION,
          agreedAt: 'yesterday',
        }),
      },
    ];
    for (const item of cases) {
      await prepare(page, { rawConsent: item.raw });
      await gotoOk(page, TODAY.path);
      await expect(consentHeading(page), item.label).toBeVisible();
      expect(await readConsentRaw(page), item.label).toBeNull();
    }
    // 올바른 값이면 묻지 않는다
    await prepare(page, { consent: true });
    await gotoOk(page, TODAY.path);
    await expect(panelHeading(page, TODAY)).toBeVisible();
  });

  test('AC-75: 한 번 동의하면 세 페이지에서 다시 묻지 않고 "동의 다시 설정"이 동의 화면으로 되돌린다(허브에는 없다)', async ({
    page,
  }) => {
    await openGated(page, TODAY);
    await expect(resetButton(page)).toBeVisible();
    await expect(
      page.getByText(FORTUNE_CONSENT_RESET_TEXTS.description, { exact: true })
    ).toBeVisible();
    // 링크로 다른 운세 페이지에 가도 다시 묻지 않는다
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await page.getByRole('link', { name: '띠별 운세', exact: true }).click();
    await expect(page).toHaveURL(/\/fortune\/tti$/);
    await expect(panelHeading(page, TTI)).toBeVisible();
    await expect(resetButton(page)).toBeVisible();

    await gotoOk(page, HUB.path);
    await expect(resetButton(page)).toHaveCount(0);

    await gotoOk(page, STAR.path);
    await expect(panelHeading(page, STAR)).toBeVisible();
    await resetButton(page).click();
    await expect(consentHeading(page)).toBeVisible();
    expect(await readConsentRaw(page)).toBeNull();
    await expect(resetButton(page)).toHaveCount(0);
    // 되돌린 뒤 새로고침해도 묻는다
    await page.reload();
    await expect(consentHeading(page)).toBeVisible();
  });

  test('AC-77: 키보드만으로 선택·진행·돌아가기를 할 수 있고 선택 상태와 진행 불가 이유가 전달된다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    const boxes = consentChecks(page);

    // 진행 불가 이유는 버튼의 설명으로 연결되어 있다
    const describedBy =
      await grantButton(page).getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
      FORTUNE_CONSENT_TEXTS.blockedNotice
    );

    // 모두 고르기 전에 Enter: 진행하지 않고 첫 미선택 항목으로 포커스가 간다
    await grantButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(consentHeading(page)).toBeVisible();
    await expect(boxes[0]).toBeFocused();

    // Space로 선택하고 Tab으로 다음 항목, 마지막에 버튼
    await page.keyboard.press('Space');
    await expect(boxes[0]).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(boxes[1]).toBeFocused();
    await page.keyboard.press('Space');
    await expect(boxes[1]).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(boxes[2]).toBeFocused();
    await page.keyboard.press('Space');
    await expect(boxes[2]).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(grantButton(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(declineButton(page)).toBeFocused();

    // 동의하지 않음 → 이용 불가 제목으로 포커스 → Tab → 돌아가기 → 동의 제목으로 포커스
    await page.keyboard.press('Enter');
    await expect(declinedHeading(page)).toBeVisible();
    await expect(declinedHeading(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: FORTUNE_DECLINED_TEXTS.backButton })
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(consentHeading(page)).toBeFocused();

    // 다시 모두 고르고 키보드로 진행한다
    for (const box of consentChecks(page)) {
      await box.focus();
      await page.keyboard.press('Space');
    }
    await grantButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await expect(panelHeading(page, TODAY)).toBeFocused();
  });

  test('AC-78: 쿠키 배너와 이용 동의 화면이 함께 떠도 서로를 가리지 않고 진행·돌아가기를 누를 수 있다', async ({
    page,
  }) => {
    await openGated(page, STAR, { consent: false, cookie: null });
    await expect(
      page.getByRole('region', { name: '쿠키 동의 배너' })
    ).toBeVisible();
    // 배너가 떠 있는 채 동의 화면의 모든 컨트롤을 누른다(가려지면 Playwright 클릭이 실패한다)
    await declineButton(page).click();
    await expect(declinedHeading(page)).toBeVisible();
    await page
      .getByRole('button', { name: FORTUNE_DECLINED_TEXTS.backButton })
      .click();
    await expect(consentHeading(page)).toBeVisible();
    await checkAllConsent(page);
    await grantButton(page).click();
    await expect(panelHeading(page, STAR)).toBeVisible();
    // 이용 동의는 쿠키 배너를 닫지 않는다
    await expect(
      page.getByRole('region', { name: '쿠키 동의 배너' })
    ).toBeVisible();
    // 배너가 떠 있어도 기능 영역을 쓸 수 있다
    await page.getByRole('button', { name: /^전갈자리/ }).click();
    await expect(page.getByRole('region', { name: /^전갈자리/ })).toBeVisible();
  });
});

// =====================================================================
// 링크 (AC-81, AC-82)
// =====================================================================

for (const def of [TTI, STAR]) {
  test.describe(`오늘의 운세 링크 ${def.path}`, () => {
    test('AC-81: 동의 전에도 "생년월일로 보는 오늘의 운세" 링크가 하나 있고 href는 쿼리 없는 /fortune/today다', async ({
      page,
    }) => {
      await openGated(page, def, { consent: false });
      const link = page.getByRole('link', {
        name: FORTUNE_TODAY_LINK_LABEL,
        exact: true,
      });
      await expect(link).toHaveCount(1);
      await expect(link).toBeVisible();
      expect(await link.getAttribute('href')).toBe(FORTUNE_ROUTES.today);
    });

    test('AC-82: 링크를 누르면 /fortune/today로 가고 동의한 탭은 입력 폼이, 동의 전은 동의 화면이 나온다', async ({
      page,
    }) => {
      await openGated(page, def, { consent: false });
      await page
        .getByRole('link', { name: FORTUNE_TODAY_LINK_LABEL, exact: true })
        .click();
      await expect(page).toHaveURL(/\/fortune\/today$/);
      expect(new URL(page.url()).search).toBe('');
      await expect(consentHeading(page)).toBeVisible();

      await openGated(page, def, { consent: true });
      await page
        .getByRole('link', { name: FORTUNE_TODAY_LINK_LABEL, exact: true })
        .click();
      await expect(page).toHaveURL(/\/fortune\/today$/);
      await expect(panelHeading(page, TODAY)).toBeVisible();
      await expect(consentHeading(page)).toHaveCount(0);
    });
  });
}

// =====================================================================
// 지원 연도와 윤달 (AC-84, AC-85)
// =====================================================================

test.describe('AC-84: 기기 시계가 2029-01-02(KST)여도 정상이다', () => {
  const FUTURE = '2029-01-02T09:00:00+09:00';

  test('오늘의 운세: 동의 후 개인 일운이 정상이고 연도 입력 상한은 2028이다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: FUTURE });
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    const result = todayResult(page);
    await expect(result).toBeVisible();
    await expect(dateLine(result, '2029년 1월 2일')).toBeVisible();
    const scores = await readScores(result);
    expect(scores).toHaveLength(5);
    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(30);
      expect(score).toBeLessThanOrEqual(95);
    }

    // 2029년은 지원 범위 밖 안내, 2028년은 범위 안(만 0세라 연령 안내)
    await submitBirth(page, TODAY, { year: 2029, month: 1, day: 1 });
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toBeVisible();
    await page.reload();
    await expect(panelHeading(page, TODAY)).toBeVisible();
    await submitBirth(page, TODAY, { year: 2028, month: 12, day: 31 });
    await expect(ageBlockedHeading(page)).toBeVisible();
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toHaveCount(0);
  });

  test('띠별 운세: 12띠 목록이 정상이고 1920~2028년 출생을 정상 판정한다', async ({
    page,
  }) => {
    await openGated(page, TTI, { now: FUTURE });
    const totals = await readListTotals(page, TTI_NAMES);
    expect(totals).toHaveLength(12);
    await expect(
      page.getByText('2029년 1월 2일', { exact: false }).first()
    ).toBeVisible();
    await submitBirth(page, TTI, { year: 1990, month: 6, day: 15 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    // 1920-01-01은 입춘 전이라 1919년(양띠), 설날(1920-02-20) 기준도 양띠라 병기가 없다
    await submitBirth(page, TTI, { year: 1920, month: 1, day: 1 });
    await expect(ttiFound(page, '양띠')).toBeVisible();
    await expect(
      page.getByText(FORTUNE_SEOLLAL_TEMPLATE.replace('{띠}', '양띠'), {
        exact: true,
      })
    ).toHaveCount(0);
    await submitBirth(page, TTI, { year: 2029, month: 1, day: 1 });
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toBeVisible();
    // 2028년 출생은 범위 안이다(만 0세라 연령 안내). 연령 안내 뒤에는 입력 칸이 사라져 새로 연다
    await page.reload();
    await expect(panelHeading(page, TTI)).toBeVisible();
    await submitBirth(page, TTI, { year: 2028, month: 12, day: 31 });
    await expect(ageBlockedHeading(page)).toBeVisible();
  });

  test('별자리 운세: 12별자리 목록이 정상이고 1920~2028년 출생을 정상 판정한다', async ({
    page,
  }) => {
    await openGated(page, STAR, { now: FUTURE });
    const totals = await readListTotals(page, STAR_NAMES);
    expect(totals).toHaveLength(12);
    await expect(
      page.getByText('2029년 1월 2일', { exact: false }).first()
    ).toBeVisible();
    await submitBirth(page, STAR, { year: 1990, month: 5, day: 15 });
    await expect(starFound(page, '황소자리')).toBeVisible();
    await submitBirth(page, STAR, { year: 1920, month: 1, day: 1 });
    await expect(starFound(page, '염소자리')).toBeVisible();
    await submitBirth(page, STAR, { year: 2029, month: 1, day: 1 });
    await expect(
      page.getByText(FORTUNE_BIRTH_ERROR_MESSAGES['after-max'], { exact: true })
    ).toBeVisible();
  });

  test('계산 기준에 지원 출생 범위(1920년 1월 1일 ~ 2028년 12월 31일) 안내가 있다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { consent: false });
    await expect(
      page.getByText(FORTUNE_SUPPORTED_RANGE_NOTICE, { exact: true })
    ).toBeVisible();
    expect(FORTUNE_SUPPORTED_RANGE_NOTICE).toContain('1920년 1월 1일');
    expect(FORTUNE_SUPPORTED_RANGE_NOTICE).toContain('2028년 12월 31일');
  });
});

test.describe('AC-85: 윤달 구분 변환', () => {
  test('음력 2023년 2월은 평달과 윤달이 다른 양력으로 변환되고 확인 줄에 "(윤달)"이 표시된다', async ({
    page,
  }) => {
    await openGated(page, TODAY, { now: LATER_NOW });
    await submitBirth(page, TODAY, {
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
    await expect(page.getByText('(윤달)')).toHaveCount(0);

    // 윤달 체크가 활성이고 안내가 보인다
    await expect(leapCheckbox(page)).toBeEnabled();
    await leapCheckbox(page).check();
    await page.getByRole('button', { name: TODAY.submit, exact: true }).click();
    await expect(
      page.getByText('음력 2023년 2월 25일(윤달) → 양력 2023년 4월 15일', {
        exact: true,
      })
    ).toBeVisible();

    // 윤달이 없는 2023년 3월에서는 윤달 체크가 비활성이다
    await monthInput(page).fill('3');
    await expect(leapCheckbox(page)).toBeDisabled();
    await expect(leapCheckbox(page)).not.toBeChecked();
  });

  test('띠·별자리 찾기도 윤달 체크가 같은 규칙이다', async ({ page }) => {
    await openGated(page, TTI);
    await page
      .getByRole('radio', { name: '음력', exact: true })
      .check({ force: true });
    await yearInput(page).fill('2023');
    await monthInput(page).fill('2');
    await expect(leapCheckbox(page)).toBeEnabled();
    await monthInput(page).fill('4');
    await expect(leapCheckbox(page)).toBeDisabled();
  });
});

// =====================================================================
// 상담전화 (AC-34, AC-86): 네 페이지, JS 켬·끔, 프로젝트별
// =====================================================================

test.describe('AC-86: 상담전화 기기별 표시 (JS 켬)', () => {
  for (const def of ALL_PAGES) {
    test(`${def.path}: 표시·접근성·동작`, async ({ page }, testInfo) => {
      const { pageErrors, hydration } = watchErrors(page);
      await prepare(page, { consent: false });
      await gotoOk(page, def.path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectPhoneDisplay(page, testInfo);
      await expectPhoneBehavior(page, testInfo);
      expect(pageErrors).toEqual([]);
      expect(hydration).toEqual([]);
    });
  }

  test('허브: Tab 순서에 PC는 번호가 없고 터치는 상담전화 5곳이 순서대로 있다', async ({
    page,
  }, testInfo) => {
    await prepare(page, { consent: false });
    await gotoOk(page, HUB.path);
    await expect(phoneList(page)).toBeVisible();
    await expectPhoneTabOrder(page, testInfo, 60);
  });

  test('(hover: hover) and (pointer: fine)이 Desktop Chrome에서 참, Pixel 7에서 거짓이다', async ({
    page,
  }, testInfo) => {
    await prepare(page, { consent: false });
    const matches = await page.evaluate(
      () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
    expect(matches, `${testInfo.project.name} 미디어 쿼리`).toBe(
      isPcProject(testInfo)
    );
  });
});

// =====================================================================
// 흐름 (AC-66)
// =====================================================================

test('AC-66: 허브에서 이용 동의 → 입력 → 결과까지 끊김 없이 된다', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(NOW));
  await prepare(page, { consent: false, cookie: null });
  await gotoOk(page, HUB.path);
  await page.getByRole('button', { name: '쿠키 거부' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: /^오늘의 운세/ })
    .click();
  await expect(page).toHaveURL(/\/fortune\/today$/);
  await expect(consentHeading(page)).toBeVisible();
  await grantViaUi(page);
  await expect(panelHeading(page, TODAY)).toBeVisible();
  await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
  await expect(todayResult(page)).toBeVisible();
  await expect(todayResult(page)).toBeInViewport();
});

// =====================================================================
// 화면 문구 점검 (AC-37 화면분, AC-48)
// =====================================================================

test.describe('화면 문구', () => {
  test('AC-37: 허브·동의·결과·띠·별자리 화면에 금지 표현이 없다', async ({
    page,
  }) => {
    await prepare(page, { consent: false });
    await gotoOk(page, HUB.path);
    expect(findForbidden(await mainText(page)), '허브').toEqual([]);

    await openGated(page, TODAY);
    await submitBirth(page, TODAY, { year: 1990, month: 6, day: 15 });
    await expect(todayResult(page)).toBeVisible();
    expect(findForbidden(await mainText(page)), '오늘의 운세 결과').toEqual([]);

    await openGated(page, TTI);
    await page.getByRole('button', { name: '말띠', exact: true }).click();
    await expect(page.getByRole('region', { name: /^말띠/ })).toBeVisible();
    expect(findForbidden(await mainText(page)), '띠별').toEqual([]);

    await openGated(page, STAR);
    await page.getByRole('button', { name: /^사자자리/ }).click();
    await expect(page.getByRole('region', { name: /^사자자리/ })).toBeVisible();
    expect(findForbidden(await mainText(page)), '별자리').toEqual([]);
  });

  for (const def of ALL_PAGES) {
    test(`AC-48: ${def.path} 상세 이용 안내에 만 14세 이상 대상 항목과 판단·선택 책임 항목이 있다`, async ({
      page,
    }) => {
      await prepare(page, { consent: false });
      await gotoOk(page, def.path);
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: FORTUNE_DETAIL_NOTICE_TITLE,
        })
      ).toBeVisible();
      for (const item of FORTUNE_DETAIL_NOTICE_ITEMS) {
        await expect(page.getByText(item, { exact: true })).toBeVisible();
      }
      const joined = FORTUNE_DETAIL_NOTICE_ITEMS.join('\n');
      expect(joined).toContain('만 14세 이상 이용자를 대상으로 하며');
      expect(joined).toContain('판단과 선택은 이용자 본인에게 있습니다');
    });
  }
});

// =====================================================================
// JS를 끈 서버 HTML (AC-33, AC-48, AC-62, AC-72, AC-79, AC-81, AC-86)
// =====================================================================

test.describe('JS 끔', () => {
  test.use({ javaScriptEnabled: false });

  for (const def of ALL_PAGES) {
    test(`AC-33, AC-48, AC-62, AC-63: ${def.path} 서버 HTML에 설명·FAQ·면책·이용 안내가 이용 동의 여부와 관계없이 들어 있다`, async ({
      page,
    }) => {
      await gotoStatic(page, def.path);
      await expect(
        page.getByRole('heading', { level: 1, includeHidden: true })
      ).toHaveCount(1);
      await expect(
        page.getByRole('heading', { level: 1, includeHidden: true })
      ).toHaveText(def.h1);
      await expect(
        page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true }).first()
      ).toBeAttached();
      await expect(
        page.getByText(FORTUNE_RESULT_DISCLAIMER_TEXT, { exact: true }).first()
      ).toBeAttached();
      // 사용법·설명
      for (const section of def.guide) {
        await expect(
          page.getByRole('heading', {
            includeHidden: true,
            level: 2,
            name: section.heading,
            exact: true,
          })
        ).toBeAttached();
        await expect(
          page.getByText(section.paragraphs[0], { exact: true }).first()
        ).toBeAttached();
      }
      // FAQ 전체
      await expect(
        page.getByRole('heading', {
          includeHidden: true,
          level: 2,
          name: '자주 묻는 질문',
        })
      ).toBeAttached();
      for (const item of def.faq) {
        await expect(
          page.getByRole('heading', {
            includeHidden: true,
            level: 3,
            name: item.question,
          })
        ).toBeAttached();
        await expect(
          page.getByText(item.answer, { exact: true }).first()
        ).toBeAttached();
      }
      // 이용 안내(이용 대상 포함)
      await expect(
        page.getByRole('heading', {
          includeHidden: true,
          level: 2,
          name: FORTUNE_DETAIL_NOTICE_TITLE,
        })
      ).toBeAttached();
      for (const item of FORTUNE_DETAIL_NOTICE_ITEMS) {
        await expect(
          page.getByText(item, { exact: true }).first()
        ).toBeAttached();
      }
      if (def.key !== 'hub') {
        // 계산 기준 요약과 입력 영역 안내
        await expect(
          page.getByRole('heading', {
            includeHidden: true,
            level: 2,
            name: '계산 기준',
          })
        ).toBeAttached();
        await expect(
          page
            .getByText(FORTUNE_SUPPORTED_RANGE_NOTICE, { exact: true })
            .first()
        ).toBeAttached();
        await expect(
          page.getByText(FORTUNE_PRIVACY_INPUT_NOTICE, { exact: true }).first()
        ).toBeAttached();
        await expect(
          page.getByText(FORTUNE_AGE_INPUT_NOTICE, { exact: true }).first()
        ).toBeAttached();
      }
    });

    test(`AC-33, AC-62(표시): ${def.path} JS를 꺼도 h1·면책 문구가 화면에 보인다`, async ({
      page,
    }) => {
      // 서버 HTML에 있는지는 위 "서버 HTML에 설명·FAQ·면책" 테스트가 검사한다.
      // 여기서는 화면에 보이는지만 보며, 알려진 한계라 건너뛴다.
      skipJsOffVisibleKnownLimitation();
      await gotoStatic(page, def.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(def.h1);
      await expect(
        page.getByText(FORTUNE_DISCLAIMER_TEXT, { exact: true })
      ).toBeVisible();
    });

    test(`AC-72, AC-79: ${def.path} 서버 HTML에는 결과·입력칸·동의 화면이 없다`, async ({
      page,
    }) => {
      await gotoStatic(page, def.path);
      await expect(page.getByText(SCORE_PATTERN)).toHaveCount(0);
      await expect(
        page.getByRole('heading', { name: '총운', includeHidden: true })
      ).toHaveCount(0);
      await expect(page.locator('main input')).toHaveCount(0);
      await expect(page.locator('main textarea')).toHaveCount(0);
      await expect(
        page.getByRole('checkbox', { includeHidden: true })
      ).toHaveCount(0);
      await expect(
        page.getByRole('radio', { includeHidden: true })
      ).toHaveCount(0);
      await expect(consentHeading(page)).toHaveCount(0);
      await expect(resetButton(page)).toHaveCount(0);
      if (def.key === 'hub') {
        for (const [label, href] of [
          ['오늘의 운세', FORTUNE_ROUTES.today],
          ['띠별 운세', FORTUNE_ROUTES.tti],
          ['별자리 운세', FORTUNE_ROUTES.starSign],
        ] as const) {
          const link = page
            .getByRole('link', {
              name: new RegExp(`^${label}`),
              includeHidden: true,
            })
            .first();
          await expect(link).toHaveAttribute('href', href);
          await expect(link).toBeAttached();
        }
        expect(await page.locator('a[href*="saju"]').count()).toBe(0);
      } else {
        // 안내: "운세 이용에는 JavaScript가 필요합니다"
        await expect(
          page.getByText(FORTUNE_NOSCRIPT_NOTICE, { exact: true }).first()
        ).toBeAttached();
      }
    });

    test(`AC-86: ${def.path} JS를 끈 서버 HTML에 상담전화 5곳이 순서대로 들어 있다`, async ({
      page,
    }) => {
      await gotoStatic(page, def.path);
      const list = page.getByRole('list', {
        name: CRISIS_RESULT_LINE,
        includeHidden: true,
      });
      await expect(list).toBeAttached();
      await expect(
        list.getByRole('listitem', { includeHidden: true })
      ).toHaveCount(PHONES.length);
      const telLinks = page.locator('a[href^="tel:"]');
      await expect(telLinks).toHaveCount(PHONES.length);
      for (const [index, phone] of PHONES.entries()) {
        await expect(
          list.getByText(phone.number, { exact: true }).first()
        ).toBeAttached();
        await expect(telLinks.nth(index)).toHaveAttribute('href', phone.href);
      }
    });

    test(`AC-86(표시): ${def.path} JS를 꺼도 상담전화 표시가 기기별로 같다`, async ({
      page,
    }, testInfo) => {
      // 서버 HTML 포함 여부는 위 테스트가 검사한다. 여기서는 화면 표시만 보며 알려진 한계라 건너뛴다.
      skipJsOffVisibleKnownLimitation();
      await gotoStatic(page, def.path);
      await expectPhoneDisplay(page, testInfo);
    });
  }

  for (const def of [TTI, STAR]) {
    test(`AC-81: ${def.path} JS를 꺼도 "생년월일로 보는 오늘의 운세" 링크가 하나 있다`, async ({
      page,
    }) => {
      await gotoStatic(page, def.path);
      const link = page.getByRole('link', {
        name: FORTUNE_TODAY_LINK_LABEL,
        exact: true,
        includeHidden: true,
      });
      await expect(link).toHaveCount(1);
      await expect(link).toBeAttached();
      expect(await link.getAttribute('href')).toBe(FORTUNE_ROUTES.today);
    });
  }

  test('AC-10: JS를 끈 서버 HTML에서도 "사주"는 허용 문장에만 있다', async ({
    page,
  }) => {
    for (const def of ALL_PAGES) {
      await gotoStatic(page, def.path);
      const text = await mainText(page);
      for (const line of text.split('\n').filter((l) => l.includes('사주'))) {
        expect(
          FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A.some((allowed) =>
            line.includes(allowed)
          ),
          `${def.path}: ${line}`
        ).toBe(true);
      }
      for (const banned of ['사주 분석', '사주 풀이', '정통', '정확한 맞춤']) {
        expect(text, `${def.path} ${banned}`).not.toContain(banned);
      }
    }
  });
});
