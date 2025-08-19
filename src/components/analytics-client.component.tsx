'use client';

import React from 'react';
import { usePageView } from '@/hooks';
import { usePathname } from 'next/navigation';
import { useConsentContext } from '@/providers';

function AnalyticsRunner({ pathname }: { pathname: string }) {
  usePageView(pathname);
  return null;
}

export function AnalyticsClientComponent() {
  const pathname = usePathname();
  const { state } = useConsentContext();
  if (state !== 'accepted') return null;
  return <AnalyticsRunner pathname={pathname} />;
}

export default AnalyticsClientComponent;
