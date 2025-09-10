import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { getUserCredits } from '@/services';
import type { UserCreditsType } from '@/types';

/**
 * Shared query key for current user's credits
 */
export const userCreditsQueryKey = ['users', 'me', 'credits'] as const;

export function useUserCreditsQuery(
  options?: Omit<
    UseQueryOptions<UserCreditsType | null>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<UserCreditsType | null>({
    queryKey: userCreditsQueryKey,
    queryFn: () => getUserCredits(),
    staleTime: 30_000,
    // prevent re-fetch on window focus or reconnect (clicks can trigger focus events)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...(options || {}),
  });
}
