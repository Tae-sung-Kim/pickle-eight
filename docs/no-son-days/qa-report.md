# 손 없는 날 달력 QA 보고서 (QA-2: E2E와 정적 확인)

작성: qa, 2026-11-25. 단위 테스트(QA-1)와 전체 회귀(QA-3)는 이 보고서 범위 밖이다.

## 실행

- `pnpm exec playwright test e2e/no-son-days.spec.ts --project=desktop --project=mobile`
- 결과: 8개 통과 (데스크톱 7개, 모바일 `@smoke` 1개). 실패 없음.
- 시각 고정은 `page.clock.install`(한국 시간 낮 12시)로 했다. 설계 7.3절 방식이다.

## E2E 구성

| 테스트 | 담은 AC·검사 |
|---|---|
| 허브 구성과 달력 이동 (`@smoke`) | AC-1, 2. 공통 검사(상태 400 미만, pageerror·hydration 없음, h1 한 개, title·description·canonical), 광고 비활성 시 빈 `my-10` 래퍼가 `display: none`, 320px 가로 스크롤 없음과 7열 |
| 윤달 칸 | AC-2. 2028-07, 320px에서 "윤N.N"이 한 줄 |
| 범위 시작 | AC-2. 2026-01에서 이전 버튼 `aria-disabled`, 눌러도 달이 안 바뀜 |
| 범위 끝 | AC-2. 2050-01-01 고정 시 범위 밖 문구, 2049년 12월, 다음 버튼 비활성 |
| 연도 화면 | AC-3. 허브에서 2027 링크 이동, 12개 월 카드, 음력 표기, 현재 연도 `aria-current`, 월 바로가기 데스크톱 숨김·320px 표시, 320px 가로 스크롤 없음 |
| 헤더 1024px·1280px | 메뉴 링크가 한 줄, 헤더 높이 65px 이하, 가로 넘침 없음. "손 없는 날" 링크 보임 |

## 정적 AC 확인

- AC-7 통과. `'use client'`는 `today-calendar`, `use-korea-today`, `calendar`, `use-calendar-month` 네 파일뿐이다. 연도 월 목록, 규칙 설명, 고지, 연도 링크는 서버 컴포넌트다.
- AC-10 통과. 허브·연도 `page.tsx` 모두 `buildMetadata`와 `jsonLdBreadcrumb`+`JsonLdComponent`를 쓴다. 연도 화면은 `generateStaticParams`와 `dynamicParams = false`. `src/app/sitemap.ts`에 `getNoSonDaysYearPaths()`가 들어 있다. `comingSoon` 없음.
- AC-11 통과. 약관에 "11. 손 없는 날 달력 서비스"가 있고 이후 장이 이어진다(12. 광고 및 쿠키). 방침에 "입력란이 없고 받는 정보가 없다" 문단이 있다. 시행일 값은 확인만 했고 FE-6 범위다.
- AC-12 통과. `AdFitSlotComponent`는 허브 하단 한 곳(`hub/components/root.component.tsx`)뿐이다. 달력·상태 카드·고지 사이에는 없다. 연도 화면에는 없다. 제휴·외부 링크 없음.
- AC-13은 BE-4b 뒤 확인 대상이다. `verification.md`가 아직 없다.

## 이슈

- 앱 결함 없음.
- 광고 켜진 상태(광고 단위 설정 시)의 간격은 이 환경에서 확인하지 못했다. 광고가 꺼진 상태에서는 빈 래퍼가 숨겨지는 것만 확인했다.
- 확인 중 알게 된 점: 이전·다음 버튼은 `aria-disabled`라서 Playwright가 비활성으로 보고 클릭이 막힌다. 범위 끝 클릭 무시는 `click({ force: true })`로 확인했다.

## 테스트 변경 사유

- 새 파일이라 기존 테스트 변경 없음. `e2e/lucky-draw.spec.ts`는 건드리지 않았다.
