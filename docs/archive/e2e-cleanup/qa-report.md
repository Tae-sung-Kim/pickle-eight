# e2e-cleanup QA 보고서

이 문서는 티켓 T1(분류표 초안)의 결과입니다. T6과 T8-b가 이어서 같은 파일의 해당 절을 채웁니다. spec 코드는 이번 티켓에서 수정·삭제하지 않았습니다.

## 1. 분류표 읽는 법

- 대상: `e2e/*.spec.ts` 17개. 실제 `test(` 제목을 전부 뽑아 판정했습니다. `test.describe`, `test.beforeEach`, `test.skip`은 test로 세지 않습니다.
- 줄: 원본 spec에서 `test(`가 시작하는 줄 번호입니다. 줄 번호가 각 행의 키입니다. 제목이 긴 행은 `…`로 줄였습니다.
- 반복문 안의 `test(`(제목에 `${…}`가 있는 행)는 1건으로 셉니다. 실제 실행 건수는 이보다 많습니다.
- 분류 순서는 design.md 3절 1~6번을 따랐습니다. 문서·git 기록 검사, 보고용 `(참고)`, 제품 규칙이 아닌 소스 스캔은 먼저 삭제로 보냈습니다.
- 분류 값은 세 가지입니다.
  - 남김: e2e에 남는 흐름입니다. "옮긴 곳 / 사유" 칸에 최종 e2e 번호(예: `fortune#1`)를 적었습니다. 같은 흐름의 여러 원본 test가 한 개의 최종 test로 합쳐지면 모두 같은 번호를 적었습니다.
  - 단위 이관: `unit/<기능>/<이름>.test.ts` 경로를 적었습니다.
  - 삭제: 사유를 한 줄로 적었습니다.
- 약어: `crisis-phone` = `unit/shared/crisis-phone.test.ts`, `crisis-signal` = `unit/shared/crisis-signal.test.ts`. 나머지 경로는 행마다 전부 적었습니다.

### 1.1 실제 test 수

design.md는 827건, plan.md는 805건(사용자 집계 766건)이라고 적었습니다. 실제로 세어 보니 `test(` 호출 중 제목이 있는 것은 676건입니다(반복문 안 1건 포함). 827은 `test.describe`, `test.beforeEach`, `test.skip` 등을 함께 센 값으로 보입니다. 이 문서의 분류표는 676건 기준입니다.

| 원본 spec | test 수 |
|---|---|
| fortune-calc | 146 |
| fortune-copy | 86 |
| fortune | 80 |
| fortune-saju | 54 |
| fortune-saju.launch | 4 |
| fortune-v2 | 23 |
| tarot | 66 |
| tarot-v2 | 34 |
| tarot-copy | 48 |
| dream | 47 |
| dream-copy | 21 |
| lunch | 27 |
| lunch-copy | 12 |
| swagger-docs | 14 |
| swagger-docs.extend | 3 |
| lotto.smoke | 8 |
| lotto.flow | 3 |
| 합계 | 676 |

### 1.2 판단 메모 (PM 확인 요청)

1. `fortune-copy` 574줄은 제목에 `(참고)`가 있지만 "같은 구간 안 완전 중복은 자동 실패"라는 단언이 들어 있습니다. 규칙 2(보고용 삭제)가 아니라 자동 실패 단언만 단위로 옮기는 쪽으로 분류했습니다. 같은 이유로 `fortune-copy` 1082줄은 삭제하되 자동 실패 부분은 574줄 이관 test가 맡습니다.
2. `fortune-calc` 2269줄(절기 표 보완 기한 감시)은 실제 날짜가 2028-12-01을 넘으면 실패하는 test입니다. 단위로 옮기되 날짜를 고정할지 PM이 정해 주세요. 고정하지 않으면 2028년 12월에 단위 테스트가 깨집니다.
3. 로또 생성 조건 단위 테스트(`lotto-generator.test.ts`)에 1대1로 대응하는 원본 test가 없습니다. design 3.1은 `lotto.smoke`에서 이관한다고 했지만 해당 원본(61줄 게임 수 20 제한, 68줄 고급 옵션)은 화면 동작이라 e2e로 남겼습니다. 단위 테스트는 `lotto.util.ts`에서 새로 씁니다.
4. `lotto.flow` 81줄(핫/콜드 범위 모드)은 "남김"으로 분류했습니다. 화면 표시 부분만 `lotto#6`으로 줄이고 직접 센 값 대조는 `unit/lotto/lotto-hot-cold.test.ts`에서 새로 씁니다.
5. 고지·상담전화·금지 표현처럼 화면에서 읽은 값이 상수와 같은지만 보는 test는, 상수 자체를 단위로 고정했으므로 e2e 중복 항목은 삭제로 분류했습니다. 원문이 상수와 같다는 보증은 T4가 만든 단위 테스트가 맡습니다.
6. 로또 "당첨을 보장하지 않습니다" 원문 고정(plan AC-6)은 원본 test에 대응하는 제목이 없고 design 4.3절과 plan이 다릅니다(dev-tasks T4-x, 보류 항목). 이 분류표에는 영향이 없습니다.

## 2. fortune (원본 spec 6개, test 393건)

최종 e2e 목표는 15개입니다. 번호는 design 5.2절 목록의 순서입니다. fortune#1 허브→오늘의 운세(@smoke), #2 이용 동의 안 함, #3 연령 차단, #4 입력 오류, #5 윤달, #6 개인정보 비저장, #7 띠별, #8 띠 경계, #9 별자리, #10 사주 입력→결과(@smoke), #11 사주 시각 모름·경계, #12 사주 고지, #13 기기 시계 2029, #14 JS 끔, #15 SEO.

### 2.1 fortune-calc.spec.ts (146건)

원본 단언은 대부분 순수 계산입니다. 달력 표(음력·절기)는 `fortune-calendar`, 날짜·나이는 `fortune-date`, 띠·별자리·시드·풀이는 `fortune-reading`, 사주는 `fortune-saju`로 옮깁니다. `calendar-verification.md`를 근거로 적은 test(307, 664줄)는 문서를 읽지 않고 값이 리터럴이라 이관합니다.

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 284 | 음력 표는 1919~2049년이 한 해도 빠지지 않고 연속이다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 293 | 음력 표: 윤달은 연도당 0~1개… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 307 | 음력 표: 윤달이 있는 해는 48개다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts (문서 기록은 리터럴 48로) |
| 312 | 음력 표: 모든 달의 길이는 29 또는 30이다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 327 | 음력 표: 한 해 일수는 353~355 또는 383~385다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 345 | 음력 표: 설날은 양력 1월 21일~2월 20일 안… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 357 | 음력 표: 다음 해 설날 − 이번 해 설날 = 이번 해 일수 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 374 | 음력 표: 음력 마지막 날을 변환한 다음 날이 다음 해 설날 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 391 | 음력 표와 절기 표의 일관: 윤달에는 중기가 없고… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 459 | 절기 표는 1920~2028년이 연속이고 연도마다 24개다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 469 | 절기 표: 모든 값이 실제 날짜·시각이고 번호와 달이 맞는다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 490 | 절기 표: 시각이 오름차순이고 간격은 14~16일이다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 510 | 절기 표: 입춘은 2월 3~5일, 춘분은 3월 19~22일이다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 523 | 절기 표: 입춘은 같은 해 설날보다 늦지 않거나… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 542 | 1: 음력 2025-01-01 = 양력 2025-01-29 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 553 | 2: 음력 2000-01-01 = 양력 2000-02-05 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 563 | 3: 2025 입춘 02-03 23:10 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 573 | 4: 2024 춘분 03-20 12:06 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 583 | 5: 2025 춘분 03-20 18:01 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 593 | 6: 2026 춘분 03-20 23:46 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 603 | 7: 2027 춘분 03-21 05:25 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 613 | 8: 1920 입춘 02-05 11:26 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 623 | 9: 2026 입춘 02-04 05:02 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 633 | 추가: 1950 입춘 02-04 18:21, 1950 대한 정규화 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 650 | 추가(설계 4.1): 양력 1920-02-05 = 음력 1919-12-16… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 664 | 추가(calendar-verification.md): 양력 2023-04-15 = 음력 2023-02-25(윤) | 단위 이관 | unit/fortune/fortune-calendar.test.ts (문서 읽기 없이 리터럴) |
| 673 | 추가: 양력 1920-01-01은 음력 1919년 11월에 있다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 679 | 추가: 윤달이 있는 알려진 해 (2017·2020·2023·2025) | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 694 | isValidSolarDate: 윤년·평년 2월 29일과 달 경계 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 710 | toJulianDayNumber: 알려진 값 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 717 | JDN 왕복: 1919-01-01 ~ 2050-12-31 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 738 | compareYmd: 연·월·일 순서로 비교한다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 746 | parseDateKey: 정상 형식과 잘못된 입력 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 760 | AC-42: 오늘 2026-11-05, 출생 2012-11-06은 만 13세(차단) | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 766 | AC-43: 출생 2012-11-05는 생일 당일 만 14세(통과)… | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 772 | 14세 경계: 생일 전날은 13세, 생일 당일은 14세… | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 784 | AC-44: 2월 29일생은 평년 2/28에 아직 생일 전, 3/1에 지난다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 794 | AC-44: 2월 29일생이 14세가 되는 날 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 800 | 오늘이 2029-01-01이어도 나이가 계산된다 | 단위 이관 | unit/fortune/fortune-date.test.ts (`vi.setSystemTime`) |
| 811 | AC-7: 음력 2025-01-01 → 양력 2025-01-29… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 818 | AC-85: 음력 2023년 2월은 평달 1일과 윤달 1일이 다르다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 836 | AC-8: 윤달이 없는 달에서 윤달 체크를 넣으면 lunar-no-leap | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 843 | AC-8: 29일까지인 달의 30일은 lunar-invalid-day | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 884 | 음력 변환: 월·일이 범위 밖이면 invalid-date… | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 893 | getLunarLeapMonth·getLunarMonthLength: 표 밖·없는 달은 null | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 907 | getSeollalDate: 표 밖 연도는 RangeError | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 914 | 음력 변환은 양력 날짜와 1대1이다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 951 | AC-9: 연·월·일 중 하나라도 비면 empty | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 984 | AC-9: 존재하지 않는 양력 날짜는 invalid-date | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1007 | AC-9: 1920-01-01 이전은 before-min… | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1025 | AC-9: 오늘 이후 날짜는 future | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1051 | AC-9·AC-84: 2029-01-01 이후는 after-max… | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1071 | after-max는 future보다 먼저 검사한다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1095 | AC-9: 음력 입력이 양력 2029년이 되면 after-max | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1130 | AC-9: 음력 입력이 양력 1920-01-01 이전이면 before-min | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1149 | 음력 오류는 파이프라인으로 그대로 올라온다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1179 | AC-7: 같은 날을 양력·음력으로 넣어도 같은 양력 날짜 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1197 | AC-7: 양력 입력과 음력 입력의 개인 운세(시드)가 같다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1220 | calendar가 없으면 양력으로 본다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1228 | 오류 결과에는 오류 종류 외 입력값이 들어 있지 않다 (R-2) | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 1243 | getSolarTermTime: 표 밖 연도·잘못된 인덱스는 null | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 1257 | compareDateToSolarTerm: 절기 날짜 전·당일·후 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 1266 | isClockOnOrAfterSolarTerm: 시각이 같으면 절기 이후 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 1286 | getTtiKeyByYear: 쥐띠 기준 연도와 12년 주기 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1303 | AC-14: 1990-06-15는 말띠, 1992-05-10은 원숭이띠 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1314 | AC-15: 2025-02-01은 용띠이고 설날 기준으로는 뱀띠다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1325 | AC-16: 2025-02-03은 need-time… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1351 | AC-16: 2025-02-04는 시각 없이 뱀띠, 2025-02-02는 용띠 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1369 | 2024-02-05~09는 입춘 후·설날 전… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1399 | 1920~2028 모든 해: 입춘 전날은 전년도 띠… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1442 | 1월 1일·12월 31일은 같은 해의 입춘 전·후로 판정된다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1453 | 범위 밖 연도는 unsupported (띠) | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1469 | AC-25: 음력으로 입력한 입춘 당일 출생자 판정 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1496 | AC-22: 1990-05-15 황소자리, 1990-08-10 사자자리… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1511 | AC-23: 2026-03-20은 need-time… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1533 | AC-24: 2027-03-21은 need-time (05:25)… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1553 | AC-25: 음력으로 입력한 경계일 별자리 판정 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1573 | 1월 초와 12월 말은 염소자리… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1601 | 범위 밖 연도는 unsupported (별자리) | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1616 | 별자리 상수는 12개이고 시작 중기 번호가 홀수… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1632 | 1920~2028 모든 해, 12개 중기 모두: 전날은 앞 별자리… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1686 | 1920-01-01 ~ 2028-12-31 모든 날짜가 12별자리 중 하나 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1714 | hashFortuneSeed: FNV-1a 32비트 공개 테스트 값 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1720 | hashFortuneSeed: 같은 입력 같은 출력… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1747 | createFortuneRng: 같은 시드는 같은 수열… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1773 | toFortuneScore: 30·95 경계와 정수 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1790 | getFortuneBand: 구간 경계 54/55/74/75 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1801 | 점수 분포: 상 약 20%, 중 약 52%, 하 약 28% | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1816 | pickFortuneVariant: 0, 1, 2 세 구간으로 나눈다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1842 | AC-2: 같은 입력은 항상 같은 결과다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1850 | AC-2: 생년월일이나 날짜가 다르면 결과가 달라질 수 있다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1862 | AC-4: 같은 생년월일 연속 7일 총운 점수가 모두 같지는 않다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1884 | AC-5: 모든 점수는 30~95 정수이고 구간과 문구가 맞다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1935 | AC-6: 행운의 숫자는 1~2개이고 각 1~10… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1982 | 행운 대응표: 목 초록·동쪽·3,8 / 화 … | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 1999 | 세 구간과 변형 세 개가 모두 나온다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2012 | 쓰는 풀이 달라도 형식은 같다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2048 | 띠·별자리 풀 합본은 12개 키를 모두 가지고… | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2076 | 시드 문자열 형식이 바뀌면 결과가 바뀐다 | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2096 | 오늘 ${todayKey}: 개인 일운이 정상 생성된다 (반복문 안 1건) | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2125 | 오늘 ${todayKey}: 12띠 12별자리 결과가 정상 생성된다 (반복문 안 1건) | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2152 | 오늘 ${todayKey}: 출생 2028-12-31 통과, 2029-01-01 after-max… (반복문 안 1건) | 단위 이관 | unit/fortune/fortune-reading.test.ts |
| 2194 | 일일 운세 경로는 절기 표·절기 함수를 import하지 않는다 | 삭제 | 소스 import 스캔, 제품 규칙 아님 (design 3절 3번) |
| 2231 | FORTUNE_SUPPORTED_MAX_YEAR = 절기 표의 마지막 연도 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2235 | 절기 표의 첫 연도는 FORTUNE_MIN_BIRTH.year = 1920 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2241 | 음력 표는 1919 ~ MAX_YEAR + 1 이상을 덮는다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2251 | 출생 상한·입력 범위 상수는 모두 MAX_YEAR에서 만들어진다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2262 | 만료 기준일 상수는 2028-12-01이고 올바른 날짜 키다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2269 | 절기 표 보완(F-1) 기한이 지나지 않았다 | 단위 이관 | unit/fortune/fortune-calendar.test.ts (실제 날짜 의존, 1.2절 2번 확인 요청) |
| 2282 | 감시 조건 자체 검사: 기한 전은 통과, 후 표가 못 미치면 실패 | 단위 이관 | unit/fortune/fortune-calendar.test.ts |
| 2294 | getKoreaDateKey는 한국 날짜 형식(YYYY-MM-DD)을 돌려준다 | 단위 이관 | unit/fortune/fortune-date.test.ts |
| 2313 | 운세 그룹이 있고 그룹 href가 허브(/fortune)와 같다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2319 | 항목 href가 today·tti·starSign과 같고 순서도 그렇다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2331 | 출시 후 메뉴 마지막에 사주 항목이 있고 "사주"는 label에만 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2340 | 메뉴 항목마다 라벨·설명·아이콘이 있고 색은 운세 토큰이다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2349 | 다른 그룹(로또, 타로)의 href는 운세 경로와 겹치지 않는다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2369 | 5곳이 109, 1577-0199, 1588-9191, 1388, 1366 순서다 | 단위 이관 | unit/shared/crisis-phone.test.ts |
| 2386 | href는 tel: + 숫자만이고 number와 href 숫자가 같다 | 단위 이관 | unit/shared/crisis-phone.test.ts |
| 2402 | 화면 표기는 번호와 같고 이름·설명이 비어 있지 않으며 번호 겹침 없음 | 단위 이관 | unit/shared/crisis-phone.test.ts |
| 2412 | 위기 패널에는 앞의 세 곳만 나온다 | 단위 이관 | unit/shared/crisis-phone.test.ts |
| 2422 | 결과 하단 첫 줄에 24시간 운영과 상담전화 안내가 있다 | 단위 이관 | unit/shared/crisis-phone.test.ts (CRISIS_RESULT_LINE) |
| 2470 | AC-54: 일주 사례 (일진 계미, 갑신, 만세력 검산값) | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2479 | AC-54: 일주는 60일 주기이고 2029년 이후에도 계산된다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2485 | AC-54: 같은 일간은 같은 날 같은 십신, 십신 10종 표 일치 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2513 | AC-56: 시지 경계 (23:00 자, 00:59 자, 01:00 축, 22:59 해) | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2527 | AC-56: 2026-11-06(갑신일) 시주… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2538 | AC-56: 2026-11-07(을유일) 00:00, 00:30 병자, 01:00 정축 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2548 | AC-56: 23:30과 다음 날 00:30은 시주 같고 일주 다르다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2556 | AC-56: 1999-12-31 23:30 정사/임자, 2000-01-01 00:30 무오/임자 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2565 | AC-56: same-day는 23시대 시주 천간만 그날 일간으로 구한다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2580 | AC-56: 2025-02-03 입춘 23:10. 23:09 갑진… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2598 | AC-56: 입춘 전후 날짜(경계일 아님)는 하루 단위로 갈린다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2609 | AC-56: 2026 입춘 02-04 05:02 분 단위 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2624 | AC-56: 경계일 + 시간 모름이면 need-choice | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2649 | AC-56: 시간이 있으면 경계일이어도 single… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2661 | AC-56: 짝수 절기 12개 x 1920~2028 분 단위 전후 월지·연주 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2691 | AC-56: 월주는 오호둔 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2701 | AC-56: 연주는 (y-4) mod 60 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2708 | AC-91: 1920-01-01 00:30은 결과가 나오고 월주는 자월 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2719 | AC-91: 소한 이전은 전년도 대설 이후로 자월… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2735 | AC-91: 2028-12-31 23:30은 결과가 나오고… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2748 | AC-91: 2029-01-01 이후는 unsupported, 일주는 동작 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2767 | AC-56(S2-11): 1959-02-04 입춘 22:42 경계 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2790 | AC-56: 오행 개수 합은 8자(시간 있음) 또는 6자(시간 모름) | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2807 | AC-57: 표준시 안내는 연도 단위, 시간을 넣었을 때만 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2832 | AC-54: 사주 기본 점수 변동 폭 상수는 30 | 단위 이관 | unit/fortune/fortune-saju.test.ts |

