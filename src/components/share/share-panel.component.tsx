'use client';

import {
  CircleAlert,
  Copy,
  Download,
  Link2,
  Loader2,
  type LucideIcon,
  Share2,
} from 'lucide-react';
import {
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { SHARE_TEXTS } from '@/constants/share.constant';
import type { ShareControllerType } from '@/hooks/use-share.hook';
import type { ShareGuideReasonType } from '@/types/share.type';
import { ShareGuideComponent } from './share-guide.component';
import { SharePreviewDialogComponent } from './share-preview-dialog.component';

type SharePanelPropsType = Readonly<{
  controller: ShareControllerType;
  /** 미리보기 안 옵션 UI(사다리, 돌림판). 첫 스위치가 열릴 때 포커스를 받는다 */
  children?: ReactNode;
  /** 미리보기 이미지 alt. 카드 builder 값을 재사용한다 */
  previewAlt?: string;
  /** 카드에 들어가는 글자 목록(sr-only). 카드 builder 값을 재사용한다 */
  previewTexts?: readonly string[];
}>;

type ShareActionButtonPropsType = Readonly<{
  ref?: Ref<HTMLButtonElement>;
  icon: LucideIcon;
  label: string;
  /** 이미지 준비 중. aria-disabled만 표시하고 포커스는 유지한다 */
  isPending?: boolean;
  describedBy?: string;
  onClick: () => void;
}>;

function ShareActionButton({
  ref,
  icon: Icon,
  label,
  isPending = false,
  describedBy,
  onClick,
}: ShareActionButtonPropsType) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      aria-disabled={isPending || undefined}
      aria-describedby={isPending ? describedBy : undefined}
      onClick={() => {
        if (isPending) return;
        onClick();
      }}
      className="h-auto min-h-11 w-full whitespace-normal py-2 aria-disabled:cursor-progress @[22rem]:flex-1"
    >
      {isPending ? (
        <Loader2
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
        />
      ) : (
        <Icon aria-hidden="true" className="size-4" />
      )}
      {label}
    </Button>
  );
}

/**
 * 공유 패널. 모드별 버튼, 준비 실패 안내, 인라인 안내, 이름 카드 미리보기를 맡는다.
 * 결과가 있을 때만 그린다(cardKey가 null이면 부모가 렌더링하지 않는다).
 */
export function SharePanelComponent({
  controller,
  children,
  previewAlt,
  previewTexts,
}: SharePanelPropsType) {
  const {
    mode,
    status,
    errorCode,
    url,
    guide,
    preview,
    handleShare,
    handleCopyLink,
    handleDownload,
    handleCopyImage,
    handleRetry,
    handleConfirmPreview,
    handleClosePreview,
    handleCloseGuide,
  } = controller;

  const pendingId = useId();
  const shareRef = useRef<HTMLButtonElement>(null);
  const copyLinkRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLButtonElement>(null);
  const copyImageRef = useRef<HTMLButtonElement>(null);
  const prevKindRef = useRef(mode.kind);
  const prevGuideRef = useRef<ShareGuideReasonType | null>(guide);

  // 닫는 동안(fade-out)에도 같은 내용을 보이도록 마지막 미리보기를 보관한다
  const [lastPreview, setLastPreview] = useState(preview);
  if (
    preview &&
    (lastPreview?.action !== preview.action ||
      lastPreview.imageUrl !== preview.imageUrl)
  ) {
    setLastPreview(preview);
  }
  const shownPreview = preview ?? lastPreview;

  // 모바일 공유 실패로 3버튼 모드가 되면 포커스를 "링크 복사"로 옮긴다
  useEffect(() => {
    if (prevKindRef.current === 'mobile' && mode.kind === 'desktop') {
      copyLinkRef.current?.focus();
    }
    prevKindRef.current = mode.kind;
  }, [mode.kind]);

  // 안내가 닫히면 포커스를 공유 버튼(인앱) 또는 링크 복사(클립보드)로 돌린다
  useEffect(() => {
    const prev = prevGuideRef.current;
    if (prev !== null && guide === null) {
      (prev === 'in-app' ? shareRef : copyLinkRef).current?.focus();
    }
    prevGuideRef.current = guide;
  }, [guide]);

  const isPreparing = status === 'preparing';
  const canShareFiles = mode.kind === 'mobile' && mode.canShareFiles;

  function getReturnFocusTarget(): HTMLElement | null {
    const action = shownPreview?.action;
    if (action === 'share') return shareRef.current;
    if (action === 'download') return downloadRef.current;
    if (action === 'copy-image') return copyImageRef.current;
    return null;
  }

  function renderButtons() {
    if (mode.kind === 'unknown') {
      return <div aria-hidden="true" className="h-11" />;
    }
    if (mode.kind === 'mobile' || mode.kind === 'guide') {
      return (
        <div className="flex w-full max-w-md">
          <ShareActionButton
            ref={shareRef}
            icon={Share2}
            label={SHARE_TEXTS.shareButton}
            isPending={canShareFiles && isPreparing}
            describedBy={pendingId}
            onClick={handleShare}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 @[22rem]:flex-row">
        <ShareActionButton
          ref={copyLinkRef}
          icon={Link2}
          label={SHARE_TEXTS.copyLinkButton}
          onClick={handleCopyLink}
        />
        <ShareActionButton
          ref={downloadRef}
          icon={Download}
          label={SHARE_TEXTS.downloadButton}
          isPending={isPreparing}
          describedBy={pendingId}
          onClick={handleDownload}
        />
        {mode.canCopyImage ? (
          <ShareActionButton
            ref={copyImageRef}
            icon={Copy}
            label={SHARE_TEXTS.copyImageButton}
            isPending={isPreparing}
            describedBy={pendingId}
            onClick={handleCopyImage}
          />
        ) : null}
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: 명세상 fieldset이 아닌 role="group" div(이름 "결과 공유")
    <div
      role="group"
      aria-label={SHARE_TEXTS.groupLabel}
      data-share-panel
      data-share-mode={mode.kind}
      data-share-status={status}
      data-share-error={errorCode ?? undefined}
      className="@container w-full"
    >
      {guide === 'in-app' ? null : renderButtons()}

      {isPreparing ? (
        <span id={pendingId} className="sr-only">
          {SHARE_TEXTS.preparingLabel}
        </span>
      ) : null}

      {status === 'error' ? (
        <div role="alert" className="mt-3 flex flex-col items-start gap-2">
          <p className="flex items-start gap-2 text-sm leading-6 text-destructive">
            <CircleAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
            {SHARE_TEXTS.captureFailed}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleRetry}
            className="h-auto min-h-11 whitespace-normal py-2"
          >
            {SHARE_TEXTS.retryButton}
          </Button>
        </div>
      ) : null}

      {guide ? (
        <ShareGuideComponent
          reason={guide}
          url={url}
          onClose={handleCloseGuide}
        />
      ) : null}

      {shownPreview ? (
        <SharePreviewDialogComponent
          open={preview !== null}
          action={shownPreview.action}
          imageUrl={shownPreview.imageUrl}
          status={status}
          imageAlt={previewAlt}
          imageTexts={previewTexts}
          onConfirm={handleConfirmPreview}
          onCancel={handleClosePreview}
          onRetry={handleRetry}
          getReturnFocusTarget={getReturnFocusTarget}
        >
          {children}
        </SharePreviewDialogComponent>
      ) : null}
    </div>
  );
}

export type { SharePanelPropsType };
