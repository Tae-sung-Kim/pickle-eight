# tarot-v2 QA 보고서

작성: qa
작성일: 2026-11-09
기준: `docs/tarot-v2/plan.md` AC-1~27, `design.md`, `ui-ux-design.md`, `dev-tasks.md` Q-1~Q-4
범위 밖: C-4(copy-log 웹 검색 기록)는 별도 진행 중이라 검사하지 않았다.

## 실행 명령과 결과 요약

| 명령 | 결과 |
|---|---|
| `pnpm exec playwright test e2e/tarot-v2.spec.ts e2e/tarot-copy.spec.ts e2e/tarot.spec.ts --project=desktop` | 통과 202, 실패 2 (기존 AC-33 표시, 아래 참고) |
| `pnpm exec playwright test e2e/tarot-v2.spec.ts e2e/tarot-copy.spec.ts e2e/tarot.spec.ts --project=mobile` | 통과 202, 실패 2 (동일) |
| `pnpm exec playwright test e2e/tarot-copy.spec.ts --project=desktop --project=mobile` (테스트 수정 후 재실행) | 통과 100, 실패 0 |
| `pnpm exec playwright test e2e/fortune-v2.spec.ts e2e/fortune-copy.spec.ts --project=desktop --project=mobile` (회귀) | 통과 218, 실패 0 |
| `pnpm typecheck` | 통과 (오류 0, e2e 파일 포함: tsconfig `include`가 `**/*.ts`) |

합계(tarot 3개 파일, 두 프로젝트): 통과 404, 실패 4. 실패 4건은 모두 v2와 무관한 기존 한계다. v2 AC 관련 실패는 0건이다.
`fortune.spec.ts`, `fortune-calc.spec.ts`는 지시대로 가볍게 하기 위해 실행하지 않았다.

참고: 마지막 `tarot-copy` 재실행 전에 FAQ 질문 어미 검사를 고쳤고(아래 "테스트 오류 수정"), 그 뒤 tarot-v2·tarot 파일은 다시 돌리지 않았다. 해당 수정은 tarot-copy 한 테스트만 바꿨다.

## 실패 항목

| 테스트 | 원인 | 재현 | 담당 |
|---|---|---|---|
| `tarot.spec.ts` "AC-33(표시): /tarot/daily JS를 꺼도 설명·면책·FAQ가 화면에 보인다" (데스크톱·모바일) | JS를 끄면 루트 `src/app/loading.tsx`의 숨김 스트리밍 영역 때문에 h1이 접근성 트리에 안 잡힌다. v2 변경과 무관한 사이트 전체의 기존 문제. `docs/tarot/status.md` 2026-11-05에 "알려진 한계로 수용" 기록 있음 | `pnpm exec playwright test e2e/tarot.spec.ts` 의 해당 테스트 | frontend-dev (수용된 한계, 이번 수정 대상 아님) |
| 같은 테스트 "/tarot/three-card" (데스크톱·모바일) | 위와 같음 | 위와 같음 | frontend-dev (수용된 한계) |

앱 코드 실패(구현 FE-*, 문구 C-*)로 분류할 v2 항목은 없다.

## AC별 결과

두 프로젝트(데스크톱·모바일) 모두 통과. 테스트 이름에 "v2 AC-n"이 들어 있다. 파일: T = `e2e/tarot-v2.spec.ts`, C = `e2e/tarot-copy.spec.ts`.

