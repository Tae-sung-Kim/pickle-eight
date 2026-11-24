# 점심 메뉴 룰렛 법적 문구 초안 (T-15, 승인 대상 T-16)

상태: 초안. 사용자 승인 전이며 src/ 와 COMPLIANCE.md 는 아직 고치지 않았다.
작성: 2026-11-19
근거: plan 법적·정책 요구사항(192~236행), design 12.1~12.3, AC-30. 현재 `src/app/terms/page.tsx`(시행일 2026-11-19, 꿈 해몽 8장 반영), `src/app/privacy/page.tsx`(꿈 해몽 1장 문단 반영), `COMPLIANCE.md` 1장과 11장(꿈 항목 반영), `docs/dream/legal-draft.md`.

이 문서는 법률 판단이 아니다. 법률 검토가 필요한 항목은 4장에 따로 모았다. 문구에는 점심 화면 금지 표현(추천, 보장, 맛집, 인기, 광고 등)을 쓰지 않았다. 약관과 방침은 화면 문구가 아니라 법적 문서지만 같은 기준으로 맞췄다.

## 0. 실제 장 번호 (현재 파일 기준)

이용약관 현재: 1 서비스 개요, 2 연령, 3 데이터 출처, 4 비제휴, 5 저장 데이터, 6 타로, 7 운세, 8 꿈 해몽, 9 광고 및 쿠키, 10 금지 행위, 11 지식재산권, 12 책임 제한 및 제3자 서비스, 13 면책 및 보상, 14 서비스 변경 및 중단, 15 약관 변경, 16 준거법, 17 분리가능성, 18 문의.

점심 장을 8장 다음에 넣으면 9장이 점심이 되고 기존 9~18장은 10~19장이 된다. 제3자 서비스 장은 12장에서 13장으로 바뀐다. design 12.1과 dev-tasks T-15 행의 "11장"은 옛 번호이며 이 문서는 현재 번호를 쓴다.

개인정보처리방침 현재: 1 수집 항목 및 방법, 2 브라우저 저장소 사용, 3 이용 목적, 4 법적 근거, 5 보관 기간, 6 외부 서비스 이용 및 처리위탁, 7 쿠키 및 동의 관리, 8 이용자 권리, 9 보안 조치, 10 어린이, 11 보호책임자, 12 방침 변경. 점심은 방침 번호를 바꾸지 않는다.

## 1. 이용약관

### 판단: 변경 필요 (세 곳)

1. 1장 서비스 개요 끝에 한 문단 (번호 변경 없음).
2. 새 9장 "점심 메뉴 룰렛 서비스" 추가, 기존 9~18장을 10~19장으로.
3. 13장(기존 12장) 책임 제한 및 제3자 서비스에 지도 서비스 문장 추가. 필요하다고 판단한다. 근거는 두 가지다. (a) 현재 문장은 호스팅, 데이터베이스, 광고 네트워크 등 "제3자 서비스의 장애·변경"을 열거하며, 이용자가 점심 결과에서 누르는 카카오맵·네이버지도는 이 열거에 없다. (b) 지도 검색 결과와 영업 정보는 우리가 통제하지 않으므로 책임 범위를 같은 장에서 밝히는 것이 맞다. 9장에도 같은 취지가 들어가지만 책임 제한은 한 장에 모여 있는 것이 기존 구조와 맞다.

3장(데이터 출처 및 정확성)은 로또 내용만 있고 점심은 외부 데이터를 쓰지 않으므로 고치지 않는다. 점심 메뉴 목록이 자체 작성이라는 말은 9장에 둔다.

### 1-1. 1장 서비스 개요 끝에 문단 추가

현재 마지막 문단: "또한 본 서비스는 꿈 속 소재를 검색하고 민간에서 전해 온 풀이를 읽어 볼 수 있는 꿈 해몽 기능을 오락과 자기 성찰 목적으로 제공합니다."

추가 문구
```
또한 본 서비스는 점심 메뉴를 룰렛으로 무작위로 뽑아 보고 지도 검색 페이지로
이동할 수 있는 점심 메뉴 룰렛 기능을 오락 목적으로 제공합니다.
```

