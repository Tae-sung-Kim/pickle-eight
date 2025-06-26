export const getRandomValue = () => Math.floor(Math.random() * 6) + 1;

export const getWinnerIndexes = (values: number[][]): number[] => {
  // [작은 값, 큰 값] 정렬
  const sorted = values.map(([a, b]) => (a <= b ? [a, b] : [b, a]));

  // 1. 더블(같은 숫자) 참가자 추출
  const doubles = sorted
    .map(([a, b], i) => (a === b ? { idx: i, val: a } : null))
    .filter(Boolean) as { idx: number; val: number }[];

  if (doubles.length > 0) {
    // 2. 더블 중 가장 큰 값이 우승
    const maxDouble = Math.max(...doubles.map((d) => d.val));
    return doubles.filter((d) => d.val === maxDouble).map((d) => d.idx);
  }

  // 3. 더블이 없으면, 합이 가장 큰 사람이 우승
  const sums = sorted.map(([a, b]) => a + b);
  const maxSum = Math.max(...sums);
  return sums
    .map((sum, i) => (sum === maxSum ? i : -1))
    .filter((i) => i !== -1);
};
