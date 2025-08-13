'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NumberMatchGameCardType } from '@/types';
import { NUMBER_MATCH_GAME_CARD_STATUS } from '@/constants';

export function NumberMatchNumberCardComponent({
  card,
  onClick,
  status,
}: NumberMatchGameCardType) {
  const handleClick = () => {
    if (
      status !== NUMBER_MATCH_GAME_CARD_STATUS.MATCHED &&
      status !== NUMBER_MATCH_GAME_CARD_STATUS.VISIBLE &&
      status !== NUMBER_MATCH_GAME_CARD_STATUS.SELECTED
    ) {
      onClick(card.id);
    }
  };

  return (
    <div
      className="perspective-[1000px] h-10 w-6 sm:h-12 sm:w-8 md:h-14 md:w-10 lg:h-16 lg:w-12 xl:h-20 xl:w-16 cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        className={`
    relative h-full w-full rounded-lg border-2 transform-style-3d ${
      status === 'selected' ? 'bg-ring text-primary-foreground' : ''
    } ${
          status === NUMBER_MATCH_GAME_CARD_STATUS.MATCHED
            ? 'bg-green-400 text-white opacity-60'
            : ''
        } ${
          status === NUMBER_MATCH_GAME_CARD_STATUS.VISIBLE
            ? 'bg-primary text-primary-foreground'
            : ''
        } ${
          status === NUMBER_MATCH_GAME_CARD_STATUS.HIDDEN
            ? 'bg-secondary text-secondary-foreground'
            : ''
        }`}
        variants={{
          hidden: { rotateY: 0 },
          visible: { rotateY: 180 },
          selected: { rotateY: 180 },
          matched: { rotateY: 180 },
        }}
        initial="hidden"
        animate={status}
        transition={{ duration: 0.4 }}
      >
        {/* Front */}
        <div className="absolute flex h-full w-full items-center justify-center backface-hidden text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold"></div>
        {/* Back */}
        <div
          className={`absolute flex h-full w-full items-center justify-center ${
            status !== 'hidden' ? '' : 'backface-hidden'
          } text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {card.value}
        </div>
      </motion.div>
    </div>
  );
}

export default NumberMatchNumberCardComponent;
