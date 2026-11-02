import { expect, type Page, test } from '@playwright/test';

// 개발 모드에서는 /lotto/* 진입 때마다 성인 확인 창이 뜬다
async function passAgeGate(page: Page) {
  const confirm = page.getByRole('button', { name: '만 19세 이상입니다' });
  await confirm.click({ timeout: 5000 }).catch(() => {
    /* 창이 없으면 그대로 진행 */
  });
}

// 모바일에서는 쿠키 동의 배너가 화면 아래를 덮어 버튼 클릭을 막는다
async function declineCookies(page: Page) {
  await page
    .getByRole('button', { name: '거부' })
    .click({ timeout: 3000 })
    .catch(() => {
      /* 배너가 없으면 그대로 진행 */
    });
}

type Draw = { drawNumber: number; numbers: number[] };

async function fetchLatestDrawNumber(
  request: import('@playwright/test').APIRequestContext
): Promise<number> {
  const res = await request.get('/api/lotto/draws?latest=1');
  expect(
    res.ok(),
    `최신 회차 조회 실패 (${res.status()}, 429면 요청 제한)`
  ).toBe(true);
  const json = await res.json();
  return json.data.lastDrawNumber as number;
}

async function fetchDraws(
  request: import('@playwright/test').APIRequestContext,
  from: number,
  to: number
): Promise<Draw[]> {
  const res = await request.get(`/api/lotto/draws?from=${from}&to=${to}`);
  expect(res.ok(), `회차 조회 실패 (${res.status()}, 429면 요청 제한)`).toBe(
    true
  );
  const json = await res.json();
  return json.data as Draw[];
}

test('채점 후 전체 저장하면 나의 번호에 나타난다', async ({ page }) => {
  const picked = [1, 7, 13, 22, 30, 41];

  await page.goto('/lotto/check');
  await passAgeGate(page);
  await declineCookies(page);

  const inputs = page.getByPlaceholder('--');
  for (const [i, n] of picked.entries()) {
    await inputs.nth(i).fill(String(n));
  }
  await page.getByRole('button', { name: '채점하기' }).click();

  const save = page.getByRole('button', { name: '전체 저장' });
  await expect(save).toBeVisible();
  await save.click();
  await expect(page.getByText(/게임을 저장했습니다/)).toBeVisible();

  // 저장소(localStorage)는 같은 브라우저 컨텍스트라 이동해도 유지된다
  await page.goto('/lotto/my-numbers');
  await passAgeGate(page);
  const balls = page
    .locator('main li span.rounded-full')
    .filter({ hasText: /^\d{1,2}$/ });
  await expect(balls.first()).toBeVisible();
  const shown = (await balls.allTextContents())
    .map((t) => t.trim())
    .filter((t) => /^\d{1,2}$/.test(t))
    .slice(0, 6)
    .map(Number);
  expect(shown).toEqual(picked);
});

test('핫/콜드 범위 모드 결과가 직접 센 값과 같다', async ({
  page,
  request,
}) => {
  const to = await fetchLatestDrawNumber(request);
  const from = to - 99;
  const draws = await fetchDraws(request, from, to);

  // 독립 계산: 번호별 출현 횟수, 마지막 출현 회차
  const freq = new Map<number, number>();
  const lastSeen = new Map<number, number>();
  for (let n = 1; n <= 45; n += 1) freq.set(n, 0);
  for (const d of draws) {
    for (const n of d.numbers) {
      freq.set(n, (freq.get(n) ?? 0) + 1);
      lastSeen.set(n, Math.max(lastSeen.get(n) ?? 0, d.drawNumber));
    }
  }
  const span = to - from + 1;
  const expectedFreq = [...freq.values()].sort((a, b) => b - a).slice(0, 5);
  const expectedOverdue = Array.from({ length: 45 }, (_, i) => i + 1)
    .map((n) => (lastSeen.has(n) ? to - (lastSeen.get(n) ?? 0) : span))
    .sort((a, b) => b - a)
    .slice(0, 5);

  await page.goto('/lotto/analysis');
  await passAgeGate(page);
  await page.getByRole('button', { name: '회차 범위 모드' }).click();
  await page
    .getByText('From(회차)')
    .locator('xpath=following::input[1]')
    .fill(String(from));
  await page
    .getByText('To(회차)')
    .locator('xpath=following::input[1]')
    .fill(String(to));
  await page.getByRole('button', { name: '조회' }).click();

  const readValues = async (title: string) => {
    const items = page
      .getByText(title)
      .locator('xpath=following-sibling::ul[1]/li');
    await expect(items).toHaveCount(5);
    const out: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const text =
        (await items.nth(i).locator('span').nth(1).textContent()) ?? '';
      out.push(Number.parseInt(text, 10));
    }
    return out;
  };

  expect(await readValues('자주 나온 번호(전체 빈도)')).toEqual(expectedFreq);
  expect(await readValues('오랫동안 안 나온 번호(지연)')).toEqual(
    expectedOverdue
  );
});

// DB(Supabase)에 연결된 환경에서만 통과한다
test('핫/콜드 API 값이 서로 맞는다', async ({ request }) => {
  const res = await request.get('/api/lotto/stats/hot-cold');
  const { data } = await res.json();
  const freq = Object.values(data.frequency as Record<string, number>);
  // 모든 회차가 6개 번호를 가지므로 출현 횟수 합은 6 x 회차 수
  expect(freq.reduce((a, b) => a + b, 0)).toBe(6 * data.latest);
  // 가장 최근 회차에 나온 번호 6개는 지연이 0이다
  const zero = Object.values(data.overdue as Record<string, number>).filter(
    (v) => v === 0
  );
  expect(zero).toHaveLength(6);
});
