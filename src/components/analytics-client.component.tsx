'use client';

import { usePageView } from '@/hooks';

export default function AnalyticsClientComponent() {
  usePageView('home');
  return null;
}
