# fortune 설계서

입력: `docs/fortune/plan.md` (최종본, 승인 2026-11-05, AC-1~AC-78, "용어 사용 규칙: 사주"와 고지 3·4 갱신본), `docs/fortune/status.md`, `docs/research/fortune.md`, `docs/fortune/ui-ux-design.md`(승인, 열린 질문 Q1·Q2 반영, S9 상담전화 기기별 표시 포함), `docs/fortune/kasi-api-check.md`(KASI API 실제 호출 결과), `src/features/fortune/fortune-dev-guide.md`(참고만)
참고 규칙: `docs/conventions/tech-stack.md`, `code-style.md`, `data-storage.md`, `seo.md`, `design-system.md`
선행 사례: `docs/tarot/design.md`, `src/features/tarot/`, `src/app/lotto/page.tsx`(로또 허브), `src/providers/age-gate.provider.tsx`
작성일: 2026-11-05
상태: 확정본. 2026-11-05 사용자가 설계서를 승인했다. 같은 날 UI/UX 초안 승인과 함께 요청된 변경(허브 `/fortune` 추가, 띠·별자리 → 오늘의 운세 링크)을 반영했다(D11, D12). 이어서 plan의 "용어 사용 규칙: 사주"와 고지 3·4 변경(D13), KASI API 확인 결과에 따른 지원 연도 제한 (나)안(D14), 상담전화의 기기별 표시 방식(D15, `ui-ux-design.md` S9 요구 조건 반영)을 반영했다. 확정 사항은 2장 D1~D15, 남은 열린 질문은 21장에 있다.

`fortune-dev-guide.md`의 15장 "추천 기술 스택"(dayjs, Vitest, Vercel KV 등), "AI 문구 생성 + 하루 캐시", 6.1·6.2·9.3·9.4의 예시 문장·점수표, 성별·출생지·이름 입력은 따르지 않는다. 이 설계서와 `plan.md`, `docs/conventions/`가 우선한다.

## 0. 요약

- 서버 API, DB, 새 런타임 환경변수가 없는 순수 프론트 기능이다. 생년월일·태어난 시각·연령 판정은 브라우저 메모리(React state)에서만 쓰고 어디에도 보내거나 저장하지 않는다.
- 새 npm 라이브러리는 없다. 음력→양력 변환과 24절기 시각은 한국천문연구원(KASI) 공공데이터로 만든 정적 표(코드 상수)와 직접 구현한 순수 함수로 계산한다(D1). 표는 `scripts/fortune-calendar/`의 개발용 스크립트로 만든다(D9).
- 지원 출생 연도는 1920-01-01부터 2028-12-31까지(그리고 오늘까지)다. KASI 24절기 API가 1920~2028년만 제공하기 때문이다(D14). 1단계의 "오늘" 기준 계산(개인 일운, 12띠·12별자리 목록)은 절기를 쓰지 않으므로 2029년 이후에도 그대로 동작한다. 절기 표 보완은 2028-12 이전 후속 작업 F-1로 남긴다(4.10).
- 이용 동의 상태는 sessionStorage 키 하나에 `동의 여부·문구 버전·동의 시각`만 둔다. 탭을 닫으면 사라지고, 같은 탭에서는 새로고침해도 유지된다(D2).
- 페이지는 서버 컴포넌트다. 기능 페이지는 h1, 상시 면책, 입력 영역 안내, 설명, 계산 기준 요약, FAQ, 상세 이용 안내, 결과 하단 면책·상담전화를 서버 HTML에 두고, 입력·선택·결과(기능 영역)만 동의 후 클라이언트에서 그린다. 동의 전에는 기능 영역 코드(문구 풀 포함)를 내려받지도 않는다(D5).
- 오늘의 운세 문구는 서버 HTML에 두지 않는다(D3).
- "사주"라는 단어 자체는 금지가 아니고 "사주 분석", "사주 풀이" 같은 특정 구가 금지다. 방식 A 화면에서 "사주"는 plan 표의 허용 위치에만 쓰고, "사주 네 기둥", "사주 4기둥"은 어느 화면에도 쓰지 않는다(D13, 8.3).
- 상담전화 5곳은 타로와 같은 공용 컴포넌트로 보인다. 서버 HTML에 번호마다 터치용 `tel:` 링크와 PC용 일반 글자를 함께 두고, CSS 미디어 쿼리 `(hover: hover) and (pointer: fine)`의 `display`로 하나만 보이게 한다. JS 없이 서버 HTML만으로 상태가 정해지고, 숨은 쪽은 `display: none`이라 접근성 트리·탭 순서에서도 빠진다(D15, 8.4).
- 라우트 (D8, D11)

| URL | 화면 | 동의 게이트 | 단계 |
|---|---|---|---|
| `/fortune` | 운세 허브(진입 화면). 개인 입력·선택·결과 없음 | 없음 | 1 |
| `/fortune/today` | 오늘의 운세(개인 일운) | 있음 | 1 |
| `/fortune/tti` | 띠별 운세 | 있음 | 1 |
| `/fortune/star-sign` | 별자리 운세 | 있음 | 1 |
| `/fortune/saju` | 사주 | 있음 | 2 (출시 전까지 허브·메뉴·sitemap 비노출) |

## 1. 폴더 구조

```
src/app/fortune/
  layout.tsx                              # 신규(서버). children을 FortuneConsentProvider로 감싼다
  page.tsx                                # 신규(서버). 운세 허브 /fortune (D11)
  today/page.tsx                          # 수정: ComingSoon → 실제 페이지, noindex 제거 (/fortune/today)
  tti/page.tsx                            # 신규. 띠별 운세 (/fortune/tti)
  star-sign/page.tsx                      # 신규. 별자리 운세 (/fortune/star-sign)
  saju/page.tsx                           # (2단계) 신규. 사주 (/fortune/saju)

src/constants/
  crisis-phone.constant.ts                # 신규(공용). 상담전화 5곳(href 유지)과 결과 하단 위기 안내 문장. 타로·운세가 같이 쓴다(D4)
  menu.constant.ts                        # 수정: 운세 그룹 comingSoon 해제, 그룹 href를 /fortune으로, 항목 추가
  menu-icon.constant.ts                   # 수정(아이콘이 새로 필요할 때만)

src/types/
  crisis-phone.type.ts                    # 신규(공용). CrisisPhoneType

src/components/common/
  crisis-phone.component.tsx              # 신규(공용, 'use client' 없음). 상담전화 한 곳: 터치용 tel: 링크 + PC용 글자를 함께 그리고 CSS로 하나만 보임 (D15, 8.4)

src/features/fortune/
  types/
    fortune.type.ts                       # 공통 타입 (3장)
    fortune-calendar.type.ts              # 달력·절기 표 타입 (3장)
    fortune-saju.type.ts                  # (2단계) 사주 타입
  constants/
    fortune-route.constant.ts             # 경로 상수 FORTUNE_ROUTES (D8, D11)
    fortune-input.constant.ts             # 지원 출생일 범위(1920-01-01 ~ 2028-12-31), 연·월·일 입력 범위, FORTUNE_MIN_AGE
    fortune-score.constant.ts             # 점수 범위 30~95, 구간 경계 55/75
    fortune-zodiac.constant.ts            # 12띠 키·이름·순서
    fortune-star-sign.constant.ts         # 12별자리 키·이름·시작 중기 번호·안내용 날짜표
    fortune-lucky.constant.ts             # 오행별 행운 색·방향·숫자 대응표 (서비스 자체 규칙)
    fortune-consent.constant.ts           # 동의 문구 버전, 저장 모드, 저장 키 접미사
    fortune-notice.constant.ts            # 고정 문구 전부 (8장)
    fortune-faq.constant.ts               # 페이지별 FAQ (허브 포함, 화면과 JSON-LD 공용)
    fortune-guide.constant.ts             # 페이지별 설명 콘텐츠 본문 (허브 포함)
    fortune-seo.constant.ts               # 페이지별 title, description, keywords, og alt (허브 포함)
    fortune-copy-rule.constant.ts         # 금지 표현·허용 예외·"사주" 용어 규칙 (검사 전용, 화면 코드에서 import 금지)
    calendar/
      lunar-table.constant.ts             # 음력 1919~2049년 표 (4.1, BE-1 스크립트가 생성)
      solar-term-table.constant.ts        # 양력 1920~2028년 24절기 KST 시각 표 (4.1, BE-1 스크립트가 생성)
    pools/
      common.constant.ts                  # 한 줄 요약·오늘의 조언·주의할 점 (구간 3 × 변형 3)
      personal.constant.ts                # 개인 일운 (항목 5 × 구간 3 × 변형 3)
      tti/<rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig>.constant.ts
      tti-pools.constant.ts               # 12파일 합본 FORTUNE_TTI_POOLS
      star-sign/<capricorn|aquarius|pisces|aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius>.constant.ts
      star-sign-pools.constant.ts         # 12파일 합본 FORTUNE_STAR_SIGN_POOLS
      saju/<bigyeon|geopjae|siksin|sanggwan|pyeonjae|jeongjae|pyeongwan|jeonggwan|pyeonin|jeongin>.constant.ts  # (2단계)
      saju-pools.constant.ts              # (2단계) 합본 + 십신별 기본 점수표
    fortune-saju.constant.ts              # (2단계) 천간·지지(한글·한자·오행·음양), 십신 이름·한 줄 설명, 서머타임 안내 연도, 23시대 시주 기준 상수(4.9)
  utils/
    fortune-seed.util.ts                  # 해시, 시드 난수, 점수, 구간, 변형 선택
    fortune-date.util.ts                  # 양력 날짜 검증, JDN, 날짜 비교, 만 나이
    fortune-lunar.util.ts                 # 음력→양력 변환, 설날 날짜, 그해 윤달 조회
    fortune-solar-term.util.ts            # 절기 시각 조회(표 범위 밖이면 null), 경계일 판정
    fortune-birth.util.ts                 # 입력 검증 → 양력 변환 → 범위 확인 (파이프라인)
    fortune-tti.util.ts                   # 띠 판정(입춘 시각), 설날 기준 띠
    fortune-star-sign.util.ts             # 별자리 판정(중기 시각)
    fortune-reading.util.ts               # 결과 생성 (개인·띠·별자리, 2단계에서 사주 추가)
    fortune-saju.util.ts                  # (2단계) 4기둥, 십신, 오행 분포, 서머타임 안내 여부
  services/
    fortune-consent-storage.service.ts    # sessionStorage 동의 값 읽기·쓰기·삭제·검증
  hooks/
    use-fortune-consent.hook.ts           # 동의 Context 소비 훅
    use-korea-date-key.hook.ts            # 마운트 후 KST 날짜 키, 1분 간격·화면 복귀 시 갱신
    use-birth-flow.hook.ts                # 입력 → 연령 확인 → 시각 질문 → 후보 선택 상태 머신 (useReducer)
  shared/components/
    consent.provider.tsx                  # 'use client'. FortuneConsentProvider (6장)
    consent-gate.component.tsx            # 'use client'. 동의 상태별로 기능 영역/동의 화면/이용 불가 화면 전환
    consent-form.component.tsx            # 확인 항목 3개 + "동의하고 시작" + "동의하지 않음"
    consent-declined.component.tsx        # 이용 불가 안내 화면
    consent-reset.component.tsx           # 'use client'. "동의 다시 설정" 버튼 (granted일 때만 보임)
    birth-form.component.tsx              # 양력/음력, 윤달, 연·월·일 입력 (react-hook-form + zod)
    birth-time-form.component.tsx         # 태어난 시각 입력 / "시각 모름"
    candidate-choice.component.tsx        # 후보 두 개 나란히, 선택 (정답 표시 없음)
    lunar-confirm.component.tsx           # "음력 ○ → 양력 ○" 확인 줄
    age-blocked.component.tsx             # 연령 안내 화면 (홈 링크)
    reading.component.tsx                 # 결과 한 묶음: 기준 날짜, 총운 점수·요약, 항목 4개, 조언·주의, 방식 안내, 점수 안내
    lucky.component.tsx                   # 행운 색·방향·숫자 + 로또 고지 + 로또 생성기 링크
    disclaimer-notice.component.tsx       # 서버. 상시 면책 (h1 바로 아래)
    input-notice.component.tsx            # 서버. 입력 영역 개인정보·연령·책임 안내
    noscript-notice.component.tsx         # 서버. <noscript> "운세 이용에는 JavaScript가 필요합니다 …"
    result-notice.component.tsx           # 서버. 하단 면책(책임 고지 포함) + 상담전화 5곳(공용 CrisisPhoneComponent)
    today-link.component.tsx              # 서버. 띠·별자리 페이지의 "생년월일로 보는 오늘의 운세" 링크 (D12)
    calc-basis.component.tsx              # 서버. 계산 기준 요약 (페이지별 항목 선택 props, 지원 연도 포함)
    detail-notice.component.tsx           # 서버. 상세 이용 안내 9항
    faq.component.tsx                     # 서버. FAQ 목록
  hub/
    components/
      root.component.tsx                  # 서버. FortuneHubComponent: 운세 목록(MenuListComponent) + 허브 설명 (D11)
  today/
    components/
      root.component.tsx                  # 'use client'. FortuneTodayComponent: 게이트 + 기능 영역 지연 로드
      panel.component.tsx                 # 'use client'. FortuneTodayPanelComponent: 입력 → 연령 확인 → 결과
      guide.component.tsx                 # 서버. 사용법·결과 읽는 법
  tti/
    components/
      root.component.tsx                  # 'use client'. FortuneTtiComponent
      panel.component.tsx                 # 12띠 목록·선택 + 내 띠 찾기
      list.component.tsx                  # 12띠 오늘의 운세 목록
      finder.component.tsx                # 내 띠 찾기 (생년월일 → 연령 → 입춘일 시각 → 결과 + 설날 기준 안내)
      guide.component.tsx                 # 서버. 12띠와 출생 연도 대응(입춘 기준), 내 띠 찾는 법
  star-sign/
    components/
      root.component.tsx, panel.component.tsx, list.component.tsx, finder.component.tsx
      guide.component.tsx                 # 서버. 12별자리 일반 날짜 기간("해마다 하루 정도 달라질 수 있다"), 찾는 법
  saju/                                   # (2단계)
    components/
      root.component.tsx, panel.component.tsx
      pillars.component.tsx               # 4기둥 표 (한글·한자 병기, 시주 없음 표시)
      elements.component.tsx              # 오행 분포
      ten-god.component.tsx               # 오늘 일진·내 일간·십신 이름과 한 줄 설명
      guide.component.tsx                 # 서버. 사주 네 기둥 설명
    hooks/
      use-saju-flow.hook.ts               # 사주 입력 흐름 (후보가 차트)

scripts/fortune-calendar/                 # 개발용. backend-dev 작성, 사용자 실행 (D9)
  generate.mjs                            # KASI API → calendar/*.constant.ts 생성
  verify.mjs                              # 생성과 다른 API로 표본 재조회·대조

docs/fortune/
  copy-log.md                             # 문구 작성·검수·유사 문장 점검 기록 (AC-40, AC-41, AC-60)
  calendar-verification.md                # 달력·절기 표 검증 기록 (4.1)

docs/research/
  fortune-late-zi.md                      # (2단계 착수 전) 23시대 시주 천간 기준 출처 조사 (4.9, R-1)
```

- 위 트리의 "4기둥", "사주 네 기둥" 같은 주석은 개발 내부 용어다. 화면 문구에는 쓰지 않는다(8.3).
- 운세 기능 안에서만 쓰는 것은 `features/fortune/` 안에 둔다. 다른 기능을 import하지 않는다. 상담전화 목록과 표시 컴포넌트는 타로와 같이 써야 하므로 공용(`src/constants/`, `src/types/`, `src/components/common/`)으로 올린다(D4, D15).
- 허브는 서버 전용 화면이라 `hub/components/root.component.tsx`에 `'use client'`를 붙이지 않는다. 공용 `MenuListComponent`(`src/components/common/menu-list.component.tsx`, 서버 렌더 가능)를 재사용한다.
- 컴포넌트 이름 예: `hub/components/root.component.tsx` → `FortuneHubComponent`, `today/components/root.component.tsx` → `FortuneTodayComponent`, `tti/components/finder.component.tsx` → `FortuneTtiFinderComponent`, `shared/components/today-link.component.tsx` → `FortuneTodayLinkComponent`, `src/components/common/crisis-phone.component.tsx` → `CrisisPhoneComponent`. 페이지는 `FortunePage`(허브), `FortuneTodayPage`, `FortuneTtiPage`, `FortuneStarSignPage`, `FortuneSajuPage`.
- `fortune-dev-guide.md`는 지우지 않는다(참고 문서).

## 2. 결정 사항 (확정)

| 번호 | 주제 | 확정 내용 |
|---|---|---|
| D1 | 음력 변환·절기 계산 | 직접 구현. 사용자 기준은 "MIT 라이브러리면 사용, MIT가 아니거나 확인이 불확실하면 직접 구현"이다. 아래 "라이선스 확인 결과"대로 후보 라이브러리의 package 메타데이터와 저장소 LICENSE 원문을 직접 확인하지 못했으므로(불확실) 직접 구현으로 정했다. 데이터는 KASI 공공데이터로 만든 정적 표, 계산은 순수 함수다. 새 의존성이 없으므로 `DEPENDENCY_LICENSES.md`는 바뀌지 않고, `THIRD_PARTY_NOTICES.md`에는 외부 데이터 출처 표기만 추가한다(15장). |
| D2 | 동의 상태 보관 | sessionStorage. 탭을 닫거나 브라우저를 끄면 사라지고 같은 탭 안에서는 유지된다. 저장 값은 동의 여부·문구 버전·동의 시각뿐이다. 만료 기간(30일) 없음. 동의 다시 설정(철회) 버튼 유지. "동의하지 않음"은 저장하지 않는다. 6장. |
| D3 | 오늘의 운세 문구의 서버 HTML 포함 | 두지 않는다(기획 기본안). 점수·운세 문구·12띠/12별자리 오늘 운세는 동의 후 클라이언트에서만 그린다. 13.2. |
| D4 | 상담전화 공용화 (U-6 방안 A 확정) | plan은 "상담전화 번호와 문구가 타로와 따로 관리되면 안 된다"고 하고, `code-style.md`는 기능끼리 import를 금지하고 "공용 폴더로 올린 뒤 쓴다"고 한다. 그래서 `TAROT_CRISIS_PHONES`, `TarotCrisisPhoneType`, `TAROT_CRISIS_RESULT_LINE`을 `src/constants/crisis-phone.constant.ts`의 `CRISIS_PHONES`, `CRISIS_RESULT_LINE`과 `src/types/crisis-phone.type.ts`의 `CrisisPhoneType`으로 옮긴다. 필드(`id`, `name`, `number`, `displayNumber`, `href`, `description`, `showInCrisisPanel`)는 그대로 유지한다(`href` 포함, 터치 상태 링크에서 씀). 타로 3파일(`tarot-notice.constant.ts`, `crisis-notice.component.tsx`, `result-notice.component.tsx`)은 import를 바꾸고, 두 컴포넌트는 번호 표시를 공용 `CrisisPhoneComponent`로 바꾼다(D15). 타로 테스트(`e2e/tarot.spec.ts`의 `PHONES` 사본, `e2e/tarot-copy.spec.ts`의 검사 대상)도 공용 상수를 import하도록 고친다(U-6 방안 A). 위기 패널 전용 `TAROT_CRISIS_PANEL_BODY`, `TAROT_CRISIS_CALL_LABEL`, `TAROT_CRISIS_PHONE_ARIA_LABEL` 등 타로 전용 문구는 타로 상수에 그대로 둔다(터치 상태에서만 노출, 8.4). |
| D5 | 문구 풀 로딩 | 기능 영역(panel)을 `next/dynamic(() => import(...), { ssr: false })`로 불러온다. 문구 풀과 달력 표는 panel 쪽에서만 import하므로 동의 전에는 내려받지 않고, 서버 HTML·RSC 페이로드에도 들어가지 않는다. 운세 문구만 내려주는 API는 만들지 않는다. |
| D6 | 단위 테스트 | 새 테스트 도구(Vitest 등)를 들이지 않는다. `tech-stack.md`의 Playwright로 브라우저 없이 순수 함수를 import해 검사한다(`e2e/tarot-copy.spec.ts`와 같은 방식). 17장. |
| D7 | Breadcrumb | 허브 추가(D11)로 3단계의 "운세" 단계가 `/fortune`이 된다: 홈(`/`) > 운세(`/fortune`) > 페이지. 허브 자체는 2단계(홈 > 운세). 이전 설계의 "`/fortune/today`에서 2·3단계 URL 중복"은 없어진다. |
| D8 | URL 경로 | 허브 `/fortune`(D11), 오늘의 운세 `/fortune/today`(기존), 띠별 `/fortune/tti`, 별자리 `/fortune/star-sign`, 사주 `/fortune/saju`. 한국 고유 개념(띠, 사주)은 국어 로마자, 서양 개념(별자리)은 영어로 쓰고 "중국" 표기를 피한다. 라우트 폴더, `features/fortune/<화면>/` 폴더, `MENU_LIST`, 내부 링크, `buildMetadata`의 `pathname`, Breadcrumb `item`, sitemap(`MENU_LIST`에서 자동)이 모두 이 경로를 쓴다. 경로 문자열은 `fortune-route.constant.ts`의 `FORTUNE_ROUTES`에만 적고 다른 곳은 이 상수를 쓴다(`MENU_LIST`는 공용이라 기존 방식대로 `` `/${MENU_GROUP_NAME_ENUM.FORTUNE}/tti` `` 형식으로 쓰고, QA가 두 값이 같은지 검사한다). |
| D9 | 달력 표 생성 스크립트 | `scripts/fortune-calendar/`에 두고 backend-dev가 작성한다. 사용자가 guard-files 범위 확대를 승인했다. 열어야 할 범위는 2.1. 훅 파일 수정은 메인 세션이 개발 착수 시 한다. 실행(공공데이터포털 인증키 `DATA_GO_KR_API_KEY`, 네트워크 호출)은 사용자가 한다. |
| D10 | 23시대 출생 시주 천간 (2단계) | 지금 정하지 않는다. 두 방식을 상수 하나로 바꿀 수 있게 만들고, 2단계 착수 전에 researcher 출처 조사(R-1) 결과로 값을 확정한다(4.9). 1단계에는 영향이 없다. |
| D11 | 운세 허브 `/fortune` | 사용자 결정(2026-11-05)으로 허브를 만든다. URL 구조는 아래 2.2의 안 A로 확정: 허브 `/fortune`(서버 전용, 게이트 없음)과 오늘의 운세 `/fortune/today`(기존 유지, 게이트 있음)를 분리한다. 허브 구성과 고지 적용은 7.4. |
| D12 | 띠·별자리 → 오늘의 운세 링크 | `/fortune/tti`, `/fortune/star-sign`에 `/fortune/today`로 가는 링크를 서버 컴포넌트(`FortuneTodayLinkComponent`)로 둔다. 위치·라벨·게이트와의 관계는 7.5. |
| D13 | "사주" 용어 규칙 | plan "용어 사용 규칙: 사주"를 따른다. 금지는 "사주 분석", "사주 풀이", "맞춤 풀이" 같은 특정 구이고 단어 "사주"는 금지가 아니다. 방식 A 화면(허브 포함)에서는 plan 표의 허용 위치에만 "사주"를 쓰고 첫 언급에 괄호 설명 "(태어난 연·월·일·시로 세우는 네 기둥)"을 붙인다. "사주 네 기둥", "사주 4기둥"은 모든 화면 문구와 메타데이터에서 쓰지 않는다. 방식 A·B 안내는 plan 고지 3·4의 새 문장을 그대로 쓴다. 문자열 검사 설계는 8.3. |
| D14 | 지원 연도 제한 (나)안 | 사용자 결정(2026-11-05, `kasi-api-check.md` 근거). KASI 24절기 API는 1920~2028년만 제공한다. 지원 출생일을 1920-01-01 ~ 2028-12-31(그리고 KST 오늘 이전)로 제한한다. 절기 표는 1920~2028년, 음력 표는 1919~2049년(4.1 비교). 오늘 날짜가 2029년 이후가 되어도 1단계 화면은 계속 동작하도록 설계하고(4.10), 절기 데이터 보완은 후속 작업 F-1(기한 2028-12-01)로 남긴다. 2단계 사주의 절기 월주도 같은 제한을 받는다. |
| D15 | 상담전화 기기별 표시 | 사용자 결정(2026-11-05): 터치 환경(모바일)은 기존처럼 `tel:` 링크로 눌러서 걸고, 마우스 환경(PC)은 링크처럼 보이거나 동작하지 않게 한다(클릭·키보드로 통화 앱이 열리지 않음). 번호 글자는 PC에서도 보이고 복사할 수 있다. `ui-ux-design.md` S9의 조건 ①~④(서버 HTML만으로 상태 결정, PC에서 `tel:` 미실행, PC에서 링크 역할·탭 정지 없음, 한 시점에 한 상태만 접근성 트리에 있음)를 모두 만족하는 "두 요소 함께 렌더링 + CSS 미디어 쿼리 `display` 전환"으로 확정한다(8.4). 이전 안(서버 `<a>` → 하이드레이션 뒤 `<span>` 교체)은 ①·③을 만족하지 못해 폐기한다. 공용 상수의 `href`는 유지한다. 타로에도 같이 적용된다. |

