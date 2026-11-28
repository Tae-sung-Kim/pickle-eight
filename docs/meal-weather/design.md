# 뭐 먹지 날씨 반영 설계서

입력: `docs/meal-weather/plan.md` (승인 2026-11-28, 열린 질문 Q1~Q10 모두 권장안으로 확정), `docs/meal-weather/status.md` 결정 기록
참고: `docs/research/meal-weather.md` (5장 응답 필드·좌표), `docs/archive/meal-location/design.md` (기존 뭐 먹지 구조)
규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`

## 0. 확정 사항 요약

| 항목 | 확정 내용 |
|---|---|
| 데이터 출처 | 기상청 단기예보 조회서비스(공공데이터포털 15084084). 서버에서만 호출 |
| 키 | `DATA_GO_KR_API_KEY`, 서버 전용. 운세 달력 스크립트와 같은 키 이름. 운영자가 같은 공공데이터포털 계정에서 15084084를 활용신청해야 한다 |
| 지역 | 시·도 선택. 기본값 없음, 위치 권한 없음, 저장 없음. 동네 입력과 따로 둔다 |
| 시간 범위 | 오늘 하루(한국 시간). 강수는 오늘 예보, 더움은 오늘 최고(TMX), 추움은 오늘 최저(TMN). 초단기실황은 단기예보가 실패하거나 오늘 자료가 없을 때만 쓴다 |
| 분류 | 눈 → 비 → 더움(28℃ 이상) → 추움(5℃ 이하) → 보통. 비/눈 혼합은 눈. 임계값은 `meal-weather.constant.ts` 한 곳 |
| 캐시 | 같은 지역·같은 날짜는 1시간 동안 다시 조회하지 않는다 (방식은 DQ1) |
| 뽑기 | 태그 메뉴에 정수 가중치. 스위치 기본 켜짐. 끄면 기존 균등 뽑기와 같다 |
| 실패 | 날씨 없이 균등 뽑기, 결과에 실패 안내 한 줄 (Q5) |
| 보통 날씨 | 날씨 한 줄 없음 (Q5). 출처 표시는 DQ4 |
| 문구 | "추천" 표현 대신 무작위 표현 (Q1). 기존 고지·FAQ·약관·방침·COMPLIANCE의 "같은 확률", "추천하지 않음" 문장을 고친다 |
| 범위 밖 (설계에 넣지 않음) | 숫자 표시, 특보, 계절·복날, 지역 기억, 분석 이벤트, 새 페이지, 돌림판 칸 크기 변경, 공유 카드에 날씨 넣기, 다른 메뉴 연결 |

DB 변경 없음. 새 라이브러리 없음. 새 API 1개.

## 폴더 구조

```
src/app/api/meal/weather/route.ts                 # 신규: GET. 얇게 둔다 (rate limit, 지역 검사, repository 호출, 응답)

src/features/meal/
  types/meal.type.ts                              # 수정: 날씨 타입 추가 (아래 "타입")
  constants/
    meal-weather.constant.ts                      # 신규: 임계값, 강수 코드 묶음, 가중치, 캐시 TTL, 제한 시간
    meal-weather-region.constant.ts               # 신규: 시·도 목록 (key, label, nx, ny)
    meal-weather-tag.constant.ts                  # 신규: 끼니·날씨별 태그 메뉴 id 목록 (내용은 기준표 승인 뒤)
    meal-notice.constant.ts                       # 수정: 날씨 문구, 무작위·결과 고지 문장, 소개 문장
    meal-faq.constant.ts                          # 수정: "메뉴는 어떻게 뽑나요?" 답, 날씨 FAQ 1개 추가
    meal-copy-rule.constant.ts                    # 수정: 금지어 추가
    meal-menu-lunch|dinner|breakfast.constant.ts  # 수정(조건부): 보충 메뉴를 배열 끝에만 추가, 머리 주석 개수
    meal-menu.constant.ts                         # 수정(조건부): MEAL_MENU_COUNTS
  utils/
    meal-weather.util.ts                          # 신규: 순수 함수 (분류, 기상청 응답 변환, 발표 시각, 가중치, 지역 검사)
    meal-pick.util.ts                             # 수정: pickMealMenu에 weightOf 인자 추가
  services/
    meal-weather.repository.ts                    # 신규: 서버 전용. 기상청 2호출 병렬, 1시간 캐시, 실황 대체 분류, 기온 반올림
    meal-weather.service.ts                       # 신규: 클라이언트. http로 /api/meal/weather 호출
  queries/
    use-meal-weather.query.ts                     # 신규: React Query 훅
  roulette/
    hooks/
      use-meal-weather.hook.ts                    # 신규: 지역·스위치 상태 + 조회 + 스냅샷 계산
      use-meal-roulette.hook.ts                   # 수정: spin(weather)가 스냅샷을 회전 상태에 넣고 가중 뽑기
    components/
      weather-panel.component.tsx                 # 신규: 날씨 지역 선택, 날씨 반영 스위치, 안내 1(항상 보임), 안내 2(접힘)
      weather-note.component.tsx                  # 신규: 결과의 날씨 한 줄, 출처, 정확도 문구 / 실패 안내
      root.component.tsx                          # 수정: 훅 호출, 패널 배치, 결과에 스냅샷 전달
      result.component.tsx                        # 수정: weather prop 받아 weather-note 렌더링

src/features/api-docs/specs/meal.openapi.json     # 신규: 개발용 Swagger 조각 (merge-openapi.util.ts 70행 규칙)
src/app/privacy/page.tsx, src/app/terms/page.tsx  # 수정: 법적 문구 (아래 "갱신할 문서")

unit/meal/
  meal-weather.test.ts                            # 신규: 분류, 변환, 발표 시각, 지역 검사, 가중치, 태그 목록
  meal-weather-repository.test.ts                 # 신규: 캐시, 실황 대체, 키 없음, 키 노출 없음
  meal-pick.test.ts                               # 수정: 가중 뽑기 검사 추가
  meal-copy.test.ts, meal-notice.test.ts          # 수정: 금지어, 고정 문장
  meal-menu.test.ts                               # 수정(조건부): 보충 메뉴 개수
e2e/meal-weather.spec.ts                          # 신규 (QA)
e2e/helpers/meal.util.ts                          # 수정 (QA): stubWeather 헬퍼 추가만

docs/meal-weather/grid-check.md                   # 신규: 시·도 목록과 격자 좌표 대조 기록 (AC-15)
docs/meal-weather/copy-log.md                     # 신규: 새 문구 작성 기록
docs/meal-weather/weather-tags.md                 # 기획 산출물 (태그 기준표, 이 설계서 범위 밖. 승인 전 개발 금지)
```

이름 규칙: 날씨는 코드에서 `weather`, 날씨 지역은 `region`. 컴포넌트 `MealRouletteWeatherPanelComponent`, `MealRouletteWeatherNoteComponent`, 훅 `useMealWeather`, `useMealWeatherQuery`.

import 방향: 모두 `features/meal` 안이다. 로또의 `weightedSample`(`features/lotto/utils/lotto.util.ts`)은 다른 기능이라 import하지 않는다. 공용 `secureRandomInt`(`src/lib/random.ts`)만 쓴다.

## 타입 (확정)

`src/features/meal/types/meal.type.ts`에 추가한다. 기존 `MealMenuType`은 바꾸지 않는다.

```ts
/** 태그가 붙는 날씨 4종 */
export type MealWeatherTagType = 'snow' | 'rain' | 'hot' | 'cold';
/** 분류 결과. normal은 태그 없음 */
export type MealWeatherConditionType = MealWeatherTagType | 'normal';

/** 분류 입력. 기상청 응답을 변환한 값 */
export type MealWeatherObservationType = Readonly<{
  precipitationCodes: readonly number[]; // PTY 값들
  hasSnowfall: boolean;                  // SNO > 0
  maxCelsius: number | null;             // TMX (실황 대체 시 T1H)
  minCelsius: number | null;             // TMN (실황 대체 시 T1H)
}>;

