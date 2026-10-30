import type { LottoBallPropsType } from '@/features/lotto/types/lotto.type';
import { getBallRange } from '@/features/lotto/utils/lotto.util';

export function LottoBallComponent({
  number,
  isBonus = false,
  size = 'md',
  className,
  style,
}: LottoBallPropsType) {
  return (
    <span
      className={`lotto-ball${className ? ` ${className}` : ''}`}
      data-range={isBonus ? 'bonus' : getBallRange(number)}
      data-size={size === 'md' ? undefined : size}
      style={style}
    >
      {number}
    </span>
  );
}
