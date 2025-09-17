import { getTopBannerAdConfig } from "@/services/ads-config.service";
import { AdBannerConfigType } from "@/types/ad-credit.type";
import { useQuery } from '@tanstack/react-query';

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
