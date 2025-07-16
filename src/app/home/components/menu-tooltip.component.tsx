'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib';

export type MenuTooltipComponentProps = {
  description?: string;
  example?: string;
  clampLine?: number;
};

export function MenuTooltipComponent({
  description,
  example,
  clampLine = 2,
}: MenuTooltipComponentProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 설명이 실제로 overflow 되는지 체크
  useEffect(() => {
    if (descRef.current) {
      setIsOverflow(
        descRef.current.scrollHeight > descRef.current.clientHeight
      );
    }
  }, [description, example, expanded, isMobile]);

  if (!description && !example) return null;

  const Content = (
    <>
      {description && (
        <div
          ref={descRef}
          className={cn(
            'text-[15px] text-foreground font-medium transition-all',
            !expanded && isMobile ? `line-clamp-${clampLine}` : ''
          )}
          style={{ minHeight: 24 }}
        >
          {description}
        </div>
      )}
      {example && (
        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[13px] rounded-full italic">
          <span className="text-base">💡</span>
          {example}
        </span>
      )}
    </>
  );

  // 모바일: 더보기/닫기
  if (isMobile) {
    return (
      <div>
        {Content}
        {isOverflow && !expanded && (
          <Button
            className="mt-1 text-primary underline text-xs bg-transparent hover:bg-primary/10 px-2 py-0"
            onClick={(e) => {
              e.preventDefault();
              setExpanded(true);
            }}
          >
            더보기
          </Button>
        )}
        {expanded && (
          <Button
            className="mt-1 text-primary underline text-xs bg-transparent hover:bg-primary/10 px-2 py-0"
            onClick={(e) => {
              e.preventDefault();
              setExpanded(false);
            }}
          >
            닫기
          </Button>
        )}
      </div>
    );
  }

  // PC: 툴팁(디자인도 더 산뜻하게)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-xs text-muted-foreground truncate cursor-help">
          {description}
          {example && (
            <span className="ml-1 inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] italic">
              <span className="text-base">💡</span>
              {example}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="rounded-xl bg-white shadow-xl border border-border px-4 py-3 min-w-[220px] max-w-xs"
        sideOffset={8}
      >
        <div className="text-[15px] text-foreground font-medium">
          {description}
        </div>
        {example && (
          <div className="mt-2 inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[13px] italic">
            <span className="text-base">💡</span>
            {example}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default MenuTooltipComponent;
