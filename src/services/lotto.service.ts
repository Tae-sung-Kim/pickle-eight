import { LottoDrawType } from '@/types';
import { http } from '@/lib';

export async function getLottoDraws({
  from,
  to,
}: {
  from: number;
  to: number;
}): Promise<LottoDrawType[]> {
  const res = await http.get<{ data: LottoDrawType[] }>('/lotto/draws', {
    params: { from, to },
  });
  return res.data.data;
}

export async function getLatestLottoDraw(): Promise<{
  lastDrawNumber: number;
}> {
  const res = await http.get<{ data: { lastDrawNumber: number } }>(
    '/lotto/draws',
    {
      params: { latest: 1 },
    }
  );
  return res.data.data;
}

export async function getLottoDrawByNumber(
  drwNo: number
): Promise<LottoDrawType> {
  const res = await http.get<{ data: LottoDrawType }>('/lotto/draws', {
    params: { drwNo },
  });
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
  const res = await http.get<Blob>('/lotto/export', {
    params: { from, to },
    responseType: 'blob',
  });
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
