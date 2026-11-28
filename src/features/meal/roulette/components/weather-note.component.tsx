import { CloudRain, Snowflake, Sun, Thermometer } from 'lucide-react';
import type { JSX } from 'react';

import {
  getMealTemperatureText,
  getMealWeatherLine,
  MEAL_WEATHER_ACCURACY_TEXT,
  MEAL_WEATHER_SOURCE_TEXT,
  MEAL_WEATHER_SOURCE_URL,
  MEAL_WEATHER_UNAVAILABLE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import type {
  MealWeatherSnapshotType,
  MealWeatherTagType,
} from '@/features/meal/types/meal.type';

const ICONS = {
  snow: Snowflake,
  rain: CloudRain,
  hot: Sun,
  cold: Thermometer,
} as const satisfies Record<MealWeatherTagType, unknown>;

export type MealRouletteWeatherNoteComponentPropsType = Readonly<{
  weather: MealWeatherSnapshotType;
}>;

/**
 * MealRouletteWeatherNoteComponent
 * - 결과 카드 안 날씨 안내. 뽑은 순간의 스냅샷만 그린다. off는 아무것도 그리지 않는다.
 */
export function MealRouletteWeatherNoteComponent({
  weather,
}: MealRouletteWeatherNoteComponentPropsType): JSX.Element | null {
  if (weather.status === 'off') {
    return null;
  }
  if (weather.status === 'unavailable') {
    return (
      <p className="break-words text-sm leading-6 text-muted-foreground">
        {MEAL_WEATHER_UNAVAILABLE_TEXT}
      </p>
    );
  }

  const Icon = weather.condition === 'normal' ? null : ICONS[weather.condition];
  // 출처 문장 속 홈페이지 주소만 링크로 건다
  const [before, after = ''] = MEAL_WEATHER_SOURCE_TEXT.split(
    MEAL_WEATHER_SOURCE_URL
  );

  const temperature = getMealTemperatureText(weather);

  return (
    <div className="space-y-2">
      {temperature ? (
        <p className="text-sm leading-6 text-muted-foreground">
          <span aria-hidden="true">{temperature.visible}</span>
          <span className="sr-only">{temperature.spoken}</span>
        </p>
      ) : null}
      {Icon && weather.condition !== 'normal' ? (
        <p className="flex items-start gap-2 break-keep text-base font-medium leading-7 text-foreground">
          <Icon
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-menu-meal"
          />
          <span>{getMealWeatherLine(weather.condition)}</span>
        </p>
      ) : null}
      <p className="break-words text-sm leading-6 text-muted-foreground">
        {before}
        <a
          href={MEAL_WEATHER_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-primary underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {MEAL_WEATHER_SOURCE_URL}
          <span className="sr-only">(새 탭에서 외부 사이트 열림)</span>
        </a>
        {after}
      </p>
      <p className="text-sm leading-6 text-muted-foreground">
        {MEAL_WEATHER_ACCURACY_TEXT}
      </p>
    </div>
  );
}
