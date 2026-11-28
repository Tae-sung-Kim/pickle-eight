import { describe, expect, it } from 'vitest';
import { MEAL_FORBIDDEN_TERMS } from '@/features/meal/constants/meal-copy-rule.constant';
import { getMealTemperatureText } from '@/features/meal/constants/meal-notice.constant';

const t = (
  minCelsius: number | null,
  maxCelsius: number | null,
  currentCelsius: number | null
) => getMealTemperatureText({ minCelsius, maxCelsius, currentCelsius });

describe('getMealTemperatureText', () => {
  it.each([
    [4, 9, 6, '오늘 4° ~ 9° · 현재 6°', '오늘 기온 4도에서 9도, 현재 6도'],
    [4, 9, null, '오늘 4° ~ 9°', '오늘 기온 4도에서 9도'],
    [null, null, 6, '현재 6°', '현재 6도'],
    [4, null, 6, '현재 6°', '현재 6도'],
  ] as const)('(%s,%s,%s)', (a, b, c, visible, spoken) => {
    expect(t(a, b, c)).toEqual({ visible, spoken });
  });

  it.each([
    [4, null, null],
    [null, null, null],
  ] as const)('(%s,%s,%s)는 줄 없음', (a, b, c) => {
    expect(t(a, b, c)).toBeNull();
  });

  it('출력에 금지어가 없다', () => {
    for (const r of [t(4, 9, 6), t(4, 9, null), t(null, null, 6)]) {
      for (const term of MEAL_FORBIDDEN_TERMS) {
        expect(r?.visible).not.toContain(term);
        expect(r?.spoken).not.toContain(term);
      }
    }
  });
});
