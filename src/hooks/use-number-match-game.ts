import { useState, useCallback, useEffect } from 'react';
import { NumberMatchCardType, NumberMatchCardStatusType } from '@/types';

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
        newCards.push({ id: newCards.length, value: i + 1, status: 'hidden' });
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
      cards.every((c) => c.status === 'matched')
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
          selectedCards.includes(c.id) ? { ...c, status: 'matched' } : c
        )
      );
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            selectedCards.includes(c.id) ? { ...c, status: 'hidden' } : c
          )
        );
      }, 1000);
    }

    setSelectedCards([]);
    setMoves((prev) => prev + 1);
  }, [selectedCards, cards, matchCount]);

  const handleCardClick = (cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (
      isRevealing ||
      !card ||
      card.status !== 'hidden' ||
      selectedCards.length >= matchCount
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: 'visible' } : c))
    );
    setSelectedCards((prev) => [...prev, cardId]);
  };

  const getCardStatus = (
    card: NumberMatchCardType
  ): NumberMatchCardStatusType => {
    if (isRevealing) return 'visible';
    if (
      card.status === 'visible' &&
      selectedCards[0] === card.id &&
      selectedCards.length < matchCount
    ) {
      return 'selected';
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
