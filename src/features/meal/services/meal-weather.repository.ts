import {
  MEAL_WEATHER_CACHE_TTL_MS,
  MEAL_WEATHER_FETCH_TIMEOUT_MS,
} from '@/features/meal/constants/meal-weather.constant';
import { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';
import type {
  MealWeatherRegionKeyType,
  MealWeatherResponseType,
} from '@/features/meal/types/meal.type';
import {
  classifyMealWeather,
  getMealWeatherForecastBase,
  getMealWeatherNowcastBase,
  toMealWeatherObservationFromForecast,
  toMealWeatherObservationFromNowcast,
} from '@/features/meal/utils/meal-weather.util';

const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

/** 서버 전용. route.ts만 import한다. 메시지는 고정 코드만 (키·URL·지역 금지) */
export class MealWeatherError extends Error {}

type CacheEntryType = {
  expiresAt: number;
  promise: Promise<MealWeatherResponseType>;
};

export function createMealWeatherRepository(
  options: { apiKey?: string; fetchImpl?: typeof fetch; now?: () => Date } = {}
) {
  const now = options.now ?? (() => new Date());
  // shortcut: 캐시가 서버리스 인스턴스마다 따로라 인스턴스 수만큼 기상청 호출이 늘어난다. 방문자가 늘어 개발계정 한도에 가까워지면 공유 저장소로 옮긴다
  const cache = new Map<string, CacheEntryType>();

  async function callApi(
    operation: string,
    params: Record<string, string>
  ): Promise<unknown[]> {
    const apiKey = options.apiKey ?? process.env.DATA_GO_KR_API_KEY;
    if (!apiKey) throw new MealWeatherError('missing_key');
    const query = new URLSearchParams({
      serviceKey: apiKey,
      pageNo: '1',
      dataType: 'JSON',
      ...params,
    });
    let json: unknown;
    try {
      const res = await (options.fetchImpl ?? fetch)(
        `${BASE_URL}/${operation}?${query}`,
        {
          cache: 'no-store',
          signal: AbortSignal.timeout(MEAL_WEATHER_FETCH_TIMEOUT_MS),
        }
      );
      if (!res.ok) throw new Error('http');
      json = await res.json(); // 키 오류 시 XML이라 여기서 던져진다
    } catch {
      // 원인 에러는 URL(키)을 담을 수 있어 버린다
      throw new MealWeatherError('upstream_failed');
    }
    const response = (
      json as {
        response?: {
          header?: { resultCode?: unknown };
          body?: { items?: { item?: unknown } };
        };
      } | null
    )?.response;
    if (response?.header?.resultCode !== '00') {
      throw new MealWeatherError('upstream_result');
    }
    const items = response.body?.items?.item;
    if (!Array.isArray(items)) throw new MealWeatherError('no_items');
    return items;
  }

  async function fetchWeather(
    region: MealWeatherRegionKeyType,
    targetDate: string,
    forecastBase: { baseDate: string; baseTime: string }
  ): Promise<MealWeatherResponseType> {
    const grid = MEAL_WEATHER_REGIONS.find((r) => r.key === region);
    if (!grid) throw new MealWeatherError('unknown_region');
    const nxny = { nx: String(grid.nx), ny: String(grid.ny) };

    const nowcastBase = getMealWeatherNowcastBase(now());
    const [fc, nc] = await Promise.allSettled([
      callApi('getVilageFcst', {
        ...nxny,
        base_date: forecastBase.baseDate,
        base_time: forecastBase.baseTime,
        numOfRows: '1000',
      }),
      callApi('getUltraSrtNcst', {
        ...nxny,
        base_date: nowcastBase.baseDate,
        base_time: nowcastBase.baseTime,
        numOfRows: '10',
      }),
    ]);
    // 실패·자료 없음은 null. 분류는 단기예보 우선, 없으면 실황
    const forecast =
      fc.status === 'fulfilled'
        ? toMealWeatherObservationFromForecast(fc.value, targetDate)
        : null;
    const nowcast =
      nc.status === 'fulfilled'
        ? toMealWeatherObservationFromNowcast(nc.value)
        : null;
    const observation = forecast ?? nowcast;
    if (!observation) throw new MealWeatherError('no_data');

    // `|| 0`은 -0 방지. 분류는 원본 값으로 하고 응답에만 반올림 값을 싣는다
    const round = (n: number | null) =>
      n === null ? null : Math.round(n) || 0;
    return {
      condition: classifyMealWeather(observation),
      forecastDate: `${targetDate.slice(0, 4)}-${targetDate.slice(4, 6)}-${targetDate.slice(6, 8)}`,
      minCelsius: round(forecast?.minCelsius ?? null),
      maxCelsius: round(forecast?.maxCelsius ?? null),
      currentCelsius: round(nowcast?.maxCelsius ?? null), // 실황은 max=min=T1H
    };
  }

  function getWeather(
    region: MealWeatherRegionKeyType
  ): Promise<MealWeatherResponseType> {
    const at = now();
    const base = getMealWeatherForecastBase(at);
    const key = `${region}:${base.targetDate}`;
    const nowMs = at.getTime();

    const hit = cache.get(key);
    if (hit && hit.expiresAt > nowMs) return hit.promise;

    for (const [k, v] of cache) if (v.expiresAt <= nowMs) cache.delete(k);

    const entry: CacheEntryType = {
      expiresAt: nowMs + MEAL_WEATHER_CACHE_TTL_MS,
      promise: fetchWeather(region, base.targetDate, base),
    };
    cache.set(key, entry);
    // 실패는 캐시하지 않는다
    entry.promise.catch(() => {
      if (cache.get(key) === entry) cache.delete(key);
    });
    return entry.promise;
  }

  return { getWeather } as const;
}

export const mealWeatherRepository = createMealWeatherRepository();
