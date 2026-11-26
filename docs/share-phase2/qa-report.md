# share-phase2 QA 보고서

작성일: 2026-11-26

## 실행

- `pnpm exec vitest run unit/share unit/fortune/fortune-copy.test.ts`: 10 파일, 163개 통과.
- `pnpm exec playwright test e2e/share-phase2.spec.ts e2e/share.spec.ts --project=desktop`: 12개 통과(신규 5, 기존 7). 전체 회귀는 하지 않았다(PM이 마지막에 한 번).

## 결과

- 실패 중 앱 결함: 없음. 앱 코드는 수정하지 않았다.
- AC-1~4 [E2E]: `e2e/share-phase2.spec.ts`(운세 PC, 띠·별자리 모바일 공유창, 이미지 실패, 로또 PC·모바일·더블클릭).
- AC-5, 6 [단위]: `unit/share/share-phase2.test.ts`, `unit/fortune/fortune-copy.test.ts`(운세 공유 문구 상수가 금지어 검사 대상). 운세 고지가 승인 문구와 같은지 단언 추가.
- AC-7, 9 [정적]: `unit/share/share-scope.test.ts`가 범위와 캡처 제외 표시를 소스 스캔으로 확인.
- AC-8, 10 [정적]: 코드·문서 확인은 PM 검증 단계에서 진행(이번 QA에서 `buildMetadata`, sitemap, 라이선스 문서 변경 여부는 다시 열어보지 않았다).

## 테스트를 바꾼 사유

- `unit/share/share-scope.test.ts`: 로또 생성기와 `lotto-share.util.ts`·`lotto-share.constant.ts`가 공유를 쓰게 되어 허용 목록에 추가. 다른 규칙(타로, 사주, 꿈, 다른 로또 화면 금지)은 그대로. 지시한 `lotto/generator`만으로는 `src/features/lotto/utils/lotto-share.util.ts`가 걸려 이 두 파일도 허용했다.
- `e2e/share.spec.ts` 로또 AC-5: 공유 패널이 생겼으므로 `[data-share-panel]` 0개 단언을 1개로 바꾸고, canShare 제거 후 다운로드 확인 구간은 삭제(PC 저장은 `share-phase2.spec.ts` AC-4가 확인).
- 신규 AC-2 테스트는 첫 공유가 끝난 뒤(`__shareSettled`) 두 번째 클릭을 하도록 작성(처리 중 클릭은 무시되는 앱 동작).

## 수동(자동 spec 아님)

- AC-11: iPhone Safari, Android Chrome, 인앱 브라우저에서 운세 카드와 로또 카드 첫 시도 공유, 빈 이미지 여부. 미실시.
- 운세 카드의 위기 안내·죽음 관련 풀이 시 공유 버튼 숨김(plan 예외): 자동 spec 없음, 수동 확인 필요.
