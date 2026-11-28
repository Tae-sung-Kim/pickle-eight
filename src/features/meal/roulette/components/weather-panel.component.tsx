import type { JSX, ReactNode } from 'react';
import { useId } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  MEAL_REGION_NOTICE_TEXT,
  MEAL_REGION_TITLE,
  MEAL_WEATHER_NOTICE_LINES,
  MEAL_WEATHER_REGION_LABEL,
  MEAL_WEATHER_REGION_NONE_LABEL,
  MEAL_WEATHER_REGION_PLACEHOLDER,
  MEAL_WEATHER_SWITCH_HELP_HEADING,
  MEAL_WEATHER_SWITCH_LABEL,
  MEAL_WEATHER_SWITCH_OFF_TEXT,
  MEAL_WEATHER_SWITCH_ON_TEXT,
} from '@/features/meal/constants/meal-notice.constant';
import { MEAL_WEATHER_REGIONS } from '@/features/meal/constants/meal-weather-region.constant';
import type { MealWeatherRegionKeyType } from '@/features/meal/types/meal.type';
import { isMealWeatherRegionKey } from '@/features/meal/utils/meal-weather.util';

// Radix Select는 빈 문자열 항목 값을 허용하지 않아 '선택 안 함'에 대체 값을 쓴다
const NONE_VALUE = '__none__';

export type MealRouletteWeatherPanelComponentPropsType = Readonly<{
  regionKey: MealWeatherRegionKeyType | null;
  isEnabled: boolean;
  onChangeRegion: (regionKey: MealWeatherRegionKeyType | null) => void;
  onChangeEnabled: (isEnabled: boolean) => void;
  /** 동네 이름 입력(시·도 옆 열). 공통 안내 id를 받는다 */
  renderAreaInput: (noticeId: string) => ReactNode;
}>;

/**
 * MealRouletteWeatherPanelComponent
 * - "내 지역" 묶음: 시·도 선택 + 동네 이름 입력(2열) + 한 줄 안내, 그 아래 날씨 반영 스위치. form을 쓰지 않는다. 회전 중에도 잠그지 않는다.
 */
export function MealRouletteWeatherPanelComponent({
  regionKey,
  isEnabled,
  onChangeRegion,
  onChangeEnabled,
  renderAreaInput,
}: MealRouletteWeatherPanelComponentPropsType): JSX.Element {
  const regionId = useId();
  const switchId = useId();
  const noticeId = useId();

  function handleChangeRegion(value: string) {
    onChangeRegion(isMealWeatherRegionKey(value) ? value : null);
  }

  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="text-sm font-semibold leading-6 text-foreground">
        {MEAL_REGION_TITLE}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start sm:gap-6">
        <div>
          <Label
            htmlFor={regionId}
            className="mb-2 text-sm font-semibold leading-6 text-foreground"
          >
            {MEAL_WEATHER_REGION_LABEL}
          </Label>
          <Select value={regionKey ?? ''} onValueChange={handleChangeRegion}>
            <SelectTrigger
              id={regionId}
              aria-describedby={noticeId}
              className="data-[size=default]:h-11 w-full rounded-lg border-muted-foreground bg-card text-base"
            >
              <SelectValue placeholder={MEAL_WEATHER_REGION_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE} className="text-base">
                {MEAL_WEATHER_REGION_NONE_LABEL}
              </SelectItem>
              {MEAL_WEATHER_REGIONS.map((region) => (
                <SelectItem
                  key={region.key}
                  value={region.key}
                  className="text-base"
                >
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {renderAreaInput(noticeId)}
      </div>
      <p
        id={noticeId}
        className="break-keep text-sm leading-6 text-muted-foreground"
      >
        {MEAL_REGION_NOTICE_TEXT}
      </p>
      <div className="space-y-2 sm:max-w-sm">
        <Label
          htmlFor={switchId}
          className="h-11 cursor-pointer justify-between rounded-lg border border-muted-foreground bg-card px-3 text-sm font-semibold leading-6 text-foreground"
        >
          {MEAL_WEATHER_SWITCH_LABEL}
          <span className="ml-auto flex items-center gap-2">
            <span
              aria-hidden="true"
              className="text-sm font-medium text-muted-foreground"
            >
              {isEnabled
                ? MEAL_WEATHER_SWITCH_ON_TEXT
                : MEAL_WEATHER_SWITCH_OFF_TEXT}
            </span>
            <Switch
              id={switchId}
              checked={isEnabled}
              onCheckedChange={onChangeEnabled}
              className="data-[state=unchecked]:border-muted-foreground"
            />
          </span>
        </Label>
        <CollapsibleComponent heading={MEAL_WEATHER_SWITCH_HELP_HEADING}>
          <p className="break-keep text-sm leading-6 text-muted-foreground">
            {MEAL_WEATHER_NOTICE_LINES[1]}
          </p>
        </CollapsibleComponent>
      </div>
    </fieldset>
  );
}