### 2.2 fortune-copy.spec.ts (86건)

문구 규칙은 자동 실패 단언만 옮깁니다. `(참고)`로 후보만 보고하는 test, copy-log·THIRD_PARTY·이미지·import·AI 호출 소스 스캔은 삭제합니다. 서버 HTML 절은 SEO·JS 끔 test로 흡수하거나, 상수 검사와 중복이라 삭제합니다. plan.md를 읽는 단언(731, 783, 1227줄)은 원문을 test 안 리터럴로 바꿔 이관합니다.

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 511 | 검사 대상이 모두 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 519 | AC-40: 풀 문장 수가 개인 45, 공통 27, 띠 540, 별자리 540 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 537 | 항목 5 × 구간 3 × 변형 3 구조이고 비어 있는 문장이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 574 | AC-39(참고): 낮은 구간 변형 3개가 서로 다른 문장이다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (자동 실패 단언만, 1.2절 1번) |
| 673 | AC-37: 금지 표현 목록이 plan "금지 표현 목록" 전체를 담고 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (목록은 spec 안 리터럴 상수라 문서 읽기 없음) |
| 685 | AC-37: 문구 풀 1152문장에 금지 표현이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 690 | AC-37, AC-73: 고지·동의·이용 불가·연령·입력 오류·지원 범위·윤달 안내 상수에 금지 표현 없음 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 695 | AC-37: FAQ·가이드·SEO·메뉴·상담전화·행운 요소·띠·별자리 이름에 금지 표현 없음 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 707 | AC-37: "보장"·"예측"은 부정 고지문을 포함해 어디에도 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 714 | AC-37: 책임 과장 표현과 동의가 책임을 없앤다는 암시가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 731 | AC-37: "당첨"은 로또 고지 문장 안에만 있고 plan 원문과 같다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (plan 읽기는 리터럴 `toBe`로 대체, 원문은 fortune-notice가 고정) |
| 744 | AC-37: 방식 A 안내 3문장이 금지 구 검사를 예외 없이 통과한다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 758 | AC-37(참고): 단정·운명·불안 유발 후보 표현 목록을 보고한다 | 삭제 | 후보 보고용, 단언 없음 (design 3절 2번) |
| 783 | AC-10: 괄호 설명 상수와 방식 A 안내 3문장이 plan 원문과 같다 | 단위 이관 | unit/fortune/fortune-notice.test.ts (원문 리터럴 고정) |
| 801 | AC-10: 화이트리스트 문장마다 첫 "사주"가 괄호 설명이다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 823 | AC-10(참고): 화이트리스트 문장이 실제로 쓰이는지 확인한다 | 삭제 | 후보 보고용, 단언 없음 |
| 830 | AC-10, AC-37: 문구 풀 4종·SEO 4개·메뉴·상담전화·행운 요소에 "사주"가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 838 | AC-10: 고지·FAQ·가이드의 "사주"는 화이트리스트 문장 안에만 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 848 | AC-10: "사주"가 든 FAQ는 첫 "사주"가 괄호 설명 형태이고 질문에는 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 871 | AC-52: 화면 문구에 "사주 네 기둥"·"4기둥"·폐기 문장이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 880 | AC-58, AC-61, AC-88: 메뉴 운세 그룹은 네 기능 링크이고 "사주"는 label에만 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 941 | AC-39: 건강 풀 225문장에 병명·증상·약 목록의 말이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 957 | AC-39(참고): 건강 풀의 낱말 속 "암", 증상 어휘 후보를 보고한다 | 삭제 | 후보 보고용, 자동 실패 아님 |
| 969 | AC-39: 재물 풀에 투자·주식·코인·복권·도박·대출 같은 권유가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 977 | AC-39(참고): 낮은 구간 문장의 마지막 문장이 행동 조언 어미인지 본다 | 삭제 | 후보 보고용 |
| 993 | AC-38: 문구 풀 1152문장이 합니다체로 통일돼 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (명백한 해요체만 자동 실패) |
| 1003 | AC-38, AC-73: 고지·동의·이용 불가·연령·입력 오류·가이드·SEO·메뉴가 합니다체다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 1019 | AC-38: FAQ 답변은 합니다체이고 질문 "~나요?" 종결은 후보 보고 | 단위 이관 | unit/fortune/fortune-copy.test.ts (답변 합니다체만) |
| 1082 | 같은 문장이 풀 안(자동 실패는 같은 구간 변형 중복만)과 풀 사이에 반복되는지 본다 | 삭제 | AC-41(참고) 후보 보고. 자동 실패 부분은 574줄 이관 test가 맡음 |
| 1093 | 앞 20자가 같은 문장, 겹침 0.6 이상인 쌍을 후보로 보고한다 | 삭제 | 후보 보고용 |
| 1118 | 한 풀에서 같은 끝 두 어절이 25% 이상이면 후보로 보고한다 | 삭제 | 후보 보고용 |
| 1158 | AC-8, AC-9: 지원 범위 안내와 범위 오류 문구가 지원 범위 상수에서 만들어진 날짜를 담는다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 1177 | AC-8: 입력 오류 8종이 모두 있고 합니다체이며 입력값 자리 표시가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 1198 | AC-85: 윤달 안내 템플릿에 {연도}·{월} 자리가 있고 합니다체다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 1210 | AC-8(참고): 소스 문자열에 지원 연도를 손으로 쓴 곳이 있는지 본다 | 삭제 | 후보 보고용, 제품 규칙 아닌 소스 스캔 (design 3절 2·3번) |
| 1227 | 고지 상수가 plan 또는 ui-ux-design.md 원문에 그대로 들어 있다 | 단위 이관 | unit/fortune/fortune-notice.test.ts (docs 읽기 대신 원문 리터럴 `toBe`) |
| 1308 | AC-73: 이용 동의 항목이 3개이고 법적 책임을 없앤다는 표현이 없다 | 단위 이관 | unit/fortune/fortune-notice.test.ts |
| 1328 | AC-37: 운세 화면 코드·상수의 한글 문자열에 금지 표현이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (`source-scan` 사용, 제품 규칙) |
| 1343 | AC-10(참고): 소스 문자열의 "사주" 위치를 보고한다 | 삭제 | 후보 보고용 |
| 1356 | AC-37: 화면 코드가 표현 규칙 검사 목록을 import하지 않는다 | 삭제 | 제품 규칙 아닌 소스 스캔 (design 3절 3번) |
| 1370 | AC-40: 접속 시점에 AI를 호출하는 코드가 없다 | 삭제 | 제품 규칙 아닌 소스 스캔 |
| 1396 | AC-40: 외부 이미지·아이콘 세트 파일이 없다 (git 기준 새 이미지 0건) | 삭제 | git 명령·이미지 파일 검사 (design 3절 1·3번) |
| 1454 | AC-40: THIRD_PARTY_NOTICES.md에 운세 문구의 출처 기록이 있다 | 삭제 | 문서 기록 검사 (design 3절 1번) |
| 1473 | AC-40: AI 생성 지침 6개 항목이 첫머리에 있다 | 삭제 | copy-log 문서 기록 검사 |
| 1483 | AC-40: 묶음별 작성자·작성일·검수자·검수일·상태 기록이 풀 전체를 덮는다 | 삭제 | copy-log 문서 기록 검사 |
| 1525 | AC-41: 웹 검색 샘플이 20문장 이상이고 점검일과 한계가 있다 | 삭제 | copy-log 문서 기록 검사 |
| 1540 | AC-41: "일치 있음" 판정 문장은 모두 "수정함"으로 표시돼 있다 | 삭제 | copy-log 문서 기록 검사 |
| 1791 | AC-37, AC-10: ${pagePath} 서버 HTML 200대 응답, h1 하나, title·description이 상수와 같다 (반복문 안 1건) | 남김 | fortune#15 (SEO) |
| 1808 | AC-37, AC-10: ${pagePath} 서버 HTML에 금지 표현·겹침 표현·허용 위치 밖 "사주"가 없다 (반복문 안 1건) | 삭제 | 상수·소스 금지 표현 검사(fortune-copy)와 중복 |
| 1824 | AC-10: ${pagePath} 메타데이터·JSON-LD에 "사주"가 없다 (반복문 안 1건) | 삭제 | 상수 검사(830줄 이관)와 중복 |
| 1850 | AC-37, AC-73: ${pagePath} 서버 HTML 문장은 합니다체다 (반복문 안 1건) | 삭제 | 상수 합니다체 검사(993·1003줄 이관)와 중복 |
| 1872 | AC-37: ${pagePath} 서버 HTML에 고지·FAQ·가이드·상담전화가 상수 그대로 있고 FAQPage JSON-LD가 화면 FAQ와 같다 (반복문 안 1건) | 남김 | fortune#15 (SEO, 상수 import 비교) |
| 1906 | AC-61, AC-88: 허브 서버 HTML에 기능 링크 4개(사주 포함)가 있고 입력칸이 없다 | 남김 | fortune#14 (JS 끔) |
| 1925 | AC-61: 띠별·별자리 서버 HTML의 오늘의 운세 링크가 쿼리 없는 /fortune/today다 | 삭제 | 링크 href 세부, 남긴 흐름과 중복 |
| 2025 | AC-54, AC-90: 사주 풀은 십신 10 x 항목 5 x 구간 3 x 변형 3 = 450문장 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2053 | AC-90: 사주 풀 450문장에 같은 문장이 두 번 나오지 않는다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2064 | AC-54, AC-90: BASE_SCORES는 십신 10 x 항목 5, 60~69 정수, 총운 차이 6 이하 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 2086 | AC-39: 사주 풀의 건강 칸에 병명·약 말이 없고 재물 칸에 투자 권유가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2105 | AC-38: 사주 풀 450문장과 십신 설명이 합니다체다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2120 | AC-39(참고): 사주 풀 낮은 구간 문장의 행동 조언 어미 후보를 보고한다 | 삭제 | 후보 보고용 |
| 2132 | AC-58: 사주 추가 금지어 6개와 기존 금지어가 목록에 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2148 | AC-37, AC-58: 사주 풀·notice·SEO·FAQ·가이드에 금지어와 겹침 표현이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2156 | AC-56: 사주 화면 문구 상수에 정자시, same-day, next-day 글자가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2163 | AC-52, AC-89: 사주 메타데이터·keywords·FAQ 질문에 "사주 네 기둥" 등이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2180 | V10.1: fortune-saju-notice 필수 키, 십신 설명 10개, 절기 이름 12개, 템플릿 자리표시자 | 단위 이관 | unit/fortune/fortune-copy.test.ts (구조 검사) |
| 2219 | AC-56: 계산 기준 6항목이 모두 있다 | 단위 이관 | unit/fortune/fortune-notice.test.ts |
| 2242 | AC-89: FORTUNE_SAJU_SEO는 heading 사주, keywords 5개, 경로 /fortune/saju | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2263 | AC-89: FORTUNE_SAJU_FAQ는 질문 5개(의문형)이고 1·5번 답이 기준에 맞다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2277 | AC-89: FORTUNE_SAJU_GUIDE는 소제목 3개이고 600자 이상이다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2296 | AC-88: 허브 가이드·FAQ에 "세 가지", "세 운세"가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2307 | AC-88: 허브 FAQ는 7쌍이고 7번째가 사주와 다른 운세의 차이를 묻는다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2320 | AC-88: 허브 가이드가 두 방식의 차이를 말하고 허브 SEO·Breadcrumb에 "사주"가 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2331 | AC-88, V10.2: 화이트리스트에 옛 "세 운세" 문장이 없고 허브 FAQ 7번이 등록돼 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2340 | AC-61, AC-88: 출시 후 메뉴 운세 그룹 마지막에 사주 항목이 있다 | 단위 이관 | unit/fortune/fortune-copy.test.ts (메뉴 상수) |
| 2353 | AC-89, AC-56: /fortune/saju 서버 HTML이 h1 하나, title·description·canonical·OG, noindex 없음 | 남김 | fortune#15 (SEO) |
| 2380 | AC-37, AC-52, AC-56: /fortune/saju 서버 HTML에 금지어와 겹침 표현이 없다 | 삭제 | 상수 금지 표현 검사(2148줄 이관)와 중복 |
| 2393 | AC-89: 서버 HTML JSON-LD에 BreadcrumbList와 화면 FAQ와 같은 FAQPage가 있고 리뷰·평점이 없다 | 남김 | fortune#15 (SEO) |
| 2428 | AC-72: 동의 전 서버 HTML에는 기둥 표·십신·점수 같은 개인 결과가 없다 | 남김 | fortune#14 (JS 끔) |
| 2443 | AC-37, AC-52, AC-58: 동의 후 시간 모름 결과 DOM에 금지어와 겹침 표현이 없다 | 삭제 | 상수 금지 표현 검사와 중복 |
| 2534 | AC-73, AC-37: 동의 화면과 이용 불가 화면의 문구가 상수 그대로 보이고 금지 표현이 없다 | 남김 | fortune#2 (이용 동의 안 함, 상수 import 비교) |
| 2577 | AC-8, AC-9, AC-37: 입력 오류 문구가 지원 범위·합니다체로 화면에서 상수와 같다 | 남김 | fortune#4 (입력 오류, 상수 import 비교) |
| 2628 | AC-85, AC-37: 음력 2023년 2월에는 윤달 안내가 보이고 3월에는 사라지며 윤달 칸이 비활성이다 | 남김 | fortune#5 (윤달) |
| 2658 | AC-73, AC-37: 만 14세 미만 연령 안내 화면 문구가 상수와 같다 | 남김 | fortune#3 (연령 차단) |
| 2712 | AC-10, AC-37, AC-38: 오늘의 운세 결과 화면의 문구는 풀의 문장이고 "사주"는 방식 A 안내에만 있다 | 삭제 | 풀·상수 검사(fortune-copy)와 중복 |
| 2756 | AC-10, AC-37, AC-38: 띠별 운세 결과 화면의 문구가 풀의 문장이다 | 삭제 | 풀·상수 검사와 중복 |
| 2794 | AC-10, AC-37, AC-38: 별자리 운세 결과 화면의 문구가 풀의 문장이다 | 삭제 | 풀·상수 검사와 중복 |

