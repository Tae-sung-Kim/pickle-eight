# 메뉴 룰렛 끼니 확장 리서치

작성일: 2026-11-23
근거 기획서: `docs/menu-meals/plan.md` (M20 근처 "리서치 필요 여부 판단" 장과 열린 질문)
범위: 끼니별 검색 수요, `/meal`·`/menu`·`/lunch` 주소 비교, 카카오 AdFit 기준, 지도 링크 관행, 리다이렉트 응답 코드. 코드는 건드리지 않았다.

확인 원칙: 출처를 찾지 못한 내용은 "확인 필요"로 적었다. 검색량 수치는 구하지 못했고 추정하지 않았다.

## 1. 한 줄 요약

점심, 저녁, 아침·브런치 메뉴를 무작위로 골라 주는 오락용 룰렛 서비스의 검색 수요를 조사했다. 정확한 검색량은 확보하지 못했고, 주소·지도 링크·광고 기준은 공식 문서로 확인했다.

## 2. 한국어 검색 수요 (항목 1)

### 2-1. 조사 결과

- "점심 메뉴 추천", "저녁 메뉴 추천", "아침 메뉴 추천", "브런치 메뉴 추천", "오늘 뭐 먹지", "메뉴 룰렛"의 월간 검색량은 확인하지 못했다. 네이버 검색광고 키워드 도구(searchad.naver.com)에서 직접 조회해야 한다. 이 도구는 광고 집행 없이도 PC·모바일 월간 검색량을 보여 주며, 한 번에 키워드 5개까지 조회할 수 있고, 낮은 검색량은 "< 10"으로 표시된다. 제3자 조회 도구(엔키워드, 마피아넷, SURF 등)도 같은 광고 API 데이터를 쓴다고 소개한다.
- 참고용 약한 근거 하나: 공개 GitHub 이슈의 블로그 키워드 추적글(2026-11-22)이 "브런치 카페" 월간 약 3,000 수준이라고 적었다. 측정 방법과 출처 신뢰도를 확인할 수 없어 기획 근거로 쓰지 말 것. 같은 글은 주말에 맛집 검색이 늘어난다고 한다.
- Google 트렌드(trends.google.co.kr)는 상대 지수만 준다. 절대 검색량이 아니므로 끼니 간 비교용으로만 쓸 수 있다. 확인 필요: 한국 검색 기준 "저녁 메뉴 추천"과 "아침 메뉴 추천"의 상대 추이.

### 2-2. 검색 의도 해석 (기획 판단, 출처 기반 아님)

- "점심 메뉴 추천"류는 "무엇을 먹을지"를 묻는 의도와 "어디서 먹을지"를 묻는 의도가 섞여 있다. 후자는 맛집 검색과 겹친다. 조사에서 확인된 맛집 검색 플랫폼은 다이닝코드(diningcode.com) 같은 빅데이터 맛집 서비스다. 식당 검색 쪽으로 가면 이 서비스의 목적(오락용 룰렛)과 어긋난다.
- "오늘 뭐 먹지"는 끼니를 특정하지 않는 말이라 끼니 선택 화면과 잘 맞는다. 검색량은 확인 필요.
- "메뉴 룰렛"은 기능 이름 검색이다. 경쟁 서비스 목록은 이번 조사에서 충분히 찾지 못했다. 확인 필요: 메뉴 랜덤 추천 웹·앱의 목록과 기능 비교.

### 2-3. 경쟁 사이트 유형

조사에서 확인한 유형은 세 가지다. 세부 서비스 목록은 확인 필요.
- 지도 기반 맛집 검색: 카카오맵, 네이버 지도, 구글 지도, 다이닝코드.
- 식당 메뉴판·가격 정보 사이트: 이번 조사에서 개별 서비스 확인 못함.
- 메뉴 랜덤 추천·룰렛 도구: 이번 조사에서 개별 서비스 확인 못함.

## 3. 주소 비교: `/meal` vs `/menu` vs `/lunch` 유지 (항목 2)

### 3-1. 근거로 쓸 수 있는 공식 기준

- Google 검색 센트럴 문서는 URL에 읽기 쉬운 단어를 쓰고, 독자가 검색하는 언어의 단어를 쓰라고 권한다. 음역도 허용한다. 단어 구분은 밑줄 대신 하이픈을 권한다. 단어를 붙여 쓰는 것은 권장하지 않는다.
  출처: https://developers.google.com/search/docs/crawling-indexing/url-structure
