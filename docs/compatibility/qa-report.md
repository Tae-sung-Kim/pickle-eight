# 궁합 테스트 QA 보고서

작성일: 2026-11-24. 범위: QA-01(단위), QA-02(정적), QA-03(E2E). 회귀(QA-04), `pnpm typecheck`, `pnpm lint`는 하지 않았다.

## 1. 실행 결과

| 층 | 명령 | 결과 |
|---|---|---|
| 단위 (AC-4~8) | `pnpm exec vitest run unit/fortune` | 9개 파일, 305개 통과 (새 파일 3개 포함) |
| E2E (AC-1, 2, 3, 12) | `pnpm exec playwright test e2e/compatibility.spec.ts --project=desktop` | 6개 통과 |
| 모바일 smoke (AC-3) | `pnpm exec playwright test e2e/compatibility.spec.ts --project=mobile` | 1개 통과 |

새 테스트 파일: `unit/fortune/compatibility-rule.test.ts`, `compatibility-flow.test.ts`, `compatibility-copy.test.ts`, `e2e/compatibility.spec.ts`. 앱 코드는 고치지 않았다.

테스트를 고친 사유: 이용 전 확인 화면의 "동의하고 시작"은 `aria-disabled`라 Playwright가 비활성으로 보고 클릭을 기다리다 시간 초과가 났다. 사용자가 누르는 동작(안내 표시)을 확인하려고 `click({ force: true })`로 바꿨다. 앱 문제가 아니다.

## 2. 정적 확인 (AC-9, AC-10, AC-11)

### AC-9 고지·동의·연령 문구

- 약관 7번 절, 방침 1·2·10번 절의 궁합 문단 4개를 `fixed-copy-draft.md` 원문과 공백만 정리해 글자 단위로 대조했다. 4개 모두 같다. 위치(절 안 순서)도 draft와 같고, `EFFECTIVE_DATE`(2026-11-23)와 기존 문장은 변경이 없다(diff는 추가 줄만 있음).
- 동의 항목 4개, 이용 불가, 연령 안내, 상시 면책 추가 문장, 입력 안내, 결과 하단 고지 등 상수 문구는 `fixed-copy-draft.md`에 원문이 따로 없고 PM 검수 통과 기록만 있다. 그래서 상수 파일이 곧 승인 원문이다. 화면 파일(페이지, 컴포넌트, 훅)에 있는 한글 문구를 모두 뽑아 확인했다. 상수를 쓰지 않고 직접 쓴 문구는 `ui-ux-design.md` 문구 표에 있는 구조 문구(단계 제목, 버튼, 등급 라벨 등)와 공용 로딩 문구뿐이다. 승인 밖 문장은 찾지 못했다.
- 참고: plan.md의 상대방 정보 동의 초안(해요체 "확인해 주세요")과 구현 문구("확인해 주시기 바랍니다")가 다르다. 확정 답변(합니다체)과 PM 검수 기록에 따른 변경이라 불일치로 보지 않는다.
- 상담전화 목록은 궁합 서버 HTML에 없다(`1393` 없음). "상담"은 공용 상세 이용 안내의 기존 문장 하나뿐이다.

### AC-10 SEO·등록

서버 HTML(`curl`)로 확인했다.

- 허브, 띠, 별자리 세 페이지 모두 h1 하나, title, description, keywords, canonical(자기 주소), og:title·og:url·og:image·og:image:alt가 `fortune-compatibility-seo.constant.ts` 값과 같다. `robots`는 `index, follow`. JSON-LD는 BreadcrumbList와 FAQPage가 있다.
- 동의 전 HTML에 `<input>`과 이용 전 확인 화면이 없다. 개인 결과와 같은 조합 전용 문구도 없다(design D-5 안 1 그대로).
- 서버 HTML의 설명 문장은 관계 유형 문단(육합 등), 등급 규칙, 계산 기준, FAQ다. 관계 유형 결과 묶음(요약·잘 맞는 점) 자체는 동의 뒤 클라이언트에서만 그려진다. design D-5 안 1과 같고 AC-10의 "결과 설명 문장" 해석도 이에 따른다.
- `MENU_LIST`: 운세 그룹에 `/fortune/compatibility`가 "별자리 운세" 다음, "사주" 앞에 있다. sitemap에 띠·별자리 주소가 있고 허브는 `MENU_LIST`로 들어간다.

