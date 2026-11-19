# lunch QA 보고서 (T-13, T-14)

작성: qa, 2026-11-19
대상: `/lunch/today` (출시 전 상태, noindex, comingSoon)
입력: `docs/lunch/plan.md` AC-1~40, `docs/lunch/design.md` 14.1, 14.2, `docs/lunch/dev-tasks.md` T-13, T-14

## 실행 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm exec playwright test e2e/lunch-copy.spec.ts --project=desktop --workers=1` | 11 통과 |
| `pnpm exec playwright test e2e/lunch.spec.ts --workers=1` (데스크톱 25 + 모바일 25) | 48 통과, 2 실패 (데스크톱 AC-4, AC-23) |
| `pnpm exec playwright test e2e/lunch.spec.ts --workers=1 --project=desktop -g "AC-23:"` 단독 재실행 | 통과 (간헐 실패) |
| `pnpm exec playwright test e2e/lunch.spec.ts --workers=1 --project=desktop -g "AC-4:"` 단독 재실행 | 실패 (90초 타임아웃, 재현됨) |

`pnpm exec biome check`는 두 파일 모두 경고 3건(innerText 권고)만 있다. 렌더된 텍스트(sr-only 제외)를 봐야 해서 innerText를 유지했다.

## 수정 전 실패 기록 (해소됨)

### F-1. (해소됨) 돌림판 SVG가 "다시 뽑기" 클릭을 가로챔 (아래는 수정 전 기록)

- 파일: `e2e/lunch.spec.ts` AC-4(359줄 근처), AC-23(629줄 근처). 앱 코드는 `src/components/common/roulette.component.tsx`의 회전하는 `motion.svg`, 배치는 `src/features/lunch/today/components/spin-panel.component.tsx`.
- 증상: 첫 결과 뒤 `다시 뽑기` 버튼을 누르면 `<svg ... class="absolute inset-0 h-full w-full"> from <div aria-hidden="true"> subtree intercepts pointer events`로 클릭이 막힌다. 데스크톱 viewport(1280x720)에서 AC-4(10회 반복)는 항상, AC-23(2회)은 간헐적으로 실패한다.
- 원인 추정: 돌림판 컨테이너(정사각형)는 버튼 위 16px 간격으로 붙어 있다. 회전 뒤 SVG 박스가 약 45도 비스듬하게 놓이면 네 모서리가 컨테이너 바깥(최대 약 78px)으로 나와 아래 버튼 위를 덮고, SVG 박스가 포인터 이벤트를 받는다. 최종 각도에 따라 버튼 가운데 또는 일부가 눌리지 않는다. 실제 사용자도 같은 클릭 실패를 겪는다. 고정 난수(각도 0)에서는 재현되지 않아 AC-19 등은 통과했다.
- 재현 방법: `pnpm exec playwright test e2e/lunch.spec.ts --workers=1 --project=desktop -g "AC-4:"`. 수동으로는 `/lunch/today`에서 한식만 남기고 여러 번 `다시 뽑기`를 눌러 본다.
- 수정 방향(참고): 회전 SVG에 `pointer-events-none`을 주거나 돌림판 래퍼에 `overflow-hidden` 처리. 돌림판은 aria-hidden 장식이므로 포인터 이벤트가 필요 없다.
- 담당: frontend-dev

## AC별 결과

범례: 통과 = 데스크톱·모바일 모두 통과. 데이터 검사는 `e2e/lunch-copy.spec.ts`(데스크톱), 화면 검사는 `e2e/lunch.spec.ts`(양쪽).

