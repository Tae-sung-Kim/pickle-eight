/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거 */
export function normalizeCrisisText(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** terms 중 하나라도 정규화한 text에 부분 일치하면 true. terms는 정규화된 형태여야 한다 */
export function hasCrisisSignal(
  text: string,
  terms: readonly string[]
): boolean {
  const normalized = normalizeCrisisText(text);
  if (normalized === '') return false;
  return terms.some((term) => term !== '' && normalized.includes(term));
}
