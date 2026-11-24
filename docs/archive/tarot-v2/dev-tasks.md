# tarot-v2 개발 티켓

입력: `docs/tarot-v2/design.md`, `docs/tarot-v2/ui-ux-design.md` (둘 다 승인 대기 상태에서 사용자 확정 반영), `docs/tarot-v2/plan.md` (확정)
규칙: `docs/conventions/code-style.md`, `docs/conventions/design-system.md`, `docs/conventions/data-storage.md`, `docs/conventions/seo.md`
작성: dev-lead
작성일: 2026-11-09

## 확정 사항 (이 티켓의 전제)

- design D1~D6: 추천안 그대로. D1 중첩 Record + `satisfies`, D2 root `useState`, D3 분야별 위치 틀 + 마무리(45문장), D4 localStorage 키·형식 그대로, D5 질문 예시 채우기 삭제, D6 1장 질문 항상 펼침.
- ui-ux S1 = A안: 1장 "오늘의 흐름" 소제목 없음. 요약 아래 분야 문장을 붙인다. 1장 전용 h3 분기 없음.
- ui-ux S2 = 넣기: 3장 결과 읽기 3열 위에 "분야: ○○" 표시줄(전체이면 없음). design에 없는 요소라 상수 추가 필요. 아래 "design.md 보완 메모" M-1 참고.
- ui-ux S3 = 넣기: 1장에서 칩을 바꿨을 때만 분야 관점 문장이 150ms 투명도 0 → 1로 바뀐다(framer-motion). 동작 줄이기면 즉시 교체. 공개 첫 렌더와 "전체"로 사라질 때는 효과 없음.
- ui-ux S4 = 뺌: 3장 흐름 이야기는 공개 시작과 함께 바로 그린다. 뒤집기 뒤 연출 없음.
- 새 문구(승인됨): 분야 변경 알림 2개, "분야:" 접두사, design.md 고지 문구 5종(`TAROT_TOPIC_NOTICE` 교체, `TAROT_QUESTION_USAGE_NOTICE`, `TAROT_STORY_NOTICE`, `TAROT_REDRAW_RESULT_NOTICE`, `TAROT_REDRAW_NOTICE` 유지).
- 데이터 저장: 분야 값은 메모리(`useState`)만. localStorage 키·형식 불변. 분야·질문·이야기 저장 없음.
- DB, 백엔드, API, 새 라이브러리(framer-motion은 기존 의존성), 새 환경변수, 새 URL 없음.

## 티켓

작업 방식: 프론트 티켓(FE-1~7)은 사용자 지시에 따라 frontend-dev 한 에이전트가 FE-1부터 순서대로 이어서 수행한다. 여러 frontend-dev를 동시에 돌리지 않는다. 콘텐츠(C), QA(Q), 검증(V)은 아래 실행 순서와 동시 실행 가능 목록을 따른다.

