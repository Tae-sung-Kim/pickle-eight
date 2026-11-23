'use client';

import Link from 'next/link';
import type { JSX, MouseEvent } from 'react';

import { cn } from '@/lib/utils';
import {
  LUCKY_DRAW_TOOL_LABELS,
  LUCKY_DRAW_TOOL_PATHS,
} from '../../constants/lucky-draw-route.constant';
import type { LuckyDrawToolKeyType } from '../../types/lucky-draw.type';

const TOOL_KEYS: readonly LuckyDrawToolKeyType[] = [
  'ladder',
  'roulette',
  'lots',
];

type LuckyDrawToolNavPropsType = Readonly<{
  current: LuckyDrawToolKeyType;
  /** 연출 중: aria-disabled, 클릭 무시, 포커스 유지 */
  isLocked?: boolean;
}>;

/**
 * LuckyDrawToolNavComponent
 * - 세 도구 전환 링크 한 줄
 */
export function LuckyDrawToolNavComponent({
  current,
  isLocked = false,
}: LuckyDrawToolNavPropsType): JSX.Element {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    if (isLocked) e.preventDefault();
  };

  return (
    <nav aria-label="도구 바꾸기">
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        {TOOL_KEYS.map((key) => {
          const isCurrent = key === current;
          return (
            <li key={key}>
              <Link
                href={LUCKY_DRAW_TOOL_PATHS[key]}
                aria-current={isCurrent ? 'page' : undefined}
                aria-disabled={isLocked ? 'true' : undefined}
                onClick={handleClick}
                className={cn(
                  'inline-flex min-h-11 items-center border-b-2 text-sm leading-6 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isCurrent
                    ? 'border-menu-lucky font-semibold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                  isLocked && 'opacity-60'
                )}
              >
                {LUCKY_DRAW_TOOL_LABELS[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
