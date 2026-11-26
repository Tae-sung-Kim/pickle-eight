import { SHARE_CARD_LIST_LIMITS } from '@/constants/share.constant';
import {
  LOTTO_SHARE_FEATURE_NAME,
  LOTTO_SHARE_NOTICE,
  LOTTO_SHARE_TARGET,
} from '@/features/lotto/constants/lotto-share.constant';
import { truncateShareList } from '@/lib/share';
import type { ShareCardFrameType } from '@/types/share.type';

/** 카드 입력은 생성된 번호뿐이다. 필터, 가중치 같은 생성 조건은 받지 않는다 */
export type LottoShareBodyType = Readonly<{
  games: readonly (readonly number[])[];
  hiddenCount: number;
}>;

export type LottoShareCardType = Readonly<{
  frame: ShareCardFrameType;
  body: LottoShareBodyType;
}>;

/** 번호가 없으면 null. 한도(6게임)를 넘으면 줄이고 hiddenCount를 남긴다 */
export function buildLottoShareCard(
  numbersList: readonly (readonly number[])[]
): LottoShareCardType | null {
  if (numbersList.length === 0) return null;
  const { items, hiddenCount } = truncateShareList(
    numbersList,
    SHARE_CARD_LIST_LIMITS.lottoGames
  );
  return {
    frame: {
      featureName: LOTTO_SHARE_FEATURE_NAME,
      pathname: LOTTO_SHARE_TARGET.pathname,
      notice: LOTTO_SHARE_NOTICE,
      accent: 'lucky',
    },
    body: { games: items, hiddenCount },
  };
}
