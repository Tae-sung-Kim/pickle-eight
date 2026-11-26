'use client';

import type { JSX } from 'react';
import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { TAROT_SHARE_TARGETS } from '@/features/tarot/constants/tarot-share.constant';
import { TarotShareCardComponent } from '@/features/tarot/shared/components/tarot-share-card.component';
import {
  buildTarotShareCard,
  type TarotShareInputType,
} from '@/features/tarot/utils/tarot-share.util';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';

type TarotSharePropsType = Readonly<{
  inputs: readonly TarotShareInputType[];
  /** 한 장은 오늘의 타로, 세 장은 세 장 타로 */
  count: 1 | 3;
}>;

/**
 * TarotShareComponent
 * - 타로 결과 아래 공유 버튼과 화면 밖 카드. 카드 데이터가 모자라면 그리지 않는다.
 * - 위기 신호 질문 결과, 뽑기 전, 뒤집기 중에는 부모가 이 컴포넌트를 그리지 않는다.
 */
export function TarotShareComponent({
  inputs,
  count,
}: TarotSharePropsType): JSX.Element | null {
  const card = buildTarotShareCard(inputs, count);
  const { cardRef, controller } = useShare({
    target: TAROT_SHARE_TARGETS[count === 1 ? 'daily' : 'threeCard'],
    cardKey: card
      ? toShareCardKey(
          card.items.map((item) => [
            item.card.id,
            item.isReversed,
            item.positionLabel,
          ])
        )
      : null,
    requiresPreview: false,
  });
  if (!card) return null;

  const { frame, items } = card;
  return (
    <>
      <SharePanelComponent
        controller={controller}
        previewAlt={`${frame.featureName} ${items
          .map((item) => item.card.nameKo)
          .join(' ')}`}
        previewTexts={[
          frame.featureName,
          ...items.map((item) => item.card.nameKo),
          frame.notice,
        ]}
      />
      <ShareCardHostComponent ref={cardRef}>
        <ShareCardFrameComponent frame={frame}>
          <TarotShareCardComponent items={items} />
        </ShareCardFrameComponent>
      </ShareCardHostComponent>
    </>
  );
}
