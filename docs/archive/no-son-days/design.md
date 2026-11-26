# 손 없는 날 달력 설계서

입력: `docs/no-son-days/plan.md` (열린 질문 1~15번은 2026-11-25 사용자가 "추천대로" 승인했다. 1번 중 메뉴 그룹은 설계 D-1에서 정했다)
참고: `docs/research/auspicious-days.md` 0장·3.8절·4장, `docs/conventions/` 네 문서(tech-stack, code-style, data-storage, seo)
상태: 승인 (2026-11-25, D-1=B, D-2=가, D-3=추천안). 2026-11-25 UI 디자인 승인 뒤 보강: 오늘이 표시 범위 밖일 때 허브 달력의 처음 달(3.3절 `getNoSonInitialMonth`, 4장 U-10, 7.3절), "이번 달로" 버튼 없음과 월 이동 전환 효과 없음 확인(7.3절)

## 0. 사용자 결정 요청

설계를 확정하기 전에 아래 세 가지를 정해야 한다. D-1은 기획에서 넘어온 미정 항목이고, D-2와 D-3은 설계 중 생긴 항목이다.

- 결정 (2026-11-25, 사용자): D-1=B 새 그룹 `no-son-days`(꿈 해몽 다음, 로또 앞), D-2=가 공용 이동, D-3=추천안. 아래 표는 결정 근거로 남긴다.

### D-1. 메뉴 그룹 (필수, 결정: B)

주소는 세 안 모두 `/no-son-days`와 `/no-son-days/<연도>`로 같다. 바뀌는 것은 헤더·홈·OG 태그에서 어느 묶음으로 보이는지와 손댈 파일 수다.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| A. 운세 그룹 항목 | `MENU_LIST`의 운세 그룹 `items`에 항목 하나를 넣는다. 그룹 키·색은 운세(`menu-fortune`)를 쓴다 | 새 색·enum·테마 값이 필요 없다. 고칠 공용 파일이 가장 적다 | 운세 허브(`/fortune`)가 운세 그룹 `items`를 그대로 목록으로 보여 주므로(`getFortuneHubItems`) 손 없는 날이 운세 목록에 섞인다. 걸러 내려면 운세 허브 코드를 고쳐야 한다. 홈의 운세 그룹 설명("생년월일로 보는…")과 맞지 않아 문구를 바꿔야 한다. `unit/fortune/fortune-copy.test.ts`가 운세 그룹 항목을 운세 금지어로 검사하므로 검사 범위가 섞인다. 기획이 피하려 한 "운세 고지·게이트와 같은 묶음" 인상이 남는다 |
| B. 새 그룹 `no-son-days` (추천) | enum `NO_SON_DAYS = 'no-son-days'`, 라벨 "손 없는 날", 그룹 주소 `/no-son-days`. 꿈 해몽처럼 항목 하나짜리 그룹 | 기능명·주소·그룹 키가 같아 단순하다. 운세 고지·게이트와 완전히 분리된다. 기존 운세 코드와 테스트를 건드리지 않는다 | 새 라벨 색(`--menu-no-son-days`)이 필요하고 `design-system.md` 색 표를 바꿔야 한다(규칙 문서 변경이라 사용자 승인 필요). `theme.constant.ts` 네 맵, `MenuSectionKeyType`, `HOME_GROUP_DESCRIPTIONS`를 같이 고친다. 헤더 그룹이 7개가 되어 PC 헤더 폭을 ui-ux가 확인해야 한다 |
| C. 새 그룹 `calendar` | B와 같지만 그룹 키를 넓은 이름 `calendar`로 둔다. 라벨은 지금은 "손 없는 날" | 2차 후보(길일, 공휴일)를 같은 그룹에 넣기 쉽다 | B의 단점을 모두 가진다. 지금은 항목이 하나인데 키 이름이 넓어 기능명과 어긋난다. 2차 기능은 아직 확정되지 않았다 |

- 추천: B. 기획의 경로 판단(운세 묶음 피하기)과 같은 이유다. 2차 기능을 넣게 되면 그때 라벨만 바꾸거나 새 그룹을 만든다.
- 메뉴 순서(그룹 위치)도 같이 정한다. 추천: 꿈 해몽 다음, 로또 앞.
- 이 설계서의 나머지 부분은 B를 기준으로 썼다. A나 C를 고르면 12장의 파일 목록만 바뀐다.

### D-2. 음력 표를 공용으로 올리기 (결정: 가)

`docs/conventions/code-style.md`는 "다른 기능의 코드가 필요하면 직접 import하지 않고, 공용 폴더로 올린 뒤 쓴다"고 정한다. 손 없는 날은 운세의 음력 표(`FORTUNE_LUNAR_TABLE`)가 필요하므로 아래 두 안 중 하나를 고른다.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| 가. 공용으로 이동 (추천) | 음력 표·음력 행 타입·율리우스 일수(JDN) 계산을 `src/constants`, `src/types`, `src/lib`로 옮긴다. 운세는 공용을 import한다. 양력→음력 변환을 공용 lib에 새로 만든다 | 규칙대로다. 표와 JDN 계산이 한 곳에만 있다. 양력→음력 함수를 나중에 다른 기능도 쓴다 | 승인된 운세 코드(유틸 2개, 생성 스크립트 2개, 단위 테스트 1개)를 고친다. 동작은 바뀌지 않지만 운세 단위 테스트로 회귀 확인이 필요하다 |
| 나. 앱 계층에서 주입 | 표는 운세에 그대로 두고, 라우트(`src/app/no-son-days/`)가 운세 표를 import해 손 없는 날 컴포넌트에 props로 넘긴다. 양력→음력 계산은 손 없는 날 기능 안에 따로 만든다 | 운세 코드를 건드리지 않는다 | JDN 계산과 표 읽기 코드가 두 벌이 된다. 클라이언트 달력에 표를 props로 계속 넘겨야 해서 구조가 어색하다. "공용으로 올린다"는 규칙과 어긋난다 |

- 추천: 가. 이 설계서는 가를 기준으로 썼다(3장).

### D-3. 광고 개수 계산 (결정: 추천안)

기획 열린 질문 10번 추천안(승인됨)은 "허브 상단(고지 아래)과 하단 각 1개, 페이지당 최대 2개, 연도 화면은 상단 1개"다. 그런데 사이트 레이아웃(`src/app/layout.tsx`)이 모든 페이지 h1 위에 AdFit 배너 하나를 이미 넣는다. 그대로 따르면 허브는 3개가 된다.

- 추천: 레이아웃 배너를 "상단 1개"로 센다. 허브는 하단에 1개만 추가해 총 2개, 연도 화면은 레이아웃 배너만 두어 총 1개다. 상한은 "한 화면 2개"로 확정한다(AC-12).
- 확인 필요: `AdFitSlotComponent`는 광고 단위 하나(`AD_TOP_BANNER`)만 쓴다. 같은 광고 단위를 한 페이지에 두 번 거는 것이 AdFit 정책상 허용되는지 배포 전에 확인한다. 허용되지 않거나 점술·운세 심사에 걸리면 허브 하단 광고 없이 배포한다(레이아웃 배너 1개). 새 광고 단위 ID가 필요해지면 환경변수 추가가 되므로 그때 다시 설계한다.

## 1. 폴더 구조