### 2.3 fortune.spec.ts (80건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 780 | 응답 400 미만, pageerror·하이드레이션 오류 없음, h1 하나 (반복문 안 1건) | 남김 | fortune#15 (SEO) |
| 792 | AC-61, AC-63: title·description·canonical·OG가 있고 noindex가 없다 (반복문 안 1건) | 남김 | fortune#15 (SEO) |
| 849 | AC-64: BreadcrumbList와 FAQPage JSON-LD가 있고 FAQ가 화면과 같다 (반복문 안 1건) | 남김 | fortune#15 (SEO) |
| 905 | AC-65, AC-88, AC-89: sitemap.xml에 운세 허브와 네 기능 페이지가 있다 | 남김 | fortune#15 (SEO 마지막 step) |
| 926 | AC-61, AC-88: 메뉴 운세 그룹 링크가 /fortune으로 가고 "준비 중" 배지가 없다 | 삭제 | 메뉴 세부. 메뉴 데이터는 fortune-copy가 검사 |
| 969 | 홈의 서비스 목록에서 운세는 /fortune으로 가고 "준비 중" 배지가 없다 | 삭제 | 메뉴 세부 |
| 989 | AC-79, AC-88: 허브에 h1 "운세"와 네 링크가 보이고 입력칸·결과가 DOM에 없다 | 남김 | fortune#1 (허브→오늘의 운세) |
| 1022 | AC-33: 상시 면책이 h1 바로 아래에 보이고 하단 면책은 뒤에 있다 | 삭제 | 레이아웃 세부. 면책 표시는 fortune#1이 확인 |
| 1054 | AC-83: 허브 방문은 이용 동의 상태를 만들거나 지우지 않는다 | 삭제 | 그 밖: 동의 저장 세부 |
| 1083 | AC-1, AC-34, AC-35: 동의 뒤 양력 생년월일을 입력하면 총운·항목별·행운·조언·주의가 나온다 | 남김 | fortune#1 |
| 1123 | AC-2: 같은 생년월일은 새로고침해도 새 컨텍스트에서도 같은 결과다 | 삭제 | 계산 결정성은 단위(fortune-reading AC-2)와 중복 |
| 1155 | 기기 시간대가 달라도 기준 날짜는 한국 날짜이고 자정이 지나면 바뀐다 | 단위 이관 | unit/fortune/fortune-date.test.ts (`getKoreaDateKey`, 시간 고정) |
| 1173 | AC-4, AC-5, AC-6: 연속 7일 총운이 모두 같지 않고 점수 30~95 정수… | 삭제 | 같은 계산을 단위가 검사(fortune-reading AC-4·5·6) |
| 1239 | AC-1: 결과를 본 뒤 잘못된 날짜를 넣으면 오류 안내만 보이고 이전 결과는 남지 않는다 | 남김 | fortune#4 (입력 오류) |
| 1252 | AC-7: 양력 입력과 같은 날의 음력 입력은 같은 결과이고 확인 줄이 환산 날짜를 보여 준다 | 삭제 | 변환·시드 동일은 단위(fortune-date AC-7)와 중복. 윤달은 fortune#5 |
| 1287 | AC-8: 윤달이 없는 달은 윤달 선택이 비활성이고 윤달이 있는 달은 안내가 보인다 | 남김 | fortune#5 (윤달) |
| 1339 | AC-9: 비어 있음·없는 날짜·미래·1920년 이전·2029년 이후는 안내만 나오고 결과가 없다 | 남김 | fortune#4 (입력 오류) |
| 1386 | AC-9: 음력으로 입력해 환산하면 2029년 이후인 날짜도 지원 범위 안내가 나온다 | 삭제 | 단위(fortune-date AC-9)와 중복 |
| 1402 | AC-10: 방식 A 안내가 결과 근처에 있고 "사주"는 허용 문장에만 있다 | 삭제 | 상수 검사(fortune-copy)와 중복 |
| 1435 | AC-11: 결과 영역에 띠별 운세·별자리 운세 링크가 있다 | 삭제 | 링크 표시 세부 |
| 1449 | AC-35, AC-36: 행운 숫자는 "오늘의 행운 숫자"로 표시되고 로또 고지가 보인다 | 삭제 | 법적 고지는 fortune-notice가 원문 고정(FORTUNE_LOTTO_NOTICE) |
| 1494 | AC-12, AC-13: 동의 뒤 12띠 모두의 오늘 운세가 있고 하나를 골라 펼칠 수 있다 | 삭제 | 띠 흐름 대표는 fortune#7 |
| 1540 | AC-14, AC-17, AC-19: 1990-06-15는 말띠, 1992-05-10은 원숭이띠… | 삭제 | 단위(fortune-reading AC-14)와 중복 |
| 1556 | AC-15: 2025-02-01은 용띠이고 "설날 기준으로는 뱀띠" 안내가 보인다 | 삭제 | 단위(AC-15)와 중복. 안내 표시는 fortune#8 |
| 1569 | AC-16: 입춘이 드는 날은 시각을 묻고 23:09는 용띠, 23:30은 뱀띠… | 삭제 | 단위(AC-16)와 중복. 경계 흐름은 fortune#8 |
| 1614 | AC-18: 같은 날 같은 띠의 운세는 다른 컨텍스트에서도 같다 | 삭제 | 계산 결정성은 단위와 중복 |
| 1663 | AC-20, AC-21, AC-26: 동의 뒤 12별자리 모두의 오늘 운세가 있고 펼칠 수 있다 | 삭제 | 별자리 흐름 대표는 fortune#9 |
| 1701 | AC-22: 1990-05-15는 황소자리… 시각 입력칸이 없다 | 삭제 | 단위(fortune-reading AC-22)와 중복 |
| 1717 | AC-23: 2026-03-20은 시각을 묻고 23:00은 물고기자리… | 삭제 | 단위(AC-23)와 중복 |
| 1745 | AC-24: 2027-03-21은 04:00 물고기자리·06:00 양자리… | 삭제 | 단위(AC-24)와 중복 |
| 1768 | AC-25: 음력으로 입력한 경계일은 양력 변환 뒤 같은 방식으로 판정된다 | 삭제 | 단위(AC-25)와 중복 |
| 1795 | AC-27, AC-28: 입력과 결과 확인 중 요청·URL·콘솔에 생년월일·시각이 없고 POST가 없다 | 남김 | fortune#6 (개인정보 비저장) |
| 1854 | AC-28: 폼에 action·method가 없고 Enter로 제출해도 URL이 바뀌지 않는다 | 삭제 | fortune#6이 URL·요청 비저장을 확인해 중복 |
| 1871 | AC-29, AC-78: 결과를 본 뒤 저장소에는 동의 키 하나만 있고 입력값이 없다 | 남김 | fortune#6 |
| 1903 | AC-30: 결과를 본 뒤 새로고침하거나 다녀오면 입력칸이 비어 있다 | 삭제 | fortune#6과 중복 |
| 1926 | AC-31: 입력칸 근처에 비전송·연령·책임 고지가 있고 이름·연락처 칸이 없다 (반복문 안 1건) | 단위 이관 | unit/fortune/fortune-notice.test.ts (FORTUNE_PRIVACY_INPUT_NOTICE, FORTUNE_AGE_INPUT_NOTICE 원문). 이름·연락처 칸 없음 확인은 삭제 |
| 1956 | AC-32, AC-78: 쿠키 동의를 거절해도 이용 동의 뒤 기능이 정상이다 | 삭제 | 쿠키 거절 반복. 기능 흐름은 fortune#1 |
| 1993 | AC-32: 쿠키 거절 상태에서 띠·별자리도 정상 동작한다 | 삭제 | 쿠키 거절 반복 |
| 2017 | AC-42, AC-45: 만 13세(2012-11-06)는 연령 안내만 나오고 결과·계속 버튼이 없다 | 남김 | fortune#3 (연령 차단) |
| 2050 | AC-43: 만 14세 생일 당일(2012-11-05)은 결과가 나오고 하단 고지가 보인다 | 삭제 | 단위(fortune-date AC-43)와 중복 |
| 2062 | AC-43: 한국 시간 2026-11-04 23:59에는 연령 안내, 11-05 00:00 이후에는 결과다 | 삭제 | 단위(AC-43)와 중복 |
| 2077 | AC-44: 음력으로 입력한 생년월일도 양력 환산 뒤 같은 기준으로 판정한다 | 삭제 | 단위(AC-44)와 중복 |
| 2121 | AC-44: 2월 29일생은 평년에 3월 1일부터 한 살이 늘어난 것으로 판정한다 | 삭제 | 단위(AC-44)와 중복 |
| 2136 | AC-46: 띠·별자리 찾기도 같은 방식으로 판정하고 시각 입력칸은 연령 통과 뒤에만 나온다 | 삭제 | 같은 연령 흐름 반복 |
| 2155 | AC-46: 12띠·12별자리를 직접 고르는 경로는 생년월일 입력이 없다 | 삭제 | 그 밖: 화면 세부 |
| 2164 | AC-47: 연령 판정 중 요청·저장소·URL에 흔적이 없고 새로고침하면 입력칸이 비어 있다 | 삭제 | fortune#6과 중복 |
| 2194 | AC-76: 이용 동의의 "만 14세 이상"을 고른 뒤에도 만 14세 미만 생년월일은 결과가 나오지 않는다 | 삭제 | fortune#3과 같은 흐름 반복 |
| 2212 | AC-67, AC-72(DOM): 동의 전에는 동의 화면이 나오고 입력칸·결과가 DOM에 없다 (반복문 안 1건) | 남김 | fortune#2 (이용 동의 안 함) |
| 2238 | AC-68, AC-69, AC-70: 확인 항목 3개가 모두 해제로 시작하고 모두 고르면 기능이 열린다 (반복문 안 1건) | 남김 | fortune#1 (동의 단계) |
| 2277 | AC-71: "동의하지 않음"은 이용 불가 안내를 보이고 돌아가기로 동의 화면이 다시 나온다 (반복문 안 1건) | 남김 | fortune#2 |
| 2304 | AC-68: 확인 항목 세 개의 문장이 승인 문구와 같다 | 단위 이관 | unit/fortune/fortune-notice.test.ts (FORTUNE_CONSENT_TEXTS) |
| 2318 | AC-72: 동의 전에는 입력·결과 요청이 없고 동의 여부가 요청으로 전송되지 않는다 | 삭제 | fortune#6과 중복 |
| 2341 | AC-73: 이용 동의·이용 불가 화면에 금지 표현이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 2356 | AC-74: 같은 탭에서는 다시 묻지 않고 새 탭에서는 묻는다 | 삭제 | 동의 저장 세부 반복 |
| 2379 | AC-74: 새 브라우저 컨텍스트에서는 묻는다 | 삭제 | 동의 저장 세부 반복 |
| 2396 | AC-74: 문구 버전이 다르거나 값이 손상되면 다시 묻고 저장값을 지운다 | 삭제 | 동의 저장 세부 반복 |
| 2441 | AC-75: 한 번 동의하면 세 페이지에서 다시 묻지 않고 "동의 다시 설정"으로 되돌린다 | 삭제 | 동의 저장 세부 반복 |
| 2470 | AC-77: 키보드만으로 선택·진행·돌아가기를 할 수 있다 | 삭제 | 키보드 포커스 세부 (design 3절 6번) |
| 2528 | AC-78: 쿠키 배너와 이용 동의 화면이 함께 떠도 서로를 가리지 않는다 | 삭제 | 레이아웃 세부 |
| 2561 | AC-81: 동의 전에도 "생년월일로 보는 오늘의 운세" 링크가 하나 있고 href는 쿼리 없는 /fortune/today다 (반복문 안 1건) | 삭제 | 링크 href 세부 |
| 2574 | AC-82: 링크를 누르면 /fortune/today로 가고 동의한 탭은 입력 폼이 나온다 (반복문 안 1건) | 남김 | fortune#1 (허브에서 오늘의 운세로 이동) |
| 2603 | 오늘의 운세: 동의 후 개인 일운이 정상이고 연도 입력 상한은 2028이다 | 남김 | fortune#13 (기기 시계 2029, `page.clock`) |
| 2632 | 띠별 운세: 12띠 목록이 정상이고 1920~2028년 출생을 정상 판정한다 | 삭제 | 계산은 단위(fortune-reading 2029 동작)와 중복 |
| 2662 | 별자리 운세: 12별자리 목록이 정상이고 1920~2028년 출생을 정상 판정한다 | 삭제 | 단위와 중복 |
| 2681 | 계산 기준에 지원 출생 범위(1920년 1월 1일 ~ 2028년 12월 31일) 안내가 있다 | 삭제 | 지원 범위 문구는 fortune-copy가 상수로 검사 |
| 2694 | 음력 2023년 2월은 평달과 윤달이 다른 양력으로 변환되고 확인 줄에 "(윤달)"이 표시된다 | 남김 | fortune#5 (윤달) |
| 2727 | 띠·별자리 찾기도 윤달 체크가 같은 규칙이다 | 삭제 | 같은 흐름 반복 |
| 2746 | ${def.path}: 표시·접근성·동작 (반복문 안 1건) | 남김 | fortune#1 (상담전화 5개 표시, 모바일 `tel:` 분기) |
| 2758 | 허브: Tab 순서에 PC는 번호가 없고 터치는 상담전화 5곳이 순서대로 있다 | 삭제 | 키보드 포커스 순서 (design 3절 6번) |
| 2767 | (hover: hover) and (pointer: fine)이 Desktop Chrome에서 참, Pixel 7에서 거짓이다 | 삭제 | 환경 확인 test. project 분기는 fortune#1 안에서 확인 |
| 2784 | AC-66: 허브에서 이용 동의 → 입력 → 결과까지 끊김 없이 된다 | 남김 | fortune#1 (@smoke) |
| 2809 | AC-37: 허브·동의·결과·띠·별자리 화면에 금지 표현이 없다 | 삭제 | 상수 금지 표현 검사(fortune-copy)와 중복 |
| 2833 | AC-48: 상세 이용 안내에 만 14세 이상 대상 항목과 판단·선택 책임 항목이 있다 (반복문 안 1건) | 단위 이관 | unit/fortune/fortune-notice.test.ts (FORTUNE_DETAIL_NOTICE_ITEMS) |
| 2862 | AC-33, AC-48, AC-62, AC-63: 서버 HTML에 설명·FAQ·면책·이용 안내가 동의 여부와 관계없이 들어 있다 (반복문 안 1건) | 남김 | fortune#14 (JS 끔) |
| 2948 | AC-33, AC-62(표시): JS를 꺼도 h1·면책 문구가 화면에 보인다 (반복문 안 1건) | 삭제 | fortune#14의 서버 HTML 확인과 중복 |
| 2961 | AC-72, AC-79: 서버 HTML에는 결과·입력칸·동의 화면이 없다 (반복문 안 1건) | 남김 | fortune#14 (JS 끔) |
| 3003 | AC-86: JS를 끈 서버 HTML에 상담전화 5곳이 순서대로 들어 있다 (반복문 안 1건) | 남김 | fortune#14 (상담전화 번호) |
| 3025 | AC-86(표시): JS를 꺼도 상담전화 표시가 기기별로 같다 (반복문 안 1건) | 삭제 | 기기별 표시 반복 |
| 3036 | AC-81: JS를 꺼도 "생년월일로 보는 오늘의 운세" 링크가 하나 있다 (반복문 안 1건) | 삭제 | 링크 href 세부 |
| 3051 | AC-10: JS를 끈 서버 HTML에서도 "사주"는 허용 문장에만 있다 | 삭제 | 상수 검사(fortune-copy)와 중복 |

