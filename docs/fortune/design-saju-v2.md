# fortune 설계서 보충: 사주 2단계 (design-saju-v2)

입력: `docs/fortune/plan.md`(809행, 4차 명확화 P1~P19 적용, S2-1~S2-11 추천안 확정, 사용자 승인 2026-11-09), `docs/fortune/design.md`(승인 2026-11-05, 이하 "기존 설계"), `docs/fortune/plan-saju-edits.md`, `docs/fortune/status.md`(세션 재개 안내), `docs/research/fortune-late-zi.md`(R-1), `docs/fortune/ui-ux-design.md` "사주 `/fortune/saju`" 절, `src/features/fortune/fortune-dev-guide.md`(참고만, 15장 추천 스택은 따르지 않음), 현재 코드(`src/features/fortune/`, `src/app/fortune/`, `src/constants/menu.constant.ts`, `e2e/fortune*.spec.ts`)
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
작성일: 2026-11-09
상태: 승인(2026-11-09, SQ-1~4 추천안 확정, 1959년 입춘 UTC+9 기준 판단 수락). 선택이 필요한 항목은 0.2의 SQ-1~SQ-4다.

이 문서는 기존 설계를 고치지 않고, 사주 2단계에서 **기존 설계와 달라지거나 새로 확정하는 점만** 적는다. 여기에 적지 않은 내용은 기존 설계를 그대로 따른다. 두 문서가 다르면 이 문서가 우선한다(승인 후). 절 번호 앞의 "기존 4.8" 같은 표기는 기존 설계의 절 번호다.

## 0. 요약

### 0.1 달라지는 점 한눈에

| 항목 | 기존 설계 | 이 문서 |
|---|---|---|
| 23시대 시주 천간(기존 D10, 4.9) | 미정. `same-day` 임시값, R-1 후 확정 | `next-day`로 확정(plan 결정 18). `same-day`는 비교 테스트용 내부 값으로만 남고 화면 문구·안내 상수는 만들지 않는다. 자시 통합 값은 만들지 않는다(V2) |
| 자시 시작, 표준시·서머타임(기존 4.8) | 23:00, 보정 안 함, 안내만 | 같음(plan 결정 19). 계산 기준 안내 항목을 AC-56 (1)~(6)으로 구체화(V3) |
| 입력 순서 | 사주 입력 흐름 미정(별도 훅만 예고) | 상태 머신 확정. 생년월일 → 연령 확인 → 태어난 시간(또는 모름) 순서를 추천(SQ-1, V4) |
| 경계일 두 후보(기존 4.8) | `need-choice`에 차트 두 개만 | 경계 종류(입춘=연주·월주 / 그 밖의 절기=월주)와 절기 시각을 함께 돌려준다(V1) |
| 점수(기존 4.6·4.7) | 십신 기본 점수 ± 5 | 변동 폭과 기본 점수 범위를 정한다. 추천: ±15, 기본 점수 60~69(SQ-2, V5) |
| 십신 문구 450문장(기존 5장) | 파일 목록만 | 데이터 구조·작성 순서·기본 점수표 위치 확정(V6) |
| 표준시·서머타임 안내 | 연도 1948~1961, 1987~1988 | 같음(S2-10). 1954~1961년 절기 표 기준시는 표 값으로 UTC+9 기준임을 설계 단계에서 확인(V7, 사용자 확인 요청) |
| 허브(기존 7.4, 13.1, 8.3) | 사주는 메뉴 추가로 자동 노출, 허브 설명은 세 운세 기준 | AC-88 처리: 허브 설명·FAQ를 네 운세 기준으로 개정, ItemList에 사주 항목, 메뉴 설명 문구 규칙(SQ-3, V8) |
| 사주 페이지 SEO(기존 13.1) | title·description 초안 | keywords를 S2-2로 확정("사주 4기둥" 제외), FAQ 5개, 출시 전 noindex 처리(SQ-4, V9) |
| 사주 화면 문구 위치 | `fortune-notice.constant.ts` | 새 파일 `fortune-saju-notice.constant.ts`로 분리(fortune-v2 미커밋 변경과 충돌 회피, V10) |

### 0.2 사용자 선택이 필요한 항목

| 번호 | 질문 | 추천 | 대안 |
|---|---|---|---|
| SQ-1 | 사주 입력 순서 | 안 B: 생년월일 입력 → 연령 확인 → 태어난 시간 입력(또는 모름). AC-46 "시각 입력칸은 연령 판정을 통과한 뒤에만 나온다"를 글자 그대로 지킨다 | 안 A: 승인된 UI 그대로 한 폼에 생년월일과 시간을 함께 받고 제출 후 연령 확인. AC-46을 사주에 예외로 두도록 plan 수정 필요 |
| SQ-2 | 오늘의 사주 운세 점수 변동 폭 | 안 A: 기본 점수 60~69, 날짜별 변동 ±15. 모든 십신·항목에서 상·중·하 세 구간이 모두 나와 450문장을 다 쓴다 | 안 B: 현재 코드 그대로 ±5, 기본 점수 50~85. 십신·항목마다 거의 한 구간만 나와 문구의 약 3분의 2가 쓰이지 않는다 |
| SQ-3 | 메뉴의 사주 항목 설명(`description`, `example`)에 "사주"를 쓸지 | 안 1: 쓰지 않는다. 라벨 "사주"만 쓰고 설명은 "태어난 연·월·일·시로 기둥을 세워 …" 식으로 쓴다. ItemList에 "사주"는 항목 이름에만 들어가 plan 용어 표(허브 행) 조건을 그대로 지킨다 | 안 2: 설명 첫머리에 `FORTUNE_SAJU_GLOSS`를 쓴다. ItemList는 `description`을 함께 넣으므로 plan 용어 표("ItemList의 사주 항목 이름에 한한다")를 고치거나 허브 ItemList 코드에서 사주 설명을 빼야 한다 |
| SQ-4 | 출시 전 `/fortune/saju` 페이지 노출 | 안 1: 개발 중 페이지에 `robots: { index: false, follow: false }`를 두고, 출시 티켓에서 메뉴 추가와 같은 변경으로 지운다 | 안 2: 페이지 파일을 출시 때까지 병합하지 않는다(브랜치 보관). noindex 처리가 필요 없지만 QA를 운영 빌드에서 미리 돌리기 어렵다 |

### 0.3 PM에게 올리는 문서 불일치 (설계에서 고치지 않음)

- plan 486행 검색 키워드에 "사주 4기둥"이 남아 있다. S2-2 확정 내용은 "사주 4기둥"을 빼고 "만세력 사주"로 바꾸는 것이다. 이 설계는 S2-2를 따른다. planner가 486행을 고쳐야 한다.
- SQ-1에서 안 A를 고르면 plan AC-46(사주 예외)과 AC-49 문구를 planner가 고쳐야 한다.
- SQ-3에서 안 2를 고르면 plan 용어 사용 규칙 표의 "허브의 사주 소개" 행을 planner가 고쳐야 한다.

## V1. 사주 계산 모듈 변경 (기존 3장 `fortune-saju.type.ts`, 4.8)

### V1.1 타입 (확정, 기존 3장 2단계 타입을 대체)

`src/features/fortune/types/fortune-saju.type.ts`. 개발 담당이 임의로 바꾸지 않는다.

```ts
import type {
  FortuneClockTimeType,
  FortuneElementType,
} from '@/features/fortune/types/fortune.type';

export type FortuneStemIndexType = number;   // 0 갑 ~ 9 계
export type FortuneBranchIndexType = number; // 0 자 ~ 11 해
export type FortunePillarType = Readonly<{ stem: FortuneStemIndexType; branch: FortuneBranchIndexType }>;

export type FortuneTenGodKeyType =
  | 'bigyeon' | 'geopjae' | 'siksin' | 'sanggwan' | 'pyeonjae'
  | 'jeongjae' | 'pyeongwan' | 'jeonggwan' | 'pyeonin' | 'jeongin';

/**
 * 23:00~23:59 출생의 시주 천간 기준(V2).
 * 'next-day'가 채택값이다. 'same-day'는 학파로 확인되지 않아 채택하지 않았고(plan 용어 정리),
 * 단위 테스트에서 두 값의 차이를 확인하는 데만 쓴다. 화면 문구·안내 상수에 쓰지 않는다
 */
export type FortuneLateZiStemBasisType = 'same-day' | 'next-day';

export type FortuneSajuChartType = Readonly<{
  year: FortunePillarType;
  month: FortunePillarType;
  day: FortunePillarType;
  /** 시간 모름이면 null */
  hour: FortunePillarType | null;
  /** 표에 보이는 글자(8자 또는 6자)의 오행 개수. 지지는 본래 오행으로 센다. 음양은 쓰지 않는다 */
  elements: Readonly<Record<FortuneElementType, number>>;
}>;

/** 경계일 정보. 입춘이면 연주·월주가, 그 밖의 절기(짝수 인덱스)면 월주만 갈린다 */
export type FortuneSajuBoundaryType = Readonly<{
  kind: 'year' | 'month';
  /** 절기 인덱스(짝수). 입춘은 2 */
  termIndex: number;
  /** 그날 절기 시각(KST 시계 시각) */
  time: FortuneClockTimeType;
}>;

export type FortuneSajuChartsResultType =
  | Readonly<{ kind: 'single'; chart: FortuneSajuChartType }>
  /** 경계일 + 시간 모름. charts[0] = 절기 전, charts[1] = 절기 후 */
  | Readonly<{
      kind: 'need-choice';
      boundary: FortuneSajuBoundaryType;
      charts: readonly [FortuneSajuChartType, FortuneSajuChartType];
    }>
  | Readonly<{ kind: 'unsupported' }>;

/** 천간 정보(사실 데이터) */
export type FortuneSajuStemInfoType = Readonly<{
  ko: string;      // '갑'
  hanja: string;   // '甲'
  element: FortuneElementType;
  isYang: boolean; // 천간 음양. 십신 판정에 쓴다
}>;

/** 지지 정보(사실 데이터). 지지 음양은 두지 않는다(plan 보정 3, AC-55) */
export type FortuneSajuBranchInfoType = Readonly<{
  ko: string;      // '자'
  hanja: string;   // '子'
  element: FortuneElementType;
}>;

export type FortuneSajuTenGodInfoType = Readonly<{
  name: string;    // '정재'
  hanja: string;   // '正財' (표시 여부는 ui-ux-design.md)
}>;
```

