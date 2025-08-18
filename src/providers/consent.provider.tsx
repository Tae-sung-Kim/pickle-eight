'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ConsentState = 'unknown' | 'accepted' | 'declined';

interface ConsentContextValue {
  readonly state: ConsentState;
  readonly visible: boolean;
  accept: () => void;
  decline: () => void;
  open: () => void;
  close: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = 'cookie_consent_v1' as const;
  const [state, setState] = useState<ConsentState>('unknown');
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

  const accept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* noop */
    }
    setState('accepted');
    setVisible(false);
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {
      /* noop */
    }
    setState('declined');
    setVisible(false);
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({ state, visible, accept, decline, open, close }),
    [state, visible, accept, decline, open, close]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
