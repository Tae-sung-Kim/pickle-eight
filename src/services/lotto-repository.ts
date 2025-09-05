import { adminDb } from '@/lib/firebase-admin';
import type { LottoDrawType } from '@/types';

/**
 * Firestore repository for Lotto draws.
 * Collection: `lotto_draws`
 * Document ID: `${drawNumber}` (string)
 */
const COLLECTION_NAME = 'lotto_draws' as const;

function docId(drwNo: number): string {
  return String(drwNo);
}

/**
 * Upsert a lotto draw document.
 * @param draw Lotto draw payload to upsert
 */
async function upsertDraw(draw: LottoDrawType): Promise<void> {
  const ref = adminDb.collection(COLLECTION_NAME).doc(docId(draw.drawNumber));
  await ref.set(
    {
      drawNumber: draw.drawNumber,
      drawDate: draw.drawDate,
      numbers: draw.numbers,
      bonusNumber: draw.bonusNumber,
      firstWinCount: draw.firstWinCount,
      firstPrizeAmount: draw.firstPrizeAmount,
      totalSalesAmount: draw.totalSalesAmount,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

/**
 * Get latest draw number from Firestore by ordering.
 * @returns latest draw number or null if none
 */
async function getLatestDrawNumber(): Promise<number | null> {
  const snap = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy('drawNumber', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as Pick<LottoDrawType, 'drawNumber'>;
  return typeof data.drawNumber === 'number' ? data.drawNumber : null;
}

/**
 * Get a single draw by number.
 * @param drwNo draw number
 */
async function getDrawByNumber(drwNo: number): Promise<LottoDrawType | null> {
  const ref = adminDb.collection(COLLECTION_NAME).doc(docId(drwNo));
  const doc = await ref.get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data) return null;
  return {
    drawNumber: data.drawNumber as number,
    drawDate: data.drawDate as string,
    numbers: (data.numbers as number[]).slice().sort((a, b) => a - b) as [
      number,
      number,
      number,
      number,
      number,
      number
    ],
    bonusNumber: data.bonusNumber as number,
    firstWinCount: data.firstWinCount as number | undefined,
    firstPrizeAmount: data.firstPrizeAmount as number | undefined,
    totalSalesAmount: data.totalSalesAmount as number | undefined,
  };
}

/**
 * Get a range of draws inclusive.
 * @param from from draw number
 * @param to to draw number
 */
async function getDrawsRange(
  from: number,
  to: number
): Promise<LottoDrawType[]> {
  const snap = await adminDb
    .collection(COLLECTION_NAME)
    .where('drawNumber', '>=', from)
    .where('drawNumber', '<=', to)
    .orderBy('drawNumber', 'asc')
    .get();
  if (snap.empty) return [];
  const items: LottoDrawType[] = [];
  snap.forEach((d) => {
    const data = d.data();
    const numbers = (data.numbers as number[])
      .slice()
      .sort((a, b) => a - b) as [
      number,
      number,
      number,
      number,
      number,
      number
    ];
    items.push({
      drawNumber: data.drawNumber as number,
      drawDate: data.drawDate as string,
      numbers,
      bonusNumber: data.bonusNumber as number,
      firstWinCount: data.firstWinCount as number | undefined,
      firstPrizeAmount: data.firstPrizeAmount as number | undefined,
      totalSalesAmount: data.totalSalesAmount as number | undefined,
    });
  });
  return items;
}

export const lottoRepository = {
  upsertDraw,
  getLatestDrawNumber,
  getDrawByNumber,
  getDrawsRange,
};