- 행운의 시간대(F-22, 선택)는 1단계에서 넣지 않는다(plan "1단계에서 제외해도 된다").
- D2 메모: 사용자 표현은 "새로고침이나 껐다 켜면 삭제"였지만 sessionStorage는 같은 탭에서 새로고침해도 값이 남는다. 새로고침할 때마다 다시 동의를 받으려면 메모리(React state) 보관이 필요하다. 기본은 sessionStorage이고, 바꾸려면 6.3의 `FORTUNE_CONSENT_STORAGE_MODE` 값 하나만 `'memory'`로 바꾸면 된다.

라이선스 확인 결과 (D1 근거)

| 후보 | 리서치 기재 | 직접 확인 | 판정 |
|---|---|---|---|
| `korean-lunar-calendar` | MIT (리서치 7.1, 검색 요약) | 확인 못 함. 설계 세션에 웹·npm 조회 도구가 없고, 저장소 `node_modules`·`pnpm-lock.yaml`·`package-lock.json`에도 이 패키지가 없어 package.json의 `license` 필드와 저장소 LICENSE 원문을 볼 수 없었다. | 불확실 → 쓰지 않음 |
| `lunar-javascript`, `lunar-typescript` | MIT (리서치 7.1, 검색 요약) | 같은 이유로 확인 못 함 | 불확실 → 쓰지 않음 |

- 기술 면에서도 직접 구현이 불리하지 않다. 두 후보 모두 한국 표준시 기준 분 단위 절기 시각을 주지 않는다(`korean-lunar-calendar`는 음력 변환 전용, `lunar-javascript`는 중국 표준시 UTC+8 기준이며 한국 음력과 다른 해가 있을 수 있음, 리서치 7.1). 입춘·별자리·사주 월주에 필요한 절기 시각 표는 어느 쪽이든 직접 만들어야 하므로, 같은 출처(KASI)로 음력 표까지 만들면 검증 경로가 하나라 단순하다.
- 미채택 안 비교 기록

| | 확정: 직접 구현 (KASI 표) | 미채택: `korean-lunar-calendar` + 절기 표 직접 | 미채택: `lunar-javascript` |
|---|---|---|---|
| 번들 크기 | 음력 표 약 5KB, 절기 표 약 20KB(압축 전 추정). 동의 후 지연 로드 | 라이브러리 내장 음력 자료(1000~2050년) 추가. 크기 미측정 | 큰 편(불교·도교력 등 포함, 미측정) |
| 지원 연도 | 표 범위로 정함: 음력 1919~2049, 절기 1920~2028 (D14) | 양력 1000-02-13~2050-12-31 | 넓음 |
| 라이선스 | 자체 코드 + 공공데이터(15장) | MIT로 알려짐, 원문 미확인 | MIT로 알려짐, 원문 미확인 |
| 문서 갱신 | `THIRD_PARTY_NOTICES.md`에 KASI 데이터 출처만 | 두 문서 모두 의존성 추가 | 두 문서 모두 |
| 정확도 | KASI가 한국 기준 공식 자료. 4.1 검증 | 한국 천문 기준이라고 소개됨 | 한국 음력·절기와 차이 가능 |

### 2.1 guard-files 범위 확대 (D9, 메인 세션이 개발 착수 시 반영)

`.claude/hooks/guard-files.js`의 `SCOPES['backend-dev']` 배열에 아래 한 항목만 추가한다. 다른 agent의 범위는 바꾸지 않는다.

| 추가 항목 | 형식 | 열리는 파일 | 담당 |
|---|---|---|---|
| `'scripts/fortune-calendar/'` | 문자열(앞부분 일치) | `scripts/fortune-calendar/generate.mjs`, `scripts/fortune-calendar/verify.mjs` (같은 폴더의 보조 모듈 `*.mjs`가 더 필요하면 이 폴더 안에만 만든다) | backend-dev |

- `scripts/` 전체를 열지 않는다. 기존 `scripts/`의 다른 파일은 backend-dev도 고칠 수 없다.
- 이미 backend-dev 범위인 경로(추가 불필요): `src/features/fortune/constants/calendar/lunar-table.constant.ts`, `src/features/fortune/constants/calendar/solar-term-table.constant.ts`(정규식 `^src/features/[^/]+/(types|constants)/`), `src/features/fortune/types/fortune-calendar.type.ts`(같은 정규식), `docs/fortune/calendar-verification.md`(`docs/`).
- 열지 않는 경로: `.env.example`(키 이름 `DATA_GO_KR_API_KEY` 추가는 메인 세션), `README.md`(메인 세션), `package.json`(스크립트 명령을 추가하지 않는다. 실행은 `node scripts/fortune-calendar/generate.mjs`).
- 스크립트는 `.env` 파일을 읽지 않는다. 인증키는 사용자가 실행할 때 환경변수 `DATA_GO_KR_API_KEY`로 넘긴다(guard-bash의 `.env` 읽기 차단과 맞춘다). 앱 코드(`src/`)는 이 변수를 읽지 않는다.

### 2.2 허브와 오늘의 운세의 URL 구조 비교 (D11 근거)

이전 설계에서 개인 일운 페이지는 `/fortune/today`였고(기존 ComingSoon 라우트, 운세 그룹 `href`도 `/fortune/today`), `/fortune` 라우트는 없었다. 허브를 만드는 방법은 두 가지다.

| | 안 A (확정, 추천): 허브 `/fortune` + 오늘의 운세 `/fortune/today` 분리 | 안 B: `/fortune`을 허브 겸 오늘의 운세로, `/fortune/today`는 301 redirect |
|---|---|---|
| 역할 | 허브는 운세 종류를 고르는 진입 화면(서버 전용, 개인 입력 없음). 오늘의 운세는 생년월일 입력 → 결과 | 한 페이지가 진입 목록과 생년월일 입력·결과를 같이 맡는다 |
| 동의 게이트 | 허브에는 입력·선택·결과가 없어 게이트가 필요 없다. 게이트는 기능 페이지 셋에만 있다 | 허브 안에 입력이 생기므로 허브에도 게이트가 들어간다. 진입 목록과 동의 화면이 한 화면에 섞인다 |
| plan과의 관계 | plan "기존 `/fortune/today`는 유지한다"를 그대로 지킨다 | `/fortune/today` URL을 바꾸게 되어 plan 수정과 redirect가 필요하다 |
| SEO | 허브는 "운세" 종합 키워드, 오늘의 운세는 "오늘의 운세" 키워드로 페이지마다 주제가 하나다. Breadcrumb 중간 단계가 실제 허브가 되어 URL 중복이 없어진다(D7) | 한 페이지에 주제가 섞이고, 개인 일운 키워드 페이지가 허브 설명에 묻힌다 |
| 사이트 일관성 | 로또(`/lotto` 허브 + `/lotto/*` 기능)와 같은 구조 | 다른 메뉴와 다르다 |
| 비용 | 페이지 하나와 허브 설명 콘텐츠(얇은 콘텐츠 방지)가 늘어난다 | redirect 설정(`next.config.ts`), 메타데이터 이전 |

- 확정 근거: 사용자는 "허브를 만든다"만 정했고 URL 세부는 정하지 않았다. 안 A가 plan의 기존 URL 유지 조건을 지키고, 허브를 게이트 없는 순수 안내 화면으로 둘 수 있어 동의 게이트 범위(plan "입력·선택·결과 화면")와 정확히 맞으며, 로또 허브 선례와 같다. 그래서 안 A로 확정한다.
- `/fortune/today`는 noindex였던 URL이라 색인 이력이 없고, 안 A에서는 URL 변경이 없으므로 redirect도 없다.

## 3. 타입 (확정)

`src/features/fortune/types/fortune.type.ts`. 개발 담당이 임의로 바꾸지 않는다.

```ts
export type FortuneCalendarKindType = 'solar' | 'lunar';

/** 양력 연·월·일 (월 1~12) */
export type FortuneYmdType = Readonly<{ year: number; month: number; day: number }>;

/** 폼 입력값. 메모리에서만 쓴다. 저장·전송·URL·로그 금지 */
export type FortuneBirthInputType = Readonly<{
  calendar: FortuneCalendarKindType;
  year: number;
  month: number;
  day: number;
  /** 음력일 때만 의미 있음 */
  isLeapMonth: boolean;
}>;

/** 시계 시각(출생 당시 표준시·서머타임 보정 안 함) */
export type FortuneClockTimeType = Readonly<{ hour: number; minute: number }>;

export type FortuneBirthErrorType =
  | 'empty'             // 연·월·일 중 하나라도 비어 있음
  | 'invalid-date'      // 양력에 없는 날짜 (2월 30일 등)
  | 'before-min'        // 1920-01-01 이전 (양력 환산 기준)
  | 'after-max'         // 2028-12-31 이후 (지원 범위 밖, D14. 양력 환산 기준)
  | 'future'            // KST 오늘보다 뒤
  | 'lunar-no-leap'     // 그해 그 달에 윤달이 없음
  | 'lunar-invalid-day' // 그 음력 달에 없는 날 (29일까지인 달의 30일)
  | 'out-of-table';     // 달력 표 범위 밖 (정상 입력에서는 나오지 않음)

export type FortuneBirthResolvedType =
  | Readonly<{ ok: true; solar: FortuneYmdType; isFromLunar: boolean }>
  | Readonly<{ ok: false; error: FortuneBirthErrorType }>;

/**
 * 판정 결과. 경계일이면 시각을 묻고, 시각을 모르면 두 후보를 보인다.
 * unsupported는 절기 표 범위 밖 연도(방어용, 정상 입력에서는 나오지 않음, 4.10)
 */
export type FortuneDetermineType<K extends string> =
  | Readonly<{ kind: 'single'; key: K }>
  | Readonly<{ kind: 'need-time'; before: K; after: K; boundary: FortuneClockTimeType }>
  | Readonly<{ kind: 'unsupported' }>;

export type FortuneCategoryKeyType = 'total' | 'money' | 'love' | 'work' | 'health';
export type FortuneBandType = 'high' | 'mid' | 'low';
export type FortuneVariantsType = readonly [string, string, string];
export type FortuneBandPoolType = Readonly<Record<FortuneBandType, FortuneVariantsType>>;
/** 한 묶음(개인 / 띠 하나 / 별자리 하나 / 십신 하나)의 문구 */
export type FortuneCategoryPoolType = Readonly<Record<FortuneCategoryKeyType, FortuneBandPoolType>>;
/** 공통 문구: 한 줄 요약·조언·주의 */
export type FortuneCommonPoolType = Readonly<{
  summary: FortuneBandPoolType;
  advice: FortuneBandPoolType;
  caution: FortuneBandPoolType;
}>;

export type FortuneElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type FortuneLuckyType = Readonly<{
  element: FortuneElementType;
  color: string;        // 예: '초록'
  direction: string;    // 예: '동쪽'
  numbers: readonly number[]; // 1~2개, 각 1~10
}>;

export type FortuneScoredTextType = Readonly<{ score: number; band: FortuneBandType; text: string }>;

export type FortuneReadingType = Readonly<{
  dateKey: string;          // KST 'YYYY-MM-DD'
  total: FortuneScoredTextType;
  summary: string;
  money: FortuneScoredTextType;
  love: FortuneScoredTextType;
  work: FortuneScoredTextType;
  health: FortuneScoredTextType;
  lucky: FortuneLuckyType;
  advice: string;
  caution: string;
}>;

export type FortuneTtiKeyType =
  | 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake'
  | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';

export type FortuneStarSignKeyType =
  | 'capricorn' | 'aquarius' | 'pisces' | 'aries' | 'taurus' | 'gemini'
  | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius';

export type FortuneConsentStatusType = 'checking' | 'required' | 'declined' | 'granted';

/** sessionStorage 저장 형식. 이 세 필드 외에는 넣지 않는다 */
export type FortuneConsentStoredType = Readonly<{
  v: 1;
  /** 동의한 안내문 버전. FORTUNE_CONSENT_VERSION과 다르면 무효 */
  version: string;
  /** 동의 시각. new Date().toISOString() (UTC ISO 8601) */
  agreedAt: string;
}>;

export type FortuneFaqItemType = Readonly<{ question: string; answer: string }>;
```

경로 상수 `src/features/fortune/constants/fortune-route.constant.ts` (확정)

```ts
export const FORTUNE_ROUTES = {
  hub: '/fortune',
  today: '/fortune/today',
  tti: '/fortune/tti',
  starSign: '/fortune/star-sign',
  /** 2단계. 출시 전에는 링크·메뉴·sitemap에 쓰지 않는다 */
  saju: '/fortune/saju',
} as const;
```

지원 범위 상수 `fortune-input.constant.ts` (확정, D14)

```ts
export const FORTUNE_MIN_BIRTH = { year: 1920, month: 1, day: 1 } as const;
/** 절기 표 마지막 연도와 같아야 한다(17장 검사). F-1로 표를 늘리면 함께 올린다 */
export const FORTUNE_SUPPORTED_MAX_YEAR = 2028;
export const FORTUNE_MAX_BIRTH = { year: FORTUNE_SUPPORTED_MAX_YEAR, month: 12, day: 31 } as const;
/** 절기 표 만료 경보 시작일(17장 만료 감시 테스트). F-1 기한 */
export const FORTUNE_SOLAR_TERM_RENEW_BY = '2028-12-01';
export const FORTUNE_MIN_AGE = 14;
```

공용 상담전화 타입 `src/types/crisis-phone.type.ts` (확정, D4. 기존 `TarotCrisisPhoneType`과 같은 필드)

```ts
export type CrisisPhoneType = Readonly<{
  id: string;
  name: string;            // 예: '자살예방 상담전화'
  number: string;          // 예: '109', '1577-0199' (검사·비교용)
  displayNumber: string;   // 화면 표기
  href: string;            // 'tel:109' 등. 터치 상태 링크에서만 쓴다(D15)
  description: string;     // 예: '자살 생각과 위기 상황 상담'
  showInCrisisPanel: boolean; // 타로 위기 패널 노출 여부
}>;
```

`src/features/fortune/types/fortune-calendar.type.ts`

```ts
/** 음력 한 해. 표의 한 행 */
export type FortuneLunarYearType = Readonly<{
  /** 음력 연도 */
  year: number;
  /** 음력 1월 1일(설날)의 양력 날짜. 같은 해 1~2월이므로 MMDD 정수 (예: 129 = 1월 29일) */
  newYear: number;
  /** 윤달이 붙는 달(1~12). 없으면 0 */
  leapMonth: number;
  /**
   * 달 길이 비트. 평달 1~12월 순서로 bit0~bit11, 윤달은 bit12.
   * 1이면 30일, 0이면 29일
   */
  monthBits: number;
}>;

/**
 * 절기 인덱스 0~23: 0 소한, 1 대한, 2 입춘, 3 우수, 4 경칩, 5 춘분, 6 청명, 7 곡우,
 * 8 입하, 9 소만, 10 망종, 11 하지, 12 소서, 13 대서, 14 입추, 15 처서,
 * 16 백로, 17 추분, 18 한로, 19 상강, 20 입동, 21 소설, 22 대설, 23 동지
 */
export type FortuneSolarTermIndexType = number;

/**
 * 한 해 24절기 시각(KST, UTC+9 기준). 각 값은 MMDDHHmm 정수 (예: 2032310 = 2월 3일 23:10).
 * 사람이 KASI 원자료와 바로 대조할 수 있게 읽기 쉬운 형식으로 둔다
 */
export type FortuneSolarTermYearType = readonly number[]; // 길이 24
```

2단계 `fortune-saju.type.ts`

```ts
export type FortuneStemIndexType = number;   // 0 갑 ~ 9 계
export type FortuneBranchIndexType = number; // 0 자 ~ 11 해
export type FortunePillarType = Readonly<{ stem: number; branch: number }>;
export type FortuneTenGodKeyType =
  | 'bigyeon' | 'geopjae' | 'siksin' | 'sanggwan' | 'pyeonjae'
  | 'jeongjae' | 'pyeongwan' | 'jeonggwan' | 'pyeonin' | 'jeongin';
/** 23:00~23:59 출생의 시주 천간 기준 (4.9) */
export type FortuneLateZiStemBasisType = 'same-day' | 'next-day';
export type FortuneSajuChartType = Readonly<{
  year: FortunePillarType;
  month: FortunePillarType;
  day: FortunePillarType;
  /** 시간 모름이면 null (3기둥) */
  hour: FortunePillarType | null;
  /** 천간·지지 8자(또는 6자)의 오행 개수. 지지는 본래 오행으로 센다(음양은 쓰지 않음) */
  elements: Readonly<Record<FortuneElementType, number>>;
}>;
```

화면 상태 타입(리듀서)은 각 hook 파일 안에 둔다(7.2, 12.3).

## 4. 계산 모듈

모든 계산은 브라우저에서 하는 순수 함수다. 입력과 결과를 `console.*`, 오류 메시지, URL, 저장소, 네트워크로 내보내지 않는다.

### 4.1 달력·절기 데이터 (D1, D9, D14)

출처와 확인 결과 (`docs/fortune/kasi-api-check.md`, 2026-11-05 실제 호출)
- 24절기 시각: KASI 특일 정보 Open API(공공데이터포털 15012690) `SpcdeInfoService/get24DivisionsInfo`. 제공 연도는 1920~2028년이다(1919년 이전, 2029년 이후 0건). 응답의 `sunLongitude`는 비어 있으므로 쓰지 않고 `dateName`(절기 이름)으로 인덱스를 정한다. `kst`는 `HHMM` 문자열이며 끝에 공백이 있을 수 있어 trim한다. `locdate`는 `YYYYMMDD`.
- 음력: KASI 음양력 정보 Open API(공공데이터포털 15012679) `LrsrCldInfoService`. 양력 1391-02-05 ~ 2050-12-31, 음력 1391-01-01 ~ 2050-11-18을 제공한다. `getSolCalInfo`(음력→양력)는 윤달이 있는 달을 물으면 평달·윤달 두 건을 돌려준다. `getLunCalInfo`(양력→음력) 응답에는 세차·월건·일진(`lunSecha`, `lunWolgeon`, `lunIljin`)이 함께 온다.
- 이용 조건: 특일 정보와 음양력 정보 모두 공공데이터포털 이용허락범위 "제한 없음"(사용자 확인). 약관 전문 재확인은 출시 전 법률 확인 범위로 둔다(15장).
- 인증키: `DATA_GO_KR_API_KEY`(공공데이터포털 키, 개발 시점 스크립트 전용).

표 범위 (확정)
- `solar-term-table.constant.ts`: `FORTUNE_SOLAR_TERM_TABLE: Readonly<Record<number, FortuneSolarTermYearType>>`, 양력 1920~2028년(109년, API 제공 범위 전부). 1단계는 입춘(2)과 중기(홀수 인덱스)를 쓰고, 2단계 사주가 나머지 절기(짝수 인덱스)를 쓴다. 생성은 한 번에 24개 모두 한다.
- `lunar-table.constant.ts`: `FORTUNE_LUNAR_TABLE: readonly FortuneLunarYearType[]`, 음력 1919~2049년. 연도 오름차순, `table[i].year === 1919 + i`. 아래 비교의 안 C(추천)다.

음력 표 범위 비교 (추천안 적용, 21장 Q7에서 확인 요청)

| | 안 A: 1919~2028 (절기와 맞춤) | 안 B: 1391~2050 (API 전부) | 안 C (추천): 1919~2049 |
|---|---|---|---|
| 행 수 | 110 | 약 660 | 131 |
| 크기(압축 전 추정, 행당 약 40바이트) | 약 4.4KB | 약 26KB | 약 5.2KB |
| 현재 필요 범위 충족 | 충족. 양력 1920-01-01 = 음력 1919년 11월이라 1919부터 필요. 양력 2028-12-31은 음력 2028년 안 | 충족 | 충족 |
| F-1로 절기를 늘릴 때 | 음력 표도 다시 만들어야 함 | 다시 만들 필요 없음 | 2049년까지는 다시 만들 필요 없음 |
| 마지막 해 처리 | 2029년 설날을 알아야 2028년 12월 길이를 정할 수 있어 2029년 1개월 추가 조회 필요 | 2050년 11·12월 길이를 정할 수 없다(음력 상한 2050-11-18). 마지막 해가 불완전 | 2049년 마지막 달 길이는 2050년 설날로 정해 완전 |
| 쓸모 없는 데이터 | 없음 | 1391~1918년 약 21KB (출생 하한 1920이라 쓰지 않음) | 2029~2049년 약 0.8KB |

- 추천 이유: 안 C는 안 A보다 약 0.8KB만 크고, F-1로 절기 표가 늘어날 때 음력 표를 다시 만들 필요가 없다. 안 B는 쓰지 않는 1391~1918년 데이터가 번들의 대부분을 차지하고 마지막 해가 불완전하다. 음력 표는 동의 후 지연 로드되는 panel 청크에만 들어간다(D5).

윤달 두 건 응답 처리 (BE-1 스크립트)
- 음력 연·월마다 `getSolCalInfo(lunYear, lunMonth, lunDay=01)`을 한 번 부른다. 응답 항목의 윤달 구분 필드(`lunLeapmonth`, 값 "평"/"윤")로 평달 1일과 윤달 1일을 나눈다. 필드 이름과 값은 첫 호출 응답으로 확인하고 다르면 `calendar-verification.md`에 적고 맞춘다.
- 한 연도에 "윤" 항목은 0개 또는 1개여야 한다. 2개 이상이거나, 평달이 빠졌거나, 같은 달에 3건 이상이면 생성을 멈춘다.
- 달 길이 = 다음 달(윤달이 있으면 윤달) 1일 JDN − 이번 달 1일 JDN. 29 또는 30이 아니면 멈춘다. 윤달 1일은 같은 번호 평달 바로 뒤에 온다.
- 결과를 `leapMonth`(윤달 번호, 없으면 0)와 `monthBits`(평달 bit0~11, 윤달 bit12)로 적는다.

24절기 응답 처리 (BE-1 스크립트)
- 연도마다 `get24DivisionsInfo?solYear=YYYY&numOfRows=30`을 한 번 부르고 24건인지 확인한다(월별 조회는 하지 않는다). 24건이 아니면 그해 월별(`solMonth`)로 다시 조회해 채우고, 그래도 24건이 아니면 멈춘다.
- `dateName`을 절기 인덱스 표(3장 주석의 이름 순서)와 대조한다. 모르는 이름이면 멈춘다.
- 값 = `MMDD`(`locdate` 뒤 4자리) × 10000 + `HHMM`(`kst.trim()`). `kst`가 4자리 숫자가 아니면 멈춘다.

호출 횟수
- 절기: 109회(1920~2028년, 연 1회). 재조회가 생기면 해당 연도만 최대 12회 추가.
- 음력: 131년 × 12개월 = 1,572회(윤달은 같은 응답에 함께 오므로 추가 호출 없음) + 2050년 1월 1회(2049년 마지막 달 길이용) = 1,573회.
- 합계 약 1,682회로 개발 계정 일 한도(10,000건) 안이다. 호출 사이에 지연을 두고, 실패한 요청은 다시 시도한 뒤 끝내 실패하면 파일을 쓰지 않고 멈춘다(일부만 채워진 표를 만들지 않는다).

형식·기준
- 두 파일 첫머리에 "자동 생성 파일, 직접 고치지 않는다, 생성일, 출처 API 이름, 범위"를 주석으로 둔다.
- 시각 기준: 모든 값은 현재 한국 표준시(UTC+9) 시계 기준으로 적는다. 1954-03-21~1961-08-09(UTC+8:30)와 서머타임 연도도 보정하지 않는다(plan 보정 4). 이 점을 계산 기준 안내에 밝힌다.
- 분 단위 비교 규칙: 출생 시각(시:분) ≥ 절기 시각(시:분)이면 "절기 이후". 초는 다루지 않는다.

생성과 검증
- `scripts/fortune-calendar/generate.mjs`: 환경변수 `DATA_GO_KR_API_KEY`(개발 시점 전용, 런타임 미사용, `NEXT_PUBLIC_` 아님)로 위 호출을 해 두 표 파일을 만든다. Node 24 내장 `fetch`만 쓴다. 키 값을 출력·기록하지 않는다.
- `scripts/fortune-calendar/verify.mjs`: 생성과 다른 API(양력→음력 `getLunCalInfo`)로 1920~2028년 사이 무작위 양력 날짜 60건 이상을 다시 조회해 표로 계산한 음력 날짜·윤달 여부와 비교한다. 같은 응답의 `lunIljin`(일진)을 2단계 `getDayPillar` 검증 자료로 함께 저장한다(`lunWolgeon`은 음력월 기준이라 절기 월주와 다를 수 있어 비교에 쓰지 않는다).
- 표 자체 검사(`e2e/fortune-calc.spec.ts`, 17장): 연도 연속, 달 길이 29/30, 음력 한 해 일수 353~355 또는 383~385, 연도당 윤달 0~1개, 설날이 양력 1/21~2/20, 24절기 시각이 오름차순이고 간격 14~16일, 입춘 2/3~2/5, 춘분 3/19~3/22, 절기 표 연도 = 1920~`FORTUNE_SUPPORTED_MAX_YEAR`.
- 알려진 값 대조(AC 사례와 실제 호출 결과 포함): 음력 2025-01-01 → 양력 2025-01-29, 음력 2000-01-01 → 2000-02-05, 양력 1920-02-05 → 음력 1919-12-16, 양력 2026-02-04 → 음력 2025-12-17, 1920 입춘 02-05 11:26, 1950 입춘 02-04 18:21, 2025 입춘 02-03 23:10, 2026 입춘 02-04 05:02, 2024 춘분 03-20 12:06, 2025 춘분 03-20 18:01, 2026 춘분 03-20 23:46, 2027 춘분 03-21 05:25. 값이 KASI 표와 다르면 KASI 값을 따르고 PM에게 알려 AC를 고친다(plan QA 메모).
- 결과는 `docs/fortune/calendar-verification.md`에 남긴다: 데이터 조회일, API 이름, 표 범위, 윤달 필드 확인 결과, 대조 건수와 결과, 불일치 처리.

