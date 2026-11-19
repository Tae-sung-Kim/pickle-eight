import { expect, type Page, test } from '@playwright/test';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import { DREAM_CATEGORIES } from '@/features/dream/constants/dream-category.constant';
import { DREAM_HUB_FAQ } from '@/features/dream/constants/dream-faq.constant';
import {
  DREAM_BACK_LINK_LABEL,
  DREAM_BASIS_LINK_LABEL,
  DREAM_BASIS_TEXT,
  DREAM_BOTTOM_NOTICE_TEXT,
  DREAM_CRISIS_PANEL_TITLE,
  DREAM_CRISIS_PHONES_TITLE,
  DREAM_DEATH_SUPPLEMENT_TEXT,
  DREAM_DETAIL_NOTICE_ITEMS,
  DREAM_DETAIL_NOTICE_TITLE,
  DREAM_DISCLAIMER_TEXT,
  DREAM_EMPTY_BUTTON_LABEL,
  DREAM_EMPTY_TITLE,
  DREAM_FAQ_TITLE,
  DREAM_REPEAT_NOTICE_TEXT,
  DREAM_SEARCH_LABEL,
  DREAM_SEARCH_NOSCRIPT_TEXT,
  DREAM_SEARCH_NOTICE,
  DREAM_SECTION_TITLES,
  DREAM_SOOTHING_TITLE,
  DREAM_TTI_CONSENT_NOTICE,
  DREAM_TTI_LINK_LABEL,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_TTI_PATH } from '@/features/dream/constants/dream-route.constant';
import { DREAM_HUB_SEO } from '@/features/dream/constants/dream-seo.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';

// 화면·SEO·검색·위기어 안내 검사 (데스크톱·모바일). 데이터 검사는 dream-copy.spec.ts가 맡는다.

const SITE_NAME = '운빨연구소';
const HUB = '/dream';
const TOTAL = DREAM_TOPICS.length;
const SLUGS = DREAM_TOPICS.map((t) => t.slug);

const NORMAL = DREAM_TOPICS.find(
  (t) => t.sensitivity === 'none' && !t.isTtiAnimal
);
const TTI = DREAM_TOPICS.find((t) => t.isTtiAnimal);
const SENSITIVE = DREAM_TOPICS.find((t) => t.sensitivity === 'sensitive');
const DEATH = DREAM_TOPICS.find((t) => t.sensitivity === 'death');
if (!NORMAL || !TTI || !SENSITIVE || !DEATH) {
  throw new Error('대표 소재(일반·띠·민감·죽음)를 데이터에서 찾지 못했다');
}
const SAMPLES = [NORMAL, TTI, SENSITIVE, DEATH] as const;

test.beforeEach(() => {
  // 개발 서버 첫 컴파일이 느릴 수 있다
  test.setTimeout(90_000);
});

// ---------- 도우미 ----------

function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

const CATEGORY_LABEL = new Map<string, string>(
  DREAM_CATEGORIES.map((c) => [c.key, c.label])
);

function topicKeys(t: (typeof DREAM_TOPICS)[number]): string[] {
  return [
    t.name,
    t.keywordName,
    ...t.aliases,
    CATEGORY_LABEL.get(t.category) ?? '',
  ].map(normalize);
}

function expectedSlugs(query: string): string[] {
  const q = normalize(query);
  return DREAM_TOPICS.filter((t) => topicKeys(t).some((k) => k.includes(q)))
    .map((t) => t.slug)
    .sort();
}

const searchBox = (page: Page) =>
  page.getByRole('searchbox', { name: DREAM_SEARCH_LABEL });

const main = (page: Page) => page.getByRole('main');

async function visibleSlugs(page: Page): Promise<string[]> {
  const hrefs = await main(page)
    .locator('a[href^="/dream/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  return hrefs.map((h) => h.replace('/dream/', '')).sort();
}

/** 이동 완료와 hydration 확인. 입력이 상태에 반영될 때까지 반복한다 */
async function openHub(page: Page): Promise<void> {
  const res = await page.goto(HUB);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(async () => {
    await searchBox(page).fill('zz');
    await expect(page.getByText(/검색 결과 \d+개/)).toBeVisible({
      timeout: 1000,
    });
  }).toPass();
  await searchBox(page).fill('');
  await expect(
    main(page).getByText(`전체 소재 ${TOTAL}개`).first()
  ).toBeVisible();
}

async function resultCount(page: Page): Promise<number> {
  // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
  const text = await page.getByText(/(전체 소재|검색 결과) \d+개/).innerText();
  return Number(/(\d+)개/.exec(text)?.[1] ?? NaN);
}

function trackErrors(page: Page): { page: string[]; console: string[] } {
  const out = { page: [] as string[], console: [] as string[] };
  page.on('pageerror', (e) => out.page.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /hydrat/i.test(m.text()))
      out.console.push(m.text());
  });
  return out;
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const texts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const out: Record<string, unknown>[] = [];
  for (const t of texts) {
    const v = JSON.parse(t);
    for (const item of Array.isArray(v) ? v : [v]) {
      if (Array.isArray(item?.['@graph'])) out.push(...item['@graph']);
      else out.push(item);
    }
  }
  return out;
}

async function storageSnapshot(page: Page) {
  return page.evaluate(() => {
    // 사이트 공통 동의·연령 저장 키는 제외한다
    const dump = (s: Storage) =>
      Object.fromEntries(
        Object.keys(s)
          .filter(
            (k) => !/_cookie_consent_v1$|_age_gate_verified_sess_v1$/.test(k)
          )
          .map((k) => [k, s.getItem(k)])
      );
    return {
      local: dump(localStorage),
      session: dump(sessionStorage),
      cookie: document.cookie,
      historyLength: history.length,
    };
  });
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(Number.parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_, d: string) =>
      String.fromCodePoint(Number.parseInt(d, 10))
    )
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