/** GET /api/meal/weather 200 응답 */
export type MealWeatherResponseType = Readonly<{
  condition: MealWeatherConditionType;
  forecastDate: string; // 'YYYY-MM-DD', 한국 시간 기준 대상 날짜. 출처 작성연도에 쓴다
}>;

/** 뽑기 시점의 날씨 상태. 회전 상태에 함께 저장한다 */
export type MealWeatherSnapshotType =
  | Readonly<{ status: 'off' }>          // 지역 미선택 또는 스위치 꺼짐
  | Readonly<{ status: 'unavailable' }>  // 지역 선택 + 켜짐, 그러나 조회 중·실패
  | Readonly<{ status: 'ready'; condition: MealWeatherConditionType; forecastDate: string }>;
```

`MealWeatherRegionKeyType`은 `meal-weather-region.constant.ts`의 목록에서 `as const`로 뽑는다(`(typeof MEAL_WEATHER_REGIONS)[number]['key']`).

## 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 임계값(28, 5), 강수 코드 묶음, 가중치, 캐시 TTL, 제한 시간 | 코드 상수 `meal-weather.constant.ts` | 모두에게 같고 자주 안 바뀐다. AC-7 "임계값은 한 곳" |
| 시·도 목록과 대표 격자(nx, ny) | 코드 상수 `meal-weather-region.constant.ts` | 모두에게 같다. 위경도→격자 변환 코드는 만들지 않고 대조한 격자 값을 그대로 적는다 |
| 끼니·날씨별 태그 메뉴 id | 코드 상수 `meal-weather-tag.constant.ts` | 메뉴 목록과 같은 성격(data-storage.md 예: 점심 메뉴 목록) |
| 날씨 문구, 출처, 정확도, 실패 안내, 입력 이름 | 코드 상수 `meal-notice.constant.ts` | 기존 관행. `meal-copy.test.ts`의 `noticeStrings()`가 자동 검사(AC-10) |
| 선택한 날씨 지역, 스위치 값 | React 상태(메모리)만 | Q4: 저장하지 않는다. 새로고침하면 지역은 비고 스위치는 켜짐 |
| 조회한 날씨 결과 (클라이언트) | React Query 메모리 캐시 (1시간) | 같은 지역 재조회 방지. 브라우저 저장소에 남지 않는다 |
| 조회한 날씨 결과 (서버) | 서버 메모리 캐시 (DQ1) | 1시간 캐시. 지역 key와 날짜만 key로 쓰고 이용자 식별자와 묶지 않는다 |
| 뽑기 시점 날씨 스냅샷 | `useMealRoulette` 리듀서의 회전 상태 | 이미 뽑힌 결과의 날씨 줄이 이후 지역·날씨 변경에 흔들리지 않게 |

금지: localStorage, sessionStorage, IndexedDB, 쿠키, 이 사이트 URL(쿼리·경로·hash)에 지역·날씨 값, Supabase, 분석 이벤트, 광고 인자. 새 브라우저 저장 키 없음(AC-16). 지역 값은 `/api/meal/weather` 요청 쿼리로만 나간다.

## API 계약

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| GET | `/api/meal/weather` | 쿼리 `region` (필수). `MEAL_WEATHER_REGIONS`의 `key`와 정확히 같아야 한다(대소문자 변환·trim 없음). 다른 쿼리는 무시 | 200 `{ "condition": "snow" \| "rain" \| "hot" \| "cold" \| "normal", "forecastDate": "2026-11-28", "minCelsius": 4, "maxCelsius": 9, "currentCelsius": 7 }` (세 기온은 반올림 정수 또는 `null`) | 400 `{ "error": "invalid_region" }`, 429 `{ "error": "rate_limited" }`, 503 `{ "error": "weather_unavailable" }` |

- 모든 응답 헤더: `Cache-Control: no-store`. 캐시는 서버 메모리와 클라이언트 React Query가 맡는다. CDN에 캐시하지 않는다.
- 응답 본문에는 지역 값, 격자 좌표, 강수량 등 기상청 원본 값, 키를 넣지 않는다. 기온은 서버에서 `Math.round`한 정수만 싣는다(`minCelsius`·`maxCelsius`는 단기예보 TMN·TMX, `currentCelsius`는 실황 T1H, 해당 호출이 실패했거나 값이 없으면 `null`). 분류는 반올림 전 원본 값으로 한다. (temperature-change.md)
- 503이 되는 경우: 키 없음, 기상청 네트워크 오류·제한 시간 초과, HTTP 오류, `resultCode !== '00'`, JSON이 아닌 응답(키 오류 시 기상청은 XML을 준다), 단기예보와 실황 모두 실패하거나 둘 다 자료 없음.
- 그 밖의 메서드: Next.js 기본 405.
- rate limit: IP 기준 분당 30회. `src/app/api/lotto/export/route.ts`의 `getClientIp`·`checkRate` 방식을 route 안에 그대로 둔다(기존 두 route도 각자 갖고 있다. 공용으로 옮기는 리팩터는 범위 밖).
- 클라이언트는 200이 아닌 모든 응답과 네트워크 오류를 똑같이 "날씨 없음(unavailable)"으로 다룬다. 에러 코드별 화면 분기는 없다.
- 로그: route와 repository는 `console.*`를 쓰지 않는다. 에러 객체도 출력하지 않는다(URL에 키가 들어 있을 수 있다).

### 기상청 호출 (repository 내부, 확정)

| 항목 | 단기예보 (분류 우선, min·max) | 초단기실황 (현재 기온, 분류 대체) |
|---|---|---|
| URL | `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst` | `.../getUltraSrtNcst` |
| 공통 쿼리 | `serviceKey`(URLSearchParams로 한 번만 인코딩, 공공데이터포털 "Decoding" 키 기준, 개발 시 확인), `pageNo=1`, `dataType=JSON`, `nx`, `ny` | 같음 |
| `numOfRows` | 1000 (02시 발표 3일치 약 850행이 한 페이지에 들어온다. 오늘 행만 걸러 쓰므로 정렬 순서에 기대지 않는다) | 10 |
| `base_date`, `base_time` | DQ2 권장안 A: 한국 시간 02:20 이후면 오늘 `0200`, 그 전이면 어제 `2300`. 대상 날짜는 항상 오늘 | 한국 시간 분이 45 이상이면 이번 정시, 아니면 한 시간 전 정시(자정 전후 날짜 넘김 처리). 45분은 관례 값이라 개발 시 확인 |
| 쓰는 항목 | 대상 날짜(`fcstDate`) 행의 `PTY`, `SNO`, `TMX`, `TMN` | `PTY`, `T1H` |
| 제한 시간 | 3초 (`AbortSignal.timeout`) | 3초 |
| 재시도 | 없음 | 없음 |

- 두 호출은 항상 `Promise.allSettled`로 병렬 호출한다(캐시 실패 1회당 2회). 분류는 단기예보 우선이고, 단기예보가 실패했거나 대상 날짜 행에서 `PTY`가 하나도 없고 `TMX`·`TMN`도 둘 다 없으면 실황으로 분류한다. 하나만 성공해도 200이고, 둘 다 실패하거나 둘 다 자료가 없으면 503.
- 02:20과 45분은 `meal-weather.constant.ts`에 상수로 둔다(발표 시각 공식 확인 뒤 상수만 고친다).

### 기상청 응답 → 분류 변환 (확정)

`meal-weather.util.ts`의 순수 함수. 부작용 없음, 시각은 인자로 받는다.

```ts
export function getMealWeatherForecastBase(now: Date): Readonly<{ baseDate: string; baseTime: string; targetDate: string }>; // 'YYYYMMDD', 'HHmm'
export function getMealWeatherNowcastBase(now: Date): Readonly<{ baseDate: string; baseTime: string }>;
export function toMealWeatherObservationFromForecast(items: readonly unknown[], targetDate: string): MealWeatherObservationType | null;
export function toMealWeatherObservationFromNowcast(items: readonly unknown[]): MealWeatherObservationType | null;
export function classifyMealWeather(observation: MealWeatherObservationType): MealWeatherConditionType;
export function isMealWeatherRegionKey(value: unknown): value is MealWeatherRegionKeyType;
export function getMealWeatherWeightOf(meal: MealKeyType, weather: MealWeatherSnapshotType): (menu: MealMenuType) => number;
```

변환 규칙:
- 항목 행은 `{ category, fcstDate, fcstValue }`(예보) 또는 `{ category, obsrValue }`(실황)로 읽는다. 모양이 다르면 그 행을 건너뛴다. `items`가 배열이 아니면 repository가 실패로 본다.
- `PTY`: `Number(v)`가 유한한 정수일 때만 `precipitationCodes`에 넣는다.
- `SNO`: `Number.parseFloat(v) > 0`이면 `hasSnowfall = true`. "적설없음"은 NaN이라 false, "1cm 미만"은 1이라 true.
- `TMX`/`TMN`/`T1H`: `Number(v)`가 유한하면 값, 아니면 null. 실황 대체 시 `maxCelsius = minCelsius = T1H`.
- `PCP`, `POP`, `SKY`, `REH`, `WSD`는 쓰지 않는다(숫자 표시 없음, 분류 조건 아님).

분류 규칙 (`classifyMealWeather`, 이 순서로 처음 맞는 것):

| 순서 | 결과 | 조건 | 상수 |
|---|---|---|---|
| 1 | `snow` | `precipitationCodes`에 2(비/눈), 3(눈), 6(빗방울눈날림), 7(눈날림) 중 하나, 또는 `hasSnowfall` | `MEAL_WEATHER_SNOW_CODES = [2, 3, 6, 7]` |
| 2 | `rain` | `precipitationCodes`에 1(비), 4(소나기), 5(빗방울) 중 하나 | `MEAL_WEATHER_RAIN_CODES = [1, 4, 5]` |
| 3 | `hot` | `maxCelsius !== null && maxCelsius >= 28` | `MEAL_WEATHER_HOT_MIN_CELSIUS = 28` |
| 4 | `cold` | `minCelsius !== null && minCelsius <= 5` | `MEAL_WEATHER_COLD_MAX_CELSIUS = 5` |
| 5 | `normal` | 그 밖 | |

- 코드 4(소나기)의 포함 여부는 기상청 항목 정의로 확인한다(plan 확인 필요 사실). 결과가 다르면 상수만 고친다.
- 비/눈 혼합(2, 6)은 눈이다(확정 결정).

### repository (확정)

```ts
// src/features/meal/services/meal-weather.repository.ts (서버 전용. route.ts만 import한다)
export class MealWeatherError extends Error {} // 메시지는 고정 코드만. URL·키·지역을 넣지 않는다

