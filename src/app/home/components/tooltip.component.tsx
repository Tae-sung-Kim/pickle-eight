'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib';
import { SECTION_BADGE_COLOR } from '@/constants';
import type { MenuSectionKeyType } from '@/types';

export type MenuTooltipComponentProps = {
  description?: string;
  example?: string;
  clampLine?: number;
  section?: MenuSectionKeyType;
};

export function MenuTooltipComponent({
  description,
  example,
  clampLine = 2,
  section,
}: MenuTooltipComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const compute = () => {
      const next = el.scrollHeight > el.clientHeight + 1;
      setIsOverflow((prev) => (prev !== next ? next : prev));
    };
    compute();
    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => compute());
    });
    ro.observe(el);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [description, example, expanded]);

  if (!description && !example) return null;

  const Content = (
    <>
      {description && (
        <div
          ref={descRef}
          className={cn(
            'text-[15px] text-foreground font-medium transition-all',
            !expanded ? `line-clamp-${clampLine}` : ''
          )}
          style={{ minHeight: 24 }}
        >
          {description}
        </div>
      )}
      {example && (
        <span
          className={cn(
            'inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[13px] rounded-full italic border',
            section
              ? SECTION_BADGE_COLOR[section]
              : 'bg-primary/10 text-primary'
          )}
        >
          <span className="text-base">💡</span>
          {example}
        </span>
      )}
    </>
  );

  return (
    <>
      {/* Mobile: md 미만에서는 인라인 설명 + 더보기/닫기 */}
      <div className="md:hidden">
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

      {/* Desktop: md 이상에서는 Tooltip 사용 */}
      <div className="hidden md:block">
        <Tooltip>
          <TooltipContent
            className={cn(
              'rounded-xl shadow-xl border px-4 py-3 min-w-[220px] max-w-xs',
              section ? SECTION_BADGE_COLOR[section] : 'bg-white'
            )}
            side="top"
            sideOffset={26}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="text-[15px] text-foreground font-medium">
              {description}
            </div>
            {example && (
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] italic border',
                  section
                    ? SECTION_BADGE_COLOR[section]
                    : 'bg-primary/10 text-primary'
                )}
              >
                <span className="text-base">💡</span>
                {example}
              </div>
            )}
          </TooltipContent>
          <TooltipTrigger asChild>
            <div
              className="text-xs text-muted-foreground truncate cursor-help"
              onClick={(e) => {
                e.preventDefault();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            >
              {description}
              {example && (
                <span
                  className={cn(
                    'ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] italic border',
                    section
                      ? SECTION_BADGE_COLOR[section]
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  <span className="text-base">💡</span>
                  {example}
                </span>
              )}
            </div>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </>
  );
}

export default MenuTooltipComponent;
