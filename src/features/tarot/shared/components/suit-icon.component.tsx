import type { TarotSuitType } from '@/features/tarot/types/tarot.type';

export type TarotSuitIconPropsType = {
  suit: TarotSuitType;
  /** 아이콘 한 변 크기(viewBox 단위). 기본 72 */
  size?: number;
  /** 아이콘 중심 좌표. 기본은 상징 영역 중심 (100, 172) */
  cx?: number;
  cy?: number;
  /** 코트 카드용 이중 테두리 원 */
  isFramed?: boolean;
};

const BASE_SIZE = 72;

/** 72 x 72 기준, 중심 (0, 0). 막대 하나 + 곁가지 둘 + 마디 둘 */
function WandShape() {
  return (
    <>
      <line x1={0} y1={34} x2={0} y2={-34} strokeWidth={3} />
      <line x1={0} y1={-12} x2={-11} y2={-24} strokeWidth={3} />
      <line x1={0} y1={-22} x2={11} y2={-34} strokeWidth={3} />
      <line x1={-5} y1={10} x2={5} y2={10} strokeWidth={1.5} />
      <line x1={-5} y1={22} x2={5} y2={22} strokeWidth={1.5} />
    </>
  );
}

/** 반원 그릇 + 짧은 목 + 납작한 받침 */
function CupShape() {
  return (
    <>
      <path d="M -24 -16 A 24 24 0 0 0 24 -16 Z" strokeWidth={3} />
      <line x1={0} y1={8} x2={0} y2={24} strokeWidth={3} />
      <line x1={-14} y1={26} x2={14} y2={26} strokeWidth={3} />
    </>
  );
}

/** 가늘고 긴 마름모 날 + 짧은 가로 손잡이 + 끝의 작은 원 */
function SwordShape() {
  return (
    <>
      <path d="M 0 -36 L 8 -6 L 0 16 L -8 -6 Z" strokeWidth={3} />
      <line x1={-14} y1={16} x2={14} y2={16} strokeWidth={3} />
      <line x1={0} y1={16} x2={0} y2={27} strokeWidth={3} />
      <circle cx={0} cy={31} r={3.5} strokeWidth={1.5} />
    </>
  );
}

/** 이중 원(동전) + 가운데 채운 점. 별 모양은 넣지 않는다 */
function PentacleShape() {
  return (
    <>
      <circle cx={0} cy={0} r={32} strokeWidth={3} />
      <circle cx={0} cy={0} r={22} strokeWidth={1.5} />
      <circle cx={0} cy={0} r={4} fill="currentColor" stroke="none" />
    </>
  );
}

function SuitShape({ suit }: { suit: TarotSuitType }) {
  switch (suit) {
    case 'wands':
      return <WandShape />;
    case 'cups':
      return <CupShape />;
    case 'swords':
      return <SwordShape />;
    case 'pentacles':
      return <PentacleShape />;
  }
}

/**
 * 수트 아이콘 4종. 부모 <svg>(viewBox 0 0 200 340) 안에서 쓰는 장식 그룹이다.
 * 전부 직접 그린 선·원·다각형이다.
 */
export function TarotSuitIconComponent({
  suit,
  size = BASE_SIZE,
  cx = 100,
  cy = 172,
  isFramed = false,
}: TarotSuitIconPropsType) {
  const scale = size / BASE_SIZE;

  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${scale})`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isFramed ? (
        <>
          <circle cx={0} cy={0} r={42} strokeWidth={2} />
          <circle cx={0} cy={0} r={37} strokeWidth={1.5} opacity={0.5} />
        </>
      ) : null}
      <SuitShape suit={suit} />
    </g>
  );
}
