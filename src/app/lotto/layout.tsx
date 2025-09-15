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
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <div className="pt-6">
        <LottoWarningAlertComponent
          includeAgeNotice={true}
          space="md"
          xSpace="lg"
        />
      </div>
      {children}
      <LottoFooterNoticeComponent />
    </div>
  );
}
