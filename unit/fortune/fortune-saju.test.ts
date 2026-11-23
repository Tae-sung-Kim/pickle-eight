import { describe, expect, test } from 'vitest';
import { FORTUNE_SOLAR_TERM_TABLE } from '@/features/fortune/constants/calendar/solar-term-table.constant';
import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_STEMS,
} from '@/features/fortune/constants/fortune-saju.constant';
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
import {
  compareYmd,
  fromJulianDayNumber,
  parseDateKey,
  toJulianDayNumber,
} from '@/features/fortune/utils/fortune-date.util';
import {
  convertLunarToSolar,
  getLunarLeapMonth,
  getLunarMonthLength,
} from '@/features/fortune/utils/fortune-lunar.util';
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
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import { getKoreaDateKey } from '@/lib/date';
import { readSourceFiles } from '../helpers/source-scan.util';

const TEN_GOD_KEY_TO_NAME: Readonly<Record<string, string>> = {
  bigyeon: '비견',
  geopjae: '겁재',
  siksin: '식신',
  sanggwan: '상관',
  pyeonjae: '편재',
  jeongjae: '정재',
  pyeongwan: '편관',
  jeonggwan: '정관',
  pyeonin: '편인',
  jeongin: '정인',
};

/** 천간 10자의 오행·음양으로 십신 기대값을 앱 코드와 따로 계산한다 (갑을 목, 병정 화, 무기 토, 경신 금, 임계 수) */
const STEMS = '갑을병정무기경신임계';
const STEM_ELEMENT_INDEX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const TEN_GOD_NAMES: ReadonlyArray<readonly [string, string]> = [
  ['비견', '겁재'],
  ['식신', '상관'],
  ['편재', '정재'],
  ['편관', '정관'],
  ['편인', '정인'],
];

function expectedTenGod(myStem: string, otherStem: string): string {
  const my = STEMS.indexOf(myStem);
  const other = STEMS.indexOf(otherStem);
  const samePolarity = my % 2 === other % 2;
  const diff = (STEM_ELEMENT_INDEX[other] - STEM_ELEMENT_INDEX[my] + 5) % 5;
  return TEN_GOD_NAMES[diff][samePolarity ? 0 : 1];
}

function todayPillarName(now: Date): string {
  const today = parseDateKey(getKoreaDateKey(now));
  if (!today) {
    throw new Error('날짜 키 오류');
  }
  return pn(getDayPillar(today));
}

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
function _personalSeed(birth: FortuneYmdType, todayKey: string): string {
  return `fortune-v1|personal|${toKey(birth)}|${todayKey}`;
}

function _ttiSeed(key: FortuneTtiKeyType, todayKey: string): string {
  return `fortune-v1|tti|${key}|${todayKey}`;
}

function _starSignSeed(key: FortuneStarSignKeyType, todayKey: string): string {
  return `fortune-v1|star-sign|${key}|${todayKey}`;
}

function _expectError(
  result: FortuneBirthResolvedType,
  error: FortuneBirthErrorType
): void {
  expect(result).toEqual({ ok: false, error });
}

