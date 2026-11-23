'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils';
import type { LuckyDrawRevealModeType } from '../../types/lucky-draw.type';

const REVEAL_MODE_LABELS: Readonly<Record<LuckyDrawRevealModeType, string>> = {
  all: '일괄 공개',
  hidden: '결과 가리기',
  'one-by-one': '한 명씩 열기',
};

type LuckyDrawRevealModePropsType = Readonly<{
  /** 라디오 name (페이지 안에서 유일) */
  name: string;
  value: LuckyDrawRevealModeType;
  options: readonly LuckyDrawRevealModeType[];
  onChange: (mode: LuckyDrawRevealModeType) => void;
  /** 연출 중 잠금: aria-disabled, 변경 무시 */
  isLocked?: boolean;
  /** 제비뽑기는 "한 장씩 열기" 등으로 라벨을 바꿀 때 사용 */
  labels?: Partial<Record<LuckyDrawRevealModeType, string>>;
}>;

/**
 * LuckyDrawRevealModeComponent
 * - 공개 방식 라디오 (fieldset + 기본 radio). Controlled.
 */
export function LuckyDrawRevealModeComponent({
  name,
  value,
  options,
  onChange,
  isLocked = false,
  labels,
}: LuckyDrawRevealModePropsType): JSX.Element {
  return (
    <fieldset
      aria-disabled={isLocked ? 'true' : undefined}
      className={cn('min-w-0 space-y-2', isLocked && 'opacity-60')}
    >
      <legend className="text-sm font-semibold leading-6 text-foreground">
        결과 공개 방식
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((mode) => {
          const isSelected = value === mode;
          const inputId = `${name}-${mode}`;
          return (
            <div key={mode} className="relative">
              <input
                id={inputId}
                type="radio"
                name={name}
                value={mode}
                checked={isSelected}
                aria-disabled={isLocked ? 'true' : undefined}
                onChange={() => {
                  if (isLocked) return;
                  onChange(mode);
                }}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center break-keep rounded-md border border-border px-4 py-2 text-sm leading-5 transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-menu-lucky bg-menu-lucky font-semibold text-primary-foreground'
                    : 'bg-card font-medium text-foreground hover:bg-menu-lucky/10',
                  isLocked && 'cursor-not-allowed'
                )}
              >
                {labels?.[mode] ?? REVEAL_MODE_LABELS[mode]}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
