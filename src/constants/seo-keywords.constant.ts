/*
 * Centralized SEO keyword lists to keep consistency across pages.
 * Use Korean terms as primary since site language is Korean.
 */

export const GLOBAL_KEYWORDS: readonly string[] = [
  '로또',
  '로또 채점',
  '로또 당첨 확인',
  '로또 당첨 번호',
  '로또 당첨 결과 조회',
  '로또 실시간 결과',
  '로또 회차 조회',
  '로또 보너스 번호',
  '로또 번호 생성기',
  '로또 번호 자동 생성',
  '로또 번호 추천',
  '로또 번호 추천기',
  '로또 번호 분석',
  '로또 통계 분석',
  '로또 패턴 분석',
  '로또 시뮬레이터',
  '웹앱',
  '모바일 최적화',
] as const;

export type SeoKeywordGroup = Readonly<{
  name: string;
  keywords: readonly string[];
}>;

export function buildKeywords(
  ...groups: readonly (readonly string[] | undefined)[]
): string[] {
  const set = new Set<string>();
  for (const g of groups) {
    if (!g) continue;
    for (const k of g) set.add(k);
  }
  return Array.from(set);
}
