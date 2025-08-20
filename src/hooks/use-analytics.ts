import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase-config';
import { logEvent } from 'firebase/analytics';

export const usePageView = (page: string): void => {
  useEffect(() => {
    getAnalyticsClient().then((analytics) => {
      if (analytics) {
        logEvent(analytics, 'page_view', { page });
      }
    });
  }, [page]);
};
