'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RouletteItemType } from '@/types/roulette.type';

export type RoulettePropsType = Readonly<{
  items: readonly RouletteItemType[];
  /** 멈출 칸. null이면 멈춘 채로 둔다 */
  targetIndex: number | null;
  /** 바뀔 때마다 targetIndex로 새로 돈다 */
  spinId: number;
  /** 연출이 끝나면(동작 줄이기에서도) 반드시 한 번 부른다 */
  onSpinEnd?: (spinId: number) => void;
  className?: string;
}>;

// 회전 연출 값 (U1)
const SPIN_DURATION_SEC = 1.0;
const SPIN_TURNS = 2;
const SPIN_EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

// viewBox 기준 치수
const CENTER = 200;
const SLICE_RADIUS = 164;
const RING_RADIUS = 176;
const LABEL_END_RADIUS = 150;
const LABEL_START_RADIUS = 70;
const CAP_RADIUS = 48;

const LARGE_LABEL_MAX = 12;
const SMALL_LABEL_MAX = 28;
const LARGE_FONT = 20;
const SMALL_FONT = 15;

function polar(radius: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function slicePath(index: number, count: number): string {
  const step = 360 / count;
  const [x1, y1] = polar(SLICE_RADIUS, index * step);
  const [x2, y2] = polar(SLICE_RADIUS, (index + 1) * step);
  const large = step > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${SLICE_RADIUS} ${SLICE_RADIUS} 0 ${large} 1 ${x2} ${y2} Z`;
}

function sliceFillClass(index: number, count: number): string {
  if (count > 1 && count % 2 === 1 && index === count - 1) {
    return 'fill-muted';
  }
  return index % 2 === 0 ? 'fill-card' : 'fill-background';
}

// 목표 칸 가운데가 3시 방향(0도)에 오도록, 현재 각도에서 이어서 시계 방향으로 도는 최종 각도
function computeFinalAngle(
  current: number,
  targetIndex: number,
  count: number
): number {
  const center = (targetIndex + 0.5) * (360 / count);
  const delta = (((-center - current) % 360) + 360) % 360;
  return current + SPIN_TURNS * 360 + delta;
}

type RotationType = Readonly<{ deg: number; duration: number }>;

export function RouletteComponent({
  items,
  targetIndex,
  spinId,
  onSpinEnd,
  className,
}: RoulettePropsType) {
  const reduced = useReducedMotion();
  const count = items.length;
  const signature = items.map((item) => item.key).join('|');

  const [rotation, setRotation] = useState<RotationType>({
    deg: 0,
    duration: 0,
  });
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

  const angleRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  const prevSpinIdRef = useRef(spinId);
  const latestRef = useRef({ targetIndex, count, reduced, onSpinEnd });
  latestRef.current = { targetIndex, count, reduced, onSpinEnd };

  // 칸 구성이 바뀌면 각도 0, 당첨 칸 지움 (전환 없이 즉시)
  // biome-ignore lint/correctness/useExhaustiveDependencies: signature 변경만 트리거
  useEffect(() => {
    angleRef.current = 0;
    pendingRef.current = null;
    setRotation({ deg: 0, duration: 0 });
    setRevealedIndex(null);
  }, [signature]);

  // spinId가 바뀔 때마다 targetIndex로 돈다
  useEffect(() => {
    if (prevSpinIdRef.current === spinId) return;
    prevSpinIdRef.current = spinId;
    const {
      targetIndex: target,
      count: n,
      reduced: noMotion,
    } = latestRef.current;
    if (target === null || n === 0 || target < 0 || target >= n) return;

    const finalDeg = computeFinalAngle(angleRef.current, target, n);
    angleRef.current = finalDeg;

    if (noMotion) {
      pendingRef.current = null;
      setRotation({ deg: finalDeg, duration: 0 });
      setRevealedIndex(target);
      queueMicrotask(() => latestRef.current.onSpinEnd?.(spinId));
      return;
    }
    pendingRef.current = spinId;
    setRevealedIndex(null);
    setRotation({ deg: finalDeg, duration: SPIN_DURATION_SEC });
  }, [spinId]);

  function handleAnimationComplete() {
    const pending = pendingRef.current;
    if (pending === null) return;
    pendingRef.current = null;
    const target = latestRef.current.targetIndex;
    setRevealedIndex(target);
    latestRef.current.onSpinEnd?.(pending);
  }

  const showLabels = count >= 1 && count <= SMALL_LABEL_MAX;
  const fontSize = count <= LARGE_LABEL_MAX ? LARGE_FONT : SMALL_FONT;
  const labelWidth = LABEL_END_RADIUS - LABEL_START_RADIUS;
  const step = count > 0 ? 360 / count : 0;

  const revealedLabel =
    revealedIndex !== null ? (items[revealedIndex]?.label ?? '') : '';
  const capFont = Math.max(
    15,
    Math.min(16, 76 / Math.max(revealedLabel.length, 1))
  );
  const capLabelOverflow = revealedLabel.length * capFont > 76;

  return (
    <div
      aria-hidden="true"
      className={cn('relative aspect-square w-full', className)}
    >
      {/* 고정: 테두리 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={(RING_RADIUS + SLICE_RADIUS) / 2}
          fill="none"
          strokeWidth={RING_RADIUS - SLICE_RADIUS}
          className="stroke-jar"
        />
      </svg>

      {/* 회전: 칸, 칸 글자, 당첨 칸 */}
      <motion.svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        focusable="false"
        style={{ transformOrigin: '50% 50%' }}
        initial={false}
        animate={{ rotate: rotation.deg }}
        transition={{ duration: rotation.duration, ease: SPIN_EASE }}
        onAnimationComplete={handleAnimationComplete}
      >
        {count === 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={SLICE_RADIUS}
            strokeWidth={2}
            strokeDasharray="8 8"
            className="fill-muted/40 stroke-border"
          />
        )}
        {count === 1 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={SLICE_RADIUS}
            strokeWidth={1}
            className="fill-card stroke-border"
          />
        )}
        {count > 1 &&
          items.map((item, i) => (
            <path
              key={item.key}
              d={slicePath(i, count)}
              strokeWidth={1}
              className={cn('stroke-border', sliceFillClass(i, count))}
            />
          ))}

        {showLabels &&
          items.map((item, i) => {
            const mid = count === 1 ? 0 : (i + 0.5) * step;
            const [x, y] = polar(LABEL_END_RADIUS, 0);
            const overflow = item.label.length * fontSize > labelWidth;
            // 최종 각도에서 글자가 뒤집히는 구간(90~270도)이면 180도 보정
            const finalDeg = (((mid + rotation.deg) % 360) + 360) % 360;
            const flipped = finalDeg > 90 && finalDeg < 270;
            return (
              <text
                key={item.key}
                x={flipped ? 2 * CENTER - x : x}
                y={y}
                transform={`rotate(${flipped ? mid + 180 : mid} ${CENTER} ${CENTER})`}
                textAnchor={flipped ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={fontSize}
                textLength={overflow ? labelWidth : undefined}
                lengthAdjust={overflow ? 'spacingAndGlyphs' : undefined}
                className="fill-foreground"
              >
                {item.label}
              </text>
            );
          })}

        {revealedIndex !== null && count === 1 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={SLICE_RADIUS}
            strokeWidth={3}
            className="fill-menu-lunch/20 stroke-menu-lunch"
          />
        )}
        {revealedIndex !== null && count > 1 && (
          <path
            d={slicePath(revealedIndex, count)}
            strokeWidth={3}
            className="fill-menu-lunch/20 stroke-menu-lunch"
          />
        )}
      </motion.svg>

      {/* 고정: 3시 방향 바늘, 병뚜껑, 결과 이름 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        {count > 0 && (
          <polygon
            points="400,184 400,216 348,200"
            strokeWidth={2}
            strokeLinejoin="round"
            className="fill-menu-lunch stroke-background"
          />
        )}
        <g className={count === 0 ? 'opacity-60' : undefined}>
          <circle cx={CENTER} cy={CENTER} r={CAP_RADIUS} className="fill-jar" />
          {revealedLabel === '' ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={6}
              className="fill-jar-foreground"
            />
          ) : (
            <text
              x={CENTER}
              y={CENTER}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={capFont}
              fontWeight={600}
              textLength={capLabelOverflow ? 76 : undefined}
              lengthAdjust={capLabelOverflow ? 'spacingAndGlyphs' : undefined}
              className="fill-jar-foreground"
            >
              {revealedLabel}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