const squash = (s: string): string => s.replace(/\s+/g, ' ');

function mainHtml(html: string): string {
  return /<main[\s\S]*?<\/main>/.exec(html)?.[0] ?? '';
}

const isHmr = (url: string): boolean =>
  /webpack-hmr|__nextjs|hot-update|_next\/webpack|\/_next\/static\/chunks\/.*\.map/.test(
    url
  );

// ======================================================================
// 허브
// ======================================================================
test.describe('허브 /dream', () => {
  test('AC-1, AC-40: h1 하나, 검색칸, 카테고리별 소재 목록이 보인다', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await openHub(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      DREAM_HUB_SEO.heading
    );
    await expect(searchBox(page)).toBeVisible();
    for (const c of DREAM_CATEGORIES) {
      await expect(
        page.getByRole('heading', { level: 2, name: c.label, exact: true })
      ).toBeVisible();
    }
    expect((await visibleSlugs(page)).length).toBe(TOTAL);
    expect(errors.page).toEqual([]);
    expect(errors.console).toEqual([]);
  });

  test('AC-2: "돼지" 검색은 이름·별칭에 맞는 소재만 남기고, 지우거나 공백이면 전체', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill('돼지');
    await expect(page.getByText(/“돼지” 검색 결과 \d+개/)).toBeVisible();
    const expected = expectedSlugs('돼지');
    expect(expected).toContain('pig');
    expect(await visibleSlugs(page)).toEqual(expected);
    expect(await resultCount(page)).toBe(expected.length);

    await searchBox(page).fill('');
    await expect(page.getByText(`전체 소재 ${TOTAL}개`)).toBeVisible();
    expect((await visibleSlugs(page)).length).toBe(TOTAL);

    await searchBox(page).fill('   ');
    await expect(page.getByText(`전체 소재 ${TOTAL}개`)).toBeVisible();
    expect((await visibleSlugs(page)).length).toBe(TOTAL);
  });

  test('AC-3: 데이터의 모든 별칭으로 검색하면 그 소재가 나온다', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await openHub(page);
    const missing: string[] = [];
    for (const t of DREAM_TOPICS) {
      for (const alias of t.aliases) {
        await searchBox(page).fill(alias);
        const link = main(page).locator(`a[href="/dream/${t.slug}"]`);
        try {
          await expect(link).toHaveCount(1, { timeout: 3000 });
        } catch {
          missing.push(`${t.slug}:${alias}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('AC-3: 카테고리 이름으로 검색하면 그 카테고리 소재가 나온다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill('동물');
    const expected = expectedSlugs('동물');
    await expect(page.getByText(/“동물” 검색 결과 \d+개/)).toBeVisible();
    expect(await visibleSlugs(page)).toEqual(expected);
    for (const t of DREAM_TOPICS.filter((x) => x.category === 'animal')) {
      expect(expected).toContain(t.slug);
    }
  });

  test('AC-4: 띄어쓰기·대소문자를 무시한다 ("이빨빠지는", "이빨 빠지는 꿈")', async ({
    page,
  }) => {
    await openHub(page);
    const link = main(page).locator('a[href="/dream/teeth"]');
    await searchBox(page).fill('이빨빠지는');
    await expect(link).toHaveCount(1);
    await searchBox(page).fill('  이빨   빠지는 꿈 ');
    await expect(link).toHaveCount(1);
    await searchBox(page).fill('이 빨 빠 지 는');
    await expect(link).toHaveCount(1);
  });

  test('AC-5: 일치하는 소재가 없으면 안내와 "전체 목록 보기"가 보이고, 누르면 전체로 돌아온다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill('가나다라마바사없는소재');
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
    expect((await visibleSlugs(page)).length).toBe(0);
    const reset = page.getByRole('button', { name: DREAM_EMPTY_BUTTON_LABEL });
    await expect(reset).toBeVisible();
    await reset.click();
    await expect(searchBox(page)).toHaveValue('');
    await expect(searchBox(page)).toBeFocused();
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toHaveCount(0);
    expect((await visibleSlugs(page)).length).toBe(TOTAL);
  });

  test('AC-5: 로또·복권·태몽 검색은 빈 상태 안내만 보이고 번호·로또 링크가 없다', async ({
    page,
  }) => {
    await openHub(page);
    for (const q of ['로또', '복권', '태몽']) {
      await searchBox(page).fill(q);
      await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
      expect((await visibleSlugs(page)).length).toBe(0);
      await expect(main(page).locator('a[href*="/lotto"]')).toHaveCount(0);
    }
  });

  test('AC-5: 특수문자와 긴 입력도 오류 화면 없이 처리한다', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await openHub(page);
    const inputs = [
      '(.*+?[\\^$|',
      '<script>alert(1)</script>',
      '꿈'.repeat(120),
      '😀😀😀',
    ];
    for (const q of inputs) {
      await searchBox(page).fill(q);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
    // 긴 입력은 50자에서 잘린다 (design 4.3)
    const len = (await searchBox(page).inputValue()).length;
    expect(len).toBeLessThanOrEqual(50);
    expect(errors.page).toEqual([]);
  });

  test('AC-6, AC-44: 검색하는 동안 요청이 없고 검색어가 어디로도 나가지 않으며 주소가 바뀌지 않는다', async ({
    page,
  }) => {
    await openHub(page);
    await page.waitForLoadState('networkidle');
    const before = page.url();
    const requests: string[] = [];
    const bodies: string[] = [];
    const logs: string[] = [];
    page.on('request', (r) => {
      requests.push(r.url());
      const post = r.postData();
      if (post) bodies.push(post);
    });
    page.on('console', (m) => logs.push(m.text()));

    const queries = ['돼지', '이빨빠지는', '로또', '   ', '죽고 싶다', ''];
    for (const q of queries) {
      await searchBox(page).fill(q);
    }
    await searchBox(page).fill('돼지');
    await searchBox(page).press('Enter');
    await expect(page.getByText(/“돼지” 검색 결과/)).toBeVisible();

    expect(requests.filter((u) => !isHmr(u))).toEqual([]);
    for (const q of ['돼지', '이빨빠지는', '죽고']) {
      const enc = encodeURIComponent(q);
      expect(requests.some((u) => u.includes(enc) || u.includes(q))).toBe(
        false
      );
      expect(bodies.some((b) => b.includes(enc) || b.includes(q))).toBe(false);
      expect(logs.some((l) => l.includes(q))).toBe(false);
    }
    expect(page.url()).toBe(before);
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
  });

  test('AC-44: 허브 목록 링크에 검색어 쿼리가 붙지 않는다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill('돼지');
    const hrefs = await main(page)
      .locator('a[href^="/dream"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).not.toMatch(/[?#]/);
  });

  test('AC-7, AC-27, AC-29: 상시 면책이 h1 아래에 보이고, 상세 안내 6항이 있다', async ({
    page,
  }) => {
    await openHub(page);
    const h1 = page.getByRole('heading', { level: 1 });
    const disclaimer = page.getByText(DREAM_DISCLAIMER_TEXT);
    await expect(disclaimer).toBeVisible();
    for (const phrase of [
      '오락과 자기 성찰',
      '예측하거나 보장하지',
      '중요한 결정을 내리지',
    ]) {
      expect(DREAM_DISCLAIMER_TEXT).toContain(phrase);
    }
    const h1Box = await h1.boundingBox();
    const discBox = await disclaimer.boundingBox();
    const searchBoxPos = await searchBox(page).boundingBox();
    expect(h1Box && discBox && searchBoxPos).toBeTruthy();
    expect(discBox?.y).toBeGreaterThan(h1Box?.y ?? 0);
    expect(discBox?.y).toBeLessThan(searchBoxPos?.y ?? 0);

    await expect(
      page.getByRole('heading', { name: DREAM_DETAIL_NOTICE_TITLE })
    ).toBeVisible();
    for (const item of DREAM_DETAIL_NOTICE_ITEMS) {
      await expect(page.getByText(item, { exact: true })).toBeVisible();
    }
  });

  test('AC-12: 허브에 풀이 기준 안내가 보인다', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText(DREAM_BASIS_TEXT)).toBeVisible();
  });

  test('AC-20: 검색칸 외 입력칸과 textarea가 없고, 개인 내용 주의 안내가 연결돼 있다', async ({
    page,
  }) => {
    await openHub(page);
    await expect(main(page).locator('input')).toHaveCount(1);
    await expect(main(page).locator('textarea')).toHaveCount(0);
    await expect(page.getByText(DREAM_SEARCH_NOTICE)).toBeVisible();
    const describedBy = await searchBox(page).getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
      DREAM_SEARCH_NOTICE
    );
  });

  test('AC-19: 허브 본문에 /lotto 링크가 없다', async ({ page }) => {
    await openHub(page);
    await expect(main(page).locator('a[href*="/lotto"]')).toHaveCount(0);
  });

  test('AC-24: 허브 하단 상담 안내에 다섯 번호가 순서대로 있다', async ({
    page,
  }) => {
    await openHub(page);
    const box = page
      .getByRole('heading', { name: DREAM_CRISIS_PHONES_TITLE, exact: true })
      .locator('xpath=..');
    await expect(box).toBeVisible();
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    const text = await box.innerText();
    let last = -1;
    expect(CRISIS_PHONES).toHaveLength(5);
    for (const p of CRISIS_PHONES) {
      const idx = text.indexOf(p.displayNumber);
      expect(idx, p.displayNumber).toBeGreaterThan(last);
      last = idx;
    }
  });

  test('AC-21: 검색·상세 열람 동안 localStorage·sessionStorage에 새 값이 없다', async ({
    page,
  }) => {
    await openHub(page);
    const before = await storageSnapshot(page);
    await searchBox(page).fill('돼지');
    await searchBox(page).fill('죽고 싶다');
    await searchBox(page).fill('');
    await page.goto(`${HUB}/${NORMAL.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const after = await storageSnapshot(page);
    expect(after.local).toEqual(before.local);
    expect(after.session).toEqual(before.session);
    expect(after.cookie).not.toContain('돼지');
  });
});

// ======================================================================
// 위기어 안내
// ======================================================================
test.describe('위기어 안내', () => {
  const panelPhones = CRISIS_PHONES.filter((p) => p.showInCrisisPanel);
  const otherPhones = CRISIS_PHONES.filter((p) => !p.showInCrisisPanel);

  test('위기 표현을 입력하면 상담 안내가 먼저 보이고, 결과 영역은 막히지 않는다', async ({
    page,
  }) => {
    await openHub(page);
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
    await searchBox(page).fill('죽고 싶다');
    const title = page.getByText(DREAM_CRISIS_PANEL_TITLE);
    await expect(title).toBeVisible();
    // 안내 상자는 결과(빈 상태)보다 위에 있다
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
    const t = await title.boundingBox();
    const e = await page.getByText(DREAM_EMPTY_TITLE).boundingBox();
    expect(t?.y).toBeLessThan(e?.y ?? 0);

    const panel = title.locator('xpath=..');
    // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
    const text = await panel.innerText();
    for (const p of panelPhones) expect(text).toContain(p.displayNumber);
    for (const p of otherPhones) expect(text).not.toContain(p.displayNumber);
    await expect(page.getByRole('status').first()).toBeAttached();
    // alert 역할을 쓰지 않는다 (design 5장)
    await expect(panel.getByRole('alert')).toHaveCount(0);

    await searchBox(page).fill('');
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
    expect((await visibleSlugs(page)).length).toBe(TOTAL);
  });

  test('띄어쓰기·섞인 문장에서도 위기 표현을 찾고, 다른 위기 표현도 안내한다', async ({
    page,
  }) => {
    await openHub(page);
    for (const q of ['자 살 하고 싶어', '나를 해치고 싶다', '죽 고 싶 어요']) {
      await searchBox(page).fill(q);
      await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toBeVisible();
    }
  });

  test('오탐 방지: "죽음" 소재 검색은 결과만 보이고 상담 안내 상자는 뜨지 않는다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill(DEATH.name);
    await expect(
      main(page).locator(`a[href="/dream/${DEATH.slug}"]`)
    ).toHaveCount(1);
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
    await searchBox(page).fill('돼지');
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toHaveCount(0);
  });

  test('위기 표현 검색어가 서버·URL·저장소·콘솔로 나가지 않는다', async ({
    page,
  }) => {
    await openHub(page);
    await page.waitForLoadState('networkidle');
    const before = await storageSnapshot(page);
    const url = page.url();
    const requests: string[] = [];
    const bodies: string[] = [];
    const logs: string[] = [];
    page.on('request', (r) => {
      requests.push(r.url());
      const post = r.postData();
      if (post) bodies.push(post);
    });
    page.on('console', (m) => logs.push(m.text()));

    const queries = ['죽고 싶다', '자살', '자해하고 싶어'];
    for (const q of queries) {
      await searchBox(page).fill(q);
      await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toBeVisible();
    }
    await searchBox(page).press('Enter');

    expect(requests.filter((u) => !isHmr(u))).toEqual([]);
    for (const q of ['죽고', '자살', '자해', '%EC%A3%BD']) {
      expect(requests.some((u) => u.includes(q))).toBe(false);
      expect(bodies.some((b) => b.includes(q))).toBe(false);
      expect(logs.some((l) => l.includes(q))).toBe(false);
    }
    expect(page.url()).toBe(url);
    const after = await storageSnapshot(page);
    expect(after.local).toEqual(before.local);
    expect(after.session).toEqual(before.session);
    expect(after.historyLength).toBe(before.historyLength);
    expect(after.cookie).not.toMatch(/죽고|자살|자해|%EC%A3%BD/);
  });
});

// ======================================================================
// 상세
// ======================================================================
test.describe('상세 /dream/<slug>', () => {
  for (const topic of SAMPLES) {
    test(`AC-9, AC-12, AC-27, AC-28, AC-40: ${topic.slug} 본문·면책·풀이 기준·h1`, async ({
      page,
    }) => {
      const errors = trackErrors(page);
      const res = await page.goto(`${HUB}/${topic.slug}`);
      expect(res?.status()).toBeLessThan(400);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(topic.keywordName);
      await expect(page.getByText(topic.summary)).toBeVisible();
      await expect(
        page.getByRole('heading', { name: DREAM_SECTION_TITLES.folk })
      ).toBeVisible();
      await expect(page.getByText(squash(topic.folk.join(' ')))).toBeVisible();
      await expect(
        page.getByRole('heading', { name: DREAM_SECTION_TITLES.reflection })
      ).toBeVisible();
      await expect(
        page.getByText(squash(topic.reflection.join(' ')))
      ).toBeVisible();

      // 상시 면책: h1 아래, 요약 위
      const disclaimer = page.getByText(DREAM_DISCLAIMER_TEXT);
      await expect(disclaimer).toBeVisible();
      const h1Box = await h1.boundingBox();
      const dBox = await disclaimer.boundingBox();
      const sBox = await page.getByText(topic.summary).boundingBox();
      expect(dBox?.y).toBeGreaterThan(h1Box?.y ?? 0);
      expect(dBox?.y).toBeLessThan(sBox?.y ?? 0);

      // 풀이 기준과 하단 짧은 면책
      await expect(page.getByText(DREAM_BASIS_TEXT)).toBeVisible();
      await expect(page.getByText(DREAM_BOTTOM_NOTICE_TEXT)).toHaveCount(1);
      await expect(page.getByText(DREAM_BOTTOM_NOTICE_TEXT)).toBeVisible();
      const bBox = await page.getByText(DREAM_BOTTOM_NOTICE_TEXT).boundingBox();
      expect(bBox?.y).toBeGreaterThan(sBox?.y ?? 0);

      expect(errors.page).toEqual([]);
      expect(errors.console).toEqual([]);
    });

    test(`AC-13, AC-15: ${topic.slug} 관련 소재 2~4개 이동, 허브 링크`, async ({
      page,
    }) => {
      await page.goto(`${HUB}/${topic.slug}`);
      const links = page
        .getByRole('heading', { name: DREAM_SECTION_TITLES.related })
        .locator('xpath=following-sibling::ul[1]')
        .getByRole('link');
      await expect(links.first()).toBeVisible();
      const n = await links.count();
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(4);
      const firstRel = DREAM_TOPICS.find((t) => t.slug === topic.related[0]);
      expect(firstRel).toBeTruthy();
      await links.first().click();
      await expect(page).toHaveURL(new RegExp(`/dream/${firstRel?.slug}$`));
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        firstRel?.keywordName ?? ''
      );

      // 허브로 돌아가는 링크 세 가지
      await page.goto(`${HUB}/${topic.slug}`);
      await page.getByRole('link', { name: DREAM_BACK_LINK_LABEL }).click();
      await expect(page).toHaveURL(/\/dream$/);
      await page.goto(`${HUB}/${topic.slug}`);
      await page.getByRole('link', { name: DREAM_BASIS_LINK_LABEL }).click();
      await expect(page).toHaveURL(/\/dream$/);
      await page.goto(`${HUB}/${topic.slug}`);
      await page
        .getByRole('navigation', { name: '이동 경로' })
        .getByRole('link', { name: '꿈 해몽', exact: true })
        .click();
      await expect(page).toHaveURL(/\/dream$/);
    });

    test(`AC-14: ${topic.slug} FAQ 2개와 FAQPage JSON-LD가 같다`, async ({
      page,
    }) => {
      await page.goto(`${HUB}/${topic.slug}`);
      await expect(
        page.getByRole('heading', { level: 2, name: DREAM_FAQ_TITLE })
      ).toBeVisible();
      for (const f of topic.faq) {
        await expect(
          page.getByRole('heading', { level: 3, name: f.question })
        ).toBeVisible();
        await expect(page.getByText(f.answer, { exact: true })).toBeVisible();
      }
      const faq = (await jsonLd(page)).find((d) => d['@type'] === 'FAQPage');
      expect(faq).toBeTruthy();
      const entities = (faq?.mainEntity ?? []) as {
        name: string;
        acceptedAnswer: { text: string };
      }[];
      expect(entities.map((e) => [e.name, e.acceptedAnswer.text])).toEqual(
        topic.faq.map((f) => [f.question, f.answer])
      );
    });

    test(`AC-24: ${topic.slug} 하단 상담 안내에 다섯 번호가 순서대로 있다`, async ({
      page,
    }) => {
      await page.goto(`${HUB}/${topic.slug}`);
      const box = page
        .getByRole('heading', { name: DREAM_CRISIS_PHONES_TITLE, exact: true })
        .locator('xpath=..');
      await expect(box).toBeVisible();
      // biome-ignore lint/performance/useDomNodeTextContent: 화면에 보이는 글자만 비교해야 해서 innerText를 쓴다
      const text = await box.innerText();
      let last = -1;
      for (const p of CRISIS_PHONES) {
        const idx = text.indexOf(p.displayNumber);
        expect(idx, p.displayNumber).toBeGreaterThan(last);
        last = idx;
      }
    });

    test(`AC-19, AC-20: ${topic.slug} /lotto 링크·입력칸·textarea 없음`, async ({
      page,
    }) => {
      await page.goto(`${HUB}/${topic.slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(main(page).locator('a[href*="/lotto"]')).toHaveCount(0);
      await expect(main(page).locator('input')).toHaveCount(0);
      await expect(main(page).locator('textarea')).toHaveCount(0);
    });
  }

  test('AC-23: 민감 소재는 완화 블록과 전문가 상담 안내가 보인다', async ({
    page,
  }) => {
    await page.goto(`${HUB}/${SENSITIVE.slug}`);
    await expect(
      page.getByRole('heading', { name: DREAM_SOOTHING_TITLE })
    ).toBeVisible();
    await expect(page.getByText(DREAM_REPEAT_NOTICE_TEXT)).toBeVisible();
    expect(DREAM_REPEAT_NOTICE_TEXT).toContain('전문가와 상담');
    if (SENSITIVE.sensitivity !== 'none') {
      for (const s of SENSITIVE.soothing) {
        await expect(page.getByText(s)).toBeVisible();
      }
    }
    await expect(page.getByText(DREAM_DEATH_SUPPLEMENT_TEXT)).toHaveCount(0);
  });

  test('AC-23: 죽음 소재는 "실제 죽음을 뜻하지 않는다" 설명이 함께 보인다', async ({
    page,
  }) => {
    await page.goto(`${HUB}/${DEATH.slug}`);
    await expect(
      page.getByRole('heading', { name: DREAM_SOOTHING_TITLE })
    ).toBeVisible();
    await expect(page.getByText(DREAM_DEATH_SUPPLEMENT_TEXT)).toBeVisible();
    expect(DREAM_DEATH_SUPPLEMENT_TEXT).toContain(
      '실제 죽음을 뜻하지는 않으며'
    );
    await expect(page.getByText(DREAM_REPEAT_NOTICE_TEXT)).toBeVisible();
  });

  test('AC-23: 일반 소재에는 완화 블록이 없다', async ({ page }) => {
    await page.goto(`${HUB}/${NORMAL.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: DREAM_SOOTHING_TITLE })
    ).toHaveCount(0);
  });

  test('띠 동물 소재만 띠별 운세 링크와 동의 안내가 보인다', async ({
    page,
  }) => {
    await page.goto(`${HUB}/${TTI.slug}`);
    const link = page.getByRole('link', { name: DREAM_TTI_LINK_LABEL });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', DREAM_TTI_PATH);
    await expect(page.getByText(DREAM_TTI_CONSENT_NOTICE)).toBeVisible();
    await page.goto(`${HUB}/${NORMAL.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: DREAM_TTI_LINK_LABEL })
    ).toHaveCount(0);
  });

  test('AC-16: 없는 소재 주소는 404이고 루트 404 화면이 나온다', async ({
    page,
    request,
  }) => {
    for (const bad of ['no-such-topic', 'PIG', 'pig-1']) {
      const res = await request.get(`${HUB}/${bad}`);
      expect(res.status(), bad).toBe(404);
    }
    const errors = trackErrors(page);
    const res = await page.goto(`${HUB}/no-such-topic`);
    expect(res?.status()).toBe(404);
    // 스트리밍 중 404 본문이 잠시 중복되므로(사이트 전체 현상) 네트워크가 잠잠해진 뒤 개수 단언으로 검사한다
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('페이지를 찾을 수 없습니다')).toHaveCount(1);
    await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
    // 404 화면은 스트리밍 중 h1이 잠시 2개일 수 있어(사이트 전체 현상) 재시도 단언으로 안정 후 1개를 검사한다
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect(errors.page).toEqual([]);
  });
});

// ======================================================================
// JS를 끈 서버 HTML (AC-7, 8, 9, 14)
// ======================================================================
test.describe('서버 HTML (JS 없음)', () => {
  test('AC-7, AC-8, AC-20: 허브 HTML에 면책·목록 120개·FAQ·상담 번호가 있다', async ({
    request,
  }) => {
    const res = await request.get(HUB);
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    const text = htmlToText(html);
    expect(text).toContain(squash(DREAM_DISCLAIMER_TEXT));
    expect(text).toContain(squash(DREAM_BASIS_TEXT));
    expect(text).toContain(squash(DREAM_SEARCH_NOSCRIPT_TEXT));
    for (const item of DREAM_DETAIL_NOTICE_ITEMS) expect(text).toContain(item);
    for (const f of DREAM_HUB_FAQ) {
      expect(text).toContain(f.question);
      expect(text).toContain(squash(f.answer));
    }
    for (const p of CRISIS_PHONES) expect(text).toContain(p.displayNumber);

    const scriptless = html.replace(/<script[\s\S]*?<\/script>/g, '');
    const anchors = [
      ...scriptless.matchAll(
        /<a\b[^>]*href="\/dream\/([a-z-]+)"[^>]*>([^<]*)<\/a>/g
      ),
    ];
    expect(anchors.length).toBe(TOTAL);
    expect(anchors.map((m) => m[1]).sort()).toEqual([...SLUGS].sort());
    for (const m of anchors) {
      const t = DREAM_TOPICS.find((x) => x.slug === m[1]);
      expect(m[2]).toBe(t?.name);
    }
    expect((scriptless.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    expect((scriptless.match(/<textarea/g) ?? []).length).toBe(0);
  });

  test('AC-9, AC-14, AC-27, AC-28: 대표 소재 상세 HTML에 본문·FAQ·면책이 있다', async ({
    request,
  }) => {
    for (const t of SAMPLES) {
      const res = await request.get(`${HUB}/${t.slug}`);
      expect(res.status(), t.slug).toBe(200);
      const html = await res.text();
      const text = htmlToText(html);
      expect(text, t.slug).toContain(t.summary);
      expect(text).toContain(squash(t.folk.join(' ')));
      expect(text).toContain(squash(t.reflection.join(' ')));
      for (const f of t.faq) {
        expect(text).toContain(f.question);
        expect(text).toContain(squash(f.answer));
      }
      expect(text).toContain(squash(DREAM_DISCLAIMER_TEXT));
      expect(text).toContain(squash(DREAM_BOTTOM_NOTICE_TEXT));
    }
  });

  test('AC-9, AC-11, AC-17~19, AC-27, AC-28, AC-40: 상세 120개 HTML 전수 점검', async ({
    request,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      '뷰포트와 무관한 HTML 점검이라 데스크톱에서만 실행한다'
    );
    test.setTimeout(300_000);
    const problems: string[] = [];
    for (const t of DREAM_TOPICS) {
      const res = await request.get(`${HUB}/${t.slug}`);
      if (res.status() !== 200) {
        problems.push(`${t.slug}: status ${res.status()}`);
        continue;
      }
      const html = await res.text();
      const scriptless = html.replace(/<script[\s\S]*?<\/script>/g, '');
      const text = htmlToText(html);
      const body = mainHtml(scriptless);
      if ((scriptless.match(/<h1[\s>]/g) ?? []).length !== 1)
        problems.push(`${t.slug}: h1 개수`);
      if (!text.includes(squash(DREAM_DISCLAIMER_TEXT)))
        problems.push(`${t.slug}: 상시 면책 없음`);
      if (!text.includes(squash(DREAM_BOTTOM_NOTICE_TEXT)))
        problems.push(`${t.slug}: 하단 면책 없음`);
      if (!text.includes(t.summary)) problems.push(`${t.slug}: 요약 없음`);
      if (!text.includes(squash(t.folk.join(' '))))
        problems.push(`${t.slug}: 민간 풀이 없음`);
      if (!text.includes(squash(t.reflection.join(' '))))
        problems.push(`${t.slug}: 생각해 볼 점 없음`);
      for (const p of CRISIS_PHONES)
        if (!text.includes(p.displayNumber))
          problems.push(`${t.slug}: 번호 ${p.displayNumber} 없음`);
      if (/href="\/lotto/.test(body)) problems.push(`${t.slug}: /lotto 링크`);
      if (/<textarea/.test(body)) problems.push(`${t.slug}: textarea`);
      if (/noindex/i.test(scriptless)) problems.push(`${t.slug}: noindex`);
      const title = /<title>([^<]*)<\/title>/.exec(scriptless)?.[1] ?? '';
      if (!title.includes(t.keywordName)) problems.push(`${t.slug}: title`);
      const bodyText = htmlToText(body);
      for (const w of ['길몽', '흉몽', '로또', '복권', '당첨', '태몽'])
        if (bodyText.includes(w)) problems.push(`${t.slug}: 금지어 ${w}`);
    }
    expect(problems).toEqual([]);
  });
});

// ======================================================================
// SEO
// ======================================================================
test.describe('SEO', () => {
  test('AC-38, AC-39, AC-40: 허브 메타데이터와 BreadcrumbList', async ({
    page,
  }) => {
    const res = await page.goto(HUB);
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(new RegExp(DREAM_HUB_SEO.title));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      DREAM_HUB_SEO.description
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/dream$/
    );
    for (const prop of ['og:title', 'og:description', 'og:image', 'og:url']) {
      await expect(
        page.locator(`meta[property="${prop}"]`).first()
      ).toHaveAttribute('content', /.+/);
    }
    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      expect(await robots.first().getAttribute('content')).not.toMatch(
        /noindex/i
      );
    }
    const crumbs = (await jsonLd(page)).find(
      (d) => d['@type'] === 'BreadcrumbList'
    );
    const items = (crumbs?.itemListElement ?? []) as {
      position: number;
      name: string;
      item: string;
    }[];
    expect(items.map((i) => i.name)).toEqual([SITE_NAME, '꿈 해몽']);
    expect(items[1].item).toMatch(/\/dream$/);
    const types = (await jsonLd(page)).map((d) => String(d['@type']));
    expect(types.join(',')).not.toMatch(/Review|AggregateRating|Rating/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  for (const topic of SAMPLES) {
    test(`AC-38, AC-39, AC-40: ${topic.slug} 메타데이터와 JSON-LD`, async ({
      page,
    }) => {
      const res = await page.goto(`${HUB}/${topic.slug}`);
      expect(res?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(new RegExp(topic.keywordName));
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveAttribute('content', /.+/);
      expect(await desc.getAttribute('content')).toContain(topic.summary);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`/dream/${topic.slug}$`)
      );
      for (const prop of ['og:title', 'og:description', 'og:image']) {
        await expect(
          page.locator(`meta[property="${prop}"]`).first()
        ).toHaveAttribute('content', /.+/);
      }
      const robots = page.locator('meta[name="robots"]');
      if ((await robots.count()) > 0) {
        expect(await robots.first().getAttribute('content')).not.toMatch(
          /noindex/i
        );
      }
      const all = await jsonLd(page);
      const crumbs = all.find((d) => d['@type'] === 'BreadcrumbList');
      const items = (crumbs?.itemListElement ?? []) as {
        position: number;
        name: string;
        item: string;
      }[];
      expect(items).toHaveLength(3);
      expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
      expect(items[0].name).toBeTruthy();
      expect(items[1].name).toBe('꿈 해몽');
      expect(items[1].item).toMatch(/\/dream$/);
      expect(items[2].name).toBe(topic.keywordName);
      expect(items[2].item).toMatch(new RegExp(`/dream/${topic.slug}$`));
      expect(all.map((d) => String(d['@type'])).join(',')).not.toMatch(
        /Review|Rating|Article/
      );
    });
  }

  test('AC-37, AC-44: sitemap.xml에 /dream과 소재 상세 120개가 모두 있다', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const paths = locs.map((l) => new URL(l).pathname);
    const dream = paths.filter((p) => p === HUB || p.startsWith(`${HUB}/`));
    expect(new Set(dream).size).toBe(dream.length);
    expect([...dream].sort()).toEqual(
      [HUB, ...SLUGS.map((s) => `${HUB}/${s}`)].sort()
    );
    expect(dream).toHaveLength(TOTAL + 1);
    for (const l of locs.filter((x) => x.includes('/dream'))) {
      expect(l).not.toMatch(/[?#]/);
    }
  });

  test('AC-38: robots.txt가 /dream을 막지 않고 sitemap을 알린다', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toMatch(/Sitemap:\s*\S+\/sitemap\.xml/i);
    expect(txt).not.toMatch(/Disallow:\s*\/dream/i);
    expect(txt).not.toMatch(/Disallow:\s*\/\s*$/m);
  });
});

// ======================================================================
// 메뉴·홈
// ======================================================================
test.describe('메뉴와 홈', () => {
  test('AC-35: 메뉴 데이터에서 꿈 해몽은 독립 그룹이고 준비 중이 아니다', async () => {
    const dream = MENU_LIST.find((g) => g.href === HUB);
    expect(dream?.label).toBe('꿈 해몽');
    expect(dream?.comingSoon).toBeFalsy();
    const fortune = MENU_LIST.find((g) => g.label === '운세');
    expect(fortune?.items.some((i) => i.href.startsWith(HUB))).toBe(false);
  });

  test('AC-35: 헤더(PC·모바일) 메뉴의 "꿈 해몽"을 누르면 /dream으로 간다', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: '메뉴 열기' }).click();
      const link = page
        .getByRole('dialog')
        .getByRole('link', { name: '꿈 해몽', exact: true });
      await expect(link).toBeVisible();
      await expect(link).not.toContainText('준비 중');
      await link.click();
    } else {
      const link = page.getByRole('link', { name: '꿈 해몽', exact: true });
      await expect(link).toBeVisible();
      await expect(link).not.toContainText('준비 중');
      await link.click();
    }
    await expect(page).toHaveURL(/\/dream$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('꿈 해몽');
  });

  test('AC-36: 홈에 "꿈 해몽" 메뉴 카드가 보이고 /dream으로 간다', async ({
    page,
  }) => {
    await page.goto('/');
    const card = main(page).getByRole('link', { name: /꿈 해몽/ });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('href', HUB);
    await expect(card).not.toContainText('준비 중');
    await card.click();
    await expect(page).toHaveURL(/\/dream$/);
  });
});

// ======================================================================
// 쿠키 거절·광고 차단 (AC-22, AC-30)
// ======================================================================
test.describe('쿠키 거절과 광고 차단', () => {
  test('AC-22: 쿠키 동의를 거부해도 검색·목록·상세 읽기가 동작한다', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto(HUB);
    await page.getByRole('button', { name: '쿠키 거부' }).click();
    await expect(
      page.getByRole('region', { name: '쿠키 동의 배너' })
    ).toHaveCount(0);
    await page.reload();
    await openHub(page);
    await searchBox(page).fill('돼지');
    await expect(main(page).locator('a[href="/dream/pig"]')).toHaveCount(1);
    await main(page).locator('a[href="/dream/pig"]').click();
    await expect(page).toHaveURL(/\/dream\/pig$/);
    await expect(
      page.getByText(DREAM_TOPICS.find((x) => x.slug === 'pig')?.summary ?? '')
    ).toBeVisible();
    expect(errors.page).toEqual([]);
  });

  test('AC-30: 광고 요청이 막혀도 검색과 상세 열람이 동작한다', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.route(/daumcdn\.net|\.daum\.net|kakao/, (route) =>
      route.abort()
    );
    await openHub(page);
    await searchBox(page).fill('이빨');
    const link = main(page).locator('a[href="/dream/teeth"]');
    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(/\/dream\/teeth$/);
    const t = DREAM_TOPICS.find((x) => x.slug === 'teeth');
    await expect(page.getByText(t?.summary ?? '')).toBeVisible();
    expect(errors.page).toEqual([]);
  });
});

// ======================================================================
// 키보드
// ======================================================================
test.describe('키보드 포커스', () => {
  test('검색칸에서 Tab을 누르면 첫 소재 링크로 가고 Enter로 상세에 간다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).focus();
    await page.keyboard.press('Tab');
    const first = main(page).locator('a[href^="/dream/"]').first();
    await expect(first).toBeFocused();
    const ring = await first.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        shadow: s.boxShadow,
        outline: s.outlineStyle,
        width: s.outlineWidth,
      };
    });
    expect(
      ring.shadow !== 'none' ||
        (ring.outline !== 'none' && ring.width !== '0px')
    ).toBe(true);
    const href = await first.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('빈 상태에서 Tab → Enter로 "전체 목록 보기"를 눌러 입력칸으로 돌아온다', async ({
    page,
  }) => {
    await openHub(page);
    await searchBox(page).fill('가나다라없는소재');
    await expect(page.getByText(DREAM_EMPTY_TITLE)).toBeVisible();
    await searchBox(page).focus();
    await page.keyboard.press('Tab');
    const reset = page.getByRole('button', { name: DREAM_EMPTY_BUTTON_LABEL });
    await expect(reset).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(searchBox(page)).toHaveValue('');
    await expect(searchBox(page)).toBeFocused();
    expect((await visibleSlugs(page)).length).toBe(TOTAL);
  });

  test('위기 안내가 떠도 입력칸 포커스는 유지된다', async ({ page }) => {
    await openHub(page);
    await searchBox(page).click();
    await page.keyboard.type('죽고 싶다');
    await expect(page.getByText(DREAM_CRISIS_PANEL_TITLE)).toBeVisible();
    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveValue('죽고 싶다');
  });

  test('상세에서 Tab으로 관련 소재 링크에 닿고 Enter로 이동한다', async ({
    page,
  }) => {
    await page.goto(`${HUB}/${NORMAL.slug}`);
    const first = page
      .getByRole('heading', { name: DREAM_SECTION_TITLES.related })
      .locator('xpath=following-sibling::ul[1]')
      .getByRole('link')
      .first();
    await expect(first).toBeVisible();
    let reached = false;
    for (let i = 0; i < 80 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = await first.evaluate((el) => el === document.activeElement);
    }
    expect(reached).toBe(true);
    const href = await first.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
});

// ======================================================================
// 흐름
// ======================================================================
test('AC-41: 허브 → 검색 → 상세 → 관련 소재 흐름이 끊기지 않는다', async ({
  page,
}) => {
  const errors = trackErrors(page);
  await openHub(page);
  await searchBox(page).fill('이빨빠지는');
  const link = main(page).locator('a[href="/dream/teeth"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL(/\/dream\/teeth$/);
  const topic = DREAM_TOPICS.find((t) => t.slug === 'teeth');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    topic?.keywordName ?? ''
  );
  const rel = page
    .getByRole('heading', { name: DREAM_SECTION_TITLES.related })
    .locator('xpath=following-sibling::ul[1]')
    .getByRole('link')
    .first();
  const relSlug = topic?.related[0];
  await rel.click();
  await expect(page).toHaveURL(new RegExp(`/dream/${relSlug}$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/dream\/teeth$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dream$/);
  await expect(searchBox(page)).toBeVisible();
  expect(errors.page).toEqual([]);
  expect(errors.console).toEqual([]);
});
