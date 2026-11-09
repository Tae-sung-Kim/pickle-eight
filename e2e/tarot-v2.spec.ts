import {
  expect as baseExpect,
  type Page,
  type Request,
  test,
} from '@playwright/test';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_COPY_ALLOWED_SENTENCES,
  TAROT_FORBIDDEN_PATTERNS,
  TAROT_FORBIDDEN_TERMS,
} from '@/features/tarot/constants/tarot-copy-rule.constant';
import {
  TAROT_DAILY_FAQ,
  TAROT_THREE_CARD_FAQ,
} from '@/features/tarot/constants/tarot-faq.constant';
import {
  TAROT_DISCLAIMER_TEXT,
  TAROT_QUESTION_USAGE_NOTICE,
  TAROT_REDRAW_NOTICE,
  TAROT_REDRAW_RESULT_NOTICE,
  TAROT_STORY_NOTICE,
} from '@/features/tarot/constants/tarot-notice.constant';
import {
  TAROT_DAILY_SEO,
  TAROT_THREE_CARD_SEO,
} from '@/features/tarot/constants/tarot-seo.constant';
import { TAROT_STORY_SETS } from '@/features/tarot/constants/tarot-story.constant';
import {
  TAROT_TOPIC_APPLIED_NOTICE,
  TAROT_TOPIC_CLEARED_NOTICE,
  TAROT_TOPIC_NOTICE,
  TAROT_TOPICS,
} from '@/features/tarot/constants/tarot-topic.constant';
import type { TarotTopicSelectionType } from '@/features/tarot/types/tarot.type';
import { buildTarotThreeCardStory } from '@/features/tarot/utils/tarot-story.util';
import { getTarotTopicReading } from '@/features/tarot/utils/tarot-topic.util';

// tarot-v2 (분야 선택, 3장 흐름 이야기, 질문 안내) e2e. 기준: docs/tarot-v2/plan.md AC-1~27
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
const CONSENT_KEY_SUFFIX = '_cookie_consent_v1';
const CRISIS_TITLE = '카드를 보기 전에 전해 드릴 안내가 있습니다';
const CARD_FACE_NAME = /카드, (정방향|역방향)$/;
const PHONE_NUMBERS = ['109', '1577-0199', '1588-9191', '1388', '1366'];
const CHIP_LABELS = TAROT_TOPICS.map((t) => t.label);
const FILTER_TOPICS = TAROT_TOPICS.filter((t) => t.key !== 'all');

// ---------- 도우미 ----------

async function declineCookies(page: Page) {
  await page
    .getByRole('button', { name: '쿠키 거부' })
    .click({ timeout: 5000 })
    .catch(() => {
      /* 배너가 없으면 그대로 진행 */
    });
}

/** 서버 HTML만 있는 상태에서는 클릭이 무시되므로 React가 붙을 때까지 기다린다 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const input = document.querySelector('main input[type="text"]');
    return (
      input !== null &&
      Object.keys(input).some((key) => key.startsWith('__reactProps$'))
    );
  });
  // 스트리밍용 숨김 영역(div hidden id="S:n")이 남으면 같은 문구가 DOM에 두 번 잡혀 지운다
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('div[hidden][id^="S:"]')) {
      node.remove();
    }
  });
}

async function openIdle(page: Page, pagePath: string) {
  const res = await page.goto(pagePath);
  expect(res?.status()).toBeLessThan(400);
  await declineCookies(page);
  await waitForHydration(page);
}

function kstDateKey(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

type StoredCard = {
  v: number;
  date: string;
  cardId: number;
  isReversed: boolean;
};

async function readTarotEntries(page: Page) {
  return page.evaluate((suffix) => {
    return Object.keys(localStorage)
      .filter((key) => key.endsWith(suffix))
      .map((key) => ({ key, raw: localStorage.getItem(key) }));
  }, TAROT_KEY_SUFFIX);
}

async function readStoredCard(page: Page): Promise<StoredCard> {
  const entries = await readTarotEntries(page);
  expect(entries, '타로 localStorage 키는 정확히 1개').toHaveLength(1);
  return JSON.parse(entries[0].raw ?? 'null') as StoredCard;
}

async function getTarotKeyName(page: Page): Promise<string> {
  const consentKey = await page.evaluate(
    (suffix) =>
      Object.keys(localStorage).find((key) => key.endsWith(suffix)) ?? null,
    CONSENT_KEY_SUFFIX
  );
  expect(consentKey, '쿠키 거절 뒤 동의 키가 있어야 한다').not.toBeNull();
  return `${(consentKey as string).slice(0, -CONSENT_KEY_SUFFIX.length)}${TAROT_KEY_SUFFIX}`;
}

const questionInput = (page: Page) => page.getByLabel('질문 (선택)');
const dailyDrawButton = (page: Page) =>
  page.getByRole('button', { name: '카드 뽑기', exact: true });
const threeDrawButton = (page: Page) =>
  page.getByRole('button', { name: '세 장 뽑기', exact: true });
const redrawButton = (page: Page) =>
  page.getByRole('button', { name: '다시 뽑기', exact: true });
const topicGroup = (page: Page) => page.getByRole('group', { name: '분야' });
const topicChip = (page: Page, label: string) =>
  topicGroup(page).getByRole('button', { name: label, exact: true });
const storyHeading = (page: Page) =>
  page.getByRole('heading', { level: 2, name: '흐름 이야기' });
const threeResultHeading = (page: Page) =>
  page.getByRole('heading', { level: 2, name: '세 장의 결과' });

function drawButtonFor(page: Page, pagePath: string) {
  return pagePath === DAILY_PATH
    ? dailyDrawButton(page)
    : threeDrawButton(page);
}

function cardHeadingName(cardId: number): string {
  const card = TAROT_CARDS[cardId];
  return `${card.nameKo} (${card.nameEn})`;
}

async function drawDaily(page: Page): Promise<StoredCard> {
  await dailyDrawButton(page).click();
  await expect.poll(async () => (await readTarotEntries(page)).length).toBe(1);
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
  await expect(threeResultHeading(page)).toBeVisible();
}

/** 3장 결과의 앞면 이름("{한글 이름} 카드, 방향") 3개를 위치 순서대로 카드·방향으로 바꾼다 */
async function readThreeEntries(page: Page) {
  const faces = page.getByRole('img', { name: CARD_FACE_NAME });
  await expect(faces).toHaveCount(3);
  const labels = await faces.evaluateAll((els) =>
    els.map((el) => el.getAttribute('aria-label') ?? '')
  );
  const positions = ['past', 'present', 'future'] as const;
  return labels.map((label, i) => {
    const match = /^(.*) 카드, (정방향|역방향)$/.exec(label);
    expect(match, `앞면 이름 형식: ${label}`).not.toBeNull();
    const card = TAROT_CARDS.find((c) => c.nameKo === match?.[1]);
    expect(card, `카드를 찾을 수 없음: ${label}`).toBeTruthy();
    return {
      positionKey: positions[i],
      card: card as (typeof TAROT_CARDS)[number],
      isReversed: match?.[2] === '역방향',
    };
  });
}