| ID | 담당 | 내용 | 선행 작업 | 관련 파일 | 디자인 명세 참조 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB-0 | db-dev | 없음. 테이블, 컬럼, 인덱스, RLS, 마이그레이션 모두 없음 (design "DB 스키마") | - | - | - | 해당 없음 | 해당 없음 |
| BE-0 | backend-dev | 없음. API 계약 없음, 서버 코드 없음 (design "API 계약") | - | - | - | 해당 없음 | 해당 없음 |
| FE-1 | frontend-dev | 타입·상수 뼈대. (1) `tarot.type.ts`: `TarotQuestionTopicKeyType`, `TarotQuestionTopicType` 삭제, `TarotSuitGroupType`, `TarotTopicKeyType`, `TarotTopicSelectionType`, `TarotTopicType`, `TarotOrientationTextType`, `TarotTopicReadingMapType`, `TarotStoryToneType`, `TarotStorySetType`, `TarotStoryMapType` 추가 (design 타입 계약 그대로). (2) 신규 `tarot-topic.constant.ts`: `TAROT_TOPICS`(전체·연애·인간관계·직업·학업·재물·생활·일상 조언 순서 고정), `TAROT_TOPIC_DEFAULT = 'all'`, `TAROT_TOPIC_GROUP_LABEL = '분야'`, `TAROT_TOPIC_NOTICE`(교체 문구), 그리고 보완 메모 상수 `TAROT_TOPIC_LINE_PREFIX = '분야:'`, `TAROT_TOPIC_APPLIED_NOTICE = '분야 문장으로 바꿨습니다.'`, `TAROT_TOPIC_CLEARED_NOTICE = '분야 문장을 숨겼습니다.'` (M-1, M-4). (3) 신규 `tarot-topic-reading.constant.ts`: 40칸 뼈대(빈 문자열), `as const satisfies TarotTopicReadingMapType`. (4) 신규 `tarot-story.constant.ts`: 5세트 × (위치 6 + 마무리 3) 뼈대(빈 문자열), `satisfies TarotStoryMapType`, `TAROT_STORY_TITLE = '흐름 이야기'`. (5) `tarot-question.constant.ts`: `TAROT_QUESTION_TOPICS`, `TAROT_TOPIC_GROUP_LABEL`, `TAROT_TOPIC_NOTICE` 제거, 질문 예시(`examples`) 삭제. (6) `tarot-notice.constant.ts`: `TAROT_QUESTION_USAGE_NOTICE`, `TAROT_STORY_NOTICE`, `TAROT_REDRAW_RESULT_NOTICE` 추가(승인 문구 글자 단위 동일). `TAROT_REDRAW_NOTICE`는 그대로. (7) `tarot-copy-rule.constant.ts`: `TAROT_COPY_ALLOWED_SENTENCES`에 `TAROT_STORY_NOTICE` 추가, `TAROT_STORY_ENDING_PATTERN = /수 있습니다\.$/` 추가. | - | `src/features/tarot/types/tarot.type.ts`; `src/features/tarot/constants/tarot-topic.constant.ts`(신규); `tarot-topic-reading.constant.ts`(신규); `tarot-story.constant.ts`(신규); `tarot-question.constant.ts`; `tarot-notice.constant.ts`; `tarot-copy-rule.constant.ts` | design "타입·데이터 계약", "상수(확정)", "고지 문구", "문장 작성 규칙"; ui-ux "새 문구" | 타입·상수 이름과 값이 design과 일치. 뼈대 칸 40·45개가 `satisfies`로 컴파일된다. `tarot-question.constant.ts`에서 분야 상수가 빠졌다(grep 0건). 새 문구 3개와 분야 안내 문구가 승인 문구와 글자 단위로 같다. 이 단계 뒤 typecheck는 실행하지 않는다(3장 root, 기존 topic-chips가 FE-5 전까지 깨짐이 정상). | 대기 |
| FE-2 | frontend-dev | 유틸 2개(순수 함수). `getTarotSuitGroup`, `getTarotTopicReading`(topic `'all'` 또는 빈 문자열이면 null, 질문 인자 없음), `getTarotStoryTone`(역방향 0 → upright, 3 → reversed, 그 외 mixed), `buildTarotThreeCardStory`(past·present·future 틀 + 마무리, 문장 사이 공백 한 칸, `replaceAll`로 `{card}`·`{keyword}` 치환. null 조건: 세 장이 아니거나 위치가 한 번씩 아님, 쓸 문장이 빈 문자열, 치환 뒤 `{` 또는 `}` 잔존). | FE-1 | `src/features/tarot/utils/tarot-topic.util.ts`(신규); `src/features/tarot/utils/tarot-story.util.ts`(신규) | design "유틸 함수(확정)", "보안 > 질문 격리" | 시그니처가 design과 같다. React·브라우저 API import 없음(Node에서 import 가능). 'all' 입력 시 1장 함수가 null. 빈 문자열 입력 시 null. 질문 텍스트를 받는 인자 없음. | 대기 |
| FE-3 | frontend-dev | 공용 컴포넌트 3개. (a) `three-card/components/topic-chips.component.tsx`를 `shared/components/topic-chips.component.tsx`로 이동(git mv)하고 수정: `TarotTopicChipsComponent`, props `selectedKey`, `onSelect`. `TAROT_TOPICS` 5칩, `aria-pressed` 버튼 묶음, `fieldset aria-labelledby`(라벨 `p`, `TAROT_TOPIC_GROUP_LABEL`), 라벨은 칩 줄 위 한 줄, 칩 아래 `TAROT_TOPIC_NOTICE`(`text-xs`), 칩 `px-3 text-sm font-medium`, 선택 `border-menu-tarot bg-menu-tarot/10 text-menu-tarot`, 모바일 `min-h-11 sm:min-h-9`, `flex flex-wrap gap-2`, `type="button"`. 같은 칩 재선택은 `onSelect`만 부르고 입력칸을 건드리지 않는다. (b) `shared/components/card-reading.component.tsx`: `topicSentence?: string | null` prop 추가. 요약 바로 아래 `p.max-w-[68ch] border-l-2 border-menu-tarot/40 pl-3 text-sm leading-7 text-foreground break-keep sm:text-base`. null·undefined면 미렌더. S3 모션: 이전 값(ref)이 있고 새 값도 있고 값이 다를 때만 `motion.p`로 150ms 투명도 0 → 1. 첫 렌더와 null 전환에는 효과 없음. `useReducedMotion()`이 true면 duration 0. 죽음 카드 보충 문구는 분야 문장 뒤. (c) `shared/components/question-input.component.tsx`: 라벨 "질문 (선택)" 아래, 입력칸 위에 `TAROT_QUESTION_USAGE_NOTICE`(`text-xs leading-5 text-muted-foreground`, `max-w-[68ch]`, id 부여). 입력칸 `aria-describedby` 첫 번째가 이 id(용도 → 민감정보 → 글자 수). 기존 `TAROT_SENSITIVE_INPUT_NOTICE` 유지. props 변경 없음. | FE-1 | `src/features/tarot/shared/components/topic-chips.component.tsx`(이동·수정); `shared/components/card-reading.component.tsx`; `shared/components/question-input.component.tsx`. 삭제는 FE-5 | ui-ux "분야 칩", "분야 관점 문장", "질문 입력", "인터랙션·애니메이션 S3", "접근성"; design "12.2 공용 컴포넌트 계약", "알려진 한계" | props가 design 확정값과 같다. 칩 5개, `aria-pressed` 상태가 맞고 그룹 이름이 "분야". 분야 문장 `p`는 `topicSentence`가 있을 때만 있다. S3 모션은 값이 바뀔 때만, 동작 줄이기에서 즉시. `dangerouslySetInnerHTML` 없음. design-guard 통과(`dark:`, 기본 팔레트 없음). FE-4·FE-5가 이 파일을 고치지 않게 여기서 확정. | 대기 |
| FE-4 | frontend-dev | 1장 root. (a) `daily/components/root.component.tsx`: `useState<TarotTopicSelectionType>(TAROT_TOPIC_DEFAULT)` 하나만 추가. 저장하지 않으며 재방문 복원(`restored`)에도 'all'로 시작. (b) 칩 배치(D6): 역방향 스위치 → 분야 칩 → 질문 입력 → 뽑기. revealed에서는 칩 블록 아래 `border-b border-border pb-5`(idle에는 없음). 칩은 idle과 revealed에서 보이고 checking·crisis에서는 숨긴다(선택 state는 유지). (c) checking 스켈레톤을 4줄로: 스위치 `h-14`, 칩 블록 `h-32`, 질문 블록 `h-32`, 버튼 `h-11`, 모두 `animate-pulse motion-reduce:animate-none`. (d) `TarotCardReadingComponent` 호출에 `titleAs="h2"`, `topicSentence={getTarotTopicReading(card, isReversed, topic)}` 전달. S1 A안이므로 "오늘의 흐름" 소제목 분기 없음. (e) 분야 변경 알림: sr-only `div` `aria-live="polite"`. 결과가 나온 뒤 사용자가 칩을 바꿨을 때만 문구를 넣는다(첫 공개 때는 안 넣음). 'all'이면 `TAROT_TOPIC_CLEARED_NOTICE`, 그 외 `${TAROT_TOPICS의 label} ${TAROT_TOPIC_APPLIED_NOTICE}`. 질문 텍스트는 넣지 않는다. | FE-2, FE-3 | `src/features/tarot/daily/components/root.component.tsx` | ui-ux "오늘의 타로 (/tarot/daily)", "1장 칩 자리 스켈레톤", "접근성 > 라벨·읽기", "S1"; design "12.2 1장 트리", "12.3 상태 위치", "D2", "D6" | idle·revealed·checking·crisis에서 칩 위치와 노출이 design·ui와 같다. 칩을 바꿔도 카드 이름·방향·키워드·요약 텍스트는 그대로이고 분야 문장 `p`만 바뀐다(수동 확인). 'all'이면 분야 문장 `p`가 없다. aria-live는 결과 뒤 사용자 변경에서만 한 번 읽힌다. 저장 키·형식은 바뀌지 않는다(storage service, 리듀서 미수정). 탭 순서: 스위치 → 칩 5개 → 질문 → 버튼. | 대기 |
| FE-5 | frontend-dev | 3장 root, 흐름 이야기, 결과 읽기. (a) `three-card/components/root.component.tsx`: 기존 `selectedTopicKey`·`exampleIndex` state와 예시 채우기 로직 삭제, `useState<TarotTopicSelectionType>(TAROT_TOPIC_DEFAULT)` 하나로 교체. 칩은 idle에서만 보인다(shared 칩 사용). idle은 역방향 → 칩 → 질문 → "세 장 뽑기" + `TAROT_REDRAW_NOTICE`(기존). revealed에서 분야가 'all'이 아니면 읽기 3열 바로 위에 `p.text-sm.leading-6.text-muted-foreground`로 `${TAROT_TOPIC_LINE_PREFIX} ${label}`(S2). `spreadEntries`에 `topicSentence`를 렌더 중 계산해 넘긴다. `buildTarotThreeCardStory(entries, topic)`을 렌더 중 계산하고 null이 아니면 `TarotThreeCardStoryComponent` 표시(S4: 공개 시작과 함께, `isFlipping`으로 지연하지 않음). 다시 뽑기 줄: 모바일 `flex-col gap-3`, `md:flex-row md:items-start md:gap-4`, 버튼 `aria-describedby`로 `TAROT_REDRAW_RESULT_NOTICE`(`text-sm`, `md:pt-2.5`). RESET 뒤에도 분야·질문 값 유지. (b) 신규 `three-card/components/story.component.tsx`: `TarotThreeCardStoryComponent`, props `story: string`. `section.border-t.border-border.pt-6.space-y-3.md:px-6` > h2(`TAROT_STORY_TITLE`, `text-xl sm:text-2xl font-semibold leading-tight`) + `p`(문단, `text-base sm:text-lg leading-8 sm:leading-9 max-w-[68ch] break-keep`) + `p`(`TAROT_STORY_NOTICE`, `text-sm leading-6 text-muted-foreground`). React 텍스트로만 그린다. 문단 안에 굵기·색 처리 없음. (c) `spread-result.component.tsx`: entry에 `topicSentence` 추가 받아 `TarotCardReadingComponent titleAs="p"`에 전달. (d) 기존 `three-card/components/topic-chips.component.tsx` 삭제. | FE-2, FE-3 (FE-4와 파일은 겹치지 않으나 frontend-dev 한 에이전트가 순차로 수행) | `src/features/tarot/three-card/components/root.component.tsx`; `three-card/components/story.component.tsx`(신규); `three-card/components/spread-result.component.tsx`; `three-card/components/topic-chips.component.tsx`(삭제) | ui-ux "3장 타로 (/tarot/three-card)", "흐름 이야기", "3장 다시 뽑기 줄", "분야 표시줄 S2", "S4", "접근성 > 흐름 이야기·재뽑기"; design "12.2 3장 트리", "TarotThreeCardSpreadResultEntryType", "TarotThreeCardStoryComponent", "12.3" | 3장 idle 칩 5개, 기본 "전체", 칩을 눌러도 입력칸이 바뀌지 않는다. revealed에서 칩 숨김. 'all'이면 분야 표시줄 없음, 그 외는 한 번만 표시. 이야기가 null이면 제목·문단·안내 전부 미렌더(빈 자리 없음). h1 개수 불변(AC-27). 재뽑기 안내가 버튼과 `aria-describedby`로 연결. 삭제한 옛 칩 파일을 import하는 곳이 없다(grep). 이 단계 뒤 PM이 typecheck를 한 번 돌린다. 훅(`use-three-card-reading.hook.ts`) 미수정. | 대기 |
| FE-6 | frontend-dev | 법적·개인정보 고지 문서. (a) `COMPLIANCE.md` 11장 Tarot 항목(약 112~119행): "분야 선택은 해석 문장만 고르고 저장하지 않음", "질문은 해석에 쓰지 않고 위기·전문가 안내 확인에만 씀", "3장 흐름 이야기는 승인된 고정 문장을 이은 참고용이며 예측·보장이 아님" 3항목 추가, "Last updated" 갱신. (b) `src/app/privacy/page.tsx` 약 85행 타로 문장에 "분야 선택과 3장 타로 결과도 저장하지 않습니다." 취지의 합니다체 한 문장 추가, `EFFECTIVE_DATE` 갱신(같은 날 다른 기능이 갱신했으면 한 번만). (c) `THIRD_PARTY_NOTICES.md` 약 41행: "topic examples"를 "topic readings, three-card story sentences"로 교체. (d) `src/app/terms/page.tsx`는 변경 없음. | FE-1 (문구 승인본 기준). 최종 문구 확인은 C-1·C-2 완료 뒤 | `COMPLIANCE.md`; `src/app/privacy/page.tsx`; `THIRD_PARTY_NOTICES.md` | design "상업적 이용·라이선스", "15 갱신 대상"; ui-ux "새 문구"; plan "법적·정책 요구사항" | 세 파일 갱신. 문구가 승인 고지 문구와 같은 의미이고 금지 표현 검사 대상이면 통과. 다른 기능(docs/fortune-v2 작업 중)의 같은 파일 변경과 충돌 없음 확인. 법률 확인 없음(위험 수용)을 작업 메모에 남김. terms 미수정. 파일 쓰기 권한 확인 필요(아래 충돌 위험 6). | 대기 |
| FE-7 | frontend-dev | `src/constants/menu.constant.ts`의 타로 두 항목 `description`만 변경. C-3에서 확정된 문구를 넣는다. `label`, `href`, `icon`, `colorClass`, `example`은 그대로. | C-3(문구 확정), FE-6 | `src/constants/menu.constant.ts` | design "13 SEO > MENU_LIST" | 두 항목 diff가 description 2줄뿐. label "3장 타로 (과거·현재·미래)" 유지. 다른 기능 항목 미수정. 다른 기능 작업과 동시에 이 파일을 고치지 않음. | 대기 |
| C-1 | content (작성: frontend-dev, 검수: 사용자) | 분야 해석 문장 40개. 수트 그룹 5(major, wands, cups, swords, pentacles) × 분야 4(love, career, money, daily) × 방향 2(upright, reversed). 규칙: 칸마다 완결된 합니다체 한 문장, 카드 이름·위치 이름(과거·현재·미래)·자리표시자 금지, 역방향은 "다른 각도·속도를 늦춤" 렌즈, 재물은 생활 습관·소비 태도만(투자·매수·재산 증식·복권·도박·로또 금지), 끝은 "~수 있습니다." 권장. 40문장 서로 모두 다름. 순서: 그룹 1개(8문장) 샘플 먼저 작성 → 사용자 검수 → 나머지 작성. | FE-1 | `src/features/tarot/constants/tarot-topic-reading.constant.ts` (문장 칸만 수정) | design "분야 해석 문장 40개 (문장 작성 규칙)", "데이터 저장 위치"; plan Q5 | 40칸 모두 채움(빈 문자열 0). 중복 0. 금지 표현·투자·도박·로또 사전 점검 통과. 사용자 검수 승인 기록(수정 이력 포함, C-4 copy-log 입력용). 수트 관례는 검수 때 확인. | 대기 |
| C-2 | content (작성: frontend-dev, 검수: 사용자) | 흐름 이야기 문장 45개. 분야 5세트(all, love, career, money, daily) × (위치 틀 6 + 마무리 3). 위치 틀 = past·present·future × upright·reversed (세트당 6, 총 30). 마무리 = upright·mixed·reversed (세트당 3, 총 15). 틀 규칙: `{card}` 1회 필수, 바로 뒤에 `" 카드"`가 옴. `{keyword}` 0~1회, 반드시 작은따옴표로 감싸고 뒤는 `의`, `에`, `에서`, `쪽으로` 중 하나. 위치 단어(과거·현재·미래)를 해당 틀에 포함. 틀·마무리 모두 `수 있습니다.`로 끝남(Q8, 어미 "~일 수 있습니다", "~해 볼 수 있습니다" 형태). 마무리에는 자리표시자 금지. 분야 세트끼리, 'all' 세트와 겹치지 않음. 순서: C-1 샘플 승인 뒤 시작(톤 통일). | FE-1, C-1 샘플 검수 승인 | `src/features/tarot/constants/tarot-story.constant.ts` (문장 칸만 수정) | design "이야기 문장 45개 (문장 작성 규칙)", "예시"; plan Q8 | 45칸 채움(틀 30 + 마무리 15). 자리표시자·조사 규칙 위반 0. `TAROT_STORY_ENDING_PATTERN` 통과. 틀마다 위치 단어 포함. 사용자 검수 승인. Q-3 조합 검사에서 null 0. | 대기 |
| C-3 | content (작성: frontend-dev, 검수: 사용자) | 검색·가이드 문구. (a) `tarot-seo.constant.ts`: 1장·3장 각각 `title`, `description`, `headerDescription`. 3장 h1·description·headerDescription에 "상담" 금지, 두 페이지 모두 "운세" 금지. `heading`, `pathname`, `keywords`, `ogImageAlt`, `TAROT_BREADCRUMB_GROUP`은 바꾸지 않는다. 분야 키워드(연애 타로 등)는 keywords에 넣지 않고 본문에만 "분야에 따라 읽는 방향이 달라지는 방법" 형태로 쓴다. (b) `tarot-faq.constant.ts`: 1장("1장과 3장은 무엇이 다릅니까?", "분야를 고르면 해석이 달라집니까?", "질문을 적으면 해석에 반영됩니까?" 추가, 기존 "왜 다시 뽑을 수 없습니까?", "정확합니까?"는 유지), 3장(분야 답을 v2 동작으로, "3장은 왜 다시 뽑을 수 있습니까?"로 합침, "1장과 3장은 무엇이 다릅니까?", "질문을 적으면 해석에 반영됩니까?" 추가). 두 페이지 답 문장 복사 금지. 질문은 "~입니까?". (c) `daily/components/guide.component.tsx`, `three-card/components/guide.component.tsx`의 `GUIDE_PARAGRAPHS`: 1장은 가볍게 보는 법, 분야 선택 설명, 1장과 3장 차이, 질문은 해석에 쓰이지 않는다는 문단(기존 3번째 문단 교체). 3장은 이야기 읽는 법(마지막 문단이 세 장을 잇는 이야기), 위치별 설명, 분야 설명, 재뽑기 설명, 1장과 3장 차이. 페이지당 약 600자 이상, 두 페이지 문단 복사 금지. (d) 메뉴 설명 확정 문구 2개는 FE-7에 넘긴다(파일 수정은 FE-7). | FE-1 (구조 확정. 구조 변경 없음) | `src/features/tarot/constants/tarot-seo.constant.ts`; `tarot-faq.constant.ts`; `src/features/tarot/daily/components/guide.component.tsx`; `src/features/tarot/three-card/components/guide.component.tsx` | design "13 SEO", "FAQ", "가이드 본문", "MENU_LIST"; ui-ux "가이드·FAQ"; plan "검색 노출" | 금지 표현 사전 점검 통과. "운세"와 3장 "상담" 0건. 가이드 한 페이지 600자 이상. 두 페이지 문단 중복 없음. FAQ JSON-LD가 화면 FAQ와 같은 상수에서 나온다(FE 확인). 사용자 검수 승인. design에 없는 새 키워드 추가 없음. | 대기 |
| C-4 | content (작성: frontend-dev, 확인: 사용자) | 대표 문장 웹 검색 샘플 확인(외부 해석 문장 유사 여부). 결과를 `docs/tarot/copy-log.md`에 새 절 2개로 기록: 분야 문장 40행(그룹·분야·방향별), 이야기 문장 45행(분야·위치·방향 또는 마무리별). 기존 3.3 표 형식을 따른다. 기존 행은 고치지 않는다. 유사 문장이 나오면 재작성 후 C-1/C-2 재검수. | C-1, C-2, C-3 | `docs/tarot/copy-log.md` (새 절만) | design "상업적 이용·라이선스", "15 갱신 대상" | 85행(40 + 45) 기록. 웹 검색 샘플 기록. 기존 행 diff 0. | 대기 |
| Q-1 | qa | 기존 e2e 중 v2와 반대 동작인 테스트 정리. (a) `e2e/tarot.spec.ts` 662행 "AC-11: 분야 칩을 누르면 질문 예시가 채워지고 분야와 무관하다는 안내" → 삭제하고 v2 AC-4·AC-5 테스트(Q-2)로 대체. (b) 688행 "AC-12: 질문 예시에 투자·복권 질문 없음" → 삭제하고 v2 AC-3·AC-12 테스트(칩 5개, 기본 전체, 예시 채우기 없음)로 대체. (c) 714행 "AC-13: 재뽑기 안내" → revealed 기준 `TAROT_REDRAW_RESULT_NOTICE` 검사로 갱신(v2 AC-15). idle의 `TAROT_REDRAW_NOTICE` 검사는 유지. (d) 1638행 "AC-36: 3장 분야 선택 → 뽑기 → 결과 → 다시 뽑기" → 예시 채움 전제를 빼고 분야 표시줄(S2)과 흐름 이야기 확인을 추가. (e) 1617행(1장 흐름)은 실행 결과를 보고 필요할 때만 수정. (f) `e2e/tarot-copy.spec.ts` 456~468행("AC-12(데이터)", `TAROT_QUESTION_TOPICS`, `examples` 검사) 삭제 → Q-3의 새 상수 검사로 대체. 이 문서의 행 번호는 design 기준이고 실제 행은 qa가 확인한다. 기존 AC 번호와 v2 AC 번호가 겹치므로 테스트 이름에 "v2 AC-n"을 명시한다. | FE-5, FE-7 (실행은 Q-4) | `e2e/tarot.spec.ts` (662, 688, 714, 1638, 1617 확인); `e2e/tarot-copy.spec.ts` (456~468) | ui-ux 전체 (AC 대응); design "파일 충돌 위험" | 수정·삭제한 테스트 목록과 대체 AC 번호를 `docs/tarot-v2/qa-report.md`에 기록. 대체 없이 지운 AC가 0건. v2와 무관한 테스트(fortune 등)는 건드리지 않는다. 이 단계에서 깨지는 테스트는 정상이다. | 대기 |
| Q-2 | qa | 신규 `e2e/tarot-v2.spec.ts`: plan AC-1~27을 데스크톱·모바일 두 프로젝트에서 검사. AC-18(요청에 질문 없음), AC-19(저장소에 질문·분야 없음, 1장 키는 날짜·카드 번호·방향만), AC-22(새 상수 금지 표현은 Q-3과 교차), AC-23(쿠키 거절), AC-24(흐름), AC-25~27(SEO, h1 개수) 포함. 선택자: `getByRole('group', { name: '분야' })`, `aria-pressed`, 분야 문장은 `p`로 찾고 'all'에서는 없음을 확인. 무작위 결과는 형식과 개수로 검사. | FE-1 (상수 이름). 작성은 FE-2~5와 병렬 가능, 실행은 Q-4 | `e2e/tarot-v2.spec.ts`(신규) | plan "완료 조건(AC)"; ui-ux "PM 전달 사항" | 27개 AC 각각 테스트 또는 근거 주석 존재. 테스트 파일이 타입 오류 없음(`pnpm typecheck`에 e2e가 포함되는지 확인). | 대기 |
| Q-3 | qa | `e2e/tarot-copy.spec.ts` 확장(상수를 Node에서 직접 import). (1) 금지 표현 검사 대상에 새 상수 추가: `TAROT_TOPIC_NOTICE`, `TAROT_QUESTION_USAGE_NOTICE`, `TAROT_STORY_NOTICE`, `TAROT_REDRAW_RESULT_NOTICE`, `TAROT_TOPIC_APPLIED_NOTICE`, `TAROT_TOPIC_CLEARED_NOTICE`, 분야 문장 40, 이야기 45, SEO·FAQ·가이드 문구(C-3). 허용 예외는 `TAROT_STORY_NOTICE` 한 문장뿐. (2) 분야 문장 40개가 모두 다르고 그룹·분야·방향 조합이 빠짐없이 채워짐. (3) 이야기 45문장: `TAROT_STORY_ENDING_PATTERN` 통과, 위치 틀에 해당 위치 단어 포함, `{card}` 뒤 `" 카드"`, `{keyword}` 뒤 조사 규칙, 마무리에 자리표시자 없음. (4) 분야 4세트와 'all' 세트 사이 문장 겹침 0(AC-13). (5) `buildTarotThreeCardStory` 전수 조합 검사: 그룹 5³ × 방향 2³ × 분야 5 = 1,000 조합. null 0, 4문장(3~5 범위), "과거"·"현재"·"미래" 포함(AC-11). | FE-2 (util), FE-1 (상수). 실행은 C-1·C-2 뒤 | `e2e/tarot-copy.spec.ts` | design "7.1 금지 표현 검사", "AC-11, AC-13, AC-22", "7 테스트 항목"; plan AC-22 | 모든 검사 통과, 1,000 조합 통과. 위반은 콘텐츠면 C-1·C-2·C-3, 코드 버그면 FE-2로 되돌린다. | 대기 |
| Q-4 | qa | 실행과 되돌림. `pnpm e2e`(데스크톱), `pnpm e2e:mobile`(모바일) 실행. 실패는 원인별로 되돌린다(문구 → C-*, 구현 → FE-*, 테스트 잘못 → Q-*). 수정 뒤 qa를 다시 호출한다. | Q-1, Q-2, Q-3, FE-7, C-4 | `e2e/*`; `docs/tarot-v2/qa-report.md` | design "담당별 작업 순서 > qa" | 데스크톱·모바일 모두 v2 AC 전부 통과. `qa-report.md`에 AC별 결과, 되돌린 항목, 재실행 결과가 있다. | 대기 |
| V-1 | PM (메인 세션) | 검증. `pnpm typecheck`을 FE-5 뒤 한 번, 최종에 한 번 실행. `pnpm lint`, `pnpm build` 실행. 보안(시크릿 없음, 질문·분야 저장·전송 없음, `dangerouslySetInnerHTML` 없음), 법적 고지(COMPLIANCE·privacy·THIRD_PARTY 반영), SEO(`buildMetadata()`, FAQPage JSON-LD와 화면 FAQ 일치, sitemap 항목 수 불변, 3장 "상담" 없음), 디자인 명세 대조. | Q-4, FE-6, FE-7 | 전체 | design "검증", ui-ux 전체 | 세 명령 통과. 실패 시 담당에게 되돌린다. 보고는 변경 파일, 남은 이슈, 다음 액션만. | 대기 |

