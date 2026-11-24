# lunch 설계서

입력: `docs/lunch/plan.md` (승인 2026-11-19), `docs/lunch/status.md`, `supabase/migrations/0003_restaurants.sql`
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`
참고 구조: `docs/tarot/design.md`(형식), `src/app/api/lotto/export/route.ts`(rate limit), `src/features/lotto/services/lotto.repository.ts`(Supabase 사용 방식), `next.config.ts`(보안 헤더), `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`
작성일: 2026-11-19
상태: 설계 완료, 승인 대기. 15장 PM 결정 D1~D9와 16장 열린 질문에 답이 필요하다.

`src/features/lunch/lunch-dev-guide.md`(A안·B안 초안)의 카카오 로컬 API, 날씨 연동, 5km 반경, 평점·리뷰, 상황별 추천, 위치 거부 시 이용 불가 정책은 따르지 않는다. 이 설계서와 `plan.md`가 우선한다.

## 0. 요약

- 화면은 `/lunch/today` 한 페이지다. 페이지는 서버 컴포넌트이고 설명·고지·FAQ·JSON-LD는 서버 HTML에 넣는다. 룰렛과 가게 목록만 클라이언트 컴포넌트다.
- 반경 검색은 PostGIS 없이 bbox(위경도 사각형) 조건과 하버사인 거리 계산으로 한다. 인덱스는 `(category, lat, lng)` 복합 btree 하나로 바꾼다. 확장 설치, 컬럼 추가, 테이블 재작성이 없어서 무료 플랜 500MB 안에서 용량이 오히려 조금 줄어든다(4장).
- 업태 그룹 16개는 원본 `category` 값과 1:1이다. 그룹 컬럼을 새로 만들지 않고, 그룹 키와 원본 값의 매핑을 코드 상수로 둔다.
- DB 변경은 새 마이그레이션 `0004_lunch_search.sql` 하나다. 0003은 고치지 않는다. 내용은 인덱스 교체, RPC 함수 2개, 익명 읽기 차단(공개 읽기 정책 삭제)이다.
- API는 `POST /api/lunch/restaurants` 하나다. 좌표는 URL이 아니라 요청 본문으로 보내고, 브라우저에서 소수 셋째 자리(약 100m)로 반올림한 값만 보낸다. 서버는 좌표를 로그·DB·응답에 남기지 않는다.
- 위치 거부·실패 시 지역 선택(시·도, 시·군·구)은 적재 데이터의 주소에서 미리 만든 코드 상수를 쓴다. 각 시·군·구의 "가게가 가장 많은 약 1km 격자 중심"을 대표 지점으로 두고 같은 반경 검색을 한다.
- 룰렛은 그룹 균등 확률이다. 가중치를 두지 않는다. 위치가 정해진 뒤에는 반경 안에 가게가 1곳 이상 있는 업태만 다시 뽑기 후보로 쓴다(5.3).
- 룰렛 화면 요소는 점심 도메인을 모르는 공용 컴포넌트 `src/components/common/roulette.component.tsx`로 만든다. 결과는 부모가 정하고 컴포넌트는 연출만 한다(D6).
- 새 라이브러리, 새 환경변수, 지도 API 키는 없다.
- 현재 `next.config.ts`의 `Permissions-Policy: geolocation=()` 때문에 브라우저 위치 기능이 사이트 전체에서 막혀 있다. `/lunch/today`에서만 `geolocation=(self)`로 연다(D8).

## 1. 폴더 구조

```
src/app/lunch/today/page.tsx              # 수정: ComingSoon → 실제 페이지 (서버)
src/app/api/lunch/restaurants/route.ts    # 신규: POST 반경 검색 (얇게, repository 호출)

src/components/common/
  roulette.component.tsx                  # 신규 (D6): 'use client'. 범용 룰렛 연출. 점심 import 금지

src/lib/
  rate-limit.ts                           # 신규: IP 기준 메모리 rate limit (export/route.ts 방식을 범용 함수로). lotto 코드는 건드리지 않는다

src/features/lunch/
  types/
    lunch.type.ts                         # 모든 점심 타입 (2장)
  constants/
    lunch-group.constant.ts               # 업태 그룹 16개: key, label, category(원본 값)
    lunch-search.constant.ts              # 반경, 목록 수, 풀 크기, 한국 좌표 범위, 좌표 자릿수, rate limit 수치
    lunch-region.constant.ts              # 생성 파일: 시·도/시·군·구 목록과 대표 지점 (scripts로 생성)
    lunch-luck.constant.ts                # "오늘의 점심운" 문구 (그룹별 배열)
    lunch-notice.constant.ts              # 상시 고지, 목록 고지, 위치 안내, 외부 링크 안내, 출처, 기준일
    lunch-faq.constant.ts                 # FAQ (화면과 JSON-LD가 같은 배열)
    lunch-seo.constant.ts                 # title, description, keywords, og alt, 경로
    lunch-copy-rule.constant.ts           # 금지 표현·허용 예외 문장 (e2e 검사 전용, 화면에서 import 금지)
  utils/
    lunch-validation.util.ts              # zod 요청 스키마 (서버·클라이언트 공용)
    lunch-geo.util.ts                     # 좌표 반올림, 한국 범위 판정
    lunch-geolocation.util.ts             # 브라우저 위치 요청 (반올림한 값만 돌려준다)
    lunch-pick.util.ts                    # 업태 뽑기, 점심운 문구 고르기, 목록 섞기·고르기
    lunch-map-link.util.ts                # 지도 검색어, 카카오맵·네이버지도 검색 URL
  services/
    lunch-restaurant.repository.ts        # 서버 전용: Supabase RPC 호출
    lunch.service.ts                      # 클라이언트: http.post('/api/lunch/restaurants')
  queries/
    use-lunch-restaurants.query.ts        # useMutation 래퍼
  today/
    components/
      root.component.tsx                  # 'use client'. LunchTodayComponent (컨테이너)
      roulette-panel.component.tsx        # 룰렛 버튼 + RouletteComponent + 결과 업태 + 점심운 문구
      location-request.component.tsx      # "주변 가게 보기" 버튼 + 위치 안내 문구
      region-select.component.tsx         # 시·도, 시·군·구 선택 (Controlled, shadcn Select)
      restaurant-list.component.tsx       # 목록 + "다시 섞기" 버튼
      restaurant-item.component.tsx       # 상호명, 주소, 지도 링크 2개
      list-status.component.tsx           # 로딩, 빈 상태, 오류 상태
      disclaimer-notice.component.tsx     # 서버. h1 바로 아래 상시 고지
      list-notice.component.tsx           # 서버. 목록 영역 아래 상시 고지 + 출처 (+ 기준일)
      intro.component.tsx                 # 서버. 설명 문단, 사용 순서 3단계, 위치 거부 시 쓰는 법
      faq.component.tsx                   # 서버. FAQ 목록
      noscript-notice.component.tsx       # 서버. <noscript> 안내
    hooks/
      use-lunch-today.hook.ts             # useReducer 화면 상태 (12.3)

src/features/api-docs/specs/lunch.openapi.json   # 신규: OpenAPI 조각 (README 규칙)

scripts/lunch-regions/generate.mjs        # 신규: 개발 시점 지역 상수 생성 스크립트 (런타임 미사용)

supabase/migrations/0004_lunch_search.sql # 신규

e2e/lunch.spec.ts, e2e/lunch-copy.spec.ts # qa 담당
```

- 컴포넌트 이름 예: `today/components/root.component.tsx` → `LunchTodayComponent`, `restaurant-item.component.tsx` → `LunchTodayRestaurantItemComponent`, 공용 룰렛 → `RouletteComponent`.
- 화면이 하나라 `shared/components/`는 만들지 않는다.
- `lunch-restaurant.repository.ts`는 `supabase-server.ts`를 쓰므로 `route.ts`에서만 import한다.
- `lunch-region.constant.ts`는 서버(route의 지역 검증·대표 지점 조회)와 클라이언트(선택 목록)가 같이 쓴다. 클라이언트에서는 지역 선택 흐름이 열릴 때 동적 import로 불러 첫 번들에서 뺀다.
- 원본 CSV와 변환 도구가 있는 `지역음식점 파일/` 폴더는 저장소에 커밋하지 않는다(원본 데이터 재배포 방지, 용량). `.gitignore` 추가는 PM이 결정한다.

## 2. 타입 (확정)

`src/features/lunch/types/lunch.type.ts`. 개발 담당이 임의로 바꾸지 않는다.

```ts
export type LunchGroupKeyType =
  | 'korean' | 'chinese' | 'japanese' | 'bunsik' | 'western' | 'grill'
  | 'rawfish' | 'chicken' | 'stew' | 'naengmyeon' | 'gimbap' | 'buffet'
  | 'fastfood' | 'world' | 'family' | 'blowfish';

