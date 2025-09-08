// Shared idle scheduling helpers
// Avoids global augmentation and works across browsers gracefully.

export type IdleHandle = number;

export function scheduleIdle(fn: () => void): IdleHandle {
  if (typeof window === 'undefined') return 0;
  const w = window as Window & {
    requestIdleCallback?: (
      cb: (deadline: {
        didTimeout: boolean;
        timeRemaining: () => number;
      }) => void,
      options?: IdleRequestOptions
    ) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(() => fn());
  }
  return window.setTimeout(fn, 0);
}

export function cancelIdle(id: IdleHandle): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & {
    cancelIdleCallback?: (handle: number) => void;
  };
  if (typeof w.cancelIdleCallback === 'function') {
    w.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}
