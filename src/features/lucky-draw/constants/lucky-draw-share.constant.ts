import type {
  LuckyDrawLadderShareOptionsType,
  LuckyDrawRouletteShareOptionsType,
  LuckyDrawToolKeyType,
} from '../types/lucky-draw.type';
import { LUCKY_DRAW_TOOL_PATHS } from './lucky-draw-route.constant';

const COMMON_NOTICE =
  '재미와 참고를 위한 무작위 결과예요. 금전이나 승부와 관계없어요.';

type LuckyDrawShareTextType = Readonly<{
  featureName: string;
  /** navigator.share title */
  title: string;
  /** navigator.share text (주소 미포함) */
  text: string;
  /** 카드 꼬리 고지 한 줄 */
  notice: string;
  fileName: string;
  pathname: string;
}>;

/** 운빨 뽑기 공유 고정 문구. 카드와 공유 본문의 문구는 모두 여기서 온다 */
export const LUCKY_DRAW_SHARE_TEXTS: Readonly<
  Record<LuckyDrawToolKeyType, LuckyDrawShareTextType>
> = {
  ladder: {
    featureName: '사다리 타기',
    title: '사다리 타기',
    text: '사다리 타기 결과를 나눠요.',
    notice: COMMON_NOTICE,
    fileName: 'share-ladder.png',
    pathname: LUCKY_DRAW_TOOL_PATHS.ladder,
  },
  roulette: {
    featureName: '돌림판',
    title: '돌림판',
    text: '돌림판 결과를 나눠요.',
    notice: COMMON_NOTICE,
    fileName: 'share-roulette.png',
    pathname: LUCKY_DRAW_TOOL_PATHS.roulette,
  },
  lots: {
    featureName: '제비뽑기',
    title: '제비뽑기',
    text: '제비뽑기 결과를 나눠요.',
    notice: COMMON_NOTICE,
    fileName: 'share-lots.png',
    pathname: LUCKY_DRAW_TOOL_PATHS.lots,
  },
};

/** 돌림판 카드의 결과 박스 라벨 ("당첨", "추첨" 금지) */
export const LUCKY_DRAW_SHARE_ROULETTE_RESULT_LABEL = '결과';

/** 제비뽑기 줄 왼쪽 칸. {n}은 1부터 */
export const luckyDrawLotsNumberTemplate = '{n}번 카드';

/** 미리보기 옵션 기본값 (D-3: 이름은 기본으로 가린다) */
export const LUCKY_DRAW_SHARE_DEFAULT_OPTIONS: Readonly<{
  ladder: LuckyDrawLadderShareOptionsType;
  roulette: LuckyDrawRouletteShareOptionsType;
}> = {
  ladder: { isMasked: true },
  roulette: { isMasked: true, shouldIncludeCandidates: true },
};
