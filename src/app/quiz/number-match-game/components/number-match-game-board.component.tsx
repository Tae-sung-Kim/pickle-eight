import React from 'react';
import { NumberMatchCardType, NumberMatchCardStatusType } from '@/types';
import NumberMatchNumberCardComponent from './number-match-number-card.component';

interface GameBoardProps {
  cards: NumberMatchCardType[];
  onCardClick: (cardId: number) => void;
  mapSize: number;
  getCardStatus: (card: NumberMatchCardType) => NumberMatchCardStatusType;
}

const gridColsMap: { [key: number]: string } = {
  6: 'grid-cols-6',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
};

export function NumberMatchGameBoardComponent({
  cards,
  onCardClick,
  mapSize,
  getCardStatus,
}: GameBoardProps) {
  const gridClass = gridColsMap[mapSize] || 'grid-cols-6';

  return (
    <div className={`grid ${gridClass} gap-2 sm:gap-3 md:gap-4`}>
      {cards.map((card) => (
        <NumberMatchNumberCardComponent
          key={card.id}
          card={card}
          onClick={onCardClick}
          status={getCardStatus(card)}
        />
      ))}
    </div>
  );
}

export default NumberMatchGameBoardComponent;