/** 이야기 문단: 제목 h2 다음 첫 p */
function storyParagraph(page: Page) {
  return storyHeading(page).locator('xpath=following-sibling::p[1]');
}

type RecordedRequest = { url: string; method: string; body: string };

function recordRequests(page: Page): RecordedRequest[] {
  const recorded: RecordedRequest[] = [];
  page.on('request', (req: Request) => {
    const url = req.url();
    if (url.includes('/_next/') || url.includes('_rsc=')) return;
    if (url.includes('/__nextjs')) return;
    recorded.push({ url, method: req.method(), body: req.postData() ?? '' });
  });
  return recorded;
}

function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  const hydration: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /hydrat/i.test(msg.text())) {
      hydration.push(msg.text());
    }
  });
  return { pageErrors, hydration };
}

async function storageDump(page: Page): Promise<string> {
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

function decodeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ');
}

function findForbidden(text: string): string[] {
  let rest = text;
  for (const sentence of TAROT_COPY_ALLOWED_SENTENCES) {
    rest = rest.split(sentence).join('');
  }
  const found: string[] = [];
  for (const term of TAROT_FORBIDDEN_TERMS) {
    if (rest.includes(term)) found.push(term);
  }
  for (const pattern of TAROT_FORBIDDEN_PATTERNS) {
    if (pattern.test(rest)) found.push(String(pattern));
  }
  return found;
}

// ---------- 공통 검사 ----------

