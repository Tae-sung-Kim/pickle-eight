import React from 'react';
import { NumberMatchCardType, NumberMatchCardStatusType } from '@/types';
import { NumberCard } from './number-card';

interface GameBoardProps {
  cards: NumberMatchCardType[];
  onCardClick: (cardId: number) => void;
  mapSize: number;
  getCardStatus: (card: NumberMatchCardType) => NumberMatchCardStatusType;
}

const gridColsMap: { [key: number]: string } = {
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
};

export function GameBoard({
  cards,
  onCardClick,
  mapSize,
  getCardStatus,
}: GameBoardProps) {
  const gridClass = gridColsMap[mapSize] || 'grid-cols-6';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {cards.map((card) => (
        <NumberCard
          key={card.id}
          card={card}
          onClick={onCardClick}
          status={getCardStatus(card)}
        />
      ))}
    </div>
  );
}

export default GameBoard;
