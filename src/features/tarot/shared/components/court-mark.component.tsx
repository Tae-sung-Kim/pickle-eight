export type TarotCourtMarkPropsType = {
  /** 마이너 코트 rank: 11 페이지, 12 나이트, 13 퀸, 14 킹. 막대 수 = rank - 10 */
  rank: number;
  /** top: 번호 자리의 작은 막대 묶음, side: 눈금자 자리의 큰 막대 묶음 */
  variant: 'top' | 'side';
};

const TOP_CENTER_X = 100;
const TOP_BASE_Y = 44;
const TOP_BAR_WIDTH = 3;
const TOP_BAR_GAP = 5;
const TOP_BAR_MIN_HEIGHT = 10;
const TOP_BAR_STEP = 2;

const SIDE_START_X = 28;
const SIDE_BASE_Y = 226;
const SIDE_BAR_WIDTH = 4;
const SIDE_BAR_GAP = 3;
const SIDE_BAR_MIN_HEIGHT = 20;
const SIDE_BAR_STEP = 12;

function getBarCount(rank: number): number {
  return Math.min(4, Math.max(1, rank - 10));
}

/**
 * 코트 카드 직위 표식. 높이가 다른 세로 막대 묶음만 그린다(이니셜·글자 없음).
 * 부모 <svg> 좌표(viewBox 0 0 200 340) 안에서 쓰는 장식 그룹이다.
 */
export function TarotCourtMarkComponent({
  rank,
  variant,
}: TarotCourtMarkPropsType) {
  const count = getBarCount(rank);
  const bars = Array.from({ length: count }, (_, index) => index);

  if (variant === 'top') {
    const totalWidth = count * TOP_BAR_WIDTH + (count - 1) * TOP_BAR_GAP;
    const startX = TOP_CENTER_X - totalWidth / 2;

    return (
      <g fill="currentColor">
        {bars.map((index) => {
          const height = TOP_BAR_MIN_HEIGHT + index * TOP_BAR_STEP;
          return (
            <rect
              key={index}
              x={startX + index * (TOP_BAR_WIDTH + TOP_BAR_GAP)}
              y={TOP_BASE_Y - height}
              width={TOP_BAR_WIDTH}
              height={height}
              rx={1.5}
            />
          );
        })}
      </g>
    );
  }

  return (
    <g fill="currentColor">
      {bars.map((index) => {
        const height = SIDE_BAR_MIN_HEIGHT + index * SIDE_BAR_STEP;
        return (
          <rect
            key={index}
            x={SIDE_START_X + index * (SIDE_BAR_WIDTH + SIDE_BAR_GAP)}
            y={SIDE_BASE_Y - height}
            width={SIDE_BAR_WIDTH}
            height={height}
            rx={2}
          />
        );
      })}
    </g>
  );
}