```
src/app/no-son-days/
  page.tsx                         # 허브. 서버 컴포넌트, ISR(revalidate 3600)
  [year]/page.tsx                  # 연도 화면. 정적 생성(generateStaticParams 2026~2049, dynamicParams = false)

src/features/no-son-days/
  constants/
    no-son-days-route.constant.ts      # 표시 범위(2026~2049), 허브 경로, 연도 경로 템플릿
    no-son-days-notice.constant.ts     # 상단 고지, 하단 고지, 출처 문구 (AC-8, 한 파일에 모은다)
    no-son-days-guide.constant.ts      # 규칙 설명 블록 문구 (뜻, 음력 기준, 소월, 윤달, 민속 관례, 계산 근거)
    no-son-days-seo.constant.ts        # title·description·keywords·breadcrumb 이름, 연도 템플릿
    no-son-days-view.constant.ts       # 요일 이름, 상태 라벨("오늘", "손 없는 날", "윤", "표시 범위 밖") 등 화면 라벨
    no-son-days-copy-rule.constant.ts  # 금지 표현 목록. 검사 전용, 화면 코드는 import하지 않는다
  types/
    no-son-days.type.ts
  utils/
    no-son-days.util.ts                # 판정·월·연·오늘 상태·처음 달·달 이동 계산 (순수 함수)
    no-son-days-seo.util.ts            # 연도별 메타데이터 입력, breadcrumb 입력, 사이트맵용 연도 경로 목록
  hub/
    components/
      root.component.tsx               # NoSonDaysHubComponent (서버)
      today-calendar.component.tsx     # NoSonDaysHubTodayCalendarComponent (클라이언트 컨테이너)
      today-status.component.tsx       # NoSonDaysHubTodayStatusComponent (props만 받는다)
    hooks/
      use-korea-today.hook.ts          # 마운트 후 한국 날짜를 다시 읽어 서버 값과 다르면 바꾼다
  year/
    components/
      root.component.tsx               # NoSonDaysYearComponent (서버)
      month-list.component.tsx         # NoSonDaysYearMonthListComponent (서버, 12개월 목록)
  shared/
    components/
      calendar.component.tsx           # NoSonDaysCalendarComponent (클라이언트, 달 이동)
      calendar-grid.component.tsx      # NoSonDaysCalendarGridComponent (props만, 7열 칸)
      disclaimer-notice.component.tsx  # 상단 고지 (서버, h1 바로 아래)
      bottom-notice.component.tsx      # 하단 짧은 고지 + 출처 문구 (서버)
      rule-guide.component.tsx         # 규칙 설명 블록 (서버)
      year-links.component.tsx         # 2026~2049 연도 링크 목록 (서버)
      breadcrumb.component.tsx         # 화면 breadcrumb (서버)
    hooks/
      use-calendar-month.hook.ts       # 달 커서(연·월)와 이동 여부를 useReducer로 관리

공용으로 올리는 것 (D-2 가안):
src/constants/lunar-table.constant.ts  # 운세에서 이동, 상수 이름 LUNAR_TABLE (자동 생성 파일)
src/types/calendar.type.ts             # CalendarYmdType, LunarYearType, LunarDateType
src/lib/date.ts                        # 기존 파일에 JDN·요일·한국 날짜 함수 추가
src/lib/lunar-calendar.ts              # 음력 표 읽기, 양력→음력 변환

테스트·문서:
unit/no-son-days/no-son-days-rule.test.ts
unit/no-son-days/no-son-days-copy.test.ts
unit/shared/lunar-calendar.test.ts
unit/shared/fixtures/kasi-lunar-2026-2049.json  # KASI 대조 표본 (verify.mjs 결과)
e2e/no-son-days.spec.ts                         # QA
docs/no-son-days/verification.md                # AC-13
docs/no-son-days/copy-log.md                    # 문구 검수 기록
```

- 라우트 파일은 얇게 둔다. 메타데이터와 `notFound()` 판정만 하고 features의 root 컴포넌트를 렌더링한다.
- 손 없는 날 기능은 `src/features/fortune/`을 import하지 않는다. 음력 계산은 공용(`@/lib/lunar-calendar`, `@/lib/date`)만 쓴다.
- 공유 기능(`src/lib/share*`, `use-share.hook.ts`)은 쓰지 않는다(기획 11번, 1차 제외).

## 2. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 음력 표 (1919~2049) | 코드 상수 `src/constants/lunar-table.constant.ts` | 모두에게 같고 생성 스크립트로만 바뀐다. 운세와 손 없는 날이 같이 쓴다 |
| 표시 범위, 경로, 규칙(끝자리 9·0) | 코드 상수 `no-son-days-route.constant.ts`, 유틸 | 모두에게 같고 바뀌지 않는다 |
| 고지·규칙 설명·SEO·화면 라벨 문구 | 코드 상수 (`no-son-days-*.constant.ts`) | 모두에게 같다. 서버 HTML에 넣어야 한다 |
| 금지 표현 목록 | 코드 상수 (검사 전용) | 단위 테스트만 읽는다. 화면 번들에 넣지 않는다 |
| 월 달력·연도 목록·오늘 상태·처음 달 | 저장하지 않는다. 렌더링 중 계산 | 음력 표에서 바로 계산된다. 하루 365번 변환도 가볍다 |
| 달 커서(보고 있는 연·월), 한국 날짜 | React 메모리 상태 | 새로고침하면 처음 달로 돌아가도 된다. 기획이 새 저장 키를 금지한다 |
| KASI 대조 표본 | 저장소의 테스트 고정값 `unit/shared/fixtures/` | 단위 테스트를 네트워크 없이 돌리기 위해서다. 런타임에는 쓰지 않는다 |

- sessionStorage, localStorage, IndexedDB, 쿠키, Supabase는 쓰지 않는다. 새 저장 키가 없다.

## 3. 계산 설계

### 3.1 음력 표를 공용으로 올리는 방법 (D-2 가안)

목표는 동작을 바꾸지 않고 위치만 옮기는 것이다. 표 데이터는 다시 받지 않는다.

1. 표 파일 이동
   - `src/features/fortune/constants/calendar/lunar-table.constant.ts` → `src/constants/lunar-table.constant.ts`
   - 상수 이름 `FORTUNE_LUNAR_TABLE` → `LUNAR_TABLE`, 타입 `FortuneLunarYearType` → `LunarYearType` (`@/types/calendar.type`)
   - 데이터 행 131개(1919~2049)와 머리 주석의 생성일·출처·범위·형식은 그대로 둔다. 바뀌는 줄은 import 줄과 상수 선언 줄뿐이다.
   - 절기 표(`solar-term-table.constant.ts`)는 손 없는 날에 필요 없으므로 운세에 그대로 둔다.
2. 생성 스크립트 수정 (`scripts/fortune-calendar/`)
   - `generate.mjs`: `LUNAR_TABLE_PATH`를 `src/constants/lunar-table.constant.ts`로 바꾼다. 절기 표 경로는 그대로다.
   - `calendar-core.mjs`의 `formatLunarTable`: 출력 템플릿의 import 줄과 상수 이름을 1번과 같게 바꾼다. 이동한 파일은 이 템플릿이 만드는 결과와 글자 단위로 같아야 한다.
   - `parseLunarTableText`는 행 패턴만 읽으므로 바꾸지 않는다. `node scripts/fortune-calendar/verify.mjs --offline`이 통과해야 한다.
3. 타입 이동
   - `src/types/calendar.type.ts`에 `CalendarYmdType`(`Readonly<{ year; month; day }>`), `LunarYearType`(기존 `FortuneLunarYearType`과 같은 모양), `LunarDateType`을 둔다.
   - `src/features/fortune/types/fortune-calendar.type.ts`에서 `FortuneLunarYearType`을 지운다. `FortuneSolarTermIndexType`, `FortuneSolarTermYearType`은 남긴다.
   - `FortuneYmdType`은 그대로 둔다. `CalendarYmdType`과 모양이 같아 서로 넘겨도 타입 오류가 없다.
4. JDN 계산 이동
   - `fortune-date.util.ts`의 `toJulianDayNumber`, `fromJulianDayNumber` 본문을 `src/lib/date.ts`로 옮긴다. 인자·반환 타입은 `CalendarYmdType`이다.
   - `fortune-date.util.ts`는 같은 이름을 `@/lib/date`에서 다시 내보낸다(named re-export). 운세의 다른 호출부(사주, 단위 테스트 등)는 고치지 않는다.
