import download from 'downloadjs';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { toast } from 'sonner';
import { SHARE_CAPTURE, SHARE_TEXTS } from '@/constants/share.constant';
import {
  buildShareUrl,
  classifyShareError,
  resolveShareMode,
} from '@/lib/share';
import { captureShareCard, ShareCaptureError } from '@/lib/share-capture';
import { readShareEnv, SHARE_ENV_FALLBACK } from '@/lib/share-env';
import type {
  ShareCaptureErrorCodeType,
  ShareEnvType,
  ShareGuideReasonType,
  ShareImageActionType,
  ShareModeType,
  SharePrepareStatusType,
  ShareTargetType,
} from '@/types/share.type';

export type UseShareInputType = Readonly<{
  target: ShareTargetType;
  /** null이면 결과 없음. 패널을 그리지 않는다 */
  cardKey: string | null;
  /** 이름이 실리는 카드(사다리, 돌림판)만 true */
  requiresPreview: boolean;
}>;

export type ShareControllerType = Readonly<{
  mode: ShareModeType;
  status: SharePrepareStatusType;
  errorCode: ShareCaptureErrorCodeType | null;
  isBusy: boolean;
  url: string;
  guide: ShareGuideReasonType | null;
  preview: Readonly<{
    action: ShareImageActionType;
    imageUrl: string | null;
  }> | null;
  handleShare: () => void;
  handleCopyLink: () => void;
  handleDownload: () => void;
  handleCopyImage: () => void;
  handleRetry: () => void;
  handleConfirmPreview: () => void;
  handleClosePreview: () => void;
  handleCloseGuide: () => void;
}>;

type StateType = Readonly<{
  mode: ShareModeType;
  status: SharePrepareStatusType;
  errorCode: ShareCaptureErrorCodeType | null;
  isBusy: boolean;
  guide: ShareGuideReasonType | null;
  previewAction: ShareImageActionType | null;
  imageUrl: string | null;
  retryTick: number;
}>;

type ActionType =
  | { type: 'mode'; mode: ShareModeType }
  | { type: 'preparing' }
  | { type: 'ready' }
  | { type: 'error'; code: ShareCaptureErrorCodeType | null }
  | { type: 'idle' }
  | { type: 'busy'; isBusy: boolean }
  | { type: 'guide'; guide: ShareGuideReasonType | null }
  | { type: 'preview'; action: ShareImageActionType | null }
  | { type: 'image-url'; imageUrl: string | null }
  | { type: 'retry' };

const INITIAL_STATE: StateType = {
  mode: { kind: 'unknown' },
  status: 'idle',
  errorCode: null,
  isBusy: false,
  guide: null,
  previewAction: null,
  imageUrl: null,
  retryTick: 0,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'mode':
      return { ...state, mode: action.mode };
    case 'preparing':
      return { ...state, status: 'preparing', errorCode: null };
    case 'ready':
      return { ...state, status: 'ready', errorCode: null };
    case 'error':
      return { ...state, status: 'error', errorCode: action.code };
    case 'idle':
      return { ...state, status: 'idle', errorCode: null, previewAction: null };
    case 'busy':
      return { ...state, isBusy: action.isBusy };
    case 'guide':
      return { ...state, guide: action.guide };
    case 'preview':
      return { ...state, previewAction: action.action };
    case 'image-url':
      return { ...state, imageUrl: action.imageUrl };
    case 'retry':
      return {
        ...state,
        status: 'preparing',
        errorCode: null,
        retryTick: state.retryTick + 1,
      };
  }
}

function toErrorCode(error: unknown): ShareCaptureErrorCodeType {
  return error instanceof ShareCaptureError ? error.code : 'capture-failed';
}

/**
 * useShare
 * @description 결과 카드 이미지를 미리 만들고 공유, 링크 복사, 저장, 이미지 복사를 처리한다.
 * @returns cardRef(카드 루트에 연결), controller(패널에 넘길 값과 핸들러)
 */
