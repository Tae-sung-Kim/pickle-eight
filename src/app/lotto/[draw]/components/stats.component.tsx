import { ReactElement } from 'react';

export type LottoDrawStatsType = {
  data: number;
  title: string;
  unitName: string;
};

export function LottoDrawStatsComponent({
  data,
  title,
  unitName,
}: LottoDrawStatsType): ReactElement {
  return (
    <div className="rounded-md border bg-surface-card p-4 border-border">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">
        {data.toLocaleString()} {unitName}
      </div>
    </div>
  );
}

export default LottoDrawStatsComponent;
