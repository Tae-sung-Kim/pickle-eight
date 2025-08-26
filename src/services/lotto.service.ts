import { LottoDrawType } from '@/types';
import { apiInstance } from './axios-instance';

export async function getLottoDraws({
  from,
  to,
}: {
  from: number;
  to: number;
}): Promise<LottoDrawType[]> {
  const res = await apiInstance.get<{ data: LottoDrawType[] }>('/lotto/draws', {
    params: { from, to },
  });
  return res.data.data;
}

export async function getLatestLottoDraw(): Promise<{
  lastDrawNumber: number;
}> {
  const res = await apiInstance.get<{ data: { lastDrawNumber: number } }>(
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
  const res = await apiInstance.get<{ data: LottoDrawType }>('/lotto/draws', {
    params: { drwNo },
  });
  return res.data.data;
}
