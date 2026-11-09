import { FORTUNE_SAJU_POOL_BIGYEON } from '@/features/fortune/constants/pools/saju/bigyeon.constant';
import { FORTUNE_SAJU_POOL_GEOPJAE } from '@/features/fortune/constants/pools/saju/geopjae.constant';
import { FORTUNE_SAJU_POOL_JEONGGWAN } from '@/features/fortune/constants/pools/saju/jeonggwan.constant';
import { FORTUNE_SAJU_POOL_JEONGIN } from '@/features/fortune/constants/pools/saju/jeongin.constant';
import { FORTUNE_SAJU_POOL_JEONGJAE } from '@/features/fortune/constants/pools/saju/jeongjae.constant';
import { FORTUNE_SAJU_POOL_PYEONGWAN } from '@/features/fortune/constants/pools/saju/pyeongwan.constant';
import { FORTUNE_SAJU_POOL_PYEONIN } from '@/features/fortune/constants/pools/saju/pyeonin.constant';
import { FORTUNE_SAJU_POOL_PYEONJAE } from '@/features/fortune/constants/pools/saju/pyeonjae.constant';
import { FORTUNE_SAJU_POOL_SANGGWAN } from '@/features/fortune/constants/pools/saju/sanggwan.constant';
import { FORTUNE_SAJU_POOL_SIKSIN } from '@/features/fortune/constants/pools/saju/siksin.constant';
import type {
  FortuneCategoryKeyType,
  FortuneCategoryPoolType,
} from '@/features/fortune/types/fortune.type';
import type { FortuneTenGodKeyType } from '@/features/fortune/types/fortune-saju.type';

/** 십신별 문구 풀 합본 (design-saju-v2 V6.1). 풀 10개는 saju/ 폴더에 있다 */
export const FORTUNE_SAJU_POOLS: Readonly<
  Record<FortuneTenGodKeyType, FortuneCategoryPoolType>
> = {
  bigyeon: FORTUNE_SAJU_POOL_BIGYEON,
  geopjae: FORTUNE_SAJU_POOL_GEOPJAE,
  siksin: FORTUNE_SAJU_POOL_SIKSIN,
  sanggwan: FORTUNE_SAJU_POOL_SANGGWAN,
  pyeonjae: FORTUNE_SAJU_POOL_PYEONJAE,
  jeongjae: FORTUNE_SAJU_POOL_JEONGJAE,
  pyeongwan: FORTUNE_SAJU_POOL_PYEONGWAN,
  jeonggwan: FORTUNE_SAJU_POOL_JEONGGWAN,
  pyeonin: FORTUNE_SAJU_POOL_PYEONIN,
  jeongin: FORTUNE_SAJU_POOL_JEONGIN,
};

/**
 * 십신별 기본 점수 (design-saju-v2 V5.2 안 A). 모든 값 60~69, 총운은 십신 사이 차이 6 이하.
 * 초안이다. 문구 담당(SJ-C1)이 샘플과 함께 확정하고 사용자가 검수한다(S2-4).
 * 합본 FORTUNE_SAJU_POOLS는 이 파일 위쪽에 있다.
 */
export const FORTUNE_SAJU_BASE_SCORES: Readonly<
  Record<FortuneTenGodKeyType, Readonly<Record<FortuneCategoryKeyType, number>>>
> = {
  bigyeon: { total: 64, money: 62, love: 63, work: 66, health: 67 },
  geopjae: { total: 61, money: 60, love: 62, work: 65, health: 66 },
  siksin: { total: 66, money: 64, love: 67, work: 63, health: 68 },
  sanggwan: { total: 62, money: 63, love: 64, work: 61, health: 65 },
  pyeonjae: { total: 65, money: 68, love: 64, work: 66, health: 62 },
  jeongjae: { total: 66, money: 69, love: 65, work: 64, health: 63 },
  pyeongwan: { total: 62, money: 61, love: 60, work: 67, health: 64 },
  jeonggwan: { total: 65, money: 63, love: 62, work: 69, health: 65 },
  pyeonin: { total: 63, money: 61, love: 64, work: 65, health: 66 },
  jeongin: { total: 65, money: 62, love: 66, work: 64, health: 69 },
};
