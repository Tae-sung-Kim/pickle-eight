'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

// OS의 "동작 줄이기" 설정을 켠 사용자에게는 framer-motion 애니메이션을 줄인다
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
