import { FORTUNE_TTI_DOG_POOL } from '@/features/fortune/constants/pools/tti/dog.constant';
import { FORTUNE_TTI_DRAGON_POOL } from '@/features/fortune/constants/pools/tti/dragon.constant';
import { FORTUNE_TTI_GOAT_POOL } from '@/features/fortune/constants/pools/tti/goat.constant';
import { FORTUNE_TTI_HORSE_POOL } from '@/features/fortune/constants/pools/tti/horse.constant';
import { FORTUNE_TTI_MONKEY_POOL } from '@/features/fortune/constants/pools/tti/monkey.constant';
import { FORTUNE_TTI_OX_POOL } from '@/features/fortune/constants/pools/tti/ox.constant';
import { FORTUNE_TTI_PIG_POOL } from '@/features/fortune/constants/pools/tti/pig.constant';
import { FORTUNE_TTI_RABBIT_POOL } from '@/features/fortune/constants/pools/tti/rabbit.constant';
import { FORTUNE_TTI_RAT_POOL } from '@/features/fortune/constants/pools/tti/rat.constant';
import { FORTUNE_TTI_ROOSTER_POOL } from '@/features/fortune/constants/pools/tti/rooster.constant';
import { FORTUNE_TTI_SNAKE_POOL } from '@/features/fortune/constants/pools/tti/snake.constant';
import { FORTUNE_TTI_TIGER_POOL } from '@/features/fortune/constants/pools/tti/tiger.constant';
import type {
  FortuneCategoryPoolType,
  FortuneTtiKeyType,
} from '@/features/fortune/types/fortune.type';

/** 12띠 문구 합본(540문장). 키가 하나라도 빠지면 컴파일되지 않는다 */
export const FORTUNE_TTI_POOLS: Readonly<
  Record<FortuneTtiKeyType, FortuneCategoryPoolType>
> = {
  rat: FORTUNE_TTI_RAT_POOL,
  ox: FORTUNE_TTI_OX_POOL,
  tiger: FORTUNE_TTI_TIGER_POOL,
  rabbit: FORTUNE_TTI_RABBIT_POOL,
  dragon: FORTUNE_TTI_DRAGON_POOL,
  snake: FORTUNE_TTI_SNAKE_POOL,
  horse: FORTUNE_TTI_HORSE_POOL,
  goat: FORTUNE_TTI_GOAT_POOL,
  monkey: FORTUNE_TTI_MONKEY_POOL,
  rooster: FORTUNE_TTI_ROOSTER_POOL,
  dog: FORTUNE_TTI_DOG_POOL,
  pig: FORTUNE_TTI_PIG_POOL,
};
