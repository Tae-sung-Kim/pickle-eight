import { CalendarDays } from 'lucide-react';
import type { JSX } from 'react';
import type {
  FortuneBirthInputType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';

// 확인 줄 문구 조각. ui-ux-design.md "입력"의 형식과 AC-85의 "(윤달)" 표시. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const LUNAR_CONFIRM_TEXTS = {
  lunarPrefix: '음력',
  solarPrefix: '양력',
  leapSuffix: '(윤달)',
} as const;

export type FortuneLunarConfirmComponentPropsType = Readonly<{
  /** 음력으로 입력한 연·월·일과 윤달 여부 */
  lunar: Pick<FortuneBirthInputType, 'year' | 'month' | 'day' | 'isLeapMonth'>;
  /** 변환된 양력 날짜(resolveFortuneBirth 결과) */
  solar: FortuneYmdType;
}>;

function formatYmd(ymd: FortuneYmdType): string {
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일`;
}

/**
 * 음력 확인 줄: "음력 ○년 ○월 ○일 → 양력 ○년 ○월 ○일", 윤달이면 음력 날짜 뒤에 "(윤달)".
 * 음력으로 입력해 결과가 나온 경우에만 부모가 그린다. 값은 props로만 받는다.
 */
export function FortuneLunarConfirmComponent({
  lunar,
  solar,
}: FortuneLunarConfirmComponentPropsType): JSX.Element {
  const leapSuffix = lunar.isLeapMonth ? LUNAR_CONFIRM_TEXTS.leapSuffix : '';

  return (
    <p className="flex items-start gap-2 text-sm leading-6 break-keep text-foreground tabular-nums">
      <CalendarDays aria-hidden="true" className="mt-1 size-4 shrink-0" />
      <span>
        {`${LUNAR_CONFIRM_TEXTS.lunarPrefix} ${formatYmd(lunar)}${leapSuffix} → ${LUNAR_CONFIRM_TEXTS.solarPrefix} ${formatYmd(solar)}`}
      </span>
    </p>
  );
}
