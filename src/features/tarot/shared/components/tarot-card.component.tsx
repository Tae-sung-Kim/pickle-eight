'use client';

import { motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { TarotCardBackComponent } from '@/features/tarot/shared/components/card-back.component';
import { TarotCardFaceComponent } from '@/features/tarot/shared/components/card-face.component';
import type { TarotCardType } from '@/features/tarot/types/tarot.type';
import { cn } from '@/lib/utils';

export type TarotCardPropsType = {
  /** 앞면에 그릴 카드. 없으면(뽑기 전) 뒷면만 그린다 */
  card?: TarotCardType;
  isReversed: boolean;
  /** true: 앞면, false: 뒷면 */
  isFaceUp: boolean;
  /** true일 때만 뒤집기 연출을 한다. false면 연출 없이 바로 해당 면을 그린다 (기본 false) */
  isFlipping?: boolean;
  /** 연출 시작 지연(ms). 3장 타로는 0 / 120 / 240 (기본 0) */
  flipDelayMs?: number;
  /** 회전 길이(ms). 오늘의 타로 600(기본), 3장 타로 500 */
  flipDurationMs?: number;
  /** 연출이 끝나면 한 번 부른다. 동작 줄이기에서는 opacity 교차(150ms)가 끝나면 부른다 */
  onFlipComplete?: () => void;
  /** 크기는 부모가 폭으로 정한다 (비율은 200:340 고정) */
  className?: string;
};

const DEFAULT_FLIP_DURATION_MS = 600;
const REDUCED_FADE_DURATION_S = 0.15;
const FLIP_EASE = [0.2, 0.7, 0.2, 1] as const;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const INSTANT_TRANSITION = { duration: 0 } as const;

function subscribeReducedMotion(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** 서버와 첫 하이드레이션은 항상 false. 이후 OS 설정으로 바뀐다 */
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * 뒷면 <-> 앞면 전환. 앞/뒤 두 면을 겹쳐 두고 컨테이너를 rotateY로 돌린다.
 * 뒤집기 외 다른 모션은 없다. 카드는 버튼이 아니라서 포커스를 받지 않는다.
 * "역방향" 글자는 카드 밖에 있는 요소라 이 컴포넌트가 그리지 않고 root가 그린다(design.md 12.2).
 */
export function TarotCardComponent({
  card,
  isReversed,
  isFaceUp,
  isFlipping = false,
  flipDelayMs = 0,
  flipDurationMs = DEFAULT_FLIP_DURATION_MS,
  onFlipComplete,
  className,
}: TarotCardPropsType) {
  const isReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const showFront = isFaceUp && card !== undefined;

  // 회전은 동작 줄이기가 아닐 때만, 불투명도 교차는 동작 줄이기일 때만 연출한다
  const rotateTransition =
    isFlipping && !isReduced
      ? {
          duration: flipDurationMs / 1000,
          delay: flipDelayMs / 1000,
          ease: FLIP_EASE,
        }
      : INSTANT_TRANSITION;
  const fadeTransition =
    isFlipping && isReduced
      ? { duration: REDUCED_FADE_DURATION_S, ease: 'linear' as const }
      : INSTANT_TRANSITION;

  function handleAnimationComplete() {
    if (isFlipping) onFlipComplete?.();
  }

  return (
    <div
      className={cn(
        'relative aspect-[200/340] [perspective:1000px]',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: isReduced ? 0 : showFront ? 180 : 0 }}
        transition={rotateTransition}
        onAnimationComplete={isReduced ? undefined : handleAnimationComplete}
      >
        <motion.div
          className="absolute inset-0 text-menu-tarot [backface-visibility:hidden]"
          aria-hidden={showFront ? true : undefined}
          initial={false}
          animate={{ opacity: isReduced ? (showFront ? 0 : 1) : 1 }}
          transition={fadeTransition}
        >
          <TarotCardBackComponent className="size-full" />
        </motion.div>

        {card ? (
          <motion.div
            className="absolute inset-0 [backface-visibility:hidden]"
            aria-hidden={showFront ? undefined : true}
            // 앞면은 뽑은 뒤에 마운트되므로 동작 줄이기에서는 투명에서 시작해야 교차가 보인다
            initial={{
              rotateY: isReduced ? 0 : 180,
              opacity: isReduced ? 0 : 1,
            }}
            animate={{
              rotateY: isReduced ? 0 : 180,
              opacity: isReduced ? (showFront ? 1 : 0) : 1,
            }}
            transition={{
              rotateY: INSTANT_TRANSITION,
              opacity: fadeTransition,
            }}
            onAnimationComplete={
              isReduced ? handleAnimationComplete : undefined
            }
          >
            <TarotCardFaceComponent
              card={card}
              isReversed={isReversed}
              className="size-full"
            />
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
