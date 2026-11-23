import {
  expect as baseExpect,
  type Page,
  type TestInfo,
  test,
} from '@playwright/test';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_DAILY_SEO,
  TAROT_THREE_CARD_SEO,
} from '@/features/tarot/constants/tarot-seo.constant';
import { TAROT_TOPICS } from '@/features/tarot/constants/tarot-topic.constant';
import type { TarotTopicSelectionType } from '@/features/tarot/types/tarot.type';
import { getTarotTopicReading } from '@/features/tarot/utils/tarot-topic.util';
import {
  declineCookies,
  recordRequests,
  storageSnapshot,
  waitForHydration,
  watchPageErrors,
} from './helpers/common.util';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

const DAILY_PATH = '/tarot/daily';
const THREE_PATH = '/tarot/three-card';
const PAGES = [
  { path: DAILY_PATH, h1: '오늘의 타로', seo: TAROT_DAILY_SEO },
  {
    path: THREE_PATH,
    h1: '3장 타로 (과거·현재·미래)',
    seo: TAROT_THREE_CARD_SEO,
  },
] as const;

const TAROT_KEY_SUFFIX = '_tarot_daily_v1';
const CRISIS_TITLE = '카드를 보기 전에 전해 드릴 안내가 있습니다';
const CRISIS_QUESTION = '죽고 싶어';
const CARD_FACE_NAME = /카드, (정방향|역방향)$/;
const RESULT_LINE =
  '마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담전화에서 이야기를 나눠 보시기 바랍니다. 모두 24시간 운영합니다.';
const FILTER_TOPICS = TAROT_TOPICS.filter((t) => t.key !== 'all');

// ---------- 도우미 ----------

async function openIdle(page: Page, pagePath: string) {
  const res = await page.goto(pagePath);
  expect(res?.status()).toBeLessThan(400);
  await declineCookies(page);
  await waitForHydration(page);
}

type StoredCard = {
  v: number;
  date: string;
  cardId: number;
  isReversed: boolean;
};

const readEntries = (page: Page) =>
  page.evaluate(
    (suffix) =>
      Object.keys(localStorage)
        .filter((key) => key.endsWith(suffix))
        .map((key) => localStorage.getItem(key)),
    TAROT_KEY_SUFFIX
  );

async function readStoredCard(page: Page): Promise<StoredCard> {
  const entries = await readEntries(page);
  expect(entries, '타로 localStorage 키는 정확히 1개').toHaveLength(1);
  return JSON.parse(entries[0] ?? 'null') as StoredCard;
}

const questionInput = (page: Page) => page.getByLabel('질문 (선택)');
const dailyDrawButton = (page: Page) =>
  page.getByRole('button', { name: '카드 뽑기', exact: true });
const threeDrawButton = (page: Page) =>
  page.getByRole('button', { name: '세 장 뽑기', exact: true });
const reversedSwitch = (page: Page) =>
  page.getByRole('switch', { name: '역방향 사용' });
const topicChip = (page: Page, label: string) =>
  page
    .getByRole('group', { name: '분야' })
    .getByRole('button', { name: label, exact: true });
const resultPhoneList = (page: Page) =>
  page.getByRole('list', { name: RESULT_LINE });

function cardHeadingName(cardId: number): string {
  const card = TAROT_CARDS[cardId];
  return `${card.nameKo} (${card.nameEn})`;
}

async function drawDaily(page: Page): Promise<StoredCard> {
  await dailyDrawButton(page).click();
  await expect.poll(async () => (await readEntries(page)).length).toBe(1);
  const stored = await readStoredCard(page);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: cardHeadingName(stored.cardId),
    })
  ).toBeVisible();
  return stored;
}

async function drawThree(page: Page) {
  await threeDrawButton(page).click();
  await expect(
    page.getByRole('heading', { level: 2, name: '세 장의 결과' })
  ).toBeVisible();
}

/**
 * 상담전화 5개 표시는 기기별이다. desktop = PC(번호는 글자, 보이는 tel: 링크 없음),
 * mobile = 터치(번호가 tel: 링크)
 */
async function expectPhoneList(page: Page, testInfo: TestInfo) {
  const list = resultPhoneList(page);
  await expect(list.getByRole('listitem')).toHaveCount(CRISIS_PHONES.length);
  const isPc = testInfo.project.name === 'desktop';
  if (isPc) {
    await expect(list.getByRole('link')).toHaveCount(0);
    await expect(
      list.locator('a[href^="tel:"]').filter({ visible: true })
    ).toHaveCount(0);
    return;
  }
  await expect(list.getByRole('link')).toHaveCount(CRISIS_PHONES.length);
  for (const phone of CRISIS_PHONES) {
    await expect(
      list.getByRole('link', {
        name: `${phone.name} ${phone.displayNumber} ${phone.description}`,
        exact: true,
      })
    ).toHaveAttribute('href', phone.href);
  }
}

