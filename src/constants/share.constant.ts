import type { ShareImageActionType } from '@/types/share.type';

/** 카드 크기와 레이아웃 기준값은 이 상수 한 곳에만 둔다. PNG는 1080x1350 */
export const SHARE_CARD_SIZE = {
  width: 540,
  height: 675,
  pixelRatio: 2,
} as const;

/**
 * 넘치면 마지막 줄에 "외 n개".
 * rouletteCandidates: 태그 영역 안쪽 440x209px, 최대 폭 태그(128px)는 한 줄 3개.
 * 14개(h-9, 5줄 x 3 = 15칸) + "외 n개" 1칸이 최악 조합에서도 들어간다.
 */
export const SHARE_CARD_LIST_LIMITS = {
  ladderRows: 10,
  lotsRows: 12,
  rouletteCandidates: 14,
} as const;

export const SHARE_CAPTURE = {
  maxAttempts: 3,
  prepareDebounceMs: 400,
  prepareTimeoutMs: 10000,
  fontEmbedTimeoutMs: 4000,
  blankSampleSize: { width: 54, height: 68 },
  blankMinInkPixels: 20,
  blankColorDistance: 24,
} as const;

/** 이름 가림 문자 */
export const SHARE_MASK_CHAR = '*';

export const SHARE_TEXTS = {
  groupLabel: '결과 공유',
  shareButton: '공유하기',
  copyLinkButton: '링크 복사',
  downloadButton: '이미지 저장',
  copyImageButton: '이미지 복사',
  preparingLabel: '이미지 만드는 중',
  linkCopied: '링크를 복사했어요',
  imageCopied: '이미지를 복사했어요',
  imageSaved: '이미지를 저장했어요',
  captureFailed: '이미지를 만들지 못했어요. 링크로 공유해 주세요',
  retryButton: '이미지 다시 만들기',
  imageCopyFailed: '이미지를 복사하지 못했어요. 이미지 저장을 이용해 주세요',
  shareFailed:
    '공유하지 못했어요. 아래 버튼으로 링크를 복사하거나 이미지를 저장해 주세요',
  legacyCaptureFailed: '이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요',
  guideInAppTitle: '이 브라우저에서는 공유할 수 없어요',
  guideInAppBody:
    '아래 주소를 길게 눌러 복사한 뒤 다른 앱에서 붙여 넣어 주세요.',
  guideClipboardTitle: '링크를 복사하지 못했어요',
  guideClipboardBody: '아래 주소를 길게 누르거나 선택해서 복사해 주세요.',
  guideUrlLabel: '공유 주소',
  guideCloseButton: '결과로 돌아가기',
  previewTitle: '공유할 이미지 미리보기',
  previewDescription:
    '이미지에 들어갈 이름을 확인해 주세요. 필요하면 가리거나 뺄 수 있어요.',
  previewImageAlt: '공유될 이미지 미리보기',
  previewReady: '이미지를 준비했어요',
  previewConfirm: {
    share: '이 내용으로 공유',
    download: '이 내용으로 저장',
    'copy-image': '이 내용으로 복사',
  } satisfies Record<ShareImageActionType, string>,
  previewCancel: '취소',
  maskSwitchLabel: '이름 가리기',
  maskSwitchDescription: '첫 글자만 남기고 가려요.',
  maskOffNotice: '가리지 않으면 입력한 이름이 이미지에 그대로 들어가요.',
  candidatesSwitchLabel: '후보 목록 넣기',
  candidatesSwitchDescription: '끄면 결과만 이미지에 들어가요.',
  moreTemplate: '외 {n}개',
} as const;
