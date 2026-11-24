import { useState } from 'react';

import { SHARE_TEXTS } from '@/constants/share.constant';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';
import {
  LUCKY_DRAW_SHARE_DEFAULT_OPTIONS,
  LUCKY_DRAW_SHARE_TEXTS,
} from '../../constants/lucky-draw-share.constant';
import type {
  LuckyDrawLadderShareCardType,
  LuckyDrawLadderShareOptionsType,
} from '../../types/lucky-draw.type';
import {
  buildLadderShareCard,
  formatLuckyDrawShareMore,
} from '../../utils/lucky-draw-share.util';

type LuckyDrawLadderShareRowInputType = Readonly<{
  name: string;
  result: string;
}>;

const TARGET = {
  pathname: LUCKY_DRAW_SHARE_TEXTS.ladder.pathname,
  title: LUCKY_DRAW_SHARE_TEXTS.ladder.title,
  text: LUCKY_DRAW_SHARE_TEXTS.ladder.text,
  fileName: LUCKY_DRAW_SHARE_TEXTS.ladder.fileName,
} as const;

/**
 * 사다리 공유. 화면에 공개된 rows만 받아 카드를 계산하고 옵션 상태와 useShare를 묶는다.
 * rows가 비면 card와 cardKey가 null이라 패널을 그리지 않는다.
 */
export function useLuckyDrawLadderShare(
  rows: readonly LuckyDrawLadderShareRowInputType[]
) {
  const [options, setOptions] = useState<LuckyDrawLadderShareOptionsType>(
    LUCKY_DRAW_SHARE_DEFAULT_OPTIONS.ladder
  );
  const card: LuckyDrawLadderShareCardType | null = buildLadderShareCard({
    rows,
    isMasked: options.isMasked,
  });
  const { cardRef, controller } = useShare({
    target: TARGET,
    cardKey: card ? toShareCardKey(card) : null,
    requiresPreview: true,
  });

  const previewTexts: readonly string[] = card
    ? [
        ...card.body.rows.flatMap((row) => [row.left, row.right]),
        ...(card.body.hiddenCount > 0
          ? [formatLuckyDrawShareMore(card.body.hiddenCount)]
          : []),
      ]
    : [];

  return {
    card,
    options,
    setOptions,
    cardRef,
    controller,
    previewAlt: SHARE_TEXTS.previewImageAlt,
    previewTexts,
  };
}
