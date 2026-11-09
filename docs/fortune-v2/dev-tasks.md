# fortune-v2 개발 티켓

입력: `docs/fortune-v2/plan.md` (승인, Q1~Q6 추천안 확정)
design.md, ui-ux-design.md 단계는 사용자 승인으로 생략했다. 대신 아래 "디자인 명세 참조"에 기존 컴포넌트의 스타일 기준과 문구 위치를 직접 적었다.
규칙 문서: `docs/conventions/code-style.md`, `docs/conventions/design-system.md`, `docs/conventions/seo.md`, `docs/conventions/tech-stack.md`

## 범위 요약

- 코드 변경은 띠·별자리 찾기 결과 아래 안내 문장 추가(프론트 3파일 + 상수 1파일)가 전부다.
- DB 변경 없음. 백엔드(API, repository) 변경 없음. 런타임 KASI 호출 없음(확인만).
- 표(음력·절기)는 코드 상수 유지(Q2). 저장 방식 변경 없음.
- 사주(Q1), 2029년 이후 절기(Q5), 개인화 운세(Q3 B·C)는 제외.
- 메타 설명(`fortune-seo.constant.ts`), sitemap, JSON-LD, `next.config.ts`는 건드리지 않는다.
- README, THIRD_PARTY_NOTICES, DEPENDENCY_LICENSES는 변경 없음(새 환경변수·라이브러리·API 없음. KASI 출처 표기는 `THIRD_PARTY_NOTICES.md` 48행에 이미 있음).

## 확정 문구 (승인 대기 초안)

plan.md Q3 A안, AC-3·AC-5 취지에 맞춘 문장이다. plan.md는 "문구는 사용자 승인 후 확정"이라고 적었으므로, 사용자가 승인하기 전까지 이 문구는 초안이다. 금지 표현(`docs/fortune/plan.md` 금지 목록, `fortune-copy-rule.constant.ts`의 '정확히 맞', '보장', '정확한 맞춤', '맞춤 풀이')은 포함하지 않는다.

- 띠 찾기 (`FORTUNE_FINDER_BASIS_NOTICE`): "생년월일은 내 띠를 찾는 데 쓰이며, 띠별 운세 문구는 누구에게나 같습니다."
- 별자리 찾기 (`FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE`): "생년월일은 내 별자리를 찾는 데 쓰이며, 별자리별 운세 문구는 누구에게나 같습니다."

사용자 확인 필요 사항: 설날 기준 안내와 경계일 시각 질문도 생년월일을 쓴다. "찾는 데만"은 찾기 과정 전체를 뜻하는 것으로 읽히는지 사용자가 확인해야 한다. 다른 문구가 나오면 이 티켓의 상수 값만 바꾸면 된다(위치와 클래스는 그대로).

## 스타일 기준 (두 면 공통)

