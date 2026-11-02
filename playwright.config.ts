import { defineConfig, devices } from '@playwright/test';

// 설치된 Chrome을 사용한다 (Playwright 브라우저를 따로 내려받지 않는다).
// 개발 서버가 이미 떠 있으면 그대로 쓰고, 없으면 pnpm dev로 띄운다.
const BASE_URL = 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // /api/lotto/draws는 IP당 1분 60회로 제한되어 있어 동시 실행을 줄인다
  workers: 3,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
