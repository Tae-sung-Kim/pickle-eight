'use client';
import { useEffect } from 'react';
import { analytics } from '@/lib/firebase-config';
import { logEvent } from 'firebase/analytics';

export function usePageView(page: string) {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', { page });
    }
  }, [page]);
}
