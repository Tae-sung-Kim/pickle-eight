import type { JSX, ReactNode } from 'react';
import {
  LottoFooterNoticeComponent,
  LottoWarningAlertComponent,
} from '@/components';

export default function LottoLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="pt-6">
        <LottoWarningAlertComponent
          includeAgeNotice={true}
          space="md"
          xSpace="md"
        />
      </div>
      {children}
      <LottoFooterNoticeComponent />
    </div>
  );
}
