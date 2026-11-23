import { EyeOff } from 'lucide-react';
import type { JSX, Ref } from 'react';

import { cn } from '@/lib/utils';
import { LUCKY_DRAW_ACCENT_TEXT_CLASS } from '../../constants/lucky-draw-theme.constant';

type LuckyDrawRouletteResultPropsType = Readonly<{
  status: 'idle' | 'spinning' | 'done';
  isRevealed: boolean;
  /** 공개 방식이 "결과 가리기"인지 */
  isHiddenMode: boolean;
  /** 공개된 결과 글자. 가려진 동안에는 넘기지 않는다 */
  label: string | null;
  onReveal: () => void;
  containerRef: Ref<HTMLDivElement>;
}>;

/**
 * LuckyDrawRouletteResultComponent
 * - 돌림판 밖 결과 영역. 가리기에서는 결과 글자를 DOM에 넣지 않는다.
 */
export function LuckyDrawRouletteResultComponent({
  status,
  isRevealed,
  isHiddenMode,
  label,
  onReveal,
  containerRef,
}: LuckyDrawRouletteResultPropsType): JSX.Element {
  const isShown = status === 'done' && isRevealed && label !== null;
  const isPending = status === 'done' && !isRevealed;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-panel border border-border bg-card px-4 py-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isShown ? (
        <>
          <span className="text-sm leading-6 text-muted-foreground">결과</span>
          <p
            className={cn(
              'break-words text-xl font-semibold leading-8 sm:text-2xl',
              LUCKY_DRAW_ACCENT_TEXT_CLASS
            )}
          >
            {label}
          </p>
        </>
      ) : null}
      {isPending ? (
        <>
          <p className="flex items-start gap-2 text-base leading-7 text-foreground break-keep">
            <EyeOff
              className={cn(
                'mt-1.5 size-4 shrink-0',
                LUCKY_DRAW_ACCENT_TEXT_CLASS
              )}
              aria-hidden="true"
            />
            <span>
              결과가 정해졌어요. 결과 보기를 누르면 칸 글자와 결과가 나와요.
            </span>
          </p>
          <button
            type="button"
            onClick={onReveal}
            className="h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-menu-lucky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            결과 보기
          </button>
        </>
      ) : null}
      {status === 'spinning' ? (
        <p className="text-base leading-6 text-muted-foreground">
          돌리는 중이에요.
        </p>
      ) : null}
      {status === 'idle' && !isHiddenMode ? (
        <p className="text-base leading-6 text-muted-foreground">
          돌리기를 누르면 결과가 여기에 나와요.
        </p>
      ) : null}
      {status === 'idle' && isHiddenMode ? (
        <p className="flex items-start gap-2 text-base leading-7 text-foreground break-keep">
          <EyeOff
            className={cn(
              'mt-1.5 size-4 shrink-0',
              LUCKY_DRAW_ACCENT_TEXT_CLASS
            )}
            aria-hidden="true"
          />
          <span>
            결과 가리기를 켰어요. 칸 글자는 결과 보기를 누르면 나와요.
          </span>
        </p>
      ) : null}
    </div>
  );
}