- 기존 3장과 다른 점: `FortuneSajuBoundaryType`, `FortuneSajuChartsResultType`(이름 붙은 결과 타입, `boundary` 필드 추가), 천간·지지·십신 정보 타입 추가. `FortuneLateZiStemBasisType`은 유지하되 의미를 "채택값 + 비교용"으로 바꾼다.

### V1.2 함수 (확정, 기존 4.8을 대체)

`src/features/fortune/utils/fortune-saju.util.ts`

```ts
/** (JDN + 49) mod 60. 절기 표를 쓰지 않는다(2029년 이후 오늘에도 동작) */
export function getDayPillar(solar: FortuneYmdType): FortunePillarType;
/** (y - 4) mod 60. adjustedYear는 입춘 기준 연도 */
export function getYearPillar(adjustedYear: number): FortunePillarType;
/** 오호둔. monthBranch 2(인)~1(축) */
export function getMonthPillar(yearStem: number, monthBranch: number): FortunePillarType;
/** 시계 시각 기준. 23:00~00:59 자(0), 01:00~02:59 축(1) … = floor(((hour + 1) % 24) / 2) */
export function getHourBranch(time: FortuneClockTimeType): number;
/**
 * 오서둔. 시간(時干) = ((기준 일간 % 5) * 2 + 시지) % 10.
 * time.hour === 23 이고 basis === 'next-day'이면 기준 일간 = (dayStem + 1) % 10. 그 밖은 dayStem
 */
export function getHourPillar(dayStem: number, time: FortuneClockTimeType, basis: FortuneLateZiStemBasisType): FortunePillarType;
/** 그날이 입춘 또는 다른 절기(짝수 인덱스)가 드는 날이면 경계 정보, 아니면 null. 그해 절기 표가 없으면 undefined */
export function getFortuneSajuBoundary(solar: FortuneYmdType): FortuneSajuBoundaryType | null | undefined;
/** 시간이 있으면 single(경계일이어도 분 단위 비교), 경계일 + 시간 모름이면 need-choice, 표 없음이면 unsupported */
export function buildFortuneSajuCharts(
  solar: FortuneYmdType, time: FortuneClockTimeType | null, basis: FortuneLateZiStemBasisType
): FortuneSajuChartsResultType;
/** 천간끼리. 같은 오행 비견·겁재, 일간이 생 식신·상관, 일간이 극 편재·정재, 일간을 극 편관·정관, 일간을 생 편인·정인. 음양 같으면 앞쪽(비견·식신·편재·편관·편인) */
export function getFortuneTenGod(dayStem: number, targetStem: number): FortuneTenGodKeyType;
export function countFortuneElements(chart: Omit<FortuneSajuChartType, 'elements'>): Readonly<Record<FortuneElementType, number>>;
/** 양력 환산 출생 연도가 FORTUNE_SAJU_DST_NOTICE_YEARS에 있고 시간을 넣었으면 true */
export function shouldShowFortuneDstNotice(solarYear: number, hasTime: boolean): boolean;
```

- 판정 규칙(기존 4.8 유지): 연주는 입춘 시각 이전이면 전년도, 월지는 짝수 인덱스 절기 시각으로 정한다. 비교는 "출생 시:분 ≥ 절기 시:분이면 절기 이후"(기존 4.1). 1월 소한 이전은 전년도 대설 이후 = 자월이고 1919년 표는 필요 없다(AC-91 1920-01-01 00:30).
- 경계일의 시간 입력: 23시대 출생이 경계일과 겹쳐도 연주·월주는 시계 시각과 절기 시각의 비교로만 정하고, 23시대 규칙은 시주 천간에만 적용한다(AC-56 2025-02-03 사례: 23:09 갑진년 축월·시주 갑자, 23:30 을사년 인월·시주 갑자).
- `getFortuneSajuBoundary`의 `undefined`는 표 범위 밖 방어 경로다. `buildFortuneSajuCharts`는 이 경우 `unsupported`를 돌려준다(기존 4.10).
- 오늘 일진은 `getDayPillar(parseDateKey(useKoreaDateKey 값))`이다. 접속 시각이 23시대여도 그날 일진이다(AC-54). 화면이 1분마다 날짜 키를 다시 읽으므로 자정을 넘기면 계미 → 갑신으로 바뀐다(기존 7.3).
- 2028-12-31 23:30 출생(AC-91)은 시주 천간에 `(dayStem + 1) % 10`만 쓰며 2029년 절기 표를 조회하지 않는다.

### V1.3 사실 상수 (`fortune-saju.constant.ts`, 확정)

| 상수 | 내용 |
|---|---|
| `FORTUNE_SAJU_STEMS: readonly FortuneSajuStemInfoType[]` (10) | 갑甲 목 양, 을乙 목 음, 병丙 화 양, 정丁 화 음, 무戊 토 양, 기己 토 음, 경庚 금 양, 신辛 금 음, 임壬 수 양, 계癸 수 음 |
| `FORTUNE_SAJU_BRANCHES: readonly FortuneSajuBranchInfoType[]` (12) | 자子 수, 축丑 토, 인寅 목, 묘卯 목, 진辰 토, 사巳 화, 오午 화, 미未 토, 신申 금, 유酉 금, 술戌 토, 해亥 수 |
| `FORTUNE_SAJU_TEN_GODS: Record<FortuneTenGodKeyType, FortuneSajuTenGodInfoType>` | 비견比肩, 겁재劫財, 식신食神, 상관傷官, 편재偏財, 정재正財, 편관偏官, 정관正官, 편인偏印, 정인正印 |
| `FORTUNE_SAJU_LATE_ZI_STEM_BASIS: FortuneLateZiStemBasisType = 'next-day'` | V2 |
| `FORTUNE_SAJU_DST_NOTICE_YEARS: readonly number[]` | 1948~1961, 1987, 1988 (S2-10, 연도 단위) |
| `FORTUNE_SAJU_SEED_PREFIX = 'fortune-v1\|saju'` | 시드 `${prefix}\|${일간 0~9}\|${KST 오늘}`(기존 4.6 그대로) |

- 이 파일에는 화면 문장을 두지 않는다. 화면 문장은 V10의 `fortune-saju-notice.constant.ts`에 둔다(문구 담당과 파일을 나누기 위해).
- 십신의 한 줄 설명은 문장이므로 V10 파일에 둔다(기존 1장 주석의 "십신 이름·한 줄 설명" 중 설명만 옮긴다).

## V2. 23시대 출생 처리 확정 (기존 D10, 4.9를 대체)

- `FORTUNE_SAJU_LATE_ZI_STEM_BASIS = 'next-day'`로 확정한다(plan 결정 18, 사용자 2026-11-06). 기존 4.9(4)의 "임시 `'same-day'`" 문장과 "R-1 확정 전 출시 금지" 조건은 해제된다.
- 정의: 일주는 한국 시간 자정에 바뀐다. 23:00~23:59 출생은 일주가 그날이고 시주 천간만 다음 날 일간으로 구한다. 00:00~00:59는 일주·시주 모두 그날이다. 시지는 두 구간 모두 자(子)다.
- 기존 4.9(4)의 `FORTUNE_SAJU_LATE_ZI_NOTICES: Record<FortuneLateZiStemBasisType, string>`는 만들지 않는다. 채택하지 않은 방식의 화면 문장을 작성·검수할 이유가 없다. 계산 기준 문장은 V3의 상수 하나로 둔다.
- 자시 통합(23시에 일주를 다음 날로 바꾸는 방식)은 값으로 만들지 않는다(미채택). "정자시", `same-day`, `next-day`는 화면·메타데이터 어디에도 쓰지 않는다(AC-56). 검사는 V10.3.
- `basis` 인자는 남긴다. 화면 코드는 항상 상수를 넘기고, 테스트만 두 값을 넘긴다(기존 4.8 원칙 유지).
- 일간·오늘의 사주 운세는 일주만 쓰므로 23시대 여부와 무관하다(AC-54 마지막 문장). 바뀌는 것은 시주 천간과 오행 분포 1자뿐이다.