| AC | 결과 | 테스트 |
|---|---|---|
| AC-1 로그인 없이 1장 뽑기 | 통과 | T "v2 AC-1" |
| AC-2 목적 문구 "가볍게 보는 오늘의 흐름", 뽑기 전부터 | 통과 | T "v2 AC-2", C "v2 AC-2". "긴 해석 문단 없음"은 자동 판정 기준이 모호해 약하게만 검사(문단이 존재하는지). 수동 확인 권장 |
| AC-3 칩 5개, 기본 "전체" | 통과 | T "v2 AC-3·AC-12"(두 페이지), C "v2 AC-3·AC-12(데이터)" |
| AC-4 분야를 바꾸면 카드 이름·방향·이미지·키워드·요약은 그대로, 분야 문장만 바뀜 | 통과 | T "v2 AC-4·AC-5", T "v2 AC-4: aria-live" |
| AC-5 분야별 문장이 40칸 상수와 일치 | 통과 | T "v2 AC-4·AC-5", T "v2 AC-5: 뽑기 전에 고른 분야", C "v2 AC-5"(40칸·util) |
| AC-6 같은 날 새로고침해도 같은 카드, 저장은 v·date·cardId·isReversed뿐, 분야 미저장 | 통과 | T "v2 AC-6", T "v2 AC-18·AC-19" |
| AC-7 재뽑기 버튼 없음, KST 자정 지나면 새 카드 | 통과 | T "v2 AC-7" |
| AC-8 질문 입력칸 안내와 aria-describedby 연결 | 통과 | T "v2 AC-8·AC-14"(두 페이지) |
| AC-9 위치 이름과 위치 안내 | 통과 | T "v2 AC-9" |
| AC-10 같은 카드 중복 없음 | 통과 | T "v2 AC-10"(재뽑기 5회) |
| AC-11 흐름 이야기 1개, 3~5문장, 과거·현재·미래 포함 | 통과 | T "v2 AC-11", C "v2 AC-11" 계열(45칸, 끝맺음, 전수 조합) |
| AC-12 칩 5개와 "전체" 기본, 전체는 분야 표시줄 없이 공통 문장 | 통과 | T "v2 AC-12" 3개, 칩이 입력칸을 채우지 않음 확인 |
| AC-13 분야 4세트가 서로·전체와 겹치지 않음, 분야 선택 시 해당 세트 문장 | 통과 | T "v2 AC-13"(분야 4개 각각, 화면 문단 = `buildTarotThreeCardStory` 결과), C "v2 AC-13" |
| AC-14 질문 안내, 질문이 해석에 반영되지 않음 | 통과 | T "v2 AC-8·AC-14", T "v2 AC-14" |
| AC-15 재뽑기 안내가 버튼에 연결, 재뽑기 시 새 이야기 | 통과 | T "v2 AC-15", `tarot.spec.ts` "v2 AC-15" |
| AC-16 3장 h1·title·description에 "상담" 없음, "고민을 정리" 뜻 | 통과 | T "v2 AC-16", C "v2 AC-16" |
| AC-17 메뉴·페이지 이름 유지 | 통과 | T "v2 AC-17", C "v2 AC-17" |
| AC-18 요청에 질문·분야 없음 | 통과 | T "v2 AC-18·AC-19"(두 페이지) |
| AC-19 저장소에 질문·분야 없음 | 통과 | T "v2 AC-18·AC-19", T "v2 AC-6" |
| AC-20 위기 표현 시 상담 안내가 먼저, "계속 보기"로 결과 | 통과 | T "v2 AC-20"(두 페이지), T "v2 D6" |
| AC-21 상시 면책(h1 아래), 상담전화 5곳 | 통과 | T "v2 AC-21"(두 페이지) |
| AC-22 새 문구 전체에 금지 표현·투자·도박·로또 없음 | 통과 | C "v2 AC-22" 3개, T "v2 AC-22"(화면 글자 교차, 두 페이지) |
| AC-23 쿠키 거절해도 동작 | 통과 | T "v2 AC-23"(두 페이지) |
| AC-24 분야 선택 → 뽑기 → 결과 → 분야 변경 흐름 | 통과 | T "v2 AC-24" 2개, `tarot.spec.ts` "v2 AC-24" |
| AC-25 noindex 없음, title·description·canonical·OG | 통과 | T "v2 AC-25"(두 페이지) |
| AC-26 서버 HTML(JS 없이)에 분야 설명, FAQ, 면책, JSON-LD FAQ | 통과 | T "v2 AC-26"(두 페이지), C "v2 AC-26" 2개 |
| AC-27 h1 하나 | 통과 | T "v2 AC-27"(뽑기 전, 뽑은 뒤, 분야 변경 뒤) |

추가 검사: 가로 스크롤 없음, 응답 400 미만·pageerror·하이드레이션 오류 없음(공통), 승인 고지 문구 글자 단위 일치, 재물 문장 10개 투자 표현 없음, 가이드 600자 이상·두 페이지 문단 복사 없음, FAQ 필수 질문 존재.

### 조합 전수 (Q-3 5번)
`buildTarotThreeCardStory`: 수트 그룹 5³ × 방향 2³ = 1,000 조합을 분야 5개 각각에서 실행(총 5,000). null 0, 4문장, "과거"·"현재"·"미래" 포함, 중괄호 잔존 없음, 금지 표현 없음, 마무리 문장이 톤과 일치. 모두 통과. (dev-tasks의 "1,000 조합"은 분야당 1,000이며 분야 5개를 곱하면 5,000이다.)

### 자동 실패가 아닌 보고 항목
- 분야 문장 중 "수 있습니다." 종결이 아닌 칸, 역방향 "다른 각도·속도 늦춤" 렌즈 후보는 `test.info().attach`와 콘솔로 보고하는 참고 검사다(실패 아님). 수치는 실행 로그의 `[tarot-copy][분야 문장 권장 종결 아님]`, `[tarot-copy][역방향 렌즈 후보]`를 본다.

