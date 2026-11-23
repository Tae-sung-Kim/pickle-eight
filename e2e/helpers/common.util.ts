import { type Page, type Request, test } from '@playwright/test';

/** 쿠키 동의 배너를 거절한다. 배너가 모바일 아래쪽을 덮어 버튼 클릭을 막는다 */
export async function declineCookies(page: Page) {
  const button = page.getByRole('button', { name: /거부/ });
  if (
    await button.waitFor({ state: 'visible', timeout: 3000 }).then(
      () => true,
      () => false
    )
  ) {
    await button.click();
  }
}

/** 서버 HTML만 있는 상태에서 누르면 클릭이 무시되므로 React가 붙을 때까지 기다린다 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const input = document.querySelector('main input, main button');
    return (
      input !== null &&
      Object.keys(input).some((key) => key.startsWith('__reactProps$'))
    );
  });
  // 스트리밍용 숨김 영역(div hidden id="S:n")이 남으면 같은 요소가 두 번 잡히므로 지우고 기록한다
  const leftover = await page.evaluate(() => {
    const nodes = document.querySelectorAll('div[hidden][id^="S:"]');
    const count = nodes.length;
    for (const node of nodes) node.remove();
    return count;
  });
  if (leftover > 0) {
    test.info().annotations.push({
      type: 'hidden-stream-leftover',
      description: `숨김 스트리밍 영역 ${leftover}개가 남아 있어 지웠다`,
    });
  }
}

/** pageerror와 하이드레이션 콘솔 오류를 모은다 */
export function watchPageErrors(page: Page) {
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

/** 개발 모드에서는 /lotto/* 진입 때마다 성인 확인 창이 뜬다 */
export async function passLottoAgeGate(page: Page) {
  // 창은 클라이언트에서 뜨므로 React가 붙은 뒤에 있는지 짧게 확인한다
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('button')).some((el) =>
      Object.keys(el).some((key) => key.startsWith('__reactProps$'))
    )
  );
  const button = page.getByRole('button', { name: '만 19세 이상입니다' });
  if (
    await button.waitFor({ state: 'visible', timeout: 3000 }).then(
      () => true,
      () => false
    )
  ) {
    await button.click();
  }
}

export type RecordedRequest = { url: string; method: string; body: string };

/** 요청을 기록한다. Next 내부 요청은 뺀다 */
export function recordRequests(page: Page): RecordedRequest[] {
  const recorded: RecordedRequest[] = [];
  page.on('request', (req: Request) => {
    const url = req.url();
    if (url.includes('/_next/') || url.includes('_rsc=')) return;
    if (url.includes('/__nextjs')) return;
    recorded.push({ url, method: req.method(), body: req.postData() ?? '' });
  });
  return recorded;
}

/** localStorage, sessionStorage, 쿠키를 문자열로 찍어 둔다 */
export async function storageSnapshot(page: Page) {
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