## V3. 계산 기준 영역 (AC-56, F-19)

### V3.1 구성

- 사주 페이지의 계산 기준은 서버 컴포넌트 `FortuneCalcBasisComponent`로 그린다(JS를 끈 서버 HTML에 있어야 한다, AC-56). 기존 컴포넌트의 항목 키에 사주 키를 더한다.

```ts
// calc-basis.component.tsx (확정)
export type FortuneCalcBasisItemKeyType =
  | 'tti' | 'star-sign' | 'time-unknown' | 'dst'               // 기존
  | 'saju-pillars' | 'saju-day-hour' | 'saju-schools'          // 사주 (1)(2)(3)
  | 'saju-zi-start' | 'saju-no-correction' | 'saju-time-unknown' // 사주 (4)(5), 시간 모름
  | 'saju-statement';                                           // 사주 (6)
```

- 사주 페이지의 `items` 순서(확정): `saju-pillars`, `saju-day-hour`, `saju-schools`, `saju-zi-start`, `saju-no-correction`, `saju-time-unknown`, `saju-statement`. 지원 출생 연도 문장은 기존처럼 컴포넌트가 항상 마지막에 붙인다.
- 기존 키(`tti`, `star-sign`, `time-unknown`, `dst`)와 1단계 페이지의 `items` 값은 바꾸지 않는다.

### V3.2 문장 (초안. 최종 문장은 문구 담당 C-S3이 쓰고 사용자가 승인한다)

| 키 | 상수 (`fortune-saju-notice.constant.ts`) | 초안 | AC-56 |
|---|---|---|---|
| `saju-pillars` | `FORTUNE_SAJU_CALC_BASIS_PILLARS` | 연주는 입춘 시각, 월주는 절기가 드는 시각을 기준으로 나눕니다. 입춘이나 절기가 드는 날에 태어나셨는데 태어난 시간을 모르시면 두 경우를 함께 보여 드립니다. | (1) |
| `saju-day-hour` | `FORTUNE_SAJU_CALC_BASIS_DAY_HOUR` | 일주는 한국 시간 자정에 바뀝니다. 시주는 시계 시각으로 정하며 23:00부터 00:59까지를 자시로 봅니다. 23:00~23:59(야자시)에 태어나셨다면 일주는 그날로 두고 시주의 천간만 다음 날 일간으로 구합니다. | (2) |
| `saju-schools` | `FORTUNE_SAJU_CALC_BASIS_SCHOOLS` | 23시대 출생을 처리하는 방식은 학설이 갈립니다. 23시에 일주를 다음 날로 바꾸는 방식(자시 통합)을 쓰는 만세력도 있지만 이 서비스는 그 방식을 쓰지 않으므로, 23시대에 태어나신 분은 다른 만세력과 일주나 시주가 다를 수 있습니다. | (3) |
| `saju-zi-start` | `FORTUNE_SAJU_CALC_BASIS_ZI_START` | 이 서비스는 자시를 시계 시각 23:00부터 봅니다. 23:30부터 보는 만세력도 있어, 시주가 바뀌는 시각의 앞뒤 30분 안에 태어나신 분은 결과가 다를 수 있습니다. | (4) |
| `saju-no-correction` | `FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION` | 태어난 곳의 경도, 출생 당시의 표준시와 서머타임은 보정하지 않고 입력하신 시각 그대로 계산합니다. 1948~1961년과 1987~1988년에 태어나신 분께는 결과 화면에서 한 번 더 안내합니다. | (5) |
| `saju-time-unknown` | `FORTUNE_SAJU_TIME_UNKNOWN_NOTICE` | 태어난 시간을 모르시면 시주 없이 연·월·일 기둥만 보여 드립니다. 오늘의 사주 운세는 일간으로 정하므로 시간을 모르셔도 볼 수 있습니다. | AC-89 시간 모름 안내 |
| `saju-statement` | `FORTUNE_SAJU_CALC_BASIS_STATEMENT` | 계산과 해석의 기준은 학파마다 다르며, 위 내용은 이 서비스의 기준입니다. | (6) |

- 작성 조건: "23:00~23:59"를 먼저 쓰고 "야자시"는 괄호 풀이로 한 번만 쓴다. "정자시", "정통", "정확한", `same-day`, `next-day`를 쓰지 않는다(S2-3, AC-56). 연도 숫자(1948~1961, 1987~1988)는 `FORTUNE_SAJU_DST_NOTICE_YEARS`에서 만든다.
- 결과 화면의 표준시 안내(AC-57)는 기존 `FORTUNE_DST_NOTICE`(plan 고지 15)를 그대로 쓴다. 기둥 표 바로 아래, 해당 연도 + 시간 입력일 때만 보인다. 계산은 입력 시각 그대로다.
- 이 문장들은 copy-log 기록 대상이다(AC-60).

## V4. 입력 흐름 (기존 7.2의 "사주는 별도 훅" 확정)

### V4.1 추천안 B의 상태 머신 (`saju/hooks/use-saju-flow.hook.ts`, useReducer)

```ts
type FortuneSajuFlowStateType =
  | Readonly<{ step: 'input'; error: FortuneBirthErrorType | null }>
  | Readonly<{ step: 'age-blocked' }>                                   // 입력값을 남기지 않는다
  | Readonly<{ step: 'time'; solar: FortuneYmdType; isFromLunar: boolean }>   // 연령 통과 후 시간 입력
  | Readonly<{ step: 'choose'; solar: FortuneYmdType; isFromLunar: boolean }> // 경계일 + 시간 모름
  | Readonly<{
      step: 'done';
      solar: FortuneYmdType;
      isFromLunar: boolean;
      time: FortuneClockTimeType | null;
      /** need-choice에서 고른 후보. 0 절기 전, 1 절기 후. 고를 필요가 없었으면 null */
      candidate: 0 | 1 | null;
    }>;

type FortuneSajuFlowActionType =
  | Readonly<{ type: 'SUBMIT'; input: Partial<FortuneBirthInputType>; today: FortuneYmdType }>
  | Readonly<{ type: 'SUBMIT_TIME'; time: FortuneClockTimeType }>
  | Readonly<{ type: 'TIME_UNKNOWN' }>
  | Readonly<{ type: 'CHOOSE'; candidate: 0 | 1 }>
  | Readonly<{ type: 'RESET' }>;
```

| 상태 | 액션 | 처리 | 다음 상태 |
|---|---|---|---|
| input | SUBMIT | `resolveFortuneBirth` 오류 | input(error) |
| | | 만 나이 < 14 | age-blocked |
| | | `getFortuneSajuBoundary(solar) === undefined`(표 없음, 방어) | input(`out-of-table`) |
| | | 그 밖 | time |
| time | SUBMIT_TIME | `buildFortuneSajuCharts(solar, time, BASIS)`가 single | done(time, candidate null) |
| time | TIME_UNKNOWN | 결과가 single | done(time null, candidate null) |
| | | 결과가 need-choice | choose |
| choose | CHOOSE | | done(time null, candidate) |
| age-blocked 외 전부 | RESET | | input(error null) |
| 어디서든 | 결과가 unsupported | | input(`out-of-table`) |

- 차트는 상태에 넣지 않는다. `done`·`choose` 화면이 렌더링 중 `buildFortuneSajuCharts`로 다시 계산한다(값으로 계산할 수 있는 것은 상태로 만들지 않는다).
- 시간 검증은 0~23시, 0~59분 형식만 본다. 오늘 날짜에 현재보다 늦은 시각을 넣어도 막지 않는다(S2-9). 실제로 오늘 출생은 연령 확인에서 막힌다.
- `age-blocked`는 기존과 같다(다시 입력 버튼 없음, 홈 링크만).
- 입력값·시간·후보는 이 훅의 state에만 있다(기존 7.1, 9장).

### V4.2 안 A(한 폼)를 고를 때의 차이

- `time` 단계가 없고 SUBMIT에 `time: FortuneClockTimeType | null`이 함께 온다. 처리 순서는 resolve → 연령 → build. 나머지는 같다.
- 승인된 UI(ui-ux-design 사주 절)와 같다. 대신 plan AC-46의 "시각 입력칸은 연령 판정을 통과한 뒤에만 나온다"를 사주에서 예외로 두는 plan 수정이 필요하다(0.3).

### V4.3 공용 컴포넌트 재사용

- 생년월일: `FortuneBirthFormComponent` 그대로(`submitLabel`만 사주용 값). 변경 없음.
- 태어난 시간: `FortuneBirthTimeFormComponent`를 재사용하되, 지금 고정된 라벨("태어난 시각", "시각 반영", "시각 모름")을 사주에서는 "태어난 시간" 계열로 바꿀 수 있게 선택 prop을 하나 더한다. 기본값은 지금 문구와 같아 1단계 화면은 바뀌지 않는다.