## 실행 순서

1. FE-1 (frontend-dev). 파일 쓰기는 이 단계 하나만 먼저 끝낸다. 콘텐츠 초안은 메인 세션에서 미리 써도 되지만 파일 반영은 FE-1 뒤에 한다.
2. FE-2 → FE-3 (frontend-dev 순차). 동시 진행: C-1 (문장 작성·검수), C-3 (SEO·FAQ·가이드). Q-2 작성 시작(새 파일, 병렬 가능).
3. FE-4 → FE-5 (frontend-dev 순차). FE-5 뒤 PM이 `pnpm typecheck`을 한 번 실행한다. 실패하면 해당 담당에게 되돌린다. 동시 진행: C-1 샘플 검수 승인 뒤 C-2 시작. Q-3 작성 시작(FE-2 뒤).
4. FE-6 (frontend-dev, C-1·C-2 최종 문구 확인). C-4 (C-1·C-2·C-3 완료 뒤). FE-7 (C-3 완료 뒤, frontend 체인의 마지막).
5. Q-1 (FE-5 뒤 시작 가능. 실행은 6단계). 
6. PM이 최종 `pnpm typecheck`을 한 번 실행한다(FE-7 뒤). 실패하면 해당 담당에게 되돌린다.
7. Q-4 실행(`pnpm e2e`, `pnpm e2e:mobile`). 실패는 담당 되돌림 후 재실행.
8. V-1 검증(`pnpm lint`, `pnpm build`, 보안·고지·SEO 확인) 후 사용자에게 보고.

