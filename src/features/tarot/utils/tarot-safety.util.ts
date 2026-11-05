import {
  TAROT_CRISIS_TERMS,
  TAROT_EXPERT_TERMS,
} from '@/features/tarot/constants/tarot-safety.constant';

/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거 */
export function normalizeTarotQuestion(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function includesAnyTerm(text: string, terms: readonly string[]): boolean {
  const normalized = normalizeTarotQuestion(text);
  if (normalized === '') return false;
  return terms.some((term) => term !== '' && normalized.includes(term));
}

/** TAROT_CRISIS_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotCrisisSignal(text: string): boolean {
  return includesAnyTerm(text, TAROT_CRISIS_TERMS);
}

/** TAROT_EXPERT_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotExpertTopic(text: string): boolean {
  return includesAnyTerm(text, TAROT_EXPERT_TERMS);
}