export type LunchGroupType = Readonly<{
  key: LunchGroupKeyType;
  /** 화면 표시 이름 (3.1, 최종 문구는 ui-ux와 PM 승인) */
  label: string;
  /** DB restaurants.category 원본 값. 글자 하나도 바꾸지 않는다 */
  category: string;
}>;

export type LunchRadiusType = 500 | 1000 | 2000;

export type LunchRegionType = Readonly<{
  sido: string;      // 예: '서울특별시'
  sigungu: string;   // 예: '강남구', '수원시 장안구', 세종은 '세종특별자치시'
  lat: number;       // 대표 지점, 소수 넷째 자리
  lng: number;
}>;

export type LunchOriginRequestType =
  | Readonly<{ type: 'gps'; lat: number; lng: number }>
  | Readonly<{ type: 'region'; sido: string; sigungu: string }>;

export type LunchNearbyRequestType = Readonly<{
  group: LunchGroupKeyType;
  origin: LunchOriginRequestType;
  radiusM?: LunchRadiusType; // 없으면 1000
}>;

export type LunchRestaurantItemType = Readonly<{
  /** restaurants.mgt_no. React key 용도로만 쓰고 화면에 보여 주지 않는다 */
  id: string;
  name: string;
  roadAddress: string | null;
  jibunAddress: string | null;
  /** 검색 기준점에서 직선거리, 10m 단위 반올림. 화면 표시 여부는 Q7 */
  distanceM: number;
}>;

export type LunchNearbyResponseType = Readonly<{
  origin: Readonly<{ type: 'gps' }> | Readonly<{ type: 'region'; sido: string; sigungu: string }>;
  radiusM: LunchRadiusType;
  /** 무작위 표본, 최대 LUNCH_POOL_SIZE(30)개. 순서 의미 없음 */
  items: readonly LunchRestaurantItemType[];
  /** 같은 반경 안에 가게가 1곳 이상 있는 업태 키 */
  availableGroups: readonly LunchGroupKeyType[];
}>;

export type LunchApiErrorCodeType =
  | 'INVALID_REQUEST' | 'UNKNOWN_REGION' | 'FORBIDDEN_ORIGIN' | 'RATE_LIMITED' | 'SERVER_ERROR';
```

## 3. 업태 그룹과 룰렛 확률

### 3.1 그룹 매핑 (확정, `lunch-group.constant.ts`)

승인된 16개 그룹은 모두 원본 `category` 값 하나와 1:1로 대응한다. 그래서 그룹 컬럼이나 매핑 테이블을 DB에 만들지 않는다. 배열 순서가 룰렛 표시 순서다.

| key | 표시 이름(초안) | 원본 category | 가게 수 |
|---|---|---|---|
| korean | 한식 | 한식 | 298,912 |
| chinese | 중식 | 중국식 | 26,122 |
| japanese | 일식 | 일식 | 21,107 |
| bunsik | 분식 | 분식 | 33,088 |
| western | 경양식 | 경양식 | 29,505 |
| grill | 고기구이 | 식육(숯불구이) | 37,221 |
| rawfish | 횟집 | 횟집 | 12,826 |
| chicken | 치킨 | 통닭(치킨) | 10,361 |
| stew | 탕·보양식 | 탕류(보신용) | 3,684 |
| naengmyeon | 냉면 | 냉면집 | 1,239 |
| gimbap | 김밥·도시락 | 김밥(도시락) | 3,585 |
| buffet | 뷔페 | 뷔페식 | 3,201 |
| fastfood | 패스트푸드 | 패스트푸드 | 2,318 |
| world | 외국 음식 | 외국음식전문점 | 6,553 |
| family | 패밀리레스토랑 | 패밀리레스트랑 | 1,001 |
| blowfish | 복어 | 복어취급 | 681 |

- 원본 값은 공공데이터 표기 그대로다("패밀리레스트랑" 오타 포함). 상수는 원본 값을 글자 그대로 쓴다.
- "탕류(보신용)"는 전달받은 분포표에 "탕류"로만 적혀 있었다. db-dev가 적재 전에 CSV에서 정확한 문자열을 확인하고(공백, 괄호 포함) 상수와 대조한다(작업 D-1). 다르면 상수만 고친다.
- 제외 업태(호프/통닭, 정종/대포집/소주방, 감성주점, 까페, 라이브카페, 키즈카페, 전통찻집, 커피숍, 기타, 기타 휴게음식점, 출장조리, 푸드트럭, 이동조리, 빈값)는 목록에 넣지 않는다. API가 그룹 키 enum만 받으므로 제외 업태는 조회 경로 자체가 없다.
- 표시 이름은 초안이다. 문구와 색은 ui-ux 단계에서 정하고 PM이 승인한다(16장 Q-L).

### 3.2 확률 (확정)

- 승인대로 후보 그룹 사이 균등 확률이다. `secureRandomInt(후보 수)`(`src/lib/random.ts`)로 인덱스를 고른다. 가게 수 가중치를 두지 않는다.
- 한식이 가게 수로는 44%인데 룰렛에서는 1/16(약 6%)로 보이는 점은 그대로 둔다. 이유: (1) 승인된 원칙이다. (2) 가게 수로 가중하면 한식이 거의 매번 나와 뽑기의 재미가 없다. (3) "많은 곳을 밀어준다"는 추천처럼 보일 수 있다. FAQ에 "모든 업태가 같은 확률로 나온다"는 답을 넣는다.
- 결과는 뽑기 전에 정하고, 룰렛 연출은 정해진 결과로 멈추게만 한다. 연출이 결과를 바꾸지 않는다.

### 3.3 가게가 적은 지역의 후보 제외 (확정)

- 첫 뽑기는 위치를 모르는 상태다(AC-1, 룰렛만으로 위치를 묻지 않는다). 그래서 첫 뽑기는 항상 16개 전체에서 뽑는다.
- 위치(현재 위치 또는 선택 지역)가 정해지면 검색 응답의 `availableGroups`(같은 반경 안에 가게가 1곳 이상 있는 업태)를 화면 상태에 둔다.
- 이후 "다시 뽑기"와 "다른 업태 뽑기"는 `availableGroups`만 후보로 쓴다. 빈 상태를 다시 만나지 않게 하기 위해서다. 기준 수치는 `LUNCH_MIN_GROUP_COUNT = 1`(상수, 바꿀 수 있음)이다. 목록은 최대 10개를 보여 주므로 1곳만 있어도 의미가 있다.
- `availableGroups`가 비면(반경 안에 대상 가게가 전혀 없음, 한국 밖 좌표 등) 후보를 줄이지 않고 16개 전체로 두며, 빈 상태 화면에서 지역 선택을 안내한다.
- 위치가 바뀌면(다른 지역 선택, 현재 위치 다시 찾기) `availableGroups`를 버리고 새 응답 값으로 바꾼다.
- 룰렛에 빠진 업태를 어떻게 보여 줄지(숨김, 흐리게)는 ui-ux가 정한다.

### 3.4 점심운 문구 (`lunch-luck.constant.ts`)

- `LUNCH_LUCK_LINES: Readonly<Record<LunchGroupKeyType, readonly string[]>>`. 그룹마다 1개 이상. 개수와 검수 방식은 Q18(16장).
- 뽑힌 그룹의 배열에서 `secureRandomInt`로 한 줄을 고른다.
- 말투는 합니다체. 단정 표현 금지(AC-3). 금지 목록은 `lunch-copy-rule.constant.ts`: 반드시, 무조건, 보장, 확실, 100%, 대박, 최고, 맛집, 추천 가게, 인기, 베스트, 1위, 광고. 허용 예외 문장은 고지 문구("보장하지 않습니다")만이다. 검사는 `e2e/lunch-copy.spec.ts`(tarot의 D4 방식과 같다)로 한다.

## 4. 반경 검색 방식

### 4.1 비교

전제: 약 67만 행, 무료 플랜 DB 500MB, `restaurants`가 테이블·인덱스 포함 약 250MB, 반경 기본 1km, 결과는 무작위 최대 30개 표본.

| | A. bbox + 하버사인 + 복합 btree (추천) | B. PostGIS geography + GiST | C. earthdistance(cube) GiST |
|---|---|---|---|
| 방식 | `category = ? and lat between and lng between`으로 사각형을 인덱스로 좁히고, 하버사인으로 원 밖을 버린다 | `geography(Point)` 컬럼 + GiST, `ST_DWithin` | `ll_to_earth(lat,lng)` 식 인덱스, `earth_box` + `earth_distance` |
| 확장 | 없음 | `postgis` (spatial_ref_sys 약 7MB 포함) | `cube`, `earthdistance` |
| 용량 변화 | 약 0~-10MB (인덱스 2개를 1개로 교체) | 컬럼 약 +25MB, GiST 약 +40MB, 확장 약 +7MB. 합계 약 +70MB | 식 인덱스 약 +50MB |
| 적재 후 적용 위험 | 없음 (인덱스 생성만) | 컬럼을 채우는 UPDATE가 모든 행의 새 버전을 만들어 일시적으로 약 +250MB. 적재 후 적용하면 500MB를 넘을 수 있다 | 없음 |
| 정확도 | 1~2km에서 하버사인 오차는 무시할 수준 | 정확 | 구 근사, 충분 |
| 속도 (추정) | 업태별 위도 띠만 인덱스로 훑는다. 경도 조건도 인덱스 안에서 걸러 힙 접근은 사각형 안 행만. 서울 한식 기준 수 ms~수십 ms | 가장 좋음 | 좋음 |
| 장점 | 새 확장·컬럼 없음, 용량 최소, SQL 단순, 0003 인덱스 구조와 이어진다 | 표준, 가까운 순 정렬 등 확장 쉬움 | 컬럼 추가 없음 |
| 단점 | 위도 띠가 넓은 큰 반경에서는 비효율(이번 범위 최대 2km라 문제 없음) | 용량, 확장 관리, 이번 기능에는 과하다 | 확장 2개, 이점이 A보다 작다 |

추천: A. 이 기능은 가까운 순 정렬이 없고(무작위), 반경이 2km 이하이며, 용량 제약이 크다. 나중에 가까운 순 정렬이나 큰 반경이 필요해지면 B로 옮긴다(별도 마이그레이션).

### 4.2 검색 절차 (확정)

1. 서버가 좌표를 소수 셋째 자리로 다시 반올림한다(클라이언트가 이미 했더라도 한 번 더).
2. 한국 범위(위도 33~39, 경도 124~132, 적재 변환 기준과 같다) 밖이면 DB를 부르지 않고 `items: []`, `availableGroups: []`로 200 응답한다.
3. 사각형 계산: `dLat = r / 111320`, `dLng = r / (111320 × cos(radians(lat)))`.
4. 대상 업태: `category = 원본 값 and lat between lat±dLat and lng between lng±dLng`, 하버사인 거리 ≤ r, `order by random() limit 30`.
5. 업태별 개수: 16개 원본 값에 대해 같은 사각형·거리 조건으로 `group by category`. 인덱스에 `category, lat, lng`가 모두 있어 적재 후 `VACUUM ANALYZE`를 하면 index-only scan으로 끝난다.
6. 4와 5는 RPC 함수 2개로 나누고 repository가 `Promise.all`로 동시에 부른다.
7. 하버사인: 지구 반지름 6,371,008.8m, `2R·asin(sqrt(sin²(Δφ/2) + cosφ1·cosφ2·sin²(Δλ/2)))`. 결과는 정수 m, API에서 10m 단위로 반올림한다.

### 4.3 성능 확인 (db-dev, 적재 후)

- 세 지점에서 `EXPLAIN (ANALYZE, BUFFERS)`: 서울 강남역 근처(밀집), 지방 군청 근처(희소), 바다 위(0건). 한식·복어 두 업태로.
- 목표: DB 실행 시간 p95 100ms 이하. 결과를 `docs/lunch/dev-tasks.md` 또는 PR 설명에 남긴다. 넘으면 PM에게 보고하고 B안 재검토.

## 5. DB 스키마

### 5.1 0003을 대체할지, 0004를 추가할지

| | 0004 추가 (추천, D3) | 0003 내용을 바꿔 대체 |
|---|---|---|
| 방법 | 0003은 그대로 두고 0004에서 인덱스 교체, 함수, 권한을 바꾼다 | 0003 파일을 고쳐 처음부터 최종 형태로 만든다 |
| 장점 | 기존 마이그레이션 불변 규칙과 하네스(`guard-files.js`)를 지킨다. 변경 이유가 파일 단위로 남는다 | 파일 하나로 끝난다. 빈 테이블에 인덱스를 만들었다 지우는 단계가 없다 |
| 단점 | 빈 테이블에서 인덱스를 만들었다가 바로 지운다(빈 테이블이라 비용 없음) | 규칙 위반이고 hook이 막는다. 다른 환경(로컬 등)에 이미 0003을 적용했다면 어긋난다 |

추천: 0004 추가. 0003이 아직 적용 전이라 손해가 없다.

### 5.2 적용 순서 (사용자가 직접 실행, `supabase db push`는 하네스가 막는다)

1. 0003 적용 → 2. 0004 적용 → 3. `restaurants-geo.csv` 적재(lat·lng 빈 값은 NULL) → 4. `VACUUM ANALYZE public.restaurants` → 5. 용량 확인(전체 DB 450MB 이하) → 6. 4.3 성능 확인.

적재는 운영 DB 변경이므로 실행 전에 PM이 사용자에게 확인한다.

### 5.3 `0004_lunch_search.sql` 내용 (확정)

테이블과 컬럼은 바꾸지 않는다. `restaurants` 컬럼은 0003 그대로다: `mgt_no text PK`, `name text not null`, `category text`, `road_address text`, `jibun_address text`, `lat double precision`, `lng double precision`, `updated_at timestamptz`.

인덱스

| 동작 | 이름 | 정의 | 이유 |
|---|---|---|---|
| 삭제 | `restaurants_category_idx` | `(category)` | 새 복합 인덱스의 선두 컬럼이 대신한다 |
| 삭제 | `restaurants_latlng_idx` | `(lat, lng)` | 업태 없이 위치만 찾는 질의가 없다. 용량 절약 |
| 생성 | `restaurants_category_lat_lng_idx` | `btree (category, lat, lng)` | 4.2 검색과 개수 집계 모두 이 인덱스 하나로 처리 |

- 부분 인덱스(`where category in (...)`)는 쓰지 않는다. 함수 인자로 받은 `category`는 계획 단계에서 조건을 증명할 수 없어 인덱스를 못 쓸 수 있다.
- 제외 업태 행도 테이블에 남긴다(D7). 동기화 cron이 원본 그대로 다루기 쉽고, 현재 용량으로 충분하다.

RPC 함수 (확정 시그니처)

```
public.lunch_restaurants_nearby(
  p_category text, p_lat double precision, p_lng double precision,
  p_radius_m integer, p_limit integer
) returns table (mgt_no text, name text, road_address text, jibun_address text, distance_m integer)
  language sql, volatile (random() 사용), security invoker, set search_path = ''

