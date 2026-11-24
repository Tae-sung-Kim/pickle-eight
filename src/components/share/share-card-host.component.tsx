import type { ReactNode, Ref } from 'react';
import { SHARE_CARD_SIZE } from '@/constants/share.constant';

type ShareCardHostPropsType = Readonly<{
  /** 캡처 대상인 카드 루트에 연결된다 */
  ref: Ref<HTMLDivElement>;
  children: ReactNode;
}>;

/**
 * 화면 밖에 카드를 그려 두는 호스트. 보이지도 포커스되지도 않는다.
 * 왼쪽 밖에 두므로 좁은 화면에서도 가로 스크롤이 생기지 않는다.
 */
export function ShareCardHostComponent({
  ref,
  children,
}: ShareCardHostPropsType) {
  return (
    <div
      data-share-card-host
      aria-hidden="true"
      inert
      className="pointer-events-none fixed top-0 -left-[10000px]"
    >
      <div
        ref={ref}
        className="overflow-hidden bg-share-card-bg"
        style={{ width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }}
      >
        {children}
      </div>
    </div>
  );
}
