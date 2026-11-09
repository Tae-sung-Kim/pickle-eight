import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  CRISIS_PHONES,
  CRISIS_RESULT_LINE,
} from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import { FORTUNE_LUNAR_TABLE } from '@/features/fortune/constants/calendar/lunar-table.constant';
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
import {
  FORTUNE_LUCKY_NUMBER_MAX,
  FORTUNE_LUCKY_NUMBER_MIN,
  FORTUNE_LUCKY_TABLE,
} from '@/features/fortune/constants/fortune-lucky.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_STEMS,
} from '@/features/fortune/constants/fortune-saju.constant';
import {
  FORTUNE_SCORE_HIGH_MIN,
  FORTUNE_SCORE_MAX,
  FORTUNE_SCORE_MID_MIN,
  FORTUNE_SCORE_MIN,
} from '@/features/fortune/constants/fortune-score.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_PERSONAL_POOL } from '@/features/fortune/constants/pools/personal.constant';
import { FORTUNE_STAR_SIGN_POOLS } from '@/features/fortune/constants/pools/star-sign-pools.constant';
import { FORTUNE_TTI_POOLS } from '@/features/fortune/constants/pools/tti-pools.constant';
import type {
  FortuneBandType,
  FortuneBirthErrorType,
  FortuneBirthResolvedType,
  FortuneCategoryKeyType,
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
  FortuneYmdType,
  FortuneClockTimeType as SajuClockType,
} from '@/features/fortune/types/fortune.type';
import type {
  FortuneLateZiStemBasisType,
  FortunePillarType,
  FortuneSajuChartType,
} from '@/features/fortune/types/fortune-saju.type';
import { resolveFortuneBirth } from '@/features/fortune/utils/fortune-birth.util';
import {
  calculateFortuneManAge,
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
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';
import {
  buildFortuneSajuCharts,
  countFortuneElements,
  getDayPillar,
  getFortuneSajuBoundary,
  getFortuneTenGod,
  getHourBranch,
  getHourPillar,
  getMonthPillar,
  getYearPillar,
  shouldShowFortuneDstNotice,
} from '@/features/fortune/utils/fortune-saju.util';
import {
  createFortuneRng,
  getFortuneBand,
  hashFortuneSeed,
  pickFortuneVariant,
  toFortuneScore,
} from '@/features/fortune/utils/fortune-seed.util';
import {
  compareDateToSolarTerm,
  getSolarTermTime,
  isClockOnOrAfterSolarTerm,
} from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneStarSign,
  resolveFortuneStarSignWithTime,
} from '@/features/fortune/utils/fortune-star-sign.util';
import {
  determineFortuneTti,
  getSeollalTti,
  getTtiKeyByYear,
  resolveFortuneTtiWithTime,
} from '@/features/fortune/utils/fortune-tti.util';
import { getKoreaDateKey } from '@/lib/date';

// QA-3: 운세 계산 순수 함수 검사 (design.md 17.1). 브라우저를 열지 않고 import해서 검사한다.
// 데스크톱 프로젝트에서만 돌린다. 개발 서버 요청은 없다.
test.beforeEach(({ isMobile }, testInfo) => {
  test.skip(
    isMobile || testInfo.project.name !== 'desktop',
    '순수 함수 검사는 데스크톱에서만'
  );
});

// ---------- 도우미 ----------

const TTI_KEYS: readonly FortuneTtiKeyType[] = [
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

const STAR_SIGN_KEYS: readonly FortuneStarSignKeyType[] = [
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
const STAR_SIGN_BY_MID_TERM: readonly FortuneStarSignKeyType[] = [
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

const CATEGORY_KEYS: readonly FortuneCategoryKeyType[] = [
  'total',
  'money',
  'love',
  'work',
  'health',
];

const BANDS: readonly FortuneBandType[] = ['high', 'mid', 'low'];

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
function personalSeed(birth: FortuneYmdType, todayKey: string): string {
  return `fortune-v1|personal|${toKey(birth)}|${todayKey}`;
}

function ttiSeed(key: FortuneTtiKeyType, todayKey: string): string {
  return `fortune-v1|tti|${key}|${todayKey}`;
}

function starSignSeed(key: FortuneStarSignKeyType, todayKey: string): string {
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

const TODAY_AC = ymd(2026, 11, 5);

// =====================================================================
// 1. 달력 표 자체 검사 (design.md 4.1 표 자체 검사)
// =====================================================================

test.describe('달력 표: 음력 표', () => {
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

test.describe('달력 표: 24절기 표', () => {
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
// 2. 알려진 값 대조 (calendar-verification.md 9건 + 설계 4.1의 추가 값)
// =====================================================================

test.describe('알려진 값 대조 (KASI 값)', () => {
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
// 3. fortune-date
// =====================================================================

test.describe('fortune-date', () => {
  test('isValidSolarDate: 윤년·평년 2월 29일과 달 경계', () => {
    expect(isValidSolarDate(ymd(2024, 2, 29))).toBe(true);
    expect(isValidSolarDate(ymd(2000, 2, 29))).toBe(true);
    expect(isValidSolarDate(ymd(2023, 2, 29))).toBe(false);
    expect(isValidSolarDate(ymd(1900, 2, 29))).toBe(false);
    expect(isValidSolarDate(ymd(2100, 2, 29))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 2, 30))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 4, 31))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 12, 31))).toBe(true);
    expect(isValidSolarDate(ymd(2023, 13, 1))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 0, 1))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 1, 0))).toBe(false);
    expect(isValidSolarDate(ymd(2023, 1.5, 1))).toBe(false);
    expect(isValidSolarDate(ymd(Number.NaN, 1, 1))).toBe(false);
  });

  test('toJulianDayNumber: 알려진 값 (2000-01-01 = 2451545, 1970-01-01 = 2440588)', () => {
    expect(toJulianDayNumber(ymd(2000, 1, 1))).toBe(2451545);
    expect(toJulianDayNumber(ymd(1970, 1, 1))).toBe(2440588);
    expect(toJulianDayNumber(ymd(2026, 11, 5))).toBe(2461350);
    expect(toJulianDayNumber(ymd(2000, 1, 2))).toBe(2451546);
  });

  test('JDN 왕복: 1919-01-01 ~ 2050-12-31의 모든 날이 하루씩 이어지고 되돌아온다', () => {
    let cursor = ymd(1919, 1, 1);
    let previous = toJulianDayNumber(cursor) - 1;
    const end = toJulianDayNumber(ymd(2050, 12, 31));
    let count = 0;
    while (toJulianDayNumber(cursor) <= end) {
      const jdn = toJulianDayNumber(cursor);
      if (jdn !== previous + 1) {
        throw new Error(`${toKey(cursor)}에서 일수가 이어지지 않습니다.`);
      }
      const back = fromJulianDayNumber(jdn);
      if (compareYmd(back, cursor) !== 0 || !isValidSolarDate(back)) {
        throw new Error(`${toKey(cursor)} 왕복 실패: ${toKey(back)}`);
      }
      previous = jdn;
      cursor = fromJulianDayNumber(jdn + 1);
      count += 1;
    }
    expect(count).toBe(end - toJulianDayNumber(ymd(1919, 1, 1)) + 1);
  });

  test('compareYmd: 연·월·일 순서로 비교한다', () => {
    expect(compareYmd(ymd(2026, 1, 1), ymd(2026, 1, 1))).toBe(0);
    expect(compareYmd(ymd(2025, 12, 31), ymd(2026, 1, 1))).toBe(-1);
    expect(compareYmd(ymd(2026, 2, 1), ymd(2026, 1, 31))).toBe(1);
    expect(compareYmd(ymd(2026, 3, 4), ymd(2026, 3, 5))).toBe(-1);
    expect(compareYmd(ymd(2027, 1, 1), ymd(2026, 12, 31))).toBe(1);
  });

  test('parseDateKey: 정상 형식과 잘못된 입력', () => {
    expect(parseDateKey('2026-11-05')).toEqual(ymd(2026, 11, 5));
    expect(parseDateKey('2024-02-29')).toEqual(ymd(2024, 2, 29));
    expect(parseDateKey('2023-02-29')).toBeNull();
    expect(parseDateKey('2026-02-30')).toBeNull();
    expect(parseDateKey('2026-13-01')).toBeNull();
    expect(parseDateKey('2026-2-5')).toBeNull();
    expect(parseDateKey('20261105')).toBeNull();
    expect(parseDateKey(' 2026-11-05')).toBeNull();
    expect(parseDateKey('')).toBeNull();
  });
});

test.describe('calculateFortuneManAge (AC-42~44)', () => {
  test('AC-42: 오늘 2026-11-05, 출생 2012-11-06은 만 13세(차단)', () => {
    const age = calculateFortuneManAge(ymd(2012, 11, 6), TODAY_AC);
    expect(age).toBe(13);
    expect(age < FORTUNE_MIN_AGE).toBe(true);
  });

  test('AC-43: 출생 2012-11-05는 생일 당일 만 14세(통과), 오늘 2026-11-04면 만 13세(차단)', () => {
    expect(calculateFortuneManAge(ymd(2012, 11, 5), TODAY_AC)).toBe(14);
    expect(calculateFortuneManAge(ymd(2012, 11, 5), ymd(2026, 11, 4))).toBe(13);
    expect(calculateFortuneManAge(ymd(2012, 11, 4), TODAY_AC)).toBe(14);
  });

  test('14세 경계: 생일 전날은 13세, 생일 당일은 14세, 연초·연말 출생도 맞다', () => {
    expect(calculateFortuneManAge(ymd(2012, 1, 1), ymd(2026, 1, 1))).toBe(14);
    expect(calculateFortuneManAge(ymd(2012, 1, 2), ymd(2026, 1, 1))).toBe(13);
    expect(calculateFortuneManAge(ymd(2012, 12, 31), ymd(2026, 12, 30))).toBe(
      13
    );
    expect(calculateFortuneManAge(ymd(2012, 12, 31), ymd(2026, 12, 31))).toBe(
      14
    );
    expect(calculateFortuneManAge(ymd(2026, 11, 5), TODAY_AC)).toBe(0);
  });

  test('AC-44: 2월 29일생은 평년 2/28에 아직 생일 전, 3/1에 지난다', () => {
    const birth = ymd(2008, 2, 29);
    // 2023년은 평년
    expect(calculateFortuneManAge(birth, ymd(2023, 2, 28))).toBe(14);
    expect(calculateFortuneManAge(birth, ymd(2023, 3, 1))).toBe(15);
    // 2024년은 윤년: 2/28은 생일 전, 2/29가 생일
    expect(calculateFortuneManAge(birth, ymd(2024, 2, 28))).toBe(15);
    expect(calculateFortuneManAge(birth, ymd(2024, 2, 29))).toBe(16);
  });

  test('AC-44: 2월 29일생이 14세가 되는 날 (평년 2026은 3/1부터)', () => {
    const birth = ymd(2012, 2, 29);
    expect(calculateFortuneManAge(birth, ymd(2026, 2, 28))).toBe(13);
    expect(calculateFortuneManAge(birth, ymd(2026, 3, 1))).toBe(14);
  });

  test('오늘이 2029-01-01이어도 나이가 계산된다 (절기 표를 쓰지 않는다)', () => {
    expect(calculateFortuneManAge(ymd(2015, 1, 2), ymd(2029, 1, 1))).toBe(13);
    expect(calculateFortuneManAge(ymd(2015, 1, 1), ymd(2029, 1, 1))).toBe(14);
  });
});

