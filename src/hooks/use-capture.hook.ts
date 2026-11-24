import download from 'downloadjs';
import { toBlob } from 'html-to-image';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { SHARE_TEXTS } from '@/constants/share.constant';
import { classifyShareError } from '@/lib/share';

export type CaptureResultType =
  | 'shared'
  | 'downloaded'
  | 'cancelled'
  | 'failed';

/**
 * useCapture
 * @description 특정 DOM 요소를 이미지로 캡처하여 공유(Web Share API) 또는 다운로드합니다.
 * @returns handleCapture (ref, 옵션) => Promise<CaptureResultType>
 */
export function useCapture() {
  /**
   * @param elementRef - React ref 객체 (캡처할 DOM)
   * @param options - {
   *   fileName?: string; // 저장 파일명
   *   shareTitle?: string;
   *   shareText?: string;
   * }
   */
  const handleCapture = useCallback(
    async (
      elementRef: React.RefObject<HTMLElement>,
      options?: {
        fileName?: string;
        shareTitle?: string;
        shareText?: string;
      }
    ): Promise<CaptureResultType> => {
      if (!elementRef.current) return 'failed';

      try {
        // Use computed background from document (respects light/dark theme)
        const computedBg = getComputedStyle(document.body).backgroundColor;
        const backgroundColor = computedBg || 'white';

        const blob = await toBlob(elementRef.current, {
          quality: 1,
          backgroundColor,
          filter: (node) => {
            if (!(node instanceof HTMLElement)) return true;
            if (node.dataset.capture === 'ignore') return false;
            if (node.classList.contains('pe-no-capture')) return false;
            return true;
          },
        });

        if (!blob) throw new Error('capture/blob-null');

        const mime = blob.type || 'image/png';
        const fileName = options?.fileName || 'capture.png';
        const file = new File([blob], fileName, { type: mime });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: options?.shareTitle || '공유 이미지',
              text: options?.shareText || '',
            });
            return 'shared';
          } catch (shareErr) {
            if (classifyShareError(shareErr) === 'abort') return 'cancelled';
            // 사용자 활성화 만료 등 공유 실패: 같은 blob을 다운로드로 대체한다
            download(blob, fileName, mime);
            return 'downloaded';
          }
        }
        // downloadjs supports Blob input
        download(blob, fileName, mime);
        return 'downloaded';
      } catch (err) {
        if (classifyShareError(err) === 'abort') return 'cancelled';
        toast.error(SHARE_TEXTS.legacyCaptureFailed);
        return 'failed';
      }
    },
    []
  );

  return { onCapture: handleCapture };
}