- 안내 문장 클래스: 기존 안내 문구 클래스를 그대로 재사용한다. `finder.component.tsx`의 설날 안내(tti 273행)와 범위 안내(tti 226행)가 쓰는 `text-sm leading-6 break-keep text-muted-foreground`. 별자리 면에도 같은 클래스를 쓴다.
- 새 색, 새 토큰, 새 폰트, 모션, `dark:` 없음. 색은 토큰만 쓴다(`design-system.md` 금지 항목).
- 반경, 간격: 찾기 면 `section`의 `space-y-4`가 이미 있으므로 추가 간격을 주지 않는다. 결과 묶음 안의 줄 간격은 `space-y-1`을 쓴다.
- 결과 묶음의 왼쪽 막대(`border-l-2 border-menu-fortune/40 pl-3`)는 결과 줄과 안내 줄을 한 묶음으로 보이게 하는 기존 패턴이다(tti 268행). 별자리 면도 같은 패턴으로 맞춘다.
- 안내 문장은 결과가 있을 때만 그린다(`foundKey` 조건 안). 입력 전, 오류 상태, 연령 안내에서는 보이지 않는다.
- 접근성: 새 live region을 만들지 않는다. 결과 뒤 DOM 순서로 읽히게 둔다.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| T-1 | db-dev | 없음. 테이블·RLS·마이그레이션 변경 없음(plan Q2: 표는 코드 상수 유지). | - | 없음 | - | 해당 없음(확인만: `supabase/` 변경 0건) | 없음 |
| T-2 | backend-dev | 없음. route.ts, repository, 외부 API 호출 추가·변경 없음. KASI 런타임 호출 금지 유지. | - | 없음 | - | 해당 없음(확인만: `src/app/api/fortune*` 변경 0건) | 없음 |
| T-3 | frontend-dev | 안내 문구 상수 2개 추가. `FORTUNE_FINDER_BASIS_NOTICE`(띠), `FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE`(별자리)를 `fortune-notice.constant.ts`에 넣는다. 기존 상수의 값·순서는 바꾸지 않는다. 같은 파일을 다른 티켓이 건드리지 않도록 이 파일 수정은 T-3에서만 한다. | - | `src/features/fortune/constants/fortune-notice.constant.ts` | 디자인 명세 없음(문구 상수). 문구는 위 "확정 문구" 그대로 | 두 상수가 export되고 값이 위 문구와 글자 단위로 같다. 기존 상수 diff가 없다. `pnpm typecheck` 통과. 신규 문구에 금지 표현 없음 | 대기 |
| T-4 | frontend-dev | 띠 찾기 면에 안내 문장 추가. 위치: `finder.component.tsx`의 결과 묶음(`{foundKey ? ...}` 블록, 267~281행) 안, 설날 안내 `<p>`(272~279행) 다음 줄. 문장은 `FORTUNE_FINDER_BASIS_NOTICE`를 import해서 `<p className="text-sm leading-6 break-keep text-muted-foreground">`로 그린다. 결과가 없으면 그리지 않는다. 다른 로직(입춘 질문, 후보 선택, onFound, 포커스)은 바꾸지 않는다. | T-3 | `src/features/fortune/tti/components/finder.component.tsx` | 찾기 면 기존 패턴(설날 안내 줄 클래스 재사용). 위 "스타일 기준" | 생년월일 입력 후 결과 줄 아래에 문장이 보인다. 결과 전·오류·연령 안내에서는 안 보인다. 후보 선택 뒤에도 보인다(결과 줄과 같은 조건). `FortuneTtiFinderComponentPropsType`, `TTI_FINDER_TEXTS`의 기존 값 변경 없음. 파일이 `'use client'` 아님(기존 유지). `pnpm typecheck` 통과 | 대기 |
| T-5 | frontend-dev | 별자리 찾기 면에 안내 문장 추가. 현재 결과는 `<p>` 한 줄(266~270행)이다. 결과 묶음을 `<div className="space-y-1 border-l-2 border-menu-fortune/40 pl-3">`로 감싸고, 막대 클래스는 div로 옮긴다. 결과 `<p>`는 `text-base leading-7 font-medium break-keep text-foreground`만 남긴다. 그 아래에 `FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE`를 `<p className="text-sm leading-6 break-keep text-muted-foreground">`로 그린다. 결과가 없으면 그리지 않는다. 경계 시각 질문, 후보 선택, onFound, 포커스는 바꾸지 않는다. | T-3 (T-4와 파일 다름, 병렬 가능) | `src/features/fortune/star-sign/components/finder.component.tsx` | 찾기 면 기존 패턴. 위 "스타일 기준". 결과 줄 크기(text-base)는 그대로 둔다 | 결과 아래에 문장이 보인다. 결과 텍스트 글자 크기·굵기가 변경 전과 같다(시각 확인). 결과 전에는 안 보인다. `FINDER_TEXTS` 기존 값 변경 없음. `pnpm typecheck` 통과 | 대기 |
| T-6 | PM(문서, 메인 세션) | `docs/fortune-v2/status.md` 작성. 단계표, 남은 일 체크리스트(F-1, AC-11 기준: 상담전화 재확인, AdFit, 방침·약관, 스크린리더, API 키 재발급·`.env` 교체, commit·push·운영 배포 확인), 감시 항목 F-6(2027년 하반기 KASI 갱신 확인, 2028-09-01까지 미제공이면 설계로 되돌림, 기한 2028-12-01). Q4 추천안대로 status 한 곳에 둔다. `docs/fortune/status.md`의 같은 항목과 내용이 어긋나지 않게 맞춘다. | 없음(병렬 가능) | `docs/fortune-v2/status.md`, `docs/fortune/status.md`(읽기) | 없음(문서) | status.md에 AC-11 항목 전부가 "사용자 할 일"로 남아 있다. F-6이 감시 항목으로 적혀 있다. 기존 `docs/fortune/status.md`는 수정하지 않는다(필요 시 PM이 사용자에게 확인) | 대기 |
| T-7 | PM(문서, 메인 세션) | F-2 확인: KASI 표 저장 방식 근거 기록(코드 상수 유지). `docs/fortune-v2/status.md` 또는 `plan.md` 변경 이력에 근거(Q2 비교 표 요약)를 한 줄로 남긴다. `THIRD_PARTY_NOTICES.md` 48행 출처 표기 존재를 확인하고 결과만 기록한다(파일은 수정하지 않는다). | T-6 | `THIRD_PARTY_NOTICES.md`(읽기), `docs/fortune-v2/status.md` | 없음(문서) | 근거 한 줄이 status에 있다. THIRD_PARTY_NOTICES 변경 0건 | 대기 |
| T-8 | qa | 신규 e2e 작성·실행: `e2e/fortune-v2.spec.ts`(신규). 데스크톱·모바일 두 프로젝트에서 실행(`pnpm e2e`, `pnpm e2e:mobile`). AC-1~AC-7, AC-9, AC-10을 Playwright로 검증한다. AC-1: 1990-05-10 입력 후 강조 카드 문구 = 생년월일 없이 펼친 같은 카드 문구(글자 단위). AC-2: 1990-05-10과 1978-08-01(말띠) 문구 같음. AC-3, AC-5: 문장 노출, 결과 전 미노출. AC-4: 2월 초 출생 설날 안내 노출, 같은 띠이면 미노출. AC-5: 별자리 문구 일치. AC-6: 경계일 시각 질문·후보 선택 노출, 시각 입력 뒤 결과 불변. AC-7: `/fortune/tti`, `/fortune/star-sign` 목록 로드 중 `apis.data.go.kr`, `astro.kasi.re.kr` 요청 0건(request 기록). AC-9: 세 페이지(tti, star-sign, today)의 title, meta description, canonical, JSON-LD, sitemap 항목 확인(변경 전 값과 비교). AC-10: 새 문장이 `FORTUNE_FORBIDDEN_TERMS`에 걸리지 않음. 기존 `e2e/fortune.spec.ts`, `e2e/fortune-calc.spec.ts`, `e2e/fortune-copy.spec.ts`를 회귀로 함께 실행한다. | T-4, T-5 | `e2e/fortune-v2.spec.ts`(신규), `e2e/fortune.spec.ts`, `e2e/fortune-calc.spec.ts`, `e2e/fortune-copy.spec.ts`(회귀), `docs/fortune-v2/qa-report.md`(신규) | 위 "스타일 기준"(시각 확인 대상) | 모든 AC 결과가 `docs/fortune-v2/qa-report.md`에 적혀 있다. 데스크톱·모바일 모두 통과. 실패 시 해당 dev에게 되돌리고 재실행 | 대기 |
| T-9 | qa | 빌드 후 검사(AC-8): `pnpm build` 후 `.next/static`에서 `DATA_GO_KR`, `DATA_GO_KR_API_KEY` 문자열이 없어야 한다. 검사는 rg 명령으로 한다(예: `rg -l "DATA_GO_KR" .next/static`, 결과 0건). 선택 확인: 절기·음력 표가 panel 쪽 청크로 분리됐는지 청크 크기를 기록한다(Q2 추가 확인, 분리 여부만 기록, 변경 없음). `pnpm typecheck`를 PM 검증 단계에서 한 번 더 돌린다. | T-3, T-4, T-5 | `.next/static`(검사 대상), `docs/fortune-v2/qa-report.md` | 없음 | 검사 결과 0건이 qa-report에 기록된다. 청크 분리 결과는 기록만 한다 | 대기 |
| T-10 | PM(검증, 메인 세션) | 검증 단계: `pnpm typecheck`, `pnpm lint` 실행. 새 안내 문구가 `design-guard`(토큰 외 색, `dark:`, CSS 애니메이션) 기준을 지키는지 diff로 확인. 메타 설명, sitemap, JSON-LD 변경 0건 확인(`git diff`로 `fortune-seo.constant.ts`, `sitemap.ts`, `json-ld` 관련 파일 변경 없음). 사용자 결정 목록(확정 문구 승인, Q1~Q6 확정 기록) 정리 후 보고. | T-8, T-9 | `git diff`, `docs/fortune-v2/status.md` | 없음 | typecheck 통과. 금지 파일 변경 0건. 사용자 승인 대기 항목(문구) 표기 | 대기 |

