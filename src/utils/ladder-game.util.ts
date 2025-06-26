import {
  LadderType,
  LadderHorizontalType,
  LadderConfigType,
  LadderResultType,
} from '@/types';

/**
 * 랜덤 사다리 구조 생성
 */

export function generateLadder(input: LadderConfigType, rows = 10): LadderType {
  const cols = input.names.length;
  const horizontals: LadderHorizontalType[] = [];

  for (let row = 1; row < rows - 1; row++) {
    let lastCol = -2;
    for (let col = 0; col < cols - 1; col++) {
      if (col === lastCol + 1) continue;
      if (Math.random() < 0.3) {
        horizontals.push({ row, col });
        lastCol = col;
      }
    }
  }

  // 각 col(세로줄 사이)에 최소 2개씩은 가로줄이 있도록 보장
  for (let col = 0; col < cols - 1; col++) {
    const existing = horizontals.filter((h) => h.col === col).length;
    let needed = 2 - existing;
    while (needed > 0) {
      let row: number;
      let tries = 0;
      do {
        row = Math.floor(Math.random() * (rows - 2)) + 1; // 1 ~ rows-2
        tries++;
        // 중복/연속 방지
      } while (
        horizontals.some(
          (h) =>
            (h.row === row && h.col === col) ||
            (h.row === row && (h.col === col - 1 || h.col === col + 1))
        ) &&
        tries < 10
      );
      horizontals.push({ row, col });
      needed--;
    }
  }
  return { verticals: cols, horizontals };
}

/**
 * 사다리 타기 결과 계산
 */
export function getLadderResults(
  input: LadderConfigType,
  ladder: LadderType
): LadderResultType[] {
  // const cols = input.names.length;
  const rows =
    ladder.horizontals.length > 0
      ? Math.max(...ladder.horizontals.map((h) => h.row)) + 1
      : 10;

  // 각 참가자별로 "사다리 타기" 시뮬레이션
  return input.names.map((name, startCol) => {
    let col = startCol;
    for (let row = 0; row < rows; row++) {
      // 현재 row에 col에서 시작하는 가로줄이 있으면 오른쪽으로 이동
      if (ladder.horizontals.some((h) => h.row === row && h.col === col)) {
        col += 1;
      }
      // 현재 row에 col-1에서 시작하는 가로줄이 있으면 왼쪽으로 이동
      else if (
        col > 0 &&
        ladder.horizontals.some((h) => h.row === row && h.col === col - 1)
      ) {
        col -= 1;
      }
      // 아니면 아래로 이동 (col 변화 없음)
    }
    return {
      name,
      prize: input.prizes[col],
    };
  });
}
