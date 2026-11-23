import type {
  LuckyDrawEntryType,
  LuckyDrawLadderBlockType,
  LuckyDrawLineRuleType,
  LuckyDrawParsedLinesType,
} from '../types/lucky-draw.type';

export type { LuckyDrawLadderBlockType };

export function countLuckyDrawChars(label: string): number {
  return Array.from(label).length;
}

export function parseLuckyDrawLines(
  text: string,
  rule: LuckyDrawLineRuleType,
  idPrefix: string
): LuckyDrawParsedLinesType {
  const entries: LuckyDrawEntryType[] = [];
  let overflowCount = 0;
  let tooLongCount = 0;

  for (const raw of text.split(/\r?\n/)) {
    const label = raw.trim();
    if (label === '') {
      continue;
    }
    if (countLuckyDrawChars(label) > rule.maxLength) {
      tooLongCount += 1;
      continue;
    }
    if (entries.length >= rule.maxCount) {
      overflowCount += 1;
      continue;
    }
    entries.push({ id: `${idPrefix}-${entries.length}`, label });
  }
  return { entries, overflowCount, tooLongCount };
}

export function getLuckyDrawLadderBlock(
  participants: LuckyDrawParsedLinesType,
  results: LuckyDrawParsedLinesType
): LuckyDrawLadderBlockType {
  if (participants.entries.length < 2) {
    return 'too-few';
  }
  if (participants.overflowCount > 0) {
    return 'too-many';
  }
  if (
    results.entries.length !== participants.entries.length ||
    results.overflowCount > 0
  ) {
    return 'count-mismatch';
  }
  return null;
}