### 4.2 날짜·나이 (`fortune-date.util.ts`)

```ts
export function isValidSolarDate(ymd: FortuneYmdType): boolean;
/** 그레고리력 날짜 → 율리우스 일수(정오 기준 정수). 날짜 차이·일진 계산용 */
export function toJulianDayNumber(ymd: FortuneYmdType): number;
export function fromJulianDayNumber(jdn: number): FortuneYmdType;
export function compareYmd(a: FortuneYmdType, b: FortuneYmdType): -1 | 0 | 1;
/** 'YYYY-MM-DD' ↔ FortuneYmdType */
export function parseDateKey(key: string): FortuneYmdType | null;
/**
 * 만 나이. today는 KST 오늘(getKoreaDateKey 결과를 파싱한 값).
 * 2월 29일생은 평년에 3월 1일에 한 살이 늘어난 것으로 본다(plan 보수적 가정)
 */
export function calculateFortuneManAge(birth: FortuneYmdType, today: FortuneYmdType): number;
```

- 오늘 날짜는 항상 `@/lib/date`의 `getKoreaDateKey()`로 얻는다(기기 시간대 무관, AC-3). 새 공용 함수는 필요 없다.
- 판정: `calculateFortuneManAge(...) < FORTUNE_MIN_AGE(14)`이면 차단. AC-42: 오늘 2026-11-05, 출생 2012-11-06 → 13세 차단. AC-43: 2012-11-05 → 14세 통과, 오늘 2026-11-04 → 13세 차단.

### 4.3 입력 파이프라인 (`fortune-birth.util.ts`, `fortune-lunar.util.ts`)

```ts
/** 음력 → 양력. 윤달 없음·없는 날·표 범위 밖이면 오류 */
export function convertLunarToSolar(
  year: number, month: number, day: number, isLeapMonth: boolean
): FortuneBirthResolvedType;
/** 그 음력 연도의 윤달 번호(1~12). 없으면 0, 표 범위 밖이면 null */
export function getLunarLeapMonth(lunarYear: number): number | null;
/** 그 음력 달의 날 수(29 | 30). 없는 달(윤달 없음)·표 범위 밖이면 null */
export function getLunarMonthLength(lunarYear: number, month: number, isLeapMonth: boolean): 29 | 30 | null;
/** 그 양력 연도의 설날(음력 1월 1일) 양력 날짜 */
export function getSeollalDate(solarYear: number): FortuneYmdType;
/**
 * 폼 값 → 양력 날짜. 순서: 빈 값 → (음력이면 변환, 양력이면 날짜 유효성)
 * → 1920-01-01 이전 → 2028-12-31 이후 → KST 오늘 이후. 연령 판정은 하지 않는다(호출부가 4.2로 한다)
 */
export function resolveFortuneBirth(
  input: Partial<FortuneBirthInputType>, today: FortuneYmdType
): FortuneBirthResolvedType;
```

- 음력 변환: 표에서 그해 설날 양력 날짜의 JDN에 앞선 달들의 길이(윤달은 같은 번호 평달 바로 뒤)를 더하고 `day - 1`을 더한 뒤 양력으로 돌린다.
- 범위 판정은 양력 환산 날짜로 한다. 음력으로 입력한 날이 양력 2028-12-31을 넘으면 `after-max`, 1920-01-01보다 앞서면 `before-min`이다.
- `after-max`와 `future` 순서: `after-max`를 먼저 본다. 즉 2029-01-01 이후 날짜는 항상 `after-max`, 그 전의 미래 날짜는 `future`다.
- 같은 양력 날짜면 같은 결과다(시드는 양력 날짜로 만든다, AC-7). 음력으로 입력했으면 "음력 ○년 ○월 ○일(윤달) → 양력 ○년 ○월 ○일" 확인 줄을 보인다.
- 오류마다 안내 문구는 `fortune-notice.constant.ts`의 `FORTUNE_BIRTH_ERROR_MESSAGES: Record<FortuneBirthErrorType, string>`에 둔다. 오류 문구에 입력값을 넣지 않는다. 초안(최종 문구는 C-3, 사용자 승인):
  - `before-min`: "1920년 1월 1일부터 2028년 12월 31일 사이에 태어난 분만 이용할 수 있습니다."
  - `after-max`: 같은 문장(범위를 한 문장으로 안내).
  - `future`: "오늘 이후 날짜는 입력할 수 없습니다."
  - `lunar-no-leap`: "입력한 해의 그 달에는 윤달이 없습니다. 윤달 선택을 해제해 주세요."
  - `out-of-table`: "지원하지 않는 날짜입니다. 1920년 1월 1일부터 2028년 12월 31일 사이 날짜를 입력해 주세요."

입력 UI의 연도·윤달 처리 (`birth-form.component.tsx`)
- zod 스키마의 연도 범위: 1920 ~ `min(KST 오늘 연도, FORTUNE_SUPPORTED_MAX_YEAR)`. 숫자 입력이든 선택 목록이든 같은 범위를 쓴다. 세부 판정(1920-01-01 이전 음력 날짜, 2028-12-31 이후 음력 날짜 등)은 파이프라인이 한다.
- 윤달 체크는 음력을 골랐을 때만 보인다. 연·월이 입력되면 `getLunarLeapMonth(year)`로 그해 그 달에 윤달이 있는지 확인한다.
  - 윤달이 있는 달: 체크를 활성화하고 "○년 ○월에는 윤달이 있습니다. 윤달에 태어났다면 선택해 주세요." 안내를 보인다.
  - 윤달이 없는 달: 체크를 비활성화하고 선택 상태를 해제한다. 그래도 값이 들어오면(직접 조작) 파이프라인이 `lunar-no-leap`을 낸다.
- 일(day) 최대값 안내: 음력이면 `getLunarMonthLength`가 29를 돌려주는 달에서 30일을 입력하면 `lunar-invalid-day`.
- 달력 표는 panel 청크에 있으므로 위 판정은 동의 후 기능 영역에서만 동작한다(D5와 충돌 없음).

### 4.4 띠 판정 (`fortune-tti.util.ts`)

```ts
/** 연도 → 띠. ((y - 4) mod 12), 0 = 쥐. 표가 필요 없어 범위 제한 없음 */
export function getTtiKeyByYear(year: number): FortuneTtiKeyType;
/** 입춘 시각 기준. 입춘이 드는 날이면 need-time(before = 전년도 띠, after = 그해 띠). 그해 절기 표가 없으면 unsupported */
export function determineFortuneTti(solar: FortuneYmdType): FortuneDetermineType<FortuneTtiKeyType>;
/** need-time 상태에서 시각을 넣었을 때 */
export function resolveFortuneTtiWithTime(solar: FortuneYmdType, time: FortuneClockTimeType): FortuneTtiKeyType;
/** 설날 기준 띠. 날짜만 본다(설날 0시부터 새해) */
export function getSeollalTti(solar: FortuneYmdType): FortuneTtiKeyType;
```

- 설날 기준 안내: 확정된(또는 사용자가 고른 후보) 띠와 `getSeollalTti` 결과가 다르면 "설날을 기준으로 하면 ○○띠로 보기도 합니다"를 보인다. 입춘이 설날보다 앞선 해(예: 2024년)의 반대 경우도 같은 규칙으로 처리된다.
- AC-14: 1990-06-15 말, 1992-05-10 원숭이. AC-15: 2025-02-01 용 + 설날 기준 뱀. AC-16: 2025-02-03은 need-time, 23:09 용, 23:30 뱀, 2025-02-04는 single 뱀.

### 4.5 별자리 판정 (`fortune-star-sign.util.ts`)

- 별자리 시작 중기: 물병 = 대한(1), 물고기 = 우수(3), 양 = 춘분(5), 황소 = 곡우(7), 쌍둥이 = 소만(9), 게 = 하지(11), 사자 = 대서(13), 처녀 = 처서(15), 천칭 = 추분(17), 전갈 = 상강(19), 사수 = 소설(21), 염소 = 동지(23). `fortune-star-sign.constant.ts`에 둔다.

```ts
/** 그해 중기 시각으로 구간을 찾는다. 1월 대한 전은 전년도 동지 이후 = 염소자리. 중기 날짜와 같으면 need-time. 그해 절기 표가 없으면 unsupported */
export function determineFortuneStarSign(solar: FortuneYmdType): FortuneDetermineType<FortuneStarSignKeyType>;
export function resolveFortuneStarSignWithTime(solar: FortuneYmdType, time: FortuneClockTimeType): FortuneStarSignKeyType;
```

- 1920년 1월 초 출생(대한 이전)은 전년도 동지가 필요 없다. 대한 이전이면 염소자리로 정하고, 1월 동지 경계는 없으므로 1919년 절기 표는 필요 없다. 대한 당일만 1920년 표로 판정한다.
- AC-22~AC-24 사례가 이 함수의 테스트 값이다. 화면의 날짜표(`FORTUNE_STAR_SIGN_GUIDE_RANGES`)는 안내용이며 판정에 쓰지 않는다.

### 4.6 시드·점수 (`fortune-seed.util.ts`)

```ts
/** FNV-1a 32비트. 문자열의 UTF-16 코드 단위로 계산(브라우저 간 동일) */
export function hashFortuneSeed(text: string): number;
/** mulberry32. 0 이상 1 미만 실수를 내는 결정적 난수 */
export function createFortuneRng(seed: number): () => number;
/** 30~95 정수. 30 + round(((r1 + r2) / 2) * 65). 두 균등난수 평균이라 가운데가 많고 극단이 적다 */
export function toFortuneScore(r1: number, r2: number): number;
/** 75~95 high, 55~74 mid, 30~54 low */
export function getFortuneBand(score: number): FortuneBandType;
/** 0, 1, 2 */
export function pickFortuneVariant(r: number): 0 | 1 | 2;
```

- 두 알고리즘은 널리 알려진 공개 알고리즘(FNV는 퍼블릭 도메인, mulberry32는 작성자가 퍼블릭 도메인으로 공개)이며 코드는 새로 작성한다. 외부 코드를 복사하지 않는다.
- 구간 비율(약): 상 20%, 중 52%, 하 28%.
- 시드 문자열 (확정. 바꾸면 모든 결과가 바뀌므로 바꿀 때 `v` 숫자를 올린다)
  - 개인: `fortune-v1|personal|${양력 생년월일 YYYY-MM-DD}|${KST 오늘 YYYY-MM-DD}`
  - 띠: `fortune-v1|tti|${FortuneTtiKeyType}|${오늘}`
  - 별자리: `fortune-v1|star-sign|${FortuneStarSignKeyType}|${오늘}`
  - 사주(2단계): `fortune-v1|saju|${일간 0~9}|${오늘}` (같은 일간이면 같은 날 같은 결과, AC-54)
- 시드와 점수는 오늘 날짜의 절기를 쓰지 않는다. 그래서 오늘이 2029년 이후여도 같은 방식으로 동작한다(4.10).

### 4.7 결과 생성 (`fortune-reading.util.ts`)

```ts
export function buildFortuneReading(input: Readonly<{
  seedText: string;
  dateKey: string;
  pool: FortuneCategoryPoolType;
  common: FortuneCommonPoolType;
  /** 사주만: 십신 기본 점수. 없으면 4.6 점수식 */
  baseScores?: Readonly<Record<FortuneCategoryKeyType, number>>;
}>): FortuneReadingType;
```

난수를 쓰는 순서 (확정. 순서를 바꾸면 결과가 바뀐다)
1. 점수: total, money, love, work, health 순서로 각 2개씩 → `toFortuneScore`. `baseScores`가 있으면 `clamp(base + round((r1 - 0.5) * 10), 30, 95)`로 1개씩 쓴다(±5).
2. 문구 변형: total, money, love, work, health 순서로 `pickFortuneVariant`, 각 항목 점수의 구간 풀에서 고른다.
3. 공통 문구: summary, advice, caution 순서로 변형을 고른다. 구간은 총운 구간.
4. 행운: 오행 `floor(r * 5)` → 대응표의 색·방향, 숫자 개수 `r < 0.5 ? 1 : 2`, 1개면 두 수 중 `floor(r * 2)`번째.
- 행운 대응표(`fortune-lucky.constant.ts`, 서비스 자체 규칙): 목 초록·동쪽·3, 8 / 화 빨강·남쪽·2, 7 / 토 노랑·가운데·5, 10 / 금 흰색·서쪽·4, 9 / 수 파랑·북쪽·1, 6. 숫자는 항상 1~10, 1~2개(AC-6, AC-36). 색 이름은 글자로 보이고, 색 견본을 그리려면 디자인 토큰만 쓴다(UI 단계).
- 결과 객체는 렌더링 중에 계산한다. 상태로 저장하지 않는다.

### 4.8 사주 (2단계, `fortune-saju.util.ts`)

```ts
export function getDayPillar(solar: FortuneYmdType): FortunePillarType;     // (JDN + 49) mod 60
export function getYearPillar(adjustedYear: number): FortunePillarType;      // (y - 4) mod 60
export function getMonthPillar(yearStem: number, monthBranch: number): FortunePillarType; // 오호둔
export function getHourBranch(time: FortuneClockTimeType): number;          // 23:00~00:59 자
/** 오서둔. 23:00~23:59는 basis에 따라 기준 일간이 달라진다 (4.9) */
export function getHourPillar(
  dayStem: number, time: FortuneClockTimeType, basis: FortuneLateZiStemBasisType
): FortunePillarType;
/** 경계(입춘·절기) 날이고 시각이 없으면 두 후보 차트. 그해 절기 표가 없으면 unsupported */
export function buildFortuneSajuCharts(
  solar: FortuneYmdType, time: FortuneClockTimeType | null, basis: FortuneLateZiStemBasisType
): Readonly<
  | { kind: 'single'; chart: FortuneSajuChartType }
  | { kind: 'need-choice'; charts: readonly [FortuneSajuChartType, FortuneSajuChartType] }
  | { kind: 'unsupported' }
>;
/** 천간끼리만. 오행 관계 + 음양 일치 여부 (지지 음양·지지 십신 쓰지 않음) */
export function getFortuneTenGod(dayStem: number, targetStem: number): FortuneTenGodKeyType;
export function countFortuneElements(chart: Omit<FortuneSajuChartType, 'elements'>): Readonly<Record<FortuneElementType, number>>;
/** 1948~1961, 1987~1988년 출생이고 시각을 넣었으면 true */
export function shouldShowFortuneDstNotice(year: number, hasTime: boolean): boolean;
```

- 월지: 절기(짝수 인덱스) 시각으로 정한다. 소한 → 축, 입춘 → 인, 경칩 → 묘 … 대설 → 자.
- 연주: 입춘 시각 이전이면 전년도.
- 지원 연도(D14): 연주·월주가 출생 연도의 절기 표를 쓰므로 사주도 출생일 1920-01-01 ~ 2028-12-31만 지원한다. 1920년 1월 소한 이전 출생의 월주는 1919년 대설 이후(자월)로 정한다(그 구간에 절기 경계가 없으므로 1919년 표가 필요 없다). 입력은 4.3 파이프라인과 같은 범위를 쓴다.
- 일주는 자정 기준(plan 결정 9), 오늘 일진은 `getDayPillar(KST 오늘)`. 일진은 JDN만 쓰므로 오늘이 2029년 이후여도 동작한다. 검산: 2000-01-01 무오, 2026-11-05 계미(설계 단계 직접 계산: JDN 2461350, (2461350 + 49) mod 60 = 19 = 계미). `verify.mjs`가 모은 `lunIljin`으로 표본 대조한다.
- `basis` 인자는 화면 코드가 직접 정하지 않고 항상 `FORTUNE_SAJU_LATE_ZI_STEM_BASIS` 상수를 넘긴다(4.9). 함수가 인자로 받는 이유는 두 방식을 모두 단위 테스트하기 위해서다.
- 출생지(경도) 보정, 표준시·서머타임 보정은 하지 않는다. 안내만 한다(AC-57).
- 화면 표기(AC-52): 표 캡션·제목·설명은 "사주(태어난 연·월·일·시로 세우는 네 기둥)"(첫 언급) 또는 "연·월·일·시 기둥", "연주·월주·일주·시주"로 쓴다. 시간 모름 안내는 "시주 없이 연·월·일 기둥만 보여 드립니다" 취지로 쓴다. 내부 용어 "4기둥", "3기둥"은 화면에 쓰지 않는다(8.3).

### 4.9 23시대 출생의 시주 천간 (2단계, D10)

plan 결정 9는 "일주는 자정에 바꾸고, 시주는 시계 시각 23:00~00:59를 자시로 본다"까지만 정했다. 그러면 23:00~23:59 출생은 일주가 그날이고 시지가 자(子)인데, 시주 천간을 오서둔으로 구할 때 어느 날의 일간을 쓸지가 정해지지 않는다. 00:00~00:59 출생은 일주와 시주가 모두 그날 기준이라 두 방식의 결과가 같다.

(1) 두 방식의 정의와 결과 차이

| | `same-day` (그날 일간 기준) | `next-day` (다음 날 일간 기준) |
|---|---|---|
| 정의 | 23:00~23:59의 자시 천간을 그날(일주) 일간으로 오서둔해 구한다. | 23:00~23:59를 다음 날 자시가 앞당겨 시작된 것으로 보고, 일주는 그날로 두되 시주 천간은 다음 날 일간으로 구한다. 흔히 "야자시(夜子時)를 따로 보는 방식"으로 설명된다. |
| 예: 갑(甲)일 23:30 | 시주 갑자(甲子) | 시주 병자(丙子) (다음 날 을(乙)일의 자시) |
| 차이 범위 | 시지(자)는 같고 시간(時干)만 천간 두 자리 차이가 난다. | |
| 화면 영향 | 기둥 표의 시주 천간과 오행 분포 1자가 달라진다. 오늘의 사주 운세(일간 × 오늘 일진의 십신)와 점수·문구는 일간만 쓰므로 바뀌지 않는다. | |

(2) 현재 확인 가능한 근거와 한계
- `fortune-dev-guide.md` 4.5는 "23시부터 다음 날(야자시 구분) / 0시부터"를 쟁점으로만 적고 "한 가지로 고정하고 안내"라고 할 뿐 어느 쪽이 맞는지 근거를 주지 않는다.
- `docs/research/fortune.md` 3.4·3.5는 지지 음양과 표준시·서머타임만 다루며 23시대 시주 천간은 조사하지 않았다.
- 한국 만세력 서비스 가운데 야자시 적용 여부를 설정으로 두는 곳이 있다는 것은 일반적으로 알려져 있지만, 이번 설계에서 출처를 확인하지 못했다. 어느 방식이 기본값으로 더 널리 쓰이는지에 대한 확인된 근거는 지금 없다.
- "정확도"에 객관적인 정답은 없다. 두 방식 모두 학파의 해석 규칙이며 천문 계산처럼 검증할 대상이 아니다. 그래서 정확도 기준은 "한국에서 널리 쓰이는 만세력·명리 교재가 어느 방식을 기본으로 쓰는가"로 정하고, 그 출처를 조사해 정한다.
- 결론: 지금은 단정하지 않는다.

(3) 후속 작업 R-1 (2단계 착수 전, researcher)
- 산출물: `docs/research/fortune-late-zi.md`.
- 조사할 것: 국내 명리 교재·강의 자료가 23시대 시주 천간을 어떻게 다루는지, 널리 쓰이는 국내 만세력(웹·앱)의 기본 설정과 설정 가능 여부, 두 방식을 채택하는 쪽의 근거, 출처 간 불일치. 다른 서비스의 이름은 조사 문서 안에서만 쓰고 화면·메타데이터에는 쓰지 않는다(plan 금지 표현).
- 결과는 사용자 승인을 받아 `FORTUNE_SAJU_LATE_ZI_STEM_BASIS` 값과 계산 기준 안내 문구로 반영한다. 출처로도 갈리면 그 사실을 계산 기준 안내에 밝히고 사용자가 기본값을 고른다.

(4) 전환 구조 (확정)
- 상수: `fortune-saju.constant.ts`의 `FORTUNE_SAJU_LATE_ZI_STEM_BASIS: FortuneLateZiStemBasisType`. 이 값 하나로 계산과 안내 문구가 함께 바뀐다.
- 계산: `getHourPillar(dayStem, time, basis)`에서 `time.hour === 23`이고 `basis === 'next-day'`이면 기준 일간을 `(dayStem + 1) % 10`으로 쓴다. 그 밖의 시각은 두 방식 모두 그날 일간이다.
- 안내 문구: `FORTUNE_SAJU_LATE_ZI_NOTICES: Record<FortuneLateZiStemBasisType, string>`에 두 방식의 계산 기준 문장을 모두 두고, 계산 기준 화면은 상수 값에 맞는 문장을 고른다(AC-56의 "자시 처리"). 문장은 R-1 이후 사용자 승인으로 확정한다.
- 테스트: 17장에서 두 값 모두 검사한다.
- 출시 조건: 2단계 개발 중에는 임시로 `'same-day'`를 넣어 컴파일되게 하되 이것은 결정이 아니다. R-1 결과로 값을 확정하기 전에는 사주 페이지를 출시하지 않는다(메뉴 항목·허브 노출 금지, 19장).
- 1단계 영향: 없다. 1단계(허브, 오늘의 운세, 띠, 별자리)는 시주를 계산하지 않고, 띠·별자리의 시각 비교는 절기 시각과의 분 단위 비교라 이 기준과 무관하다.

### 4.10 지원 범위와 2029년 이후 동작 (D14)

절기 표가 필요한 계산과 필요 없는 계산

| 경로 | 절기 표 사용 | 2029-01-01 이후(오늘 기준) 동작 |
|---|---|---|
| 오늘의 운세 개인 일운(시드·점수·문구·행운) | 쓰지 않음(출생일 양력 + 오늘 날짜만) | 그대로 동작 |
| 띠별·별자리 12개 목록의 오늘 운세 | 쓰지 않음(키 + 오늘 날짜만) | 그대로 동작 |
| 내 띠 찾기(입춘), 내 별자리 찾기(중기) | 출생 연도의 절기 표 | 출생일이 1920~2028로 제한되므로 그대로 동작 |
| 음력 입력 변환, 설날 기준 띠 | 음력 표(1919~2049) | 그대로 동작 |
| 연령 판정, KST 날짜 | 쓰지 않음 | 그대로 동작 |
| 2단계 사주 연주·월주 | 출생 연도의 절기 표 | 출생일 제한으로 그대로 동작 |
| 2단계 오늘 일진·십신 | 쓰지 않음(JDN) | 그대로 동작 |

- 결론: 1단계와 2단계 모두 "오늘" 날짜의 절기를 쓰지 않는다. 그래서 오늘이 2029년 이후가 되어도 화면은 멈추지 않는다. 바뀌는 것은 "2029년 이후 출생일은 입력할 수 없다"는 점 하나이며, 이 출생일은 만 14세 연령 확인에도 2043년까지 걸리므로 실제 이용자 영향은 2043년 전에는 없다.
- 그래도 F-1이 2028-12 이전에 필요한 이유: (1) 지원 범위 문구("2028년 12월 31일까지")가 화면에 남아 있으면 2029년 이후 방문자에게 오래된 인상을 줄 수 있다. (2) 절기 표 만료 감시 테스트(17장)가 2028-12-01부터 실패해 배포 검증을 막는다. (3) 향후 기능(예: 오늘의 절기 표시)이 생기면 바로 필요해진다.

안전 장치 (확정)
- 범위 상수 하나: 상한은 `FORTUNE_SUPPORTED_MAX_YEAR`(2028) 하나로만 정한다. zod 연도 범위, 파이프라인, 오류 문구 템플릿, 계산 기준 안내 문구, 화면의 연도 선택 목록이 모두 이 상수를 쓴다. 테스트가 이 상수와 절기 표 마지막 연도가 같은지 검사한다.
- 조회 함수는 예외를 던지지 않는다: `getSolarTermTime(year, index)`는 표에 없는 연도면 `null`을 돌려준다. 이를 쓰는 판정 함수(`determineFortuneTti`, `determineFortuneStarSign`, `buildFortuneSajuCharts`)는 `{ kind: 'unsupported' }`를 돌려주고, 화면은 `out-of-table` 오류 문구를 보인 뒤 입력 단계로 돌아간다. 정상 입력으로는 나오지 않는 방어 경로다.
- 오늘 날짜 경로는 절기 함수를 import하지 않는다: 개인 일운·12띠·12별자리 목록 컴포넌트는 `fortune-solar-term.util.ts`를 거치지 않는다(코드 리뷰와 17장 테스트로 확인).
- 계산 기준 안내(`FortuneCalcBasisComponent`)와 FAQ에 "1920년 1월 1일부터 2028년 12월 31일 사이에 태어난 분이 이용할 수 있습니다(한국천문연구원 24절기 자료 제공 범위)"를 둔다. 문구의 연도는 상수에서 만든다.

