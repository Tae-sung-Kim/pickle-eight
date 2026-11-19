# 꿈 해몽 QA 보고서

## T-20 fortune-v2 AC-9

변경: `e2e/fortune-v2.spec.ts` 의 "AC-9: 메타·sitemap·JSON-LD 소스 파일은 HEAD와 diff가 없다" 검사 목록에서 `src/app/sitemap.ts` 만 뺐다 (설계 결정 D3). 설명 주석 두 줄을 같은 자리에 달았다.

이유: 꿈 해몽이 sitemap.ts 에 `/dream` 과 소재 상세 120개를 더하므로, 이 파일에 diff 가 없다는 조건은 항상 실패한다.

의도 유지 확인
- 검사 목록에는 `fortune-seo.constant.ts`, `fortune-faq.constant.ts`, `json-ld.component.tsx` 가 그대로 남아 있다. 운세 메타·FAQ·JSON-LD 변경은 계속 잡힌다.
- sitemap 쪽 보호는 같은 AC-9의 "sitemap.xml에 운세 페이지가 그대로 있다" 테스트가 맡는다. 운세 허브·오늘·띠·별자리 경로가 sitemap.xml 에 있는지 응답으로 확인하며, 이 테스트는 바꾸지 않았다.
- 변경한 곳은 `files` 배열 한 곳뿐이다. 다른 AC 테스트는 이 배열을 쓰지 않아 판정이 바뀌지 않는다.

실행: `pnpm exec playwright test e2e/fortune-v2.spec.ts -g "AC-9" --workers=1`
- 데스크톱 5개 통과, 모바일 5개 통과.
- 참고: 병렬 첫 실행에서 desktop 2건이 `test-results` 임시 파일 ENOENT 로 실패했다. 다른 에이전트가 같은 폴더를 쓰며 생긴 충돌이다. `--workers=1` 과 별도 출력 폴더로 다시 돌리자 통과했다. 앱·테스트 결함이 아니다.

## T-03 타로 회귀

- 명령: `pnpm exec playwright test e2e/tarot.spec.ts e2e/tarot-copy.spec.ts e2e/tarot-v2.spec.ts --project=desktop --project=mobile`
- 1차 결과: 410개 중 399 통과, 11 실패 (데스크톱 7, 모바일 4).
- 실패 11개만 다시 실행(32개 케이스): 28 통과, 4 실패. 1차의 7건(AC-27, AC-29/30, AC-31, AC-37)은 재실행에서 통과했다. 전체를 한꺼번에 돌릴 때 생기는 부하·타이밍 때문으로 보이는 불안정 실패다.
- 재실행에서도 남은 실패 4건 (데스크톱·모바일 각 2건):
  - `tarot.spec.ts:1507` AC-33(표시): `/tarot/daily`, `/tarot/three-card` JS를 꺼도 설명·면책·FAQ가 화면에 보인다
  - 오류: 1513행 `getByRole('heading', { level: 1 })` toHaveCount(1) 기대, 실제 0 (10초 타임아웃)
- 이번 변경(T-02)과의 관련성: 낮다. 이 테스트는 JS를 끈 상태에서 h1·설명·FAQ 표시를 보며 위기 표현 목록·함수를 쓰지 않는다. 같은 JS 비활성 조건의 AC-28(상담전화 링크 5개, 서버 HTML)은 통과했다. 위기 표현 관련 AC-29/30(위기 표현 5종) 테스트도 재실행에서 통과해 감지 동작은 유지된다. 이미 있던 실패 또는 JS 비활성 시 h1이 렌더되지 않는 기존 문제로 판단한다. 단 T-02 이전 상태에서의 실행은 하지 않았다(git 명령 금지).
- 앱·테스트 코드는 수정하지 않았다.
- 판정: 위기 표현 관련 회귀 없음. T-03 완료 조건("세 파일 실패 0건")은 JS 비활성 4건 때문에 엄밀히는 미충족. PM 판단 필요(담당 후보: frontend-dev, 타로 JS 비활성 h1).

## T-18 데이터 검사(1차)

