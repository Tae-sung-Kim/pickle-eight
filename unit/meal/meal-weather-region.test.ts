import { describe, expect, test } from 'vitest';
import { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';
import { isMealWeatherRegionKey } from '@/features/meal/utils/meal-weather.util';

// docs/meal-weather/grid-check.md 9장 임시 산출값
const EXPECTED: Record<string, [number, number]> = {
  seoul: [60, 127],
  busan: [98, 76],
  daegu: [89, 91],
  incheon: [55, 124],
  'jeonnam-gwangju': [58, 74],
  daejeon: [67, 100],
  ulsan: [102, 84],
  sejong: [66, 103],
  gyeonggi: [61, 120],
  gangwon: [73, 134],
  chungbuk: [69, 107],
  chungnam: [55, 106],
  jeonbuk: [63, 89],
  gyeongbuk: [91, 106],
  gyeongnam: [91, 77],
  jeju: [53, 38],
};

describe('MEAL_WEATHER_REGIONS', () => {
  test('16곳, key 중복 없음', () => {
    expect(MEAL_WEATHER_REGIONS).toHaveLength(16);
    expect(new Set(MEAL_WEATHER_REGIONS.map((r) => r.key)).size).toBe(16);
  });

  test('nx/ny가 grid-check 9장 표와 같고 0이 아니다', () => {
    for (const r of MEAL_WEATHER_REGIONS) {
      expect([r.nx, r.ny], r.key).toEqual(EXPECTED[r.key]);
      expect(r.nx).not.toBe(0);
      expect(r.ny).not.toBe(0);
    }
  });

  test('isMealWeatherRegionKey: 16개 key 통과', () => {
    for (const r of MEAL_WEATHER_REGIONS)
      expect(isMealWeatherRegionKey(r.key)).toBe(true);
  });

  test.each([
    'Seoul',
    ' seoul',
    '',
    null,
    undefined,
    1,
    '__proto__',
    'constructor',
  ])('isMealWeatherRegionKey: %j 거부', (v) => {
    expect(isMealWeatherRegionKey(v)).toBe(false);
  });
});
