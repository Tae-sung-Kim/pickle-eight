import { useQuery } from '@tanstack/react-query';
import { getTopBannerAdConfig } from '@/services';
import { AdBannerConfigType } from '@/types';

export function useTopBannerAdConfig(enabled: boolean = true) {
  return useQuery<AdBannerConfigType | null>({
    queryKey: ['ads', 'topBanner'] as const,
    queryFn: getTopBannerAdConfig,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
