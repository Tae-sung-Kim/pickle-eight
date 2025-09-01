import {
  type QueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { getAnalyticsClient } from '@/lib/firebase-config';
import {
  claimCredits,
  getUserCredits,
  normalizeClaimErrorCode,
  postAdEvent,
  startAdSession,
  completeAdSession,
} from '@/services';
import type {
  CreditClaimResponseType,
  UserCreditsType,
  AdEventPayloadType,
  StartAdSessionInputType,
  StartAdSessionOutputType,
  CompleteAdSessionInputType,
  CompleteAdSessionOutputType,
} from '@/types';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

/**
 * Factory: UseQuery options for current user's credits
 */
export function userCreditsQuery(): UseQueryOptions<UserCreditsType | null> {
  return {
    queryKey: ['users', 'me', 'credits'],
    queryFn: () => getUserCredits(),
    staleTime: 30_000,
  };
}

/**
 * Factory: UseMutation options for claiming credits
 * - requires QueryClient to invalidate user credits on success
 */
export function claimCreditsMutation(
  qc: QueryClient
): UseMutationOptions<CreditClaimResponseType, unknown, void, unknown> {
  return {
    mutationKey: ['credits', 'claim'],
    mutationFn: async () => claimCredits(),
    onSuccess: async (data) => {
      // refresh cached user credits
      qc.invalidateQueries({ queryKey: ['users', 'me', 'credits'] });
      const analytics = await getAnalyticsClient();
      if (!analytics) return;
      if (data.already) {
        window.requestIdleCallback?.(() =>
          import('firebase/analytics').then(({ logEvent }) =>
            logEvent(analytics, 'credits_claimed', { status: 'already' })
          )
        );
        return;
      }
      window.requestIdleCallback?.(() =>
        import('firebase/analytics').then(({ logEvent }) =>
          logEvent(analytics, 'credits_claimed', { status: 'ok' })
        )
      );
    },
    onError: async (err) => {
      const analytics = await getAnalyticsClient();
      if (!analytics) return;
      const code = normalizeClaimErrorCode(err);
      window.requestIdleCallback?.(() =>
        import('firebase/analytics').then(({ logEvent }) =>
          logEvent(analytics, 'credits_claim_failed', { code })
        )
      );
    },
  };
}

// Ad event mutation hook
export function useAdEventMutation(): UseMutationResult<
  void,
  Error,
  AdEventPayloadType
> {
  return useMutation<void, Error, AdEventPayloadType>({
    mutationKey: ['ad', 'event'],
    mutationFn: (p) => postAdEvent(p),
  });
}

// Start ad session mutation hook
export function useStartAdSessionMutation(): UseMutationResult<
  StartAdSessionOutputType,
  Error,
  StartAdSessionInputType
> {
  return useMutation<StartAdSessionOutputType, Error, StartAdSessionInputType>({
    mutationKey: ['ad', 'start'],
    mutationFn: (p) => startAdSession(p),
  });
}

// Complete ad session mutation hook
export function useCompleteAdSessionMutation(): UseMutationResult<
  CompleteAdSessionOutputType,
  Error,
  CompleteAdSessionInputType
> {
  return useMutation<
    CompleteAdSessionOutputType,
    Error,
    CompleteAdSessionInputType
  >({
    mutationKey: ['ad', 'complete'],
    mutationFn: (p) => completeAdSession(p),
  });
}