export function createMealWeatherRepository(options?: {
  apiKey?: string;               // 기본: process.env.DATA_GO_KR_API_KEY
  fetchImpl?: typeof fetch;      // 기본: globalThis.fetch
  now?: () => Date;              // 기본: () => new Date()
}): Readonly<{ getWeather: (region: MealWeatherRegionKeyType) => Promise<MealWeatherResponseType> }>;

export const mealWeatherRepository = createMealWeatherRepository();
```

- 같은 구조의 선례: `scripts/fortune-calendar/kasi.mjs`의 `createKasiClient`(fetch 주입, 키 숨김).
- 키가 없으면 기상청을 부르지 않고 `MealWeatherError`를 던진다.
- 기상청 `fetch`에는 `cache: 'no-store'`를 준다(DQ1 A안. Next 데이터 캐시와 서버 메모리 캐시가 겹치지 않게).

캐시 (DQ1 권장안 A, 서버 메모리):
- `Map<string, { expiresAt: number; promise: Promise<MealWeatherResponseType> }>`, key는 `${region}:${targetDate}`. 날짜가 key에 있어 자정이 지나면 어제 결과를 쓰지 않는다.
- 조회 시작 때 promise를 먼저 넣는다. 같은 지역 요청이 동시에 와도 기상청은 한 번만 부른다.
- promise가 실패하면 그 항목을 지운다(실패는 캐시하지 않는다. 다음 요청이 다시 시도한다).
- TTL `MEAL_WEATHER_CACHE_TTL_MS = 60 * 60 * 1000`. 새 항목을 넣을 때 만료된 항목을 지운다.
- 남는 한계: 서버 인스턴스마다 캐시가 따로다. 추정 호출 수는 인스턴스 수 × 지역 수(16~17) × 24회/일. 인스턴스 5개여도 약 2,040건/일로 개발계정 10,000건 안이다(일/월 기준은 Q10대로 개발 단계 확인).

## DB 스키마

없음. 새 테이블, 컬럼, RLS, 마이그레이션 없음. 날씨 결과는 저장하지 않는다(Supabase는 사용자끼리 공유·서버 갱신용인데, 1시간 메모리 캐시로 충분하다).

## 시·도 격자 상수 구조 (확정)

```ts
// src/features/meal/constants/meal-weather-region.constant.ts
/** 날씨 지역 목록. 순서가 선택 목록 순서다. 확인 기록: docs/meal-weather/grid-check.md */
export const MEAL_WEATHER_REGIONS = [
  { key: 'seoul', label: '서울', nx: 0, ny: 0 }, // 값은 개발 시 대조한 격자로 채운다
  // ...
] as const satisfies readonly Readonly<{ key: string; label: string; nx: number; ny: number }>[];
```

- `key`: 소문자 영문·하이픈. API 허용 목록이자 React Query key. 화면에 보이지 않는다.
- `label`: 화면 이름. 짧은 이름(서울, 부산, 경기 등)을 기본으로 하고 최종 표기는 ui-ux-design.md에서 정한다.
- 목록과 개수(16 또는 17)는 개발 시점 현행 행정구역으로 확정한다(plan 확인 필요 사실). 전남·광주가 통합되었으면 한 항목(예: key `jeonnam-gwangju`)으로 둔다. 순서는 행정안전부 시·도 순서(특별시·광역시·특별자치시 → 도·특별자치도).
- 대표 지점은 시청·도청 소재지. 격자는 기상청 단기예보 활용가이드 첨부 "격자_위경도" 자료에서 해당 행정구역의 nx, ny를 그대로 옮긴다. 위경도→격자 변환 코드는 만들지 않는다.
- `grid-check.md`에 지역별 대표 지점, 행정구역 코드, nx, ny, 출처 파일 이름과 버전, 확인 날짜를 적는다(AC-15).
- 위경도는 상수에 넣지 않는다(쓰는 곳이 없다).

## 메뉴 날씨 태그 데이터 구조 (확정, 내용은 기준표 승인 뒤)

대안 비교 (설계 결정, 권장 B를 택했다):
- A: `MealMenuType`에 `weather?: readonly MealWeatherTagType[]` 필드를 더하고 380개 메뉴 항목에 직접 단다. 장점: 메뉴 옆에서 보인다. 단점: 메뉴 파일 3개 전체가 바뀌어 diff와 충돌이 크고, 메뉴 타입이 바뀐다.
- B (택함): 별도 상수에 끼니·날씨별 id 목록을 둔다. 장점: 메뉴 타입·기존 항목을 건드리지 않는다. 기준표(끼니 × 날씨)와 1:1로 맞고 날씨별 개수를 바로 센다(AC-14). 단점: id 오타 가능성 → 단위 테스트로 막는다.

```ts
// src/features/meal/constants/meal-weather-tag.constant.ts
/** 끼니·날씨별 태그 메뉴 id. 출처: docs/meal-weather/weather-tags.md (승인본). 순서는 메뉴 배열 순서 */
export const MEAL_WEATHER_TAGS: {
  readonly [K in MealKeyType]: { readonly [T in MealWeatherTagType]: readonly string[] };
} = { lunch: { snow: [], rain: [], hot: [], cold: [] }, dinner: { ... }, breakfast: { ... } };
```

- `normal` 키는 없다. 보통 날씨에는 태그도 보충도 없다(AC-8).
- 한 메뉴가 여러 날씨에 들어갈 수 있다.
- 보충 메뉴: 기존 `MealMenuType` 항목으로 각 끼니 배열 끝에만 추가하고, 위 목록에 id를 넣는다. 날씨를 꺼도 일반 후보에 포함된다(목록의 일부이므로). 기존 항목 순서는 바꾸지 않는다(AC-14).
- 단위 테스트가 지키는 것: 모든 id가 그 끼니 `MEAL_MENUS`에 있다, 목록 안 중복 없음, 끼니 × 날씨마다 5개 이상(보충 뒤), 보충 메뉴(기존 개수 120·180·80 이후 인덱스)는 기존 태그가 5개 미만이던 날씨 목록에만 있다(기존 개수는 테스트 안 고정값).

## 가중 뽑기 알고리즘 (확정)

`pickMealMenu`에 인자 하나를 더한다. 호출처는 `use-meal-roulette.hook.ts` 하나와 단위 테스트다.

```ts
export function pickMealMenu(
  candidates: readonly MealMenuType[],
  previousId: string | null,
  randomInt: RandomIntFnType = secureRandomInt,
  weightOf: (menu: MealMenuType) => number = () => 1
): MealMenuType | null;
```

1. 후보가 비면 null (기존 그대로).
2. 직전 메뉴 제외 (기존 그대로: 후보 2개 이상이고 previousId가 있으면 뺀다).
3. 각 후보의 가중치 `w[i] = weightOf(pool[i])`(양의 정수), `total = Σw`.
4. `r = randomInt(total)`. 앞에서부터 `r < w[i]`인 첫 후보를 고르고, 아니면 `r -= w[i]`.

- 모든 가중치가 1이면 `total = pool.length`, `r = randomInt(pool.length)`, 결과 `pool[r]`로 기존 코드와 난수 사용까지 같다. 그래서 스위치 꺼짐·날씨 없음·보통·필터 안에 태그 메뉴 없음이 모두 기존 균등 뽑기와 같은 분포다(AC-8). 분기를 따로 두지 않는다.
- 정수 가중치를 쓰는 이유: 기존 `secureRandomInt`(거부 샘플링, 편향 없음)를 그대로 쓰고, 테스트의 `randomInt` 주입 방식을 유지한다. 부동소수 누적 방식(`secureRandomFloat`)은 쓰지 않는다.
- `getMealWeatherWeightOf(meal, weather)`: `weather.status === 'ready'`이고 `condition !== 'normal'`이면 `MEAL_WEATHER_TAGS[meal][condition]`의 Set에 든 메뉴는 `MEAL_WEATHER_TAG_WEIGHT`, 나머지는 1. 그 밖은 항상 1.
- 가중치 값은 DQ3.
- 돌림판 칸 크기는 바꾸지 않는다(기획 범위 밖). 확률 차이는 스위치 옆 고지와 FAQ로 알린다.

## 프론트 구조

- 페이지 (서버/클라이언트 구분):
  - `src/app/meal/page.tsx`: 바꾸지 않는다. 서버 컴포넌트. FAQ(서버 렌더링, JSON-LD 포함)만 상수 변경으로 바뀐다.
  - 클라이언트 경계: 기존 `MealRouletteComponent`(root, `'use client'`) 하나. 새 컴포넌트는 그 안에서 렌더링되므로 `'use client'`를 따로 붙이지 않는다.
- 컴포넌트 트리:

```
MealPage (서버, 변경 없음)
└ MealRouletteComponent (root)              ← useMealRoulette() + useMealAreaInput() + useMealWeather()
  ├ MealRouletteMealPickerComponent         (변경 없음)
  ├ MealRouletteFilterPanelComponent        (변경 없음)
  ├ MealRouletteWeatherPanelComponent [신규] ← regionKey, isEnabled, onChangeRegion, onChangeEnabled, renderAreaInput(noticeId)
  │   ├ fieldset/legend "내 지역"
  │   ├ MealRouletteAreaInputComponent (root가 renderAreaInput으로 주입, noticeId prop 추가, 접힘 안내 삭제)
  │   ├ Label + Select (`@/components/ui/select`, 기존 shadcn) : 날씨 지역, 기본값 없음, "선택 안 함"으로 되돌릴 수 있어야 한다
  │   ├ Label + Switch (`@/components/ui/switch`, 기존 shadcn) : 날씨 반영, 기본 켜짐
  │   ├ 안내 1 (항상 보임, 두 입력이 aria-describedby로 공유): MEAL_REGION_NOTICE_TEXT
  │   └ 안내 2 (기존 CollapsibleComponent로 접힘): 확률이 조금 달라지는 무작위
  ├ MealRouletteSpinPanelComponent          (변경 없음. onSpin은 root에서 () => spin(weather.snapshot))
  ├ (MealRouletteAreaInputComponent는 위 날씨 패널 안으로 이동)
  ├ MealRouletteResultComponent             ← weather prop 추가
  │   ├ MealRouletteWeatherNoteComponent [신규] ← weather
  │   │   ├ ready + 눈·비·더움·추움: 날씨 한 줄 + 출처(링크) + 정확도 문구
  │   │   ├ ready + 보통: DQ4
  │   │   ├ unavailable: 실패 안내 한 줄
  │   │   └ off: 아무것도 그리지 않는다
  │   └ MealRouletteMapLinksComponent       (변경 없음)
  └ MealRouletteStatusComponent             (변경 없음)