### 1-2. 새 9장 추가, 기존 9~18장 번호 +1

위치: 8장 "꿈 해몽 서비스"와 기존 9장 "광고 및 쿠키" 사이. 서비스 장을 묶음으로 유지하는 기존 방식(타로 6, 운세 7, 꿈 해몽 8)과 같다. 대안은 7장이나 8장에 문단을 덧붙이는 것이지만 점심은 연령, 입력, 위기 안내가 모두 해당하지 않고 외부 링크 조항이 있어 독립 장이 읽기 쉽다(L3 승인과 같다).

현재 문구 → 변경 문구 (제목 번호만)

| 현재 | 변경 |
|---|---|
| 9. 광고 및 쿠키 | 10. 광고 및 쿠키 |
| 10. 금지 행위 | 11. 금지 행위 |
| 11. 지식재산권 | 12. 지식재산권 |
| 12. 책임 제한 및 제3자 서비스 | 13. 책임 제한 및 제3자 서비스 |
| 13. 면책 및 보상 | 14. 면책 및 보상 |
| 14. 서비스 변경 및 중단 | 15. 서비스 변경 및 중단 |
| 15. 약관 변경 | 16. 약관 변경 |
| 16. 준거법 및 분쟁 해결 | 17. 준거법 및 분쟁 해결 |
| 17. 분리가능성 | 18. 분리가능성 |
| 18. 문의 | 19. 문의 |

추가 문구 (9. 점심 메뉴 룰렛 서비스)
```
9. 점심 메뉴 룰렛 서비스

점심 메뉴 룰렛 서비스는 오락을 목적으로 제공됩니다. 이용자가 고른 카테고리와
국물 조건 안에서 메뉴가 같은 확률로 무작위로 정해지며, 뽑힌 메뉴는 특정 메뉴나
음식점을 제안하거나 평가하는 것이 아닙니다. 메뉴 목록은 이 서비스가 직접
작성한 것이며 외부 데이터를 사용하지 않습니다. 결과는 금전, 상품, 포인트,
경품 등 어떤 보상과도 관련이 없습니다. 식사에 관한 판단과 선택은 이용자
본인의 몫이며, 알레르기나 식이 제한, 건강 상태가 있는 경우에는 이 서비스의
결과에 의존하지 마시기 바랍니다.

결과 화면의 지도 검색 링크(카카오맵, 네이버지도)를 누르면 해당 사업자가
운영하는 외부 사이트가 새 탭에서 열리며, 이때 검색어로 뽑힌 메뉴 이름만
전달됩니다. 본 서비스는 해당 사업자와 제휴·후원 관계가 없습니다. 이동한 뒤에는
해당 사업자의 약관과 정책이 적용되며, 검색 결과, 음식점의 위치·영업 여부·
메뉴·가격 등 정보의 정확성과 최신성은 해당 서비스를 기준으로 하고 본
서비스는 이를 약속하지 않습니다. 점심 메뉴 룰렛 서비스는 이용자의 위치 정보를
요청하지 않으며, 고른 조건과 뽑힌 결과를 서버로 전송하거나 저장하지 않습니다.
```

문구 메모
- 기존 타로 6장, 꿈 해몽 8장과 같은 합니다체, 같은 구성(목적, 결과의 성격, 판단은 이용자 몫, 제휴 없음, 저장 관련)이다.
- "제안"과 "약속하지 않습니다"는 화면 금지 표현("추천", "보장")을 피한 대체 표현이다. 법적 문서에서 "보장하지 않는다"가 더 익숙하다면 사용자가 고를 수 있다(질문 3).
- 알레르기·식이 제한 문장은 plan과 design에 없는 추가 안이다. 서비스가 메뉴 이름만 다루고 건강 설명을 하지 않는다는 방침과 충돌하지 않지만, 넣을지는 사용자가 정한다(질문 2). 뺄 경우 해당 문장만 삭제한다.
- 상시 고지 5문장(화면 상수)과 문장을 맞추지 않았다. 약관은 요약이고 화면 문구는 `lunch-notice.constant.ts`가 기준이다.

### 1-3. 13장(기존 12장) 책임 제한 및 제3자 서비스에 문장 추가

