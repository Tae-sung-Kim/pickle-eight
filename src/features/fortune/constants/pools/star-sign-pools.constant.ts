import { FORTUNE_STAR_SIGN_AQUARIUS_POOL } from '@/features/fortune/constants/pools/star-sign/aquarius.constant';
import { FORTUNE_STAR_SIGN_ARIES_POOL } from '@/features/fortune/constants/pools/star-sign/aries.constant';
import { FORTUNE_STAR_SIGN_CANCER_POOL } from '@/features/fortune/constants/pools/star-sign/cancer.constant';
import { FORTUNE_STAR_SIGN_CAPRICORN_POOL } from '@/features/fortune/constants/pools/star-sign/capricorn.constant';
import { FORTUNE_STAR_SIGN_GEMINI_POOL } from '@/features/fortune/constants/pools/star-sign/gemini.constant';
import { FORTUNE_STAR_SIGN_LEO_POOL } from '@/features/fortune/constants/pools/star-sign/leo.constant';
import { FORTUNE_STAR_SIGN_LIBRA_POOL } from '@/features/fortune/constants/pools/star-sign/libra.constant';
import { FORTUNE_STAR_SIGN_PISCES_POOL } from '@/features/fortune/constants/pools/star-sign/pisces.constant';
import { FORTUNE_STAR_SIGN_SAGITTARIUS_POOL } from '@/features/fortune/constants/pools/star-sign/sagittarius.constant';
import { FORTUNE_STAR_SIGN_SCORPIO_POOL } from '@/features/fortune/constants/pools/star-sign/scorpio.constant';
import { FORTUNE_STAR_SIGN_TAURUS_POOL } from '@/features/fortune/constants/pools/star-sign/taurus.constant';
import { FORTUNE_STAR_SIGN_VIRGO_POOL } from '@/features/fortune/constants/pools/star-sign/virgo.constant';
import type {
  FortuneCategoryPoolType,
  FortuneStarSignKeyType,
} from '@/features/fortune/types/fortune.type';

/** 12별자리 문구 합본(540문장). 키가 하나라도 빠지면 컴파일되지 않는다 */
export const FORTUNE_STAR_SIGN_POOLS: Readonly<
  Record<FortuneStarSignKeyType, FortuneCategoryPoolType>
> = {
  capricorn: FORTUNE_STAR_SIGN_CAPRICORN_POOL,
  aquarius: FORTUNE_STAR_SIGN_AQUARIUS_POOL,
  pisces: FORTUNE_STAR_SIGN_PISCES_POOL,
  aries: FORTUNE_STAR_SIGN_ARIES_POOL,
  taurus: FORTUNE_STAR_SIGN_TAURUS_POOL,
  gemini: FORTUNE_STAR_SIGN_GEMINI_POOL,
  cancer: FORTUNE_STAR_SIGN_CANCER_POOL,
  leo: FORTUNE_STAR_SIGN_LEO_POOL,
  virgo: FORTUNE_STAR_SIGN_VIRGO_POOL,
  libra: FORTUNE_STAR_SIGN_LIBRA_POOL,
  scorpio: FORTUNE_STAR_SIGN_SCORPIO_POOL,
  sagittarius: FORTUNE_STAR_SIGN_SAGITTARIUS_POOL,
};
