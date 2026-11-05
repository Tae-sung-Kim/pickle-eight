import type { ReactNode } from 'react';

export type TarotCardFramePropsType = {
  /** 접근성 이름. role="img" aria-label과 <title>에 같은 값을 쓴다 (예: "바보 카드, 정방향") */
  label: string;
  /** 번호 자리 글자 (메이저 "0", "I"~"XXI", 마이너 "A", "2"~"10") */
  numberText?: string;
  /** 번호 자리에 글자 대신 놓을 도형 (코트 막대 묶음) */
  numberSlot?: ReactNode;
  /** 하단 한글 이름 */
  name: string;
  /** 숫자 카드 눈금자: 아래에서부터 진하게 칠할 칸 수 (1~10). 없으면 눈금자를 그리지 않는다 */
  rulerRank?: number;
  /** 상징 영역(140 x 140, 중심 (100, 172))에 그릴 도형 */
  children?: ReactNode;
  className?: string;
};

const NAME_LONG_THRESHOLD = 7;
const NAME_MAX_WIDTH = 150;

const RULER_X = 28;
const RULER_BOTTOM_Y = 226;
const RULER_STEP = 12;
const RULER_TICK_COUNT = 10;
const RULER_LONG_LENGTH = 16;
const RULER_SHORT_LENGTH = 8;

const RULER_TICKS = Array.from({ length: RULER_TICK_COUNT }, (_, index) => ({
  index,
  y: RULER_BOTTOM_Y - index * RULER_STEP,
}));

/** 가는 눈금 10개 중 아래에서부터 rank개만 길고 진하게 */
function CardRuler({ rank }: { rank: number }) {
  const filled = Math.min(RULER_TICK_COUNT, Math.max(0, Math.round(rank)));

  return (
    <g strokeLinecap="round">
      {RULER_TICKS.map(({ index, y }) => {
        const isFilled = index < filled;
        return (
          <line
            key={index}
            x1={RULER_X}
            y1={y}
            x2={RULER_X + (isFilled ? RULER_LONG_LENGTH : RULER_SHORT_LENGTH)}
            y2={y}
            strokeWidth={isFilled ? 2 : 1.5}
            opacity={isFilled ? 1 : 0.35}
          />
        );
      })}
    </g>
  );
}

/**
 * 모든 앞면이 공유하는 틀. 순수 SVG(훅·브라우저 API 없음)라 서버에서도 렌더된다.
 * 색은 currentColor(부모 text-menu-tarot)와 var(--card)뿐이다.
 * 글자는 사이트 기본 글꼴(Pretendard)을 상속하는 <text>로만 쓴다.
 */
export function TarotCardFrameComponent({
  label,
  numberText,
  numberSlot,
  name,
  rulerRank,
  children,
  className,
}: TarotCardFramePropsType) {
  const isLongName = name.length >= NAME_LONG_THRESHOLD;

  return (
    <svg
      viewBox="0 0 200 340"
      role="img"
      aria-label={label}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{label}</title>

      <rect
        x={6}
        y={6}
        width={188}
        height={328}
        rx={10}
        fill="var(--card)"
        strokeWidth={2}
      />
      <rect
        x={14}
        y={14}
        width={172}
        height={312}
        rx={4}
        strokeWidth={1.5}
        opacity={0.4}
      />

      {numberSlot}
      {numberText ? (
        <text
          x={100}
          y={44}
          textAnchor="middle"
          fontSize={22}
          fontWeight={600}
          fill="currentColor"
          stroke="none"
        >
          {numberText}
        </text>
      ) : null}

      <line x1={88} y1={72} x2={112} y2={72} strokeWidth={1.5} opacity={0.4} />
      <line
        x1={88}
        y1={268}
        x2={112}
        y2={268}
        strokeWidth={1.5}
        opacity={0.4}
      />

      {rulerRank !== undefined ? <CardRuler rank={rulerRank} /> : null}
      {children}

      <text
        x={100}
        y={308}
        textAnchor="middle"
        fontSize={18}
        fontWeight={600}
        fill="currentColor"
        stroke="none"
        textLength={isLongName ? NAME_MAX_WIDTH : undefined}
        lengthAdjust={isLongName ? 'spacingAndGlyphs' : undefined}
      >
        {name}
      </text>
    </svg>
  );
}
