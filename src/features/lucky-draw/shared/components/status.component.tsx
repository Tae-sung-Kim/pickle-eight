import type { JSX } from 'react';

type LuckyDrawStatusPropsType = Readonly<{
  /** root가 렌더링 중에 계산한 문장. 결과가 가려진 동안에는 결과 글자를 넣지 않는다 */
  message: string;
}>;

/**
 * LuckyDrawStatusComponent
 * - 화면에서 숨겨진 알림 한 곳. 도구마다 하나만 렌더링한다.
 */
export function LuckyDrawStatusComponent({
  message,
}: LuckyDrawStatusPropsType): JSX.Element {
  return (
    <p role="status" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
