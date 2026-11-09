import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  type Browser,
  expect as baseExpect,
  type Locator,
  type Page,
  type Request,
  test,
} from '@playwright/test';
import { FORTUNE_CONSENT_VERSION } from '@/features/fortune/constants/fortune-consent.constant';
import {
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import {
  FORTUNE_STAR_SIGN_FAQ,
  FORTUNE_TODAY_FAQ,
  FORTUNE_TTI_FAQ,
} from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_FINDER_BASIS_NOTICE,
  FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE,
  FORTUNE_SEOLLAL_TEMPLATE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  FORTUNE_STAR_SIGN_SEO,
  FORTUNE_TODAY_SEO,
  FORTUNE_TTI_SEO,
  type FortunePageSeoType,
} from '@/features/fortune/constants/fortune-seo.constant';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

// ---------- 기준 값 ----------

/** plan.md AC-3, AC-5 문구((가)안, dev-tasks.md 20~21행). 앱 상수와 별개로 글자 그대로 적어 둔다 */
const TTI_NOTICE =
  '생년월일은 내 띠를 찾는 데 쓰이며, 띠별 운세 문구는 누구에게나 같습니다.';
const STAR_NOTICE =
  '생년월일은 내 별자리를 찾는 데 쓰이며, 별자리별 운세 문구는 누구에게나 같습니다.';

/** 2025~2027년생을 입력해도 만 14세 이상이 되는 기기 시계 */
const LATER_NOW = '2045-06-01T09:00:00+09:00';
/** 2026-11-05. 만 14세 미만 시험용 */
const EARLY_NOW = '2026-11-05T09:00:00+09:00';

const COOKIE_KEY_SUFFIX = '_cookie_consent_v1';
const CONSENT_KEY_SUFFIX = '_fortune_consent_v1';
const SEED_PATH = '/robots.txt';

const SCORE_PATTERN = /\d+점/;

/**
 * 구체 날짜 근거 (docs/fortune/calendar-verification.md, 절기·음력 표)
 * - 1990-05-10, 1978-08-01: 둘 다 입춘 이후라 말띠(1990 경오, 1978 무오)
 * - 2025-02-01: 2025 설날 = 1월 29일(음력 표 newYear 129), 입춘 = 2월 3일 23:10(절기 표 2032310).
 *   설날은 지났고 입춘 전이라 입춘 기준 용띠, 설날 기준 뱀띠 -> 설날 안내가 나온다
 * - 2026-02-10: 입춘 2월 4일 05:02(2040502) 지남 -> 말띠. 2026 설날 = 2월 17일(newYear 217) 전 -> 설날 기준 뱀띠
 * - 2026-03-01: 입춘·설날 모두 지남 -> 말띠, 설날 안내 없음
 * - 2025-02-03: 입춘일(23:10) -> 시각 질문. 23:30은 뱀띠
 * - 2026-03-20: 춘분 23:46(3202346) -> 별자리 시각 질문. 23:00 물고기자리, 23:59 양자리
 */

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

async function prepare(page: Page, options: { consent: boolean }) {
  const browser = page.context().browser();
  const baseURL = test.info().project.use.baseURL;
  if (!browser || !baseURL) throw new Error('browser 또는 baseURL이 없다');
  const prefix = await getSitePrefix(browser, baseURL);
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
      options.consent
        ? JSON.stringify({
            v: 1,
            version: FORTUNE_CONSENT_VERSION,
            agreedAt: new Date().toISOString(),
          })
        : '',
      'declined',
    ]
  );
}

async function gotoOk(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), `${path} 응답`).toBeLessThan(400);
  return res;
}

type PageDefType = Readonly<{
  path: string;
  panelHeading: string;
  submit: string;
  seo: FortunePageSeoType;
  faq: ReadonlyArray<{ question: string; answer: string }>;
}>;

