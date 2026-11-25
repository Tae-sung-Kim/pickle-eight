import type { ShareEnvType } from '@/types/share.type';

const KAKAO_PATTERN = /KAKAOTALK/i;
const MOBILE_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i;
const ANDROID_PATTERN = /Android/i;
const IN_APP_PATTERN = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i;

export const SHARE_ENV_FALLBACK: ShareEnvType = {
  isCoarsePointer: false,
  hasWebShare: false,
  canShareFiles: false,
  canWriteText: false,
  canCopyImage: false,
  isKakaoAndroid: false,
  isInApp: false,
};

export function parseShareUserAgent(ua: string): {
  isKakaoAndroid: boolean;
  isInApp: boolean;
} {
  return {
    isKakaoAndroid: KAKAO_PATTERN.test(ua) && ANDROID_PATTERN.test(ua),
    isInApp: IN_APP_PATTERN.test(ua),
  };
}

function safe<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

/** 마운트 뒤 effect에서만 부른다. 서버에서는 기본값을 돌려준다 */
export function readShareEnv(): ShareEnvType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return SHARE_ENV_FALLBACK;
  }

  // 일부 안드로이드는 hover: none을 안 주므로 pointer: coarse나 모바일 UA면 모바일로 본다
  const isCoarsePointer: boolean = safe(
    () =>
      window.matchMedia('(pointer: coarse)').matches ||
      MOBILE_PATTERN.test(navigator.userAgent),
    false
  );
  const hasWebShare: boolean = safe(
    () => typeof navigator.share === 'function',
    false
  );
  const canShareFiles: boolean = safe(() => {
    if (typeof navigator.canShare !== 'function') return false;
    const probe = new File([new Uint8Array([0])], 'probe.png', {
      type: 'image/png',
    });
    return navigator.canShare({ files: [probe] }) === true;
  }, false);
  const canWriteText: boolean = safe(
    () => typeof navigator.clipboard?.writeText === 'function',
    false
  );
  const canCopyImage: boolean = safe(() => {
    if (
      typeof ClipboardItem === 'undefined' ||
      typeof navigator.clipboard?.write !== 'function'
    ) {
      return false;
    }
    if (typeof ClipboardItem.supports === 'function') {
      return ClipboardItem.supports('image/png');
    }
    return true;
  }, false);
  const ua = safe(() => parseShareUserAgent(navigator.userAgent), {
    isKakaoAndroid: false,
    isInApp: false,
  });

  return {
    isCoarsePointer,
    hasWebShare,
    canShareFiles,
    canWriteText,
    canCopyImage,
    isKakaoAndroid: ua.isKakaoAndroid,
    isInApp: ua.isInApp,
  };
}