public.lunch_category_counts_nearby(
  p_categories text[], p_lat double precision, p_lng double precision, p_radius_m integer
) returns table (category text, store_count integer)
  language sql, stable, security invoker, set search_path = ''
```

- 함수 안에서 인자를 한 번 더 제한한다: `p_radius_m`은 100~2000, `p_limit`은 1~30으로 자른다(`least`/`greatest`).
- 테이블은 `public.restaurants`로 스키마를 적는다(`search_path = ''`, Supabase 린터 권고).
- 함수 본문에 좌표를 남기는 `raise notice`, 로그 테이블 쓰기를 넣지 않는다.

RLS와 권한 (확정, D2)

- `drop policy if exists "restaurants_public_read" on public.restaurants;`
- `revoke all on public.restaurants from anon, authenticated;`
- RLS는 켠 채로 둔다. 정책이 없으므로 anon·authenticated는 0행이다. 서버는 service role(RLS 우회)로만 읽는다.
- 두 함수: `revoke all ... from public, anon, authenticated;` 후 `grant execute ... to service_role;`. Supabase는 public 스키마의 새 함수에 anon 실행 권한을 기본으로 주므로 반드시 회수한다.

### 5.4 공개 읽기 범위 비교 (D2)

| | API 경유만 (추천) | 공개 읽기 유지 (현재 0003) |
|---|---|---|
| 장점 | anon 키로 67만 행 전체를 내려받는 길이 막힌다(plan "대량 복사 공개 금지"). 무료 플랜 전송량(egress) 보호. 앱이 anon 키를 쓰지 않으므로 영향 없음 | 나중에 브라우저에서 Supabase를 직접 읽을 수 있다 |
| 단점 | README의 "모든 테이블 공개 읽기" 설명을 고쳐야 한다 | anon 키는 비밀이 아니라 유출되면 전체 덤프가 가능하다. rate limit을 우회한다 |

## 6. API 계약 (확정)

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| POST | `/api/lunch/restaurants` | JSON 본문 `LunchNearbyRequestType` | 200 `LunchNearbyResponseType` | 400 `INVALID_REQUEST`, 400 `UNKNOWN_REGION`, 403 `FORBIDDEN_ORIGIN`, 429 `RATE_LIMITED`, 500 `SERVER_ERROR` |

### 6.1 요청

- 헤더: `Content-Type: application/json`. 본문 최대 1,024바이트(`await req.text()` 길이로 먼저 확인하고 넘으면 400).
- 본문 예 (현재 위치): `{ "group": "korean", "origin": { "type": "gps", "lat": 37.498, "lng": 127.028 } }`
- 본문 예 (지역): `{ "group": "chinese", "origin": { "type": "region", "sido": "서울특별시", "sigungu": "강남구" }, "radiusM": 1000 }`
- zod 스키마 (`lunch-validation.util.ts`, 서버와 클라이언트가 같은 스키마를 쓴다, 모든 객체 `.strict()`)
  - `group`: 2장의 16개 키 enum
  - `origin`: `type`으로 나누는 discriminated union
    - gps: `lat` 유한한 number −90~90, `lng` 유한한 number −180~180. 자릿수는 검증하지 않고 서버가 반올림한다.
    - region: `sido` 문자열 1~20자, `sigungu` 문자열 1~30자. 스키마 통과 후 `lunch-region.constant.ts`에 같은 쌍이 없으면 `UNKNOWN_REGION`.
  - `radiusM`: 500 | 1000 | 2000, 기본 1000. 승인된 기본은 1km이고 화면은 1000만 보낸다. 선택지 노출은 Q5-b(16장).
- 좌표를 쿼리스트링, 경로, 헤더, 쿠키에 넣지 않는다. GET은 만들지 않는다(Next가 405 응답).

### 6.2 응답

- 200 예: `{ "origin": { "type": "gps" }, "radiusM": 1000, "items": [ { "id": "…", "name": "…", "roadAddress": "…", "jibunAddress": null, "distanceM": 340 } ], "availableGroups": ["korean", "chinese"] }`
- 요청 좌표와 지역 대표 지점 좌표를 응답에 되돌려 주지 않는다. 가게 좌표도 주지 않는다(지도 링크는 이름·주소 검색이라 필요 없고, 대량 수집 가치를 낮춘다).
- `items`는 최대 30개 무작위 표본이다. 화면은 이 중 10개를 보여 주고 "다시 섞기"는 브라우저에서 다시 고른다(D5).
- 빈 결과도 200이다(`items: []`).
- 모든 응답 헤더: `Cache-Control: no-store`.

### 6.3 에러

본문 형태는 기존 lotto API와 같은 `{ "error": "<코드>" }`다.

| 상태 | 코드 | 조건 |
|---|---|---|
| 400 | `INVALID_REQUEST` | JSON 파싱 실패, 1KB 초과, 스키마 불일치, Content-Type 불일치 |
| 400 | `UNKNOWN_REGION` | 지역 쌍이 상수에 없음 |
| 403 | `FORBIDDEN_ORIGIN` | `Origin` 헤더가 없거나 요청 URL의 origin과 다름 (같은 출처만 허용. 미리보기 배포와 localhost도 자기 origin이라 통과) |
| 429 | `RATE_LIMITED` | IP당 분당 20회 초과. `Retry-After` 헤더(초) |
| 500 | `SERVER_ERROR` | DB 오류, 5초 시간 초과(`abortSignal(AbortSignal.timeout(5000))`) |

### 6.4 rate limit

- `src/lib/rate-limit.ts`에 `export/route.ts`의 방식(IP 기준 메모리 `Map`, 고정 창)을 범용 함수로 만든다. 예: `createRateLimiter({ windowMs, max })` → `check(req): { ok: boolean; retryAfterSec: number }`. lotto 라우트는 이번에 바꾸지 않는다.
- 수치: 창 60초, IP당 20회(`lunch-search.constant.ts`). 한 사용자가 위치 확인 1회와 다시 뽑기 몇 번을 해도 충분하다.
- 한계: 서버리스 인스턴스마다 메모리가 따로라 엄격하지 않다. 더 강하게 막으려면 Vercel Firewall의 경로별 rate limit 규칙을 추가할 수 있다(운영 설정, 출시 전 체크리스트 선택 항목).
- `Map`에는 IP와 횟수만 둔다. 좌표를 넣지 않는다. 오래된 항목은 창이 지나면 덮어쓴다.

### 6.5 OpenAPI

- `src/features/api-docs/specs/lunch.openapi.json`에 위 계약을 그대로 적는다(개발 환경 Swagger 전용). 예시 좌표는 공공장소(예: 서울시청) 근처의 반올림 값만 쓴다.

## 7. 좌표 로그 방지 (승인 원칙의 구현)

원칙: 서버 접속 로그, 호스팅 로그, 분석 도구에 정확한 좌표가 남지 않는다.

| 위치 | 조치 |
|---|---|
| 브라우저 | `lunch-geolocation.util.ts`가 위치를 받자마자 소수 셋째 자리(위도 약 111m, 경도 약 89m 단위)로 반올림하고 반올림한 값만 돌려준다. 원래 값은 상태·저장소·전역 store에 올리지 않는다 |
| 요청 | POST 본문으로만 보낸다. URL에 좌표가 없으므로 Vercel 접속 로그(경로·쿼리 기록)에 남지 않는다 |
| 서버 코드 | 본문, 좌표, 지역 대표 지점을 `console.*`로 찍지 않는다. 오류 로그는 에러 코드와 DB 오류 코드(`error.code`)만 남긴다. 에러 객체 전체나 요청 본문을 로그에 넘기지 않는다 |
| Supabase 호출 | `supabase-js`의 `.rpc()`는 PostgREST에 POST 본문으로 인자를 보낸다. API 로그의 URL에 좌표가 없다 |
| Postgres 로그 | 함수에 로그 출력이 없다. 느린 쿼리 로그 설정(`log_min_duration_statement`) 여부는 출시 전 확인 항목이다. 남더라도 반올림 좌표다 |
| 분석 도구 | Vercel Web Analytics에 좌표·지역을 담은 사용자 이벤트를 보내지 않는다. 페이지 URL에 상태를 쿼리로 넣지 않는다 |
| 지도 링크 | 상호명과 주소로만 검색하고 좌표를 넣지 않는다. `rel="noopener noreferrer"`로 리퍼러를 보내지 않는다 |

반올림 정밀도 대안: 둘째 자리(약 1.1km)는 1km 반경 검색에 오차가 너무 크다. 넷째 자리(약 11m)는 "정확한 좌표"에 가깝다. 셋째 자리를 확정한다. 반경 1km에서 최대 오차는 약 70m다.

위치 안내 문구는 이 처리에 맞춰 ui-ux 단계에서 다듬는다. 예: "위치 정보는 주변 가게를 찾는 데만 사용합니다. 약 100m 단위로 줄여 검색에만 쓰고, 서버나 브라우저에 저장하지 않습니다."

## 8. 위치 거부·실패 시 지역 선택

### 8.1 데이터 출처 비교 (D4)

| | 데이터에서 만든 코드 상수 + 대표 지점 반경 검색 (추천) | 시·군·구 컬럼 추가 + 지역 전체 무작위 |
|---|---|---|
| 목록 출처 | 적재한 CSV의 주소에서 개발 시점 스크립트로 생성 | 같은 데이터, DB 컬럼 |
| 검색 | 대표 지점 기준 같은 1km 반경 검색 (API 하나, 같은 경로) | `category, sido, sigungu`로 지역 전체에서 무작위 |
| DB 변경 | 없음 | 컬럼 2개 + 인덱스. 적재 후 추가하면 테이블 재작성으로 일시적 용량 급증 |
| 결과 성격 | 그 지역 번화가 근처 가게. 걸어갈 수 있는 묶음 | 지역 곳곳에 흩어진 가게. 군 단위면 수십 km 떨어진 곳이 섞인다 |
| 장점 | 용량·쿼리 추가 없음, 점심 용도에 맞다 | "그 지역 안 가게"라는 뜻이 정확하다 |
| 단점 | 대표 지점에서 먼 동네는 나오지 않는다. 화면에 "○○구 중심가 기준"이라고 밝혀야 한다 | 용량, 주소 파싱을 SQL에서 해야 한다 |

추천: 앞쪽. 공공 행정구역 코드표(행정표준코드)는 쓰지 않는다. 데이터에 있는 지역만 나와야 빈 지역이 목록에 생기지 않는다.

### 8.2 생성 규칙 (`scripts/lunch-regions/generate.mjs`, 확정)

- 입력: 적재한 것과 같은 `restaurants-geo.csv` 경로(인자로 받는다. 저장소에 원본을 두지 않는다). 출력: `src/features/lunch/constants/lunch-region.constant.ts`(`LUNCH_REGIONS: readonly LunchRegionType[]`, 시·도 → 시·군·구 가나다순).
- 대상 행: 16개 그룹 업태이고 lat·lng가 있는 행.
- 주소: `road_address`가 있으면 그것, 없으면 `jibun_address`. 괄호와 쉼표 뒤를 지우고 공백으로 나눈다.
- 시·도: 첫 토큰. 옛 이름은 현재 이름으로 바꾼다(강원도 → 강원특별자치도, 전라북도 → 전북특별자치도). "경상북도 군위군"은 "대구광역시 군위군"으로 바꾼다. 바꾼 결과는 17개 시·도여야 한다(스크립트가 검사하고 다르면 실패).
- 시·군·구: 둘째 토큰. 둘째가 "…시"이고 셋째가 "…구"면 "수원시 장안구"처럼 두 토큰을 합친다(일반구). 세종특별자치시는 시·군·구가 없으므로 `sigungu`를 "세종특별자치시"로 둔다(화면은 자동 선택).
- 대표 지점: 그 시·군·구 행을 0.01도 격자로 묶어 가게가 가장 많은 격자를 고르고, 그 격자 안 가게 좌표의 평균을 소수 넷째 자리로 반올림한다. 평균 좌표(시·군 전체)는 산이나 논 위에 떨어질 수 있어 쓰지 않는다.
- 생성 파일 머리에 "생성 파일, 직접 수정 금지, 생성일, 입력 행 수"를 주석으로 적는다. 예상 크기 약 260개, 15KB 안팎.
- 스크립트는 Node 기본 모듈만 쓴다(새 의존성 없음).

### 8.3 흐름

- 위치 오류 코드 1(거부): 지역 선택으로 바꾸고 "브라우저 설정에서 위치 권한을 허용하면 현재 위치로 찾을 수 있습니다" 안내(AC-17).
- 코드 2(사용 불가), 3(시간 초과), `navigator.geolocation` 없음, 보안 컨텍스트 아님: 지역 선택으로 바꾸고 "현재 위치를 확인하지 못했습니다" 안내(AC-16).
- 위치 요청 옵션: `enableHighAccuracy: false`, `timeout: 10000`, `maximumAge: 300000`.
- 권한 요청을 자동으로 반복하지 않는다. "현재 위치로 찾기" 버튼은 지역 선택 화면에서도 보이게 둔다. `navigator.permissions`는 쓰지 않는다(Safari 지원이 고르지 않다).
- 지역 선택 결과 목록 위에 "○○구 중심가 기준 1km" 같은 기준 설명을 둔다(문구는 ui-ux).
- 카카오톡 등 인앱 브라우저는 위치를 막는 경우가 많다. 이 경우도 같은 대체 흐름이다.

## 9. 지도 링크 (확정, `lunch-map-link.util.ts`)

- 검색어: `상호명 + 공백 + 주소 일부`. 주소는 `roadAddress ?? jibunAddress`에서 괄호·쉼표 뒤를 지우고 토큰 2·3번째(시·도를 뺀 시·군·구와 도로명 또는 읍·면·동)를 쓴다. 주소가 없으면 상호명만.
- 카카오맵: `https://map.kakao.com/link/search/{encodeURIComponent(검색어)}`
- 네이버지도: `https://map.naver.com/p/search/{encodeURIComponent(검색어)}`
- 호스트는 상수로 고정하고 검색어만 인코딩해 붙인다. 사용자 입력이나 데이터로 URL 전체를 만들지 않는다.
- `<a target="_blank" rel="noopener noreferrer">`. 외부 이동 표시(아이콘 + "새 창" 접근성 이름)는 ui-ux가 정한다.
- 앱 딥링크(스킴), 지도 API, 길찾기는 쓰지 않는다(plan 제외). 모바일에서 앱이 열릴지는 각 서비스의 웹 링크 동작에 맡긴다.
- 두 URL 형식과 링크 이용 정책은 출시 전에 확인한다(Q17).

