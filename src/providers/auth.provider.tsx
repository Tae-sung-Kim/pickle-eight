'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import { ensureAnonymousUser, subscribeAuth } from '@/services';

type AuthContextValue = {
  readonly user: User | null;
  readonly loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        const u = await ensureAnonymousUser();
        setUser(u);
      } catch {
        // noop: allow null user
      } finally {
        setLoading(false);
      }
      unsub = subscribeAuth((u) => setUser(u));
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
