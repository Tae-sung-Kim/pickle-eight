'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCapture } from '@/hooks';
import { TodayMessageCardType } from '@/types';
import { toast } from 'sonner';

export function MessageCardComponent({
  title,
  icon,
  titleColorClass,
  iconBorderClass,
  surfaceClass,
  message,
  fileName,
  shareTitle,
  ariaLabel,
}: TodayMessageCardType) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [canToggle, setCanToggle] = useState<boolean>(false);
  const { onCapture } = useCapture();
  const rootFontRef = useRef<number>(16);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    try {
      // cache root font-size once per mount; it rarely changes
      rootFontRef.current = parseFloat(
        getComputedStyle(document.documentElement).fontSize || '16'
      );
    } catch {
      rootFontRef.current = 16;
    }
    const compute = () => {
      const collapsedMax = rootFontRef.current * 10; // Tailwind max-h-40 => 10rem
      const hasOverflow = el.scrollHeight > collapsedMax + 2;
      // prevent unnecessary state updates
      setCanToggle((prev) => (prev !== hasOverflow ? hasOverflow : prev));
    };
    rafRef.current = requestAnimationFrame(() => {
      compute();
    });
    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => compute());
    });
    ro.observe(el);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [message]);

  const paragraphClass = [
    'mt-3 text-sm text-muted-foreground text-center font-medium flex-grow whitespace-pre-line',
    expanded ? 'max-h-none overflow-visible' : 'max-h-40 overflow-y-auto',
  ].join(' ');

  const handleShare = async () => {
    const wasExpanded = expanded;
    if (!wasExpanded) {
      setExpanded(true);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
    }
    try {
      await onCapture(rootRef as React.RefObject<HTMLElement>, {
        fileName,
        shareTitle,
        shareText: shareTitle,
      });
    } finally {
      if (!wasExpanded) setExpanded(false);
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      const url: string =
        typeof window !== 'undefined' ? window.location.href : '';
      if (!url) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast.info('주소가 복사 되었습니다.');
        return;
      }
      // Fallback without deprecated execCommand: show prompt to let user copy manually
      window.prompt('주소를 복사해 주세요 (길게 눌러 전체 선택 후 복사):', url);
    } catch {
      // noop
    }
  };

  // const handleShareOnX = (): void => {
  //   const url: string =
  //     typeof window !== 'undefined' ? window.location.href : '';
  //   const text: string = `${shareTitle ?? title}`;
  //   const intent = new URL('https://twitter.com/intent/tweet');
  //   intent.searchParams.set('text', text);
  //   if (url) intent.searchParams.set('url', url);
  //   window.open(intent.toString(), '_blank', 'noopener,noreferrer');
  // };

  return (
    <div
      ref={rootRef}
      className={[
        'relative surface-card rounded-2xl shadow-lg p-6 flex flex-col min-h-[160px] transition-transform duration-300 hover:scale-105',
        surfaceClass || '',
      ].join(' ')}
    >
      <div
        className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-background shadow-md rounded-full p-3 border ${iconBorderClass}`}
      >
        {icon}
      </div>
      <h3
        className={`mt-6 text-lg font-bold ${titleColorClass} text-center tracking-tight`}
      >
        {title}
      </h3>
      <p ref={textRef} className={paragraphClass}>
        {message}
      </p>
      <div
        className="mt-auto pt-3 border-t border-border/40 flex w-full flex-wrap items-center justify-center gap-2"
        data-capture="ignore"
      >
        {canToggle && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`${title} 더보기/접기`}
            onClick={() => setExpanded((v) => !v)}
            className="h-8 px-3 text-xs min-w-[88px]"
          >
            {expanded ? '접기' : '더보기'}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={`${title} 링크 복사`}
          onClick={handleCopyLink}
          className="h-8 px-3 text-xs min-w-[88px]"
        >
          링크 복사
        </Button>
        {/* <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={`${title} X(트위터) 공유`}
          onClick={handleShareOnX}
          className="h-8 px-3 text-xs min-w-[88px]"
        >
          X 공유
        </Button> */}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={ariaLabel}
          onClick={handleShare}
          className="h-8 px-3 text-xs min-w-[88px]"
        >
          공유/저장
        </Button>
      </div>
    </div>
  );
}

export default MessageCardComponent;