감지 테스트 (17장에 포함)
- 표 정합성: `FORTUNE_SUPPORTED_MAX_YEAR === max(Object.keys(FORTUNE_SOLAR_TERM_TABLE))`, 절기 표 최소 연도 1920, 음력 표가 1919 ~ `FORTUNE_SUPPORTED_MAX_YEAR + 1` 이상을 덮음.
- 미래 날짜 모의: `today = 2029-01-01`, `2030-06-15`로 순수 함수 호출. 개인 일운 `buildFortuneReading`, 12띠·12별자리 결과가 정상 생성되고, `resolveFortuneBirth({양력 2029-01-01}, today)`는 `after-max`, `{양력 2028-12-31}`은 통과(연령 판정 전 단계), `determineFortuneTti({2029, 2, 4})`는 `unsupported`.
- 브라우저 모의: Playwright `page.clock.setFixedTime('2029-01-02T09:00:00+09:00')`으로 `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`을 열고 동의 후 결과가 나오는지(오류 화면이 아닌지), 연도 선택 상한이 2028인지 확인한다.
- 만료 감시: 실제 KST 오늘이 `FORTUNE_SOLAR_TERM_RENEW_BY`(2028-12-01) 이후이고 `FORTUNE_SUPPORTED_MAX_YEAR`가 오늘 연도+1보다 작으면 테스트가 실패하며 "절기 표 보완(F-1) 기한이 지났습니다"를 출력한다. 운영 동작에는 영향이 없고 배포 전 검증만 막는다.

후속 작업 F-1 (기한 2028-12-01, 담당: 메인 세션이 일정 관리, 실행은 backend-dev + 사용자)
1. (다) KASI 갱신 확인: 2027년 하반기부터 `get24DivisionsInfo?solYear=2029`를 주기적으로 호출해 본다. 제공되면 `generate.mjs`를 다시 실행해 절기 표를 늘리고 `FORTUNE_SUPPORTED_MAX_YEAR`를 올린다(음력 표는 2049년까지 이미 있음). 이 경우 설계 변경 없이 데이터만 갱신한다.
2. (가) 천문 계산 보완: 2028-09-01까지 KASI가 2029년 이후를 제공하지 않으면 설계로 되돌린다. 태양황경 15° 단위 도달 시각을 천문 계산(Meeus 등)으로 구해 2029년 이후를 채우는 안이며, KASI 1920~2028 표와 분 단위 차이를 통계로 비교해 허용 오차를 정한 뒤 사용자가 고른다. 정확도가 KASI 표보다 낮을 수 있어 경계일 안내 문구도 함께 검토한다.
3. 어느 쪽이든 끝나면 계산 기준 안내·FAQ·README·`THIRD_PARTY_NOTICES.md`의 범위 표기를 갱신한다.
- 메인 세션은 이 항목을 `docs/fortune/status.md`의 후속 작업에 기한과 함께 등록한다.

## 5. 문구 데이터 구조

- 형식: 타로 D3와 같이 TS 상수 파일. `as const satisfies`로 변형 3개·구간 3개·항목 5개 누락을 컴파일 때 막는다. 작성 이력 필드는 데이터에 넣지 않고 `docs/fortune/copy-log.md`에만 둔다.
- 규모 (변형 3 확정)

| 파일 | 내용 | 문구 수 | 단계 |
|---|---|---|---|
| `pools/personal.constant.ts` | `FORTUNE_PERSONAL_POOL: FortuneCategoryPoolType` | 45 | 1 |
| `pools/common.constant.ts` | `FORTUNE_COMMON_POOL: FortuneCommonPoolType` (요약·조언·주의 × 구간 3 × 변형 3) | 27 | 1 |
| `pools/tti/*.constant.ts` 12개 + 합본 | `FORTUNE_TTI_POOLS: Record<FortuneTtiKeyType, FortuneCategoryPoolType>` | 540 | 1 |
| `pools/star-sign/*.constant.ts` 12개 + 합본 | `FORTUNE_STAR_SIGN_POOLS` | 540 | 1 |
| `pools/saju/*.constant.ts` 10개 + 합본 | `FORTUNE_SAJU_POOLS`, `FORTUNE_SAJU_BASE_SCORES` | 450 + 점수표 | 2 |
| `fortune-notice.constant.ts`, `fortune-faq.constant.ts`, `fortune-guide.constant.ts`(허브 포함), `fortune-saju.constant.ts`의 십신 한 줄 설명 | 고지·FAQ·설명·십신 설명 | 수십~백여 | 1, 2 |

- plan의 개인 일운 "약 100"은 요약·조언·주의를 개인 전용으로 둔 예시 계산이다. 이 설계는 요약·조언·주의를 네 방식이 같이 쓰는 공통 풀(27)로 두어 개인 전용은 45 + 공통 27이다. 부족하다고 판단되면 공통 풀을 방식별로 나누는 쪽으로 늘린다(21장 Q4).
- 공통 풀은 방식 A·B가 같이 쓰므로 "사주"를 쓰지 않는다. 방식 A 풀(개인·띠·별자리)에도 "사주"를 쓰지 않는다(plan 용어 표, 8.3).
- 총운 문구(total)는 1~2문장 본문, summary는 한 줄 요약이다.
- 문구 규칙: 합니다체, plan "금지 표현 목록"·"문구 안전 원칙"·"용어 사용 규칙: 사주", 건강·재물 제한, 낮은 구간도 행동 조언으로 끝낸다. 작성 지침과 기록은 plan "콘텐츠 제작 원칙"을 따른다. 작성 순서: 개인 전체 + 공통 + 띠 1개(쥐) + 별자리 1개(양) 샘플 → 사용자 검수 → 나머지 → 유사 문장 점검 → copy-log. 허브 설명·FAQ는 C-3에 포함한다.

## 6. 이용 동의 게이트 (D2)

### 6.1 구조

- `src/app/fortune/layout.tsx`(서버)가 `FortuneConsentProvider`(클라이언트)로 children을 감싼다. 운세 페이지끼리 클라이언트 이동해도 레이아웃이 유지되어 같은 동의 상태를 쓴다. 서버 children(h1, 설명 등)은 그대로 서버 HTML로 렌더링된다.
- 게이트 적용 페이지: `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`, (2단계) `/fortune/saju`. 허브 `/fortune`은 레이아웃 안에 있지만 `useFortuneConsent`를 쓰지 않고 게이트를 그리지 않는다(7.4). 허브를 방문해도 동의 상태는 만들어지거나 지워지지 않는다(Provider가 마운트 때 저장소를 읽기만 한다).
- 쿠키 동의(`ConsentProvider`)와 별개다. 서로의 상태를 읽거나 바꾸지 않는다(AC-32). 이름도 "이용 동의"로만 쓴다.
- 형태: 페이지 안에서 기능 영역 자리를 대체한다(오버레이 아님). 근거는 13.2.

### 6.2 상태와 동작

```ts
// consent.provider.tsx 안
type FortuneConsentActionType =
  | Readonly<{ type: 'RESTORE'; isGranted: boolean }>  // 마운트 후 저장소 확인 → granted | required
  | Readonly<{ type: 'GRANT' }>                        // 세 항목 선택 후 "동의하고 시작" → granted (저장 시도)
  | Readonly<{ type: 'DECLINE' }>                      // "동의하지 않음" → declined (저장 안 함)
  | Readonly<{ type: 'BACK' }>                         // 이용 불가 화면 "돌아가기" → required
  | Readonly<{ type: 'RESET' }>;                       // "동의 다시 설정" → 저장값 삭제 → required
```

- Context 값: `{ status: FortuneConsentStatusType; grant(): void; decline(): void; back(): void; reset(): void }`. 훅 `useFortuneConsent()`.
- 서버 렌더와 첫 클라이언트 렌더는 `checking`(기능 영역 자리 스켈레톤)으로 같게 그려 hydration 불일치를 막는다. 마운트 후 `readFortuneConsent()` 결과로 `RESTORE`.
- 세 확인 항목의 체크 상태는 `FortuneConsentFormComponent`의 로컬 state다. 저장하지 않고 Context에도 올리지 않는다. 처음에는 모두 해제(AC-68). 세 개가 모두 선택되기 전에는 진행되지 않고 진행 불가 안내를 보인다(UI 명세, AC-69).
- `GRANT`는 저장에 실패해도(시크릿 모드, 저장소 차단) granted로 간다. 이 경우 다음 페이지 로드에서 다시 묻는다(plan 예외).
- `checking`/`required`/`declined` 상태에서는 기능 영역 컴포넌트(panel)를 렌더링하지 않는다. 그래서 입력칸·결과·문구 풀 코드가 DOM과 네트워크에 나타나지 않는다(AC-67, AC-72).
- 동의 여부를 분석·알림 이벤트, `console.*`로 보내지 않는다(AC-73).

### 6.3 저장 (`fortune-consent-storage.service.ts`)

- 저장소: sessionStorage. `fortune-consent.constant.ts`의 `FORTUNE_CONSENT_STORAGE_MODE: 'session' | 'memory' = 'session'`. `'memory'`면 서비스가 저장소를 건드리지 않는다(새로고침마다 재동의, 2장 D2 메모).
- 키: `` `${process.env.NEXT_PUBLIC_SITE_ENG_NAME}_fortune_consent_v1` `` (기존 키 형식).
- 값: `FortuneConsentStoredType` JSON. `{ v: 1, version: FORTUNE_CONSENT_VERSION, agreedAt }`만 넣는다. 생년월일, 시각, 나이, 연령 판정, 이름, 동의 항목별 체크 값은 넣지 않는다(AC-29, AC-78).
- `FORTUNE_CONSENT_VERSION`: 동의 화면 문구의 버전 문자열(예: `'2026-11-05'`). 동의 화면 문구를 바꾸면 값을 바꾼다 → 기존 동의 무효(재동의).

```ts
/** 유효하면 true. 값 없음 → false. JSON 오류·v≠1·version 불일치·agreedAt이 ISO 형식 아님·필드 초과 → removeItem 후 false. 예외를 던지지 않는다 */
export function readFortuneConsent(): boolean;
/** 같은 키에 덮어쓴다. 성공 여부 반환, 예외 없음 */
export function writeFortuneConsent(now?: Date): boolean;
/** 삭제. 예외 없음 */
export function clearFortuneConsent(): void;
```

- 만료 검사는 없다(탭 세션이 끝나면 브라우저가 지운다). 거부는 저장하지 않는다.
- "동의 다시 설정": `FortuneConsentResetComponent`(클라이언트)를 게이트 적용 페이지의 상세 이용 안내 아래에 두고 `status === 'granted'`일 때만 보인다. 누르면 `reset()` → 키 삭제 → 동의 화면(AC-75). 허브에는 두지 않는다.
- 동의 화면 문구(보관 안내 포함)는 사용자가 승인한 `ui-ux-design.md`의 확정 문구를 쓴다. plan 초안의 "이 브라우저에 저장" 표현은 sessionStorage 기준 문구로 바뀌었다.

## 7. 입력·연령 확인 흐름과 화면 역할

### 7.1 공통 규칙

- 폼: `react-hook-form` + `zod`. 양력/음력 선택, 윤달 체크(음력일 때만, 4.3 윤달 처리), 연·월·일. 이름·연락처·성별·출생지 칸 없음(AC-31, AC-49).
- 연도 입력 범위: 1920 ~ `min(KST 오늘 연도, FORTUNE_SUPPORTED_MAX_YEAR)`(D14, 4.3).
- `<form>`에 `action`·`method`를 주지 않고 `handleSubmit`이 기본 제출을 막는다. 입력칸에 `autoComplete="off"`를 줘 브라우저 자동 완성 기록에 생년월일이 남는 것을 줄인다.
- 입력값과 판정 결과는 각 화면 hook의 state에만 둔다. 전역 store, Context, URL(쿼리·해시), 저장소에 올리지 않는다. 새로고침·다른 페이지 이동 후 돌아오면 비어 있다(AC-30).
- 시각 입력칸은 연령 확인을 통과하고 판정이 `need-time`일 때만 나온다(AC-46).

### 7.2 상태 머신 (`use-birth-flow.hook.ts`, useReducer, 확정)

```ts
type FortuneBirthFlowStateType<K extends string> =
  | Readonly<{ step: 'input'; error: FortuneBirthErrorType | null }>
  | Readonly<{ step: 'age-blocked' }>                       // 입력값을 남기지 않는다
  | Readonly<{ step: 'need-time'; solar: FortuneYmdType; isFromLunar: boolean; before: K; after: K }>
  | Readonly<{ step: 'choose'; solar: FortuneYmdType; isFromLunar: boolean; before: K; after: K }>   // 시각 모름
  | Readonly<{ step: 'done'; solar: FortuneYmdType; isFromLunar: boolean; key: K | null }>;          // 개인 일운은 key 없음

type FortuneBirthFlowActionType<K extends string> =
  | Readonly<{ type: 'SUBMIT'; input: Partial<FortuneBirthInputType>; today: FortuneYmdType }>
  | Readonly<{ type: 'SUBMIT_TIME'; time: FortuneClockTimeType }>
  | Readonly<{ type: 'TIME_UNKNOWN' }>
  | Readonly<{ type: 'CHOOSE'; key: K }>
  | Readonly<{ type: 'RESET' }>;                             // 다시 입력 → input
```

- 훅은 판정 함수(`determine`, `resolveWithTime`)를 인자로 받는다. 오늘의 운세는 판정 없이 `done`(key null), 띠는 4.4, 별자리는 4.5를 넘긴다. 사주(2단계)는 후보가 차트이므로 같은 패턴의 별도 훅 `saju/hooks/use-saju-flow.hook.ts`를 둔다.
- `SUBMIT` 처리 순서: `resolveFortuneBirth` → 오류면 `input`(error) → `calculateFortuneManAge < 14`면 `age-blocked` → 판정. 판정이 `unsupported`면 `input`(error `out-of-table`)로 돌아간다(4.10 방어 경로).
- `age-blocked` 화면은 입력한 생년월일을 다시 보이지 않고, 계속 이용 장치(보호자 확인 등)가 없으며 홈 링크만 있다(AC-42, AC-45). 같은 화면에서 다시 입력하는 버튼도 두지 않는다.
- `choose` 화면: 두 후보를 나란히 보이고 어느 쪽도 정답 표시를 하지 않는다.

### 7.3 화면별 역할

| 화면 | 역할 | 게이트 |
|---|---|---|
| 허브 `/fortune` | 운세 종류 소개와 진입 링크만. 개인 입력·선택·결과·운세 문구 없음(7.4) | 없음 |
| 오늘의 운세 `/fortune/today` | 생년월일 폼 → (음력 확인 줄) → 결과(`FortuneReadingComponent` + `FortuneLuckyComponent`) → `/fortune/tti`, `/fortune/star-sign` 링크(AC-11, 결과 끝, 기존) | 있음 |
| 띠별 `/fortune/tti` | 12띠 오늘 운세 목록(선택하면 그 띠 결과) + 내 띠 찾기(폼 → 연령 → 입춘일 시각 → 띠 + 설날 기준 안내 → 그 띠 결과) + "개인 운세와 다른 기준" 안내(AC-19) + 오늘의 운세 링크(서버, 7.5) | 있음 (링크는 게이트 밖) |
| 별자리 `/fortune/star-sign` | 12별자리 목록 + 내 별자리 찾기(폼 → 연령 → 경계일 시각 → 별자리 → 결과) + 오늘의 운세 링크(서버, 7.5) | 있음 (링크는 게이트 밖) |
| 사주 `/fortune/saju` (2단계) | 폼 + 태어난 시간(또는 모름) → 연령 → 연·월·일·시 기둥 표, 오행 분포, 오늘 일진·일간·십신, 오늘의 사주 운세, 과거 표준시 안내 | 있음 |

- 허브와 오늘의 운세는 역할이 겹치지 않는다. 허브는 "어느 운세를 볼지 고르는 곳"이고 생년월일을 받지 않는다. 생년월일로 보는 개인 결과는 오직 `/fortune/today`(와 띠·별자리의 내 띠/별자리 찾기)에서만 나온다.
- 기준 날짜 표시: `useKoreaDateKey()`가 마운트 후 `getKoreaDateKey()`를 읽고 1분 간격과 `visibilitychange` 때 다시 계산한다. 결과는 이 값에서 렌더링 중 계산되므로 자정이 지나면 화면이 새 날짜로 바뀐다(AC-3). "한국 시간 기준" 문구를 날짜 옆에 둔다.
- 띠·별자리 목록 12개 결과는 오늘 날짜 키에서 계산한 값이며 모든 사용자에게 같다(AC-18).
- 내부 링크는 모두 `FORTUNE_ROUTES` 상수를 쓴다(D8).

### 7.4 허브 `/fortune` 구성 (D11)

- 서버 컴포넌트만으로 이뤄진다. 상담전화 `CrisisPhoneComponent`도 `'use client'`가 없는 컴포넌트라 클라이언트 경계가 없다(8.4). 동의 게이트, 입력칸, 운세 문구 풀 import가 없다. 동의 전후로 같은 화면이다.
- 구성(위에서 아래)
  1. h1 "운세"(`TitleWrapperComponent`, 페이지 유일 h1) + 짧은 설명 1문장.
  2. 상시 면책 `FortuneDisclaimerNoticeComponent` (h1 바로 아래, AC-33과 같은 위치·문구).
  3. 운세 목록: `FortuneHubComponent`가 `MENU_LIST`의 운세 그룹 `items`를 공용 `MenuListComponent`로 그린다(로또 허브와 같은 방식). 1단계 항목은 오늘의 운세, 띠별 운세, 별자리 운세 세 개다. 사주는 2단계에서 `MENU_LIST`에 항목을 추가하는 순간 허브·메뉴·sitemap에 함께 나타나므로, 출시 전에는 어디에도 노출되지 않는다(별도 플래그 없음, 노출 스위치가 `MENU_LIST` 하나).
  4. 허브 설명(`fortune-guide.constant.ts`의 `FORTUNE_HUB_GUIDE`): 세 운세의 차이(생년월일 기준 개인 운세 / 같은 띠·별자리 공통 운세), 결과를 고르는 방식(방식 A 안내 취지), 이용 전 확인 절차가 있다는 점, 생년월일을 저장하지 않는다는 점, 지원 출생 연도(1920~2028년), 계산 기준(입춘·별자리 경계 시각)을 각 페이지에서 밝힌다는 안내. 한국어 약 600자 이상(얇은 콘텐츠 방지).
  5. FAQ `FortuneFaqComponent items={FORTUNE_HUB_FAQ}`: plan "페이지가 답할 질문" 중 공통 질문(오늘의 운세는 어떻게 정해지나요, 입력한 생년월일은 저장되나요, 만 14세 미만도 볼 수 있나요, 이용 전에 왜 동의를 받나요, 행운의 숫자는 로또와 관계가 있나요, 운세는 믿을 만한가요 취지). 질문 문구는 금지 표현 검사를 받는다.
  6. 하단 고지 `FortuneResultNoticeComponent`: 짧은 면책(책임 관련 고지 포함) + 상담전화 5곳. 허브에는 결과 영역이 없지만 운세 페이지 전체의 고지를 같은 모양으로 두기 위해 목록·설명 뒤에 둔다.
  7. 상세 이용 안내 `FortuneDetailNoticeComponent` (만 14세 이상 대상, 책임 관련 고지 포함, AC-48 항목).
- "사주" 사용: 허브는 방식 A 화면과 같은 규칙을 따른다(8.3). 허브 설명·FAQ에서 "사주"는 "이 운세들은 사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산한 결과가 아니다"라는 방식 구분 설명 문장에만 쓸 수 있고, 허브 title·description·OG·ItemList·Breadcrumb에는 쓰지 않는다. 2단계에서 메뉴 항목으로 들어오는 사주 링크 라벨은 허용 위치(링크·메뉴 라벨)다.
- 두지 않는 것: `FortuneInputNoticeComponent`(입력이 없음), `FortuneNoscriptNoticeComponent`(JS가 필요한 기능이 없음), `FortuneConsentResetComponent`(동의를 다루지 않는 화면), 로또 링크·고지(행운 숫자가 없음), 계산 기준 상세(`FortuneCalcBasisComponent`는 기능 페이지에 둔다).
- 동의 게이트가 필요 없는 근거: plan "이용 동의 게이트 > 적용 범위"는 "생년월일 입력, 띠·별자리 직접 선택, 오늘의 운세 결과"를 대상으로 하고 "h1, 상시 면책, 설명, FAQ, 이용 안내"는 적용하지 않는다고 정했다. 허브는 뒤쪽 요소로만 이뤄지므로 게이트 대상이 아니다. 허브의 링크를 눌러 기능 페이지로 가면 그 페이지에서 게이트가 동작한다.

### 7.5 띠·별자리 → 오늘의 운세 링크 (D12)

- 컴포넌트: `FortuneTodayLinkComponent`(서버, `shared/components/today-link.component.tsx`). props 없음. `<Link href={FORTUNE_ROUTES.today}>`.
- 대상: `/fortune/today`. 쿼리·해시를 붙이지 않는다(띠·별자리 선택값이나 입력값을 넘기지 않는다).
- 위치: `/fortune/tti`, `/fortune/star-sign` 페이지에서 `FortuneResultNoticeComponent` 바로 아래, 가이드 위. 페이지 형제로 렌더링한다(게이트 패널 밖).
- 라벨 후보: (1) "생년월일로 보는 오늘의 운세" (추천, 확정 라벨) (2) "오늘의 운세 (생년월일로 보기)" (3) "오늘의 운세". 추천 근거: plan "화면 표기 규칙"이 허용한 이름 그대로이고, 띠·별자리 공통 운세와 기준이 다르다는 점을 라벨만으로 알 수 있다. 링크 앞에 한 줄 안내(예: "내 생년월일을 기준으로 한 운세를 보시려면")를 둘지와 모양은 `ui-ux-design.md`에서 정한다(Q2 "같은 링크 모양").
- 서버 HTML에 있어도 되는가: 된다. 링크는 운세 결과·입력칸·점수가 아니라 내비게이션이므로 게이트 대상이 아니다(plan 적용 범위). 동의 전에도 보이고 JS를 끈 서버 HTML에도 있다. 이동한 `/fortune/today`에서 동의 게이트 규칙이 그대로 적용되고, 이미 동의한 탭이면 다시 묻지 않는다(AC-75). 서버 HTML에 있으므로 크롤러가 내부 링크를 따라갈 수 있다.
- 패널 안의 기준 차이 안내(AC-19, 동의 후)에는 링크를 중복해 넣지 않는다. 한 페이지에 오늘의 운세 링크는 하나다.

## 8. 고지 문구·금지 표현 검사

### 8.1 고정 문구 (`fortune-notice.constant.ts`)

plan "고지 문구(초안)" 1~17과 "로또 연결 노출 문구"를 상수로 옮긴다. 최종 문구는 `ui-ux-design.md`와 사용자 승인을 따른다. 상수 이름(확정):

| 상수 | plan 항목 |
|---|---|
| `FORTUNE_DISCLAIMER_TEXT` | 1 상시 면책 |
| `FORTUNE_RESULT_DISCLAIMER_TEXT` | 2 결과 하단 |
| `FORTUNE_METHOD_A_NOTICE`, `FORTUNE_METHOD_A_TTI_NOTICE`, `FORTUNE_METHOD_A_STAR_SIGN_NOTICE` | 3 방식 A 안내(본문, 띠 변형, 별자리 변형). plan 고지 3의 새 문장 그대로: "…사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산한 결과가 아닙니다." 폐기된 "…사주 풀이가 아닙니다" 문장은 쓰지 않는다 |
| `FORTUNE_METHOD_B_NOTICE` | 4 방식 B 안내(2단계). plan 고지 4 문장 그대로: "만세력으로 구한 사주(태어난 연·월·일·시로 세우는 네 기둥)와 오늘의 일진을 비교해 …" |
| `FORTUNE_SCORE_NOTICE` | 5 |
| `FORTUNE_PRIVACY_INPUT_NOTICE`, `FORTUNE_AGE_INPUT_NOTICE` | 6, 7 |
| `FORTUNE_CONSENT_TEXTS` (제목, 안내, 항목 3, 보관 안내, 진행 불가 안내, 버튼 2) | 8 (`ui-ux-design.md` 승인 문구) |
| `FORTUNE_DECLINED_TEXTS` | 9 |
| `FORTUNE_AGE_BLOCKED_TEXTS` | 10 |
| `FORTUNE_CALC_BASIS_TTI`, `FORTUNE_CALC_BASIS_STAR_SIGN`, `FORTUNE_TIME_UNKNOWN_NOTICE`, `FORTUNE_SEOLLAL_TEMPLATE`, `FORTUNE_DST_NOTICE` | 11~15 |
| `FORTUNE_SUPPORTED_RANGE_NOTICE` | 지원 출생 연도 안내(D14, 4.10). 연도는 `FORTUNE_MIN_BIRTH`, `FORTUNE_MAX_BIRTH`에서 만든다 |
| `FORTUNE_LEAP_MONTH_HINT_TEMPLATE` | 윤달 있는 달 안내(4.3) |
| `FORTUNE_DETAIL_NOTICE_TITLE`, `FORTUNE_DETAIL_NOTICE_ITEMS` | 16 |
| `FORTUNE_LOTTO_NOTICE`, `FORTUNE_LOTTO_LINK_LABEL`, `FORTUNE_LOTTO_LINK_HREF = '/lotto/generator'` | 로또 연결 |
| `FORTUNE_DIFFERENT_BASIS_NOTICE` | 띠·개인 기준 차이 안내 (AC-19) |
| `FORTUNE_TODAY_LINK_LABEL` (`'생년월일로 보는 오늘의 운세'`) | 띠·별자리 → 오늘의 운세 링크 (D12) |
| `FORTUNE_NOSCRIPT_NOTICE` | "운세 이용에는 JavaScript가 필요합니다 …" (AC-72) |
| `FORTUNE_BIRTH_ERROR_MESSAGES`, `FORTUNE_KST_LABEL` | 입력 오류(4.3 초안), "한국 시간 기준" |

