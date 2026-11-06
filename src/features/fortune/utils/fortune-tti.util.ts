import {
  FORTUNE_ZODIAC,
  FORTUNE_ZODIAC_BASE_OFFSET,
  FORTUNE_ZODIAC_CYCLE,
} from '@/features/fortune/constants/fortune-zodiac.constant';
import type {
  FortuneClockTimeType,
  FortuneDetermineType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { compareYmd } from '@/features/fortune/utils/fortune-date.util';
import { getSeollalDate } from '@/features/fortune/utils/fortune-lunar.util';
import {
  compareDateToSolarTerm,
  getSolarTermTime,
  isClockOnOrAfterSolarTerm,
  toSolarTermBoundary,
} from '@/features/fortune/utils/fortune-solar-term.util';

/** 절기 인덱스 2 = 입춘 */
const LICHUN_TERM_INDEX = 2;

/** 연도 → 띠. ((y - 4) mod 12), 0 = 쥐. 표가 필요 없어 범위 제한 없음 */
export function getTtiKeyByYear(year: number): FortuneTtiKeyType {
  const index =
    (((year - FORTUNE_ZODIAC_BASE_OFFSET) % FORTUNE_ZODIAC_CYCLE) +
      FORTUNE_ZODIAC_CYCLE) %
    FORTUNE_ZODIAC_CYCLE;
  return FORTUNE_ZODIAC[index].key;
}

/**
 * 입춘 시각 기준. 입춘이 드는 날이면 need-time(before = 전년도 띠, after = 그해 띠).
 * 그해 절기 표가 없으면 unsupported
 */
export function determineFortuneTti(
  solar: FortuneYmdType
): FortuneDetermineType<FortuneTtiKeyType> {
  const lichun = getSolarTermTime(solar.year, LICHUN_TERM_INDEX);
  if (!lichun) {
    return { kind: 'unsupported' };
  }
  const beforeKey = getTtiKeyByYear(solar.year - 1);
  const afterKey = getTtiKeyByYear(solar.year);
  const relation = compareDateToSolarTerm(solar, lichun);
  if (relation === 'same-day') {
    return {
      kind: 'need-time',
      before: beforeKey,
      after: afterKey,
      boundary: toSolarTermBoundary(lichun),
    };
  }
  return { kind: 'single', key: relation === 'before' ? beforeKey : afterKey };
}

/**
 * need-time 상태에서 시각을 넣었을 때. 입춘 시각(시:분) 이상이면 그해 띠.
 * 입춘 날이 아닌 날짜면 날짜만으로 정한다. 절기 표 범위 밖 연도는 RangeError
 * (determineFortuneTti가 unsupported를 먼저 돌려주므로 정상 흐름에서는 오지 않는다)
 */
export function resolveFortuneTtiWithTime(
  solar: FortuneYmdType,
  time: FortuneClockTimeType
): FortuneTtiKeyType {
  const lichun = getSolarTermTime(solar.year, LICHUN_TERM_INDEX);
  if (!lichun) {
    throw new RangeError('절기 표 범위 밖 연도입니다.');
  }
  const relation = compareDateToSolarTerm(solar, lichun);
  const isAfter =
    relation === 'same-day'
      ? isClockOnOrAfterSolarTerm(time, lichun)
      : relation === 'after';
  return getTtiKeyByYear(isAfter ? solar.year : solar.year - 1);
}

/**
 * 설날 기준 띠. 날짜만 본다(설날 0시부터 새해).
 * 음력 표 범위(1919~2049) 밖 연도는 RangeError
 */
export function getSeollalTti(solar: FortuneYmdType): FortuneTtiKeyType {
  const isBeforeSeollal = compareYmd(solar, getSeollalDate(solar.year)) < 0;
  return getTtiKeyByYear(isBeforeSeollal ? solar.year - 1 : solar.year);
}
