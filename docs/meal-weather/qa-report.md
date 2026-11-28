# meal-weather QA 보고서

- 실행일: 2026-11-28
- 입력: `docs/meal-weather/plan.md`의 완료 조건 중 `[E2E]` (AC-1~AC-6)
- 테스트 파일: `e2e/meal-weather.spec.ts`, 헬퍼 `stubWeather` 추가(`e2e/helpers/meal.util.ts`)

## 실행 명령과 결과

```
pnpm exec playwright test e2e/meal-weather.spec.ts --project=desktop
pnpm exec playwright test e2e/meal-weather.spec.ts --project=mobile
pnpm exec playwright test e2e/meal.spec.ts e2e/meal-location.spec.ts --project=desktop
```

| 프로젝트 | 통과 | 실패 | 건너뜀 |
|---|---|---|---|
| desktop (meal-weather) | 6 | 0 | 0 |
| desktop (meal, meal-location 회귀) | 13 | 0 | 0 |
| mobile (@smoke만) | 1 | 0 | 0 |

전체 회귀는 PM이 마지막에 한 번 돌린다.

## 테스트 구성

| AC | 흐름 |
|---|---|
| AC-1, 4, 5 | 서울 + 동네 "강남역"으로 돌림: 날씨 줄·출처 링크(target=_blank)·정확도, 동네 미리보기·지도 링크, 날씨 요청은 region 하나(목록 key), 사이트로 가는 요청에 동네·메뉴 이름 없음, 위치 API 0회, 저장소·쿠키에 지역·날씨 값 없음, 뽑은 뒤 지역·스위치를 바꿔도 안내 불변 |
| AC-1, 3 | 눈·비·더움·추움 문구 4종, 보통은 출처·정확도만, 503은 실패 안내 한 줄과 결과 |
| AC-2 | 지역 미선택 / 스위치 끔: `/api/meal/weather` 요청 0건, 날씨 영역 없음 |
| AC-3 | 응답을 붙잡아 둔 조회 중에도 결과가 나옴 |
| AC-4, 6 | 안내 2 기본 접힘·펼침, Tab 순서(지역 → 스위치 → 안내 2 → 돌리기), 새로고침 후 지역 비고 스위치 켜짐 |
| AC-6 @smoke | 320px 가로 스크롤 없음, 모든 요소 보임, Tab으로 지도 링크 도달 |

## 공통 검사

`openPage`가 응답 400 미만과 `h1`을 확인한다. 메타·pageerror는 기존 `meal.spec.ts`가 이미 검사하므로 새로 만들지 않았다.

## 실패 항목

없음. (첫 실행에서 Tab 순서 테스트가 실패했으나 테스트 셀렉터 오류였다: `summary` 필터를 `has`에 main 기준 로케이터로 넣어서 찾지 못했다. `hasText`로 고쳐 통과.)

## 남은 이슈

- `[단위]`·`[정적]` AC(AC-7~16)는 이 티켓 범위가 아니다.
- AC-3의 "조회 중"은 응답 지연으로 검증했다. 타임아웃(3초) 경과 동작은 단위 테스트 몫이다.
- 보통 날씨의 "아이콘 없음"은 문구 부재로만 확인했다.

## 재검증: 스핀 대기(최대 3초) 동작 변경

실행: `pnpm exec playwright test e2e/meal-weather.spec.ts --project=desktop` → 10 passed. `pnpm vitest run unit/meal` → 183 passed. `meal.spec.ts`, `meal-location.spec.ts`, `swagger-docs.spec.ts` 데스크톱 → 21 passed, 1 failed.

테스트 변경:
- 기존 "조회 중에도 룰렛 가능"은 새 동작(3초 대기 후 실패 문구)과 어긋나 5개로 교체했다: 1초 지연 시 첫 뽑기에 날씨, 6초 지연 시 3초 뒤 실패 문구, 연타 시 결과 1회·요청 1건, 대기 중 스위치 끄면 날씨 줄 없음, 캐시 있으면 두 번째 뽑기 재요청 없음.
- `stubWeather`에 `delayMs`(기본 0) 추가. 기존 호출은 그대로 동작한다.
- "즉시 뽑힘"은 시간이 아니라 요청 1건 유지로 확인했고, 시간 상한은 느슨하게(6초 미만)만 걸었다.

