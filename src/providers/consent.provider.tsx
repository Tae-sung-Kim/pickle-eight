'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  }, []);

  const onDecline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {
      /* noop */
    }
    setState('declined');
    setVisible(false);
  }, []);

  const onOpen = useCallback(() => setVisible(true), []);
  const onClose = useCallback(() => setVisible(false), []);

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