## 10. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 음식점 67만 행 | Supabase `restaurants` (API 경유만) | 크고 서버에서 갱신(후속 cron)하며 모두가 공유한다 |
| 업태 그룹·매핑, 점심운 문구, 고지, FAQ, SEO 문구, 금지 표현 | 코드 상수 | 모두에게 같고 자주 안 바뀐다 (`data-storage.md` 예시 "점심 메뉴 목록") |
| 시·도/시·군·구 목록과 대표 지점 | 코드 상수 (생성 파일) | 모두에게 같고 데이터 적재 때만 바뀐다. 약 15KB라 DB 조회보다 단순 |
| 데이터 기준일 (Q11) | 코드 상수 | 적재 시점에 고정된다 |
| 사용자 좌표 (반올림 값) | 메모리(React 상태)만 | plan 원칙. localStorage, sessionStorage, 쿠키, URL, zustand, 서버 저장 모두 금지(AC-12) |
| 선택한 지역 | 메모리만 | 새로고침 시 초기화(승인 결정). 저장할 이유가 없다 |
| 룰렛 결과, 점심운 문구, 후보 목록(`availableGroups`) | 메모리만 | 승인 결정: 새로고침하면 사라진다 |
| 받은 가게 풀(최대 30개)과 화면 표시 10개 | 메모리만 | 같은 이유 |
| rate limit 횟수 | 서버 메모리(`Map`, IP와 횟수) | 1분 창. 좌표 없음. 디스크·DB에 쓰지 않는다 |
| IndexedDB, sessionStorage, localStorage | 쓰지 않음 | 해당 데이터 없음 |

