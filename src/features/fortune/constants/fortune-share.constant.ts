import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import type { ShareTargetType } from '@/types/share.type';

/** 운세 3종 공유 문구와 대상. 값은 모두 고정 상수다(사용자 입력 없음) */
export const FORTUNE_SHARE_NOTICE =
  '재미로 보는 참고용 결과입니다. 실제 상황과 다를 수 있습니다.';

export type FortuneShareKindType = 'today' | 'tti' | 'starSign';

export const FORTUNE_SHARE_FEATURE_NAMES: Readonly<
  Record<FortuneShareKindType, string>
> = {
  today: '오늘의 운세',
  tti: '띠별 운세',
  starSign: '별자리 운세',
};

export const FORTUNE_SHARE_TARGETS: Readonly<
  Record<FortuneShareKindType, ShareTargetType>
> = {
  today: {
    pathname: FORTUNE_ROUTES.today,
    title: FORTUNE_SHARE_FEATURE_NAMES.today,
    text: '오늘의 운세를 재미로 봤어요.',
    fileName: 'share-fortune-today.png',
  },
  tti: {
    pathname: FORTUNE_ROUTES.tti,
    title: FORTUNE_SHARE_FEATURE_NAMES.tti,
    text: '띠별 운세를 재미로 봤어요.',
    fileName: 'share-fortune-tti.png',
  },
  starSign: {
    pathname: FORTUNE_ROUTES.starSign,
    title: FORTUNE_SHARE_FEATURE_NAMES.starSign,
    text: '별자리 운세를 재미로 봤어요.',
    fileName: 'share-fortune-star-sign.png',
  },
};

/** 카드의 행운 요소 줄 이름. 값은 결과 데이터(FortuneLuckyType)를 그대로 쓴다 */
export const FORTUNE_SHARE_LUCKY_LABELS = {
  color: '행운의 색',
  direction: '행운의 방향',
  numbers: '행운 숫자',
} as const;