## 동시 실행 가능

- FE 체인(FE-1 → 2 → 3 → 4 → 5 → 6 → 7)과 콘텐츠 C-1, C-3는 FE-1 뒤에 동시에 돌릴 수 있다. 파일이 겹치지 않는다(문장 상수·SEO·FAQ·가이드 파일은 FE 체인이 건드리지 않음).
- C-2는 C-1 샘플 승인 뒤에 FE 체인과 동시에 돌릴 수 있다(`tarot-story.constant.ts`만 수정).
- Q-2(작성)는 FE-1 뒤 언제든 가능하다(새 파일). Q-3(작성)은 FE-2 뒤 가능하다. 두 테스트 작성은 FE-4·FE-5와 파일이 겹치지 않는다.
- C-4는 C-1·C-2·C-3 뒤에만 한다. Q-1은 FE-5 뒤에 시작한다.
- 동시에 돌리면 안 되는 것: FE-2와 FE-3(같은 기능 안 import 연쇄), FE-4와 FE-5를 여러 frontend-dev로 나누는 것(한 체인으로 처리). Q-4는 모든 실행 담당이 끝난 뒤에 한다.
- 실행 순서가 필요한 것: FE-1이 모든 것의 선행. FE-7은 C-3 뒤. V-1은 Q-4 뒤.