5. 운세 음력 유틸 정리
   - `fortune-lunar.util.ts`의 비공개 함수 `findLunarYear`, `readMonthLength`를 지우고 공용 `findLunarYearRow`, `readLunarMonthLength`를 쓴다.
   - 공개 함수(`getLunarLeapMonth`, `getLunarMonthLength`, `getSeollalDate`, `convertLunarToSolar`)의 이름·시그니처·오류 순서는 바꾸지 않는다.
6. 운세 단위 테스트
   - `unit/fortune/fortune-calendar.test.ts`의 import 한 줄만 `import { LUNAR_TABLE as FORTUNE_LUNAR_TABLE } from '@/constants/lunar-table.constant'`로 바꾼다. 검사 내용은 그대로 둔다.
   - `unit/fortune/` 전체가 이동 전과 같이 통과해야 한다.
7. 문서 경로 갱신
   - `README.md` 88행 표 위치, `THIRD_PARTY_NOTICES.md` 51행 표 경로를 새 위치로 바꾼다.

### 3.2 공용 함수 계약 (확정)

`src/lib/date.ts` (기존 `getKoreaTime`, `getKoreaDateKey`는 그대로)

```ts
export function toJulianDayNumber(ymd: CalendarYmdType): number;
export function fromJulianDayNumber(jdn: number): CalendarYmdType;
/** 0 = 일요일 ~ 6 = 토요일. (jdn + 1) % 7 */
export function getWeekdayIndex(ymd: CalendarYmdType): number;
/** 한국 시간(Asia/Seoul) 기준 오늘. getKoreaDateKey와 같은 Intl 방식으로 연·월·일을 숫자로 돌려준다 */
export function getKoreaYmd(date?: Date): CalendarYmdType;
/** 'YYYY-MM-DD' */
export function toDateKey(ymd: CalendarYmdType): string;
```

`src/lib/lunar-calendar.ts`

```ts
/** 음력 연도 행. 표 범위 밖이면 null (던지지 않는다) */
export function findLunarYearRow(lunarYear: number): LunarYearType | null;
/** 행 안의 달 길이. 달·윤달 존재 여부는 호출부가 먼저 확인한다 */
export function readLunarMonthLength(row: LunarYearType, month: number, isLeapMonth: boolean): 29 | 30;
/**
 * 양력 → 음력. 표 범위 밖이면 null.
 * 양력 연도 Y의 날짜는 음력 Y년(설날 이후) 또는 Y-1년(설날 이전)에 속한다.
 * 해당 행의 달 순서(평달 1~12, 윤달은 같은 번호 평달 바로 뒤)를 따라 날짜를 찾는다.
 */
export function convertSolarToLunar(ymd: CalendarYmdType): LunarDateType | null;
```

```ts
// src/types/calendar.type.ts
export type CalendarYmdType = Readonly<{ year: number; month: number; day: number }>;
export type LunarYearType = Readonly<{ year: number; newYear: number; leapMonth: number; monthBits: number }>;
export type LunarDateType = Readonly<{ year: number; month: number; day: number; isLeapMonth: boolean }>;
```

- `convertSolarToLunar`는 `scripts/fortune-calendar/calendar-core.mjs`의 `solarToLunar`와 같은 규칙(설날 MMDD + monthBits로 달 시작일을 이어 붙인다)을 TypeScript로 옮긴 것이다. 스크립트 쪽 함수는 KASI 대조 도구이므로 그대로 둔다. 둘은 독립 구현이고, 4장의 단위 테스트가 같은 결과인지 확인한다.
- 범위 확인: 음력 2049년 행은 설날 2049-02-02, 평달 12개(30일 7개, 29일 5개), 355일이므로 2050-01-22까지 덮는다. 따라서 2049-12-31은 표 안이다. 음력 2025년 행(설날 2025-01-29, 윤6월)은 2026-02-16까지 덮으므로 2026-01-01도 표 안이다. 표시 범위 2026-01-01~2049-12-31 전체가 표 안에 있다. 단위 테스트로도 확인한다(4장 U-3).

### 3.3 손 없는 날 함수 계약 (확정)

`src/features/no-son-days/types/no-son-days.type.ts`

```ts
export type NoSonDayInfoType = Readonly<{
  dateKey: string;            // 'YYYY-MM-DD'
  solar: CalendarYmdType;
  weekday: number;            // 0 = 일 ~ 6 = 토
  lunar: LunarDateType;
  isNoSonDay: boolean;
}>;

export type NoSonMonthType = Readonly<{
  year: number;
  month: number;
  leadingBlankCount: number;  // 1일 앞 빈칸 수(일요일 시작), = 1일의 weekday
  days: readonly NoSonDayInfoType[];
}>;

export type NoSonYearType = Readonly<{
  year: number;
  months: readonly Readonly<{ month: number; noSonDays: readonly NoSonDayInfoType[] }>[]; // 길이 12
}>;

export type NoSonNextDayType = Readonly<{ day: NoSonDayInfoType; daysUntil: number }>;

export type NoSonTodayStatusType =
  | Readonly<{ kind: 'in-range'; today: NoSonDayInfoType; next: NoSonNextDayType | null }>
  | Readonly<{ kind: 'out-of-range'; todayKey: string }>;

export type NoSonMonthCursorType = Readonly<{ year: number; month: number }>;
```

`src/features/no-son-days/utils/no-son-days.util.ts`

```ts
/** 음력 날짜 끝자리가 9 또는 0 (9, 10, 19, 20, 29, 30일) */
export function isNoSonLunarDay(lunarDay: number): boolean;
/** 표시 범위(2026-01-01~2049-12-31) 안인지 */
export function isWithinNoSonRange(ymd: CalendarYmdType): boolean;
/** 범위 밖이면 null */
export function getNoSonDayInfo(ymd: CalendarYmdType): NoSonDayInfoType | null;
/** 범위 밖 연·월이면 null */
export function buildNoSonMonth(year: number, month: number): NoSonMonthType | null;
/** 2026~2049 밖이면 null */
export function buildNoSonYear(year: number): NoSonYearType | null;
/**
 * 기준 날짜(한국 시간 오늘)의 상태.
 * - 기준 날짜가 범위 밖이면 out-of-range.
 * - 범위 안이면 today를 넣고, next는 기준 날짜 다음 날부터 2049-12-31까지에서 첫 손 없는 날. 없으면 null.
 * - 오늘이 손 없는 날이면 today.isNoSonDay = true, next는 그 뒤 날짜다 (기획 6번 추천안).
 */
export function getNoSonTodayStatus(today: CalendarYmdType): NoSonTodayStatusType;
/**
 * 허브 달력의 처음 달. 기준 날짜(한국 시간 오늘)가 속한 달을 표시 범위 안으로 맞춘다.
 * - 기준 날짜가 범위 안이면 그 날짜의 { year, month }.
 * - 2026-01-01 이전이면 { year: 2026, month: 1 }.
 * - 2049-12-31 이후면 { year: 2049, month: 12 }.
 * 항상 buildNoSonMonth가 null이 아닌 커서를 돌려준다(null을 돌려주지 않는다).
 */
export function getNoSonInitialMonth(today: CalendarYmdType): NoSonMonthCursorType;
/** '2026'~'2049'만 숫자로 돌려준다. /^\d{4}$/가 아니거나 범위 밖이면 null */
export function parseNoSonDaysYear(value: string): number | null;
/** 2026~2049 */
export function getNoSonDaysYears(): readonly number[];
/** 이동 결과. 2026-01 이전, 2049-12 이후로 가면 null */
export function moveNoSonMonth(cursor: NoSonMonthCursorType, delta: -1 | 1): NoSonMonthCursorType | null;
```

`src/features/no-son-days/utils/no-son-days-seo.util.ts`

```ts
export function getNoSonDaysYearPath(year: number): string;          // '/no-son-days/2027'
export function getNoSonDaysYearPaths(): readonly string[];          // 사이트맵용 24개
export function buildNoSonDaysYearSeo(year: number): { title; description; pathname; keywords; ogImage };
export function buildNoSonDaysBreadcrumb(year?: number): ReadonlyArray<{ name: string; item: string }>;
```