```ts
// birth-time-form.component.tsx에 추가 (확정)
texts?: Readonly<Partial<{ title: string; help: string; submit: string; unknown: string }>>;
```

- 후보 선택: `FortuneCandidateChoiceComponent<'0' | '1'>` 재사용. 라벨은 `boundary.kind`가 `year`면 "연주 {간지}로 보기", `month`면 "월주 {간지}로 보기"(ui-ux-design 사주 절). 위에 확정 불가 안내 한 줄(`FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE`, V10). 정답 표시 없음.
- 결과: `FortuneReadingComponent`에 `methodNotice={FORTUNE_METHOD_B_NOTICE}`(기존 상수), `FortuneLuckyComponent` 그대로(로또 고지 AC-87).

## V5. 오늘의 사주 운세 점수 (기존 4.6, 4.7, S2-4)

### V5.1 공통 (확정)

- 시드: `fortune-v1|saju|${일간}|${KST 오늘}`(기존 그대로). 같은 일간이면 같은 날 같은 결과(AC-90).
- 문구 풀: 그날 십신의 `FORTUNE_SAJU_POOLS[tenGod]`. 요약·조언·주의는 기존 공통 풀 `FORTUNE_COMMON_POOL`(사주 단어 없음)을 쓴다.
- 점수: `buildFortuneReading({ ..., baseScores: FORTUNE_SAJU_BASE_SCORES[tenGod] })`. 난수 순서는 기존 4.7 그대로(기본 점수 경로는 항목마다 난수 1개).
- 행운 요소: 기존 4.7 그대로(난수로 오행 선택). 사주용 규칙을 따로 만들지 않는다(plan에 없음).
- 구간: 75~95 상, 55~74 중, 30~54 하(기존).

### V5.2 SQ-2 비교

변동 = `round((r - 0.5) × 폭)`. 지금 코드는 `BASE_SCORE_SPREAD = 10`(±5)이다. 이 경로는 사주만 쓰므로 바꿔도 1단계 결과는 바뀌지 않는다.

| | 안 A (추천) | 안 B (현재 코드) |
|---|---|---|
| 변동 폭 | ±15 (`BASE_SCORE_SPREAD = 30`) | ±5 (`10`) |
| 기본 점수 범위 | 모든 십신·항목 60~69. 총운은 십신 사이 차이 6 이하(예: 61~66) | 총운 60~66, 항목 50~85 |
| 구간 노출 | 기본 점수가 60~69이면 상(75 이상)과 하(54 이하)에 모두 닿는다. 450문장이 모두 쓰인다 | 예: 정재 재물 기본 80이면 75~85로 늘 상. 십신·항목마다 대부분 한 구간만 나와 약 300문장이 쓰이지 않는다. 총운은 늘 중 구간 |
| 같은 십신의 반복 | 10일마다 같은 십신이 와도 구간과 변형이 바뀐다 | 10일마다 같은 구간, 변형 3개만 돈다(S2-1이 피하려던 반복) |
| 항목별 강약 | 기본 점수 차이(최대 9점)와 문구 내용으로 약하게 드러난다 | 점수 차이로 강하게 드러난다 |
| S2-4 원칙 | 특정 십신이 늘 좋은 날·나쁜 날이 되지 않음 충족 | 총운은 충족, 항목은 십신마다 고정 |
| "소폭 변동" 표현 | ±15라 S2-4의 "소폭"보다 넓다 | 맞음 |

- 어느 안이든 수치(`FORTUNE_SAJU_BASE_SCORES`)는 문구 담당이 샘플과 함께 초안을 내고 사용자가 검수한다(S2-4).
- 테스트(확정): 모든 기본 점수가 고른 안의 범위 안에 있다. 10일 연속이면 십신 10개가 한 번씩 나온다. 7일 연속 총운이 모두 같지 않다. 점수는 30~95 정수다(AC-90). 안 A면 "십신·항목마다 연속 300일 모의 결과에 세 구간이 모두 나온다"를 더한다.

## V6. 십신 문구 450문장 데이터 구조 (기존 5장, S2-1)

### V6.1 파일과 타입 (확정)

| 파일 | 내용 | 작성 |
|---|---|---|
| `constants/pools/saju/<bigyeon\|geopjae\|siksin\|sanggwan\|pyeonjae\|jeongjae\|pyeongwan\|jeonggwan\|pyeonin\|jeongin>.constant.ts` | 파일마다 `FORTUNE_SAJU_POOL_<KEY>: FortuneCategoryPoolType`(항목 5 × 구간 3 × 변형 3 = 45문장) | 문구 담당 |
| `constants/pools/saju-pools.constant.ts` | `FORTUNE_SAJU_POOLS: Readonly<Record<FortuneTenGodKeyType, FortuneCategoryPoolType>>` 합본, `FORTUNE_SAJU_BASE_SCORES: Readonly<Record<FortuneTenGodKeyType, Readonly<Record<FortuneCategoryKeyType, number>>>>` | 합본은 FE 뼈대, 점수 값은 문구 담당 초안 + 사용자 검수 |

- 기존 띠·별자리 풀과 같은 형식(`as const satisfies FortuneCategoryPoolType`)이라 변형·구간·항목 누락은 컴파일에서 막힌다. 새 타입은 없다.
- 작성 이력은 데이터에 넣지 않고 `docs/fortune/copy-log.md`에 둔다(기존 5장).
- 사주 풀은 방식 B 화면 전용이다. 풀 문장 안에 "사주"는 쓰지 않는 것을 기본으로 한다(결과 문구는 오늘 하루에 대한 문장이고, 사주 표기는 고지 4와 화면 제목이 맡는다). "사주 풀이", "평생", "타고난 운명"처럼 원국 풀이로 읽히는 표현은 쓰지 않는다(plan 결정 11).
- 십신은 "오늘 일진 천간과 내 일간의 관계"를 하루 분위기로 옮긴 문장이다. 십신 이름의 전통적 길흉을 단정하지 않는다(편관·겁재·상관 날도 불안 유발 표현 없이 행동 조언으로 끝낸다, AC-39·AC-90).

### V6.2 작성 순서 (확정, plan 콘텐츠 제작 원칙 2단계)

1. 샘플: 3개 십신(추천: 비견, 정재, 편관. 같은 오행·재성·관성으로 성격이 다른 셋) 135문장 + 기본 점수표 초안 + 십신 한 줄 설명 10개 → 사용자 검수·톤 확정.
2. 나머지 7개 십신 315문장.
3. 유사 문장 점검: 십신 묶음 20문장 이상 웹 검색 샘플(plan 유사 문장 절차), 계산 기준·사주 FAQ·가이드 10문장 이상. 결과를 copy-log에 기록(AC-60).
4. 금지 표현 검사(V10.3) 통과.

## V7. 표준시·서머타임 안내와 1954~1961년 절기 기준시 (S2-10, S2-11)

- 안내 범위와 방식은 기존과 같다(연도 단위, 안내만, 계산은 시계 시각 그대로).
- S2-11 설계 단계 확인 결과: 저장소의 `solar-term-table.constant.ts` 1959년 입춘 값은 `2042242`(2월 4일 22:42)다. R-1 12장 질문 4의 해설 값은 127.5도 기준 22:13, 135도(UTC+9) 환산 22:43이다. 표 값은 UTC+9 환산값과 1분 차이, 127.5도 값과 29분 차이이므로 KASI 표는 UTC+9 기준으로 판단한다.
  - 따라서 절기 표 보정이나 계산 기준 문장 추가는 필요 없다고 본다. 이 판단의 근거는 해설 한 곳(단일 출처)이다.
  - 사용자 확인 요청: 이 판단을 받아들이면 S2-11의 "API 재호출"은 하지 않고, backend-dev가 `docs/fortune/calendar-verification.md`에 대조 기록(1959 입춘 값, 해설 두 값, 판단, 단일 출처 한계)만 남긴다(BE-S1). 받아들이지 않으면 기존 S2-11대로 사용자가 키로 재호출한다.
- 서머타임 기간표(R-1 5.1, 한국어 위키 단일 출처)는 코드에 넣지 않는다. 연도 목록만 쓰므로 위키 표의 CC BY-SA 조건과 관계가 없다.

## V8. 허브 갱신과 AC-88 처리 (기존 7.4, 8.3, 13.1, F-26)

### V8.1 노출 스위치 (기존 유지)

- 사주 노출은 여전히 `MENU_LIST` 운세 그룹에 항목 하나를 넣는 것으로 한다. 넣는 순간 허브 목록(서버 HTML), 헤더·모바일 메뉴, sitemap, 허브 ItemList에 함께 나타난다. 별도 플래그는 없다.
- 항목(확정): `href: \`/${MENU_GROUP_NAME_ENUM.FORTUNE}/saju\``, `label: '사주'`, `colorClass: 'text-menu-fortune'`, 그룹 안 마지막(별자리 운세 다음). `icon`은 ui-ux-designer가 정하고, `MENU_ICONS`에 없으면 `menu-icon.constant.ts`에 lucide-react 아이콘을 하나 더한다.
- `description`, `example`: SQ-3. 안 1(추천)이면 "사주"를 쓰지 않는다. 초안: description "태어난 연·월·일·시로 기둥을 세우고 오늘의 일진과 비교.", example "예: 태어난 시간을 몰라도 연·월·일 기둥으로 확인". 이 두 문장은 PC 메뉴 드롭다운에서 모든 페이지에 보일 수 있으므로 방식 A 페이지 검사에도 걸리지 않아야 한다.
- 허브 페이지 코드(`src/app/fortune/page.tsx`, `hub/components/root.component.tsx`)는 바꾸지 않는다. ItemList는 지금처럼 `name`(라벨), `url`, `description`을 넣는다. 안 1이면 ItemList의 "사주"는 사주 항목 이름에만 있다.

