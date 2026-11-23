import type { JSX } from 'react';

import { LuckyDrawLotsCardComponent } from './card.component';

type LuckyDrawLotsCardGridPropsType = Readonly<{
  cardCount: number;
  /** 열린 카드의 위치 → 항목. 열지 않은 카드는 없다 */
  openedLabels: ReadonlyMap<number, string>;
  onOpen: (position: number) => void;
}>;

/**
 * LuckyDrawLotsCardGridComponent
 * - 카드 N장 목록. key는 위치 번호다(항목 글자나 id를 key로 쓰지 않는다).
 */
export function LuckyDrawLotsCardGridComponent({
  cardCount,
  openedLabels,
  onOpen,
}: LuckyDrawLotsCardGridPropsType): JSX.Element {
  const positions = Array.from({ length: cardCount }, (_, index) => index);
  return (
    <ol
      aria-label={`카드 ${cardCount}장`}
      className="grid grid-cols-3 gap-2 min-[480px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
    >
      {positions.map((position) => (
        <li key={position} className="flex">
          <LuckyDrawLotsCardComponent
            position={position}
            label={openedLabels.get(position) ?? null}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ol>
  );
}
