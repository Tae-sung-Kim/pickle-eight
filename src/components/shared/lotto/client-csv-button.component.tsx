import { useMemo, useState } from 'react';
import { CreditGateButtonComponent } from '@/components';
import { useAdCredit } from '@/hooks';

export type ClientCsvButtonProps = {
  readonly className?: string;
  readonly headers: readonly string[];
  readonly rows: ReadonlyArray<readonly (string | number)[]>;
  readonly filename?: string;
  readonly baseLabel?: string;
};

function toCsvCell(v: string | number): string {
  const s: string = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCsv(
  headers: readonly string[],
  rows: ReadonlyArray<readonly (string | number)[]>
): string {
  const head: string = headers.map(toCsvCell).join(',');
  const body: string = rows.map((r) => r.map(toCsvCell).join(',')).join('\n');
  return [head, body].filter(Boolean).join('\n');
}

function download(content: string, filename: string): void {
  const blob: Blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function ClientCsvButtonComponent({
  className,
  headers,
  rows,
  filename = 'export.csv',
  baseLabel = 'CSV 내보내기',
}: ClientCsvButtonProps) {
  const { buildCostLabel } = useAdCredit();
  const [busy, setBusy] = useState<boolean>(false);
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
      const csv: string = buildCsv(headers, rows);
      download(csv, filename);
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
