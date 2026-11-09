import type { JSX } from 'react';

import {
  FORTUNE_CALC_BASIS_STAR_SIGN,
  FORTUNE_CALC_BASIS_TTI,
  FORTUNE_DST_NOTICE,
  FORTUNE_SUPPORTED_RANGE_NOTICE,
  FORTUNE_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import {
  FORTUNE_SAJU_CALC_BASIS_DAY_HOUR,
  FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION,
  FORTUNE_SAJU_CALC_BASIS_PILLARS,
  FORTUNE_SAJU_CALC_BASIS_SCHOOLS,
  FORTUNE_SAJU_CALC_BASIS_STATEMENT,
  FORTUNE_SAJU_CALC_BASIS_ZI_START,
  FORTUNE_SAJU_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-saju-notice.constant';

// 제목 라벨. 운세 상수 파일에는 아직 없어 이 파일에 둔다(ui-ux-design.md "계산 기준")
const FORTUNE_CALC_BASIS_TITLE = '계산 기준';

export type FortuneCalcBasisItemKeyType =
  | 'tti'
  | 'star-sign'
  | 'time-unknown'
  | 'dst'
  // 사주(설계 V3.1)
  | 'saju-pillars'
  | 'saju-day-hour'
  | 'saju-schools'
  | 'saju-zi-start'
  | 'saju-no-correction'
  | 'saju-time-unknown'
  | 'saju-statement';

const ITEM_TEXTS: Record<FortuneCalcBasisItemKeyType, string> = {
  tti: FORTUNE_CALC_BASIS_TTI,
  'star-sign': FORTUNE_CALC_BASIS_STAR_SIGN,
  'time-unknown': FORTUNE_TIME_UNKNOWN_NOTICE,
  dst: FORTUNE_DST_NOTICE,
  'saju-pillars': FORTUNE_SAJU_CALC_BASIS_PILLARS,
  'saju-day-hour': FORTUNE_SAJU_CALC_BASIS_DAY_HOUR,
  'saju-schools': FORTUNE_SAJU_CALC_BASIS_SCHOOLS,
  'saju-zi-start': FORTUNE_SAJU_CALC_BASIS_ZI_START,
  'saju-no-correction': FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION,
  'saju-time-unknown': FORTUNE_SAJU_TIME_UNKNOWN_NOTICE,
  'saju-statement': FORTUNE_SAJU_CALC_BASIS_STATEMENT,
};

export type FortuneCalcBasisComponentPropsType = {
  /** 이 페이지에 보일 항목. 배열 순서대로 그린다 */
  items: readonly FortuneCalcBasisItemKeyType[];
};

/**
 * FortuneCalcBasisComponent
 * - 계산 기준 h2 + 글머리 목록. 서버 컴포넌트.
 * - 지원 출생 연도 안내(FORTUNE_MIN_BIRTH~FORTUNE_MAX_BIRTH로 만든 상수)는 항상 마지막 항목이다.
 */
export function FortuneCalcBasisComponent({
  items,
}: FortuneCalcBasisComponentPropsType): JSX.Element {
  return (
    <section className="space-y-3">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {FORTUNE_CALC_BASIS_TITLE}
      </h2>
      <ul className="max-w-[68ch] list-disc space-y-1 pl-5 text-sm leading-7 text-foreground">
        {items.map((key) => (
          <li key={key}>{ITEM_TEXTS[key]}</li>
        ))}
        <li>{FORTUNE_SUPPORTED_RANGE_NOTICE}</li>
      </ul>
    </section>
  );
}
