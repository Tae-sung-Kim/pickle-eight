import { getAnalyticsClient } from "@/lib/firebase-config";
import { useConsentContext } from "@/providers/consent.provider";
import { logEvent } from 'firebase/analytics';
import { useEffect } from 'react';

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