## Q-1: 수정·삭제한 기존 테스트와 대체 AC

| 기존 위치 | 처리 | 대체 |
|---|---|---|
| `e2e/tarot.spec.ts` "AC-11: 분야 칩을 누르면 질문 예시가 채워지고 분야와 무관하다는 안내" | 삭제 (자리에 주석) | v2 AC-3·AC-12(칩 5개, 기본 전체, 예시 채우기 없음, 같은 칩 재선택 포함), v2 AC-4·AC-5(분야 문장). 모두 `tarot-v2.spec.ts` |
| `e2e/tarot.spec.ts` "AC-12: 질문 예시에 투자·복권·도박·로또 질문 없음(화면)" | 삭제. `FORBIDDEN_EXAMPLE_PATTERN` 상수도 삭제 | v2 AC-12(예시 없음), 새 문구 금지 검사는 tarot-copy "v2 AC-22"·"새 문구 전체 투자·복권·도박·로또 없음" |
| `e2e/tarot.spec.ts` "AC-13: 다시 뽑기 ... 재뽑기 안내" | 갱신: "v2 AC-15". 뽑기 전은 `TAROT_REDRAW_NOTICE`, 결과는 `TAROT_REDRAW_RESULT_NOTICE`, 재뽑기 뒤 idle 복귀·질문 유지·포커스 유지 | v2 AC-15 (`tarot-v2.spec.ts`에도 버튼 연결 검사 있음) |
| `e2e/tarot.spec.ts` "AC-36: 3장 분야 선택 → 뽑기 → 결과 → 다시 뽑기" | 갱신: "v2 AC-24". 예시 채움 전제 삭제(입력칸이 비어 있음 확인), 분야 표시줄 "분야: 일상 조언"·흐름 이야기·안내 확인, 재뽑기 뒤 분야 유지 확인 추가 | v2 AC-24 |
| `e2e/tarot.spec.ts` "AC-36: 오늘의 타로 ..." (1617행 부근) | 실행 결과 통과, 수정 없음 | - |
| `e2e/tarot-copy.spec.ts` "AC-12(데이터)" (`TAROT_QUESTION_TOPICS`, `examples` 검사) | 삭제 | "v2 AC-3·AC-12(데이터)": 칩 5개·순서·기본값, `TAROT_QUESTION_TOPICS`와 `examples` 부재, 플레이스홀더 금지어. 문장 검사는 파일 끝 tarot-v2 묶음 |

대체 없이 지운 AC: 0건.

## 테스트 오류 수정 (앱이 아니라 테스트를 고친 항목)

| 테스트 | 문제 | 조치 |
|---|---|---|
| `tarot-copy.spec.ts` "AC-32(문구): ... 핵심 검색어" | 3장 description에 "쓰리카드 타로"가 있어야 한다는 v2 이전 검사. 승인된 design 13의 description 초안은 이 단어를 title에만 두었고 `keywords`에는 남겼다 | description 검사는 "3장 타로" 또는 "과거·현재·미래"로 바꾸고, "쓰리카드 타로"는 title(기존 검사 유지)과 `keywords`에서 확인하도록 이동. 문구가 v2 사양과 다르다면 C-3 확인 필요(PM 판단) |
| tarot-copy FAQ 신규 검사 | 질문 어미를 "입니까?"로만 검사해 "읽습니까?", "다릅니까?"가 실패 | `/니까\?$/`로 수정. 필수 질문은 "오늘의 카드는 왜 다시 뽑을 수 없습니까?"처럼 앞말이 붙은 형태를 `includes`로 확인 |
| tarot-v2 AC-20 (1장) | 앞면 이미지 개수 0을 요구했으나 가이드 예시 이미지 2개가 접근성 트리에 있음 | 뽑기 전 개수와 같아야 한다는 비교로 수정 |
| tarot-v2 AC-11 | 같은 페이지에 "미래"가 들어간 FAQ h3가 있어 strict 모드 오류 | `exact: true`와 버튼 위치 비교로 수정 |

## 남은 이슈 (PM 확인)

1. AC-2의 "긴 해석 문단이 보이지 않는다"는 자동 판정이 어려워 약한 검사다. ui-ux 확인 단계에서 육안으로 본다.
2. 3장 description에서 "쓰리카드 타로"가 빠진 것은 design 초안대로다(위 표). 검색어 손실이 걱정되면 C-3에 되돌려 결정한다.
3. 기존 AC-33(표시) 4건은 알려진 한계다. 수용 유지 여부는 PM이 정한다.
4. 이번 실행은 개발 서버(`pnpm dev`)에서 했다. 최종 검증(V-1)의 `pnpm build` 뒤 프로덕션 모드 확인은 하지 않았다.
