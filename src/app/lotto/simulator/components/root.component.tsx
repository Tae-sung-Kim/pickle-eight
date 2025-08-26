'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LottoUtils, LottoGenerator } from '@/utils';
import { LottoWarningAlertComponent, LottoBallComponent } from '@/components';

function generateRandomDraw() {
  const pool: number[] = [];
  for (let i = 1; i <= 45; i += 1) pool.push(i);
  const nums: number[] = [];
  while (nums.length < 6) {
    const idx = Math.floor(Math.random() * pool.length);
    const pick = pool[idx];
    if (!nums.includes(pick)) nums.push(pick);
  }
  nums.sort((a, b) => a - b);
  let bonus = 0;
  while (bonus === 0 || nums.includes(bonus)) {
    bonus = Math.floor(Math.random() * 45) + 1;
  }
  return {
    drawNumber: 0,
    drawDate: '',
    numbers: [nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]] as [
      number,
      number,
      number,
      number,
      number,
      number
    ],
    bonusNumber: bonus,
  };
}

export function LottoSimulatorComponent() {
  const [ticketCount, setTicketCount] = useState<number>(5);
  const [drawCount, setDrawCount] = useState<number>(1000);
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<null | {
    total: number;
    ranks: Record<0 | 1 | 2 | 3 | 4 | 5, number>;
    best: {
      rank: 0 | 1 | 2 | 3 | 4 | 5;
      matches: number;
      bonus: boolean;
    } | null;
    sampleTicket: ReadonlyArray<
      readonly [number, number, number, number, number, number]
    >;
  }>(null);

  // Avoid generating random tickets during render (prevents SSR/CSR mismatch)
  const [tickets, setTickets] = useState<
    ReadonlyArray<{
      numbers: readonly [number, number, number, number, number, number];
    }>
  >([]);
  useEffect(() => {
    setTickets(LottoGenerator.generate(ticketCount));
  }, [ticketCount]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const displayTickets = useMemo(
    () => (showAll ? tickets : tickets.slice(0, Math.min(6, tickets.length))),
    [showAll, tickets]
  );

  async function run() {
    setRunning(true);
    try {
      const ranks: Record<0 | 1 | 2 | 3 | 4 | 5, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let best: {
        rank: 0 | 1 | 2 | 3 | 4 | 5;
        matches: number;
        bonus: boolean;
      } | null = null;
      for (let d = 0; d < drawCount; d += 1) {
        const draw = generateRandomDraw();
        for (const t of tickets) {
          const r = LottoUtils.checkTicket(draw, t);
          ranks[r.rank as 0 | 1 | 2 | 3 | 4 | 5] += 1;
          if (
            !best ||
            r.rank < best.rank ||
            (r.rank === best.rank && r.matchCount > best.matches)
          ) {
            best = {
              rank: r.rank as 0 | 1 | 2 | 3 | 4 | 5,
              matches: r.matchCount,
              bonus: r.bonusMatch,
            };
          }
        }
      }
      setResult({
        total: drawCount * tickets.length,
        ranks,
        best,
        sampleTicket: tickets.map((t) => t.numbers),
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 시뮬레이터</h1>
      <p className="text-sm text-muted-foreground mt-1">
        랜덤 추첨을 다회 실행하여 당첨 분포를 확인합니다.
      </p>
      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <label className="w-32 text-sm">티켓 수</label>
          <input
            type="number"
            min={1}
            max={100}
            value={ticketCount}
            onChange={(e) => setTicketCount(Number(e.target.value))}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-32 text-sm">시뮬레이션 회수</label>
          <input
            type="number"
            min={1}
            max={20000}
            value={drawCount}
            onChange={(e) => setDrawCount(Number(e.target.value))}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={running}
        onClick={run}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {running ? '실행 중...' : '시뮬레이션 실행'}
      </button>

      {tickets.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              샘플 티켓{' '}
              <span className="ml-1">
                (표시 {displayTickets.length} / 총 {tickets.length})
              </span>
            </div>
            {tickets.length > displayTickets.length && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setShowAll(true)}
              >
                모두 보기
              </button>
            )}
            {showAll && tickets.length > 24 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setShowAll(false)}
              >
                간략히
              </button>
            )}
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayTickets.map((t, idx) => (
              <div key={idx} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">
                  티켓 #{idx + 1}
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {t.numbers.map((n, i) => (
                    <LottoBallComponent key={n} number={n} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-md border p-4">
            <div className="font-medium">결과 요약</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div>총 비교 수: {result.total.toLocaleString()}</div>
              <div>1등: {result.ranks[1].toLocaleString()}</div>
              <div>2등: {result.ranks[2].toLocaleString()}</div>
              <div>3등: {result.ranks[3].toLocaleString()}</div>
              <div>4등: {result.ranks[4].toLocaleString()}</div>
              <div>5등: {result.ranks[5].toLocaleString()}</div>
              <div>낙첨: {result.ranks[0].toLocaleString()}</div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="font-medium">추정 확률</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {([1, 2, 3, 4, 5] as const).map((rk) => (
                <div key={rk}>
                  {rk}등:{' '}
                  {(result.ranks[rk] / result.total).toLocaleString(undefined, {
                    style: 'percent',
                    minimumFractionDigits: 6,
                  })}
                </div>
              ))}
              <div>
                낙첨:{' '}
                {(result.ranks[0] / result.total).toLocaleString(undefined, {
                  style: 'percent',
                  minimumFractionDigits: 4,
                })}
              </div>
            </div>
          </div>

          {result.best && (
            <div className="rounded-md border p-4">
              <div className="font-medium">최고 성과</div>
              <div className="text-sm mt-2">
                등수: {result.best.rank}등 / 일치: {result.best.matches}개
                {result.best.bonus ? ' + 보너스' : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LottoSimulatorComponent;