- 괄호 설명 문자열은 상수 하나 `FORTUNE_SAJU_GLOSS = '사주(태어난 연·월·일·시로 세우는 네 기둥)'`로 두고, 방식 A·B 안내, 방식 구분 FAQ·설명, 사주 화면 첫 언급이 이 상수를 이어 붙여 쓴다. 표기가 문서마다 달라지는 것을 막는다.
- 상담전화 5곳과 결과 하단 위기 안내 문장은 공용 `src/constants/crisis-phone.constant.ts`(D4)에서 가져오고, 번호 하나하나는 공용 `CrisisPhoneComponent`로 그린다(D15, 8.4, AC-34).
- 로또 영역은 행운 숫자가 보이는 결과 안에 한 번만 두고, 고지는 접지 않는다. 행운 숫자를 로또 화면에 넘기는 파라미터·버튼이 없다(AC-35, AC-36). 링크는 일반 `next/link`이며 쿼리를 붙이지 않는다. 허브에는 로또 링크가 없다.

### 8.2 금지 표현 검사 (`fortune-copy-rule.constant.ts` + `e2e/fortune-copy.spec.ts`)

- `FORTUNE_FORBIDDEN_TERMS`: plan "금지 표현 목록" 전체(과장·확정, 로또·복권, 책임 과장, 사주 오인, 재물·투자, 건강, 불안 유발, 타 서비스·상표). "보장", "예측", 사주 화면의 "AI" 포함. 사주 오인 항목은 "사주 분석", "사주 풀이", "맞춤 풀이" 같은 구 단위로만 넣는다. 단어 "사주" 하나만으로 된 항목은 넣지 않는다(단어 "사주"는 금지 표현이 아니다, plan AC-37). "사주" 위치 규칙은 8.3에서 따로 검사한다.
- `FORTUNE_FORBIDDEN_PATTERNS`: 미래 확정 어미(`/게 됩니다/`, `/게 될 거예요/`, `/게 될 것입니다/`).
- `FORTUNE_HEALTH_TERMS`: 건강 문구 전용 병명·증상·약 목록(초안: 감기, 두통, 암, 우울증, 불면증, 고혈압, 당뇨, 약을, 복용, 처방, 진통제, 영양제, 수술). 건강 풀(`health`)에만 적용한다. 사용자가 추가·삭제할 수 있다.
- 검사 방식: 검사 대상 문자열에 각 금지 구가 부분 문자열로 들어 있는지 본다(`text.includes(term)`). 금지 구는 공백을 포함한 구 그대로 비교하므로 "사주(태어난 …)를 계산한 결과가 아닙니다"는 "사주 분석", "사주 풀이"에 걸리지 않는다. 공백을 뺀 변형("사주분석", "사주풀이")도 목록에 같이 넣는다.
- 허용 예외 (확정): (1) `FORTUNE_LOTTO_NOTICE` 문장 안의 "당첨", (2) 2단계 사주 페이지(`/fortune/saju`)와 `fortune-seo`의 사주 항목, 사주 FAQ·가이드 안의 "사주 분석". 방식 A 안내(고지 3)는 예외가 아니며 예외 없이 통과해야 한다. 허브는 방식 A 페이지와 같은 규칙(사주 예외 없음)이다. 예외는 "검사 전 해당 문장·대상을 빼고 검사"하는 방식이며 그 밖의 예외는 없다. 부정 고지문 예외는 두지 않는다(plan 결정 8).
- 검사 대상: 문구 풀 전부, 고지·FAQ·가이드·SEO 상수(허브 포함), 공용 `CRISIS_PHONES`·`CRISIS_RESULT_LINE`, `MENU_LIST`의 운세 그룹(라벨·항목), 각 운세 페이지(`/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`)의 서버 HTML(메타데이터·JSON-LD 포함), 동의 화면·이용 불가 화면을 렌더링한 DOM(브라우저 테스트).
- 이 상수는 화면 코드에서 import하지 않는다(번들 제외).

### 8.3 "사주" 용어 검사 (D13, plan "용어 사용 규칙: 사주", AC-10·37·52·58)

`fortune-copy-rule.constant.ts`에 아래를 두고 `e2e/fortune-copy.spec.ts`가 검사한다. 단어 "사주"를 통째로 막지 않고 위치와 형태만 본다.

- `FORTUNE_SAJU_REDUNDANT_TERMS = ['사주 네 기둥', '사주 4기둥', '사주 네기둥', '사주4기둥']`: 모든 화면 문구와 메타데이터(방식 A·B, 허브, 2단계 사주 포함)에 없어야 한다(AC-52). 내부 용어 "4기둥", "3기둥"도 화면 문구·메타데이터 상수와 서버 HTML에 없어야 한다(코드 주석·변수명·이 설계서는 대상 아님).
- 방식 A 화면(허브, 오늘의 운세, 띠, 별자리)의 "사주" 허용 위치(plan 표)

| 위치 | "사주" |
|---|---|
| `FORTUNE_METHOD_A_NOTICE`, `FORTUNE_METHOD_A_TTI_NOTICE`, `FORTUNE_METHOD_A_STAR_SIGN_NOTICE` | 허용(정해진 문장 그대로) |
| 방식 A·허브의 FAQ·가이드 중 방식 구분 설명 문장 | 허용. 그 항목(FAQ 한 개 또는 가이드 문단 한 개) 안에서 첫 "사주"는 `FORTUNE_SAJU_GLOSS` 형태여야 한다 |
| FAQPage JSON-LD | 화면 FAQ와 같은 상수에서 만들므로 위 FAQ 허용 문장과 같을 때만 허용 |
| 2단계 사주 페이지로 가는 링크·메뉴 라벨 | 허용(2단계 출시 후) |
| 방식 A 문구 풀, 공통 풀, 결과 제목, title·description·OG alt·keywords(`fortune-seo`의 허브·오늘·띠·별자리 항목), Breadcrumb·ItemList | 금지 |

- 자동 검사 규칙
  1. 금지 위치 상수(위 표의 마지막 줄)에 문자열 "사주"가 없다.
  2. 허용 문장 화이트리스트: `FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A`에 방식 A 안내 3문장과 방식 구분 FAQ·가이드 문장을 그대로 등록한다(C-3에서 문구 확정 때 함께 등록). 방식 A 페이지의 서버 HTML과 동의 후 결과 DOM에서 "사주"가 들어간 텍스트 노드가 모두 이 목록의 문장(또는 2단계 출시 후의 사주 메뉴 라벨)과 일치해야 한다.
  3. 화이트리스트 문장마다 첫 "사주"가 `FORTUNE_SAJU_GLOSS`로 시작한다.
  4. 방식 A 페이지에 "사주"가 단독(괄호 설명 없이)으로 처음 나오는 문장이 없다(plan "괄호 설명 없이 사주만 단독으로 처음 언급하는 문장은 방식 A 화면에 두지 않는다").
- 2단계 사주 화면: "사주 분석" 허용, "정통", "정확한", "전문가 수준", "AI" 금지(AC-58). 방식 B 안내(`FORTUNE_METHOD_B_NOTICE`)에 괄호 설명이 있다. `FORTUNE_SAJU_REDUNDANT_TERMS` 검사는 사주 화면에도 적용한다.
- 화이트리스트에 문장을 더하는 것은 문구 담당(C-3)이 사용자 승인 문구를 넣을 때만 한다. 개발 담당이 검사를 통과시키려고 임의로 늘리지 않는다.

### 8.4 상담전화 기기별 표시 (D15, 타로·운세 공용)

요구 (사용자 결정 2026-11-05, `ui-ux-design.md` S9)
- 터치 상태(모바일·태블릿): 지금처럼 번호를 누르면 `tel:` 링크로 통화 앱이 열린다. 44px 터치 대상.
- PC 상태(마우스·키보드): 링크처럼 보이거나 동작하지 않는다. 번호 글자는 보이고 선택·복사할 수 있다.
- 디자이너 조건: ① JS 없이 서버 HTML만으로 상태가 정해진다(하이드레이션 뒤 전환·깜빡임 금지) ② PC에서 `tel:`이 실행되지 않는다(클릭·키보드 모두) ③ PC에서 링크 역할·탭 정지가 남지 않는다 ④ 한 시점에 한 상태만 접근성 트리에 있다.
- 공용 상수의 `href` 필드는 유지한다.

상태 구분 기준
- CSS 미디어 쿼리 `(hover: hover) and (pointer: fine)`이 참이면 PC 상태, 아니면 터치 상태. 주 입력 장치 기준이라 터치스크린 노트북(주 입력 마우스·트랙패드)은 PC 상태, 마우스를 연결한 태블릿처럼 주 포인터가 fine이면 PC 상태가 된다(번호는 보이므로 정보 손실 없음). 미디어 쿼리를 지원하지 않는 브라우저는 터치 상태(기본값)다.

구분 방식 비교 (조건 ①~④ 기준)

| | 안 1: CSS만, `<a>` 하나에 PC에서 `pointer-events: none` | 안 2: 클릭 핸들러에서 `preventDefault` | 안 3: 서버에서 User-Agent로 판별해 `<a>`/`<span>` 하나만 렌더링 | 안 4 (이전 D15, 폐기): 서버 `<a>` → 하이드레이션 뒤 PC면 `<span>` 교체 | 안 5 (확정): `<a>`와 글자를 함께 렌더링, 미디어 쿼리 `display`로 하나만 보임 |
|---|---|---|---|---|---|
| ① 서버 HTML만으로 상태 결정 | 충족 | 미충족(JS 필요) | 서버가 추정. 미디어 쿼리와 다를 수 있음 | 미충족(JS 뒤 전환, 그 전엔 링크) | 충족(CSS만) |
| ② PC에서 `tel:` 미실행 | 미충족(Tab + Enter로 열림) | 충족(Enter도 click) | 충족 | 하이드레이션 전·JS 끔에서 키보드로 열림 | 충족(링크가 `display: none`이라 클릭·포커스 불가) |
| ③ PC에서 링크 역할·탭 정지 없음 | 미충족 | 미충족(링크로 읽힘) | 충족 | JS 끈 PC·하이드레이션 전 미충족 | 충족 |
| ④ 접근성 트리에 한 상태만 | 충족(하나뿐이지만 PC에서 틀린 역할) | 충족(틀린 역할) | 충족 | 충족 | 충족(`display: none`은 접근성 트리에서 빠짐) |
| 번호 선택·복사(PC) | 나쁨(`pointer-events: none`이면 번호 위 선택이 어려움) | 나쁨(링크 끌기) | 좋음 | 좋음 | 좋음(일반 글자) |
| 하이드레이션 불일치 | 없음 | 없음 | 없음(서버 결정) | 없음(서버 스냅샷 사용) | 없음(두 요소 모두 항상 같은 마크업) |
| 서버 HTML·캐시 | 하나 | 하나 | User-Agent별로 갈려 정적 생성·캐시가 어려움 | 하나 | 하나 |
| JS·훅 필요 | 없음 | 클라이언트 컴포넌트 | 동적 렌더링 | `useFinePointer` 훅 + 클라이언트 컴포넌트 | 없음. 서버 컴포넌트로 쓸 수 있음 |

- 확정: 안 5. 조건 ①~④를 모두 만족하는 유일한 안이다. 안 4(이전 D15)는 JS를 끈 PC와 하이드레이션 전 순간에 링크 역할·탭 정지가 남아 ①·③을 만족하지 못한다. 안 1·2는 PC에서 링크 역할이 남고, 안 3은 미디어 쿼리가 아니라 User-Agent 추정이라 상태가 틀릴 수 있고 캐시·정적 생성을 깨뜨린다.
- PC 키보드: 링크가 `display: none`이라 탭 순서에 없다. Enter로 열릴 대상이 없다. 번호 글자는 포커스 없이 마우스로 선택·복사한다.
- `useFinePointer` 훅은 만들지 않는다(이전 설계의 `src/hooks/use-fine-pointer.hook.ts` 삭제).

공용 컴포넌트 (확정) `src/components/common/crisis-phone.component.tsx` (`CrisisPhoneComponent`, `'use client'` 없음)

```ts
export type CrisisPhoneComponentPropsType = Readonly<{
  phone: CrisisPhoneType;
  /** 터치 상태 링크 안 내용 */
  linkContent: ReactNode;
  /** PC 상태 글자 내용. 이름과 번호가 반드시 들어간다 */
  textContent: ReactNode;
  /** 터치 상태 모양(레이아웃·색). display 관련 클래스는 넣지 않는다(컴포넌트가 붙인다) */
  linkClassName: string;
  /** PC 상태 모양. display 관련 클래스는 넣지 않는다 */
  textClassName: string;
  /** 링크일 때만 쓰는 접근 이름(타로 109 주 버튼). 글자 쪽에는 붙이지 않는다 */
  linkAriaLabel?: string;
}>;
```

- 렌더링(항상 둘 다, 같은 부모 안 형제)
  - `<a href={phone.href} aria-label={linkAriaLabel} className={cn(linkClassName, TOUCH_ONLY)}>{linkContent}</a>`
  - `<span className={cn(textClassName, PC_ONLY)}>{textContent}</span>`
- 표시 클래스(컴포넌트 안 고정 문자열, Tailwind가 소스에서 찾을 수 있게 리터럴로 쓴다)
  - 터치 전용: 기본은 보임, `[@media(hover:hover)_and_(pointer:fine)]:hidden`. 링크의 기존 `display` 값(`flex`, `inline-flex`)은 `linkClassName`이 정하고 PC에서만 `hidden`이 이긴다.
  - PC 전용: 기본 `hidden`, `[@media(hover:hover)_and_(pointer:fine)]:block`(또는 레이아웃에 맞는 `flex`). 어느 값을 쓸지는 `textClassName`의 레이아웃에 맞춰 FE-1이 정하되 `hidden`/표시 쌍은 이 컴포넌트에서만 정한다.
  - 임의 변형을 쓰는 이유: `src/app/globals.css`에 `@custom-variant`를 추가하지 않기 위해서다(공용 CSS 파일 충돌 회피). Tailwind 4 내장 `pointer-fine:`은 `hover: hover` 조건을 포함하지 않아 쓰지 않는다.
  - `display` 숨김만 쓴다. `sr-only`, `visibility`, `opacity`, `aria-hidden`으로 숨기지 않는다(접근성 트리 중복 방지, 조건 ④).
- 숨은 쪽 요소에 `id`를 주거나 `aria-labelledby`/`aria-describedby`로 참조하지 않는다(숨은 요소도 참조 이름 계산에 쓰일 수 있어 중복 낭독 원인이 된다).
- 사용처: 타로 `TarotResultNoticeComponent`(서버 컴포넌트 유지), 타로 `TarotCrisisNoticeComponent`(위기 패널 109 주 버튼과 다른 상담전화 2곳, 기존 클라이언트 컴포넌트 안에서 사용), 운세 `FortuneResultNoticeComponent`(허브·기능 페이지, 서버 컴포넌트).
- 각 `<li>`는 하나이고 그 안에 두 요소가 있다. 목록 항목 수(5)는 바뀌지 않는다.

글자 상태 표시 내용
- 결과 하단 목록: 터치 상태와 같은 배치·순서·글자. 모양만 링크 표시(밑줄, `text-primary`)를 빼고 본문 글자색, 109만 600. 높이는 같은 `min-h-11`을 써 상태가 바뀌어도 위치가 흔들리지 않는다(`ui-ux-design.md` S9).
- 타로 위기 패널 109: 터치 상태는 기존 채운 버튼 "109 전화 연결". PC 상태는 채운 버튼 모양 없이 "자살예방 상담전화 109"를 강조 글자로 보인다(눌리는 것처럼 보이는 모양 금지, 세부 모양 UI-2·Q9).

타로 전용 문구 처리 (확정)
- `TAROT_CRISIS_CALL_LABEL`("109 전화 연결")과 `TAROT_CRISIS_PHONE_ARIA_LABEL`("자살예방 상담전화 109 전화 연결")은 PC에서 전화가 연결되지 않으므로 PC 상태에서는 틀린 말이다. 그래서 두 문구는 터치 상태 링크(`linkContent`, `linkAriaLabel`)에서만 쓰고, PC 상태 글자에는 넣지 않는다. 링크가 PC에서 `display: none`이라 보이는 글자로도 접근성 이름으로도 PC에 노출되지 않는다. 문구 자체는 바꾸지 않는다(터치 상태에서는 맞는 말).
- PC 상태 109 글자는 공용 상수의 `name` + `displayNumber`("자살예방 상담전화 109")로 만든다. 새 문구 상수를 추가하지 않는다.

접근성·SEO·테스트 영향 점검
- 스크린리더 중복 낭독: 없다. 한 시점에 한 쪽만 `display`가 살아 있고, `display: none` 요소는 접근성 트리·탭 순서·브라우저 찾기(Ctrl+F)·복사 범위에서 빠진다. 미디어 쿼리가 바뀌면(마우스 연결 등) CSS가 바로 다른 쪽을 보인다. 이때 포커스가 링크에 있었다면 포커스가 사라질 수 있다(드문 경우, 처리하지 않음).
- 번호 읽기: 보이는 번호(`1577-0199`)를 하나의 텍스트 노드로 두고, `aria-label`로 숫자를 띄워 읽히게 하지 않는다(`ui-ux-design.md` S9, Label in Name). 실기기 읽기 확인은 Q8.
- 터치 대상: 터치 상태 링크는 `min-h-11`/`h-11`(44px) 유지. PC 글자는 누르는 대상이 아니라 WCAG 2.5.8 대상이 아니다.
- 색 대비: PC 글자는 본문 글자색 토큰으로 4.5:1 이상.
- SEO: 서버 HTML에 번호·기관명 글자가 두 번(링크 안, 숨은 글자) 들어간다. 다섯 곳 수십 글자이고 같은 정보를 기기별로 다르게 보이는 일반적인 반응형 패턴이라 키워드 반복·숨김 텍스트 문제로 보지 않는다(사용자에게 숨기는 내용이 아니라 같은 내용의 다른 표현). 크롤러는 `tel:` 링크를 그대로 본다. 페이지 주제 키워드와 무관한 영역이다.
- iOS 자동 전화번호 감지: 터치 상태에서는 숨은 글자가 `display: none`이라 감지 대상이 되어도 보이지 않는다. `format-detection` 메타 태그는 추가하지 않는다(루트 레이아웃 수정 없음).
- e2e 검색 영향
  - `getByRole('link', …)`는 숨은 요소를 기본으로 제외하므로 desktop에서 0개, mobile에서 5개가 된다.
  - `getByText(번호)`·`locator('text=…')`는 숨은 요소도 찾으므로 두 프로젝트 모두 2개가 걸려 strict mode 오류가 난다. 번호 글자 검사는 `.filter({ visible: true })` 또는 역할 기반 검색을 쓴다. 현재 타로 테스트에서 번호를 `getByText`로 찾는 곳은 1893행(패널에 없는 번호의 개수 0 검사)뿐이며, 그 번호는 패널에 렌더링되지 않으므로 영향이 없다.
  - JS를 끈 서버 HTML 문자열 검사(`html.toContain(번호)`)는 그대로 통과한다. DOM의 `a[href^="tel:"]` 개수 검사는 숨은 링크도 세므로 두 프로젝트 모두 5개로 그대로 통과한다(2039~2051행). "보이는 링크" 검사는 `:visible` 또는 `toBeVisible`로 해야 한다.
  - `textContent`로 영역 전체 글자를 모으는 검사는 번호가 두 번 들어간다. 해당 검사를 새로 쓸 때는 `innerText`(숨은 요소 제외)를 쓴다.

영향 범위 (안 5 기준)

| 대상 | 위치 | 변경 | 담당 |
|---|---|---|---|
| 공용 상수·타입 | `src/constants/crisis-phone.constant.ts`, `src/types/crisis-phone.type.ts` | 신규(D4). `href` 유지 | FE-1 |
| 공용 컴포넌트 | `src/components/common/crisis-phone.component.tsx` | 신규(`'use client'` 없음). 훅 파일은 만들지 않는다 | FE-1 |
| 타로 상수 | `src/features/tarot/constants/tarot-notice.constant.ts` | `TAROT_CRISIS_PHONES`·`TarotCrisisPhoneType`·`TAROT_CRISIS_RESULT_LINE` 삭제(공용으로 이동). `TAROT_CRISIS_PHONE_ARIA_LABEL`·`TAROT_CRISIS_CALL_LABEL` 등 타로 전용은 값 그대로 유지(터치 상태 전용으로 사용) | FE-1 |
| 타로 결과 하단 | `src/features/tarot/shared/components/result-notice.component.tsx` | 공용 상수 import, 각 `<a>`를 `CrisisPhoneComponent`로 교체(서버 컴포넌트 유지). PC 상태에서 `Phone` 아이콘 처리는 S9를 따른다 | FE-1 |
| 타로 위기 패널 | `src/features/tarot/shared/components/crisis-notice.component.tsx` | 공용 상수 import, 109 주 버튼과 다른 상담전화 2곳을 `CrisisPhoneComponent`로 교체(109는 `linkContent`에 `TAROT_CRISIS_CALL_LABEL`, `linkAriaLabel`에 `TAROT_CRISIS_PHONE_ARIA_LABEL`) | FE-1 |
| 운세 결과 하단 | `src/features/fortune/shared/components/result-notice.component.tsx` | 처음부터 `CrisisPhoneComponent` 사용 | FE-6 |
| 타로 브라우저 테스트 | `e2e/tarot.spec.ts` | 아래 "타로 테스트 영향" 표 | qa (T-QA) |
| 타로 문구 테스트 | `e2e/tarot-copy.spec.ts` | 공용 `crisis-phone.constant`를 import해 검사 대상(OTHER_TEXTS)에 넣는다. 250행의 `where.includes('TAROT_CRISIS')`는 공용 상수 이름(`CRISIS_PHONES`, `CRISIS_RESULT_LINE`)도 잡도록 고친다. 그렇지 않으면 244~246행 번호 5개 검사와 설명 구절 검사가 D4 이동 뒤 실패한다 | qa (T-QA) |
| 타로 문서 | `docs/tarot/plan.md`(AC-28 표시 방식 보충), `docs/tarot/ui-ux-design.md`(위기 안내 패널, 결과 하단 상담전화, 상담전화 문구 표 `href` 열, 색상 표 링크·109 버튼 행, 컴포넌트 상태 표, 접근성 절의 탭 순서·Label in Name·터치 영역, S5·S6; 대략 241~249, 264~288, 305~306, 358~362, 471, 480행), `docs/tarot/design.md`, `docs/tarot/qa-report.md`(변경 기록) | 기기별 표시 방식 반영. 이 설계서에서는 고치지 않는다 | DOC-3 (planner·ui-ux-designer) |
| 운세 문서 | `docs/fortune/plan.md` AC-34·고지 17, `docs/fortune/ui-ux-design.md` S9 | 18.5 수정·추가 AC, UI-2(S9는 이 설계와 이미 맞음, 구현 방식 확정만 반영) | DOC-2, UI-2 |

타로 테스트 영향 (`e2e/tarot.spec.ts`, desktop = Desktop Chrome = PC 상태, mobile = Pixel 7 = 터치 상태)

