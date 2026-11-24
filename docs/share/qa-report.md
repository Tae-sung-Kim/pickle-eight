# 공유 기능 (share) QA 보고서

작성: QA, 2026-11-24. 앱 코드는 고치지 않았다.

## 실행 결과

| 명령 | 결과 |
|---|---|
| `pnpm vitest run unit/share` | 7개 파일, 96개 통과 |
| `pnpm playwright test --project=desktop e2e/share.spec.ts` | 7개 통과 |
| `pnpm playwright test --project=mobile e2e/share.spec.ts` | 1개 통과 (`@smoke`, AC-2) |
| `pnpm tsc --noEmit`, `biome check e2e/share.spec.ts unit/share` | 오류 없음 |

실패 항목 없음. 전체 회귀는 PM이 돌린다.

## 추가한 테스트

- `unit/share/share-url.test.ts` (QA-U2): 1차 주소 6개가 공유 대상, 기능 seo pathname, canonical과 같다. `share-lib.test.ts`에는 주소 형식 검사만 있어 기능별 일치 검사를 새로 만들었다.
- `unit/share/share-scope.test.ts` (QA-U7): 공유 import 범위, html-to-image import 위치, 공용 파일 `console.` 없음, 크기 숫자 위치, 카드 5개 파일에 button, input, a, textarea, 광고, h1~h6, img 없음. 카드 파일에 금지 요소가 하나도 없어 `data-capture="ignore"`는 필요하지 않다.
- `e2e/share.spec.ts` (QA-E1): 흐름 7개. AC-1·14(뭐 먹지 PC), AC-3·4(이미지 실패, 클립보드 거부), AC-2(모바일 모의, `@smoke`), AC-4(카카오톡 Android UA), AC-17(사다리 미리보기), AC-14(돌림판 320px), AC-5(로또 생성기).

## 정적 확인 (QA-S1)

| AC | 확인 | 결과 |
|---|---|---|
| AC-10 | 공유 import는 meal, lucky-draw, fortune 궁합, `use-capture.hook.ts`에만 있다. 사주, 꿈, 타로, 로또(생성기 제외) 폴더에는 없다 | 통과 (share-scope) |
| AC-11 | 대상 페이지 `page.tsx`, `*-seo.constant.ts`, `menu.constant.ts`, `sitemap.ts`에 diff 없음. 새 라우트 없음. 수정된 페이지는 `privacy`, `terms`(FE-8)뿐 | 통과 |
| AC-11 | `og-image/route.ts` diff는 하단 줄 한 곳(사이트 이름만 표시, BE-1)이다. 제목, 설명 메타는 그대로 | 통과. 화면 확인은 M-9 |
| AC-12 | 공유 문구 금지어, 문체 검사는 `meal-copy`, `lucky-draw-copy`, `compatibility-copy` 테스트와 `share-lib.test.ts`의 `share.constant` 검사에서 통과 | 통과 |
| AC-13 | `package.json`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`에 diff 없음 | 통과 |
| AC-15 | `html-to-image` import는 `share-capture.ts`, `use-capture.hook.ts` 두 곳뿐. 카드는 화면 밖 호스트에 따로 그린다 | 통과 |
| AC-16 | 카드 5개 파일에 상호작용 요소, 광고, 제목 태그, img 없음 | 통과 (share-scope) |

## 수동 항목 (자동화 불가)

AC-6(iPhone Safari, Android Chrome 실기기, 카카오 iOS·네이버·인스타그램 인앱), M-5(iOS 공유창 제목·주소 중복), M-6(PC 브라우저별 이미지 복사), M-7(첫 캡처 시간), M-8(돌림판 후보 20개 최악 조합), M-9(OG 하단 줄), 한글 조합 입력은 Playwright로 재현하지 못한다. PM이 실기기로 확인한다.

## 참고

- `unit/fortune/compatibility-copy.test.ts` 18행 `shareConstants` import는 미사용이 아니다. 75행 `['share', shareConstants]`에서 쓴다. `tsc --noEmit`과 biome 모두 경고가 없어 IDE 캐시 지연으로 본다. IDE 재시작 또는 TS 서버 재시작으로 사라진다.
- 테스트를 고친 사유: AC-2 첫 작성에서 처리 중 두 번째 클릭이 무시되는 앱 동작(정상)을 기다리지 않았고, Next 경로 안내(`role="alert"`)를 오류 알림으로 잘못 셌다. 둘 다 테스트 오류라 고쳤다.
- 이미지 복사(AC-1)는 지원하지 않는 환경에서는 버튼이 없어 검사를 건너뛴다. 데스크톱 Chrome에서는 지원되어 검사된다.
