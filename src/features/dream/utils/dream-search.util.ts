import { DREAM_SEARCH_SUFFIXES } from '@/features/dream/constants/dream-search.constant';
import type { DreamHubGroupType } from '@/features/dream/types/dream.type';

/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거. 브라우저·서버 공용, 외부 전송 없음 */
export function normalizeDreamSearchText(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** 정규화된 검색어 끝의 접미어를 더 이상 안 바뀔 때까지 떼어 낸다. 결과가 비면 떼기 전 값을 돌려준다 */
export function stripDreamQuerySuffix(normalized: string): string {
  let current = normalized;
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of DREAM_SEARCH_SUFFIXES) {
      if (current.endsWith(suffix)) {
        current = current.slice(0, current.length - suffix.length);
        changed = true;
        break;
      }
    }
  }
  return current === '' ? normalized : current;
}

/** 검색어가 비면 전체를 돌려준다. 아니면 searchKeys 중 하나라도 검색어를 포함하는 항목만 남긴다. 항목 0개인 카테고리는 뺀다 */
export function filterDreamSearchItems(
  groups: readonly DreamHubGroupType[],
  query: string
): readonly DreamHubGroupType[] {
  const normalized = normalizeDreamSearchText(query);
  if (normalized === '') {
    return groups;
  }
  const needle = stripDreamQuerySuffix(normalized);
  return groups
    .map((group) => ({
      category: group.category,
      items: group.items.filter((item) =>
        item.searchKeys.some((key) => key.includes(needle))
      ),
    }))
    .filter((group) => group.items.length > 0);
}