export function useShare({
  target,
  cardKey,
  requiresPreview,
}: UseShareInputType): {
  cardRef: RefObject<HTMLDivElement | null>;
  controller: ShareControllerType;
} {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);
  const envRef = useRef<ShareEnvType>(SHARE_ENV_FALLBACK);
  const busyRef = useRef(false);
  const generationRef = useRef(0);

  const url = useMemo(() => buildShareUrl(target.pathname), [target.pathname]);

  const revokeImageUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  // 마운트 뒤 환경 판정 (SSR 안전)
  useEffect(() => {
    let env = SHARE_ENV_FALLBACK;
    try {
      env = readShareEnv();
    } catch {
      env = SHARE_ENV_FALLBACK;
    }
    envRef.current = env;
    dispatch({ type: 'mode', mode: resolveShareMode(env) });
  }, []);

  // 카드 이미지 미리 만들기
  useEffect(() => {
    void state.retryTick;
    if (cardKey === null) {
      generationRef.current += 1;
      blobRef.current = null;
      dispatch({ type: 'idle' });
      return;
    }
    generationRef.current += 1;
    const generation = generationRef.current;
    blobRef.current = null;
    dispatch({ type: 'preparing' });
    const timer = setTimeout(async () => {
      try {
        const blob = await captureShareCard(cardRef.current);
        if (generation !== generationRef.current) return;
        blobRef.current = blob;
        dispatch({ type: 'ready' });
      } catch (error) {
        if (generation !== generationRef.current) return;
        dispatch({ type: 'error', code: toErrorCode(error) });
      }
    }, SHARE_CAPTURE.prepareDebounceMs);
    return () => clearTimeout(timer);
  }, [cardKey, state.retryTick]);

  // 미리보기용 object URL
  useEffect(() => {
    if (state.previewAction === null) {
      revokeImageUrl();
      dispatch({ type: 'image-url', imageUrl: null });
      return;
    }
    if (state.status === 'ready' && blobRef.current) {
      revokeImageUrl();
      urlRef.current = URL.createObjectURL(blobRef.current);
      dispatch({ type: 'image-url', imageUrl: urlRef.current });
    }
  }, [state.previewAction, state.status, revokeImageUrl]);

  // 언마운트: 진행 중 결과 무시, URL 해제
  useEffect(() => {
    return () => {
      generationRef.current += 1;
      revokeImageUrl();
    };
  }, [revokeImageUrl]);

  const runExclusive = useCallback(async (task: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    dispatch({ type: 'busy', isBusy: true });
    try {
      await task();
    } finally {
      busyRef.current = false;
      dispatch({ type: 'busy', isBusy: false });
    }
  }, []);

  /** 준비된 Blob을 돌려준다. 없으면 그 자리에서 한 번 더 만든다 */
  const ensureBlob = useCallback(async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current;
    const generation = generationRef.current;
    try {
      const blob = await captureShareCard(cardRef.current);
      if (generation !== generationRef.current) return null;
      blobRef.current = blob;
      dispatch({ type: 'ready' });
      return blob;
    } catch (error) {
      if (generation === generationRef.current) {
        dispatch({ type: 'error', code: toErrorCode(error) });
      }
      return null;
    }
  }, []);

  const saveImage = useCallback(async () => {
    const blob = await ensureBlob();
    if (!blob || blob.size === 0) {
      toast.error(SHARE_TEXTS.captureFailed);
      return;
    }
    download(blob, target.fileName, 'image/png');
    toast.success(SHARE_TEXTS.imageSaved);
  }, [ensureBlob, target.fileName]);

  const copyImage = useCallback(async () => {
    try {
      const item = new ClipboardItem({
        'image/png': ensureBlob().then((blob) => {
          if (!blob || blob.size === 0) throw new Error('share/no-blob');
          return blob;
        }),
      });
      await navigator.clipboard.write([item]);
      toast.success(SHARE_TEXTS.imageCopied);
    } catch {
      toast.error(SHARE_TEXTS.imageCopyFailed);
    }
  }, [ensureBlob]);

  const shareNative = useCallback(async () => {
    const blob = blobRef.current;
    const file =
      blob && blob.size > 0
        ? new File([blob], target.fileName, { type: 'image/png' })
        : null;
    const canFile =
      file !== null &&
      envRef.current.canShareFiles &&
      navigator.canShare?.({ files: [file] }) === true;
    try {
      if (canFile && file) {
        await navigator.share({
          files: [file],
          title: target.title,
          text: `${target.text}\n${url}`,
        });
      } else {
        await navigator.share({
          title: target.title,
          text: target.text,
          url,
        });
      }
    } catch (error) {
      if (classifyShareError(error) === 'abort') return;
      if (envRef.current.isInApp) {
        dispatch({ type: 'guide', guide: 'in-app' });
        return;
      }
      toast.error(SHARE_TEXTS.shareFailed);
      dispatch({
        type: 'mode',
        mode: { kind: 'desktop', canCopyImage: envRef.current.canCopyImage },
      });
    }
  }, [target.fileName, target.title, target.text, url]);

  const runImageAction = useCallback(
    (action: ShareImageActionType): Promise<void> => {
      if (action === 'share') return shareNative();
      if (action === 'download') return saveImage();
      return copyImage();
    },
    [shareNative, saveImage, copyImage]
  );

  const handleShare = useCallback(() => {
    const { mode, status } = state;
    if (mode.kind === 'guide') {
      dispatch({ type: 'guide', guide: 'in-app' });
      return;
    }
    if (mode.kind !== 'mobile' || status === 'preparing') return;
    const hasFile =
      mode.canShareFiles && status === 'ready' && blobRef.current !== null;
    if (hasFile && requiresPreview) {
      dispatch({ type: 'preview', action: 'share' });
      return;
    }
    void runExclusive(shareNative);
  }, [state, requiresPreview, runExclusive, shareNative]);

  const handleCopyLink = useCallback(() => {
    void runExclusive(async () => {
      try {
        if (typeof navigator.clipboard?.writeText !== 'function') {
          throw new Error('share/no-clipboard');
        }
        await navigator.clipboard.writeText(url);
        toast.success(SHARE_TEXTS.linkCopied);
      } catch {
        dispatch({ type: 'guide', guide: 'clipboard' });
      }
    });
  }, [runExclusive, url]);

  const handleImageButton = useCallback(
    (action: Exclude<ShareImageActionType, 'share'>) => {
      if (state.mode.kind !== 'desktop' || state.status === 'preparing') return;
      if (!requiresPreview) {
        void runExclusive(() => runImageAction(action));
        return;
      }
      void runExclusive(async () => {
        const blob = await ensureBlob();
        if (!blob) {
          toast.error(SHARE_TEXTS.captureFailed);
          return;
        }
        dispatch({ type: 'preview', action });
      });
    },
    [
      state.mode.kind,
      state.status,
      requiresPreview,
      runExclusive,
      runImageAction,
      ensureBlob,
    ]
  );

  const handleDownload = useCallback(
    () => handleImageButton('download'),
    [handleImageButton]
  );

  const handleCopyImage = useCallback(
    () => handleImageButton('copy-image'),
    [handleImageButton]
  );

  const handleRetry = useCallback(() => {
    if (state.status === 'preparing' || cardKey === null) return;
    dispatch({ type: 'retry' });
  }, [state.status, cardKey]);

  const handleConfirmPreview = useCallback(() => {
    const action = state.previewAction;
    if (action === null || state.status !== 'ready') return;
    dispatch({ type: 'preview', action: null });
    void runExclusive(() => runImageAction(action));
  }, [state.previewAction, state.status, runExclusive, runImageAction]);

  const handleClosePreview = useCallback(() => {
    dispatch({ type: 'preview', action: null });
  }, []);

  const handleCloseGuide = useCallback(() => {
    dispatch({ type: 'guide', guide: null });
  }, []);

  const controller: ShareControllerType = {
    mode: state.mode,
    status: state.status,
    errorCode: state.errorCode,
    isBusy: state.isBusy,
    url,
    guide: state.guide,
    preview:
      state.previewAction === null
        ? null
        : { action: state.previewAction, imageUrl: state.imageUrl },
    handleShare,
    handleCopyLink,
    handleDownload,
    handleCopyImage,
    handleRetry,
    handleConfirmPreview,
    handleClosePreview,
    handleCloseGuide,
  };

  return { cardRef, controller };
}
