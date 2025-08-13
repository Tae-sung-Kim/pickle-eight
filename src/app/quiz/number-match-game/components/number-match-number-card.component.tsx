'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NumberMatchCardType, NumberMatchCardStatusType } from '@/types';

interface NumberCardProps {
  card: NumberMatchCardType;
  onClick: (cardId: number) => void;
  status: NumberMatchCardStatusType;
}

const cardVariants = {
  hidden: {
    rotateY: 0,
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
  },
  visible: {
    rotateY: 180,
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  selected: {
    rotateY: 180,
    backgroundColor: 'hsl(var(--ring))',
    color: 'hsl(var(--primary-foreground))',
  },
  matched: {
    rotateY: 180,
    backgroundColor: '#4ade80', // green-400
    color: 'white',
    opacity: 0.6,
  },
};

export function NumberMatchNumberCardComponent({
  card,
  onClick,
  status,
}: NumberCardProps) {
  const handleClick = () => {
    if (status !== 'matched' && status !== 'visible' && status !== 'selected') {
      onClick(card.id);
    }
  };

  return (
    <div
      className="perspective-[1000px] h-12 w-8 sm:h-14 sm:w-10 md:h-16 md:w-14 lg:h-20 lg:w-16 xl:h-24 xl:w-20 cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        className="relative h-full w-full rounded-lg border-2 transform-style-3d"
        variants={cardVariants}
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
