# share-tarot QA 보고서

작성일: 2026-11-26
기준: `docs/share-tarot/plan.md` AC 전체, `docs/share-tarot/ui-ux-design.md`

## 실행 결과

| 명령 | 결과 |
|---|---|
| `pnpm exec vitest run unit/tarot unit/share` | 15개 파일, 161개 통과 |
| `pnpm exec playwright test e2e/share-tarot.spec.ts --project=desktop` | 4개 통과 |
| `e2e/tarot.spec.ts` 중 `재방문`, `계속`(위기 안내), `@smoke`(2개) | 영향받는 4개 통과 |

실패 0건. 전체 회귀는 PM이 마지막에 한 번 실행한다.

## 층별 처리

- [E2E] AC-1, 2, 3: `e2e/share-tarot.spec.ts`. PNG 확인은 시그니처, 크기 0 아님, 치수가 540x675의 정수 배율(4:5)인지까지 본다. 320px 가로 스크롤 없음 포함.
- [단위] AC-4: `unit/tarot/tarot-share.test.ts`(카드 조립, 요약 첫 문장, 정/역 라벨, 질문·날짜 제외, 고지·공유 문구의 금지 표현·상표성 명칭·합니다체 검사).
- [정적] AC-5, 6, 8의 일부: `unit/share/share-scope.test.ts`에 타로 공유 허용 범위(`tarot-share.component.tsx` 한 파일, 사용처는 `/tarot/daily`·`/tarot/three-card` 루트 두 곳)와 카드 파일 8개(타로 카드 포함, 상호작용 요소·캡처 제외 표시 검사)를 추가했다. 다른 금지 규칙은 약화하지 않았다.
- [정적] AC-7, 9: 이번 QA에서 코드·문서를 따로 확인하지 않았다. PM 검증 단계(메타데이터, 새 라우트, 라이선스 문서 변경 없음)에서 확인한다.

## 발견 사항 (앱 수정 필요 여부는 PM 판단)

1. 복원 결과의 공유 버튼: plan.md 74행("복원한 경우 같은 카드로 공유할 수 있다")과 ui-ux-design.md 179행은 복원 결과도 공유 가능이라 했으나, 구현(`src/features/tarot/daily/components/root.component.tsx` 251행 `state.source !== 'restored'`)은 복원 결과에서 버튼을 숨긴다. PM 지시에 따라 테스트는 구현 기준(숨김)으로 썼다. 기획대로라면 담당 frontend-dev, 또는 plan.md 수정이 필요하다.
2. 3장 요약 2줄 말줄임: 78장·156개 방향의 요약 첫 문장 중 5개가 `line-clamp-2`를 넘겨 말줄임으로 잘린다(약 3.2%). 측정은 351px 폭, 18px, `leading-normal`, 실제 페이지 글꼴 기준이다. 해당 문장은 `docs/share-tarot/art-samples/_clamp.json`의 `bad` 목록에 있다. plan.md 80행의 "문구를 줄이거나 바꾸지 않는다"에 따른 의도된 동작이다. 사용자 확인용으로 남긴다.
3. 공유 문구(`TAROT_SHARE_TARGETS.*.text`)는 해요체("재미로 봤어요.")다. 타로 문구 규칙은 합니다체이나 이 문구는 카드 이미지가 아니라 공유창 텍스트이고, 금지 표현 검사는 통과한다. 1·2차 공유 문구와 같은 어투인지 사용자가 확인하면 된다. 이 문장은 합니다체 자동 검사에서 제외했다(고지 한 줄만 합니다체 검사).

## 수동 항목 (자동 검증 아님)

- AC-10 실기기: iPhone Safari, Android Chrome에서 첫 시도 공유, 빈 이미지 없음, 3장 글자 잘림 없음. 수동.
- 그림 닮음 판정(plan.md "그림 위험 재점검"): 사용자 육안 확인, 결과를 아래 표에 기록. 수동.
  - 샘플 10장(정방향, 카드 그림 영역만, 앱 코드 수정 없이 같은 날 복원 화면에서 캡처): `docs/share-tarot/art-samples/`
    - 메이저: `0-the-fool.png`, `1-the-magician.png`, `2-the-high-priestess.png`, `10-wheel-of-fortune.png`, `13-death.png`, `16-the-tower.png`
    - 에이스: `36-ace-of-cups.png`, `50-ace-of-swords.png`, `22-ace-of-wands.png`, `64-ace-of-pentacles.png`
  - 판정 기록: (미기록) 닮음 / 닮지 않음 — 판정자, 날짜
- 공유 카드 PNG 자체의 그림·글자가 실제로 찍히는지 육안 1회(plan.md 열린 질문 1번). 수동.

## 테스트를 바꾼 사유

- `unit/share/share-scope.test.ts`: 타로가 공유 허용 범위에 들어와서 "타로 공유 import 금지" 정규식에 예외 한 파일을 두었다. 카드 파일 수 7에서 8로 바꿨다(타로 카드 파일 포함).

## 재검증: 위기 신호 공유 버튼 숨김 (drawnWithCrisis)

- 변경: 공유 버튼 숨김이 입력창 현재 질문이 아니라 뽑는 순간 저장한 `drawnWithCrisis`를 쓴다.
- 테스트: `e2e/share-tarot.spec.ts`의 AC-3을 오늘의 타로·세 장 두 화면으로 늘렸다. 위기 표현으로 뽑아 계속 보기로 결과를 본 뒤 입력창을 지워도 공유 버튼이 없는지 확인한다. 기존 위기 숨김 테스트를 이 흐름에 합쳤고, 78장 검사는 별도 테스트로 분리했다.
- 실행: `pnpm exec playwright test e2e/share-tarot.spec.ts --project=desktop` 6개 통과. `e2e/tarot.spec.ts -g 계속`(위기 안내) 1개 통과.
- 단위: `pnpm exec vitest run unit/tarot` 49개 통과. 훅 리듀서 테스트는 없어 새로 만들지 않았다.
- 실패 0건. 전체 회귀는 PM이 마지막에 한 번 실행한다.
