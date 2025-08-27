import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface RewardVisibilityOptions {
  requiredRatio: number;
}

export interface RewardVisibilityState {
  readonly visibleSeconds: number;
  readonly isCompleted: boolean;
}

export function useRewardVisibility<T extends Element>(
  ref: RefObject<T | null>,
  secondsRequired: number,
  { requiredRatio }: RewardVisibilityOptions
): RewardVisibilityState {
  const [visibleSeconds, setVisibleSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const lastTs = useRef<number | null>(null);
  const isVisible = useRef<boolean>(false);

  const onVisibility = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const e = entries[0];
      isVisible.current = e.intersectionRatio >= requiredRatio;
    },
    [requiredRatio]
  );

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(onVisibility, {
      threshold: [requiredRatio],
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, onVisibility, requiredRatio]);

  useEffect(() => {
    function tick(ts: number) {
      if (document.hidden) {
        lastTs.current = ts;
        requestAnimationFrame(tick);
        return;
      }
      if (lastTs.current == null) {
        lastTs.current = ts;
      } else {
        if (isVisible.current && !isCompleted) {
          const delta = (ts - lastTs.current) / 1000;
          if (delta > 0) {
            setVisibleSeconds((prev) => {
              const next = prev + delta;
              if (next >= secondsRequired) setIsCompleted(true);
              return next;
            });
          }
        }
        lastTs.current = ts;
      }
      requestAnimationFrame(tick);
    }
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [secondsRequired, isCompleted]);

  return { visibleSeconds, isCompleted };
}
