import { FORTUNE_SOLAR_TERM_TABLE } from '@/features/fortune/constants/calendar/solar-term-table.constant';
import type {
  FortuneClockTimeType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import type { FortuneSolarTermIndexType } from '@/features/fortune/types/fortune-calendar.type';

/** 절기가 드는 시각(KST 시계, 연도는 조회한 연도). 시각은 분 단위다 */
export type FortuneSolarTermTimeType = Readonly<{
  month: number;
  day: number;
  hour: number;
  minute: number;
}>;

/** 날짜만 비교한 결과. same-day면 시각을 물어야 한다 */
export type FortuneSolarTermDayRelationType = 'before' | 'same-day' | 'after';

const TERM_COUNT = 24;
const MMDD_DIVISOR = 10000;
const MINUTES_PER_HOUR = 60;

/**
 * 그해 절기 시각. 표에 없는 연도이거나 인덱스가 0~23이 아니면 null (예외를 던지지 않는다).
 * 표 값 = 월일 * 10000 + 시분
 */
export function getSolarTermTime(
  year: number,
  index: FortuneSolarTermIndexType
): FortuneSolarTermTimeType | null {
  if (!Number.isInteger(year) || !Number.isInteger(index)) {
    return null;
  }
  if (index < 0 || index >= TERM_COUNT) {
    return null;
  }
  const row = FORTUNE_SOLAR_TERM_TABLE[year];
  const value = row?.[index];
  if (value === undefined) {
    return null;
  }
  const monthDay = Math.floor(value / MMDD_DIVISOR);
  const hourMinute = value % MMDD_DIVISOR;
  return {
    month: Math.floor(monthDay / 100),
    day: monthDay % 100,
    hour: Math.floor(hourMinute / 100),
    minute: hourMinute % 100,
  };
}

/** 양력 날짜가 절기 날짜보다 앞인지, 같은 날인지, 뒤인지(날짜만 본다). 절기는 solar.year의 것 */
export function compareDateToSolarTerm(
  solar: FortuneYmdType,
  term: FortuneSolarTermTimeType
): FortuneSolarTermDayRelationType {
  if (solar.month !== term.month) {
    return solar.month < term.month ? 'before' : 'after';
  }
  if (solar.day !== term.day) {
    return solar.day < term.day ? 'before' : 'after';
  }
  return 'same-day';
}

/** 경계일에 시각을 물을 때 쓰는 값 */
export function toSolarTermBoundary(
  term: FortuneSolarTermTimeType
): FortuneClockTimeType {
  return { hour: term.hour, minute: term.minute };
}

/** 분 단위 비교: 출생 시각(시:분) >= 절기 시각(시:분)이면 절기 이후(초는 다루지 않는다) */
export function isClockOnOrAfterSolarTerm(
  time: FortuneClockTimeType,
  term: FortuneSolarTermTimeType
): boolean {
  return (
    time.hour * MINUTES_PER_HOUR + time.minute >=
    term.hour * MINUTES_PER_HOUR + term.minute
  );
}