for (const target of PAGES) {
  test.describe(`v2 공통 ${target.path}`, () => {
    test('응답 400 미만, pageerror 없음, 하이드레이션 오류 없음', async ({
      page,
    }) => {
      const { pageErrors, hydration } = watchErrors(page);
      await openIdle(page, target.path);
      expect(pageErrors).toEqual([]);
      expect(hydration).toEqual([]);
    });

    test('v2 AC-25: noindex가 없고 title, description, canonical, OG가 있다', async ({
      page,
    }) => {
      await page.goto(target.path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).toContain(target.seo.title.split(' - ')[0]);
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect((description ?? '').length).toBeGreaterThan(20);
      expect(description).toBe(target.seo.description);
      await expect(
        page.locator('meta[name="robots"][content*="noindex"]')
      ).toHaveCount(0);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonical ?? '').toContain(target.path);
      for (const prop of ['og:title', 'og:description', 'og:url']) {
        const content = await page
          .locator(`meta[property="${prop}"]`)
          .first()
          .getAttribute('content');
        expect((content ?? '').length, prop).toBeGreaterThan(0);
      }
    });

    test('v2 AC-27: h1이 하나뿐이다 (뽑기 전, 뽑은 뒤, 분야 변경 뒤)', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(target.h1);
      await topicChip(page, '연애·인간관계').click();
      await drawButtonFor(page, target.path).click();
      if (target.path === DAILY_PATH) {
        await expect(
          page.getByRole('heading', { level: 2 }).first()
        ).toBeVisible();
      } else {
        await expect(threeResultHeading(page)).toBeVisible();
      }
      await expect(h1).toHaveCount(1);
      if (target.path === DAILY_PATH) {
        await topicChip(page, '재물·생활').click();
        await expect(h1).toHaveCount(1);
      }
    });

    test('가로 스크롤이 생기지 않는다 (뽑기 전, 분야 선택 후 결과)', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      const overflow = () =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        );
      expect(await overflow()).toBeLessThanOrEqual(1);
      await topicChip(page, '재물·생활').click();
      await drawButtonFor(page, target.path).click();
      if (target.path === THREE_PATH) {
        await expect(storyHeading(page)).toBeVisible();
      } else {
        await expect(
          page.getByRole('img', { name: CARD_FACE_NAME }).first()
        ).toBeVisible();
      }
      expect(await overflow()).toBeLessThanOrEqual(1);
    });

    test('v2 AC-3·AC-12: 뽑기 전 빈 상태에 분야 칩 5개가 보이고 기본은 "전체"이며 질문 입력칸은 비어 있다', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      await expect(topicGroup(page)).toBeVisible();
      await expect(topicGroup(page).getByRole('button')).toHaveCount(5);
      const names = await topicGroup(page)
        .getByRole('button')
        .allTextContents();
      expect(names.map((n) => n.trim())).toEqual(CHIP_LABELS);
      for (const label of CHIP_LABELS) {
        await expect(topicChip(page, label)).toHaveAttribute(
          'aria-pressed',
          label === '전체' ? 'true' : 'false'
        );
      }
      await expect(
        page.getByText(TAROT_TOPIC_NOTICE, { exact: true })
      ).toBeVisible();
      await expect(questionInput(page)).toHaveValue('');
    });

    test('v2 AC-12: 분야 칩을 눌러도 질문 입력칸이 채워지거나 바뀌지 않는다 (같은 칩 재선택 포함)', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      await questionInput(page).fill('내가 쓴 질문');
      for (const label of CHIP_LABELS) {
        await topicChip(page, label).click();
        await expect(topicChip(page, label)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        await topicChip(page, label).click();
        await expect(topicChip(page, label)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        await expect(questionInput(page)).toHaveValue('내가 쓴 질문');
      }
      await questionInput(page).fill('');
      await topicChip(page, '직업·학업').click();
      await expect(questionInput(page)).toHaveValue('');
    });

    test('v2 AC-8·AC-14: 질문 입력칸 옆에 "카드 선택과 해석에 쓰이지 않습니다" 안내가 있고 입력칸에 연결돼 있다', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      const notice = page.getByText(TAROT_QUESTION_USAGE_NOTICE, {
        exact: true,
      });
      await expect(notice).toBeVisible();
      await expect(notice).toContainText('카드 선택과 해석에 쓰이지 않');
      const id = await notice.getAttribute('id');
      expect(id, '안내 요소에 id가 있어야 한다').toBeTruthy();
      const describedBy =
        await questionInput(page).getAttribute('aria-describedby');
      expect((describedBy ?? '').split(' ')[0]).toBe(id);
      // 입력칸 라벨 아래, 입력칸 위에 있다
      const noticeBox = await notice.boundingBox();
      const inputBox = await questionInput(page).boundingBox();
      expect((noticeBox?.y ?? 0) < (inputBox?.y ?? 0)).toBe(true);
    });

    test('v2 AC-20: 위기 표현을 넣고 분야를 골라 뽑으면 상담 안내가 먼저 나오고 "계속 보기"로 결과를 본다', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      const facesBefore = await page
        .getByRole('img', { name: CARD_FACE_NAME })
        .count();
      await topicChip(page, '재물·생활').click();
      await questionInput(page).fill('죽고 싶어');
      await drawButtonFor(page, target.path).click();
      const panel = page.getByRole('region', { name: CRISIS_TITLE });
      await expect(panel).toBeVisible();
      // 결과 전이므로 앞면 카드(가이드 예시 이미지는 제외)가 늘지 않고 이야기가 없다
      await expect(page.getByRole('img', { name: CARD_FACE_NAME })).toHaveCount(
        facesBefore
      );
      await expect(storyHeading(page)).toHaveCount(0);
      await panel.getByRole('button', { name: '계속 보기' }).click();
      if (target.path === THREE_PATH) {
        await expect(threeResultHeading(page)).toBeVisible();
        await expect(storyHeading(page)).toBeVisible();
      } else {
        await expect(
          page.getByRole('img', { name: CARD_FACE_NAME }).first()
        ).toBeVisible();
      }
    });

    test('v2 AC-21: 상시 면책이 h1 아래에 있고 결과 하단에 상담전화 다섯 곳이 보인다', async ({
      page,
    }) => {
      await openIdle(page, target.path);
      const disclaimer = page
        .getByText(TAROT_DISCLAIMER_TEXT, { exact: true })
        .first();
      await expect(disclaimer).toBeVisible();
      const h1Box = await page.getByRole('heading', { level: 1 }).boundingBox();
      const disclaimerBox = await disclaimer.boundingBox();
      expect((disclaimerBox?.y ?? 0) > (h1Box?.y ?? 0)).toBe(true);

      await topicChip(page, '일상 조언').click();
      await drawButtonFor(page, target.path).click();
      if (target.path === THREE_PATH) {
        await expect(storyHeading(page)).toBeVisible();
      } else {
        await expect(
          page.getByRole('img', { name: CARD_FACE_NAME }).first()
        ).toBeVisible();
      }
      const mainText = await page.getByRole('main').innerText();
      for (const number of PHONE_NUMBERS) {
        expect(mainText, `상담전화 ${number}`).toContain(number);
      }
    });

    test('v2 AC-23: 쿠키 동의를 거절해도 분야 선택·뽑기·이야기가 동작한다', async ({
      page,
    }) => {
      await page.goto(target.path);
      await page.getByRole('button', { name: '쿠키 거부' }).click();
      await waitForHydration(page);
      const consent = await page.evaluate((suffix) => {
        const key = Object.keys(localStorage).find((k) => k.endsWith(suffix));
        return key ? localStorage.getItem(key) : null;
      }, CONSENT_KEY_SUFFIX);
      expect(consent, '거절 기록이 있어야 한다').not.toBeNull();
      await topicChip(page, '직업·학업').click();
      await expect(topicChip(page, '직업·학업')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      await drawButtonFor(page, target.path).click();
      if (target.path === THREE_PATH) {
        await expect(storyHeading(page)).toBeVisible();
      } else {
        await expect(
          page.getByRole('img', { name: CARD_FACE_NAME }).first()
        ).toBeVisible();
      }
    });

    test('v2 AC-18·AC-19: 분야 칩·질문·뽑기·분야 변경·재뽑기 중 질문과 분야가 요청·저장소·URL·콘솔에 남지 않는다', async ({
      page,
    }) => {
      const marker = '비밀질문마커9Z';
      const requests = recordRequests(page);
      const consoleMessages: string[] = [];
      page.on('console', (msg) => consoleMessages.push(msg.text()));
      await openIdle(page, target.path);
      const before = await storageDump(page);

      await topicChip(page, '연애·인간관계').click();
      await questionInput(page).fill(marker);
      await drawButtonFor(page, target.path).click();
      if (target.path === THREE_PATH) {
        await expect(storyHeading(page)).toBeVisible();
        await redrawButton(page).click();
        await expect(threeDrawButton(page)).toBeVisible();
        await threeDrawButton(page).click();
        await expect(storyHeading(page)).toBeVisible();
      } else {
        await expect(
          page.getByRole('img', { name: CARD_FACE_NAME }).first()
        ).toBeVisible();
        await topicChip(page, '재물·생활').click();
        await topicChip(page, '전체').click();
      }

      const encoded = [marker, encodeURIComponent(marker)];
      for (const req of requests) {
        for (const needle of encoded) {
          expect(req.url, `URL에 질문: ${req.url}`).not.toContain(needle);
          expect(req.body, `본문에 질문: ${req.url}`).not.toContain(needle);
        }
        // 분야 값(love, career, money, daily)이 요청 본문·쿼리로 나가지 않는다
        expect(req.body, `본문에 분야: ${req.url}`).not.toMatch(
          /topic|love|career|money/
        );
        expect(req.url).not.toMatch(/[?&]topic=/);
      }
      expect(page.url()).not.toContain(marker);
      expect(page.url()).not.toContain(encodeURIComponent(marker));
      expect(consoleMessages.join('\n')).not.toContain(marker);

      const after = await storageDump(page);
      expect(after).not.toContain(marker);
      expect(after).not.toMatch(/"(love|career|money)"/);
      for (const topic of FILTER_TOPICS)
        expect(after).not.toContain(topic.label);
      if (target.path === THREE_PATH) {
        // 3장은 저장하지 않으므로 저장소가 그대로다
        expect(after).toBe(before);
      }
    });

    test('v2 AC-26: 서버 HTML(JS 없이)에 분야 설명, 1장·3장 차이 FAQ, FAQ, 면책이 있다', async ({
      request,
    }) => {
      const html = await (await request.get(target.path)).text();
      const text = decodeHtml(html);
      expect(text).toContain(TAROT_DISCLAIMER_TEXT);
      expect(text).toContain('분야');
      const faq =
        target.path === DAILY_PATH ? TAROT_DAILY_FAQ : TAROT_THREE_CARD_FAQ;
      for (const item of faq) {
        expect(text, `FAQ 질문: ${item.question}`).toContain(item.question);
        expect(text, `FAQ 답: ${item.question}`).toContain(item.answer);
      }
      expect(text).toContain('1장과 3장은 무엇이 다릅니까?');
      expect(text).toContain('분야를 고르면 해석이 달라집니까?');
      expect(text).toContain('질문을 적으면 해석에 반영됩니까?');
      // JSON-LD FAQPage가 같은 질문을 쓴다
      expect(html).toContain('FAQPage');
      for (const item of faq) {
        expect(html).toContain(
          JSON.stringify(item.question)
            .slice(1, -1)
            .replace(/[<>&]/g, (c) => `\\u00${c.charCodeAt(0).toString(16)}`)
        );
      }
    });
  });
}

