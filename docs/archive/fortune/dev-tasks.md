# fortune 개발 티켓

입력: `docs/fortune/design.md`(확정, D1~D15), `docs/fortune/ui-ux-design.md`(확정. 상담전화 명세는 UI-2가 갱신 예정, 허브·링크 새 문구는 승인 범위 확인 필요, 5장 U-1)
함께 보는 문서: `docs/fortune/plan.md`(AC-1~AC-78, AC-79~AC-86은 design.md 18.2·18.4·18.5의 제안 번호이며 DOC-2가 plan에 추가), `docs/fortune/status.md`, `docs/fortune/kasi-api-check.md`, `docs/fortune/qa-baseline-tarot.md`, `docs/conventions/` 중 tech-stack, code-style, data-storage, seo, design-system, `docs/tarot/dev-tasks.md`(형식 선례)
작성일: 2026-11-05 (갱신: KASI 보류 해제, D14 지원 연도 (나)안, D15 상담전화 기기별 표시, 법률 검증 없음(운영자 위험 수용), 완료 티켓 반영)
상태: 갱신본. PM 확인과 사용자 승인 대기. 표기 약속: `FF/` = `src/features/fortune/`.
D15 참조 원칙: 상담전화 기기별 표시의 구체 구현(환경 구분 방식, 훅 사용 여부, 컴포넌트 구조, 파일 이름)은 architect가 확정 중이다. 이 문서는 구현을 적지 않고 "design.md D15·8.4 확정안을 따른다"로만 참조한다. 확정안이 바뀌어 티켓이 달라지면 PM이 이 문서의 해당 칸(2.2, 4장, FE-1a, FE-1b, FE-6a, QA-T2)만 고친다.
법률 확인 원칙: 출시 전 법률 확인은 하지 않는다. "법률 검증 없음, 운영자 위험 수용(2026-11-05)". 이용 동의 게이트(동의하지 않으면 서비스 미제공)를 최소 동의 장치로 유지한다. 법률 확인은 정지 조건·출시 조건에 두지 않는다(5.1 위험 수용 목록).

## 요약

- 서버 API, DB, 새 런타임 환경변수, 새 npm 라이브러리가 없는 프론트 중심 기능이다. db-dev, backend-dev의 기능 티켓은 "없음"(DB-0, BE-0)이고, backend-dev는 KASI 달력 표 생성 스크립트(BE-1 계열) 하나만 맡는다.
- 1단계(MVP: 허브, 오늘의 운세, 띠별, 별자리, 이용 동의 게이트)와 2단계(사주)를 분리한다. 2단계는 1단계 완료와 사용자 승인 뒤에 착수하며, 사주 페이지·메뉴 노출은 23시대 시주 기준(R-1 조사 후 사용자 결정) 확정 전까지 금지다(맨 끝 "2단계" 절).
- KASI 보류는 해제됐다(2026-11-05). 24절기는 1920~2028년만, 음력은 1391~2050년 제공이고 두 API 이용허락범위는 "제한 없음"(사용자 확인)이다. 인증키 환경변수 이름은 `DATA_GO_KR_API_KEY`이고 `.env.example`에 이미 있다. 이 문서에 "보류" 상태인 티켓은 없다.
- 지원 연도는 (나)안으로 확정됐다(D14): 출생일 1920-01-01 ~ 2028-12-31, 절기 표 1920~2028, 음력 표 1919~2049. 2029년 이후 절기 보완은 후속 F-1(기한 2028-12-01)이다. 상담전화는 터치 환경에서 누르면 연결되고 PC에서는 글자로만 보이는 표시를 타로·운세 공용으로 만든다. 구체 구현은 design.md D15·8.4 확정안을 따른다(U-6 방안 A 확정).
- 사용자 결정(2026-11-05): 출시 전 법률 확인을 하지 않는다. 운영자가 위험을 수용하고 이용 동의 게이트를 최소 동의 장치로 유지한다. 법률 확인 항목은 정지 조건에서 뺐고 "위험 수용 목록"(5.1)에 모았다. 상담전화 재확인, AdFit·복권법 진행 확인, 고지 문구·방침·약관 최종 확인, 스크린리더 수동 확인(U-13), 운영 배포 확인(U-10)은 유지한다.
- 완료된 것: UI-1, M-1, M-2, QA-T1, BE-1a(`scripts/fortune-calendar/` 4개 파일 작성. 실제 호출은 사용자가 U-9로 실행), FE-1a, FE-2a, FE-10b, FE-10d, FE-11(방침 10장 문장 조정과 약관 7장 연도 안내까지. 찾은 충돌 5건은 5.1로 이동).
- 달력 표 생성은 BE-1a와 FE-2a가 끝나 U-9(사용자 실행) 차례다. 이 정지 동안 달력과 무관한 티켓은 계속 진행한다.
- 메인 세션 작업은 M-3(F-1 후속 등록), DOC-1a/1b(루트 문서와 `.env.example`)이고, planner 작업은 DOC-2(plan.md 갱신)와 DOC-3(타로 문서, ui-ux-designer와 분담)이다.
- 문구 풀 작성은 frontend-dev가 AI 초안으로 쓰고 사용자가 검수한다(타로 선례). 사용자 확인 시점은 5장에 모았다.
- 기존 공용 코드 변경은 4곳이다: `SECTION_BADGE_COLOR.fortune`(완료), `MENU_LIST` 운세 그룹(정의 완료, 출시 스위치 대기), 상담전화 공용화(공용 기반 완료, 타로 이전 대기), 타로 e2e 2개 파일 수정(QA-T2). 영향 범위와 회귀 확인은 4장에 적었다.

## 1. 공통 규칙 (모든 티켓에 적용, 티켓의 "공통 규칙" 표기는 이 번호)

### R-1 읽을 문서와 우선순위
- 담당 agent 정의의 "시작 전에 읽을 규칙 문서"를 읽는다. 문서끼리 다르면 `docs/conventions/` > 승인된 `docs/fortune/` 문서 > 그 밖의 문서 순서다. `FF/fortune-dev-guide.md`는 참고만 하며 15장 "추천 기술 스택", "AI 문구 생성 + 하루 캐시", 6.1·6.2·9.3·9.4의 예시 문장·점수표는 따르지 않는다.
- 설계와 다르게 해야 하면 임의로 바꾸지 않고 architect에게, 디자인 명세와 다르면 ui-ux-designer에게, 계획과 다르면 planner에게 되돌린다(PM을 통해).

### R-2 개인정보·저장 (이용 동의 세 번째 항목의 사실성과 직결)
- 생년월일, 태어난 시각, 양력/음력·윤달, 시각 모름 선택, 후보 선택, 만 나이, 연령 판정 결과는 React state(메모리)나 렌더링 중 계산값으로만 둔다. 서버, localStorage, sessionStorage, 쿠키, URL(쿼리·해시), 전역 store, `console.*`, 오류 메시지, aria-live 공지, `document.title`, 분석·알림 이벤트에 넣지 않는다.
- `FF/`에서 `http`(axios), `fetch`, React Query, 분석·알림 모듈을 import하지 않는다. 운세 화면 사이 링크에 쿼리·해시를 붙이지 않는다. `<form>`에 `action`·`method`를 주지 않고 입력칸에 `autoComplete="off"`를 준다.
- 브라우저에 두는 값은 이용 동의 sessionStorage 키 1개(동의 여부·문구 버전·동의 시각)뿐이다. "동의하지 않음"은 저장하지 않는다. 쿠키 동의(`ConsentProvider`)와 서로 상태를 읽거나 바꾸지 않는다.
- 이용 동의 게이트는 법률 검증이 없는 상태에서 유일한 최소 동의 장치다. 동의하지 않으면 서비스를 제공하지 않는 동작을 약화하거나 우회하는 변경을 하지 않는다(FE-4, AC-67~AC-72).
- 상담전화 표시를 위한 기기 환경 판별은 design.md D15·8.4 확정안을 따르며, 판별 결과를 어디에도 저장하거나 전송하지 않는다.

### R-3 문구·표현
- 사용자에게 보이는 문장은 합니다체, 버튼·칩·제목 같은 짧은 라벨은 명사형이다.
- plan "금지 표현 목록"과 "문구 안전 원칙"을 지킨다. "보장", "예측"은 부정 고지문까지 쓰지 않는다. 책임 과장 표현("책임을 지지 않" 등)을 쓰지 않는다. 이 규칙은 법률 확인과 무관한 plan의 문구 규칙이므로 위험 수용과 상관없이 지킨다.
- "사주"는 plan "용어 사용 규칙: 사주"의 허용 위치에만 쓴다. 방식 A 화면(허브, 오늘의 운세, 띠, 별자리)의 문구 풀·공통 풀·결과 제목·메타데이터에는 쓰지 않는다. "사주 네 기둥", "사주 4기둥", 내부 용어 "4기둥", "3기둥"은 어떤 화면 문구에도 쓰지 않는다. 괄호 설명은 상수 `FORTUNE_SAJU_GLOSS` 하나를 이어 붙여 쓴다.
- 확정·승인된 고지 문구(plan 고지 1~17, 로또 고지, `ui-ux-design.md` "승인됨" 표)는 한 글자도 바꾸지 않고 옮긴다. 폐기된 방식 A 문구("…사주 풀이가 아닙니다")를 어디에도 남기지 않는다.
- 지원 연도 안내는 연도를 문장에 손으로 쓰지 않고 `FORTUNE_MIN_BIRTH`, `FORTUNE_MAX_BIRTH`에서 만든다(F-1로 표를 늘릴 때 한 곳만 고치기 위해).
- 금지·허용 목록 상수(`fortune-copy-rule.constant.ts`)는 화면 코드에서 import하지 않는다(번들 제외).

