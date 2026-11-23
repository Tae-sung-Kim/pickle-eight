import type { JSX } from 'react';

export type LuckyDrawLadderResultRowType = Readonly<{
  id: string;
  name: string;
  result: string;
}>;

type LuckyDrawLadderResultListPropsType = Readonly<{
  rows: readonly LuckyDrawLadderResultRowType[];
  /** rows가 비었을 때 안내 문장 */
  emptyText: string;
}>;

/**
 * LuckyDrawLadderResultListComponent
 * - "전체 결과" 이름 → 결과 목록 (dl). 공개된 쌍만 받는다.
 */
export function LuckyDrawLadderResultListComponent({
  rows,
  emptyText,
}: LuckyDrawLadderResultListPropsType): JSX.Element {
  if (rows.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">{emptyText}</p>
    );
  }
  return (
    <dl>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-2 gap-3 border-b border-border py-2 text-sm leading-6"
        >
          <dt className="break-words text-foreground">{row.name}</dt>
          <dd className="break-words font-semibold text-foreground">
            {row.result}
          </dd>
        </div>
      ))}
    </dl>
  );
}