| 행(근처) | 검사 | desktop | mobile | 고칠 방향 |
|---|---|---|---|---|
| 39, 1698 | `CRISIS_PHONE_LINK`·`panelPhoneName` 상수 | 영향 없음 | 영향 없음 | U-6: `TAROT_CRISIS_PHONE_ARIA_LABEL`을 상수 파일에서 import |
| 1655~1679 | `PHONES` 사본(`href: 'tel:…'`) | 영향 없음 | 영향 없음 | U-6: 공용 `CRISIS_PHONES`를 import(사본 삭제). `href`는 mobile 검사에 계속 쓴다 |
| 895~900, 913, 922, 1546 | 결과 하단 109를 `getByRole('link')`로 찾고 `href='tel:109'` | 실패(링크가 `display: none`) | 통과 | desktop은 보이는 글자 "자살예방 상담전화 109"가 있고 보이는 `tel:` 링크가 0개인지로, mobile은 그대로 |
| 1142~1162 | 위기 패널 109 링크 `href`와 Tab 순서(109 → 1577-0199 → 1588-9191 → 계속 보기) | 실패 | 통과 | desktop 탭 순서는 번호를 건너뛰고 "계속 보기"로, 번호는 보이는 글자인지 |
| 1706~1724 `expectResultPhones` | 결과 목록 링크 5개·`href`·순서 | 실패 | 통과 | 프로젝트별 분기: desktop은 보이는 목록 글자 5개·순서(`filter({ visible: true })`), mobile은 기존 |
| 1722~1723 | 위기 안내 첫 줄 개수 1, 운영 시간 문구 | 통과 | 통과 | 그대로(안내 줄은 중복 렌더링하지 않음) |
| 1726~1749 `interceptTelClicks`/`readTelClicks` | 헬퍼(문서 클릭에서 `a[href^="tel:"]` 기록) | 헬퍼 자체는 문제없음 | 문제없음 | desktop용 새 검사에 재사용: 번호 글자를 클릭해도 기록이 `[]` |
| 1830~1834, 1837~1843 | 결과 하단 링크 터치 크기·글자 대비 | 실패(보이는 링크 없음) | 통과 | mobile에서만 실행. desktop은 글자 대비만 별도 검사 |
| 1872~1901 | 위기 패널 링크 개수, 109 보이는 글자 "109 전화 연결" | 실패 | 통과 | desktop은 보이는 링크 0개, "자살예방 상담전화 109" 글자, "109 전화 연결"이 보이지 않음 |
| 1893, 1906 | 패널에 없는 번호·설명 개수 0 | 통과 | 통과 | 그대로 |
| 1920~1922 | 위기 패널 링크 포커스 순서 | 실패 | 통과 | mobile에서만 |
| 1935~1957 (AC-29) | 위기 패널 링크를 클릭해 `tel:` 기록 확인 | 실패(보이는 링크 없음) | 통과 | mobile에서만. desktop은 번호 글자 클릭 시 기록 없음 + 패널 유지 검사로 대체 |
| 1990~1995 | 위기 패널 링크 터치 크기 | 실패 | 통과 | mobile에서만 |
| 2020~2035 | JS 끈 서버 HTML에 번호·설명 문자열 | 통과 | 통과 | 그대로 |
| 2039~2051 (2044) | JS 끈 페이지 DOM의 `a[href^="tel:"]` 5개와 번호 | 통과(숨은 링크도 DOM에 있음) | 통과 | 그대로. 단 JS를 꺼도 CSS는 적용되므로 desktop에서 "보이는" 검사로 바꾸면 안 된다 |

- 새 검사(두 프로젝트): 각 번호에 대해 보이는 요소가 하나뿐이고, 접근성 스냅샷(`page.accessibility` 또는 `toMatchAriaSnapshot`)에서 번호가 한 번만 나온다(조건 ④). desktop에서 번호 더블클릭으로 선택된 글자에 번호가 들어 있다. 콘솔 하이드레이션 경고가 없다.
- 확인 필요(QA 첫 실행): Playwright `Pixel 7`에서 `(hover: hover) and (pointer: fine)`이 거짓, `Desktop Chrome`에서 참으로 나오는지 먼저 확인하고 qa-report에 남긴다. 다르게 나오면 테스트에서 `page.emulateMedia`로 맞추지 말고 설계로 되돌린다.

## 9. 데이터 저장 위치

| 데이터 | 위치 | 이유 |
|---|---|---|
| 문구 풀(개인·공통·띠·별자리·십신), 고지·FAQ·설명·SEO 문구(허브 포함), 띠·별자리·천간·지지 정보, 행운 대응표, 십신 기본 점수, 경로 상수, 지원 범위 상수 | 코드 상수 (`features/fortune/constants/`) | 모두에게 같고 개발 중 작성·검수한 정적 데이터다. 접속 시 생성하지 않는다(plan 결정 3) |
| 상담전화 5곳 | 코드 상수 (`src/constants/crisis-phone.constant.ts`, 공용) | 타로·운세가 같은 값을 쓴다(D4) |
| 허브 운세 목록 | 코드 상수 (`src/constants/menu.constant.ts`의 운세 그룹 `items`) | 메뉴·sitemap·허브가 한 목록을 같이 쓴다(로또 허브 선례) |
| 음력 표(1919~2049), 24절기 시각 표(1920~2028) | 코드 상수 (`constants/calendar/`) | 모두에게 같은 사실 정보. 서버 조회를 하면 생년월일이 요청에 섞일 위험이 생기므로 내장한다(plan 예외 조항) |
| 생년월일, 양력/음력·윤달, 태어난 시각, 시각 모름 선택, 후보 선택 | 메모리(화면 hook state)만 | plan 결정. 서버, localStorage, sessionStorage, 쿠키, URL, 전역 store, 분석 이벤트 모두 금지 |
| 만 나이·연령 판정 결과 | 렌더링·액션 처리 중 계산값 | 저장하지 않는다(AC-47) |
| 운세 결과(점수·문구·행운) | 렌더링 중 계산값 | 입력 + 날짜로 언제든 같은 값이 나온다(AC-2) |
| PC/터치 상태 | 저장 없음. CSS 미디어 쿼리만 | JS 상태가 필요 없다(D15) |
| 이용 동의 상태 | sessionStorage 키 1개 (`<site>_fortune_consent_v1`: v, 버전, 동의 시각) | D2. 탭 동안만 필요한 작은 상태(`data-storage.md` sessionStorage 기준). 개인 식별 정보 아님 |
| 동의 화면 체크 3개의 선택 상태 | 메모리(동의 폼 state) | 진행 중 입력. 저장하지 않는다 |
| 동의 거부 | 저장 안 함 | plan |
| localStorage, IndexedDB, 쿠키, Supabase | 쓰지 않음 | 해당 데이터 없음. 회원가입 없는 기능 |

## 10. API 계약

없음.

근거: plan상 서버로 보내거나 저장하는 데이터가 없고, 모든 계산이 정적 표와 순수 함수로 브라우저에서 끝난다. 허브는 정적 서버 페이지다. KASI API는 개발 시점 스크립트(`scripts/fortune-calendar/`)에서만 호출하고 런타임(사용자 접속)에는 호출하지 않는다. `features/fortune/`는 `http`(axios), `fetch`, React Query를 쓰지 않는다. rate limit 대상도 없다.

| 메서드 | 경로 | 요청 | 응답 | 에러 |
|---|---|---|---|---|
| 없음 | | | | |

## 11. DB 스키마

없음. 테이블, 컬럼, 인덱스, RLS 정책, 마이그레이션 모두 없다(회원가입·서버 저장 없음, `data-storage.md` 기준).

## 12. 프론트 구조

### 12.1 페이지 (서버/클라이언트 구분)

| 경로 | 파일 | 렌더링 |
|---|---|---|
| `/fortune/*` 공통 | `src/app/fortune/layout.tsx` (신규) | 서버 레이아웃. `FortuneConsentProvider`(클라이언트)로 children을 감싼다. h1이나 문구를 그리지 않는다 |
| `/fortune` | `src/app/fortune/page.tsx` (신규) | 서버 컴포넌트만(클라이언트 경계 없음). `export const metadata = buildMetadata(...)`. 게이트 없음(7.4) |
| `/fortune/today` | `src/app/fortune/today/page.tsx` (수정) | 서버 컴포넌트. `ComingSoonComponent`와 `robots` noindex 제거 |
| `/fortune/tti` | `src/app/fortune/tti/page.tsx` (신규) | 서버 컴포넌트 |
| `/fortune/star-sign` | `src/app/fortune/star-sign/page.tsx` (신규) | 서버 컴포넌트 |
| `/fortune/saju` | `src/app/fortune/saju/page.tsx` (2단계 신규) | 서버 컴포넌트 |

- 기능 페이지의 클라이언트 경계는 각 화면의 `root.component.tsx`뿐이다. root는 `FortuneConsentGateComponent`와 `next/dynamic`으로 불러온 panel만 가진다. 서버 컴포넌트(안내·가이드·FAQ·오늘의 운세 링크·상담전화)는 root 안에서 import하지 않고 page에서 형제로 렌더링한다.
- panel 지연 로드 중에는 기능 영역 자리 스켈레톤(`loading` 옵션)을 보인다.

### 12.2 컴포넌트 트리

```
FortunePage (서버, /fortune)
└ ContentWrapperComponent type="fortune"
  ├ JsonLdComponent [jsonLdBreadcrumb(홈 > 운세), ItemList(운세 그룹 items), jsonLdFaq(FORTUNE_HUB_FAQ)]
  ├ TitleWrapperComponent type="fortune" title="운세"                 ← 유일한 h1
  ├ FortuneDisclaimerNoticeComponent                                  (서버, 상시 면책)
  ├ FortuneHubComponent                                               (서버)
  │  ├ MenuListComponent items={운세 그룹 items}                       (오늘의 운세 / 띠별 운세 / 별자리 운세)
  │  └ 허브 설명 (FORTUNE_HUB_GUIDE)
  ├ FortuneFaqComponent items={FORTUNE_HUB_FAQ}                       (서버)
  ├ FortuneResultNoticeComponent                                      (서버, 짧은 면책·책임 고지 + 상담전화 5곳)
  │  └ CrisisPhoneComponent × 5                                       (서버, 링크 + 글자를 함께 그리고 CSS로 하나만 보임, 8.4)
  └ FortuneDetailNoticeComponent                                      (서버, 이용 안내 9항)

FortuneTodayPage (서버, /fortune/today)
└ ContentWrapperComponent type="fortune"
  ├ JsonLdComponent [jsonLdBreadcrumb(홈 > 운세 > 오늘의 운세), jsonLdFaq(FORTUNE_TODAY_FAQ)]
  ├ TitleWrapperComponent type="fortune" title="오늘의 운세"          ← 유일한 h1
  ├ FortuneDisclaimerNoticeComponent                                  (서버, AC-33)
  ├ FortuneInputNoticeComponent                                       (서버, AC-31)
  ├ FortuneNoscriptNoticeComponent                                    (서버, <noscript>)
  ├ FortuneTodayComponent ('use client', root)
  │  └ FortuneConsentGateComponent
  │     ├ checking: 스켈레톤
  │     ├ required: FortuneConsentFormComponent
  │     ├ declined: FortuneConsentDeclinedComponent
  │     └ granted: FortuneTodayPanelComponent (next/dynamic, ssr:false)
  │        ├ FortuneBirthFormComponent          (step input, 오류 안내, 윤달 안내)
  │        ├ FortuneAgeBlockedComponent         (step age-blocked)
  │        ├ FortuneLunarConfirmComponent       (음력 입력일 때)
  │        ├ FortuneReadingComponent            (step done, 방식 A 안내 포함)
  │        ├ FortuneLuckyComponent              (행운 요소 + 로또 고지 + 링크)
  │        └ /fortune/tti, /fortune/star-sign 링크 (AC-11)
  ├ FortuneResultNoticeComponent                                      (서버, 항상. 상담전화는 CrisisPhoneComponent)
  ├ FortuneTodayGuideComponent                                        (서버)
  ├ FortuneCalcBasisComponent                                         (서버, 지원 출생 연도 포함)
  ├ FortuneFaqComponent items={FORTUNE_TODAY_FAQ}                     (서버)
  ├ FortuneDetailNoticeComponent                                      (서버, AC-48)
  └ FortuneConsentResetComponent                                      ('use client', granted일 때만)

FortuneTtiPage (/fortune/tti) / FortuneStarSignPage (/fortune/star-sign): 오늘의 운세와 같은 틀에 아래가 다르다
  ├ root → panel:
  │   ├ FortuneTtiListComponent (12띠 결과, 선택)                       / FortuneStarSignListComponent
  │   ├ FortuneTtiFinderComponent (폼 → 연령 → 시각/후보 → 결과 + 설날 기준 안내) / FortuneStarSignFinderComponent
  │   └ 기준 차이 안내(AC-19), 계산 기준 안내 문장
  ├ FortuneResultNoticeComponent                                      (서버)
  ├ FortuneTodayLinkComponent                                         (서버, "생년월일로 보는 오늘의 운세" → /fortune/today, D12)
  └ guide: FortuneTtiGuideComponent / FortuneStarSignGuideComponent, 이후 CalcBasis, FAQ, DetailNotice, ConsentReset

FortuneSajuPage (2단계, /fortune/saju): 오늘의 운세와 같은 틀. panel에 Pillars, Elements, TenGod, Reading(방식 B 안내 포함), Lucky. CalcBasis는 사주 항목 전체(AC-56, 자시 처리 문장은 4.9 상수에 따름, 지원 출생 연도 포함).
```

- 한 페이지 h1은 `TitleWrapperComponent` 하나다. `PageHeaderComponent`와 같이 쓰지 않는다(AC-63).
- 설명 콘텐츠는 페이지당 한국어 약 600자 이상(허브 포함).
- 띠·별자리 아이콘(F-21, 선택): 쓰면 자체 제작 인라인 SVG, 색은 `currentColor`·토큰만, `role="img"` + 새로 쓴 `aria-label`. 넣을지는 `ui-ux-design.md`를 따른다.
- 2단계 한자 표시: 새 웹폰트를 넣지 않는다. Pretendard에 한자가 없으면 시스템 글꼴로 대체 표시된다(배포하지 않으므로 라이선스 문제 없음).
- 2단계 사주 h1·기둥 표 캡션·가이드 제목은 8.3 규칙을 따른다(예: h1 "사주", 표 캡션 "연·월·일·시 기둥").
- `FortuneTtiGuideComponent`의 "12띠와 출생 연도 대응" 표는 1920~2028년 범위만 보인다(D14).

### 12.3 상태 위치

| 상태 | 위치 | 방식 |
|---|---|---|
| 이용 동의 상태 | `FortuneConsentProvider` (fortune 레이아웃) | `useReducer` + Context, sessionStorage 연동 (6장). 허브는 읽지 않는다 |
| 동의 체크 3개 | `FortuneConsentFormComponent` | `useState` |
| 생년월일 폼 값 | 각 panel/finder의 react-hook-form | 메모리만 |
| 윤달 선택 가능 여부 | `FortuneBirthFormComponent` | 폼 값(연·월)에서 렌더링 중 계산(`getLunarLeapMonth`). 상태 아님 |
| 입력 흐름 단계·양력 날짜·후보 | `useBirthFlow` (화면 단위) | `useReducer` (7.2) |
| 띠·별자리 목록에서 선택한 키 | 각 list 컴포넌트 | `useState` |
| KST 날짜 키 | `useKoreaDateKey` | `useState` + 1분 간격·`visibilitychange` |
| PC/터치 상태 | 없음 | CSS 미디어 쿼리만(8.4). JS 상태 없음 |
| 운세 결과, 만 나이, 설날 기준 띠, 서머타임 안내 여부 | 렌더링 중 계산 | 상태 아님 |
| 허브 | 상태 없음 | 서버 렌더링 |

- 전역 store(zustand), React Query는 쓰지 않는다. `<Activity>`는 필요 없다.

## 13. SEO

### 13.1 페이지별

| URL | title | description | JSON-LD | sitemap 등록 |
|---|---|---|---|---|
| `/fortune` | 운세 - 오늘의 운세, 띠별 운세, 별자리 운세 | 생년월일로 보는 오늘의 운세와 12띠·12별자리의 오늘 운세를 한곳에서 볼 수 있습니다. 로그인 없이 이용할 수 있고 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, ItemList, FAQPage | 예 (운세 그룹 `href`, `comingSoon` 해제로 자동) |
| `/fortune/today` | 오늘의 운세 - 생년월일로 보는 무료 오늘의 운세 | 로그인 없이 생년월일만으로 오늘의 총운과 재물·애정·직장·건강 운세, 행운의 색·숫자·방향을 확인할 수 있습니다. 입력한 생년월일은 저장되지 않습니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 예 (기존 항목) |
| `/fortune/tti` | 띠별 운세 - 오늘의 띠별 운세와 내 띠 찾기 | 쥐띠부터 돼지띠까지 12띠의 오늘의 운세를 볼 수 있습니다. 입춘 시각을 기준으로 내 띠를 찾고, 설날 기준과 다른 경우도 함께 알려 드립니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 예 (항목 추가) |
| `/fortune/star-sign` | 별자리 운세 - 오늘의 별자리 운세와 내 별자리 확인 | 12별자리의 오늘의 운세를 볼 수 있습니다. 해마다 조금씩 달라지는 별자리 경계 시각을 반영해 내 별자리를 찾아 드립니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 예 (항목 추가) |
| `/fortune/saju` (2단계) | 사주 만세력 - 생년월일시로 보는 무료 사주와 오늘의 사주 운세 | 생년월일과 태어난 시간으로 사주(태어난 연·월·일·시로 세우는 네 기둥)와 오행 분포를 계산하고, 오늘의 일진과 비교한 오늘의 사주 운세를 보여 드립니다. 계산 기준도 함께 안내합니다. 오락·참고용 콘텐츠입니다. | BreadcrumbList, FAQPage | 2단계 출시 때 항목 추가 (그 전에는 넣지 않음) |

- 렌더링: 모든 페이지가 서버 컴포넌트. 허브는 전부 서버 HTML. 기능 페이지는 운세 문구·점수·개인 결과만 클라이언트(동의 후)에서 그리며 별도 URL이 없다. 상담전화는 서버 HTML에 터치용 `tel:` 링크와 PC용 글자가 함께 있고 CSS로 하나만 보인다(8.4).
- 메타데이터: `buildMetadata({ title, description, pathname, keywords, ogImage: { alt } })`. 값은 `fortune-seo.constant.ts`(금지 표현·"사주" 용어 검사 대상), `pathname`은 `FORTUNE_ROUTES` 값.
  - `ogImage.alt`: 허브 "오늘의 운세와 띠별·별자리 운세 모아 보기", "생년월일로 보는 오늘의 운세", "12띠 오늘의 띠별 운세", "12별자리 오늘의 별자리 운세", (2단계) "연·월·일·시 기둥과 오늘의 사주 운세". `tag`는 생략(`getOgTag`: `/fortune`은 그룹 라벨 "운세", 나머지는 항목 라벨).
  - `keywords`: 허브 = 운세, 무료 운세, 오늘의 운세, 띠별 운세, 별자리 운세. 나머지는 plan "검색 노출" 키워드 그대로. 신년운세·토정비결은 쓰지 않는다.
  - "사주" 용어(8.3): 단어 "사주" 자체는 금지 표현이 아니다. 금지는 "사주 분석", "사주 풀이", "맞춤 풀이" 같은 특정 구와 "정통", "정확한 맞춤"이다. 허브와 방식 A 페이지(오늘의 운세, 띠, 별자리)의 title·description·OG alt·keywords·Breadcrumb·ItemList에는 plan 용어 표에 따라 "사주"를 아예 쓰지 않는다(FAQPage JSON-LD는 화면 FAQ 허용 문장과 같을 때만 허용). 2단계 사주 페이지 메타데이터는 "사주"와 "사주 분석"을 쓸 수 있지만 "사주 네 기둥", "사주 4기둥"은 쓰지 않고, 처음 설명할 때 "사주(태어난 연·월·일·시로 세우는 네 기둥)"로 쓴다.
- JSON-LD: `JsonLdComponent` + `jsonLdBreadcrumb`, `jsonLdFaq`(화면과 같은 상수). 리뷰·평점 없음.
  - Breadcrumb(D7): `/fortune` = 홈(`/`) > 운세(`/fortune`). `/fortune/today` = 홈 > 운세(`/fortune`) > 오늘의 운세(`/fortune/today`). `/fortune/tti` = 홈 > 운세 > 띠별 운세(`/fortune/tti`). `/fortune/star-sign` = 홈 > 운세 > 별자리 운세(`/fortune/star-sign`). `/fortune/saju` = 홈 > 운세 > 사주(`/fortune/saju`). `item`은 `canonicalUrl(pathname)`.
  - 허브 ItemList: 로또 허브(`src/app/lotto/page.tsx`)와 같은 형식(`ListItem`의 position, name=항목 라벨, url, description). 목록이 `MENU_LIST`에서 오므로 1단계에는 사주가 없다.
- `MENU_LIST` 수정 (`src/constants/menu.constant.ts`)
  - 운세 그룹 `comingSoon: true` 삭제. 그룹 `href`를 `` `/${MENU_GROUP_NAME_ENUM.FORTUNE}/today` ``에서 `` `/${MENU_GROUP_NAME_ENUM.FORTUNE}` ``(= `/fortune`)으로 바꾼다(로또 그룹과 같은 형식). 헤더·모바일 메뉴의 그룹 링크(`href || items[0]?.href`)가 허브로 간다.
  - 기존 "오늘의 운세" 항목의 `colorClass`를 `text-amber-600`(토큰 밖)에서 `text-menu-fortune`로 바꾼다. `example`·description은 `ui-ux-design.md` 확정값을 따른다. 방식 A 항목의 description에는 "사주"를 쓰지 않는다.
  - 항목 추가: `` `/${MENU_GROUP_NAME_ENUM.FORTUNE}/tti` `` "띠별 운세", `` `/${MENU_GROUP_NAME_ENUM.FORTUNE}/star-sign` `` "별자리 운세" (`colorClass: 'text-menu-fortune'`, 아이콘은 `ui-ux-design.md`, `MENU_ICONS`에 없으면 lucide-react에서 추가).
  - `/fortune/saju`는 2단계 출시(4.9 R-1 확정 포함) 전에는 추가하지 않는다. 추가하면 허브 목록·메뉴·sitemap에 함께 나타난다. 그 항목의 라벨은 "사주"(허용 위치), description은 8.3 규칙을 따른다.
  - 메뉴 수정은 문구 풀 작성·검수가 끝난 뒤에 한다(빈 문구 상태로 sitemap에 노출되지 않게).
- sitemap: `src/app/sitemap.ts`는 수정하지 않는다. `comingSoon` 해제로 그룹 href `/fortune`과 항목 `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`이 자동 포함된다(우선순위 0.6). `/fortune/saju`는 2단계 메뉴 추가 때 자동 포함된다.
- URL 소문자·하이픈, 기존 노출 URL 변경 없음(`/fortune/today`는 noindex였고 URL 유지) → redirect 없음. 루트 `layout.tsx`는 수정하지 않는다.

### 13.2 동의 게이트와 검색 노출 (plan 열린 질문 2, 결정 완료)

- 구조 가능 여부: 가능하다. 기능 페이지의 서버 HTML에는 h1, 상시 면책, 설명, 계산 기준, FAQ, 이용 대상·상세 안내, 오늘의 운세 링크(띠·별자리)가 동의와 관계없이 들어가고, 입력·선택·결과(panel)는 `ssr: false` 지연 로드라 서버 HTML과 RSC 페이로드에 없다. JS를 끈 환경에서는 `<noscript>` 안내가 나온다(AC-62, AC-72). 허브는 게이트가 없고 전부 서버 HTML이다.
- (가) 운세 문구를 서버 HTML에 둘지: 두지 않는다(D3, 사용자 확정). 검색 유입은 허브와 각 페이지의 설명 콘텐츠에 의존한다.
- (나) 게이트 형태: 페이지 안 기능 영역 대체. 전체 화면 오버레이나 다이얼로그는 본문을 가려 방해형 전면 노출(intrusive interstitial)로 평가될 수 있어 쓰지 않는다.
- (다) 크롤러와 사용자 화면 차이: 서버는 사용자·크롤러를 구분하지 않고 같은 HTML을 준다(user-agent 분기 없음). JS를 실행하는 크롤러는 동의가 없는 첫 방문자와 똑같이 동의 화면을 본다. 클로킹 문제는 없다. 상담전화의 기기별 표시도 같은 HTML에 CSS 미디어 쿼리만 다르게 적용되는 반응형 방식이다(8.4).
- 내부 링크: 허브 → 세 기능 페이지, 띠·별자리 → 오늘의 운세 링크가 모두 서버 HTML에 있어 크롤러가 따라갈 수 있다. 오늘의 운세 → 띠·별자리 링크(AC-11)는 결과 안(동의 후)에만 있지만 허브·메뉴 링크로 대신 발견된다.
- 쿠키 배너와 겹침(AC-78): 동의 화면은 페이지 흐름 안에 있어 하단 고정 쿠키 배너가 떠도 스크롤로 버튼에 닿을 수 있어야 한다(`ui-ux-design.md`).

## 14. 보안

- RLS: 해당 없음(DB 없음).
- 시크릿·환경변수: 런타임 새 환경변수 없음. 기존 `NEXT_PUBLIC_SITE_ENG_NAME`(공개값)만 저장 키 접두사로 쓴다. 개발용 `DATA_GO_KR_API_KEY`는 스크립트 전용 비밀값으로 `NEXT_PUBLIC_`을 붙이지 않고, 앱 코드(`src/`)에서 읽지 않으며, 저장소에 커밋하지 않는다(`.env.example`에는 키 이름만 추가). 스크립트는 `.env` 파일을 읽지 않고 키 값을 출력·기록하지 않는다.
- 입력 검증: zod 스키마(정수, 범위: 연 1920 ~ `min(오늘 연도, 2028)`, 월 1~12, 일 1~31, 시 0~23, 분 0~59) + 4.3 파이프라인. 서버로 가지 않으므로 서버 검증은 없다. sessionStorage 값은 신뢰하지 않고 6.3 검증을 통과한 값만 쓴다. 스크립트는 KASI 응답을 숫자 범위·건수·절기 이름으로 검사한 뒤에만 파일을 쓴다(4.1).
- XSS: 모든 문구·입력은 React 텍스트로만 렌더링한다. `dangerouslySetInnerHTML`은 기존 `JsonLdComponent`(정적 상수)에서만 쓰고 사용자 입력을 JSON-LD에 넣지 않는다. 상담전화 `href`는 상수 값만 쓴다.
- 데이터 유출 방지 (동의 항목 3의 사실성, plan "사실과 일치해야 하는 항목")
  - `features/fortune/`에서 `http`, `fetch`, React Query, 분석·알림 모듈을 import하지 않는다.
  - 생년월일·시각·나이·판정 결과를 URL, `console.*`, 오류 메시지, aria-live 공지, `document.title`, 저장소, 분석·알림 이벤트에 넣지 않는다.
  - 폼은 네이티브 제출을 하지 않는다(7.1). 입력칸 `autoComplete="off"`.
  - 페이지 간 링크(허브, 오늘의 운세 링크, AC-11 링크)에 쿼리·해시를 붙이지 않는다.
  - QA는 AC-27~AC-29, AC-47을 네트워크 가로채기와 저장소 덤프로 검사한다.
