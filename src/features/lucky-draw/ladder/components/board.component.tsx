'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils';
import { LUCKY_DRAW_LADDER_ROW_COUNT } from '../../constants/lucky-draw-limit.constant';
import type {
  LuckyDrawLadderGameType,
  LuckyDrawLadderPointType,
} from '../../types/lucky-draw.type';
import { traceLuckyDrawLadder } from '../../utils/lucky-draw-ladder.util';
import { LuckyDrawLadderPathComponent } from './path.component';

const COL_W = 100;
const ROW_H = 40;
const COL_MAX_PX = 96;

const fix = (v: number): string => v.toFixed(3);
const xOf = (column: number): number => column * COL_W + COL_W / 2;
const yOf = (level: number): number => level * ROW_H;

/** 경로 점 → polyline points (소수 셋째 자리) */
export function formatLuckyDrawLadderPoints(
  points: readonly LuckyDrawLadderPointType[]
): string {
  return points
    .map((p) => `${fix(xOf(p.column))},${fix(yOf(p.level))}`)
    .join(' ');
}

type LuckyDrawLadderBoardPropsType = Readonly<{
  game: LuckyDrawLadderGameType;
  /** 지금 보이는 경로의 참가자 열 (없으면 null) */
  pathColumn: number | null;
  /** 경로를 그리는 중이면 runId */
  drawingRunId: number | null;
  /** 아래 칸에 글자를 보일 칸 */
  revealedSlots: ReadonlySet<number>;
  /** 도착 표시를 켤 칸 (경로 끝난 뒤) */
  arrivedSlot: number | null;
  onPathEnd: (runId: number) => void;
}>;

const CELL_BASE =
  'flex min-h-10 min-w-0 items-center justify-center rounded-md border px-0.5 text-center text-xs leading-5 transition-colors duration-150 motion-reduce:transition-none';

/**
 * LuckyDrawLadderBoardComponent
 * - 위 번호 칸(HTML) / 사다리 SVG / 아래 결과 칸(HTML). 모두 장식(aria-hidden).
 */
export function LuckyDrawLadderBoardComponent({
  game,
  pathColumn,
  drawingRunId,
  revealedSlots,
  arrivedSlot,
  onPathEnd,
}: LuckyDrawLadderBoardPropsType): JSX.Element {
  const n = game.ladder.columnCount;
  const gridStyle = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const rungs: { key: string; gap: number; level: number }[] = [];
  for (let r = 0; r < game.ladder.rows.length; r += 1) {
    for (let g = 0; g < game.ladder.rows[r].length; g += 1) {
      if (game.ladder.rows[r][g]) {
        rungs.push({ key: `h-${r}-${g}`, gap: g, level: r + 1 });
      }
    }
  }
  const trace =
    pathColumn === null ? null : traceLuckyDrawLadder(game.ladder, pathColumn);

  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full space-y-1"
      style={{ maxWidth: `${n * COL_MAX_PX}px` }}
    >
      <div className="grid gap-0.5" style={gridStyle}>
        {game.participants.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              CELL_BASE,
              'font-mono',
              i === pathColumn
                ? 'border-menu-lucky bg-menu-lucky text-primary-foreground'
                : 'border-border bg-card text-foreground'
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${n * COL_W} ${(LUCKY_DRAW_LADDER_ROW_COUNT + 1) * ROW_H}`}
        preserveAspectRatio="none"
        className="block h-72 w-full md:h-96"
      >
        {game.participants.map((p, c) => (
          <line
            key={`v-${p.id}`}
            x1={fix(xOf(c))}
            y1={fix(0)}
            x2={fix(xOf(c))}
            y2={fix(yOf(LUCKY_DRAW_LADDER_ROW_COUNT + 1))}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="stroke-muted-foreground"
          />
        ))}
        {rungs.map((rung) => (
          <line
            key={rung.key}
            x1={fix(xOf(rung.gap))}
            y1={fix(yOf(rung.level))}
            x2={fix(xOf(rung.gap + 1))}
            y2={fix(yOf(rung.level))}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="stroke-muted-foreground"
          />
        ))}
        {trace ? (
          <LuckyDrawLadderPathComponent
            pointsText={formatLuckyDrawLadderPoints(trace.points)}
            runId={drawingRunId}
            onEnd={onPathEnd}
          />
        ) : null}
      </svg>
      <div className="grid gap-0.5" style={gridStyle}>
        {game.participants.map((p, c) => (
          <div
            key={`s-${p.id}`}
            className={cn(
              CELL_BASE,
              'overflow-hidden',
              c === arrivedSlot
                ? 'border-menu-lucky bg-menu-lucky/20 text-foreground'
                : 'border-border bg-card text-foreground'
            )}
          >
            <span className="truncate">
              {revealedSlots.has(c)
                ? game.results[game.slotResultIndexes[c]].label
                : '?'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
