import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import type {
  FortuneClockTimeType,
  FortuneDetermineType,
  FortuneStarSignKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  compareDateToSolarTerm,
  getSolarTermTime,
  isClockOnOrAfterSolarTerm,
  toSolarTermBoundary,
} from '@/features/fortune/utils/fortune-solar-term.util';

/** 시작 중기(절기 인덱스) 오름차순. 한 해 안에서 날짜 순서와 같다 */
const SIGNS_BY_TERM_ORDER = [...FORTUNE_STAR_SIGNS].sort(
  (a, b) => a.startTermIndex - b.startTermIndex
);

/** 그해 첫 중기(대한) 전 구간. 전년도 동지(마지막 중기)에 시작한 별자리가 이어진다 */
const SIGN_BEFORE_FIRST_TERM =
  SIGNS_BY_TERM_ORDER[SIGNS_BY_TERM_ORDER.length - 1].key;

/**
 * 그해 중기 시각으로 구간을 찾는다. 1월 대한 전은 전년도 동지 이후 = 염소자리(1919년 표 불필요).
 * 중기 날짜와 같으면 need-time. 그해 절기 표가 없으면 unsupported
 */
export function determineFortuneStarSign(
  solar: FortuneYmdType
): FortuneDetermineType<FortuneStarSignKeyType> {
  let current: FortuneStarSignKeyType = SIGN_BEFORE_FIRST_TERM;
  for (const sign of SIGNS_BY_TERM_ORDER) {
    const term = getSolarTermTime(solar.year, sign.startTermIndex);
    if (!term) {
      return { kind: 'unsupported' };
    }
    const relation = compareDateToSolarTerm(solar, term);
    if (relation === 'before') {
      break;
    }
    if (relation === 'same-day') {
      return {
        kind: 'need-time',
        before: current,
        after: sign.key,
        boundary: toSolarTermBoundary(term),
      };
    }
    current = sign.key;
  }
  return { kind: 'single', key: current };
}

/**
 * need-time 상태에서 시각을 넣었을 때. 중기 시각(시:분) 이상이면 새 별자리.
 * 경계일이 아니면 날짜만으로 정한다. 절기 표 범위 밖 연도는 RangeError
 * (determineFortuneStarSign이 unsupported를 먼저 돌려주므로 정상 흐름에서는 오지 않는다)
 */
export function resolveFortuneStarSignWithTime(
  solar: FortuneYmdType,
  time: FortuneClockTimeType
): FortuneStarSignKeyType {
  const result = determineFortuneStarSign(solar);
  if (result.kind === 'single') {
    return result.key;
  }
  if (result.kind === 'unsupported') {
    throw new RangeError('절기 표 범위 밖 연도입니다.');
  }
  const term = getSolarTermTime(
    solar.year,
    SIGNS_BY_TERM_ORDER.find((sign) => sign.key === result.after)
      ?.startTermIndex ?? -1
  );
  if (!term) {
    throw new RangeError('절기 표 범위 밖 연도입니다.');
  }
  return isClockOnOrAfterSolarTerm(time, term) ? result.after : result.before;
}
