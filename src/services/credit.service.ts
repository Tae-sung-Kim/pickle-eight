import { ensureAnonUser, http } from '@/lib';
import { UserCreditsType, CreditSpendResponseType } from '@/types';

/** no daily/reward claim flow — removed */

/**
 * Spend credits atomically on server.
 */
export async function spendCredits(
  amount: number
): Promise<CreditSpendResponseType> {
  const user = await ensureAnonUser();
  const idToken = await user.getIdToken();
  const res = await http.post<CreditSpendResponseType>(
    'credits/spend',
    { amount },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return res.data;
}

/**
 * Fetch current user's credits from server (applies reset/refill) instead of client Firestore.
 */
export async function getUserCredits(): Promise<UserCreditsType | null> {
  const user = await ensureAnonUser();
  const idToken = await user.getIdToken();
  const res = await http.get<{
    ok: boolean;
    credits: number;
    lastRefillAt?: number;
    refillArmed?: boolean;
  }>('credits/me', {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.data && res.data.ok) {
    return {
      credits: res.data.credits,
      lastRefillAt:
        typeof res.data.lastRefillAt === 'number'
          ? res.data.lastRefillAt
          : undefined,
      refillArmed:
        typeof res.data.refillArmed === 'boolean'
          ? res.data.refillArmed
          : undefined,
    };
  }
  return null;
}
