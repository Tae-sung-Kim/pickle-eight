/** 최고기온이 이 값 이상이면 더움 (°C) */
export const MEAL_WEATHER_HOT_MIN_CELSIUS = 28;
/** 최저기온이 이 값 이하면 추움 (°C) */
export const MEAL_WEATHER_COLD_MAX_CELSIUS = 5;

/** 강수형태(PTY) 코드: 2 비/눈, 3 눈, 6 빗방울눈날림, 7 눈날림 */
export const MEAL_WEATHER_SNOW_CODES: readonly number[] = [2, 3, 6, 7];
/** 강수형태(PTY) 코드: 1 비, 4 소나기, 5 빗방울. 4 포함 여부는 H-2 확인 뒤 여기만 고친다 */
export const MEAL_WEATHER_RAIN_CODES: readonly number[] = [1, 4, 5];

/** 날씨 태그 메뉴의 뽑기 가중치(정수). 나머지 메뉴는 1 */
export const MEAL_WEATHER_TAG_WEIGHT = 3;

/** 서버 메모리 캐시 TTL */
export const MEAL_WEATHER_CACHE_TTL_MS = 60 * 60 * 1000;
/** 기상청 호출 제한 시간 */
export const MEAL_WEATHER_FETCH_TIMEOUT_MS = 3000;
/** 뽑는 순간 날씨 조회가 진행 중이면 최대 이만큼 기다린다 */
export const MEAL_WEATHER_SPIN_WAIT_MS = 3000;

/** 단기예보: 한국 시간 이 시각 이후면 오늘 0200 발표, 그 전이면 어제 2300 발표 */
export const MEAL_WEATHER_FORECAST_RELEASE = { hour: 2, minute: 20 } as const;
/** 초단기실황: 한국 시간 분이 이 값 이상이면 이번 정시 자료, 아니면 한 시간 전 */
export const MEAL_WEATHER_OBSERVATION_READY_MINUTE = 45;
