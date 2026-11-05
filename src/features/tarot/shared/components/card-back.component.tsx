export type TarotCardBackPropsType = {
  className?: string;
};

const LATTICE_STEP = 20;
/** 격자가 그려지는 안쪽 영역 (카드 중심 (100, 170) 기준 위아래·좌우 대칭) */
const AREA = { xMin: 14, xMax: 186, yMin: 14, yMax: 326 } as const;
/** 격자 선이 카드 중심을 지나도록 맞춘 기준값: x + y = 270, x - y = -70 */
const SUM_BASE = 270;
const DIFF_BASE = -70;

type SegmentType = { x1: number; y1: number; x2: number; y2: number };

/** x + y = c 직선을 안쪽 영역으로 자른 선분 */
function getSumSegment(c: number): SegmentType | null {
  const lo = Math.max(AREA.xMin, c - AREA.yMax);
  const hi = Math.min(AREA.xMax, c - AREA.yMin);
  if (lo >= hi) return null;
  return { x1: lo, y1: c - lo, x2: hi, y2: c - hi };
}

/** x - y = d 직선을 안쪽 영역으로 자른 선분 */
function getDiffSegment(d: number): SegmentType | null {
  const lo = Math.max(AREA.xMin, d + AREA.yMin);
  const hi = Math.min(AREA.xMax, d + AREA.yMax);
  if (lo >= hi) return null;
  return { x1: lo, y1: lo - d, x2: hi, y2: hi - d };
}

function buildLattice(): { key: string; segment: SegmentType }[] {
  const result: { key: string; segment: SegmentType }[] = [];
  for (let k = -14; k <= 14; k += 1) {
    const sum = getSumSegment(SUM_BASE + k * LATTICE_STEP);
    if (sum) result.push({ key: `s${k}`, segment: sum });
    const diff = getDiffSegment(DIFF_BASE + k * LATTICE_STEP);
    if (diff) result.push({ key: `d${k}`, segment: diff });
  }
  return result;
}

const LATTICE = buildLattice();

/**
 * 뒷면: 종이 바탕, 마름모 격자, 가운데 봉인(동심원 2개 + 점). 위아래 대칭.
 * 순수 SVG(훅·브라우저 API 없음)라 서버에서도 렌더된다.
 */
export function TarotCardBackComponent({ className }: TarotCardBackPropsType) {
  return (
    <svg
      viewBox="0 0 200 340"
      role="img"
      aria-label="타로 카드 뒷면"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>타로 카드 뒷면</title>

      <rect
        x={6}
        y={6}
        width={188}
        height={328}
        rx={10}
        fill="var(--card)"
        strokeWidth={2}
      />

      <g strokeWidth={1} opacity={0.35}>
        {LATTICE.map(({ key, segment }) => (
          <line
            key={key}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
          />
        ))}
      </g>

      <rect
        x={14}
        y={14}
        width={172}
        height={312}
        rx={4}
        strokeWidth={1.5}
        opacity={0.4}
      />

      {/* 봉인 둘레 격자 비우기: 바탕색 원으로 덮는다 */}
      <circle cx={100} cy={170} r={34} fill="var(--card)" stroke="none" />
      <circle cx={100} cy={170} r={26} strokeWidth={2} />
      <circle cx={100} cy={170} r={18} strokeWidth={1.5} />
      <circle cx={100} cy={170} r={3.5} fill="currentColor" stroke="none" />
    </svg>
  );
}
