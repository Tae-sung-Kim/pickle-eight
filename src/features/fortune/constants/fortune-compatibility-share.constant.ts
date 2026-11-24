import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import type { FortuneCompatibilityShareKindType } from '@/features/fortune/types/fortune-compatibility.type';
import type { ShareTargetType } from '@/types/share.type';

/** 궁합 공유 문구와 대상. 값은 모두 고정 상수다(사용자 입력 없음). 합니다체 */
export const FORTUNE_COMPATIBILITY_SHARE_NOTICE =
  '재미로 보는 참고용 결과입니다. 실제 관계를 판단하지 않습니다.';

export const FORTUNE_COMPATIBILITY_SHARE_PRIVACY_NOTE =
  '공유 이미지에는 생년월일과 입력한 정보가 담기지 않습니다.';

export const FORTUNE_COMPATIBILITY_SHARE_FEATURE_NAMES: Readonly<
  Record<FortuneCompatibilityShareKindType, string>
> = {
  tti: '띠 궁합',
  starSign: '별자리 궁합',
};

export const FORTUNE_COMPATIBILITY_SHARE_TARGETS: Readonly<
  Record<FortuneCompatibilityShareKindType, ShareTargetType>
> = {
  tti: {
    pathname: FORTUNE_COMPATIBILITY_ROUTES.tti,
    title: FORTUNE_COMPATIBILITY_SHARE_FEATURE_NAMES.tti,
    text: '띠 궁합을 재미로 봤습니다.',
    fileName: 'share-compatibility-tti.png',
  },
  starSign: {
    pathname: FORTUNE_COMPATIBILITY_ROUTES.starSign,
    title: FORTUNE_COMPATIBILITY_SHARE_FEATURE_NAMES.starSign,
    text: '별자리 궁합을 재미로 봤습니다.',
    fileName: 'share-compatibility-star-sign.png',
  },
};
