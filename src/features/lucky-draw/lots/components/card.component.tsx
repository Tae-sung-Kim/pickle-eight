'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { type JSX, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type LuckyDrawLotsCardPropsType = Readonly<{
  /** 0부터. 화면 번호는 position + 1 */
  position: number;
  /** 열지 않은 카드는 null. 열지 않은 카드의 항목은 props로도 받지 않는다 */
  label: string | null;
  onOpen: (position: number) => void;
}>;

const OPEN_DURATION_SEC = 0.2;

/**
 * LuckyDrawLotsCardComponent
 * - 카드 한 장. 열기 전후 같은 button이라 열어도 키보드 포커스가 남는다.
 * - 열린 카드는 aria-disabled(disabled 아님)이고 클릭을 무시한다.
 */
export function LuckyDrawLotsCardComponent({
  position,
  label,
  onOpen,
}: LuckyDrawLotsCardPropsType): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  // 이 카드를 직접 눌러 열 때만 0.2초 연출. "남은 카드 모두 열기"는 즉시
  const [isPressed, setIsPressed] = useState(false);
  const number = position + 1;
  const isOpen = label !== null;

  // 다시 섞어 카드가 닫히면 연출 표시 초기화(카드는 위치 key라 state가 남는다)
  useEffect(() => {
    if (!isOpen) setIsPressed(false);
  }, [isOpen]);

  const handleClick = (): void => {
    if (isOpen) return;
    setIsPressed(true);
    onOpen(position);
  };

  return (
    <button
      type="button"
      aria-label={
        isOpen ? `${number}번째 카드: ${label}` : `${number}번째 카드 열기`
      }
      aria-disabled={isOpen ? 'true' : undefined}
      onClick={handleClick}
      className={cn(
        'relative flex min-h-24 w-full flex-col items-center justify-center rounded-lg border border-menu-lucky p-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
        isOpen
          ? 'cursor-default border-2 bg-menu-lucky/10 text-foreground'
          : 'bg-menu-lucky text-primary-foreground hover:bg-menu-lucky/90'
      )}
    >
      {isOpen ? (
        <motion.span
          aria-hidden="true"
          initial={isPressed ? { opacity: 0, scaleX: 0.9 } : false}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : OPEN_DURATION_SEC,
            ease: 'easeOut',
          }}
          className="flex size-full flex-col items-center justify-between gap-1"
        >
          <span className="flex w-full items-start justify-between">
            <span className="flex size-5 items-center justify-center rounded-md bg-menu-lucky/10 font-mono text-xs leading-4 text-foreground">
              {number}
            </span>
            <Check className="size-4 text-menu-lucky" />
          </span>
          <span className="w-full break-words text-center text-sm font-medium leading-5 sm:text-base sm:leading-6">
            {label}
          </span>
        </motion.span>
      ) : (
        <>
          <span className="font-mono text-2xl font-semibold leading-8">
            {number}
          </span>
          <span className="text-sm font-medium leading-5">열기</span>
        </>
      )}
    </button>
  );
}