```

  - DOM 순서: 날씨 패널은 필터 패널 다음, 돌림판·뽑기 버튼 앞. 탭 순서가 "… 필터 → 날씨 지역 → 동네 이름 → 날씨 스위치 → 안내 2 트리거 → 룰렛 돌리기 → 지도 링크"가 되어 AC-6 순서를 지킨다. 정확한 배치는 ui-ux-design.md.
  - 날씨 한 줄은 결과 카드 안에 둔다. 광고 슬롯(`features/ad`)을 날씨 영역 안이나 바로 옆에 두지 않는다(Q8). 기존 광고 위치는 그대로.
  - 공유 카드, 결과 알림(sr-only), 지도 링크 검색어에는 날씨를 넣지 않는다(기획에 없음).

- props 계약 (확정):

```ts
// weather-panel.component.tsx
export type MealRouletteWeatherPanelComponentPropsType = Readonly<{
  regionKey: MealWeatherRegionKeyType | null;
  isEnabled: boolean;
  onChangeRegion: (regionKey: MealWeatherRegionKeyType | null) => void;
  onChangeEnabled: (isEnabled: boolean) => void;
  renderAreaInput: (noticeId: string) => ReactNode;
}>;

// weather-note.component.tsx
export type MealRouletteWeatherNoteComponentPropsType = Readonly<{
  weather: MealWeatherSnapshotType;
}>;

