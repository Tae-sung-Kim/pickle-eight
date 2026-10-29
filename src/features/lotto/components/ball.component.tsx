import type { LottoBallPropsType } from '@/features/lotto/types/lotto.type';
import {
  getNumberColor,
  LOTTO_BONUS_COLOR,
} from '@/features/lotto/utils/lotto.util';

export function LottoBallComponent({
  number,
  isBonus = false,
}: LottoBallPropsType) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold tabular-nums ${isBonus ? LOTTO_BONUS_COLOR : getNumberColor(number)}`}
    >
      {number}
    </span>
  );
}
