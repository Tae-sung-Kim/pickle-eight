import { PageHeaderComponent } from '@/components/layouts/page-header.component';
import { LottoFooterNoticeComponent } from '@/components/shared/lotto/footer-notice.component';
import { LottoWarningAlertComponent } from '@/components/shared/lotto/warning-alert.component';
import { Circle } from 'lucide-react';
import type { JSX, ReactNode } from 'react';

export default function LottoLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      <PageHeaderComponent
        title="로또 분석실"
        description="역대 당첨 번호 분석부터 번호 생성, 가상 시뮬레이션까지 로또의 모든 것을 만나보세요."
        icon={Circle}
        breadcrumbs={[{ label: '로또 분석실' }]}
      />
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">
        <LottoWarningAlertComponent
          includeAgeNotice={true}
          space="md"
          xSpace="lg"
        />
        <div className="mt-6">{children}</div>
        <LottoFooterNoticeComponent />
      </div>
    </>
  );
}
