# fortune-v2 QA 보고서

작성일: 2026-11-09
입력: `docs/fortune-v2/plan.md`(AC-1~AC-11), `docs/fortune-v2/dev-tasks.md`(T-8, T-9, 문구 (가)안)
테스트: `e2e/fortune-v2.spec.ts` (33개 x 데스크톱·모바일 = 66건)

## 실행 명령과 결과 요약

| 명령 | 결과 |
|---|---|
| `pnpm exec playwright test e2e/fortune --reporter=line` (fortune-v2 신규 + 기존 fortune, fortune-calc, fortune-copy, 데스크톱·모바일) | 566 통과, 2 실패, 140 건너뜀 |
| `pnpm build` (T-9) | 최초 실패(아래 "빌드 메모"), 우회 후 성공 |
| `grep -rl DATA_GO_KR .next/static` | 0건 |

- 2 실패는 모두 신규 AC-11 테스트 1개(데스크톱, 모바일 각 1건)다. 앱 코드 실패는 없다.
- 140 건너뜀은 기존 `fortune.spec.ts`의 "JS 끔 + 화면 표시" 알려진 한계(사용자 결정 A안, `QA_RUN_KNOWN_LIMITATIONS`)이며 이번 변경과 무관하다.
- 기존 fortune 회귀 3개 파일은 신규 안내 문장 추가 후에도 실패 0건이다.

## AC별 결과 (데스크톱·모바일 동일)

| AC | 테스트 | 결과 |
|---|---|---|
| AC-1 | 1990-05-10으로 찾은 말띠 카드(요약·점수·전체 펼친 항목 글자)가 칩으로 펼친 말띠 카드와 같다 | 통과 |
| AC-2 | 1990-05-10과 1978-08-01(말띠) 카드 문구가 같다 | 통과 |
| AC-3 | 결과 전 안내 없음, 결과 뒤 (가)안 문장 1개 노출, 결과 줄과 같은 묶음 | 통과 |
| AC-4 | 2025-02-01(용띠, 설날 기준 뱀띠) 안내 노출 | 통과 |
| AC-4 | 2026-02-10(말띠, 설날 기준 뱀띠) 안내 노출 | 통과 |
| AC-4 | 1990-05-10, 2026-03-01 설날 안내 없음 | 통과 |
| AC-5 | 1990-05-15 황소자리 결과 아래 안내 노출, 카드 문구가 칩과 같다 | 통과 |
| AC-5 | 1990-05-15와 1985-05-01(황소자리) 카드 문구가 같다 | 통과 |
| AC-6 | 띠 2025-02-03: 시각 질문, 23:30 뱀띠, 시각 모름 후보 선택 뒤에만 안내 노출, 카드는 칩과 같다 | 통과 |
| AC-6 | 별자리 2026-03-20: 시각 질문, 23:00 물고기자리, 23:59 양자리, 후보 선택 뒤 안내 노출 | 통과 |
| AC-7 | `/fortune/tti`, `/fortune/star-sign` 동의 전, 목록 로드, 찾기(시각 질문 단계까지) 중 `apis.data.go.kr`, `astro.kasi.re.kr` 요청 0건 | 통과 |
| AC-8 | `.next/static`에 `DATA_GO_KR`, `DATA_GO_KR_API_KEY` 0건 (아래 T-9) | 통과 |
| AC-9 | today, tti, star-sign의 title, description, canonical, FAQPage·BreadcrumbList JSON-LD가 상수와 같고 새 문장 미포함 | 통과 |
| AC-9 | sitemap.xml에 hub, today, tti, star-sign 있음 | 통과 |
| AC-9 | `fortune-seo.constant.ts`, `fortune-faq.constant.ts`, `sitemap.ts`, `json-ld.component.tsx`가 HEAD와 diff 없음 | 통과 |
| AC-10 | 상수 두 개가 (가)안과 글자 단위로 같고 `FORTUNE_FORBIDDEN_TERMS`, 금지 패턴, "보장·정확·맞춤" 없음 | 통과 |
| AC-10 | 화면에 나온 안내 문장에 금지 표현 없음 (띠, 별자리) | 통과 |
| AC-11 | `docs/fortune/status.md`(1단계 기준 문서)에 사용자 할 일 항목이 있다 | 통과 |
| AC-11 | `docs/fortune-v2/status.md`에 사용자 할 일 항목이 있다 | 실패 |

공통 검사(세 페이지 x 2 프로젝트): 응답 400 미만, `pageerror` 없음, `h1` 하나, title·description 존재 모두 통과.
빈 상태·에러 상태(tti, star-sign): 입력 전, 빈 제출, 1919년·2999년 입력, 만 14세 미만 연령 안내에서 안내 문장이 보이지 않음 통과.

## 실패 항목

### AC-11: `docs/fortune-v2/status.md`에 출시 전 확인 항목이 없다

