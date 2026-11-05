// 메이저 22장 상징 (번호별 분기). 순수 SVG 조각이라 부모 <svg> 안에 넣어 쓴다.
// 훅, 'use client', framer-motion 없음(서버 렌더 가능). 색은 currentColor와 var(--card)뿐.

import { TarotMajorSymbol0To10Component } from '@/features/tarot/shared/components/major-symbol-0-10.component';
import { TarotMajorSymbol11To21Component } from '@/features/tarot/shared/components/major-symbol-11-21.component';

export type TarotMajorSymbolComponentPropsType = {
  /** 메이저 번호 0~21 */
  rank: number;
};

export function TarotMajorSymbolComponent({
  rank,
}: TarotMajorSymbolComponentPropsType) {
  if (!Number.isInteger(rank) || rank < 0 || rank > 21) {
    return null;
  }

  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {rank <= 10 ? (
        <TarotMajorSymbol0To10Component rank={rank} />
      ) : (
        <TarotMajorSymbol11To21Component rank={rank} />
      )}
    </g>
  );
}
