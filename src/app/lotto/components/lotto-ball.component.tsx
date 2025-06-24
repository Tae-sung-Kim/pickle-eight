'use client';

import { getNumberColor } from '@/utils';

export function LottoBallComponent({ numbers }: { numbers: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {numbers.map((num, i) => (
        <span
          key={`${num}-${i}`}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${getNumberColor(
            num
          )} font-bold`}
        >
          {num}
        </span>
      ))}
    </div>
  );
}

export default LottoBallComponent;
