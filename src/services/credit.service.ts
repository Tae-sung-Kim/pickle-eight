import { doc, getDoc } from 'firebase/firestore';
import { db, ensureAnonUser } from '@/lib/firebase-config';
import {
  CreditClaimResponseType,
  UserCreditsType,
  CreditClaimErrorCodeType,
  AdEventPayloadType,
  StartAdSessionInputType,
  StartAdSessionOutputType,
  CompleteAdSessionInputType,
  CompleteAdSessionOutputType,
} from '@/types';
import { apiInstance } from './axios-instance';

/**
 * Claim daily credits via secure API. Client-only.
 */
export async function claimCredits(): Promise<CreditClaimResponseType> {
  const user = await ensureAnonUser();
  const idToken = await user.getIdToken();
  const res = await apiInstance.post<CreditClaimResponseType>(
    'credits/claim',
    {},
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

/**
 * Send ad telemetry/event to server.
 */
export async function postAdEvent(payload: AdEventPayloadType): Promise<void> {
  await apiInstance.post('ad/events', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Start an ad session and receive a server token.
 */
export async function startAdSession(
  input: StartAdSessionInputType
): Promise<StartAdSessionOutputType> {
  const res = await apiInstance.post<{ ok?: boolean; token?: string }>(
    'ad/start',
    { cid: input.cid },
    { headers: { 'Content-Type': 'application/json' } }
  );
  const json = res.data;
  if (!json?.ok || !json?.token) throw new Error('ad_start_failed');
  return { token: json.token };
}

/**
 * Complete an ad session using previously issued token.
 */
export async function completeAdSession(
  input: CompleteAdSessionInputType
): Promise<CompleteAdSessionOutputType> {
  const res = await apiInstance.post<{ ok?: boolean; error?: string }>(
    'ad/complete',
    { token: input.token },
    { headers: { 'Content-Type': 'application/json' } }
  );
  const json = res.data;
  if (!json?.ok) throw new Error(json?.error || 'ad_complete_failed');
  return { ok: true };
}
