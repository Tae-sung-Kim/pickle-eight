import { useCallback } from 'react';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';

/**
 * useCapture
 * @description 특정 DOM 요소를 이미지로 캡처하여 공유(Web Share API) 또는 다운로드합니다.
 * @returns handleCapture (ref, 옵션) => Promise<void>
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
    ) => {
      if (!elementRef.current) return;

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

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: options?.shareTitle || '공유 이미지',
            text: options?.shareText || '',
          });
        } else {
          // downloadjs supports Blob input
          download(blob, fileName, mime);
        }
      } catch (err) {
        console.error('이미지 캡처/공유 실패:', err);
        // alert('이미지 캡처 또는 공유 중 오류가 발생했습니다.');
      }
    },
    []
  );

  return { onCapture: handleCapture };
}