## 11. 상태 관리와 데이터 요청

### 11.1 요청 훅

- `use-lunch-restaurants.query.ts`: `useMutation`으로 `lunch.service.ts`의 `fetchLunchRestaurants(body)`를 감싼다.
- `useQuery`를 쓰지 않는 이유: 요청은 사용자 행동(버튼)으로만 일어나는 POST이고, 좌표가 들어간 queryKey를 전역 QueryCache에 남길 필요가 없다. 같은 입력의 캐시 재사용도 원하지 않는다(다시 뽑기마다 새 표본).
- `retry: 0`. "다시 시도"는 마지막 요청 본문(메모리)으로 다시 `mutate`한다.
- `lunch.service.ts`는 `http.post`를 쓰고, 에러 응답의 `error` 코드를 그대로 상위에 전달한다.

### 11.2 화면 상태 (`use-lunch-today.hook.ts`, useReducer, 확정)

```ts
type LunchSpinStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'spinning'; spinId: number; groupKey: LunchGroupKeyType; candidates: readonly LunchGroupKeyType[] }>
  | Readonly<{ status: 'done'; spinId: number; groupKey: LunchGroupKeyType; luckLine: string; candidates: readonly LunchGroupKeyType[] }>;

type LunchOriginStateType =
  | Readonly<{ status: 'none' }>
  | Readonly<{ status: 'locating' }>
  | Readonly<{ status: 'gps'; lat: number; lng: number }>            // 반올림 값
  | Readonly<{ status: 'region-select'; reason: 'denied' | 'failed' }>
  | Readonly<{ status: 'region'; sido: string; sigungu: string }>;

type LunchTodayStateType = Readonly<{
  spin: LunchSpinStateType;
  origin: LunchOriginStateType;
  availableGroups: readonly LunchGroupKeyType[] | null; // 현재 origin 기준, 모르면 null
  pool: readonly LunchRestaurantItemType[];             // 최근 응답 items
  visibleIds: readonly string[];                         // 화면 10개
}>;

type LunchTodayActionType =
  | { type: 'SPIN_START'; spinId: number; groupKey: LunchGroupKeyType; candidates: readonly LunchGroupKeyType[] }
  | { type: 'SPIN_END'; spinId: number; luckLine: string }
  | { type: 'LOCATE_START' }
  | { type: 'LOCATE_OK'; lat: number; lng: number }
  | { type: 'LOCATE_FAIL'; reason: 'denied' | 'failed' }
  | { type: 'REGION_OPEN' }
  | { type: 'REGION_SELECT'; sido: string; sigungu: string }
  | { type: 'RESULT'; items: readonly LunchRestaurantItemType[]; availableGroups: readonly LunchGroupKeyType[]; visibleIds: readonly string[] }
  | { type: 'SHUFFLE'; visibleIds: readonly string[] };
```

- 로딩·오류 여부는 `useMutation`의 `isPending`, `error`에서 읽는다. 리듀서에 복제하지 않는다.
- 뽑기 결과(`groupKey`)는 `SPIN_START` 때 이미 정해져 있다. 연출이 끝나면 `SPIN_END`.
- 위치가 정해진 상태(`gps`, `region`)에서 뽑기가 끝나면 새 업태로 자동 검색한다. 위치가 없으면 "주변 가게 보기" 버튼을 기다린다. 자동 검색 여부는 ui-ux가 화면 흐름으로 최종 확인한다.
- 다시 섞기: `pool`에서 `visibleIds` 10개를 다시 고른다(`pool`이 10개 이하면 순서만 섞는다). 부분 Fisher-Yates + `secureRandomInt`. `sort(() => Math.random() - 0.5)` 금지.
- 목록 요청이 실패해도 `spin` 상태는 그대로 둔다(AC-19).
- 위치 권한이 중간에 철회되면 다음 "현재 위치로 찾기"에서 오류 코드 1이 나오므로 `LOCATE_FAIL('denied')`로 같은 흐름에 들어간다.

### 11.3 공용 룰렛 컴포넌트 (D6)

추천: `src/components/common/roulette.component.tsx`에 처음부터 범용으로 만든다.