## 실행 순서

1. T-3 (frontend-dev): 안내 문구 상수 추가. 이 파일은 다른 티켓이 쓰지 않는다.
   - 같은 단계에서 T-6(PM 문서 작성, status.md)을 함께 진행해도 된다(코드와 파일이 다르다).
2. T-4와 T-5 (frontend-dev, 병렬 가능): 띠 면과 별자리 면. 각 면은 서로 다른 파일이다. 한 명의 frontend-dev가 맡을 때는 T-4 다음 T-5로 순서대로 해도 된다.
3. T-7 (PM 문서): F-2 근거 기록. T-6 뒤에 한다(같은 status.md를 씀).
4. T-8 (qa): 신규 e2e 작성·실행, 회귀 실행. T-4, T-5가 끝난 뒤.
5. T-9 (qa): 빌드 후 검사. `pnpm build`는 T-8과 같은 빌드 산출물을 쓸 수 있으니 한 번만 빌드하고 두 검사를 함께 한다.
6. T-10 (PM): typecheck, lint, diff 검사, 사용자 보고.

사용자 승인 지점: 확정 문구(T-3 전에 승인), 최종 결과 확인(T-10 뒤). 승인 없이 T-3을 시작하지 않는다.

## 동시 실행 가능

- T-1, T-2: 없음(해당 없음). 할 일 없음.
- T-3과 T-6: 서로 다른 파일. 동시 가능.
- T-4와 T-5: 서로 다른 파일. 동시 가능(T-3이 끝난 뒤).
- T-7과 T-8 작성: T-7은 문서, T-8은 e2e 작성. 실행은 T-4, T-5 뒤.
- T-8 실행과 T-9 빌드 검사는 같은 빌드를 공유하면 순서 없이 가능하다. 단 빌드는 한 번만 한다.

