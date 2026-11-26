import type { JSX } from 'react';
import { TAROT_ORIENTATION_LABELS } from '@/features/tarot/constants/tarot-notice.constant';
import { TarotCardFaceComponent } from '@/features/tarot/shared/components/card-face.component';
import type {
  TarotShareCardType,
  TarotShareItemType,
} from '@/features/tarot/utils/tarot-share.util';
import { cn } from '@/lib/utils';

// 카드 틀 SVG가 var(--card)를 쓴다. 다크 모드에서 어두워지지 않게 라이트 값으로 고정한다
const FACE_FIXED_CLASS = '[--card:var(--share-card-paper)]';

/** 방향 라벨. 역방향은 굵은 강조 테두리, 정방향은 가는 테두리로 글자 외에도 구분한다 */
function OrientationPill({
  isReversed,
  size,
}: Readonly<{ isReversed: boolean; size: 'lg' | 'sm' }>): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border leading-none whitespace-nowrap',
        size === 'lg' ? 'h-8 px-3.5 text-xl' : 'h-6 px-2 text-base',
        isReversed
          ? 'border-2 border-share-card-accent-tarot font-bold text-share-card-accent-tarot'
          : 'border-share-card-border text-share-card-muted',
        !isReversed && (size === 'lg' ? 'font-normal' : 'font-semibold')
      )}
    >
      {isReversed
        ? TAROT_ORIENTATION_LABELS.reversed
        : TAROT_ORIENTATION_LABELS.upright}
    </span>
  );
}

function DailyBody({ item }: Readonly<{ item: TarotShareItemType }>) {
  return (
    <div className="flex h-[410px] w-[440px] items-center gap-6">
      <div className={cn('w-[180px] shrink-0', FACE_FIXED_CLASS)}>
        <TarotCardFaceComponent
          card={item.card}
          isReversed={false}
          className="w-full text-share-card-accent-tarot"
        />
      </div>
      <div className="flex w-[236px] flex-col items-start">
        <OrientationPill isReversed={item.isReversed} size="lg" />
        <p className="mt-3 line-clamp-2 text-[32px] leading-[1.2] font-bold text-share-card-fg">
          {item.card.nameKo}
        </p>
        <p className="mt-1 line-clamp-2 text-lg leading-[1.35] text-share-card-muted">
          {item.card.nameEn}
        </p>
        <span className="my-3.5 block h-px w-10 bg-share-card-border" />
        <p className="line-clamp-6 text-xl leading-[1.55] text-share-card-fg">
          {item.summary}
        </p>
      </div>
    </div>
  );
}

function ThreeBody({
  items,
}: Readonly<{ items: readonly TarotShareItemType[] }>) {
  return (
    <div className="flex h-[410px] w-[440px] flex-col justify-center">
      {items.map((item, index) => (
        <div key={item.positionLabel ?? index}>
          {index > 0 ? (
            <span className="my-2 block h-px w-full bg-share-card-border" />
          ) : null}
          <div className="flex h-[124px] items-start gap-4">
            <div className={cn('w-[73px] shrink-0', FACE_FIXED_CLASS)}>
              <TarotCardFaceComponent
                card={item.card}
                isReversed={false}
                className="w-full text-share-card-accent-tarot"
              />
            </div>
            <div className="w-[351px]">
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <span className="text-xl leading-none font-bold text-share-card-accent-tarot">
                  {item.positionLabel}
                </span>
                <span className="text-[22px] leading-[1.2] font-bold text-share-card-fg">
                  {item.card.nameKo}
                </span>
                <OrientationPill isReversed={item.isReversed} size="sm" />
              </div>
              <p className="mt-1.5 line-clamp-2 text-lg leading-normal text-share-card-fg">
                {item.summary}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 타로 공유 카드 본문(한 장은 오늘의 타로, 세 장은 시안 A 세로 3행).
 * 그림은 뒤집지 않고 방향은 글자 라벨로만 보인다. 버튼, 링크, 모션 없음.
 */
export function TarotShareCardComponent({
  items,
}: Pick<TarotShareCardType, 'items'>): JSX.Element {
  return items.length === 1 && items[0] ? (
    <DailyBody item={items[0]} />
  ) : (
    <ThreeBody items={items} />
  );
}
