# 날씨 문구 기록 (FE-2)

코드: `src/features/meal/constants/meal-notice.constant.ts`, `meal-faq.constant.ts`, `meal-copy-rule.constant.ts`

## 출처
- `MEAL_WEATHER_SOURCE_URL` = `https://www.weather.go.kr/w/index.do` (source-check.md 결정 (b), 날씨누리, https).
- 출처 문구: "날씨 정보: 기상청 단기예보(공공데이터포털, 공공누리 제1유형). 기상청 홈페이지: <URL>"
- 작성연도: 확인 전이라 문구에서 뺐다(source-check.md "미확인"). 확정되면 `MEAL_WEATHER_SOURCE_TEXT`에 한 곳만 추가한다. design.md의 `{year}` 자리표시는 쓰지 않는다. 출시 전 PM 확인 항목.

## 확정 문구
- 날씨 한 줄 4종: ui-ux-design.md 확정 문구 그대로(메뉴 이름 없음, "결과는 여전히 무작위예요." 포함).
- 패널 안내 1·2, 안내 2 트리거, 정확도, 실패 안내: plan 고지 1·2·4·5 그대로.

## 바꾼 기존 문장 (추천하지 않음/같은 확률 -> 날씨에 따라 확률이 조금 달라지는 오락용 무작위 뽑기)
- `MEAL_RANDOM_NOTICE_TEXT`, `MEAL_RESULT_NOTICE_TEXT`: "추천하거나 평가하지" 삭제, 날씨 확률 문장 추가, "특정 메뉴나 식당을 평가하지 않습니다" 유지.
- `MEAL_INTRO_TEXT`, FAQ "메뉴는 어떻게 뽑나요?": "같은 확률" 삭제.
- FAQ 1개 추가("날씨 반영은 무엇인가요?"). 총 6개.

## 금지어 추가
날씨에 딱, 보양, 몸에 좋, 건강에 좋, 폭염, 한파, 특보, 정확한 날씨.

## 내 지역 한 줄 안내 (2026-11-28, 사용자 승인)
- `MEAL_REGION_NOTICE_TEXT` "시·도는 날씨 조회에만 쓰이고, 동네 이름은 서버로 보내거나 저장하지 않습니다. 위치 권한은 요청하지 않습니다. 상세 주소나 전화번호는 적지 마세요." 시·도는 서버로 가고 동네 이름은 안 간다는 두 사실을 모두 담는다. 금지어 없음.
- `MEAL_REGION_TITLE` "내 지역".
- 대체: 날씨 안내 1 줄(`MEAL_WEATHER_NOTICE_LINES[0]`)과 동네 입력 안내 5줄(`MEAL_AREA_NOTICE_LINES`, 이제 이 한 줄뿐)을 이 문장으로 바꿨다. 삭제된 동네 안내 문장: 지도 링크로 검색어가 간다(외부 링크 안내 `MEAL_EXTERNAL_LINK_NOTICE_TEXT`·결과 고지가 같은 내용을 이미 담음), 상세 주소·전화번호를 적지 마라(입력 검사가 숫자·특수문자를 막음), 지도 결과가 동네 안인지 확인하지 않는다.
- 기온 줄: 최저·최고 단어를 쓰지 않는다. "오늘 4° ~ 9° · 현재 6°"(읽기: "오늘 기온 4도에서 9도, 현재 6도").