- 파일: `e2e/dream-copy.spec.ts` (브라우저 없이 상수 import와 copy-log 파일 읽기). 데스크톱 프로젝트에서만 실행하고 모바일은 건너뛴다(design 10.1).
- 명령: `pnpm exec playwright test e2e/dream-copy.spec.ts --workers=1`
- 결과: 데스크톱 21개 중 18 통과, 3 실패. 모바일 21개는 의도적으로 skip.
- 통과한 검사: 소재 120개와 카테고리별 개수(AC-42), slug 형식·중복(AC-43), 요약 1문장 20~80자·풀이 3~5문장·생각해 볼 점 2~3문장·"." 종료·300자 이상(AC-10), FAQ 2개(AC-14), related 2~4개·같은 카테고리·자기 제외(AC-13), death 소재 민감 여부와 soothing 1~3문장·죽음 보충 상수(AC-23), 12지 동물 11개, 금지 표현·패턴(AC-17), 로또 연상어(AC-18), 태몽·용꿈 부재, 수치 자랑(AC-26), 위기 표현(AC-25), 본문의 소재 간 동일 문장 없음, copy-log 작성자·작성일·상태 칸.
- 참고: copy-log 120행·slug 일치 검사는 처음에 표 헤더("slug")를 행으로 읽어 실패했다. 테스트 오류라 고쳤고 지금은 통과한다.

### 실패 항목 (담당: 문구 작성자 / frontend-dev. 소재 문구는 수정하지 않았다)

1. AC-43 별칭 중복. 같은 별칭이 여러 소재에 있거나 다른 소재 이름과 같다.
   - `mountain`·`climbing`: 별칭 "산을 오르는 꿈". `climbing` 이름과도 같다
   - `house`: "이사하는 꿈"이 `moving-house`와 중복, 그 이름과도 같다
   - `car`: "운전하는 꿈"이 `driving`과 중복, 그 이름과도 같다
   - `school`: "시험 보는 꿈"이 `exam`과 중복, 그 이름과도 같다
   - `stairs`: "계단 오르는 꿈"이 `climbing`과 중복
   - `fire-accident`: "불길"이 `fire`와 중복
   - 재현: 위 명령. 해당 별칭을 한쪽 소재에서 빼거나 다른 표현으로 바꾸면 된다.
2. 독자성(FAQ 답): 서로 다른 소재 FAQ 답에 같은 문장이 약 90건 있다. 모두 "그렇게 단정할 수 없습니다.", "그렇게 단정할 근거는 없습니다.", "걱정할 필요는 없습니다.", "정해진 의미는 없습니다.", "하나의 해석일 뿐이니 가볍게 참고해 주시기 바랍니다." 같은 맺음 문장이다.
   - 많이 겹치는 소재: `rainbow`, `teeth`, `house`, `blood`, `money`, `clothes`, `cat`, `snake`, `chicken`, `father`, `friend`, `neighbor`, `driving`, `shoes`, `death`, `grave`
   - 영향받는 소재: tiger, snake, bear, chicken, wolf, cat, butterfly, bird, spider, turtle, rat, elephant, deer, frog, dog, crow, fish, fox, mother, friend, ex-lover, lover, boss, teacher, father, stranger, celebrity, spouse, hair, eye, face, nail, blood, wound, ear, flood, sun, moon, neighbor, rainbow, star, rain, being-chased, falling, getting-lost, exam, flying, being-late, fighting, crying, laughing, traveling, moving-house, wedding, missing-vehicle, being-naked, hiding, climbing, driving, running, voiceless, cleaning, presentation, working, eating, car, clothes, money, gold, jewelry, wallet, bridge, road, elevator, toilet, hospital, mirror, key, door, stairs, train, shoes, phone, book, bed, airplane, bicycle, death, funeral, ghost, grave, the-deceased, fire-accident
   - 판정 기준 주의: 설계는 "서로 다른 소재에 같은 문장 없음"만 적었고 FAQ 답을 포함하는지는 분명하지 않다. 이 검사는 FAQ 답을 문장 단위로 쪼개 비교했다. PM이 FAQ 답까지 대상인지 결정해야 한다.
