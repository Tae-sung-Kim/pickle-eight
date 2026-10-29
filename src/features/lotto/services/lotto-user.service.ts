import {
  getLatestLottoDraw,
  getLottoDraws,
} from '@/features/lotto/services/lotto.service';
import type {
  LottoCheckResultType,
  LottoNumberSetType,
} from '@/features/lotto/types/lotto.type';
import { LottoUtils } from '@/features/lotto/utils/lotto.util';
import { http } from '@/lib/http';

const STORAGE_PREFIX = 'pickle-eight:lotto:';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function readList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
}

function sortByDesc<T>(
  items: readonly T[],
  pick: (item: T) => string | undefined
): T[] {
  return [...items].sort((a, b) =>
    (pick(b) ?? '').localeCompare(pick(a) ?? '')
  );
}

export async function listMyNumberSets(): Promise<LottoNumberSetType[]> {
  return sortByDesc(
    readList<LottoNumberSetType>('number-sets'),
    (s) => s.updatedAt
  );
}

// 판매는 매주 토요일 20:00:00(KST)까지 가능하고 20:00:01부터 차단된다.
// 1회 기준: 2002-12-07 20:00:01 KST 이후는 다음 회차
const FIRST_CUTOFF_MS = Date.UTC(2002, 11, 7, 11, 0, 1);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** 지금 번호를 정해도 유효한 회차: 마감 전이면 이번 주 토요일 회차, 마감 후면 다음 회차 */
function currentDrawNumberAt(nowMs: number): number {
  return Math.floor((nowMs - FIRST_CUTOFF_MS) / WEEK_MS) + 2;
}

// 추첨 직후 DB 동기화 전에도 이미 추첨된 회차를 시작 회차로 잡지 않도록
// 날짜 기준 회차와 DB 최신 회차 + 1 중 큰 값을 쓴다
async function resolveStartDrawNumber(): Promise<number> {
  const byCalendar = currentDrawNumberAt(Date.now());
  try {
    const latest = (await getLatestLottoDraw()).lastDrawNumber ?? 0;
    return Math.max(byCalendar, latest + 1);
  } catch {
    return byCalendar;
  }
}

export async function saveMyNumberSet(
  payload: Partial<LottoNumberSetType>
): Promise<string> {
  const numbers = Array.isArray(payload.numbers)
    ? payload.numbers.map(Number)
    : [];
  if (numbers.length !== 6) throw new Error('invalid/numbers');
  // 비동기 조회는 저장소 읽기/쓰기(동기) 전에 끝내서 동시 저장 시 덮어쓰기를 막는다
  const startDrawNumber =
    payload.startDrawNumber ?? (await resolveStartDrawNumber());
  const sets = readList<LottoNumberSetType>('number-sets');
  const id = payload.id ?? createId();
  const prev = sets.find((s) => s.id === id);
  const next: LottoNumberSetType = {
    id,
    numbers: [...numbers]
      .slice(0, 6)
      .sort((a, b) => a - b) as unknown as LottoNumberSetType['numbers'],
    label: payload.label ?? undefined,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    isFavorite: Boolean(payload.isFavorite),
    startDrawNumber: prev?.startDrawNumber ?? startDrawNumber,
    createdAt: prev?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };
  writeList(
    'number-sets',
    prev ? sets.map((s) => (s.id === id ? next : s)) : [...sets, next]
  );
  return id;
}

export async function deleteMyNumberSet(id: string): Promise<void> {
  writeList(
    'number-sets',
    readList<LottoNumberSetType>('number-sets').filter((s) => s.id !== id)
  );
}

/** 한 번에 비교하는 최근 회차 수 */
const RESULT_WINDOW = 52;

export type MyNumberDrawResult = Readonly<{
  drawNumber: number;
  drawDate: string;
  winningNumbers: readonly number[];
  bonusNumber: number;
  matchCount: number;
  bonusMatch: boolean;
  rank: 0 | 1 | 2 | 3 | 4 | 5;
}>;

export type MyNumberResultItem = Readonly<{
  id: string;
  /** 이 번호가 유효한 첫 회차. 기록이 없는 예전 번호는 null */
  startDrawNumber: number | null;
  /** 번호가 유효한 회차의 결과만, 최신 회차가 먼저 */
  results: ReadonlyArray<MyNumberDrawResult>;
}>;

export type MyNumberResultsType = Readonly<{
  latestDrawNumber: number;
  items: ReadonlyArray<MyNumberResultItem>;
}>;

export async function compareMyNumbers(): Promise<MyNumberResultsType> {
  const sets = readList<LottoNumberSetType>('number-sets');
  const latestDrawNumber = (await getLatestLottoDraw()).lastDrawNumber ?? 0;
  const empty = (set: LottoNumberSetType): MyNumberResultItem => ({
    id: set.id ?? '',
    startDrawNumber: set.startDrawNumber ?? null,
    results: [],
  });
  if (sets.length === 0 || latestDrawNumber <= 0) {
    return { latestDrawNumber, items: sets.map(empty) };
  }

  const windowFrom = Math.max(1, latestDrawNumber - RESULT_WINDOW + 1);
  const starts = sets
    .map((s) => s.startDrawNumber)
    .filter((n): n is number => Number.isInteger(n));
  const from =
    starts.length === sets.length
      ? Math.max(windowFrom, Math.min(...starts))
      : windowFrom;
  const draws =
    from > latestDrawNumber
      ? []
      : [...(await getLottoDraws({ from, to: latestDrawNumber }))].sort(
          (a, b) => b.drawNumber - a.drawNumber
        );

  return {
    latestDrawNumber,
    items: sets.map((set) => ({
      ...empty(set),
      results: draws
        .filter((draw) => LottoUtils.isNumberSetValidForDraw(set, draw))
        .map((draw) => {
          const res: LottoCheckResultType = LottoUtils.checkTicket(draw, {
            numbers: set.numbers,
          });
          return {
            drawNumber: draw.drawNumber,
            drawDate: draw.drawDate,
            winningNumbers: draw.numbers,
            bonusNumber: draw.bonusNumber,
            matchCount: res.matchCount,
            bonusMatch: res.bonusMatch,
            rank: res.rank,
          };
        }),
    })),
  };
}

export type HotColdStats = Readonly<{
  latest: number;
  frequency: Readonly<Record<number, number>>;
  overdue: Readonly<Record<number, number>>; // how many draws since last appearance
  recentWindow: number;
  recentFrequency: Readonly<Record<number, number>>;
}>;

export async function getHotColdStats(): Promise<HotColdStats | null> {
  const res = await http.get<{ ok: boolean; data: HotColdStats | null }>(
    '/lotto/stats/hot-cold'
  );
  return res.data.data ?? null;
}
