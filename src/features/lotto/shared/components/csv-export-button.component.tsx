'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportLottoCsv } from '@/features/lotto/services/lotto.service';
import { LottoCsvUtils } from '@/features/lotto/utils/lotto.util';

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

  const handleClick = async (): Promise<void> => {
    try {
      setBusy(true);
      const { blob, filename } = await exportLottoCsv({ from, to });
      LottoCsvUtils.triggerDownload(blob, filename || 'lotto_export.csv');
    } catch {
      toast.error(
        '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      disabled={busy}
      onClick={handleClick}
    >
      {busy ? '내보내는 중…' : 'CSV 내보내기'}
    </Button>
  );
}
