'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCreditStore } from '@/stores';
import { CREDIT_POLICY } from '@/constants';

type ConsentStateType = 'unknown' | 'accepted' | 'declined';

type ConsentContextValueType = {
  readonly state: ConsentStateType;
  readonly visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onOpen: () => void;
  onClose: () => void;
};

const ConsentContext = createContext<ConsentContextValueType | null>(null);
const STORAGE_KEY = process.env.NEXT_PUBLIC_SITE_NAME + '_cookie_consent_v1';

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentStateType>('unknown');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'accepted' || v === 'declined') {
        setState(v);
        setVisible(false);
      } else {
        setState('unknown');
        setVisible(true);
      }
    } catch {
      setState('unknown');
      setVisible(true);
    }
  }, []);

  const onAccept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* noop */
    }
    setState('accepted');
    setVisible(false);
    // Resume refill ONLY if below cap AND there is no active timer yet
    try {
      const s = useCreditStore.getState();
      const noTimer = (s.lastRefillAt ?? 0) <= 0 || !s.refillArmed;
      if (s.total < CREDIT_POLICY.dailyCap && noTimer) {
        useCreditStore.setState({
          refillArmed: true,
          lastRefillAt: Date.now(),
        });
      }
      s.syncReset?.();
    } catch {
      /* noop */
    }
  }, []);

  const onDecline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {
      /* noop */
    }
    setState('declined');
    setVisible(false);
    // Revoke today's earned credits locally without touching spent usage
    try {
      useCreditStore.getState().revokeTodaysEarned?.();
      // Freeze timers immediately
      useCreditStore.setState({ refillArmed: false, lastRefillAt: 0 });
    } catch {
      /* noop */
    }
  }, []);

  const onOpen = useCallback(() => setVisible(true), []);
  const onClose = useCallback(() => setVisible(false), []);

  // Reflect transitions in either direction without resetting existing timers on load
  useEffect(() => {
    if (state === 'declined') {
      try {
        useCreditStore.getState().revokeTodaysEarned?.();
        useCreditStore.setState({ refillArmed: false, lastRefillAt: 0 });
      } catch {
        /* noop */
      }
      return;
    }
    if (state === 'accepted') {
      try {
        const s = useCreditStore.getState();
        const noTimer = (s.lastRefillAt ?? 0) <= 0 || !s.refillArmed;
        if (s.total < CREDIT_POLICY.dailyCap && noTimer) {
          useCreditStore.setState({
            refillArmed: true,
            lastRefillAt: Date.now(),
          });
        }
        s.syncReset?.();
      } catch {
        /* noop */
      }
    }
  }, [state]);

  const value = useMemo<ConsentContextValueType>(
    () => ({ state, visible, onAccept, onDecline, onOpen, onClose }),
    [state, visible, onAccept, onDecline, onOpen, onClose]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsentContext(): ConsentContextValueType {
  const ctx = useContext(ConsentContext);
  if (!ctx)
    throw new Error('useConsentContext must be used within ConsentProvider');
  return ctx;
}