규칙과 예외 처리:

- 판정은 음력 날짜의 일(day) 끝자리만 본다. 음력 월, 평달·윤달, 요일은 판정에 쓰지 않는다.
- 소월(29일 달): 음력 30일이 표에 없으므로 그 달 손 없는 날은 9, 10, 19, 20, 29일 다섯 개다. 달력은 양력 칸이므로 "음력 30일 칸"이 따로 생기지 않는다. 비워 둘 칸이 없다는 뜻이며 별도 처리 코드는 없다.
- 윤달: 같은 규칙으로 판정하고 `lunar.isLeapMonth = true`로 넘긴다. 화면은 음력 날짜 앞에 "윤"을 붙인다.
- 기준 날짜: 서버는 `getKoreaYmd()`(서버 시각), 클라이언트는 마운트 후 `getKoreaYmd()`(기기 시각)를 쓴다. 둘 다 Asia/Seoul로 바꾸므로 기기 시간대와 상관없이 한국 날짜다. 기기 시계가 틀리면 그 날짜를 그대로 쓴다(기획 예외 항목).
- 오늘이 표시 범위 밖일 때 (UI 디자인 열린 질문 5번, 사용자 "추천대로" 승인):
  - 오늘 상태는 `out-of-range`이고, 화면은 범위 밖 문구만 보이고 다음 손 없는 날 영역은 숨긴다(ui-ux 컴포넌트 상태 표).
  - 허브 달력의 처음 달은 `getNoSonInitialMonth(today)`다. 범위 이전이면 2026년 1월, 범위 이후면 2049년 12월이다. 범위 끝까지의 거리와 상관없이 같다(예: 2020-06-15도 2026년 1월).
  - 이 경우 오늘 칸은 보이는 달 안에 없으므로 오늘 링은 그려지지 않는다. 따로 처리하는 코드는 없다(`todayKey`가 보이는 달의 `dateKey`와 맞지 않을 뿐이다).
  - 처음 달이 2026년 1월이면 이전 달 버튼, 2049년 12월이면 다음 달 버튼이 처음부터 비활성이다(`moveNoSonMonth`가 null).
  - 실제 운영 날짜(2026-11 이후)에서는 범위 이후만 생길 수 있다. 범위 이전 처리는 기기 시계가 틀린 경우를 위한 것이다.
- 지난 날짜: 따로 흐리게 하지 않는다. 정적·캐시 HTML의 기준 날짜와 기기 날짜가 다를 수 있어, 지난 날 표시를 서버 HTML에 넣으면 틀릴 수 있기 때문이다. 오늘 칸 표시만 마운트 후 클라이언트에서 붙인다.
- 남은 날수: `toJulianDayNumber(next) - toJulianDayNumber(today)`. 내일이면 1이다.

### 3.4 설계 단계 손 계산 (참고, 개발 단계에서 KASI로 확정)

음력 2026년 행(설날 2026-02-17, 윤달 없음, monthBits 3749)으로 직접 계산하면 음력 9월은 29일 달(양력 10-11~11-08), 10월은 30일 달(11-09~12-08), 11월은 12-09에 시작한다.

| 양력 달 | 손 없는 날 (양력) | 음력 |
|---|---|---|
| 2026년 11월 | 8, 17, 18, 27, 28일 | 9.29, 10.9, 10.10, 10.19, 10.20 |
| 2026년 12월 | 7, 8, 17, 18, 27, 28일 | 10.29, 10.30, 11.9, 11.10, 11.19, 11.20 |

- 연구 문서 3.8절의 첫 번째 출처(tess9.com, ajd.co.kr)와 같고, 두 번째 출처(lifedestiny.co.kr)와 다르다. 11월은 음력 9월이 소월이라 9월 30일이 없어 다섯 개다.
- 이 값은 4장 U-2의 고정 기대값으로 쓰되, 개발 단계에서 KASI `getLunCalInfo` 응답으로 다시 확인하고 `verification.md`에 남긴다(AC-13).

## 4. 단위 테스트 계획 (KASI 대조 포함)

단위 테스트는 네트워크 없이 돈다. KASI 대조는 사용자가 키를 넣고 스크립트를 직접 실행해 결과를 고정값 파일로 남기고, 테스트는 그 파일을 읽는다.

| ID | 파일 | 확인 내용 | AC |
|---|---|---|---|
| U-1 | `unit/no-son-days/no-son-days-rule.test.ts` | `isNoSonLunarDay`: 9, 10, 19, 20, 29, 30은 참, 1~8, 11~18, 21~28은 거짓 | AC-4 |
| U-2 | 같은 파일 | 2026년 11월·12월 손 없는 날이 3.4절 표와 같다 | AC-4, AC-13 |
| U-3 | 같은 파일 | 2026-01-01~2049-12-31 매일 `getNoSonDayInfo`가 null이 아니다. 표시 범위 전체가 음력 표 안에 있다 | AC-4 |
| U-4 | 같은 파일 | 2026~2049년에 걸친 모든 음력 달(평달·윤달)에서: 29일 달은 30일이 나타나지 않고 손 없는 날 5개, 30일 달은 6개. 어느 달도 6개를 넘지 않는다. 범위 양 끝에 걸쳐 일부만 보이는 달은 개수 검사에서 뺀다 | AC-4 |
| U-5 | 같은 파일 | 윤달 날짜(예: 2028년 윤5월 안 날짜)가 `isLeapMonth = true`이고 규칙이 같게 적용된다 | 기획 예외(윤달) |
| U-6 | 같은 파일 | `getNoSonTodayStatus`: (a) 평일 → today.isNoSonDay = false, next는 다음 손 없는 날과 남은 날수 (예: 2026-11-25 → 11-27, 2일) (b) 손 없는 날 → today.isNoSonDay = true, next는 그 뒤 날짜 (c) 2049-12-31 또는 마지막 손 없는 날 이후 → next = null (d) 2050-01-01, 2025-12-31 → out-of-range | AC-5 |
| U-7 | 같은 파일 | `parseNoSonDaysYear`: '2026', '2049'는 숫자, '2025', '2050', '02027', '2027a', '', ' 2027'은 null. `getNoSonDaysYears()` 길이 24 | AC-6 |
| U-8 | 같은 파일 | `moveNoSonMonth`: 2026-01에서 -1, 2049-12에서 +1은 null. 12월 +1은 다음 해 1월 | AC-2 |
| U-9 | 같은 파일 | `buildNoSonYear(2027)`의 months 길이 12, 각 목록이 `buildNoSonMonth` 결과의 손 없는 날과 같다 | AC-3 |
| U-10 | 같은 파일 | `getNoSonInitialMonth`: (a) 범위 안 2026-11-25 → 2026-11 (b) 범위 양 끝 2026-01-01 → 2026-01, 2049-12-31 → 2049-12 (c) 범위 이전 2025-12-31, 2020-06-15 → 2026-01 (d) 범위 이후 2050-01-01, 2060-03-10 → 2049-12 (e) 위 모든 결과에서 `buildNoSonMonth(cursor.year, cursor.month)`가 null이 아니다 (f) 결과가 2026-01이면 `moveNoSonMonth(cursor, -1)`, 2049-12이면 `moveNoSonMonth(cursor, 1)`이 null이다 | AC-1, AC-2, AC-5 |
| L-1 | `unit/shared/lunar-calendar.test.ts` | 왕복: 2026-01-01~2049-12-31 매일 `convertSolarToLunar` 결과를 운세의 `convertLunarToSolar`(다른 계산 경로)에 넣으면 같은 양력 날짜가 나온다 | AC-4 |
| L-2 | 같은 파일 | 연속성: 이웃한 두 날짜의 음력이 (같은 달에서 일 +1) 또는 (다음 달 1일)이고, 달이 바뀌는 직전 날짜는 29 또는 30일이다. 설날은 표의 `newYear`와 같다 | AC-4 |
| L-3 | 같은 파일 | KASI 고정값: `unit/shared/fixtures/kasi-lunar-2026-2049.json`의 모든 표본에서 `convertSolarToLunar` 결과(연·월·일·윤달)가 KASI `getLunCalInfo` 응답과 같다 | AC-13 |
| L-4 | 같은 파일 | 표 범위 밖(1919-01-31 이전, 2050-01-23 이후)은 null | 3.2절 |
| C-1 | `unit/no-son-days/no-son-days-copy.test.ts` | AC-9 금지 표현 검사. 목록은 `no-son-days-copy-rule.constant.ts`(효과 보장, 재물·건강·사고 단정, 업체 추천 표현). 검사 대상은 `no-son-days-*.constant.ts` 화면 문구와 12장 메뉴 문구. 고지의 부정 문장("보장하지 않습니다" 등)은 기존 운세·꿈 해몽 검사의 `stripAllowed` 방식으로 허용한다 | AC-9 |

