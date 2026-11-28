import type {
  MealKeyType,
  MealWeatherTagType,
} from '@/features/meal/types/meal.type';

/**
 * 끼니·날씨별 태그 메뉴 id. 출처: docs/meal-weather/weather-tags.md (승인본). 보통은 키가 없다.
 * 야식 메뉴에는 태그를 달지 않는다.
 */
export const MEAL_WEATHER_TAGS: {
  readonly [K in MealKeyType]: {
    readonly [T in MealWeatherTagType]: readonly string[];
  };
} = {
  lunch: {
    snow: [
      'eomuk',
      'hotteok',
      'seolleongtang',
      'yukgaejang',
      'jjamppong',
      'samgyetang',
    ],
    rain: [
      'kalguksu',
      'kimchi-jjigae',
      'jjamppong',
      'haemul-jjamppong',
      'gamjatang',
    ],
    hot: [
      'naengmyeon',
      'bibim-naengmyeon',
      'kongguksu',
      'bibim-guksu',
      'jjolmyeon',
      'chobap',
      'caesar-salad',
    ],
    cold: [
      'eomuk',
      'hotteok',
      'seolleongtang',
      'yukgaejang',
      'jjamppong',
      'samgyetang',
      'gomtang',
    ],
  },
  dinner: {
    snow: [
      'seolleongtang',
      'yukgaejang',
      'budae-jjigae',
      'jjamppong',
      'samgyetang',
      'eomuk',
      'hotteok',
    ],
    rain: [
      'kalguksu',
      'kimchi-jjigae',
      'budae-jjigae',
      'jjamppong',
      'haejangguk',
    ],
    hot: [
      'naengmyeon',
      'kongguksu',
      'bibim-guksu',
      'jjolmyeon',
      'chobap',
      'sashimi',
      'caesar-salad',
    ],
    cold: [
      'seolleongtang',
      'yukgaejang',
      'gomtang',
      'samgyetang',
      'budae-jjigae',
      'jjamppong',
      'eomuk',
      'hotteok',
    ],
  },
  breakfast: {
    snow: [
      'goguma',
      'tteok',
      'tteokguk',
      'sogogi-mutguk',
      'hwangtae-guk',
      'bugeoguk',
    ],
    rain: [
      'kimchi-jjigae',
      'sundubu-jjigae',
      'kongnamul-gukbap',
      'kalguksu',
      'kimchi-jeon',
    ],
    hot: [
      'yogurt-bowl',
      'granola',
      'cereal',
      'fruit-dosirak',
      'salmon-salad',
      'avocado-salad',
    ],
    cold: [
      'dak-juk',
      'sogogi-juk',
      'jeonbok-juk',
      'sogogi-mutguk',
      'tteokguk',
      'potato-soup',
      'mushroom-soup',
    ],
  },
};
