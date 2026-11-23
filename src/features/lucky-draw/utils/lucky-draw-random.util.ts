import type { LuckyDrawUint32SourceType } from '../types/lucky-draw.type';

const UINT32_RANGE = 2 ** 32;
const POOL_SIZE = 256;
const MAX_REJECTIONS = 1000;

let defaultSource: LuckyDrawUint32SourceType | null = null;

/** crypto.getRandomValues가 있는지. 없으면 도구 버튼을 막고 안내한다 */
export function isLuckyDrawRandomAvailable(): boolean {
  return (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  );
}

/** getRandomValues로 Uint32Array(256)을 채워 하나씩 꺼내는 원천. 없으면 Error */
export function createLuckyDrawCryptoSource(): LuckyDrawUint32SourceType {
  if (!isLuckyDrawRandomAvailable()) {
    throw new Error('crypto.getRandomValues is not available');
  }
  const pool = new Uint32Array(POOL_SIZE);
  let index = POOL_SIZE;
  return () => {
    if (index >= POOL_SIZE) {
      globalThis.crypto.getRandomValues(pool);
      index = 0;
    }
    return pool[index++];
  };
}

/** 모듈 안 한 개를 지연 생성해 돌려준다. source를 생략한 함수들이 쓴다 */
export function getLuckyDrawDefaultSource(): LuckyDrawUint32SourceType {
  if (!defaultSource) {
    defaultSource = createLuckyDrawCryptoSource();
  }
  return defaultSource;
}

/** 받아들이는 상한(이 값 이상은 버린다) = 2^32 − (2^32 mod n) */
export function getLuckyDrawRejectionLimit(maxExclusive: number): number {
  return UINT32_RANGE - (UINT32_RANGE % maxExclusive);
}

/** [0, maxExclusive) 균등 정수. 거절 샘플링 */
export function randomIntBelow(
  maxExclusive: number,
  source?: LuckyDrawUint32SourceType
): number {
  if (
    !Number.isInteger(maxExclusive) ||
    maxExclusive < 1 ||
    maxExclusive > UINT32_RANGE
  ) {
    throw new RangeError('maxExclusive must be an integer in [1, 2^32]');
  }
  if (maxExclusive === 1) {
    return 0;
  }
  const next = source ?? getLuckyDrawDefaultSource();
  const limit = getLuckyDrawRejectionLimit(maxExclusive);
  for (let attempt = 0; attempt < MAX_REJECTIONS; attempt += 1) {
    const r = next();
    if (!Number.isInteger(r) || r < 0 || r >= UINT32_RANGE) {
      throw new RangeError('source must return an integer in [0, 2^32)');
    }
    if (r < limit) {
      return r % maxExclusive;
    }
  }
  throw new Error('too many rejected samples');
}

/** Durstenfeld 방식 Fisher-Yates. 원본을 바꾸지 않고 새 배열을 돌려준다 */
export function shuffleFisherYates<T>(
  items: readonly T[],
  source?: LuckyDrawUint32SourceType
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i >= 1; i -= 1) {
    const j = randomIntBelow(i + 1, source);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