const TODAY: PageDefType = {
  path: FORTUNE_ROUTES.today,
  panelHeading: '생년월일 입력',
  submit: '운세 보기',
  seo: FORTUNE_TODAY_SEO,
  faq: FORTUNE_TODAY_FAQ,
};
const TTI: PageDefType = {
  path: FORTUNE_ROUTES.tti,
  panelHeading: '띠 고르기',
  submit: '내 띠 찾기',
  seo: FORTUNE_TTI_SEO,
  faq: FORTUNE_TTI_FAQ,
};
const STAR: PageDefType = {
  path: FORTUNE_ROUTES.starSign,
  panelHeading: '별자리 고르기',
  submit: '내 별자리 찾기',
  seo: FORTUNE_STAR_SIGN_SEO,
  faq: FORTUNE_STAR_SIGN_FAQ,
};

/** 동의를 심고 기능 영역이 보일 때까지 연다 */
async function openGated(
  page: Page,
  def: PageDefType,
  now: string | null = LATER_NOW
) {
  if (now) await page.clock.setFixedTime(new Date(now));
  await prepare(page, { consent: true });
  await gotoOk(page, def.path);
  await expect(
    page.getByRole('heading', { level: 2, name: def.panelHeading, exact: true })
  ).toBeVisible();
}

type BirthType = Readonly<{ year: number; month: number; day: number }>;

async function submitBirth(page: Page, def: PageDefType, birth: BirthType) {
  await page.getByRole('radio', { name: '양력', exact: true }).check({
    force: true,
  });
  await page.getByLabel('연도', { exact: true }).fill(String(birth.year));
  await page.getByLabel('월', { exact: true }).fill(String(birth.month));
  await page.getByLabel('일', { exact: true }).fill(String(birth.day));
  await page.getByRole('button', { name: def.submit, exact: true }).click();
}

async function submitTime(page: Page, hour: number, minute: number) {
  await page.getByLabel('시', { exact: true }).fill(String(hour));
  await page.getByLabel('분', { exact: true }).fill(String(minute));
  await page.getByRole('button', { name: '시각 반영', exact: true }).click();
}

const timeHeading = (page: Page) =>
  page.getByRole('heading', { level: 3, name: '태어난 시각', exact: true });

const ttiNotice = (page: Page) => page.getByText(TTI_NOTICE, { exact: true });
const starNotice = (page: Page) => page.getByText(STAR_NOTICE, { exact: true });
const seollalNotice = (page: Page, name: string) =>
  page.getByText(FORTUNE_SEOLLAL_TEMPLATE.replace('{띠}', name), {
    exact: true,
  });
const ttiFound = (page: Page, name: string) =>
  page.getByText(`입춘 시각을 기준으로 ${name}입니다.`, { exact: true });
const starFound = (page: Page, name: string) =>
  page.getByText(`${name}입니다.`, { exact: true });

const ttiChip = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });
/** 별자리 칩은 이름 뒤에 날짜 범위가 붙는다. "OO자리로 보기" 후보 버튼과 구분한다 */
const starChip = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(`^${name}(?!로)`) });

/** 펼친 항목(제목에 "(선택한 ...)"가 붙는 h3를 가진 li) */
const expandedItem = (page: Page, suffix: '띠' | '별자리') =>
  page.getByRole('listitem').filter({
    has: page.getByRole('heading', {
      level: 3,
      name: new RegExp(`\\(선택한 ${suffix}\\)`),
    }),
  });

/** 점수 눈금 애니메이션이 끝나 글자가 두 번 연속 같을 때까지 기다린 뒤 읽는다 */
async function readStable(locator: Locator): Promise<string> {
  let previous = '';
  await expect
    .poll(async () => {
      const current = await locator.innerText();
      const isSame = current === previous && current.length > 0;
      previous = current;
      return isSame;
    })
    .toBe(true);
  return previous;
}

function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return pageErrors;
}

function recordRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return requests;
}

function findForbidden(text: string): string[] {
  const hits: string[] = [];
  for (const term of FORTUNE_FORBIDDEN_TERMS) {
    if (text.includes(term)) hits.push(term);
  }
  for (const pattern of FORTUNE_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) hits.push(String(pattern));
  }
  return hits;
}

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

