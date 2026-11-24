/**
 * 궁합 동의 문구 버전. 값은 동의 문구 승인일이다(CP-2 승인 때 확정).
 * 문구를 바꾸면 값을 바꿔 기존 동의를 무효로 만든다.
 */
export const FORTUNE_COMPATIBILITY_CONSENT_VERSION = '2026-11-24';

/** 저장 키 접미사. 키는 `${NEXT_PUBLIC_SITE_ENG_NAME}${FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX}` */
export const FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX =
  '_fortune_compatibility_consent_v1';
