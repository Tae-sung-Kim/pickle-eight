'use client';

import { usePageView } from '@/hooks';
import { usePathname } from 'next/navigation';

export default function AnalyticsClientComponent() {
  const pathname = usePathname();
  usePageView(pathname);
  return null;
}