KASI 대조 방법 (AC-13):

1. `scripts/fortune-calendar/verify.mjs`에 옵션 세 개를 추가한다. 옵션이 없으면 지금과 똑같이 동작해야 한다(운세 기본값 1920~2028, 결과 `verify-result.json`).
   - `--from=YYYY-MM-DD`, `--to=YYYY-MM-DD`: 무작위·윤달 표본을 뽑는 양력 범위
   - `--out=<경로>`: 결과 JSON을 쓸 곳. 운세 결과 파일을 덮어쓰지 않기 위해서다
2. 범위를 주면 고정 표본에 2026-01-01, 2026-11-08(음력 9.29, 소월 끝), 2026-12-08(음력 10.30), 2049-12-31을 넣고, 범위 안 윤달이 있는 해의 윤달 날짜를 하나씩 넣는다.
3. 사용자가 직접 실행한다(키를 AI가 읽지 않는다). PowerShell 예:
   `$env:DATA_GO_KR_API_KEY='<키>'; node scripts/fortune-calendar/verify.mjs --from=2026-01-01 --to=2049-12-31 --count=120 --seed=<정수> --out=unit/shared/fixtures/kasi-lunar-2026-2049.json`
4. 결과 파일의 표본(양력, 표 계산, API 응답, 일치 여부)을 L-3이 읽는다. 불일치가 1건이라도 있으면 배포하지 않고 원인을 `verification.md`에 적는다.
5. `docs/no-son-days/verification.md`에 남길 것: 실행일, 시드, 표본 수, 일치 수, 2026년 11~12월 손 없는 날을 (가) 음력 표 계산 (나) KASI `getLunCalInfo` 직접 조회 (다) 외부 출처 최소 두 곳(연구 3.8절의 tess9.com·ajd.co.kr 묶음과 lifedestiny.co.kr)과 비교한 표, 날짜가 다른 날의 이유(외부 출처의 계산 기준 차이 추정 등). 외부 사이트의 문장과 표는 옮기지 않고 날짜 사실만 적는다.

- 고정값 JSON에는 KASI 응답 중 날짜 필드(양력, 음력 연·월·일, 윤달 여부)만 남긴다. 키, 요청 URL, 응답 원문 전체는 넣지 않는다.
- 단위 테스트 작성은 흐름상 QA 담당이다. 단 L-1·L-2는 3.1절 이동 작업의 회귀 확인이므로 backend가 이동 작업과 같이 만든다(13장 BE-2).

## 5. API 계약

없음. Route Handler를 새로 만들지 않는다. 공공 API는 런타임에 호출하지 않는다(KASI 호출은 개발자가 로컬에서 돌리는 검증 스크립트뿐이다).

## 6. DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션이 없다.

## 7. 프론트 구조

### 7.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 | 비고 |
|---|---|---|---|
| `/no-son-days` | `src/app/no-son-days/page.tsx` (`NoSonDaysPage`) | 서버 컴포넌트, `export const revalidate = 3600` (ISR) | 요청 시점의 서버 한국 날짜로 오늘 상태와 처음 달(`getNoSonInitialMonth`) 달력을 HTML에 넣는다. 캐시가 자정·월말을 넘겨 낡을 수 있으므로 클라이언트가 마운트 후 다시 확인한다(7.3절) |
| `/no-son-days/[year]` | `src/app/no-son-days/[year]/page.tsx` (`NoSonDaysYearPage`) | 정적 생성. `generateStaticParams`는 2026~2049 24개, `export const dynamicParams = false` | 목록은 날짜와 상관없는 내용이라 빌드 때 한 번 만든다. 페이지 안에서도 `parseNoSonDaysYear`가 null이면 `notFound()`를 부른다(이중 확인) |
| 범위 밖 연도 (`/no-son-days/2025`, `/2050`, `/abc`) | 없음 | `dynamicParams = false`로 404 | 전역 `src/app/not-found.tsx`를 쓴다. 전용 not-found는 만들지 않는다 |

- 월별 주소는 만들지 않는다(기획). 쿼리 문자열로 달을 받지도 않는다.
- 운세 레이아웃(`src/app/fortune/layout.tsx`)의 동의 provider 밖이므로 운세 게이트가 붙지 않는다(기획 추천).

### 7.2 컴포넌트 트리

허브 `/no-son-days`

```
NoSonDaysPage (서버, app)
└ ContentWrapperComponent type=<D-1 그룹 키>
  ├ JsonLdComponent [BreadcrumbList]
  ├ NoSonDaysBreadcrumbComponent (서버)           홈 > 손 없는 날 달력
  ├ TitleWrapperComponent (h1 "손 없는 날 달력", description)
  ├ NoSonDaysDisclaimerNoticeComponent (서버)      h1 바로 아래, 항상 보임, 접지 않음
  └ NoSonDaysHubComponent (서버, hub/root)
    ├ NoSonDaysHubTodayCalendarComponent (클라이언트 컨테이너)
    │   props: serverToday: CalendarYmdType
    │   ├ NoSonDaysHubTodayStatusComponent (props: status)   오늘 판정 + 다음 손 없는 날(양력·요일·음력·남은 날수) 또는 "표시 범위 밖"
    │   └ NoSonDaysCalendarComponent (클라이언트, shared)     initialMonth = getNoSonInitialMonth(today), todayKey
    │       └ NoSonDaysCalendarGridComponent (props만)        이전·다음 버튼, 7열 칸
    ├ NoSonDaysYearLinksComponent (서버)            2026~2049 연도 링크
    ├ NoSonDaysRuleGuideComponent (서버)            규칙 설명 블록 (F-5)
    ├ AdFitSlotComponent (기존, 하단 1개, D-3 결과에 따름)
    └ NoSonDaysBottomNoticeComponent (서버)         하단 짧은 고지 + 출처 문구 (F-6)
```

연도 화면 `/no-son-days/[year]`

```
NoSonDaysYearPage (서버, app)
└ ContentWrapperComponent type=<D-1 그룹 키>
  ├ JsonLdComponent [BreadcrumbList]
  ├ NoSonDaysBreadcrumbComponent                   홈 > 손 없는 날 달력 > 2027년
  ├ TitleWrapperComponent (h1 "2027년 손 없는 날")
  ├ NoSonDaysDisclaimerNoticeComponent
  └ NoSonDaysYearComponent (서버, year/root)  props: year: NoSonYearType
    ├ NoSonDaysYearMonthListComponent (서버)       1~12월, 달마다 h2와 손 없는 날 목록(양력 날짜·요일·음력, 윤달은 "윤")
    ├ NoSonDaysCalendarComponent (클라이언트)       initialMonth = {year, 1}, todayKey 없음(마운트 후 오늘 칸만 표시)
    ├ NoSonDaysYearLinksComponent (현재 연도는 링크 대신 현재 표시) + 허브로 가는 링크
    ├ NoSonDaysRuleGuideComponent
    └ NoSonDaysBottomNoticeComponent
```

