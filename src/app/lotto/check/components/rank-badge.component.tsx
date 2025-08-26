import { LottoLankType } from '@/types';

export function LottoCheckRankBadgeComponent({
  rank,
}: {
  rank: LottoLankType;
}) {
  const label = rank === 0 ? '미당첨' : `${rank}등`;
  const color =
    rank === 1
      ? 'bg-success text-success-foreground'
      : rank === 2
      ? 'bg-info text-info-foreground'
      : rank === 3
      ? 'bg-primary text-primary-foreground'
      : rank === 4
      ? 'bg-warning text-warning-foreground'
      : rank === 5
      ? 'bg-muted text-foreground'
      : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${color}`}
    >
      {label}
    </span>
  );
}

export default LottoCheckRankBadgeComponent;