- 근거: `code-style.md`의 "특정 기능을 모르는 범용 코드는 처음부터 공용" 예외에 맞는다. 결과 결정(난수)과 연출(회전)을 나누면 점심 지식이 전혀 필요 없다. 후속 "운빨 뽑기 도구(돌림판)"가 그대로 쓸 수 있어 나중에 옮기는 작업과 import 수정이 없다.
- 위험: 아직 두 번째 사용처가 없어 인터페이스가 과하게 일반화될 수 있다. 그래서 아래 최소 props만 둔다.
- props (확정): `items: readonly { key: string; label: string }[]`, `targetIndex: number | null`, `spinId: number`(바뀌면 새로 돈다), `onSpinEnd?: (spinId: number) => void`, `className?: string`.
- 컴포넌트는 난수를 만들지 않고, 버튼을 포함하지 않고, 결과 문구를 읽어 주지 않는다. 버튼과 `aria-live` 결과 영역은 부모(`roulette-panel`)가 갖는다.
- 색은 토큰 클래스·CSS 변수만, 칸 색은 부모가 `className`이나 CSS 변수로 넘긴다. `features/` import 금지.
- 모션: framer-motion. 사이트의 `MotionConfig reducedMotion="user"`로 동작 줄이기 설정에서는 회전 없이 결과만 바뀐다(AC-4). 이때도 `onSpinEnd`가 반드시 불려야 한다. framer-motion이 즉시 완료 콜백을 부르지 않는 경우를 대비해 `useReducedMotion()`이 true면 다음 틱에 직접 부른다.
- 모양(원판, 슬롯 등), 회전 시간, 16칸 글자 배치는 ui-ux가 정한다. 모양이 원판이 아니어도 이름은 `RouletteComponent`로 둔다.
- 대안: `features/lunch/today/components/`에 같은 props로 만들고 두 번째 사용처가 생기면 공용으로 옮긴다. 장점은 규칙 기본값(가장 좁은 곳)을 따른다는 것, 단점은 이동 시 import 수정과 리뷰가 한 번 더 든다는 것.

## 12. 프론트 구조

### 12.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/lunch/today` | `src/app/lunch/today/page.tsx` (수정) | 서버 컴포넌트. `buildMetadata()` 사용. 출시 전까지 `robots: { index: false, follow: true }`를 덮어써 유지하고, 출시 작업(F-9)에서 덮어쓰기를 지운다. `ComingSoonComponent` 제거 |

- 페이지 이름 `LunchTodayPage`(default export). 클라이언트 경계는 `LunchTodayComponent`(root) 하나다. 그 아래 프레젠테이션 컴포넌트는 `'use client'`를 따로 붙이지 않는다. 예외는 공용 `RouletteComponent`(framer-motion 사용, `'use client'`).

### 12.2 컴포넌트 트리

```
LunchTodayPage (서버)
├─ JsonLdComponent ×2 (BreadcrumbList, FAQPage)
├─ TitleWrapperComponent (h1 "오늘 뭐 먹지")
├─ LunchTodayDisclaimerNoticeComponent (서버, h1 바로 아래, AC-20)
├─ LunchTodayIntroComponent (서버, 설명 문단 + 사용 순서 3단계 + 위치 거부 시 쓰는 법)
├─ LunchTodayNoscriptNoticeComponent (서버)
├─ LunchTodayComponent (클라이언트 root)
│  ├─ LunchTodayRoulettePanelComponent
│  │  └─ RouletteComponent (공용)
│  ├─ LunchTodayLocationRequestComponent (버튼 + 위치 안내 AC-22)
│  ├─ LunchTodayRegionSelectComponent (origin이 region-select/region일 때, 동적 import한 지역 상수)
│  ├─ LunchTodayListStatusComponent (로딩 / 빈 상태 AC-18 / 오류 AC-19)
│  └─ LunchTodayRestaurantListComponent
│     └─ LunchTodayRestaurantItemComponent ×최대 10 (순위 번호 없음 AC-9)
├─ LunchTodayListNoticeComponent (서버, 목록 영역 바로 아래 항상 표시 AC-21 + 출처 + 외부 링크 안내 + 오락 목적 짧은 고지)
└─ LunchTodayFaqComponent (서버)
```

- 목록 고지를 클라이언트 목록 안에 넣지 않고 서버 컴포넌트로 root 바로 아래 형제로 둔다. 서버 HTML에 있고 목록이 없을 때도 보인다(tarot 7.2와 같은 방식).
- 목록 항목은 `<ul>`/`<li>`로 그리고 `<ol>`을 쓰지 않는다(순위로 읽히지 않게).
- 상호명·주소는 React 텍스트로만 그린다. 원문을 바꾸거나 설명을 붙이지 않는다. `mgt_no`는 key로만 쓴다.
- 주소가 둘 다 없으면 주소 줄을 숨긴다.

### 12.3 상태 위치

- 화면 상태: `use-lunch-today.hook.ts`(11.2). root가 갖고 하위는 props만 받는다.
- 서버 요청 상태: `useMutation`(11.1).
- 전역 store, Context, URL 상태: 쓰지 않는다.
- 쿠키 동의(`ConsentProvider`)를 읽지 않는다. 동의와 무관하게 동작한다(AC-24).

### 12.4 에러·빈 결과 처리

| 상황 | 화면 |
|---|---|
| 위치 거부 | 지역 선택 + 권한 안내 (AC-14, AC-17) |
| 위치 실패·미지원 | 지역 선택 + 확인 실패 안내 (AC-16) |
| `items` 0개, `availableGroups` 있음 | 빈 상태 + "다른 업태 뽑기"(후보는 `availableGroups`) (AC-18) |
| `items` 0개, `availableGroups` 0개 | 빈 상태 + "다른 지역 선택하기" 안내 (한국 밖, 대상 가게 없는 곳) |
| 400 `INVALID_REQUEST`, `UNKNOWN_REGION` | 일반 오류 문구 + 다시 시도. 지역 오류면 지역 선택을 다시 연다 |
| 429 `RATE_LIMITED` | "잠시 후 다시 시도해 주세요" + 다시 시도 |
| 500, 네트워크 오류, 시간 초과 | 오류 문구 + 다시 시도. 룰렛 결과 유지 (AC-19) |
| JavaScript 꺼짐 | `<noscript>` 안내. 설명·FAQ·고지는 서버 HTML로 보인다 |

- 전역 `error.tsx`로 넘기지 않는다. 목록 영역 안에서 처리한다.
- 토스트(`sonner`)만으로 오류를 알리지 않는다. 화면에 남는 문구로 보여 준다.

