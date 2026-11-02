const UINT32_RANGE = 0x100000000;
const POOL_SIZE = 1024;

// getRandomValues 호출 횟수를 줄이기 위해 한 번에 받아 두고 하나씩 꺼내 쓴다
const pool = new Uint32Array(POOL_SIZE);
let poolIndex = POOL_SIZE;

function nextUint32(): number {
  if (poolIndex >= POOL_SIZE) {
    globalThis.crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++];
}

// Web Crypto 사용 가능 여부 (구형 환경은 Math.random으로 대체)
export function hasSecureRandom(): boolean {
  return typeof globalThis.crypto?.getRandomValues === 'function';
}

// 난수 소스 이름 (화면 안내용)
export function getRandomSourceLabel(): string {
  return hasSecureRandom()
    ? 'crypto.getRandomValues'
    : 'Math.random (fallback)';
}

// [0, maxExclusive) 범위 정수. 거부 샘플링으로 모듈로 편향을 막는다.
export function secureRandomInt(maxExclusive: number): number {
  if (!hasSecureRandom()) return Math.floor(Math.random() * maxExclusive);
  const threshold = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  while (true) {
    const r = nextUint32();
    if (r < threshold) return r % maxExclusive;
  }
}

// [0, 1) 범위 실수
export function secureRandomFloat(): number {
  if (!hasSecureRandom()) return Math.random();
  return nextUint32() / UINT32_RANGE;
}
