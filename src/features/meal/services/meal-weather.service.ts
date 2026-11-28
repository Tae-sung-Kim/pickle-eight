import type {
  MealWeatherConditionType,
  MealWeatherRegionKeyType,
  MealWeatherResponseType,
} from '@/features/meal/types/meal.type';
import { http } from '@/lib/http';

const CONDITIONS: readonly MealWeatherConditionType[] = [
  'snow',
  'rain',
  'hot',
  'cold',
  'normal',
];

/** 오늘 날씨 분류 조회. 200이 아니거나 모양이 틀리면 던진다(호출부는 모두 '날씨 없음'으로 본다) */
export async function getMealWeather(
  region: MealWeatherRegionKeyType
): Promise<MealWeatherResponseType> {
  // x-skip-loading이 없으면 전역 로딩 화면이 룰렛을 가린다
  const { data } = await http.get<MealWeatherResponseType>('/meal/weather', {
    params: { region },
    headers: { 'x-skip-loading': '1' },
    timeout: 8000,
  });
  if (
    !CONDITIONS.includes(data?.condition) ||
    typeof data.forecastDate !== 'string'
  ) {
    throw new Error('invalid_weather_response');
  }
  const temp = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  return {
    condition: data.condition,
    forecastDate: data.forecastDate,
    minCelsius: temp(data.minCelsius),
    maxCelsius: temp(data.maxCelsius),
    currentCelsius: temp(data.currentCelsius),
  };
}
