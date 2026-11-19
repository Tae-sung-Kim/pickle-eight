# dream 개발 티켓

입력: `docs/dream/design.md`, `docs/dream/ui-ux-design.md` (둘 다 2026-11-19 승인), `docs/dream/plan.md` (AC 기준), `docs/dream/status.md`
작성: dev-lead, 2026-11-19
상태: 개발 준비 완료. 9장의 사용자 결정이 풀리기 전에는 해당 티켓을 시작하지 않는다.

## 0. 승인 결정 반영 확인

| 항목 | 결정 | 티켓 반영 |
|---|---|---|
| Q1 메뉴 색 | A안. `--menu-where`를 `--menu-dream`으로 이름만 바꾼다(값 `#2a6672`, 염수) | T-06. `docs/conventions/design-system.md` 33행에 "꿈 해몽 | `menu-dream`"이 이미 있음(확인함) |
| Q2 허브 | 색인 장부형 | T-14 |
| Q3 인기·대표 소재 | 1차 노출 없음 | T-14 (노출 코드를 넣지 않는다) |
| Q4 위기 패널 모션 | 없음 | T-14 (`animate-in` 등 쓰지 않는다) |
| Q5 메뉴 아이콘 | `BookOpenText` | T-06 |
| Q6 완화 블록 위치 | 풀이 아래 | T-15 |
| D1 위기 표현 공용화 | `src/constants/crisis-term.constant.ts` + `src/lib/crisis-signal.ts`. 타로는 export 이름 유지 | T-01, T-02, T-03 |
| D2 금지 표현 목록 | 타로 전체 + 운세 중 꿈과 충돌하지 않는 항목 + 꿈 특유 표현. "죽음", "사고가 나", "사고를 당"은 뺌 | T-04(목록 작성), T-18(검사) |
| D3 fortune-v2 AC-9 | `src/app/sitemap.ts`를 검사 목록에서 뺀다 | T-20 (qa) |

확인 사항: `src/constants/theme.constant.ts`에는 `where` 키가 원래 없다(src 전체 검색으로 확인). 그래서 이 파일은 "이름 변경"이 아니라 `dream` 키 추가만 한다. `menu-where` 흔적은 `src/app/globals.css`의 79행과 109행뿐이다.

## 티켓

