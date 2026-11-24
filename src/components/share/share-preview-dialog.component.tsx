'use client';

import { CircleAlert, Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SHARE_TEXTS } from '@/constants/share.constant';
import type {
  ShareImageActionType,
  SharePrepareStatusType,
} from '@/types/share.type';

type SharePreviewDialogPropsType = Readonly<{
  open: boolean;
  action: ShareImageActionType;
  imageUrl: string | null;
  status: SharePrepareStatusType;
  /** 이미지 alt. 카드 builder 값을 넘긴다. 없으면 기본 문구 */
  imageAlt?: string;
  /** 카드에 들어가는 글자 목록(sr-only). 카드 builder 값을 넘긴다 */
  imageTexts?: readonly string[];
  onConfirm: () => void;
  onCancel: () => void;
  onRetry: () => void;
  /** 닫힐 때 포커스를 되돌릴 요소(연 버튼)를 돌려준다 */
  getReturnFocusTarget: () => HTMLElement | null;
  /** 옵션 UI(이름 가리기 등). 안의 첫 스위치가 열릴 때 포커스를 받는다 */
  children?: ReactNode;
}>;

/** 다시 만드는 중 알림(sr-only role="status"). 열려 있는 동안만 마운트된다 */
function PreviewLiveStatus({ status }: { status: SharePrepareStatusType }) {
  const [hasRebuilt, setHasRebuilt] = useState(false);

  useEffect(() => {
    if (status === 'preparing') setHasRebuilt(true);
  }, [status]);

  let message = '';
  if (status === 'preparing') message = SHARE_TEXTS.preparingLabel;
  else if (status === 'ready' && hasRebuilt) message = SHARE_TEXTS.previewReady;

  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}

/**
 * 이름 카드 미리보기. 실제로 나갈 PNG를 보여 주고 확인 전에는 아무것도 내보내지 않는다.
 * 열면 첫 스위치로 포커스가 간다(확인 버튼이 아니다).
 */
export function SharePreviewDialogComponent({
  open,
  action,
  imageUrl,
  status,
  imageAlt = SHARE_TEXTS.previewImageAlt,
  imageTexts,
  onConfirm,
  onCancel,
  onRetry,
  getReturnFocusTarget,
  children,
}: SharePreviewDialogPropsType) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isPreparing = status === 'preparing';
  const isError = status === 'error';
  const isConfirmDisabled = status !== 'ready' || imageUrl === null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent
        ref={contentRef}
        data-share-preview
        onOpenAutoFocus={(event) => {
          const firstSwitch =
            contentRef.current?.querySelector<HTMLElement>('[role="switch"]');
          if (!firstSwitch) return;
          event.preventDefault();
          firstSwitch.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          getReturnFocusTarget()?.focus();
        }}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-2xl"
      >
        <DialogHeader className="px-6 pt-6 pr-12 pb-4">
          <DialogTitle className="leading-7">
            {SHARE_TEXTS.previewTitle}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {SHARE_TEXTS.previewDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 pb-4 sm:grid-cols-[minmax(0,17.5rem)_1fr]">
          <div
            className="relative mx-auto aspect-[4/5] w-[min(100%,36dvh)] overflow-hidden rounded-md border border-border bg-muted sm:mx-0 sm:w-[min(17.5rem,36dvh)]"
            aria-busy={isPreparing}
          >
            {imageUrl ? (
              // biome-ignore lint/performance/noImgElement: blob object URL이라 next/image를 쓸 수 없다
              <img
                src={imageUrl}
                alt={imageAlt}
                className={`size-full object-contain ${isPreparing ? 'opacity-60' : ''}`}
              />
            ) : null}
            {isPreparing ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm">
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
                <span>{SHARE_TEXTS.preparingLabel}</span>
              </div>
            ) : null}
            {isError ? (
              <div
                role="alert"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card p-4 text-center"
              >
                <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
                  <CircleAlert
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0"
                  />
                  {SHARE_TEXTS.captureFailed}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRetry}
                  className="h-auto min-h-11 whitespace-normal py-2"
                >
                  {SHARE_TEXTS.retryButton}
                </Button>
              </div>
            ) : null}
          </div>

          {imageTexts && imageTexts.length > 0 ? (
            <ul className="sr-only">
              {imageTexts.map((text, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 같은 글자가 반복될 수 있는 고정 목록
                <li key={`${index}-${text}`}>{text}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-1">{children}</div>
        </div>

        {open ? <PreviewLiveStatus status={status} /> : null}

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-auto min-h-11 whitespace-normal py-2"
          >
            {SHARE_TEXTS.previewCancel}
          </Button>
          <Button
            type="button"
            aria-disabled={isConfirmDisabled || undefined}
            onClick={() => {
              if (isConfirmDisabled) return;
              onConfirm();
            }}
            className="h-auto min-h-11 whitespace-normal py-2 aria-disabled:cursor-progress aria-disabled:opacity-60"
          >
            {SHARE_TEXTS.previewConfirm[action]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
