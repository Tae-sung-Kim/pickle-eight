import { useQuery } from '@tanstack/react-query';
import { getMealWeather } from '@/features/meal/services/meal-weather.service';
import type {
  MealWeatherRegionKeyType,
  MealWeatherResponseType,
} from '@/features/meal/types/meal.type';

const HOUR_MS = 60 * 60 * 1000;

// useQuery와 fetchQuery(뽑기 때 대기)가 같은 key·fn을 써서 진행 중인 요청을 공유한다
export function mealWeatherQueryOptions(regionKey: MealWeatherRegionKeyType) {
  return {
    queryKey: ['meal', 'weather', regionKey] as const,
    queryFn: () => getMealWeather(regionKey),
    staleTime: HOUR_MS,
    gcTime: HOUR_MS,
    retry: false,
  };
}

// 지역 미선택·스위치 꺼짐이면 요청 자체가 없다
export function useMealWeatherQuery(
  regionKey: MealWeatherRegionKeyType | null,
  isEnabled: boolean
) {
  return useQuery<MealWeatherResponseType, Error>({
    ...mealWeatherQueryOptions(regionKey as MealWeatherRegionKeyType),
    queryKey: ['meal', 'weather', regionKey],
    enabled: isEnabled && regionKey !== null,
    refetchOnWindowFocus: false,
  });
}