- 이 문서는 "주소에 키워드를 넣으면 순위가 오른다"는 보장을 하지 않는다. 주소 단어의 영향은 작다고 보는 것이 안전하다. 확인 필요: 이 점을 직접 밝힌 공식 문구 위치.

### 3-2. 세 주소 비교

| 주소 | 장점 | 주의점 | 리서치 판단 |
|---|---|---|---|
| `/meal` | 끼니 전체를 가리킨다. 점심·저녁·아침을 한 단어로 묶는다 | 영어다. 한글 검색어와 주소가 직접 맞지 않으므로 제목, 설명, FAQ가 한글 키워드를 맡아야 한다 | 근거상 무난. 기획 추천과 같다 |
| `/menu` | 한글 "메뉴"와 대응한다 | 공식 근거는 없다. 사용자가 식당 메뉴판을 찾는 검색과 겹칠 위험은 기획 판단이며, 검색 의도 데이터로 확인되지 않았다 | 확인 필요. 기획의 보류 판단을 막을 근거는 찾지 못함 |
| `/lunch` 유지 | 기존 검색 유입이 그대로 맞는다 | 끼니 확장과 맞지 않는다. 저녁 기능을 점심 주소에 넣게 된다 | 비추천. 기존 점심 주소는 `/meal`로 옮기고 `/lunch` 자체는 M15 결정 사항 |

- 한글 주소(예: `/메뉴-룰렛`)는 공유 시 퍼센트 인코딩으로 길어진다. Google 문서는 대상 언어 단어를 권하지만, 이 항목은 설계 담당이 주소 형식을 정할 때 확인한다.

## 4. 카카오 AdFit 정책 (항목 3)

### 4-1. 매체(사이트) 운영 기준

- AdFit 운영정책 페이지(구 경로 `adfit.kakao.com/web/html/old/use.html`)에는 음식이나 식당을 제한하는 조항이 없다. 건강·다이어트 주장을 따로 규제하는 조항도 없다.
- "현행 법률에서 금지된 요인"에 든 품목으로 주류가 나온다. 총기, 담배, 복권, 불법의약품과 함께 있다. 같은 페이지의 "성인·음란 표현" 항목에는 유흥업소 관련 콘텐츠가 있다.
- 광고 표기 의무를 직접 말하는 조항은 없다. 다만 "무효클릭" 조항에서 콘텐츠 UI를 광고와 구분되지 않게 조작하거나, 클릭을 유도하는 문구·이미지·화살표를 쓰는 것을 금지한다.
- 맛집 글을 복사한 콘텐츠, 초상권 침해 콘텐츠는 제한될 수 있다. 이 서비스는 자체 문구만 쓰므로 해당 없음.
- 확인 필요: 위 페이지가 "old" 경로다. 현재 운영정책 원문은 AdFit 사이트에서 다시 확인하고, 심사 반려 사례는 카카오 고객센터에 확인한다.

### 4-2. 광고주용 업종 가이드 (AdFit 매체 기준과 다름, 참고용)

카카오 비즈니스 가이드에서 확인한 내용이다. 이 서비스는 광고주가 아니므로 직접 적용되지 않지만, 음식 관련 표현 판단에 참고된다.
- 식품: 「식품 등의 표시·광고에 관한 법률」 등 관련 법령을 어기면 광고할 수 없다. 특수영양식품 등은 자율심의기구 사전심의가 필요하다.
- 주류: 주류를 판매·중개하는 사이트는 광고할 수 없다. 주류 광고에는 과음경고 문구가 필요하다.
  출처: https://kakaobusiness.gitbook.io/main/ad/searchad/channelsearch/ad-audit/restricted-industry (제한 업종, 검색광고 채널 기준)
  출처: https://kakaobusiness.gitbook.io/main/ad/searchad/keywordad/ad-audit/guide (업종별 가이드 상위 페이지)

### 4-3. 이 서비스에 주는 의미

- 주류 콘텐츠가 있으면 AdFit 매체 심사에서 불리하다. 술안주 끼니를 빼기로 한 기획은 이 기준과 맞는다.
- 저녁 끼니 메뉴 중 안주 연상 메뉴와 "해장" 같은 문구는 기획 M7에서 따로 정해야 한다. 이번 조사로 AdFit의 구체 금지 목록은 확인되지 않았다.
- 광고 표시 방식: 지도 링크를 광고 슬롯처럼 보이게 꾸미면 무효클릭 조항에 걸릴 수 있다. 지도 링크와 AdFit 광고 영역을 시각적으로 구분한다.

