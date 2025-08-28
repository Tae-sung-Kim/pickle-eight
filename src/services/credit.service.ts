import { doc, getDoc } from 'firebase/firestore';
import { db, ensureAnonUser } from '@/lib/firebase-config';
import {
  CreditClaimResponseType,
  UserCreditsType,
  CreditClaimErrorCodeType,
} from '@/types';

/**
 * Claim daily credits via secure API. Client-only.
 */
export async function claimCredits(): Promise<CreditClaimResponseType> {
  const user = await ensureAnonUser();
  const idToken = await user.getIdToken();
  const res = await fetch('/api/credits/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  const data = (await res.json()) as CreditClaimResponseType;
  if (!res.ok) throw new Error(data.code || 'request_failed');
  return data;
}

/**
 * Fetch current user's credits from Firestore. Client-only.
 */
export async function getUserCredits(): Promise<UserCreditsType | null> {
  const user = await ensureAnonUser();
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as { credits?: number; lastClaimDate?: string };
  return { credits: data.credits ?? 0, lastClaimDate: data.lastClaimDate };
}

/**
 * Normalize unknown error into CreditClaimErrorCodeType.
 */
export function normalizeClaimErrorCode(
  err: unknown
): CreditClaimErrorCodeType {
  const code = err instanceof Error ? err.message : 'request_failed';
  const allowList = [
    'auth/missing',
    'auth/invalid',
    'limit/device',
    'limit/ip',
    'internal',
    'request_failed',
  ] as const;
  return (allowList as readonly string[]).includes(code)
    ? (code as CreditClaimErrorCodeType)
    : 'request_failed';
}
