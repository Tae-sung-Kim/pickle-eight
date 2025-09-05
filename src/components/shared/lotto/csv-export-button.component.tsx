import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { useAdCredit } from '@/hooks';

export type CsvExportButtonProps = {
  readonly className?: string;
  readonly from?: number;
  readonly to?: number;
};

function buildExportUrl(from?: number, to?: number): string {
  const base: string = '/api/lotto/export';
  const hasFrom: boolean =
    Number.isInteger(from as number) && (from as number) > 0;
  const hasTo: boolean = Number.isInteger(to as number) && (to as number) > 0;
  if (hasFrom && hasTo) return `${base}?from=${from}&to=${to}`;
  return base;
}

async function downloadCsv(url: string): Promise<void> {
  const res: Response = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob: Blob = await res.blob();
  const cd: string | null = res.headers.get('Content-Disposition');
  let filename: string = 'lotto_export.csv';
  if (cd) {
    const m = cd.match(/filename="?([^";]+)"?/i);
    if (m && m[1]) filename = m[1];
  }
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function CsvExportButtonComponent({
  className,
  from,
  to,
}: CsvExportButtonProps) {
  const { buildCostLabel } = useAdCredit();
  const [busy, setBusy] = useState<boolean>(false);
  const label: string = useMemo<string>(
    () =>
      buildCostLabel({
        spendKey: 'csv',
        baseLabel: 'CSV 내보내기',
        busyLabel: '내보내는 중…',
        isBusy: busy,
      }),
    [buildCostLabel, busy]
  );

  const handleProceed = async () => {
    try {
      setBusy(true);
      const url: string = buildExportUrl(from, to);
      await downloadCsv(url);
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
    />
  );
}
