import type { JSX, ReactNode } from 'react';
import { PageHeaderComponent } from '@/components/common/page-header.component';
import { LottoFooterNoticeComponent } from '@/features/lotto/shared/components/footer-notice.component';
import { LatestResultBannerComponent } from '@/features/lotto/shared/components/latest-result-banner.component';
import { LottoWarningAlertComponent } from '@/features/lotto/shared/components/warning-alert.component';
import { AgeGateProvider } from '@/providers/age-gate.provider';

export default function LottoLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      <PageHeaderComponent
        title="로또 분석실"
        breadcrumbs={[{ label: '로또 분석실' }]}
      />
      <AgeGateProvider>
        <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">
          <LottoWarningAlertComponent
            includeAgeNotice={true}
            space="md"
            xSpace="lg"
          />
          <div className="mt-6">
            <LatestResultBannerComponent />
          </div>
          <div className="mt-6">{children}</div>
          <LottoFooterNoticeComponent />
        </div>
      </AgeGateProvider>
    </>
  );
}
