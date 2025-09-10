'use client';

import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { creditBuildCostLabel, LottoCsvUtils } from '@/utils';
import { useCreditStore } from '@/stores';
import { CREDIT_SPEND_COST } from '@/constants';
import { LottoClientCsvButtonType } from '@/types';
import { spendCredits } from '@/services';
import { toast } from 'sonner';

export function ClientCsvButtonComponent({
  className,
  headers,
  rows,
  filename = 'export.csv',
  baseLabel = 'CSV 내보내기',
}: LottoClientCsvButtonType) {
  const [busy, setBusy] = useState<boolean>(false);
  const { setTotal } = useCreditStore();
  const amount: number = CREDIT_SPEND_COST.csv;
  const label: string = useMemo<string>(
    () =>
      creditBuildCostLabel({
        spendKey: 'csv',
        baseLabel,
        busyLabel: '내보내는 중…',
        isBusy: busy,
      }),
    [baseLabel, busy]
  );

  const handleProceed = async () => {
    try {
      setBusy(true);
      // server-side spend first
      const res = await spendCredits(amount);
      if (!res.ok) {
        if (typeof res.credits === 'number') setTotal(res.credits);
        toast.error('크레딧이 부족하거나 요청을 처리할 수 없습니다.');
        return;
      }
      setTotal(res.credits);
      const csv: string = LottoCsvUtils.buildCsvFrom(headers, rows);
      const blob: Blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      LottoCsvUtils.triggerDownload(blob, filename);
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