현재 문구
```
본 서비스 이용으로 인한 손실(직접/간접/부수적 손해 포함)에 대해 당사는 법이
허용하는 범위 내에서 책임을 부담하지 않으며, 모든 결정과 책임은 이용자에게
있습니다. 호스팅(Vercel), 데이터베이스(Supabase), 광고 네트워크 등 제3자
서비스의 장애·변경으로 인한 손해에 대해서도 법이 허용하는 범위 내에서 책임을
지지 않습니다.
```

변경 문구 (두 번째 문장 뒤에 한 문장 추가, 나머지는 그대로)
```
... 광고 네트워크 등 제3자 서비스의 장애·변경으로 인한 손해에 대해서도 법이
허용하는 범위 내에서 책임을 지지 않습니다. 점심 메뉴 룰렛 서비스에서 연결되는
지도 검색 페이지(카카오맵, 네이버지도)의 내용, 검색 결과, 음식점 정보의
정확성, 해당 서비스의 장애·변경으로 인한 손해에 대해서도 같습니다.
```

대안(수정 폭이 더 작은 안): 열거에 "지도 검색 서비스(카카오맵, 네이버지도)"만 더한다. 권장안은 위 문장 추가다(질문 4).

### 1-4. 부수 변경
- `EFFECTIVE_DATE`: 현재 2026-11-19. 점심 반영일이 다르면 갱신한다. 날짜는 사용자 결정이다(질문 6).
- 약관 본문 안에 다른 장을 번호로 가리키는 문구는 현재 없다(꿈 해몽 초안 확인 사항과 같음). 구현 전에 `chapter`, `장` 문자열 검색으로 한 번 더 확인한다.
- 10장(기존 9장) 광고 및 쿠키는 문구를 바꾸지 않는다. 점심은 광고 정책이 기존과 같다(AdFit 표시 광고만).

## 2. 개인정보처리방침

### 판단: 변경 필요 (한 곳, 6장). 수집 항목은 바꾸지 않는다

근거
- 점심은 위치를 요청하지 않고, 조건·결과를 서버로 보내거나 저장하지 않으며, 브라우저 저장소도 쓰지 않고, 분석 이벤트도 보내지 않는다(기본안). 따라서 1장 수집 항목, 2장 브라우저 저장소 목록, 3장 이용 목적, 4장 법적 근거, 5장 보관 기간은 바꿀 이유가 없다.
- 기존 방문 통계(Vercel Web Analytics) 문구는 페이지 조회 집계를 설명하며 `/lunch/today` 주소 조회는 그 범위 안이다. 조건 값을 주소에 넣지 않으므로 소재 이름이 주소에 들어가는 꿈 해몽과 달리 추가로 올릴 항목이 없다.
- 그래도 6장에 한 문단은 필요하다. 지도 링크를 누르면 이용자의 브라우저가 카카오 또는 네이버로 직접 이동하고, 그쪽에서 이용자의 IP 주소 등이 처리될 수 있다. 이는 우리의 처리위탁이 아니라 이용자가 누르는 외부 사이트 연결이므로 위탁 목록(`<ul>`)에는 넣지 않고 목록 아래에 문단으로 둔다(Q12 추천안, design 12.2).

위치를 받지 않는다는 문장: 넣는 것을 권장한다.
- 이유: (a) 현재 방침에 위치 관련 문구가 전혀 없다. (b) 지도 링크가 있는 서비스이므로 이용자가 "위치를 쓰는가"를 궁금해할 수 있다. (c) 사실이므로 쓰는 데 비용이 없다.
- 주의: 이 문장은 약속이 된다. 나중에 위치 기능을 넣거나 분석 이벤트를 추가하면 방침을 같이 고쳐야 한다(plan 205행의 재판단 조건과 같다).
- 위치: 새 문단 안에 마지막 문장으로 넣는다. 1장에 별도 문단을 두는 대안은 아래 2-2에 적었다.

### 2-1. 6장 "외부 서비스 이용 및 처리위탁" 목록 아래에 문단 추가

