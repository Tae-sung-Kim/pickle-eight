import type { JSX, Ref } from 'react';
import { TAROT_THREE_CARD_RESULT_TITLE } from '@/features/tarot/constants/tarot-notice.constant';
import { TarotCardReadingComponent } from '@/features/tarot/shared/components/card-reading.component';
import type {
  TarotCardType,
  TarotSpreadPositionType,
} from '@/features/tarot/types/tarot.type';
import { cn } from '@/lib/utils';

export type TarotThreeCardSpreadResultEntryType = Readonly<{
  position: TarotSpreadPositionType;
  card: TarotCardType;
  isReversed: boolean;
}>;

export type TarotThreeCardSpreadResultComponentPropsType = {
  /** 과거 → 현재 → 미래 순서 */
  entries: readonly TarotThreeCardSpreadResultEntryType[];
  /** 공개 직후 root가 포커스를 옮기는 sr-only h2 */
  titleRef?: Ref<HTMLHeadingElement>;
};

/**
 * TarotThreeCardSpreadResultComponent
 * - sr-only h2 "세 장의 결과" 아래 위치별 읽기 블록 3개(h3, 위치 안내, 카드 읽기 글).
 * - 카드 그림은 넣지 않는다(무대에만 한 번). 모바일은 세로로 쌓고, md 이상은 3열이다.
 *   3열 폭과 좌우 여백은 root 무대의 3열 그리드와 같아서 각 열이 위 카드 아래에 놓인다.
 * - md 이상에서는 위치 이름이 카드 위에 이미 보이므로 h3는 시각적으로만 숨긴다(문서 구조는 유지).
 */
export function TarotThreeCardSpreadResultComponent({
  entries,
  titleRef,
}: TarotThreeCardSpreadResultComponentPropsType): JSX.Element {
  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-start md:px-6">
      <h2 ref={titleRef} tabIndex={-1} className="sr-only outline-none">
        {TAROT_THREE_CARD_RESULT_TITLE}
      </h2>
      {entries.map((entry, index) => (
        <div
          key={entry.position.key}
          className={cn(
            'relative space-y-3',
            index > 0 && 'border-t border-border pt-6 md:border-t-0 md:pt-0'
          )}
        >
          <div className="space-y-1">
            <h3 className="text-lg leading-snug font-semibold text-foreground md:sr-only">
              {entry.position.label}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {entry.position.guide}
            </p>
          </div>
          <TarotCardReadingComponent
            card={entry.card}
            isReversed={entry.isReversed}
            titleAs="p"
          />
        </div>
      ))}
    </div>
  );
}