### V8.2 허브 설명·FAQ 개정 (S2-7, 확정 범위)

| 대상 | 변경 | 작성 |
|---|---|---|
| `FORTUNE_HUB_GUIDE` 제목 "세 가지 운세의 차이" | 네 운세를 담는 제목으로 바꾼다(초안: "운세 종류와 차이") | C-S3 |
| 단락 1 첫 문장 "운빨연구소의 운세는 세 가지입니다." | 개수를 넷으로 고치거나 개수 표현을 뺀다. 이 단락에는 "사주"를 쓰지 않는다 | C-S3 |
| 단락 2 "세 운세 모두 …" (화이트리스트 문장) | "오늘의 운세, 띠별 운세, 별자리 운세는 … 문구를 고르는 방식이며, 사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산하는 방식과는 다릅니다." 취지로 바꾼다. 화이트리스트의 옛 문장은 지우고 새 문장을 넣는다 | C-S3 |
| 새 단락(사주 소개) | 첫 "사주"를 `FORTUNE_SAJU_GLOSS`로 시작한다. 초안: "사주(태어난 연·월·일·시로 세우는 네 기둥)는 만세력으로 연·월·일·시 기둥과 오행 분포를 계산하고, 내 일간과 오늘의 일진을 비교한 오늘의 사주 운세를 보여 드립니다. 태어난 시간을 모르셔도 시주 없이 보실 수 있고, 23시대 출생 처리 같은 계산 기준은 사주 페이지에서 확인하실 수 있습니다." 화이트리스트 등록 | C-S3 |
| `FORTUNE_HUB_FAQ` | 질문 1개 추가: "사주는 다른 운세와 무엇이 다른가요?" 답의 첫 "사주"는 `FORTUNE_SAJU_GLOSS`. 초안: "사주(태어난 연·월·일·시로 세우는 네 기둥)는 만세력으로 연·월·일·시 기둥을 실제로 계산하고, 내 일간과 오늘의 일진을 비교해 결과를 보여 드립니다. 오늘의 운세, 띠별 운세, 별자리 운세는 만세력 계산 없이 서비스가 정한 규칙에 따라 미리 작성해 둔 문구를 고릅니다." 화이트리스트 등록 | C-S3 |
| `FORTUNE_HUB_SEO`(title, description, keywords, ogImageAlt, heading, headerDescription), Breadcrumb | 바꾸지 않는다(S2-7). headerDescription은 세 운세를 열거하지만 "세 가지"라고 말하지 않으므로 AC-88에 걸리지 않는다 | - |
| 오늘의 운세·띠별·별자리 페이지 | 바꾸지 않는다. 사주 링크를 넣지 않는다(S2-7) | - |

- 허브 FAQPage JSON-LD는 화면 FAQ와 같은 상수라 새 FAQ가 함께 들어간다. 화면 허용 문장과 같으므로 허용된다(기존 8.3 표).
- 허브 FAQ·가이드는 승인 문구(U-1)를 바꾸는 것이므로 사용자 승인이 필요하다.

### V8.3 "사주" 위치 규칙 변경 (기존 8.3 표에 행 추가, 확정)

| 위치 | "사주" |
|---|---|
| 허브 가이드의 사주 소개 단락, 방식 구분 단락 | 허용. 화이트리스트 문장만. 첫 "사주"는 `FORTUNE_SAJU_GLOSS` |
| 허브 FAQ "사주는 다른 운세와 무엇이 다른가요?" 질문과 답 | 허용. 질문 문장은 화이트리스트에 등록하고, 답의 첫 "사주"는 `FORTUNE_SAJU_GLOSS` |
| 허브 ItemList | 사주 항목 `name`("사주")만 허용(SQ-3 안 1) |
| 메뉴 라벨 "사주"(헤더·모바일 메뉴·허브 목록, 모든 페이지) | 허용(기존 "사주 페이지로 가는 링크·메뉴 라벨") |
| 메뉴 설명·예시 | 안 1: "사주" 금지. 안 2: 화이트리스트 문장만 |

- 질문 문장 "사주는 다른 운세와 무엇이 다른가요?"는 괄호 설명 없이 "사주"로 시작한다. 기존 8.3 규칙 4("단독으로 처음 나오는 문장이 없다")의 예외로, 이 질문 한 문장만 등록한다. 바로 뒤 답의 첫머리에 괄호 설명이 붙는다. 이 예외가 싫으면 질문을 "다른 운세와 사주(태어난 연·월·일·시로 세우는 네 기둥)는 무엇이 다른가요?"처럼 바꾸는 것도 가능하다(문구 승인 때 사용자가 고른다).

## V9. 사주 페이지 SEO (기존 13.1, F-27, AC-89)

| URL | title | description | JSON-LD | sitemap |
|---|---|---|---|---|
| `/fortune/saju` | 사주 만세력 - 생년월일시로 보는 무료 사주와 오늘의 사주 운세 (기존 유지) | 생년월일과 태어난 시간으로 사주(태어난 연·월·일·시로 세우는 네 기둥)와 오행 분포를 계산하고, 오늘의 일진과 비교한 오늘의 사주 운세를 보여 드립니다. 계산 기준도 함께 안내합니다. 오락·참고용 콘텐츠입니다. (기존 유지) | BreadcrumbList(홈 > 운세 `/fortune` > 사주 `/fortune/saju`), FAQPage(`FORTUNE_SAJU_FAQ`) | 출시 티켓의 `MENU_LIST` 항목 추가로 자동 등록(우선순위는 `sitemap.ts` 기존 규칙) |

- `FORTUNE_SAJU_SEO`(확정, `fortune-seo.constant.ts`에 추가)
  - heading: "사주"
  - headerDescription(초안): "사주(태어난 연·월·일·시로 세우는 네 기둥)를 만세력으로 계산하고, 오늘의 일진과 비교한 오늘의 사주 운세를 보여 드립니다."
  - keywords(S2-2 확정): 사주, 무료 사주, 사주 만세력, 만세력 사주, 오늘의 사주 운세. "사주 4기둥", "사주 네 기둥", "사주 풀이"는 넣지 않는다.
  - ogImageAlt: "연·월·일·시 기둥과 오늘의 사주 운세"(기존 유지), `tag` 생략(메뉴 라벨 "사주").
  - pathname: `FORTUNE_ROUTES.saju`.
- 서버/클라이언트: 페이지는 서버 컴포넌트. 서버 HTML에 h1, 상시 면책, 입력 영역 안내, noscript, 가이드(첫 언급 괄호 설명, 사용법, 오늘의 운세와의 차이), 계산 기준(V3), FAQ, 결과 하단 면책·상담전화, 상세 이용 안내가 있다. 기둥 표·십신·점수·문구는 동의 후 클라이언트에서만 그린다(기존 D3, D5, AC-89).
- `FORTUNE_SAJU_FAQ`(질문 5개 확정, 답은 C-S3)
  1. 사주란 무엇인가요? (답 첫머리 `FORTUNE_SAJU_GLOSS`)
  2. 태어난 시간을 모르면 어떻게 되나요?
  3. 계산 기준은 무엇인가요?
  4. 23시 이후에 태어났으면 어떻게 계산하나요?
  5. 평생 운이나 성격도 알 수 있나요? (답: 오늘의 사주 운세만 제공하고 원국 풀이는 하지 않는다)
- `FORTUNE_SAJU_GUIDE`(구성 확정, 본문 C-S3): "사주와 만세력"(괄호 설명 첫 언급), "이용 방법"(생년월일 → 연령 확인 → 시간 또는 모름 → 기둥 표 → 오늘의 사주 운세), "오늘의 운세와의 차이"(방식 A·B 차이). 가이드 + 계산 기준 + FAQ를 합쳐 한국어 약 600자 이상.
- SQ-4 안 1이면 개발 중 `page.tsx`의 metadata는 `{ ...buildMetadata(...), robots: { index: false, follow: false } }`이고, 출시 티켓 FE-S7이 `robots`를 지운다. AC-89 검사는 출시 상태에서 한다.

## V10. 화면 문구 상수와 검사 (기존 8.1~8.3)

### V10.1 새 파일 `constants/fortune-saju-notice.constant.ts` (확정)

사주 화면 전용 문장을 모은다. 기존 `fortune-notice.constant.ts`는 고치지 않는다(fortune-v2 T-3의 미커밋 변경이 있는 파일이고, 1단계 승인 문구 파일이라 diff를 만들지 않는다). 사주에서 쓰는 기존 상수(`FORTUNE_SAJU_GLOSS`, `FORTUNE_METHOD_B_NOTICE`, `FORTUNE_DST_NOTICE`, `FORTUNE_SCORE_NOTICE` 등)는 import해서 쓴다.