// ---------- 오늘의 타로 ----------

test.describe('오늘의 타로', () => {
  test(
    '오늘의 타로: 뽑으면 카드 결과, 면책, 상담전화 5개가 보인다',
    { tag: '@smoke' },
    async ({ page }, testInfo) => {
      const { pageErrors, hydration } = watchPageErrors(page);
      await openIdle(page, DAILY_PATH);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole('img', { name: '타로 카드 뒷면', exact: true }).first()
      ).toBeVisible();

      const stored = await drawDaily(page);
      expect(stored.cardId).toBeGreaterThanOrEqual(0);
      expect(stored.cardId).toBeLessThan(78);
      await expect(
        page.getByRole('img', { name: CARD_FACE_NAME }).first()
      ).toBeVisible();
      await expect(
        page.getByText(/타로는 오락과 자기 성찰을 위한 콘텐츠/).first()
      ).toBeVisible();
      await expectPhoneList(page, testInfo);
      expect(pageErrors).toEqual([]);
      expect(hydration).toEqual([]);
    }
  );

  test('같은 날 재방문하면 같은 카드가 복원되고 재뽑기 버튼이 없다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    const first = await drawDaily(page);
    await page.reload();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: cardHeadingName(first.cardId),
      })
    ).toBeVisible();
    await expect(page.getByText(/오늘 뽑은 카드입니다/)).toBeVisible();
    await expect(dailyDrawButton(page)).toHaveCount(0);
    expect(await readStoredCard(page)).toEqual(first);
  });

  test.describe('날짜 경계', () => {
    test.use({ timezoneId: 'America/Los_Angeles' });

    test('기기 시간대가 달라도 한국 시간 자정이 지나면 새 카드를 뽑는다', async ({
      page,
    }) => {
      // 2026-03-01 23:59:30 KST
      await page.clock.setFixedTime(new Date('2026-03-01T14:59:30Z'));
      await openIdle(page, DAILY_PATH);
      const before = await drawDaily(page);
      expect(before.date).toBe('2026-03-01');

      // 2026-03-02 00:00:30 KST
      await page.clock.setFixedTime(new Date('2026-03-01T15:00:30Z'));
      await page.reload();
      await waitForHydration(page);
      await expect(dailyDrawButton(page)).toBeVisible();
      expect(await readEntries(page)).toHaveLength(0);
      const after = await drawDaily(page);
      expect(after.date).toBe('2026-03-02');
    });
  });

  test('역방향을 끄면 정방향만 나오고 분야 칩으로 분야 문장이 바뀐다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await expect(reversedSwitch(page)).toBeChecked();
    await reversedSwitch(page).click();
    await expect(reversedSwitch(page)).not.toBeChecked();
    const stored = await drawDaily(page);
    expect(stored.isReversed).toBe(false);
    await expect(
      page
        .getByRole('img', {
          name: `${TAROT_CARDS[stored.cardId].nameKo} 카드, 정방향`,
          exact: true,
        })
        .first()
    ).toBeVisible();

    const card = TAROT_CARDS[stored.cardId];
    const topic = FILTER_TOPICS[0];
    const sentence = getTarotTopicReading(
      card,
      stored.isReversed,
      topic.key as TarotTopicSelectionType
    ) as string;
    await expect(page.getByText(sentence, { exact: true })).toHaveCount(0);
    await topicChip(page, topic.label).click();
    await expect(topicChip(page, topic.label)).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByText(sentence, { exact: true })).toBeVisible();
    await topicChip(page, '전체').click();
    await expect(page.getByText(sentence, { exact: true })).toHaveCount(0);
    expect(await readStoredCard(page)).toEqual(stored);
  });
});

// ---------- 3장 타로 ----------

