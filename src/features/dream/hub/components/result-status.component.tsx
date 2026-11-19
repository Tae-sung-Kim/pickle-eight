import type { JSX } from 'react';

import {
  DREAM_RESULT_ALL_TEMPLATE,
  DREAM_RESULT_QUERY_TEMPLATE,
} from '@/features/dream/constants/dream-notice.constant';

export type DreamHubResultStatusComponentPropsType = Readonly<{
  /** 검색어가 있으면 앞뒤 공백을 자른 값, 없으면 빈 문자열 */
  query: string;
  count: number;
}>;

/**
 * DreamHubResultStatusComponent
 * - 결과 개수 문장. aria-live 영역 하나에서만 바뀐다. 검색어는 React 텍스트로만 그린다.
 */
export function DreamHubResultStatusComponent({
  query,
  count,
}: DreamHubResultStatusComponentPropsType): JSX.Element {
  const text =
    query === ''
      ? DREAM_RESULT_ALL_TEMPLATE.replace('{N}', () => String(count))
      : DREAM_RESULT_QUERY_TEMPLATE.replace('{query}', () => query).replace(
          '{n}',
          () => String(count)
        );

  return (
    <p
      aria-live="polite"
      aria-atomic="true"
      className="text-sm leading-6 break-all text-muted-foreground"
    >
      {text}
    </p>
  );
}