| AC | 내용 | 결과 | 테스트 |
|---|---|---|---|
| AC-1 | 로그인 없이 돌리기 | 통과 | lunch AC-1, AC-2, AC-8, AC-9, AC-12 |
| AC-2 | 결과가 후보 안의 메뉴 | 통과 | 위 테스트 |
| AC-3 | 기본 칩 6개 모두 선택 | 통과 | lunch AC-3 |
| AC-4 | 한 카테고리만 켜고 10회 | 통과 (F-1 해소) | lunch AC-4 |
| AC-5 | 칩 모두 끄면 버튼 비활성 + 안내 | 통과 | lunch AC-5 |
| AC-6 | 동작 줄이기에서 중간 회전 없음 | 통과 | lunch AC-6 (style transform 변화 기록) |
| AC-7 | 회전 중 잠금 | 통과 | lunch AC-7 |
| AC-8 | 결과 알림 role=status, 포커스 유지 | 통과 | lunch AC-1 묶음 |
| AC-9 | 오늘의 점심운 라벨 + 문구 | 통과 | lunch AC-1 묶음, copy AC-9 (24줄) |
| AC-10 | 점심운 금지 표현 없음 | 통과 | copy AC-10, 점심운 메뉴·국물·맛 언급 없음 |
| AC-11 | 본문 인기·베스트·광고·추천 메뉴 없음 | 통과 | lunch AC-11, AC-12, copy AC-10~12 |
| AC-12 | 가격·칼로리·별점·후기·건강 설명 없음 | 통과 | 같은 테스트 |
| AC-13 | 지도 링크 2개 | 통과 | lunch AC-13~17 |
| AC-14 | 새 탭, 외부 이동 표시 | 통과 | target, rel 3종, 접근성 이름, popup 이벤트 |
| AC-15 | 검색어에 메뉴 이름 | 통과 | href와 popup 주소 디코드 |
| AC-16 | 주소에 메뉴 이름 외 값 없음 | 통과 | 쿼리·해시 없음, referer 없음 |
| AC-17 | 링크 키보드 실행 | 통과 | lunch AC-17, AC-31 |
| AC-18 | 다시 뽑기 | 통과 | lunch AC-18 |
| AC-19 | 직전 메뉴 연속 없음 | 통과 | 고정 난수(모두 0): 첫 메뉴, 다음은 둘째 메뉴 |
| AC-20 | 조건 변경 시 결과 지움 | 통과 | lunch AC-20 |
| AC-21 | 새로고침 시 초기화 | 통과 | lunch AC-21 |
| AC-22 | 위치 권한 요청 없음 | 통과 | geolocation 호출 0회, `Permissions-Policy`에 `geolocation=()` |
| AC-23 | 저장소·쿠키·주소에 저장 없음 | 통과 | lunch AC-23 |
| AC-24 | 쿠키 거부 + 광고 차단에서 동작 | 통과 | lunch AC-24 |
| AC-25 | h1 바로 아래 상시 고지 | 통과 | lunch AC-25~28 |
| AC-26 | 무작위·추천 아님 고지 | 통과 | 같은 테스트 |
| AC-27 | 외부 링크 안내 | 통과 | 같은 테스트 |
| AC-28 | 결과 하단 고지 | 통과 | 같은 테스트 |
| AC-29 | 보상 없음 고지(U5 문장) | 통과 | copy AC-29, lunch AC-25~28 |
| AC-30 | 약관 9장·13장, 방침 6장 문구 | 통과 | lunch AC-30 (HTML 텍스트 검사). `COMPLIANCE.md` 11장은 PM 작성 대기(T-18)라 검사하지 않음 |
| AC-31 | 키보드만으로 전체 흐름 | 통과 | lunch AC-17, AC-31 |
| AC-32 | 조작 요소 접근성 이름 | 통과 | lunch AC-32 |
| AC-33 | 모바일에서 동일 동작 | 통과 (AC-23 외 모든 모바일 테스트 통과, AC-4, AC-23도 모바일 통과) | 모바일 프로젝트 25개 |
| AC-34 | JS 없이 받은 HTML에 h1·설명·고지·사용 순서·FAQ | 통과 | lunch AC-34 (`request.get`) |
| AC-35 | JSON-LD BreadcrumbList, FAQPage | 통과 | lunch AC-35 |
| AC-36 | 출시 전 noindex, 준비 중 | 통과 | lunch AC-36 (`comingSoon` 값으로 분기) |
| AC-37 | 출시 후 canonical·og | 해당 없음(출시 전, T-21 보류) | 미작성 |
| AC-38 | 출시 후 준비 중 해제·sitemap | 해당 없음(출시 전, T-21 보류). 출시 전에는 sitemap에 없음을 AC-36에서 확인 | 미작성 |
| AC-39 | 메뉴 항목 설명·예시 금지 단어 | 통과 | copy AC-39 |
| AC-40 | 메뉴 데이터 구조 | 통과 | copy AC-40, L2 |

## 문구·데이터 검사 항목 (T-13)

모두 통과.

- 메뉴 48개, 카테고리 10/8/8/8/6/8, 국물 15·건조 33, 국물 메뉴 이름 집합과 경계 메뉴 5개(냉면 국물, 백반 건조, 누룽지탕 국물, 소바 건조, 어묵 국물) 일치, 이름·id 중복 없음, id 형식.
- 점심운 24줄(카테고리당 4줄, 중복 없음), 메뉴 이름·국물·맛 단어 없음, 금지어·금지 패턴 없음.
- 소재명 바꿔치기 검사: 메뉴 이름과 카테고리 이름을 가린 뒤 같은 줄이 없고, 어절 하나만 다른 쌍이 없음.
- 고지 5문장이 `LUNCH_COPY_ALLOWED_SENTENCES`와 정확히 같음. 보상 없음 문장이 U5 승인 문구와 같음.
- 고지·라벨·FAQ·SEO·`MENU_LIST` 점심 항목에 금지 표현 없음(허용 문장 제외). `colorClass`는 `text-menu-lunch`.
- FAQ 5개, 질문·답 중복 없음, 답끼리 같은 문장 없음, 답에 "보장" 없음.

## 확인 사항과 한계

