'use client';

import { Info } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SHARE_TEXTS } from '@/constants/share.constant';
import type { ShareGuideReasonType } from '@/types/share.type';

type ShareGuidePropsType = Readonly<{
  reason: ShareGuideReasonType;
  url: string;
  onClose: () => void;
}>;

const GUIDE_TEXTS: Record<
  ShareGuideReasonType,
  { title: string; body: string }
> = {
  'in-app': {
    title: SHARE_TEXTS.guideInAppTitle,
    body: SHARE_TEXTS.guideInAppBody,
  },
  clipboard: {
    title: SHARE_TEXTS.guideClipboardTitle,
    body: SHARE_TEXTS.guideClipboardBody,
  },
};

/**
 * 인라인 안내. 공유창이나 클립보드를 쓸 수 없을 때 주소를 직접 복사하게 한다.
 * 오류가 아니라 안내라 role="alert"를 쓰지 않고, 열리면 제목으로 포커스를 옮긴다.
 */
export function ShareGuideComponent({
  reason,
  url,
  onClose,
}: ShareGuidePropsType) {
  const titleId = useId();
  const titleRef = useRef<HTMLParagraphElement>(null);
  const { title, body } = GUIDE_TEXTS[reason];
  const displayUrl = url.replace(/^https?:\/\//, '');

  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    onClose();
  }

  return (
    <section
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      className="mt-4 w-full max-w-md rounded-panel border border-border bg-card p-4"
    >
      <div className="flex items-start gap-2">
        <Info
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-muted-foreground"
        />
        <p
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          className="text-base leading-6 font-semibold outline-none"
        >
          {title}
        </p>
      </div>
      <p className="mt-1 text-sm leading-6">{body}</p>
      {/* biome-ignore lint/a11y/useSemanticElements: 명세상 입력란이 아닌 선택 가능한 일반 텍스트(select-all)여야 한다 */}
      <div
        role="textbox"
        aria-readonly="true"
        aria-multiline="true"
        aria-label={SHARE_TEXTS.guideUrlLabel}
        tabIndex={0}
        className="mt-3 flex min-h-11 items-center rounded-md border border-border bg-background px-3 py-2 font-mono text-sm leading-6 break-all select-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {displayUrl}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="mt-3 h-auto min-h-11 w-full whitespace-normal py-2 sm:w-auto"
      >
        {SHARE_TEXTS.guideCloseButton}
      </Button>
    </section>
  );
}
