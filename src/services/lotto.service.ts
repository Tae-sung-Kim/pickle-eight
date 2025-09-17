import { http } from "@/lib/http";
import { LottoDrawType } from "@/types/lotto.type";

const MIN_LOADING_MS: number = (() => {
  const raw = (process.env.NEXT_PUBLIC_LOTTO_MIN_LOADING_MS || '').trim();
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) return n;
  return 1200; // default 1.2s to make loading clearly visible
})();

async function withMinLoading<T>(p: Promise<T>): Promise<T> {
  const start = Date.now();
  const [res] = await Promise.all([
    p,
    new Promise<void>((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
  ]);
  const elapsed = Date.now() - start;
  if (elapsed < MIN_LOADING_MS) {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_LOADING_MS - elapsed)
    );
  }
  return res as T;
}

export async function getLottoDraws({
  from,
  to,
}: {
  from: number;
  to: number;
}): Promise<LottoDrawType[]> {
  const req = http.get<{ data: LottoDrawType[] }>('/lotto/draws', {
    params: { from, to },
  });
  const res = await withMinLoading(req);
  return res.data.data;
}

export async function getLatestLottoDraw(): Promise<{
  lastDrawNumber: number;
}> {
  const req = http.get<{ data: { lastDrawNumber: number } }>('/lotto/draws', {
    params: { latest: 1 },
  });
  const res = await withMinLoading(req);
  return res.data.data;
}

export async function getLottoDrawByNumber(
  drwNo: number
): Promise<LottoDrawType> {
  const req = http.get<{ data: LottoDrawType }>('/lotto/draws', {
    params: { drwNo },
  });
  const res = await withMinLoading(req);
  return res.data.data;
}

export function buildLottoCsvExportUrl(from?: number, to?: number): string {
  const base: string = '/lotto/export';
  const hasFrom: boolean =
    Number.isInteger(from as number) && (from as number) > 0;
  const hasTo: boolean = Number.isInteger(to as number) && (to as number) > 0;
  if (hasFrom && hasTo) return `${base}?from=${from}&to=${to}`;
  return base;
}

export async function exportLottoCsv({
  from,
  to,
}: {
  from?: number;
  to?: number;
}): Promise<{ blob: Blob; filename: string }> {
  const req = http.get<Blob>('/lotto/export', {
    params: { from, to },
    responseType: 'blob',
  });
  const res = await withMinLoading(req);
  const cd: string | undefined = (
    res.headers as Record<string, string | undefined>
  )['content-disposition'];
  let filename: string = 'lotto_export.csv';
  if (cd) {
    const m = cd.match(/filename=\"?([^\";]+)\"?/i);
    if (m && m[1]) filename = m[1];
  }
  return { blob: res.data as unknown as Blob, filename };
}
