import {
  FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX,
  FORTUNE_COMPATIBILITY_CONSENT_VERSION,
} from '@/features/fortune/constants/fortune-compatibility-consent.constant';
import type { FortuneConsentScopeType } from '@/features/fortune/types/fortune.type';

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

/**
 * 범위별 저장 키 접미사와 문구 버전. 운세 값은 위 상수와 같다(바꾸지 않는다).
 * 궁합 값은 fortune-compatibility-consent.constant.ts가 정한다.
 */
export const FORTUNE_CONSENT_SCOPE_CONFIG: Readonly<
  Record<
    FortuneConsentScopeType,
    Readonly<{ keySuffix: string; version: string }>
  >
> = {
  fortune: {
    keySuffix: FORTUNE_CONSENT_STORAGE_KEY_SUFFIX,
    version: FORTUNE_CONSENT_VERSION,
  },
  compatibility: {
    keySuffix: FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX,
    version: FORTUNE_COMPATIBILITY_CONSENT_VERSION,
  },
};
