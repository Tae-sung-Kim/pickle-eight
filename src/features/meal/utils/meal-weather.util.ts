import {
  MEAL_WEATHER_COLD_MAX_CELSIUS,
  MEAL_WEATHER_FORECAST_RELEASE,
  MEAL_WEATHER_HOT_MIN_CELSIUS,
  MEAL_WEATHER_OBSERVATION_READY_MINUTE,
  MEAL_WEATHER_RAIN_CODES,
  MEAL_WEATHER_SNOW_CODES,
  MEAL_WEATHER_TAG_WEIGHT,
} from '@/features/meal/constants/meal-weather.constant';
import { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';
import { MEAL_WEATHER_TAGS } from '@/features/meal/constants/meal-weather-tag.constant';
import type {
  MealKeyType,
  MealMenuType,
  MealWeatherConditionType,
  MealWeatherObservationType,
  MealWeatherRegionKeyType,
  MealWeatherSnapshotType,
} from '@/features/meal/types/meal.type';

/** 정확히 같은 key만 통과. 배열 비교라 '__proto__' 같은 프로토타입 키는 거부된다 */
export const isMealWeatherRegionKey = (
  value: unknown
): value is MealWeatherRegionKeyType =>
  MEAL_WEATHER_REGIONS.some((r) => r.key === value);

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const pad = (n: number) => String(n).padStart(2, '0');

/** 한국 시간으로 옮긴 Date의 UTC 필드를 'YYYYMMDD'로 */
const ymd = (kst: Date) =>
  `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`;

const toKst = (now: Date) => new Date(now.getTime() + KST_OFFSET_MS);

export function getMealWeatherForecastBase(now: Date): Readonly<{
  baseDate: string;
  baseTime: string;
  targetDate: string;
}> {
  const kst = toKst(now);
  const targetDate = ymd(kst);
  const minutes = kst.getUTCHours() * 60 + kst.getUTCMinutes();
  const release =
    MEAL_WEATHER_FORECAST_RELEASE.hour * 60 +
    MEAL_WEATHER_FORECAST_RELEASE.minute;
  return minutes >= release
    ? { baseDate: targetDate, baseTime: '0200', targetDate }
    : {
        baseDate: ymd(new Date(kst.getTime() - DAY_MS)),
        baseTime: '2300',
        targetDate,
      };
}

export function getMealWeatherNowcastBase(
  now: Date
): Readonly<{ baseDate: string; baseTime: string }> {
  const kst = toKst(now);
  const base =
    kst.getUTCMinutes() >= MEAL_WEATHER_OBSERVATION_READY_MINUTE
      ? kst
      : new Date(kst.getTime() - HOUR_MS);
  return { baseDate: ymd(base), baseTime: `${pad(base.getUTCHours())}00` };
}

type RowType = Readonly<Record<string, unknown>>;

const isRow = (v: unknown): v is RowType => typeof v === 'object' && v !== null;

const finiteOrNull = (v: unknown): number | null => {
  if (typeof v !== 'string' && typeof v !== 'number') return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function toMealWeatherObservationFromForecast(
  items: readonly unknown[],
  targetDate: string
): MealWeatherObservationType | null {
  const codes: number[] = [];
  let hasSnowfall = false;
  let maxCelsius: number | null = null;
  let minCelsius: number | null = null;
  let found = false;

  for (const row of items) {
    if (
      !isRow(row) ||
      row.fcstDate !== targetDate ||
      typeof row.category !== 'string' ||
      row.fcstValue === undefined
    ) {
      continue;
    }
    const value = row.fcstValue;
    if (row.category === 'PTY') {
      const n = finiteOrNull(value);
      if (n !== null && Number.isInteger(n)) {
        codes.push(n);
        found = true;
      }
    } else if (row.category === 'SNO') {
      if (Number.parseFloat(String(value)) > 0) hasSnowfall = true;
    } else if (row.category === 'TMX') {
      maxCelsius = finiteOrNull(value);
      found ||= maxCelsius !== null;
    } else if (row.category === 'TMN') {
      minCelsius = finiteOrNull(value);
      found ||= minCelsius !== null;
    }
  }

  // PTY·TMX·TMN이 모두 없으면 실황 대체 대상
  return found
    ? { precipitationCodes: codes, hasSnowfall, maxCelsius, minCelsius }
    : null;
}

export function toMealWeatherObservationFromNowcast(
  items: readonly unknown[]
): MealWeatherObservationType | null {
  const codes: number[] = [];
  let temp: number | null = null;

  for (const row of items) {
    if (!isRow(row) || typeof row.category !== 'string') continue;
    if (row.category === 'PTY') {
      const n = finiteOrNull(row.obsrValue);
      if (n !== null && Number.isInteger(n)) codes.push(n);
    } else if (row.category === 'T1H') {
      temp = finiteOrNull(row.obsrValue);
    }
  }

  if (codes.length === 0 && temp === null) return null;
  return {
    precipitationCodes: codes,
    hasSnowfall: false,
    maxCelsius: temp,
    minCelsius: temp,
  };
}

export function classifyMealWeather(
  o: MealWeatherObservationType
): MealWeatherConditionType {
  if (
    o.hasSnowfall ||
    o.precipitationCodes.some((c) => MEAL_WEATHER_SNOW_CODES.includes(c))
  ) {
    return 'snow';
  }
  if (o.precipitationCodes.some((c) => MEAL_WEATHER_RAIN_CODES.includes(c))) {
    return 'rain';
  }
  if (o.maxCelsius !== null && o.maxCelsius >= MEAL_WEATHER_HOT_MIN_CELSIUS) {
    return 'hot';
  }
  if (o.minCelsius !== null && o.minCelsius <= MEAL_WEATHER_COLD_MAX_CELSIUS) {
    return 'cold';
  }
  return 'normal';
}

/** 뽑기 가중치 함수. ready + 눈·비·더움·추움이고 태그에 든 메뉴만 가중치 3, 나머지는 항상 1 */
export function getMealWeatherWeightOf(
  meal: MealKeyType,
  weather: MealWeatherSnapshotType
): (menu: MealMenuType) => number {
  if (weather.status !== 'ready' || weather.condition === 'normal') {
    return () => 1;
  }
  const tagged = new Set(MEAL_WEATHER_TAGS[meal][weather.condition]);
  return (menu) => (tagged.has(menu.id) ? MEAL_WEATHER_TAG_WEIGHT : 1);
}
