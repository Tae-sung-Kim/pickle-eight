'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { MEAL_WEATHER_SPIN_WAIT_MS } from '@/features/meal/constants/meal-weather.constant';
import {
  mealWeatherQueryOptions,
  useMealWeatherQuery,
} from '@/features/meal/queries/use-meal-weather.query';
import type {
  MealWeatherRegionKeyType,
  MealWeatherResponseType,
  MealWeatherSnapshotType,
} from '@/features/meal/types/meal.type';

/** 날씨 지역·스위치 상태(메모리만)와 뽑는 순간에 쓸 스냅샷 */
export function useMealWeather() {
  const queryClient = useQueryClient();
  const [regionKey, setRegionKey] = useState<MealWeatherRegionKeyType | null>(
    null
  );
  const [isEnabled, setIsEnabled] = useState(true);
  // 지역을 고르는 순간 미리 조회한다
  useMealWeatherQuery(regionKey, isEnabled);

  // 대기 중 지역·스위치가 바뀌어도 낡은 값을 쓰지 않도록 최신 값을 ref로 읽는다
  const latestRef = useRef({ regionKey, isEnabled });
  latestRef.current = { regionKey, isEnabled };

  /**
   * 뽑는 순간의 스냅샷. 조회 중이면 최대 MEAL_WEATHER_SPIN_WAIT_MS 기다린다.
   * 시간 초과·실패는 unavailable. 대기가 끝난 시점의 지역·스위치 기준으로 만든다.
   */
  const resolveSnapshot =
    useCallback(async (): Promise<MealWeatherSnapshotType> => {
      const start = latestRef.current;
      if (start.isEnabled && start.regionKey !== null) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        await Promise.race([
          queryClient.fetchQuery(mealWeatherQueryOptions(start.regionKey)),
          new Promise((resolve) => {
            timer = setTimeout(resolve, MEAL_WEATHER_SPIN_WAIT_MS);
          }),
        ])
          .catch(() => undefined)
          .finally(() => clearTimeout(timer));
      }
      const { regionKey: key, isEnabled: enabled } = latestRef.current;
      if (!enabled || key === null) {
        return { status: 'off' };
      }
      const data = queryClient.getQueryData<MealWeatherResponseType>(
        mealWeatherQueryOptions(key).queryKey
      );
      return data ? { status: 'ready', ...data } : { status: 'unavailable' };
    }, [queryClient]);

  return {
    regionKey,
    isEnabled,
    resolveSnapshot,
    setRegionKey,
    setIsEnabled,
  };
}
