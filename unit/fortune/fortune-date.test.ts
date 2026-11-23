import { afterEach, describe, expect, test, vi } from 'vitest';
import { FORTUNE_SOLAR_TERM_TABLE } from '@/features/fortune/constants/calendar/solar-term-table.constant';
import { FORTUNE_MIN_AGE } from '@/features/fortune/constants/fortune-input.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_PERSONAL_POOL } from '@/features/fortune/constants/pools/personal.constant';
import type {
  FortuneBandType,
  FortuneBirthErrorType,
  FortuneBirthResolvedType,
  FortuneCategoryKeyType,
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
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
} from '@/features/fortune/utils/fortune-lunar.util';
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import { getKoreaDateKey } from '@/lib/date';

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

function _addDays(value: FortuneYmdType, days: number): FortuneYmdType {
  return fromJulianDayNumber(toJulianDayNumber(value) + days);
}

/** 표 값(월일 * 10000 + 시분)을 읽는다. 함수가 아니라 표를 직접 읽어 값을 대조한다 */
function _rawTerm(year: number, index: number): number {
  return FORTUNE_SOLAR_TERM_TABLE[year][index];
}

/** 절기 시각을 연 단위 분으로 바꾼다(간격 계산용). 연도가 다르면 JDN으로 이어진다 */
function _termAbsoluteMinutes(year: number, index: number): number {
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
function _isSolarTermRenewalOverdue(
  todayKey: string,
  supportedMaxYear: number,
  renewBy: string
): boolean {
  const todayYear = Number(todayKey.slice(0, 4));
  return todayKey >= renewBy && supportedMaxYear < todayYear + 1;
}

const TODAY_AC = ymd(2026, 11, 5);

describe('fortune-date', () => {
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

describe('calculateFortuneManAge (AC-42~44)', () => {
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

// 5. fortune-birth: resolveFortuneBirth (AC-7~9, AC-84)
// =====================================================================

describe('resolveFortuneBirth', () => {
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

describe('getKoreaDateKey', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('getKoreaDateKey는 한국 날짜 형식(YYYY-MM-DD)을 돌려준다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-23T03:00:00Z'));
    expect(getKoreaDateKey()).toBe('2026-11-23');
    // UTC 15:00 = KST 다음 날 00:00
    expect(getKoreaDateKey(new Date('2026-11-04T14:59:00Z'))).toBe(
      '2026-11-04'
    );
    expect(getKoreaDateKey(new Date('2026-11-04T15:00:00Z'))).toBe(
      '2026-11-05'
    );
  });

  test('기기 시간대가 달라도 기준 날짜는 한국 날짜이고 자정이 지나면 바뀐다', () => {
    expect(getKoreaDateKey(new Date('2026-03-01T23:59:30+09:00'))).toBe(
      '2026-03-01'
    );
    expect(getKoreaDateKey(new Date('2026-03-02T00:00:30+09:00'))).toBe(
      '2026-03-02'
    );
    // LA 시각으로는 아직 3월 1일이어도 한국 날짜를 따른다
    expect(getKoreaDateKey(new Date('2026-03-02T07:00:30Z'))).toBe(
      '2026-03-02'
    );
  });
});