## 13. SEO

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/lunch/today` | 오늘 뭐 먹지 - 점심 룰렛과 주변 음식점 | 룰렛으로 오늘의 점심 업태를 뽑고, 주변 음식점을 지도에서 찾아볼 수 있는 오락 서비스입니다. | BreadcrumbList, FAQPage | 출시 때 `MENU_LIST` lunch 그룹 `comingSoon` 제거로 자동 등록. 그 전에는 미등록 + noindex |

- title, description은 승인된 정정안(plan "검색 노출")이다. `lunch-seo.constant.ts`에 둔다.
- keywords: 오늘 뭐 먹지, 점심 뭐 먹지, 점심 메뉴 추천, 점심 룰렛, 점심 메뉴 룰렛, 오늘 점심 추천, 주변 음식점 찾기, 점심 식당 찾기.
- OG: `buildMetadata({ ogImage: { alt: '오늘 뭐 먹지 점심 룰렛' } })`. tag는 메뉴 라벨 기본값.
- BreadcrumbList: 홈(`/`) > 점심(`/lunch/today`, 그룹 href) > 오늘 뭐 먹지(`/lunch/today`). tarot D5와 같은 3단계 방식이다.
- FAQPage: `lunch-faq.constant.ts` 한 배열을 화면과 JSON-LD가 같이 쓴다. 4~5개. 질문은 plan "페이지가 답해야 할 질문"을 따르고 "같은 확률" 답(3.2)을 포함한다.
- Restaurant, LocalBusiness, ItemList 등 가게 정보를 담은 구조화 데이터는 쓰지 않는다(AC-31).
- 서버 HTML: h1, 상시 고지, 설명 문단, 사용 순서, 위치 거부 시 쓰는 법, 목록 고지, FAQ(AC-28). 룰렛과 목록은 클라이언트.
- 메뉴 설명 정정(승인, 출시 작업과 별개로 먼저 반영 가능): `description` "룰렛으로 오늘의 점심 업태를 뽑고 주변 가게를 지도에서 찾아보기.", `example` "예: 한식·중식·분식 중 룰렛으로 하나 고르기"(초안, 문구는 PM 확인). `colorClass`는 Q15(ui-ux).
- `/api/`는 이미 `robots.ts`에서 막혀 있다. 추가 작업 없음.

## 14. 보안

- RLS: 5.3. `restaurants`는 anon·authenticated 읽기 불가, service role만. RPC 함수 실행 권한도 service role만.
- 시크릿: 새 환경변수 없음. 기존 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용, `NEXT_PUBLIC_` 아님)를 repository에서만 쓴다. 지도 링크는 키가 필요 없다. `NEXT_PUBLIC_`로 새로 노출하는 값 없음.
- 입력 검증: 6.1의 zod strict 스키마, 본문 1KB 제한, enum 업태, 지역은 상수 대조, 좌표 범위·유한수 검사, 서버 재반올림, DB 함수 안 반경·개수 재제한. 쿼리는 RPC 인자 바인딩이라 SQL 문자열 조합이 없다.
- XSS: 공공데이터 상호명·주소는 React 텍스트로만 그린다. `dangerouslySetInnerHTML`은 기존 JSON-LD 컴포넌트 외에 쓰지 않고, JSON-LD에는 FAQ 상수만 넣는다. 지도 URL은 고정 호스트 + `encodeURIComponent`.
- 남용 방지: IP당 분당 20회(6.4), 같은 출처 `Origin` 검사, 요청당 최대 30개, 가게 좌표 미제공, anon 직접 읽기 차단. 선택: Vercel Firewall 경로 rate limit.
- 위치 권한 헤더: `next.config.ts`의 `headers()`에 `/lunch/today` 전용 항목을 전역 항목 뒤에 추가해 `Permissions-Policy: geolocation=(self), microphone=(), camera=()`로 덮어쓴다(Next는 같은 키가 여러 항목에 걸리면 뒤 항목이 이긴다). 다른 페이지는 지금처럼 `geolocation=()`. 적용 후 다른 경로에서 막혀 있는지 QA가 확인한다(D8).
- 브라우저 저장소: 좌표, 지역, 결과를 어디에도 쓰지 않는다(AC-12). 민감정보 저장 없음.
- 응답 캐시: `Cache-Control: no-store`.
- 로그: 7장.

## 15. PM 결정 요청 (D1~D9)

추천안대로면 "추천안 승인" 한 줄로 답하면 된다.

| 번호 | 주제 | 추천 | 대안 |
|---|---|---|---|
| D1 | 반경 검색 방식 | bbox + 하버사인 + `(category, lat, lng)` 복합 btree (4.1 A) | PostGIS(B), earthdistance(C) |
| D2 | `restaurants` 읽기 범위 | 공개 읽기 정책 삭제, API 경유(service role)만 (5.4) | 공개 읽기 유지 |
| D3 | 마이그레이션 | 0004 추가, 0003 불변 (5.1) | 0003 대체 |
| D4 | 지역 선택 데이터·검색 | 데이터에서 만든 코드 상수 + 시·군·구 대표 지점 1km 반경 (8.1) | 시·군·구 컬럼 추가 + 지역 전체 무작위 |
| D5 | 다시 섞기 방식 | 한 번에 최대 30개 받아 브라우저에서 10개씩 다시 고르기. 좌표를 다시 보내지 않는다 | 누를 때마다 서버에 다시 요청(10개). 매번 새 가게가 나오지만 좌표 재전송·요청 수 증가 |
| D6 | 룰렛 컴포넌트 위치 | `src/components/common/roulette.component.tsx` 범용 (11.3) | `features/lunch/today/components/`에 두고 나중에 이동 |
| D7 | 제외 업태 행 적재 | 전체 적재(약 67만 행) | 16개 업태만 적재(약 49만 행, 약 70MB 절약, 다른 용도 불가) |
| D8 | 위치 권한 헤더 범위 | `/lunch/today`만 `geolocation=(self)` | 전역 `geolocation=(self)` (단순하지만 모든 페이지에서 위치 API가 열린다) |
| D9 | 이용약관 반영 방식 | 새 "8. 점심 추천 서비스" 장을 넣고 뒤 장 번호를 하나씩 민다. `COMPLIANCE.md`의 약관 장 번호 언급(11장 → 12장)을 같이 고친다 | 기존 3장(데이터 출처)과 11장(제3자 서비스)에 항목만 추가해 번호를 유지 |

## 16. 열린 질문 (사용자)

- Q5-b: 반경 선택지(500m, 2km)와 빈 상태의 "반경 넓히기" 버튼을 둘지. API는 500/1000/2000을 이미 받는다. 승인된 것은 기본 1km뿐이라 설계는 1km 고정 화면으로 둔다.
- Q7: 거리 표시 여부. 응답에 `distanceM`(10m 단위)은 항상 있다. 추천은 1차 미표시다. 좌표 반올림으로 최대 약 70m 오차가 있고, 지역 선택에서는 "대표 지점에서의 거리"라 뜻이 약하며, 가까운 순으로 오해될 수 있다.
- Q11: 데이터 기준일 표시 여부. 표시하면 적재일을 `lunch-notice.constant.ts` 상수로 둔다.
- Q18: 점심운 문구 개수(그룹당 몇 줄)와 검수 방식.
- Q-L: 3.1 표의 업태 표시 이름 초안 승인. 특히 "탕류(보신용)"는 보신탕 업소가 섞여 있을 수 있다. 표시 이름("탕·보양식")을 유지할지, 그룹에서 뺄지 확인이 필요하다.
- Q-V (법률 확인 필요): 원본 CSV에 좌표가 없던 행은 브이월드(국토교통부 공간정보 오픈플랫폼) 지오코더 결과로 좌표를 채웠다(`지역음식점 파일/tools/geocode.mjs`). 지오코딩 결과를 DB에 저장하고 광고 수익이 있는 서비스에 쓰는 것이 브이월드 이용약관상 허용되는지 확인이 필요하다. 허용되지 않으면 해당 행의 좌표를 비우고 적재한다(그 가게는 목록에서 빠진다).

## 17. 개인정보처리방침·이용약관 변경 지점

`src/app/privacy/page.tsx` (frontend 담당, 문구 최종안은 PM 검토)

| 장 | 변경 |
|---|---|
| 1. 처리하는 정보 | 위치 정보 문단 추가: "주변 가게 보기"를 누를 때만 브라우저 위치 권한으로 현재 위치를 확인한다. 약 100m 단위로 반올림한 좌표를 검색 요청 본문으로 서버에 보내 반경 검색에만 쓰고, 서버·데이터베이스·접속 로그·브라우저 저장소에 저장하지 않는다. 권한을 거부하면 시·군·구를 직접 골라 쓸 수 있다. 첫 문장 "직접 입력받지 않습니다"와 어긋나지 않게 문장을 다듬는다 |
| 2. 브라우저 저장소 | "점심 추천은 위치, 선택 지역, 룰렛 결과를 브라우저에 저장하지 않습니다" 한 줄 |
| 3. 이용 목적 | "주변 가게 검색" 추가 |
| 4. 법적 근거 | 위치: 이용자의 요청(버튼)과 브라우저 권한 허용. 표현은 Q8 확인 결과에 맞춘다 |
| 6. 외부 서비스 | Supabase 설명을 "공개된 로또 결과·통계와 공공데이터 음식점 정보"로 고친다. Vercel 항목에 "위치 검색 요청 처리(좌표는 요청 본문에만 있고 접속 로그에 남지 않음)" 추가. 카카오맵·네이버지도: "지도 검색 링크로 이동하면 해당 사업자의 정책이 적용됩니다" 추가 |
| 10. 어린이 | 위치 정보와 14세 미만 관련 문구는 Q8 확인 결과에 따른다(설계 범위 밖) |

`src/app/terms/page.tsx` (D9 추천안 기준)

- 새 8장 "점심 추천 서비스": 오락 목적, 가게 정보는 공공데이터 기준이며 폐업·이전·휴업과 영업 여부를 보장하지 않음, 무작위 표시이며 추천·순위·광고가 아님, 위치 정보 사용 방식, 외부 지도 링크 이동 후 해당 사이트 정책 적용.
- 3장(데이터 출처 및 정확성): 공공데이터 음식점 정보와 출처 한 줄.
- 11장(→ 12장, 제3자 서비스): 카카오맵·네이버지도 링크.

기타 문서 (PM 또는 지정 담당)

- `COMPLIANCE.md` 11장에 Lunch 항목(타로·운세 형식), 6장에 경로별 Permissions-Policy, 법률 검토 상태(Q8은 사용자 확인 후 "위험 수용" 또는 "검토 완료").
- `THIRD_PARTY_NOTICES.md`: 공공데이터 음식점 정보 출처·이용 조건(Q12 확정 문구), 브이월드 지오코딩 사용 사실(Q-V 결과에 따라).
- `README.md`: API 표에 `POST /api/lunch/restaurants`, 데이터베이스 절의 "모든 테이블 공개 읽기" 문장을 restaurants 예외로 수정, 0004 링크, 기능 목록에 점심 추가.
- `DEPENDENCY_LICENSES.md`: 변경 없음.

## 18. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 음식점 인허가 정보(상호, 업태, 주소, 좌표) | 행정안전부 지방행정 인허가 데이터(공공데이터포털 제공 지역별 CSV) | 공공데이터 이용허락 범위 / 공공누리 유형 확인 필요 | 법률 확인 필요 (Q12, 사용자가 출시 전 확인) |
| 누락 좌표 지오코딩 결과 | 브이월드 지오코더 API (국토교통부) | 브이월드 오픈API 이용약관 | 법률 확인 필요 (Q-V) |
| EPSG:5174 → WGS84 좌표 변환 | `proj4` (개발 시점 도구, 저장소 밖 `지역음식점 파일/tools`) | MIT | 가능. 런타임·저장소에 포함되지 않아 고지 대상 아님. 도구를 저장소에 들이면 `DEPENDENCY_LICENSES.md`에 추가 |
| 지도 검색 링크 | 카카오맵, 네이버지도 웹 | 각 서비스 이용약관 | 링크 이동만, API·로고 미사용. 링크 정책과 URL 형식 확인 필요 (Q17) |
| "카카오", "네이버" 명칭 | 각 사 상표 | 상표 | 링크 라벨 텍스트로만 사용. 로고 미사용 |
| 업태 그룹 표시 이름, 점심운 문구, FAQ, 고지 | 자체 작성 | 프로젝트 라이선스 | 가능 |
| 시·도/시·군·구 목록과 대표 지점 | 위 공공데이터에서 파생 | 원 데이터 조건을 따른다 | Q12에 포함 |
| 새 라이브러리·폰트·이미지 | 없음 | - | - |

개인정보: 사용자 좌표(반올림)를 처리하지만 저장하지 않는다. 음식점 데이터에는 대표자명 등 개인 식별 정보가 없다. 위치정보법 적용 여부(Q8)는 사용자가 출시 전에 확인한다.

## 19. 외부 의존성

- 새 npm 라이브러리 없음. 쓰는 것: `zod`, `@tanstack/react-query`, `framer-motion`, `axios`(`http`), `@supabase/supabase-js`, shadcn `Select`(없으면 shadcn으로 추가, 새 패키지가 생기면 PM 승인과 `DEPENDENCY_LICENSES.md` 갱신).
- 외부 서비스: Supabase(기존), 카카오맵·네이버지도(링크 이동만). 런타임에 외부 API를 부르지 않는다.
- 브라우저 API: Geolocation(HTTPS 필요, 운영은 HTTPS).

## 20. 담당별 작업 순서

의존 순서: D-1 → D-2 → (사용자 적용·적재) → D-3. B-1은 바로 시작 가능. F는 B-1 이후 시작하고, API는 목(mock)으로 먼저 개발할 수 있다.

- db:
  - D-1 CSV에서 16개 업태 원본 문자열과 개수를 확인하고 3.1 표와 대조. 다르면 PM에 보고.
  - D-2 `supabase/migrations/0004_lunch_search.sql` 작성(5.3).
  - (사용자) 0003 → 0004 적용, 적재, `VACUUM ANALYZE`, 용량 확인. 실행 전 PM이 확인을 받는다.
  - D-3 4.3 성능 확인, anon 키로 `restaurants` 조회와 함수 실행이 막히는지 확인.
- backend:
  - B-1 `lunch.type.ts`, `lunch-group.constant.ts`, `lunch-search.constant.ts`, `lunch-validation.util.ts`, `lunch-geo.util.ts` (frontend와 공용이므로 가장 먼저)
  - B-2 `scripts/lunch-regions/generate.mjs` 작성·실행 → `lunch-region.constant.ts` 생성 (8.2)
  - B-3 `src/lib/rate-limit.ts`
  - B-4 `lunch-restaurant.repository.ts` (D-2 함수 시그니처 기준, D-3 전에는 로컬·스테이징에서 확인)
  - B-5 `src/app/api/lunch/restaurants/route.ts` (6장, 7장)
  - B-6 `next.config.ts` `/lunch/today` Permissions-Policy (D8)
  - B-7 `src/features/api-docs/specs/lunch.openapi.json`
- frontend:
  - F-1 `src/components/common/roulette.component.tsx` (B-1 없이 시작 가능, ui-ux 명세 필요)
  - F-2 `lunch-pick.util.ts`, `lunch-map-link.util.ts`, `lunch-geolocation.util.ts`
  - F-3 `lunch.service.ts`, `use-lunch-restaurants.query.ts` (B-1 이후)
  - F-4 `use-lunch-today.hook.ts`
  - F-5 `today/components/*` (지역 선택은 B-2 이후)
  - F-6 `lunch-luck`, `lunch-notice`, `lunch-faq`, `lunch-seo`, `lunch-copy-rule` 상수와 `page.tsx` (서버 콘텐츠, JSON-LD, noindex 유지)
  - F-7 `privacy/page.tsx`, `terms/page.tsx` (17장)
  - F-8 `menu.constant.ts` 점심 항목 설명·예시 정정 (13장)
  - F-9 출시 작업: `comingSoon` 제거, noindex 덮어쓰기 제거. 21장 체크리스트 완료 후에만
- qa: `e2e/lunch.spec.ts`(위치 허용·거부·실패는 Playwright geolocation 권한과 `setGeolocation`, API는 `page.route` 목), `e2e/lunch-copy.spec.ts`(금지 표현, 서버 HTML). API 직접 호출 테스트는 `Origin` 헤더를 넣어야 한다(6.3). 다른 경로에서 `geolocation=()` 유지 확인.
- PM: README, COMPLIANCE, THIRD_PARTY_NOTICES, REFACTORING.md 34~37행 정정, `.gitignore`(원본 데이터 폴더).

## 21. 출시 전 체크리스트

- [ ] Q8 위치정보 관련 법령 적용 여부 확인(사용자). COMPLIANCE에 "위험 수용" 또는 "검토 완료" 기록
- [ ] Q12 공공데이터 이용 조건(상업적 이용, 출처 표기, 공공누리 유형) 확인(사용자), 출처 문구 확정
- [ ] Q-V 브이월드 지오코딩 결과 저장·상업 이용 조건 확인(사용자). 불가하면 해당 좌표를 비우고 재적재
- [ ] Q17 카카오맵·네이버지도 검색 링크 정책 확인, 두 URL 형식이 PC·모바일(iOS Safari, Android Chrome)에서 검색 결과를 여는지 확인
- [ ] Q19 동기화 cron 없이 출시 허용 여부, 데이터 기준일 표시(Q11)
- [ ] Supabase: 0003·0004 적용, 적재, `VACUUM ANALYZE`, DB 용량 450MB 이하
- [ ] anon 키로 `restaurants` 직접 조회와 RPC 실행이 막혀 있음
- [ ] 4.3 성능 목표(p95 100ms) 확인
- [ ] Vercel 런타임 로그와 Supabase API·Postgres 로그에 좌표가 남지 않음(실제 요청 몇 건으로 확인), `log_min_duration_statement` 설정 확인
- [ ] `/lunch/today`에서만 위치 권한이 열리고 다른 페이지는 `geolocation=()`
- [ ] 개인정보처리방침, 이용약관, COMPLIANCE 11장·6장, THIRD_PARTY_NOTICES, README 반영
- [ ] 점심운 문구 검수(Q18), `e2e/lunch.spec.ts`·`e2e/lunch-copy.spec.ts` 데스크톱·모바일 통과
- [ ] `pnpm typecheck`, `pnpm lint` 통과
- [ ] 원본 데이터 폴더가 커밋되지 않음
- [ ] F-9: `comingSoon` 제거, noindex 제거, `/sitemap.xml`에 `/lunch/today`, 메타·JSON-LD 확인(AC-29~31)
- [ ] (선택) Vercel Firewall 경로별 rate limit 규칙

## 22. 파일 충돌 위험

- `src/constants/menu.constant.ts`: 작업 트리에 이미 미커밋 변경이 있다(`menu-icon.constant.ts`, `theme.constant.ts`도 같다). F-8·F-9는 이 변경을 커밋한 뒤 frontend 한 명이 순서대로 고친다. Q15(colorClass)도 같은 파일이라 F-8과 묶는다.
- `next.config.ts`: B-6만 고친다. 다른 기능 작업과 동시에 헤더를 고치지 않는다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`: F-7 한 명만. 약관 장 번호를 밀면(D9) 다른 문서의 장 번호 언급과 충돌하므로 COMPLIANCE 수정과 같은 PR로 한다.
- `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `REFACTORING.md`: 작업 트리에 미커밋 변경이 있다. PM이 한 번에 고친다.
- `src/features/lunch/types/lunch.type.ts`, `constants/lunch-group.constant.ts`, `constants/lunch-search.constant.ts`, `utils/lunch-validation.util.ts`: backend(B-1)가 만들고 frontend는 읽기만 한다. 바꿀 일이 생기면 PM을 거친다.
- `constants/lunch-region.constant.ts`: 생성 파일. 스크립트로만 바꾼다. 손으로 고치지 않는다.
- `src/components/common/roulette.component.tsx`: 공용 위치라 이후 돌림판 기능과 겹친다. 이번에는 frontend만 만든다.
- `supabase/migrations/`: 0004만 새로 쓴다. 0001~0003은 건드리지 않는다.
- `src/features/api-docs/specs/`: 새 파일만 추가. 병합 유틸은 바꾸지 않는다.
- `src/lib/rate-limit.ts`: 새 파일. lotto `export/route.ts`는 이번에 바꾸지 않는다.