| 상수 | 내용 |
|---|---|
| `FORTUNE_SAJU_CALC_BASIS_*`, `FORTUNE_SAJU_TIME_UNKNOWN_NOTICE` | V3.2 |
| `FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS: Record<FortuneTenGodKeyType, string>` | 십신 한 줄 설명 10개(합니다체, AC-54) |
| `FORTUNE_SAJU_PANEL_TEXTS` | 패널 제목(생년월일 입력 / 태어난 시간 / 연·월·일·시 기둥 / 오행 분포), 버튼 라벨, 시간 폼 `texts`(V4.3), "일간", "천간", "지지", "시간 모름" 칸 글자, 오늘 일진·내 일간·십신 라벨, 결과 공지(sr) |
| `FORTUNE_SAJU_TIME_QUESTION_TEXT` | 시간 단계 안내. 초안: "시주를 구하려면 태어난 시간이 필요합니다. 모르시면 '시간 모름'을 고르셔도 연·월·일 기둥과 오늘의 사주 운세를 보실 수 있습니다." |
| `FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE` | 경계일 안내. `{절기}`, `{기둥}`(연주와 월주 / 월주)을 바꿔 쓴다. 초안: "이 날은 {절기}이 드는 날이라 태어난 시간을 모르면 {기둥}를 하나로 정할 수 없습니다. 두 경우를 함께 보여 드립니다." |
| `FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES` | "연주 {간지}로 보기", "월주 {간지}로 보기" |
| `FORTUNE_SAJU_ELEMENTS_NOTE` | "표에 보이는 글자의 오행 개수를 센 것이며 좋고 나쁨을 뜻하지 않습니다."(S2-5) |
| `FORTUNE_SAJU_SOLAR_TERM_NAMES` | 짝수 인덱스 절기 이름 12개(소한, 입춘, 경칩, 청명, 입하, 망종, 소서, 입추, 백로, 한로, 입동, 대설). 사실 데이터지만 화면 글자라 여기 둔다 |

- 화면 컴포넌트 파일 안에 사용자 노출 문자열을 하드코딩하지 않는다(문구 검사 대상에서 빠지지 않게). 오늘의 운세 panel처럼 파일 안 상수로 두는 기존 방식은 사주에서는 쓰지 않는다.

### V10.2 `fortune-copy-rule.constant.ts` 변경 (확정)

- `FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A`: 옛 허브 문장 "세 운세 모두 …"를 빼고, V8.2의 새 방식 구분 문장, 사주 소개 단락 문장, 허브 FAQ 질문·답 문장을 넣는다(사용자 승인 문구만).
- 새 상수 `FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS`(사주 페이지 전용 추가 금지): "정확한", "AI", "정자시", "same-day", "next-day", "평생 운을 알려". 기존 `FORTUNE_FORBIDDEN_TERMS`의 "정통", "전문가 수준", "AI 분석", "AI가"는 그대로 적용된다(AC-56, AC-58).
- 사주 페이지 대상에서만 "사주 분석", "사주분석"을 금지 목록에서 뺀다(기존 8.2 예외 (2) 유지). 이번 문구는 "사주 분석"을 쓰지 않아도 된다(허용일 뿐 필수 아님). "사주 풀이", "사주풀이", `FORTUNE_SAJU_REDUNDANT_TERMS`, `FORTUNE_INTERNAL_PILLAR_TERMS`는 사주 페이지에도 금지다(AC-52, AC-89).
- 화이트리스트와 금지 목록은 문구 담당(C-S3)이 사용자 승인 문구를 넣을 때만 바꾼다. 개발 담당이 검사를 통과시키려고 늘리지 않는다(기존 8.3).

### V10.3 검사 대상 추가 (`e2e/fortune-copy.spec.ts`)

- 사주 풀 450문장, `FORTUNE_SAJU_BASE_SCORES` 범위, `fortune-saju-notice.constant.ts` 전부, `FORTUNE_SAJU_SEO`, `FORTUNE_SAJU_FAQ`, `FORTUNE_SAJU_GUIDE`, `/fortune/saju` 서버 HTML(메타데이터·JSON-LD 포함), 동의 후 결과 DOM.
- 허브: 개정된 가이드·FAQ·ItemList가 V8.3 규칙을 지키는지, "세 가지"·"세 운세"가 허브 설명·FAQ에 없는지(AC-88).
- 메뉴: 사주 항목 라벨만 "사주"를 포함(SQ-3 안 1). 지금 `fortune-copy.spec.ts` 869행의 "메뉴에 사주 없음" 검사는 출시 상태 기준으로 바뀐다.

## 폴더 구조

기존 1장에서 사주 관련 줄만 바뀐다. 새 파일은 (신규), 고치는 기존 파일은 (수정).

```
src/app/fortune/
  saju/page.tsx                                 # (신규) FortuneSajuPage, 서버. SQ-4 안 1이면 출시 전 noindex

src/constants/
  menu.constant.ts                              # (수정, 출시 티켓만) 운세 그룹에 사주 항목 추가
  menu-icon.constant.ts                         # (수정, 필요할 때만) 사주 아이콘

src/features/fortune/
  types/
    fortune-saju.type.ts                        # (신규) V1.1
  constants/
    fortune-saju.constant.ts                    # (신규) V1.3 사실 상수
    fortune-saju-notice.constant.ts             # (신규) V10.1 사주 화면 문장
    fortune-seo.constant.ts                     # (수정) FORTUNE_SAJU_SEO 추가
    fortune-faq.constant.ts                     # (수정) FORTUNE_SAJU_FAQ 추가, FORTUNE_HUB_FAQ 1개 추가
    fortune-guide.constant.ts                   # (수정) FORTUNE_SAJU_GUIDE 추가, FORTUNE_HUB_GUIDE 개정
    fortune-copy-rule.constant.ts               # (수정) V10.2
    pools/saju/<십신 10개>.constant.ts           # (신규) 각 45문장
    pools/saju-pools.constant.ts                # (신규) 합본 + 기본 점수표
  utils/
    fortune-saju.util.ts                        # (신규) V1.2
    fortune-reading.util.ts                     # (수정, SQ-2 안 A일 때만) BASE_SCORE_SPREAD 10 → 30
  shared/components/
    calc-basis.component.tsx                    # (수정) 사주 항목 키(V3.1)
    birth-time-form.component.tsx               # (수정) 선택 prop texts(V4.3)
  saju/
    components/
      root.component.tsx                        # (신규) 'use client'. FortuneSajuComponent: 게이트 + panel 지연 로드
      panel.component.tsx                       # (신규) 'use client'. FortuneSajuPanelComponent: 흐름별 화면 조립
      pillars.component.tsx                     # (신규) FortuneSajuPillarsComponent: 기둥 표(한글·한자, 일간 강조, 시간 모름 칸)
      elements.component.tsx                    # (신규) FortuneSajuElementsComponent: 오행 분포 + 안내 한 줄
      ten-god.component.tsx                     # (신규) FortuneSajuTenGodComponent: 오늘 일진·내 일간·십신·한 줄 설명
      guide.component.tsx                       # (신규) 서버. FortuneSajuGuideComponent (기존 주석 "사주 네 기둥 설명"은 쓰지 않는다)
    hooks/
      use-saju-flow.hook.ts                     # (신규) V4.1

docs/fortune/
  copy-log.md                                   # (수정) 십신·사주 문구·계산 기준 기록(AC-60)
  calendar-verification.md                      # (수정) V7 대조 기록
  ui-ux-design.md                               # (수정) ui-ux-designer 갱신

e2e/
  fortune-saju.spec.ts                          # (신규) 사주 브라우저 테스트(AC-49~57, 59, 87, 89~91)
  fortune-calc.spec.ts                          # (수정) 사주 순수 함수
  fortune-copy.spec.ts                          # (수정) V10.3
  fortune.spec.ts                               # (수정, 출시 후) AC-65·AC-80 → AC-88
```

- `scripts/fortune-calendar/`는 바꾸지 않는다(V7 판단을 받아들이는 경우).
- `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/*`, `src/app/fortune/page.tsx`, `hub/components/root.component.tsx`, `src/components/layout/*`, `fortune-notice.constant.ts`, 1단계 화면 폴더(`today/`, `tti/`, `star-sign/`)는 고치지 않는다.

## 데이터 저장 위치

기존 9장과 같다. 새로 생기는 데이터만 적는다.

