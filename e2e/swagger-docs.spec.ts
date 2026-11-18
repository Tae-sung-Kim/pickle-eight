import { expect, type Page, test } from '@playwright/test';

const PATHS = [
  '/api/lotto/draws',
  '/api/lotto/stats/hot-cold',
  '/api/lotto/export',
] as const;
const EXCLUDED = ['/api/lotto/sync', '/api/csp-report', '/api/og-image'];

interface Json {
  [key: string]: Json;
}

async function getSpec(page: Page): Promise<Json> {
  const res = await page.request.get('/openapi.json');
  expect(res.status()).toBe(200);
  return res.json();
}

let ipSeq = 0;
function freshIp(tag: number): string {
  ipSeq += 1;
  return `10.${tag}.${Math.floor(Math.random() * 250)}.${(ipSeq % 250) + 1}`;
}

test.describe('페이지 공통', () => {
  test('/api-docs 응답 400 미만, pageerror 없음, h1 하나, 메타 존재', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto('/api-docs');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('.swagger-ui').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page).toHaveTitle(/API 문서/);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/
    );
    expect(errors).toEqual([]);
  });
});

test('AC-1: /api-docs에 h1 "API 문서"와 Swagger UI가 보인다', async ({
  page,
}) => {
  await page.goto('/api-docs');
  await expect(
    page.getByRole('heading', { level: 1, name: 'API 문서' })
  ).toBeVisible();
  await expect(page.locator('.swagger-ui').first()).toBeVisible();
});

test('AC-2: operation 3개, 경로 일치, 제외 경로 없음', async ({ page }) => {
  await page.goto('/api-docs');
  const ops = page.locator('[data-path]');
  await expect(ops).toHaveCount(3);
  const paths = await ops.evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-path'))
  );
  expect([...paths].sort()).toEqual([...PATHS].sort());
  for (const p of EXCLUDED) {
    await expect(page.locator(`[data-path="${p}"]`)).toHaveCount(0);
  }
});

test('AC-3: /openapi.json 200 JSON, paths 정확히 일치', async ({ page }) => {
  const res = await page.request.get('/openapi.json');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/json');
  const spec = await res.json();
  expect(Object.keys(spec.paths).sort()).toEqual([...PATHS].sort());
});

test('AC-4: draws 파라미터와 응답 코드', async ({ page }) => {
  const spec = await getSpec(page);
  const op = spec.paths['/api/lotto/draws'].get;
  const names = ((op.parameters ?? []) as unknown as Json[]).map((p) => p.name);
  for (const n of ['latest', 'drwNo', 'from', 'to']) expect(names).toContain(n);
  for (const c of ['200', '400', '404', '429', '500']) {
    expect(Object.keys(op.responses)).toContain(c);
  }
});

test('AC-5: export 명세 text/csv + attachment, 실제 응답 CSV', async ({
  page,
}) => {
  const spec = await getSpec(page);
  const ok = spec.paths['/api/lotto/export'].get.responses['200'];
  expect(Object.keys(ok.content)).toContain('text/csv');
  expect(JSON.stringify(ok)).toContain('attachment');

  const res = await page.request.get('/api/lotto/export?from=1&to=2', {
    headers: { 'x-forwarded-for': freshIp(1) },
  });
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('text/csv');
  const first = (await res.text()).replace(/^﻿/, '').split(/\r?\n/)[0];
  expect(first).toMatch(/^[^\d].*,/);
});

test('AC-6: hot-cold 200 응답에 ok, data, meta', async ({ page }) => {
  const spec = await getSpec(page);
  const ok = spec.paths['/api/lotto/stats/hot-cold'].get.responses['200'];
  expect(ok).toBeTruthy();
  const ref = ok.content['application/json'].schema.$ref as unknown as string;
  const schema = ref
    ? spec.components.schemas[ref.split('/').pop() as string]
    : ok.content['application/json'].schema;
  for (const k of ['ok', 'data', 'meta']) {
    expect(Object.keys(schema.properties)).toContain(k);
  }
});

