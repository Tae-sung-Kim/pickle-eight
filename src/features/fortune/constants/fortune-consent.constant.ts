/**
 * 동의 화면 문구의 버전. 문구를 바꾸면 값을 바꾼다 → 기존 동의가 무효가 되어 다시 묻는다.
 * 저장된 version과 이 값이 다르면 무효다(design.md 6.3).
 */
export const FORTUNE_CONSENT_VERSION = '2026-11-05';

/**
 * 동의 보관 방식. 'session'이면 sessionStorage, 'memory'면 저장소를 건드리지 않는다
 * (새로고침마다 재동의, design.md 2장 D2 메모).
 */
export const FORTUNE_CONSENT_STORAGE_MODE: 'session' | 'memory' = 'session';

/** 저장 키 접미사. 키는 `${NEXT_PUBLIC_SITE_ENG_NAME}${FORTUNE_CONSENT_STORAGE_KEY_SUFFIX}` */
export const FORTUNE_CONSENT_STORAGE_KEY_SUFFIX = '_fortune_consent_v1';