### AC-11 저장·전송 없음

- 궁합 소스(페이지, 세 화면 폴더, 공용 궁합 컴포넌트, 훅, 유틸, 상수, 타입)에 `localStorage`, `sessionStorage`, `fetch(`, axios, `console.`, `XMLHttpRequest`, `sendBeacon`, `document.cookie`, `http(s)://`가 없다.
- 동의 저장은 기존 서비스 하나다. 저장 키 접미사는 `_fortune_compatibility_consent_v1`로 운세 키와 다르고, 값은 `v`, `version`, `agreedAt` 세 필드만 허용한다. 범위를 안 넘기면 운세 키·버전을 쓴다.
- e2e에서 결과를 본 뒤 URL과 localStorage·sessionStorage·쿠키가 그대로임을 확인했다. 흐름 상태에 생년월일이 남지 않는 것은 단위 테스트로 확인했다.

## 3. FAQ 안내와 실제 동작 대조

- 별자리 FAQ 2번("시각을 모르시면 두 가지 결과를 모두 확인"): 동작과 맞다. 경계일에 시각 모름을 고르면 후보를 고르고, 결과의 "다른 후보로 보기"로 두 결과를 모두 볼 수 있다. e2e로 확인했다.
- 띠 FAQ 2번("1월 하순에서 2월 중순에 태어난 분의 띠가 다를 수 있어 이 경우 다른 후보도 함께 볼 수 있습니다"): 일부만 맞다. 1~2월 출생이면 입춘 기준 안내와 "띠별 운세" 링크는 항상 나온다. 하지만 "다른 후보로 보기"는 입춘 당일에 시각 모름을 골랐을 때만 나온다. 입춘이 아닌 1~2월 날짜에는 후보 전환이 없다. 문장이 "이 경우 = 1~2월 전체"로 읽히면 안내와 동작이 어긋난다.

## 4. 실패·불일치 항목

테스트 실패는 없다. 아래는 승인 문서와 구현의 차이다. 담당에게 되돌릴지는 PM이 정한다.

| # | 내용 | 원인 | 재현·근거 | 담당 |
|---|---|---|---|---|
| 1 | 띠 FAQ 2번 문장이 실제 동작보다 넓게 읽힌다 | 앱(문구) | 띠 궁합에서 1990-02-10 입력 시 후보 전환 버튼 없음(e2e 확인). `fortune-compatibility-faq.constant.ts`의 띠 FAQ 2번 | frontend-dev(문구 수정은 PM 승인 필요) |
| 2 | 메뉴 아이콘이 승인안과 다르다. 구현 `HeartHandshake`, design 5.6·ui-ux·FE-09는 `Users`("하트·연애를 떠올리지 않게") | 앱 | `src/constants/menu.constant.ts` 궁합 항목, `menu-icon.constant.ts` | frontend-dev |
| 3 | 홈 운세 그룹 설명이 승인안과 다르다. 구현 "…띠별·별자리 운세, 궁합", design D-8·FE-09는 "…띠별·별자리 운세와 궁합" | 앱 | `src/constants/home.constant.ts` | frontend-dev |
| 4 | 띠·별자리 궁합 페이지의 OG 이미지 배지(tag)가 "운빨연구소"로 나온다. design 6장은 `ogImage.tag`를 "띠 궁합", "별자리 궁합"으로 넘기라고 했고 상수 `FORTUNE_COMPATIBILITY_OG_TAGS`는 정의만 있고 쓰이지 않는다 | 앱 | 두 페이지 `ogImage: { alt }`만 전달. 서버 HTML의 og:image URL에 `tag=운빨연구소` | frontend-dev |

2, 3번은 PM이 의도적으로 바꾼 것이면 design·dev-tasks 문서를 맞추면 된다.

## 5. 남은 한계

- 접근성은 역할·이름 기반 선택자로 흐름이 동작하는지만 확인했다. 자동 접근성 검사 도구는 프로젝트에 없어 쓰지 않았다.
- 320px 가로 스크롤은 허브, 띠(동의 화면), 별자리(동의 후 첫 단계와 가장 긴 이름 두 개의 결과)에서 확인했다. 띠 결과 화면은 같은 결과 컴포넌트라 따로 열지 않았다.