### R-4 디자인·코드
- 색은 디자인 토큰과 `currentColor`만 쓴다. hex, Tailwind 기본 팔레트, `dark:`를 쓰지 않는다. CSS 애니메이션에는 `motion-reduce:`를 붙인다(design-guard hook이 검사). 모션은 `ui-ux-design.md`의 M1(점수 눈금)과 스켈레톤 맥박뿐이다.
- 폴더·파일·컴포넌트·타입 이름은 `code-style.md` 규칙을 따른다. `interface`, default export(페이지·레이아웃 제외), `forwardRef`, HOC를 쓰지 않는다. `FF/`는 다른 기능(타로, 로또)을 import하지 않는다. 공용이 필요하면 `src/` 공용 폴더로 올린다.
- 서버 컴포넌트가 기본이다. `'use client'`는 상태·이벤트·브라우저 API가 필요한 가장 작은 컴포넌트에만 붙인다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent` 외에 쓰지 않는다.
- 새 npm 라이브러리, 새 웹폰트, 외부 이미지·아이콘 세트를 들이지 않는다. 필요해 보이면 PM에 보고한다.

### R-5 작업 마무리
- 코드를 바꾼 티켓은 `pnpm typecheck`와 Biome 검사(hook이 자동 실행)를 통과해야 끝난다. frontend 티켓은 `pnpm build`도 통과해야 한다.
- 끝나면 변경 파일, 명세 대비 누락, 남은 이슈, 다른 담당에 요청할 사항을 보고한다. agent 범위 밖 파일이 필요하면 수정하지 말고 PM에 보고한다. 단계 상태(`status.md`)와 이 문서의 상태 칸은 PM이 갱신한다.

### R-6 달력 표 파일 규칙 (보류 규칙을 대체)
- `FF/constants/calendar/*.constant.ts`는 BE-1b 스크립트 출력으로만 만든다. 누구도 손으로 만들거나 고치지 않고, 가짜 값이나 임시 표를 먼저 두지 않는다. 그래서 이 표를 import하는 FE-3b는 BE-1b가 끝난 뒤 시작한다.
- 표 범위는 절기 1920~2028, 음력 1919~2049(D14, 안 C)다. 범위가 바뀌면(F-1, 사용자의 Q7 변경) `FORTUNE_SUPPORTED_MAX_YEAR`와 표를 같은 작업에서 함께 올린다.
- 인증키 `DATA_GO_KR_API_KEY`는 코드, 문서, 채팅, 로그, 저장소에 쓰지 않는다. 스크립트가 `.env` 파일을 읽지 않는다.

### R-7 문구 작성 전용 (C 티켓)
- 작성 중에는 타 사이트·책·앱·언론사 운세 문장을 찾아보거나 참조하지 않는다. 웹 검색, 외부 문장 붙여 넣기, 번역·어순 변경·일부 단어 교체를 하지 않는다. `FF/fortune-dev-guide.md`의 예시 문장도 참조하지 않는다. 카드 의미·십신·오행·절기 같은 이론 수준 아이디어로만 처음부터 쓴다.
- 문장 끝 표현을 변주한다. 낮은 구간 문구도 행동 조언으로 끝낸다. 건강운에는 병명·증상·약을 쓰지 않고(휴식·생활 리듬만), 재물운에는 투자·주식·코인·복권·도박 권유를 쓰지 않는다(지출 점검·정리만).
- 작성이 끝나면 `FORTUNE_FORBIDDEN_TERMS`, `FORTUNE_HEALTH_TERMS`(건강 풀), `FORTUNE_SAJU_REDUNDANT_TERMS`로 Grep 자체 점검을 하고 결과를 보고한다.

## 2. 지원 연도(D14)와 상담전화 표시(D15)가 티켓에 주는 영향

보류는 없다. 대신 아래 두 결정이 여러 티켓에 들어가 있다. 티켓을 읽을 때 놓치지 않도록 한곳에 모았다.

### 2.1 지원 연도 (나)안 (D14, 4.1, 4.3, 4.10)

| 항목 | 값·규칙 | 반영 티켓 |
|---|---|---|
| 출생일 범위 | 1920-01-01 ~ 2028-12-31. 양력 환산 날짜로 판정 | FE-2a, FE-3b |
| 상수 | `FORTUNE_SUPPORTED_MAX_YEAR = 2028`, `FORTUNE_MAX_BIRTH`, `FORTUNE_SOLAR_TERM_RENEW_BY = '2028-12-01'` (`fortune-input.constant.ts`) | FE-2a |
| 표 범위 | 절기 1920~2028(109회 호출), 음력 1919~2049(1,572 + 1회 호출, 합계 약 1,682회. 일 10,000건 한도 안) | BE-1a, BE-1b |
| 오류·결과 종류 | `FortuneBirthErrorType`에 `'after-max'` 추가(`future`보다 먼저 검사), `FortuneDetermineType`에 `{ kind: 'unsupported' }` 추가 | FE-2a, FE-3b, FE-5b |
| 함수 | `getSolarTermTime`은 범위 밖이면 `null`, `getLunarLeapMonth`, `getLunarMonthLength` 추가, 판정 함수는 범위 밖이면 `unsupported` | FE-3b |
| 입력 UI | 연도 범위 1920 ~ `min(KST 오늘 연도, 2028)`, 윤달 체크는 그해 그 달에 윤달이 있을 때만 활성, 29일 달의 30일은 `lunar-invalid-day` | FE-5a |
| 안내 문구 | 오류 5종(`after-max` 포함), `FORTUNE_SUPPORTED_RANGE_NOTICE`, `FORTUNE_LEAP_MONTH_HINT_TEMPLATE`는 초안(design.md 4.3)을 FE-2b가 담고 C-3d가 확정 | FE-2b, C-3d |
| 계산 기준·FAQ | "1920년 1월 1일부터 2028년 12월 31일 …" 문장, 지원 출생 연도 FAQ | FE-6a, C-3b |
| 새 AC | AC-84(기기 시계 2029-01-02에도 결과 정상, 연도 입력 상한 2028), AC-85(윤달 구분 변환과 "(윤달)" 표시), AC-8·AC-9 수정 | FE-7~9, QA-1, QA-3, DOC-2 |
| 개발 검증 | 만료 감시 테스트(2028-12-01 이후 F-1 미완료면 실패), 지원 범위 일치 테스트(상수 = 절기 표 마지막 연도, 음력 표가 상수+1까지) | QA-3 |
| 후속 | F-1: 기한 2028-12-01. 2027년 하반기부터 KASI의 2029년 이후 절기 제공 여부를 확인하고, 2028-09-01까지 제공되지 않으면 설계로 되돌려 천문 계산 보완(가)을 사용자가 고른다. 메인 세션이 `status.md`에서 추적한다 | M-3 |
| 2단계 | 사주도 같은 범위(절기 월주). 2029년 이후 출생은 `unsupported` | 2단계 절 |

### 2.2 상담전화 기기별 표시 (D15, 8.4)

구체 구현은 적지 않는다. 아래 모든 항목은 design.md D15·8.4 확정안(환경 구분 기준, 공용 파일 구성, 서버 HTML 동작, 접근성, 영향 범위 표, 타로 테스트 영향 표)을 따른다. 사용자 요구는 "터치 환경(모바일)은 누르면 통화 연결, PC는 링크처럼 동작하지 않고 번호가 글자로 보이며 선택·복사 가능"이고 공용 상수의 `href` 필드는 유지한다.

| 항목 | 규칙 | 반영 티켓 |
|---|---|---|
| 공용 기반 | 8.4 영향 범위 표의 공용 상수·타입·훅·컴포넌트 신규 파일(`src/types/`, `src/constants/`, `src/hooks/`, `src/components/common/` 아래, 경로는 8.4 표). 값·순서·문구는 타로 현재 값과 같게 | FE-1a(완료) |
| 타로 변경 | 8.4 영향 범위 표의 타로 3개 파일 행(상수 파일, 결과 하단, 위기 패널)을 그대로 따른다. 타로 전용 상수는 유지 | FE-1b |
| 운세 사용 | 8.4 영향 범위 표의 운세 결과 하단 행. 허브와 기능 페이지 3개 모두 5곳 표시 | FE-6a, FE-12 |
| 디자인 | 결과 하단 목록과 타로 위기 패널 109 주 버튼의 PC 글자 모양(채운 버튼 모양 금지, Q9), 읽기 문제 시 대안(Q8)은 UI-2가 정한다 | UI-2, DOC-3 |
| 테스트 | 8.4 "타로 테스트 영향" 표대로 `e2e/tarot.spec.ts` 수정, `e2e/tarot-copy.spec.ts` 수정. 8.4 "확인 필요(QA 첫 실행)" 항목(Playwright 두 프로젝트에서 환경 구분이 의도대로 나오는지) 기록 | QA-T2 |
| 새 AC | AC-86, AC-34 수정, 고지 17 한 줄 보충 | FE-6a, QA-1, DOC-2 |
| 수동 확인 | `1577-0199`, `1588-9191`이 NVDA·VoiceOver·TalkBack에서 번호로 읽히는지(8.4 접근성 확인 항목, Q8) | U-13 |

### 2.3 시작 전에 사용자에게 알려 둘 선택 (5장 U-14)
- 음력 표 범위는 설계가 안 C(1919~2049, 약 5.2KB)로 정했다(Q7). 안 A(1919~2028, 약 4.4KB)나 안 B(1391~2050, 약 26KB)를 원하면 BE-1b 실행 전에 알려야 한다(BE-1a는 안 C로 작성 완료). 이견이 없으면 안 C로 실행한다.

## 3. 담당 범위 확인 (`.claude/hooks/guard-files.js` 기준)

| 항목 | 확인 결과 | 처리 |
|---|---|---|
| 문구 풀 `FF/constants/pools/**`, 고지·FAQ·가이드 상수, `docs/fortune/copy-log.md` | frontend-dev 범위(`src/features/`, `docs/`) 안이다. backend-dev 범위도 `src/features/*/constants/`와 `docs/`를 포함하지만 역할이 프론트이므로 frontend-dev로 정한다. 타로 선례(사용자 결정)와 design.md 19장 메모도 frontend-dev다 | C 티켓은 frontend-dev. 메인 세션 직접 작성 아님 |
| 웹 검색(유사 문장 점검) | frontend-dev, backend-dev 도구에는 WebSearch·WebFetch가 없다. researcher만 있고 `docs/`에만 쓸 수 있다 | C-4는 researcher, 일치 문장 수정(C-5)은 frontend-dev. 수정자는 외부 문장을 보지 않는다 |
| 문구 사용자 검수 | agent로 대체할 수 없다 | 사용자. PM이 연결 |
| `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `DEPENDENCY_LICENSES.md`, `.env.example` | 어느 agent 범위에도 없다(`docs/` 아래만 가능). `.env.example`에는 `DATA_GO_KR_API_KEY=`가 이미 있다(29행) | DOC-1a, DOC-1b는 메인 세션. `.env.example`은 확인만 |
| `.claude/hooks/guard-files.js` | 22행에 `'scripts/fortune-calendar/'`가 이미 있다(M-1 완료). agent 수정 대상 아님 | 추가 수정 없음 |
| `scripts/fortune-calendar/` | backend-dev만 수정 가능. `scripts/` 다른 파일은 계속 차단 | BE-1a(완료) |
| `src/constants/`(`crisis-phone`, `menu`, `menu-icon`, `theme`) | frontend-dev만 가능. backend-dev의 `src/features/*/constants/` 규칙은 `src/constants/`를 포함하지 않는다 | FE-1a, FE-10b, FE-10c, FE-10d는 frontend-dev |
| `src/hooks/`, `src/components/common/` | frontend-dev 범위(`hooks`, `components`). 8.4 확정안의 공용 훅·컴포넌트 파일은 이 폴더들 아래에 둔다 | FE-1a |
| `src/types/crisis-phone.type.ts` | frontend-dev, backend-dev 모두 가능 | FE-1a(frontend-dev) |
| `FF/types/`, `FF/constants/` | frontend-dev, backend-dev 모두 가능해서 충돌 소지가 있다 | `FF/`는 frontend-dev가 맡고 `calendar/*.constant.ts`만 스크립트 출력이다 |
| `src/app/fortune/**` (layout, page) | frontend-dev 가능(`src/app/api` 제외) | FE-4, FE-10a, FE-12 |
| `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | frontend-dev 가능 | FE-11(완료) |
| `e2e/` | qa 범위. 앱 코드(`src/`)는 qa가 못 고침 | QA 티켓. QA-T2만 기존 타로 spec 2개를 수정(PM 승인, U-6 방안 A) |
| `docs/tarot/*` | `docs/`는 planner, ui-ux-designer, qa 모두 쓸 수 있다. 다만 `docs/conventions/`, `docs/_templates/`는 차단 | DOC-3 |
| `docs/conventions/`, `docs/_templates/` | 모든 agent 수정 차단 | 이 작업에서 규칙 문서 변경은 필요 없음 |
| `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/*` | 이번 기능에서 수정하지 않는다. 작업 트리에 이미 미커밋 변경(`package.json`, `docs/TODO.md`, `src/features/lotto/services/lotto-user.service.ts`)이 있으며 운세 작업과 무관하다 | 건드리지 않음. 바뀌면 PM에 보고 |

## 4. 기존 공용 코드 변경 영향 범위

| 대상 | 변경 | 영향받는 곳 | 회귀 확인 | 티켓 |
|---|---|---|---|---|
| `SECTION_BADGE_COLOR.fortune` (`src/constants/theme.constant.ts` 51행) | `'bg-menu-fortune/10 text-menu-fortune border-menu-fortune/20'` → `'bg-menu-fortune/10 text-foreground border-menu-fortune/40'` (ui-ux-design.md Q4 권장 A안, 사용자 승인). 이유: 글자 대비 약 4.3:1(AA 미달) → 약 10.4:1 | 소비처는 `src/components/common/coming-soon.component.tsx`(`SECTION_BADGE_COLOR[type]`) 하나. 이 컴포넌트를 쓰는 페이지는 `fortune/today`(FE-10a에서 교체되어 사라짐), `lunch/today`, `where/today`. 키별 값이라 `lunch`·`where` 배지는 바뀌지 않음. 출시 뒤 `fortune` 키는 화면에 나오는 곳이 없음 | typecheck. 다른 키 값이 diff에 없는지 확인. 출시 전 `/fortune/today` "준비 중" 배지만 달라짐. `lunch` 배지 대비(약 4.48:1)는 이번 범위 밖이며 점심 기능 착수 때 같은 방식으로 고치도록 PM이 기록 | FE-10d(완료) |
| `MENU_LIST` 운세 그룹 (`src/constants/menu.constant.ts` 93~108행) | 그룹 `href`를 `/fortune/today` → `/fortune`(허브). 기존 항목 `colorClass` `text-amber-600` → `text-menu-fortune`. 항목 "띠별 운세", "별자리 운세" 추가(아이콘 `PawPrint`, `Telescope`, 설명·예시는 ui-ux-design.md 메뉴 절 승인 문구). 마지막에 그룹 `comingSoon: true` 삭제. 사주 항목은 2단계 전까지 추가 금지 | 소비처: `src/components/layout/pc-menu.component.tsx`, `mobile-menu.component.tsx`(그룹 링크가 허브로 바뀌고 "준비 중" 배지가 comingSoon으로 제어됨), `src/app/page.tsx`(홈 배지), `src/app/sitemap.ts`(`!comingSoon` 그룹만 읽음 → 해제 순간 `/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign` 노출), `src/lib/seo.ts`(`getOgTag`), `src/components/common/menu-list.component.tsx`(허브가 사용), `src/constants/menu-icon.constant.ts` | 변경을 둘로 나눈다. FE-10b는 정의만 바꾸고 `comingSoon: true`를 유지해 sitemap 노출 없음을 `/sitemap.xml`로 확인한다(완료). FE-10c가 `comingSoon`을 지우는 한 줄 변경(출시 스위치)이다. FE-10c 뒤 헤더·모바일·홈의 운세 링크가 `/fortune`으로 가고 배지가 사라지는지, sitemap에 4개 URL이 있고 `/fortune/saju`가 없는지 확인. 로또·타로 그룹 diff 없음 | FE-10b(완료), FE-10c |
| 상담전화 공용화 (D4, D15) | 구체 변경 내용은 design.md D15·8.4 확정안의 영향 범위 표를 따른다. 요지: 공용 상수·타입(`CrisisPhoneType`, `CRISIS_PHONES`, `CRISIS_RESULT_LINE`)과 기기별 표시용 공용 파일을 새로 만들고(FE-1a 완료), 타로의 상수 파일·결과 하단·위기 패널 3개 파일이 이를 쓰도록 바꾼다(FE-1b 대기). 타로 전용 문구·상수는 유지한다. 화면 동작 변화: PC에서 번호가 링크가 아니라 글자가 된다 | 타로 파일 3개: `src/features/tarot/constants/tarot-notice.constant.ts`, `src/features/tarot/shared/components/result-notice.component.tsx`, `src/features/tarot/shared/components/crisis-notice.component.tsx` | **터치 환경(mobile)과 서버 HTML의 출력(번호·순서·문구·`tel:` 링크·터치 영역 44px)은 이전과 같아야 한다.** PC만 바뀐다(8.4 확정안 기준). 타로 e2e 영향은 아래 행. FE-1b 직후 타로 PC 화면을 눈으로도 확인(결과 하단, 위기 패널) | FE-1a(완료), FE-1b |
| 타로 e2e (D15, U-6 방안 A) | `e2e/tarot.spec.ts`: 8.4 "타로 테스트 영향" 표의 행들을 프로젝트별(desktop = Desktop Chrome, mobile = Pixel 7)로 고친다. 8.4 표가 가리키는 행(895~900, 913, 922, 1142~1162, 1546, 1655~1679, 1698, 1706~1724, 1830~1834, 1872~1901, 1920~1922, 1935~1957, 1990~1995 근처)을 따른다. 상수 사본(`PHONES`, `CRISIS_PHONE_LINK`)은 상수 파일 import로 바꾼다. `e2e/tarot-copy.spec.ts`: 공용 상담전화 상수를 검사 대상에 추가하고 244~253행 근처의 `where.includes('TAROT_CRISIS')` 필터를 공용 상수 이름도 잡게 고친다 | 통과 기준선: `docs/fortune/qa-baseline-tarot.md`(252개, 248 통과, 4 실패). 기준선의 4 실패는 `/tarot/daily`, `/tarot/three-card`의 "AC-33(표시): JS를 꺼도 설명·면책·FAQ가 화면에 보인다"이며 desktop·mobile 각 2건이다. 상담전화와 무관하게 이전부터 있던 실패(추정: 개발 서버 스트리밍. 운영 빌드 미확인) | QA-T2는 "같은 4건 외에 새 실패 없음"으로 비교한다. 새 실패 후보는 `tarot-copy.spec.ts`의 AC-28 계열. 기준선 4건은 이 기능의 회귀로 세지 않는다 | QA-T2 |
| 타로 문서 (D15) | `docs/tarot/plan.md` AC-28 표시 방식 보충, `docs/tarot/ui-ux-design.md`의 상담전화 명세(8.4 영향 범위 표의 행)에 PC 글자 표시 추가, `docs/tarot/design.md`, `docs/tarot/qa-report.md` 변경 기록 | 타로 기능 문서의 현재 서술과 실제 동작이 달라지는 것을 막는다 | 문서 서술이 실제 동작(터치는 연결, PC는 글자)과 일치 | DOC-3 |
| 개인정보처리방침·이용약관 (FE-11) | 운세 문장 추가. 완료: 방침 10장 문장 조정, 약관 7장 연도 안내까지 | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | 기존 문구와의 충돌 5건은 5.1 위험 수용 목록으로 옮김 | FE-11(완료) |

## 5. 사용자 확인 필요 지점

해결된 항목: U-0(KASI 확인, 2026-11-05 완료), U-5(FE-11 충돌 5건, 5.1 위험 수용 목록으로 이동), U-6(상담전화 방안, 방안 A 확정), U-8(KASI 약관 전문 법률 확인, "법률 검증 없음, 운영자 위험 수용(2026-11-05)"으로 변경). 번호는 이전 승인본과 맞추려고 그대로 두었다.

| 번호 | 시점 | 내용 | 정지 여부 | 관련 티켓 |
|---|---|---|---|---|
| U-1 | UI-2 시작 때(또는 C-3a 시작 전) | `ui-ux-design.md` "승인 대기" 표(허브 h1 설명, 목록 h2, 빈 상태, 설명 h2와 단락 1~4, 허브 FAQ 6쌍, 오늘의 운세 링크 앞 안내) 중 어느 문구를 승인했는지 확인. 문서에는 전부 "승인 대기"로 남아 있고, 지시 내용은 "일부 승인"이다 | 승인 범위가 확인될 때까지 해당 문구는 상수에 "초안" 표시로만 옮김 | UI-2, C-3a, FE-12 |
| U-2 | C-1 완료 직후, C-3b·C-3d 초안 완료 후 | 문구 샘플 검수와 톤 확정: 개인 일운 전체(45), 공통 풀(27), 쥐띠(45), 양자리(45), 오늘의 운세·띠·별자리 FAQ·가이드 초안, 입력 오류·지원 범위·윤달 안내(C-3d). 함께 판단할 것: 공통 풀을 방식별로 나눌지(design.md Q4), 검수 중 바뀐 톤을 copy-log 상단에 기록 | **정지**. 확정 전에는 C-2a, C-2b, C-3b 최종 반영, C-3d 확정, C-4로 넘어가지 않는다 | C-1, C-3b, C-3d, C-2a, C-2b |
| U-3 | C-2a·C-2b 완료 후 | 나머지 띠 11, 별자리 11 검수 여부 선택(plan은 샘플 검수만 요구). 원하면 일부 샘플링 검수 | 사용자 선택 | C-2a, C-2b |
| U-4 | C-4 시작 전 | 웹 검색 샘플 규모(제안: 개인·띠·별자리 묶음별 20문장 이상, 공통 풀 행운·조언·주의 10문장 이상, 고지·FAQ·가이드 10문장 이상)와 "일치 있음" 처리 방식 확인. 일치 문장은 C-5에서 새로 쓴다 | 규모 이견이 있으면 C-4 전에 | C-4, C-5 |
| U-7 | 출시 직전 | **출시 전 확인(법률 확인 아님).** 상담전화 5곳 번호·24시간 운영 재확인과 `COMPLIANCE.md` 날짜 기록. AdFit 정책(사행성 항목)과 복권법 개정안 진행 확인. 고지 문구 최종 확인. 개인정보처리방침·이용약관 최종 확인(5.1 목록의 알려진 충돌 5건은 대상 아님, 그 밖에 새로 생긴 충돌만). 법률 확인은 하지 않는다(5.1) | 정지(출시 조건, 법률 확인 제외) | DOC-1a, DOC-1b, FE-10c |
| U-8 | - | **법률 검증 없음, 운영자 위험 수용(2026-11-05).** 이전의 "KASI 약관 전문 재확인"과 "출시 전 법률 확인 1회"는 하지 않는다. KASI 근거는 이용허락범위 "제한 없음"(사용자 확인)이다. 5.1 참조 | 정지 아님 | DOC-1b |
| U-9 | 지금(BE-1a·FE-2a 완료) | 사용자가 `DATA_GO_KR_API_KEY`로 `generate.mjs`를 직접 실행(BE-1b)하고 이어서 `verify.mjs`를 실행(BE-1c)한다. 실제 호출은 사용자만 한다. 키는 채팅·문서·저장소에 쓰지 않고 PowerShell 세션의 환경변수로만 준다. 스크립트는 호출 약 1,682회이며 하루 한도 10,000건 안이다. 실행 전에 U-14(음력 표 범위 안 C) 이견 여부를 알린다 | **정지(사용자 실행)**. FE-3b, FE-5b, FE-7~9, FE-10a만 이 실행을 기다린다. 달력과 무관한 티켓은 계속 진행 | BE-1b, BE-1c |
| U-10 | 운영 배포 | 운영 배포와 `git push`는 사용자 확인 뒤에만. 배포 전 게이트는 6장 | 정지 | FE-10c 이후 |
| U-11 | 2단계 착수 전 | 1단계 승인, plan 2단계 항목 재승인, R-1 조사 결과로 23시대 시주 기준 선택, 사주 SEO 문구 수정 확인 | 정지 | 2단계 절 |
| U-12 | UI-2 완료 후, FE-1b·FE-6a 시작 전 | Q9: 타로 위기 패널 PC 글자 표시에서 109를 어떤 모양으로 강조할지(채운 버튼 모양 금지) 승인. 운세·타로 결과 하단 목록의 PC 글자 모양도 같은 명세에서 함께 승인 | **정지**. 승인 전에는 FE-1b, FE-6a를 시작하지 않는다 | UI-2, FE-1b, FE-6a, DOC-3 |
| U-13 | 출시 전(FE-1b 이후 아무 때나) | Q8: `1577-0199`, `1588-9191`이 NVDA + Chrome, VoiceOver(iOS Safari), TalkBack(Android Chrome)에서 번호로 자연스럽게 읽히는지 수동 확인. 문제가 있으면 8.4가 정한 대안을 UI-2 담당이 정하고 공용 표시 파일(FE-1a)에 반영 | 출시 조건(개발은 정지하지 않음). 사용자 수동 확인 | FE-1a, UI-2 |
| U-14 | BE-1b 실행 전 | Q7: 음력 표 범위가 안 C(1919~2049)로 정해져 있음을 알림. 안 A·B를 원하면 실행 전에 알려 달라(BE-1a 스크립트는 안 C로 작성됨, 바뀌면 BE-1a 수정 필요) | 이견이 없으면 정지하지 않음 | BE-1b |

### 5.1 위험 수용 목록 (법률 검증 없음, 운영자 위험 수용, 2026-11-05)

사용자 결정(PM 전달): 출시 전 법률 확인을 진행하지 않는다. 운영자가 위험을 수용하고, 이용 동의 게이트(동의하지 않으면 서비스 미제공)를 최소 동의 장치로 유지한다. 아래 항목은 출시 조건이나 정지 지점이 아니다. 이 목록은 나중에 다시 볼 수 있도록 기록하는 것이다.

법률 확인 없이 진행하는 항목(이전에 U-7·U-8에 있던 것)
- 만 14세 미만 처리(안내 문구 + 연령 게이트 병행)와 2월 29일생 기준.
- 이용 동의 게이트와 sessionStorage 보관 방식.
- 책임 고지 문구와 로또 연결 표현(plan이 정한 문구 그대로).
- KASI 두 API의 약관 전문(코드 상수에 포함해 배포하는 조건). 근거는 이용허락범위 "제한 없음"(사용자 확인)뿐이다.
- 타로 선례처럼 "위험 수용 + 확인 권장"으로 둔다(status.md 결정 기록).

FE-11이 찾은 기존 방침·약관 충돌 5건(FE-11 보고 기준. 자세한 문장은 FE-11 보고와 두 파일을 본다)

| 번호 | 위치 | 내용 | 처리 |
|---|---|---|---|
| R-A | 약관 11장 | 기존 문구가 전면 면책 표현이다. 운세 신규 문장은 전면 면책 표현을 쓰지 않는 규칙(R-3)과 어긋난다 | 기존 문구를 고치지 않음. 위험 수용 |
| R-B | 방침 4장 | 법적 근거 서술이 운세의 생년월일 메모리 처리·동의 게이트와 맞는지 확인하지 않음 | 기존 문구를 고치지 않음. 위험 수용 |
| R-C | 방침 10장 | 어린이의 개인정보 문장과 운세의 만 14세 이상 대상 서술이 충돌 | **FE-11에서 문장 조정 완료** |
| R-D | 약관 2장 | 이용 대상 연령 기준이 비어 있음(운세의 만 14세 이상 서술과 공백) | 기존 문구를 고치지 않음. 위험 수용 |
| R-E | 타로 기존 문구 | 타로 화면·문서에 이미 있는 "보장", "예측" 표현(운세는 plan이 금지) | 타로는 이번 범위 밖이라 고치지 않음. 위험 수용. 운세 문구는 계속 금지(R-3, QA-2) |

- FE-11 완료분: 방침 10장 문장 조정(R-C)과 약관 7장 연도 안내.
- 이 목록의 항목이 바뀌거나 새 충돌이 생기면 PM이 사용자에게 보고하고 이 표에 추가한다(예: U-7의 방침·약관 최종 확인에서 새로 발견된 것).

## 티켓

상태 표기: "완료"는 끝난 것, "착수 가능"은 선행이 없거나 이미 끝난 상태, "대기(선행 후)"는 선행 티켓이 끝나야 시작, "사용자 확인"과 "정지"는 5장 지점이 필요한 티켓이다. 상태 칸의 "병렬"은 파일이 겹치지 않아 같은 시점에 다른 agent로 돌려도 되는 티켓이다(겹치면 병렬로 적지 않았다). 디자인 명세 칸의 "입력"은 읽어야 할 design.md·ui-ux-design.md 절이다. 완료 조건의 AC 번호는 plan.md와 design.md 18장 기준이다.

### A. 메인 세션, 문서, DB, 백엔드 없음

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| UI-1 | ui-ux-designer | 허브 `/fortune`, 띠·별자리의 오늘의 운세 링크 명세 추가, Q1·Q2 해소 | - | `docs/fortune/ui-ux-design.md` | - | 완료됨(2026-11-05) | 완료 |
| M-1 | 메인 세션 | `.claude/hooks/guard-files.js`의 backend-dev 범위에 `'scripts/fortune-calendar/'` 추가 | - | `.claude/hooks/guard-files.js` | - | 22행에 항목이 있음을 확인(2026-11-05) | 완료 |
| M-2 | 메인 세션(PM) | KASI 판정. 절기 1920~2028·음력 1391~2050 제공, 이용허락범위 "제한 없음"(사용자 확인), 지원 연도 (나)안 확정. `status.md`에 기록됨 | - | `docs/fortune/status.md` | - | 보류 해제와 (나)안이 status.md에 기록됨 | 완료 |
| QA-T1 | qa | 타로 회귀 기준선. 명령 `pnpm exec playwright test e2e/tarot`(개발 서버, desktop·mobile) | - | `docs/fortune/qa-baseline-tarot.md` | - | 252개 중 248 통과, 4 실패(AC-33 JS 끈 표시, 상담전화와 무관, 이전부터 있던 실패). 기준선 경로 `docs/fortune/qa-baseline-tarot.md` | 완료 |
| M-3 | 메인 세션 | F-1(2029년 이후 절기 보완)을 `status.md` 후속 작업에 기한 2028-12-01로 등록한다. 내용: 2027년 하반기부터 KASI 갱신 확인, 2028-09-01까지 미제공이면 설계로 되돌려 천문 계산 보완 선택, QA-3의 만료 감시 테스트가 2028-12-01 이후 실패함. 또한 법률 검증 없음(운영자 위험 수용, 5.1)을 `status.md` 결정 기록에 남긴다 | - | `docs/fortune/status.md` | 입력: design.md 4.10, 19장 M-2(이 문서에서는 M-3) | status.md에 F-1 항목과 기한, 위험 수용 결정이 있음. 이 문서의 M-2(KASI 판정)와 design.md 19장의 M-2(F-1 등록)는 이름만 다르고 내용은 위 두 티켓이다 | 착수 가능 · 병렬: 모든 티켓 |
| UI-2 | ui-ux-designer | `ui-ux-design.md` 갱신. (1) 상담전화 기기별 모양(design.md D15·8.4 확정안 기준): 결과 하단 목록의 터치/PC 모양(현재 S9 "링크가 아닌 일반 텍스트" 명세를 대체), 타로 위기 패널 109 주 버튼의 PC 글자 모양(Q9, 채운 버튼 모양 금지), 전환 때 레이아웃 높이 유지, Q8 읽기 문제 시 대안. (2) 연도 입력 범위·지원 범위 안내·윤달 안내 명세가 없으면 추가(design.md 4.3). (3) U-1 결과대로 "승인 대기" 표 상태 갱신, 바꾼 문구는 변경 이력에 적는다. 타로 `ui-ux-design.md` 반영은 DOC-3 | U-1 | `docs/fortune/ui-ux-design.md` | 입력: design.md 4.3, 8.4, 19장 UI-2. 기존 "상담전화 텍스트 노출" 절, 색상·타이포그래피·컴포넌트 상태·접근성 절 | 상담전화의 터치/PC 두 모양이 상태별(기본, hover, focus, 터치 영역)로 적힘. 링크 동작 표현("전화 연결" 등) 사용 위치가 터치 환경에 한정됨. 사용자가 승인(U-12). 금지 표현·"사주" 규칙 재점검 문장 갱신 | 착수 가능(U-1 확인과 함께) · 병렬: 다른 모든 티켓(문서 한 개) |
| DB-0 | db-dev | 없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션이 필요 없다 | - | 없음 (`supabase/` 수정 금지) | 입력: design.md 11장 | `supabase/` 변경 없음을 PM이 `git diff`로 확인. DB가 필요해 보이면 architect로 되돌림 | 해당 없음 |
| BE-0 | backend-dev | 없음. API가 없다. `src/app/api/fortune/`을 만들지 않는다 | - | 없음 | 입력: design.md 10장 | `src/app/api/`, `*.repository.ts` 변경 없음. `FF/`에서 `http`, `fetch`, React Query import가 Grep으로 0건(AC-27, AC-47의 근거, R-2) | 해당 없음 |
| DOC-1a | 메인 세션 | 루트 문서 정정·추가. `README.md` "기능" 절에 운세 경로 5개(허브, 오늘의 운세, 띠별, 별자리, 2단계 사주 예정) 추가. `COMPLIANCE.md` 1장(운세: 쿠키 동의와 무관, 생년월일 비전송·비저장, sessionStorage 동의 키 1개), 2장 로또 AgeGate 오류 정정("localStorage 30일 TTL" → 실제 `src/providers/age-gate.provider.tsx` 동작: sessionStorage `<site>_age_gate_verified_sess_v1`, `NEXT_PUBLIC_AGE_GATE_MODE`, 개발 환경 기본 `always`; 정정 전에 코드를 읽어 확인), 7장 Robots and SEO(허브 포함 색인 대상, 운세 문구는 서버 HTML에 없음), 11장 Disclaimers(운세 고지 위치, 상담전화와 재확인 날짜 칸, **상담전화 표시 방식(D15 확정안: 터치는 연결, PC는 글자)**, 금지 표현 목록 위치 `fortune-copy-rule.constant.ts`, "사주" 용어 규칙, 로또 링크 고지), **운세 기능은 "법률 검증 없음, 운영자 위험 수용(2026-11-05)"이고 이용 동의 게이트가 최소 동의 장치임을 한 줄 기록(5.1 목록 요약 포함)**, "Last updated" | FE-2b, FE-4 (파일 이름·저장 키 확정), FE-1b | `README.md`, `COMPLIANCE.md` (루트, agent 범위 밖) | 입력: design.md 15장 표, 16.2, 18.3, 8.4, 이 문서 5.1 | 위 항목 반영. 상담전화 번호·확인 날짜는 "출시 전 재확인"으로 표시. AgeGate 서술이 실제 코드와 일치. 기존 서술 훼손 없음. 위험 수용 기록이 5.1과 일치 | 대기(선행 후) · 병렬: C 티켓, FE-5a, FE-6a 등(루트 문서 두 개) |
| DOC-1b | 메인 세션 | 루트 문서·환경변수 정리(달력 데이터분). `README.md` 환경변수 표에 `DATA_GO_KR_API_KEY`("운세 달력 표 생성 스크립트 전용, 개발 시점, 런타임 미사용, `NEXT_PUBLIC_` 아님") 추가, 새 절 "운세 달력 데이터"(표 위치 `FF/constants/calendar/`, 출처 KASI 공공데이터 특일 정보·음양력 정보, **지원 범위: 출생일 1920-01-01 ~ 2028-12-31, 절기 표 1920~2028, 음력 표 1919~2049, 2029년 이후는 F-1(기한 2028-12-01)**, 다시 만드는 방법 `generate.mjs` 후 `verify.mjs`, 검증 기록 `docs/fortune/calendar-verification.md`). `.env.example`의 `DATA_GO_KR_API_KEY=` 한 줄이 시크릿 값 없이 있는지 확인(이미 있으면 수정 없음). `THIRD_PARTY_NOTICES.md` 새 절 "Original content and data (Fortune)": 문구 자체 작성(작성 AI, 검수 사용자, 이력 `docs/fortune/copy-log.md`), 달력 표 출처 KASI 공공데이터(조회일, 이용허락범위 "제한 없음"(사용자 확인)을 그대로 표기하고 법률 검토를 했다는 표현은 쓰지 않음), 새 의존성·폰트·아이콘 세트 없음, 비제휴. `DEPENDENCY_LICENSES.md`는 `package.json` 의존성 diff가 없음을 확인만 한다 | BE-1c, C-3c, DOC-1a | `README.md`, `.env.example`(확인만), `THIRD_PARTY_NOTICES.md` (루트) | 입력: design.md 15장, 16.2, 4.1, 4.10 | `.env.example`에 시크릿 값 없음. 조회일·범위가 `calendar-verification.md`와 일치. copy-log의 작성일·검수 결과 반영. `DEPENDENCY_LICENSES.md` 변경 없음 확인(AC-40의 `THIRD_PARTY_NOTICES.md` 부분). 문서의 키 이름이 `DATA_GO_KR_API_KEY`로 통일(다른 이름 0건). 법률 확인 완료를 전제하는 문구가 없음 | 대기(선행 후) · 병렬: 코드 티켓 |
| DOC-2 | planner | `plan.md` 갱신(사용자 승인 범위 안). design.md 18.1의 동의 보관 AC 4건(AC-29, 74, 75, 78), 18.2의 수정 표(AC-10, 33, 34, 37, 58, 61~65, 67)와 추가 AC-79~AC-83, 18.3 로또 AgeGate 기재 정정, **18.4 지원 연도(결정 사항 10, 181행, 402행, AC-8, AC-9, 사주 AC-49~57 범위 수정, 추가 AC-84·AC-85)**, **18.5 상담전화 표시(AC-34 수정, 고지 17 한 줄 보충, 추가 AC-86. D15 확정안이 바뀌면 그 내용으로)**. 범위·기존 기능 충돌·검색 노출 절에 허브 `/fortune`과 오늘의 운세 링크 추가, 열린 질문 1(보관 방식 → sessionStorage)·2(서버 HTML 문구 없음, 페이지 안 대체)를 결정 완료로 정리. **plan의 "출시 전 법률 확인" 계열 항목은 "법률 검증 없음, 운영자 위험 수용(2026-11-05)"으로 정리하되 금지 표현·문구 안전 원칙은 그대로 둔다.** 2단계 항목, 고지 문구(위 보충 한 줄 제외), 결정 사항 번호는 바꾸지 않는다 | - | `docs/fortune/plan.md` | 입력: design.md 18.1~18.5, 19장 DOC-2, 이 문서 5.1 | AC 범위가 AC-1~AC-86. 검사 기준이 design.md와 일치. 승인되지 않은 새 요구사항 없음. 법률 확인이 출시 조건으로 남아 있지 않음. QA 착수 전에 끝나야 함 | 착수 가능 · 병렬: 모든 코드 티켓 |
| DOC-3 | planner + ui-ux-designer | 타로 문서 정합. planner: `docs/tarot/plan.md` AC-28 표시 방식 보충(터치는 연결, PC는 글자), `docs/tarot/design.md`·`docs/tarot/qa-report.md` 변경 기록. ui-ux-designer: `docs/tarot/ui-ux-design.md`의 상담전화 명세(8.4 영향 범위 표의 행 번호 근처)에 PC 글자 표시 추가. 타로 코드는 건드리지 않는다 | UI-2(U-12 승인) | `docs/tarot/plan.md`, `docs/tarot/ui-ux-design.md`, `docs/tarot/design.md`, `docs/tarot/qa-report.md` | 입력: design.md 8.4 영향 범위 표, UI-2 결과 | 타로 문서 서술이 실제 동작과 일치. 타로 명세의 기존 터치 동작 서술은 유지 | 대기(UI-2 후) · 병렬: 코드 티켓(`docs/tarot/`만) |

### B. 백엔드 (달력 표 생성 스크립트)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| BE-1a | backend-dev | 생성·검증 스크립트 작성. `generate.mjs`: 환경변수 `DATA_GO_KR_API_KEY`로 `getLunCalInfo`(음력 1919~2049, 월 단위 1,572회 + 1회)와 `get24DivisionsInfo`(절기 1920~2028, 109회)를 호출해 `FF/constants/calendar/lunar-table.constant.ts`와 `solar-term-table.constant.ts`를 생성한다. 윤달이 있는 달은 응답이 평달·윤달 두 건이라 평/윤을 구분해 파싱한다. 절기는 응답의 `sunLongitude`가 비어 있으므로 절기 이름으로 판정하고 `kst`는 HHMM 문자열(끝 공백 trim)이다. 값은 design.md 3장·4.1의 형식(절기는 `MMDD*10000 + HHMM`)으로 내보낸다. Node 내장 `fetch`만 사용, 호출 사이 지연, 실패 연도 재시도, 끝내 실패하면 파일을 쓰지 않고 중단, 응답 숫자 범위 검사 후 쓰기, 생성 파일 첫머리에 "자동 생성, 직접 수정 금지, 생성일, 출처 API 이름" 주석. `verify.mjs`: 생성과 다른 API(양력→음력 `getLunCalInfo`)로 무작위 양력 60건 이상을 재조회해 표 계산값과 비교하고 출력, 2단계 사주 검증용으로 `lunIljin` 표본도 함께 저장한다. `.env` 파일을 읽지 않고, 키 값을 출력하지 않으며, 키가 없으면 키 이름만 안내하고 종료 | M-1(완료), U-14 | `scripts/fortune-calendar/generate.mjs`, `scripts/fortune-calendar/verify.mjs`, (필요 시) 같은 폴더의 보조 `*.mjs` | 입력: design.md 3장, 4.1, 4.10, 2.1, 14장(키 취급), `docs/fortune/kasi-api-check.md`. UI 명세 없음 | 출력 형식이 design.md 3장 타입과 맞음(음력 1919~2049 연속, 절기 1920~2028 연도별 24개). `package.json` 변경 없음. 키가 코드·로그·출력에 없음. 키 없이 실행하면 안내 후 종료. 표 파일은 이 티켓이 직접 만들지 않음. 호출 횟수가 하루 한도 안(약 1,682회). 윤달 두 건 파싱과 `lunIljin` 표본 저장이 코드에 있음 | **완료**(`scripts/fortune-calendar/` 4개 파일 작성. 실제 API 호출은 하지 않았고 사용자가 U-9로 실행) |
| BE-1b | 사용자 | **U-9 정지 지점.** 사용자가 인증키로 `generate.mjs`를 실행해 두 표 파일을 만든다(PowerShell 예: `$env:DATA_GO_KR_API_KEY='...'; node scripts/fortune-calendar/generate.mjs`). 키는 채팅·문서에 쓰지 않는다 | BE-1a(완료), FE-2a(완료, 출력 타입 파일이 있어야 typecheck 통과), U-14 알림 | `FF/constants/calendar/lunar-table.constant.ts`, `solar-term-table.constant.ts` (스크립트 출력) | 입력: design.md 4.1, 2.1 | 두 파일이 생성되고 `git diff`로 연도 범위(음력 1919~2049, 절기 1920~2028)를 PM이 확인. 키 노출 없음. `pnpm typecheck` 통과 | **착수 가능**(사용자 실행, U-9) |
| BE-1c | 사용자 + backend-dev | 사용자가 `verify.mjs`를 실행하고, backend-dev가 결과와 알려진 값 대조 9건을 표에서 찾아 `docs/fortune/calendar-verification.md`에 기록한다. 대조값: 음력 2025-01-01 → 양력 2025-01-29, 음력 2000-01-01 → 2000-02-05, 2025 입춘 02-03 23:10, 2024 춘분 03-20 12:06, 2025 춘분 03-20 18:01, 2026 춘분 03-20 23:46, 2027 춘분 03-21 05:25, 1920 입춘 02-05 11:26, 2026 입춘 02-04 05:02(`kasi-api-check.md` 실제 호출 확인값). 윤달 필드(평달·윤달 구분) 확인 결과와 음력 2023년 윤2월 사례도 함께 기록한다 | BE-1b | `docs/fortune/calendar-verification.md` | 입력: design.md 4.1 "생성과 검증" | 기록에 조회일, API 이름, 표 범위, 대조 건수(60건 이상)와 결과, 윤달 필드 확인, 불일치 처리 포함. 불일치가 나오면 KASI 값을 따르고 PM에 알려 plan AC 수정 요청(plan QA 메모). 불일치 0이거나 처리 완료 | 대기(BE-1b 후) · U-9 |

### C. 프론트엔드: 공용 기반, 동의 게이트, 공용 컴포넌트, 안내 (공통 규칙 R-1~R-5)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| FE-1a | frontend-dev | 상담전화 공용 기반(D4, D15). design.md D15·8.4 확정안의 "공용 구조"와 "영향 범위" 표 중 신규 파일만 만든다(공용 상수·타입, 기기별 표시용 공용 훅·컴포넌트). 공용 상수는 타로 값·순서·문구·`href`와 한 글자도 다르지 않게 복사한다. **타로 파일을 건드리지 않는다.** 타로 쪽 삭제·교체는 FE-1b에서 한꺼번에 한다(중간에 타로가 깨지지 않게). 구현 방식은 8.4 확정안을 따르며 이 문서가 정하지 않는다 | - | `src/types/crisis-phone.type.ts`(신규), `src/constants/crisis-phone.constant.ts`(신규), 8.4 영향 범위 표의 공용 훅·컴포넌트 신규 파일(`src/hooks/`, `src/components/common/` 아래) | 입력: design.md D4, D15, 8.4, 20장. UI 명세: UI-2 이전에는 8.4의 구조만. 글자 표시의 모양은 호출부(FE-1b, FE-6a)가 UI-2 명세로 정해 props로 넘긴다 | 공용 상수가 5곳 순서(109, 1577-0199, 1588-9191, 1388, 1366)와 각 `href`(`tel:` + 숫자만)를 가짐. 공용 표시 파일이 8.4 확정안의 구조·접근성 규칙과 일치. 타로 파일 diff 없음. typecheck, build 통과 | **완료** |
| FE-1b | frontend-dev | 타로 이전. design.md 8.4 영향 범위 표의 타로 3개 파일 행(상수 파일, 결과 하단, 위기 패널)을 그대로 수행한다: 타로 상수 파일에서 공용으로 옮긴 정의 3개(`TarotCrisisPhoneType`, `TAROT_CRISIS_PHONES`, `TAROT_CRISIS_RESULT_LINE`)만 삭제하고 타로 전용 상수·문구는 유지, 결과 하단과 위기 패널이 공용 표시 방식을 쓰게 교체(결과 하단은 서버 컴포넌트 유지). PC 글자 표시의 모양은 UI-2에서 승인된 명세를 따른다(Q9, 채운 버튼 모양 금지) | FE-1a(완료), UI-2(U-12 승인), QA-T1(완료) | `src/features/tarot/constants/tarot-notice.constant.ts`, `src/features/tarot/shared/components/result-notice.component.tsx`, `src/features/tarot/shared/components/crisis-notice.component.tsx` | 입력: design.md D4, D15, 8.4(영향 범위, 접근성 판단). UI-2의 상담전화 명세 | 터치 환경과 서버 HTML의 출력(번호 5개·순서·설명·`tel:` 링크·44px 이상 터치 영역·`CRISIS_RESULT_LINE` 문장·109 접근 이름)이 이전과 같다. PC에서는 8.4 확정안대로 번호가 링크 없이 글자로 보이고 클릭·Enter로 통화 앱이 열리지 않고 선택·복사가 된다. `TAROT_CRISIS_PHONES`, `TAROT_CRISIS_RESULT_LINE`, `TarotCrisisPhoneType`이 `src/` 전체에서 0건. diff가 import 교체·정의 삭제·표시 교체뿐. typecheck, build 통과. 이 티켓 동안 다른 타로 작업을 하지 않음. PC에서 `e2e/tarot.spec.ts` 일부가 일시적으로 깨지는 것은 정상이며 QA-T2가 닫는다 | 대기(UI-2, U-12 후) · 병렬: C 티켓, FE-3a 등(타로 파일 외) |
| FE-2a | frontend-dev | 타입·기본 상수. `FF/types/fortune.type.ts`와 `fortune-calendar.type.ts`는 design.md 3장 타입을 그대로(임의 변경 금지, `FortuneBirthErrorType`에 `'after-max'`, `FortuneDetermineType`에 `{ kind: 'unsupported' }` 포함). 상수: `fortune-route`(FORTUNE_ROUTES), `fortune-input`(`FORTUNE_MIN_BIRTH` 1920-01-01, `FORTUNE_SUPPORTED_MAX_YEAR` 2028, `FORTUNE_MAX_BIRTH`, `FORTUNE_SOLAR_TERM_RENEW_BY` '2028-12-01', 연·월·일 범위, `FORTUNE_MIN_AGE` 14), `fortune-score`(30~95, 구간 55/75), `fortune-zodiac`(12띠 키·이름·순서·연도 주기), `fortune-star-sign`(12별자리 키·이름·시작 중기 번호·안내용 날짜표 `FORTUNE_STAR_SIGN_GUIDE_RANGES`), `fortune-lucky`(오행별 색·방향·숫자 대응표, 4.7 값), `fortune-consent`(문구 버전, 저장 모드 `'session'`, 저장 키 접미사) | - | `FF/types/fortune.type.ts`, `FF/types/fortune-calendar.type.ts`, `FF/constants/fortune-route.constant.ts`, `fortune-input.constant.ts`, `fortune-score.constant.ts`, `fortune-zodiac.constant.ts`, `fortune-star-sign.constant.ts`, `fortune-lucky.constant.ts`, `fortune-consent.constant.ts` | 입력: design.md 1장, 3장, 4.5(별자리 중기 표), 4.6, 4.7, 4.10, 6.3, D2, D8, D14. UI 명세: 별자리 칩 날짜 | 타입이 3장과 한 글자도 다르지 않음. 지원 범위 상수 값이 design.md 2장 코드 블록과 같음. 행운 숫자는 항상 1~10. 별자리 중기 인덱스가 4.5 표(물병 1, 물고기 3, 양 5, 황소 7, 쌍둥이 9, 게 11, 사자 13, 처녀 15, 천칭 17, 전갈 19, 사수 21, 염소 23)와 같음. 별자리 표기가 plan 결정 13(사수자리 대표 표기). 날짜표는 판정에 쓰지 않는 안내용이며 "일반적인 기간"으로 쓴 자체 값 | **완료** |
| FE-2b | frontend-dev | 문구·검사·풀 뼈대. `fortune-notice.constant.ts`: design.md 8.1 표의 상수 전부를 plan 고지 1~17, 로또 고지·링크 라벨(`/lotto/generator`), `FORTUNE_SAJU_GLOSS`, `FORTUNE_BIRTH_ERROR_MESSAGES`(5종, `after-max` 포함, design.md 4.3 초안), `FORTUNE_SUPPORTED_RANGE_NOTICE`, `FORTUNE_LEAP_MONTH_HINT_TEMPLATE`, `ui-ux-design.md` 승인 문구로 채운다(고지 문구는 옮기기만, 연도는 `FORTUNE_MIN_BIRTH`·`FORTUNE_MAX_BIRTH`로 만든다). `fortune-seo.constant.ts`(design.md 13.1 허브·오늘·띠·별자리 항목, 사주 항목은 만들지 않음), `fortune-faq.constant.ts`·`fortune-guide.constant.ts`(허브·오늘·띠·별자리의 export 이름과 타입만, 본문은 C-3a/C-3b), `fortune-copy-rule.constant.ts`(`FORTUNE_FORBIDDEN_TERMS`, `FORTUNE_FORBIDDEN_PATTERNS`, `FORTUNE_HEALTH_TERMS`, `FORTUNE_SAJU_REDUNDANT_TERMS`, 허용 예외, 방식 A 화이트리스트는 빈 배열), 문구 풀 뼈대(`pools/common`, `pools/personal`, `pools/tti/*` 12개와 합본, `pools/star-sign/*` 12개와 합본: `as const satisfies`로 항목 5 × 구간 3 × 변형 3 누락을 컴파일 때 막고 문구 필드는 빈 문자열) | FE-2a(완료) | `FF/constants/fortune-notice.constant.ts`, `fortune-seo.constant.ts`, `fortune-faq.constant.ts`, `fortune-guide.constant.ts`, `fortune-copy-rule.constant.ts`, `FF/constants/pools/common.constant.ts`, `personal.constant.ts`, `tti/*.constant.ts`(12), `tti-pools.constant.ts`, `star-sign/*.constant.ts`(12), `star-sign-pools.constant.ts` | 입력: design.md 4.3, 5장, 8.1~8.3, 13.1. ui-ux-design.md 문구 절 "승인됨" 표 | 상수 이름이 8.1 표와 같음. 방식 A 안내 3문장이 plan 고지 3 그대로이고 `FORTUNE_SAJU_GLOSS`로 시작하는 괄호 설명을 포함하며 금지 구("사주 분석", "사주 풀이")가 없음(AC-10, AC-37). 폐기 문장이 없음. 금지·허용 목록 상수를 import하는 화면 코드가 없음. 풀 파일이 12띠·12별자리 키를 모두 가짐. 오류 문구에 입력값 없음. 문구 필드가 비어 있는 것은 의도이며 이 상태로 FE-10c(출시 스위치) 금지. 입력 오류·범위·윤달 문구는 초안 표시(최종은 C-3d) | **착수 가능** · 병렬: FE-3a, UI-2, DOC-2, M-3 (파일 겹침 없음) |
| FE-3a | frontend-dev | 달력과 무관한 순수 함수. `fortune-date.util.ts`(`isValidSolarDate`, JDN 왕복, `compareYmd`, `parseDateKey`, `calculateFortuneManAge`: 2월 29일생은 평년 3월 1일에 한 살 증가), `fortune-seed.util.ts`(FNV-1a, mulberry32, 점수 30~95, 구간, 변형 선택), `fortune-reading.util.ts`(`buildFortuneReading`: 난수 사용 순서 점수 → 변형 → 공통 문구 → 행운 고정). 오늘 날짜는 `@/lib/date`의 `getKoreaDateKey()`를 쓴다. 시드 문자열은 design.md 4.6 확정값. 개인 일운은 오늘이 2029년 이후여도 정상 동작(범위 제한은 출생일에만 건다) | FE-2a(완료) | `FF/utils/fortune-date.util.ts`, `fortune-seed.util.ts`, `fortune-reading.util.ts` | 입력: design.md 4.2, 4.6, 4.7, 4.10. UI 명세 없음 | 시그니처가 design.md와 같음. 2000-01-01 JDN 2451545, 왕복 변환 일치. 만 나이: 오늘 2026-11-05에 출생 2012-11-06 → 13세, 2012-11-05 → 14세, 오늘 2026-11-04에 2012-11-05 → 13세(AC-42, AC-43). 같은 입력은 항상 같은 결과(AC-2). 연속 7일 총운이 모두 같지 않음(AC-4). 점수 30~95 정수, 구간 54/55/74/75 경계(AC-5). 행운 숫자 1~2개·1~10(AC-6). 오늘 = 2029-01-01, 2030-06-15를 넣어도 결과 생성(AC-84 근거). 사례 계산 결과를 보고에 적음(최종 검증은 QA-1a) | **착수 가능** · 병렬: FE-2b, UI-2, DOC-2 |
| FE-3b | frontend-dev | 달력 의존 순수 함수. `fortune-lunar.util.ts`(`convertLunarToSolar`, `getLunarLeapMonth`, `getLunarMonthLength`, `getSeollalDate`: 윤달은 같은 번호 평달 바로 뒤, 윤달·없는 날 오류), `fortune-solar-term.util.ts`(절기 시각 조회: 범위 밖이면 `null`, 경계일 판정, 분 단위 비교 규칙), `fortune-birth.util.ts`(`resolveFortuneBirth` 순서: 빈 값 → 날짜 유효성/음력 변환 → 1920-01-01 이전 `before-min` → 2028-12-31 이후 `after-max` → KST 오늘 이후 `future`), `fortune-tti.util.ts`(입춘 시각 기준 띠, 설날 기준 띠, 범위 밖 `unsupported`), `fortune-star-sign.util.ts`(중기 시각 기준 별자리, 범위 밖 `unsupported`). `calendar/*.constant.ts`는 만들거나 고치지 않는다(R-6) | FE-3a, BE-1b (BE-1c 권장) | `FF/utils/fortune-lunar.util.ts`, `fortune-solar-term.util.ts`, `fortune-birth.util.ts`, `fortune-tti.util.ts`, `fortune-star-sign.util.ts` | 입력: design.md 4.1, 4.3, 4.4, 4.5, 4.10 | 음력 2025-01-01 → 2025-01-29, 음력 2000-01-01 → 2000-02-05(AC-7). 윤달 없는 달 + 윤달 → `lunar-no-leap`, 29일 달의 30일 → `lunar-invalid-day`(AC-8). 음력 2023년 2월은 평달과 윤달이 서로 다른 양력으로 변환(AC-85 근거). 빈 값, 2월 30일, 미래, 1919-12-31 `before-min`, 양력 2029-01-01 `after-max`, 음력 입력이 양력 2029년이 되면 `after-max`, 2028 이내 미래는 `future`(AC-9). 1990-06-15 말, 1992-05-10 원숭이(AC-14). 2025-02-01 용 + 설날 기준 뱀(AC-15). 2025-02-03 need-time, 23:09 용, 23:30 뱀, 2025-02-04 뱀(AC-16). 1990-05-15 황소, 1990-08-10 사자, 2026-03-10 물고기(AC-22). 2026-03-20 need-time, 23:00 물고기, 23:59 양(AC-23). 2027-03-21 04:00 물고기, 06:00 양, 2027-03-20 물고기(AC-24). 음력 입력 경계일은 양력 변환 뒤 판정(AC-25). 1920-01-05 염소(1919 표 없이). 2029년 입력 `getSolarTermTime`이 `null`, 2029-02-04 띠 `unsupported`, 2029-03-20 별자리 `unsupported`. 오류 문구에 입력값 없음 | 대기(FE-3a, BE-1b 후) · 병렬: FE-4, FE-6a, C 티켓 등(파일 겹침 없음) |
| FE-4 | frontend-dev | 이용 동의 게이트. `src/app/fortune/layout.tsx`(서버, children을 `FortuneConsentProvider`로 감쌈, h1·문구 없음), `consent.provider.tsx`(리듀서 RESTORE/GRANT/DECLINE/BACK/RESET, 첫 렌더 `checking`), `use-fortune-consent.hook.ts`, `fortune-consent-storage.service.ts`(sessionStorage 키 `<NEXT_PUBLIC_SITE_ENG_NAME>_fortune_consent_v1`, 값은 v·version·agreedAt만, 손상값·버전 불일치는 삭제, 예외를 던지지 않음, 모드 `'memory'` 전환 지원), `consent-gate`(checking 스켈레톤 / required 동의 화면 / declined 이용 불가 화면 / granted children), `consent-form`(체크 3개, `aria-disabled`, 미완료 클릭 시 안내와 첫 미선택 항목 포커스), `consent-declined`, `consent-reset`(granted일 때만). **이 게이트가 법률 검증 없는 상태의 최소 동의 장치다(5.1). 동의하지 않으면 서비스를 제공하지 않는 동작을 유지한다** | FE-2a(완료), FE-2b | `src/app/fortune/layout.tsx`, `FF/shared/components/consent.provider.tsx`, `consent-gate.component.tsx`, `consent-form.component.tsx`, `consent-declined.component.tsx`, `consent-reset.component.tsx`, `FF/hooks/use-fortune-consent.hook.ts`, `FF/services/fortune-consent-storage.service.ts` | 입력: design.md 6장, 12.1, 12.3, 18.1. ui-ux-design.md "이용 동의 화면", "이용 불가 화면", "스켈레톤", "동의 다시 설정", "컴포넌트 상태", "인터랙션·애니메이션"(전환 모션 없음), "접근성", "간격·그리드"(`scroll-mb-48`) | 동의 전·거절 상태에서 panel을 렌더링하지 않음(AC-67, AC-72). 체크 3개 처음 해제(AC-68), 3개 전 진행 불가·안내·첫 미선택 포커스(AC-69, AC-77). 동의 시 children 표시(AC-70). 이용 불가 화면에 결과·입력칸 없음, 돌아가기로 복귀(AC-71). 저장 값 필드 3개 외 없음, 거부는 저장 안 함, 같은 탭 유지·새 탭 재질문(18.1 기준 AC-74, AC-75, AC-78). 다시 설정이 키를 지움(AC-75). 쿠키 동의와 상태 독립(AC-32). 동의 여부 이벤트·`console.*` 없음(AC-73). Provider는 마운트 때 저장소를 읽기만 함(허브 방문이 상태를 만들거나 지우지 않음, AC-83). 단독 화면 검증은 FE-7 이후이므로 이 티켓은 타입·빌드·코드 점검으로 마친다. 임시 미리보기 페이지를 만들지 않음 | 대기(FE-2b 후) · 병렬: FE-3a, FE-5a, FE-6b |
| FE-5a | frontend-dev | 입력·결과 표시 컴포넌트(상태는 부모, Controlled, props로 값을 받음). `birth-form`(react-hook-form + zod, 양력/음력 세그먼트, 숫자 3칸, `<form>` 네이티브 제출 없음, 오류는 `FortuneBirthErrorType` props. **연도 범위 1920 ~ `min(KST 오늘 연도, FORTUNE_SUPPORTED_MAX_YEAR)`**, 숫자 입력이든 선택 목록이든 같은 범위. **윤달 체크는 음력일 때만 보이고, 그해 그 달에 윤달이 있을 때만 활성화하며 안내 `FORTUNE_LEAP_MONTH_HINT_TEMPLATE`를 보인다. 윤달이 없는 달이면 비활성화하고 선택을 해제한다**), `birth-time-form`(시·분, "시각 반영", "시각 모름"), `candidate-choice`(후보 둘, 정답 표시 없음), `lunar-confirm`("음력 ○ → 양력 ○" 줄, 윤달이면 "(윤달)" 표시), `age-blocked`(입력 재표시 없음, 이용 계속 장치 없음, 홈 링크만), `reading`(기준 날짜 줄, 총운 점수·요약, 항목 4개, 조언·주의, 방식 안내, 점수 안내, 점수 눈금 SVG와 M1 framer-motion), `lucky`(행운 색·방향·숫자, 로또 고지 접힘 없음, `/lotto/generator` 링크는 쿼리 없음), `use-korea-date-key.hook.ts`(마운트 후 KST 날짜 키, 1분 간격·화면 복귀 시 갱신). **의존 분리(dev-lead 제안)**: design.md 4.3은 birth-form이 `getLunarLeapMonth`, `getLunarMonthLength`를 부르는 동작을 정한다. FE-5a를 달력 표 없이 시작하려고 두 함수를 `birth-form` props로 주입받게 만든다(동작은 design과 같고 FE-7~9의 panel이 FE-3b 함수를 넘긴다). 이견이 있으면 PM이 FE-5a를 FE-3b 뒤로 미룬다 | FE-2a(완료), FE-2b | `FF/shared/components/birth-form.component.tsx`, `birth-time-form.component.tsx`, `candidate-choice.component.tsx`, `lunar-confirm.component.tsx`, `age-blocked.component.tsx`, `reading.component.tsx`, `lucky.component.tsx`, `FF/hooks/use-korea-date-key.hook.ts` | 입력: design.md 4.3(입력 UI의 연도·윤달 처리), 7.1, 7.3, 12.2, 12.3. ui-ux-design.md "오늘의 운세"(입력, 결과), "점수 눈금", "시각 질문", "후보 선택", "연령 안내 화면", UI-2가 추가한 연도 범위·윤달 안내, "컴포넌트 상태", "인터랙션·애니메이션"(M1, 스켈레톤), "접근성", "색상", "타이포그래피", "간격·그리드" | 컨트롤이 명세의 상태를 가짐(기본, hover, focus, disabled, 로딩, 에러, 빈 상태). 연도 입력 상한이 `min(오늘 연도, 2028)`(AC-84), 1919 입력 시 범위 안내(AC-9). 음력 2023년 2월은 윤달 체크 활성+안내, 3월은 비활성(AC-8, AC-85). 입력칸 이름·연락처·성별·출생지 없음(AC-31). 오류 문구에 입력값 없음. 연령 안내 화면에 생년월일 재표시 없음, 보호자 확인 버튼 없음(AC-45). 행운 숫자 "오늘의 행운 숫자" 표시, 로또 번호처럼 보이는 표시·6개 조합·넘기는 기능 없음(AC-35, AC-36). 결과 표시는 값을 props로만 받고 저장·전송 없음(AC-27~30). 색은 토큰만(`design-guard` 통과). M1은 reduced motion에서 즉시 최종 위치. 이후 화면 티켓에서 이 파일들을 수정하지 않도록 props를 여기서 확정. 임시 미리보기 페이지 금지(화면 확인은 FE-7 이후) | 대기(FE-2b, UI-2 후) · 병렬: FE-3a, FE-4, FE-6b |
| FE-5b | frontend-dev | `use-birth-flow.hook.ts`: 입력 → 연령 확인 → 시각 질문 → 후보 선택 상태 머신(useReducer, design.md 7.2 타입 그대로). 판정 함수는 인자로 받음(오늘의 운세는 판정 없이 done, 띠·별자리는 FE-3b 함수). 순서: `resolveFortuneBirth` → 오류면 input → `calculateFortuneManAge < 14`면 age-blocked → 판정. 판정이 `unsupported`를 돌려주면 결과 없이 입력 단계로 돌아가고 `FORTUNE_SUPPORTED_RANGE_NOTICE`를 안내한다(`after-max`·`before-min`이 먼저 막으므로 안전망) | FE-3b, FE-5a | `FF/hooks/use-birth-flow.hook.ts` | 입력: design.md 7.1, 7.2, 12.3, 4.10 | age-blocked에서 입력값을 상태에 남기지 않음(AC-42, AC-47). 14세 경계(AC-43), 음력 입력도 양력 변환 뒤 같은 기준(AC-44). 시각 입력칸은 연령 통과 뒤에만(AC-46). 모든 입력 화면이 이 훅 하나를 사용(AC-46, AC-76). `after-max`가 `future`보다 먼저 안내됨(AC-9). `unsupported` 결과가 화면에 결과를 만들지 않음. 상태가 URL·저장소에 올라가지 않음(AC-28, AC-30) | 대기(FE-3b, FE-5a 후) · 병렬: FE-6a 등 |
| FE-6a | frontend-dev | 서버 안내 컴포넌트('use client' 없음, 단 상담전화 표시는 8.4 확정안의 공용 표시 방식에서 필요한 최소 클라이언트 부분만 허용): `disclaimer-notice`(h1 바로 아래 상시 면책), `input-notice`(개인정보·연령·책임 고지), `noscript-notice`, `result-notice`(짧은 면책 + 책임 고지 + 공용 `CRISIS_PHONES`·`CRISIS_RESULT_LINE` 다섯 곳. **상담전화 표시는 design.md D15·8.4 확정안을 따른다**: 터치 환경은 눌러서 연결, PC는 글자, 타로와 같은 방식), `today-link`(링크 앞 안내 한 줄 + `FORTUNE_ROUTES.today` 링크, 쿼리·해시 없음), `calc-basis`(페이지별 항목 선택 props. **지원 범위 문장 "1920년 1월 1일부터 2028년 12월 31일 …"을 `FORTUNE_MIN_BIRTH`·`FORTUNE_MAX_BIRTH`로 만들어 포함**), `detail-notice`(이용 안내 9항), `faq`(h2 + h3 + p, 아코디언 없음) | FE-1a(완료), FE-2b, UI-2(U-12 승인) | `FF/shared/components/disclaimer-notice.component.tsx`, `input-notice.component.tsx`, `noscript-notice.component.tsx`, `result-notice.component.tsx`, `today-link.component.tsx`, `calc-basis.component.tsx`, `detail-notice.component.tsx`, `faq.component.tsx` | 입력: design.md 7.4, 7.5, 8.1, 8.4, 12.2. ui-ux-design.md "공통 틀", "상시 면책 상자", "입력 영역 안내", "noscript 안내", "결과 하단 면책 + 상담전화"(UI-2 갱신본), "오늘의 운세 링크", "가이드·계산 기준·FAQ·이용 안내", "컴포넌트 상태", "접근성" | 상시 면책이 접기·툴팁 없이 상자로 표시되고 JS를 꺼도 HTML에 있음(AC-33). 상담전화 다섯 곳(109, 1577-0199, 1588-9191, 1388, 1366)이 타로와 같은 번호·순서·표시 방식이고 AC-34·AC-86(design.md 18.5, D15 확정안 반영본)을 만족. 이용 안내에 만 14세 이상 대상 항목과 판단·선택 책임 항목(AC-48). 입력 안내가 AC-31 의미와 일치. noscript 안내(AC-72). 오늘의 운세 링크 하나, 앞 안내 문구는 U-1 확정 결과, href는 쿼리 없는 `/fortune/today`(AC-81). 계산 기준에 지원 범위 문장이 있음. 안내 컴포넌트에 불필요한 `'use client'`·훅 없음 | 대기(FE-2b, UI-2·U-12 후) · 병렬: FE-6b, FE-3a, FE-4, FE-5a, C-1 |
| FE-6b | frontend-dev | 화면별 가이드 서버 컴포넌트. `today/components/guide.component.tsx`(사용법·결과 읽는 법), `tti/components/guide.component.tsx`(12띠와 출생 연도 대응 표(입춘 기준 병기), 내 띠 찾는 법), `star-sign/components/guide.component.tsx`(12별자리 일반 날짜 기간 표 + "해마다 하루 정도 달라질 수 있다"). 본문은 `fortune-guide.constant.ts`에서 가져오고 C-3b가 채운다. 띠 연도 표는 `FORTUNE_ZODIAC`의 12년 주기 규칙으로 만들고 `fortune-tti.util.ts`를 import하지 않는다(표시 범위는 1920~2028 출생에 한정) | FE-2b | `FF/today/components/guide.component.tsx`, `FF/tti/components/guide.component.tsx`, `FF/star-sign/components/guide.component.tsx` | 입력: design.md 12.2. ui-ux-design.md "가이드·계산 기준·FAQ·이용 안내", "타이포그래피"(`max-w-[68ch]`) | 서버 컴포넌트('use client'·훅 없음). 표는 `<table>` + 캡션. 본문 구조·클래스만 만들고 임시 문구를 쓰면 주석으로 표시해 C-3b가 교체. 별자리 표에 AC-26 문구 위치 있음 | 대기(FE-2b 후) · 병렬: FE-4, FE-5a, FE-6a |

### D. 프론트엔드: 화면, 허브, 페이지, 메뉴 (공통 규칙 R-1~R-5)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| FE-7 | frontend-dev | 오늘의 운세 화면. `root`('use client': `FortuneConsentGateComponent` + `next/dynamic(..., { ssr: false })`로 panel 지연 로드, 로딩 중 스켈레톤), `panel`(birth-form(FE-3b의 `getLunarLeapMonth`·`getLunarMonthLength` 주입) → age-blocked / lunar-confirm / reading / lucky, 결과 끝에 "다른 기준의 운세" 링크로 `/fortune/tti`, `/fortune/star-sign`). 문구 풀·달력 표는 panel 쪽에서만 import해 동의 전에 내려받지 않는다 | FE-3b, FE-4, FE-5a, FE-5b, C-1(샘플 문구, 화면 확인용) | `FF/today/components/root.component.tsx`, `FF/today/components/panel.component.tsx` | 입력: design.md 7.3, 12.1, 12.2, 12.3, D5, D14. ui-ux-design.md "오늘의 운세"(입력, 결과), "연령 안내 화면", "스켈레톤", "컴포넌트 상태", "인터랙션·애니메이션", "접근성" | AC-1(동의 후 생년월일 입력 → 총운·항목 점수와 문구·행운 요소·조언·주의), AC-2, AC-3(한국 날짜 기준, 자정 직전 → 직후 날짜 변경), AC-7(음력 확인 줄), AC-8, AC-9, AC-11(링크), AC-30(새로고침 시 빈 입력), AC-42~AC-47, AC-67~AC-72 화면 연결, AC-76, AC-66, AC-84(기기 시계 2029-01-02에도 결과 정상, 연도 입력 상한 2028), AC-85(윤달 구분 변환과 "(윤달)" 표시). panel이 동의 전 DOM에 없음. 상태가 hydration 오류 없이 서버 HTML과 일치 | 대기(FE-3b, FE-5b 등 후) · 병렬: FE-8, FE-9 (폴더가 다름) |
| FE-8 | frontend-dev | 띠별 운세 화면. `root`, `panel`(칩 12개 선택 + 내 띠 찾기 + 기준 차이 안내 + 계산 기준 문장), `list`(12띠 항목이 처음부터 모두 접힘 상태로 보이고, 칩·찾기·후보로만 펼침. 항목 머리는 버튼이 아님), `finder`(생년월일 → 연령 → 입춘일 시각 → 띠 + 설날 기준 안내 → 그 띠가 목록에서 펼쳐짐. birth-form에 FE-3b의 윤달 함수 주입) | FE-3b, FE-4, FE-5a, FE-5b, C-1 | `FF/tti/components/root.component.tsx`, `panel.component.tsx`, `list.component.tsx`, `finder.component.tsx` | 입력: design.md 4.4, 7.3, 12.2, D14. ui-ux-design.md "띠별 운세", "시각 질문", "후보 선택", "컴포넌트 상태", "인터랙션·애니메이션" | AC-12(동의 뒤 12띠 총운 + 항목 문구, 동의 전에는 없음), AC-13, AC-14~AC-17, AC-18, AC-19(기준 차이 안내), AC-46, AC-69 연동, AC-84(2029 시계에도 목록·찾기 정상, 2028-12-31 출생까지 판정). 로또 영역이 펼친 항목 안에만 있어 한 화면에 한 번. 오늘의 운세 링크는 패널 안에 중복하지 않음(AC-81은 FE-10a) | 대기(FE-3b, FE-5b 등 후) · 병렬: FE-7, FE-9 |
| FE-9 | frontend-dev | 별자리 운세 화면. 띠별과 같은 틀(`root`, `panel`, `list`, `finder`). 칩 이름 아래 `FORTUNE_STAR_SIGN_GUIDE_RANGES`, 칩 묶음 아래 "해마다 하루 정도 달라질 수 있습니다" 문구, 찾은 결과 줄에 설날 병기 없음 | FE-3b, FE-4, FE-5a, FE-5b, C-1 | `FF/star-sign/components/root.component.tsx`, `panel.component.tsx`, `list.component.tsx`, `finder.component.tsx` | 입력: design.md 4.5, 7.3, 12.2, D14. ui-ux-design.md "별자리 운세", "시각 질문", "후보 선택" | AC-20~AC-26, AC-18, AC-84. 경계일 시각 질문, "시각 모름"이면 인접 두 별자리가 나란히 보이고 정답 표시 없음 | 대기(FE-3b, FE-5b 등 후) · 병렬: FE-7, FE-8 |
| FE-10a | frontend-dev | 기능 페이지 3개. `src/app/fortune/today/page.tsx`는 기존 ComingSoon 파일을 통째로 교체(noindex 제거). `tti/page.tsx`, `star-sign/page.tsx` 신규. 서버 컴포넌트, `buildMetadata`(`FORTUNE_SEO`, `pathname`은 `FORTUNE_ROUTES`), `JsonLdComponent`(Breadcrumb 홈 > 운세(`/fortune`) > 페이지, FAQPage는 화면 FAQ와 같은 상수), `TitleWrapperComponent`(유일한 h1), design.md 12.2 트리 순서(면책 → 입력 안내 → noscript → root → 결과 하단 안내(상담전화 포함) → 오늘의 운세 링크(띠·별자리만) → 가이드 → 계산 기준(지원 범위 문장 포함) → FAQ → 이용 안내 → 동의 다시 설정). 광고 슬롯을 추가하지 않음 | FE-6a, FE-6b, FE-7, FE-8, FE-9, C-3b | `src/app/fortune/today/page.tsx`, `src/app/fortune/tti/page.tsx`, `src/app/fortune/star-sign/page.tsx` | 입력: design.md 12.1, 12.2, 13.1, 13.2. ui-ux-design.md "공통 틀", "오늘의 운세 링크" | AC-61(noindex 없음, title·description·canonical·OG), AC-62(JS를 끈 HTML에 설명·FAQ·면책·이용 대상 안내 있고 점수·문구 없음), AC-63(h1 하나), AC-64, AC-10(페이지의 "사주"가 허용 문장에만), AC-31, AC-33, AC-48, AC-81(띠·별자리의 오늘의 운세 링크), AC-86(세 페이지의 상담전화). `ComingSoonComponent`·`robots` noindex 제거 | 대기(선행 후) · 병렬: 없음(조립 마지막) |
| FE-10b | frontend-dev | 메뉴 정의 변경(출시 스위치 제외). `MENU_LIST` 운세 그룹: `href`를 허브 `/${MENU_GROUP_NAME_ENUM.FORTUNE}`, 기존 "오늘의 운세" `colorClass`를 `text-menu-fortune`, 설명·예시는 승인 문구, 항목 "띠별 운세"(`/fortune/tti`, `PawPrint`)와 "별자리 운세"(`/fortune/star-sign`, `Telescope`) 추가, `MENU_ICONS`에 두 아이콘 추가. 그룹 `comingSoon: true`는 유지한다(sitemap 노출 없음, "준비 중" 배지 유지). 사주 항목은 추가하지 않음 | - | `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts` | 입력: design.md 13.1(MENU_LIST 수정), D8. ui-ux-design.md "메뉴" 절(승인됨) | 그룹 href `/fortune`, 세 항목 colorClass `text-menu-fortune`, `text-amber-600` 제거. `/sitemap.xml`에 `/fortune*`가 없음(comingSoon 유지). 헤더·모바일 메뉴·홈에서 운세가 여전히 "준비 중". 로또·타로·점심·어디 가 그룹 diff 없음. 라벨·설명이 방식 A 표기 규칙을 지킴("사주" 없음). QA-D8: `MENU_LIST` 경로와 `FORTUNE_ROUTES`가 같음(QA-3) | **완료** |
| FE-10c | frontend-dev | 출시 스위치. `menu.constant.ts` 운세 그룹에서 `comingSoon: true` 한 줄 삭제. 다른 변경 없음 | FE-10a, FE-10b(완료), FE-11(완료), FE-12, C-2a, C-2b, C-3b, C-3d, C-4(필요 시 C-5), DOC-1a, DOC-1b, QA-T2, BE-1c, 6장 게이트 확인(법률 확인은 선행 조건이 아님, 5.1) | `src/constants/menu.constant.ts` | 입력: design.md 13.1, 20장 | `/sitemap.xml`에 `/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`이 있고 `/fortune/saju`가 없음(AC-65, AC-80). 헤더·모바일·홈에서 운세 "준비 중" 배지가 사라지고 링크가 `/fortune`으로 감(AC-61). 문구 풀에 빈 문자열이 0건 | 대기(선행 후) · 병렬: 없음 |
| FE-10d | frontend-dev | `SECTION_BADGE_COLOR.fortune` 값만 `'bg-menu-fortune/10 text-foreground border-menu-fortune/40'`로 변경 | - | `src/constants/theme.constant.ts` | 입력: ui-ux-design.md "색상" 절의 Q4. UI 명세 외 변경 없음 | `fortune` 키 한 줄만 diff. 다른 키(`lunch`, `where`, `tarot`, `lotto`) 불변. typecheck 통과. 영향 범위는 4장 | **완료** |
| FE-11 | frontend-dev | 개인정보처리방침·이용약관 갱신. 시작 전 기존 문구를 읽고 충돌이 있으면 고치지 말고 PM에 보고(U-5). 방침 1장 "수집 항목 및 방법"에 운세 생년월일·태어난 시각은 서버로 전송·저장하지 않고 브라우저 메모리에서만 쓴다는 문장, 브라우저 저장소 절에 운세 이용 동의(동의 여부, 문구 버전, 동의 시각만 이 탭 sessionStorage에 저장, 탭을 닫으면 삭제, 생년월일 저장 안 함), 10장 "어린이의 개인정보"에 운세는 만 14세 이상 대상·이용 전 확인·생년월일 기반 확인(저장 안 함), `EFFECTIVE_DATE` 갱신. 약관 1장에 운세 추가, 새 장 "운세 서비스"(오락·참고용, 이용 동의, 판단·선택은 이용자 본인에게 있음(전면 면책 표현 금지), 만 14세 이상 대상, 비제휴), 장 번호 이동 시 함께 수정, `EFFECTIVE_DATE` 갱신 | - | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | 입력: design.md 15장 표(갱신 대상), plan "법적·정책 요구사항". 새 화면 없음(기존 스타일 유지) | 새 문장이 합니다체이고 금지 표현(책임 과장 포함)이 없음. 저장 항목이 sessionStorage 동의 키 하나와 일치(AC-29, AC-78). 기존 문구 훼손 없음. 시행일 갱신 | **완료**(방침 10장 문장 조정과 약관 7장 연도 안내까지. 기존 문구와의 충돌 5건은 5.1 위험 수용 목록으로 이동) |
| FE-12 | frontend-dev | 허브. `hub/components/root.component.tsx`(`FortuneHubComponent`, 서버: `MENU_LIST` 운세 그룹 items를 공용 `MenuListComponent`로 그림 + 허브 설명 4단락)와 `src/app/fortune/page.tsx`(`buildMetadata`, JsonLd Breadcrumb 홈 > 운세 + ItemList(로또 허브와 같은 형식) + FAQPage, h1 "운세", 상시 면책, 허브 목록, FAQ, 결과 하단 안내(상담전화 5곳, FE-6a의 결과 하단 컴포넌트), 이용 안내 순서). `'use client'` 컴포넌트, 동의 게이트, 입력칸, 운세 문구 풀 import 없음. 두지 않는 것: 입력 안내, noscript 안내, 동의 다시 설정, 로또 링크, 계산 기준 상세 | FE-2b, FE-6a, FE-10b(완료), C-3a | `FF/hub/components/root.component.tsx`, `src/app/fortune/page.tsx` | 입력: design.md 7.4, 12.1, 12.2, 13.1, D11. ui-ux-design.md "운세 허브 `/fortune`", "메뉴", "결과 하단 면책 + 상담전화", "컴포넌트 상태"(허브 목록 행) | AC-79(h1 "운세", 세 링크가 동의와 무관하게 보이고 서버 HTML에 있음, 동의 화면·입력칸·점수·문구 없음), AC-33·AC-34·AC-86(허브의 면책·상담전화 표시 방식), AC-37(허브 문구 검사), AC-62·AC-63·AC-64(Breadcrumb 2단계 + ItemList + FAQPage), AC-61(noindex 없음, title·description·OG alt는 "사주" 없음), AC-83(허브가 동의 상태를 만들거나 지우지 않음), 사주 링크 없음. 허브 설명 약 600자 이상. 단락 2의 "사주"는 `FORTUNE_SAJU_GLOSS` 괄호 설명이 붙은 허용 문장. 직접 URL로만 접근 가능(메뉴 준비 중 유지) | 대기(선행 후) · 병렬: FE-4, FE-5a, FE-6b, FE-3a (파일 겹침 없음) |

### E. 문구 작성 (AI 초안 + 사용자 검수, 담당 frontend-dev, 공통 규칙 R-3, R-7)

작성 순서는 plan "콘텐츠 제작 원칙"을 따른다: 샘플(C-1) → 사용자 검수(U-2) → 나머지(C-2a, C-2b, C-3b·C-3d 최종) → 유사 문장 점검(C-4, C-5) → 기록 완성(C-3c). 작성자 표기는 "AI(Claude, frontend-dev)", 검수자는 "사용자"다.

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| C-1 | frontend-dev | 샘플 작성. 개인 일운 전체(항목 5 × 구간 3 × 변형 3 = 45), 공통 풀(요약·조언·주의 × 구간 3 × 변형 3 = 27), 쥐띠 45, 양자리 45(합계 162문장). `docs/fortune/copy-log.md`를 새로 만든다: 상단에 AI 생성 지침 6항(plan "콘텐츠 제작 원칙")과 톤, 웹 검색 샘플 확인 기록 칸, 묶음별 표(묶음, 작성자, 작성일, 검수자, 검수일, 상태, 웹 검색 샘플 확인). 작성 후 R-7 Grep 자체 점검. 끝나면 PM이 사용자에게 샘플을 보고하고 정지 | FE-2b | `FF/constants/pools/personal.constant.ts`, `pools/common.constant.ts`, `pools/tti/rat.constant.ts`, `pools/star-sign/aries.constant.ts`(문구 필드만), `docs/fortune/copy-log.md`(신규) | 입력: plan "콘텐츠 제작 원칙", "결과 항목과 점수", "금지 표현 목록", "문구 안전 원칙". design.md 5장. UI 명세 없음 | 162문장이 모두 채워짐. 합니다체(AC-38). 금지 표현 0건, 방식 A 풀에 "사주" 0건(AC-37, AC-10). 건강 문구에 병명·증상·약 없음, 재물 문구에 투자 권유 없음, 낮은 구간 문구가 행동 조언으로 끝남(AC-39). 문장 끝 변주. copy-log에 4개 묶음 행(작성자 AI, 작성일, 상태 "초안")(AC-40 가·나). **정지: U-2 사용자 검수와 톤 확정 전에는 C-2a, C-2b, C-4로 넘어가지 않는다** | 대기(FE-2b 후) · 병렬: FE-3a, FE-4, FE-5a, FE-6a, FE-6b |
| C-3a | frontend-dev | 허브 문구 옮기기와 방식 A 화이트리스트. `fortune-guide.constant.ts`의 `FORTUNE_HUB_GUIDE`(설명 단락 4개)와 `fortune-faq.constant.ts`의 `FORTUNE_HUB_FAQ`(6쌍)를 `ui-ux-design.md` 문장 그대로 상수에 넣는다(U-1 확정 결과 반영). `fortune-copy-rule.constant.ts`의 `FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A`에 방식 A 안내 3문장과 허브 방식 구분 설명 문장(단락 2)을 그대로 등록 | FE-2b, U-1 | `FF/constants/fortune-guide.constant.ts`, `FF/constants/fortune-faq.constant.ts`, `FF/constants/fortune-copy-rule.constant.ts` | 입력: ui-ux-design.md "문구"(승인 대기 표, 허브), design.md 8.3. plan "용어 사용 규칙: 사주" | 상수 문장이 ui-ux 문장과 같음. 허브 설명 합 약 600자 이상. 허브 문구에서 "사주"는 화이트리스트 문장에만, 첫 "사주"는 괄호 설명으로 시작, "사주 네 기둥" 없음(AC-10, AC-37, AC-58 허브 해당분). 금지 표현 0건. 화이트리스트에 임의 문장 추가 없음 | 대기(FE-2b, U-1 후) · 병렬: C-1, FE-3a, FE-4, FE-5a, FE-6a (C-1과 파일 다름) |
| C-3b | frontend-dev | 기능 페이지 FAQ·가이드 본문. 오늘의 운세·띠별·별자리 각각 FAQ(plan "페이지가 답할 질문"에서 선택. 질문은 합니다체 서술과 "~입니까?" 형태, 답은 합니다체와 "~일 수 있습니다") 3개 이상과 가이드 본문. 페이지당 설명 콘텐츠(가이드 + FAQ + 계산 기준) 한국어 약 600자 이상. 띠: 12띠 출생 연도 대응(입춘 기준 병기)과 내 띠 찾는 법, 설날 기준과 다를 수 있다는 설명. 별자리: 일반 날짜 기간("해마다 하루 정도 달라질 수 있다"), 경계일 시각 설명. **지원 출생 연도 FAQ를 포함한다(허브·세 페이지 중 적절한 곳). 연도는 손으로 쓰지 않고 `FORTUNE_MIN_BIRTH`·`FORTUNE_MAX_BIRTH`에서 만든다.** 방식 구분 설명에 "사주"를 쓸 때는 첫 언급에 괄호 설명을 붙이고 사용자 승인 뒤에 화이트리스트에 등록. 초안 → U-2 검수 → 반영 | C-3a (초안), U-2 (최종·화이트리스트 등록) | `FF/constants/fortune-guide.constant.ts`, `FF/constants/fortune-faq.constant.ts`, `FF/constants/fortune-copy-rule.constant.ts`(화이트리스트만) | 입력: plan "검색 노출"(페이지가 답할 질문, 키워드), "금지 표현 목록". design.md 8.3, 13.1, 4.10. ui-ux-design.md "가이드·계산 기준·FAQ·이용 안내" | 페이지별 FAQ 3개 이상, 설명 약 600자 이상(AC-62). FAQ와 FAQPage JSON-LD가 같은 상수(AC-64). 금지 표현 0건, 합니다체, 단정 없음(AC-37, AC-38). "사주"는 허용 위치에만, 괄호 설명 포함(AC-10). 토정비결·신년운세·타 서비스명 없음. 지원 출생 연도 FAQ가 실제 범위(1920-01-01 ~ 2028-12-31)와 일치 | 대기(C-3a 후) · 병렬: 없음(C-3a와 같은 파일) |
| C-3d | frontend-dev | 입력 오류·지원 범위·윤달 안내 문구 확정. `fortune-notice.constant.ts`의 `FORTUNE_BIRTH_ERROR_MESSAGES`(5종: `before-min`, `after-max`, `future`, `lunar-no-leap`, `out-of-table`), `FORTUNE_SUPPORTED_RANGE_NOTICE`, `FORTUNE_LEAP_MONTH_HINT_TEMPLATE`를 design.md 4.3 초안에서 다듬는다. 합니다체, 오류 문구에 입력값을 넣지 않음, 범위는 한 문장으로 안내, 금지 표현 없음. 이 세 상수는 FE-2b 이후 이 티켓만 고칠 수 있다(고지 문구 나머지는 계속 고정). 초안 → U-2 검수 → 반영 | FE-2b | `FF/constants/fortune-notice.constant.ts`(위 세 상수만) | 입력: design.md 4.3, 4.10, 8.1. ui-ux-design.md UI-2가 추가한 연도 범위·윤달 안내 | 5종 오류 문구가 `Record<FortuneBirthErrorType, string>` 전부를 채움. 범위 문장의 연도가 상수에서 만들어짐. 금지 표현 0건(AC-37, AC-38). 사용자 승인(U-2 묶음). `FORTUNE_CONSENT_VERSION`(동의 문구 버전)에는 영향 없음을 확인 | 대기(FE-2b 후) · 병렬: C-1, C-3a 외 코드 티켓(같은 파일은 FE-2b뿐) |
| C-2a | frontend-dev | 나머지 띠 11개(소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지) 각 45문장 = 495. U-2에서 확정한 톤으로 쓴다. 한 호출에 몇 개씩 나눠 맡겨도 된다(파일이 다르면 병렬 가능). copy-log는 건드리지 않는다(C-3c가 기록) | C-1, U-2 | `FF/constants/pools/tti/ox.constant.ts`, `tiger`, `rabbit`, `dragon`, `snake`, `horse`, `goat`, `monkey`, `rooster`, `dog`, `pig` | 입력: C-1과 같음 + copy-log 상단의 확정 톤 | 495문장 모두 채워짐, 빈 문자열 0건. R-7 Grep 점검 통과. 11개 띠 사이에 같은 문장·같은 문장 끝 반복 없음 | 대기(U-2 후) · 병렬: C-2b, FE 코드 티켓 |
| C-2b | frontend-dev | 나머지 별자리 11개(염소, 물병, 물고기, 황소, 쌍둥이, 게, 사자, 처녀, 천칭, 전갈, 사수) 각 45문장 = 495. 규칙은 C-2a와 같다 | C-1, U-2 | `FF/constants/pools/star-sign/capricorn.constant.ts`, `aquarius`, `pisces`, `taurus`, `gemini`, `cancer`, `leo`, `virgo`, `libra`, `scorpio`, `sagittarius` | C-2a와 같음 | 495문장 모두 채워짐. R-7 점검 통과. 별자리 사이 반복 없음 | 대기(U-2 후) · 병렬: C-2a, FE 코드 티켓 |
| C-3c | frontend-dev | 기록 완성과 내부 점검. C-1, C-2a, C-2b, C-3a, C-3b, C-3d 작성분을 `docs/fortune/copy-log.md`에 일괄 기록(묶음별 작성자·작성일·검수자·검수일·상태). 한 풀 안에서 거의 같은 문장 또는 같은 문장 끝이 반복되는지 Grep으로 훑고 고친다(plan 유사 문장 점검 4번). 문구 전체 금지 표현 Grep 전수 점검 | C-2a, C-2b, C-3b, C-3d | `docs/fortune/copy-log.md`(그리고 점검에서 발견된 문장의 풀 파일) | 입력: plan "콘텐츠 제작 원칙"(유사 문장 점검 절차) | 모든 묶음 행이 채워짐. 금지 표현 0건. 내부 반복 점검 결과가 기록됨 | 대기(선행 후) · 병렬: 없음(copy-log 단일 작성자) |
| C-4 | researcher | 유사 문장 웹 검색 샘플 확인. 대표 문장을 따옴표 검색으로 확인한다. 규모(제안): 개인·띠·별자리 묶음별 20문장 이상, 공통 풀 행운·조언·주의 10문장 이상, 고지·FAQ·가이드 10문장 이상. 일치가 나오면 copy-log에 "일치 있음, 출처 URL"로만 기록하고 외부 문장을 옮겨 적지 않는다. 전수 검사가 아니라는 한계를 기록 | C-3c, U-2, U-4 | `docs/fortune/copy-log.md`(웹 검색 샘플 확인 기록과 묶음 행의 확인 칸만) | 입력: plan "유사 문장 점검 절차", AC-41. 디자인 명세 없음 | 검색 문장, 점검일, 결과가 copy-log에 남음. 각 샘플이 "일치 없음 / 일치 없음(일반 어구) / 일치 있음" 중 하나. 한계 설명 있음(AC-41) | 대기(선행 후) · 병렬: 코드 티켓(`src/`와 겹침 없음) |
| C-5 | frontend-dev | C-4에서 "일치 있음"이 나온 문장만 새로 쓴다. 외부 문장을 보지 않고 처음부터 다시 쓰고, 고친 문장은 C-4(researcher)가 다시 확인해 "수정함 + 재확인 결과"로 닫는다. 일치가 없으면 이 티켓은 건너뛴다 | C-4 | 해당 풀 파일, `docs/fortune/copy-log.md`(수정함 표시) | 입력: AC-41 | 모든 "일치 있음"이 "수정함"으로 닫히고 재확인 결과가 있음 | 대기(조건부) · 병렬: 없음 |

### F. QA (qa, 앱 코드 수정 금지, `e2e/`와 `docs/fortune/`에만 씀)

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| QA-T2 | qa | FE-1b 뒤 타로 회귀 재실행과 spec 보정(U-6 방안 A, design.md 19장의 T-QA). (1) 첫 실행에서 design.md 8.4 "확인 필요(QA 첫 실행)" 항목을 수행해 Playwright `Desktop Chrome`과 `Pixel 7`에서 환경 구분이 8.4 확정안대로 나오는지 qa-report에 기록(다르면 테스트에서 에뮬레이션으로 맞추지 말고 설계로 되돌림). (2) `e2e/tarot.spec.ts`를 4장 "타로 e2e" 행과 8.4 "타로 테스트 영향" 표대로 프로젝트별(desktop/mobile)로 고친다. 서버 HTML(JS 끔) 검사는 8.4 표대로 유지. 상수 사본은 상수 파일 import로 바꾼다. (3) `e2e/tarot-copy.spec.ts`가 공용 상담전화 상수를 검사 대상(`OTHER_TEXTS`)에 추가하고 상담전화 약속 표현 필터(`where.includes('TAROT_CRISIS')`)가 공용 이름도 잡도록 최소 수정. (4) 같은 명령 `pnpm exec playwright test e2e/tarot`를 개발 서버로 다시 실행해 `docs/fortune/qa-baseline-tarot.md`와 비교하고 `docs/fortune/qa-report.md`의 "타로 회귀" 절에 기록 | FE-1b, QA-T1(완료), U-6(완료) | `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`, `docs/fortune/qa-report.md`(신규 또는 이어쓰기) | 입력: 4장 타로 e2e 행, design.md 8.4 "타로 테스트 영향" 표, `docs/fortune/qa-baseline-tarot.md`. 디자인 명세 없음 | 기준선(252개, 248 통과, 4 실패)과 같은 4건(AC-33 JS 끈 표시, `/tarot/daily`·`/tarot/three-card` × desktop·mobile) 외에 새 실패가 없음. 4건은 이 기능의 회귀로 세지 않고 별도 이슈로 보고(원인 확인용으로 운영 빌드 실행은 선택). 테스트 수가 바뀌면 이유를 기록. AC-28 상담전화 5개 구절·번호 5개 검사가 공용 상수를 대상으로 유지됨. 앱 코드 수정 없음. 새 실패가 상담전화 이전 때문이면 FE-1b 담당에 되돌림 | 대기(FE-1b 후) · 병렬: C 티켓 등(타로 파일 외) |
| QA-1a | qa | (선택, FE-12·FE-6a 직후 권장) 중간 점검. `e2e/fortune.spec.ts`에 허브 부분(AC-79, 허브의 AC-33·34·37·61~64·86, AC-83 허브 방문 전후 sessionStorage 불변, 서버 HTML의 "사주"가 화이트리스트 문장에만 있음, 사주 링크 없음, 상담전화 5곳의 표시를 AC-86·8.4 확정안 기준으로 프로젝트별 검사), `e2e/fortune-calc.spec.ts`에 달력과 무관한 함수(날짜, 만 나이, 시드, 점수, 결과 생성: 사례는 design.md 17.1 표, 공용 `CRISIS_PHONES` 검사 포함). 실행 후 `qa-report.md`에 기록 | FE-12, FE-10b(완료), FE-6a, FE-3a, C-3a, QA-T2 | `e2e/fortune.spec.ts`, `e2e/fortune-calc.spec.ts`, `docs/fortune/qa-report.md` | 입력: plan AC, design.md 17.1, 17.2, ui-ux-design.md 화면 상태 | 해당 AC 통과/실패 표. 실패 항목은 담당(frontend-dev)에 되돌림. 이후 QA-1/QA-3가 같은 파일을 이어서 확장 | 대기(선택) · 병렬: 화면·페이지 개발 티켓(`e2e/`와 `src/` 겹침 없음) |
| QA-1 | qa | 브라우저 AC 전체. `e2e/fortune.spec.ts`: AC-1~AC-48, AC-61~AC-86(1단계분). 동의 상태 헬퍼는 sessionStorage에 design.md 6.3 형식 값을 넣는다. AC-29, 74, 75, 78은 design.md 18.1 기준. 시계·시간대는 `page.clock`·`timezoneId`. **AC-84: `page.clock.setFixedTime('2029-01-02T09:00:00+09:00')`로 세 기능 페이지를 열어 동의 후 결과가 정상이고 연도 입력 상한이 2028임을 확인. AC-85: 음력 2023년 2월 평달·윤달 변환과 "(윤달)" 표시, 윤달 체크 활성/비활성. AC-86: 네 페이지의 상담전화를 design.md 17.2 "상담전화" 항목과 18.5의 확정안 기준으로 프로젝트별(desktop/mobile) 검사.** 네트워크 가로채기로 AC-27, AC-47. JS 비활성 컨텍스트로 AC-62, AC-72. 쿠키 동의 거절로 AC-32. 쿠키 배너와 동의 화면 중첩 AC-78. 데스크톱·모바일 둘 다 실행. 2단계 AC-49~AC-60은 제외 | 6.2 QA 진입 조건 전부 | `e2e/fortune.spec.ts`, `docs/fortune/qa-report.md` | 입력: plan AC, ui-ux-design.md "컴포넌트 상태", "접근성", "문구", design.md 17.2, 18.1, 18.2, 18.4, 18.5, dev-tasks | AC별 통과/실패 표. 실패 원인·재현 방법·담당(frontend-dev 또는 문구는 frontend-dev, 문서는 해당 담당) 기록. 공통 검사(응답 400 미만, `pageerror` 없음, h1 하나, title·description) | 대기(진입 조건 후) · 병렬: QA-2, QA-3 작성만(실행은 순차) |
| QA-2 | qa | `e2e/fortune-copy.spec.ts`: design.md 8.2, 8.3 검사. 대상은 문구 풀 전부, 고지·FAQ·가이드·SEO 상수(허브 포함), `MENU_LIST` 운세 그룹, 서버 HTML(메타데이터·JSON-LD 포함), 동의·이용 불가 화면 DOM, 지원 범위·윤달 안내 문구. 금지 구, 건강 풀 병명 목록, "사주" 위치(화이트리스트), `FORTUNE_SAJU_REDUNDANT_TERMS`, "4기둥"·"3기둥", 폐기 문장, 합니다체 후보 목록(해요체 의심 문장), 풀 안 중복·문장 끝 반복 후보, 문구 개수(개인 45, 공통 27, 띠 12×45, 별자리 12×45) 확인, 외부 이미지 파일 0건 | FE-10c, C-4(와 C-5), DOC-2 | `e2e/fortune-copy.spec.ts`, `docs/fortune/qa-report.md` | 입력: design.md 8.2, 8.3, 17.1(문구 검사), plan "금지 표현 목록". ui-ux-design.md "문구" | AC-10, AC-37~AC-41, AC-58(방식 A 화면 해당분), AC-73 문구 검사 통과. 실패 문구는 frontend-dev(C 티켓)에 되돌림. 정규식 결과는 자동 실패로 삼지 않고 후보 목록으로 보고. 타로 기존 "보장·예측"(5.1 R-E)은 검사 대상이 아니다 | 대기(진입 조건 후) · 병렬: QA-1, QA-3 작성만(실행은 순차) |
| QA-3 | qa | `e2e/fortune-calc.spec.ts`: design.md 17.1 전체(브라우저 없이 import, 데스크톱만). 달력 표 자체 검사(음력 1919~2049 연속, 절기 1920~2028 연도별 24개, 달 길이 29/30, 한 해 일수 353~355 또는 383~385, 설날 1/21~2/20, 절기 시각 오름차순과 간격 14~16일, 입춘 2/3~2/5, 춘분 3/19~3/22), 알려진 값 대조(BE-1c의 9건), 판정 함수 사례(AC-14~16, AC-22~25), 음력 사례(AC-7, AC-8, 음력 2023년 윤2월), `FORTUNE_ROUTES`와 `MENU_LIST` 일치(D8), 공용 상담전화 상수(17.1 표). **지원 범위 일치 테스트(`FORTUNE_SUPPORTED_MAX_YEAR` = 절기 표 마지막 연도, 첫 연도 1920, 음력 표가 1919 ~ 상수+1을 덮음), 2029년 이후 동작(오늘 = 2029-01-01, 2030-06-15 모의에서 개인 일운·12띠·12별자리 정상 생성, 출생 2028-12-31 통과·2029-01-01 `after-max`), 만료 감시 테스트(실제 KST 오늘 ≥ 2028-12-01이고 `FORTUNE_SUPPORTED_MAX_YEAR` < 오늘 연도 + 1이면 "절기 표 보완(F-1) 기한이 지났습니다"로 실패)** | FE-3b, BE-1b, FE-10c | `e2e/fortune-calc.spec.ts`, `docs/fortune/qa-report.md` | 입력: design.md 4.1~4.7, 4.10, 17.1 | 표 검사와 사례가 모두 통과. 만료 감시 테스트는 2028-12-01 이전에는 통과. 값이 KASI 표와 다르면 KASI 값을 따르고 PM에 알려 plan AC 수정 | 대기(진입 조건 후) · 병렬: QA-1, QA-2 작성만 |

## 실행 순서

W0 = 즉시(문서·메인 세션), W1 = 기반 + 달력 표(코드 시작, U-9 정지 지점 포함), W2 = 판정·화면·페이지·문구, W3 = QA, W4 = 검증·보고. 보류가 없으므로 W1에서 모든 코드 계열이 처음부터 시작한다. 이미 끝난 것: UI-1, M-1, M-2, QA-T1, BE-1a, FE-1a, FE-2a, FE-10b, FE-10d, FE-11.

### W0. 즉시 시작 (메인 세션, 문서)
1. 동시 시작: UI-2(ui-ux-designer), DOC-2(planner), M-3(F-1 등록과 위험 수용 결정 기록).
2. 사용자에게 묻기: U-1(승인 범위 확인, UI-2 입력), U-14(Q7 음력 표 범위 안 C 알림, BE-1b 실행 전).
3. UI-2가 끝나면 U-12(Q9 포함 승인)를 받는다. 그 뒤 DOC-3(타로 문서)를 시작한다.
4. design.md D15·8.4 확정안이 나오면(architect 작업 중) 완료된 FE-1a와 대기 중인 FE-1b, FE-6a, QA-T2, DOC-2의 D15 관련 칸을 PM이 확정안과 대조한다. 어긋나면 FE-1a 수정 티켓을 만든다.

### W1. 기반 + 달력 표
묶음 목표: 달력 표 두 개가 만들어져 검증까지 끝나고, 동의 게이트와 공용 컴포넌트와 상담전화 공용 기반이 완성된 상태. 메뉴는 "준비 중"을 유지한다.
1. **W1-1 완료**: BE-1a, FE-1a, FE-2a, FE-10b, FE-10d, FE-11.
2. **W1-2 (지금)**: **U-9 정지**: 사용자가 `DATA_GO_KR_API_KEY`로 `generate.mjs`(BE-1b), 이어서 `verify.mjs`(BE-1c)를 실행. backend-dev가 결과를 `calendar-verification.md`에 기록. 이 정지 동안 다음은 계속 진행한다: FE-2b, FE-3a(둘 다 FE-2a가 끝나 지금 시작 가능) → FE-2b 뒤에 동시 시작 FE-4, FE-5a(UI-2 뒤), FE-6b, C-1, C-3a(U-1 뒤), C-3d.
3. **W1-3**: U-12 승인 뒤 FE-1b → QA-T2(타로 회귀). FE-2b, UI-2(U-12) 뒤에 FE-6a. FE-6a, C-3a 뒤에 FE-12(허브). FE-2b, FE-4, FE-1b 뒤에 DOC-1a. C-1이 끝나면 PM이 사용자에게 샘플을 보고하고 **정지(U-2)**. 같은 시점에 C-3b 초안과 C-3d 초안을 검수에 올린다. 선택으로 QA-1a를 FE-12 직후 실행.

### W2. 판정·화면·페이지·문구 (BE-1b가 끝나면 W1의 나머지와 겹쳐서 시작)
1. FE-3a와 BE-1b가 끝나면 FE-3b → (FE-5a도 끝났다면) FE-5b.
2. FE-5b 뒤에 FE-7, FE-8, FE-9를 동시에 시작한다(폴더가 다름. C-1 샘플 문구가 이미 있으면 화면 확인이 쉽다).
3. U-2 승인 뒤 C-2a와 C-2b를 동시에, C-3b·C-3d 최종 반영. 이어서 C-3c → (U-4 확인) C-4 → (일치 시) C-5.
4. 세 화면과 C-3b가 끝나면 FE-10a(페이지 3개).
5. DOC-1b(BE-1c, C-3c, DOC-1a 뒤).
6. 6.1 게이트가 모두 충족되면 FE-10c(출시 스위치).

### W3. QA
- 진입 조건은 6.2. 순서: QA-1, QA-2, QA-3 작성은 병렬이나 실행은 순차(같은 개발 서버 포트). 실패 항목은 해당 담당(frontend-dev, 문구는 frontend-dev)에 되돌리고 고친 뒤 qa를 다시 호출한다.

### W4. 검증과 보고 (PM)
- QA 결과와 각 티켓 완료 조건, `ui-ux-design.md` 일치, 보안(시크릿 노출, 입력 검증, 저장소 덤프), 라이선스(새 의존성·폰트·이미지 없음), 법적 고지 문구가 plan·design 대로 반영됐는지(법률 검증은 하지 않음, 5.1), 새 페이지 메타데이터·JSON-LD·sitemap, 4장 공용 코드 변경 회귀를 확인한다. 이어서 사용자에게 보고하고 U-7(출시 전 확인, 법률 확인 제외), U-13(스크린리더 수동 확인), U-10(배포 승인)을 받는다.

### 후속 F-1 (이 기능 출시 이후, 기한 2028-12-01)
- 메인 세션이 `status.md`에서 추적한다(M-3). 2027년 하반기부터 KASI 2029년 이후 절기 제공 여부를 확인하고, 2028-09-01까지 제공되지 않으면 설계로 되돌려 천문 계산 보완을 사용자가 고른다. 표를 늘릴 때 `FORTUNE_SUPPORTED_MAX_YEAR`와 `FORTUNE_SOLAR_TERM_RENEW_BY`를 같은 작업에서 올린다.

## 다음 착수 가능 티켓 (2026-11-05 기준)

- 지금 시작 가능(파일 겹침 없음, 동시 가능): FE-2b, FE-3a, UI-2(U-1 확인과 함께), DOC-2, M-3. BE-1b는 사용자 실행(U-9, 실행 전에 U-14 알림).
- FE-2b가 끝나면: FE-4, FE-6b, C-1, C-3d, FE-5a(UI-2도 끝난 뒤), C-3a(U-1 뒤).
- 아직 시작 못 함: FE-1b·FE-6a(U-12 승인), FE-3b·FE-5b·FE-7~9·FE-10a(BE-1b 이후), FE-12(FE-6a, C-3a 이후), FE-10c(6장 게이트).

## 동시 실행 가능

파일이 겹치지 않는 조합만 적었다.

- W0: UI-2(`docs/fortune/ui-ux-design.md`) ∥ DOC-2(`docs/fortune/plan.md`) ∥ M-3(`docs/fortune/status.md`).
- 지금: FE-2b(`FF/constants` 문구·뼈대) ∥ FE-3a(`FF/utils`) ∥ UI-2 ∥ DOC-2 ∥ M-3. FE-2b와 FE-3a는 폴더가 다르다.
- W1-2: U-9 정지 동안 FE-2b 뒤에 FE-4(`src/app/fortune/layout.tsx`, 동의 컴포넌트·훅·서비스) ∥ FE-5a(입력·결과 컴포넌트) ∥ FE-6b(화면별 가이드) ∥ C-1(풀 4개 파일과 copy-log) ∥ C-3a(허브 문구) ∥ C-3d(`fortune-notice.constant.ts`의 세 상수). C-1, C-3a, C-3d는 서로 다른 파일이다. C-3a·C-3b는 같은 파일이라 순차.
- W1-3: FE-1b(타로 파일 3개) ∥ FE-6a ∥ 위의 코드 티켓. FE-1b는 타로 작업과 동시에 하지 않는다. QA-T2는 FE-1b 뒤에 `e2e/tarot*.spec.ts`만 건드리므로 C 티켓·화면 티켓과 병렬이다.
- C-2a ∥ C-2b: 띠 풀 파일과 별자리 풀 파일이 달라 병렬이다. 둘 다 copy-log를 건드리지 않는다(C-3c가 기록).
- C 티켓 ∥ 코드 티켓: 문구 티켓은 `pools/**`, `fortune-guide`, `fortune-faq`, `fortune-copy-rule`, `fortune-notice`(C-3d의 세 상수), copy-log만 고치므로 화면·유틸 코드 티켓과 병렬이다(FE-2b 이후).
- W2: FE-7 ∥ FE-8 ∥ FE-9(각 `today/`, `tti/`, `star-sign/` 폴더). DOC-1b ∥ 화면 티켓(루트 문서). DOC-3 ∥ 코드 티켓(`docs/tarot/`).
- C-4(researcher) ∥ W2 코드 티켓: `docs/fortune/copy-log.md`와 `src/`가 겹치지 않는다.
- QA-1a ∥ W2 개발 티켓: `e2e/`와 `src/`가 겹치지 않는다.
- 순서가 필요한 것: (UI-2·U-12) → FE-1b → QA-T2 / FE-2b → (FE-4, FE-5a, FE-6a, FE-6b, C-1, C-3a, C-3d) / C-3a → C-3b / C-1 → U-2 → C-2a, C-2b / C-3c → C-4 → C-5 / U-9(BE-1b → BE-1c) → FE-3b → FE-5b → FE-7~9 → FE-10a → FE-10c → QA.

## 충돌 위험

- `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts`: 모든 기능이 같이 쓰는 공용 파일. 운세에서는 FE-10b(정의, 완료), FE-10c(출시 스위치)만 순서대로 수정하고, 점심·어디 가 등 다른 기능의 메뉴 작업과 동시에 하지 않는다. 그룹 `href` 변경으로 헤더·모바일 메뉴·홈의 운세 링크 목적지가 바뀐다(해당 파일은 고치지 않고 FE-10c 뒤 동작만 확인: `src/components/layout/pc-menu.component.tsx`, `mobile-menu.component.tsx`, `src/app/page.tsx`).
- `src/constants/theme.constant.ts`: FE-10d(완료)만 수정. `fortune` 키만 바꾸고 다른 키(`lunch`, `where`)와 `ComingSoonComponent`는 건드리지 않는다.
- `src/types/crisis-phone.type.ts`, `src/constants/crisis-phone.constant.ts`, 8.4 영향 범위 표의 공용 훅·컴포넌트 신규 파일: FE-1a(완료)가 만들었다. 이후 타로·운세 작업은 사용만 하고 고치지 않는다(D15 확정안과 어긋나거나 U-13에서 대안이 나오면 PM이 수정 티켓 한 개로 묶는다).
- `src/features/tarot/constants/tarot-notice.constant.ts`, `crisis-notice.component.tsx`, `result-notice.component.tsx`: FE-1b만 수정. 타로 작업과 동시에 하지 않는다. `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`: QA-T2만 수정(FE-1b → QA-T2 순서). FE-1b 직후 QA-T2 전까지 PC 프로젝트의 타로 e2e가 일시적으로 깨지는 것이 정상이다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`: FE-11(완료)이 수정했다. 5.1의 충돌 5건을 고치려면 별도 티켓과 사용자 결정이 필요하다(지금은 위험 수용).
- `FF/constants/fortune-notice.constant.ts`, `fortune-seo.constant.ts`, `fortune-faq.constant.ts`, `fortune-guide.constant.ts`, `fortune-copy-rule.constant.ts`, `pools/**`: FE-2b(뼈대) 먼저, 그 뒤 문구 티켓만 문구 필드를 고친다. `fortune-guide`, `fortune-faq`, `fortune-copy-rule`은 C-3a → C-3b 순서로만 고친다(동시 금지). `fortune-notice.constant.ts`는 고지 문구가 사용자 승인 사항이므로 FE-2b 이후 고치는 곳은 C-3d의 세 상수(`FORTUNE_BIRTH_ERROR_MESSAGES`, `FORTUNE_SUPPORTED_RANGE_NOTICE`, `FORTUNE_LEAP_MONTH_HINT_TEMPLATE`)뿐이다(그 밖은 사용자 승인과 `FORTUNE_CONSENT_VERSION` 갱신 검토 없이 바꾸지 않는다).
- `docs/fortune/copy-log.md`: C-1이 만들고 C-3c가 일괄 기록하고 C-4/C-5가 점검 칸만 수정한다. 동시에 두 티켓이 쓰지 않는다. `docs/fortune/qa-report.md`: QA-T2 → QA-1a → QA-1 → QA-2 → QA-3 순서로 이어 쓴다(기준선은 `docs/fortune/qa-baseline-tarot.md`에 따로 있음).
- `FF/constants/calendar/*.constant.ts`: BE-1b 스크립트 출력만 쓴다. 누구도 직접 만들거나 고치지 않는다(R-6). `FF/types/fortune-calendar.type.ts`는 FE-2a(완료)가 3장 타입으로 만들었고 BE-1a는 그 타입에 맞춰 출력한다. 형식이 바뀌면 architect 확정 후 FE-2a와 BE-1a를 함께 고친다.
- `FF/constants/fortune-input.constant.ts`의 `FORTUNE_SUPPORTED_MAX_YEAR`: FE-2a(완료)가 만들었다. 절기 표 마지막 연도와 같아야 하고(QA-3 일치 테스트), 표를 늘리는 F-1에서만 함께 올린다.
- `FF/shared/components/reading.component.tsx`, `lucky.component.tsx`, `birth-form.component.tsx`, `result-notice.component.tsx`, `today-link.component.tsx`, `FF/hooks/use-birth-flow.hook.ts`: 여러 화면(FE-7~9, FE-12)이 같이 쓴다. FE-5a, FE-5b, FE-6a에서 props를 확정하고 이후 티켓은 수정하지 않는다. 꼭 필요하면 한 티켓에서만 고치고 다른 쪽을 그 뒤로 미룬다.
- `src/app/fortune/layout.tsx`: FE-4만. `src/app/fortune/page.tsx`: FE-12만. `today/page.tsx`, `tti/page.tsx`, `star-sign/page.tsx`: FE-10a만. 이 구성은 design.md 20장(허브 page를 FE-10이 맡음)에서 FE-12로 옮긴 것이다.
- `.claude/hooks/guard-files.js`: 추가 수정 없음(M-1 완료). `docs/fortune/ui-ux-design.md`: UI-2만. `docs/fortune/plan.md`: DOC-2만. `docs/tarot/*`: DOC-3만. `docs/fortune/status.md`: PM만(M-3 포함). `docs/fortune/dev-tasks.md` 상태 칸: PM만.
- `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `.env.example`: DOC-1a, DOC-1b만(둘이 같은 `README.md`를 다루므로 DOC-1a 뒤에 DOC-1b).
- 수정하지 않는 파일: `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/*`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `src/components/common/menu-list.component.tsx`(재사용만). 새 의존성이 필요해 보이면 R-4대로 PM에 보고한다.
- 달력 의존 분리: FE-6b의 띠 연도 표는 `fortune-tti.util`에 의존하지 않고, FE-5a의 `birth-form`은 달력 함수를 props로 주입받으며, FE-5a는 `use-birth-flow`에 의존하지 않는다. 이 분리가 깨지면 W1의 티켓이 U-9 실행에 걸린다.

## 6. 배포 전 게이트와 QA 진입 조건

### 6.1 배포 전 게이트 (운영 배포는 사용자 확인 뒤에만, U-10)
- W1·W2 중간 결과물만으로는 배포하지 않는다. 메뉴가 "준비 중"이어도 `/fortune`은 직접 URL로 열리고, 링크 대상인 `/fortune/tti`, `/fortune/star-sign`은 아직 없기 때문이다.
- FE-10c(출시 스위치)는 다음이 모두 충족되기 전에 실행하지 않는다: 문구 풀 1,200문장에 빈 문자열 0건, U-2 승인(C-3d 포함), C-4 종료, BE-1c 불일치 처리, DOC-1a·DOC-1b·FE-11 반영, 화면 3개와 페이지 3개 완료, QA-T2 통과.
- 출시 직전 U-7(상담전화 재확인과 날짜 기록, AdFit 정책·복권법 개정안 진행 확인, 고지 문구 최종 확인, 방침·약관 최종 확인)과 U-13(스크린리더 수동 확인)을 마친다.
- 법률 확인은 출시 조건이 아니다. "법률 검증 없음, 운영자 위험 수용(2026-11-05)"이며 5.1 목록이 기록이다. 이용 동의 게이트가 정상 동작하는지(AC-67~AC-72)는 QA-1이 확인한다.

### 6.2 QA 단계로 가는 조건 (QA-1, QA-2, QA-3)
1. 1단계 개발 티켓 전부 완료: FE-1a/1b, FE-2a/2b, FE-3a/3b, FE-4, FE-5a/5b, FE-6a/6b, FE-7~FE-9, FE-10a~FE-10d, FE-11, FE-12. 각 티켓이 `pnpm typecheck`, Biome, `pnpm build`를 통과.
2. FE-10c 실행 완료(메뉴·sitemap 노출 상태에서 AC-61, 65, 80을 검사하기 위해). 이 때문에 6.1의 게이트가 QA 시작 전에 충족되어야 한다. 단 FE-10c는 코드 변경이고 운영 배포가 아니다.
3. 문구: C-2a, C-2b, C-3a, C-3b, C-3d 완료와 U-2 승인, C-3c 기록 완료, C-4(및 필요 시 C-5) 종료.
4. 달력: BE-1c의 `calendar-verification.md`가 있고 불일치가 0이거나 처리 완료. U-9 해소.
5. 문서: DOC-2(plan AC-1~AC-86 확정), UI-2(U-12 승인), DOC-1a·DOC-1b 완료. DOC-3은 검증(W4) 전까지.
6. 타로 회귀: QA-T2 통과(기준선 `docs/fortune/qa-baseline-tarot.md`와 같은 4건 외 새 실패 없음).
7. 사용자 확인 U-2~U-4, U-12 완료. U-7·U-13은 출시 직전.

### 6.3 e2e 파일 범위
- QA가 만드는 파일은 `e2e/fortune*.spec.ts`: `e2e/fortune.spec.ts`(브라우저 AC), `e2e/fortune-copy.spec.ts`(문구 검사), `e2e/fortune-calc.spec.ts`(순수 함수, 데스크톱만). 보고서는 `docs/fortune/qa-report.md`. 실행 명령은 `pnpm exec playwright test e2e/fortune`(데스크톱·모바일 둘 다).
- 예외 한 가지: QA-T2가 `e2e/tarot.spec.ts`와 `e2e/tarot-copy.spec.ts`를 최소 수정한다(U-6 방안 A, D15). 그 밖의 기존 spec(`lotto.*`)은 수정하지 않는다. 2단계 spec은 2단계 QA 티켓이 같은 이름 규칙으로 확장한다.

## 7. AC 대응표 (1단계)

| AC | 구현 티켓 | 검증 |
|---|---|---|
| AC-1, 2, 3, 4, 5, 6 | FE-3a, FE-5a, FE-7 | QA-1a(함수), QA-1 |
| AC-7, 8, 9, 14, 15, 16, 22, 23, 24, 25, 44 (AC-8·9는 D14로 수정) | FE-3b, FE-5a, FE-5b, FE-7~9 | QA-3, QA-1 |
| AC-10, 37, 38, 39, 73 | FE-2b, C-1~C-3d, FE-6a, FE-12 | QA-2 |
| AC-11, 12, 13, 17, 18, 19, 20, 21, 26 | FE-7, FE-8, FE-9, FE-6b, C-3b | QA-1 |
| AC-27, 28, 29, 30, 31, 32 | FE-4, FE-5a, FE-6a, FE-7~9, R-2 | QA-1 |
| AC-33, 34(D15로 수정), 35, 36 | FE-1a, FE-1b, FE-6a, FE-5a, FE-12 | QA-T2(타로 쪽), QA-1a(허브분), QA-1 |
| AC-40, 41, 60(2단계) | C-1~C-5, DOC-1b | QA-2, 사용자 확인 |
| AC-42, 43, 45, 46, 47, 48, 76 | FE-3a, FE-5a, FE-5b, FE-6a, FE-7~9 | QA-1a(함수), QA-1 |
| AC-61, 62, 63, 64, 65, 66 | FE-6a, FE-10a, FE-10c, FE-12 | QA-1a(허브분), QA-1 |
| AC-67, 68, 69, 70, 71, 72, 74, 75, 77, 78 | FE-4, FE-7~9 | QA-1 |
| AC-79, 83 | FE-12, FE-4 | QA-1a |
| AC-80 | FE-10b(정의), FE-10c(스위치) | QA-1 |
| AC-81, 82 | FE-6a, FE-10a | QA-1 |
| AC-84 (지원 연도, 2029 시계) | FE-2a, FE-3a, FE-3b, FE-5a, FE-7~9 | QA-1, QA-3 |
| AC-85 (윤달 구분 변환) | FE-3b, FE-5a, FE-7 | QA-3, QA-1 |
| AC-86 (상담전화 기기별 표시) | FE-1a, FE-1b, FE-6a, FE-10a, FE-12 | QA-T2(타로), QA-1a, QA-1 |
| AC-49~AC-60 | 2단계 | 2단계 QA |

## 2단계 (사주, 1단계 완료·승인 후 착수)

착수 조건: (1) 1단계 출시와 사용자 승인, (2) plan 2단계 항목 재승인(planner), (3) design.md 13.1·12.2의 사주 SEO 값에 남은 "사주 네 기둥" 표현을 architect가 plan "용어 사용 규칙: 사주"대로 수정(`ui-ux-design.md` 남은 질문), (4) 달력 표 완료(1단계 BE-1c 이후. 사주도 D14 지원 범위 1920-01-01 ~ 2028-12-31, 2029년 이후 출생은 `unsupported`이고 `lunIljin` 표본을 검증에 쓴다), (5) R-1 결과와 사용자의 23시대 시주 기준 결정. 법률 확인은 착수 조건이 아니다(5.1, 위험 수용). 이 문서는 개략만 두고, 1단계 승인 뒤 dev-lead를 다시 호출해 티켓을 확정한다.

**노출 금지 규칙**: R-1 조사 결과를 사용자가 승인해 `FORTUNE_SAJU_LATE_ZI_STEM_BASIS`를 확정하기 전에는 `/fortune/saju` 페이지 파일(`src/app/fortune/saju/page.tsx`)을 만들어 병합하지 않고, 허브·메뉴(`MENU_LIST`)·sitemap·`FORTUNE_ROUTES` 사용처에 사주를 노출하지 않는다. 계산 유틸·상수·문구·내부 화면 컴포넌트는 임시값 `'same-day'`로 개발할 수 있으나 그 임시값은 결정이 아니다. 이 금지는 법률 확인과 무관한 계산 기준 결정 문제이므로 위험 수용과 별개로 유지한다.

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| S2-1 | researcher | R-1: 23시대 출생 시주 천간 기준 출처 조사 | 1단계 승인 | `docs/research/fortune-late-zi.md` | design.md 4.9 | 국내 교재·만세력의 기본 설정과 불일치가 정리됨. 타 서비스명은 조사 문서 안에서만 | 대기(1단계 후) |
| S2-2 | 사용자 | 기준(`same-day` / `next-day`)과 계산 기준 안내 문장 승인(U-11) | S2-1 | - | design.md 4.9 | 값이 확정되어 status.md에 기록 | 대기 |
| S2-3 | frontend-dev | 사주 타입·상수·계산: `fortune-saju.type.ts`, `fortune-saju.constant.ts`, `pools/saju/*`·`saju-pools` 뼈대, `fortune-saju.util.ts`(2029년 이후 출생 `unsupported`) | 1단계 승인, BE-1c | `FF/types/fortune-saju.type.ts`, `FF/constants/fortune-saju.constant.ts`, `FF/utils/fortune-saju.util.ts` 등 | design.md 3장, 4.8, 4.9, D14 | AC-50, 51, 53, 54, 55, 57 계산 사례 | 대기(2단계) |
| S2-4 | frontend-dev | 사주 화면 컴포넌트(`pillars`, `elements`, `ten-god`, `root`, `panel`, `guide`)와 `use-saju-flow.hook.ts` | S2-3 | `FF/saju/**` | ui-ux-design.md "사주" | AC-49, 52, 56, 58, 59. 페이지·메뉴는 만들지 않음 | 대기(2단계) |
| S2-5 | frontend-dev + researcher | 십신 문구 450 + 기본 점수표: 샘플 2~3개 → 사용자 검수 → 나머지 → C-4 방식 점검 → copy-log 갱신 | S2-3 | `FF/constants/pools/saju/*`, `docs/fortune/copy-log.md` | plan 콘텐츠 제작 원칙 | AC-60 | 대기(2단계) |
| S2-6 | frontend-dev | 사주 SEO·FAQ·가이드 상수와 `src/app/fortune/saju/page.tsx` | S2-2, S2-4, S2-5 | `FF/constants/fortune-seo.constant.ts` 등, `src/app/fortune/saju/page.tsx` | design.md 13.1 | AC-58 해당분, AC-61~64. **S2-2 이후에만 생성** | 대기(2단계) |
| S2-7 | frontend-dev + 메인 세션 | `MENU_LIST` 사주 항목 추가(노출 스위치: 허브·메뉴·sitemap에 한꺼번에 나타남), privacy/terms·README·COMPLIANCE·THIRD_PARTY 소폭 갱신 | S2-6 | `src/constants/menu.constant.ts`, 루트 문서 | design.md 13.1 | AC-65, AC-80의 반대 상태(사주 노출) 확인 | 대기(2단계) |
| S2-8 | qa | 2단계 AC-49~AC-60과 1단계 회귀 | S2-7 | `e2e/fortune*.spec.ts` 확장 | plan 2단계 AC | 통과/실패 표 | 대기(2단계) |
