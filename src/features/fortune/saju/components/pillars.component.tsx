import type { JSX } from 'react';
import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_STEMS,
} from '@/features/fortune/constants/fortune-saju.constant';
import { FORTUNE_SAJU_PANEL_TEXTS } from '@/features/fortune/constants/fortune-saju-notice.constant';
import type {
  FortunePillarType,
  FortuneSajuChartType,
} from '@/features/fortune/types/fortune-saju.type';
import { cn } from '@/lib/utils';

const CELL_CLASS =
  'border border-border bg-background p-2 text-center align-middle sm:p-3';
const DAY_STEM_CELL_CLASS = 'border-2 border-menu-fortune';
const COLUMN_HEAD_CLASS =
  'border border-border p-2 text-center text-xs font-normal text-muted-foreground';
const ROW_HEAD_CLASS =
  'border border-border p-2 text-center text-xs font-normal text-muted-foreground';

type GlyphPropsType = Readonly<{ ko: string; hanja: string }>;

/** 한글 + 한자. 모바일은 한글 아래 한자, sm 이상은 같은 줄. 한자는 읽지 않는다 */
function Glyph({ ko, hanja }: GlyphPropsType): JSX.Element {
  return (
    <span className="flex flex-col items-center leading-none sm:flex-row sm:justify-center sm:gap-1">
      <span className="text-3xl font-bold text-foreground">{ko}</span>
      <span
        aria-hidden="true"
        className="text-xl font-normal text-muted-foreground"
      >
        {hanja}
      </span>
    </span>
  );
}

export type FortuneSajuPillarsComponentPropsType = Readonly<{
  chart: FortuneSajuChartType;
}>;

/**
 * 연·월·일·시 기둥 표. 열 순서는 연주 → 월주 → 일주 → 시주, 행은 천간 → 지지.
 * 일간(일주 천간)은 굵은 테두리와 "일간" 글자로 알린다. 시간 모름이면 시주 두 칸을 합친 점선 칸을 둔다.
 * 모션 없음(UD-1).
 */
export function FortuneSajuPillarsComponent({
  chart,
}: FortuneSajuPillarsComponentPropsType): JSX.Element {
  const columns: ReadonlyArray<
    Readonly<{ label: string; pillar: FortunePillarType | null }>
  > = [
    { label: FORTUNE_SAJU_PANEL_TEXTS.pillarYearLabel, pillar: chart.year },
    { label: FORTUNE_SAJU_PANEL_TEXTS.pillarMonthLabel, pillar: chart.month },
    { label: FORTUNE_SAJU_PANEL_TEXTS.pillarDayLabel, pillar: chart.day },
    { label: FORTUNE_SAJU_PANEL_TEXTS.pillarHourLabel, pillar: chart.hour },
  ];

  return (
    <table className="w-full max-w-lg table-fixed border-collapse">
      <caption className="sr-only">
        {FORTUNE_SAJU_PANEL_TEXTS.pillarsTitle}
      </caption>
      <colgroup>
        <col className="w-12" />
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <td className="p-2" />
          {columns.map((column) => (
            <th key={column.label} scope="col" className={COLUMN_HEAD_CLASS}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" className={ROW_HEAD_CLASS}>
            {FORTUNE_SAJU_PANEL_TEXTS.stemRowLabel}
          </th>
          {columns.map((column) => {
            if (!column.pillar) {
              return (
                <td
                  key={column.label}
                  rowSpan={2}
                  className={cn(
                    CELL_CLASS,
                    'border-dashed text-sm leading-5 break-keep text-muted-foreground'
                  )}
                >
                  {FORTUNE_SAJU_PANEL_TEXTS.hourUnknownCell}
                </td>
              );
            }
            const stem = FORTUNE_SAJU_STEMS[column.pillar.stem];
            const isDay = column.pillar === chart.day;
            return (
              <td
                key={column.label}
                className={cn(CELL_CLASS, isDay && DAY_STEM_CELL_CLASS)}
              >
                <Glyph ko={stem.ko} hanja={stem.hanja} />
                {isDay ? (
                  <span className="mt-1 block text-xs font-semibold text-foreground">
                    {FORTUNE_SAJU_PANEL_TEXTS.dayStemLabel}
                  </span>
                ) : null}
              </td>
            );
          })}
        </tr>
        <tr>
          <th scope="row" className={ROW_HEAD_CLASS}>
            {FORTUNE_SAJU_PANEL_TEXTS.branchRowLabel}
          </th>
          {columns.map((column) => {
            if (!column.pillar) {
              return null;
            }
            const branch = FORTUNE_SAJU_BRANCHES[column.pillar.branch];
            return (
              <td key={column.label} className={CELL_CLASS}>
                <Glyph ko={branch.ko} hanja={branch.hanja} />
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
