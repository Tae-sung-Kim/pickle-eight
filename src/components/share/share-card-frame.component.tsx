import type { ReactNode } from 'react';
import { SHARE_CARD_SIZE } from '@/constants/share.constant';
import { SITE_NAME } from '@/lib/seo';
import { toShareDisplayUrl } from '@/lib/share';
import type {
  ShareCardAccentType,
  ShareCardFrameType,
} from '@/types/share.type';

type ShareCardFramePropsType = Readonly<{
  frame: ShareCardFrameType;
  children: ReactNode;
}>;

const ACCENT_CLASS: Record<ShareCardAccentType, string> = {
  meal: 'bg-share-card-accent-meal',
  lucky: 'bg-share-card-accent-lucky',
  fortune: 'bg-share-card-accent-fortune',
  tarot: 'bg-share-card-accent-tarot',
};

/**
 * 모든 공유 카드의 공통 틀. 병 라벨 모양.
 * 머리(기능명, 사이트 이름), 본문(children), 꼬리(주소, 고지)로 나눈다.
 * 카드에는 버튼, 링크, 이미지, 제목 태그, 모션을 넣지 않는다.
 */
export function ShareCardFrameComponent({
  frame,
  children,
}: ShareCardFramePropsType) {
  return (
    <div
      className="box-border overflow-hidden bg-share-card-bg p-5 text-share-card-fg break-keep [overflow-wrap:anywhere]"
      style={{ width: SHARE_CARD_SIZE.width, height: SHARE_CARD_SIZE.height }}
    >
      <div className="box-border flex h-full flex-col rounded-panel border-2 border-share-card-border p-7">
        <div className="mb-5 flex h-9 items-center justify-between">
          <span
            className={`inline-flex h-9 items-center rounded-md px-3.5 text-xl leading-none font-bold text-share-card-bg ${ACCENT_CLASS[frame.accent]}`}
          >
            {frame.featureName}
          </span>
          <span className="text-base leading-none font-semibold text-share-card-muted">
            {SITE_NAME}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {children}
        </div>
        <div className="mt-5 border-t border-share-card-border pt-3.5">
          <p className="text-base leading-[22px] font-semibold">
            {toShareDisplayUrl(frame.pathname)}
          </p>
          <p className="mt-1 min-h-11 text-base leading-[22px] text-share-card-muted">
            {frame.notice}
          </p>
        </div>
      </div>
    </div>
  );
}