### 2.4 fortune-saju.spec.ts (54건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 382 | 응답 400 미만, pageerror 없음, h1 하나, title·description·canonical·OG 존재 | 남김 | fortune#15 (SEO) |
| 419 | 빈 상태: 입력 전에는 시간 단계·결과·경계 안내가 없다 | 삭제 | 화면 상태 세부 |
| 435 | 에러 상태: 빈 값에서 오류 안내가 나오고 시간 단계·결과가 나오지 않는다 | 삭제 | fortune#4가 입력 오류 대표 |
| 453 | AC-46: 시각 입력칸은 연령 판정을 통과한 뒤에만 나온다 | 삭제 | fortune#3과 같은 흐름 반복 |
| 479 | AC-46: 만 14세 이상이면 생년월일 확인 뒤 태어난 시간 단계가 열린다 | 삭제 | fortune#10이 같은 흐름을 포함 |
| 493 | AC-46: 만 14세 생일 전날은 미달, 생일 당일은 통과이다 | 삭제 | 단위(fortune-date AC-43)와 중복 |
| 508 | AC-46: 만 14세 생일 당일은 통과한다 | 삭제 | 단위와 중복 |
| 514 | AC-47: 연령 판정과 안내 화면은 네트워크·저장소·URL에 흔적이 없다 | 삭제 | fortune#6과 중복 |
| 558 | AC-47: 정상 입력으로 결과를 본 뒤에도 저장소·쿠키는 변하지 않고 URL에 입력이 없다 | 삭제 | fortune#6과 중복 |
| 575 | AC-49: 입력은 3단계이고 성별·출생지·이름 입력칸이 없다 | 남김 | fortune#10 (@smoke, 사주 입력→결과) |
| 619 | AC-49: 음력을 고르면 윤달 선택이 나오고 2023년 2월은 평달과 윤달의 양력이 다르다 | 삭제 | fortune#5가 대표 |
| 661 | AC-49, AC-91: 지원 범위 밖은 오류 안내만 나오고 시간 단계·결과가 없다 | 삭제 | fortune#4가 대표 |
| 676 | AC-91: 1920-01-01 00:30과 2028-12-31 23:30은 결과가 나온다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 693 | AC-91, AC-84: 기기 시계가 2029-01-02(KST)여도 오늘 일진·십신이 정상이다 | 남김 | fortune#13 |
| 711 | AC-50: 2000-01-01(시간 모름)은 일주 무오, 연주 기묘… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 725 | AC-51: 2025-02-03 23:09는 연주 갑진, 23:30은 연주 을사… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 741 | AC-51: 입춘 당일 + 시간 모름이면 두 후보를 보여 주고 고르면 해당 연주가 나온다 | 남김 | fortune#11 |
| 784 | UI 4.3: 입춘 당일 후보 버튼 라벨은 "연주 갑진으로 보기"… | 삭제 | UI 라벨 세부 |
| 803 | AC-52: 시간 모름이면 시주 없이 연·월·일 기둥과 안내가 나오고… | 남김 | fortune#11 |
| 837 | AC-53: 절기가 드는 날 + 시간 모름이면 월주를 하나로 정할 수 없다는 안내와 두 후보가 보인다 | 남김 | fortune#11 |
| 876 | AC-51, AC-53: 경계일이어도 시간을 입력하면 후보 선택 없이 결과가 나온다 | 삭제 | 단위(fortune-saju need-choice·single)와 중복 |
| 893 | AC-54: 결과에 오늘 일진, 내 일간, 십신 이름과 설명, 오늘의 사주 운세와 방식 B 안내가 있다 | 남김 | fortune#10 |
| 926 | AC-54: 오늘 일진은 한국 시간 자정에 바뀐다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 941 | AC-54: 접속 시각이 23시대여도 그날 일진을 쓰고 UTC 자정 전후로도 KST 날짜를 따른다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 950 | AC-54: 같은 일간·같은 날이면 십신과 결과 문구가 같고 시주만 달라진다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 981 | AC-55: 십신은 일간과 오늘 일진 천간의 오행 관계·음양 일치 표와 같다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1014 | AC-56: 서버 HTML의 계산 기준에 6항목이 모두 있다 | 남김 | fortune#14 (JS 끔) |
| 1036 | AC-56: 화면 DOM의 계산 기준 영역에도 같은 항목이 있고 링크가 이동한다 | 삭제 | 1014줄과 중복, 링크 세부 |
| 1055 | AC-56: 2026-11-06 22:59는 시주 을해, 23시대는 일주 갑신·시주 병자 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1073 | AC-56: 2026-11-07 00:00·00:30은 일주 을유·시주 병자… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1094 | AC-56: 1999-12-31 23:30은 일주 정사·시주 임자… | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1110 | AC-56: 화면 어디에도 정자시, same-day, next-day가 보이지 않는다 | 삭제 | 상수 검사(fortune-copy 2156줄 이관)와 중복 |
| 1145 | AC-57: 연도 경계 8건(1947/1948, 1961/1962, 1986/1987, 1988/1989)에서 안내가 나오거나 나오지 않는다 | 단위 이관 | unit/fortune/fortune-saju.test.ts (표준시 안내 연도) |
| 1163 | AC-57: 시간 모름이면 해당 연도여도 안내가 없다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1172 | AC-57: 시각을 보정하지 않는다 (시지 자, 일주는 시간 모름과 같다) | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1189 | AC-57: 음력 입력은 환산한 양력 연도로 판단한다 | 단위 이관 | unit/fortune/fortune-saju.test.ts |
| 1210 | AC-59: h1 바로 아래 상시 면책, 하단 면책, 이용 안내가 동의 전에도 보인다 | 남김 | fortune#12 |
| 1244 | AC-59: 상담전화 다섯 곳이 순서대로 DOM에 있고 기기에 맞게 보인다 | 삭제 | fortune#1의 상담전화 확인과 crisis-phone 단위가 대신함 |
| 1271 | AC-59: 결과 화면에도 하단 면책과 상담전화 다섯 곳, 로또 고지가 있다 | 남김 | fortune#12 |
| 1296 | AC-72: 동의 전에는 DOM에 입력칸·결과가 없고 h1·면책·설명은 보인다 | 삭제 | fortune#2와 같은 흐름 반복 |
| 1344 | AC-72: 동의하면 입력 폼이 나오고 포커스가 첫 제목으로 간다 | 삭제 | 포커스 세부 |
| 1368 | AC-72: JS를 끈 서버 HTML에는 결과가 없고 JavaScript 필요 안내가 있다 | 남김 | fortune#14 (noscript 안내) |
| 1382 | AC-87: 같은 탭에서 이미 동의했으면 동의 화면 없이 입력 폼이 나온다 | 삭제 | 동의 저장 세부 반복 |
| 1412 | AC-87: 오늘의 운세에서 동의한 탭은 사주에서도 다시 묻지 않는다 | 삭제 | 동의 저장 세부 반복 |
| 1437 | AC-87: "동의 다시 설정"을 누르면 저장된 동의가 지워진다 | 삭제 | 동의 저장 세부 반복 |
| 1455 | AC-87: 동의 문구 버전이 다르면 다시 묻는다 | 삭제 | 동의 저장 세부 반복 |
| 1477 | AC-72(참고): 연령 안내 문구가 입력 영역 안내로 보인다 | 삭제 | (참고) 보고용. 원문은 fortune-notice가 고정 |
| 1493 | AC-89: JSON-LD에 홈 > 운세 > 사주 BreadcrumbList와 화면 FAQ와 같은 FAQPage가 있다 | 남김 | fortune#15 (SEO) |
| 1530 | AC-89: JS 없이 받은 서버 HTML에 설명·사용법·계산 기준·FAQ 5개·면책이 있고 600자 이상이다 | 남김 | fortune#14 (JS 끔) |
| 1566 | AC-89: JS를 끈 브라우저에서도 본문 HTML이 DOM에 있다 | 삭제 | 1530줄과 중복. 알려진 한계 주석 test |
| 1605 | UI 4.2: 시간 단계 진입 시 포커스가 "태어난 시간" 제목으로 간다 | 삭제 | 포커스 세부 |
| 1619 | UI 4.4: 결과 진입 시 포커스가 "연·월·일·시 기둥" 제목으로 가고 오행 분포 5행이 있다 | 삭제 | 포커스 세부 |
| 1663 | UI 9: 결과가 나오면 aria-live 영역에 결과 공지가 한 번 읽힌다 | 삭제 | 접근성 세부 |
| 1675 | UI 9: 모바일 360px 너비에서도 기둥 표와 오행 분포가 가로로 넘치지 않는다 | 삭제 | 레이아웃 세부 |

### 2.5 fortune-saju.launch.spec.ts (4건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 5 | AC-89: /fortune/saju 응답과 HTML에 noindex가 없고 title·description·canonical·h1 하나가 있다 | 남김 | fortune#15 (SEO) |
| 30 | AC-89: sitemap.xml에 /fortune/saju가 있다 | 남김 | fortune#15 (SEO 마지막 step) |
| 40 | AC-88: 360px 모바일 메뉴에서 운세 그룹 4항목이 가로로 넘치지 않고 높이가 비슷하다 | 삭제 | 레이아웃 세부 (design 3.1) |
| 71 | AC-88: 허브 목록에 사주 링크가 보인다 | 삭제 | fortune#1·#14가 허브 링크를 확인해 중복 |

### 2.6 fortune-v2.spec.ts (23건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 276 | 응답 400 미만, pageerror 없음, h1 하나, title·description 존재 (반복문 안 1건) | 삭제 | fortune#15 (SEO)와 중복 |
| 298 | 빈 상태: 입력 전에는 안내 문장이 없다 (반복문 안 1건) | 삭제 | 화면 상태 세부 |
| 303 | 에러 상태: 빈 값·지원 범위 밖·미래 날짜에서는 안내 문장이 없다 (반복문 안 1건) | 삭제 | fortune#4와 중복 |
| 317 | 연령 안내(만 14세 미만)에서는 안내 문장이 없다 (반복문 안 1건) | 삭제 | fortune#3과 중복 |
| 333 | AC-1: 1990-05-10으로 찾은 말띠 카드의 요약·점수는 직접 펼친 말띠 카드와 같다 | 남김 | fortune#7 |
| 355 | AC-2: 같은 말띠인 1990-05-10과 1978-08-01은 펼친 카드 문구가 같다 | 삭제 | fortune#7과 같은 흐름 반복 |
| 372 | AC-3: 찾기 결과 뒤에 안내 문장이 나타나고 결과 전에는 없다 (띠) | 남김 | fortune#7 |
| 386 | AC-4: 2025-02-01(입춘 전, 설날 뒤)은 용띠이고 설날 기준 뱀띠 안내가 보인다 | 남김 | fortune#8 |
| 396 | AC-4: 2026-02-10(입춘 뒤, 설날 전)은 말띠이고 설날 기준 뱀띠 안내가 보인다 | 삭제 | fortune#8과 같은 흐름 반복 |
| 405 | AC-4: 입춘·설날 기준 띠가 같은 날짜에는 설날 안내가 없다 | 삭제 | fortune#8과 같은 흐름 반복 |
| 421 | AC-6: 띠 경계일(2025-02-03)은 시각을 묻고 후보 선택 뒤에도 안내 문장이 보인다 | 남김 | fortune#8 |
| 461 | AC-5: 1990-05-15로 찾은 황소자리 결과 아래에 안내 문장이 보이고 카드 문구는 칩과 같다 | 남김 | fortune#9 |
| 485 | AC-5: 같은 별자리인 다른 생년월일은 카드 문구가 같다 | 삭제 | fortune#9와 같은 흐름 반복 |
| 498 | AC-6: 경계일(2026-03-20)은 시각을 묻고 시각 입력 뒤에도 안내 문장이 보인다 | 삭제 | fortune#8과 같은 흐름 반복 |
| 552 | AC-7: 목록 로드와 찾기 실행 중 KASI 서버로 가는 요청이 없다 (반복문 안 1건) | 삭제 | 외부 요청 비전송은 fortune#6이 요청 본문·URL 검사로 확인 |
| 570 | AC-7: 이용 동의 전 화면에서도 KASI 서버로 가는 요청이 없다 (반복문 안 1건) | 삭제 | 같은 사유 |
| 586 | AC-9: 메타데이터와 JSON-LD가 기존 값과 같고 새 문장이 섞이지 않는다 (반복문 안 1건) | 삭제 | fortune#15 (SEO)와 중복 |
| 619 | AC-9: sitemap.xml에 운세 페이지가 그대로 있다 | 삭제 | sitemap 단독 (design 3.1). fortune#15 마지막 step이 확인 |
| 636 | AC-9: 메타·sitemap·JSON-LD 소스 파일은 HEAD와 diff가 없다 | 삭제 | git 명령 (design 3절 1번) |
| 657 | AC-10: 새 안내 문장 상수가 (가)안과 같고 금지 표현이 없다 | 단위 이관 | unit/fortune/fortune-copy.test.ts |
| 672 | AC-10: 화면에 나온 안내 문장에 금지 표현이 없다 (반복문 안 1건) | 삭제 | 657줄 이관 test와 중복 |
| 689 | AC-11: docs/fortune-v2/status.md에 1단계 출시 전 확인 항목이 남아 있다 | 삭제 | 문서 기록 검사 |
| 707 | AC-11: 1단계 docs/fortune/status.md에는 같은 항목이 남아 있다 | 삭제 | 문서 기록 검사 |

