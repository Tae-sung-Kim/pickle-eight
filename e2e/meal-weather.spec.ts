import { expect, type Page, test } from '@playwright/test';
import {
  getMealWeatherLine,
  MEAL_AREA_INPUT_LABEL,
  MEAL_WEATHER_ACCURACY_TEXT,
  MEAL_WEATHER_NOTICE_LINES,
  MEAL_WEATHER_REGION_LABEL,
  MEAL_WEATHER_SOURCE_TEXT,
  MEAL_WEATHER_SOURCE_URL,
  MEAL_WEATHER_SWITCH_HELP_HEADING,
  MEAL_WEATHER_UNAVAILABLE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import { MEAL_WEATHER_SPIN_WAIT_MS } from '@/features/meal/constants/meal-weather.constant';
import { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';
import type { MealWeatherConditionType } from '@/features/meal/types/meal.type';
import { recordRequests, storageSnapshot } from './helpers/common.util';
import {
  announce,
  countGeolocation,
  horizontalOverflow,
  main,
  mapLinks,
  openPage,
  readResult,
  resultRegion,
  spinButton,
  spinOnce,
  stubMaps,
  stubWeather,
  watchGeolocation,
} from './helpers/meal.util';

const WEATHER_PATH = '/api/meal/weather';
const AREA = '강남역';
const LINE_CONDITIONS = ['snow', 'rain', 'hot', 'cold'] as const;

type TempsType = {
  minCelsius: number | null;
  maxCelsius: number | null;
  currentCelsius: number | null;
};
const ALL_TEMPS: TempsType = {
  minCelsius: 4,
  maxCelsius: 9,
  currentCelsius: 6,
};
const ok = (
  condition: MealWeatherConditionType,
  temps: TempsType = ALL_TEMPS
) => ({
  status: 200,
  body: { condition, forecastDate: '20261128', ...temps },
});
const regionLabel = (key: string) =>
  MEAL_WEATHER_REGIONS.find((r) => r.key === key)?.label ?? '';

const regionSelect = (page: Page) =>
  page.getByRole('combobox', { name: MEAL_WEATHER_REGION_LABEL });
const weatherSwitch = (page: Page) =>
  page.getByRole('switch', { name: /^날씨 반영/ });
const helpHeading = (page: Page) =>
  main(page).getByRole('heading', { name: MEAL_WEATHER_SWITCH_HELP_HEADING });
const text = (page: Page, value: string) =>
  main(page).getByText(value, { exact: true });
const sourceLink = (page: Page) =>
  main(page).getByRole('link', { name: new RegExp(MEAL_WEATHER_SOURCE_URL) });

async function pickRegion(page: Page, key: string) {
  await regionSelect(page).click();
  await page
    .getByRole('option', { name: regionLabel(key), exact: true })
    .click();
  await expect(regionSelect(page)).toHaveText(regionLabel(key));
}

const weatherRequests = (reqs: { url: string }[]) =>
  reqs.filter((r) => r.url.includes(WEATHER_PATH));

async function expectNoWeatherArea(page: Page) {
  for (const c of LINE_CONDITIONS) {
    await expect(text(page, getMealWeatherLine(c))).toHaveCount(0);
  }
  await expect(text(page, MEAL_WEATHER_UNAVAILABLE_TEXT)).toHaveCount(0);
  await expect(text(page, MEAL_WEATHER_ACCURACY_TEXT)).toHaveCount(0);
  await expect(sourceLink(page)).toHaveCount(0);
}

async function expectSourceAndAccuracy(page: Page) {
  await expect(
    main(page).getByText(
      MEAL_WEATHER_SOURCE_TEXT.split(MEAL_WEATHER_SOURCE_URL)[0].trim()
    )
  ).toBeVisible();
  await expect(sourceLink(page)).toHaveAttribute('target', '_blank');
  await expect(sourceLink(page)).toHaveAttribute(
    'href',
    MEAL_WEATHER_SOURCE_URL
  );
  await expect(text(page, MEAL_WEATHER_ACCURACY_TEXT)).toBeVisible();
}

test.describe('뭐 먹지 날씨 반영', () => {
  test('AC-1, 4, 5: 지역+동네 입력 후 돌리면 날씨 줄·출처·정확도와 동네 미리보기가 함께 나오고, 비전송·비저장이며, 뽑은 뒤 설정을 바꿔도 결과는 그대로다', async ({
    page,
  }) => {
    await stubMaps(page);
    await stubWeather(page, ok('rain'));
    await watchGeolocation(page);
    const requests = recordRequests(page);
    await openPage(page);

    await pickRegion(page, 'seoul');
    await page.getByLabel(MEAL_AREA_INPUT_LABEL, { exact: true }).fill(AREA);
    const picked = await spinOnce(page);

    // AC-1: 한 줄 + 출처 + 정확도
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    await expectSourceAndAccuracy(page);
    // AC-5: 동네 미리보기와 지도 링크 검색어
    await expect(
      resultRegion(page).getByText(new RegExp(`^${AREA} .+$`))
    ).toBeVisible();
    await expect(mapLinks(page)).toHaveCount(3);
    for (const i of [0, 1, 2]) {
      const href = (await mapLinks(page).nth(i).getAttribute('href')) ?? '';
      expect(decodeURIComponent(href)).toContain(`${AREA} `);
    }

    // AC-4: 날씨 요청은 region 하나, 값은 목록 key. 동네·메뉴 이름은 사이트로 안 나간다
    const calls = weatherRequests(requests);
    expect(calls.length).toBeGreaterThan(0);
    const keys: string[] = MEAL_WEATHER_REGIONS.map((r) => r.key);
    for (const c of calls) {
      const params = new URL(c.url).searchParams;
      expect([...params.keys()]).toEqual(['region']);
      expect(keys).toContain(params.get('region'));
    }
    const origin = new URL(page.url()).origin;
    for (const r of requests.filter((x) => x.url.startsWith(origin))) {
      const sent = decodeURIComponent(`${r.url} ${r.body}`);
      expect(sent).not.toContain(AREA);
      expect(sent).not.toContain(picked.name);
    }
    expect(await countGeolocation(page)).toBe(0);
    const snap = JSON.stringify(await storageSnapshot(page));
    expect(snap).not.toContain('seoul');
    expect(snap).not.toContain('rain');

    // 뽑은 뒤 지역·스위치를 바꿔도 현재 결과의 날씨 안내는 그대로
    await weatherSwitch(page).click();
    await pickRegion(page, 'busan');
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    await expectSourceAndAccuracy(page);
  });

  test('AC-1, 3: 눈·비·더움·추움은 각 문구, 보통은 출처·정확도만, 503은 실패 안내 한 줄과 결과', async ({
    page,
  }) => {
    await openPage(page);
    // 지역마다 따로 캐시되므로 지역을 바꿔 가며 응답을 갈아 끼운다
    const cases = [
      ['seoul', 'snow'],
      ['busan', 'rain'],
      ['daegu', 'hot'],
      ['incheon', 'cold'],
    ] as const;
    for (const [region, condition] of cases) {
      await stubWeather(page, ok(condition));
      await pickRegion(page, region);
      await spinOnce(page);
      await expect(text(page, getMealWeatherLine(condition))).toBeVisible();
      await expectSourceAndAccuracy(page);
    }

    await stubWeather(page, ok('normal'));
    await pickRegion(page, 'ulsan');
    await spinOnce(page);
    for (const c of LINE_CONDITIONS) {
      await expect(text(page, getMealWeatherLine(c))).toHaveCount(0);
    }
    await expectSourceAndAccuracy(page);

    await stubWeather(page, {
      status: 503,
      body: { error: 'weather_unavailable' },
    });
    await pickRegion(page, 'jeju');
    await spinOnce(page);
    await expect(resultRegion(page)).toBeVisible();
    await expect(text(page, MEAL_WEATHER_UNAVAILABLE_TEXT)).toBeVisible();
    await expect(text(page, MEAL_WEATHER_ACCURACY_TEXT)).toHaveCount(0);
    for (const c of LINE_CONDITIONS) {
      await expect(text(page, getMealWeatherLine(c))).toHaveCount(0);
    }
  });

  test('AC-T1, T2, T3, T4: 기온 줄은 값 있는 항목만, 모두 없으면 줄 없음, 보통 날씨에도 기온·출처·정확도, 눈·비에서는 날씨 문장 위, 스크린리더 문구', async ({
    page,
  }) => {
    await openPage(page);
    const row = (value: string) => text(page, value);
    const none = ['4°', '9°', '6°'];
    const noRow = async () => {
      for (const n of none) {
        await expect(main(page).getByText(n)).toHaveCount(0);
      }
    };

    // 셋 다: 보이는 글자와 스크린리더 문구
    await stubWeather(page, ok('snow'));
    await pickRegion(page, 'seoul');
    await spinOnce(page);
    await expect(row('오늘 4° ~ 9° · 현재 6°')).toBeVisible();
    await expect(row('오늘 기온 4도에서 9도, 현재 6도')).toHaveCount(1);
    // 눈: 기온 줄이 날씨 문장 위
    const tempBox = await row('오늘 4° ~ 9° · 현재 6°').boundingBox();
    const lineBox = await text(page, getMealWeatherLine('snow')).boundingBox();
    expect(tempBox && lineBox && tempBox.y < lineBox.y).toBe(true);

    // 일부 null: 최고가 없으면 현재만, 현재가 없으면 범위만
    await stubWeather(page, ok('rain', { ...ALL_TEMPS, maxCelsius: null }));
    await pickRegion(page, 'busan');
    await spinOnce(page);
    await expect(row('현재 6°')).toBeVisible();
    await expect(row('오늘 기온 4도에서 9도, 현재 6도')).toHaveCount(0);

    await stubWeather(page, ok('rain', { ...ALL_TEMPS, currentCelsius: null }));
    await pickRegion(page, 'daegu');
    await spinOnce(page);
    await expect(row('오늘 4° ~ 9°')).toBeVisible();
    await expect(row('현재 6°')).toHaveCount(0);

    // 보통: 문장 없이 기온 줄, 출처, 정확도
    await stubWeather(page, ok('normal'));
    await pickRegion(page, 'ulsan');
    await spinOnce(page);
    await expect(row('오늘 4° ~ 9° · 현재 6°')).toBeVisible();
    for (const c of LINE_CONDITIONS) {
      await expect(text(page, getMealWeatherLine(c))).toHaveCount(0);
    }
    await expectSourceAndAccuracy(page);

    // 모두 null: 줄 없음, 출처·정확도는 유지
    await stubWeather(
      page,
      ok('normal', { minCelsius: null, maxCelsius: null, currentCelsius: null })
    );
    await pickRegion(page, 'jeju');
    await spinOnce(page);
    await expectSourceAndAccuracy(page);
    await noRow();
  });

  test('AC-2: 지역 미선택이거나 스위치를 끄면 날씨 요청이 없고 날씨 영역도 없다', async ({
    page,
  }) => {
    await stubWeather(page, ok('rain'));
    const requests = recordRequests(page);
    await openPage(page);

    await spinOnce(page);
    await expectNoWeatherArea(page);

    await weatherSwitch(page).click();
    await expect(weatherSwitch(page)).not.toBeChecked();
    await pickRegion(page, 'seoul');
    await spinOnce(page);
    await expectNoWeatherArea(page);
    expect(weatherRequests(requests)).toHaveLength(0);
  });

  test('AC-3: 응답이 1초 늦어도 지역 선택 직후 첫 뽑기에 날씨 한 줄이 나온다', async ({
    page,
  }) => {
    await stubWeather(page, { ...ok('rain'), delayMs: 1000 });
    await openPage(page);
    await pickRegion(page, 'seoul');
    await spinOnce(page);
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    await expect(text(page, MEAL_WEATHER_UNAVAILABLE_TEXT)).toHaveCount(0);
  });

  test('AC-3: 응답이 3초를 넘기면 날씨 없이 뽑고 실패 문구가 나온다', async ({
    page,
  }) => {
    // 4초 이상 지연: 3초 대기 후 포기하는 동작을 확인한다 (응답은 테스트 끝나면 버려짐)
    await stubWeather(page, { ...ok('rain'), delayMs: 6000 });
    await openPage(page);
    await pickRegion(page, 'seoul');
    const t0 = Date.now();
    await spinOnce(page);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(2800);
    await expect(resultRegion(page)).toBeVisible();
    await expect(text(page, MEAL_WEATHER_UNAVAILABLE_TEXT)).toBeVisible();
    await expect(text(page, getMealWeatherLine('rain'))).toHaveCount(0);
    await expect(text(page, MEAL_WEATHER_ACCURACY_TEXT)).toHaveCount(0);
  });

  test('AC-3: 대기 중 연타해도 뽑기는 1회이고 날씨 요청도 1건이다', async ({
    page,
  }) => {
    await stubWeather(page, { ...ok('rain'), delayMs: 1500 });
    const requests = recordRequests(page);
    await openPage(page);
    await pickRegion(page, 'seoul');
    await spinButton(page).click();
    for (let i = 0; i < 4; i += 1) {
      await spinButton(page).click({ force: true, noWaitAfter: true });
    }
    await readResult(page);
    await expect(announce(page, '뽑힌 메뉴는')).toHaveCount(1);
    await expect(resultRegion(page)).toHaveCount(1);
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    expect(weatherRequests(requests)).toHaveLength(1);
  });

  test('AC-2, 3: 대기 중 스위치를 끄면 날씨 없이 뽑고 날씨 줄이 없다', async ({
    page,
  }) => {
    await stubWeather(page, { ...ok('rain'), delayMs: 2000 });
    await openPage(page);
    await pickRegion(page, 'seoul');
    await spinButton(page).click();
    await weatherSwitch(page).click({ force: true, noWaitAfter: true });
    await readResult(page);
    await expect(weatherSwitch(page)).not.toBeChecked();
    await expectNoWeatherArea(page);
  });

  test('AC-3: 응답이 이미 있으면 두 번째 뽑기는 요청 없이 날씨와 함께 뽑힌다', async ({
    page,
  }) => {
    await stubWeather(page, ok('rain'));
    const requests = recordRequests(page);
    await openPage(page);
    await pickRegion(page, 'seoul');
    await spinOnce(page);
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    // 캐시가 있으므로 이후에는 대기·재요청 없이 바로 뽑힌다
    const t0 = Date.now();
    await spinOnce(page);
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    expect(Date.now() - t0).toBeLessThan(MEAL_WEATHER_SPIN_WAIT_MS + 3000);
    expect(weatherRequests(requests)).toHaveLength(1);
  });

  test('AC-4, 6: 안내 2는 접혀 있다 펼쳐지고, Tab은 지역 → 스위치 → 안내 2 → 돌리기 순이며, 새로고침하면 지역은 비고 스위치는 켜진다', async ({
    page,
  }) => {
    await watchGeolocation(page);
    await openPage(page);

    await expect(text(page, MEAL_WEATHER_NOTICE_LINES[0])).toBeVisible();
    await expect(text(page, MEAL_WEATHER_NOTICE_LINES[1])).toBeHidden();
    await helpHeading(page).click();
    await expect(text(page, MEAL_WEATHER_NOTICE_LINES[1])).toBeVisible();
    await helpHeading(page).click();
    await expect(text(page, MEAL_WEATHER_NOTICE_LINES[1])).toBeHidden();

    const summary = main(page).locator('summary').filter({
      hasText: MEAL_WEATHER_SWITCH_HELP_HEADING,
    });
    const order = [weatherSwitch(page), summary, spinButton(page)];
    await regionSelect(page).focus();
    for (const target of order) {
      await page.keyboard.press('Tab');
      await expect(target).toBeFocused();
    }

    await weatherSwitch(page).click();
    await pickRegion(page, 'seoul');
    await page.reload();
    await expect(regionSelect(page)).not.toHaveText(regionLabel('seoul'));
    await expect(weatherSwitch(page)).toBeChecked();
    expect(await countGeolocation(page)).toBe(0);
  });

  test('AC-6 @smoke: 320px에서 날씨 영역과 결과가 가로 스크롤 없이 보이고 Tab으로 지도 링크에 닿는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await stubMaps(page);
    await stubWeather(page, ok('rain'));
    await openPage(page);

    await expect(regionSelect(page)).toBeVisible();
    await expect(weatherSwitch(page)).toBeVisible();
    await pickRegion(page, 'seoul');
    await spinOnce(page);
    await expect(text(page, getMealWeatherLine('rain'))).toBeVisible();
    await expectSourceAndAccuracy(page);
    await expect(mapLinks(page)).toHaveCount(3);
    for (const i of [0, 1, 2]) {
      await expect(mapLinks(page).nth(i)).toBeVisible();
    }
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    await spinButton(page).focus();
    let reached = false;
    for (let i = 0; i < 12 && !reached; i += 1) {
      await page.keyboard.press('Tab');
      reached = await mapLinks(page)
        .first()
        .evaluate((el) => el === document.activeElement);
    }
    expect(reached, 'Tab으로 첫 지도 링크에 닿는다').toBe(true);
  });
});
