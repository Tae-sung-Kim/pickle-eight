# 궁합 공유 QA 보고서 (share-compatibility)

작성일: 2026-11-26

## 실행

- `./node_modules/.bin/playwright test e2e/share.spec.ts --project=desktop -g "궁합 공유"`: 2 passed (`pnpm exec playwright`는 이 환경에서 경로 오류로 실행되지 않아 로컬 바이너리를 직접 썼다)
- `pnpm exec vitest run unit/share`: 10 파일, 115 passed
- `biome check e2e/share.spec.ts unit/share`: 오류 없음
- 전체 회귀, 모바일, meal 관련 spec은 돌리지 않았다.

## 결과

- 실패 없음. 앱 코드 수정 없음.
- AC-1, AC-2 [E2E]: `e2e/share.spec.ts`의 "궁합 공유 PC 흐름" 2개. 띠 궁합은 결과 전 공유 패널 없음, 결과 뒤 PNG 저장, 카드에 생년월일 없음을 확인한다. 별자리 궁합은 PNG 저장과 "다른 후보로 보기" 뒤 카드가 현재 후보로 바뀌는지(예외 절)를 한 흐름에서 확인한다.
- AC-3 [단위]: 기존 `unit/share/share-card-content.test.ts` 궁합 케이스가 그대로 통과(중복 추가 없음).
- AC-4 [정적]: `unit/share/share-scope.test.ts`에 공유 블록 사용처가 두 궁합 panel뿐임을 확인하는 검사를 추가했다. 새 카드 컴포넌트·상수·라우트·sitemap·메타 변경 여부는 코드 확인 대상이며 이번에 변경 파일에서 발견하지 못했다(git status 기준).
- AC-5 [단위]: `unit/share/share-compatibility.test.ts` 신규. 카드 고지가 상수이고 합니다체이며 "보장"과 운세·궁합 금지 표현이 없음을 확인한다.
- 요약 길이 [단위]: 같은 파일에서 4개 copy 상수의 `summary[0]`가 카드 글자 축소 기준(90자, `SUMMARY_LONG_LENGTH`는 비공개 상수라 값을 테스트에 복제) 이하임을 확인한다. 최대 44자라 축소 구간에도 들어가지 않는다.

## 테스트를 바꾼 사유

- 기존 테스트는 바꾸지 않았다. 새 테스트만 추가했다.

## 남은 확인

- 320px 가로 스크롤은 궁합 공유 블록으로는 검사하지 않았다(공통 컴포넌트라 기존 뭐 먹지 흐름 검사가 맡는다).
- `SUMMARY_LONG_LENGTH`가 바뀌면 단위 테스트의 복제값도 고쳐야 한다.
