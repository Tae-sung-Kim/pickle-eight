import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// 조각 파일을 실제로 만들고 지우므로 desktop 한 곳에서만, 한 번에 하나씩 돌린다.
test.describe.configure({ mode: 'serial' });

const FILE = 'src/features/api-docs/specs/test-feature.openapi.json';
const piece = (extra: object = {}) => ({
  'x-feature': 'test-feature',
  tags: [{ name: 'TestFeature', description: 'dummy' }],
  paths: {
    '/api/test-feature/ping': {
      get: {
        summary: 'ping',
        operationId: 'testFeaturePing',
        tags: ['TestFeature'],
        responses: { '200': { description: 'ok' } },
      },
    },
  },
  ...extra,
});

test.beforeEach(({ browserName: _browserName }, info) => {
  test.skip(info.project.name !== 'desktop', '파일을 쓰므로 desktop만');
});
test.afterEach(() => {
  rmSync(FILE, { force: true });
});

test('AC-14: 더미 조각 파일만 추가하면 명세와 화면에 나타난다', async ({
  page,
}) => {
  writeFileSync(FILE, JSON.stringify(piece(), null, 2));
  const res = await page.request.get('/openapi.json');
  expect(res.status()).toBe(200);
  const spec = await res.json();
  expect(Object.keys(spec.paths)).toContain('/api/test-feature/ping');
  await page.goto('/api-docs');
  await expect(
    page.locator('[data-path="/api/test-feature/ping"]')
  ).toHaveCount(1);
  rmSync(FILE, { force: true });
  const after = await (await page.request.get('/openapi.json')).json();
  expect(Object.keys(after.paths)).not.toContain('/api/test-feature/ping');
  expect(existsSync(FILE)).toBe(false);
});

test('AC-15: 필수 항목(responses) 누락 시 합치기 실패, 일부만 내보내지 않는다', async ({
  page,
}) => {
  const bad = {
    ...piece(),
    paths: {
      '/api/test-feature/ping': {
        get: {
          summary: 'ping',
          operationId: 'testFeaturePing',
          tags: ['TestFeature'],
        },
      },
    },
  };
  writeFileSync(FILE, JSON.stringify(bad));
  const res = await page.request.get('/openapi.json');
  expect(res.status()).toBe(500);
  expect(JSON.stringify(await res.json())).toContain('responses');
});

test('AC-15: 경로 중복 시 합치기 실패', async ({ page }) => {
  const dup = piece({
    paths: {
      '/api/lotto/draws': piece().paths['/api/test-feature/ping'],
    },
  });
  writeFileSync(FILE, JSON.stringify(dup));
  const res = await page.request.get('/openapi.json');
  expect(res.status()).toBe(500);
});