// =====================================================================
// 공통 검사
// =====================================================================

for (const def of [TODAY, TTI, STAR]) {
  test.describe(`공통 ${def.path}`, () => {
    test('응답 400 미만, pageerror 없음, h1 하나, title·description 존재', async ({
      page,
    }) => {
      const pageErrors = watchErrors(page);
      await prepare(page, { consent: true });
      await gotoOk(page, def.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      expect(await page.title()).toContain(def.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        def.seo.description
      );
      expect(pageErrors).toEqual([]);
    });
  });
}

for (const [def, notice] of [
  [TTI, TTI_NOTICE],
  [STAR, STAR_NOTICE],
] as const) {
  test.describe(`상태 ${def.path}`, () => {
    test('빈 상태: 입력 전에는 안내 문장이 없다', async ({ page }) => {
      await openGated(page, def);
      await expect(page.getByText(notice, { exact: true })).toHaveCount(0);
    });

    test('에러 상태: 빈 값·지원 범위 밖·미래 날짜에서는 안내 문장이 없고 오류만 남는다', async ({
      page,
    }) => {
      await openGated(page, def);
      await page.getByRole('button', { name: def.submit, exact: true }).click();
      await expect(page.getByRole('alert').first()).toBeVisible();
      await expect(page.getByText(notice, { exact: true })).toHaveCount(0);

      await submitBirth(page, def, { year: 1919, month: 1, day: 1 });
      await expect(page.getByText(notice, { exact: true })).toHaveCount(0);
      await submitBirth(page, def, { year: 2999, month: 1, day: 1 });
      await expect(page.getByText(notice, { exact: true })).toHaveCount(0);
    });

    test('연령 안내(만 14세 미만)에서는 안내 문장이 없다', async ({ page }) => {
      await openGated(page, def, EARLY_NOW);
      await submitBirth(page, def, { year: 2025, month: 1, day: 1 });
      await expect(
        page.getByRole('heading', { name: '연령 안내', exact: true })
      ).toBeVisible();
      await expect(page.getByText(notice, { exact: true })).toHaveCount(0);
    });
  });
}

// =====================================================================
// AC-1 ~ AC-4 띠
// =====================================================================

test.describe('띠 찾기 (/fortune/tti)', () => {
  test('AC-1: 1990-05-10으로 찾은 말띠 카드의 요약·점수는 생년월일 없이 펼친 말띠 카드와 같다', async ({
    page,
  }) => {
    await openGated(page, TTI);

    // 기준: 생년월일 없이 칩으로 펼친다
    await ttiChip(page, '말띠').click();
    const item = expandedItem(page, '띠');
    await expect(item).toBeVisible();
    const baseline = await readStable(item);
    expect(baseline).toMatch(SCORE_PATTERN);
    await ttiChip(page, '말띠').click();
    await expect(item).toHaveCount(0);

    // 생년월일로 찾는다
    await submitBirth(page, TTI, { year: 1990, month: 5, day: 10 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    await expect(item).toBeVisible();
    expect(await readStable(item)).toBe(baseline);
    await expect(ttiChip(page, '말띠')).toHaveAttribute('aria-pressed', 'true');
  });

  test('AC-2: 같은 말띠인 1990-05-10과 1978-08-01은 펼친 카드 문구가 같다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    const item = expandedItem(page, '띠');

    await submitBirth(page, TTI, { year: 1990, month: 5, day: 10 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    const first = await readStable(item);

    await submitBirth(page, TTI, { year: 1978, month: 8, day: 1 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    const second = await readStable(item);

    expect(second).toBe(first);
  });

  test('AC-3: 찾기 결과 뒤에 안내 문장이 나타나고 결과 전에는 없다 (띠)', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await expect(ttiNotice(page)).toHaveCount(0);
    await submitBirth(page, TTI, { year: 1990, month: 5, day: 10 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    await expect(ttiNotice(page)).toBeVisible();
    await expect(ttiNotice(page)).toHaveCount(1);
    // 결과 줄 다음에 읽힌다(같은 묶음 안, DOM 순서)
    const group = ttiFound(page, '말띠').locator('xpath=..');
    await expect(group).toContainText(TTI_NOTICE);
  });

  test('AC-4: 2025-02-01(입춘 전, 설날 뒤)은 용띠이고 설날 기준 뱀띠 안내가 보인다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 1 });
    await expect(ttiFound(page, '용띠')).toBeVisible();
    await expect(seollalNotice(page, '뱀띠')).toBeVisible();
    await expect(ttiNotice(page)).toBeVisible();
  });

  test('AC-4: 2026-02-10(입춘 뒤, 설날 전)은 말띠이고 설날 기준 뱀띠 안내가 보인다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await submitBirth(page, TTI, { year: 2026, month: 2, day: 10 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    await expect(seollalNotice(page, '뱀띠')).toBeVisible();
  });

  test('AC-4: 입춘·설날 기준 띠가 같은 날짜(1990-05-10, 2026-03-01)에는 설날 안내가 없다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    await submitBirth(page, TTI, { year: 1990, month: 5, day: 10 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    const seollal = page.getByText(
      /^설날을 기준으로 하면 .+띠로 보기도 합니다\.$/
    );
    await expect(seollal).toHaveCount(0);
    await submitBirth(page, TTI, { year: 2026, month: 3, day: 1 });
    await expect(ttiFound(page, '말띠')).toBeVisible();
    await expect(seollal).toHaveCount(0);
    await expect(ttiNotice(page)).toBeVisible();
  });

  test('AC-6: 띠 경계일(2025-02-03)은 시각을 묻고, 시각 입력·후보 선택 뒤에도 안내 문장이 보이며 카드 문구는 칩과 같다', async ({
    page,
  }) => {
    await openGated(page, TTI);
    const item = expandedItem(page, '띠');

    // 기준: 뱀띠 칩
    await ttiChip(page, '뱀띠').click();
    const baseline = await readStable(item);
    await ttiChip(page, '뱀띠').click();
    await expect(item).toHaveCount(0);

    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(ttiNotice(page)).toHaveCount(0);
    await submitTime(page, 23, 30);
    await expect(ttiFound(page, '뱀띠')).toBeVisible();
    await expect(ttiNotice(page)).toBeVisible();
    expect(await readStable(item)).toBe(baseline);

    // 시각 모름: 후보를 고르기 전에는 결과·안내가 없고, 고른 뒤 나타난다
    await submitBirth(page, TTI, { year: 2025, month: 2, day: 3 });
    await expect(timeHeading(page)).toBeVisible();
    await page.getByRole('button', { name: '시각 모름', exact: true }).click();
    await expect(
      page.getByRole('button', { name: '용띠로 보기', exact: true })
    ).toBeVisible();
    await expect(ttiNotice(page)).toHaveCount(0);
    await page
      .getByRole('button', { name: '뱀띠로 보기', exact: true })
      .click();
    await expect(ttiNotice(page)).toBeVisible();
  });
});

// =====================================================================
// AC-5, AC-6 별자리
// =====================================================================

test.describe('별자리 찾기 (/fortune/star-sign)', () => {
  test('AC-5: 1990-05-15로 찾은 황소자리 결과 아래에 안내 문장이 보이고 카드 문구는 칩과 같다', async ({
    page,
  }) => {
    await openGated(page, STAR);
    await expect(starNotice(page)).toHaveCount(0);

    await starChip(page, '황소자리').click();
    const item = expandedItem(page, '별자리');
    await expect(item).toBeVisible();
    const baseline = await readStable(item);
    expect(baseline).toMatch(SCORE_PATTERN);
    await starChip(page, '황소자리').click();
    await expect(item).toHaveCount(0);

    await submitBirth(page, STAR, { year: 1990, month: 5, day: 15 });
    await expect(starFound(page, '황소자리')).toBeVisible();
    await expect(starNotice(page)).toBeVisible();
    await expect(starNotice(page)).toHaveCount(1);
    expect(await readStable(item)).toBe(baseline);
    await expect(starFound(page, '황소자리').locator('xpath=..')).toContainText(
      STAR_NOTICE
    );
  });

  test('AC-5: 같은 별자리인 다른 생년월일(1990-05-15, 1985-05-01)은 카드 문구가 같다', async ({
    page,
  }) => {
    await openGated(page, STAR);
    const item = expandedItem(page, '별자리');
    await submitBirth(page, STAR, { year: 1990, month: 5, day: 15 });
    await expect(starFound(page, '황소자리')).toBeVisible();
    const first = await readStable(item);
    await submitBirth(page, STAR, { year: 1985, month: 5, day: 1 });
    await expect(starFound(page, '황소자리')).toBeVisible();
    expect(await readStable(item)).toBe(first);
  });

  test('AC-6: 경계일(2026-03-20)은 시각을 묻고, 시각 입력 뒤에도 안내 문장이 보이며 카드 문구는 칩과 같다', async ({
    page,
  }) => {
    await openGated(page, STAR);
    const item = expandedItem(page, '별자리');

    await starChip(page, '물고기자리').click();
    const baseline = await readStable(item);
    await starChip(page, '물고기자리').click();
    await expect(item).toHaveCount(0);

    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await expect(timeHeading(page)).toBeVisible();
    await expect(starNotice(page)).toHaveCount(0);
    await submitTime(page, 23, 0);
    await expect(starFound(page, '물고기자리')).toBeVisible();
    await expect(starNotice(page)).toBeVisible();
    expect(await readStable(item)).toBe(baseline);

    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await submitTime(page, 23, 59);
    await expect(starFound(page, '양자리')).toBeVisible();
    await expect(starNotice(page)).toBeVisible();

    // 시각 모름: 두 후보, 고르기 전에는 안내 문장이 없다
    await submitBirth(page, STAR, { year: 2026, month: 3, day: 20 });
    await page.getByRole('button', { name: '시각 모름', exact: true }).click();
    await expect(
      page.getByRole('button', { name: '물고기자리로 보기', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '양자리로 보기', exact: true })
    ).toBeVisible();
    await expect(starNotice(page)).toHaveCount(0);
    await page
      .getByRole('button', { name: '양자리로 보기', exact: true })
      .click();
    await expect(starNotice(page)).toBeVisible();
  });
});

// =====================================================================
// AC-7 KASI 런타임 호출 없음
// =====================================================================

const KASI_HOSTS = ['apis.data.go.kr', 'astro.kasi.re.kr'];

function kasiRequests(requests: readonly Request[]): string[] {
  return requests
    .map((request) => request.url())
    .filter((url) => KASI_HOSTS.some((host) => new URL(url).hostname === host));
}

for (const def of [TTI, STAR]) {
  test(`AC-7: ${def.path} 목록 로드와 찾기 실행 중 KASI 서버로 가는 요청이 없다`, async ({
    page,
  }) => {
    const requests = recordRequests(page);
    await openGated(page, def);
    // 띠는 2025-02-03(입춘일), 별자리는 2026-03-20(춘분일)에 시각 질문이 나온다. 절기 표를 읽는 경로다
    await submitBirth(
      page,
      def,
      def === TTI
        ? { year: 2025, month: 2, day: 3 }
        : { year: 2026, month: 3, day: 20 }
    );
    await expect(timeHeading(page)).toBeVisible();
    expect(requests.length).toBeGreaterThan(0);
    expect(kasiRequests(requests)).toEqual([]);
  });

  test(`AC-7: ${def.path} 이용 동의 전 화면에서도 KASI 서버로 가는 요청이 없다`, async ({
    page,
  }) => {
    const requests = recordRequests(page);
    await prepare(page, { consent: false });
    await gotoOk(page, def.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(kasiRequests(requests)).toEqual([]);
  });
}

// =====================================================================
// AC-9 메타데이터, JSON-LD, sitemap 변경 없음
// =====================================================================

for (const def of [TODAY, TTI, STAR]) {
  test(`AC-9: ${def.path} 메타데이터와 JSON-LD가 기존 값과 같고 새 문장이 섞이지 않는다`, async ({
    page,
  }) => {
    await prepare(page, { consent: true });
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

    const blocks = await readJsonLd(page);
    const faq = blocks.find((block) => block['@type'] === 'FAQPage');
    const entities = (faq?.mainEntity ?? []) as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;
    expect(entities.map((entity) => entity.name)).toEqual(
      def.faq.map((item) => item.question)
    );
    const crumbs = blocks.find((block) => block['@type'] === 'BreadcrumbList');
    expect(crumbs).toBeTruthy();

    const everything = JSON.stringify(blocks) + def.seo.description;
    expect(everything).not.toContain(TTI_NOTICE);
    expect(everything).not.toContain(STAR_NOTICE);
  });
}

test('AC-9: sitemap.xml에 운세 페이지가 그대로 있다', async ({ request }) => {
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
});

test('AC-9: 메타·sitemap·JSON-LD 소스 파일은 HEAD와 diff가 없다', () => {
  const root = resolve(__dirname, '..');
  const files = [
    'src/features/fortune/constants/fortune-seo.constant.ts',
    'src/features/fortune/constants/fortune-faq.constant.ts',
    'src/app/sitemap.ts',
    'src/components/seo/json-ld.component.tsx',
  ];
  // 변경이 있으면 종료 코드 1로 예외가 난다
  expect(() =>
    execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...files], {
      cwd: root,
    })
  ).not.toThrow();
});

// =====================================================================
// AC-10 금지 표현
// =====================================================================

test('AC-10: 새 안내 문장 상수가 (가)안과 같고 금지 표현이 없다', () => {
  expect(FORTUNE_FINDER_BASIS_NOTICE).toBe(TTI_NOTICE);
  expect(FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE).toBe(STAR_NOTICE);
  for (const text of [TTI_NOTICE, STAR_NOTICE]) {
    expect(findForbidden(text), text).toEqual([]);
    for (const word of ['보장', '정확', '맞춤']) {
      expect(text).not.toContain(word);
    }
  }
});

for (const [def, birth, notice] of [
  [TTI, { year: 1990, month: 5, day: 10 }, TTI_NOTICE],
  [STAR, { year: 1990, month: 5, day: 15 }, STAR_NOTICE],
] as const) {
  test(`AC-10: ${def.path} 화면에 나온 안내 문장에 금지 표현이 없다`, async ({
    page,
  }) => {
    await openGated(page, def);
    await submitBirth(page, def, birth);
    const line = page.getByText(notice, { exact: true });
    await expect(line).toBeVisible();
    const shown = await line.innerText();
    expect(findForbidden(shown)).toEqual([]);
  });
}

// =====================================================================
// AC-11 status.md 사용자 할 일
// =====================================================================

test('AC-11: docs/fortune-v2/status.md에 1단계 출시 전 확인 항목이 "사용자 할 일"로 남아 있다', () => {
  const text = readFileSync(
    resolve(__dirname, '..', 'docs/fortune-v2/status.md'),
    'utf8'
  );
  expect(text).toContain('사용자 할 일');
  for (const item of [
    '상담전화',
    'AdFit',
    '방침',
    '약관',
    '스크린리더',
    '운영 배포',
  ]) {
    expect(text, item).toContain(item);
  }
});

test('AC-11: 1단계 docs/fortune/status.md에는 같은 항목이 남아 있다(기준 문서)', () => {
  const text = readFileSync(
    resolve(__dirname, '..', 'docs/fortune/status.md'),
    'utf8'
  );
  expect(text).toContain('사용자 할 일');
  for (const item of [
    '상담전화',
    'AdFit',
    '방침',
    '약관',
    '스크린리더',
    '운영 배포',
  ]) {
    expect(text, item).toContain(item);
  }
});