test.describe('3장 타로', () => {
  test('3장 타로: 세 장 결과와 흐름 이야기가 나온다', {
    tag: '@smoke',
  }, async ({ page }) => {
    const { pageErrors, hydration } = watchPageErrors(page);
    await openIdle(page, THREE_PATH);
    await drawThree(page);

    const headings = page.getByRole('heading', {
      level: 3,
      name: /^(과거|현재|미래)$/,
    });
    await expect(headings).toHaveCount(3);
    expect(await headings.allTextContents()).toEqual(['과거', '현재', '미래']);

    const faces = page.getByRole('img', { name: CARD_FACE_NAME });
    await expect(faces).toHaveCount(3);
    const labels = await faces.evaluateAll((els) =>
      els.map((el) => el.getAttribute('aria-label') ?? '')
    );
    expect(new Set(labels.map((l) => l.split(' 카드')[0])).size).toBe(3);

    await expect(
      page.getByRole('heading', { level: 2, name: '흐름 이야기' })
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
    expect(hydration).toEqual([]);
  });
});

// ---------- 질문 비저장, 위기 안내 ----------

test.describe('질문과 위기 안내', () => {
  test('질문은 네트워크·저장소·URL·콘솔에 남지 않는다', async ({ page }) => {
    const token = 'zxqa비밀토큰7391';
    const messages: string[] = [];
    await openIdle(page, DAILY_PATH);
    page.on('console', (msg) => messages.push(msg.text()));
    const requests = recordRequests(page);

    await questionInput(page).fill(token);
    const stored = await drawDaily(page);
    await expect(page.getByText(`질문: ${token}`)).toBeVisible();

    const encoded = encodeURIComponent(token);
    for (const req of requests) {
      expect(req.url).not.toContain(encoded);
      expect(req.url).not.toContain(token);
      expect(req.body).not.toContain(token);
      expect(req.body).not.toContain(encoded);
    }
    expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([]);

    const snapshot = await storageSnapshot(page);
    expect(snapshot.local).not.toContain(token);
    expect(snapshot.session).not.toContain(token);
    expect(decodeURIComponent(snapshot.cookie)).not.toContain(token);
    expect(decodeURIComponent(page.url())).not.toContain(token);
    expect(messages.join('\n')).not.toContain(token);

    // 저장 값은 날짜, 카드 번호, 방향뿐이다
    expect(Object.keys(stored).sort()).toEqual(
      ['cardId', 'date', 'isReversed', 'v'].sort()
    );
  });

  test('위기 표현을 넣으면 상담 안내가 먼저 나오고 계속 보기로 결과를 본다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await questionInput(page).fill(CRISIS_QUESTION);
    await dailyDrawButton(page).click();

    const region = page.getByRole('region', { name: CRISIS_TITLE });
    await expect(region).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: /\(.+\)$/ })
    ).toHaveCount(0);

    await region.getByRole('button', { name: '계속 보기' }).click();
    await expect(region).toBeHidden();
    const stored = await readStoredCard(page);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: cardHeadingName(stored.cardId),
      })
    ).toBeVisible();
    await expect(
      page.getByText(/전문가와 상담하시기 바랍니다/).first()
    ).toBeVisible();
  });
});

// ---------- JS 끔, SEO ----------

test.describe('JS 끔', () => {
  test.use({ javaScriptEnabled: false });

  test('서버 HTML에 본문, 면책, 상담전화 5개가 있다', async ({ request }) => {
    for (const target of PAGES) {
      const res = await request.get(target.path);
      expect(res.status(), target.path).toBeLessThan(400);
      const html = await res.text();
      expect(html).toContain(target.h1);
      expect(html).toContain(RESULT_LINE);
      for (const phone of CRISIS_PHONES) {
        expect(html, phone.href).toContain(`href="${phone.href}"`);
        expect(html, phone.displayNumber).toContain(phone.displayNumber);
      }
      // 뽑기 전이라 위기 패널은 서버 HTML에 없다
      expect(html).not.toContain(CRISIS_TITLE);
    }
  });
});

test('SEO: 두 페이지의 h1, title, description, canonical, OG와 sitemap', async ({
  page,
  request,
}) => {
  const { pageErrors } = watchPageErrors(page);
  for (const target of PAGES) {
    const res = await page.goto(target.path);
    expect(res?.status(), target.path).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(target.h1);
    expect(await page.title()).toContain(target.seo.title.split(' - ')[0]);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      target.seo.description
    );
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]')
    ).toHaveCount(0);
    expect(
      (await page.locator('link[rel="canonical"]').getAttribute('href')) ?? ''
    ).toContain(target.path);
    for (const prop of ['og:title', 'og:description', 'og:url']) {
      const content = await page
        .locator(`meta[property="${prop}"]`)
        .first()
        .getAttribute('content');
      expect((content ?? '').length, prop).toBeGreaterThan(0);
    }
  }
  expect(pageErrors).toEqual([]);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const target of PAGES) expect(sitemap).toContain(target.path);
});