test('AC-7: export 21번째, draws 61번째 요청이 429', async ({ page }) => {
  test.setTimeout(120_000);
  const run = async (url: string, limit: number, tag: number) => {
    const headers = { 'x-forwarded-for': freshIp(tag) };
    for (let i = 1; i <= limit; i++) {
      const r = await page.request.get(url, { headers });
      expect(r.status(), `${url} #${i}`).not.toBe(429);
    }
    const over = await page.request.get(url, { headers });
    expect(over.status()).toBe(429);
    expect(over.headers()['retry-after']).toBe('60');
  };
  // 잘못된 파라미터(400)는 DB를 거치지 않고, 제한 계산에는 들어간다
  await run('/api/lotto/export?from=5&to=1', 20, 2);
  await run('/api/lotto/draws?drwNo=0', 60, 3);
});

test('AC-8: Try it out으로 latest=1 실행 시 200과 lastDrawNumber', async ({
  page,
}) => {
  await page.goto('/api-docs');
  const summary = page
    .getByRole('button', { name: /GET \/api\/lotto\/draws/ })
    .first();
  await expect(summary).toBeVisible();
  if ((await summary.getAttribute('aria-expanded')) === 'false') {
    await summary.click();
  }
  await page.getByPlaceholder('latest').fill('1');
  await page.getByRole('button', { name: 'Execute' }).click();
  const live = page.getByText('Server response').locator('..').locator('..');
  await expect(page.getByText('Server response')).toBeVisible();
  await expect(
    live.getByRole('cell', { name: '200', exact: true })
  ).toBeVisible();
  await expect(live.getByText(/lastDrawNumber/).first()).toBeVisible();
});

test('AC-10: 기존 API status, Content-Type, Cache-Control', async ({
  page,
}) => {
  const h = (tag: number) => ({ 'x-forwarded-for': freshIp(tag) });
  const draws = await page.request.get('/api/lotto/draws?latest=1', {
    headers: h(4),
  });
  expect(draws.status()).toBe(200);
  expect(draws.headers()['content-type']).toContain('application/json');
  const bad = await page.request.get('/api/lotto/draws?drwNo=0', {
    headers: h(4),
  });
  expect(bad.status()).toBe(400);
  const hot = await page.request.get('/api/lotto/stats/hot-cold');
  expect(hot.status()).toBe(200);
  expect(hot.headers()['content-type']).toContain('application/json');
  expect(hot.headers()['cache-control']).toMatch(/no-store|s-maxage=600/);
  const exp = await page.request.get('/api/lotto/export?from=1&to=2', {
    headers: h(5),
  });
  expect(exp.status()).toBe(200);
  expect(exp.headers()['content-type']).toContain('text/csv');
  expect(exp.headers()['cache-control']).toBe('no-store');
  expect(exp.headers()['content-disposition']).toContain('attachment');
});

test('AC-11: 고지 문구가 보인다', async ({ page }) => {
  await page.goto('/api-docs');
  const main = page.getByRole('main').first();
  await expect(
    main.getByText(
      '본 API가 제공하는 데이터는 참고용이며 당첨을 보장하지 않습니다.'
    )
  ).toBeVisible();
  await expect(main.getByText(/오락 목적으로 제공되는 정보/)).toBeVisible();
});

test('AC-12: 가로 스크롤이 생기지 않는다 (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/api-docs');
  await expect(page.locator('[data-path]')).toHaveCount(3);
  const over = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(over).toBeLessThanOrEqual(0);
});

test('AC-13: 조각 파일 구조, 제외 경로 없음', async ({ page }) => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const dir = 'src/features/api-docs/specs';
  const files = readdirSync(dir).filter((f) => f.endsWith('.openapi.json'));
  expect(files).toContain('lotto.openapi.json');
  const all = new Set<string>();
  for (const f of files) {
    const piece = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    for (const p of Object.keys(piece.paths)) all.add(p);
    for (const ex of EXCLUDED) expect(JSON.stringify(piece)).not.toContain(ex);
  }
  const spec = await getSpec(page);
  expect([...all].sort()).toEqual(Object.keys(spec.paths).sort());
});

test('상태: 알 수 없는 경로 /api-docs/none 은 404', async ({ page }) => {
  const res = await page.goto('/api-docs/none');
  expect(res?.status()).toBe(404);
});