// =====================================================================
// 4. fortune-lunar (AC-7, AC-8, AC-85)
// =====================================================================

test.describe('fortune-lunar', () => {
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

// =====================================================================
// 5. fortune-birth: resolveFortuneBirth (AC-7~9, AC-84)
// =====================================================================

test.describe('resolveFortuneBirth', () => {
  test('AC-9: 연·월·일 중 하나라도 비면 empty', () => {
    expectError(resolveFortuneBirth({}, TODAY_AC), 'empty');
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 1990, month: 6 },
        TODAY_AC
      ),
      'empty'
    );
    expectError(
      resolveFortuneBirth({ calendar: 'solar', month: 6, day: 15 }, TODAY_AC),
      'empty'
    );
    expectError(
      resolveFortuneBirth({ calendar: 'solar', year: 1990, day: 15 }, TODAY_AC),
      'empty'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: Number.NaN, month: 6, day: 15 },
        TODAY_AC
      ),
      'empty'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'lunar', year: 1990, month: 6 },
        TODAY_AC
      ),
      'empty'
    );
  });

  test('AC-9: 존재하지 않는 양력 날짜(2월 30일, 평년 2월 29일, 4월 31일)는 invalid-date', () => {
    for (const [year, month, day] of [
      [2001, 2, 30],
      [2023, 2, 29],
      [2001, 4, 31],
      [2001, 13, 1],
    ]) {
      expectError(
        resolveFortuneBirth({ calendar: 'solar', year, month, day }, TODAY_AC),
        'invalid-date'
      );
    }
    // 윤년 2월 29일은 통과
    expectSolar(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2008, month: 2, day: 29 },
        TODAY_AC
      ),
      ymd(2008, 2, 29),
      false
    );
  });

  test('AC-9: 1920-01-01 이전은 before-min, 1920-01-01은 통과', () => {
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 1919, month: 12, day: 31 },
        TODAY_AC
      ),
      'before-min'
    );
    expectSolar(
      resolveFortuneBirth(
        { calendar: 'solar', year: 1920, month: 1, day: 1 },
        TODAY_AC
      ),
      ymd(1920, 1, 1),
      false
    );
  });

  test('AC-9: 오늘 이후 날짜는 future (2028년 이내)', () => {
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2026, month: 11, day: 6 },
        TODAY_AC
      ),
      'future'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2027, month: 1, day: 1 },
        TODAY_AC
      ),
      'future'
    );
    // 오늘 당일은 통과
    expectSolar(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2026, month: 11, day: 5 },
        TODAY_AC
      ),
      TODAY_AC,
      false
    );
  });

  test('AC-9·AC-84: 2029-01-01 이후는 after-max, 2028-12-31까지는 범위 안 (오늘이 2029-01-01 이후)', () => {
    for (const today of [ymd(2029, 1, 1), ymd(2030, 6, 15)]) {
      expectError(
        resolveFortuneBirth(
          { calendar: 'solar', year: 2029, month: 1, day: 1 },
          today
        ),
        'after-max'
      );
      expectSolar(
        resolveFortuneBirth(
          { calendar: 'solar', year: 2028, month: 12, day: 31 },
          today
        ),
        ymd(2028, 12, 31),
        false
      );
    }
  });

  test('after-max는 future보다 먼저 검사한다: 오늘이 2026-11-05여도 2029-01-01은 after-max, 2028-12-31은 future', () => {
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2029, month: 1, day: 1 },
        TODAY_AC
      ),
      'after-max'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2028, month: 12, day: 31 },
        TODAY_AC
      ),
      'future'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'solar', year: 2100, month: 1, day: 1 },
        TODAY_AC
      ),
      'after-max'
    );
  });

  test('AC-9: 음력으로 입력해 양력 2029년이 되는 날짜는 after-max, 양력 2028-12-31인 날은 통과', () => {
    const last = findLunarInput(ymd(2028, 12, 31));
    const after = findLunarInput(ymd(2029, 1, 1));
    expect(last).not.toBeNull();
    expect(after).not.toBeNull();
    if (!last || !after) {
      return;
    }
    // 오늘이 2029년 이후인 모의에서 경계를 본다
    const today = ymd(2030, 6, 15);
    expectSolar(
      resolveFortuneBirth({ calendar: 'lunar', ...last }, today),
      ymd(2028, 12, 31),
      true
    );
    expectError(
      resolveFortuneBirth({ calendar: 'lunar', ...after }, today),
      'after-max'
    );
    // 음력 2028년의 마지막 달 1일은 양력 2029년이다
    expectError(
      resolveFortuneBirth(
        {
          calendar: 'lunar',
          year: 2028,
          month: 12,
          day: 1,
          isLeapMonth: false,
        },
        today
      ),
      'after-max'
    );
  });

  test('AC-9: 음력으로 입력해 양력 1920-01-01 이전이 되는 날은 before-min', () => {
    const lastBefore = findLunarInput(ymd(1919, 12, 31));
    const first = findLunarInput(ymd(1920, 1, 1));
    expect(lastBefore).not.toBeNull();
    expect(first).not.toBeNull();
    if (!lastBefore || !first) {
      return;
    }
    expectError(
      resolveFortuneBirth({ calendar: 'lunar', ...lastBefore }, TODAY_AC),
      'before-min'
    );
    expectSolar(
      resolveFortuneBirth({ calendar: 'lunar', ...first }, TODAY_AC),
      ymd(1920, 1, 1),
      true
    );
  });

  test('음력 오류는 파이프라인으로 그대로 올라온다 (lunar-no-leap, lunar-invalid-day, out-of-table)', () => {
    expectError(
      resolveFortuneBirth(
        { calendar: 'lunar', year: 2023, month: 3, day: 1, isLeapMonth: true },
        TODAY_AC
      ),
      'lunar-no-leap'
    );
    expectError(
      resolveFortuneBirth(
        {
          calendar: 'lunar',
          year: 2023,
          month: 1,
          day: 30,
          isLeapMonth: false,
        },
        TODAY_AC
      ),
      'lunar-invalid-day'
    );
    expectError(
      resolveFortuneBirth(
        { calendar: 'lunar', year: 1918, month: 1, day: 1, isLeapMonth: false },
        TODAY_AC
      ),
      'out-of-table'
    );
  });

  test('AC-7: 같은 날을 양력으로 넣든 음력으로 넣든 같은 양력 날짜가 나오고 isFromLunar만 다르다', () => {
    const lunar = resolveFortuneBirth(
      { calendar: 'lunar', year: 2025, month: 1, day: 1, isLeapMonth: false },
      TODAY_AC
    );
    const solar = resolveFortuneBirth(
      { calendar: 'solar', year: 2025, month: 1, day: 29 },
      TODAY_AC
    );
    expectSolar(lunar, ymd(2025, 1, 29), true);
    expectSolar(solar, ymd(2025, 1, 29), false);
    const lunar2000 = resolveFortuneBirth(
      { calendar: 'lunar', year: 2000, month: 1, day: 1, isLeapMonth: false },
      TODAY_AC
    );
    expectSolar(lunar2000, ymd(2000, 2, 5), true);
  });

  test('AC-7: 양력 입력과 음력 입력의 개인 운세(시드)가 같다', () => {
    const lunar = resolveFortuneBirth(
      { calendar: 'lunar', year: 2025, month: 1, day: 1, isLeapMonth: false },
      TODAY_AC
    );
    const solar = resolveFortuneBirth(
      { calendar: 'solar', year: 2025, month: 1, day: 29 },
      TODAY_AC
    );
    if (!lunar.ok || !solar.ok) {
      throw new Error('변환이 실패했습니다.');
    }
    const todayKey = toKey(TODAY_AC);
    const make = (birth: FortuneYmdType) =>
      buildFortuneReading({
        seedText: personalSeed(birth, todayKey),
        dateKey: todayKey,
        pool: FORTUNE_PERSONAL_POOL,
        common: FORTUNE_COMMON_POOL,
      });
    expect(make(lunar.solar)).toEqual(make(solar.solar));
  });

  test('calendar가 없으면 양력으로 본다', () => {
    expectSolar(
      resolveFortuneBirth({ year: 1990, month: 6, day: 15 }, TODAY_AC),
      ymd(1990, 6, 15),
      false
    );
  });

  test('오류 결과에는 오류 종류 외 입력값이 들어 있지 않다 (R-2)', () => {
    const result = resolveFortuneBirth(
      { calendar: 'solar', year: 2001, month: 2, day: 30 },
      TODAY_AC
    );
    expect(Object.keys(result).sort()).toEqual(['error', 'ok']);
    expect(JSON.stringify(result)).not.toContain('2001');
  });
});

// =====================================================================
// 6. fortune-solar-term
// =====================================================================

