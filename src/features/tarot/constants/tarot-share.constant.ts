import type { ShareTargetType } from '@/types/share.type';

/** 타로 공유 문구 모음. 값은 모두 고정 상수다(질문 등 사용자 입력 없음). 고지는 사용자 승인 후 확정 */
export const TAROT_SHARE_NOTICE =
  '오락과 자기 성찰을 위한 참고 결과입니다. 미래를 예측하지 않습니다.';

export type TarotShareKindType = 'daily' | 'threeCard';

export const TAROT_SHARE_FEATURE_NAMES: Readonly<
  Record<TarotShareKindType, string>
> = {
  daily: '오늘의 타로',
  threeCard: '세 장 타로',
};

export const TAROT_SHARE_TARGETS: Readonly<
  Record<TarotShareKindType, ShareTargetType>
> = {
  daily: {
    pathname: '/tarot/daily',
    title: TAROT_SHARE_FEATURE_NAMES.daily,
    text: '오늘의 타로를 재미로 봤어요.',
    fileName: 'share-tarot-daily.png',
  },
  threeCard: {
    pathname: '/tarot/three-card',
    title: TAROT_SHARE_FEATURE_NAMES.threeCard,
    text: '세 장 타로를 재미로 봤어요.',
    fileName: 'share-tarot-three-card.png',
  },
};
