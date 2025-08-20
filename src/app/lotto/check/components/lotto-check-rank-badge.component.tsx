export function LottoCheckRankBadgeComponent({
  rank,
}: {
  rank: 0 | 1 | 2 | 3 | 4 | 5;
}) {
  const label = rank === 0 ? '미당첨' : `${rank}등`;
  const color =
    rank === 1
      ? 'bg-emerald-600'
      : rank === 2
      ? 'bg-blue-600'
      : rank === 3
      ? 'bg-purple-600'
      : rank === 4
      ? 'bg-amber-600'
      : rank === 5
      ? 'bg-gray-700'
      : 'bg-gray-400';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${color}`}
    >
      {label}
    </span>
  );
}

export default LottoCheckRankBadgeComponent;
