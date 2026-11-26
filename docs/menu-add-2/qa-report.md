# menu-add-2 QA 보고서

## 실행

- `pnpm exec vitest run unit/meal`: 6개 파일, 100개 통과.
- `pnpm exec playwright test e2e/meal.spec.ts --project=desktop`: 10개 통과, 1개 실패 후 테스트 수정, AC-16 재실행 통과. (첫 실행은 `@smoke` 제외)

## AC 확인

- AC-1: 기존 테스트(`MEAL_MENU_COUNTS` 참조, 배열 길이)로 덮임.
- AC-2: `unit/meal/meal-menu.test.ts`에 카테고리별 고정값 검사 추가(점심 120, 저녁 180, 아침 80). 통과.
- AC-3, AC-4, AC-5 야식 목록: 기존 테스트로 덮임. 저녁 기본 후보 123개 검사만 추가.
- AC-6, 7, 8: [정적] 확인 대상(PM 검증 단계). 이번 QA에서 코드 diff는 보지 않음.

## 실패와 테스트 수정

- `e2e/meal.spec.ts` AC-16: 점심에서 양식만 남기고 "국물 있음"을 누르면 후보 0개가 되는 것을 전제로 했다. 이번에 양식에 비프스튜(soup)가 추가되어 후보가 1개가 되었다. 앱 결함이 아니라 데이터 변경에 따른 테스트 전제 오류다.
- 점심·저녁은 모든 카테고리에 국물 메뉴가 생겨 0개 상태를 만들 수 없다. 국물 없는 카테고리가 있는 아침(빵·토스트만 선택)으로 테스트를 바꿨다.

## 점심 120칸 가독성 (관찰, 판정은 사용자)

스크린샷: `docs/menu-add-2/screenshots/lunch-desktop.png`, `lunch-mobile.png`(375px, 전체 페이지).

- 돌림판에 칸 라벨 글자가 보이지 않는다. 120개 칸이 가는 방사선 선으로만 보인다. 겹침·잘림 이전에 라벨이 읽히지 않는다.
- 데스크톱과 모바일 모두 같다.
- 이 코드가 90칸일 때 라벨을 그렸는지는 확인하지 않았다(이전 스크린샷 없음). 라벨 표시 여부는 `roulette.component.tsx` 설계일 수 있다.
- 결과 메뉴 이름은 돌린 뒤 오른쪽 결과 영역에 표시된다.

## 변경 파일

- `unit/meal/meal-menu.test.ts`
- `e2e/meal.spec.ts`
- `docs/menu-add-2/qa-report.md`, `docs/menu-add-2/screenshots/*.png`

## meal-location 간헐 실패 수정

- 원인: reload 직후 스트리밍 중 입력이 2개로 잡힘(테스트 타이밍). `meal-location.spec.ts` reload 뒤에 `waitForHydration` 추가.
- `--repeat-each=10 --workers=1` desktop 30개 전부 통과. 앱 코드 변경 없음.
