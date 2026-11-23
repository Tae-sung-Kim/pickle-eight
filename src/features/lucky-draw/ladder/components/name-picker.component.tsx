'use client';

import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { cn } from '@/lib/utils';
import type { LuckyDrawEntryType } from '../../types/lucky-draw.type';

type LuckyDrawLadderNamePickerPropsType = Readonly<{
  participants: readonly LuckyDrawEntryType[];
  /** 지금 보이는 경로 열 */
  selectedColumn: number | null;
  /** 한 명씩 열기에서 확인한 열 */
  checkedColumns: ReadonlySet<number>;
  /** 경로 그리는 중 또는 결과 보기 전 잠금 */
  isLocked: boolean;
  /** 잠금 이유 문장 id (aria-describedby) */
  lockReasonId?: string;
  onPick: (column: number) => void;
}>;

/**
 * LuckyDrawLadderNamePickerComponent
 * - 이름 고르기 버튼 목록. 번호 배지 + 전체 이름(줄바꿈). 잠겨도 포커스는 유지.
 */
export function LuckyDrawLadderNamePickerComponent({
  participants,
  selectedColumn,
  checkedColumns,
  isLocked,
  lockReasonId,
  onPick,
}: LuckyDrawLadderNamePickerPropsType): JSX.Element {
  return (
    // biome-ignore lint/a11y/useSemanticElements: 요구 명세가 role="group"
    <div
      role="group"
      aria-label="이름 고르기"
      className="grid grid-cols-2 gap-2 md:flex md:flex-wrap"
    >
      {participants.map((p, i) => {
        const isSelected = i === selectedColumn;
        const isChecked = checkedColumns.has(i);
        return (
          <button
            key={p.id}
            type="button"
            aria-disabled={isLocked ? 'true' : undefined}
            aria-describedby={isLocked ? lockReasonId : undefined}
            onClick={() => {
              if (isLocked) return;
              onPick(i);
            }}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
              isSelected
                ? 'border-menu-lucky bg-menu-lucky text-primary-foreground'
                : isChecked
                  ? 'border-menu-lucky bg-menu-lucky/10 text-foreground'
                  : 'border-border bg-card text-foreground hover:bg-menu-lucky/10',
              isLocked && 'cursor-not-allowed opacity-60'
            )}
          >
            <span className="font-mono text-xs">{i + 1}</span>
            <span className="min-w-0 break-words">{p.label}</span>
            {isChecked ? (
              <>
                <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">결과 확인함</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
