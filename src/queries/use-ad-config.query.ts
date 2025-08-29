import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { getAdConfig } from '@/services';
import { AdConfigDocType } from '@/types';

/**
 * Factory: UseQuery options for runtime Ad configuration
 */
export function adConfigQuery(): UseQueryOptions<AdConfigDocType | null> {
  return {
    queryKey: ['configs', 'ads'],
    queryFn: async () => {
      const res = await getAdConfig();
      return res;
    },
    staleTime: 5 * 60 * 1000,
  };
}

/**
 * Hook: runtime Ad configuration
 */
export function useAdConfig() {
  return useQuery(adConfigQuery());
}