## 충돌 위험

1. `src/features/tarot/types/tarot.type.ts`, `tarot-question.constant.ts`: 분야 타입·상수 교체로 `three-card/components/root.component.tsx`, 옛 `three-card/components/topic-chips.component.tsx`, `e2e/tarot-copy.spec.ts`가 한꺼번에 컴파일 오류가 난다. FE-1만 따로 머지하거나 typecheck하지 않는다. FE-1~FE-5를 한 브랜치에서 이어서 끝낸 뒤 typecheck한다.
2. `tarot-topic-reading.constant.ts`, `tarot-story.constant.ts`: FE-1(뼈대)과 C-1·C-2(문장)가 같은 파일을 고친다. FE-1을 먼저 끝내고, 이후 콘텐츠 담당은 문장 칸만 고친다. 뼈대 구조(키, `satisfies`)는 바꾸지 않는다.
3. `shared/components/card-reading.component.tsx`, `question-input.component.tsx`, `topic-chips.component.tsx`: FE-3에서만 고친다. FE-4·FE-5에서 고쳐야 할 일이 생기면 FE-3으로 되돌린다(design 확정 계약).
4. `three-card/components/topic-chips.component.tsx` 삭제(FE-5)와 `shared/` 생성(FE-3): git 이동으로 처리한다. 두 작업 사이에 이 파일을 건드리는 작업이 없어야 한다.
5. `tarot-faq.constant.ts`, `tarot-seo.constant.ts`, 두 `guide.component.tsx`의 `GUIDE_PARAGRAPHS`: C-3만 고친다. FE 체인은 구조를 바꾸지 않는다.
6. `COMPLIANCE.md`, `src/app/privacy/page.tsx`, `THIRD_PARTY_NOTICES.md`: 다른 기능도 고치는 공용 문서다. 특히 `docs/fortune-v2/`(운세 v2) 작업 중이므로 같은 시기에 고치지 않는다. 개인정보처리방침 `EFFECTIVE_DATE`는 같은 날 다른 기능이 바꿨으면 한 번만 갱신한다. guard-files.js가 agent의 범위 밖 파일로 막을 수 있으므로 FE-6 실행 전에 PM이 허용 여부를 확인한다.
7. `src/constants/menu.constant.ts`: 모든 기능이 같이 쓰는 파일이다. 운세·점심 등 다른 기능 작업과 같은 시기에 고치지 않는다. 타로에서는 FE-7만 description 두 줄을 고친다.
8. `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`: Q-1만 고친다. FE-5 뒤 실행 전까지 깨지는 테스트가 있는 것은 정상이다.
9. `docs/tarot/copy-log.md`: C-4만 새 절을 추가한다. 기존 행은 고치지 않는다.
10. `src/features/tarot/three-card/components/root.component.tsx`(FE-5), `daily/components/root.component.tsx`(FE-4): 서로 파일은 다르지만 둘 다 `TAROT_TOPIC_*` 상수와 shared 칩을 쓴다. 상수는 FE-1에서 확정하므로 두 root가 상수를 고쳐야 하는 상황이 생기면 FE-1로 되돌린다.
11. `tarot-notice.constant.ts`: FE-1만 고친다. C 담당이 고지 문구를 바꾸려면 PM 승인 뒤 FE-1 담당이 반영한다.
12. 수정하지 않는 파일(확인용): `src/app/tarot/*/page.tsx`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `use-daily-reading.hook.ts`, `use-three-card-reading.hook.ts`, `tarot-daily-storage.service.ts`, 카드 상수 5개, `src/app/terms/page.tsx`.

