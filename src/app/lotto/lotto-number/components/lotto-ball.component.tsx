'use client';

import { LottoBallPropsType } from '@/types';
import { getNumberColor } from '@/utils';
import { motion } from 'framer-motion';

export function LottoBallComponent({
  number,
  index,
  isBonus = false,
}: LottoBallPropsType) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 12,
      }}
      className={`
        flex h-12 w-12 items-center justify-center rounded-full
        text-lg font-bold text-gray-900 shadow-md
        ${isBonus ? 'bg-gray-500' : getNumberColor(number)}
        transition-all duration-300 hover:scale-110 hover:shadow-lg
      `}
    >
      {number}
    </motion.span>
  );
}

export default LottoBallComponent;
