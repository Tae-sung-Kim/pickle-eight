'use client';

import { useNumberMatchGame } from '@/hooks';
import React from 'react';
import NumberMatchGameControlsComponent from './number-match-game-controls.component';
import NumberMatchGameBoardComponent from './number-match-game-board.component';
import NumberMatchGameOverModalComponent from './number-match-game-over-modal.component';

export function NumberMatchGameComponent() {
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
    resetGame,
  } = useNumberMatchGame(6, 2); // Initial map size 6x6, match count 2

  return (
    <>
      <NumberMatchGameControlsComponent
        matchCount={matchCount}
        mapSize={mapSize}
        isGameActive={isGameActive}
        setMatchCount={setMatchCount}
        setMapSize={setMapSize}
        onStartGame={startGame}
        onReset={resetGame}
      />

      {isGameActive && (
        <div className="flex items-center justify-center bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
          <div className="mt-8">
            <p className="text-xl mb-4">Moves: {moves}</p>
            <NumberMatchGameBoardComponent
              cards={cards}
              onCardClick={handleCardClick}
              mapSize={mapSize}
              getCardStatus={getCardStatus}
            />
          </div>
        </div>
      )}

      <NumberMatchGameOverModalComponent isOpen={isGameOver} moves={moves} />
    </>
  );
}

export default NumberMatchGameComponent;
