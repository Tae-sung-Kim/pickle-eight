'use client';
import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { exportLottoCsv } from '@/services';
import { creditBuildCostLabel, LottoCsvUtils } from '@/utils';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';

export type CsvExportButtonProps = {
  readonly className?: string;
  readonly from?: number;
  readonly to?: number;
};

export function CsvExportButtonComponent({
  className,
  from,
  to,
}: CsvExportButtonProps) {
  const [busy, setBusy] = useState<boolean>(false);
  const { onSpend } = useCreditStore();
  const amount: number = SPEND_COST.csv;
  const label: string = useMemo<string>(
    () =>
      creditBuildCostLabel({
        spendKey: 'csv',
        baseLabel: 'CSV 내보내기',
        busyLabel: '내보내는 중…',
        isBusy: busy,
      }),
    [busy]
  );

  const handleProceed = async () => {
    try {
      setBusy(true);
      const { blob, filename } = await exportLottoCsv({ from, to });
      LottoCsvUtils.triggerDownload(blob, filename || 'lotto_export.csv');
      onSpend(amount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CreditGateButtonComponent
      className={className}
      label={label}
      spendKey="csv"
      onProceed={handleProceed}
      confirmMessage={`CSV를 내보내시겠어요? (-${amount} 크레딧)`}
      deferSpend
    />
  );
}
