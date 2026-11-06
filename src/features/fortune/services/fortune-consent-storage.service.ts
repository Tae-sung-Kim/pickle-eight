import {
  FORTUNE_CONSENT_STORAGE_KEY_SUFFIX,
  FORTUNE_CONSENT_STORAGE_MODE,
  FORTUNE_CONSENT_VERSION,
} from '@/features/fortune/constants/fortune-consent.constant';
import type { FortuneConsentStoredType } from '@/features/fortune/types/fortune.type';

/**
 * 이용 동의는 sessionStorage 키 하나만 쓴다(design.md 6.3). 쿠키 동의 상태와 무관.
 * 값은 v, version, agreedAt 세 필드뿐이다. 생년월일·시각·나이·연령 판정은 넣지 않는다.
 */
const STORAGE_KEY = `${process.env.NEXT_PUBLIC_SITE_ENG_NAME}${FORTUNE_CONSENT_STORAGE_KEY_SUFFIX}`;
const STORED_FIELD_COUNT = 3;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** 'memory' 모드이거나 저장소를 쓸 수 없으면 null */
function getStorage(): Storage | null {
  if (FORTUNE_CONSENT_STORAGE_MODE === 'memory') return null;
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function removeKey(storage: Storage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // 삭제 실패는 무시한다
  }
}

function isValidStored(value: unknown): value is FortuneConsentStoredType {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  if (Object.keys(value).length !== STORED_FIELD_COUNT) return false;
  const { v, version, agreedAt } = value as Record<string, unknown>;
  if (v !== 1) return false;
  if (version !== FORTUNE_CONSENT_VERSION) return false;
  return (
    typeof agreedAt === 'string' &&
    ISO_PATTERN.test(agreedAt) &&
    !Number.isNaN(Date.parse(agreedAt))
  );
}

/**
 * 유효한 동의가 있으면 true. 값이 없으면 false.
 * JSON 오류, v≠1, 문구 버전 불일치, agreedAt 형식 오류, 필드 초과면 키를 삭제하고 false.
 * 예외를 던지지 않는다. 읽기만 하며 저장소를 만들거나 바꾸지 않는다(손상값 삭제 제외)
 */
export function readFortuneConsent(): boolean {
  const storage = getStorage();
  if (!storage) return false;

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (raw === null) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeKey(storage);
    return false;
  }

  if (!isValidStored(parsed)) {
    removeKey(storage);
    return false;
  }
  return true;
}

/** 같은 키에 덮어쓴다. 저장 성공 여부를 반환한다. 실패해도 예외를 던지지 않는다 */
export function writeFortuneConsent(now: Date = new Date()): boolean {
  const storage = getStorage();
  if (!storage) return false;

  const value: FortuneConsentStoredType = {
    v: 1,
    version: FORTUNE_CONSENT_VERSION,
    agreedAt: now.toISOString(),
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** 저장된 동의를 지운다. 예외를 던지지 않는다 */
export function clearFortuneConsent(): void {
  const storage = getStorage();
  if (!storage) return;
  removeKey(storage);
}
