import { useEffect } from 'react';
import { getAnalyticsClient } from '@/lib/firebase-config';
import { logEvent } from 'firebase/analytics';
import { useConsentContext } from '@/providers';

export const usePageView = (page: string): void => {
  const { state } = useConsentContext();
  useEffect(() => {
    if (state !== 'accepted') return;
    getAnalyticsClient().then((analytics) => {
      if (analytics) {
        logEvent(analytics, 'page_view', { page });
      }
    });
  }, [page, state]);
};
