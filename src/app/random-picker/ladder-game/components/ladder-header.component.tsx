'use client';

import { LadderHeaderComponentPropsType } from '@/types';
import { motion } from 'framer-motion';

export const LadderHeaderComponent = ({
  title,
  description,
}: LadderHeaderComponentPropsType) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="text-center mb-12"
  >
    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      {title}
    </h1>
    <p className="mt-3 text-lg text-muted-foreground">{description}</p>
  </motion.div>
);

export default LadderHeaderComponent;
