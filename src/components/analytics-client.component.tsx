'use client';

import React from 'react';
import { usePageView } from '@/hooks';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/providers/consent.provider';

function AnalyticsRunner({ pathname }: { pathname: string }) {
  usePageView(pathname);
  return null;
}

export default function AnalyticsClientComponent() {
  const pathname = usePathname();
  const { state } = useConsent();
  if (state !== 'accepted') return null;
  return <AnalyticsRunner pathname={pathname} />;
}
