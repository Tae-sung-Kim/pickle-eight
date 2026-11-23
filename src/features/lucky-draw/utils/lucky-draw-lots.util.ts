import { LUCKY_DRAW_LOTS_RULE } from '../constants/lucky-draw-limit.constant';
import type {
  LuckyDrawEntryType,
  LuckyDrawLotsDeckType,
  LuckyDrawLotsOpenedCardType,
  LuckyDrawUint32SourceType,
} from '../types/lucky-draw.type';
import { shuffleFisherYates } from './lucky-draw-random.util';

/**
 * 항목을 카드 위치에 Fisher-Yates로 놓은 묶음을 만든다.
 * entries 수가 LUCKY_DRAW_LOTS_RULE 범위(2~30) 밖이면 RangeError.
 * 위치 → 항목 대응은 클로저 안에만 있고 한 장씩만 꺼낼 수 있다.
 */
export function createLuckyDrawLotsDeck(
  entries: readonly LuckyDrawEntryType[],
  source?: LuckyDrawUint32SourceType
): LuckyDrawLotsDeckType {
  if (
    entries.length < LUCKY_DRAW_LOTS_RULE.minCount ||
    entries.length > LUCKY_DRAW_LOTS_RULE.maxCount
  ) {
    throw new RangeError('entries count is out of range');
  }
  const cards = shuffleFisherYates(
    entries.map((entry) => entry.label),
    source
  );
  const size = cards.length;
  return Object.freeze({
    size,
    open: (position: number): LuckyDrawLotsOpenedCardType => {
      if (!Number.isInteger(position) || position < 0 || position >= size) {
        throw new RangeError('position is out of range');
      }
      return { position, label: cards[position] };
    },
  });
}

/** 0..size−1 중 아직 열지 않은 위치를 작은 번호부터 돌려준다 */
export function getLuckyDrawLotsUnopenedPositions(
  size: number,
  opened: readonly LuckyDrawLotsOpenedCardType[]
): number[] {
  const openedSet = new Set(opened.map((card) => card.position));
  const result: number[] = [];
  for (let position = 0; position < size; position += 1) {
    if (!openedSet.has(position)) {
      result.push(position);
    }
  }
  return result;
}
