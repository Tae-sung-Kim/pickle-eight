import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase-config';
import { logEvent } from 'firebase/analytics';
import { getTodayString } from '@/utils';

export const usePageView = (page: string): void => {
  useEffect(() => {
    getAnalyticsClient().then((analytics) => {
      if (analytics) {
        logEvent(analytics, 'page_view', { page });
      }
    });

    // 오늘 날짜 (YYYY-MM-DD)
    const today = getTodayString();
    const storageKey = `${process.env.NEXT_PUBLIC_SITE_NAME}-telegram-notified-date`;
    const notifiedDate = localStorage.getItem(storageKey);

    if (notifiedDate !== today) {
      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `📢 Someone visited: ${page}` }),
      });
      localStorage.setItem(storageKey, today);
    }
  }, [page]);
};
