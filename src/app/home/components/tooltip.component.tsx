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
      <TooltipContent
        className={cn(
          'rounded-xl shadow-xl border px-4 py-3 min-w-[220px] max-w-xs',
          section ? SECTION_BADGE_COLOR[section] : 'bg-white'
        )}
        side="top"
        sideOffset={26}
        onClick={(e) => {
          // 툴팁 콘텐츠 클릭 시에도 링크로 이벤트 전파 방지
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
            // 링크 카드 내부에서 툴팁 트리거를 클릭해도 네비게이션 되지 않도록 방지
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            // 링크 클릭으로 전파되어 네비게이션되는 것을 방지
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
  );
}

export default MenuTooltipComponent;
