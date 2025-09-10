'use client';
import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { exportLottoCsv } from '@/services';
import { creditBuildCostLabel, LottoCsvUtils } from '@/utils';
import { useCreditStore } from '@/stores';
import { SPEND_COST } from '@/constants';
import { spendCredits } from '@/services';
import { toast } from 'sonner';

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
  const { setTotal } = useCreditStore();
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
      // server-side spend first
      const spendRes = await spendCredits(amount);
      if (!spendRes.ok) {
        if (typeof spendRes.credits === 'number') setTotal(spendRes.credits);
        toast.error('크레딧이 부족하거나 요청을 처리할 수 없습니다.');
        return;
      }
      setTotal(spendRes.credits);
      const { blob, filename } = await exportLottoCsv({ from, to });
      LottoCsvUtils.triggerDownload(blob, filename || 'lotto_export.csv');
    } catch (e) {
      toast.error(
        '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' + e
      );
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
