import { ensureAnonUser } from "@/lib/firebase-config";
import { http } from "@/lib/http";
import { CreditSpendResponseType, UserCreditsType } from "@/types/ad-credit.type";

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
      timeout: 20000,
    }
  );
  return res.data;
}

/**
 * Fetch current user's credits from server (applies reset/refill) instead of client Firestore.
 */
export async function getUserCredits(): Promise<UserCreditsType | null> {
  try {
    const user = await ensureAnonUser();
    const idToken = await user.getIdToken();
    const res = await http.get<{
      ok: boolean;
      credits: number;
      lastRefillAt?: number;
      refillArmed?: boolean;
    }>('credits/me', {
      headers: { Authorization: `Bearer ${idToken}` },
      timeout: 20000,
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
  } catch {
    // Fail soft to prevent UI block
    return null;
  }
}
