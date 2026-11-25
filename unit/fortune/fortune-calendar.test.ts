import { describe, expect, test } from 'vitest';
import { LUNAR_TABLE as FORTUNE_LUNAR_TABLE } from '@/constants/lunar-table.constant';
import { FORTUNE_SOLAR_TERM_TABLE } from '@/features/fortune/constants/calendar/solar-term-table.constant';
import {
  FORTUNE_BIRTH_YEAR_MAX,
  FORTUNE_BIRTH_YEAR_MIN,
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_AGE,
  FORTUNE_MIN_BIRTH,
  FORTUNE_SOLAR_TERM_RENEW_BY,
  FORTUNE_SUPPORTED_MAX_YEAR,
} from '@/features/fortune/constants/fortune-input.constant';
import type {
  FortuneBandType,
  FortuneBirthErrorType,
  FortuneBirthResolvedType,
  FortuneCategoryKeyType,
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  compareYmd,
  fromJulianDayNumber,
  isValidSolarDate,
  parseDateKey,
  toJulianDayNumber,
} from '@/features/fortune/utils/fortune-date.util';
import {
  convertLunarToSolar,
  getLunarLeapMonth,
  getLunarMonthLength,
  getSeollalDate,
} from '@/features/fortune/utils/fortune-lunar.util';
import {
  compareDateToSolarTerm,
  getSolarTermTime,
  isClockOnOrAfterSolarTerm,
} from '@/features/fortune/utils/fortune-solar-term.util';

// ---------- 도우미 ----------

const _TTI_KEYS: readonly FortuneTtiKeyType[] = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
];

const _STAR_SIGN_KEYS: readonly FortuneStarSignKeyType[] = [
  'capricorn',
  'aquarius',
  'pisces',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
];

/** 중기(홀수 절기 인덱스) 순서의 별자리: 대한부터 소설까지. 동지(23)는 염소자리다 */
const _STAR_SIGN_BY_MID_TERM: readonly FortuneStarSignKeyType[] = [
  'aquarius', // 대한 1
  'pisces', // 우수 3
  'aries', // 춘분 5
  'taurus', // 곡우 7
  'gemini', // 소만 9
  'cancer', // 하지 11
  'leo', // 대서 13
  'virgo', // 처서 15
  'libra', // 추분 17
  'scorpio', // 상강 19
  'sagittarius', // 소설 21
  'capricorn', // 동지 23
];

const _CATEGORY_KEYS: readonly FortuneCategoryKeyType[] = [
  'total',
  'money',
  'love',
  'work',
  'health',
];

const _BANDS: readonly FortuneBandType[] = ['high', 'mid', 'low'];

