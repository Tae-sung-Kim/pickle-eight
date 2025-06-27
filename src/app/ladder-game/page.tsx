'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateLadder, getLadderResults } from '@/utils/ladder-game.util';
import { LadderType, LadderConfigType, LadderResultType } from '@/types';
import { LadderGameSectionComponent } from './components/ladder-game-section.component';
import { LadderInputComponent } from './components/ladder-input.component';
import { LadderHeaderComponent } from './components/ladder-header.component';

export default function LadderGamePage() {
  const [config, setConfig] = useState<LadderConfigType | null>(null);
  const [ladder, setLadder] = useState<LadderType | null>(null);
  const [results, setResults] = useState<LadderResultType[] | null>(null);

  const handleCreateLadder = (data: LadderConfigType) => {
    setConfig(data);
    const newLadder = generateLadder(data);
    setLadder(newLadder);
    setResults(getLadderResults(data, newLadder));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setLadder(null);
    setConfig(null);
    setResults(null);
  };

  return (
    <div className="bg-gradient-to-b from-violet-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <LadderHeaderComponent
          title="사다리 타기 게임"
          description="참가자와 상품을 매칭해보세요"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-background rounded-2xl shadow-sm border overflow-hidden"
        >
          {!ladder ? (
            <LadderInputComponent onCreateLadder={handleCreateLadder} />
          ) : (
            <LadderGameSectionComponent
              ladder={ladder}
              config={config!}
              onReset={handleReset}
              results={results!}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
