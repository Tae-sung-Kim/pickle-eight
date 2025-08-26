'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateLadder, getLadderResults } from '@/utils/ladder-game.util';
import { LadderType, LadderConfigType, LadderResultType } from '@/types';
import LadderInputComponent from './input-list.component';
import LadderGameSectionComponent from './section.component';
import { TitleWrapperComponent } from '@/components';

export function LadderGameComponent() {
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
    <div className="container mx-auto h-fit p-4">
      <div className="max-w-6xl mx-auto">
        <TitleWrapperComponent
          type="random"
          title="사다리 타기 게임"
          description="참가자와 상품을 매칭해보세요"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border bg-white/70 backdrop-blur shadow-sm ring-1 ring-black/5 overflow-hidden"
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

export default LadderGameComponent;