test.describe('fortune-solar-term', () => {
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

// =====================================================================
// 7. fortune-tti (AC-14~16, AC-25)
// =====================================================================

test.describe('fortune-tti', () => {
  test('getTtiKeyByYear: 쥐띠 기준 연도와 12년 주기', () => {
    expect(getTtiKeyByYear(1984)).toBe('rat');
    expect(getTtiKeyByYear(1900)).toBe('rat');
    expect(getTtiKeyByYear(2020)).toBe('rat');
    expect(getTtiKeyByYear(2024)).toBe('dragon');
    expect(getTtiKeyByYear(2025)).toBe('snake');
    expect(getTtiKeyByYear(2026)).toBe('horse');
    expect(getTtiKeyByYear(2028)).toBe('monkey');
    expect(getTtiKeyByYear(1990)).toBe('horse');
    expect(getTtiKeyByYear(1992)).toBe('monkey');
    expect(getTtiKeyByYear(1919)).toBe('goat');
    for (let year = 1900; year < 2100; year += 1) {
      expect(getTtiKeyByYear(year)).toBe(TTI_KEYS[(year - 1900) % 12]);
    }
    expect(FORTUNE_ZODIAC.map((item) => item.key)).toEqual(TTI_KEYS);
  });

  test('AC-14: 1990-06-15는 말띠, 1992-05-10은 원숭이띠 (시각 입력 없음)', () => {
    expect(determineFortuneTti(ymd(1990, 6, 15))).toEqual({
      kind: 'single',
      key: 'horse',
    });
    expect(determineFortuneTti(ymd(1992, 5, 10))).toEqual({
      kind: 'single',
      key: 'monkey',
    });
  });

  test('AC-15: 2025-02-01은 용띠이고 설날 기준으로는 뱀띠다', () => {
    expect(determineFortuneTti(ymd(2025, 2, 1))).toEqual({
      kind: 'single',
      key: 'dragon',
    });
    expect(getSeollalTti(ymd(2025, 2, 1))).toBe('snake');
    // 설날 전날(2025-01-28)은 설날 기준으로도 용띠
    expect(getSeollalTti(ymd(2025, 1, 28))).toBe('dragon');
    expect(getSeollalTti(ymd(2025, 1, 29))).toBe('snake');
  });

  test('AC-16: 2025-02-03은 need-time (용띠 → 뱀띠, 경계 23:10), 23:09 용띠, 23:30 뱀띠', () => {
    const solar = ymd(2025, 2, 3);
    expect(determineFortuneTti(solar)).toEqual({
      kind: 'need-time',
      before: 'dragon',
      after: 'snake',
      boundary: { hour: 23, minute: 10 },
    });
    expect(resolveFortuneTtiWithTime(solar, { hour: 23, minute: 9 })).toBe(
      'dragon'
    );
    expect(resolveFortuneTtiWithTime(solar, { hour: 23, minute: 30 })).toBe(
      'snake'
    );
    // 경계 시각 정확히는 입춘 이후(뱀띠)
    expect(resolveFortuneTtiWithTime(solar, { hour: 23, minute: 10 })).toBe(
      'snake'
    );
    expect(resolveFortuneTtiWithTime(solar, { hour: 0, minute: 0 })).toBe(
      'dragon'
    );
    expect(resolveFortuneTtiWithTime(solar, { hour: 23, minute: 59 })).toBe(
      'snake'
    );
  });

  test('AC-16: 2025-02-04는 시각 없이 뱀띠, 2025-02-02는 용띠', () => {
    expect(determineFortuneTti(ymd(2025, 2, 4))).toEqual({
      kind: 'single',
      key: 'snake',
    });
    expect(determineFortuneTti(ymd(2025, 2, 2))).toEqual({
      kind: 'single',
      key: 'dragon',
    });
    // 입춘 날이 아니면 시각을 넣어도 날짜로만 정한다
    expect(
      resolveFortuneTtiWithTime(ymd(2025, 2, 4), { hour: 0, minute: 0 })
    ).toBe('snake');
    expect(
      resolveFortuneTtiWithTime(ymd(2025, 2, 2), { hour: 23, minute: 59 })
    ).toBe('dragon');
  });

  test('2024-02-05~09는 입춘 후·설날 전: 입춘 기준 용띠, 설날 기준 토끼띠 / 2024-02-10부터 설날 기준도 용띠', () => {
    for (const day of [5, 6, 7, 8, 9]) {
      const solar = ymd(2024, 2, day);
      expect(determineFortuneTti(solar), `2024-02-${pad2(day)}`).toEqual({
        kind: 'single',
        key: 'dragon',
      });
      expect(getSeollalTti(solar), `2024-02-${pad2(day)}`).toBe('rabbit');
    }
    expect(getSeollalTti(ymd(2024, 2, 10))).toBe('dragon');
    expect(getSeollalTti(ymd(2024, 2, 9))).toBe('rabbit');
    // 입춘 당일(2024-02-04)은 시각을 묻는다
    const boundary = determineFortuneTti(ymd(2024, 2, 4));
    expect(boundary.kind).toBe('need-time');
    const term = getSolarTermTime(2024, 2);
    expect(term).not.toBeNull();
    if (boundary.kind === 'need-time' && term) {
      expect(boundary.before).toBe('rabbit');
      expect(boundary.after).toBe('dragon');
      expect(boundary.boundary).toEqual({
        hour: term.hour,
        minute: term.minute,
      });
    }
    expect(determineFortuneTti(ymd(2024, 2, 3))).toEqual({
      kind: 'single',
      key: 'rabbit',
    });
  });

  test('1920~2028 모든 해: 입춘 전날은 전년도 띠, 입춘 당일은 need-time, 다음 날은 그해 띠', () => {
    for (let year = 1920; year <= 2028; year += 1) {
      const term = getSolarTermTime(year, 2);
      if (!term) {
        throw new Error(`${year}년 입춘이 없습니다.`);
      }
      const day = ymd(year, term.month, term.day);
      const before = getTtiKeyByYear(year - 1);
      const after = getTtiKeyByYear(year);
      expect(determineFortuneTti(addDays(day, -1)), `${year}년 전날`).toEqual({
        kind: 'single',
        key: before,
      });
      expect(determineFortuneTti(day), `${year}년 당일`).toEqual({
        kind: 'need-time',
        before,
        after,
        boundary: { hour: term.hour, minute: term.minute },
      });
      expect(determineFortuneTti(addDays(day, 1)), `${year}년 다음날`).toEqual({
        kind: 'single',
        key: after,
      });
      expect(
        resolveFortuneTtiWithTime(day, {
          hour: term.hour,
          minute: term.minute,
        }),
        `${year}년 경계 시각`
      ).toBe(after);
      if (term.hour > 0 || term.minute > 0) {
        const minutes = term.hour * 60 + term.minute - 1;
        expect(
          resolveFortuneTtiWithTime(day, {
            hour: Math.floor(minutes / 60),
            minute: minutes % 60,
          }),
          `${year}년 경계 1분 전`
        ).toBe(before);
      }
    }
  });

  test('1월 1일·12월 31일은 같은 해의 입춘 전·후로 판정된다', () => {
    expect(determineFortuneTti(ymd(1920, 1, 1))).toEqual({
      kind: 'single',
      key: getTtiKeyByYear(1919),
    });
    expect(determineFortuneTti(ymd(2028, 12, 31))).toEqual({
      kind: 'single',
      key: 'monkey',
    });
  });

  test('범위 밖 연도는 unsupported (2029-02-04, 2029-01-01, 1919-06-01)', () => {
    expect(determineFortuneTti(ymd(2029, 2, 4))).toEqual({
      kind: 'unsupported',
    });
    expect(determineFortuneTti(ymd(2029, 1, 1))).toEqual({
      kind: 'unsupported',
    });
    expect(determineFortuneTti(ymd(1919, 6, 1))).toEqual({
      kind: 'unsupported',
    });
    expect(() =>
      resolveFortuneTtiWithTime(ymd(2029, 2, 4), { hour: 0, minute: 0 })
    ).toThrow(RangeError);
    expect(() => getSeollalTti(ymd(2050, 6, 1))).toThrow(RangeError);
  });

  test('AC-25: 음력으로 입력한 입춘 당일 출생자는 양력 변환 뒤 같은 방식으로 판정된다', () => {
    const lunar = findLunarInput(ymd(2025, 2, 3));
    expect(lunar).not.toBeNull();
    if (!lunar) {
      return;
    }
    const resolved = resolveFortuneBirth(
      { calendar: 'lunar', ...lunar },
      TODAY_AC
    );
    expectSolar(resolved, ymd(2025, 2, 3), true);
    if (resolved.ok) {
      expect(determineFortuneTti(resolved.solar)).toEqual({
        kind: 'need-time',
        before: 'dragon',
        after: 'snake',
        boundary: { hour: 23, minute: 10 },
      });
    }
  });
});

// =====================================================================
// 8. fortune-star-sign (AC-22~25)
// =====================================================================

test.describe('fortune-star-sign', () => {
  test('AC-22: 1990-05-15 황소자리, 1990-08-10 사자자리, 2026-03-10 물고기자리 (시각 입력 없음)', () => {
    expect(determineFortuneStarSign(ymd(1990, 5, 15))).toEqual({
      kind: 'single',
      key: 'taurus',
    });
    expect(determineFortuneStarSign(ymd(1990, 8, 10))).toEqual({
      kind: 'single',
      key: 'leo',
    });
    expect(determineFortuneStarSign(ymd(2026, 3, 10))).toEqual({
      kind: 'single',
      key: 'pisces',
    });
  });

  test('AC-23: 2026-03-20은 need-time (물고기 → 양, 23:46), 23:00 물고기자리, 23:59 양자리', () => {
    const solar = ymd(2026, 3, 20);
    expect(determineFortuneStarSign(solar)).toEqual({
      kind: 'need-time',
      before: 'pisces',
      after: 'aries',
      boundary: { hour: 23, minute: 46 },
    });
    expect(resolveFortuneStarSignWithTime(solar, { hour: 23, minute: 0 })).toBe(
      'pisces'
    );
    expect(
      resolveFortuneStarSignWithTime(solar, { hour: 23, minute: 59 })
    ).toBe('aries');
    expect(
      resolveFortuneStarSignWithTime(solar, { hour: 23, minute: 45 })
    ).toBe('pisces');
    expect(
      resolveFortuneStarSignWithTime(solar, { hour: 23, minute: 46 })
    ).toBe('aries');
  });

  test('AC-24: 2027-03-21은 need-time (05:25), 04:00 물고기자리, 06:00 양자리 / 2027-03-20은 물고기자리', () => {
    const solar = ymd(2027, 3, 21);
    expect(determineFortuneStarSign(solar)).toEqual({
      kind: 'need-time',
      before: 'pisces',
      after: 'aries',
      boundary: { hour: 5, minute: 25 },
    });
    expect(resolveFortuneStarSignWithTime(solar, { hour: 4, minute: 0 })).toBe(
      'pisces'
    );
    expect(resolveFortuneStarSignWithTime(solar, { hour: 6, minute: 0 })).toBe(
      'aries'
    );
    expect(determineFortuneStarSign(ymd(2027, 3, 20))).toEqual({
      kind: 'single',
      key: 'pisces',
    });
  });

  test('AC-25: 음력으로 입력한 경계일(2026-03-20) 출생자는 양력 변환 뒤 같은 방식으로 판정된다', () => {
    const lunar = findLunarInput(ymd(2026, 3, 20));
    expect(lunar).not.toBeNull();
    if (!lunar) {
      return;
    }
    const resolved = resolveFortuneBirth(
      { calendar: 'lunar', ...lunar },
      TODAY_AC
    );
    expectSolar(resolved, ymd(2026, 3, 20), true);
    if (resolved.ok) {
      const result = determineFortuneStarSign(resolved.solar);
      expect(result.kind).toBe('need-time');
      expect(
        resolveFortuneStarSignWithTime(resolved.solar, { hour: 23, minute: 59 })
      ).toBe('aries');
    }
  });

  test('1월 초와 12월 말은 염소자리, 1920-01-05는 1919년 표 없이 염소자리', () => {
    expect(determineFortuneStarSign(ymd(2026, 1, 1))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
    expect(determineFortuneStarSign(ymd(2026, 1, 19))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
    expect(determineFortuneStarSign(ymd(2026, 12, 31))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
    expect(determineFortuneStarSign(ymd(2028, 12, 31))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
    expect(getSolarTermTime(1919, 23)).toBeNull();
    expect(determineFortuneStarSign(ymd(1920, 1, 5))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
    expect(determineFortuneStarSign(ymd(1920, 1, 1))).toEqual({
      kind: 'single',
      key: 'capricorn',
    });
  });

  test('범위 밖 연도는 unsupported (2029-03-20, 2029-01-01, 1919-06-01)', () => {
    expect(determineFortuneStarSign(ymd(2029, 3, 20))).toEqual({
      kind: 'unsupported',
    });
    expect(determineFortuneStarSign(ymd(2029, 1, 1))).toEqual({
      kind: 'unsupported',
    });
    expect(determineFortuneStarSign(ymd(1919, 6, 1))).toEqual({
      kind: 'unsupported',
    });
    expect(() =>
      resolveFortuneStarSignWithTime(ymd(2029, 3, 20), { hour: 0, minute: 0 })
    ).toThrow(RangeError);
  });

  test('별자리 상수는 12개이고 시작 중기 번호가 홀수 1,3,…,23으로 하나씩이다', () => {
    expect(FORTUNE_STAR_SIGNS.map((item) => item.key).sort()).toEqual(
      [...STAR_SIGN_KEYS].sort()
    );
    expect(
      FORTUNE_STAR_SIGNS.map((item) => item.startTermIndex).sort(
        (a, b) => a - b
      )
    ).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]);
    STAR_SIGN_BY_MID_TERM.forEach((key, index) => {
      expect(
        FORTUNE_STAR_SIGNS.find((item) => item.key === key)?.startTermIndex
      ).toBe(index * 2 + 1);
    });
  });

  test('1920~2028 모든 해, 12개 중기 모두: 전날은 앞 별자리, 당일은 need-time, 다음 날은 새 별자리', () => {
    for (let year = 1920; year <= 2028; year += 1) {
      for (let k = 0; k < 12; k += 1) {
        const term = getSolarTermTime(year, k * 2 + 1);
        if (!term) {
          throw new Error(`${year}년 중기 ${k * 2 + 1}이 없습니다.`);
        }
        const day = ymd(year, term.month, term.day);
        const previous: FortuneStarSignKeyType =
          k === 0 ? 'capricorn' : STAR_SIGN_BY_MID_TERM[k - 1];
        const current = STAR_SIGN_BY_MID_TERM[k];
        const label = `${year}년 ${current}`;
        expect(
          determineFortuneStarSign(addDays(day, -1)),
          `${label} 전날`
        ).toEqual({
          kind: 'single',
          key: previous,
        });
        expect(determineFortuneStarSign(day), `${label} 당일`).toEqual({
          kind: 'need-time',
          before: previous,
          after: current,
          boundary: { hour: term.hour, minute: term.minute },
        });
        expect(
          determineFortuneStarSign(addDays(day, 1)),
          `${label} 다음날`
        ).toEqual({
          kind: 'single',
          key: current,
        });
        expect(
          resolveFortuneStarSignWithTime(day, {
            hour: term.hour,
            minute: term.minute,
          }),
          `${label} 경계 시각`
        ).toBe(current);
        const totalMinutes = term.hour * 60 + term.minute;
        if (totalMinutes > 0) {
          const minutes = totalMinutes - 1;
          expect(
            resolveFortuneStarSignWithTime(day, {
              hour: Math.floor(minutes / 60),
              minute: minutes % 60,
            }),
            `${label} 경계 1분 전`
          ).toBe(previous);
        }
      }
    }
  });

  test('1920-01-01 ~ 2028-12-31 모든 날짜가 12별자리 중 하나로 판정되고 오류 없이 끝난다', () => {
    let cursor = ymd(1920, 1, 1);
    const end = ymd(2028, 12, 31);
    let needTimeCount = 0;
    while (compareYmd(cursor, end) <= 0) {
      const result = determineFortuneStarSign(cursor);
      if (result.kind === 'unsupported') {
        throw new Error(`${toKey(cursor)}가 unsupported입니다.`);
      }
      if (result.kind === 'single') {
        if (!STAR_SIGN_KEYS.includes(result.key)) {
          throw new Error(`${toKey(cursor)}의 별자리 키가 이상합니다.`);
        }
      } else {
        needTimeCount += 1;
      }
      cursor = addDays(cursor, 1);
    }
    // 해마다 중기 12개 → 경계일 12개
    expect(needTimeCount).toBe(109 * 12);
  });
});

// =====================================================================
// 9. fortune-seed
// =====================================================================

test.describe('fortune-seed', () => {
  test('hashFortuneSeed: FNV-1a 32비트 공개 테스트 값', () => {
    expect(hashFortuneSeed('')).toBe(0x811c9dc5);
    expect(hashFortuneSeed('a')).toBe(0xe40c292c);
    expect(hashFortuneSeed('foobar')).toBe(0xbf9cf968);
  });

  test('hashFortuneSeed: 같은 입력 같은 출력, 부호 없는 32비트 정수, 한글은 UTF-16 코드 단위로 계산', () => {
    const text = 'fortune-v1|personal|1990-06-15|2026-11-05';
    expect(hashFortuneSeed(text)).toBe(hashFortuneSeed(text));
    expect(hashFortuneSeed(text)).toBe(1903050690);
    expect(hashFortuneSeed('fortune-v1|tti|rat|2026-11-05')).toBe(1764593809);
    expect(hashFortuneSeed(text)).not.toBe(
      hashFortuneSeed('fortune-v1|personal|1990-06-16|2026-11-05')
    );
    // 독립 구현(BigInt)과 비교
    for (const sample of [
      '운세',
      '별자리 🌟',
      'fortune-v1|star-sign|leo|2029-01-01',
    ]) {
      let hash = BigInt(0x811c9dc5);
      for (let i = 0; i < sample.length; i += 1) {
        hash ^= BigInt(sample.charCodeAt(i));
        hash = BigInt.asUintN(32, hash * BigInt(0x01000193));
      }
      expect(hashFortuneSeed(sample)).toBe(Number(hash));
    }
    const value = hashFortuneSeed(text);
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(2 ** 32);
  });

  test('createFortuneRng: 같은 시드는 같은 수열, 값은 0 이상 1 미만, 독립 구현과 같다', () => {
    const a = createFortuneRng(1903050690);
    const b = createFortuneRng(1903050690);
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect(first[0]).toBeCloseTo(0.17507846024818718, 12);
    expect(first[1]).toBeCloseTo(0.6886987988837063, 12);
    expect(first[2]).toBeCloseTo(0.8872705823741853, 12);
    const c = createFortuneRng(1764593809);
    expect(c()).toBeCloseTo(0.5573661364614964, 12);
    const rng = createFortuneRng(12345);
    let sum = 0;
    let outOfRange = 0;
    for (let i = 0; i < 20000; i += 1) {
      const value = rng();
      if (!(value >= 0 && value < 1)) {
        outOfRange += 1;
      }
      sum += value;
    }
    expect(outOfRange).toBe(0);
    expect(sum / 20000).toBeGreaterThan(0.48);
    expect(sum / 20000).toBeLessThan(0.52);
    expect(createFortuneRng(1)()).not.toBe(createFortuneRng(2)());
  });

  test('toFortuneScore: 30·95 경계와 정수', () => {
    expect(toFortuneScore(0, 0)).toBe(FORTUNE_SCORE_MIN);
    expect(toFortuneScore(0.999999, 0.999999)).toBe(FORTUNE_SCORE_MAX);
    expect(toFortuneScore(1, 1)).toBe(FORTUNE_SCORE_MAX);
    expect(toFortuneScore(0, 1)).toBe(63);
    expect(toFortuneScore(0.5, 0.5)).toBe(63);
    const rng = createFortuneRng(777);
    let invalid = 0;
    for (let i = 0; i < 5000; i += 1) {
      const score = toFortuneScore(rng(), rng());
      if (!Number.isInteger(score) || score < 30 || score > 95) {
        invalid += 1;
      }
    }
    expect(invalid).toBe(0);
  });

  test('getFortuneBand: 구간 경계 54/55/74/75', () => {
    expect(FORTUNE_SCORE_MID_MIN).toBe(55);
    expect(FORTUNE_SCORE_HIGH_MIN).toBe(75);
    expect(getFortuneBand(30)).toBe('low');
    expect(getFortuneBand(54)).toBe('low');
    expect(getFortuneBand(55)).toBe('mid');
    expect(getFortuneBand(74)).toBe('mid');
    expect(getFortuneBand(75)).toBe('high');
    expect(getFortuneBand(95)).toBe('high');
  });

  test('점수 분포: 상 약 20%, 중 약 52%, 하 약 28% (design.md 4.6)', () => {
    const counts: Record<FortuneBandType, number> = { high: 0, mid: 0, low: 0 };
    const total = 20000;
    for (let i = 0; i < total; i += 1) {
      const rng = createFortuneRng(hashFortuneSeed(`distribution-${i}`));
      counts[getFortuneBand(toFortuneScore(rng(), rng()))] += 1;
    }
    expect(counts.high / total).toBeGreaterThan(0.16);
    expect(counts.high / total).toBeLessThan(0.24);
    expect(counts.mid / total).toBeGreaterThan(0.47);
    expect(counts.mid / total).toBeLessThan(0.57);
    expect(counts.low / total).toBeGreaterThan(0.24);
    expect(counts.low / total).toBeLessThan(0.32);
  });

  test('pickFortuneVariant: 0, 1, 2 세 구간으로 나눈다', () => {
    expect(pickFortuneVariant(0)).toBe(0);
    expect(pickFortuneVariant(0.33)).toBe(0);
    expect(pickFortuneVariant(0.34)).toBe(1);
    expect(pickFortuneVariant(0.66)).toBe(1);
    expect(pickFortuneVariant(0.67)).toBe(2);
    expect(pickFortuneVariant(0.999999)).toBe(2);
    expect(pickFortuneVariant(1)).toBe(2);
    expect(pickFortuneVariant(-0.5)).toBe(0);
  });
});

// =====================================================================
// 10. fortune-reading (AC-2, 4, 5, 6)
// =====================================================================

test.describe('buildFortuneReading', () => {
  function reading(seedText: string, dateKey: string) {
    return buildFortuneReading({
      seedText,
      dateKey,
      pool: FORTUNE_PERSONAL_POOL,
      common: FORTUNE_COMMON_POOL,
    });
  }

  test('AC-2: 같은 입력은 항상 같은 결과다 (여러 번 호출, 객체 새로 만들어도)', () => {
    const seed = personalSeed(ymd(1990, 6, 15), '2026-11-05');
    const first = reading(seed, '2026-11-05');
    expect(reading(seed, '2026-11-05')).toEqual(first);
    expect(reading(`${seed}`, '2026-11-05')).toEqual(first);
    expect(first.dateKey).toBe('2026-11-05');
  });

  test('AC-2: 생년월일이나 날짜가 다르면 결과가 달라질 수 있다 (여러 생일 중 서로 다른 결과가 있다)', () => {
    const results = new Set<string>();
    for (let day = 1; day <= 28; day += 1) {
      const r = reading(
        personalSeed(ymd(1990, 6, day), '2026-11-05'),
        '2026-11-05'
      );
      results.add(JSON.stringify(r));
    }
    expect(results.size).toBeGreaterThan(20);
  });

  test('AC-4: 같은 생년월일로 연속 7일을 보면 총운 점수가 모두 같지는 않다 (여러 생일, 달 경계 포함)', () => {
    const births = [
      ymd(1990, 6, 15),
      ymd(1992, 5, 10),
      ymd(2000, 1, 1),
      ymd(1985, 12, 31),
      ymd(2008, 2, 29),
      ymd(1920, 1, 1),
      ymd(2012, 11, 5),
      ymd(2025, 2, 3),
    ];
    for (const birth of births) {
      const scores = new Set<number>();
      for (let offset = 0; offset < 7; offset += 1) {
        const today = addDays(ymd(2026, 11, 28), offset);
        const key = toKey(today);
        scores.add(reading(personalSeed(birth, key), key).total.score);
      }
      expect(scores.size, `${toKey(birth)} 7일 총운`).toBeGreaterThan(1);
    }
  });

  test('AC-5: 모든 점수는 30~95 정수이고, 구간과 문구가 맞다 (2000개 시드)', () => {
    const problems: string[] = [];
    for (let i = 0; i < 2000; i += 1) {
      const todayKey = '2026-11-05';
      const r = reading(`calc-test-${i}`, todayKey);
      for (const key of CATEGORY_KEYS) {
        const item = r[key];
        if (
          !Number.isInteger(item.score) ||
          item.score < 30 ||
          item.score > 95
        ) {
          problems.push(`${i} ${key}: 점수 ${item.score}`);
        }
        if (item.band !== getFortuneBand(item.score)) {
          problems.push(`${i} ${key}: 구간 ${item.band}, 점수 ${item.score}`);
        }
        if (
          !(
            FORTUNE_PERSONAL_POOL[key][item.band] as readonly string[]
          ).includes(item.text)
        ) {
          problems.push(`${i} ${key}: 문구가 ${item.band} 풀에 없음`);
        }
      }
      const band = r.total.band;
      if (
        !(FORTUNE_COMMON_POOL.summary[band] as readonly string[]).includes(
          r.summary
        )
      ) {
        problems.push(`${i}: summary가 ${band} 풀에 없음`);
      }
      if (
        !(FORTUNE_COMMON_POOL.advice[band] as readonly string[]).includes(
          r.advice
        )
      ) {
        problems.push(`${i}: advice가 ${band} 풀에 없음`);
      }
      if (
        !(FORTUNE_COMMON_POOL.caution[band] as readonly string[]).includes(
          r.caution
        )
      ) {
        problems.push(`${i}: caution이 ${band} 풀에 없음`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  test('AC-6: 행운의 숫자는 1~2개이고 각 1~10, 서로 다르며 색·방향·오행이 대응표와 같다', () => {
    const elements = new Set<string>();
    const lengths = new Set<number>();
    const problems: string[] = [];
    for (let i = 0; i < 2000; i += 1) {
      const { lucky } = reading(`lucky-test-${i}`, '2026-11-05');
      const entry = FORTUNE_LUCKY_TABLE.find(
        (item) => item.element === lucky.element
      );
      if (
        lucky.numbers.length < 1 ||
        lucky.numbers.length > 2 ||
        new Set(lucky.numbers).size !== lucky.numbers.length
      ) {
        problems.push(`${i}: 숫자 개수 ${lucky.numbers.length}`);
      }
      for (const n of lucky.numbers) {
        if (
          !Number.isInteger(n) ||
          n < FORTUNE_LUCKY_NUMBER_MIN ||
          n > FORTUNE_LUCKY_NUMBER_MAX ||
          !entry?.numbers.includes(n)
        ) {
          problems.push(`${i}: 숫자 ${n}`);
        }
      }
      if (
        !entry ||
        lucky.color !== entry.color ||
        lucky.direction !== entry.direction
      ) {
        problems.push(`${i}: 오행 ${lucky.element} 색·방향 불일치`);
      }
      elements.add(lucky.element);
      lengths.add(lucky.numbers.length);
    }
    expect(problems.slice(0, 10)).toEqual([]);
    expect([...elements].sort()).toEqual([
      'earth',
      'fire',
      'metal',
      'water',
      'wood',
    ]);
    expect([...lengths].sort()).toEqual([1, 2]);
  });

  test('행운 대응표: 목 초록·동쪽·3,8 / 화 빨강·남쪽·2,7 / 토 노랑·가운데·5,10 / 금 흰색·서쪽·4,9 / 수 파랑·북쪽·1,6', () => {
    expect(
      FORTUNE_LUCKY_TABLE.map((item) => [
        item.element,
        item.color,
        item.direction,
        [...item.numbers],
      ])
    ).toEqual([
      ['wood', '초록', '동쪽', [3, 8]],
      ['fire', '빨강', '남쪽', [2, 7]],
      ['earth', '노랑', '가운데', [5, 10]],
      ['metal', '흰색', '서쪽', [4, 9]],
      ['water', '파랑', '북쪽', [1, 6]],
    ]);
  });

  test('세 구간과 변형 세 개가 모두 나온다 (총운 문구 9개가 모두 쓰인다)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 3000; i += 1) {
      const r = reading(`variant-test-${i}`, '2026-11-05');
      seen.add(`${r.total.band}|${r.total.text}`);
    }
    for (const band of BANDS) {
      for (const text of FORTUNE_PERSONAL_POOL.total[band]) {
        expect(seen.has(`${band}|${text}`), `${band}: ${text}`).toBe(true);
      }
    }
  });

  test('쓰는 풀이 달라도 형식은 같다: 12띠와 12별자리 풀로 만든 결과도 점수·구간·문구가 맞다', () => {
    const todayKey = '2026-11-05';
    for (const key of TTI_KEYS) {
      const r = buildFortuneReading({
        seedText: ttiSeed(key, todayKey),
        dateKey: todayKey,
        pool: FORTUNE_TTI_POOLS[key],
        common: FORTUNE_COMMON_POOL,
      });
      for (const category of CATEGORY_KEYS) {
        const item = r[category];
        expect(item.score, `${key} ${category}`).toBeGreaterThanOrEqual(30);
        expect(item.score, `${key} ${category}`).toBeLessThanOrEqual(95);
        expect(FORTUNE_TTI_POOLS[key][category][item.band]).toContain(
          item.text
        );
      }
    }
    for (const key of STAR_SIGN_KEYS) {
      const r = buildFortuneReading({
        seedText: starSignSeed(key, todayKey),
        dateKey: todayKey,
        pool: FORTUNE_STAR_SIGN_POOLS[key],
        common: FORTUNE_COMMON_POOL,
      });
      for (const category of CATEGORY_KEYS) {
        const item = r[category];
        expect(item.score, `${key} ${category}`).toBeGreaterThanOrEqual(30);
        expect(item.score, `${key} ${category}`).toBeLessThanOrEqual(95);
        expect(FORTUNE_STAR_SIGN_POOLS[key][category][item.band]).toContain(
          item.text
        );
      }
    }
  });

  test('띠·별자리 풀 합본은 12개 키를 모두 가지고 항목 5개 × 구간 3개 × 변형 3개가 문자열이다', () => {
    expect(Object.keys(FORTUNE_TTI_POOLS).sort()).toEqual([...TTI_KEYS].sort());
    expect(Object.keys(FORTUNE_STAR_SIGN_POOLS).sort()).toEqual(
      [...STAR_SIGN_KEYS].sort()
    );
    const pools = [
      FORTUNE_PERSONAL_POOL,
      ...Object.values(FORTUNE_TTI_POOLS),
      ...Object.values(FORTUNE_STAR_SIGN_POOLS),
    ];
    for (const pool of pools) {
      for (const category of CATEGORY_KEYS) {
        for (const band of BANDS) {
          expect(pool[category][band]).toHaveLength(3);
          for (const text of pool[category][band]) {
            expect(typeof text).toBe('string');
            expect(text.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
    for (const group of ['summary', 'advice', 'caution'] as const) {
      for (const band of BANDS) {
        expect(FORTUNE_COMMON_POOL[group][band]).toHaveLength(3);
      }
    }
  });

  test('시드 문자열 형식이 바뀌면 결과가 바뀐다: 날짜가 다르면 같은 생일도 다른 결과가 나올 수 있다', () => {
    const a = reading(
      personalSeed(ymd(1990, 6, 15), '2026-11-05'),
      '2026-11-05'
    );
    const b = reading(
      personalSeed(ymd(1990, 6, 15), '2026-11-06'),
      '2026-11-06'
    );
    expect(a.dateKey).not.toBe(b.dateKey);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});

// =====================================================================
// 11. 2029년 이후 동작 (AC-84, design.md 4.10)
// =====================================================================

test.describe('2029년 이후 동작 (오늘 = 2029-01-01, 2030-06-15 모의)', () => {
  for (const todayKey of ['2029-01-01', '2030-06-15']) {
    test(`오늘 ${todayKey}: 개인 일운이 정상 생성된다`, () => {
      const today = parseDateKey(todayKey);
      expect(today).not.toBeNull();
      for (const birth of [
        ymd(1990, 6, 15),
        ymd(1920, 1, 1),
        ymd(2008, 2, 29),
        ymd(2012, 12, 31),
        ymd(2028, 12, 31),
      ]) {
        const r = buildFortuneReading({
          seedText: personalSeed(birth, todayKey),
          dateKey: todayKey,
          pool: FORTUNE_PERSONAL_POOL,
          common: FORTUNE_COMMON_POOL,
        });
        expect(r.dateKey).toBe(todayKey);
        for (const key of CATEGORY_KEYS) {
          expect(r[key].score).toBeGreaterThanOrEqual(30);
          expect(r[key].score).toBeLessThanOrEqual(95);
          expect(r[key].text.length).toBeGreaterThan(0);
        }
        expect(r.summary.length).toBeGreaterThan(0);
        expect(r.advice.length).toBeGreaterThan(0);
        expect(r.caution.length).toBeGreaterThan(0);
        expect(r.lucky.numbers.length).toBeGreaterThanOrEqual(1);
      }
    });

    test(`오늘 ${todayKey}: 12띠 12별자리 결과가 모두 정상 생성된다`, () => {
      for (const key of TTI_KEYS) {
        const r = buildFortuneReading({
          seedText: ttiSeed(key, todayKey),
          dateKey: todayKey,
          pool: FORTUNE_TTI_POOLS[key],
          common: FORTUNE_COMMON_POOL,
        });
        expect(r.dateKey).toBe(todayKey);
        expect(r.total.score).toBeGreaterThanOrEqual(30);
        expect(r.total.score).toBeLessThanOrEqual(95);
        expect(r.total.text.length, key).toBeGreaterThan(0);
      }
      for (const key of STAR_SIGN_KEYS) {
        const r = buildFortuneReading({
          seedText: starSignSeed(key, todayKey),
          dateKey: todayKey,
          pool: FORTUNE_STAR_SIGN_POOLS[key],
          common: FORTUNE_COMMON_POOL,
        });
        expect(r.dateKey).toBe(todayKey);
        expect(r.total.score).toBeGreaterThanOrEqual(30);
        expect(r.total.score).toBeLessThanOrEqual(95);
        expect(r.total.text.length, key).toBeGreaterThan(0);
      }
    });

    test(`오늘 ${todayKey}: 출생 2028-12-31은 통과하고 2029-01-01은 after-max, 내 띠·별자리 찾기는 2028년까지 정상이다`, () => {
      const today = parseDateKey(todayKey);
      if (!today) {
        throw new Error('날짜 키 오류');
      }
      expectSolar(
        resolveFortuneBirth(
          { calendar: 'solar', year: 2028, month: 12, day: 31 },
          today
        ),
        ymd(2028, 12, 31),
        false
      );
      expectError(
        resolveFortuneBirth(
          { calendar: 'solar', year: 2029, month: 1, day: 1 },
          today
        ),
        'after-max'
      );
      // 통과한 출생일의 띠·별자리는 정상 판정
      expect(determineFortuneTti(ymd(2028, 12, 31))).toEqual({
        kind: 'single',
        key: 'monkey',
      });
      expect(determineFortuneStarSign(ymd(2028, 12, 31))).toEqual({
        kind: 'single',
        key: 'capricorn',
      });
      expect(determineFortuneTti(ymd(2029, 2, 4))).toEqual({
        kind: 'unsupported',
      });
      expect(determineFortuneStarSign(ymd(2029, 3, 20))).toEqual({
        kind: 'unsupported',
      });
      // 연령 판정도 문제 없이 동작
      expect(calculateFortuneManAge(ymd(2028, 12, 31), today)).toBe(
        today.year - 2028 - (today.month < 12 ? 1 : 0)
      );
    });
  }

  test('일일 운세 경로(오늘의 운세·12띠·12별자리 목록)는 절기 표·절기 함수를 import하지 않는다 (design.md 4.10)', () => {
    const root = path.join(process.cwd(), 'src', 'features', 'fortune');
    const targets = [
      path.join(root, 'tti', 'components', 'list.component.tsx'),
      path.join(root, 'star-sign', 'components', 'list.component.tsx'),
      path.join(root, 'today', 'components', 'panel.component.tsx'),
    ];
    const forbidden = [
      'solar-term-table.constant',
      'fortune-solar-term.util',
      'fortune-tti.util',
      'fortune-star-sign.util',
    ];
    for (const file of targets) {
      const source = fs.readFileSync(file, 'utf8');
      const imports = source
        .split('\n')
        .filter(
          (line) => /^\s*(import|\} from)/.test(line) || line.includes("from '")
        );
      for (const name of forbidden) {
        expect(
          imports.some((line) => line.includes(name)),
          `${path.relative(process.cwd(), file)}가 ${name}을 import합니다`
        ).toBe(false);
      }
    }
  });
});

// =====================================================================
// 12. 지원 범위 일치 / 만료 감시 (D14, design.md 4.10)
// =====================================================================

test.describe('지원 범위 일치 (D14)', () => {
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

test.describe('만료 감시 (F-1)', () => {
  test('절기 표 보완(F-1) 기한이 지나지 않았다', () => {
    const todayKey = getKoreaDateKey();
    const overdue = isSolarTermRenewalOverdue(
      todayKey,
      FORTUNE_SUPPORTED_MAX_YEAR,
      FORTUNE_SOLAR_TERM_RENEW_BY
    );
    expect(
      overdue,
      `절기 표 보완(F-1) 기한이 지났습니다. 오늘 ${todayKey}, 기한 ${FORTUNE_SOLAR_TERM_RENEW_BY}, 지원 마지막 연도 ${FORTUNE_SUPPORTED_MAX_YEAR}. 절기 표를 늘리고 FORTUNE_SUPPORTED_MAX_YEAR를 올려 주세요.`
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

  test('getKoreaDateKey는 한국 날짜 형식(YYYY-MM-DD)을 돌려준다', () => {
    expect(getKoreaDateKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // UTC 15:00 = KST 다음 날 00:00
    expect(getKoreaDateKey(new Date('2026-11-04T14:59:00Z'))).toBe(
      '2026-11-04'
    );
    expect(getKoreaDateKey(new Date('2026-11-04T15:00:00Z'))).toBe(
      '2026-11-05'
    );
  });
});

// =====================================================================
// 13. FORTUNE_ROUTES와 MENU_LIST 일치 (D8, D11)
// =====================================================================

test.describe('FORTUNE_ROUTES와 MENU_LIST', () => {
  const group = MENU_LIST.find((item) => item.group === 'fortune');

  test('운세 그룹이 있고 그룹 href가 허브(/fortune)와 같다', () => {
    expect(group).toBeDefined();
    expect(group?.href).toBe(FORTUNE_ROUTES.hub);
    expect(FORTUNE_ROUTES.hub).toBe('/fortune');
  });

  test('항목 href가 today·tti·starSign과 같고 순서도 그렇다', () => {
    expect(group?.items.map((item) => item.href)).toEqual([
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
    ]);
    expect(FORTUNE_ROUTES.today).toBe('/fortune/today');
    expect(FORTUNE_ROUTES.tti).toBe('/fortune/tti');
    expect(FORTUNE_ROUTES.starSign).toBe('/fortune/star-sign');
  });

  test('1단계 메뉴에는 사주 항목이 없다 (D8, D11)', () => {
    expect(FORTUNE_ROUTES.saju).toBe('/fortune/saju');
    expect(group?.items.some((item) => item.href === FORTUNE_ROUTES.saju)).toBe(
      false
    );
    expect(JSON.stringify(group)).not.toContain('saju');
    expect(JSON.stringify(group)).not.toContain('사주');
  });

  test('메뉴 항목마다 라벨·설명·아이콘이 있고 색은 운세 토큰이다', () => {
    for (const item of group?.items ?? []) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.colorClass).toBe('text-menu-fortune');
    }
  });

  test('다른 그룹(로또, 타로)의 href는 운세 경로와 겹치지 않는다', () => {
    const fortunePaths = new Set<string>([
      FORTUNE_ROUTES.hub,
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
    ]);
    for (const other of MENU_LIST.filter((item) => item.group !== 'fortune')) {
      for (const item of other.items) {
        expect(fortunePaths.has(item.href), item.href).toBe(false);
      }
    }
  });
});

// =====================================================================
// 14. 공용 상담전화 상수 (D4)
// =====================================================================

test.describe('공용 상담전화 상수', () => {
  test('5곳이 109, 1577-0199, 1588-9191, 1388, 1366 순서다', () => {
    expect(CRISIS_PHONES.map((phone) => phone.number)).toEqual([
      '109',
      '1577-0199',
      '1588-9191',
      '1388',
      '1366',
    ]);
    expect(CRISIS_PHONES.map((phone) => phone.id)).toEqual([
      'suicide-prevention',
      'mental-health-crisis',
      'life-line',
      'youth',
      'women-emergency',
    ]);
  });

  test('href는 tel: + 숫자만이고 number의 숫자와 href의 숫자가 같다', () => {
    for (const phone of CRISIS_PHONES) {
      expect(phone.href, phone.id).toMatch(/^tel:\d+$/);
      expect(phone.number.replace(/\D/g, ''), phone.id).toBe(
        phone.href.replace('tel:', '')
      );
    }
    expect(CRISIS_PHONES.map((phone) => phone.href)).toEqual([
      'tel:109',
      'tel:15770199',
      'tel:15889191',
      'tel:1388',
      'tel:1366',
    ]);
  });

  test('화면 표기는 번호와 같고, 이름·설명이 비어 있지 않으며 번호는 겹치지 않는다', () => {
    for (const phone of CRISIS_PHONES) {
      expect(phone.displayNumber, phone.id).toBe(phone.number);
      expect(phone.name.length, phone.id).toBeGreaterThan(0);
      expect(phone.description.length, phone.id).toBeGreaterThan(0);
    }
    expect(new Set(CRISIS_PHONES.map((phone) => phone.number)).size).toBe(5);
    expect(new Set(CRISIS_PHONES.map((phone) => phone.id)).size).toBe(5);
  });

  test('위기 패널에는 앞의 세 곳만 나온다', () => {
    expect(CRISIS_PHONES.map((phone) => phone.showInCrisisPanel)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  test('결과 하단 첫 줄에 24시간 운영과 상담전화 안내가 있다', () => {
    expect(CRISIS_RESULT_LINE).toContain('상담전화');
    expect(CRISIS_RESULT_LINE).toContain('24시간');
  });
});

// =====================================================================
// SJ-QA1. 사주 계산 (fortune-saju.util.ts, 설계 V1.2). 사례값은 plan AC-54·56·91, calendar-verification S2-11
// =====================================================================

function pn(pillar: FortunePillarType | null): string {
  if (!pillar) {
    return '없음';
  }
  return `${FORTUNE_SAJU_STEMS[pillar.stem].ko}${FORTUNE_SAJU_BRANCHES[pillar.branch].ko}`;
}

function chartOf(
  solar: FortuneYmdType,
  time: SajuClockType | null,
  basis: FortuneLateZiStemBasisType = 'next-day'
): FortuneSajuChartType {
  const result = buildFortuneSajuCharts(solar, time, basis);
  if (result.kind !== 'single') {
    throw new Error(`single이 아님: ${result.kind}`);
  }
  return result.chart;
}

function names(chart: FortuneSajuChartType): string {
  return [chart.year, chart.month, chart.day, chart.hour].map(pn).join(' ');
}

function shiftMinute(
  solar: FortuneYmdType,
  time: SajuClockType,
  delta: number
): { solar: FortuneYmdType; time: SajuClockType } {
  const total = time.hour * 60 + time.minute + delta;
  const dayShift = Math.floor(total / 1440);
  const rest = ((total % 1440) + 1440) % 1440;
  return {
    solar: addDays(solar, dayShift),
    time: { hour: Math.floor(rest / 60), minute: rest % 60 },
  };
}

test.describe('SJ-QA1 사주 계산', () => {
  test('AC-54: 일주 사례(오늘 일진 계미, 다음 날 갑신, 만세력 검산값)', () => {
    expect(pn(getDayPillar(ymd(2026, 11, 5)))).toBe('계미');
    expect(pn(getDayPillar(ymd(2026, 11, 6)))).toBe('갑신');
    expect(pn(getDayPillar(ymd(2026, 11, 7)))).toBe('을유');
    expect(pn(getDayPillar(ymd(1999, 12, 31)))).toBe('정사');
    expect(pn(getDayPillar(ymd(2000, 1, 1)))).toBe('무오');
    expect(pn(getDayPillar(ymd(2025, 2, 3)))).toBe('계묘');
  });

  test('AC-54: 일주는 60일 주기이고 2029년 이후에도 계산된다', () => {
    expect(pn(getDayPillar(addDays(ymd(2026, 11, 5), 60)))).toBe('계미');
    expect(pn(getDayPillar(ymd(2029, 1, 1)))).toMatch(/^.{2}$/);
    expect(pn(getDayPillar(ymd(2040, 1, 1)))).toMatch(/^.{2}$/);
  });

  test('AC-54: 같은 일간은 같은 날 같은 십신, 십신 10종 표 일치(AC-55)', () => {
    const expected = [
      'bigyeon',
      'geopjae',
      'siksin',
      'sanggwan',
      'pyeonjae',
      'jeongjae',
      'pyeongwan',
      'jeonggwan',
      'pyeonin',
      'jeongin',
    ];
    for (let target = 0; target < 10; target += 1) {
      expect(getFortuneTenGod(0, target)).toBe(expected[target]);
    }
    expect(getFortuneTenGod(9, getDayPillar(ymd(2026, 11, 5)).stem)).toBe(
      'bigyeon'
    );
    for (let day = 0; day < 10; day += 1) {
      const set = new Set<string>();
      for (let target = 0; target < 10; target += 1) {
        set.add(getFortuneTenGod(day, target));
      }
      expect(set.size).toBe(10);
    }
  });

  test('AC-56: 시지 경계(23:00 자, 00:59 자, 01:00 축, 22:59 해)', () => {
    const branch = (hour: number, minute: number) =>
      FORTUNE_SAJU_BRANCHES[getHourBranch({ hour, minute })].ko;
    expect(branch(23, 0)).toBe('자');
    expect(branch(23, 59)).toBe('자');
    expect(branch(0, 0)).toBe('자');
    expect(branch(0, 59)).toBe('자');
    expect(branch(1, 0)).toBe('축');
    expect(branch(2, 59)).toBe('축');
    expect(branch(3, 0)).toBe('인');
    expect(branch(21, 0)).toBe('해');
    expect(branch(22, 59)).toBe('해');
  });

  test('AC-56: 2026-11-06(갑신일) 시주. 22:59 을해, 23시대 병자(next-day)', () => {
    const day = ymd(2026, 11, 6);
    expect(pn(chartOf(day, { hour: 22, minute: 59 }).hour)).toBe('을해');
    for (const minute of [0, 30, 59]) {
      const chart = chartOf(day, { hour: 23, minute });
      expect(pn(chart.day)).toBe('갑신');
      expect(pn(chart.hour)).toBe('병자');
    }
    expect(chartOf(day, null).hour).toBeNull();
  });

  test('AC-56: 2026-11-07(을유일) 00:00, 00:30 병자, 01:00 정축', () => {
    const day = ymd(2026, 11, 7);
    for (const minute of [0, 30]) {
      const chart = chartOf(day, { hour: 0, minute });
      expect(pn(chart.day)).toBe('을유');
      expect(pn(chart.hour)).toBe('병자');
    }
    expect(pn(chartOf(day, { hour: 1, minute: 0 }).hour)).toBe('정축');
  });

  test('AC-56: 23:30과 다음 날 00:30은 시주 같고 일주 다르다', () => {
    const a = chartOf(ymd(2026, 11, 6), { hour: 23, minute: 30 });
    const b = chartOf(ymd(2026, 11, 7), { hour: 0, minute: 30 });
    expect(pn(a.hour)).toBe(pn(b.hour));
    expect(pn(a.day)).toBe('갑신');
    expect(pn(b.day)).toBe('을유');
  });

  test('AC-56: 1999-12-31 23:30 정사/임자, 2000-01-01 00:30 무오/임자', () => {
    const a = chartOf(ymd(1999, 12, 31), { hour: 23, minute: 30 });
    expect(pn(a.day)).toBe('정사');
    expect(pn(a.hour)).toBe('임자');
    const b = chartOf(ymd(2000, 1, 1), { hour: 0, minute: 30 });
    expect(pn(b.day)).toBe('무오');
    expect(pn(b.hour)).toBe('임자');
  });

  test('AC-56: same-day는 23시대 시주 천간만 그날 일간으로 구한다(테스트 전용)', () => {
    const dayStem = getDayPillar(ymd(2026, 11, 6)).stem;
    const late = { hour: 23, minute: 30 };
    expect(pn(getHourPillar(dayStem, late, 'same-day'))).toBe('갑자');
    expect(pn(getHourPillar(dayStem, late, 'next-day'))).toBe('병자');
    for (const hour of [0, 1, 12, 22]) {
      expect(getHourPillar(dayStem, { hour, minute: 10 }, 'same-day')).toEqual(
        getHourPillar(dayStem, { hour, minute: 10 }, 'next-day')
      );
    }
    const same = chartOf(ymd(2026, 11, 6), late, 'same-day');
    expect(pn(same.day)).toBe('갑신');
    expect(pn(same.hour)).toBe('갑자');
  });

  test('AC-56: 2025-02-03 입춘 23:10. 23:09 갑진 정축 계묘 갑자, 23:10 이후 을사 무인 계묘 갑자', () => {
    const day = ymd(2025, 2, 3);
    expect(names(chartOf(day, { hour: 23, minute: 9 }))).toBe(
      '갑진 정축 계묘 갑자'
    );
    expect(names(chartOf(day, { hour: 23, minute: 10 }))).toBe(
      '을사 무인 계묘 갑자'
    );
    expect(names(chartOf(day, { hour: 23, minute: 30 }))).toBe(
      '을사 무인 계묘 갑자'
    );
    expect(getFortuneSajuBoundary(day)).toEqual({
      kind: 'year',
      termIndex: 2,
      time: { hour: 23, minute: 10 },
    });
  });

  test('AC-56: 입춘 전후 날짜(경계일 아님)는 하루 단위로 갈린다', () => {
    expect(getFortuneSajuBoundary(ymd(2025, 2, 2))).toBeNull();
    expect(getFortuneSajuBoundary(ymd(2025, 2, 4))).toBeNull();
    const before = chartOf(ymd(2025, 2, 2), { hour: 12, minute: 0 });
    const after = chartOf(ymd(2025, 2, 4), { hour: 12, minute: 0 });
    expect(pn(before.year)).toBe('갑진');
    expect(pn(before.month)).toBe('정축');
    expect(pn(after.year)).toBe('을사');
    expect(pn(after.month)).toBe('무인');
  });

  test('AC-56: 2026 입춘 02-04 05:02 분 단위. 05:01 을사, 05:02 병오', () => {
    const day = ymd(2026, 2, 4);
    expect(getFortuneSajuBoundary(day)).toEqual({
      kind: 'year',
      termIndex: 2,
      time: { hour: 5, minute: 2 },
    });
    const before = chartOf(day, { hour: 5, minute: 1 });
    const after = chartOf(day, { hour: 5, minute: 2 });
    expect(pn(before.year)).toBe('을사');
    expect(pn(before.month)).toBe('기축');
    expect(pn(after.year)).toBe('병오');
    expect(pn(after.month)).toBe('경인');
  });

  test('AC-56: 경계일 + 시간 모름이면 need-choice(절기 전 후보, 후 후보 순)', () => {
    const result = buildFortuneSajuCharts(ymd(2026, 2, 4), null, 'next-day');
    expect(result.kind).toBe('need-choice');
    if (result.kind !== 'need-choice') {
      return;
    }
    expect(result.boundary.kind).toBe('year');
    expect(pn(result.charts[0].year)).toBe('을사');
    expect(pn(result.charts[1].year)).toBe('병오');
    expect(result.charts[0].hour).toBeNull();
    expect(result.charts[1].hour).toBeNull();
    const term = getSolarTermTime(2026, 4);
    expect(term).toBeTruthy();
    const monthDay = ymd(2026, term?.month ?? 1, term?.day ?? 1);
    const monthResult = buildFortuneSajuCharts(monthDay, null, 'next-day');
    expect(monthResult.kind).toBe('need-choice');
    if (monthResult.kind === 'need-choice') {
      expect(monthResult.boundary.kind).toBe('month');
      expect(monthResult.charts[0].year).toEqual(monthResult.charts[1].year);
      expect(monthResult.charts[0].month).not.toEqual(
        monthResult.charts[1].month
      );
    }
  });

  test('AC-56: 시간이 있으면 경계일이어도 single, 시간 모름 비경계일도 single', () => {
    const atBoundary = buildFortuneSajuCharts(
      ymd(2026, 2, 4),
      { hour: 12, minute: 0 },
      'next-day'
    );
    expect(atBoundary.kind).toBe('single');
    expect(
      buildFortuneSajuCharts(ymd(2026, 11, 5), null, 'next-day').kind
    ).toBe('single');
  });

  test('AC-56: 짝수 절기 12개 x 1920~2028 분 단위 전후 월지·연주가 갈린다', () => {
    for (let year = 1920; year <= 2028; year += 1) {
      for (let index = 0; index <= 22; index += 2) {
        const term = getSolarTermTime(year, index);
        expect(term, `${year} ${index}`).toBeTruthy();
        if (!term) {
          continue;
        }
        const solar = ymd(year, term.month, term.day);
        const at = { hour: term.hour, minute: term.minute };
        const prev = shiftMinute(solar, at, -1);
        const chartBefore = chartOf(prev.solar, prev.time);
        const chartAt = chartOf(solar, at);
        const expectedAfter = (index / 2 + 1) % 12;
        const expectedBefore = (expectedAfter + 11) % 12;
        const label = `${year} idx${index}`;
        expect(chartAt.month.branch, label).toBe(expectedAfter);
        expect(chartBefore.month.branch, label).toBe(expectedBefore);
        if (index === 2) {
          expect(chartAt.year, label).toEqual(getYearPillar(year));
          expect(chartBefore.year, label).toEqual(getYearPillar(year - 1));
        } else if (index === 0) {
          expect(chartAt.year, label).toEqual(getYearPillar(year - 1));
        } else {
          expect(chartAt.year, label).toEqual(getYearPillar(year));
        }
      }
    }
  });

  test('AC-56: 월주는 오호둔(갑·기년 인월 병인, 을·경년 무인, 병·신년 경인)', () => {
    expect(pn(getMonthPillar(0, 2))).toBe('병인');
    expect(pn(getMonthPillar(5, 2))).toBe('병인');
    expect(pn(getMonthPillar(1, 2))).toBe('무인');
    expect(pn(getMonthPillar(2, 2))).toBe('경인');
    expect(pn(getMonthPillar(3, 2))).toBe('임인');
    expect(pn(getMonthPillar(4, 2))).toBe('갑인');
    expect(pn(getMonthPillar(0, 1))).toBe('정축');
  });

  test('AC-56: 연주는 (y-4) mod 60', () => {
    expect(pn(getYearPillar(1984))).toBe('갑자');
    expect(pn(getYearPillar(2024))).toBe('갑진');
    expect(pn(getYearPillar(2026))).toBe('병오');
    expect(pn(getYearPillar(1920))).toBe('경신');
  });

  test('AC-91: 1920-01-01 00:30은 결과가 나오고 월주는 자월(소한 이전, 전년도 대설)', () => {
    const chart = chartOf(ymd(1920, 1, 1), { hour: 0, minute: 30 });
    expect(pn(chart.year)).toBe('기미');
    expect(pn(chart.month)).toBe('병자');
    expect(chart.hour?.branch).toBe(0);
    expect(getFortuneSajuBoundary(ymd(1920, 1, 1))).toBeNull();
    expect(buildFortuneSajuCharts(ymd(1920, 1, 1), null, 'next-day').kind).toBe(
      'single'
    );
  });

  test('AC-91: 소한 이전은 전년도 대설 이후로 자월, 소한 이후는 축월', () => {
    const term = getSolarTermTime(2026, 0);
    expect(term).toBeTruthy();
    if (!term) {
      return;
    }
    const before = chartOf(ymd(2026, 1, 1), { hour: 0, minute: 30 });
    expect(before.month.branch).toBe(0);
    expect(pn(before.year)).toBe('을사');
    const after = chartOf(ymd(2026, term.month, term.day + 1), {
      hour: 12,
      minute: 0,
    });
    expect(after.month.branch).toBe(1);
  });

  test('AC-91: 2028-12-31 23:30은 결과가 나오고 시주 천간은 2029-01-01 일간을 쓴다', () => {
    const day = ymd(2028, 12, 31);
    const late = { hour: 23, minute: 30 };
    expect(buildFortuneSajuCharts(day, late, 'next-day').kind).toBe('single');
    const chart = chartOf(day, late);
    const nextStem = getDayPillar(ymd(2029, 1, 1)).stem;
    expect(chart.hour?.branch).toBe(0);
    expect(chart.hour?.stem).toBe(((nextStem % 5) * 2) % 10);
    expect(chart.day).toEqual(getDayPillar(day));
    expect(chart.month.branch).toBe(0);
    expect(pn(chart.year)).toBe('무신');
  });

  test('AC-91: 2029-01-01 이후는 절기 표가 없어 unsupported(안내는 AC-9), 일주는 동작', () => {
    expect(buildFortuneSajuCharts(ymd(2029, 1, 1), null, 'next-day').kind).toBe(
      'unsupported'
    );
    expect(
      buildFortuneSajuCharts(
        ymd(2029, 1, 1),
        { hour: 0, minute: 30 },
        'next-day'
      ).kind
    ).toBe('unsupported');
    expect(getFortuneSajuBoundary(ymd(2029, 1, 1))).toBeUndefined();
    const d1 = getDayPillar(ymd(2029, 1, 1));
    expect(getDayPillar(ymd(2029, 1, 2))).toEqual({
      stem: (d1.stem + 1) % 10,
      branch: (d1.branch + 1) % 12,
    });
  });

  test('AC-56(S2-11): 1959-02-04 입춘 22:42 경계. 22:41 무술년, 22:42 기해년', () => {
    const day = ymd(1959, 2, 4);
    expect(getFortuneSajuBoundary(day)).toEqual({
      kind: 'year',
      termIndex: 2,
      time: { hour: 22, minute: 42 },
    });
    const before = chartOf(day, { hour: 22, minute: 41 });
    const after = chartOf(day, { hour: 22, minute: 42 });
    expect(pn(before.year)).toBe('무술');
    expect(pn(before.month)).toBe('을축');
    expect(pn(after.year)).toBe('기해');
    expect(pn(after.month)).toBe('병인');
    expect(before.hour?.branch).toBe(11);
    expect(after.hour?.branch).toBe(11);
    const none = buildFortuneSajuCharts(day, null, 'next-day');
    expect(none.kind).toBe('need-choice');
    if (none.kind === 'need-choice') {
      expect(pn(none.charts[0].year)).toBe('무술');
      expect(pn(none.charts[1].year)).toBe('기해');
    }
  });

  test('AC-56: 오행 개수 합은 8자(시간 있음) 또는 6자(시간 모름)', () => {
    const withTime = chartOf(ymd(2026, 11, 5), { hour: 10, minute: 0 });
    const noTime = chartOf(ymd(2026, 11, 5), null);
    const sum = (v: Record<string, number>) =>
      Object.values(v).reduce((a, b) => a + b, 0);
    expect(sum(withTime.elements)).toBe(8);
    expect(sum(noTime.elements)).toBe(6);
    expect(withTime.elements).toEqual(countFortuneElements(withTime));
    const fixed = countFortuneElements({
      year: { stem: 0, branch: 0 },
      month: { stem: 0, branch: 0 },
      day: { stem: 0, branch: 0 },
      hour: null,
    });
    expect(fixed).toEqual({ wood: 3, fire: 0, earth: 0, metal: 0, water: 3 });
  });

  test('AC-57: 표준시 안내는 연도 단위, 시간을 넣었을 때만(계산은 시계 시각 그대로)', () => {
    const cases: ReadonlyArray<readonly [number, boolean]> = [
      [1947, false],
      [1948, true],
      [1961, true],
      [1962, false],
      [1986, false],
      [1987, true],
      [1988, true],
      [1989, false],
    ];
    for (const [year, expected] of cases) {
      expect(shouldShowFortuneDstNotice(year, true), String(year)).toBe(
        expected
      );
      expect(shouldShowFortuneDstNotice(year, false), String(year)).toBe(false);
    }
    const a = chartOf(ymd(1988, 7, 15), { hour: 0, minute: 30 });
    expect(a.hour?.branch).toBe(0);
    expect(a.day).toEqual(getDayPillar(ymd(1988, 7, 15)));
    expect(
      chartOf(ymd(1989, 7, 15), { hour: 0, minute: 30 }).hour?.branch
    ).toBe(0);
  });

  test('AC-54: 사주 기본 점수 변동 폭 상수는 30(SQ-2 안 A)', () => {
    const src = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/features/fortune/utils/fortune-reading.util.ts'
      ),
      'utf8'
    );
    expect(src).toMatch(/BASE_SCORE_SPREAD\s*=\s*30/);
  });
});