function ymd(year: number, month: number, day: number): FortuneYmdType {
  return { year, month, day };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toKey(value: FortuneYmdType): string {
  return `${value.year}-${pad2(value.month)}-${pad2(value.day)}`;
}

function addDays(value: FortuneYmdType, days: number): FortuneYmdType {
  return fromJulianDayNumber(toJulianDayNumber(value) + days);
}

/** 표 값(월일 * 10000 + 시분)을 읽는다. 함수가 아니라 표를 직접 읽어 값을 대조한다 */
function rawTerm(year: number, index: number): number {
  return FORTUNE_SOLAR_TERM_TABLE[year][index];
}

/** 절기 시각을 연 단위 분으로 바꾼다(간격 계산용). 연도가 다르면 JDN으로 이어진다 */
function termAbsoluteMinutes(year: number, index: number): number {
  const term = getSolarTermTime(year, index);
  if (!term) {
    throw new Error(`절기 표에 ${year}년 ${index}가 없습니다.`);
  }
  return (
    toJulianDayNumber(ymd(year, term.month, term.day)) * 1440 +
    term.hour * 60 +
    term.minute
  );
}

/** 개인 시드 문자열 (design.md 4.6 확정 형식) */
function _personalSeed(birth: FortuneYmdType, todayKey: string): string {
  return `fortune-v1|personal|${toKey(birth)}|${todayKey}`;
}

function _ttiSeed(key: FortuneTtiKeyType, todayKey: string): string {
  return `fortune-v1|tti|${key}|${todayKey}`;
}

function _starSignSeed(key: FortuneStarSignKeyType, todayKey: string): string {
  return `fortune-v1|star-sign|${key}|${todayKey}`;
}

function expectError(
  result: FortuneBirthResolvedType,
  error: FortuneBirthErrorType
): void {
  expect(result).toEqual({ ok: false, error });
}

function expectSolar(
  result: FortuneBirthResolvedType,
  solar: FortuneYmdType,
  isFromLunar: boolean
): void {
  expect(result).toEqual({ ok: true, solar, isFromLunar });
}

type LunarInputType = Readonly<{
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}>;

/** 표를 처음부터 훑어 그 양력 날짜가 되는 음력 입력을 찾는다(왕복 검사용) */
function findLunarInput(solar: FortuneYmdType): LunarInputType | null {
  for (const year of [solar.year - 1, solar.year]) {
    const leap = getLunarLeapMonth(year);
    if (leap === null) {
      continue;
    }
    for (let month = 1; month <= 12; month += 1) {
      for (const isLeapMonth of leap === month ? [false, true] : [false]) {
        const length = getLunarMonthLength(year, month, isLeapMonth) ?? 0;
        for (let day = 1; day <= length; day += 1) {
          const result = convertLunarToSolar(year, month, day, isLeapMonth);
          if (result.ok && compareYmd(result.solar, solar) === 0) {
            return { year, month, day, isLeapMonth };
          }
        }
      }
    }
  }
  return null;
}

/** 절기 표 보완(F-1) 기한 경과 여부. 만료 감시 테스트와 그 자체 검사가 함께 쓴다 */
function isSolarTermRenewalOverdue(
  todayKey: string,
  supportedMaxYear: number,
  renewBy: string
): boolean {
  const todayYear = Number(todayKey.slice(0, 4));
  return todayKey >= renewBy && supportedMaxYear < todayYear + 1;
}

const _TODAY_AC = ymd(2026, 11, 5);

describe('달력 표: 음력 표', () => {
  test('음력 표는 1919~2049년이 한 해도 빠지지 않고 연속이다', () => {
    expect(FORTUNE_LUNAR_TABLE).toHaveLength(131);
    FORTUNE_LUNAR_TABLE.forEach((row, index) => {
      expect(row.year).toBe(1919 + index);
    });
    expect(FORTUNE_LUNAR_TABLE[0].year).toBe(1919);
    expect(FORTUNE_LUNAR_TABLE[FORTUNE_LUNAR_TABLE.length - 1].year).toBe(2049);
  });

  test('음력 표: 윤달은 연도당 0~1개이고 윤달 비트는 윤달이 있는 해에만 쓴다', () => {
    for (const row of FORTUNE_LUNAR_TABLE) {
      expect(Number.isInteger(row.leapMonth), `${row.year}년`).toBe(true);
      expect(row.leapMonth, `${row.year}년`).toBeGreaterThanOrEqual(0);
      expect(row.leapMonth, `${row.year}년`).toBeLessThanOrEqual(12);
      // 13비트(bit0~bit12) 밖의 값은 없다
      expect(row.monthBits, `${row.year}년`).toBeGreaterThanOrEqual(0);
      expect(row.monthBits, `${row.year}년`).toBeLessThan(1 << 13);
      if (row.leapMonth === 0) {
        expect(row.monthBits & (1 << 12), `${row.year}년 윤달 비트`).toBe(0);
      }
    }
  });

  test('음력 표: 윤달이 있는 해는 48개다 (calendar-verification.md 기록)', () => {
    const leapYears = FORTUNE_LUNAR_TABLE.filter((row) => row.leapMonth > 0);
    expect(leapYears).toHaveLength(48);
  });

  test('음력 표: 모든 달의 길이는 29 또는 30이다', () => {
    for (const row of FORTUNE_LUNAR_TABLE) {
      for (let month = 1; month <= 12; month += 1) {
        const length = getLunarMonthLength(row.year, month, false);
        expect([29, 30], `${row.year}년 ${month}월`).toContain(length);
      }
      if (row.leapMonth > 0) {
        const length = getLunarMonthLength(row.year, row.leapMonth, true);
        expect([29, 30], `${row.year}년 윤${row.leapMonth}월`).toContain(
          length
        );
      }
    }
  });

  test('음력 표: 한 해 일수는 353~355 또는 383~385다', () => {
    for (const row of FORTUNE_LUNAR_TABLE) {
      let total = 0;
      for (let month = 1; month <= 12; month += 1) {
        total += getLunarMonthLength(row.year, month, false) ?? 0;
      }
      if (row.leapMonth > 0) {
        total += getLunarMonthLength(row.year, row.leapMonth, true) ?? 0;
      }
      const isCommon = total >= 353 && total <= 355;
      const isLeap = total >= 383 && total <= 385;
      expect(
        row.leapMonth === 0 ? isCommon : isLeap,
        `${row.year}년 일수 ${total}, 윤달 ${row.leapMonth}`
      ).toBe(true);
    }
  });

  test('음력 표: 설날은 양력 1월 21일~2월 20일 안의 실제 날짜다', () => {
    for (const row of FORTUNE_LUNAR_TABLE) {
      const month = Math.floor(row.newYear / 100);
      const day = row.newYear % 100;
      expect(isValidSolarDate(ymd(row.year, month, day)), `${row.year}년`).toBe(
        true
      );
      expect(row.newYear, `${row.year}년 설날`).toBeGreaterThanOrEqual(121);
      expect(row.newYear, `${row.year}년 설날`).toBeLessThanOrEqual(220);
    }
  });

  test('음력 표: 다음 해 설날 − 이번 해 설날 = 이번 해 일수 (표 안의 두 값이 서로 맞는다)', () => {
    for (let i = 0; i < FORTUNE_LUNAR_TABLE.length - 1; i += 1) {
      const row = FORTUNE_LUNAR_TABLE[i];
      const next = FORTUNE_LUNAR_TABLE[i + 1];
      const start = toJulianDayNumber(getSeollalDate(row.year));
      const nextStart = toJulianDayNumber(getSeollalDate(next.year));
      let total = 0;
      for (let month = 1; month <= 12; month += 1) {
        total += getLunarMonthLength(row.year, month, false) ?? 0;
      }
      if (row.leapMonth > 0) {
        total += getLunarMonthLength(row.year, row.leapMonth, true) ?? 0;
      }
      expect(nextStart - start, `${row.year}년`).toBe(total);
    }
  });

  test('음력 표: 음력 마지막 날을 변환한 다음 날이 다음 해 설날이다 (변환 함수와 표 일관)', () => {
    for (let i = 0; i < FORTUNE_LUNAR_TABLE.length - 1; i += 1) {
      const row = FORTUNE_LUNAR_TABLE[i];
      const lastIsLeap = row.leapMonth === 12;
      const lastLength = getLunarMonthLength(row.year, 12, lastIsLeap) ?? 0;
      const last = convertLunarToSolar(row.year, 12, lastLength, lastIsLeap);
      expect(last.ok, `${row.year}년`).toBe(true);
      if (last.ok) {
        const nextNewYear = getSeollalDate(row.year + 1);
        expect(
          compareYmd(addDays(last.solar, 1), nextNewYear),
          `${row.year}년 12월 ${lastLength}일`
        ).toBe(0);
      }
    }
  });

  test('음력 표와 절기 표의 일관: 윤달에는 중기가 없고 평달에는 중기가 있다 (두 표를 서로 교차 확인)', () => {
    // 윤달 규칙(중기가 없는 달이 윤달). 달 전체가 1920-01-01 ~ 2028-12-31 안에 있는 달만 본다.
    const midTermJdns: number[] = [];
    for (let year = 1920; year <= FORTUNE_SUPPORTED_MAX_YEAR; year += 1) {
      for (let index = 1; index < 24; index += 2) {
        const term = getSolarTermTime(year, index);
        if (term) {
          midTermJdns.push(toJulianDayNumber(ymd(year, term.month, term.day)));
        }
      }
    }
    const spanStart = toJulianDayNumber(FORTUNE_MIN_BIRTH);
    const spanEnd = toJulianDayNumber(FORTUNE_MAX_BIRTH);
    const mismatches: string[] = [];
    const borderline: string[] = [];
    let leapChecked = 0;
    let commonChecked = 0;

    for (const row of FORTUNE_LUNAR_TABLE) {
      if (row.year > FORTUNE_SUPPORTED_MAX_YEAR) {
        break;
      }
      let start = toJulianDayNumber(getSeollalDate(row.year));
      for (let month = 1; month <= 12; month += 1) {
        const parts = row.leapMonth === month ? [false, true] : [false];
        for (const isLeapMonth of parts) {
          const length = getLunarMonthLength(row.year, month, isLeapMonth) ?? 0;
          const end = start + length - 1;
          if (start >= spanStart && end <= spanEnd) {
            const count = midTermJdns.filter(
              (jdn) => jdn >= start && jdn <= end
            ).length;
            const label = `음력 ${row.year}년 ${isLeapMonth ? '윤' : ''}${month}월 (중기 ${count}개)`;
            if (isLeapMonth) {
              leapChecked += 1;
              if (count !== 0) {
                mismatches.push(label);
              }
            } else {
              commonChecked += 1;
              if (count < 1) {
                // 중기가 다음 달 1일(= 이 달 마지막 날 다음 날)에 드는 경우는 날짜 단위 비교의 경계 모호함이다.
                // 신월 시각이 그날 중기 시각보다 늦으면 그 중기는 이 달에 속한다
                if (midTermJdns.includes(end + 1)) {
                  borderline.push(label);
                } else {
                  mismatches.push(label);
                }
              }
            }
          }
          start += length;
        }
      }
    }
    expect(leapChecked).toBeGreaterThan(30);
    expect(commonChecked).toBeGreaterThan(1000);
    expect(mismatches).toEqual([]);
    // 경계 모호함은 드물어야 한다(표 전체 약 1,300달 중 몇 달)
    expect(borderline.length, borderline.join(', ')).toBeLessThanOrEqual(5);
  });
});

describe('달력 표: 24절기 표', () => {
  const years = Object.keys(FORTUNE_SOLAR_TERM_TABLE)
    .map(Number)
    .sort((a, b) => a - b);

  test('절기 표는 1920~2028년이 연속이고 연도마다 정확히 24개다', () => {
    expect(years).toHaveLength(109);
    expect(years[0]).toBe(1920);
    expect(years[years.length - 1]).toBe(2028);
    years.forEach((year, index) => {
      expect(year).toBe(1920 + index);
      expect(FORTUNE_SOLAR_TERM_TABLE[year], `${year}년`).toHaveLength(24);
    });
  });

  test('절기 표: 모든 값이 실제 날짜·시각이고 절기 번호와 달이 맞는다 (소한·대한 1월 … 대설·동지 12월)', () => {
    for (const year of years) {
      for (let index = 0; index < 24; index += 1) {
        const term = getSolarTermTime(year, index);
        const label = `${year}년 절기 ${index}`;
        expect(term, label).not.toBeNull();
        if (!term) {
          continue;
        }
        expect(term.month, label).toBe(Math.floor(index / 2) + 1);
        expect(isValidSolarDate(ymd(year, term.month, term.day)), label).toBe(
          true
        );
        expect(term.hour, label).toBeGreaterThanOrEqual(0);
        expect(term.hour, label).toBeLessThanOrEqual(23);
        expect(term.minute, label).toBeGreaterThanOrEqual(0);
        expect(term.minute, label).toBeLessThanOrEqual(59);
      }
    }
  });

  test('절기 표: 시각이 오름차순이고 이웃한 절기 간격은 14~16일이다 (연말 동지 → 다음 해 소한 포함)', () => {
    for (const year of years) {
      for (let index = 1; index < 24; index += 1) {
        const gap =
          termAbsoluteMinutes(year, index) -
          termAbsoluteMinutes(year, index - 1);
        const label = `${year}년 절기 ${index - 1} → ${index}`;
        expect(gap, label).toBeGreaterThan(14 * 1440);
        expect(gap, label).toBeLessThan(16 * 1440);
      }
      if (year < FORTUNE_SUPPORTED_MAX_YEAR) {
        const gap =
          termAbsoluteMinutes(year + 1, 0) - termAbsoluteMinutes(year, 23);
        const label = `${year}년 동지 → ${year + 1}년 소한`;
        expect(gap, label).toBeGreaterThan(14 * 1440);
        expect(gap, label).toBeLessThan(16 * 1440);
      }
    }
  });

  test('절기 표: 입춘은 2월 3~5일, 춘분은 3월 19~22일이다', () => {
    for (const year of years) {
      const lichun = getSolarTermTime(year, 2);
      const equinox = getSolarTermTime(year, 5);
      expect(lichun?.month, `${year}년 입춘`).toBe(2);
      expect(lichun?.day, `${year}년 입춘`).toBeGreaterThanOrEqual(3);
      expect(lichun?.day, `${year}년 입춘`).toBeLessThanOrEqual(5);
      expect(equinox?.month, `${year}년 춘분`).toBe(3);
      expect(equinox?.day, `${year}년 춘분`).toBeGreaterThanOrEqual(19);
      expect(equinox?.day, `${year}년 춘분`).toBeLessThanOrEqual(22);
    }
  });

  test('절기 표: 입춘은 같은 해 설날보다 늦지 않거나 설날보다 앞선다 (설날과 입춘 사이는 최대 한 달 안쪽)', () => {
    for (const year of years) {
      const lichun = getSolarTermTime(year, 2);
      if (!lichun) {
        continue;
      }
      const diff =
        toJulianDayNumber(ymd(year, lichun.month, lichun.day)) -
        toJulianDayNumber(getSeollalDate(year));
      expect(Math.abs(diff), `${year}년`).toBeLessThanOrEqual(31);
    }
  });
});

// =====================================================================

describe('알려진 값 대조 (KASI 값)', () => {
  test('1: 음력 2025-01-01 = 양력 2025-01-29 (표 newYear 129, 변환 함수)', () => {
    const row = FORTUNE_LUNAR_TABLE.find((item) => item.year === 2025);
    expect(row?.newYear).toBe(129);
    expect(convertLunarToSolar(2025, 1, 1, false)).toEqual({
      ok: true,
      solar: ymd(2025, 1, 29),
      isFromLunar: true,
    });
    expect(getSeollalDate(2025)).toEqual(ymd(2025, 1, 29));
  });

  test('2: 음력 2000-01-01 = 양력 2000-02-05 (표 newYear 205, 변환 함수)', () => {
    const row = FORTUNE_LUNAR_TABLE.find((item) => item.year === 2000);
    expect(row?.newYear).toBe(205);
    expect(convertLunarToSolar(2000, 1, 1, false)).toEqual({
      ok: true,
      solar: ymd(2000, 2, 5),
      isFromLunar: true,
    });
  });

  test('3: 2025 입춘 02-03 23:10', () => {
    expect(rawTerm(2025, 2)).toBe(2032310);
    expect(getSolarTermTime(2025, 2)).toEqual({
      month: 2,
      day: 3,
      hour: 23,
      minute: 10,
    });
  });

  test('4: 2024 춘분 03-20 12:06', () => {
    expect(rawTerm(2024, 5)).toBe(3201206);
    expect(getSolarTermTime(2024, 5)).toEqual({
      month: 3,
      day: 20,
      hour: 12,
      minute: 6,
    });
  });

  test('5: 2025 춘분 03-20 18:01', () => {
    expect(rawTerm(2025, 5)).toBe(3201801);
    expect(getSolarTermTime(2025, 5)).toEqual({
      month: 3,
      day: 20,
      hour: 18,
      minute: 1,
    });
  });

  test('6: 2026 춘분 03-20 23:46', () => {
    expect(rawTerm(2026, 5)).toBe(3202346);
    expect(getSolarTermTime(2026, 5)).toEqual({
      month: 3,
      day: 20,
      hour: 23,
      minute: 46,
    });
  });

  test('7: 2027 춘분 03-21 05:25', () => {
    expect(rawTerm(2027, 5)).toBe(3210525);
    expect(getSolarTermTime(2027, 5)).toEqual({
      month: 3,
      day: 21,
      hour: 5,
      minute: 25,
    });
  });

  test('8: 1920 입춘 02-05 11:26', () => {
    expect(rawTerm(1920, 2)).toBe(2051126);
    expect(getSolarTermTime(1920, 2)).toEqual({
      month: 2,
      day: 5,
      hour: 11,
      minute: 26,
    });
  });

  test('9: 2026 입춘 02-04 05:02', () => {
    expect(rawTerm(2026, 2)).toBe(2040502);
    expect(getSolarTermTime(2026, 2)).toEqual({
      month: 2,
      day: 4,
      hour: 5,
      minute: 2,
    });
  });

  test('추가: 1950 입춘 02-04 18:21, 1950 대한은 1월 21일 00:00으로 정규화되어 있다', () => {
    expect(rawTerm(1950, 2)).toBe(2041821);
    expect(getSolarTermTime(1950, 2)).toEqual({
      month: 2,
      day: 4,
      hour: 18,
      minute: 21,
    });
    expect(rawTerm(1950, 1)).toBe(1210000);
    expect(getSolarTermTime(1950, 1)).toEqual({
      month: 1,
      day: 21,
      hour: 0,
      minute: 0,
    });
  });

  test('추가(설계 4.1): 양력 1920-02-05 = 음력 1919-12-16, 양력 2026-02-04 = 음력 2025-12-17', () => {
    // 1919년은 윤7월이 있어 12월 위치 계산에 윤달 길이가 들어간다
    expectSolar(
      convertLunarToSolar(1919, 12, 16, false),
      ymd(1920, 2, 5),
      true
    );
    expectSolar(
      convertLunarToSolar(2025, 12, 17, false),
      ymd(2026, 2, 4),
      true
    );
  });

  test('추가(calendar-verification.md): 양력 2023-04-15 = 음력 2023-02-25(윤)', () => {
    expect(findLunarInput(ymd(2023, 4, 15))).toEqual({
      year: 2023,
      month: 2,
      day: 25,
      isLeapMonth: true,
    });
  });

  test('추가: 양력 1920-01-01은 음력 1919년 11월에 있다 (표가 1919년부터 필요한 이유)', () => {
    const input = findLunarInput(ymd(1920, 1, 1));
    expect(input?.year).toBe(1919);
    expect(input?.month).toBe(11);
  });

  test('추가: 윤달이 있는 알려진 해 (2017 윤5월, 2020 윤4월, 2023 윤2월, 2025 윤6월)', () => {
    expect(getLunarLeapMonth(2017)).toBe(5);
    expect(getLunarLeapMonth(2020)).toBe(4);
    expect(getLunarLeapMonth(2023)).toBe(2);
    expect(getLunarLeapMonth(2025)).toBe(6);
    expect(getLunarLeapMonth(2024)).toBe(0);
    expect(getLunarLeapMonth(2026)).toBe(0);
  });
});

// =====================================================================

describe('fortune-lunar', () => {
  test('AC-7: 음력 2025-01-01 → 양력 2025-01-29, 음력 2000-01-01 → 양력 2000-02-05', () => {
    expectSolar(convertLunarToSolar(2025, 1, 1, false), ymd(2025, 1, 29), true);
    expectSolar(convertLunarToSolar(2000, 1, 1, false), ymd(2000, 2, 5), true);
    expect(getSeollalDate(2025)).toEqual(ymd(2025, 1, 29));
    expect(getSeollalDate(2000)).toEqual(ymd(2000, 2, 5));
  });

  test('AC-85: 음력 2023년 2월은 평달 1일 = 2023-02-20, 윤달 1일 = 2023-03-22로 서로 다르다', () => {
    expect(getLunarLeapMonth(2023)).toBe(2);
    expectSolar(convertLunarToSolar(2023, 2, 1, false), ymd(2023, 2, 20), true);
    expectSolar(convertLunarToSolar(2023, 2, 1, true), ymd(2023, 3, 22), true);
    // 윤달 25일 = 양력 2023-04-15 (calendar-verification.md), 윤달 뒤 3월 1일 = 2023-04-20
    expectSolar(convertLunarToSolar(2023, 2, 25, true), ymd(2023, 4, 15), true);
    expectSolar(convertLunarToSolar(2023, 3, 1, false), ymd(2023, 4, 20), true);
    // 평달과 윤달 같은 날의 양력은 서로 달라야 한다
    for (let day = 1; day <= 29; day += 1) {
      const normal = convertLunarToSolar(2023, 2, day, false);
      const leap = convertLunarToSolar(2023, 2, day, true);
      expect(normal.ok && leap.ok).toBe(true);
      if (normal.ok && leap.ok) {
        expect(compareYmd(normal.solar, leap.solar), `${day}일`).toBe(-1);
      }
    }
  });

  test('AC-8: 윤달이 없는 달에서 윤달 체크를 넣으면 lunar-no-leap', () => {
    expectError(convertLunarToSolar(2023, 3, 1, true), 'lunar-no-leap');
    expectError(convertLunarToSolar(2023, 1, 1, true), 'lunar-no-leap');
    // 윤달이 아예 없는 해
    expectError(convertLunarToSolar(2024, 6, 1, true), 'lunar-no-leap');
  });

  test('AC-8: 29일까지인 달의 30일은 lunar-invalid-day (표 전체를 달마다 확인)', () => {
    // 2023년 1월은 29일, 2월은 30일
    expect(getLunarMonthLength(2023, 1, false)).toBe(29);
    expectError(convertLunarToSolar(2023, 1, 30, false), 'lunar-invalid-day');
    expect(convertLunarToSolar(2023, 1, 29, false).ok).toBe(true);
    expect(getLunarMonthLength(2023, 2, false)).toBe(30);
    expect(convertLunarToSolar(2023, 2, 30, false).ok).toBe(true);
    // 윤2월은 29일
    expect(getLunarMonthLength(2023, 2, true)).toBe(29);
    expectError(convertLunarToSolar(2023, 2, 30, true), 'lunar-invalid-day');

    for (const row of FORTUNE_LUNAR_TABLE) {
      for (let month = 1; month <= 12; month += 1) {
        const parts = row.leapMonth === month ? [false, true] : [false];
        for (const isLeapMonth of parts) {
          const length = getLunarMonthLength(row.year, month, isLeapMonth);
          const label = `${row.year}년 ${isLeapMonth ? '윤' : ''}${month}월`;
          if (length === 29) {
            expectError(
              convertLunarToSolar(row.year, month, 30, isLeapMonth),
              'lunar-invalid-day'
            );
            expect(
              convertLunarToSolar(row.year, month, 29, isLeapMonth).ok,
              label
            ).toBe(true);
          } else {
            expect(
              convertLunarToSolar(row.year, month, 30, isLeapMonth).ok,
              label
            ).toBe(true);
          }
          expectError(
            convertLunarToSolar(row.year, month, 31, isLeapMonth),
            'lunar-invalid-day'
          );
        }
      }
    }
  });

  test('음력 변환: 월·일이 범위 밖이면 invalid-date, 표 밖 연도는 out-of-table', () => {
    expectError(convertLunarToSolar(2025, 0, 1, false), 'invalid-date');
    expectError(convertLunarToSolar(2025, 13, 1, false), 'invalid-date');
    expectError(convertLunarToSolar(2025, 1, 0, false), 'invalid-date');
    expectError(convertLunarToSolar(2025, 1.5, 1, false), 'invalid-date');
    expectError(convertLunarToSolar(1918, 1, 1, false), 'out-of-table');
    expectError(convertLunarToSolar(2050, 1, 1, false), 'out-of-table');
  });

  test('getLunarLeapMonth·getLunarMonthLength: 표 밖·없는 달은 null (예외 없음)', () => {
    expect(getLunarLeapMonth(1918)).toBeNull();
    expect(getLunarLeapMonth(2050)).toBeNull();
    expect(getLunarLeapMonth(1919)).toBe(7);
    expect(getLunarLeapMonth(2049)).not.toBeNull();
    expect(getLunarMonthLength(1918, 1, false)).toBeNull();
    expect(getLunarMonthLength(2050, 1, false)).toBeNull();
    expect(getLunarMonthLength(2023, 3, true)).toBeNull();
    expect(getLunarMonthLength(2024, 1, true)).toBeNull();
    expect(getLunarMonthLength(2023, 0, false)).toBeNull();
    expect(getLunarMonthLength(2023, 13, false)).toBeNull();
    expect(getLunarMonthLength(2023, 2, true)).toBe(29);
  });

  test('getSeollalDate: 표 밖 연도는 RangeError', () => {
    expect(() => getSeollalDate(1918)).toThrow(RangeError);
    expect(() => getSeollalDate(2050)).toThrow(RangeError);
    expect(getSeollalDate(1919)).toEqual(ymd(1919, 2, 1));
    expect(getSeollalDate(2024)).toEqual(ymd(2024, 2, 10));
  });

  test('음력 변환은 양력 날짜와 1대1이다 (1920~2028 모든 양력 날짜가 음력 입력 하나로 돌아온다)', () => {
    // 1919년 11월 ~ 2028년 12월 음력을 모두 풀어 양력 날짜가 겹치지 않고 하루씩 이어지는지 본다
    let expectedJdn = toJulianDayNumber(getSeollalDate(1919));
    for (const row of FORTUNE_LUNAR_TABLE) {
      if (row.year > 2048) {
        break;
      }
      for (let month = 1; month <= 12; month += 1) {
        const parts = row.leapMonth === month ? [false, true] : [false];
        for (const isLeapMonth of parts) {
          const length = getLunarMonthLength(row.year, month, isLeapMonth) ?? 0;
          for (let day = 1; day <= length; day += 1) {
            const result = convertLunarToSolar(
              row.year,
              month,
              day,
              isLeapMonth
            );
            if (!result.ok || toJulianDayNumber(result.solar) !== expectedJdn) {
              throw new Error(
                `음력 ${row.year}-${month}-${day}${isLeapMonth ? '(윤)' : ''}에서 양력이 이어지지 않습니다.`
              );
            }
            expectedJdn += 1;
          }
        }
      }
    }
    expect(expectedJdn).toBeGreaterThan(toJulianDayNumber(ymd(2048, 12, 31)));
  });
});

describe('fortune-solar-term', () => {
  test('getSolarTermTime: 표 밖 연도·잘못된 인덱스는 null (예외 없음)', () => {
    expect(getSolarTermTime(2029, 2)).toBeNull();
    expect(getSolarTermTime(2030, 0)).toBeNull();
    expect(getSolarTermTime(1919, 2)).toBeNull();
    expect(getSolarTermTime(2025, 24)).toBeNull();
    expect(getSolarTermTime(2025, -1)).toBeNull();
    expect(getSolarTermTime(2025, 2.5)).toBeNull();
    expect(getSolarTermTime(2025.5, 2)).toBeNull();
    expect(getSolarTermTime(Number.NaN, 2)).toBeNull();
    expect(getSolarTermTime(2025, Number.NaN)).toBeNull();
    expect(getSolarTermTime(1920, 0)).not.toBeNull();
    expect(getSolarTermTime(2028, 23)).not.toBeNull();
  });

  test('compareDateToSolarTerm: 절기 날짜 전·당일·후 (시각은 보지 않는다)', () => {
    const term = { month: 2, day: 3, hour: 23, minute: 10 };
    expect(compareDateToSolarTerm(ymd(2025, 2, 2), term)).toBe('before');
    expect(compareDateToSolarTerm(ymd(2025, 1, 31), term)).toBe('before');
    expect(compareDateToSolarTerm(ymd(2025, 2, 3), term)).toBe('same-day');
    expect(compareDateToSolarTerm(ymd(2025, 2, 4), term)).toBe('after');
    expect(compareDateToSolarTerm(ymd(2025, 3, 1), term)).toBe('after');
  });

  test('isClockOnOrAfterSolarTerm: 시각이 같으면 절기 이후, 1분 전은 이전 (분 단위)', () => {
    const term = { month: 2, day: 3, hour: 23, minute: 10 };
    expect(isClockOnOrAfterSolarTerm({ hour: 23, minute: 9 }, term)).toBe(
      false
    );
    expect(isClockOnOrAfterSolarTerm({ hour: 23, minute: 10 }, term)).toBe(
      true
    );
    expect(isClockOnOrAfterSolarTerm({ hour: 23, minute: 11 }, term)).toBe(
      true
    );
    expect(isClockOnOrAfterSolarTerm({ hour: 0, minute: 0 }, term)).toBe(false);
  });
});

describe('지원 범위 일치 (D14)', () => {
  const years = Object.keys(FORTUNE_SOLAR_TERM_TABLE).map(Number);

  test('FORTUNE_SUPPORTED_MAX_YEAR = 절기 표의 마지막 연도', () => {
    expect(FORTUNE_SUPPORTED_MAX_YEAR).toBe(Math.max(...years));
  });

  test('절기 표의 첫 연도는 FORTUNE_MIN_BIRTH.year = 1920', () => {
    expect(Math.min(...years)).toBe(1920);
    expect(FORTUNE_MIN_BIRTH.year).toBe(1920);
    expect(FORTUNE_MIN_BIRTH).toEqual({ year: 1920, month: 1, day: 1 });
  });

  test('음력 표는 1919 ~ FORTUNE_SUPPORTED_MAX_YEAR + 1 이상을 덮는다', () => {
    const lunarYears = FORTUNE_LUNAR_TABLE.map((row) => row.year);
    expect(Math.min(...lunarYears)).toBeLessThanOrEqual(
      FORTUNE_MIN_BIRTH.year - 1
    );
    expect(Math.max(...lunarYears)).toBeGreaterThanOrEqual(
      FORTUNE_SUPPORTED_MAX_YEAR + 1
    );
  });

  test('출생 상한·입력 범위 상수는 모두 FORTUNE_SUPPORTED_MAX_YEAR에서 만들어진다', () => {
    expect(FORTUNE_MAX_BIRTH).toEqual({
      year: FORTUNE_SUPPORTED_MAX_YEAR,
      month: 12,
      day: 31,
    });
    expect(FORTUNE_BIRTH_YEAR_MAX).toBe(FORTUNE_SUPPORTED_MAX_YEAR);
    expect(FORTUNE_BIRTH_YEAR_MIN).toBe(FORTUNE_MIN_BIRTH.year);
    expect(FORTUNE_MIN_AGE).toBe(14);
  });

  test('만료 기준일 상수는 2028-12-01이고 올바른 날짜 키다', () => {
    expect(FORTUNE_SOLAR_TERM_RENEW_BY).toBe('2028-12-01');
    expect(parseDateKey(FORTUNE_SOLAR_TERM_RENEW_BY)).toEqual(ymd(2028, 12, 1));
  });
});

describe('만료 감시 (F-1)', () => {
  test('절기 표 보완(F-1) 기한이 지나지 않았다 (기준 날짜를 고정해 시계와 무관하게 확인)', () => {
    const todayKey = '2026-11-23';
    const overdue = isSolarTermRenewalOverdue(
      todayKey,
      FORTUNE_SUPPORTED_MAX_YEAR,
      FORTUNE_SOLAR_TERM_RENEW_BY
    );
    expect(
      overdue,
      `절기 표 보완(F-1) 기한 조건이 깨졌습니다. 기준 날짜 ${todayKey}, 기한 ${FORTUNE_SOLAR_TERM_RENEW_BY}, 지원 마지막 연도 ${FORTUNE_SUPPORTED_MAX_YEAR}.`
    ).toBe(false);
  });

  test('감시 조건 자체 검사: 기한 전은 통과, 기한 후 표가 오늘 연도+1에 못 미치면 실패', () => {
    const renewBy = '2028-12-01';
    expect(isSolarTermRenewalOverdue('2026-11-06', 2028, renewBy)).toBe(false);
    expect(isSolarTermRenewalOverdue('2028-11-30', 2028, renewBy)).toBe(false);
    expect(isSolarTermRenewalOverdue('2028-12-01', 2028, renewBy)).toBe(true);
    expect(isSolarTermRenewalOverdue('2029-01-01', 2028, renewBy)).toBe(true);
    // 표를 2029까지 늘리면 2028년 말에는 통과, 2029년 12월부터 다시 걸린다
    expect(isSolarTermRenewalOverdue('2028-12-01', 2029, renewBy)).toBe(false);
    expect(isSolarTermRenewalOverdue('2029-06-01', 2029, renewBy)).toBe(true);
    expect(isSolarTermRenewalOverdue('2029-06-01', 2030, renewBy)).toBe(false);
  });
});
