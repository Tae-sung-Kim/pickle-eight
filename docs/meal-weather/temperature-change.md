# 날씨 기온 표시 추가 변경 (meal-weather)

작성일: 2026-11-28. 사용자 승인: 최저·최고 기온과 현재 기온을 모두 노출, 위치는 날씨 한 줄 위 별도 줄, 정확도 문구 유지.
이 문서는 plan.md, design.md, ui-ux-design.md의 "기온 숫자는 화면에 보이지 않는다" 결정을 바꾸는 변경 명세다. 충돌하는 문장은 이 문서가 우선하며, 개발 담당이 해당 문서를 고친다.

## 결정

- 화면에 보이는 값: 오늘 최저, 오늘 최고, 현재 기온. 예: "최저 4° · 최고 9° · 현재 7°". 값이 없는 항목은 빼고, 셋 다 없으면 줄을 그리지 않는다.
- 위치: 결과 카드 안, 날씨 한 줄(문장) 바로 위의 별도 줄. 보통 날씨에도 기온 줄은 보인다(문장은 없고 기온 줄 → 출처 → 정확도 순서).
- 스타일: 새 토큰·색·애니메이션 없이 기존 날씨 안내의 작은 보조 글씨(text-sm, muted)와 같게 한다.
- 정확도 문구("날씨는 실제와 다를 수 있습니다.")는 그대로 유지한다.
- 기온 숫자는 분류 기준을 바꾸지 않는다(더움 28°C 이상, 추움 5°C 이하는 그대로).
- 기온은 서버에서 반올림한 정수만 응답에 싣는다(원본 소수점·강수량 등 다른 원본 값은 계속 싣지 않는다).

## API 계약 변경 (`GET /api/meal/weather`)

200 응답 `{ condition, forecastDate, minCelsius, maxCelsius, currentCelsius }`. 세 기온은 정수 또는 `null`.

- `minCelsius`, `maxCelsius`: 단기예보의 오늘 `TMN`, `TMX`를 반올림한 값. 단기예보가 실패했거나 오늘 자료가 없으면 `null`.
- `currentCelsius`: 초단기실황 `T1H`를 반올림한 값. 실황이 실패했으면 `null`.
- 분류(`condition`)는 지금까지처럼 단기예보 우선, 단기예보를 쓸 수 없으면 실황(기온은 실황 값)으로 한다.
- 기상청 호출은 지역당 단기예보와 초단기실황 두 호출을 병렬로 보낸다(`Promise.allSettled`). 하나만 성공해도 응답은 200이고, 둘 다 실패하거나 둘 다 자료가 없으면 503이다. 성공 결과만 1시간 캐시하는 기존 규칙은 그대로다. 호출 수는 캐시 실패 1회당 2회로 늘어난다(지역 16곳 기준 하루 약 770회, 개발계정 한도 10,000건 이내).
- 응답에 지역 값, 격자, 강수량 등 다른 원본 값, 키는 계속 넣지 않는다.
- 클라이언트는 숫자가 아니거나 없는 기온 필드를 `null`로 본다(분류만 유효하면 정상 응답으로 처리).

## 영향 범위

- 백엔드: `meal-weather.repository.ts`, `route.ts`, `meal.openapi.json`, `meal.type.ts`(응답·스냅샷 타입), design.md의 API 계약·기상청 호출 절
- 프론트: `meal-weather.service.ts`(검증), `use-meal-weather.hook.ts`(스냅샷에 기온 포함), `weather-note.component.tsx`(기온 줄), ui-ux-design.md, plan.md AC 추가
- 테스트(QA): 단위 `meal-weather-repository.test.ts`(호출 2회, 일부 실패 허용), `meal-weather-route.test.ts`(본문 키), E2E(`stubWeather` 본문에 기온, 기온 줄 표시)
