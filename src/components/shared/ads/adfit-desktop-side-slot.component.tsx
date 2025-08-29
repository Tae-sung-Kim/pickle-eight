'use client';

import React from 'react';
import { useAdConfig } from '@/queries';
import AdFitSlotComponent from './adfit-slot.component';

export type AdFitDesktopSideSlotProps = {
  readonly className?: string;
};

/**
 * Desktop-only side banner (e.g., 300x600). Visible on md+, hidden on small screens.
 */
export function AdFitDesktopSideSlotComponent({
  className,
}: AdFitDesktopSideSlotProps) {
  const { data } = useAdConfig();
  const unitId = data?.desktopSide?.desktop?.unitId;
  const width = data?.desktopSide?.desktop?.width ?? 300;
  const height = data?.desktopSide?.desktop?.height ?? 600;

  if (!unitId) return null;

  return (
    <div className={['hidden md:block', className].filter(Boolean).join(' ')}>
      <AdFitSlotComponent unitId={unitId} width={width} height={height} />
    </div>
  );
}

export default AdFitDesktopSideSlotComponent;
