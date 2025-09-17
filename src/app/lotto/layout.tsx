import { LottoFooterNoticeComponent } from '@/components/shared/lotto/footer-notice.component';
import { LottoWarningAlertComponent } from '@/components/shared/lotto/warning-alert.component';
import type { JSX, ReactNode } from 'react';

export function LottoLayout({
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