- JSON-LD: 페이지에는 사이트 공통 `Organization`, `WebSite`(루트 레이아웃)와 페이지 전용 `BreadcrumbList`, `FAQPage`가 있다. 테스트는 사이트 공통 두 개를 제외하고 페이지 전용 두 개만 있는지(가게 정보 타입 없음 포함)를 본다. plan AC-35의 "두 가지뿐"은 페이지 전용 기준으로 해석했다. 사이트 공통 포함 4개 기준이면 문구 정정이 필요하다(PM 판단).
- 지도 새 탭은 `context.route`로 가로채 외부 사이트에 접속하지 않았다. 실제 앱 열림·인앱 브라우저는 출시 전 수동 확인(design 15장)이다.
- `src/`, `supabase/` 파일은 수정하지 않았다. 운영 코드에 테스트 전용 경로가 있는지 검사(grep)는 이 실행 범위 밖이다.
- 회귀(T-19)는 위 표대로 실행했다.
- 모두 `--workers=1`로 단독 실행했다.

## 출시 후 최종 결과 (2026-11-19)

점심이 공개 상태가 되어(`comingSoon`·noindex 해제, sitemap 포함) 출시 전 기준을 출시 후 기준으로 바꿨다.

| AC | 기준 | 결과 |
|---|---|---|
| AC-36 | index 허용(noindex 없음), canonical·og:url 경로가 `buildMetadata` 결과와 같음, og:title·og:image 존재 | 통과 |
| AC-37 | `/sitemap.xml`에 `/lunch/today` 포함 | 통과 |
| AC-38 | `MENU_LIST` 점심 `comingSoon` 아님, 홈에 '준비 중' 없음 | 통과 |
| AC-34 | 서버 HTML의 robots에 noindex 없음으로 변경 | 통과 |

- 실행: `pnpm exec playwright test e2e/lunch.spec.ts e2e/lunch-copy.spec.ts e2e/lotto.smoke.spec.ts --workers=1`
- `lunch.spec.ts` 단독 재실행: 54 통과, 0 실패. `lunch-copy.spec.ts`는 데스크톱만 실행(모바일은 설계상 skip).
- canonical·og:url은 사이트 주소 env가 테스트 프로세스와 서버에서 다를 수 있어 경로만 비교한다.
- 실패 1건(점심 아님): `e2e/lotto.smoke.spec.ts:86` 'PC 헤더에 준비 중 배지가 보인다'. 원인: 이제 `comingSoon` 그룹이 없어 배지가 없다. 테스트가 낡았다. 담당: 테스트 수정(PM 확인 후 삭제 또는 변경 필요).

## 지도 링크 3개 변경 반영 (2026-11-19)

지도 링크가 카카오·네이버·구글 3개로 늘어 2개 기준 검사를 고쳤다.

| 대상 | 변경 | 결과 |
|---|---|---|
| `lunch.spec.ts` AC-13~17 | 링크 3개, 구글 링크 보임, 호스트 허용 목록에 `www.google.com`, 구글은 경로 `/maps/search/`와 파라미터 `api=1`, `query=<메뉴명>`만 허용(위치·좌표 없음), href가 명세 URL과 정확히 같음, popup 이벤트와 `context.route` 가로채기 3개 모두, referer 3건 이상 | 통과 |
| `lunch.spec.ts` AC-24 | 링크 개수 2에서 3으로 | 통과 |
| `lunch.spec.ts` AC-30 | 약관 `지도 검색 페이지(카카오맵, 네이버지도, 구글 지도)`, 방침 `점심 메뉴 룰렛의 지도 검색 링크(카카오맵, 네이버지도, 구글 지도)` | 통과 |
| `lunch-copy.spec.ts` | 외부 링크 안내 `카카오·네이버·구글`, FAQ 4번 답에 3개 서비스명과 `뽑힌 메뉴 이름만 전달` 검사 추가. 허용 문장·금지어 검사는 상수 기반이라 3개 문구로 통과 | 통과 |

- 실행: `pnpm exec playwright test e2e/lunch.spec.ts e2e/lunch-copy.spec.ts --workers=1`
- 결과: 66 통과, 0 실패, 12 skip(copy 모바일은 설계상 skip).
- 외부 사이트는 `context.route`로 가로채 실제 접속 없음. `src/` 수정 없음.

## 지도 버튼 라벨·돌림판 라벨 보정 반영 (2026-11-19)

- 앱 변경: 지도 버튼 라벨 `카카오맵`·`네이버지도`·`구글 지도`(링크 접근 이름은 라벨 뒤에 sr-only `(새 탭에서 외부 사이트 열림)`이 붙음), 돌림판 라벨 180도 보정.
- 테스트 수정: `e2e/lunch.spec.ts`의 `mapsOnly` 선택자(147줄)와 549·552·555줄 링크 이름 검사를 새 라벨 기준으로 바꿨다. `lunch-copy.spec.ts:258`은 상수 라벨 검사라 수정 없이 통과.
- 실행: `lunch.spec.ts`, `lunch-copy.spec.ts` `--workers=1` 전체 66 통과, 0 실패, 12 skip(copy 모바일은 설계상). AC-4 `--repeat-each=5` 데스크톱·모바일 10회 통과.
- 앞선 한 번의 실행에서 AC-22·AC-25~28이 실패했으나 다른 Playwright 실행과 서버를 같이 써서 생긴 간섭이었고, 단독 재실행에서 통과했다.
- 스크린샷(후보 12개 이하: 한식 + 국물 있음) 수동 확인용, 테스트 파일에는 없음.