// result.component.tsx: 기존 props에 추가. done일 때만 스냅샷, 그 밖은 null
weather: MealWeatherSnapshotType | null;
```

- 상태 위치:
  - `useMealWeather()` (`roulette/hooks/use-meal-weather.hook.ts`): `useState` 2개(`regionKey: MealWeatherRegionKeyType | null = null`, `isEnabled = true`) + `useMealWeatherQuery`(미리 조회). 스냅샷은 `resolveSnapshot(): Promise<MealWeatherSnapshotType>`가 뽑는 순간에 만든다.
    - `!isEnabled || regionKey === null` → 기다리지 않고 `{ status: 'off' }`
    - 데이터가 이미 있으면 → 즉시 `{ status: 'ready', condition, forecastDate }`
    - 조회 중이면 → `queryClient.fetchQuery`(같은 key·fn이라 진행 중인 요청을 재사용)를 최대 `MEAL_WEATHER_SPIN_WAIT_MS`(3000, `meal-weather.constant.ts`) 기다린다. 성공 → `ready`, 시간 초과·실패 → `{ status: 'unavailable' }`
    - 대기가 끝난 시점의 지역·스위치(ref) 기준으로 스냅샷을 만든다. 대기 중 지역이 바뀌거나 스위치가 꺼지면 낡은 응답을 쓰지 않는다.
  - `useMealWeatherQuery(regionKey, isEnabled)` (`queries/use-meal-weather.query.ts`): `queryKey: ['meal', 'weather', regionKey]`, `enabled: isEnabled && regionKey !== null`, `staleTime`·`gcTime` 1시간, `retry: false`, `refetchOnWindowFocus: false`. 스위치를 끄면 요청 자체가 없다. 지역을 바꾸면 key가 바뀌어 늦게 온 이전 지역 응답은 현재 화면에 쓰이지 않는다.
  - `getMealWeather(regionKey)` (`services/meal-weather.service.ts`): `http.get('/meal/weather', { params: { region }, headers: { 'x-skip-loading': '1' }, timeout: 8000 })`. 헤더가 없으면 `http` 인터셉터가 전역 로딩 화면을 띄워 룰렛을 가린다. 응답의 `condition`이 5종 중 하나가 아니면 실패로 던진다.
  - 최대 3초 기다린다: 지역을 고르는 순간 미리 조회한다. 룰렛을 누를 때 조회 중이면 `MEAL_WEATHER_SPIN_WAIT_MS`(3초)까지 기다렸다가 날씨를 반영해 뽑는다. 3초 초과·실패면 날씨 없이(`unavailable`) 뽑는다. 응답이 이미 있으면 즉시 뽑고, 지역 미선택·스위치 꺼짐은 기다리지 않는다. 대기 중 재클릭은 무시하고(ref 플래그) 언마운트되면 뽑지 않는다.
  - `useMealRoulette` 변경: `spin(weather: MealWeatherSnapshotType)`. `SPIN_START` 액션과 `spinning`·`done` 상태에 `weather`를 넣는다. 뽑기는 `pickMealMenu(candidates, lastPickedId, undefined, getMealWeatherWeightOf(state.meal, weather))`. 지역·스위치는 이 리듀서에 넣지 않는다(끼니 변경·필터와 상관없이 유지되어야 하고 기존 리듀서 테스트를 덜 건드린다. 동네 입력과 같은 이유).
  - 날씨가 바뀌어도 이미 뽑힌 결과의 날씨 줄은 스냅샷이라 그대로다(plan 예외 절).

- 문구 상수 (이름 확정, 문장은 ui-ux-design.md·PM 검토에서 확정):

| 상수 | 형태 | 비고 |
|---|---|---|
| `MEAL_WEATHER_REGION_LABEL` | 문자열 | 예: "날씨 지역" |
| `MEAL_WEATHER_REGION_PLACEHOLDER`, `MEAL_WEATHER_REGION_NONE_LABEL` | 문자열 | 선택 안 함 |
| `MEAL_WEATHER_SWITCH_LABEL` | 문자열 | 예: "날씨 반영" |
| `MEAL_WEATHER_NOTICE_LINES` | 배열 | plan 고지 1, 2 |
| `MEAL_WEATHER_LINES` | `{ snow, rain, hot, cold }` 객체, 완성 문장(자리표시 없음, 메뉴 이름을 넣지 않는다) | 객체라 `noticeStrings()`가 검사한다. 확정 문구는 ui-ux-design.md |
| `getMealWeatherLine(condition)` | 함수 | 상수 조회만 |
| `MEAL_WEATHER_SOURCE_TEXT`, `MEAL_WEATHER_SOURCE_URL` | 문자열 | `{year}` 자리표시는 `forecastDate` 앞 4자리. 공공누리 표시 항목(작성연도, 기관명 기상청, 홈페이지 주소, 작성자명)과 공공데이터포털 이름. 기상청 홈페이지 주소는 개발 시 확인(AC-13) |
| `MEAL_WEATHER_ACCURACY_TEXT` | 문자열 | "날씨는 실제와 다를 수 있습니다." |
| `MEAL_WEATHER_UNAVAILABLE_TEXT` | 문자열 | plan 고지 5 |

  문구 작성 규칙 (설계 제약):
  - 날씨 한 줄은 뽑힌 메뉴가 그 날씨 태그 메뉴라고 말하지 않는다. 가중 뽑기라도 태그가 없는 메뉴가 뽑힐 수 있기 때문이다. 예: "오늘은 비가 와요. 날씨를 반영해 뽑은 메뉴는 {menu}예요" 같은 형태가 아니라 조사 문제가 없는 형태로 쓴다(아래).
  - `{menu}` 바로 뒤에 받침에 따라 바뀌는 조사(이/가, 을/를, 이에요/예요)를 붙이지 않는다. 메뉴 이름마다 받침이 달라 틀린 문장이 나온다.
  - "추천" 표현을 쓰지 않는다(Q1). AC-10 금지어를 지킨다.
  - 출처 링크는 `target="_blank"`, `rel="noopener noreferrer"`로 연다.

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/meal` (기존) | 변경 없음 | 변경 없음 | 종류 변경 없음(BreadcrumbList, FAQPage). FAQPage 내용만 바뀐다: "메뉴는 어떻게 뽑나요?" 답 수정, 날씨 질문 1개 추가(Q7) | 변경 없음 (`MENU_LIST` 그대로) |

- 서버/클라이언트: 날씨 패널, 날씨 한 줄, 출처는 클라이언트 경계 안에서 그린다. 검색에 잡혀야 할 날씨 설명은 서버 렌더링 FAQ에 둔다.
- description(`meal-seo.constant.ts` 11행 "무작위로 골라 보는")은 바꾸지 않는다. 가중 뽑기도 무작위 뽑기라 사실과 맞고, 검색 노출 문구 변화를 피한다. plan은 이 문장의 수정을 "허용"만 했다.
- 키워드 추가 없음(Q7). 새 페이지, 리다이렉트, canonical 변경 없음.
- `MENU_LIST`의 meal 설명("무작위로 뽑고")도 그대로 둔다(같은 이유).
- `meal-faq.constant.ts` 머리 주석의 "FAQ 5개"를 실제 개수로 고친다.

## 보안

