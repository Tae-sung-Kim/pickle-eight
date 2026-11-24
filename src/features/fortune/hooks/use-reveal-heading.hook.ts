import { type RefObject, useEffect } from 'react';

/** 패널이 이 비율 이상 화면에 보이면 스크롤하지 않는다 */
const VISIBLE_RATIO_MIN = 0.5;

function isMostlyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  if (rect.height <= 0) {
    return true;
  }
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return visible / rect.height >= VISIBLE_RATIO_MIN;
}

/**
 * 마운트되면 제목으로 포커스를 옮기고, 패널이 절반 이상 보이지 않을 때만 패널 위로 스크롤한다.
 * 동작 줄이기 설정이면 즉시 이동한다. enabled가 false면 아무것도 하지 않는다.
 */
export function useRevealHeadingOnMount(
  panelRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const panel = panelRef.current;
    headingRef.current?.focus({ preventScroll: true });
    if (!panel || isMostlyVisible(panel)) {
      return;
    }
    const isReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    panel.scrollIntoView({
      behavior: isReduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [enabled, panelRef, headingRef]);
}
