import type { JSX } from 'react';

import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import type { LuckyDrawLotsShareCardType } from '../../types/lucky-draw.type';
import { formatLuckyDrawShareMore } from '../../utils/lucky-draw-share.util';

type LuckyDrawLotsShareCardPropsType = Readonly<{
  card: LuckyDrawLotsShareCardType;
}>;

/**
 * 줄 수별 글자 크기와 줄 높이 (ui-ux 4장 제비뽑기).
 * 9~12줄은 명세의 32px 줄 높이로는 12줄과 "외 n개"가 본문 높이에 들어가지 않아 28px로 줄였다.
 */
function getRowClass(rowCount: number): string {
  if (rowCount <= 4) return 'h-[72px] text-[28px]';
  if (rowCount <= 8) return 'h-12 text-2xl';
  return 'h-7 text-xl';
}

/**
 * LuckyDrawLotsShareCardComponent
 * - 공유 카드 본문. 열린 카드를 연 순서대로 쪽지 모양 줄로 보여 준다.
 * - 버튼, 링크, 제목 태그, 이미지 없음.
 */
export function LuckyDrawLotsShareCardComponent({
  card,
}: LuckyDrawLotsShareCardPropsType): JSX.Element {
  const { rows, hiddenCount } = card.body;
  const rowClass = getRowClass(rows.length);
  return (
    <ShareCardFrameComponent frame={card.frame}>
      <div className="flex w-full flex-col gap-1">
        {rows.map((row, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 카드는 정적 렌더링이며 같은 항목이 중복될 수 있다
            key={index}
            className={`box-border flex items-center rounded-lg border-[1.5px] border-share-card-accent-lucky bg-share-card-accent-lucky/10 leading-none ${rowClass}`}
          >
            <span className="w-24 shrink-0 truncate px-3 text-center">
              {row.left}
            </span>
            <span
              aria-hidden="true"
              className="h-3/5 w-px shrink-0 bg-share-card-accent-lucky"
            />
            <span className="min-w-0 flex-1 truncate px-3 font-bold">
              {row.right}
            </span>
          </div>
        ))}
        {hiddenCount > 0 ? (
          <p className="h-7 text-center text-base leading-7 text-share-card-muted">
            {formatLuckyDrawShareMore(hiddenCount)}
          </p>
        ) : null}
      </div>
    </ShareCardFrameComponent>
  );
}