- 원인: 앱 문제가 아니라 문서 미완료다. T-6(status.md 작성)이 아직 반영되지 않았다. 현재 파일은 단계표가 "개발 준비 대기" 상태이고, "남은 일"에 "기존 `docs/fortune/status.md`를 참조한다(체크리스트로 옮기지 않는다)"고만 적혀 있다. 상담전화, AdFit, 방침, 약관, 스크린리더, 운영 배포 항목과 "사용자 할 일" 표기가 없고 F-6 감시 항목도 없다. `docs/fortune/status.md`에는 항목이 모두 있다.
- 재현: `docs/fortune-v2/status.md`에서 "상담전화", "AdFit", "운영 배포"를 검색한다. 또는 `pnpm exec playwright test e2e/fortune-v2 -g "AC-11: docs/fortune-v2"`.
- 담당: PM(T-6, T-7 문서). frontend-dev, backend-dev, db-dev 해당 없음.
- 참고: plan.md의 AC-11은 "`status.md`"라고만 적혀 있다. 기준 문서를 `docs/fortune/status.md`로 읽는다면 통과다. PM이 판단한다.

## T-9: 빌드 후 검사

- `grep -rl "DATA_GO_KR" .next/static` 0건, `DATA_GO_KR_API_KEY` 0건. `apis.data.go.kr`, `astro.kasi` 문자열도 `.next/static` 0건. 통과.
- 청크 분리(기록만): 음력·절기 표 데이터(`monthBits`)는 `.next/static/chunks/41_u2fw3lreoy.js` 한 청크(31,929바이트)에만 있다. 표가 공통 번들이 아닌 별도 청크로 분리되어 있다.

### 빌드 메모 (QA가 앱 코드를 고치지 않고 우회함)

- `pnpm build`가 처음에는 타입 검사에서 실패했다. 원인은 이번 변경이 아니라 진행 중인 타로 작업이다: `e2e/tarot-copy.spec.ts(457,38)`가 `tarot-question.constant`에 없는 `TAROT_QUESTION_TOPICS`를 참조한다(TS2339, TS7006 총 2건). fortune 관련 오류는 0건이다.
- 이 파일을 잠시 `.qa-hold` 확장자로 옮겨 빌드한 뒤 곧바로 원래 이름으로 되돌렸다(현재 `e2e/tarot-copy.spec.ts` 존재, 내용 변경 없음). 빌드는 성공했다.
- 후속: 타로 담당이 `tarot-copy.spec.ts` 타입 오류를 고치지 않으면 운영 `pnpm build`가 실패한다(Next가 `e2e/`도 타입 검사한다). 담당: 타로 작업 담당(frontend-dev). PM이 `pnpm typecheck`를 돌릴 때도 같은 2건이 나온다.

## 날짜 근거

`docs/fortune/calendar-verification.md`와 표(`lunar-table.constant.ts`, `solar-term-table.constant.ts`)로 확정했다. 날짜는 테스트 파일 상단 주석에도 있다.

| 날짜 | 근거 | 기대 |
|---|---|---|
| 1990-05-10, 1978-08-01 | 입춘 이후, 1990 경오, 1978 무오 | 말띠 |
| 2025-02-01 | 2025 설날 1월 29일(음력 표 `newYear` 129), 입춘 2월 3일 23:10(절기 값 2032310, 검증 문서 3번) | 입춘 기준 용띠, 설날 기준 뱀띠 |
| 2026-02-10 | 2026 입춘 2월 4일 05:02(2040502, 검증 문서 9번), 설날 2월 17일(`newYear` 217) | 입춘 기준 말띠, 설날 기준 뱀띠 |
| 2026-03-01 | 입춘·설날 모두 지남 | 말띠, 설날 안내 없음 |
| 2025-02-03 | 입춘 23:10 | 시각 질문, 23:30은 뱀띠 |
| 2026-03-20 | 춘분 23:46(3202346, 검증 문서 6번) | 시각 질문, 23:00 물고기자리, 23:59 양자리 |

plan.md AC-4, AC-6의 "2월 초", "3월 20일 또는 21일 근처"는 위 날짜로 구체화했다. 표와 AC 사이의 불일치는 없었다.

## 테스트 설계 메모

- 문구는 앱 상수를 가져오지 않고 (가)안 문자열을 테스트에 그대로 적었고, 앱 상수와 같은지도 AC-10에서 따로 확인한다.
- "생년월일 없이 펼친 카드"는 같은 페이지에서 칩으로 펼친 항목을 기준으로 삼았다. 점수 눈금 애니메이션이 끝나 글자가 연속 두 번 같을 때까지 기다린 뒤 비교한다. 기기 시계는 고정한다.
- AC-7은 요청 호스트 기준이며 JS 끔 환경은 대상이 아니다(plan.md).