## 5. 지도 링크 표시·고지 관행 (항목 4)

### 5-1. 카카오맵

- 공식 웹 가이드(apis.map.kakao.com/web/guide/, 지도 URL 섹션)는 검색 링크를 `https://map.kakao.com/link/search/검색어` 형태로 안내한다. 장소 ID, 지도 좌표 패턴도 있다. 공식 문서에 적힌 패턴만 쓰라는 것이 원칙이다.
- 이 섹션에는 출처 표기(attribution) 안내가 없다.
- 카카오 데브톡에서 카카오 측 답변으로, Local API 응답을 따로 저장하는 것은 현 정책상 허용되지 않는다고 확인된다. 이 서비스는 API를 쓰지 않고 검색 링크만 만들므로 해당 사항은 없다. 링크 검색어를 만들 때 API 응답을 저장하지 않도록 설계에 적는다.
- 카카오는 문서에 없는 방식의 리소스 직접 접근을 막고 있다(2025년 10월부터 단계 차단 안내). 검색 링크만 쓰고 지도 데이터를 긁지 않는다.
- 확인 필요: 카카오 측 링크 이용 조건을 한 문장으로 확인한 공식 답변. 데브톡 2026년 11월 글에서 OG 태그 조회 허용 여부는 답변이 없었다. 이 서비스는 OG 조회를 하지 않으므로 영향 없음.

출처:
- https://apis.map.kakao.com/web/guide/
- https://devtalk.kakao.com/t/faq-api/125610 (카카오맵 API 문의 FAQ)
- https://devtalk.kakao.com/t/api/150597 (API 저장 허용 문의)
- https://devtalk.kakao.com/t/api/146245 (구 리소스 접근 차단 공지)

### 5-2. 네이버 지도

- 공식 웹 검색 링크 문서는 찾지 못했다. 제3자 안내에서 웹 검색 경로가 `https://map.naver.com/p/search/<인코딩된 검색어>` 형태로 소개된다. 공식 확인 필요.
- 앱 URL 스킴에는 `search` 동작과 필수 `query` 파라미터가 있다. 앱이 없으면 설치 페이지로 보내야 한다. 공식 문서 출처: https://guide-gov.ncloud-docs.com/docs/naveropenapiv3-maps-url-scheme-url-scheme (지도앱 연동 URL Scheme, NCP 문서)
- 네이버 지도 API는 NCP에서 신청하고 약관에 동의해야 한다. 이 서비스는 API를 쓰지 않는 링크이므로 신청 대상이 아니다. 확인 필요: 검색 링크를 외부 사이트가 만들어 연결하는 것을 네이버 약관이 어떻게 보는지. 공식 약관 원문을 찾지 못했다.

### 5-3. 구글 지도

- Maps URLs는 API 키가 필요 없다. 검색 링크 형식은 `https://www.google.com/maps/search/?api=1&query=검색어`다. `api=1`은 필수다. 특정 장소는 `query=장소이름` 형식을 권장하고, 좌표만 쓰는 방식은 원하는 장소 상세로 안정적으로 연결되지 않는다고 공식 문서가 안내한다.
- UTM 파라미터(`utm_source`, `utm_campaign`)는 선택이다.
- 공식 Maps URLs 문서에는 이용약관, 출처 표기 의무, 사용 제한이 없다. 대신 Google Maps Platform 약관 3.2.2(a)는 앱 이용약관에 지도 기능이 들어 있다는 사실을 알리도록 요구한다. EEA 약관은 Google Maps 추가 약관과 Google 개인정보처리방침 링크를 요구한다. 이 조항은 API 고객 기준이라 검색 링크에 그대로 적용되는지 확인 필요. 보수적으로는 약관에 지도 기능 안내와 Google Maps 추가 약관 링크를 두는 것이 안전하다.

출처:
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/architecture/maps-url
- https://developers.google.com/maps/documentation/urls/quick-reference
- https://cloud.google.com/maps-platform/terms (Google Maps Platform 약관, 3.2 조항)
- https://maps.google.com/help/terms_maps/ (Google Maps 추가 약관, EEA 약관에서 참조)

### 5-4. 표시·고지 관행 정리

