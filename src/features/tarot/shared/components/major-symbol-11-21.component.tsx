// 메이저 11~21번 상징 도형. 자체 제작(원·선·호·다각형만 사용).
// 상징 영역: 140 x 140, 중심 (100, 172), viewBox 200 x 340.
// 부모(TarotMajorSymbolComponent)가 <g>로 감싸 fill none, stroke currentColor, 선 3, round를 준다.

import {
  TAROT_DOTTED_DASH,
  TAROT_START_CIRCLE,
} from '@/features/tarot/shared/components/major-symbol-0-10.component';

export type TarotMajorSymbol11To21ComponentPropsType = {
  rank: number;
};

export function TarotMajorSymbol11To21Component({
  rank,
}: TarotMajorSymbol11To21ComponentPropsType) {
  switch (rank) {
    case 11:
      // 정의: 작은 삼각 받침 위 가로선, 양 끝에 같은 크기의 빈 원
      return (
        <>
          <path d="M100 156 L84 208 L116 208 Z" />
          <line x1={60} y1={152} x2={140} y2={152} />
          <circle cx={48} cy={152} r={12} fill="var(--card)" />
          <circle cx={152} cy={152} r={12} fill="var(--card)" />
        </>
      );
    case 12:
      // 매달린 사람: 위 가로선에서 내려온 수직선 끝에 매달린 역삼각형(다림추)
      return (
        <>
          <line x1={60} y1={118} x2={140} y2={118} />
          <line x1={100} y1={118} x2={100} y2={178} />
          <path d="M80 178 L120 178 L100 226 Z" />
        </>
      );
    case 13:
      // 죽음: 가로선 아래로 반쯤 잠긴 원(아래쪽 반원), 가로선 위로 돋는 짧은 새싹 곡선
      return (
        <>
          <line x1={38} y1={186} x2={162} y2={186} />
          <path d="M64 186 A36 36 0 0 0 136 186" />
          <path
            d="M64 186 A36 36 0 0 1 136 186"
            strokeWidth={1.5}
            opacity={0.35}
          />
          <path d="M100 186 C 100 166, 96 148, 114 134" />
        </>
      );
    case 14:
      // 절제: 꼭짓점이 맞닿은 위아래 삼각형(모래시계), 아래 삼각형에만 옅은 채움
      return (
        <>
          <path d="M64 122 L136 122 L100 172 Z" />
          <path
            d="M100 172 L64 222 L136 222 Z"
            fill="currentColor"
            fillOpacity={0.25}
          />
        </>
      );
    case 15:
      // 악마: 서로 걸린 두 고리(사슬 두 마디), 오른쪽 고리 아래에 틈 하나
      return (
        <>
          <rect x={36} y={144} width={72} height={56} rx={28} />
          <path d="M120 200 A28 28 0 0 1 120 144 H136 A28 28 0 0 1 136 200" />
        </>
      );
    case 16:
      // 탑: 쌓인 사각 블록 3개 중 맨 위가 비스듬히 어긋남, 옆에 짧은 지그재그
      return (
        <>
          <rect x={70} y={200} width={60} height={28} />
          <rect x={70} y={172} width={60} height={28} />
          <rect
            x={76}
            y={134}
            width={60}
            height={28}
            transform="rotate(14 106 148)"
          />
          <path d="M152 130 L142 152 L158 160 L148 184" />
        </>
      );
    case 17:
      // 별: 네 꼭지 별 하나, 아래로 퍼지는 동심 호 3겹
      return (
        <>
          <path
            d="M100 122 L105.7 142.3 L126 148 L105.7 153.7 L100 174 L94.3 153.7 L74 148 L94.3 142.3 Z"
            fill="currentColor"
          />
          <path d="M136.3 164.9 A40 40 0 0 1 63.7 164.9" />
          <path d="M148.9 170.8 A54 54 0 0 1 51.1 170.8" />
          <path d="M161.6 176.7 A68 68 0 0 1 38.4 176.7" />
        </>
      );
    case 18:
      // 달: 초승달 하나, 아래에 길이가 다른 물결선 두 줄
      return (
        <>
          <path
            d="M116 116 A32 32 0 0 0 116 180 A40 40 0 0 1 116 116 Z"
            fill="currentColor"
          />
          <path d="M56 200 q 11 -8 22 0 t 22 0 t 22 0 t 22 0" />
          <path d="M72 222 q 7 -6 14 0 t 14 0 t 14 0 t 14 0" />
        </>
      );
    case 19:
      // 태양: 채운 원 하나와 짧은 방사선 12개
      return (
        <>
          <circle cx={100} cy={172} r={22} fill="currentColor" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (angle) => (
              <line
                key={angle}
                x1={100}
                y1={116}
                x2={100}
                y2={136}
                transform={`rotate(${angle} 100 172)`}
              />
            )
          )}
        </>
      );
    case 20:
      // 심판: 아래 한 점에서 위로 넓어지는 호 3겹(소리가 퍼지는 모양)
      return (
        <>
          <circle cx={100} cy={230} r={5} fill="currentColor" stroke="none" />
          <path d="M76 206 A34 34 0 0 1 124 206" />
          <path d="M53.3 183.3 A66 66 0 0 1 146.7 183.3" />
          <path d="M30.7 160.7 A98 98 0 0 1 169.3 160.7" />
        </>
      );
    case 21:
      // 세계: 점선 원이 한 바퀴를 돌아 시작점의 작은 빈 원(0번과 같은 원)에서 닫힘
      return (
        <>
          <circle
            cx={100}
            cy={172}
            r={64}
            strokeDasharray={TAROT_DOTTED_DASH}
          />
          <circle {...TAROT_START_CIRCLE} fill="var(--card)" />
        </>
      );
    default:
      return null;
  }
}
