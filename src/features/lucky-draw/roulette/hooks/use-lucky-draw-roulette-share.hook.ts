import { useState } from 'react';

import { SHARE_TEXTS } from '@/constants/share.constant';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';
import {
  LUCKY_DRAW_SHARE_DEFAULT_OPTIONS,
  LUCKY_DRAW_SHARE_TEXTS,
} from '../../constants/lucky-draw-share.constant';
import type {
  LuckyDrawEntryType,
  LuckyDrawRouletteShareCardType,
  LuckyDrawRouletteShareOptionsType,
} from '../../types/lucky-draw.type';
import {
  buildRouletteShareCard,
  formatLuckyDrawShareMore,
} from '../../utils/lucky-draw-share.util';
import type { LuckyDrawRouletteStateType } from './use-lucky-draw-roulette.hook';

type LuckyDrawRouletteShareInputType = Readonly<{
  spin: LuckyDrawRouletteStateType['spin'];
  isRevealed: boolean;
  pickedLabel: string | null;
  /** 그 회전의 칸 항목 */
  wheelEntries: readonly LuckyDrawEntryType[];
}>;

const TARGET = {
  pathname: LUCKY_DRAW_SHARE_TEXTS.roulette.pathname,
  title: LUCKY_DRAW_SHARE_TEXTS.roulette.title,
  text: LUCKY_DRAW_SHARE_TEXTS.roulette.text,
  fileName: LUCKY_DRAW_SHARE_TEXTS.roulette.fileName,
} as const;

/**
 * 돌림판 공유. 결과가 done이고 공개됐을 때만 카드를 만든다(공개 전에는 결과가 카드에 없다).
 */
export function useLuckyDrawRouletteShare({
  spin,
  isRevealed,
  pickedLabel,
  wheelEntries,
}: LuckyDrawRouletteShareInputType) {
  const [options, setOptions] = useState<LuckyDrawRouletteShareOptionsType>(
    LUCKY_DRAW_SHARE_DEFAULT_OPTIONS.roulette
  );
  const isShareable = spin.status === 'done' && isRevealed;
  const card: LuckyDrawRouletteShareCardType | null = buildRouletteShareCard({
    pickedLabel: isShareable ? pickedLabel : null,
    candidates: wheelEntries.map((entry) => entry.label),
    isMasked: options.isMasked,
    shouldIncludeCandidates: options.shouldIncludeCandidates,
  });
  const { cardRef, controller } = useShare({
    target: TARGET,
    cardKey: card ? toShareCardKey(card) : null,
    requiresPreview: true,
  });

  const previewTexts: readonly string[] = card
    ? [
        card.body.picked,
        ...(card.body.candidates ?? []),
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