## 3. tarot (원본 spec 3개, test 148건)

최종 e2e 목표는 9개입니다. tarot#1 오늘의 타로(@smoke), #2 오늘의 카드 복원·날짜 경계, #3 3장 타로(@smoke), #4 역방향 옵션, #5 분야 칩, #6 질문 비저장, #7 위기어 안내, #8 JS 끔, #9 SEO.

### 3.1 tarot.spec.ts (66건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 258 | 응답 400 미만, pageerror 없음, 하이드레이션 오류 없음, h1 하나 (반복문 안 1건) | 남김 | tarot#9 (SEO) |
| 271 | title과 description이 있고 사이트명이 두 번 붙지 않는다 (반복문 안 1건) | 남김 | tarot#9 |
| 284 | 가로 스크롤이 생기지 않는다 (반복문 안 1건) | 삭제 | 레이아웃 세부 |
| 294 | 빈 상태: 뽑기 전에 뒷면 카드와 뽑기 버튼이 보인다 (반복문 안 1건) | 남김 | tarot#1 (뽑기 전 상태 확인) |
| 313 | 동작 줄이기에서도 뽑기가 끝나고 버튼이 다시 풀린다 (반복문 안 1건) | 삭제 | 모션 세부 |
| 337 | AC-1: 로그인 없이 카드를 한 장 뽑을 수 있다 | 남김 | tarot#1 (@smoke) |
| 346 | AC-2: 질문이 비어 있어도 뽑을 수 있고 100자를 넘으면 입력이 제한된다 | 삭제 | 입력 세부 |
| 361 | AC-2: 질문 입력에서 Enter를 누르면 뽑기와 같게 동작하고 폼이 아니다 | 삭제 | 입력 세부 |
| 377 | AC-3: 역방향 옵션은 기본 켜짐이고 끄면 정방향만 나오며 다시 열면 켜짐으로 돌아간다 | 남김 | tarot#4 |
| 407 | AC-4: 결과에 이미지, 한글(영문) 이름, 방향, 키워드 3개, 요약이 나온다 | 남김 | tarot#1 (결과 형식) |
| 442 | AC-5: 역방향 카드는 그림이 상하 반전되고 "역방향" 글자가 함께 보인다 | 남김 | tarot#4 |
| 497 | AC-6: 같은 날 새로고침·다시 접속해도 같은 카드와 방향이고 재뽑기 버튼이 없다 | 남김 | tarot#2 |
| 527 | AC-7: 기기 시간대가 달라도 날짜는 한국 시간이고 자정이 지나면 새 카드를 뽑는다 | 남김 | tarot#2 (`page.clock`) |
| 553 | AC-8: 저장 안내와 다른 기기에서는 다른 카드가 나올 수 있다는 안내가 보인다 | 삭제 | 안내 문구 세부 |
| 565 | AC-20: 죽음 카드 결과에 실제 죽음이 아니라는 설명이 함께 나온다 | 단위 이관 | unit/tarot/tarot-cards.test.ts (죽음 카드 보충 문구) |
| 584 | AC-9: 위치 이름이 뽑기 전부터 카드 위에 보이고 뽑으면 위치 안내 한 줄이 나온다 | 남김 | tarot#3 |
| 614 | AC-10: 한 번의 리딩에서 같은 카드가 두 번 나오지 않는다 | 남김 | tarot#3 (3장 중복 없음, 값 대신 개수·형식) |
| 635 | AC-3: 3장 타로도 기본 켜짐이고 끄면 정방향만 나오며 다시 열면 켜짐이다 | 삭제 | tarot#4와 중복 |
| 666 | v2 AC-15: 뽑기 전에는 반복 뽑기 안내, 결과에서는 "다시 뽑으면 사라집니다" 안내가 보인다 | 삭제 | 안내 문구 세부 |
| 699 | AC-3(포커스): 뽑으면 결과 제목으로 포커스가 이동한다 | 삭제 | 포커스 세부 |
| 711 | AC-14, AC-35: 메뉴에서 타로가 준비 중이 아니고 두 항목 이름이 맞다 | 삭제 | 메뉴 세부 |
| 749 | AC-35: /sitemap.xml에 두 페이지 URL이 있다 | 남김 | tarot#9 (마지막 step) |
| 772 | AC-17: ${group.name} 앞면(정·역방향) 접근성 이름과 표시 (반복문 안 1건) | 삭제 | 이미지 표시 세부 (design 3.1 이미지 검사) |
| 814 | AC-17: 뒷면 이미지가 두 페이지에서 보이고 이름이 "타로 카드 뒷면"이다 | 삭제 | 이미지 표시 세부 |
| 847 | AC-22, AC-28: 상시 면책과 결과 하단 면책, 109 안내가 뽑기 전부터 보인다 (반복문 안 1건) | 남김 | tarot#1 (면책·상담전화 5개, 모바일 `tel:` 분기) |
| 867 | AC-22, AC-28: 결과가 나온 뒤에도 면책과 109 안내가 보인다 | 삭제 | tarot#1과 중복 |
| 879 | AC-28: 오늘의 타로 결과에도 109 안내가 보인다 | 삭제 | tarot#1과 중복 |
| 890 | AC-23: 질문 입력칸 근처에 민감한 내용을 적지 말라는 안내가 있다 (반복문 안 1건) | 단위 이관 | unit/tarot/tarot-notice.test.ts (TAROT_SENSITIVE_INPUT_NOTICE 원문) |
| 907 | AC-24, AC-25: 오늘의 타로를 뽑는 동안 질문이 네트워크·저장소·URL·콘솔·공지에 남지 않는다 | 남김 | tarot#6 |
| 963 | AC-24, AC-25: 3장 타로를 뽑는 동안 질문이 어디에도 남지 않는다 | 삭제 | tarot#6과 같은 흐름 반복 |
| 991 | AC-26: 질문을 입력한 뒤 새로고침하거나 다녀오면 비어 있다 (반복문 안 1건) | 삭제 | tarot#6과 중복 |
| 1008 | AC-26: 뽑은 뒤 새로고침하면 질문 줄이 사라진다 | 삭제 | tarot#6과 중복 |
| 1018 | AC-27: 쿠키 동의를 거절해도 오늘의 타로와 3장 타로가 동작한다 | 삭제 | 쿠키 거절 반복 |
| 1045 | 에러 상태: 브라우저 저장소를 쓸 수 없어도 결과가 나오고 저장 불가 안내가 보인다 | 삭제 | 저장소 정리 세부 |
| 1087 | AC-29, AC-30: 3장 타로 위기 표현 "${question}"은 카드보다 먼저 안내가 나온다 (반복문 안 1건) | 삭제 | tarot#7과 같은 흐름 반복 |
| 1156 | AC-29, AC-30: 오늘의 타로 위기 표현 "${question}"은 안내가 먼저 나오고 계속 보기로 결과가 나온다 (반복문 안 1건) | 남김 | tarot#7 |
| 1186 | AC-30: "${question}"은 위기 표현으로 감지되지 않는다 (반복문 안 1건) | 단위 이관 | unit/shared/crisis-signal.test.ts |
| 1196 | AC-30: 오늘의 타로에서도 "죽음 카드가 나올까"는 감지되지 않는다 | 단위 이관 | unit/shared/crisis-signal.test.ts |
| 1210 | AC-31: "${question}"를 입력하면 3장 타로 결과에 전문가 상담 안내가 더해진다 (반복문 안 1건) | 삭제 | tarot#7과 같은 흐름 반복. 안내 원문은 tarot-notice가 고정 |
| 1222 | AC-31: 오늘의 타로 결과에도 전문가 상담 안내가 더해지고 해당 없으면 나오지 않는다 | 삭제 | tarot#7과 중복 |
| 1231 | AC-31: 건강·법률·투자 표현이 없으면 전문가 상담 안내가 나오지 않는다 | 삭제 | tarot#7과 중복 |
| 1246 | AC-37: 어제 날짜 유효값은 열면 삭제되고 새 카드를 뽑으면 오늘 값 1개만 남는다 | 삭제 | 저장소 정리 세부 (design 3.1) |
| 1300 | AC-37: 손상값(${corrupted.name})은 오류 없이 삭제되고 뽑기 버튼이 보인다 (반복문 안 1건) | 삭제 | 저장소 정리 세부 |
| 1322 | AC-37: 오늘 날짜 유효값은 삭제되지 않고 같은 카드가 바로 보인다 | 삭제 | tarot#2와 중복 |
| 1339 | AC-37: 날짜를 바꿔 가며 여러 번 뽑아도 타로 localStorage 키는 1개다 | 삭제 | 저장소 정리 세부 |
| 1362 | AC-25: 3장 타로 뒤에도 타로 localStorage 키가 생기지 않는다 | 삭제 | tarot#6과 중복 |
| 1378 | AC-32: noindex가 없고 title, description, canonical, OG가 있다 (반복문 안 1건) | 남김 | tarot#9 |
| 1412 | AC-32: JSON-LD에 Breadcrumb과 화면 FAQ와 같은 FAQ가 있다 (반복문 안 1건) | 남김 | tarot#9 |
| 1447 | AC-34: h1이 하나뿐이다 (뽑기 전, 뽑은 뒤) (반복문 안 1건) | 남김 | tarot#9 |
| 1461 | AC-33: 서버 HTML에 설명·정/역방향 설명·FAQ·면책이 있다 (반복문 안 1건) | 남김 | tarot#8 (JS 끔) |
| 1507 | AC-33(표시): JS를 꺼도 설명·면책·FAQ가 화면에 보인다 (반복문 안 1건) | 삭제 | tarot#8과 중복 |
| 1582 | AC-33: 3장 타로 서버 HTML에 "3장 타로"와 "쓰리카드 타로" 표현이 모두 있다 | 삭제 | 문구 세부. SEO 문구 금지 표현은 tarot-copy가 검사 |
| 1595 | AC-36: 오늘의 타로 뽑기 → 결과 → 새로고침까지 끊김 없이 된다 | 남김 | tarot#1 |
| 1616 | v2 AC-24: 3장 타로 분야 선택 → 뽑기 → 결과 → 다시 뽑기까지 끊김 없이 된다 | 남김 | tarot#3 (@smoke) |
| 1911 | AC-86: (hover: hover) and (pointer: fine)이 Desktop Chrome에서 참, Pixel 7에서 거짓이다 | 삭제 | 기기별 환경 확인 반복 (design 3.1) |
| 1924 | AC-28, AC-86: 결과 하단 번호는 접근성 트리에 한 번씩만 나오고 링크는 터치에만 있다 (반복문 안 1건) | 삭제 | 기기별 환경 반복. 분기는 tarot#1이 확인 |
| 1941 | AC-28, AC-86: 번호를 눌러도 PC는 통화 앱이 열리지 않고 터치는 tel: 링크가 눌린다 (반복문 안 1건) | 삭제 | 기기별 환경 반복 |
| 1990 | AC-28: 뽑기 전과 결과 후 모두 상담전화 5개와 24시간 안내가 보인다 (반복문 안 1건) | 남김 | tarot#1 (상담전화 5개) |
| 2003 | AC-28: 결과 하단 링크는 터치 영역 44px 이상이고 글자 대비가 4.5:1 이상이다 (반복문 안 1건) | 삭제 | 레이아웃·접근성 세부 |
| 2064 | AC-29: 위기 패널에는 번호 3개만 있고 1388, 1366은 없다 (반복문 안 1건) | 남김 | tarot#7 |
| 2120 | AC-29: 탭 순서는 109 → 1577-0199 → 1588-9191 → 계속 보기이고 되돌아간다 (반복문 안 1건) | 삭제 | 키보드 포커스 순서 |
| 2155 | AC-29: 전화 링크를 눌러도 패널이 닫히지 않고 포커스가 남는다 (반복문 안 1건) | 삭제 | 포커스 세부 |
| 2208 | AC-29: 위기 패널 버튼·링크는 터치 영역 44px 이상이고 글자 대비가 4.5:1 이상이다 (반복문 안 1건) | 삭제 | 레이아웃·접근성 세부 |
| 2250 | AC-29, AC-86: 위기 패널 번호는 접근성 트리에 한 번씩만 나오고 하이드레이션 오류가 없다 (반복문 안 1건) | 삭제 | 기기별 환경 반복 |
| 2274 | AC-28: 서버 HTML 응답에 5개 번호와 href, 24시간 안내가 있다 (반복문 안 1건) | 남김 | tarot#8 (상담전화) |
| 2293 | AC-28: JS를 꺼도 DOM에 상담전화 링크 5개가 순서대로 있다 (반복문 안 1건) | 삭제 | tarot#8과 중복 |