위치: 현재 마지막 문단("각 사업자의 정책이 함께 적용되며, 이용자의 개인정보를 위 목적 외로 제3자에게 판매하거나 제공하지 않습니다.") 바로 뒤. 장 번호는 바뀌지 않는다.

추가 문구
```
점심 메뉴 룰렛의 지도 검색 링크(카카오맵, 네이버지도)는 처리위탁이 아니라
이용자가 직접 누르는 외부 사이트 연결입니다. 링크를 누르면 해당 사업자의
사이트가 새 탭에서 열리며, 이때 검색어로 뽑힌 메뉴 이름만 전달됩니다. 이동한
뒤에는 해당 사업자의 개인정보처리방침이 적용되고, 이용자의 IP 주소 등은 그
사업자가 처리할 수 있습니다. 점심 메뉴 룰렛은 위치 정보를 요청하지 않으며,
이용자가 고른 조건과 뽑힌 결과를 서버로 전송하거나 저장하지 않습니다.
```

### 2-2. 선택안: 1장 끝에 점심 문단 추가

타로, 운세, 꿈 해몽이 모두 1장 끝에 서비스별 문단을 두었으므로 형식을 맞추려면 1장에도 점심 문단을 둘 수 있다. 그 경우 2-1의 마지막 문장(위치·저장)은 1장으로 옮기고 6장 문단은 지도 링크 설명까지만 둔다.

추가 문구 (선택안, 1장 마지막 문단 뒤)
```
점심 메뉴 룰렛 서비스는 이용자의 위치 정보를 요청하지 않으며, 입력받는
개인정보가 없습니다. 이용자가 고른 카테고리와 국물 조건, 뽑힌 결과는 이
기기의 화면 안에서만 사용하며 서버로 전송하거나 저장하지 않고, 브라우저
저장소(localStorage, sessionStorage)에도 값을 남기지 않습니다.
```

기본안은 2-1 하나만이다(design 12.2, 변경 최소). 2-2를 함께 쓸지는 질문 5다.

### 2-3. 부수 변경
- `EFFECTIVE_DATE`를 배포일로 갱신한다(질문 6).
- 10장 어린이: 점심은 입력이 없어 연령 게이트를 두지 않는 것이 기본안이다(plan 200행, Q11에 포함). 그렇다면 10장은 바꾸지 않는다.

## 3. COMPLIANCE.md

### 판단: 변경 필요 (11장 항목, 1장 한 줄, 날짜, 운세 항목의 약관 장 번호). 루트 문서이므로 PM이 반영한다

### 3-1. 11장에 점심 항목 추가

위치: 11장 Dream interpretation 항목(마지막 줄 "Non-legal pre-release checks remain: ... passage unconfirmed)." 로 끝나는 블록) 바로 뒤, 문서 맨 아래 "All items above should be reviewed before each release..." 문장 앞.

추가 문구
```
- Lunch menu roulette (`/lunch/today`):
  - Entertainment notice shown directly under the h1 (always visible, never collapsed); a random-pick and no-reward notice always visible below the roulette area; a short notice below the result. Wording is fixed in `src/features/lunch/constants/lunch-notice.constant.ts`. The notice states that the result is random, not a recommendation or an evaluation, and that menu and business information is not promised.
  - Random pick, no recommendation: menus are drawn with equal probability among the selected filters (category, broth), excluding the previous pick when two or more candidates remain. Results are never presented as recommendations, rankings or reviews. Forbidden phrasing is listed in `src/features/lunch/constants/lunch-copy-rule.constant.ts` (check-only, not imported by screen code) and checked by `e2e/lunch-copy.spec.ts`.
  - No reward policy: no cash, goods, points, coupons or prizes are tied to a result. The always-visible notice states: "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다." No paid or credit features, no ticket or entry mechanics.
  - External map links: Kakao Map (`map.kakao.com`) and Naver Map (`map.naver.com`) web search URLs, opened in a new tab (`target="_blank"`, `rel="noopener noreferrer nofollow"`). The query is the menu name only, no location, no user data. No logos, no app deep links, no map API or API key, no affiliate parameters. A notice next to the links states that these are external sites run by Kakao and Naver, that their own policies apply after the move, and that search results and business information follow those services. The Terms (chapter 9) state non-affiliation.
  - No location and no personal data: no location permission is requested (`Permissions-Policy: geolocation=()` stays site-wide, see section 6). No input is collected. Selected filters, the draw result and the animation state stay in React state only: never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events or console output. No new browser storage key is added. No analytics events for draws or map link clicks (default plan). Site-wide Vercel Web Analytics records page paths only; the page path carries no filter value, and this is covered by the existing Privacy Policy wording.
  - Advertising: revenue is AdFit display ads only. No restaurant ads, affiliate links, delivery or reservation links, or menu sales links. Ads never gate or cover the roulette or the result.
  - Content source: the menu list and all copy are original text written for this service. No public data (no restaurant dataset), no external images or food photos, no external icon sets. No ranking, rating or user-count claims. Authorship log: `docs/lunch/copy-log.md`.
  - No legal review has been obtained for the lunch feature; the operator accepts the risk (decided YYYY-MM-DD, to be confirmed by the owner). Accepted-risk items: applicability of location-information rules (no location is requested), applicability of gambling-related rules (no reward is tied to a result), food labeling and advertising rules (menu names only, no health, nutrition or taste claims), policies on map search links and mobile or in-app browser behavior, and the Terms and Privacy Policy wording for the lunch feature. Non-legal pre-release checks remain: final notice wording, forbidden-wording string checks, map link behavior on mobile (Q17), AdFit screening, `comingSoon` and noindex removal (F-11).
```

