import {
  LUCKY_DRAW_LADDER_MAX_ATTEMPTS,
  LUCKY_DRAW_LADDER_ROW_COUNT,
  LUCKY_DRAW_LADDER_RULE,
} from '../constants/lucky-draw-limit.constant';
import type {
  LuckyDrawEntryType,
  LuckyDrawLadderGameType,
  LuckyDrawLadderPointType,
  LuckyDrawLadderTraceType,
  LuckyDrawLadderType,
  LuckyDrawUint32SourceType,
} from '../types/lucky-draw.type';
import { randomIntBelow, shuffleFisherYates } from './lucky-draw-random.util';

function assertColumnCount(columnCount: number): void {
  if (
    !Number.isInteger(columnCount) ||
    columnCount < LUCKY_DRAW_LADDER_RULE.minCount ||
    columnCount > LUCKY_DRAW_LADDER_RULE.maxCount
  ) {
    throw new RangeError('columnCount is out of range');
  }
}

export function generateLuckyDrawLadder(
  columnCount: number,
  source?: LuckyDrawUint32SourceType
): LuckyDrawLadderType {
  assertColumnCount(columnCount);
  const gapCount = columnCount - 1;

  for (
    let attempt = 0;
    attempt < LUCKY_DRAW_LADDER_MAX_ATTEMPTS;
    attempt += 1
  ) {
    const rows: boolean[][] = [];
    for (let r = 0; r < LUCKY_DRAW_LADDER_ROW_COUNT; r += 1) {
      const row: boolean[] = [];
      for (let g = 0; g < gapCount; g += 1) {
        if (g > 0 && row[g - 1]) {
          row.push(false);
        } else {
          row.push(randomIntBelow(2, source) === 1);
        }
      }
      rows.push(row);
    }
    const ladder: LuckyDrawLadderType = { columnCount, rows };
    if (isLuckyDrawLadderValid(ladder)) {
      return ladder;
    }
  }
  throw new Error('failed to generate a ladder');
}

export function traceLuckyDrawLadder(
  ladder: LuckyDrawLadderType,
  startColumn: number
): LuckyDrawLadderTraceType {
  if (
    !Number.isInteger(startColumn) ||
    startColumn < 0 ||
    startColumn >= ladder.columnCount
  ) {
    throw new RangeError('startColumn is out of range');
  }
  const points: LuckyDrawLadderPointType[] = [
    { column: startColumn, level: 0 },
  ];
  let column = startColumn;
  ladder.rows.forEach((row, r) => {
    let next = column;
    if (row[column]) {
      next = column + 1;
    } else if (column > 0 && row[column - 1]) {
      next = column - 1;
    }
    if (next !== column) {
      points.push({ column, level: r + 1 }, { column: next, level: r + 1 });
      column = next;
    }
  });
  points.push({ column, level: ladder.rows.length + 1 });
  return { endColumn: column, points };
}

/** AC-11 검사. 테스트와 개발 중 단언에 같이 쓴다 */
export function isLuckyDrawLadderValid(ladder: LuckyDrawLadderType): boolean {
  const gapCount = ladder.columnCount - 1;
  if (gapCount < 1 || ladder.rows.length !== LUCKY_DRAW_LADDER_ROW_COUNT) {
    return false;
  }
  const covered = new Array<boolean>(gapCount).fill(false);
  for (const row of ladder.rows) {
    if (row.length !== gapCount) {
      return false;
    }
    for (let g = 0; g < gapCount; g += 1) {
      if (row[g]) {
        if (g > 0 && row[g - 1]) {
          return false;
        }
        covered[g] = true;
      }
    }
  }
  return covered.every(Boolean);
}

/** 사다리 생성 → 아래 결과 칸 섞기 → 배정 계산. 수가 다르거나 범위 밖이면 RangeError */
export function createLuckyDrawLadderGame(
  participants: readonly LuckyDrawEntryType[],
  results: readonly LuckyDrawEntryType[],
  source?: LuckyDrawUint32SourceType
): LuckyDrawLadderGameType {
  const n = participants.length;
  if (n !== results.length) {
    throw new RangeError('participants and results must have the same length');
  }
  assertColumnCount(n);
  const ladder = generateLuckyDrawLadder(n, source);
  const slotResultIndexes = shuffleFisherYates(
    Array.from({ length: n }, (_, i) => i),
    source
  );
  const assignment = participants.map(
    (_, i) => slotResultIndexes[traceLuckyDrawLadder(ladder, i).endColumn]
  );
  return { participants, results, ladder, slotResultIndexes, assignment };
}
