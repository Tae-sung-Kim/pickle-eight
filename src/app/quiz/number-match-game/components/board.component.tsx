import { NUMBER_MATCH_GAME_GRID_COLS_MAP } from "@/constants/number-match-game.constant";
import { NumberMatchGameBoardType } from "@/types/number-match-game.type";
import NumberMatchNumberCardComponent from './card.component';

export function NumberMatchGameBoardComponent({
  cards,
  onCardClick,
  mapSize,
  getCardStatus,
}: NumberMatchGameBoardType) {
  const gridClass = NUMBER_MATCH_GAME_GRID_COLS_MAP[mapSize] || 'grid-cols-6';

  return (
    <div className={`grid ${gridClass} gap-0.5 sm:gap-1.5 md:gap-2`}>
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