비고: 마지막 줄은 사용자가 Q11에서 "위험 수용"을 고르는 경우의 문장이다. "검토 완료"를 고르면 그 날짜와 범위로 바꾼다. 날짜(YYYY-MM-DD)는 사용자 결정일로 채운다. 위치·사행성·식품 표시 항목 이름은 법률 판단이 아니라 plan에 적힌 확인 대상을 옮긴 것이다.

### 3-2. 1장 Cookies, Consent, Privacy에 한 줄 추가

위치: 1장 Dream 항목(13행) 바로 앞이나 뒤. Dream, Tarot, Fortune 줄이 모여 있으므로 Dream 줄 바로 뒤가 자연스럽다.
```
  - Lunch (`/lunch/today`): works regardless of cookie consent state. No input is collected. Selected filters and the draw result are kept in React state only (never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events). No browser storage key is used and no location permission is requested. The map links open Kakao Map and Naver Map in a new tab with the menu name as the only query.
```

### 3-3. 그 밖의 갱신
- 문서 맨 위 `Last updated` 날짜를 반영일로 바꾼다.
- 11장 Fortune 항목의 "existing full-liability wording in the Terms (chapter 12)"를 "chapter 13"으로 고친다. 현재 이미 꿈 해몽 반영으로 12장이 되어 있고, 점심 장 삽입으로 13장이 된다. "the age gap in Terms chapter 2"는 그대로 2장이다. Tarot 항목과 Dream 항목에는 장 번호 언급이 없다. 위 3-1 점심 항목의 "Terms (chapter 9)"는 이 초안 기준이며 번호가 바뀌면 같이 고친다.
- 7장 Robots and SEO: 점심은 출시 전까지 noindex이므로 선택 사항으로 "Lunch: `/lunch/today` stays noindex and out of the sitemap until release (F-11)" 취지의 한 줄을 넣을 수 있다. 필수는 아니다.
- 6장 보안 헤더 항목은 바꾸지 않는다. `Permissions-Policy: geolocation=()`는 그대로다. 지도 링크는 일반 링크이므로 CSP 변경도 없다고 본다(구현 중 확인).

## 4. 법률 검토 필요 항목 (판단하지 않고 모음)

기본안은 법률 검토를 받지 않고 운영자가 위험을 수용하는 것이다(운세, 꿈 해몽과 같은 방식). 아래는 사용자가 수용 또는 검토 여부를 정해야 하는 항목이다.