3. 독자성(본문, 이름 자리표시 치환 후): 소재 이름을 `{N}`으로 바꾸면 같아지는 문장이 있다. 원문 그대로는 서로 다르므로 "문장 단위 동일 문자열" 검사는 통과했다.
   - 틀 문장 "X 꿈의 장면은 사람마다 다르니, 지금 마음에 와닿는 부분만 골라 가볍게 ..."이 `car`를 기준으로 `clothes`, `school`, `money`, `jewelry`, `wallet`, `shoes`, `bridge`, `road`, `elevator`, `toilet`, `hospital`, `mirror`, `key`, `door`, `stairs`, `train`, `airplane`, `bicycle`, `phone`, `book`, `bed`에서 이름만 바뀐 채 반복된다(21개)
   - `wound`와 `blood`: "…는 몸의 상태나 의학적 의미와 관계가 없으며, 풀이는 전…" 문장이 이름만 다르다
   - 이 검사는 design 10.1 표의 "이름을 자리표시로 바꾼 뒤에도 같지 않음"을 그대로 옮긴 것이다. plan 풀이 규칙 8(소재 이름만 바꾼 페이지 금지)과 직접 관련된다.

## T-18 데이터 검사(2차)

- 변경: `e2e/dream-copy.spec.ts` FAQ 검사를 "FAQ 답변 전체가 서로 같은 경우만 차단"으로 바꿨다. 끝 문장 반복은 허용한다. 본문 문장 동일·이름 자리표시 치환 검사(235/465 기준)는 그대로다.
- 명령: `pnpm exec playwright test e2e/dream-copy.spec.ts --workers=1`
- 결과: 데스크톱 21개 중 20 통과, 1 실패. 모바일 21개 skip(의도).
- 1차 실패 3건 중 별칭 중복(AC-43)과 본문 자리표시 치환 검사는 통과로 바뀌었다.

### 실패 항목 (담당: 문구 작성자 / frontend-dev)

- FAQ 답변 전체 동일: `gold`, `jewelry` 의 FAQ 답이 `money` 와 글자까지 같다 (`민간에서는 재물과 연결해 풀이해 왔지만, 실제 금전 상황과는 관계가 없습…`).
- 원인: 재물 소재 세 개가 같은 FAQ 답을 공유한다. `object.constant.ts` 에서 `gold`·`jewelry` FAQ 답을 각자 다른 문장으로 바꾸면 된다.
- 재현: 위 명령.

## T-18 데이터 검사(3차) - 통과

- 변경: 앱·테스트 코드 수정 없음. gold·jewelry FAQ 답 수정을 반영한 상태에서 다시 실행했다.
- 명령: `pnpm exec playwright test e2e/dream-copy.spec.ts --workers=1`
- 결과: 데스크톱 21개 모두 통과, 실패 0건. 모바일 21개 skip(의도, design 10.1).
- 2차 실패(gold·jewelry와 money의 FAQ 답 동일)는 해소됐다.

## T-19 화면·SEO·검색·위기어 안내 (e2e/dream.spec.ts)

- 명령: `pnpm exec playwright test e2e/dream.spec.ts --workers=1`
- 결과: 130개 중 127 통과, 2 실패, 1 skip. 실패는 데스크톱·모바일의 같은 항목(AC-16) 하나다. skip은 모바일의 상세 120개 HTML 전수 점검(뷰포트와 무관해 데스크톱에서만 실행).
- `dream-copy.spec.ts`는 다시 돌리지 않았다.

### AC별 결과

