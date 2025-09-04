import { useEffect, useRef, useState } from 'react';
import { CREDIT_POLICY } from '@/constants';
import { useCreditStore } from '@/stores';
import { computeRewardByWatch } from '@/utils';
import { AdCreditReturn } from '@/types';

export function useAdCredit(): AdCreditReturn {
  const { todayEarned, lastEarnedAt, overCapLocked } = useCreditStore();
  const [cooldownMsLeft, setCooldownMsLeft] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const adStartTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    const updateLeft = () => {
      const last: number = lastEarnedAt ?? 0;
      const since: number = Date.now() - last;
      const left: number = Math.max(0, CREDIT_POLICY.cooldownMs - since);
      setCooldownMsLeft(left);
    };
    updateLeft();
    const id = setInterval(updateLeft, 1000);
    return () => clearInterval(id);
  }, [lastEarnedAt]);

  const inCooldown: boolean = cooldownMsLeft > 0;
  const reachedDailyCap: boolean =
    overCapLocked || todayEarned >= CREDIT_POLICY.dailyCap;
  const canWatchAd: boolean = !inCooldown && !reachedDailyCap;

  const getWatchedMs = (): number => {
    if (isPlayingRef.current && adStartTimeRef.current !== null)
      return accumulatedMsRef.current + (Date.now() - adStartTimeRef.current);
    return accumulatedMsRef.current;
  };

  const ensureStarted = () => {
    const now = Date.now();
    if (!isPlayingRef.current) {
      adStartTimeRef.current = now;
      isPlayingRef.current = true;
      setPlaying(true);
      setElapsedMs(getWatchedMs());
    }
  };

  const handlePause = () => {
    if (!isPlayingRef.current) return;
    const now = Date.now();
    if (adStartTimeRef.current !== null)
      accumulatedMsRef.current += now - adStartTimeRef.current;
    adStartTimeRef.current = null;
    isPlayingRef.current = false;
    setPlaying(false);
    setElapsedMs(accumulatedMsRef.current);
  };

  useEffect(() => {
    if (!playing) return;
    const tick = () => setElapsedMs(getWatchedMs());
    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [playing]);

  const resetElapsed = () => {
    adStartTimeRef.current = null;
    accumulatedMsRef.current = 0;
    isPlayingRef.current = false;
    setPlaying(false);
    setElapsedMs(0);
  };

  const bindMediaElement = (el: HTMLMediaElement) => {
    const anyEl = el as unknown as { __apx_bound?: boolean };
    if (anyEl.__apx_bound) return;
    anyEl.__apx_bound = true;
    el.addEventListener('play', ensureStarted);
    el.addEventListener('playing', ensureStarted);
    el.addEventListener('pause', handlePause);
    el.addEventListener('ended', handlePause);
  };

  const hasStarted: boolean =
    isPlayingRef.current || accumulatedMsRef.current > 0;
  const currentReward: number = computeRewardByWatch(elapsedMs);

  return {
    cooldownMsLeft,
    inCooldown,
    reachedDailyCap,
    canWatchAd,
    elapsedMs,
    currentReward,
    ensureStarted,
    handlePause,
    getWatchedMs,
    resetElapsed,
    playing,
    hasStarted,
    bindMediaElement,
  } as const;
}
