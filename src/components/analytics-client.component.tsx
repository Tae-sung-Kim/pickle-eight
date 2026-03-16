'use client';

import { usePageView } from '@/hooks/use-analytics.hook';
import { useConsentContext } from '@/providers/consent.provider';
import { getCachedData, setCachedData } from '@/utils/common.util';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function AnalyticsRunner({ pathname }: { pathname: string }) {
  usePageView(pathname);
  return null;
}

function TelegramRunner({ pathname }: { pathname: string }) {
  useEffect(() => {
    try {
      const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? '운빨연구소';
      const storageKey = `${siteName}_telegram-notified`;
      const alreadyNotified = getCachedData(storageKey);
      if (!alreadyNotified) {
        fetch('/api/notify-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `📢 Someone visited: ${pathname}` }),
        }).finally(() => {
          try {
            setCachedData(storageKey, '1'); // 다음날 자정까지 유효
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
      {state === 'accepted' ? (
        <>
          <TelegramRunner pathname={pathname} />
          <AnalyticsRunner pathname={pathname} />
        </>
      ) : null}
    </>
  );
}