## design.md 보완 메모 (PM이 architect에게 확인 요청)

design.md에 없는 항목이라 티켓에서 아래처럼 처리했다. design.md 반영 여부는 PM이 정한다.

- M-1 (S2 분야 표시줄 접두사): `TAROT_TOPIC_LINE_PREFIX = '분야:'`를 `tarot-topic.constant.ts`에 둔다. design "상수" 표에 없는 항목이다. 처리: FE-1에서 추가, FE-5에서 사용.
- M-2 (S3 분야 문장 교체 모션): design 계약의 props(`topicSentence`)는 바꾸지 않는다. 구현은 `card-reading.component.tsx` 안에서 이전 값(ref)과 비교해 바뀔 때만 150ms 투명도 전환을 준다. 첫 렌더와 null 전환에는 효과가 없다. 3장은 revealed 상태에서 칩을 바꿀 수 없으므로 효과가 발생하지 않는다. 처리: FE-3. design 12.2에 이 구현 방식을 한 줄 적는 것이 좋다.
- M-3 (S3 동작 줄이기): framer-motion `MotionConfig reducedMotion="user"`는 투명도를 줄이지 않으므로 `useReducedMotion()`으로 직접 처리한다. design에 없는 내용이다. 처리: FE-3.
- M-4 (1장 분야 변경 aria-live 문구 2개): `TAROT_TOPIC_APPLIED_NOTICE`, `TAROT_TOPIC_CLEARED_NOTICE`를 `tarot-topic.constant.ts`에 둔다. ui-ux에서 승인된 문구다. 처리: FE-1 추가, FE-4 사용.
- M-5 (메뉴 설명 문구의 담당): design은 C-3에 "메뉴 설명 문구"를 넣고 FE-7에도 적용을 넣었다. 처리: C-3은 문구를 확정·제공, FE-7은 파일 적용만 한다.
- M-6 (S4 흐름 이야기 공개 시점): 빼는 안으로 확정. design 12.3의 "뒤집기 중 보일지, FLIP_DONE 뒤 보일지는 ui-ux가 정한다"는 항목이 이 결정으로 닫힌다.