| 항목 | 관행 | 출처 |
|---|---|---|
| 외부 이동 안내 | 링크 근처에 외부 지도 사이트로 이동한다는 문구. 기획 AC-18과 같다 | 기획 문서 기준(기존 점심 기획) |
| 제휴·광고 표기 | 가게나 지도 서비스에서 경제적 대가를 받으면 추천·보증 표시 의무가 생긴다. 2026-06-01 개정 지침 시행 중 | 아래 공정위 지침 |
| 광고와 구분 | 지도 링크가 광고처럼 보이면 AdFit 무효클릭 조항에 걸릴 수 있다 | AdFit 운영정책 |
| 약관 안내 | 지도 기능 포함 사실과 제공자 링크를 약관에 둔다 | Google Maps Platform 약관 3.2.2(a) |

공정위 추천·보증 지침 근거:
- 추천·보증인이 경제적 대가를 받거나 고용된 상태에서 추천하면 이해관계를 표시해야 한다. 이 서비스는 가게 제휴, 메뉴 판매 연결, 광고 대가가 없으므로 표시 의무가 생기지 않는다. 단 기획 기준대로 수익이 AdFit뿐인 상태를 유지해야 하며, 제휴 링크를 넣으면 표시 의무가 생긴다.
- 출처: https://www.law.go.kr/LSW/admRulInfoR.do?admRulSeq=2100000280130 (추천·보증 등에 관한 표시·광고 심사지침)
- 출처: https://www.korea.kr/briefing/pressReleaseView.do?newsId=156764553 (2026 개정·시행 보도자료)

## 6. 리다이렉트 응답 코드 (항목 5)

- Next.js 공식 문서: `redirects()`에서 `permanent: true`는 308을 쓰고, 클라이언트와 검색 엔진에 리다이렉트를 영구 캐시하라고 알린다. `permanent: false`는 307이다. 이 문서의 설명상 Next.js는 302/301 대신 307/308을 써서 HTTP 메서드를 보존한다. 출처: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- 같은 문서는 `statusCode` 속성을 쓰면 `permanent` 대신 상태 코드를 직접 줄 수 있다고 한다. 두 속성을 같이 쓸 수 없다. 즉 301을 낼 수 있는 공식 방법이 있다. 설계 단계가 이 선택을 정하면 된다(기획 M13).
- Google 검색 센트럴: 301과 308은 모두 영구 이동이다. 색인에서 대상 URL을 정식 주소로 본다. 302, 303, 307은 임시 이동으로 분류된다. 출처: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Google의 John Mueller 발언(Search Engine Roundtable 보도): 308을 301처럼 쓰면 Google은 301로 처리한다. 차이는 브라우저의 요청 메서드 보존에 있다. 출처: https://www.seroundtable.com/google-308-redirects-25722.html
- 네이버 서치어드바이저: 공식 문서에서 301과 308 처리 방식을 찾지 못했다. 제3자 가이드는 도메인 변경 뒤 검색 결과가 한동안 바뀔 수 있다고 적었지만 공식 근거가 아니다. 확인 필요.
- 체인 주의: Google 문서는 리다이렉트 체인과 순환을 피하라고 한다. 옛 주소는 최종 새 주소로 한 번에 보낸다. `/lunch/today` → `/meal`을 한 단계로 둔다.

결론: 요구가 301이면 Next.js `statusCode: 301` 방식을 설계 단계에서 검토한다. 308을 쓰더라도 Google은 영구 이동으로 처리하므로 검색 측면에서 큰 차이는 없다고 공식 문서가 말한다. 네이버는 확인 필요.

## 7. 저작권·법적 주의점

이 절은 법률 판단이 아니다. 출처가 있는 사실과 확인 필요 항목을 나눴다.