### 3.2 tarot-v2.spec.ts (34건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 276 | v2 공통: 응답 400 미만, pageerror 없음, 하이드레이션 오류 없음 (반복문 안 1건) | 삭제 | tarot#9와 중복 |
| 285 | v2 AC-25: noindex가 없고 title, description, canonical, OG가 있다 (반복문 안 1건) | 삭제 | tarot#9와 중복 |
| 313 | v2 AC-27: h1이 하나뿐이다 (뽑기 전, 뽑은 뒤, 분야 변경 뒤) (반복문 안 1건) | 삭제 | tarot#9와 중복 |
| 336 | 가로 스크롤이 생기지 않는다 (뽑기 전, 분야 선택 후 결과) (반복문 안 1건) | 삭제 | 레이아웃 세부 |
| 359 | v2 AC-3·AC-12: 뽑기 전 분야 칩 5개가 보이고 기본은 "전체"이며 질문 입력칸은 비어 있다 (반복문 안 1건) | 남김 | tarot#5 |
| 381 | v2 AC-12: 분야 칩을 눌러도 질문 입력칸이 채워지거나 바뀌지 않는다 (반복문 안 1건) | 삭제 | 입력 세부 |
| 404 | v2 AC-8·AC-14: 질문 입력칸 옆에 "카드 선택과 해석에 쓰이지 않습니다" 안내가 있고 연결돼 있다 (반복문 안 1건) | 삭제 | 접근성 세부 |
| 424 | v2 AC-20: 위기 표현을 넣고 분야를 골라 뽑으면 상담 안내가 먼저 나온다 (반복문 안 1건) | 삭제 | tarot#7과 같은 흐름 반복 |
| 452 | v2 AC-21: 상시 면책이 h1 아래에 있고 결과 하단에 상담전화 다섯 곳이 보인다 (반복문 안 1건) | 삭제 | tarot#1과 중복 |
| 480 | v2 AC-23: 쿠키 동의를 거절해도 분야 선택·뽑기·이야기가 동작한다 (반복문 안 1건) | 삭제 | 쿠키 거절 반복 |
| 506 | v2 AC-18·AC-19: 분야 칩·질문·뽑기·재뽑기 중 질문과 분야가 요청·저장소·URL에 남지 않는다 (반복문 안 1건) | 남김 | tarot#6 |
| 560 | v2 AC-26: 서버 HTML에 분야 설명, 1장·3장 차이 FAQ, FAQ, 면책이 있다 (반복문 안 1건) | 삭제 | tarot#8과 중복 |
| 592 | v2 AC-1: 로그인 없이 카드를 한 장 뽑을 수 있다 | 삭제 | tarot#1과 중복 |
| 599 | v2 AC-2: h1 아래 목적 문구가 뽑기 전부터 보이고 긴 해석 문단이 없다 | 삭제 | 문구 세부 |
| 624 | v2 AC-4·AC-5: 카드를 뽑은 뒤 분야를 바꾸면 카드는 그대로이고 분야 문장만 바뀐다 | 남김 | tarot#5 |
| 699 | v2 AC-5: 뽑기 전에 고른 분야가 결과 분야 문장에 반영된다 | 삭제 | tarot#5와 중복 |
| 718 | v2 AC-4: 결과 뒤 분야를 바꿀 때만 aria-live 알림이 바뀐다 | 삭제 | 접근성 세부 |
| 737 | v2 AC-6: 같은 날 새로고침해도 카드와 방향이 그대로이고 저장소에는 날짜·카드 번호·방향만 있다 | 삭제 | tarot#2와 중복 |
| 773 | v2 AC-7: 재뽑기 버튼이 없고 한국 시간 자정이 지난 값이면 새 카드를 뽑을 수 있다 | 삭제 | tarot#2와 중복 |
| 804 | v2 D6: 분야 칩은 뽑기 전·결과에서 보이고 위기 패널에서는 숨는다 | 삭제 | 표시 세부 |
| 817 | v2 AC-9 범위 밖: 오늘의 타로에는 3장 흐름 이야기가 없다 | 삭제 | 부재 확인 세부 |
| 829 | v2 AC-24: 분야 선택 → 뽑기 → 결과 → 분야 변경 흐름이 오류 없이 이어진다 | 삭제 | tarot#5와 같은 흐름 반복 |
| 862 | v2 AC-9: 세 장을 뽑으면 과거·현재·미래 이름과 위치 안내 한 줄이 카드 위에 보인다 | 삭제 | tarot#3과 중복 |
| 881 | v2 AC-10: 한 번의 리딩에서 같은 카드가 두 번 나오지 않는다 (재뽑기 5회) | 삭제 | tarot#3과 중복 |
| 896 | v2 AC-11: 결과 아래 "흐름 이야기" 문단이 하나, 3~5문장, 과거·현재·미래를 모두 포함한다 | 남김 | tarot#3 (형식·개수) |
| 924 | v2 AC-12: "전체"(기본)로 뽑으면 분야 표시줄 없이 공통 문장 이야기가 나온다 | 삭제 | tarot#3과 중복 |
| 946 | v2 AC-13: 분야 "${topic.label}"로 뽑으면 이야기 문장이 해당 분야 세트에서 나온다 (반복문 안 1건) | 단위 이관 | unit/tarot/tarot-story.test.ts (분야별 세트 상수 대조) |
| 987 | v2 AC-14: 질문을 적고 뽑아도 이야기와 분야 문장에 질문이 반영되지 않는다 | 삭제 | tarot#6과 중복 |
| 1012 | v2 AC-15: 다시 뽑기 버튼에 안내가 연결돼 있고 재뽑기로 새 이야기가 나온다 | 삭제 | 접근성·안내 세부 |
| 1048 | v2 AC-16: 3장 h1·description에 "상담"이 없고 목적 문구에 "고민을 정리"의 뜻이 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1065 | v2 AC-17: 메뉴와 페이지 이름이 "3장 타로 (과거·현재·미래)"로 유지된다 | 단위 이관 | unit/tarot/tarot-copy.test.ts (메뉴 상수) |
| 1075 | v2 AC-24: 분야 선택 → 뽑기 → 결과 → 다시 뽑기 흐름이 오류 없이 이어진다 | 삭제 | tarot#3과 같은 흐름 반복 |
| 1099 | v2 AC-12: 결과 화면에서는 분야 칩이 숨는다 | 삭제 | 표시 세부 |
| 1110 | v2 AC-22: ${target.path} 분야 선택 뒤 결과 화면 글자에 금지 표현이 없다 (반복문 안 1건) | 삭제 | 상수 금지 표현 검사(tarot-copy)와 중복 |

### 3.3 tarot-copy.spec.ts (48건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 257 | 검사 대상이 모두 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 268 | AC-19: 카드 78장 전 필드에 금지 표현이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 273 | AC-19: FAQ·고지·분야 예시·위치 안내·SEO·메뉴에 금지 표현이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 278 | AC-19: 허용 예외 문장은 부정 고지 문장뿐이다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 289 | AC-28, AC-19: 상담전화 5개 설명 구절과 안내 문장이 검사 대상에 들어 있고 금지 표현이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 318 | AC-18: 카드·FAQ·고지·SEO·메뉴 문구에 상표성 명칭(Rider-Waite 등)이 없다 | 단위 이관 | unit/tarot/tarot-trademark.test.ts (문구 상수) |
| 329 | D4: 카드·FAQ·고지·분야 예시·위치 안내·SEO·메뉴 문장은 합니다체로 통일돼 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 362 | AC-15: 78장 모두 이름, 정/역방향 키워드 3개씩, 요약이 비어 있지 않다 | 단위 이관 | unit/tarot/tarot-cards.test.ts |
| 390 | AC-15(참고): 요약이 1~2문장이다 | 삭제 | 후보 보고용, 자동 실패 아님 |
| 412 | AC-15(참고): 서로 다른 카드·방향에 같은 요약이 없다 | 삭제 | 후보 보고용 |
| 429 | AC-16: id 0~77 연속, 힘 8, 정의 11, 마이너 이름은 수트 + 랭크 순서 | 단위 이관 | unit/tarot/tarot-cards.test.ts |
| 509 | AC-20(데이터): 죽음 카드(id 13)만 보충 문구가 있고 실제 죽음이 아니라는 뜻이다 | 단위 이관 | unit/tarot/tarot-cards.test.ts |
| 518 | v2 AC-3·AC-12(데이터): 분야 칩 5개(전체 기본)이고 질문 예시·옛 분야 상수가 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 547 | AC-9(데이터): 위치 3개 모두 안내 문장이 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 555 | FAQ: 페이지마다 3개 이상이고 질문은 "~입니까?" 형태이며 답변이 비어 있지 않다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 572 | AC-18: src/와 public/ 소스에 Rider-Waite 계열 명칭이 없다 | 단위 이관 | unit/tarot/tarot-trademark.test.ts (`source-scan`, 제외 목록 유지) |
| 598 | AC-18: 화면 코드가 표현 규칙 검사 목록(tarot-copy-rule)을 import하지 않는다 | 삭제 | 제품 규칙 아닌 소스 스캔 (design 3절 3번) |
| 609 | AC-21: 카드 이미지 파일이 타로 경로·타로 이름으로 public/·src/에 없다 | 삭제 | 이미지 파일 위치·이름 검사 (design 3절 3번) |
| 642 | AC-21: THIRD_PARTY_NOTICES.md에 이미지 자체 제작 이력이 있다 | 삭제 | 문서 기록 검사 |
| 652 | AC-21: docs/tarot/copy-log.md에 78장의 작성자·작성일·검수자 기록이 있다 | 삭제 | copy-log 문서 기록 검사 |
| 682 | AC-21(참고): 카드 78장 중 검수 완료 행 수를 보고한다 | 삭제 | 보고용, 문서 기록 검사 |
| 809 | AC-18, AC-19: ${pagePath} 서버 HTML에 금지 표현·상표 명칭이 없다 (반복문 안 1건) | 삭제 | 상수·소스 검사(tarot-copy, tarot-trademark)와 중복 |
| 833 | D4: ${pagePath} 서버 HTML 문장은 합니다체로 통일돼 있다 (반복문 안 1건) | 삭제 | 상수 합니다체 검사(329줄 이관)와 중복 |
| 868 | AC-32(문구): 두 페이지 title·description에 핵심 검색어와 오락·참고용 고지가 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts (SEO 상수) |
| 955 | v2 AC-22: 새 고지 문구·분야 문장 40·이야기 45·SEO·FAQ·가이드에 금지 표현이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 983 | v2 AC-22: 새 문구 전체에 투자·재산 증식·복권·도박·로또 표현이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1001 | v2 AC-22: 허용 예외 문장은 부정 고지 3개뿐이다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1011 | v2: 승인된 고지 문구가 글자 단위로 같다 | 단위 이관 | unit/tarot/tarot-notice.test.ts |
| 1028 | v2 AC-5: 그룹 5 x 분야 4 x 방향 2 = 40칸이 빠짐없이 채워져 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1044 | v2 C-1: 40문장이 서로 모두 다르다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1055 | v2 C-1: 칸마다 완결된 한 문장이고 합니다체이며 자리표시자가 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1081 | v2 C-1(참고): "수 있습니다." 종결 권장을 지키지 않은 칸을 보고한다 | 삭제 | 후보 보고용, 자동 실패 아님 |
| 1092 | v2 C-1: 재물 분야 문장 10개는 생활 습관·소비 태도 범위다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1099 | v2 C-1(참고): 역방향 문장의 렌즈 후보를 보고한다 | 삭제 | 후보 보고용, 자동 실패 아님 |
| 1112 | v2 AC-5: getTarotTopicReading은 상수 칸과 같은 문장을 돌려주고 all이면 null이다 | 단위 이관 | unit/tarot/tarot-story.test.ts |
| 1131 | v2 AC-11: 5세트 x (위치 틀 6 + 마무리 3) = 45칸이 빠짐없이 채워져 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1141 | v2 AC-11: 45문장 모두 "수 있습니다."로 끝나고 한 문장이다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1150 | v2 C-2: 위치 틀은 {card} 1회 + " 카드", 위치 단어 포함, {keyword}는 0~1회 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1179 | v2 C-2: 마무리 문장에는 자리표시자가 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1186 | v2 AC-13: 45문장이 서로 모두 다르다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1207 | v2 AC-11, AC-13: buildTarotThreeCardStory 전수(1,000 조합, 분야 5개)는 null 0, 4문장… | 단위 이관 | unit/tarot/tarot-story.test.ts |
| 1269 | v2 FE-2: buildTarotThreeCardStory는 세 장이 아니거나 위치가 겹치면 null이다 | 단위 이관 | unit/tarot/tarot-story.test.ts |
| 1289 | v2 AC-16: 3장 h1·title·description·headerDescription에 "상담"이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1303 | v2 C-3: 두 페이지의 SEO·가이드·FAQ에 "운세"가 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1316 | v2 AC-2: 1장 목적 문구에 "가볍게 보는 오늘의 흐름"이 있다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1322 | v2 AC-26: 가이드가 페이지당 600자 이상이고 두 페이지 문단이 겹치지 않는다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1335 | v2 AC-26: FAQ 필수 질문이 있고 질문은 "~입니까?"이며 두 페이지 답이 같지 않다 | 단위 이관 | unit/tarot/tarot-copy.test.ts |
| 1360 | v2 AC-17: 메뉴 타로 항목 이름이 유지되고 설명에 "운세"·"상담"이 없다 | 단위 이관 | unit/tarot/tarot-copy.test.ts (메뉴 상수) |

## 4. dream (원본 spec 2개, test 68건)

최종 e2e 목표는 6개입니다. dream#1 허브 검색(@smoke), #2 상세 열람·관련 소재, #3 위기어 검색, #4 메뉴·홈 진입, #5 쿠키 거절·광고 차단, #6 SEO.