- API 남용 방지: API가 없으므로 rate limit 없음. 런타임에 KASI를 호출하지 않는다.
- 브라우저 저장소: sessionStorage 키 1개(동의 여부·버전·동의 시각). 민감정보·개인정보 없음.
- CSP: 새 외부 도메인 없음. 지연 로드 청크는 같은 출처다. `next.config.ts` 변경 없음.
- 광고: 운세 페이지(허브 포함)에 광고 슬롯을 추가하지 않는다(루트 레이아웃 슬롯만, 페이지당 4개 이하). 운세 코드는 쿠키 동의·광고 로드 결과에 의존하지 않는다.

## 15. 상업적 이용·라이선스

| 자료 | 출처 | 라이선스 | 상업적 이용 |
|---|---|---|---|
| 음력 표(1919~2049), 24절기 시각 표(1920~2028) | KASI 음양력 정보(15012679)·특일 정보(15012690) Open API (공공데이터포털) | 두 API 모두 이용허락범위 "제한 없음"(사용자 확인, 2026-11-05). 천체·절기 계산 결과는 사실 정보 | 가능으로 판단. 약관 전문(코드 상수로 넣어 배포하는 재배포 조건 포함)은 출시 전 법률 확인 범위(법률 확인 필요, 위험 낮음) |
| 띠·별자리·천간·지지·십신·오행 규칙 | 일반 이론 | 보호 대상 아님(리서치 7.1) | 가능 |
| 문구 풀, 고지·FAQ·설명(허브 포함) | 자체 작성 (AI 초안 + 사용자 검수, 외부 풀이 문장 미참조) | 자체 저작물 (AI 작성물 권리 귀속 불명확, plan 위험 수용) | 가능. 유사 문장 샘플 점검 |
| 행운 대응표, 점수 규칙, 십신 기본 점수 | 자체 규칙 (가이드 6.2 예시값 그대로 쓰지 않음) | 자체 | 가능 |
| 시드 해시·난수 알고리즘 (FNV-1a, mulberry32) | 공개 알고리즘, 코드는 새로 작성 | 퍼블릭 도메인 알고리즘 | 가능 |
| 띠·별자리 SVG (F-21, 쓰는 경우) | 자체 제작 | 자체 | 가능 |
| lucide-react (메뉴·UI 아이콘) | 기존 의존성 | ISC | 가능 |
| Pretendard | 기존 CDN | SIL OFL 1.1 | 가능. 새 폰트 없음 |
| 상담전화 5곳 | 공공 정보 | 사실 정보 | 가능. 출시 전 번호·운영 시간 재확인 |
| 새 npm 라이브러리 | 없음 (D1) | | |

- 개인정보 처리: 서버 수집·전송 없음. 브라우저 저장은 sessionStorage의 동의 상태(동의 여부·버전·동의 시각)뿐이다. 허브는 아무것도 저장하지 않는다. 만 14세 미만 처리, 동의 게이트(보관 방식 포함), 책임 고지 문구, 로또 연결 표현, KASI 약관 전문은 출시 전 법률 확인 범위다(plan 결정 7).
- 갱신 대상 문서·코드 위치 (개발 단계에서 갱신)

| 대상 | 위치 | 추가 내용 |
|---|---|---|
| 개인정보처리방침 | `src/app/privacy/page.tsx` 1장 "수집 항목 및 방법" | 운세 생년월일·태어난 시각은 서버로 전송·저장하지 않고 브라우저 메모리에서만 쓴다 |
| | 같은 파일 브라우저 저장소 절 | "운세 이용 동의: 동의 여부, 동의한 안내문 버전, 동의 시각만 이 탭(sessionStorage)에 저장하며 탭을 닫으면 삭제됩니다. 생년월일은 저장하지 않습니다." |
| | 10장 "어린이의 개인정보" | 운세는 만 14세 이상 이용자 대상, 이용 전 확인 절차와 생년월일 기반 확인(저장 안 함) |
| | `EFFECTIVE_DATE` | 변경일 |
| 이용약관 | `src/app/terms/page.tsx` | 1장 서비스 개요에 운세 추가, 새 장 "운세 서비스": 오락·참고용, 이용 동의, 결과에 따른 판단·선택은 이용자 본인(전면 면책 표현 금지), 만 14세 이상 대상, 지원 출생 연도(1920~2028년), 비제휴. `EFFECTIVE_DATE` |
| COMPLIANCE.md | 1장 | 운세: 쿠키 동의와 무관, 생년월일 비전송·비저장, sessionStorage 동의 키 1개 |
| | 2장 "Age Gate (Lottery)" | 문서 오류 정정(확정, 18장): "30-day TTL"을 실제 동작(sessionStorage `<site>_age_gate_verified_sess_v1`, `NEXT_PUBLIC_AGE_GATE_MODE`, 개발 환경 기본 `always`)으로 고친다 |
| | 7장 Robots and SEO | 운세 페이지(`/fortune` 허브 포함) 색인 대상, 운세 문구는 서버 HTML에 없음 |
| | 11장 Disclaimers | 운세 고지 위치(허브 포함), 상담전화(타로·운세 공용, 터치 기기 전화 연결·PC 글자 표시), 금지 표현 목록 위치, "사주" 용어 규칙, 로또 링크 고지 |
| | "Last updated" | 갱신 |
| THIRD_PARTY_NOTICES.md | 새 절 "Original content and data (Fortune)" | 문구 자체 작성(copy-log 위치), 달력 표 출처 KASI 공공데이터 두 API(조회일, 범위 음력 1919~2049·절기 1920~2028, 이용허락범위 "제한 없음"), 새 의존성·폰트·아이콘 세트 없음, 비제휴 |
| DEPENDENCY_LICENSES.md | 변경 없음 | 새 의존성 없음 |
| README.md | 16.2 | |
| docs/fortune/plan.md | 18장 "달라지는 AC"와 "추가 AC", 지원 출생 연도, 상담전화 표시 방식, 로또 AgeGate 기재, 열린 질문 1·2, 범위·검색 노출 절에 허브 추가 | 승인된 설계 결정에 맞게 고친다(DOC-2, planner) |
| docs/fortune/ui-ux-design.md | 허브 화면, 띠·별자리 오늘의 운세 링크(7.4, 7.5), 연도 범위·윤달 안내(4.3), 상담전화 S9(8.4 구현 방식 확정 반영) | 디자이너 열린 질문 Q1·Q2 해소. 화면 명세 추가(UI-1, UI-2, ui-ux-designer) |
| docs/tarot/* | plan AC-28 보충, ui-ux-design 상담전화 명세, design, qa-report | 상담전화 기기별 표시(8.4 영향 범위, DOC-3) |

## 16. 의존성·README

### 16.1 의존성 추가 목록

- 런타임·개발 의존성 추가 없음. `package.json`, `pnpm-lock.yaml` 변경 없음.
- 생성 스크립트는 Node 24 내장 `fetch`만 쓴다.

### 16.2 README.md 갱신 항목

- "기능" 절: 운세(허브 `/fortune`, 오늘의 운세 `/fortune/today`, 띠별 운세 `/fortune/tti`, 별자리 운세 `/fortune/star-sign`, 2단계 사주 `/fortune/saju`) 추가.
- "환경변수" 표: `DATA_GO_KR_API_KEY` — "공공데이터포털 인증키. 운세 달력 표 생성 스크립트 전용(개발 시점). 런타임에 쓰지 않음".
- "API" 표, "데이터베이스" 절: 변경 없음.
- 새 절 "운세 달력 데이터": 표 위치(`src/features/fortune/constants/calendar/`), 출처(KASI 음양력 정보·특일 정보), 범위(음력 1919~2049, 절기 1920~2028, 지원 출생일 1920-01-01~2028-12-31), 다시 만드는 방법(`DATA_GO_KR_API_KEY=... node scripts/fortune-calendar/generate.mjs` 후 `verify.mjs`), 후속 작업 F-1(기한 2028-12-01, 4.10)과 만료 감시 테스트, 검증 기록 위치(`docs/fortune/calendar-verification.md`).

## 17. 테스트 대상

### 17.1 단위 테스트가 필요한 순수 함수·상수

위치: `e2e/fortune-calc.spec.ts`(qa 작성, 브라우저 없이 import해 검사, D6). 데스크톱 프로젝트에서만 돌린다(`test.skip(testInfo.project.name !== 'desktop')`).

| 모듈 | 함수 | 꼭 넣을 사례 |
|---|---|---|
| fortune-date | `isValidSolarDate`, `toJulianDayNumber`, `fromJulianDayNumber`, `compareYmd`, `parseDateKey` | 2월 29일(윤년/평년), 2000-01-01 JDN 2451545, 왕복 변환 |
| | `calculateFortuneManAge` | AC-42, AC-43 사례, 2월 29일생 평년 2/28 → 아직 생일 전, 3/1 → 지남 |
| fortune-lunar | `convertLunarToSolar`, `getSeollalDate`, `getLunarLeapMonth`, `getLunarMonthLength` | AC-7 두 사례, 음력 2023년 윤2월(평달·윤달 1일이 서로 다른 양력), 윤달 없는 달 + 윤달 체크 → `lunar-no-leap`, 29일 달의 30일 → `lunar-invalid-day`, 연도당 윤달 0~1개 |
| fortune-birth | `resolveFortuneBirth` | 빈 값, 2월 30일, 미래(오늘 이후 2028년 이내 날짜) → `future`, 1919-12-31 → `before-min`, 양력 2029-01-01 → `after-max`, 음력으로 입력해 양력 2029년이 되는 날짜 → `after-max` (AC-8, AC-9) |
| calendar 표 | 표 자체 검사 | 4.1 "표 자체 검사"와 "알려진 값 대조" 전부 |
| fortune-solar-term | 절기 조회, 경계일 판정 | 2025 입춘 02-03 23:10, 1920 입춘 02-05 11:26, 2029년 조회 → `null` |
| fortune-tti | `getTtiKeyByYear`, `determineFortuneTti`, `resolveFortuneTtiWithTime`, `getSeollalTti` | AC-14~AC-16, 2024-02-05~09(입춘 후·설날 전), 2029-02-04 → `unsupported` |
| fortune-star-sign | `determineFortuneStarSign`, `resolveFortuneStarSignWithTime` | AC-22~AC-24, 1월 초(염소), 12월 말(염소), 1920-01-05(염소, 1919 표 없이), 2029-03-20 → `unsupported` |
| fortune-seed | `hashFortuneSeed`, `createFortuneRng`, `toFortuneScore`, `getFortuneBand`, `pickFortuneVariant` | 같은 입력 같은 출력, 점수 30·95 경계, 구간 54/55/74/75 |
| fortune-reading | `buildFortuneReading` | 결정성(AC-2), 연속 7일 총운이 모두 같지 않음(AC-4), 점수 30~95 정수(AC-5), 행운 숫자 1~2개·1~10(AC-6), 문구가 해당 구간 풀에 있음 |
| fortune-route | `FORTUNE_ROUTES`와 `MENU_LIST` 운세 그룹 | 그룹 `href === FORTUNE_ROUTES.hub`, 항목 href가 `today`·`tti`·`starSign`과 같음, 1단계에는 `saju` 항목 없음(D8, D11) |
| 지원 범위 (D14, 4.10) | `FORTUNE_SUPPORTED_MAX_YEAR`, 절기·음력 표 | 상수 = 절기 표 마지막 연도, 절기 표 첫 연도 1920, 음력 표가 1919 ~ 상수+1 이상을 덮음 |
| 2029년 이후 동작 (4.10) | 오늘 = 2029-01-01, 2030-06-15 모의 | 개인 일운·12띠·12별자리 결과가 정상 생성됨, 출생 2028-12-31 통과·2029-01-01 `after-max` |
| 만료 감시 (4.10) | 실제 KST 오늘과 `FORTUNE_SOLAR_TERM_RENEW_BY` | 오늘 ≥ 2028-12-01이고 상수 < 오늘 연도+1이면 실패, 메시지 "절기 표 보완(F-1) 기한이 지났습니다" |
| 공용 상담전화 (D4) | `CRISIS_PHONES` | 5곳 순서(109, 1577-0199, 1588-9191, 1388, 1366), 각 `href`가 `tel:` + 숫자만, `number`의 숫자와 `href` 숫자가 같음 |
| fortune-consent-storage | `readFortuneConsent`, `writeFortuneConsent` | 손상값·버전 불일치 삭제, 필드 3개 외 없음 (브라우저 테스트로) |
| (2단계) fortune-saju | `getDayPillar`, `getYearPillar`, `getMonthPillar`, `getHourBranch`, `getHourPillar`, `buildFortuneSajuCharts`, `getFortuneTenGod`, `countFortuneElements`, `shouldShowFortuneDstNotice` | 2000-01-01 무오, 2026-11-05 계미, `verify.mjs`가 모은 `lunIljin` 표본, AC-50·51·53, 십신 100조합 표, 서머타임 연도 경계(1947/1948, 1961/1962, 1986/1987, 1988/1989), 23시대 시주: 갑일 23:30이 `same-day` 갑자·`next-day` 병자, 00:30은 두 방식 모두 그날 기준(4.9), 1920-01-03 월주 자월, 2029년 출생 → `unsupported` |

- 문구 검사(`e2e/fortune-copy.spec.ts`)는 8.2·8.3을 따른다. 꼭 넣을 사례: 방식 A 안내 3문장이 금지 구 검사를 예외 없이 통과하고 첫 "사주"가 `FORTUNE_SAJU_GLOSS`로 시작함, 방식 A 문구 풀·공통 풀·허브와 방식 A의 SEO 상수에 "사주" 없음, 모든 화면 상수에 `FORTUNE_SAJU_REDUNDANT_TERMS`와 "4기둥"·"3기둥" 없음, 폐기 문장 "사주 풀이가 아닙니다" 없음.

### 17.2 허브·링크·지원 범위·상담전화 관련 브라우저 테스트 관점 (`e2e/fortune.spec.ts`에 포함)

- `/fortune`: 서버 HTML(JS 끔)에 h1 "운세" 하나, 상시 면책, 세 링크(`/fortune/today`, `/fortune/tti`, `/fortune/star-sign`), FAQ, 상세 이용 안내, 상담전화 5곳이 있다. 동의 화면·입력칸·점수·운세 문구가 서버 HTML과 DOM 어디에도 없다. `/fortune/saju` 링크가 없다. 허브 방문 전후로 sessionStorage의 동의 키가 바뀌지 않는다. 메타데이터·Breadcrumb(홈 > 운세)·ItemList·FAQPage가 있다. 서버 HTML의 "사주"는 8.3 화이트리스트 문장에만 있다.
- `/fortune/tti`, `/fortune/star-sign`: 동의 전과 JS 끈 서버 HTML 모두에 "생년월일로 보는 오늘의 운세" 링크가 있고 href는 쿼리 없는 `/fortune/today`다. 누르면 `/fortune/today`로 이동하며, 동의한 탭이면 동의 화면 없이 입력 폼이, 동의 전이면 동의 화면이 나온다.
- 헤더·모바일 메뉴의 "운세" 그룹 링크가 `/fortune`으로 간다.
- `/sitemap.xml`에 `/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`이 있고 `/fortune/saju`가 없다.
- 지원 범위: 연도 입력 상한이 `min(오늘 연도, 2028)`, 1919년 입력 시 범위 안내, 계산 기준 안내에 "1920년 1월 1일부터 2028년 12월 31일" 문구가 있다. `page.clock.setFixedTime('2029-01-02T09:00:00+09:00')`으로 세 기능 페이지를 열면 동의 후 오늘의 운세·12띠·12별자리 결과가 정상으로 나온다.
- 윤달: 음력 선택 후 2023년 2월이면 윤달 체크가 활성화되고 안내가 보인다. 2023년 3월이면 비활성화된다.
- 상담전화(8.4, 네 페이지 모두, JS 켬·끔 모두 같은 결과여야 함): mobile은 보이는 `tel:` 링크 5개·`href`·각 44px 이상. desktop은 보이는 `tel:` 링크 0개, 다섯 번호가 보이는 글자로 있고, 번호를 클릭해도 `tel:` 이동이 없으며(`interceptTelClicks` 방식 기록이 비어 있음), Tab 순서에 번호가 없고, 번호를 더블클릭하면 선택된 글자에 번호가 들어 있다. 두 프로젝트 모두 접근성 스냅샷에서 각 번호가 한 번만 나오고, DOM의 `a[href^="tel:"]`(숨은 것 포함)는 5개다. 번호 검색은 `filter({ visible: true })`나 역할 기반으로 한다(8.4 e2e 검색 영향). 콘솔 하이드레이션 경고가 없다.

## 18. plan.md AC와 설계 대응

| AC | 설계 요소 |
|---|---|
| AC-1 | 7.3 오늘의 운세, 4.7 결과 항목 |
| AC-2, AC-18 | 4.6 시드(양력 생년월일·키 + KST 날짜), 저장 없이 재계산 |
| AC-3 | `getKoreaDateKey`, `useKoreaDateKey`(1분 갱신), `FORTUNE_KST_LABEL` |
| AC-4~AC-6 | 4.6 점수식·구간, 4.7 행운 대응표 |
| AC-7, AC-25, AC-44 | 4.3 음력 변환 후 같은 양력으로 시드·판정·나이 계산, 윤달 처리 |
| AC-8, AC-9 | 4.3 오류 종류(`after-max` 추가)와 `FORTUNE_BIRTH_ERROR_MESSAGES` (아래 18.4) |
| AC-10, AC-58 | 8.1 방식 A·B 안내(plan 고지 3·4 새 문장, `FORTUNE_SAJU_GLOSS`), 8.2 금지 구 검사(사주 예외는 `/fortune/saju`만), 8.3 "사주" 허용 위치 검사 |
| AC-11 | 오늘의 운세 panel의 `/fortune/tti`, `/fortune/star-sign` 링크 |
| AC-12, AC-13, AC-20, AC-21 | 띠·별자리 list, 게이트 뒤 panel |
| AC-14~AC-17, AC-19 | 4.4, 계산 기준 안내, `FORTUNE_DIFFERENT_BASIS_NOTICE` |
| AC-22~AC-24, AC-26 | 4.5, 4.1 절기 표, 별자리 guide |
| AC-27, AC-28, AC-30, AC-47 | 9장 메모리 전용, 7.1 폼 규칙, 14장 유출 방지 |
| AC-29, AC-78 | 6.3 sessionStorage 키 1개 (아래 "달라지는 AC") |
| AC-31, AC-45, AC-48 | `FortuneInputNoticeComponent`, `FortuneAgeBlockedComponent`, `FortuneDetailNoticeComponent` |
| AC-32 | 6.1 쿠키 동의와 분리 |
| AC-33 | 서버 컴포넌트 `FortuneDisclaimerNoticeComponent`, `FortuneResultNoticeComponent` (허브 포함, 7.4) |
| AC-34 | D4 공용 `CRISIS_PHONES`, D15 `CrisisPhoneComponent` (허브 포함, 18.5) |
| AC-35, AC-36 | 8.1 로또 영역, 4.7 숫자 범위 |
| AC-37~AC-39, AC-60 | 8.2 검사(허브 포함, 단어 "사주"는 막지 않고 금지 구만 막음) + 8.3 + 5장 문구 규칙 |
| AC-40, AC-41 | `docs/fortune/copy-log.md`, 15장 `THIRD_PARTY_NOTICES.md`, 10장(접속 시 AI 호출 없음) |
| AC-42, AC-43, AC-46, AC-76 | 4.2 만 나이, 7.2 `age-blocked`, 모든 입력 화면이 같은 훅 사용 |
| AC-49~AC-51, AC-53~AC-57, AC-59 | 4.8·4.9 사주(지원 범위 D14 적용), 2단계 saju 화면, 계산 기준 |
| AC-52 | 4.8 화면 표기, 8.3 `FORTUNE_SAJU_REDUNDANT_TERMS`, 12.2 기둥 표 캡션 |
| AC-61, AC-63~AC-65 | 13.1 메타데이터·JSON-LD·`MENU_LIST`(D8, D11) |
| AC-62, AC-72 | 13.2, D5 지연 로드, noscript |
| AC-66 | 12장 흐름 (QA 데스크톱·모바일) |
| AC-67~AC-71, AC-73, AC-77 | 6장 게이트 상태·폼·이용 불가 화면, 6.2 이벤트 금지, 접근성은 `ui-ux-design.md` |
| AC-74, AC-75 | 6.3 sessionStorage, 동의 다시 설정 |
| AC-79~AC-83 (추가) | 7.4 허브, 7.5 오늘의 운세 링크, 17.2 |
| AC-84, AC-85 (추가) | 4.10, 4.3 윤달 처리, 17장 (아래 18.4) |
| AC-86 (추가) | 8.4 상담전화 기기별 표시, 17.2 (아래 18.5) |

### 18.1 plan.md와 달라지는 AC: 동의 보관 (확정, 사용자 승인 2026-11-05)

D2(sessionStorage) 확정에 따른 차이다. QA는 아래 기준으로 검사한다. `plan.md`는 지금 수정하지 않고 DOC-2로 갱신한다.

| AC | plan 문구의 전제 | 확정 검사 기준 |
|---|---|---|
| AC-29 | 저장 값 "동의 여부·문구 버전·동의일" | 저장소는 sessionStorage, 값은 동의 여부(키 존재)·문구 버전·동의 시각(`agreedAt`). localStorage에는 운세 키가 새로 생기지 않는다 |
| AC-74 | 세 방식 중 "브라우저 보관(제안): 30일 만료 전 재질문 없음, 만료 후 재질문" | 탭 세션 보관 기준만 적용: 같은 탭에서는 새로고침해도 다시 묻지 않는다. 새 탭·새 브라우저 컨텍스트에서는 묻는다. 동의 문구 버전이 바뀌면 다시 묻는다. 30일 만료 검사는 없다. "동의하지 않음"은 저장되지 않는다 |
| AC-75 | "동의를 보관하는 경우 철회 링크" | sessionStorage 보관이므로 "동의 다시 설정"이 있고, 누르면 키가 지워져 동의 화면이 나온다 |
| AC-78 | "동의 여부·문구 버전·동의일" | "동의 여부·문구 버전·동의 시각", 저장소는 sessionStorage |
| AC-30, AC-47 (참고, 변화 없음) | 새로고침 후 입력칸 비어 있음 | 같은 탭 새로고침 후에도 동의는 유지되고 입력칸은 비어 있다 |
| plan "보관 안내" 문구, plan 열린 질문 1·2 | localStorage·30일 전제, 미정 | 동의 화면 문구는 사용자가 승인한 `ui-ux-design.md` 문구. 열린 질문 1(보관 방식)은 D2 sessionStorage로, 2(게이트와 검색 노출)는 D3(서버 HTML에 운세 문구 없음)·13.2로 결정 완료 |

### 18.2 허브·링크 추가에 따른 AC 수정·추가 (확정, 사용자 요청 2026-11-05)

D11, D12에 따른 변경이다. `plan.md`는 지금 수정하지 않고 DOC-2로 반영한다. 번호는 plan 갱신 때 이어 붙일 제안 번호다.

수정

| AC | 현재 plan 문구 | 수정 내용 |
|---|---|---|
| AC-33 | 운세 페이지 모두에서 h1 아래 상시 면책, 결과 영역 하단 짧은 면책 | 허브 `/fortune`도 h1 아래 상시 면책과 하단 짧은 면책(책임 관련 고지 포함)이 서버 HTML에 있다. 허브에는 결과 영역이 없으므로 하단 면책은 목록·설명 뒤에 있다 |
| AC-34 | 결과 하단에 상담전화 다섯 곳 | 허브에도 상담전화 다섯 곳이 있다(번호는 타로와 같음). 표시 방식은 18.5 |
| AC-37 | 금지 표현 검사 대상 | 허브(화면, 메타데이터, JSON-LD, FAQ, 설명)와 띠·별자리의 오늘의 운세 링크 라벨을 대상에 포함한다 |
| AC-10, AC-58 | 방식 A 화면의 "사주" 허용 위치 | 허브도 방식 A 화면과 같은 규칙을 적용한다(8.3) |
| AC-61 | 출시된 운세 페이지에 noindex 없음, 메뉴에서 "준비 중" 아님 | 대상에 `/fortune`을 포함한다. 메뉴의 "운세" 그룹 링크는 `/fortune`으로 간다 |
| AC-62 | JS를 끈 서버 HTML에 설명 콘텐츠 | 허브도 포함(설명, FAQ, 상시 면책, 이용 안내). 허브에는 입력이 없으므로 입력 영역 안내는 요구하지 않는다 |
| AC-63 | 각 페이지 h1 하나 | 허브 포함 |
| AC-64 | BreadcrumbList(홈 > 운세 > 페이지) | "운세" 단계의 URL은 `/fortune`이다. 허브 자체는 홈 > 운세 2단계이고, 허브에는 ItemList JSON-LD(운세 페이지 목록)가 추가로 있다. 리뷰·평점은 여전히 없다 |
| AC-65 | sitemap에 출시된 운세 페이지 | `/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`이 있고 `/fortune/saju`는 없다 |
| AC-67 | 동의 상태가 없는 브라우저에서 오늘의 운세·띠별·별자리를 열면 동의 화면 | 대상은 세 기능 페이지(2단계 사주 포함)이고, 허브 `/fortune`에는 동의 화면이 나오지 않는다(AC-79) |

추가 (제안 번호)

| AC | 내용 |
|---|---|
| AC-79 | `/fortune` 허브가 있다. h1 "운세", 오늘의 운세(`/fortune/today`)·띠별 운세(`/fortune/tti`)·별자리 운세(`/fortune/star-sign`)로 가는 링크가 동의 여부와 관계없이 보이고 JS를 끈 서버 HTML에도 있다. 허브에는 이용 동의 화면, 생년월일 입력칸, 띠·별자리 선택, 점수, 운세 문구가 서버 HTML과 DOM 어디에도 없다 |
| AC-80 | 1단계 출시 상태에서 허브, 헤더·모바일 메뉴, sitemap 어디에도 `/fortune/saju` 링크가 없다(2단계 출시 때 함께 나타난다) |
| AC-81 | `/fortune/tti`와 `/fortune/star-sign`에 "생년월일로 보는 오늘의 운세"(의미 기준) 링크가 하나 있고, 동의 전에도 보이며 JS를 끈 서버 HTML에도 있다. href는 쿼리·해시 없는 `/fortune/today`다 |
| AC-82 | AC-81 링크를 누르면 `/fortune/today`로 이동한다. 같은 탭에서 이미 동의했으면 동의 화면 없이 입력 폼이 나오고, 동의 전이면 동의 화면이 나온다 |
| AC-83 | 허브 방문은 이용 동의 상태를 만들거나 지우지 않는다(방문 전후 sessionStorage 운세 키가 같다). 허브에는 "동의 다시 설정"이 없다 |

### 18.3 로또 AgeGate 문서 오류 (확정, 사용자 승인 2026-11-05)

- plan("기존 기능과의 충돌 확인", "동의 상태 보관 방식" B안, 연령 확인 절)과 `COMPLIANCE.md` 2장은 로또 AgeGate를 "localStorage 30일 TTL"이라고 적었다. 실제 `src/providers/age-gate.provider.tsx`는 sessionStorage(`<site>_age_gate_verified_sess_v1`)이고, `NEXT_PUBLIC_AGE_GATE_MODE`가 없으면 개발 환경은 매번 확인(`always`), 그 밖은 세션(`session`)이다.
- 이 설계서는 실제 코드를 기준으로 한다. 운세의 sessionStorage 선택은 실제 로또 동작과 같은 방식이다.
- `plan.md`·`COMPLIANCE.md`는 지금 고치지 않고 개발 단계에서 갱신한다(DOC-1, DOC-2).

### 18.4 지원 연도 제한 (나)안에 따른 AC 수정·추가 (확정, 사용자 결정 2026-11-05, D14)

`plan.md`는 지금 수정하지 않고 DOC-2로 반영한다.

수정

| 위치 | 현재 plan 문구 | 수정 내용 |
|---|---|---|
| plan 181행 "지원 출생 연도", 결정 사항 10 | 1920년 1월 1일부터 오늘까지 | 1920년 1월 1일부터 2028년 12월 31일까지, 그리고 오늘까지(KASI 24절기 제공 범위). 2029년 이후 출생은 절기 데이터 보완(F-1) 뒤에 늘린다 |
| AC-9 | 존재하지 않는 날짜, 미래 날짜, 1920년 이전 날짜는 안내 후 결과 없음 | 위에 더해 2029-01-01 이후 날짜(양력 환산 기준, 음력 입력 포함)도 지원 범위 안내가 나오고 결과가 나오지 않는다. 안내 문구에 지원 범위(1920-01-01 ~ 2028-12-31)가 들어 있다 |
| plan 402행 "입력 오류" 예외 | 범위 밖 연도 | 범위 = 1920~2028년임을 명시 |
| AC-8 (음력 입력, 해당 시) | 없는 윤달·없는 날 | 그해 그 달에 윤달이 없으면 윤달 선택을 할 수 없고(비활성), 윤달이 있으면 선택 안내가 보인다 |
| AC-49~AC-57 (2단계 사주) | 지원 연도 언급 없음 | 사주도 출생일 1920-01-01 ~ 2028-12-31만 지원한다(절기 월주) |

추가 (제안 번호)

| AC | 내용 |
|---|---|
| AC-84 | 기기 시계를 2029-01-02(KST)로 맞춰도 오늘의 운세(개인 일운)·12띠 목록·12별자리 목록은 동의 후 정상 결과를 보이고, 연도 입력 상한은 2028이다. 내 띠·내 별자리 찾기는 1920~2028년 출생에 대해 정상 판정한다 |
| AC-85 | 음력 입력에서 윤달이 있는 달(예: 2023년 2월)은 평달과 윤달이 서로 다른 양력 날짜로 변환되고, 확인 줄에 "(윤달)"이 표시된다 |

- QA 외 개발 검증(AC 아님): 17장 만료 감시 테스트가 2028-12-01 이후 F-1 미완료 시 실패한다.

### 18.5 상담전화 기기별 표시에 따른 AC 수정·추가 (확정, 사용자 결정 2026-11-05, D15)

`plan.md`는 지금 수정하지 않고 DOC-2로 반영한다. 타로 plan의 AC-28 보충은 DOC-3이다.

수정

| 위치 | 현재 plan 문구 | 수정 내용 |
|---|---|---|
| AC-34 | 결과 하단에 상담전화 다섯 곳이 항상 보인다. 번호는 타로 화면의 번호와 같다 | 위에 더해 표시 방식도 타로와 같다(공용 컴포넌트). 터치 기기에서는 번호를 눌러 전화를 걸 수 있고, 마우스 환경(PC)에서는 번호가 글자로 보인다 |
| plan 고지 17 "위기 안내" | 번호 다섯 곳 나열 | "터치 기기에서는 눌러서 연결, PC에서는 글자 표시" 한 줄 보충 |

추가 (제안 번호)

| AC | 내용 |
|---|---|
| AC-86 | 운세 네 페이지(허브 포함)에서, JS를 켜든 끄든 같은 결과로: 터치 기기(모바일)는 상담전화 다섯 곳이 보이는 `tel:` 링크이고 각 터치 영역이 44px 이상이다. 마우스 환경(PC)은 다섯 번호가 링크가 아닌 글자로 보이고, 마우스 클릭이나 키보드(Tab·Enter)로 통화 앱이 열리지 않으며, Tab 순서에 번호가 없고, 번호를 선택해 복사할 수 있다. 두 환경 모두 각 번호가 화면 읽기 도구에 한 번만 읽힌다. 하이드레이션 오류가 없다 |

## 19. 담당별 작업 순서

guard-files 범위: frontend-dev는 `src/app`(api 제외), `src/components`, `src/features`, `src/constants`, `src/types`, `src/providers`, `src/hooks` 등. backend-dev는 `src/lib`, `src/types`, `src/features/*/(types|constants)`, 그리고 D9로 추가되는 `scripts/fortune-calendar/`. 루트 문서(`README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `DEPENDENCY_LICENSES.md`), `.env.example`은 어느 agent 범위에도 없다(21장 Q6).