실패 (앱 결함 의심): `e2e/meal.spec.ts:84` AC-7 "회전 중에는 끼니 변경이 무시된다".
- 재현: 돌리기 클릭과 저녁 라벨 클릭을 같은 틱에서 `page.evaluate`로 실행. 점심 radio가 checked가 아니게 된다.
- 원인 추정: `resolveSnapshot`이 async라 돌리기 직후 같은 틱에는 아직 회전 중 상태가 아니어서 끼니 변경이 막히지 않는다. 대기 중(최대 3초)에도 끼니·칩 변경이 막히는지 확인이 필요하다.
- 담당: frontend-dev (돌리기 클릭 시점에 즉시 회전·대기 상태를 켜서 입력을 잠글 것).

## 재검증: 기온 추가·대기 잠금 (2026-11-28)

실행: `pnpm typecheck` 통과, `pnpm lint` 통과, `pnpm vitest run` 1044 passed / 6 failed(모두 `unit/meal/meal-weather-temperature.test.ts`). E2E 데스크톱(meal-weather, meal, meal-location, swagger-docs) 31 passed / 2 failed. 모바일 `@smoke`(meal-weather) 1 passed.

테스트 변경:
- `meal-weather-repository.test.ts`: 호출 수 기대를 쌍(2회) 기준으로 고쳤다(캐시 히트 2, 60분 뒤 4, 다른 지역 4, 동시 요청 2). 자정 테스트는 실황 호출이 예보 응답을 받지 않도록 핸들러에 `!isNowcast` 추가. 기온 응답 형태, 단일 성공 200, 둘 다 실패·자료 없음 에러, 반올림(-0 없음), 반올림 전 값 분류를 추가했다.
- `meal-weather-route.test.ts`: 200 본문 키 5개. `meal-weather.test.ts`: ready 스냅샷에 기온 3개(typecheck 해소).
- 새 `meal-weather-temperature.test.ts`: `getMealTemperatureText` 6줄 표와 금지어 검사.
- `meal-weather.spec.ts`: `ok()`가 기온 기본값을 싣고, AC-T1~T4 흐름 테스트 1개 추가(기온 3개, 일부 null, 모두 null, 보통, 눈에서 문장 위, sr-only).

실패 1 (앱 결함): `getMealTemperatureText`가 이전 형식을 낸다. 현재 `최저 4° · 최고 9° · 현재 6°` / `오늘 최저 4도, 최고 9도, 현재 6도`. 기대는 `오늘 4° ~ 9° · 현재 6°` / `오늘 기온 4도에서 9도, 현재 6도`이고, (4,null,6)은 `현재 6°`, (4,null,null)은 null이어야 한다(현재는 `최저 4°`). "최저·최고" 단어도 금지어와 충돌한다. E2E `meal-weather.spec.ts` AC-T1~T4도 같은 원인으로 실패한다. 재현: `pnpm vitest run unit/meal/meal-weather-temperature.test.ts`. 담당: frontend-dev(`meal-notice.constant.ts` 40행대 `TEMPERATURE_KEYS`·`getMealTemperatureText`).

실패 2 (앱 결함, 미해소): `e2e/meal.spec.ts:84` AC-7. 4회 반복 모두 재현. 돌리기와 저녁 라벨을 같은 틱에 누르면 점심 radio의 `checked` 속성은 남아 있으나 값(property)이 unchecked로 5초 내내 유지된다(`toBeChecked` 실패). `root.component.tsx`의 `locked={spinning || isResolving}` 도입 후 발생. 잠금은 걸리지만 막힌 끼니 클릭 뒤 제어 radio 상태가 복원되지 않는 것으로 보인다. 담당: frontend-dev(잠금 중 클릭이 radio 상태를 바꾸지 않도록, 예: `onChange` 무시 대신 입력 `disabled` 또는 클릭 `preventDefault`).
