'use client';

import React from 'react';
import { useAdConfig } from '@/queries';
import AdFitSlotComponent from './adfit-slot.component';

export type AdFitMobileTopSlotProps = {
  readonly className?: string;
};

/**
 * Mobile-only top banner. Visible on small screens, hidden on md+.
 */
export function AdFitMobileTopSlotComponent({
  className,
}: AdFitMobileTopSlotProps) {
  const { data } = useAdConfig();
  const unitId = data?.mobileTop?.mobile?.unitId;
  const width = data?.mobileTop?.mobile?.width ?? 320;
  const height = data?.mobileTop?.mobile?.height ?? 100;

  // If not configured, render nothing on small screens to keep layout simple
  if (!unitId) return null;

  return (
    <div className={['block md:hidden', className].filter(Boolean).join(' ')}>
      <AdFitSlotComponent unitId={unitId} width={width} height={height} />
    </div>
  );
}

export default AdFitMobileTopSlotComponent;
