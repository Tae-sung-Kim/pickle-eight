import type { LottoDrawType } from '@/features/lotto/types/lotto.type';
import { supabaseAdmin } from '@/lib/supabase-server';

const TABLE = 'lotto_draws' as const;
const RANGE_PAGE_SIZE = 1000 as const; // PostgREST returns at most 1000 rows per request

type LottoDrawRow = {
  draw_number: number;
  draw_date: string;
  numbers: number[];
  bonus_number: number;
  first_win_count: number | null;
  first_prize_amount: number | null;
  second_win_count: number | null;
  second_prize_amount: number | null;
  second_total_amount: number | null;
  third_win_count: number | null;
  third_prize_amount: number | null;
  third_total_amount: number | null;
  fourth_win_count: number | null;
  fourth_prize_amount: number | null;
  fourth_total_amount: number | null;
  fifth_win_count: number | null;
  fifth_prize_amount: number | null;
  fifth_total_amount: number | null;
  total_winners: number | null;
  total_sales_amount: number | null;
};

function toRow(draw: LottoDrawType): LottoDrawRow {
  return {
    draw_number: draw.drawNumber,
    draw_date: draw.drawDate,
    numbers: [...draw.numbers],
    bonus_number: draw.bonusNumber,
    first_win_count: draw.firstWinCount,
    first_prize_amount: draw.firstPrizeAmount,
    second_win_count: draw.secondWinCount,
    second_prize_amount: draw.secondPrizeAmount,
    second_total_amount: draw.secondTotalAmount,
    third_win_count: draw.thirdWinCount,
    third_prize_amount: draw.thirdPrizeAmount,
    third_total_amount: draw.thirdTotalAmount,
    fourth_win_count: draw.fourthWinCount,
    fourth_prize_amount: draw.fourthPrizeAmount,
    fourth_total_amount: draw.fourthTotalAmount,
    fifth_win_count: draw.fifthWinCount,
    fifth_prize_amount: draw.fifthPrizeAmount,
    fifth_total_amount: draw.fifthTotalAmount,
    total_winners: draw.totalWinners,
    total_sales_amount: draw.totalSalesAmount,
  };
}

function fromRow(row: LottoDrawRow): LottoDrawType {
  const numbers = [...row.numbers].sort((a, b) => a - b) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  return {
    drawNumber: row.draw_number,
    drawDate: row.draw_date,
    numbers,
    bonusNumber: row.bonus_number,
    firstWinCount: row.first_win_count ?? 0,
    firstPrizeAmount: row.first_prize_amount ?? 0,
    secondWinCount: row.second_win_count ?? 0,
    secondPrizeAmount: row.second_prize_amount ?? 0,
    secondTotalAmount: row.second_total_amount ?? 0,
    thirdWinCount: row.third_win_count ?? 0,
    thirdPrizeAmount: row.third_prize_amount ?? 0,
    thirdTotalAmount: row.third_total_amount ?? 0,
    fourthWinCount: row.fourth_win_count ?? 0,
    fourthPrizeAmount: row.fourth_prize_amount ?? 0,
    fourthTotalAmount: row.fourth_total_amount ?? 0,
    fifthWinCount: row.fifth_win_count ?? 0,
    fifthPrizeAmount: row.fifth_prize_amount ?? 0,
    fifthTotalAmount: row.fifth_total_amount ?? 0,
    totalWinners: row.total_winners ?? 0,
    totalSalesAmount: row.total_sales_amount ?? 0,
  };
}

async function upsertDraw(draw: LottoDrawType): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .upsert(toRow(draw), { onConflict: 'draw_number' });
  if (error) throw error;
}

async function getLatestDrawNumber(): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('draw_number')
    .order('draw_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.draw_number ?? null;
}

async function getDrawByNumber(drwNo: number): Promise<LottoDrawType | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('draw_number', drwNo)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as LottoDrawRow) : null;
}

async function getDrawsRange(
  from: number,
  to: number
): Promise<LottoDrawType[]> {
  const items: LottoDrawType[] = [];
  for (let start = from; start <= to; start += RANGE_PAGE_SIZE) {
    const end = Math.min(to, start + RANGE_PAGE_SIZE - 1);
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .gte('draw_number', start)
      .lte('draw_number', end)
      .order('draw_number', { ascending: true });
    if (error) throw error;
    items.push(...((data ?? []) as LottoDrawRow[]).map(fromRow));
  }
  return items;
}

export const lottoRepository = {
  upsertDraw,
  getLatestDrawNumber,
  getDrawByNumber,
  getDrawsRange,
};
