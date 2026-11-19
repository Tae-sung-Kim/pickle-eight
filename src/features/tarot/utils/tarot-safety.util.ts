import {
  TAROT_CRISIS_TERMS,
  TAROT_EXPERT_TERMS,
} from '@/features/tarot/constants/tarot-safety.constant';
import { hasCrisisSignal, normalizeCrisisText } from '@/lib/crisis-signal';

/** NFC 정규화 → 소문자 → 문자·숫자(\p{L}\p{N}) 외 전부 제거. 공용 normalizeCrisisText 호출 */
export function normalizeTarotQuestion(text: string): string {
  return normalizeCrisisText(text);
}

/** TAROT_CRISIS_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotCrisisSignal(text: string): boolean {
  return hasCrisisSignal(text, TAROT_CRISIS_TERMS);
}

/** TAROT_EXPERT_TERMS 중 하나라도 부분 일치하면 true */
export function hasTarotExpertTopic(text: string): boolean {
  return hasCrisisSignal(text, TAROT_EXPERT_TERMS);
}