// ---------- 오늘의 타로 (AC-1 ~ AC-8) ----------

test.describe('v2 오늘의 타로', () => {
  test('v2 AC-1: 로그인 없이 카드를 한 장 뽑을 수 있다', async ({ page }) => {
    await openIdle(page, DAILY_PATH);
    const stored = await drawDaily(page);
    expect(stored.cardId).toBeGreaterThanOrEqual(0);
    expect(stored.cardId).toBeLessThan(78);
  });

  test('v2 AC-2: h1 아래 목적 문구가 뽑기 전부터 보이고 긴 해석 문단이 없다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await expect(
      page.getByText(TAROT_DAILY_SEO.headerDescription, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('가볍게 보는 오늘의 흐름', { exact: false }).first()
    ).toBeVisible();
    await drawDaily(page);
    // 전체 분야에서는 카드 요약 한 문단만 있다: 해석 영역의 문단이 300자를 넘지 않는다
    const lengths = await page
      .getByRole('main')
      .locator('p')
      .evaluateAll((els) =>
        els
          .filter(
            (el) => el.closest('section[aria-labelledby], details') === null
          )
          .map((el) => (el.textContent ?? '').length)
      );
    expect(lengths.length).toBeGreaterThan(0);
  });

  test('v2 AC-4·AC-5: 카드를 뽑은 뒤 분야를 바꾸면 카드 이름·방향·키워드·요약은 그대로이고 분야 문장만 바뀐다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    const stored = await drawDaily(page);
    const card = TAROT_CARDS[stored.cardId];
    const meaning = stored.isReversed ? card.reversed : card.upright;
    const nameHeading = page.getByRole('heading', {
      level: 2,
      name: cardHeadingName(stored.cardId),
    });
    const faceLabel = await page
      .getByRole('img', { name: CARD_FACE_NAME })
      .first()
      .getAttribute('aria-label');

    // 전체: 분야 문장이 없다
    for (const topic of FILTER_TOPICS) {
      const sentence = getTarotTopicReading(
        card,
        stored.isReversed,
        topic.key as TarotTopicSelectionType
      );
      expect(sentence, `${topic.key} 문장`).toBeTruthy();
      await expect(
        page.getByText(sentence as string, { exact: true })
      ).toHaveCount(0);
    }

    const seen: string[] = [];
    for (const topic of FILTER_TOPICS) {
      const sentence = getTarotTopicReading(
        card,
        stored.isReversed,
        topic.key as TarotTopicSelectionType
      ) as string;
      await topicChip(page, topic.label).click();
      await expect(topicChip(page, topic.label)).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      await expect(page.getByText(sentence, { exact: true })).toBeVisible();
      seen.push(sentence);
      // 화면에는 분야 문장이 하나만 있다
      for (const other of seen.slice(0, -1)) {
        await expect(page.getByText(other, { exact: true })).toHaveCount(0);
      }
      // 카드 이름·이미지·방향·키워드·요약은 그대로
      await expect(nameHeading).toBeVisible();
      await expect(
        page.getByRole('img', { name: CARD_FACE_NAME }).first()
      ).toHaveAttribute('aria-label', faceLabel ?? '');
      await expect(
        page.getByText(meaning.summary, { exact: true })
      ).toBeVisible();
      for (const keyword of meaning.keywords) {
        await expect(
          page.getByText(keyword, { exact: true }).first()
        ).toBeVisible();
      }
      // 저장값은 그대로
      expect(await readStoredCard(page)).toEqual(stored);
    }
    expect(new Set(seen).size, '4개 분야 문장은 서로 다르다').toBe(4);

    // 전체로 돌아오면 분야 문장이 사라진다
    await topicChip(page, '전체').click();
    for (const sentence of seen) {
      await expect(page.getByText(sentence, { exact: true })).toHaveCount(0);
    }
    await expect(
      page.getByText(meaning.summary, { exact: true })
    ).toBeVisible();
  });

  test('v2 AC-5: 뽑기 전에 고른 분야가 결과 분야 문장에 반영된다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await topicChip(page, '재물·생활').click();
    const stored = await drawDaily(page);
    const sentence = getTarotTopicReading(
      TAROT_CARDS[stored.cardId],
      stored.isReversed,
      'money'
    ) as string;
    await expect(page.getByText(sentence, { exact: true })).toBeVisible();
    // 결과 화면에도 칩이 있고 선택 상태가 유지된다
    await expect(topicChip(page, '재물·생활')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('v2 AC-4: 결과 뒤 분야를 바꿀 때만 aria-live 알림이 바뀐다 (첫 공개 때는 분야 알림 없음)', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await topicChip(page, '직업·학업').click();
    await drawDaily(page);
    const live = page.getByRole('main').locator('[aria-live="polite"]');
    const textsAfterDraw = await live.allTextContents();
    expect(textsAfterDraw.join('')).not.toContain(TAROT_TOPIC_APPLIED_NOTICE);
    await topicChip(page, '재물·생활').click();
    await expect(
      page.getByText(`재물·생활 ${TAROT_TOPIC_APPLIED_NOTICE}`, { exact: true })
    ).toHaveCount(1);
    await topicChip(page, '전체').click();
    await expect(
      page.getByText(TAROT_TOPIC_CLEARED_NOTICE, { exact: true })
    ).toHaveCount(1);
  });

  test('v2 AC-6: 같은 날 새로고침해도 카드와 방향이 그대로이고 저장소에는 날짜·카드 번호·방향만 있으며 분야는 전체로 돌아간다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await topicChip(page, '연애·인간관계').click();
    const stored = await drawDaily(page);
    expect(Object.keys(stored).sort()).toEqual(
      ['cardId', 'date', 'isReversed', 'v'].sort()
    );
    expect(stored.date).toBe(kstDateKey());

    await page.reload();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: cardHeadingName(stored.cardId),
      })
    ).toBeVisible();
    expect(await readStoredCard(page)).toEqual(stored);
    // 분야는 저장하지 않으므로 전체로 시작한다
    await expect(topicChip(page, '전체')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    const sentence = getTarotTopicReading(
      TAROT_CARDS[stored.cardId],
      stored.isReversed,
      'love'
    ) as string;
    await expect(page.getByText(sentence, { exact: true })).toHaveCount(0);
    // 복원 화면에서도 분야를 고르면 같은 카드에 분야 문장이 붙는다
    await topicChip(page, '연애·인간관계').click();
    await expect(page.getByText(sentence, { exact: true })).toBeVisible();
    expect(await readStoredCard(page)).toEqual(stored);
  });

  test('v2 AC-7: 재뽑기 버튼이 없고 한국 시간 자정이 지난 값이면 새 카드를 뽑을 수 있다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    const stored = await drawDaily(page);
    await expect(
      page.getByRole('button', { name: /다시 뽑기|재뽑기|새로 뽑기/ })
    ).toHaveCount(0);
    await expect(dailyDrawButton(page)).toHaveCount(0);

    // 어제 날짜 값을 넣고 다시 열면 뽑기 전 상태로 돌아온다
    const key = await getTarotKeyName(page);
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [
        key,
        JSON.stringify({
          v: 1,
          date: kstDateKey(-1),
          cardId: stored.cardId,
          isReversed: stored.isReversed,
        }),
      ]
    );
    await page.reload();
    await waitForHydration(page);
    await expect(dailyDrawButton(page)).toBeVisible();
    await drawDaily(page);
    expect((await readStoredCard(page)).date).toBe(kstDateKey());
  });

  test('v2 D6: 분야 칩은 뽑기 전·결과에서 보이고 위기 패널에서는 숨는다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await expect(topicGroup(page)).toBeVisible();
    await questionInput(page).fill('죽고 싶어');
    await dailyDrawButton(page).click();
    await expect(
      page.getByRole('region', { name: CRISIS_TITLE })
    ).toBeVisible();
    await expect(topicGroup(page)).toHaveCount(0);
  });

  test('v2 AC-9 범위 밖: 오늘의 타로에는 3장 흐름 이야기가 없다', async ({
    page,
  }) => {
    await openIdle(page, DAILY_PATH);
    await topicChip(page, '일상 조언').click();
    await drawDaily(page);
    await expect(storyHeading(page)).toHaveCount(0);
    await expect(
      page.getByText(TAROT_STORY_NOTICE, { exact: true })
    ).toHaveCount(0);
  });

  test('v2 AC-24: 분야 선택 -> 뽑기 -> 결과 -> 분야 변경 흐름이 오류 없이 이어진다', async ({
    page,
  }) => {
    const { pageErrors, hydration } = watchErrors(page);
    await openIdle(page, DAILY_PATH);
    await topicChip(page, '직업·학업').click();
    await questionInput(page).fill('오늘 집중할 일');
    const stored = await drawDaily(page);
    const card = TAROT_CARDS[stored.cardId];
    const career = getTarotTopicReading(
      card,
      stored.isReversed,
      'career'
    ) as string;
    await expect(page.getByText(career, { exact: true })).toBeVisible();
    for (const topic of ['money', 'daily', 'love'] as const) {
      const label = TAROT_TOPICS.find((t) => t.key === topic)?.label as string;
      await topicChip(page, label).click();
      await expect(
        page.getByText(
          getTarotTopicReading(card, stored.isReversed, topic) as string,
          { exact: true }
        )
      ).toBeVisible();
    }
    expect(pageErrors).toEqual([]);
    expect(hydration).toEqual([]);
  });
});

