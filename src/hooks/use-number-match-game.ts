import { useState, useCallback, useEffect } from 'react';
import { NumberMatchCardType, NumberMatchCardStatusType } from '@/types';
import { NUMBER_MATCH_GAME_CARD_STATUS } from '@/constants';

const shuffleArray = <T>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

export function useNumberMatchGame(
  initialMapSize: number,
  initialMatchCount: number
) {
  const [mapSize, setMapSize] = useState(initialMapSize);
  const [matchCount, setMatchCount] = useState(initialMatchCount);
  const [cards, setCards] = useState<NumberMatchCardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const createCards = useCallback(() => {
    const totalCards = mapSize * mapSize;
    if (totalCards % matchCount !== 0) {
      console.error('Map size must be a multiple of match count.');
      return;
    }
    const uniqueNumbers = totalCards / matchCount;
    const newCards: NumberMatchCardType[] = [];
    for (let i = 0; i < uniqueNumbers; i++) {
      for (let j = 0; j < matchCount; j++) {
        newCards.push({
          id: newCards.length,
          value: i + 1,
          status: NUMBER_MATCH_GAME_CARD_STATUS.HIDDEN,
        });
      }
    }
    setCards(shuffleArray(newCards));
  }, [mapSize, matchCount]);

  const startGame = useCallback(() => {
    setMoves(0);
    setSelectedCards([]);
    setIsGameOver(false);
    setIsGameActive(true);
    setIsRevealing(true);
    createCards();
    setTimeout(() => setIsRevealing(false), 2000);
  }, [createCards]);

  useEffect(() => {
    if (
      isGameActive &&
      cards.length > 0 &&
      cards.every((c) => c.status === NUMBER_MATCH_GAME_CARD_STATUS.MATCHED)
    ) {
      setIsGameOver(true);
    }
  }, [cards, isGameActive]);

  useEffect(() => {
    if (selectedCards.length < matchCount) return;

    const firstCard = cards.find((c) => c.id === selectedCards[0]);
    if (!firstCard) return;

    const allMatch = selectedCards.every(
      (id) => cards.find((c) => c.id === id)?.value === firstCard.value
    );

    if (allMatch) {
      setCards((prev) =>
        prev.map((c) =>
          selectedCards.includes(c.id)
            ? { ...c, status: NUMBER_MATCH_GAME_CARD_STATUS.MATCHED }
            : c
        )
      );
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            selectedCards.includes(c.id)
              ? { ...c, status: NUMBER_MATCH_GAME_CARD_STATUS.HIDDEN }
              : c
          )
        );
      }, 1000);
    }

    setSelectedCards([]);
    setMoves((prev) => prev + 1);
  }, [selectedCards, cards, matchCount]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      setCards((prev) => {
        // 이미 선택된 카드이거나, 매치된 카드이면 무시
        const card = prev.find((c) => c.id === cardId);
        if (
          !card ||
          card.status === NUMBER_MATCH_GAME_CARD_STATUS.VISIBLE ||
          card.status === NUMBER_MATCH_GAME_CARD_STATUS.MATCHED ||
          card.status === NUMBER_MATCH_GAME_CARD_STATUS.SELECTED
        ) {
          return prev;
        }

        // 현재 선택된 카드 수 확인
        const selectedCount = prev.filter(
          (c) => c.status === NUMBER_MATCH_GAME_CARD_STATUS.SELECTED
        ).length;

        // 이미 matchCount만큼 선택된 경우 더 이상 선택 불가
        if (selectedCount >= matchCount) {
          return prev;
        }

        // 카드 상태 업데이트
        return prev.map((c) =>
          c.id === cardId
            ? { ...c, status: NUMBER_MATCH_GAME_CARD_STATUS.SELECTED }
            : c
        );
      });
    },
    [matchCount]
  );

  // 카드 클릭 시 selectedCards 상태 업데이트
  useEffect(() => {
    const selected = cards
      .filter((card) => card.status === NUMBER_MATCH_GAME_CARD_STATUS.SELECTED)
      .map((card) => card.id);
    setSelectedCards(selected);
  }, [cards]);

  const getCardStatus = (
    card: NumberMatchCardType
  ): NumberMatchCardStatusType => {
    if (isRevealing) return NUMBER_MATCH_GAME_CARD_STATUS.VISIBLE;
    if (
      card.status === NUMBER_MATCH_GAME_CARD_STATUS.VISIBLE &&
      selectedCards[0] === card.id &&
      selectedCards.length < matchCount
    ) {
      return NUMBER_MATCH_GAME_CARD_STATUS.SELECTED;
    }
    return card.status;
  };

  return {
    cards,
    moves,
    isGameOver,
    isGameActive,
    mapSize,
    matchCount,
    setMapSize,
    setMatchCount,
    startGame,
    handleCardClick,
    getCardStatus,
  };
}