- 연도 화면의 달력은 기획 범위 21~25행("달 이동은 허브와 연도별 화면의 달력 안에서 한다")에 따라 둔다. 배치 순서(목록 위·아래)는 ui-ux가 정한다.
- 광고: 허브는 레이아웃 배너 + 하단 1개(최대 2개), 연도 화면은 레이아웃 배너 1개(D-3). 달력, 오늘·다음 손 없는 날 영역, 고지 문구 안이나 위에 광고를 넣지 않는다.
- 자바스크립트가 꺼져도 서버 HTML에 오늘 상태(허브), 처음 달 달력(허브는 `getNoSonInitialMonth` 결과, 연도는 1월), 12개월 목록(연도), 연도 링크, 규칙 설명, 고지가 남는다. 달 이동 버튼만 동작하지 않는다.
- 320px 폭 7열 배치, 칸 안 음력 표기 형식, 손 없는 날 칸의 색·글자 표시, 버튼 비활성 모양은 ui-ux가 정한다. 색만으로 구분하지 않고 글자(예: "손 없음")를 같이 넣는다(AC-2).

### 7.3 상태 위치

| 상태 | 위치 | 설명 |
|---|---|---|
| 서버 기준 오늘 | 서버 (`page.tsx`에서 `getKoreaYmd()`) | props `serverToday`로 클라이언트 컨테이너에 넘긴다 |
| 실제 오늘 (한국 날짜) | `use-korea-today.hook.ts` (허브 컨테이너) | 첫 렌더는 `serverToday`. 마운트 후 `getKoreaYmd()`로 다시 읽어 다르면 바꾼다. hydration 오류가 나지 않게 effect 안에서만 읽는다. 자정을 넘겨 계속 열어 두는 경우 타이머 갱신은 하지 않는다 |
| 오늘 상태(판정, 다음 손 없는 날) | 계산값 | `getNoSonTodayStatus(today)`를 렌더링 중에 계산한다. 상태로 저장하지 않는다 |
| 처음 달 | 계산값 | 허브는 `getNoSonInitialMonth(today)`, 연도 화면은 `{ year, month: 1 }`. 달 커서 훅의 초기값과 `sync-today`의 목표값으로 쓴다 |
| 달 커서와 "직접 이동했는지" | `use-calendar-month.hook.ts` (useReducer) | 액션은 `prev`, `next`, `sync-today` 세 개로 확정한다. `sync-today`는 허브에서만 보내며, 사용자가 아직 이동하지 않았을 때만 커서를 `getNoSonInitialMonth(새 오늘)`로 옮긴다. 연도 화면은 `sync-today`를 보내지 않는다. 범위 밖 이동은 `moveNoSonMonth`가 null이면 무시한다 |
| 보이는 달 데이터 | 계산값 | `buildNoSonMonth(cursor.year, cursor.month)`를 렌더링 중 계산한다 |
| 오늘 칸 표시(연도 화면) | 달력 컴포넌트 안 마운트 후 값 | 연도 화면은 정적 HTML이므로 오늘 칸 표시는 마운트 후에만 붙인다 |

- "이번 달로 돌아가기" 버튼은 만들지 않는다(UI 디자인 열린 질문 4번, 사용자 "추천대로" 승인). 커서를 처음 달로 되돌리는 액션(`reset` 등)을 추가하지 않으며, 위 상태 설계는 바뀌지 않는다. 처음 달로 돌아가는 방법은 새로고침 또는 연도 링크다.
- 월 이동 전환 효과는 없다(UI 디자인 열린 질문 1번, 빼는 안 승인). 이전·다음을 누르면 월 제목과 칸이 한 렌더에서 바로 바뀐다. `framer-motion`(`AnimatePresence` 등)과 CSS 애니메이션을 달력에 쓰지 않으므로 `motion-reduce:` 대체 처리도 필요 없다. 버튼의 기본 `transition-colors`는 shadcn 기본값 그대로다.
- React Query, zustand, Context는 쓰지 않는다. 서버 데이터 조회가 없다.
- 클라이언트 번들에 음력 표(131행, 수 KB)가 들어간다. 달 이동을 클라이언트에서 계산하기 위해 감수한다. 24년 288개월 결과를 미리 계산해 넘기는 방식은 HTML이 커지므로 쓰지 않는다.
- E2E에서 "오늘"을 고정하려면 Playwright `page.clock`으로 브라우저 시각을 정한다. 마운트 후 보정이 기기 시각을 따르므로 화면의 오늘 상태와 처음 달이 고정 시각 기준으로 바뀐다(QA 참고). 예: 2050-01-01로 고정하면 범위 밖 문구와 2049년 12월 달력, 다음 달 버튼 비활성이 보인다. 전환 효과가 없으므로 달 이동 뒤 별도 대기 없이 월 제목을 확인하면 된다.

## 8. SEO

| URL | title (초안) | description (초안) | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/no-son-days` | 손 없는 날 달력 - 이번 달 손없는날과 다음 손 없는 날 | 오늘이 손 없는 날인지, 다음 손 없는 날이 언제인지, 이번 달 손 없는 날이 양력 며칠인지 음력 날짜와 함께 확인하세요. 음력 날짜 끝자리가 9·0인 날을 기준으로 계산합니다. | BreadcrumbList (홈 > 손 없는 날 달력) | 등록. `MENU_LIST` 항목·그룹 주소로 자동 포함 |
| `/no-son-days/{year}` (2026~2049) | {year}년 손 없는 날 달력 - {year} 손없는날 월별 목록 | {year}년 1월부터 12월까지 손 없는 날(음력 9·10·19·20·29·30일)을 양력 날짜, 요일, 음력 날짜로 정리했습니다. 민간 풍습 기준의 참고용 달력입니다. | BreadcrumbList (홈 > 손 없는 날 달력 > {year}년 손 없는 날) | 등록 24개. `sitemap.ts`에 `getNoSonDaysYearPaths()` 결과를 추가 |

- 메타데이터는 두 화면 모두 `buildMetadata()`로 만든다. `pathname`은 `/no-son-days`, `/no-son-days/2027`처럼 `/`로 시작한다. title 뒤 사이트명은 루트 레이아웃 template이 붙인다.
- `ogImage`: 허브 `{ alt: '손 없는 날 달력' }`(tag는 메뉴 라벨 자동), 연도 `{ alt: '{year}년 손 없는 날 달력', tag: '손 없는 날' }`. 연도 주소는 `MENU_LIST`에 없어 `getOgTag`가 사이트명을 돌려주므로 tag를 직접 넘긴다.
- `keywords`: 허브 `손 없는 날, 손없는날, 손없는날 달력, 손없는날 계산, 음력 9일 10일 손없는날, 이사 날짜 손 없는 날`. 연도 `{year} 손없는날, {year}년 손 없는 날, {year} 손없는날 달력, 손 없는 날`. "택일", "건제12신", "황도길일"은 넣지 않는다(기획).
- 문구 최종안은 ui-ux·문구 단계에서 확정하고 `copy-log.md`에 남긴다. 배포 전 네이버 키워드 검색량 확인 결과에 따라 연도 title을 조정할 수 있다(기획 15번).
- h1은 화면마다 하나다. 달 이름(목록의 "1월" 등)은 h2, 규칙 설명 소제목은 h2 또는 h3로 둔다.
- 서버 HTML에 들어가는 것: 고지, 오늘 상태(허브, 캐시 시점 기준), 처음 보이는 달 달력(허브는 `getNoSonInitialMonth` 결과), 12개월 목록(연도), 연도 링크, 규칙 설명, 출처 문구 (AC-7). 클라이언트에서만 하는 것: 달 이동, 오늘 보정, 오늘 칸 표시.
- FAQPage JSON-LD는 넣지 않는다. 기획 AC-10은 BreadcrumbList만 요구한다.
- `comingSoon`은 두지 않는다(AC-10). 메뉴 등록과 함께 바로 색인 대상이 된다.
- 사이트맵 우선순위는 기존 함수대로 0.6이다.

## 9. 보안

- RLS: 해당 없음(테이블 없음).
- 시크릿·환경변수: 새 환경변수 없음. `NEXT_PUBLIC_` 노출 추가 없음. KASI 키(`DATA_GO_KR_API_KEY`)는 사용자가 로컬 셸에서 검증 스크립트를 돌릴 때만 쓰고, 런타임 코드와 저장소에 넣지 않는다. 고정값 JSON에도 키와 요청 URL을 넣지 않는다.
- 입력 검증: 사용자 입력란이 없다. 유일한 외부 값은 경로의 `[year]`이며 `generateStaticParams` + `dynamicParams = false`와 `parseNoSonDaysYear`(정규식 `^\d{4}$`, 2026~2049) 두 겹으로 막는다.
- XSS: 화면에 그리는 문자열은 코드 상수와 계산 숫자뿐이다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent` 외에 쓰지 않는다. JSON-LD 값도 상수와 연도 숫자뿐이다.
- API 남용(rate limit): API가 없어 해당 없음. 허브 ISR과 연도 정적 생성으로 요청마다 서버 계산이 돌지 않는다.
- 브라우저 저장소: 아무것도 저장하지 않는다. 민감정보가 없다.
- 외부 링크: 없음(제휴 링크, 이사업체·예식장 링크 없음, AC-12).