1. 위치정보 관련 법령: 점심은 위치를 요청하지 않으므로 대상이 줄었다는 것이 기획 판단이다. 지도 링크가 이용자의 위치를 기준으로 검색할 수 있는지(링크 도착 뒤 지도 사업자 쪽 동작)가 우리 서비스의 책임 범위에 영향이 없는지.
2. 사행성 관련 규제: 보상이 없고 보상 없음 고지를 둔 것으로 충분한지. 룰렛이라는 이름과 연출이 문제가 되지 않는지.
3. 식품 표시·광고 기준: 메뉴 이름만 쓰고 건강·영양·맛 설명이 없는 것으로 충분한지. 약관 9장의 알레르기·식이 제한 문장이 오히려 문제를 만들지 않는지.
4. 지도 검색 링크 정책: 카카오맵, 네이버지도 웹 검색 URL을 링크로 거는 것과 상표를 링크 라벨 텍스트로만 쓰는 것이 각 서비스 이용 조건에 맞는지. `nofollow` 사용 문제 여부. 모바일과 인앱 브라우저에서 새 탭 동작(Q17).
5. 이용약관 13장(기존 12장)의 전부 면책 문구가 점심의 지도 서비스 책임 배제에 대해 유효한지(기존 운세, 꿈 해몽 때 수용한 항목과 같은 성격).
6. 개인정보처리방침: 지도 링크 클릭 시 이용자 IP 등이 카카오·네이버에 전달되는 것을 6장 문단이 충분히 설명하는지. 지도 서비스가 처리위탁이 아니라는 구분이 맞는지(Q12).
7. 14세 미만 이용: 민감한 입력이 없어 연령 게이트를 두지 않는 것의 적정성(plan 200행, Q11).
8. 메뉴 이름과 자체 작성 문구의 권리 귀속(AI 작성 문구의 소유 포함). 메뉴 이름은 일반 명칭이지만 확인 대상에 포함한다.
9. 출시 전 비법률 확인: 지도 링크 도착 화면 동작, AdFit 표시, 최종 고지 문구.

## 5. 변경이 필요한 파일

| 파일 | 변경 | 담당 |
|---|---|---|
| `src/app/terms/page.tsx` | 1장 문단 1개, 새 9장 추가, 기존 9~18장 번호 +1, 13장(기존 12장) 문장 추가, 시행일 확인 | frontend-dev (T-17) |
| `src/app/privacy/page.tsx` | 6장 목록 아래 문단 1개(위치·저장 문장 포함), 선택안 시 1장 문단, 시행일 확인 | frontend-dev (T-17) |
| `COMPLIANCE.md` | 11장 점심 항목, 1장 한 줄, 날짜, 운세 항목의 약관 장 번호 12 → 13 | PM (T-18) |

변경하지 않는 파일: `THIRD_PARTY_NOTICES.md`, `DEPENDENCY_LICENSES.md`, `next.config.ts`. `README.md`와 `REFACTORING.md`는 이 초안 범위가 아니며 T-18이 따로 다룬다.

반영 시 확인: 약관 장 제목 목록이 1~19로 연속인지(grep), 방침 장 번호가 그대로인지, 기존 약관·방침 문자열을 보는 e2e(타로, 운세, 꿈)가 장 번호에 걸리지 않는지(T-19).

## 6. 사용자가 승인할 질문

1. 약관에 새 9장을 넣고 기존 9~18장을 10~19장으로 미는 안으로 갈지(권장). 대안은 8장 안에 덧붙이기.
2. 약관 9장의 알레르기·식이 제한 문장을 넣을지(권장은 넣기, 단 plan에 없는 추가 안).
3. 약관 문구를 "제안하거나 평가하는 것이 아닙니다", "약속하지 않습니다"로 할지, 법적 문서에서 익숙한 "추천하거나 평가", "보장하지 않습니다"로 할지(화면 금지 표현 검사는 약관 페이지에 적용되지 않는다).
4. 약관 13장에 지도 서비스 문장 추가 안(권장) 또는 열거만 늘리는 안.
5. 방침 위치·저장 문장을 6장 문단에 넣는 기본안만 갈지, 1장에도 점심 문단을 두어 타로·운세·꿈 해몽과 형식을 맞출지.
6. 약관·방침 시행일을 언제로 할지.
7. COMPLIANCE.md 법률 검토 상태를 "위험 수용"(기본안)으로 기록할지, "검토 완료"로 기록할지, 그리고 결정일.
