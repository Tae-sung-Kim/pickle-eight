import type { JSX } from 'react';

import {
  DREAM_EMPTY_BODY,
  DREAM_EMPTY_BUTTON_LABEL,
  DREAM_EMPTY_TITLE,
} from '@/features/dream/constants/dream-notice.constant';

export type DreamHubEmptyComponentPropsType = Readonly<{
  onReset: () => void;
}>;

/**
 * DreamHubEmptyComponent
 * - 결과 0개일 때만. 번호나 다른 링크는 보이지 않는다.
 */
export function DreamHubEmptyComponent({
  onReset,
}: DreamHubEmptyComponentPropsType): JSX.Element {
  return (
    <div className="space-y-3 rounded-panel border border-border bg-card p-6 text-left">
      <p className="text-lg font-semibold break-keep text-foreground">
        {DREAM_EMPTY_TITLE}
      </p>
      <p className="text-sm leading-7 break-keep text-foreground sm:text-base">
        {DREAM_EMPTY_BODY}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-menu-dream px-6 font-semibold break-keep text-primary-foreground hover:bg-menu-dream/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:w-auto"
      >
        {DREAM_EMPTY_BUTTON_LABEL}
      </button>
    </div>
  );
}