| 데이터 | 위치 | 이유 |
|---|---|---|
| 천간·지지·십신 정보, 절기 이름, 서머타임 안내 연도, 23시대 기준 상수 | 코드 상수 (`fortune-saju.constant.ts`, `fortune-saju-notice.constant.ts`) | 모두에게 같은 사실·설정 값 |
| 십신 문구 450문장, 기본 점수표, 사주 고지·계산 기준·FAQ·가이드 | 코드 상수 (`pools/saju/`, `fortune-saju-notice.constant.ts` 등) | 개발 중 작성·검수한 정적 문구(plan 결정 3) |
| 태어난 시간, 시간 모름 선택, 경계일 후보 선택 | 메모리(`useSajuFlow` state)만 | plan 결정. 서버·브라우저 저장소·URL·분석 이벤트 금지 |
| 기둥 표, 오행 개수, 십신, 점수·문구 | 렌더링 중 계산 | 입력 + 날짜로 언제든 같은 값(AC-90) |
| 이용 동의 | 기존 sessionStorage 키 그대로 | 사주 방문으로 버전이 바뀌지 않는다(AC-87, S2-8). 동의 문구·버전 변경 없음 |
| localStorage, IndexedDB, 쿠키, Supabase | 쓰지 않음 | 해당 데이터 없음 |

## API 계약

없음. 기존 10장과 같다. 사주 계산도 정적 표와 순수 함수로 브라우저에서 끝나고 런타임 KASI 호출이 없다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| 없음 | | | | |

## DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션 모두 없다.

## 프론트 구조

- 페이지 (서버/클라이언트 구분): `/fortune/saju`는 서버 컴포넌트(`src/app/fortune/saju/page.tsx`). 클라이언트 경계는 `saju/components/root.component.tsx` 하나이고, panel은 `next/dynamic(..., { ssr: false })`로 동의 후에만 내려받는다(기존 D5). 십신 풀·달력 표·사주 계산 함수는 panel 쪽에서만 import한다.
- 컴포넌트 트리:

```
FortuneSajuPage (서버, /fortune/saju)
└ ContentWrapperComponent type="fortune"
  ├ JsonLdComponent [jsonLdBreadcrumb(홈 > 운세 > 사주), jsonLdFaq(FORTUNE_SAJU_FAQ)]
  ├ TitleWrapperComponent title="사주" description=headerDescription   ← 유일한 h1
  ├ FortuneDisclaimerNoticeComponent                                    (서버)
  ├ FortuneInputNoticeComponent                                         (서버)
  ├ FortuneNoscriptNoticeComponent                                      (서버)
  ├ FortuneSajuComponent ('use client', root)
  │  └ FortuneConsentGateComponent
  │     └ granted: FortuneSajuPanelComponent (next/dynamic, ssr:false)
  │        ├ step input:       FortuneBirthFormComponent (+ FortuneLunarConfirmComponent)
  │        ├ step age-blocked: FortuneAgeBlockedComponent
  │        ├ step time:        FortuneBirthTimeFormComponent texts=사주용 (SQ-1 안 B)
  │        ├ step choose:      경계 안내 + FortuneCandidateChoiceComponent (연주/월주 {간지}로 보기)
  │        └ step done:
  │           ├ FortuneSajuPillarsComponent      (기둥 표, 시간 모름 칸)
  │           ├ FORTUNE_DST_NOTICE               (해당 연도 + 시간 입력일 때만, AC-57)
  │           ├ FortuneSajuElementsComponent     (오행 분포 + 안내 한 줄)
  │           ├ FortuneSajuTenGodComponent       (오늘 일진·내 일간·십신·한 줄 설명)
  │           ├ FortuneReadingComponent methodNotice=FORTUNE_METHOD_B_NOTICE
  │           └ FortuneLuckyComponent            (로또 고지 + 링크)
  ├ FortuneResultNoticeComponent                                        (서버, 상담전화 5곳)
  ├ FortuneSajuGuideComponent                                           (서버)
  ├ FortuneCalcBasisComponent items={사주 7개 키}                        (서버, V3)
  ├ FortuneFaqComponent items={FORTUNE_SAJU_FAQ}                        (서버)
  ├ FortuneDetailNoticeComponent                                        (서버)
  └ FortuneConsentResetComponent                                        ('use client', granted일 때만)
```

- 상태 위치:

| 상태 | 위치 | 방식 |
|---|---|---|
| 흐름 단계·양력 날짜·시간·후보 | `useSajuFlow` (`saju/hooks/`) | useReducer (V4.1) |
| 생년월일 폼 값 | `FortuneBirthFormComponent`의 react-hook-form | 메모리 |
| 시간 폼 초안 | `FortuneBirthTimeFormComponent` 로컬 state | 메모리 |
| KST 날짜 키 | `useKoreaDateKey` | 기존 |
| 차트, 오행 개수, 오늘 일진, 십신, 점수·문구, 표준시 안내 여부 | 렌더링 중 계산 | 상태 아님 |
| 이용 동의 | 기존 `FortuneConsentProvider` | 기존 |

- 한자 글꼴: 새 웹폰트 없음(기존 12.2). 모바일 4열과 한자 대체 글꼴 확인은 ui-ux-designer 몫(S2-5).

## SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/fortune/saju` | V9 | V9 | BreadcrumbList, FAQPage | 예 (출시 티켓의 `MENU_LIST` 항목 추가로 자동) |
| `/fortune` (허브) | 변경 없음 | 변경 없음 | BreadcrumbList 변경 없음, ItemList에 사주 항목 자동 추가, FAQPage에 질문 1개 추가 | 변경 없음 |
| `/fortune/today`, `/fortune/tti`, `/fortune/star-sign` | 변경 없음 | 변경 없음 | 변경 없음 | 변경 없음 |

- 렌더링 구분, keywords, FAQ, noindex 처리는 V9. 허브 규칙은 V8.
- AC-65·AC-80은 1단계 출시 상태 기준이다. 사주 출시 후에는 AC-88이 대신한다(sitemap에 `/fortune/saju` 있음).
- URL은 기존 확정(`/fortune/saju`)이라 redirect 없음.

## 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 새 환경변수 없음. `NEXT_PUBLIC_` 추가 없음. V7 판단을 받아들이면 `DATA_GO_KR_API_KEY`를 이번에 쓰지 않는다.
- 입력 검증: 생년월일은 기존 zod + `resolveFortuneBirth`. 시간은 정수 0~23시, 0~59분(기존 시각 폼). 오늘 날짜의 늦은 시각은 막지 않는다(S2-9). 성별·출생지·이름 입력칸 없음(AC-49).
- XSS: 모든 문구·간지는 React 텍스트로만 렌더링한다. JSON-LD에는 정적 상수만 넣는다. 입력값·간지·십신을 JSON-LD·`document.title`에 넣지 않는다.
- 데이터 유출 방지(기존 14장 그대로 사주에 적용): 생년월일·시간·나이·간지·십신을 URL, `console.*`, 오류 메시지, aria-live 공지, 저장소, 분석·알림 이벤트에 넣지 않는다. 결과 공지(sr)는 "결과를 표시했습니다" 수준으로 쓰고 간지를 읽지 않는다. 시드 문자열에는 일간 번호만 들어가고, 이것도 어디로도 보내지 않는다.
- API 남용 방지: API가 없어 rate limit 없음.
- 브라우저 저장소: 새 키 없음. 기존 동의 키(동의 여부·버전·동의 시각)만.

## 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 천간·지지·오행·십신 규칙, 오호둔·오서둔, 육십갑자 | 일반 이론(사실 정보) | 보호 대상 아님 | 가능 |
| 23시대 처리·학설 구분 | 일반 학설 용어(R-1 9장). 조사 문서의 문장은 옮기지 않고 새로 쓴다 | 보호 대상 아님 | 가능 |
| 서머타임 안내 연도 목록 | 사실 정보(연도만). 위키 기간표는 넣지 않는다 | 보호 대상 아님 | 가능 |
| 24절기 표(1954~1961 포함) | KASI 공공데이터(기존) | 이용허락범위 "제한 없음" | 가능(기존 판단 유지, 약관 전문은 위험 수용) |
| 십신 문구 450문장, 사주 고지·계산 기준·FAQ·가이드, 허브 개정 문구 | 자체 작성(AI 초안 + 사용자 검수) | 자체 저작물(AI 작성물 권리 귀속 불명확, 위험 수용) | 가능. 유사 문장 샘플 점검(V6.2) |
| 기본 점수표 | 자체 규칙 | 자체 | 가능 |
| 사주 메뉴 아이콘 | lucide-react(기존 의존성) | ISC | 가능. 새 의존성 없음 |
| 한자 표시 | 시스템 글꼴 대체(배포 안 함) | 해당 없음 | 가능 |
| 외부 만세력 라이브러리(manseryeok 등) | 쓰지 않음. 코드 참조도 하지 않음 | - | - |

- 개인정보 처리: 서버 수집·전송 없음. 태어난 시간도 메모리에서만 쓴다. 개인정보처리방침은 이미 "생년월일과 태어난 시각"을 적고 있어 문구 변경은 필요 없을 것으로 본다(DOC-S1에서 확인만).
- `DEPENDENCY_LICENSES.md`: 변경 없음. `THIRD_PARTY_NOTICES.md`: 새 외부 자산이 없으면 변경 없음(아이콘은 lucide 기존 기재). 출시 때 운세 절의 "사주 미공개" 같은 표기가 있으면 고친다.
- 법률 확인: 새로 필요한 항목은 없다. 기존 위험 수용 목록(방식 표기 오인, AI 문구 권리, KASI 약관 전문)을 사주에도 그대로 적용한다.