function _expectSolar(
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
function _findLunarInput(solar: FortuneYmdType): LunarInputType | null {
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

const _TODAY_AC = ymd(2026, 11, 5);

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

describe('SJ-QA1 사주 계산', () => {
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

  test('AC-91: 1920-01-01 00:30과 2028-12-31 23:30은 결과가 나온다 (자월, 시주 포함)', () => {
    const first = chartOf(ymd(1920, 1, 1), { hour: 0, minute: 30 });
    expect(pn(first.month).endsWith('자')).toBe(true);
    expect(first.hour).not.toBeNull();
    const last = chartOf(ymd(2028, 12, 31), { hour: 23, minute: 30 });
    expect(last.hour).not.toBeNull();
  });

  test('AC-50: 2000-01-01(시간 모름)은 일주 무오, 연주 기묘이고 2000-02-10은 연주 경진이다', () => {
    const a = chartOf(ymd(2000, 1, 1), null);
    expect(pn(a.day)).toBe('무오');
    expect(pn(a.year)).toBe('기묘');
    expect(a.hour).toBeNull();
    expect(pn(chartOf(ymd(2000, 2, 10), null).year)).toBe('경진');
  });

  test('AC-51: 2025-02-03 23:09는 연주 갑진, 23:30은 연주 을사이고 일주 계묘·시주 갑자는 같다', () => {
    const early = chartOf(ymd(2025, 2, 3), { hour: 23, minute: 9 });
    expect([pn(early.year), pn(early.day), pn(early.hour)]).toEqual([
      '갑진',
      '계묘',
      '갑자',
    ]);
    const late = chartOf(ymd(2025, 2, 3), { hour: 23, minute: 30 });
    expect([pn(late.year), pn(late.day), pn(late.hour)]).toEqual([
      '을사',
      '계묘',
      '갑자',
    ]);
  });

  test('AC-54: 오늘 일진은 한국 시간 자정에 바뀐다 (2026-11-05 23:59 계미, 2026-11-06 00:00 갑신)', () => {
    expect(todayPillarName(new Date('2026-11-05T23:59:00+09:00'))).toBe('계미');
    expect(todayPillarName(new Date('2026-11-06T00:00:00+09:00'))).toBe('갑신');
  });

  test('AC-54: 접속 시각이 23시대여도 그날 일진을 쓰고(2026-11-05 23:30 계미), UTC 자정 전후로도 한국 날짜를 따른다', () => {
    expect(todayPillarName(new Date('2026-11-05T23:30:00+09:00'))).toBe('계미');
    // 2026-11-05 15:30 UTC = 2026-11-06 00:30 KST
    expect(todayPillarName(new Date('2026-11-05T15:30:00Z'))).toBe('갑신');
  });

  test('AC-54: 같은 일간·같은 날이면 십신이 같고, 태어난 시각은 일간과 십신에 영향이 없고 시주만 달라진다', () => {
    const todayStem = getDayPillar(ymd(2026, 11, 5)).stem;
    // 10일 차이는 일간이 같다
    const a = chartOf(ymd(1990, 6, 15), null);
    const b = chartOf(ymd(1990, 6, 25), null);
    expect(b.day.stem).toBe(a.day.stem);
    expect(getFortuneTenGod(b.day.stem, todayStem)).toBe(
      getFortuneTenGod(a.day.stem, todayStem)
    );
    // 같은 날 12:00과 23:30: 일주·십신은 같고 시주만 다르다
    const noon = chartOf(ymd(1990, 6, 15), { hour: 12, minute: 0 });
    const night = chartOf(ymd(1990, 6, 15), { hour: 23, minute: 30 });
    expect(night.day).toEqual(noon.day);
    expect(pn(night.hour)).not.toBe(pn(noon.hour));
    expect(getFortuneTenGod(night.day.stem, todayStem)).toBe(
      getFortuneTenGod(noon.day.stem, todayStem)
    );
  });

  test('AC-55: 십신은 일간과 오늘 일진 천간의 오행 관계·음양 일치 표와 같다 (열 가지 일간 전부)', () => {
    const todayStem = getDayPillar(ymd(2026, 11, 5)).stem;
    const seen = new Set<string>();
    const stems = new Set<number>();
    for (let day = 10; day <= 19; day += 1) {
      const chart = chartOf(ymd(2000, 3, day), null);
      const name =
        TEN_GOD_KEY_TO_NAME[getFortuneTenGod(chart.day.stem, todayStem)];
      expect(name, `3월 ${day}일 십신`).toBe(
        expectedTenGod(
          FORTUNE_SAJU_STEMS[chart.day.stem].ko,
          FORTUNE_SAJU_STEMS[todayStem].ko
        )
      );
      seen.add(name);
      stems.add(chart.day.stem);
    }
    expect(stems.size).toBe(10);
    expect(seen.size).toBe(10);
  });

  test('AC-56: 2026-11-06 22:59는 시주 을해, 23:00·23:30·23:59는 일주 갑신·시주 병자(갑자 아님)이다', () => {
    const p = chartOf(ymd(2026, 11, 6), { hour: 22, minute: 59 });
    expect([pn(p.day), pn(p.hour)]).toEqual(['갑신', '을해']);
    for (const [hour, minute] of [
      [23, 0],
      [23, 30],
      [23, 59],
    ]) {
      const r = chartOf(ymd(2026, 11, 6), { hour, minute });
      expect([pn(r.day), pn(r.hour)], `${hour}:${minute}`).toEqual([
        '갑신',
        '병자',
      ]);
    }
  });

  test('AC-56: 2026-11-07 00:00·00:30은 일주 을유·시주 병자, 01:00은 시주 정축이고 11-06 23:30과 시주는 같지만 일주는 다르다', () => {
    for (const minute of [0, 30]) {
      const r = chartOf(ymd(2026, 11, 7), { hour: 0, minute });
      expect([pn(r.day), pn(r.hour)]).toEqual(['을유', '병자']);
    }
    const one = chartOf(ymd(2026, 11, 7), { hour: 1, minute: 0 });
    expect(pn(one.hour)).toBe('정축');
    const after = chartOf(ymd(2026, 11, 7), { hour: 0, minute: 30 });
    const before = chartOf(ymd(2026, 11, 6), { hour: 23, minute: 30 });
    expect(pn(before.hour)).toBe(pn(after.hour));
    expect(pn(before.day)).not.toBe(pn(after.day));
  });

  test('AC-56: 1999-12-31 23:30은 일주 정사·시주 임자, 2000-01-01 00:30은 일주 무오·시주 임자이다', () => {
    const a = chartOf(ymd(1999, 12, 31), { hour: 23, minute: 30 });
    expect([pn(a.day), pn(a.hour)]).toEqual(['정사', '임자']);
    const b = chartOf(ymd(2000, 1, 1), { hour: 0, minute: 30 });
    expect([pn(b.day), pn(b.hour)]).toEqual(['무오', '임자']);
  });

  test('AC-57: 시간 모름이면 해당 연도여도 표준시 안내가 없다', () => {
    expect(shouldShowFortuneDstNotice(1988, false)).toBe(false);
    expect(chartOf(ymd(1988, 7, 15), null).hour).toBeNull();
  });

  test('AC-57: 시각을 보정하지 않는다 (1988-07-15, 1989-07-15 00:30은 시지 자이고 일주는 시간 모름과 같다)', () => {
    const unknown = chartOf(ymd(1988, 7, 15), null);
    const timed = chartOf(ymd(1988, 7, 15), { hour: 0, minute: 30 });
    expect(pn(timed.hour).endsWith('자')).toBe(true);
    expect(timed.day).toEqual(unknown.day);
    expect(shouldShowFortuneDstNotice(1988, true)).toBe(true);
    const later = chartOf(ymd(1989, 7, 15), { hour: 0, minute: 30 });
    expect(pn(later.hour).endsWith('자')).toBe(true);
    expect(shouldShowFortuneDstNotice(1989, true)).toBe(false);
  });

  test('AC-57: 음력 입력은 환산한 양력 연도로 판단한다 (음력 1986-12-20은 양력 1987년이라 안내가 나온다)', () => {
    const converted = convertLunarToSolar(1986, 12, 20, false);
    expect(converted.ok).toBe(true);
    if (!converted.ok) return;
    expect(converted.solar.year).toBe(1987);
    expect(shouldShowFortuneDstNotice(converted.solar.year, true)).toBe(true);
  });

  test('AC-54: 사주 기본 점수 변동 폭 상수는 30(SQ-2 안 A)', () => {
    const file = readSourceFiles(['.ts']).find((f) =>
      f.path.endsWith('src/features/fortune/utils/fortune-reading.util.ts')
    );
    expect(file).toBeDefined();
    expect(file?.content).toMatch(/BASE_SCORE_SPREAD\s*=\s*30/);
  });
});
