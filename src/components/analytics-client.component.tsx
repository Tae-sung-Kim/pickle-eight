'use client';

import React, { useEffect } from 'react';
import { usePageView } from '@/hooks';
import { usePathname } from 'next/navigation';
import { useConsentContext } from '@/providers';

function AnalyticsRunner({ pathname }: { pathname: string }) {
  usePageView(pathname);
  return null;
}

function TelegramRunner({ pathname }: { pathname: string }) {
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const storageKey = `${process.env.NEXT_PUBLIC_SITE_NAME}-telegram-notified-date`;
      const notifiedDate = localStorage.getItem(storageKey);
      if (notifiedDate !== today) {
        fetch('/api/notify-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `📢 Someone visited: ${pathname}` }),
        }).finally(() => {
          try {
            localStorage.setItem(storageKey, today);
          } catch {
            /* noop */
          }
        });
      }
    } catch {
      /* noop */
    }
  }, [pathname]);
  return null;
}

export function AnalyticsClientComponent() {
  const pathname = usePathname();
  const { state } = useConsentContext();
  return (
    <>
      <TelegramRunner pathname={pathname} />
      {state === 'accepted' ? <AnalyticsRunner pathname={pathname} /> : null}
    </>
  );
}

export default AnalyticsClientComponent;
