'use client';

import type { JSX } from 'react';
import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { FORTUNE_COMPATIBILITY_SHARE_TARGETS } from '@/features/fortune/constants/fortune-compatibility-share.constant';
import { FortuneCompatibilityShareCardComponent } from '@/features/fortune/shared/components/compatibility-share-card.component';
import type { FortuneCompatibilityShareInputType } from '@/features/fortune/types/fortune-compatibility.type';
import { buildFortuneCompatibilityShareCard } from '@/features/fortune/utils/fortune-compatibility-share.util';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';

/**
 * FortuneCompatibilityShareComponent
 * - 궁합 결과 아래의 공유 버튼과 화면 밖 카드. 카드에는 두 이름, 등급, 요약 한 줄만 들어간다(생년월일·입력 정보 없음).
 */
export function FortuneCompatibilityShareComponent(
  input: FortuneCompatibilityShareInputType
): JSX.Element | null {
  const card = buildFortuneCompatibilityShareCard(input);
  const { cardRef, controller } = useShare({
    target: FORTUNE_COMPATIBILITY_SHARE_TARGETS[input.kind],
    cardKey: card ? toShareCardKey(card.body) : null,
    requiresPreview: false,
  });
  if (!card) return null;

  const { frame, body } = card;
  return (
    <>
      <SharePanelComponent
        controller={controller}
        previewAlt={`${frame.featureName} ${body.firstName} ${body.secondName} ${body.gradeName} ${body.summary}`}
        previewTexts={[
          frame.featureName,
          `${body.firstName} ${body.secondName}`,
          body.gradeName,
          body.summary,
          frame.notice,
        ]}
      />
      <ShareCardHostComponent ref={cardRef}>
        <ShareCardFrameComponent frame={frame}>
          <FortuneCompatibilityShareCardComponent {...body} />
        </ShareCardFrameComponent>
      </ShareCardHostComponent>
    </>
  );
}
