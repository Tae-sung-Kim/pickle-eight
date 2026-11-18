# swagger-docs QA 보고서

## 실행

- 테스트: `e2e/swagger-docs.spec.ts`(AC-1~13, 공통, 404 상태), `e2e/swagger-docs.extend.spec.ts`(AC-14, AC-15, desktop 전용·serial, 조각 파일을 쓰고 지운다). 역할이 달라 합치지 않았다.
- 명령: `pnpm exec playwright test e2e/swagger-docs --project=desktop --project=mobile --workers=1`
- 결과: 27 통과, 4 실패(공통 2, AC-8은 수정 후 통과), extend 3건 mobile 스킵. AC-8 수정 후 실패는 "공통" 2건(desktop, mobile)만 남는다.
- AC-9: `pnpm build` 후 `pnpm start -p 3100`으로 확인. `/api-docs` 404, `/openapi.json` 404, `/lotto` 200. `/sitemap.xml`에 api-docs 없음, `/robots.txt`에 `Disallow: /api-docs`, `/openapi.json`.
- AC-14 더미 조각(`test-feature.openapi.json`)은 삭제 확인. specs 폴더에는 `lotto.openapi.json`만 있다.
- 주의: 첫 실행 전부 실패는 개발 서버가 Next 업그레이드 안내(보안 취약점)로 한 번 종료되어서였다. 서버를 따로 띄우면 정상이다. 서버를 막 띄운 직후 첫 페이지 로드는 느려 간헐 실패가 날 수 있다.
- `pnpm typecheck` 통과. `pnpm lint`는 `pnpm-workspace.yaml` 포맷 1건만 남음(e2e 파일은 통과, 이 파일은 QA 범위 밖).

## AC별 결과

| AC | 결과 | 비고 |
|---|---|---|
| AC-1 | 통과 | desktop, mobile |
| AC-2 | 통과 | operation 3개, 제외 경로 없음 |
| AC-3 | 통과 | |
| AC-4 | 통과 | |
| AC-5 | 통과 | 실제 export 응답도 text/csv |
| AC-6 | 통과 | |
| AC-7 | 통과 | export 21번째, draws 61번째 429 |
| AC-8 | 통과 | Try it out이 기본 켜져 있어 별도 클릭 없이 Execute (테스트 수정) |
| AC-9 | 통과 | 빌드+start로 확인 |
| AC-10 | 통과 | |
| AC-11 | 통과 | 레이아웃에 같은 고지가 한 번 더 있어 `main` 안으로 범위를 좁힘 (테스트 수정) |
| AC-12 | 통과 | 375px |
| AC-13 | 통과 | |
| AC-14 | 통과 | 더미 삭제 확인 |
| AC-15 | 통과 | responses 누락 500 + 메시지, 경로 중복 실패 |
| 공통(h1 하나) | 실패 | 아래 참고 |
| 404 상태 | 통과 | `/api-docs/none` |

## 실패 항목

- 공통 검사 "h1 하나"
  - 원인: 페이지 자체 h1("API 문서")과 Swagger UI가 그리는 h1(`운빨연구소 API 1.0.0`)이 둘 다 있다. 접근성 트리에서도 level 1 heading이 2개.
  - 재현: `pnpm dev` 후 `/api-docs`를 열어 `document.querySelectorAll('h1').length` 확인 (2).
  - 담당: frontend-dev. 예) 페이지 제목을 h1로 두고 Swagger 제목은 h2로 낮추거나 Swagger info 영역을 숨긴다.
  - 파일: `src/features/api-docs/components/root.component.tsx`, `swagger-ui-inner.component.tsx`.

## 참고

- 앱 코드는 수정하지 않았다. e2e 파일의 lint 오류(import 정렬, 빈 구조분해, any)는 고쳤다.