### 4.1 dream.spec.ts (47건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 198 | AC-1, AC-40: h1 하나, 검색칸, 카테고리별 소재 목록이 보인다 | 남김 | dream#1 (@smoke) |
| 218 | AC-2: "돼지" 검색은 이름·별칭에 맞는 소재만 남기고 지우면 전체 | 남김 | dream#1 |
| 238 | AC-3: 데이터의 모든 별칭으로 검색하면 그 소재가 나온다 | 삭제 | 같은 흐름 반복. 별칭 데이터는 dream-topics가 검사 |
| 258 | AC-3: 카테고리 이름으로 검색하면 그 카테고리 소재가 나온다 | 삭제 | 같은 흐름 반복 |
| 271 | AC-4: 띄어쓰기·대소문자를 무시한다 | 삭제 | 같은 흐름 반복 |
| 284 | AC-5: 일치하는 소재가 없으면 안내와 "전체 목록 보기"가 보이고 누르면 전체로 돌아온다 | 남김 | dream#1 (빈 결과 상태) |
| 300 | AC-5: 로또·복권·태몽 검색은 빈 상태 안내만 보이고 번호·로또 링크가 없다 | 삭제 | 빈 상태 반복 |
| 312 | AC-5: 특수문자와 긴 입력도 오류 화면 없이 처리한다 | 삭제 | 입력 세부 |
| 333 | AC-6, AC-44: 검색하는 동안 요청이 없고 검색어가 어디로도 나가지 않으며 주소가 바뀌지 않는다 | 삭제 | 그 밖: 검색 세부 반복 |
| 371 | AC-44: 허브 목록 링크에 검색어 쿼리가 붙지 않는다 | 삭제 | 링크 href 세부 |
| 383 | AC-7, AC-27, AC-29: 상시 면책이 h1 아래에 보이고 상세 안내 6항이 있다 | 단위 이관 | unit/dream/dream-notice.test.ts (DREAM_DISCLAIMER_TEXT, DREAM_DETAIL_NOTICE_ITEMS 원문) |
| 412 | AC-12: 허브에 풀이 기준 안내가 보인다 | 삭제 | 법적 고지 아님, 금지 표현 검사로 대체 (design 4.3절) |
| 417 | AC-20: 검색칸 외 입력칸과 textarea가 없고 개인 내용 주의 안내가 연결돼 있다 | 삭제 | 접근성·입력 세부. 안내 원문은 dream-notice(DREAM_SEARCH_NOTICE) |
| 431 | AC-19: 허브 본문에 /lotto 링크가 없다 | 삭제 | 로또 표현 금지는 dream-copy가 상수로 검사 |
| 436 | AC-24: 허브 하단 상담 안내에 다섯 번호가 순서대로 있다 | 단위 이관 | unit/shared/crisis-phone.test.ts |
| 455 | AC-21: 검색·상세 열람 동안 localStorage·sessionStorage에 새 값이 없다 | 삭제 | 그 밖: 저장 세부 |
| 479 | 위기 표현을 입력하면 상담 안내가 먼저 보이고 결과 영역은 막히지 않는다 | 남김 | dream#3 |
| 507 | 띄어쓰기·섞인 문장에서도 위기 표현을 찾고 다른 위기 표현도 안내한다 | 단위 이관 | unit/shared/crisis-signal.test.ts |
| 517 | 오탐 방지: "죽음" 소재 검색은 결과만 보이고 상담 안내 상자는 뜨지 않는다 | 단위 이관 | unit/shared/crisis-signal.test.ts (`hasCrisisSignal` 거짓) |
| 530 | 위기 표현 검색어가 서버·URL·저장소·콘솔로 나가지 않는다 | 삭제 | 그 밖: 검색 세부 반복 |
| 574 | AC-9, AC-12, AC-27, AC-28, AC-40: ${topic.slug} 본문·면책·풀이 기준·h1 (반복문 안 1건) | 남김 | dream#2 |
| 615 | AC-13, AC-15: ${topic.slug} 관련 소재 2~4개 이동, 허브 링크 (반복문 안 1건) | 남김 | dream#2 |
| 650 | AC-14: ${topic.slug} FAQ 2개와 FAQPage JSON-LD가 같다 (반복문 안 1건) | 삭제 | FAQ 구조는 dream-copy(AC-14) 이관과 중복 |
| 674 | AC-24: ${topic.slug} 하단 상담 안내에 다섯 번호가 순서대로 있다 (반복문 안 1건) | 삭제 | dream#3과 crisis-phone 단위가 대신함 |
| 692 | AC-19, AC-20: ${topic.slug} /lotto 링크·입력칸·textarea 없음 (반복문 안 1건) | 삭제 | 부재 확인 반복 |
| 703 | AC-23: 민감 소재는 완화 블록과 전문가 상담 안내가 보인다 | 삭제 | 데이터는 dream-topics(AC-23)가 검사. 화면 세부 |
| 720 | AC-23: 죽음 소재는 "실제 죽음을 뜻하지 않는다" 설명이 함께 보인다 | 삭제 | 데이터는 dream-topics가 검사 |
| 734 | AC-23: 일반 소재에는 완화 블록이 없다 | 삭제 | 부재 확인 세부 |
| 742 | 띠 동물 소재만 띠별 운세 링크와 동의 안내가 보인다 | 삭제 | 링크 표시 세부 |
| 757 | AC-16: 없는 소재 주소는 404이고 루트 404 화면이 나온다 | 삭제 | 그 밖: 404 세부 |
| 782 | AC-7, AC-8, AC-20: 허브 HTML에 면책·목록 120개·FAQ·상담 번호가 있다 | 남김 | dream#6 (SEO, 서버 HTML 흡수) |
| 815 | AC-9, AC-14, AC-27, AC-28: 대표 소재 상세 HTML에 본문·FAQ·면책이 있다 | 삭제 | dream#6과 중복 |
| 835 | AC-9, AC-11, AC-17~19, AC-27, AC-28, AC-40: 상세 120개 HTML 전수 점검 | 삭제 | 데이터 전수는 dream-topics·dream-copy가 대신함 |
| 885 | AC-38, AC-39, AC-40: 허브 메타데이터와 BreadcrumbList | 남김 | dream#6 |
| 926 | AC-38, AC-39, AC-40: ${topic.slug} 메타데이터와 JSON-LD (반복문 안 1건) | 남김 | dream#6 (대표 소재 1개) |
| 970 | AC-37, AC-44: sitemap.xml에 /dream과 소재 상세 120개가 모두 있다 | 남김 | dream#6 (마지막 step) |
| 989 | AC-38: robots.txt가 /dream을 막지 않고 sitemap을 알린다 | 삭제 | 그 밖: robots 세부 |
| 1005 | AC-35: 메뉴 데이터에서 꿈 해몽은 독립 그룹이고 준비 중이 아니다 | 삭제 | dream#4가 화면으로 확인 |
| 1013 | AC-35: 헤더(PC·모바일) 메뉴의 "꿈 해몽"을 누르면 /dream으로 간다 | 남김 | dream#4 |
| 1036 | AC-36: 홈에 "꿈 해몽" 메뉴 카드가 보이고 /dream으로 간다 | 남김 | dream#4 |
| 1053 | AC-22: 쿠키 동의를 거부해도 검색·목록·상세 읽기가 동작한다 | 남김 | dream#5 |
| 1074 | AC-30: 광고 요청이 막혀도 검색과 상세 열람이 동작한다 | 남김 | dream#5 (광고 스크립트 요청 차단) |
| 1097 | 검색칸에서 Tab을 누르면 첫 소재 링크로 가고 Enter로 상세에 간다 | 삭제 | 키보드 포커스 (design 3.1) |
| 1123 | 빈 상태에서 Tab → Enter로 "전체 목록 보기"를 눌러 입력칸으로 돌아온다 | 삭제 | 키보드 포커스 |
| 1139 | 위기 안내가 떠도 입력칸 포커스는 유지된다 | 삭제 | 키보드 포커스 |
| 1148 | 상세에서 Tab으로 관련 소재 링크에 닿고 Enter로 이동한다 | 삭제 | 키보드 포커스 |
| 1173 | AC-41: 허브 → 검색 → 상세 → 관련 소재 흐름이 끊기지 않는다 | 남김 | dream#2 |

### 4.2 dream-copy.spec.ts (21건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 84 | AC-42: 소재 120개, 카테고리별 개수 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 94 | AC-43: slug 형식(영문 소문자·하이픈, 40자 이하)·중복 없음 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 102 | AC-43: 별칭 2~5개, 소재 이름·별칭 중복 없음 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 137 | AC-10: 한 줄 요약 1문장 20~80자, "."로 끝남 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 152 | AC-10: 민간 풀이 3~5, 생각해 볼 점 2~3, 각 원소 "."로 끝남 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 169 | AC-10: 민간 풀이+생각해 볼 점 분량 공백 포함 300자 이상 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 179 | AC-14: FAQ 2개, 질문·답 비어 있지 않음 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 195 | AC-13: related 2~4개, 실제 slug, 자기 자신 아님, 같은 카테고리, 중복 없음 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 216 | AC-23: death 카테고리는 모두 민감, 민감 소재 soothing 1~3문장 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 232 | AC-23: 죽음 소재 보충 문장 상수가 있고 sensitivity death 소재가 1개 이상 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 237 | 12지 동물 11개 isTtiAnimal, 모두 동물, 용·dragon 없음 | 단위 이관 | unit/dream/dream-topics.test.ts |
| 262 | AC-17: 금지 표현 목록·패턴 0건(허용 문장 제거 후) | 단위 이관 | unit/dream/dream-copy.test.ts |
| 278 | AC-18: 로또 연상어 0건 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 288 | 태몽·용꿈 소재 부재(이름·별칭·slug) | 단위 이관 | unit/dream/dream-topics.test.ts |
| 298 | AC-26: 수치 자랑 0건 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 312 | AC-25: 소재 데이터에 위기 표현 0건(정규화 후) | 단위 이관 | unit/shared/crisis-signal.test.ts (소재 데이터를 `hasCrisisSignal`로 검사) |
| 325 | FAQ 답: 답변 전체가 서로 같은 소재 없음 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 339 | 본문: 서로 다른 소재에 같은 문장 없음 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 354 | 본문: 이름 자리표시 치환 후에도 같은 문장 없음 | 단위 이관 | unit/dream/dream-copy.test.ts |
| 393 | AC-33: copy-log 소재 행 수 120, slug가 데이터와 한 번씩 일치 | 삭제 | copy-log 문서 기록 검사 (design 3절 1번) |
| 406 | AC-33: copy-log 작성자·작성일·상태 칸이 비어 있지 않음 | 삭제 | copy-log 문서 기록 검사 |

## 5. lunch (원본 spec 2개, test 39건)

최종 e2e 목표는 5개입니다. lunch#1 추천 생성→결과·면책(@smoke), #2 필터·빈 상태, #3 지도 링크, #4 메뉴·홈 노출·진입, #5 SEO.

### 5.1 lunch.spec.ts (27건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 153 | 응답 400 미만, pageerror 없음, h1 하나, title·description 메타 | 남김 | lunch#5 (SEO) |
| 170 | AC-36: index 허용, canonical·og가 buildMetadata 결과와 같다 | 남김 | lunch#5 |
| 208 | AC-37: /sitemap.xml에 /lunch/today가 포함된다 | 남김 | lunch#5 (마지막 step) |
| 214 | AC-38: 메뉴·홈의 점심 항목에 준비 중 표시가 없다 | 남김 | lunch#4 |
| 224 | AC-35: JSON-LD는 BreadcrumbList와 FAQPage 두 개뿐, FAQ가 화면과 같다 | 남김 | lunch#5 |
| 263 | AC-34: JS 없이 받은 HTML에 h1, 설명, 고지, 사용 순서, FAQ가 있다 | 삭제 | lunch#5와 중복. 고지 원문은 lunch-notice가 고정 |
| 293 | AC-30: 약관 9장·13장, 방침 6장에 점심 문구가 있다 | 삭제 | 그 밖: 약관·방침 문구 세부 |
| 322 | AC-3: 기본은 칩 6개 모두 선택, 국물 상관없음, 버튼 룰렛 돌리기 | 삭제 | lunch#1이 기본 상태를 지남. 같은 흐름 반복 |
| 339 | AC-5: 칩을 모두 끄면 버튼 비활성, 안내 표시, 국물 조건 없애기 없음 | 남김 | lunch#2 |
| 353 | U7: 양식만 + 국물 있음이면 후보 0개, 국물 조건 없애기 뒤 포커스가 뽑기 버튼 | 남김 | lunch#2 (빈 상태 안내) |
| 386 | AC-1, AC-2, AC-8, AC-9, AC-12: 돌리면 후보 안의 메뉴 하나, 알림, 점심운, 포커스 유지 | 남김 | lunch#1 (@smoke, 무작위라 형식·개수만) |
| 407 | AC-4: 한식만 켜고 10회 돌리면 모두 한식 메뉴 | 삭제 | 룰렛 세부, 필터 조건은 lunch#2가 확인 |
| 422 | AC-6: 동작 줄이기에서는 돌림판 transform이 중간값을 거치지 않는다 | 삭제 | 룰렛·모션 세부 (design 3.1) |
| 455 | AC-7: 회전 중 버튼·칩·국물은 잠기고 결과는 한 번만 나온다 | 삭제 | 룰렛 세부 |
| 475 | AC-18: 다시 뽑기는 같은 버튼, 도는 동안 결과 카드가 사라진다 | 삭제 | 룰렛 세부 |
| 492 | AC-19: 고정 난수에서 첫 결과는 첫 메뉴, 다시 뽑기는 직전 제외 후 첫 메뉴 | 삭제 | 룰렛 세부 (난수 고정 의존) |
| 505 | AC-20: 조건을 바꾸면 결과와 알림이 사라지고 버튼이 룰렛 돌리기로 돌아간다 | 삭제 | 룰렛 세부 |
| 518 | AC-21: 새로고침하면 처음 상태로 돌아간다 | 삭제 | 룰렛 세부 |
| 540 | AC-13~17: 링크 3개, 새 탭 속성, popup 열림, 원래 탭 유지, noopener·noreferrer | 남김 | lunch#3 |
| 614 | AC-17, AC-31: 키보드만으로 칩, 국물, 돌리기, 다시 뽑기, 링크 실행 | 삭제 | 키보드 세부 |
| 666 | AC-22: 위치 권한 요청이 없고 Permissions-Policy가 geolocation을 막는다 | 삭제 | 위치·동의 세부 반복 (design 3.1) |
| 697 | AC-23: 저장소·쿠키·주소에 아무것도 쓰지 않는다 | 삭제 | 위치·동의 세부 반복 |
| 711 | AC-24: 쿠키 거부와 광고 요청 차단 상태에서도 흐름이 동작한다 | 삭제 | 위치·동의 세부 반복 |
| 736 | AC-25~28: 상시 고지가 h1 바로 아래, 무작위·보상 없음 고지는 결과 전에도 보인다 | 남김 | lunch#1 (면책 표시, 상수 import 비교). 원문은 lunch-notice가 고정 |
| 778 | AC-11, AC-12: 본문 화면 텍스트에 금지 단어가 없다 (고지 제외) | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 811 | AC-32: 버튼·라디오·링크에 접근성 이름이 있다 | 삭제 | 접근성 세부 |
| 831 | 돌림판 SVG는 보조기술에서 숨겨지고 위치 요청 안내가 없다 | 삭제 | 접근성 세부 |

### 5.2 lunch-copy.spec.ts (12건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 99 | AC-40: 메뉴 48개, 카테고리 6개 이상 6개씩, 이름·id 중복 없음, id 형식 | 단위 이관 | unit/lunch/lunch-menu.test.ts |
| 118 | L2: 카테고리별 10/8/8/8/6/8, 국물 15개 건조 33개, 경계 메뉴 일치 | 단위 이관 | unit/lunch/lunch-menu.test.ts |
| 139 | AC-9: 카테고리마다 정확히 4줄, 합계 24줄, 중복 없음 | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 149 | 점심운에 메뉴 이름·국물·맛 언급이 없다 | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 175 | AC-10: 점심운 24줄에 금지 표현이 없다 | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 180 | 소재명(메뉴명)만 바꿔치기한 문장이 없다 | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 205 | 고지 5문장이 허용 문장 목록과 정확히 같다 | 단위 이관 | unit/lunch/lunch-notice.test.ts (LUNCH_DISCLAIMER_TEXT) |
| 211 | AC-29: 보상 없음 고지가 U5 승인 문구와 같다 | 단위 이관 | unit/lunch/lunch-notice.test.ts (LUNCH_NO_REWARD_NOTICE_TEXT) |
| 217 | AC-10~12: 고지·라벨·FAQ·SEO 문구에 금지 표현이 없다 (허용 문장 제외) | 단위 이관 | unit/lunch/lunch-copy.test.ts |
| 238 | AC-39: 메뉴 점심 항목 설명·예시에 금지 단어가 없고 색 토큰이 text-menu-lunch | 단위 이관 | unit/lunch/lunch-copy.test.ts (금지 단어만. 색 토큰은 design-guard hook이 보증) |
| 253 | 외부 링크 안내와 FAQ 4번 답이 카카오·네이버·구글 3개를 말한다 | 단위 이관 | unit/lunch/lunch-notice.test.ts (LUNCH_EXTERNAL_LINK_NOTICE_TEXT) |
| 264 | FAQ 5개, 질문·답 중복 없음, 답끼리 같은 문장 없음 | 단위 이관 | unit/lunch/lunch-copy.test.ts |

