import { describe, expect, test, vi } from 'vitest';
import type {
  MealMenuType,
  MealWeatherSnapshotType,
} from '@/features/meal/types/meal.type';

// 빈 태그 상수 대신 테스트용 id를 주입한다
vi.mock('@/features/meal/constants/meal-weather-tag.constant', () => {
  const empty = { snow: [], rain: [], hot: [], cold: [] };
  return {
    MEAL_WEATHER_TAGS: {
      lunch: {
        snow: ['l-snow'],
        rain: ['l-rain'],
        hot: ['l-hot'],
        cold: ['l-cold'],
      },
      dinner: {
        snow: ['d-snow'],
        rain: ['d-rain'],
        hot: ['d-hot'],
        cold: ['d-cold'],
      },
      breakfast: empty,
    },
  };
});

import {
  classifyMealWeather,
  getMealWeatherForecastBase,
  getMealWeatherNowcastBase,
  getMealWeatherWeightOf,
  toMealWeatherObservationFromForecast,
  toMealWeatherObservationFromNowcast,
} from '@/features/meal/utils/meal-weather.util';

const obs = (
  o: Partial<Parameters<typeof classifyMealWeather>[0]> = {}
): Parameters<typeof classifyMealWeather>[0] => ({
  precipitationCodes: [],
  hasSnowfall: false,
  maxCelsius: null,
  minCelsius: null,
  ...o,
});

// 입력은 UTC 기준. 한국 시간 = UTC + 9시간
const utc = (s: string) => new Date(`${s}Z`);

describe('classifyMealWeather', () => {
  test('더움 경계: 최고 28 이상, 27은 아님', () => {
    expect(classifyMealWeather(obs({ maxCelsius: 28 }))).toBe('hot');
    expect(classifyMealWeather(obs({ maxCelsius: 27 }))).toBe('normal');
  });

  test('추움 경계: 최저 5 이하, 6은 아님', () => {
    expect(classifyMealWeather(obs({ minCelsius: 5 }))).toBe('cold');
    expect(classifyMealWeather(obs({ minCelsius: 6 }))).toBe('normal');
  });

  test('기온 null은 건너뛴다', () => {
    expect(classifyMealWeather(obs())).toBe('normal');
    expect(classifyMealWeather(obs({ minCelsius: 0 }))).toBe('cold');
    expect(classifyMealWeather(obs({ maxCelsius: 30 }))).toBe('hot');
  });

  test('눈 우선: 눈 코드, 적설, 비/눈 혼합은 눈이고 비·기온보다 앞선다', () => {
    for (const c of [2, 3, 6, 7]) {
      expect(classifyMealWeather(obs({ precipitationCodes: [c] }))).toBe(
        'snow'
      );
    }
    expect(classifyMealWeather(obs({ hasSnowfall: true }))).toBe('snow');
    expect(
      classifyMealWeather(
        obs({ precipitationCodes: [1, 3], maxCelsius: 30, minCelsius: 0 })
      )
    ).toBe('snow');
  });

  test('비 우선: 비 코드는 기온보다 앞선다', () => {
    for (const c of [1, 4, 5]) {
      expect(classifyMealWeather(obs({ precipitationCodes: [c] }))).toBe(
        'rain'
      );
    }
    expect(
      classifyMealWeather(
        obs({ precipitationCodes: [1], maxCelsius: 30, minCelsius: 0 })
      )
    ).toBe('rain');
    expect(classifyMealWeather(obs({ precipitationCodes: [0] }))).toBe(
      'normal'
    );
  });

  test('더움이 추움보다 앞선다', () => {
    expect(classifyMealWeather(obs({ maxCelsius: 30, minCelsius: 0 }))).toBe(
      'hot'
    );
  });
});

describe('기상청 응답 변환', () => {
  const D = '20260601';
  const f = (category: string, fcstValue: string, fcstDate = D) => ({
    category,
    fcstDate,
    fcstValue,
  });

  test('예보: PTY·TMX·TMN을 읽고 다른 날짜 행은 무시', () => {
    const r = toMealWeatherObservationFromForecast(
      [
        f('PTY', '1'),
        f('TMX', '29.0'),
        f('TMN', '-3.0'),
        f('TMX', '99', '20260602'),
      ],
      D
    );
    expect(r).toEqual({
      precipitationCodes: [1],
      hasSnowfall: false,
      maxCelsius: 29,
      minCelsius: -3,
    });
  });

  test('SNO: "적설없음"은 false, "1cm 미만"은 true', () => {
    const base = [f('PTY', '0')];
    expect(
      toMealWeatherObservationFromForecast([...base, f('SNO', '적설없음')], D)
        ?.hasSnowfall
    ).toBe(false);
    expect(
      toMealWeatherObservationFromForecast([...base, f('SNO', '1cm 미만')], D)
        ?.hasSnowfall
    ).toBe(true);
  });

  test('모양 다른 행은 건너뛴다', () => {
    const r = toMealWeatherObservationFromForecast(
      [
        null,
        'x',
        1,
        {},
        { category: 'TMX' },
        { fcstDate: D, fcstValue: '9' },
        f('TMX', '30'),
      ],
      D
    );
    expect(r?.maxCelsius).toBe(30);
    expect(r?.precipitationCodes).toEqual([]);
  });

  test('PTY는 정수만', () => {
    const r = toMealWeatherObservationFromForecast(
      [f('PTY', '1.5'), f('PTY', 'abc'), f('PTY', ''), f('PTY', '3')],
      D
    );
    expect(r?.precipitationCodes).toEqual([3]);
  });

  test('쓸 행이 없으면 null (실황 대체 대상)', () => {
    expect(toMealWeatherObservationFromForecast([], D)).toBeNull();
    expect(
      toMealWeatherObservationFromForecast([f('SKY', '1'), f('POP', '10')], D)
    ).toBeNull();
    expect(
      toMealWeatherObservationFromForecast([f('PTY', '0', '20260602')], D)
    ).toBeNull();
  });

  test('TMX가 숫자가 아니면 null로 둔다', () => {
    const r = toMealWeatherObservationFromForecast(
      [f('PTY', '0'), f('TMX', 'N/A')],
      D
    );
    expect(r?.maxCelsius).toBeNull();
  });

  test('실황: T1H를 최고·최저에 같이 넣고 눈 적설은 false', () => {
    const r = toMealWeatherObservationFromNowcast([
      { category: 'PTY', obsrValue: '1' },
      { category: 'T1H', obsrValue: '12.5' },
      { category: 'REH', obsrValue: '50' },
      null,
    ]);
    expect(r).toEqual({
      precipitationCodes: [1],
      hasSnowfall: false,
      maxCelsius: 12.5,
      minCelsius: 12.5,
    });
    expect(toMealWeatherObservationFromNowcast([])).toBeNull();
  });
});

