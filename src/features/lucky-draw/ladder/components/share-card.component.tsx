import type { JSX } from 'react';

import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import type { LuckyDrawLadderShareCardType } from '../../types/lucky-draw.type';
import { formatLuckyDrawShareMore } from '../../utils/lucky-draw-share.util';

type LuckyDrawLadderShareCardPropsType = Readonly<{
  card: LuckyDrawLadderShareCardType;
}>;

/** 줄 수별 글자 크기와 줄 높이 (ui-ux 4장 사다리) */
function getRowClass(rowCount: number): string {
  if (rowCount <= 5) return 'h-16 text-[26px]';
  if (rowCount <= 8) return 'h-12 text-[22px]';
  return 'h-10 text-xl';
}

/**
 * LuckyDrawLadderShareCardComponent
 * - 공유 카드 본문. 참가자 → 결과 줄. 버튼, 링크, 제목 태그, 이미지 없음.
 */
export function LuckyDrawLadderShareCardComponent({
  card,
}: LuckyDrawLadderShareCardPropsType): JSX.Element {
  const { rows, hiddenCount } = card.body;
  const rowClass = getRowClass(rows.length);
  return (
    <ShareCardFrameComponent frame={card.frame}>
      <div className="w-full">
        {rows.map((row, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 카드는 정적 렌더링이며 같은 이름이 중복될 수 있다
            key={index}
            className={`grid grid-cols-[1fr_48px_1fr] items-center gap-2 leading-tight ${rowClass}`}
          >
            <span className="truncate text-right font-semibold">
              {row.left}
            </span>
            <span aria-hidden="true" className="flex items-center">
              <span className="size-2 shrink-0 rounded-full bg-share-card-fg" />
              <span className="h-[1.5px] flex-1 bg-share-card-fg" />
              <span className="size-2 shrink-0 rounded-full bg-share-card-accent-lucky" />
            </span>
            <span className="truncate text-left font-bold text-share-card-accent-lucky">
              {row.right}
            </span>
          </div>
        ))}
        {hiddenCount > 0 ? (
          <p className="pt-2 text-center text-base text-share-card-muted">
            {formatLuckyDrawShareMore(hiddenCount)}
          </p>
        ) : null}
      </div>
    </ShareCardFrameComponent>
  );
}