## 6. swagger-docs (원본 spec 2개, test 17건)

최종 e2e 목표는 8개입니다. swagger#1 `/api-docs` 화면(@smoke), #2 `/openapi.json`, #3 draws 파라미터·Try it out, #4 export CSV, #5 hot-cold 응답, #6 요청 제한(429, desktop 전용·태그 없음), #7 기존 API 헤더, #8 `/api-docs/none` 404. SEO test는 개발 전용이라 두지 않습니다.

### 6.1 swagger-docs.spec.ts (14건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 27 | /api-docs 응답 400 미만, pageerror 없음, h1 하나, 메타 존재 | 남김 | swagger#1 (@smoke) |
| 47 | AC-1: /api-docs에 h1 "API 문서"와 Swagger UI가 보인다 | 남김 | swagger#1 |
| 57 | AC-2: operation 3개, 경로 일치, 제외 경로 없음 | 남김 | swagger#2 |
| 70 | AC-3: /openapi.json 200 JSON, paths 정확히 일치 | 남김 | swagger#2 |
| 78 | AC-4: draws 파라미터와 응답 코드 | 남김 | swagger#3 |
| 88 | AC-5: export 명세 text/csv + attachment, 실제 응답 CSV | 남김 | swagger#4 |
| 105 | AC-6: hot-cold 200 응답에 ok, data, meta | 남김 | swagger#5 |
| 118 | AC-7: export 21번째, draws 61번째 요청이 429 | 남김 | swagger#6 (desktop 전용, 태그 없음) |
| 135 | AC-8: Try it out으로 latest=1 실행 시 200과 lastDrawNumber | 남김 | swagger#3 |
| 156 | AC-10: 기존 API status, Content-Type, Cache-Control | 남김 | swagger#7 |
| 182 | AC-11: 고지 문구가 보인다 | 남김 | swagger#1 |
| 193 | AC-12: 가로 스크롤이 생기지 않는다 (375px) | 남김 | swagger#1 |
| 205 | AC-13: 조각 파일 구조, 제외 경로 없음 | 남김 | swagger#2 |
| 220 | 상태: 알 수 없는 경로 /api-docs/none 은 404 | 남김 | swagger#8 |

### 6.2 swagger-docs.extend.spec.ts (3건)

세 건 모두 `src/` 아래에 더미 조각 파일을 쓰는 방식입니다. 이 방식은 없애고 같은 규칙을 `mergeOpenApiPieces` 단위 테스트로 옮깁니다.

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 31 | AC-14: 더미 조각 파일만 추가하면 명세와 화면에 나타난다 | 단위 이관 | unit/api-docs/merge-openapi.test.ts (정상 조각이면 경로가 합쳐짐) |
| 49 | AC-15: 필수 항목(responses) 누락 시 합치기 실패, 일부만 내보내지 않는다 | 단위 이관 | unit/api-docs/merge-openapi.test.ts (예외 메시지에 `responses` 포함) |
| 70 | AC-15: 경로 중복 시 합치기 실패 | 단위 이관 | unit/api-docs/merge-openapi.test.ts (기존 lotto 조각과 경로 겹침) |

## 7. lotto (원본 spec 2개, test 11건)

최종 e2e 목표는 7개입니다. lotto#1 번호 생성(@smoke), #2 고급 옵션, #3 채점→저장, #4 옛 URL 이동, #5 PC 헤더 배지 없음, #6 핫/콜드 분석 화면, #7 SEO(기존 "페이지 열림" 7개를 step으로 흡수).

### 7.1 lotto.smoke.spec.ts (8건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 26 | 페이지 열림: ${path} (반복문 안 1건, 7개 경로) | 남김 | lotto#7 (SEO, 경로별 step으로 흡수) |
| 43 | 옛 생성기 URL은 /lotto/generator로 이동한다 | 남김 | lotto#4 |
| 56 | 기본 5게임을 생성한다 | 남김 | lotto#1 (@smoke, 개수·형식만) |
| 61 | 게임 수는 최대 20으로 제한된다 | 남김 | lotto#1 (게임 수 제한과 "당첨을 보장하지 않습니다" 고지 확인) |
| 68 | 고급 옵션을 켜면 조건이 보이고 생성된다 | 남김 | lotto#2 |
| 76 | PC 폭에서는 결과가 2단으로 보인다 | 삭제 | 레이아웃 세부 (design 3.1) |
| 86 | PC 헤더에 준비 중 배지가 없다(comingSoon 그룹 없음) | 남김 | lotto#5 |
| 96 | 핫/콜드 API가 통계를 돌려준다 | 삭제 | DB 연결이 있어야 통과하는 정합 검사 (design 3절 6번). 집계 규칙은 unit/lotto/lotto-hot-cold.test.ts에서 새로 검사 |

### 7.2 lotto.flow.spec.ts (3건)

| 줄 | 제목 | 분류 | 옮긴 곳 / 사유 |
|---|---|---|---|
| 48 | 채점 후 전체 저장하면 나의 번호에 나타난다 | 남김 | lotto#3 |
| 81 | 핫/콜드 범위 모드 결과가 직접 센 값과 같다 | 남김 | lotto#6 (화면에 목록 5개 표시만 확인). 직접 센 값 대조는 unit/lotto/lotto-hot-cold.test.ts로 이관 (1.2절 4번) |
| 140 | 핫/콜드 API 값이 서로 맞는다 | 삭제 | DB 연결이 있어야 통과하는 정합 검사 (design 3절 6번). 계산 규칙은 unit/lotto/lotto-hot-cold.test.ts로 이관 |

## 8. 집계

아래 수치는 이 문서의 표를 `|` 구분 열 기준으로 센 값입니다.

### 8.1 기능별 분류 개수

| 기능 | 원본 test | 남김 | 단위 이관 | 삭제 | 미분류 | 최종 e2e 목표 |
|---|---|---|---|---|---|---|
| fortune | 393 | 53 | 214 | 126 | 0 | 15 |
| tarot | 148 | 28 | 44 | 76 | 0 | 9 |
| dream | 68 | 15 | 23 | 30 | 0 | 6 |
| lunch | 39 | 10 | 13 | 16 | 0 | 5 |
| swagger-docs | 17 | 14 | 3 | 0 | 0 | 8 |
| lotto | 11 | 8 | 0 | 3 | 0 | 7 |
| 합계 | 676 | 128 | 297 | 251 | 0 | 50 |

"남김"은 최종 e2e의 재료가 되는 원본 test 수입니다. 같은 흐름의 여러 원본이 한 test로 합쳐지므로 최종 e2e 목표 수(50개)보다 큽니다. 최종 test 수는 T6이 확정하고 T8-b가 `test(` 호출 수로 다시 셉니다. 기능별 최종 목표는 design 5.2절과 같고, 모바일 smoke는 8개입니다.

### 8.2 spec 파일별 분류 개수

| 원본 spec | 합계 | 남김 | 단위 이관 | 삭제 |
|---|---|---|---|---|
| fortune-calc | 146 | 0 | 145 | 1 |
| fortune-copy | 86 | 10 | 49 | 27 |
| fortune | 80 | 23 | 5 | 52 |
| fortune-saju | 54 | 13 | 14 | 27 |
| fortune-saju.launch | 4 | 2 | 0 | 2 |
| fortune-v2 | 23 | 5 | 1 | 17 |
| tarot | 66 | 24 | 4 | 38 |
| tarot-v2 | 34 | 4 | 3 | 27 |
| tarot-copy | 48 | 0 | 37 | 11 |
| dream | 47 | 15 | 4 | 28 |
| dream-copy | 21 | 0 | 19 | 2 |
| lunch | 27 | 10 | 1 | 16 |
| lunch-copy | 12 | 0 | 12 | 0 |
| swagger-docs | 14 | 14 | 0 | 0 |
| swagger-docs.extend | 3 | 0 | 3 | 0 |
| lotto.smoke | 8 | 6 | 0 | 2 |
| lotto.flow | 3 | 2 | 0 | 1 |

### 8.3 단위 이관 대상 파일별 개수 (T4 입력)

원본 test가 직접 대응하는 개수입니다. 이 표에 없는 `unit/lotto/lotto-hot-cold.test.ts`, `unit/lotto/lotto-generator.test.ts`는 1.2절 3·4번대로 소스에서 새로 씁니다. `unit/tarot/tarot-notice.test.ts`, `unit/dream/dream-notice.test.ts`, `unit/lunch/lunch-notice.test.ts` 등 고지 원문 test는 원본이 부분 단언이라, 원문 목록(design 4.3절 표)을 기준으로 새로 채웁니다.

| 단위 테스트 파일 | 대응 원본 test 수 |
|---|---|
| unit/shared/crisis-phone.test.ts | 6 |
| unit/shared/crisis-signal.test.ts | 5 |
| unit/fortune/fortune-calendar.test.ts | 46 |
| unit/fortune/fortune-date.test.ts | 26 |
| unit/fortune/fortune-saju.test.ts | 40 |
| unit/fortune/fortune-reading.test.ts | 39 |
| unit/fortune/fortune-copy.test.ts | 51 |
| unit/fortune/fortune-notice.test.ts | 7 |
| unit/tarot/tarot-cards.test.ts | 4 |
| unit/tarot/tarot-copy.test.ts | 30 |
| unit/tarot/tarot-story.test.ts | 4 |
| unit/tarot/tarot-trademark.test.ts | 2 |
| unit/tarot/tarot-notice.test.ts | 2 |
| unit/dream/dream-topics.test.ts | 8 |
| unit/dream/dream-copy.test.ts | 10 |
| unit/dream/dream-notice.test.ts | 1 |
| unit/lunch/lunch-menu.test.ts | 2 |
| unit/lunch/lunch-copy.test.ts | 8 |
| unit/lunch/lunch-notice.test.ts | 3 |
| unit/api-docs/merge-openapi.test.ts | 3 |
| 합계 | 297 |

### 8.4 AC-4 판정 (T1 시점)

| 항목 | 결과 |
|---|---|
| 분류 대상 test 제목 | 676건 전부 표에 있음 (spec별 합계가 1.1절 표와 같음) |
| 미분류 | 0건 |
| 단위 이관 행의 옮길 파일 경로 | 297건 모두 `unit/<기능>/<이름>.test.ts` 형식으로 적음 (design 4.1절 목록 안의 파일만 사용) |
| spec 코드 수정·삭제 | 없음 |
| 보류 항목 | 로또 "당첨을 보장하지 않습니다" 원문 고정(dev-tasks T4-x). 대응 원본 test가 없어 이 표에는 영향 없음 |

T6 이후 각 기능의 최종 e2e 결과(실행 명령, 통과·실패, AC별 판정)는 이 문서에 기능별 절을 추가하는 방식으로 이어서 적습니다.



## 최종 판정 (T8-b)

### 실행 결과

- `pnpm e2e`(desktop 전체): 50개 통과, 0개 실패, 37.8초. 재실행 없이 한 번에 통과했고 flaky는 없었습니다.
- `pnpm e2e:mobile`: 8개 통과, 0개 실패, 7.6초. 실행된 test는 모두 `@smoke` 태그이며 fortune 2, tarot 2, dream 1, lunch 1, swagger-docs 1, lotto 1개입니다.
- 앱 버그로 보고할 항목은 없었습니다. 이번 실행에서 test 파일은 고치지 않았습니다.

### AC별 판정

| AC | 판정 | 근거 |
|---|---|---|
| AC-1 | 통과 | `e2e/` spec이 6개(dream, fortune, lotto, lunch, swagger-docs, tarot)입니다. `e2e/helpers/common.util.ts`는 spec이 아닙니다. |
| AC-2 | 통과 | fortune 15, tarot 9, dream 6, lunch 5, swagger-docs 8, lotto 7개이며 합계 50개입니다. `test(` 호출 수 기준입니다. |
| AC-3 | 통과 | `e2e/` 아래 `.ts` 전체(헬퍼 포함) 1,917줄로 2,500줄 이하입니다. |
| AC-4 | 통과 | 위 분류표 8장 집계에서 미분류가 0건입니다. |
| AC-5 | PM 판단 | 단위 테스트 소관입니다. `pnpm test` 22개 파일 352개 통과는 PM 보고 값이며 QA가 다시 실행하지 않았습니다. |
| AC-6 | PM 판단 | 고지 원문 고정은 단위 테스트 소관입니다. 로또 "당첨을 보장하지 않습니다" 원문 고정(T4-x)은 보류 상태입니다. 로또 생성기 화면의 문구는 e2e(`lotto.spec.ts` 번호 생성 test)에서 통과했습니다. |
| AC-7 | 통과 | desktop 50개 통과. |
| AC-8 | 통과 | mobile이 `@smoke` 8개만 실행하고 통과했으며, 기능당 1~2개입니다. |
| AC-9 | PM 판단 | `pnpm typecheck`, `pnpm lint`는 T8-c에서 PM이 실행합니다. |
| AC-10 | PM 판단 | `.githooks/pre-commit` 확인은 T8-c입니다. |
| AC-11 | PM 판단 | 라이선스 문서 갱신 확인은 T8-c입니다. |
| AC-12 | PM 판단 | README 코드리뷰 한 줄 확인은 T8-c입니다. |
| AC-13 | 통과 | fortune(AC-15), tarot(SEO), dream, lunch(AC-34~37), lotto(SEO) 각 1개씩 서버 HTML SEO test가 있고 통과했습니다. swagger-docs는 제외 대상입니다. |
| AC-14 | 통과 | fortune 개인정보 비저장, tarot 질문 비저장, dream 광고 차단 상태 test가 각각 있고 통과했습니다. |

### 이관된 단위 테스트

`pnpm test`는 22개 파일 352개이며 PM이 보고한 값입니다. 계산·문구·고지·소스 스캔 검증은 `unit/` 아래로 옮겨졌고, 이관 대상 파일 경로는 분류표 각 행에 적혀 있습니다.

### 알려진 차이

- lotto SEO test는 서버 HTML의 메타·h1·JSON-LD·sitemap을 확인하지만 최신 회차 페이지(`/lotto/[draw]`)는 포함하지 않습니다.
- swagger-docs는 원본 test 17건 중 일부를 합치거나 삭제해 8개가 되었습니다. 예를 들어 AC-2·3, AC-4·6, AC-11·12는 한 test로 합쳤고, 파일을 쓰는 방식의 extend test는 삭제하고 단위 테스트(`unit/api-docs/merge-openapi.test.ts`)로 옮겼습니다.
- 다른 로또 페이지 고지 누락은 `docs/lotto-notice`에서 해결됨.
- 로또 원문 고정(T4-x)은 결정 대기 상태라 AC-6의 로또 항목은 단위 테스트로 고정되지 않았습니다.
