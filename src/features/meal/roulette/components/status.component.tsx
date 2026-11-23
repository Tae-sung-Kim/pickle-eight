import type { JSX } from 'react';

export type MealRouletteStatusComponentPropsType = Readonly<{
  message: string;
}>;

/**
 * MealRouletteStatusComponent
 * - 화면에 보이지 않는 결과 알림. 항상 마운트하고 내용만 바꾼다.
 * - 조작 요소를 이 안에 넣지 않는다.
 */
export function MealRouletteStatusComponent({
  message,
}: MealRouletteStatusComponentPropsType): JSX.Element {
  return (
    <p role="status" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