## 10. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 음력 표 데이터 | 한국천문연구원(KASI) 음양력 정보, 공공데이터포털 Open API (기존 운세 표 재사용, 2026-11-05 조회) | 포털 표시 이용범위 "제한 없음"(사용자 확인, `THIRD_PARTY_NOTICES.md` 51행) | 가능으로 보고 사용 중. 법률 검토는 받지 않았다(운세 기능에서 운영자 위험 수용, COMPLIANCE.md) |
| KASI 대조 표본(테스트 고정값) | 같은 API의 `getLunCalInfo` 응답 중 날짜 필드 | 위와 같음 | 런타임에 쓰지 않는 테스트 자료. 위와 같음 |
| 손 없는 날 개념, 날짜 계산 결과 | 민간 풍습, 계산된 사실 | 저작권 대상 아님(기획) | 가능 |
| 규칙 설명·고지 문장 | 이 서비스가 새로 쓴다 | 자체 저작 | 가능. 경쟁 사이트 문장·달력 표는 복사하지 않는다. 작성 기록은 `copy-log.md` |
| 외부 비교 출처 (tess9.com, ajd.co.kr, lifedestiny.co.kr) | 검증 기록에서 날짜 사실만 비교 | 해당 사이트 약관 | 화면에 쓰지 않는다. 날짜 사실만 내부 문서에 적는다 |
| 아이콘 `CalendarDays` | `lucide-react` (기존 의존성) | ISC | 가능. 새 의존성 아님 |
| 폰트 | 기존 Pretendard 그대로 | SIL OFL 1.1 (기존 기록) | 가능. 변경 없음 |
| 광고 | 카카오 AdFit (기존) | AdFit 운영 정책 | 점술·운세류 심사 기준과 같은 광고 단위 중복 게재 허용 여부는 확인 필요(배포 전, D-3) |

- 새 라이브러리, 폰트, 이미지 없음. `DEPENDENCY_LICENSES.md`는 바꾸지 않는다.
- 개인정보 처리: 없음. 입력, 전송, 저장이 없다. 사이트 전체 방문 통계는 기존 방침 범위(경로만 기록, 연도 주소에 개인 정보 없음).
- 법률 검토: 기획 12번 승인대로 받지 않고 운영자가 위험을 수용한다. 수용 항목은 COMPLIANCE.md에 적는다(11.3절). 표시광고법상 효과 암시 표현 금지는 금지 표현 검사(C-1)로 막는다.

## 11. 약관·방침·COMPLIANCE 추가 위치

### 11.1 이용약관 `src/app/terms/page.tsx`

- 위치: "10. 운빨 뽑기 서비스" 다음, "11. 광고 및 쿠키" 앞에 새 장 "11. 손 없는 날 달력 서비스"를 넣는다. 기존 11~20장은 12~21장이 된다(운빨 뽑기 추가 때와 같은 방식).
- 담을 요지(문장 최종안은 문구 단계): 손 없는 날은 음력 날짜 끝자리로 정하는 민간 풍습이며 과학적으로 검증되지 않았다. 달력 날짜는 음력 표를 바탕으로 계산한 참고용 결과이고 다른 달력과 다를 수 있다. 날짜를 고르고 결정하는 책임은 이용자에게 있다. 결과를 보장하지 않는다. 이사·예식·개업 업체와 관계가 없고 외부 사이트 링크를 두지 않는다. 입력받는 정보가 없다.
- 장 번호가 밀리면서 같이 고칠 곳:
  - `e2e/lucky-draw.spec.ts` 165행의 `^11\. 광고 및 쿠키$` → `^12\. 광고 및 쿠키$` (10장 운빨 뽑기 검사는 그대로)
  - `COMPLIANCE.md`의 약관 장 번호 언급: 운세 항목의 "Terms (chapter 14)" → 15, 운빨 뽑기 항목의 장 이동 설명 문장
- `EFFECTIVE_DATE`는 배포일에 다른 대기 기능과 한 번에 바꾼다(AC-11). 이 기능 작업에서 값을 먼저 바꾸지 않는다.

### 11.2 개인정보처리방침 `src/app/privacy/page.tsx`

- 위치: "1. 수집 항목 및 방법" 안, 꿈 해몽 문단(113~118행) 다음, 결과 공유 문단(119행) 앞에 문단 하나를 넣는다.
- 요지: 손 없는 날 달력에는 입력란이 없고 이용자에게서 받는 정보가 없다. 날짜 계산은 이용자의 브라우저와 서버에서 음력 표로만 하며, 어떤 값도 서버로 보내거나 브라우저 저장소(localStorage, sessionStorage, 쿠키)에 저장하지 않는다.
- "2. 브라우저 저장소 사용" 목록에는 추가하지 않는다(새 저장 키 없음).
- 시행일은 11.1절과 같이 처리한다.

### 11.3 `COMPLIANCE.md`

- "## 7) Robots and SEO" Actions 목록 끝(Compatibility 줄 다음)에 한 줄: 허브와 연도 화면 24개는 색인 대상이고 사이트맵에 있다. 날짜 목록과 규칙 설명은 서버 HTML에 있다. 범위 밖 연도는 404.
- "## 11) Disclaimers"에서 Lucky draw 항목 다음, Share 항목 앞에 "No-son days (`/no-son-days`, `/no-son-days/<2026-2049>`)" 항목을 넣는다. 담을 것: h1 바로 아래 상시 고지와 하단 고지(문구 위치 `no-son-days-notice.constant.ts`), 금지 표현 검사 파일, 입력·저장 없음, 운세 게이트 미적용 이유, 계산 기준(KASI 음력 표, 화면은 표 계산만, 출처 차이는 `docs/no-son-days/verification.md`), 공휴일·방위·택일 미제공, 제휴·업체 링크 없음, 광고 상한(D-3), 법률 검토 없음과 운영자 위험 수용 항목(민간 풍습 표현과 표시광고법, AdFit 점술 심사, 같은 광고 단위 중복 게재, KASI 약관 해석은 기존 수용 범위), 배포 전 확인(AdFit, 키워드 검색량, 시행일).
- `THIRD_PARTY_NOTICES.md` 51행: 표 경로를 새 위치로 바꾸고, 손 없는 날 달력도 같은 음력 표를 쓴다는 문장을 붙인다. 화면 출처 문구는 이 항목과 같은 출처명(한국천문연구원 음양력 정보, 공공데이터포털)을 쓴다.
- `README.md`: 88행 표 위치 갱신. 새 환경변수·API·테이블이 없으므로 다른 표는 바꾸지 않는다.

