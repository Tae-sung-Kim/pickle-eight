'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type JSX, useEffect } from 'react';

type LuckyDrawLadderPathPropsType = Readonly<{
  /** SVG polyline points 문자열 */
  pointsText: string;
  /** 그리는 중이면 runId. 이미 끝난 경로는 null */
  runId: number | null;
  onEnd: (runId: number) => void;
}>;

const PATH_DURATION_SEC = 0.8;

/**
 * LuckyDrawLadderPathComponent
 * - 경로선 한 개. 그리는 중이면 pathLength 0 → 1 (0.8초), 동작 줄이기면 바로 완성.
 */
export function LuckyDrawLadderPathComponent({
  pointsText,
  runId,
  onEnd,
}: LuckyDrawLadderPathPropsType): JSX.Element {
  const reduced = useReducedMotion();
  const isDrawing = runId !== null;

  useEffect(() => {
    if (!isDrawing || !reduced) return;
    // 동작 줄이기: 바로 완성하고 끝 이벤트는 한 번만 (reducer가 runId로 중복을 무시)
    queueMicrotask(() => onEnd(runId));
  }, [isDrawing, reduced, runId, onEnd]);

  const common = {
    points: pointsText,
    fill: 'none',
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
    className: 'stroke-menu-lucky',
  };

  if (!isDrawing || reduced) {
    return <polyline {...common} />;
  }

  return (
    <motion.polyline
      key={runId}
      {...common}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: PATH_DURATION_SEC, ease: 'easeInOut' }}
      onAnimationComplete={() => onEnd(runId)}
    />
  );
}