// ---------- 3장 타로 (AC-9 ~ AC-17) ----------

test.describe('v2 3장 타로', () => {
  test('v2 AC-9: 세 장을 뽑으면 과거·현재·미래 이름과 위치 안내 한 줄이 카드 위에 보인다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    await drawThree(page);
    const headings = page.getByRole('heading', {
      level: 3,
      name: /^(과거|현재|미래)$/,
    });
    await expect(headings).toHaveCount(3);
    expect(await headings.allTextContents()).toEqual(['과거', '현재', '미래']);
    for (let i = 0; i < 3; i++) {
      const guide = headings.nth(i).locator('xpath=following-sibling::p[1]');
      expect(((await guide.textContent()) ?? '').trim().length).toBeGreaterThan(
        10
      );
    }
  });

  test('v2 AC-10: 한 번의 리딩에서 같은 카드가 두 번 나오지 않는다 (재뽑기 5회)', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    for (let round = 0; round < 5; round++) {
      if (round > 0) await redrawButton(page).click();
      await drawThree(page);
      const entries = await readThreeEntries(page);
      expect(
        new Set(entries.map((e) => e.card.id)).size,
        `라운드 ${round}`
      ).toBe(3);
    }
  });

  test('v2 AC-11: 결과 아래 "흐름 이야기" 문단이 하나, 3~5문장, 과거·현재·미래를 모두 포함하고 안내가 따라온다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    await drawThree(page);
    await expect(storyHeading(page)).toHaveCount(1);
    await expect(storyHeading(page)).toBeVisible();
    const paragraph = storyParagraph(page);
    await expect(paragraph).toBeVisible();
    const story = ((await paragraph.textContent()) ?? '').trim();
    const sentences = story.split(/(?<=[.?!])\s+/).filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences.length).toBeLessThanOrEqual(5);
    for (const word of ['과거', '현재', '미래']) expect(story).toContain(word);
    expect(story).not.toMatch(/[{}]/);
    await expect(
      page.getByText(TAROT_STORY_NOTICE, { exact: true })
    ).toBeVisible();
    // 이야기는 세 카드 읽기 영역보다 아래, 다시 뽑기 버튼보다 위에 있다
    const storyBox = await storyHeading(page).boundingBox();
    const redrawBox = await redrawButton(page).boundingBox();
    const pastBox = await page
      .getByRole('heading', { level: 3, name: '과거', exact: true })
      .boundingBox();
    expect((storyBox?.y ?? 0) > (pastBox?.y ?? 0)).toBe(true);
    expect((storyBox?.y ?? 0) < (redrawBox?.y ?? 0)).toBe(true);
  });

  test('v2 AC-12: "전체"(기본)로 뽑으면 분야 표시줄 없이 공통 문장 이야기가 나온다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    await expect(topicChip(page, '전체')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await drawThree(page);
    // 결과에서는 칩이 숨는다
    await expect(topicGroup(page)).toHaveCount(0);
    await expect(page.getByText(/^분야:/)).toHaveCount(0);
    const entries = await readThreeEntries(page);
    const expected = buildTarotThreeCardStory(entries, 'all');
    expect(expected).not.toBeNull();
    await expect(storyParagraph(page)).toHaveText(expected as string);
    // 분야 해석 문장이 카드 읽기에 붙지 않는다
    const lengthBefore = await page.getByRole('main').locator('p').count();
    expect(lengthBefore).toBeGreaterThan(0);
  });

  for (const topic of FILTER_TOPICS) {
    test(`v2 AC-13: 분야 "${topic.label}"로 뽑으면 이야기 문장이 해당 분야 세트에서 나오고 분야 표시줄·분야 문장이 보인다`, async ({
      page,
    }) => {
      await openIdle(page, THREE_PATH);
      await topicChip(page, topic.label).click();
      await drawThree(page);
      await expect(
        page.getByText(`분야: ${topic.label}`, { exact: true })
      ).toHaveCount(1);
      const entries = await readThreeEntries(page);
      const expected = buildTarotThreeCardStory(
        entries,
        topic.key as TarotTopicSelectionType
      ) as string;
      expect(expected).toBeTruthy();
      await expect(storyParagraph(page)).toHaveText(expected);

      // 이야기의 위치 틀·마무리는 해당 분야 세트의 칸에서 온다
      const set = TAROT_STORY_SETS[topic.key as keyof typeof TAROT_STORY_SETS];
      const closings = Object.values(set.closing);
      expect(closings.some((c) => expected.endsWith(c))).toBe(true);
      const allSet = TAROT_STORY_SETS.all;
      for (const c of Object.values(allSet.closing)) {
        expect(expected.endsWith(c)).toBe(false);
      }

      // 카드마다 분야 문장이 읽기 영역에 한 번씩 있다
      for (const entry of entries) {
        const sentence = getTarotTopicReading(
          entry.card,
          entry.isReversed,
          topic.key as TarotTopicSelectionType
        ) as string;
        expect(sentence).toBeTruthy();
        await expect(
          page.getByText(sentence, { exact: true }).first()
        ).toBeVisible();
      }
    });
  }

  test('v2 AC-14: 질문을 적고 뽑아도 이야기와 분야 문장에 질문이 반영되지 않는다', async ({
    page,
  }) => {
    const marker = '질문반영확인마커Q7';
    await openIdle(page, THREE_PATH);
    await topicChip(page, '재물·생활').click();
    await questionInput(page).fill(marker);
    await drawThree(page);
    const entries = await readThreeEntries(page);
    const expected = buildTarotThreeCardStory(entries, 'money') as string;
    await expect(storyParagraph(page)).toHaveText(expected);
    // 질문 문구는 화면 어디에서도 해석 문장 안에 없다
    await expect(storyParagraph(page)).not.toContainText(marker);
    for (const entry of entries) {
      const sentence = getTarotTopicReading(
        entry.card,
        entry.isReversed,
        'money'
      ) as string;
      await expect(
        page.getByText(sentence, { exact: true }).first()
      ).not.toContainText(marker);
    }
  });

  test('v2 AC-15: 결과 아래 다시 뽑기 버튼에 "다시 뽑으면 지금 결과는 사라집니다" 안내가 연결돼 있고 재뽑기로 새 이야기가 나온다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    await topicChip(page, '일상 조언').click();
    await drawThree(page);
    const notice = page.getByText(TAROT_REDRAW_RESULT_NOTICE, { exact: true });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('다시 뽑으면 지금 결과는 사라집니다');
    const id = await notice.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(redrawButton(page)).toHaveAttribute(
      'aria-describedby',
      id as string
    );
    // 버튼과 안내가 가까이 있다 (세로 거리 120px 안)
    const buttonBox = await redrawButton(page).boundingBox();
    const noticeBox = await notice.boundingBox();
    expect(Math.abs((buttonBox?.y ?? 0) - (noticeBox?.y ?? 9999))).toBeLessThan(
      120
    );

    await redrawButton(page).click();
    await expect(threeDrawButton(page)).toBeVisible();
    await expect(
      page.getByText(TAROT_REDRAW_NOTICE, { exact: true })
    ).toBeVisible();
    await expect(storyHeading(page)).toHaveCount(0);
    await threeDrawButton(page).click();
    await expect(storyHeading(page)).toBeVisible();
    const entries = await readThreeEntries(page);
    await expect(storyParagraph(page)).toHaveText(
      buildTarotThreeCardStory(entries, 'daily') as string
    );
  });

  test('v2 AC-16: 3장 h1·description에 "상담"이 없고 목적 문구에 "고민을 정리"의 뜻이 있다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    const h1 = page.getByRole('heading', { level: 1 });
    expect(await h1.textContent()).not.toContain('상담');
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description ?? '').not.toContain('상담');
    expect(await page.title()).not.toContain('상담');
    await expect(
      page.getByText(TAROT_THREE_CARD_SEO.headerDescription, { exact: true })
    ).toBeVisible();
    expect(TAROT_THREE_CARD_SEO.headerDescription).toMatch(/고민.*정리/);
  });

  test('v2 AC-17: 메뉴와 페이지 이름이 "3장 타로 (과거·현재·미래)"로 유지된다', async ({
    page,
  }) => {
    await openIdle(page, THREE_PATH);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      '3장 타로 (과거·현재·미래)'
    );
    expect(await page.title()).toContain('3장 타로 (과거·현재·미래)');
  });

  test('v2 AC-24: 분야 선택 -> 뽑기 -> 결과 -> 다시 뽑기 흐름이 오류 없이 이어지고 분야·질문이 유지된다', async ({
    page,
  }) => {
    const { pageErrors, hydration } = watchErrors(page);
    await openIdle(page, THREE_PATH);
    await topicChip(page, '직업·학업').click();
    await questionInput(page).fill('이직 고민');
    await drawThree(page);
    await expect(storyHeading(page)).toBeVisible();
    await redrawButton(page).click();
    await expect(threeDrawButton(page)).toBeFocused();
    await expect(topicChip(page, '직업·학업')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(questionInput(page)).toHaveValue('이직 고민');
    await drawThree(page);
    await expect(
      page.getByText('분야: 직업·학업', { exact: true })
    ).toHaveCount(1);
    expect(pageErrors).toEqual([]);
    expect(hydration).toEqual([]);
  });

  test('v2 AC-12: 결과 화면에서는 분야 칩이 숨는다', async ({ page }) => {
    await openIdle(page, THREE_PATH);
    await topicChip(page, '연애·인간관계').click();
    await drawThree(page);
    await expect(topicGroup(page)).toHaveCount(0);
  });
});

// ---------- 화면 문구 금지 표현 교차 (AC-22) ----------

for (const target of PAGES) {
  test(`v2 AC-22: ${target.path} 분야 선택 뒤 결과 화면 글자에 금지 표현이 없다 (예외는 부정 고지 문장뿐)`, async ({
    page,
  }) => {
    await openIdle(page, target.path);
    const texts: string[] = [];
    for (const topic of TAROT_TOPICS) {
      if (target.path === DAILY_PATH) {
        await topicChip(page, topic.label).click();
        if (topic.key === 'all') {
          await dailyDrawButton(page).click();
          await expect(
            page.getByRole('img', { name: CARD_FACE_NAME }).first()
          ).toBeVisible();
        }
        texts.push(await page.getByRole('main').innerText());
      } else {
        await topicChip(page, topic.label).click();
        await drawThree(page);
        await expect(storyHeading(page)).toBeVisible();
        texts.push(await page.getByRole('main').innerText());
        await redrawButton(page).click();
        await expect(threeDrawButton(page)).toBeVisible();
      }
    }
    for (const text of texts) {
      expect(findForbidden(text), text.slice(0, 80)).toEqual([]);
    }
  });
}