## 12. 메뉴 등록 (D-1 B안 기준)

| 파일 | 변경 |
|---|---|
| `src/constants/menu.constant.ts` | `MENU_GROUP_NAME_ENUM.NO_SON_DAYS = 'no-son-days'` 추가. `MENU_LIST`에 그룹 추가(꿈 해몽 다음, 로또 앞). 그룹 `{ group, label: '손 없는 날', href: '/no-son-days', items: [항목 1개] }`. 다른 기능 상수를 import하지 않고 값을 직접 적는다 |
| 항목 초안 | `href: '/no-son-days'`, `label: '손 없는 날 달력'`, `icon: 'CalendarDays'`, `colorClass: 'text-menu-no-son-days'`, `description: '음력 9·10·19·20·29·30일에 해당하는 손 없는 날을 양력 달력으로 확인.'`, `example: '예: 이사 날짜를 고르기 전에 이번 달 손 없는 날 확인'` (문구는 C-1 검사 대상) |
| `src/constants/menu-icon.constant.ts` | `CalendarDays` import와 `MENU_ICONS` 등록 |
| `src/types/menu.type.ts` | `MenuSectionKeyType`에 `'no-son-days'` 추가 |
| `src/constants/theme.constant.ts` | `SECTION_ICONS`(`CalendarDays`), `SECTION_ICON_COLOR`, `SECTION_BADGE_COLOR`, `BACKGROUND_COLORS`에 키 추가 |
| `src/constants/home.constant.ts` | `HOME_GROUP_DESCRIPTIONS`에 그룹 설명 추가(초안: "음력 끝자리 9·0일, 손 없는 날을 양력 달력으로 보기"). `HOME_TITLE`, `HOME_DESCRIPTION`은 바꾸지 않는다 |
| `src/app/globals.css` | `--menu-no-son-days` 색과 `--color-menu-no-son-days` 매핑 추가. 색 값은 ui-ux가 정한다(종이 배경 대비 4.5:1 이상) |
| `docs/conventions/design-system.md` | 메뉴 라벨 색 표에 한 줄 추가. 규칙 문서 변경이므로 사용자 승인 후 PM이 반영한다(agent는 고치지 못한다) |

- A안을 고르면: enum·타입·테마·globals.css·design-system.md 변경이 없고, 운세 그룹 `items`에 항목만 넣는다. 대신 운세 허브 목록에서 이 항목을 뺄지(`getFortuneHubItems` 수정), 홈 운세 그룹 설명, `unit/fortune/fortune-copy.test.ts` 검사 범위를 같이 정해야 한다.
- C안을 고르면: B안 표에서 키 이름만 `calendar`로 바뀐다.

## 13. 담당별 작업 순서

의존 순서: BE-1 → BE-2 → BE-3 → (FE-3, FE-4, FE-5). FE-1, FE-6은 BE와 같이 진행할 수 있다. FE-2는 D-1 결정과 ui-ux 색 결정 뒤에 한다. BE-4는 BE-2 뒤 언제든 되지만 사용자 실행이 필요하다.

- db: 없음.
- backend (화면 없는 공용·계산 코드):
  - BE-1. 음력 표·타입·JDN 공용 이동 (3.1절 1~7). 운세 유틸 2개, 생성 스크립트 2개, `unit/fortune/fortune-calendar.test.ts` import 한 줄, README·THIRD_PARTY_NOTICES 경로. 끝나면 `pnpm test unit/fortune`과 `verify.mjs --offline` 통과 확인.
  - BE-2. 공용 `src/lib/date.ts` 추가 함수와 `src/lib/lunar-calendar.ts` (3.2절). 단위 테스트 L-1, L-2, L-4.
  - BE-3. `no-son-days.type.ts`, `no-son-days-route.constant.ts`, `no-son-days.util.ts`(`getNoSonInitialMonth` 포함), `no-son-days-seo.util.ts` (3.3절). BE-3은 BE-2에 의존한다.
  - BE-4. `verify.mjs`에 `--from`, `--to`, `--out` 옵션 추가(4장). 사용자가 키로 실행해 `unit/shared/fixtures/kasi-lunar-2026-2049.json`을 만든다. 그 뒤 L-3 작성, `docs/no-son-days/verification.md` 작성(AC-13).
- frontend:
  - FE-1. 문구 상수: `no-son-days-notice`, `-guide`, `-seo`, `-view`, `-copy-rule` 상수와 `docs/no-son-days/copy-log.md`. 문구 최종안은 ui-ux-design.md를 따른다.
  - FE-2. 메뉴 등록(12장). D-1, ui-ux 색 결정 뒤.
  - FE-3. 허브 화면: `src/app/no-son-days/page.tsx`와 hub·shared 컴포넌트, 훅 두 개(7장). 달 커서 초기값과 `sync-today` 목표는 `getNoSonInitialMonth`를 쓴다. 전환 효과와 "이번 달로" 버튼은 만들지 않는다. BE-3, FE-1에 의존.
  - FE-4. 연도 화면: `src/app/no-son-days/[year]/page.tsx`와 year 컴포넌트. BE-3, FE-1, FE-3(shared 컴포넌트)에 의존.
  - FE-5. 사이트맵: `src/app/sitemap.ts`에 연도 경로 24개 추가. BE-3에 의존.
  - FE-6. 약관·방침·COMPLIANCE.md 문단(11장)과 `e2e/lucky-draw.spec.ts` 장 번호 한 줄.
- qa: U-1~U-10, C-1, `e2e/no-son-days.spec.ts`([E2E] AC-1~3, 모바일 `@smoke`는 허브 한 개). 전체 회귀는 마지막에 한 번.

## 14. 파일 충돌 위험

- `src/constants/menu.constant.ts`, `menu-icon.constant.ts`, `theme.constant.ts`, `home.constant.ts`, `src/types/menu.type.ts`, `src/app/globals.css`: 메뉴를 바꾸는 다른 기능과 겹친다. FE-2는 한 담당이 한 번에 고친다.
- `src/app/sitemap.ts`: 다른 기능도 경로를 추가하는 파일이다. FE-5는 한 블록만 추가한다.
- `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`: 장 번호가 밀리고 `EFFECTIVE_DATE`를 다른 대기 기능(공유, 뭐 먹지 지역 등)과 같이 바꾼다. 동시에 다른 기능이 장을 추가하면 번호가 충돌하므로 FE-6은 다른 약관 작업과 순서대로 한다.
- `e2e/lucky-draw.spec.ts`: 약관 장 번호 검사가 있다. FE-6과 같은 커밋에서 고친다.
- `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `README.md`: 여러 기능이 같이 고치는 문서다.
- `src/lib/date.ts`: 공용 파일이다. 지금 작업 트리에서 `src/lib/share-env.ts`, `src/hooks/use-share.hook.ts`가 수정 중이지만 `date.ts`는 아니다. 함수 추가만 하고 기존 두 함수는 바꾸지 않는다.
- `src/features/ad/components/adfit-slot.component.tsx`: 지금 작업 트리에서 수정 중이다. 이 기능은 이 파일을 고치지 않고 그대로 가져다 쓴다(`className` prop이 없으므로 간격은 감싸는 요소에 둔다).
- 운세 파일(`fortune-date.util.ts`, `fortune-lunar.util.ts`, `fortune-calendar.type.ts`, 음력 표 파일, `unit/fortune/fortune-calendar.test.ts`)과 `scripts/fortune-calendar/*.mjs`: BE-1·BE-4가 고친다. 운세 쪽 다른 작업과 동시에 하지 않는다.
- `src/features/no-son-days/shared/components/`: FE-3이 만들고 FE-4가 쓴다. FE-3과 FE-4는 순서대로 하거나 shared 컴포넌트를 FE-3에서 먼저 끝낸다.
