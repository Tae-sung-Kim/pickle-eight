'use client';

import React from 'react';
import { GameControls } from '@/app/quiz/number-match-game/components/game-controls';
import { GameBoard } from '@/app/quiz/number-match-game/components/game-board';
import { GameOverModal } from '@/app/quiz/number-match-game/components/game-over-modal';
import { useNumberMatchGame } from '@/hooks/use-number-match-game';

const NumberMatchGamePage: React.FC = () => {
  const {
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
  } = useNumberMatchGame(6, 2); // Initial map size 6x6, match count 2

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          숫자 매칭 게임
        </h1>

        <GameControls
          matchCount={matchCount}
          setMatchCount={setMatchCount}
          mapSize={mapSize}
          setMapSize={setMapSize}
          onStartGame={startGame}
          isGameActive={isGameActive}
        />

        {isGameActive && (
          <div className="flex items-center justify-center">
            <div className="mt-8">
              <p className="text-xl mb-4">Moves: {moves}</p>
              <GameBoard
                cards={cards}
                onCardClick={handleCardClick}
                mapSize={mapSize}
                getCardStatus={getCardStatus}
              />
            </div>
          </div>
        )}

        <GameOverModal
          isOpen={isGameOver}
          onRestart={startGame}
          moves={moves}
        />
      </div>
    </div>
  );
};

export default NumberMatchGamePage;
