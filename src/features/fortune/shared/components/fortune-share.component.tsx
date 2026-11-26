'use client';

import type { JSX } from 'react';
import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { FORTUNE_SHARE_TARGETS } from '@/features/fortune/constants/fortune-share.constant';
import { FortuneShareCardComponent } from '@/features/fortune/shared/components/fortune-share-card.component';
import {
  buildFortuneShareCard,
  type FortuneShareInputType,
} from '@/features/fortune/utils/fortune-share.util';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';

/**
 * FortuneShareComponent
 * - 운세 결과 아래에 놓는 공유 버튼과 화면 밖 카드. 결과가 있을 때만 그린다.
 * - 카드에는 요약, 행운 요소, 띠·별자리 이름만 들어간다(생년월일·입력 이름 없음).
 */
export function FortuneShareComponent(
  input: FortuneShareInputType
): JSX.Element | null {
  const card = buildFortuneShareCard(input);
  const { cardRef, controller } = useShare({
    target: FORTUNE_SHARE_TARGETS[input.kind],
    cardKey: card ? toShareCardKey(card.body) : null,
    requiresPreview: false,
  });
  if (!card) return null;

  const { frame, body } = card;
  return (
    <>
      <SharePanelComponent
        controller={controller}
        previewAlt={`${frame.featureName} ${body.name ?? ''} ${body.summary}`.replace(
          /\s+/g,
          ' '
        )}
        previewTexts={[
          frame.featureName,
          ...(body.name ? [body.name] : []),
          body.summary,
          frame.notice,
        ]}
      />
      <ShareCardHostComponent ref={cardRef}>
        <ShareCardFrameComponent frame={frame}>
          <FortuneShareCardComponent {...body} />
        </ShareCardFrameComponent>
      </ShareCardHostComponent>
    </>
  );
}