describe('발표 시각', () => {
  test('단기예보: 한국 02:19는 어제 2300, 02:20은 오늘 0200', () => {
    // KST 02:19 = UTC 전날 17:19
    expect(getMealWeatherForecastBase(utc('2026-05-31T17:19:00'))).toEqual({
      baseDate: '20260531',
      baseTime: '2300',
      targetDate: '20260601',
    });
    expect(getMealWeatherForecastBase(utc('2026-05-31T17:20:00'))).toEqual({
      baseDate: '20260601',
      baseTime: '0200',
      targetDate: '20260601',
    });
  });

  test('단기예보: 월 경계에서 어제 날짜 계산', () => {
    // KST 2026-03-01 00:30
    expect(getMealWeatherForecastBase(utc('2026-02-28T15:30:00'))).toEqual({
      baseDate: '20260228',
      baseTime: '2300',
      targetDate: '20260301',
    });
  });

  test('초단기실황: 10:44는 09시, 10:45는 10시', () => {
    // KST 10:44 = UTC 01:44
    expect(getMealWeatherNowcastBase(utc('2026-06-01T01:44:00'))).toEqual({
      baseDate: '20260601',
      baseTime: '0900',
    });
    expect(getMealWeatherNowcastBase(utc('2026-06-01T01:45:00'))).toEqual({
      baseDate: '20260601',
      baseTime: '1000',
    });
  });

  test('초단기실황: 한국 00:10은 전날 2300 (날짜 넘김)', () => {
    // KST 2026-06-01 00:10 = UTC 05-31 15:10
    expect(getMealWeatherNowcastBase(utc('2026-05-31T15:10:00'))).toEqual({
      baseDate: '20260531',
      baseTime: '2300',
    });
  });

  test('서버 시간대와 무관: UTC 날짜와 한국 날짜가 다른 순간', () => {
    // UTC 2026-06-01 20:00 = KST 2026-06-02 05:00
    expect(getMealWeatherForecastBase(utc('2026-06-01T20:00:00'))).toEqual({
      baseDate: '20260602',
      baseTime: '0200',
      targetDate: '20260602',
    });
    expect(getMealWeatherNowcastBase(utc('2026-06-01T20:00:00'))).toEqual({
      baseDate: '20260602',
      baseTime: '0400',
    });
  });
});

describe('getMealWeatherWeightOf', () => {
  const m = (id: string) => ({ id }) as MealMenuType;
  const ready = (
    condition: 'snow' | 'rain' | 'hot' | 'cold' | 'normal'
  ): MealWeatherSnapshotType => ({
    status: 'ready',
    condition,
    forecastDate: '2026-06-01',
    minCelsius: 4,
    maxCelsius: 9,
    currentCelsius: 6,
  });

  test('off, unavailable, ready+normal은 태그 메뉴도 모두 1', () => {
    for (const w of [
      { status: 'off' },
      { status: 'unavailable' },
      ready('normal'),
    ] as MealWeatherSnapshotType[]) {
      const weightOf = getMealWeatherWeightOf('lunch', w);
      expect(weightOf(m('l-snow'))).toBe(1);
      expect(weightOf(m('other'))).toBe(1);
    }
  });

  test.each([
    ['snow', 'l-snow'],
    ['rain', 'l-rain'],
    ['hot', 'l-hot'],
    ['cold', 'l-cold'],
  ] as const)('ready+%s: 태그 id만 3, 나머지는 1', (cond, id) => {
    const weightOf = getMealWeatherWeightOf('lunch', ready(cond));
    expect(weightOf(m(id))).toBe(3);
    expect(weightOf(m('other'))).toBe(1);
  });

  test('다른 날씨 태그와 다른 끼니 태그는 가중치 없음', () => {
    const weightOf = getMealWeatherWeightOf('lunch', ready('snow'));
    expect(weightOf(m('l-rain'))).toBe(1);
    expect(weightOf(m('d-snow'))).toBe(1);
    expect(getMealWeatherWeightOf('dinner', ready('snow'))(m('d-snow'))).toBe(
      3
    );
    expect(
      getMealWeatherWeightOf('breakfast', ready('snow'))(m('l-snow'))
    ).toBe(1);
  });
});