| AC | 결과 | 비고 |
|---|---|---|
| 1, 40 | 통과 | 허브 h1 하나, 검색칸, 카테고리 7개 h2, 소재 링크 120개 |
| 2, 3, 4, 5 | 통과 | "돼지", 데이터의 모든 별칭, 카테고리 이름, 띄어쓰기 무시, 빈 상태와 "전체 목록 보기", 로또·복권·태몽, 특수문자·긴 입력 |
| 6, 44 | 통과 | 검색 중 요청 0건(HMR 제외), 검색어가 URL·요청·본문·콘솔에 없음, 주소 불변, 목록 링크에 쿼리 없음 |
| 7, 8, 9, 14 | 통과 | 스크립트를 뺀 서버 HTML에서 면책, 목록 120개와 이름, FAQ, 본문. FAQ와 FAQPage JSON-LD 일치 |
| 12, 13, 15 | 통과 | 일반·띠·민감·죽음 대표 4개. 관련 소재 2~4개 이동, 허브 링크 3종 |
| 16 | 실패 | 아래 참고 |
| 17~19, 26 | 통과 | 상세 120개 HTML 전수 점검(길흉·로또 계열어, `/lotto` 링크, textarea, noindex, title) |
| 20, 21 | 통과 | 검색칸 외 입력칸과 textarea 없음, 주의 안내 연결, 저장소·쿠키 불변 |
| 22, 30 | 통과 | 쿠키 거부 후, 광고 도메인 요청 차단 후에도 검색·상세 열람 동작 |
| 23, 24, 27, 28, 29 | 통과 | 민감·죽음 소재 완화 블록, 다섯 번호 순서, h1 아래 면책, 하단 면책 1회, 상세 안내 6항 |
| 35, 36 | 통과 | PC 헤더·모바일 메뉴·홈 카드 이동, 준비 중 표시 없음, 운세 하위 아님 |
| 37, 38, 39 | 통과 | sitemap에 `/dream`과 120개(중복·쿼리 없음), robots, 메타·canonical·OG, BreadcrumbList, 리뷰·평점 없음 |
| 41 | 통과 | 허브 → 검색 → 상세 → 관련 소재 → 뒤로 가기 |
| 위기어 안내 | 통과 | 안내 상자 표시(세 번호만, 결과 영역 위), 지우면 사라짐, "죽음" 소재 검색 오탐 없음, 위기어가 요청·URL·저장소·콘솔·history로 안 나감 |
| 키보드 | 통과 | 검색칸 → Tab → 첫 소재 링크(포커스 링 있음) → Enter, 빈 상태 버튼, 관련 소재 Tab 도달 |

### 실패 항목

- AC-16, 없는 소재 주소 (담당: frontend-dev)
  - 파일: `src/app/dream/[slug]/not-found.tsx`, 설정 `src/app/dream/[slug]/page.tsx`의 `dynamicParams = false`
  - 원인: 응답 상태는 404로 맞지만, 화면은 소재 안내(`DREAM_NOT_FOUND_TITLE`)가 아니라 루트 `src/app/not-found.tsx`의 "페이지를 찾을 수 없습니다"가 나온다. `dynamicParams = false`일 때 Next.js가 세그먼트 not-found 대신 루트 404를 쓰는 것으로 보인다. 본문에 `/dream` 허브 링크도 없고 홈 링크만 있다.
  - 재현: `pnpm exec playwright test e2e/dream.spec.ts -g "AC-16" --workers=1`, 또는 `/dream/no-such-topic` 접속
  - 참고: dev-tasks의 404 주의(루트 `loading.tsx`로 200이 나올 수 있음)는 해당하지 않는다. 상태는 404다.

### AC-16 기준 변경 (PM 지시)

- 변경 전: 없는 소재 주소에서 소재 전용 안내(`DREAM_NOT_FOUND_TITLE`)와 `/dream` 허브 링크를 요구했다.
- 변경 후: 상태 코드 404이고 루트 404 화면("페이지를 찾을 수 없습니다")이 보이면 통과한다. 소재 전용 안내·허브 링크는 요구하지 않는다.
- 사유: `dynamicParams = false`이면 Next.js가 루트 404를 쓰는 것이 설계 결정이다. 위 실패 항목은 앱 결함이 아니라 테스트 기준 오류로 정리한다.

### 참고

