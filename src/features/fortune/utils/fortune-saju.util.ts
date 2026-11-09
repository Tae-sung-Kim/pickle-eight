import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_DST_NOTICE_YEARS,
  FORTUNE_SAJU_STEMS,
} from '@/features/fortune/constants/fortune-saju.constant';
import type {
  FortuneClockTimeType,
  FortuneElementType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import type {
  FortuneLateZiStemBasisType,
  FortunePillarType,
  FortuneSajuBoundaryType,
  FortuneSajuChartsResultType,
  FortuneSajuChartType,
  FortuneTenGodKeyType,
} from '@/features/fortune/types/fortune-saju.type';
import { toJulianDayNumber } from '@/features/fortune/utils/fortune-date.util';
import {
  compareDateToSolarTerm,
  getSolarTermTime,
  isClockOnOrAfterSolarTerm,
  toSolarTermBoundary,
} from '@/features/fortune/utils/fortune-solar-term.util';

const STEM_COUNT = 10;
const BRANCH_COUNT = 12;
const CYCLE = 60;
const DAY_PILLAR_OFFSET = 49;
const YEAR_PILLAR_OFFSET = 4;
const LI_CHUN_INDEX = 2;
/** 짝수 인덱스 절기(소한, 입춘, 경칩 … 대설). 월이 바뀌는 절기다 */
const MONTH_TERM_INDEXES: readonly number[] = [
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
];
const LAST_MONTH_TERM_INDEX = 22; // 대설 = 자월 시작
const HOUR_NEXT_DAY_START = 23;
const HOURS_PER_BRANCH = 2;
const HOURS_PER_DAY = 24;
const ELEMENT_GROUP = 5;
const MONTH_FIRST_BRANCH = 2; // 인월

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function toPillar(cycleIndex: number): FortunePillarType {
  return {
    stem: mod(cycleIndex, STEM_COUNT),
    branch: mod(cycleIndex, BRANCH_COUNT),
  };
}

/** (JDN + 49) mod 60. 절기 표를 쓰지 않는다(2029년 이후 오늘에도 동작) */
export function getDayPillar(solar: FortuneYmdType): FortunePillarType {
  return toPillar(mod(toJulianDayNumber(solar) + DAY_PILLAR_OFFSET, CYCLE));
}

/** (y - 4) mod 60. adjustedYear는 입춘 기준 연도 */
export function getYearPillar(adjustedYear: number): FortunePillarType {
  return toPillar(mod(adjustedYear - YEAR_PILLAR_OFFSET, CYCLE));
}

/** 오호둔. monthBranch 2(인)~1(축) */
export function getMonthPillar(
  yearStem: number,
  monthBranch: number
): FortunePillarType {
  const firstStem = (mod(yearStem, ELEMENT_GROUP) * 2 + 2) % STEM_COUNT;
  const offset = mod(monthBranch - MONTH_FIRST_BRANCH, BRANCH_COUNT);
  return {
    stem: (firstStem + offset) % STEM_COUNT,
    branch: mod(monthBranch, BRANCH_COUNT),
  };
}

/** 시계 시각 기준. 23:00~00:59 자(0), 01:00~02:59 축(1) … */
export function getHourBranch(time: FortuneClockTimeType): number {
  return Math.floor(((time.hour + 1) % HOURS_PER_DAY) / HOURS_PER_BRANCH);
}

/**
 * 오서둔. 23시대이고 basis가 'next-day'이면 기준 일간 = (dayStem + 1) % 10.
 * 그 밖은 dayStem
 */
export function getHourPillar(
  dayStem: number,
  time: FortuneClockTimeType,
  basis: FortuneLateZiStemBasisType
): FortunePillarType {
  const branch = getHourBranch(time);
  const baseStem =
    time.hour === HOUR_NEXT_DAY_START && basis === 'next-day'
      ? (dayStem + 1) % STEM_COUNT
      : dayStem;
  return {
    stem: (mod(baseStem, ELEMENT_GROUP) * 2 + branch) % STEM_COUNT,
    branch,
  };
}

/** 그날 짝수 인덱스 절기가 드는 날이면 경계 정보, 아니면 null. 그해 표가 없으면 undefined */
export function getFortuneSajuBoundary(
  solar: FortuneYmdType
): FortuneSajuBoundaryType | null | undefined {
  for (const termIndex of MONTH_TERM_INDEXES) {
    const term = getSolarTermTime(solar.year, termIndex);
    if (!term) {
      return undefined;
    }
    if (compareDateToSolarTerm(solar, term) === 'same-day') {
      return {
        kind: termIndex === LI_CHUN_INDEX ? 'year' : 'month',
        termIndex,
        time: toSolarTermBoundary(term),
      };
    }
  }
  return null;
}

/**
 * 해당 일자·시각에서 월 절기 이후인지. 경계일이면 afterOnBoundary 또는 시각 비교로 정한다.
 * 시각도 없고 afterOnBoundary도 없으면 절기 전으로 본다(호출부가 경계일 + 시간 모름을 먼저 나눈다)
 */
function isAfterTerm(
  solar: FortuneYmdType,
  termIndex: number,
  time: FortuneClockTimeType | null,
  afterOnBoundary: boolean | null
): boolean | null {
  const term = getSolarTermTime(solar.year, termIndex);
  if (!term) {
    return null;
  }
  const relation = compareDateToSolarTerm(solar, term);
  if (relation !== 'same-day') {
    return relation === 'after';
  }
  if (afterOnBoundary !== null) {
    return afterOnBoundary;
  }
  return time ? isClockOnOrAfterSolarTerm(time, term) : false;
}

function buildChart(
  solar: FortuneYmdType,
  time: FortuneClockTimeType | null,
  basis: FortuneLateZiStemBasisType,
  afterOnBoundary: boolean | null
): FortuneSajuChartType | null {
  const afterLiChun = isAfterTerm(solar, LI_CHUN_INDEX, time, afterOnBoundary);
  if (afterLiChun === null) {
    return null;
  }
  const adjustedYear = afterLiChun ? solar.year : solar.year - 1;

  // 월지: 이미 지난 짝수 절기 중 가장 늦은 것. 소한 이전이면 전년도 대설(자월)이고 전년도 표는 필요 없다
  let monthTermIndex = LAST_MONTH_TERM_INDEX;
  for (let i = MONTH_TERM_INDEXES.length - 1; i >= 0; i -= 1) {
    const termIndex = MONTH_TERM_INDEXES[i];
    const after = isAfterTerm(solar, termIndex, time, afterOnBoundary);
    if (after === null) {
      return null;
    }
    if (after) {
      monthTermIndex = termIndex;
      break;
    }
  }
  const monthBranch = (monthTermIndex / 2 + 1) % BRANCH_COUNT;

  const year = getYearPillar(adjustedYear);
  const month = getMonthPillar(year.stem, monthBranch);
  const day = getDayPillar(solar);
  const hour = time ? getHourPillar(day.stem, time, basis) : null;
  const base = { year, month, day, hour };
  return { ...base, elements: countFortuneElements(base) };
}

/** 시간이 있으면 single, 경계일 + 시간 모름이면 need-choice, 표 없음이면 unsupported */
export function buildFortuneSajuCharts(
  solar: FortuneYmdType,
  time: FortuneClockTimeType | null,
  basis: FortuneLateZiStemBasisType
): FortuneSajuChartsResultType {
  const boundary = getFortuneSajuBoundary(solar);
  if (boundary === undefined) {
    return { kind: 'unsupported' };
  }
  if (boundary !== null && time === null) {
    const before = buildChart(solar, null, basis, false);
    const after = buildChart(solar, null, basis, true);
    if (!before || !after) {
      return { kind: 'unsupported' };
    }
    return { kind: 'need-choice', boundary, charts: [before, after] };
  }
  const chart = buildChart(solar, time, basis, null);
  return chart ? { kind: 'single', chart } : { kind: 'unsupported' };
}

// 천간 인덱스 / 2 = 오행 순서(목 화 토 금 수). 상생 순서이고 +2가 상극이다
const TEN_GOD_PAIRS: readonly (readonly [
  FortuneTenGodKeyType,
  FortuneTenGodKeyType,
])[] = [
  ['bigyeon', 'geopjae'], // 같은 오행
  ['siksin', 'sanggwan'], // 일간이 생
  ['pyeonjae', 'jeongjae'], // 일간이 극
  ['pyeongwan', 'jeonggwan'], // 일간을 극
  ['pyeonin', 'jeongin'], // 일간을 생
];

/** 천간끼리. 음양이 같으면 앞쪽(비견·식신·편재·편관·편인) */
export function getFortuneTenGod(
  dayStem: number,
  targetStem: number
): FortuneTenGodKeyType {
  const dayElement = Math.floor(mod(dayStem, STEM_COUNT) / 2);
  const targetElement = Math.floor(mod(targetStem, STEM_COUNT) / 2);
  const relation = mod(targetElement - dayElement, ELEMENT_GROUP);
  const samePolarity = mod(dayStem, 2) === mod(targetStem, 2);
  return TEN_GOD_PAIRS[relation][samePolarity ? 0 : 1];
}

/** 표에 보이는 글자(8자 또는 6자)의 오행 개수. 지지는 본래 오행으로 센다 */
export function countFortuneElements(
  chart: Omit<FortuneSajuChartType, 'elements'>
): Readonly<Record<FortuneElementType, number>> {
  const counts: Record<FortuneElementType, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  for (const pillar of [chart.year, chart.month, chart.day, chart.hour]) {
    if (!pillar) {
      continue;
    }
    counts[FORTUNE_SAJU_STEMS[pillar.stem].element] += 1;
    counts[FORTUNE_SAJU_BRANCHES[pillar.branch].element] += 1;
  }
  return counts;
}

/** 출생 연도가 안내 대상이고 시간을 넣었으면 true */
export function shouldShowFortuneDstNotice(
  solarYear: number,
  hasTime: boolean
): boolean {
  return hasTime && FORTUNE_SAJU_DST_NOTICE_YEARS.includes(solarYear);
}
