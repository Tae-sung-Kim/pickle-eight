/** 환경 판정 입력. readShareEnv가 채운다. 판정 실패 시 모든 값 false */
export type ShareEnvType = Readonly<{
  isCoarsePointer: boolean;
  hasWebShare: boolean;
  canShareFiles: boolean;
  canWriteText: boolean;
  canCopyImage: boolean;
  isKakaoAndroid: boolean;
  isInApp: boolean;
}>;

export type ShareModeType =
  | Readonly<{ kind: 'unknown' }>
  | Readonly<{ kind: 'mobile'; canShareFiles: boolean }>
  | Readonly<{ kind: 'guide' }>
  | Readonly<{ kind: 'desktop'; canCopyImage: boolean }>;

/** 기능이 넘기는 공유 대상. 값은 모두 상수에서 온다(사용자 입력 없음) */
export type ShareTargetType = Readonly<{
  pathname: string;
  title: string;
  text: string;
  fileName: string;
}>;

export type ShareCardAccentType = 'meal' | 'lucky' | 'fortune' | 'tarot';

/** 카드 공통 틀에 들어가는 값 */
export type ShareCardFrameType = Readonly<{
  featureName: string;
  pathname: string;
  notice: string;
  accent: ShareCardAccentType;
}>;

export type SharePrepareStatusType = 'idle' | 'preparing' | 'ready' | 'error';

export type ShareCaptureErrorCodeType =
  | 'no-element'
  | 'blank'
  | 'blob-null'
  | 'timeout'
  | 'capture-failed';

export type ShareErrorKindType =
  | 'abort'
  | 'not-allowed'
  | 'unsupported'
  | 'unknown';

export type ShareGuideReasonType = 'in-app' | 'clipboard';

export type ShareImageActionType = 'share' | 'download' | 'copy-image';