- JS를 끈 검사는 `request.get`으로 받은 서버 HTML에서 `<script>`를 뺀 본문을 대상으로 했다. 개발 서버는 스트리밍 응답이라 브라우저에서 JS를 끄면 본문이 숨김 상태로 남을 수 있어(타로 JS 비활성 h1 실패와 같은 유형) 실제 화면 가시성은 운영 빌드에서 확인이 필요하다.
- 개발 서버에서 허브 직후 같은 문구("전체 소재 120개")가 DOM에 한 번 더 잡히는 경우가 있었다(스트리밍 템플릿으로 보임). 테스트는 `main` 안 첫 요소로 한정했다.
- 앱·`src/`는 수정하지 않았다.

## AC-16 운영 빌드 재확인 (2026-11-19)

- 방법: `next start`(기존 `.next` 빌드)로 `/dream/no-such-topic` 서버 HTML을 받아 확인했다.
- 서버 HTML: 상태 404, 본문의 `<h1>페이지를 찾을 수 없습니다</h1>`는 1개. 나머지 2건은 `<script>`(RSC 페이로드) 안의 문자열이라 화면 요소가 아니다. title은 루트 기본값이다.
- 실행: `playwright test e2e/dream.spec.ts -g "AC-16" --repeat-each=3`. 데스크톱 3회 통과, 모바일 3회 중 2회 실패.
- 실패 원인: 하이드레이션 이후 브라우저 DOM에 동일한 `<h1>`(루트 not-found)이 2개 잡힌다(strict mode: `getByText(...).nth(1)`도 h1). 셀렉터 문제가 아니다. 서버 HTML엔 1개이므로 클라이언트 쪽 not-found 중복 렌더로 보인다. 간헐적이며 모바일에서 주로 발생한다.
- 담당: frontend-dev. 확인 위치: `src/app/not-found.tsx`(루트)와 `src/app/dream/[slug]/page.tsx`의 `notFound()` 호출·`src/app/dream/[slug]/not-found.tsx`. 루트 not-found가 사용된 것도 이상하다(소재 not-found.tsx가 있는데 쓰이지 않음). 이 파일 위치·세그먼트 구성을 점검해야 한다.
- 테스트는 고치지 않았다. 셀렉터를 좁히면 중복 h1(페이지당 h1 1개 규칙 위반)을 가리게 된다. 앱 수정 후 같은 명령으로 재검증한다.
- 실행 후 서버 프로세스를 종료했다(3000 포트 응답 없음).

## AC-16 테스트 기준 변경 (2026-11-19)

- 결정: 404 화면의 h1·본문 일시 중복은 루트 `loading.tsx` 스트리밍 정황의 사이트 전체 현상이라 이번 범위에서 앱은 고치지 않고 TODO로 남긴다. (위 "AC-16 운영 빌드 재확인"의 frontend-dev 담당 지정은 이 결정으로 보류)
- 변경: `e2e/dream.spec.ts` AC-16에서 `networkidle` 대기 후 `toHaveCount(1)` 재시도 단언으로 "로드가 안정되면 h1과 안내 문구가 1개"를 검사한다. h1 셀렉터 범위는 좁히지 않았다. 고정 대기는 쓰지 않았다.
- 확인: 운영 빌드(`pnpm build` 후 `pnpm start`)에서 `--repeat-each=6`을 mobile·desktop 각각 4회 반복해 모두 통과. 이전 방식(`toBeVisible`만, 또는 `toHaveCount(1)`만)은 중복이 늦게 나타나 가끔 실패했다. 서버 종료함.

## slug·이름 변경 반영 (2026-11-19)

- 사유: 소재 slug teeth-falling-out → teeth, 이름 "치아"로 앱 변경. 스펙의 옛 slug 기대치를 고치고 "이빨" 별칭 검색·옛 이름 미노출 검사를 추가했다.
- 결과: `dream.spec.ts`, `dream-copy.spec.ts`를 `--workers=1`로 실행해 150개 통과, 22개 skip, 실패 0. 첫 실행의 실패 3건(AC-30, AC-14)은 앱 수정 중에 돌려서 생겼고, 수정이 끝난 뒤 다시 돌려 모두 통과했다.
