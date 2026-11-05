import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import type {
  TarotDailyStoredType,
  TarotDrawnCardType,
} from '@/features/tarot/types/tarot.type';

/** 오늘의 카드는 이 키 하나만 쓴다. 쿠키 동의 상태와 무관(기능용 저장) */
const STORAGE_KEY = `${process.env.NEXT_PUBLIC_SITE_ENG_NAME}_tarot_daily_v1`;
const PROBE_KEY = `${STORAGE_KEY}_probe`;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function removeKey(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // 삭제 실패는 무시한다. 다음 뽑기의 setItem이 성공하면 덮어써진다
  }
}

/** 저장소 쓰기 가능 여부. 테스트 키 set/remove를 try/catch로 확인 */
export function isTarotStorageAvailable(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

function isValidStored(
  value: unknown,
  todayKey: string
): value is TarotDailyStoredType {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const { v, date, cardId, isReversed } = value as Record<string, unknown>;
  if (v !== 1) return false;
  if (typeof date !== 'string' || !DATE_PATTERN.test(date)) return false;
  if (date !== todayKey) return false;
  if (
    typeof cardId !== 'number' ||
    !Number.isInteger(cardId) ||
    cardId < 0 ||
    cardId > 77 ||
    !TAROT_CARDS[cardId]
  ) {
    return false;
  }
  return typeof isReversed === 'boolean';
}

/**
 * 오늘(todayKey) 저장값이 유효하면 반환한다.
 * 값이 없으면 null. 지난 날짜·손상·형식 불일치·알 수 없는 카드 번호면
 * 키를 removeItem으로 삭제한 뒤 null(삭제 실패는 무시). 예외를 던지지 않는다
 */
export function readTarotDailyCard(
  todayKey: string
): TarotDrawnCardType | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeKey(storage, STORAGE_KEY);
    return null;
  }

  if (!isValidStored(parsed, todayKey)) {
    removeKey(storage, STORAGE_KEY);
    return null;
  }

  return { cardId: parsed.cardId, isReversed: parsed.isReversed };
}

/** 같은 키에 덮어쓴다(값은 항상 1개). 저장 성공 여부를 반환. 실패해도 예외를 던지지 않는다 */
export function writeTarotDailyCard(
  todayKey: string,
  drawn: TarotDrawnCardType
): boolean {
  const storage = getStorage();
  if (!storage) return false;

  const value: TarotDailyStoredType = {
    v: 1,
    date: todayKey,
    cardId: drawn.cardId,
    isReversed: drawn.isReversed,
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