## 콘텐츠 작성·검수 방식

- 작성 담당: frontend-dev (사용자 결정 2026-11-09, PM은 직접 쓰지 않음). 문장 상수 파일(`tarot-topic-reading`, `tarot-story`), SEO·FAQ·가이드 문구(C-3)를 쓴다(CLAUDE.md "메인 AI 작성 + 사용자 검수").
- 검수 담당: 사용자. 샘플(C-1은 그룹 1개 8문장, C-2는 love 세트) 먼저 검수하고, 승인 뒤 나머지를 작성한다. 검수 기록은 C-4의 copy-log 입력으로 남긴다.
- 기계 검사: Q-3(`e2e/tarot-copy.spec.ts`)이 금지 표현, 중복, 어미, 자리표시자, 조합 null 여부를 모두 본다. 검사 실패는 콘텐츠 담당에게 되돌린다.
- 작성 금지: 외부 해석 문장 참조·복사, AI 호출, 투자 종목·매수 시점·복권·도박·로또 예시.
- 법적 고지 문구는 승인된 문구를 그대로 쓴다. 법률 확인은 받지 않는다(plan 결정 11, 위험 수용).

## 기존 e2e 수정 요약 (Q-1 상세)

| 기존 위치 (design 기준) | 기존 검사 | v2 처리 |
|---|---|---|
| `e2e/tarot.spec.ts` 662행 | 칩이 질문 예시를 채우고 분야 무관 안내가 보임 | 삭제. v2 AC-4·AC-5로 대체 |
| `e2e/tarot.spec.ts` 688행 | 질문 예시에 투자·복권·도박·로또 질문 없음 | 삭제. v2 AC-12(예시 없음)로 대체. 금지 검사는 Q-3으로 이동 |
| `e2e/tarot.spec.ts` 714행 | 재뽑기 안내 문구 | revealed에서 `TAROT_REDRAW_RESULT_NOTICE`로 갱신(v2 AC-15). idle `TAROT_REDRAW_NOTICE` 유지 |
| `e2e/tarot.spec.ts` 1638행 | 3장 분야 선택 → 뽑기 → 결과 → 다시 뽑기 | 예시 전제 제거, 분야 표시줄·흐름 이야기 확인 추가 |
| `e2e/tarot-copy.spec.ts` 456~468행 | `TAROT_QUESTION_TOPICS`, `examples` 검사 | 삭제. Q-3의 새 상수 검사로 대체 |

## 완료 요약

- 티켓 수: DB 0, BE 0, FE 7, 콘텐츠 4, QA 4, 검증 1.
- 확정되지 않은 항목: 없음. 보완 메모 M-1~M-6은 구현에 필요한 세부 결정이며 PM 확인이 필요하다.
- 열린 확인 항목: FE-6 파일 쓰기 권한(guard-files 범위), 공용 문서와 `docs/fortune-v2/` 작업의 시간 조율.