| ID | 담당 | 내용 | 선행 | 관련 파일 | 디자인 명세 참조 | 완료 조건 | 상태 |
|---|---|---|---|---|---|---|---|
| DB-0 | db-dev | 없음. DB, 테이블, 마이그레이션을 쓰지 않는다 | - | - | design 14, 15장 | 해당 없음 | 없음 |
| T-01 | backend-dev | 위기 표현 정규화·감지 함수 공용화. `src/lib/crisis-signal.ts` 신설: `normalizeCrisisText`(타로 `normalizeTarotQuestion`과 같은 정규식), `hasCrisisSignal(text, terms)`(부분 일치) | - | `src/lib/crisis-signal.ts` | design 5장, 18 F1, 20 D1 | typecheck 통과. 함수 2개만 export. 타로 정규화와 같은 입력에 같은 결과 | 완료 |
| T-02 | frontend-dev | 위기 목록 공용화와 타로 연결. `src/constants/crisis-term.constant.ts`에 `CRISIS_TERMS` 신설(타로 목록 이동). `tarot-safety.constant.ts`는 `TAROT_CRISIS_TERMS`로 다시 export. `tarot-safety.util.ts`의 `normalizeTarotQuestion`, `hasTarotCrisisSignal`은 T-01 함수를 호출하게 바꾼다. `TAROT_EXPERT_TERMS`와 `hasTarotExpertTopic`은 그대로 둔다 | T-01 | `src/constants/crisis-term.constant.ts`, `src/features/tarot/constants/tarot-safety.constant.ts`, `src/features/tarot/utils/tarot-safety.util.ts` | design 18 F1, 19장, 20 D1 | 타로 export 이름 유지. 위기 목록 원본이 한 곳뿐(grep). typecheck 통과 | 완료 |
| T-03 | qa | 타로 회귀 확인. T-02 후 `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`, `e2e/tarot-v2.spec.ts`를 데스크톱에서 실행. 테스트 코드는 고치지 않는다. 실패하면 T-02로 되돌림 | T-02 | `e2e/tarot*.spec.ts`(실행만) | design 10.3 | 세 파일 실패 0건 | 완료 |
| T-04 | frontend-dev | 타입과 상수 뼈대. `features/dream/types/dream.type.ts`(design 3.1 그대로). `constants/`: `dream-category`(7개, 순서 고정), `dream-route`, `dream-search`, `dream-notice`(plan 승인 문구 원문, 나머지는 ui 문구 표 초안), `dream-faq`(허브 3개 초안), `dream-seo`, `dream-copy-rule`(검사 전용. 타로 목록은 문자열로 복사하고 타로 파일을 import하지 않는다). `constants/topics/*.constant.ts` 7개는 빈 배열(`[] as const satisfies readonly DreamTopicType[]`). `dream-topics.constant.ts`에 `DREAM_TOPICS`, `DREAM_TOPIC_COUNT = 120` | - | `src/features/dream/types/`, `src/features/dream/constants/` | design 2장, 3.1~3.4, 4.2, 5장, 6.1, 7.1, 8장, 13장. ui 문구 표(439~497행) | typecheck 통과. 상수 이름과 필드가 design 3.1과 같다. 금지 목록에 타로 목록 전체 포함 | 완료 |
| T-05 | frontend-dev | 유틸 3개. `utils/dream-topic.util.ts`(서버 전용: `getDreamTopicBySlug`(Map), `getDreamRelatedTopics`, `buildDreamSearchItems`, `buildDreamHubGroups`, `getDreamTopicPath`, `getDreamTopicPaths`). `utils/dream-search.util.ts`(`normalizeDreamSearchText`, `stripDreamQuerySuffix`, `filterDreamSearchItems`. 클라이언트에서도 import 가능). `utils/dream-seo.util.ts`(상세 title, description, keywords 최대 6개, ogImage, 상세 JSON-LD 입력) | T-04 | `src/features/dream/utils/*.util.ts` | design 4.2, 6.3, 8장 | 시그니처가 design과 같다. 검색어로 `RegExp`를 만들지 않는다(grep). typecheck 통과 | 완료 |
| T-06 | frontend-dev | 메뉴 등록. `menu.constant.ts`: `MENU_GROUP_NAME_ENUM.DREAM = 'dream'` 추가, 운세 그룹 다음·점심 그룹 앞에 그룹 1개(라벨 "꿈 해몽", href `/dream`, 하위 1개 "꿈 소재 찾기", icon `BookOpenText`, colorClass `text-menu-dream`, comingSoon 없음). `menu.type.ts`: `MenuSectionKeyType`에 `'dream'`. `theme.constant.ts`: 네 맵에 `dream` 추가(`SECTION_ICONS` BookOpenText, `SECTION_ICON_COLOR` `text-menu-dream`, `SECTION_BADGE_COLOR` `bg-menu-dream/10 text-menu-dream border-menu-dream/20`, `BACKGROUND_COLORS` `bg-background`). `menu-icon.constant.ts`: `BookOpenText` import와 항목 추가. `globals.css`: 79행 `--menu-where` → `--menu-dream`(값과 `/* 염수 */` 주석 유지), 109행 `--color-menu-where` → `--color-menu-dream` | - | `src/constants/menu.constant.ts`, `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts`, `src/app/globals.css` | design 9장. ui 색상(28~70행), 메뉴와 홈(338~351행) | `menu-where` 문자열이 `src/`에 0건. 점심 항목의 `text-orange-600`은 건드리지 않는다(범위 밖). 헤더 PC·모바일과 홈에 "꿈 해몽" 노출(T-19, T-21) | 완료 |
| T-07 | frontend-dev | 사이트맵. `src/app/sitemap.ts`에 `getDreamTopicPaths()` 120개를 더한다. 중복은 Set으로 제거. 우선순위와 주기는 기존 "그 밖" 규칙. `/dream`은 메뉴 그룹 href로 자동 포함되므로 따로 넣지 않는다 | T-05, T-06 | `src/app/sitemap.ts` | design 8장 마지막 줄, 9장. plan AC-37 | 빌드 후 `/sitemap.xml`에 `/dream`과 상세 120개 포함. T-20과 같이 처리 | 완료 |
| T-08 | frontend-dev | 문구 C1. 샘플 10개를 카테고리 파일에 쓰고 `docs/dream/copy-log.md`를 만든다(묶음 `DR-S`). 분포: 동물 2(띠 동물 1 포함), 사람·관계 1, 신체 1, 자연·날씨 1, 행동·상황 2(추락 또는 쫓기는 꿈 1 포함, `sensitive`), 사물·장소·재물 1, 죽음·사고 2(죽음 1 `death`, 사고 1 `sensitive`). slug는 제안만 한다 | T-04 (T-18 1차 검사가 있으면 같이 쓴다) | `src/features/dream/constants/topics/*.constant.ts`(샘플 항목만), `docs/dream/copy-log.md` | design 3.2 작성 순서 1, 3.3, 3.4, 11장. plan 풀이 규칙 1~10(117~141행) | 샘플 10개 타입 통과. summary 20~80자, folk 3~5문장, reflection 2~3문장, 분량 300자 이상. copy-log 샘플 10행. 검수 요청에 샘플 전문을 붙인다 | 완료 |
| T-09 | 사용자 | 샘플 10개 검수. 톤 수정 지시, slug 확정(공개 후 바꾸면 301 필요), 소재 이름 확정(허브 placeholder와 description 예시에 쓰임) | T-08 | `docs/dream/copy-log.md` 검수 칸 | plan 풀이 규칙 9 | 승인 또는 수정 지시 기록. 수정이면 T-08 재작업 | 완료(사용자 위임, PM 확인) |
| T-10a | frontend-dev | 묶음 DR-1 동물 나머지. 24개 중 샘플 제외. 12지 11개(용 제외)에 `isTtiAnimal: true` | T-09 | `topics/animal.constant.ts`, `docs/dream/copy-log.md`(행 추가) | design 3.2, 3.4, 11장, 10.1 | 파일 타입 통과. 이 묶음 항목의 항목별 데이터 검사 통과(T-18). copy-log 행 추가 | 완료 |
| T-10b | frontend-dev | 묶음 DR-2 사람·관계 14(샘플 제외) | T-09 | `topics/people.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-10c | frontend-dev | 묶음 DR-3 신체 12(샘플 제외) | T-09 | `topics/body.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-10d | frontend-dev | 묶음 DR-4 자연·날씨 14(샘플 제외) | T-09 | `topics/nature.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-10e | frontend-dev | 묶음 DR-5 행동·상황 24(샘플 제외). 추락, 쫓김 등 `sensitive` 포함 | T-09 | `topics/action.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-10f | frontend-dev | 묶음 DR-6 사물·장소·재물 24(샘플 제외). 투자 종목, 매수, 복권 소재 금지 | T-09 | `topics/object.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-10g | frontend-dev | 묶음 DR-7 죽음·사고 8(샘플 제외). 모두 `death` 또는 `sensitive`, `soothing` 1~3문장 필수. 죽음 보충 문장 포함 | T-09 | `topics/death.constant.ts`, copy-log | 위와 같음 | 위와 같음 | 완료 |
| T-11 | frontend-dev | 문구 C3. 완성 후 대표 문장 웹 검색 점검. 묶음당 20문장 이상. 기록: 검색 문장, 날짜, 엔진, 결과(일치 없음 / 수정함), 수정 후 문장. 일치가 나오면 해당 문장을 고치고 재검사 기록 | T-10a~g 전부 | `docs/dream/copy-log.md`, 필요한 topics 파일 | design 11장 5항. plan 풀이 규칙 9. AC-34 | 묶음별 20문장 이상. 일치 항목은 "수정함" 기록 | 완료 |
| T-12 | frontend-dev | 고지·FAQ·SEO 문구 확정(묶음 DR-N). `dream-notice`, `dream-faq`, `dream-seo` 초안을 승인 문구로 확정. 웹 검색 10문장 기록 | T-04, T-09, 사용자 문구 승인(결정 3) | `dream-notice.constant.ts`, `dream-faq.constant.ts`, `dream-seo.constant.ts`, `docs/dream/copy-log.md` | ui 문구 표(439~497행). design 7.1(378~398행), 8장(406~425행). plan 고지(265~273행) | 승인 기록. FAQ 답에 "예측", "보장"이 없다(면책 상수 문장 제외). 허브 title에 "꿈 해몽", 상세 title에 소재 이름 | 완료 |
| T-13 | frontend-dev | 공용 컴포넌트 6개. `features/dream/shared/components/`: `disclaimer-notice`, `basis-notice`, `bottom-notice`, `crisis-phones`(공용 `CRISIS_PHONES` 다섯 곳 전체, 공용 `CrisisPhoneComponent` 사용), `faq`, `breadcrumb`. 모두 서버 컴포넌트 | T-02, T-04, T-05, T-06 | `src/features/dream/shared/components/*.component.tsx` | design 2장(83~89행), 6.2, 16, 16.1. ui 공통 머리(114~124행), 상담 상자(315~323행), 허브 하단(253~260행), 접근성(404~434행) | h1 없음. 번호는 공용 상수에서만 읽는다. 토큰 색만 쓴다. design-guard 통과 | 완료 |
| T-14 | frontend-dev | 허브. `src/app/dream/page.tsx`(`DreamHubPage`, metadata는 `buildMetadata` 펼침 + `category: '엔터테인먼트, 꿈 해몽'` 덮어쓰기 + keywords + ogImage alt, JSON-LD BreadcrumbList). `hub/components/` 8개: `root`(`'use client'`, 검색어 `useState` 하나), `search-input`, `crisis-notice`(`role="status"` 항상 존재), `result-status`(`aria-live`), `category-list`(`prefetch={false}`), `empty`("전체 목록 보기"는 검색어를 비우고 `ref` prop으로 포커스), `noscript-notice`, `detail-notice` | T-13, T-05, T-02, T-01, T-06 | `src/app/dream/page.tsx`, `src/features/dream/hub/components/*.component.tsx` | design 4장, 5장, 6.1, 6.2(허브 트리), 8장, 16. ui 허브(126~191행), 검색(193~205행), 빈 상태(207~222행), 위기(224~245행), noscript(247~251행), 하단(253~260행), 상태 표(353~381행), 접근성(404~434행) | typecheck 통과. 서버 HTML에 전체 목록. `useSearchParams`, `router`, `history`, `<form>`, `name` 속성 없음(grep). 위기 안내는 포커스를 옮기지 않는다. 위기 번호는 세 곳(`showInCrisisPanel`) | 완료 |
| T-15 | frontend-dev | 상세. `src/app/dream/[slug]/page.tsx`(`generateStaticParams`, `generateMetadata`, `notFound()`, `params`는 Promise), `not-found.tsx`(h1, 꿈 소재 찾기 주요 버튼, 홈으로 보조 버튼). `topic/components/` 6개: `root`(조립), `reading`(한 줄 요약, 민간 풀이, 생각해 볼 점), `soothing`(민감 완화 블록, 반복 꿈 안내, death면 죽음 보충 첫 문단), `tti-link`(`isTtiAnimal`만), `related`(data 순서, 2~4개), `back-link`. JSON-LD는 BreadcrumbList와 FAQPage(`topic.faq`) | T-13, T-05, T-06 | `src/app/dream/[slug]/*`, `src/features/dream/topic/components/*.component.tsx` | design 6.1, 6.2(상세 트리), 6.3, 8장. ui 상세(262~304행), 변형 표(306~313행), 상담 상자(315~323행), 404(325~336행), 상태 표(353~381행) | h1 하나. 민감 소재에만 완화 블록, 띠 동물에만 운세 링크, 일반 소재에 완화 블록 없음. 없는 slug 응답 404 확인(T-19). 상태 200이면 고치지 말고 PM 보고(design 6.1) | 완료 |
| T-16 | frontend-dev | 개인정보처리방침과 이용약관에 꿈 해몽 항목 추가. 먼저 기존 문구를 읽고 같은 형식으로 넣는다. 처리방침: 입력값 없음, 검색어를 서버와 브라우저에 저장하지 않음. 기존 Vercel 분석 설명은 바꾸지 않는다(design 1장 20번). 이용약관: 오락·참고용, 제휴 없음, 상담 안내, 저장 없음, 로또 연결 없음 | 사용자 문구 승인(결정 4). 점심과 충돌 순서(결정 5) | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | plan 법적 절(254~286행), AC-31, AC-32. design 18 F6(601행) | 두 파일에 꿈 항목 존재(T-18). 문구 승인 기록 | 완료 |
| T-17 | PM(메인 세션) | 법적 문서 변경 필요 여부 확인 결과 반영. 결과: 처리방침, 이용약관, `COMPLIANCE.md` 11장 세 곳 모두 변경 필요(plan AC-31, AC-32). `COMPLIANCE.md` 11장에 꿈 항목 추가(오락·참고용, 제휴 없음, 상담 안내, 저장 없음, 로또 연결 없음). `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `next.config.ts`는 변경 없음(새 환경변수, API, 테이블, 라이브러리, 리다이렉트가 없다) | 사용자 문구 승인(결정 4) | `COMPLIANCE.md`(루트. agent 범위 밖) | plan 법적 절(254~286행). COMPLIANCE 11장 형식 | `COMPLIANCE.md` 11장에 꿈 항목 존재(T-18). 상담 번호 재확인 항목을 출시 전 목록에 적음 | 완료 |
| T-18 | qa | `e2e/dream-copy.spec.ts`. 1차(T-04 후, 묶음 작업에 쓴다): 데이터 검사 중 항목 단위 검사(형식, 별칭, 분량, FAQ, related, 민감, 금지·로또·수치·위기 표현, 죽음 보충). 전체 합계(120), 카테고리별 1개 이상, 독자성 근사, 별칭 중복은 전체 묶음이 끝난 뒤에만 통과한다. 2차(묶음 전부 끝난 뒤): 문서 검사(처리방침, 이용약관, COMPLIANCE, copy-log 행 수와 slug 일치, 웹 검색 기록 수), HTML 금지 표현 검사 | 1차: T-04. 2차: T-11, T-16, T-17, T-14, T-15 | `e2e/dream-copy.spec.ts` | design 10.1(447~473행), 7.1, 7.2. plan AC-10, 11, 13, 14, 17, 18, 23, 25, 26, 31~34, 42, 43 | 데스크톱 프로젝트에서만 데이터 검사(`testInfo.project.name`). 2차 전체 통과 | 완료 |
| T-19 | qa | `e2e/dream.spec.ts`(데스크톱·모바일). AC-1~9, 12~16, 20~30, 35~41, 44 검사. 허브 검색, 별칭, 빈 상태, 네트워크 요청 0건, URL 불변, JS 끈 상태 서버 HTML, 404 상태, 로컬 저장소 불변, 쿠키 거절과 광고 차단 상태, 메뉴·홈·sitemap·SEO·JSON-LD, h1 개수 | T-14, T-15, T-06, T-07 | `e2e/dream.spec.ts` | design 10.2(475~485행). ui 전체. plan AC-1~44 | 두 프로젝트에서 통과 | 완료 |
| T-20 | qa | D3. `e2e/fortune-v2.spec.ts` AC-9 "메타·sitemap·JSON-LD 소스 파일은 HEAD와 diff가 없다"의 `files` 배열(636~643행)에서 `src/app/sitemap.ts`를 뺀다. 바로 위 주석(582행)을 맞춘다. 운세 sitemap 포함 테스트(619~634행)는 그대로 둔다 | T-07 (같은 날 함께 처리) | `e2e/fortune-v2.spec.ts` | design 10.3, 20 D3 | 수정 후 해당 테스트가 sitemap.ts 변경과 무관하게 통과 | 완료 |
| T-21 | qa | 최종 회귀와 보고서. 데스크톱: dream 2개, 타로 3개, fortune-v2 AC-9와 sitemap 관련 fortune 테스트. 모바일: dream 2개. `docs/dream/qa-report.md`에 AC별 결과와 실패 담당 기록 | T-03, T-11, T-18, T-19, T-20 | `docs/dream/qa-report.md`, 실행만 | CLAUDE.md 흐름 6단계. design 10.3 | AC-1~44 전부 결과 기록. 실패는 담당에게 되돌림 | 완료 |
| T-22 | PM(메인 세션) | 검증. `pnpm typecheck`, `pnpm lint`. 권장: `pnpm build`(120개 정적 생성, 404). 헤더·홈 노출, 금지 표현 최종, 로또 연결 0, sitemap 121개, 디자인 가드 기록. 결과를 `docs/dream/status.md`에 기록 | T-21 | - | CLAUDE.md 흐름 7단계 | 두 명령 통과. 실패는 해당 담당에게 되돌림 | 완료 |

## 티켓 상세

공통: 모든 frontend-dev 티켓은 `docs/conventions/code-style.md`(전체), `design-system.md`(전체), `seo.md`(전체), `tech-stack.md`를 먼저 읽는다. 문구 작성 티켓(T-08, T-10a~g, T-11, T-12)은 `docs/dream/plan.md` 117~141행을 함께 읽고, 외부 풀이 문장을 보지 않는다.

- T-01 backend-dev. 읽을 절: design 5장(271~296행), 18 F1(596행). 수정 허용: `src/lib/crisis-signal.ts` 하나. 병렬: T-04, T-06, T-16과 동시 가능.
- T-02 frontend-dev. 읽을 절: design 18 F1, 19장(617~625행), 20 D1(631행). 수정 허용: 위 세 파일. 병렬: T-04, T-06과 동시 가능(T-01 완료 후).
- T-03 qa. 읽을 절: design 10.3(487~491행). 실행만 한다. 병렬: T-05, T-08과 동시 가능.
- T-04 frontend-dev. 읽을 절: design 2장(51~108행), 3장(123~238행), 4.2(248~268행), 5장, 6.1(299~311행), 7.1(378~398행), 8장(406~425행), 13장(527~538행). ui 문구 표(439~497행). 수정 허용: `src/features/dream/types/`, `src/features/dream/constants/`(빈 topics 파일 포함). 병렬: T-02, T-06과 동시 가능.
- T-05 frontend-dev. 읽을 절: design 4.2, 6.3(365~374행), 8장(414~421행). 수정 허용: `src/features/dream/utils/`. 병렬: T-02, T-06, T-08, T-18과 동시 가능.
- T-06 frontend-dev. 읽을 절: design 9장(427~441행). ui 색상(28~70행), 메뉴와 홈(338~351행), 디자인 시스템 변경(501~505행). 수정 허용: 위 5개 파일. 병렬: T-04, T-05, T-16과 동시 가능. 점심 충돌 항목 참조(5장).
- T-07 frontend-dev. 읽을 절: design 8장 마지막 줄, 9장 마지막 줄(439~441행). 수정 허용: `src/app/sitemap.ts`. 병렬: T-08과 동시 가능. 단 T-20과 같은 날 처리.
- T-08 frontend-dev. 읽을 절: design 3.2(204~216행), 3.3(218~223행), 3.4(225~238행), 11장(493~508행). plan 117~141행. 수정 허용: 카테고리 파일 7개(샘플 항목만), `docs/dream/copy-log.md` 생성. 병렬: T-05, T-18 1차와 동시 가능.
- T-09 사용자. 확인 항목은 9장 결정 2.
- T-10a~g frontend-dev, 묶음별 하나씩. 읽을 절: design 3.2, 3.4, 11장. 수정 허용: 자기 카테고리 파일 하나와 copy-log의 자기 묶음 행. 병렬: 7개 묶음 모두 서로 다른 파일이라 동시 가능. copy-log만 직렬(5장).
- T-11 frontend-dev. 읽을 절: plan 풀이 규칙 9(140행), design 11장 5항(500~506행). 수정 허용: copy-log, 필요한 topics 파일. 병렬: 없음(T-10 전부 끝난 뒤).
- T-12 frontend-dev. 읽을 절: ui 문구 표(439~497행), design 7.1, 8장, 11장 4항(묶음 DR-N). 수정 허용: 고지·FAQ·SEO 상수 3개, copy-log. 병렬: T-10과 동시 가능하되 copy-log는 직렬.
- T-13 frontend-dev. 읽을 절: design 2장(83~89행), 6.2, 16장, 16.1. ui 공통 머리(114~124행), 상담 상자(315~323행), 허브 하단(253~260행), 접근성(404~434행). 수정 허용: `src/features/dream/shared/components/`. 병렬: T-10과 동시 가능.
- T-14 frontend-dev. 읽을 절: design 4장(240~284행), 5장(285~296행), 6.1, 6.2(허브 트리 315~335행), 16장. ui 허브 전체(126~251행), 하단(253~260행), 상태 표(353~381행), 접근성(404~434행). 수정 허용: `src/app/dream/page.tsx`, `src/features/dream/hub/components/`. 병렬: T-15와 동시 가능. T-10과도 동시 가능(코드는 데이터가 없어도 빌드된다).
- T-15 frontend-dev. 읽을 절: design 6.1(299~311행), 6.2(상세 트리 337~356행), 6.3, 8장. ui 상세 전체(262~313행), 상담 상자(315~323행), 404(325~336행), 상태 표(353~381행). 수정 허용: `src/app/dream/[slug]/`, `src/features/dream/topic/components/`. 병렬: T-14와 동시 가능.
- T-16 frontend-dev. 읽을 절: plan 254~286행. 수정 허용: 처리방침, 이용약관 두 파일. 병렬: 다른 티켓과 동시 가능. 단 점심 작업과는 직렬.
- T-17 PM. 수정 허용: `COMPLIANCE.md`(루트). 병렬: T-16과 동시 가능.
- T-18 qa. 읽을 절: design 10.1(447~473행), 7.1, 7.2(400~404행). plan AC-10~AC-34, AC-42, AC-43. 수정 허용: `e2e/dream-copy.spec.ts`. 병렬: 묶음 작업과 동시 가능.
- T-19 qa. 읽을 절: design 10.2(475~485행), 4장, 6장. ui 전체. 수정 허용: `e2e/dream.spec.ts`. 병렬: T-18과 동시 가능.
- T-20 qa. 읽을 절: design 10.3(487~491행), 20장 D3. 수정 허용: `e2e/fortune-v2.spec.ts`(AC-9 목록만).
- T-21 qa. 수정 허용: `docs/dream/qa-report.md`, e2e 실행.
- T-22 PM. 수정 허용: `docs/dream/status.md`.

## 실행 순서

0단계 (사용자 결정, 코드 없음). 9장 결정 1, 5를 먼저 받는다. `git status`로 작업 트리를 확인한다(where 삭제가 아직 스테이징이면 커밋 여부를 사용자에게 확인). 점심 작업(`docs/lunch/`)이 이 기능의 메뉴 파일을 건드리지 않는 상태인지 확인한다.

1단계 (병렬): T-01(backend-dev), T-04(frontend-dev), T-06(frontend-dev), T-16(frontend-dev, 문구 승인 후).

2단계 (병렬): T-02(T-01 완료 후), T-05(T-04 후), T-08(T-04 후), T-18 1차(T-04 후). T-17은 결정 4 이후 아무 때나 가능.

3단계 (병렬): T-03(T-02 후), T-07(T-05, T-06 후), T-13(T-02, T-04, T-05, T-06 후), T-20(T-07과 같은 날). 그리고 사용자 샘플 검수 T-09.

4단계 (병렬): T-10a~g(T-09 후, 최대 4개씩 나눠 실행 권장), T-12(T-09와 결정 3 후, copy-log는 직렬), T-14와 T-15(T-13 후).

5단계: T-11(T-10 전부 후), T-17 반영(결정 4 후, 이미 했다면 생략).

6단계: T-18 2차, T-19 최종 실행, T-21 최종 회귀, T-22 검증.

## 동시 실행 가능

- 1단계 4개 전부, 2단계 3~4개, 3단계 4개 안팎은 파일이 겹치지 않는다.
- T-10a~g 7개는 파일이 서로 다르므로 동시 가능. 다만 copy-log.md 쓰기는 한 번에 한 담당만 한다. 동시에 끝나면 PM이 행 수를 확인한다.
- T-14와 T-15는 `shared/components/`를 쓰지 않으므로 동시 가능. 둘 다 T-13 뒤에 시작한다.
- T-14, T-15는 T-10과 동시 가능(코드 작업이라 데이터가 필요 없다). 최종 HTML 검사만 T-10 뒤에 한다.
- 순서가 필요한 것: T-01 → T-02 → T-03. T-04 → T-05 → T-07. T-04 → T-08 → T-09 → T-10 → T-11. T-13 → T-14, T-15. T-07 → T-20. 모든 것 → T-21 → T-22.

## 충돌 위험

### 점심(lunch) 작업과의 충돌 (파일별)

| 파일 | 이 기능 | 점심 쪽 변경 | 위험 | 처리 |
|---|---|---|---|---|
| `src/constants/menu.constant.ts` | 꿈 그룹 추가(운세 다음, 점심 앞) | 점심 그룹 134~148행 수정(comingSoon 해제, colorClass) | 높음. 인접 줄 | 꿈을 먼저 커밋하고 점심이 그 위에 rebase |
| `src/app/sitemap.ts` | 상세 120개 추가 | 점심이 고치면 sitemap 변경 | 중간. 점심이 고치면 fortune-v2 AC-9도 깨짐 | 점심은 sitemap을 고치지 않도록 확인하고, 고치면 T-20 목록을 다시 본다 |
| `src/types/menu.type.ts`, `src/constants/theme.constant.ts`, `src/constants/menu-icon.constant.ts` | 같은 Record 맵에 dream 키 추가 | 점심 아이콘이 추가되면 같은 줄 | 중간 | 꿈 먼저 커밋 |
| `src/app/globals.css` | 79, 109행 | 점심 메뉴 색 정리(Q15) 시 같은 블록 | 낮음~중간 | 꿈 먼저 커밋 |
| `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `COMPLIANCE.md` 11장 | 꿈 항목 추가 | 점심 항목 추가(같은 위치) | 높음 | 한 번에 한 담당만 고친다. 꿈을 먼저 |
| `docs/conventions/design-system.md` | 이미 반영됨(33행) | 점심 Q15 결과가 바뀌면 같은 표 | 낮음 | 규칙 문서라 PM만 고친다 |

권장 순서: 이 기능의 T-06, T-07, T-16, T-17을 먼저 커밋하고, 점심은 그 뒤에 개발을 시작한다. 점심 계획은 아직 승인 대기이므로 실제 충돌은 점심 개발 시작 시점에 생긴다.

### 이 기능 안의 충돌

- `docs/dream/copy-log.md`: T-08, T-10a~g, T-11, T-12가 모두 쓴다. 행 추가는 직렬로 하고, 같은 시간에 두 담당이 쓰지 않는다.
- `src/features/dream/constants/topics/*.constant.ts`: T-08(샘플)과 T-10이 같은 파일을 쓴다. T-08이 끝나고 사용자 검수가 끝난 뒤 T-10을 시작한다. 묶음 사이에는 파일이 겹치지 않는다.
- `dream-notice.constant.ts`: T-04(초안) → T-12(확정). T-14, T-15가 이 값을 읽으므로 확정 전에도 빌드는 되지만 문구는 바뀐다.
- 샘플 slug: T-09에서 확정 전에는 상세 경로와 허브 링크 테스트를 고정하지 않는다.
- `dream-copy.spec.ts`의 전체 검사(120개, 독자성, 별칭 중복): 묶음이 다 끝나기 전에는 실패한다. 묶음 중에는 항목 단위 검사만 돌린다.
- `e2e/fortune-v2.spec.ts` AC-9: `git diff HEAD`를 쓰므로 `src/app/sitemap.ts`가 커밋되지 않은 상태면 실패한다. T-20을 T-07과 같이 처리한다.
- 404 상태(T-15, T-19): `src/app/loading.tsx`가 있어 스트리밍 응답으로 200이 나올 수 있다(design 6.1). 상태가 200이면 frontend-dev는 고치지 않고 PM에게 보고한다. 대안(`dynamicParams = false`, 루트 404 변경)은 공용 파일 변경이라 사용자 승인이 필요하다.
- 위기 감지 목록(T-02)을 바꾸면 타로 테스트 세 파일이 깨질 수 있다. T-03에서 확인한다.
- 허브 근처 `src/app/globals.css`는 두 줄뿐이다. 다른 메뉴 색 토큰은 건드리지 않는다.

## 가드 범위 점검 (`.claude/hooks/guard-files.js`)

| 파일 | 담당 | 가드 결과 | 조치 |
|---|---|---|---|
| `src/lib/crisis-signal.ts` | frontend-dev였다면 | 차단. frontend-dev 범위에 `src/lib/`가 없다 | 별도 표시. T-01을 backend-dev에 배정(backend-dev 범위에 `src/lib/` 포함) |
| `COMPLIANCE.md`(루트) | 모든 agent | 차단. 어느 agent 범위에도 루트 문서가 없다 | 별도 표시. T-17은 PM이 직접 편집 |
| `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `next.config.ts` | - | agent 범위 밖 | 이 기능에서 변경 없음. 필요가 생기면 PM |
| `docs/conventions/design-system.md` | - | 차단(규칙 문서) | 이미 PM이 반영함(33행). 추가 변경 없음 |
| `src/features/dream/**`, `src/features/tarot/**` | frontend-dev | 허용 | 없음 |
| `src/app/**` (dream, sitemap, globals.css, privacy, terms) | frontend-dev | 허용. 단 `src/app/api/`는 금지 | 없음 |
| `src/constants/**`, `src/types/**` | frontend-dev | 허용 | 없음 |
| `docs/dream/*.md` | frontend-dev, qa, dev-lead, PM | 허용 | 없음 |
| `e2e/**` | qa | 허용 | 없음 |

## 사용자가 정할 것

1. 문구 작성 담당. 권장: frontend-dev 에이전트를 묶음별로 호출(7개 묶음 병렬, 검수는 사용자). 대안: 메인 세션 AI(타로 선례). 메인 세션이 직접 쓰면 PM 직접 작성 금지 규칙과 맞지 않는다.
2. 샘플 10개 검수와 slug 확정(T-09). 이후 묶음 작성 시작의 조건.
3. 고지·FAQ·허브·SEO 초안 문구 승인(T-12, ui 문구 표의 "초안" 항목).
4. 처리방침, 이용약관, COMPLIANCE 11장의 꿈 항목 문구 승인(T-16, T-17).
5. 점심과의 순서. 권장: 꿈을 먼저 커밋하고 점심이 뒤에 rebase.
6. 카테고리별 수(동물 24, 사람 14, 신체 12, 자연 14, 행동 24, 사물 24, 죽음 8)를 그대로 쓸지. 검색량 확인(plan 열린 질문 22) 전까지 기본은 그대로다.
7. 404 대안이 필요해졌을 때 루트 404 변경 승인(발생 시에만).

## 문구 작성 절차 (copy-log 요약)

- 한 묶음 = 카테고리 파일 하나. 샘플 10개(`DR-S`)를 먼저 쓰고 검수를 받은 뒤 나머지를 쓴다.
- 작성자는 다른 사이트의 풀이 문장을 보지 않는다. 소재 이름 목록을 통째로 옮기지 않는다.
- 묶음이 끝나면 항목 단위 데이터 검사를 돌리고, copy-log에 소재 행과 작성자, 작성일, 상태를 적는다.
- 전체 완료 뒤 웹 검색 샘플 점검(T-11)을 하고, 결과를 copy-log에 적는다.
- copy-log 표의 헤더와 첫 열(slug)은 바꾸지 않는다(T-18 검사가 읽는다).
