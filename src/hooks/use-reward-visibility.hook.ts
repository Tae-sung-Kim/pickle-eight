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
  const latestRatio = useRef<number>(0);

  const onVisibility = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const e = entries[0];
      latestRatio.current = e.intersectionRatio;
      isVisible.current = latestRatio.current >= requiredRatio;
    },
    [requiredRatio]
  );

  useEffect(() => {
    if (!ref.current) return;
    // Use granular thresholds to receive updates across many ratios
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(onVisibility, {
      threshold: thresholds,
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, onVisibility]);

  useEffect(() => {
    function computeRectRatio(el: Element): number {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const interLeft = Math.max(
        0,
        Math.min(rect.right, vw) - Math.max(rect.left, 0)
      );
      const interTop = Math.max(
        0,
        Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
      );
      const interArea = interLeft * interTop;
      const area = Math.max(1, rect.width * rect.height);
      return interArea / area;
    }

    function tick(ts: number) {
      if (document.hidden) {
        lastTs.current = ts;
        requestAnimationFrame(tick);
        return;
      }
      // Fallback: if IO hasn't reported lately, estimate via getBoundingClientRect
      if (ref.current) {
        const est = computeRectRatio(ref.current);
        if (
          !Number.isFinite(latestRatio.current) ||
          latestRatio.current === 0
        ) {
          latestRatio.current = est;
          isVisible.current = latestRatio.current >= requiredRatio;
        }
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
  }, [secondsRequired, isCompleted, requiredRatio, ref]);

  return { visibleSeconds, isCompleted };
}