| 구분 | 내용 | 판단 |
|---|---|---|
| 메뉴 이름 | "김치찌개" 같은 일반 음식 명칭은 특정 저작권 대상이 아니다. 기획 원칙(일반 명칭만) 유지 | 법률 확인 필요: 이름 목록 자체의 저작권 여부는 단정하지 않는다 |
| 프랜차이즈 상표 | 상표가 들어간 메뉴 이름은 쓰지 않는다. 기획의 "치킨" 같은 일반 명칭 원칙 유지 | 확인 필요: 상표 등록 여부 검색은 별도 |
| 지도 데이터 | 지도 데이터는 직접 쓰지 않는다. 검색 링크만 쓴다 | 카카오는 API 응답 저장을 금지하는 입장. 네이버 약관은 확인 필요 |
| 지도 상표·로고 | 지도 로고를 쓰면 제공자 표기 규칙을 따른다. 텍스트 링크만 쓰면 기본 규칙 | Google Maps 약관 3.2.2(b)에 표기 의무가 있다. 로고를 쓰는 경우 확인 필요 |
| 식품 표현 | 식품 표시·광고법의 건강·영양 표현 규제 대상이 될 수 있다. 기획은 건강 표현을 쓰지 않는다 | 법률 확인 필요. 아침 문구의 "든든한", "건강한" 등은 기획 금지어에 있다 |
| 음주 연상 | AdFit 매체 심사와 미성년 음주 문제 | 기획 M7, M19에서 사용자 판단 |
| 해장 표현 | 술과 연결되는 말은 금지 목록에 넣는 것이 안전 | 사용자 판단(M7) |
| 추천·보증 표시 | 제휴가 생기면 표시 의무 | 현재 해당 없음 |

## 8. 출처 목록

- Google 검색 센트럴, URL 구조: https://developers.google.com/search/docs/crawling-indexing/url-structure
- Google 검색 센트럴, 301 리디렉션: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Search Engine Roundtable, 308 처리 보도: https://www.seroundtable.com/google-308-redirects-25722.html
- Next.js 리다이렉트 문서: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- 카카오 AdFit 운영정책(구 경로): https://adfit.kakao.com/web/html/old/use.html
- 카카오 비즈니스 업종별 가이드(제한 업종): https://kakaobusiness.gitbook.io/main/ad/searchad/channelsearch/ad-audit/restricted-industry
- 카카오맵 웹 가이드: https://apis.map.kakao.com/web/guide/
- 카카오 데브톡 FAQ: https://devtalk.kakao.com/t/faq-api/125610
- 카카오 데브톡 API 저장 문의: https://devtalk.kakao.com/t/api/150597
- NCP 지도앱 연동 URL Scheme: https://guide-gov.ncloud-docs.com/docs/naveropenapiv3-maps-url-scheme-url-scheme
- Google Maps URLs 시작 안내: https://developers.google.com/maps/documentation/urls/get-started
- Google Maps URL 참조: https://developers.google.com/maps/documentation/urls/quick-reference
- Google Maps Platform 약관: https://cloud.google.com/maps-platform/terms
- Google 지도 추가 약관: https://maps.google.com/help/terms_maps/
- 추천·보증 표시·광고 심사지침(법제처): https://www.law.go.kr/LSW/admRulInfoR.do?admRulSeq=2100000280130
- 공정위 2026 개정 보도자료: https://www.korea.kr/briefing/pressReleaseView.do?newsId=156764553
- 네이버 키워드 도구 안내(제3자): https://kidnapper.co.kr/blog/guide/naver-keyword-tool-usage-guide/
- 블로그 키워드 추적글(제3자, 참고용): https://github.com/kangeunseo04/blog-keywords/issues/103

## 9. 기획자에게 넘길 열린 질문

1. 검색량 확인: 네이버 키워드 도구로 "점심 메뉴 추천", "저녁 메뉴 추천", "아침 메뉴 추천", "브런치 메뉴 추천", "오늘 뭐 먹지", "메뉴 룰렛"의 월간 검색량을 직접 조회해 줄 수 있는가? 이 결과가 M1(그 밖의 끼니)과 M5(추천 키워드)를 정한다.
2. `/menu` 보류를 유지하는가? 공식 근거는 없고 기획의 검색 의도 판단이다.
3. 네이버 지도 검색 링크 형식과 약관 조건을 사용자가 확인할 수 있는가? 공식 문서를 찾지 못했다.
4. 구글 지도 링크를 유지할지(M11). 공식 Maps URLs는 키 없이 쓸 수 있지만, 약관상 지도 기능 안내와 Google Maps 추가 약관 링크가 필요할지 법률 확인이 필요하다.
5. 301을 낼지 308을 쓸지(M13). Next.js는 `statusCode: 301`을 공식 지원한다.
6. AdFit 현재 운영정책 원문을 사용자가 확인하고, 저녁 메뉴 목록 검수 때 음주 연상 기준과 함께 본다.
7. 식품 표시·광고법 관련 표현(아침 문구)은 법률 검토 대상인가? 기획상 금지어로 막았지만 법률 확인은 없다.
