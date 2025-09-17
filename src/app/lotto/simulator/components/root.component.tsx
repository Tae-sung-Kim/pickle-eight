'use client';
import { LOTTO_MAX_CUSTOM_TICKETS } from '@/constants/lotto.constant';
import { LottoLankType } from '@/types/lotto.type';
import { LottoGenerator, LottoUtils } from '@/utils/lotto.util';
import { useEffect, useMemo, useState } from 'react';
import { SimulatorBestPerformanceComponent } from './best-performance.component';
import { SimulatorControlsComponent } from './controls.component';
import { SimulatorCustomTicketsComponent } from './custom-tickets.component';
import { SimulatorProbabilitiesComponent } from './probabilities.component';
import { SimulatorResultsSummaryComponent } from './results-summary.component';
import { SimulatorTicketsComponent } from './tickets.component';
import { ClientCsvButtonComponent } from '@/components/shared/lotto/client-csv-button.component';

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

function toNumberTickets(
  src: ReadonlyArray<{
    numbers: readonly [string, string, string, string, string, string];
  }>
): ReadonlyArray<{
  numbers: readonly [number, number, number, number, number, number];
}> {
  const out: Array<{
    numbers: readonly [number, number, number, number, number, number];
  }> = [];
  for (const t of src) {
    const nums = t.numbers
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n)) as number[];
    if (nums.length !== 6) continue;
    const inRange = nums.every((n) => n >= 1 && n <= 45);
    if (!inRange) continue;
    const unique = new Set(nums);
    if (unique.size !== 6) continue;
    nums.sort((a, b) => a - b);
    out.push({
      numbers: [nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]],
    });
  }
  return out;
}

export function LottoSimulatorComponent() {
  const [ticketCount, setTicketCount] = useState<number>(10);
  const [drawCount, setDrawCount] = useState<number>(500);
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<null | {
    total: number;
    ranks: Record<LottoLankType, number>;
    best: {
      rank: LottoLankType;
      matches: number;
      bonus: boolean;
    } | null;
    sampleTicket: ReadonlyArray<
      readonly [number, number, number, number, number, number]
    >;
  }>(null);

  const [tickets, setTickets] = useState<
    ReadonlyArray<{
      numbers: readonly [number, number, number, number, number, number];
    }>
  >([]);
  const [mode, setMode] = useState<'random' | 'custom'>('random');
  const [customTickets, setCustomTickets] = useState<
    ReadonlyArray<{
      numbers: readonly [string, string, string, string, string, string];
    }>
  >([]);

  const handleModeChage = (mode: string) => {
    setMode(mode as 'random' | 'custom');
    if (mode === 'custom') {
      setTicketCount(0);
    } else {
      setTicketCount(10);
    }
    setCustomTickets([]);
  };

  const handleAddCustomTicket = (
    next: ReadonlyArray<{
      numbers: readonly [string, string, string, string, string, string];
    }>
  ) => {
    if (customTickets.length >= LOTTO_MAX_CUSTOM_TICKETS) return;
    setCustomTickets(next);
    setTicketCount(next.length);
  };

  useEffect(() => {
    if (mode === 'random') {
      setTickets(LottoGenerator.generate(ticketCount));
      return;
    }
    setTickets(toNumberTickets(customTickets));
  }, [mode, ticketCount, customTickets]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const canRun: boolean = useMemo<boolean>(() => {
    if (running) return false;
    if (mode === 'random') return ticketCount > 0;
    const generated = toNumberTickets(customTickets).length;
    const requested = customTickets.length;
    return requested > 0 && generated === requested;
  }, [running, mode, ticketCount, customTickets]);
  const displayTickets = useMemo(
    () => (showAll ? tickets : tickets.slice(0, Math.min(6, tickets.length))),
    [showAll, tickets]
  );

  async function run() {
    setRunning(true);
    try {
      const ranks: Record<LottoLankType, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let best: {
        rank: LottoLankType;
        matches: number;
        bonus: boolean;
      } | null = null;
      for (let d = 0; d < drawCount; d += 1) {
        const draw = generateRandomDraw();
        for (const t of tickets) {
          const r = LottoUtils.checkTicket(draw, t);
          ranks[r.rank as LottoLankType] += 1;
          if (
            !best ||
            r.rank < best.rank ||
            (r.rank === best.rank && r.matchCount > best.matches)
          ) {
            best = {
              rank: r.rank as LottoLankType,
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
    <>
      <SimulatorControlsComponent
        ticketCount={ticketCount}
        drawCount={drawCount}
        running={running}
        mode={mode}
        onModeChange={handleModeChage}
        onTicketCountChange={setTicketCount}
        onDrawCountChange={setDrawCount}
        onRun={run}
        canRun={canRun}
      />

      {mode === 'custom' && (
        <SimulatorCustomTicketsComponent
          tickets={customTickets}
          onChange={handleAddCustomTicket}
        />
      )}

      <SimulatorTicketsComponent
        tickets={tickets}
        displayTickets={displayTickets}
        showAll={showAll}
        onShowAll={() => setShowAll(true)}
        onCollapse={() => setShowAll(false)}
      />

      {result && (
        <div className="mt-6 space-y-3">
          <SimulatorResultsSummaryComponent
            total={result.total}
            ranks={result.ranks}
          />
          <SimulatorProbabilitiesComponent
            total={result.total}
            ranks={result.ranks}
          />
          <SimulatorBestPerformanceComponent best={result.best} />
          <div className="mt-2 flex items-center justify-end gap-2">
            <ClientCsvButtonComponent
              headers={['rank', 'count', 'probability']}
              rows={([0, 1, 2, 3, 4, 5] as number[]).map((rk) => [
                rk,
                result.ranks[rk as LottoLankType] ?? 0,
                (
                  (result.ranks[rk as LottoLankType] ?? 0) / result.total
                ).toFixed(6),
              ])}
              filename="simulation_summary.csv"
              baseLabel="시뮬레이션 요약 CSV"
            />
            <ClientCsvButtonComponent
              headers={['no1', 'no2', 'no3', 'no4', 'no5', 'no6']}
              rows={result.sampleTicket}
              filename="simulation_tickets_sample.csv"
              baseLabel="표본 티켓 CSV"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default LottoSimulatorComponent;
