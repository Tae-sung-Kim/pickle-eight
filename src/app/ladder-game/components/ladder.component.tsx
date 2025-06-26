import { LadderComponentPropsType } from '@/types';

export function LadderComponent({
  ladder,
  names,
  prizes,
}: LadderComponentPropsType) {
  const width = 400;
  const height = 600;
  // const cols = ladder.verticals;
  const cols = Math.max(ladder.verticals, 2);
  const rows = 10;
  const colGap = width / Math.max(1, cols - 1);
  const rowGap = height / (rows - 1);

  // 전체 너비와 높이 계산 (패딩 포함)
  const totalWidth = width + 120;
  const totalHeight = height + 80;
  const paddingX = 60; // 좌우 패딩
  const paddingTop = 40; // 상단 패딩

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="max-w-full"
    >
      {/* 이름 */}
      {names.map((name, i) => (
        <text
          key={name}
          x={paddingX + i * colGap}
          y={paddingTop - 10}
          textAnchor="middle"
          fontSize={22}
          className="font-medium"
        >
          {name}
        </text>
      ))}

      {/* 세로줄 */}
      {Array.from({ length: cols }).map((_, i) => (
        <line
          key={i}
          x1={paddingX + i * colGap}
          y1={paddingTop}
          x2={paddingX + i * colGap}
          y2={paddingTop + height}
          stroke="#333"
          strokeWidth={2}
        />
      ))}

      {/* 가로줄 (다리) */}
      {ladder.horizontals.map((h, idx) => (
        <line
          key={idx}
          x1={paddingX + h.col * colGap}
          y1={paddingTop + h.row * rowGap}
          x2={paddingX + (h.col + 1) * colGap}
          y2={paddingTop + h.row * rowGap}
          stroke="#e11d48"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ))}

      {/* 상품 */}
      {prizes.map((prize, i) => (
        <text
          key={prize}
          x={paddingX + i * colGap}
          y={paddingTop + height + 30}
          textAnchor="middle"
          fontSize={22}
          fontWeight="bold"
          className="font-medium fill-blue-600"
        >
          {prize}
        </text>
      ))}
    </svg>
  );
}
