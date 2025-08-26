'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCapture } from '@/hooks';
import { TodayMessageCardType } from '@/types';

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

  useEffect(() => {
    const compute = () => {
      const el = textRef.current;
      if (!el) return setCanToggle(false);
      const rootFont = parseFloat(
        getComputedStyle(document.documentElement).fontSize || '16'
      );
      const collapsedMax = rootFont * 10; // Tailwind max-h-40 => 10rem
      const hasOverflow = el.scrollHeight > collapsedMax + 2;
      setCanToggle(hasOverflow);
    };
    const id = requestAnimationFrame(() => {
      compute();
      setTimeout(compute, 0);
    });
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', compute);
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
        className="mt-4 flex items-center justify-center gap-2"
        data-capture="ignore"
      >
        {canToggle && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`${title} 더보기/접기`}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '접기' : '더보기'}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={ariaLabel}
          onClick={handleShare}
        >
          공유/저장
        </Button>
      </div>
    </div>
  );
}

export default MessageCardComponent;
