import { type JSX, useId } from 'react';
import {
  FORTUNE_SAJU_ELEMENTS_NOTE,
  FORTUNE_SAJU_PANEL_TEXTS,
} from '@/features/fortune/constants/fortune-saju-notice.constant';
import {
  FORTUNE_SAJU_ELEMENT_ROWS,
  FORTUNE_SAJU_SCALE_CELLS_WITH_HOUR,
  FORTUNE_SAJU_SCALE_CELLS_WITHOUT_HOUR,
} from '@/features/fortune/constants/fortune-saju-view.constant';
import type { FortuneSajuChartType } from '@/features/fortune/types/fortune-saju.type';
import { cn } from '@/lib/utils';

export type FortuneSajuElementsComponentPropsType = Readonly<{
  chart: FortuneSajuChartType;
}>;

/**
 * 오행 분포. 5행 dl(목 화 토 금 수) + 고정 칸 수 눈금(표에 보이는 글자 수: 4기둥 8칸, 3기둥 6칸).
 * 개수는 숫자가 전하고 눈금은 장식이라 aria-hidden이다. 좋고 나쁨 표현 없음, 모션 없음.
 */
export function FortuneSajuElementsComponent({
  chart,
}: FortuneSajuElementsComponentPropsType): JSX.Element {
  const titleId = useId();
  const cellCount = chart.hour
    ? FORTUNE_SAJU_SCALE_CELLS_WITH_HOUR
    : FORTUNE_SAJU_SCALE_CELLS_WITHOUT_HOUR;
  const cells = Array.from({ length: cellCount }, (_, cell) => cell);

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h3
        id={titleId}
        className="text-lg leading-snug font-semibold break-keep text-foreground"
      >
        {FORTUNE_SAJU_PANEL_TEXTS.elementsTitle}
      </h3>
      <dl>
        {FORTUNE_SAJU_ELEMENT_ROWS.map((row) => {
          const count = chart.elements[row.key];
          return (
            <div
              key={row.key}
              className="grid grid-cols-[2rem_1.75rem_1fr] items-center gap-x-3 py-1.5"
            >
              <dt className="text-sm font-medium text-foreground">
                {row.name}
              </dt>
              <dd className="text-lg font-bold text-foreground tabular-nums">
                {count}
              </dd>
              <dd aria-hidden="true" className="flex gap-1">
                {cells.map((cell) => (
                  <span
                    key={cell}
                    className={cn(
                      'h-3 w-4 shrink rounded-sm',
                      cell < count
                        ? 'bg-menu-fortune'
                        : 'border border-border bg-transparent'
                    )}
                  />
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {FORTUNE_SAJU_ELEMENTS_NOTE}
      </p>
    </section>
  );
}
