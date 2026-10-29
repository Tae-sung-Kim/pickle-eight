'use client';
import { Button } from '@/components/ui/button';
import type { LottoClientCsvButtonType } from '@/features/lotto/types/lotto.type';
import { LottoCsvUtils } from '@/features/lotto/utils/lotto.util';

export function ClientCsvButtonComponent({
  className,
  headers,
  rows,
  filename = 'export.csv',
  baseLabel = 'CSV 내보내기',
}: LottoClientCsvButtonType) {
  const handleClick = (): void => {
    const csv: string = LottoCsvUtils.buildCsvFrom(headers, rows);
    const blob: Blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    LottoCsvUtils.triggerDownload(blob, filename);
  };

  return (
    <Button type="button" className={className} onClick={handleClick}>
      {baseLabel}
    </Button>
  );
}