- RLS: 해당 없음(DB 변경 없음).
- 시크릿·환경변수: `DATA_GO_KR_API_KEY`는 `meal-weather.repository.ts`에서만 읽는다(기존 `scripts/fortune-calendar/` 제외). `NEXT_PUBLIC_` 이름 없음. 클라이언트에서 `process.env.DATA_GO_KR_API_KEY`는 인라인되지 않지만, repository는 `route.ts`만 import한다는 규칙을 지킨다. `.env.example`에는 키가 이미 있다(30행). 새 환경변수 없음.
- 키 노출 방지: `MealWeatherError` 메시지는 고정 코드만. 응답 본문과 로그에 URL·키·지역을 넣지 않는다. route와 repository에 `console.*` 없음.
- 입력 검증 (신뢰 경계): route에서 `isMealWeatherRegionKey`로 허용 목록과 정확히 비교한다. 통과하지 못하면 400이고 기상청을 부르지 않는다. 기상청에는 이용자 입력이 아니라 상수의 nx, ny만 보낸다. 기상청 응답은 신뢰하지 않고 변환 함수가 모양을 검사한다. 클라이언트도 응답 `condition` 값을 검사한다.
- XSS: 날씨 문구는 상수와 메뉴 이름만으로 만들고 React 텍스트 노드로 그린다. `dangerouslySetInnerHTML` 금지. 기상청 원본 문자열을 화면에 내보내지 않는다.
- API 남용: IP 기준 분당 30회 제한(429). 서버 캐시와 동시 요청 묶기로 기상청 호출을 줄인다. 공공데이터 약관 제14조 5항(시스템 지장 시 이용 제한)을 지키는 장치다.
- 위치: Geolocation 호출 없음. `next.config.ts` `Permissions-Policy: geolocation=()` 그대로. CSP 변경 없음(브라우저는 같은 출처 `/api`만 부르고, 기상청 호출은 서버에서 나간다).
- 브라우저 저장소: 새 키 없음. 지역·날씨 값을 저장소·쿠키·URL에 넣지 않는다. 쿠키 동의와 상관없이 동작한다.
- 광고·분석: 지역·날씨·스냅샷을 `AdFitSlotComponent`나 광고 스크립트 인자로 넘기지 않는다. 분석 이벤트 없음.
- 남는 위험 (COMPLIANCE 위험 수용에 적는다): rate limit 메모리에 IP가 1분간 남는다(기존 로또 API와 같은 방식, 지역과 묶지 않음). 호스팅(Vercel) 요청 로그에는 요청 경로와 쿼리(`region=seoul` 등)가 남을 수 있다(Q9).

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 기상청 단기예보·초단기실황 | 공공데이터포털 15084084 (기상청) | 공공누리 제1유형 (출처표시) | 가능. 출처 문구와 링크가 조건(AC-13). 출처 문구가 빠지면 출시하지 않는다 |
| 시·도 대표 격자 값 | 기상청 단기예보 활용가이드 첨부 격자 자료 | 같은 서비스 자료. 숫자 사실만 옮긴다 | 가능. 출처는 `grid-check.md`에 기록 |
| 새 라이브러리 | 없음 | - | - |
| UI 요소 | 기존 shadcn `Select`, `Switch`, `Label` | 기존 등록(MIT) | 가능. `DEPENDENCY_LICENSES.md` 변경 없음 |
| 아이콘(쓰는 경우) | 기존 `lucide-react` | 기존 등록(ISC) | 가능 |
| 문구, 보충 메뉴 이름 | 이 서비스가 직접 작성 | - | 가능. `copy-log.md` 기록 |

- 개인정보 처리: 시·도 key가 서버로 가지만 저장하지 않고 이용자 식별자와 묶지 않는다. 기상청에는 격자 좌표만 간다. "개인정보 아님, 위치정보 아님"은 기획 판단이며 **법률 확인 필요**(plan Q9, 위험 수용으로 기록).
- 공공데이터포털 이용약관 원문(제14조 등)과 운영계정 전환 조건은 출시 전 PM 확인(Q10). 운영 신청 담당은 PM.
- 날씨로 광고를 고르거나 지역 광고·제휴 링크를 넣지 않는다. AdFit 정책 원문은 출시 전 확인(Q8).
- `THIRD_PARTY_NOTICES.md`에 기상청 자료 항목을 추가한다.

## 갱신할 문서

| 문서 | 위치 | 바꿀 내용 | 담당 |
|---|---|---|---|
| `README.md` | 55행 | "운세 달력 표 생성 스크립트 전용(개발 시점, 런타임 미사용 …)" → "날씨 조회(`/api/meal/weather`)에 서버 런타임 사용, 운세 달력 표 생성 스크립트에도 사용. 서버 전용, `NEXT_PUBLIC_` 아님"(AC-11) | backend-dev |
| `README.md` | API 표 (97~103행) | `GET /api/meal/weather` 행 추가: "`region=` 시·도 key, 오늘 날씨 분류, 1시간 캐시, IP 기준 분당 제한" | backend-dev |
| `COMPLIANCE.md` | 3행 | Last updated 날짜 | PM |
| `COMPLIANCE.md` | 1장 15행 (What-to-eat) | "never sent to a server" 대상에서 날씨 지역을 분리: 선택한 시·도 key만 날씨 조회를 위해 이 사이트 서버로 가고, 저장·로그하지 않으며 격자 좌표만 기상청으로 간다. 지역과 스위치는 React 상태에만 있다. 저장 키 없음 유지 | PM |
| `COMPLIANCE.md` | 8장 | 기상청 자료(공공누리 제1유형) 출처 표시 항목 추가 | PM |
| `COMPLIANCE.md` | 9장 | Optional에 `DATA_GO_KR_API_KEY` (server-only, `/api/meal/weather` 런타임 + fortune-calendar 스크립트) 추가 | PM |
| `COMPLIANCE.md` | 11장 159~160행 | "equal probability" → 날씨 반영이 켜져 있고 지역 날씨가 눈·비·더움·추움이면 태그 메뉴에 정수 가중치, 그 밖은 같은 확률. 고지 문장 변경 반영. "not a recommendation" 문장은 Q1 결정대로 | PM |
| `COMPLIANCE.md` | 11장 163행 | 날씨 지역 전송·미저장 문장 추가. `geolocation=()` 문장 유지 | PM |
| `COMPLIANCE.md` | 11장 165행 | "No public data" → 메뉴·문구는 자체 작성, 날씨 분류에만 기상청 공공데이터(공공누리 제1유형, 출처 표시) 사용 | PM |
| `COMPLIANCE.md` | 11장 166행 (위험 수용) | 추가: 시·도 선택값의 개인정보·위치정보 해당 여부, 호스팅 요청 로그의 쿼리, rate limit 메모리의 IP, 공공데이터 이용약관과 운영 한도, 가중 뽑기 고지 문구, 결정일 | PM |
| `THIRD_PARTY_NOTICES.md` | 데이터 항목 | 기상청 단기예보 조회서비스(공공데이터포털 15084084), 공공누리 제1유형, 출처 표시 방법 | PM |
| `src/app/privacy/page.tsx` | 1장 (117~121행 동네 이름 문단 뒤) | 새 문단: 날씨 지역(시·도) 선택값은 오늘 날씨 조회를 위해 서버로 전송되며 저장하지 않고, 기상청에는 지역의 대표 격자 좌표만 전달된다. 위치 권한은 요청하지 않는다 | frontend-dev |
| `src/app/privacy/page.tsx` | 6장 지도 문단 (281~283행) | "뭐 먹지는 위치 정보를 요청하지 않으며 … 서버로 전송하거나 저장하지 않습니다"는 유지하고, 그 뒤에 "날씨 지역 선택값은 1장에 적은 대로 날씨 조회에만 쓰입니다" 한 문장 | frontend-dev |
| `src/app/terms/page.tsx` | 9장 210~217행 | "같은 확률로 무작위로 정해지며" → 날씨 반영 시 확률이 조금 달라지는 무작위 뽑기임을 적는다(Q1). "외부 데이터를 사용하지 않습니다"는 메뉴 목록에 한정하고, 날씨 분류에 기상청 자료를 쓰며 실제와 다를 수 있다는 문장 추가 | frontend-dev |
| `src/app/terms/page.tsx` | 9장 228~230행 | "위치 정보를 요청하지 않으며" 유지. "서버로 전송하거나 저장하지 않습니다" 뒤에 날씨 지역 예외 문장 | frontend-dev |
| `src/app/terms/page.tsx` | 239행 | 바꾸지 않는다. 이 문장은 10장 운빨 뽑기다(plan 34~45행의 "239행"은 뭐 먹지가 아니다) | - |
| 방침·약관 시행일 | 각 `EFFECTIVE_DATE` | 배포일로 바꾼다(plan: 기존 M17 흐름과 같이) | frontend-dev |
| `src/features/meal/constants/meal-notice.constant.ts` | 15행 `MEAL_RANDOM_NOTICE_TEXT`, 27행 `MEAL_RESULT_NOTICE_TEXT`, 33행 `MEAL_INTRO_TEXT` | 세 문장 모두 "같은 확률"/"추천하거나 평가하지" 표현을 Q1 방향으로 바꾼다. 33행 소개 문장은 plan 충돌 목록에 없었지만 같은 내용이라 함께 고친다 | frontend-dev (문장은 ui-ux·PM) |
| `src/features/meal/constants/meal-faq.constant.ts` | 17행 | "같은 확률입니다" → 날씨 반영 설명 포함. 날씨 FAQ 1개 추가 | frontend-dev |
| `src/features/meal/utils/meal-pick.util.ts` | 36행 주석 | "같은 확률로 뽑는다" → 가중치 설명 | frontend-dev |
| `docs/meal-weather/grid-check.md`, `copy-log.md` | 신규 | 격자 대조 기록, 문구 작성 기록 | backend-dev, frontend-dev (dev-lead 지정) |
| `DEPENDENCY_LICENSES.md`, `.env.example` | - | 변경 없음 | - |