## 담당별 작업 순서

번호 앞 S는 사주 2단계 티켓. 화살표는 의존 순서다.

- 메인 세션
  1. M-S0 착수 전: fortune-v2(T-3 `fortune-notice.constant.ts`, T-4·T-5 finder) 변경과 `menu.constant.ts` 등 작업 트리의 미커밋 변경을 사용자가 commit했는지 확인한다(파일 충돌 방지).
  2. M-S1 `docs/fortune/status.md` 갱신(이 설계 승인, SQ-1~SQ-4 답, V7 판단).
- planner (필요할 때만)
  1. DOC-S2 plan 486행 키워드 정정(S2-2). SQ-1 안 A, SQ-3 안 2를 고르면 해당 plan 문구 수정.
- ui-ux-designer (개발 준비 전)
  1. UI-S1 `ui-ux-design.md` 사주 절 갱신: 입력 순서(SQ-1), 시간 폼 라벨, 경계 안내·후보 버튼, 오행 안내 한 줄, 십신 묶음, 모바일 4열·한자 대체 글꼴 재확인, 허브 사주 행 아이콘과 설명(SQ-3), 계산 기준 영역 배치. 사용자 승인.
- db: 없음.
- backend
  1. BE-S1 `docs/fortune/calendar-verification.md`에 V7 대조 기록. 코드·스크립트 변경 없음. (V7 판단을 받아들이지 않으면 기존 S2-11대로 스크립트로 1959년 재조회, 사용자 실행)
- frontend (frontend-dev, 이 문서 + 기존 설계 + `ui-ux-design.md` 기준)
  1. FE-S1 뼈대: `fortune-saju.type.ts`, `fortune-saju.constant.ts`(V1.3 값 확정), `fortune-saju-notice.constant.ts`(키만, 문장 자리), `pools/saju/*`·`saju-pools.constant.ts` 구조, `FORTUNE_SAJU_SEO`(V9 값), `FORTUNE_SAJU_FAQ`·`FORTUNE_SAJU_GUIDE` 자리. (M-S0 이후)
  2. FE-S2 `fortune-saju.util.ts`(V1.2), SQ-2 안 A면 `fortune-reading.util.ts`의 폭 상수. (FE-S1 이후)
  3. FE-S3 `use-saju-flow.hook.ts`(V4.1 또는 V4.2). (FE-S2 이후)
  4. FE-S4 공용 변경: `calc-basis.component.tsx` 키 추가, `birth-time-form.component.tsx` `texts` prop. 1단계 화면 출력이 바뀌지 않아야 한다. (FE-S1 이후, FE-S2와 병렬 가능)
  5. FE-S5 사주 화면 컴포넌트(root, panel, pillars, elements, ten-god, guide). (FE-S3, FE-S4, UI-S1 이후)
  6. FE-S6 `src/app/fortune/saju/page.tsx`(SQ-4 안 1이면 noindex 상태). (FE-S5 이후)
  7. FE-S7 출시: `MENU_LIST` 사주 항목(+ 필요하면 `MENU_ICONS`), 사주 페이지 noindex 제거. (C-S4, QA-S1~S3 통과, 사용자 출시 승인 이후. 다른 기능의 메뉴 작업과 동시에 하지 않는다)
- content (AI 초안 + 사용자 검수, 담당은 dev-lead가 정한다)
  1. C-S1 십신 샘플 3개(V6.2) + 기본 점수표 초안(SQ-2 범위) + 십신 한 줄 설명 10개 → 사용자 검수. (FE-S1 이후)
  2. C-S2 나머지 십신 7개. (C-S1 이후)
  3. C-S3 사주 화면 문장(V10.1), 계산 기준(V3.2), 사주 FAQ 답·가이드 본문, 허브 가이드·FAQ 개정(V8.2), 화이트리스트·사주 금지어(V10.2), 메뉴 설명·예시(SQ-3). 사용자 승인. (FE-S1 이후, C-S1과 병렬)
  4. C-S4 유사 문장 점검, `copy-log.md` 갱신(AC-60). (C-S2, C-S3 이후)
- qa
  1. QA-S1 `e2e/fortune-calc.spec.ts`: 사주 순수 함수(AC-50, 51, 53~57, 90, 91 사례, 기존 17.1 사주 행, 23시대 `same-day`/`next-day` 비교, 경계일 `boundary.kind`, 기본 점수 범위). (FE-S2 이후)
  2. QA-S2 `e2e/fortune-copy.spec.ts`: V10.3. (C-S4 이후)
  3. QA-S3 `e2e/fortune-saju.spec.ts`(신규): 출시 전 상태에서 사주 페이지 직접 접속으로 AC-49~57, 59, 87, 89(noindex 제외), 91을 데스크톱·모바일로 검사. (FE-S6 이후)
  4. QA-S4 출시 후: `e2e/fortune.spec.ts`의 AC-65·AC-80 검사를 AC-88 기준으로 바꾸고, 사주 메뉴 라벨을 방식 A 페이지 "사주" 검사의 허용 항목에 넣는다. AC-89 noindex 확인, 1단계 회귀. (FE-S7 이후)
- 문서 (메인 세션, 루트 문서는 agent 범위 밖)
  1. DOC-S1 출시 때: `README.md` 15행("아직 공개하지 않습니다" 제거, 사주 설명), `COMPLIANCE.md` 77행·125행·11장(사주 공개, 방식 B 안내, 계산 기준·표준시 안내 위치), `THIRD_PARTY_NOTICES.md` 확인, `src/app/terms/page.tsx` 운세 장에 사주가 포함되는지 확인(필요하면 FE가 수정). (FE-S7과 같은 묶음)

## 파일 충돌 위험

- `src/features/fortune/constants/fortune-notice.constant.ts`: fortune-v2 T-3이 미커밋 상태로 고쳤다. 사주는 이 파일을 고치지 않고 새 파일 `fortune-saju-notice.constant.ts`를 쓴다(V10.1). 그래도 import만 하므로 fortune-v2 변경이 먼저 commit되어야 한다(M-S0).
- `src/features/fortune/tti/components/finder.component.tsx`, `star-sign/components/finder.component.tsx`: fortune-v2 T-4·T-5 범위. 사주는 고치지 않는다.
- `src/constants/menu.constant.ts`, `menu-icon.constant.ts`: 작업 트리에 미커밋 변경이 있다(`git status` M). 모든 기능이 같이 쓰므로 FE-S7 한 작업에서만, 다른 메뉴 작업이 끝난 뒤 고친다. 메뉴에 항목을 넣는 순간 허브·메뉴·sitemap·ItemList가 함께 바뀌므로 문구 검수(C-S4)와 QA-S3 전에는 넣지 않는다.
- `fortune-faq.constant.ts`, `fortune-guide.constant.ts`, `fortune-seo.constant.ts`, `fortune-copy-rule.constant.ts`, `pools/saju/**`, `fortune-saju-notice.constant.ts`: FE-S1(뼈대)과 C-S1~C-S3(문구)이 같은 파일을 고친다. FE-S1을 먼저 끝내고, 이후에는 문구 담당만 문구 필드·화이트리스트를 고친다. 허브 FAQ·가이드는 1단계 승인 문구라 사용자 승인 없이 바꾸지 않는다.
- `src/features/fortune/utils/fortune-reading.util.ts`: 1단계 세 화면이 같이 쓴다. FE-S2만 고치고, 바꾸는 것은 기본 점수 경로의 폭 상수 하나뿐이다. 1단계 결과가 같은지 QA-S1이 회귀 확인한다.
- `shared/components/calc-basis.component.tsx`, `birth-time-form.component.tsx`: 1단계 네 페이지가 같이 쓴다. FE-S4만 고치고, 기존 키·기본 라벨의 출력은 바꾸지 않는다.
- `e2e/fortune.spec.ts`, `fortune-copy.spec.ts`, `fortune-calc.spec.ts`: QA만 고친다. 출시 전(QA-S1~S3)과 출시 후(QA-S4)로 나눠, 출시 전에는 1단계 출시 상태 검사(AC-65, AC-80, 메뉴에 사주 없음)를 그대로 둔다. 사주 브라우저 테스트는 새 파일 `e2e/fortune-saju.spec.ts`에 둬 기존 파일과 겹침을 줄인다.
- `docs/fortune/ui-ux-design.md`: UI-S1만. `docs/fortune/copy-log.md`: 문구 담당만. `docs/fortune/calendar-verification.md`: BE-S1만. `docs/fortune/plan.md`: DOC-S2(planner)만. 기존 `docs/fortune/design.md`는 고치지 않는다(이 문서가 보충).
- `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`: 작업 트리에 다른 기능의 미커밋 변경이 있다(`git status` M). DOC-S1은 그 변경이 commit된 뒤 출시 묶음에서 한 번에 고친다.
- `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/app/fortune/page.tsx`, `src/app/fortune/layout.tsx`, `hub/components/root.component.tsx`, `src/components/layout/*`, `src/lib/*`, `next.config.ts`, `package.json`, `.claude/hooks/*`: 수정하지 않는다.