- 메인 세션 (개발 착수 시 먼저)
  1. M-1 `.claude/hooks/guard-files.js`의 backend-dev 범위에 `'scripts/fortune-calendar/'` 추가(2.1).
  2. M-2 F-1(4.10)을 `docs/fortune/status.md` 후속 작업에 기한 2028-12-01로 등록.
- ui-ux (개발 준비 전)
  1. UI-1 `ui-ux-design.md`에 허브 화면(7.4), 띠·별자리의 오늘의 운세 링크(7.5), 연도 입력 범위·지원 범위 안내·윤달 안내(4.3) 명세를 추가하고, 디자이너 열린 질문 Q1·Q2를 닫는다. 화면 문구는 8.3 "사주" 규칙을 따른다. 사용자 승인.
  2. UI-2 상담전화 S9: 구현 방식이 안 5(두 요소 + CSS `display`)로 확정됐음을 반영하고, 타로 위기 패널의 PC 상태 109 강조 모양(Q9)을 정한다. 운세 `ui-ux-design.md`에 적고 타로 `ui-ux-design.md` 반영은 DOC-3. 사용자 승인.
- db: 없음.
- backend
  1. BE-1 달력 표 생성·검증 스크립트 `scripts/fortune-calendar/generate.mjs`, `verify.mjs` 작성(4.1의 범위·윤달 두 건·절기 이름·호출 횟수 규칙). (M-1 이후) 사용자가 `DATA_GO_KR_API_KEY`로 실행 → `src/features/fortune/constants/calendar/lunar-table.constant.ts`(1919~2049), `solar-term-table.constant.ts`(1920~2028) 생성 → `docs/fortune/calendar-verification.md` 작성.
- frontend (frontend-dev, `design.md` + `ui-ux-design.md` 기준)
  1. FE-1 공용 상담전화: `src/types/crisis-phone.type.ts`, `src/constants/crisis-phone.constant.ts`, `src/components/common/crisis-phone.component.tsx` 신규, 타로 3파일 수정(D4, D15, 8.4 영향 범위). (UI-2 이후) 이어서 T-QA가 타로 테스트를 고친 뒤 타로 회귀 테스트(`e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`) 통과 확인.
  2. FE-2 타입·상수 뼈대: `fortune.type.ts`(`after-max`, `unsupported` 포함), `fortune-calendar.type.ts`, `FORTUNE_ROUTES`(허브 포함)·지원 범위·입력·점수·띠·별자리·행운·동의·고지(`FORTUNE_SAJU_GLOSS`, 지원 범위·윤달 안내 포함)·SEO(허브 포함)·FAQ(허브 포함)·가이드(허브 포함)·금지 표현과 "사주" 용어 규칙 상수(8.2, 8.3), 문구 풀 파일의 구조(빈 자리). (FE-1과 병렬)
  3. FE-3 순수 함수: `fortune-date`, `fortune-seed`, `fortune-reading`, `fortune-birth`, `fortune-lunar`(윤달 조회 포함), `fortune-solar-term`(범위 밖 `null`), `fortune-tti`, `fortune-star-sign`. (FE-2 이후. 달력 의존 함수의 최종 확인은 BE-1 이후. 그 전에는 4.1 알려진 값만 담은 테스트용 값으로 개발하고 `calendar/*.constant.ts`는 만들지 않는다)
  4. FE-4 동의 게이트: `consent.provider.tsx`, `use-fortune-consent.hook.ts`, `fortune-consent-storage.service.ts`, 게이트·폼·이용 불가·다시 설정 컴포넌트, `src/app/fortune/layout.tsx`. (FE-2 이후, FE-3과 병렬)
  5. FE-5 공용 입력·결과 컴포넌트: birth-form(연도 범위·윤달 활성화), birth-time-form, candidate-choice, lunar-confirm, age-blocked, reading, lucky, `use-birth-flow.hook.ts`(`unsupported` 처리), `use-korea-date-key.hook.ts`. (FE-3 이후)
  6. FE-6 서버 안내 컴포넌트: disclaimer, input-notice, noscript, result-notice(`CrisisPhoneComponent` 사용), today-link, calc-basis(지원 범위 문구), detail-notice, faq. (FE-1, FE-2, UI-1 이후)
  7. FE-7 `/fortune/today` 화면(root, panel, guide). (FE-4, FE-5, FE-6, BE-1 이후)
  8. FE-8 `/fortune/tti` 화면, FE-9 `/fortune/star-sign` 화면(각 페이지에 `FortuneTodayLinkComponent` 배치는 FE-10에서). (FE-7과 파일이 겹치지 않아 FE-7, FE-8, FE-9 병렬 가능)
  9. FE-12 허브 `hub/components/root.component.tsx`. (FE-2, FE-6, UI-1 이후, FE-7~9와 병렬 가능)
  10. FE-10 페이지·메타데이터·JSON-LD(허브 `src/app/fortune/page.tsx` 포함), `today/page.tsx` 교체, `MENU_LIST`(그룹 href `/fortune`, comingSoon 해제, 항목 추가)·`MENU_ICONS` 수정. (FE-7~9, FE-12 이후, 메뉴 수정은 C-2·C-3 검수 완료 후)
  11. FE-11 개인정보처리방침·이용약관 수정. (독립)
- content (AI 초안 + 사용자 검수, 담당은 dev-lead가 정함. 타로는 frontend-dev가 작성)
  1. C-1 샘플: 개인 전체, 공통 풀, 띠(쥐), 별자리(양) → 사용자 검수·톤 확정. (FE-2 이후, 풀 파일의 문구 필드만 수정)
  2. C-2 나머지 띠 11, 별자리 11. (C-1 이후)
  3. C-3 고지 최종 문구(사용자 승인, 방식 A·B 안내는 plan 고지 3·4 문장 그대로, 입력 오류·지원 범위·윤달 안내 포함), 가이드·FAQ 본문(허브 설명·FAQ 포함, 지원 출생 연도 FAQ 포함), "사주" 허용 문장 화이트리스트 등록(8.3). (FE-2 이후, C-1과 병렬)
  4. C-4 유사 문장 샘플 점검, `docs/fortune/copy-log.md` 완성. (C-2, C-3 이후)
- 문서 (DOC, 개발 단계)
  1. DOC-1 (메인 세션) `README.md`(16.2), `COMPLIANCE.md`(1·2·7·11장, 2장은 AgeGate 오류 정정, 11장에 상담전화 표시 방식), `THIRD_PARTY_NOTICES.md`(15장), `.env.example`에 `DATA_GO_KR_API_KEY` 키 이름(이미 반영됐으면 확인만).
  2. DOC-2 (planner) `plan.md` 갱신: 18.1 동의 보관 AC 4건, 18.2 허브·링크 AC 수정 10건과 추가 AC-79~AC-83, 18.3 AgeGate 기재, 18.4 지원 연도 제한(결정 사항 10, 181·402행, AC-8·9, 사주 AC)과 추가 AC-84·85, 18.5 상담전화 표시(AC-34, 고지 17)와 추가 AC-86, 범위·기존 기능 충돌·검색 노출 절에 허브(`/fortune`)와 오늘의 운세 링크 추가, 열린 질문 1·2를 결정 완료로 정리(사용자 승인 범위 안).
  3. DOC-3 (planner·ui-ux-designer) 타로 문서: `docs/tarot/plan.md` AC-28 보충, `docs/tarot/ui-ux-design.md` 상담전화 명세(8.4 영향 범위 표의 행), `docs/tarot/design.md`, `docs/tarot/qa-report.md` 변경 기록. (UI-2 이후)
- qa
  1. T-QA (FE-1과 같은 묶음, FE-1 직후): `e2e/tarot.spec.ts`를 8.4 "타로 테스트 영향" 표대로 프로젝트별로 고치고, `PHONES`·`CRISIS_PHONE_LINK`는 공용·타로 상수를 import(U-6 방안 A). `e2e/tarot-copy.spec.ts`가 공용 상담전화 상수를 검사 대상에 넣도록 고침. 첫 실행에서 두 프로젝트의 미디어 쿼리 값 확인을 qa-report에 기록.
  2. 운세 (FE-10, C-4 이후): `e2e/fortune.spec.ts`(AC-1~AC-86, 데스크톱·모바일, 동의 상태 헬퍼는 sessionStorage에 6.3 형식 값을 넣는다, AC-29·74·75·78은 18.1, 허브·링크는 18.2·17.2, 지원 범위는 18.4·17.2, 상담전화는 18.5·17.2 기준), `e2e/fortune-copy.spec.ts`(8.2, 8.3, 허브 포함), `e2e/fortune-calc.spec.ts`(17.1, 지원 범위·2029년 모의·만료 감시·공용 상담전화 포함).
- 후속 F-1 (기한 2028-12-01): 4.10 절차. KASI 갱신 확인(다) → 미제공 시 2028-09-01에 설계로 되돌려 천문 계산 보완(가) 선택.
- 2단계(사주): 1단계 출시 후 plan 2단계 항목 재승인 → R-1(researcher, 4.9) → `FORTUNE_SAJU_LATE_ZI_STEM_BASIS` 확정(사용자 승인) → FE(사주 타입·상수·`fortune-saju.util.ts`·화면, 지원 범위 D14 동일 적용), C(십신 풀 450 + 기본 점수표), `/fortune/saju` 메뉴 항목 추가(허브·sitemap 자동 노출), QA. R-1 확정 전에는 메뉴 항목을 추가하지 않는다.

## 20. 파일 충돌 위험

- `src/constants/menu.constant.ts`, `src/constants/menu-icon.constant.ts`: 모든 기능이 같이 쓴다. 다른 기능(점심 등) 작업과 동시에 고치지 않는다. 운세에서는 FE-10만 수정한다. 그룹 href를 `/fortune`으로 바꾸면 헤더·모바일 메뉴(`src/components/layout/pc-menu.component.tsx`, `mobile-menu.component.tsx`)의 그룹 링크 목적지가 바뀐다. 이 두 파일은 고치지 않지만 FE-10 후 메뉴 동작을 확인한다.
- `src/features/tarot/constants/tarot-notice.constant.ts`, `src/features/tarot/shared/components/crisis-notice.component.tsx`, `result-notice.component.tsx`: FE-1(D4, D15)이 고친다. 타로 작업과 동시에 하지 않는다.
- `e2e/tarot.spec.ts`, `e2e/tarot-copy.spec.ts`: T-QA만 고친다. FE-1과 같은 묶음으로 순서대로 진행한다(FE-1 → T-QA → 회귀 실행). 타로의 다른 테스트 작업과 동시에 하지 않는다.
- `src/components/common/crisis-phone.component.tsx`, `src/constants/crisis-phone.constant.ts`, `src/types/crisis-phone.type.ts`: FE-1만 만든다. 이후 타로·운세 작업은 사용만 하고 고치지 않는다.
- `src/app/globals.css`: 상담전화 표시에 `@custom-variant`를 추가하지 않는다(임의 변형 사용, 8.4). 수정하지 않는다.
- `src/features/fortune/constants/pools/**`, `fortune-faq.constant.ts`, `fortune-guide.constant.ts`, `fortune-notice.constant.ts`, `fortune-seo.constant.ts`, `fortune-copy-rule.constant.ts`(화이트리스트): FE-2(뼈대)와 C-1~C-3(문구)이 같은 파일을 고친다. FE-2를 먼저 끝내고, 이후에는 문구 쪽만 문구 필드와 화이트리스트를 고친다.
- `src/features/fortune/constants/calendar/*.constant.ts`: BE-1 스크립트 출력만 쓴다. FE는 이 파일을 만들거나 고치지 않는다.
- `src/features/fortune/constants/fortune-input.constant.ts`의 `FORTUNE_SUPPORTED_MAX_YEAR`: FE-2가 만든다. 값은 BE-1(또는 F-1) 결과 절기 표 마지막 연도와 같아야 하며, 표를 늘릴 때 같은 작업에서 함께 올린다.
- `src/features/fortune/types/fortune-calendar.type.ts`: FE-2가 3장 확정 타입으로 만든다. BE-1 스크립트는 이 타입에 맞춰 출력하고 타입 파일을 고치지 않는다.
- `src/features/fortune/shared/components/reading.component.tsx`, `lucky.component.tsx`, `birth-form.component.tsx`, `result-notice.component.tsx`, `today-link.component.tsx`, `use-birth-flow.hook.ts`: 여러 화면(FE-7~9, FE-12)이 같이 쓴다. FE-5·FE-6에서 props를 확정하고 이후 작업에서는 수정하지 않는다. 필요하면 한 작업에서만 고친다.
- `src/app/fortune/layout.tsx`: FE-4만 만든다.
- `src/app/fortune/page.tsx`(허브), `src/app/fortune/today/page.tsx`: FE-10만 만든다·수정한다. `today/page.tsx`는 기존 ComingSoon 파일을 통째로 바꾼다.
- `.claude/hooks/guard-files.js`: M-1(메인 세션)만 수정한다.
- `docs/fortune/ui-ux-design.md`: UI-1, UI-2(ui-ux-designer)만 수정한다. `docs/tarot/*`: DOC-3만 수정한다.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `README.md`, `COMPLIANCE.md`, `THIRD_PARTY_NOTICES.md`, `docs/fortune/plan.md`: 다른 기능·문서 작업과 겹칠 수 있다. 각각 FE-11, DOC-1, DOC-2 한 작업으로 묶는다.
- `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/*`, `src/components/common/menu-list.component.tsx`(재사용만), `next.config.ts`, `package.json`: 수정하지 않는다.

## 21. 열린 질문

결정 완료로 닫힌 항목 (다시 묻지 않는다)
- 동의 보관 방식(plan 열린 질문 1): sessionStorage 확정(D2, 6.3).
- 동의 게이트와 검색 노출(plan 열린 질문 2): 운세 문구는 서버 HTML에 두지 않음(D3), 게이트는 페이지 안 대체 방식(13.2).
- 동의 화면 문구: `ui-ux-design.md`의 문구가 사용자 승인됨(6.3, 8.1).
- 허브 URL 구조: 안 A 확정(D11, 2.2). 오늘의 운세 링크: D12 확정.
- "사주" 용어와 방식 A·B 안내 문구: plan 갱신본대로 확정(D13, 8.1, 8.3). 2단계 사주 SEO 값의 "사주 네 기둥"은 13.1에서 이미 괄호 설명·"연·월·일·시 기둥"으로 고쳤다(`ui-ux-design.md` PM 전달 항목 해소).
- Q2 KASI 확인: 실제 호출로 닫음(`kasi-api-check.md`). 절기 시각 필드 있음(`kst`), 제공 범위 절기 1920~2028·음력 1391~2050, 이용허락범위 두 API 모두 "제한 없음". 지원 연도는 (나)안으로 확정(D14). 약관 전문 확인만 출시 전 법률 확인 범위로 옮김(15장).
- 상담전화 표시: 터치 상태 링크 유지, PC 글자(D15). 구현은 안 5(두 요소 + CSS `display`)로 확정해 `ui-ux-design.md` S9 조건 ①~④를 모두 만족한다. 이전의 하이드레이션 뒤 교체 안과 "모든 환경 글자 노출" 지시는 대체됨. U-6 방안 A(공용 상수 이전, 타로 테스트가 공용 상수 import) 확정. 타로에도 같은 방식 적용. `TAROT_CRISIS_CALL_LABEL`·`TAROT_CRISIS_PHONE_ARIA_LABEL`은 터치 상태에서만 노출.

남은 열린 질문
1. Q3 (2단계 착수 전, R-1) 23시대 출생 시주 천간 기준(`same-day` / `next-day`). 4.9의 구조로 상수 하나로 바꿀 수 있게 해 두었고, researcher 출처 조사 후 사용자가 확정한다. 1단계에는 영향이 없다.
2. Q4 개인 일운 문구 수가 plan 예시(약 100)보다 적다(개인 45 + 공통 27). 공통 풀을 방식별로 나누지 않아도 되는지는 문구 샘플 검수 때 판단한다.
3. Q6 루트 문서와 `.env.example`은 agent 범위 밖이라 DOC-1을 메인 세션이 맡는 것으로 적었다. 다르게 나누려면 dev-lead 단계에서 정한다.
4. Q7 음력 표 범위: 안 C(1919~2049, 약 5.2KB)를 추천해 설계에 반영했다. 안 A(1919~2028, 약 4.4KB)나 안 B(1391~2050, 약 26KB)를 원하면 BE-1 전에 알려 달라(4.1 비교).
5. Q8 (수동 확인) 스크린리더가 `1577-0199`, `1588-9191`을 번호로 자연스럽게 읽는지, 그리고 각 번호가 한 번만 읽히는지 NVDA·VoiceOver·TalkBack에서 확인한다. 읽기 방식은 `ui-ux-design.md` S9(보이는 글자 그대로, `aria-label`로 바꾸지 않음)를 따른다.
6. Q9 (UI-2) 타로 위기 패널의 PC 상태에서 109를 어떤 모양으로 강조할지(채운 버튼 모양 금지). 사용자 승인 필요.
7. 출시 전 법률 확인: KASI 두 API 약관 전문(코드 상수 포함 배포 조건), 만 14세 미만 처리, 동의 게이트, 책임 고지, 로또 연결 표현(15장).
8. 후속 F-1 (기한 2028-12-01): 2029년 이후 절기 보완. (다) KASI 갱신 확인 → 2028-09-01까지 미제공이면 (가) 천문 계산 보완을 설계로 되돌려 사용자가 고른다(4.10).
9. 참고 (D2 메모) sessionStorage는 같은 탭 새로고침에서 동의를 유지한다. 새로고침마다 재동의가 필요하면 `FORTUNE_CONSENT_STORAGE_MODE`를 `'memory'`로 바꾼다. 현재 확정은 sessionStorage다.