## 테스트 범위

E2E 고정 응답 방법 (plan이 설계에 맡긴 것): 브라우저에서 `page.route('**/api/meal/weather**', …)`로 이 사이트 API 응답을 바꾼다. 운영 코드에 테스트용 모의 모드나 환경변수를 넣지 않는다. 기상청 응답 → 분류 변환은 vitest에서 고정 JSON으로 검사한다.

### 단위 (vitest)

`unit/meal/meal-weather.test.ts` (신규)
- AC-7 분류: 28℃ hot, 27℃ normal, 5℃ cold, 6℃ normal, 눈 코드(2, 3, 6, 7)·`hasSnowfall`이 비·더움·추움보다 우선, 비 코드(1, 4, 5)가 더움·추움보다 우선, 기온 null이면 건너뜀, 빈 관측은 normal.
- AC-7 임계값 한 곳: `src/features/meal`에서 `28`·`5` 숫자 임계값이 `meal-weather.constant.ts`에만 있는지는 정적 확인, 분류 함수가 상수를 바꾸면 결과가 바뀌는지는 경계값 테스트로 확인.
- 변환: 대상 날짜 행만 쓴다(다른 날짜의 PTY 무시), `"적설없음"` → 눈 아님, `"1cm 미만"` → 눈, `"28.0"` → 28, 모양이 틀린 행 건너뜀, 오늘 행 없음 → null, 실황 T1H → max·min 같은 값.
- 발표 시각: 한국 시간 02:19 → 어제 `2300`, 02:20 → 오늘 `0200`, 대상 날짜는 둘 다 오늘. 실황 10:44 → `0900`, 10:45 → `1000`, 00:10 → 어제 `2300`. 테스트는 UTC `Date`로 넣어 서버 시간대와 무관함을 확인.
- AC-9 지역 검사: 목록 key는 true, `'Seoul'`, `' seoul'`, `''`, `null`, 숫자, `'__proto__'`는 false.
- 가중치 함수: off·unavailable·normal은 모든 메뉴 1, ready + rain은 태그 메뉴만 `MEAL_WEATHER_TAG_WEIGHT`.
- AC-14·AC-8 태그 목록: 23장 "메뉴 날씨 태그 데이터 구조"의 단위 테스트 항목 (기준표 반영 티켓에서 추가).
- AC-10: 새 문구 상수가 있고 금지어를 지킨다(`meal-copy.test.ts`가 자동 검사, 여기서는 문장 4종 존재만).
- AC-13: `MEAL_WEATHER_SOURCE_TEXT`에 "기상청", "공공데이터포털", "공공누리", `{year}`가 있고 `MEAL_WEATHER_SOURCE_URL`이 `https://`로 시작.

`unit/meal/meal-weather-repository.test.ts` (신규, `createMealWeatherRepository`에 가짜 fetch·시계 주입)
- AC-9: 같은 지역 두 번 → fetch 1회. 59분 뒤 → 1회 그대로. 60분 뒤 → 2회. 다른 지역 → 따로 호출. 자정이 지나면 같은 지역도 새로 호출.
- 동시 요청 두 개 → fetch 1회.
- 실패(네트워크, `resultCode` '03', XML 본문)는 캐시하지 않는다: 다음 요청에서 다시 호출.
- 단기예보 실패 → 실황 호출, 실황 값으로 분류. 둘 다 실패 → `MealWeatherError`.
- 키 없음 → fetch 0회, `MealWeatherError`.
- AC-11: 던진 에러 메시지에 키 문자열과 인코딩된 키가 없다. 요청 URL에 nx, ny, base_date, base_time, `dataType=JSON`이 있다.

기존 단위 테스트 수정
- `unit/meal/meal-pick.test.ts`: `weightOf` 생략 시 기존 결과와 같다, 모든 가중치 1이면 r마다 `pool[r]`, 가중치 [3, 1, 1]에서 r=0~2 → 0번, 3 → 1번, 4 → 2번, 직전 메뉴 제외가 가중치보다 먼저(AC-8).
- `unit/meal/meal-copy.test.ts`: 금지어 추가 확인. "같은 확률" 관련 기대 문장이 있으면 새 문장으로.
- `unit/meal/meal-notice.test.ts`: 15·21행 고정 문장을 새 확정 문장으로.
- `unit/meal/meal-menu.test.ts`(보충 메뉴가 생길 때만): `EXPECTED_BY_CATEGORY`, "저녁 기본 후보 123개", `MEAL_MENU_COUNTS` 연동 값.

### E2E (QA 담당, 참고)

- 새 spec `e2e/meal-weather.spec.ts`: AC-1~6. `e2e/helpers/meal.util.ts`에 `stubWeather(page, { status, body })`만 추가하고 기존 헬퍼(`openPage`, `spinOnce`, `mapLinks`, `stubMaps`, `watchGeolocation`, `countGeolocation`, `horizontalOverflow`)를 재사용한다.
- AC-2: 지역 미선택·스위치 꺼짐에서 `/api/meal/weather` 요청 0건, 날씨 영역 없음.
- AC-3: `stubWeather` 503 → 결과 있음, 실패 안내 한 줄.
- AC-4: 이 사이트로 가는 요청의 URL·본문에 동네 입력 문자열과 뽑힌 메뉴 이름이 없다. `/api/meal/weather` 쿼리는 `region` 하나이고 값이 목록 key. 저장소·쿠키에 지역·날씨 값 없음. 쿠키 거절 상태.
- AC-6: 데스크톱·모바일(`@smoke`) 모두.
- 기존 `e2e/meal.spec.ts`, `e2e/meal-location.spec.ts`는 지역 미선택 상태라 요청이 없고 그대로 통과해야 한다(회귀). 이 두 파일은 고치지 않는다.

### 정적 (QA·PM 확인)

- AC-11: `DATA_GO_KR_API_KEY` 검색 결과가 repository와 `scripts/fortune-calendar/`, README, `.env.example`뿐. `NEXT_PUBLIC_DATA` 없음. `pnpm build` 뒤 `.next/static`에 키 이름 없음. route·repository에 `console.` 없음.
- AC-16: `geolocation=()` 그대로, `navigator.geolocation` 없음, 새·수정 파일에 `localStorage|sessionStorage|indexedDB|document.cookie|track\(|router\.|useSearchParams` 없음, 날씨 값이 광고 컴포넌트 props로 가지 않음.
- AC-12, AC-13, AC-14, AC-15: "갱신할 문서" 표와 `grid-check.md`, `weather-tags.md`.

## 담당별 작업 순서

