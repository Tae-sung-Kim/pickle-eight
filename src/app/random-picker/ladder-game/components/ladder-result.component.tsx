'use client';

import { motion } from 'framer-motion';
import { Award, Gift } from 'lucide-react';
import { LadderResultType } from '@/types';

export const LadderResultComponent = ({
  results,
}: {
  results: LadderResultType[];
}) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="bg-surface-card rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-medium flex items-center mb-4">
        <Award className="h-5 w-5 mr-2 text-primary" />
        매칭 결과
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((result, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border border-border rounded-lg p-4 hover:bg-muted transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary font-medium">
                {idx + 1}
              </div>
              <div className="ml-3">
                <div className="font-medium text-foreground">{result.name}</div>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Gift className="h-4 w-4 mr-1 text-primary" />
                  {result.prize}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LadderResultComponent;
