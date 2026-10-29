import type { LottoBallPropsType } from '@/features/lotto/types/lotto.type';
import { getNumberColor } from '@/features/lotto/utils/lotto.util';

export function LottoBallComponent({
  number,
  isBonus = false,
}: LottoBallPropsType) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold tabular-nums ${getNumberColor(number)} ${isBonus ? 'outline outline-2 outline-offset-2 outline-foreground/30' : ''}`}
    >
      {number}
    </span>
  );
}