- db: 없음
- backend:
  1. BE-1 지역 상수: `meal-weather-region.constant.ts`와 `docs/meal-weather/grid-check.md` (현행 행정구역·격자 대조). T-0 뒤.
  2. BE-2 변환·분류: `meal-weather.util.ts`의 분류·변환·발표 시각·지역 검사 함수와 `unit/meal/meal-weather.test.ts`의 해당 부분. T-0 뒤, BE-1과 병렬 가능(지역 검사 테스트만 BE-1 뒤).
  3. BE-3 서버: `meal-weather.repository.ts`, `src/app/api/meal/weather/route.ts`, `meal.openapi.json`, `unit/meal/meal-weather-repository.test.ts`, README 55행·API 표. BE-1, BE-2 뒤.
- 공통 선행 T-0 (frontend-dev가 맡는다): `meal.type.ts` 날씨 타입, `meal-weather.constant.ts`(임계값, 코드 묶음, 가중치, TTL, 시각 상수). 모든 티켓의 선행.
- frontend:
  1. FE-1 가중 뽑기: `meal-pick.util.ts` `weightOf` 인자, `getMealWeatherWeightOf`(`meal-weather.util.ts`에 추가), `meal-weather-tag.constant.ts` 빈 구조, `unit/meal/meal-pick.test.ts`. T-0 뒤. `meal-weather.util.ts`를 BE-2와 같이 고치므로 BE-2 뒤에 하거나 같은 사람이 이어서 한다.
  2. FE-2 문구: `meal-notice.constant.ts`, `meal-faq.constant.ts`, `meal-copy-rule.constant.ts`, `unit/meal/meal-copy.test.ts`, `unit/meal/meal-notice.test.ts`, `docs/meal-weather/copy-log.md`. ui-ux-design.md 문구 확정 뒤.
  3. FE-3 화면: `meal-weather.service.ts`, `use-meal-weather.query.ts`, `use-meal-weather.hook.ts`, `use-meal-roulette.hook.ts`, `weather-panel.component.tsx`, `weather-note.component.tsx`, `root.component.tsx`, `result.component.tsx`. FE-1, FE-2 뒤. API는 계약만 있으면 되므로 BE-3과 병렬 가능.
  4. FE-4 법적 문구: `privacy/page.tsx`, `terms/page.tsx`, 시행일. FE-2와 파일이 겹치지 않아 병렬 가능.
  5. FE-5 태그·보충 메뉴: `meal-weather-tag.constant.ts` 내용, `meal-menu-*.constant.ts` 끝에 보충 메뉴, `meal-menu.constant.ts` 개수, `unit/meal/meal-menu.test.ts`, 태그 단위 테스트. **`weather-tags.md` 기준표 승인 뒤에만**. FE-1 뒤.
- PM: COMPLIANCE.md, THIRD_PARTY_NOTICES.md, 공공데이터포털 활용신청·한도 확인(Q10), 출처 URL 확인.
- qa: 단위 신규 파일은 해당 BE·FE 티켓에 포함. E2E는 FE-3, FE-4, BE-3 뒤. 태그 미승인 상태에서도 AC-1~6 E2E는 동작한다(뽑힌 메뉴와 상관없이 날씨 줄이 나온다).

## 파일 충돌 위험

- `src/features/meal/types/meal.type.ts`, `meal-weather.constant.ts`: T-0에서 먼저 끝낸다. 백엔드와 프론트가 모두 import한다.
- `src/features/meal/utils/meal-weather.util.ts`: BE-2(분류·변환)와 FE-1(가중치 함수)이 같은 파일이다. 순서대로 한다.
- `src/features/meal/constants/meal-notice.constant.ts`: 날씨 문구와 기존 고지 문장 수정이 한 파일이다. FE-2 한 티켓으로 묶는다. `meal-copy-rule.constant.ts`가 이 파일의 고지 문장을 허용 문장으로 import한다.
- `use-meal-roulette.hook.ts`, `root.component.tsx`, `result.component.tsx`: props와 spin 시그니처가 이어져 있어 FE-3 한 티켓으로 순서대로 고친다.
- `meal-menu-*.constant.ts`, `meal-menu.constant.ts`, `unit/meal/meal-menu.test.ts`: FE-5 한 티켓. 기준표 승인 전에는 아무도 고치지 않는다.
- `unit/meal/meal-copy.test.ts`, `meal-notice.test.ts`, `meal-pick.test.ts`: 해당 FE 티켓에서 고친다. QA는 새 파일만 만든다.
- `e2e/helpers/meal.util.ts`: `meal.spec.ts`, `meal-location.spec.ts`가 같이 쓴다. QA는 함수 추가만 하고 기존 함수를 바꾸지 않는다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md`: 다른 기능이 같은 시기에 `EFFECTIVE_DATE`를 바꾸면 날짜를 하나로 맞춘다. 지금 작업 트리에는 이 파일들의 커밋되지 않은 변경이 없다.
- `README.md`: BE-3만 고친다(PM은 COMPLIANCE만).

## PM 확인 요청

- DQ1. 서버 캐시 방식
  - A (권장): 서버 메모리 `Map` + 동시 요청 묶기, 성공만 1시간 캐시. 장점: AC-9를 단위 테스트로 그대로 검사할 수 있다, 실패를 캐시하지 않는다, Next 캐시 API에 의존하지 않는다(기존 rate limit도 같은 메모리 방식). 단점: 인스턴스마다 캐시가 따로라 호출이 인스턴스 수만큼 늘 수 있다(추정 하루 수천 건 이하).
  - B: `fetch(url, { next: { revalidate: 3600 } })`로 Next 데이터 캐시를 쓴다. 장점: 인스턴스 사이에 캐시가 공유된다, 코드가 짧다. 단점: 기상청은 오류도 HTTP 200으로 줄 때가 있어 오류 응답이 1시간 캐시될 수 있다, vitest로 1시간 규칙을 검사하기 어렵다, Next 16 캐시 동작에 기대게 된다.
- DQ2. 단기예보 발표 시각
  - A (권장): 하루 한 번 02시 발표(02:20 전은 전날 23시 발표)를 쓴다. 호출 1회로 오늘 최고·최저와 오늘 강수 예보가 모두 들어 있다. 단점: 낮 동안 바뀐 강수 예보를 반영하지 않는다(새벽 예보 기준 "오늘").
  - B: 최고·최저는 02시 발표, 강수는 가장 최근 발표에서 가져온다. 장점: 강수 예보가 최신이다. 단점: 호출이 2배, 두 발표 시각 계산과 테스트가 늘어난다.
- DQ3. 태그 메뉴 가중치 (`MEAL_WEATHER_TAG_WEIGHT`)
  - 예: 점심 후보 120개 중 비 태그 8개일 때, 태그 메뉴가 뽑힐 확률 합계는 가중치 1(현재) 6.7%, 2이면 12.5%, 3이면 17.6%.
  - A (권장): 3. "날씨에 맞는 메뉴가 나왔다"는 느낌이 보일 만큼이면서 다른 메뉴가 여전히 대부분이다.
  - B: 2. "조금 높인다"에 더 가깝지만 체감이 약하다.
  - 태그 기준표의 끼니·날씨별 개수가 정해지면 같은 표로 다시 계산해 보여 드릴 수 있다. 값은 상수 하나라 나중에 바꾸기 쉽다.
- DQ4. 보통 날씨일 때 출처 표시
  - A (권장): 날씨 자료를 받아 분류에 썼으면(ready) 보통이어도 결과에 출처와 정확도 문구만 보인다. 날씨 한 줄은 없다(Q5 유지). 장점: 공공누리 제1유형 출처 표시를 자료를 쓴 모든 경우에 지킨다. 단점: 보통 날씨에도 결과 카드에 두 줄이 더 생긴다.
  - B: 보통이면 출처도 보이지 않는다. 장점: 화면이 짧다. 단점: 자료를 받아 썼는데 출처가 안 보이는 경우가 생긴다(보통이면 뽑기가 균등이라 결과에 영향은 없다).
