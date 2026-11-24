# 홈 재구성 QA 보고서

범위: QA-1, QA-2, QA-3. 회귀(QA-4, AC-8)는 실행하지 않았다.

## 실행

| 명령 | 결과 |
|---|---|
| `pnpm exec vitest run unit/home` | 20개 통과 |
| `pnpm exec playwright test e2e/home.spec.ts --project=desktop` | 1개 통과 |
| `pnpm exec playwright test e2e/home.spec.ts --project=mobile` | 1개 통과 (`@smoke`) |

## 정적 확인 (AC-6, AC-7)

- AC-6: `src/app/layout.tsx` 83행 `category: '엔터테인먼트, 도구'`. "로또" 없음.
- AC-7: `git diff origin/main --stat -- src/app/lotto src/features/lotto src/lib/seo.ts src/app/sitemap.ts` 결과가 비어 있다. 최종 확인은 PM 검증 단계에서 한 번 더 한다.

## 실패 항목

없음.

## 테스트 구성 메모

- `unit/home/home-copy.test.ts`: 사이트맵은 `SITEMAP_SKIP_FETCH=1` 동적 import로 실제 실행해 순서와 중복을 확인했다. 소스 검사로 대체하지 않았다.
- `e2e/home.spec.ts`: AC-1, 2, 3을 한 흐름(홈 -> 운세 -> 홈 -> 로또 -> 나이 확인 -> 배너)으로 묶고 `@smoke`를 붙여 데스크톱과 모바일에서 돈다. 홈 링크는 링크 전체 이름이 아니라 목록 안 라벨 요소(`getByText(label, { exact: true })`)로 찾는다. 그룹 순서는 라벨 요소의 y 좌표로 확인한다.
- 홈에는 `main` 안 입력·버튼이 없어 `waitForHydration`이 끝나지 않는다. 홈에서는 쓰지 않고, 로또 진입 뒤에는 `passLottoAgeGate`가 하이드레이션을 기다린다. 처음 이 호출을 넣었다가 30초 타임아웃이 나서 테스트 쪽을 고쳤다. 앱 문제가 아니다.

## 미확인

- FE-6의 1024px, 1280px 헤더 드롭다운 화면 안 표시(수동 확인)는 이번 범위에 없어 확인하지 않았다.
