import type { ShareTargetType } from '@/types/share.type';

/** 로또 생성기 공유 문구와 대상. 값은 모두 고정 상수다(사용자 입력 없음) */
export const LOTTO_SHARE_FEATURE_NAME = '로또 번호 생성기';
export const LOTTO_SHARE_NOTICE =
  '재미로 고른 번호예요. 당첨을 보장하지 않아요.';
export const LOTTO_SHARE_GAME_TEMPLATE = '{n}게임';

export const LOTTO_SHARE_TARGET: ShareTargetType = {
  pathname: '/lotto/generator',
  title: LOTTO_SHARE_FEATURE_NAME,
  text: '로또 번호 생성기로 번호를 뽑아 봤어요.',
  fileName: 'result.png',
};
