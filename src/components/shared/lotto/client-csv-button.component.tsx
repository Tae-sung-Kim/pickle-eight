'use client';

import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { useAdCredit } from '@/hooks';
import { LottoCsvUtils } from '@/utils';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';

export type ClientCsvButtonProps = {
  readonly className?: string;
  readonly headers: readonly string[];
  readonly rows: ReadonlyArray<readonly (string | number)[]>;
  readonly filename?: string;
  readonly baseLabel?: string;
};

export function ClientCsvButtonComponent({
  className,
  headers,
  rows,
  filename = 'export.csv',
  baseLabel = 'CSV 내보내기',
}: ClientCsvButtonProps) {
  const { buildCostLabel } = useAdCredit();
  const [busy, setBusy] = useState<boolean>(false);
  const { onSpend } = useCreditStore();
  const amount: number = SPEND_COST.csv;
  const label: string = useMemo<string>(
    () =>
      buildCostLabel({
        spendKey: 'csv',
        baseLabel,
        busyLabel: '내보내는 중…',
        isBusy: busy,
      }),
    [buildCostLabel, baseLabel, busy]
  );

  const handleProceed = async () => {
    try {
      setBusy(true);
      const csv: string = LottoCsvUtils.buildCsvFrom(headers, rows);
      const blob: Blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      LottoCsvUtils.triggerDownload(blob, filename);
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