## 충돌 위험

- `src/features/fortune/constants/fortune-notice.constant.ts`: 고정 문구 모음이다. T-3만 수정한다. 다른 상수를 바꾸면 `fortune-copy.spec.ts`와 고지 문구 승인이 어긋난다. 파일 헤더 주석("고지 문구를 바꿀 때는 사용자 승인을 받는다")을 지킨다.
- `src/features/fortune/tti/components/finder.component.tsx`: T-4만 수정한다. 입춘 시각 질문, 후보 선택, 포커스 로직을 건드리면 AC-6, AC-4 회귀가 생긴다.
- `src/features/fortune/star-sign/components/finder.component.tsx`: T-5만 수정한다. 결과 줄의 막대 클래스를 옮기므로 시각 회귀(텍스트 크기·굵기) 확인이 필요하다.
- `src/features/fortune/constants/fortune-seo.constant.ts`(메타 설명), `src/app/sitemap.ts`, JSON-LD 관련 파일: 이번 범위에서 수정하지 않는다. 메타 설명이 바뀌면 AC-9 실패. 파일 수정 금지.
- `src/features/fortune/tti/components/list.component.tsx`, `star-sign/components/list.component.tsx`: 목록 펼침 동작과 `FORTUNE_DIFFERENT_BASIS_NOTICE`를 쓴다. 수정하지 않는다.
- `src/features/fortune/tti/components/guide.component.tsx`: 찾는 법 설명(서버 HTML). Q3 A안이라 수정하지 않는다. 찾기 기능을 없애는 옵션 B로 바뀌면 여기를 고쳐야 한다.
- `docs/fortune/status.md`: 1단계 승인 기록. T-6은 새 `docs/fortune-v2/status.md`를 쓴다. 기존 파일은 PM 확인 없이 고치지 않는다.
- `e2e/fortune*.spec.ts` (기존 3개): 회귀 실행용. 수정하지 않는다. 새 AC 테스트는 `e2e/fortune-v2.spec.ts`에만 쓴다.
- `.next/` 빌드 산출물: T-8, T-9가 같은 빌드를 공유한다. 빌드를 두 번 돌리면 결과가 섞일 수 있다.
- 작업 트리의 기존 변경(`docs/TODO.md`, `docs/tarot-v2/`, `docs/fortune-v2/` 미추적 파일): 이번 티켓과 무관. 커밋 범위에 섞지 않는다(커밋·push는 사용자 직접).
