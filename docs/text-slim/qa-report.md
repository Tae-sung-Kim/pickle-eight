# text-slim QA 보고서

- 실행일: 2026-11-27
- 입력: `docs/text-slim/plan.md`의 완료 조건
- 테스트 파일: `e2e/text-slim.spec.ts`

## 실행 명령과 결과

```
pnpm exec playwright test e2e/text-slim.spec.ts --project=desktop
```

| 프로젝트 | 통과 | 실패 | 건너뜀 |
|---|---|---|---|
| desktop | 5 | 0 | 0 |
| mobile | - | - | - (@smoke 없음, 실행 안 함) |

## AC별 결과

| AC | 내용 | desktop | mobile | 테스트 이름 |
|---|---|---|---|---|
| AC-1 | FAQ 접힘, 클릭·Enter·Space, 포커스 링 | 통과 | - | AC-1 |
| AC-2 | 12띠 표, 별자리 기간표(note 줄), 원소 설명 접기 | 통과 | - | AC-2 |
| AC-4 | HTML에 접힌 답, JSON-LD와 details 일치 | 통과 | - | AC-4 (2개) |
| AC-6 | 상시 면책·상담 5곳 접히지 않음, 360px 가로 스크롤 없음 | 통과 | - | AC-6 |
| AC-3, 5, 7 | 정적·단위 | 코드 확인 | - | - |

정적 확인: `faq.component` 구 5종 import 잔존 없음, `package.json` 변경 없음, 상수·`unit/` diff 없음, 두 공통 컴포넌트에 `use client` 없음, 토큰 외 색 없음. summary 안에 h2/h3 + p 구조이고 `min-h-11`, `focus-visible:ring`, 회전 애니메이션 없음(`group-open:rotate-180`은 transition 없음).

## 공통 검사

| 항목 | 결과 |
|---|---|
| 페이지 응답 400 미만 | goto 성공 |
| `pageerror` 없음 | AC-1에서 확인, 통과 |
| `h1` 하나 | 기존 spec 범위, 이번 변경 없음 |
| title·description 메타 | 변경 없음 |
| 빈 상태·에러 상태 화면 | 해당 없음 |

## 실패 항목

없음.

## 남은 이슈

- JS 끔 상태에서 "펼치기"는 개발 서버에서 검증 불가. 스트리밍 결과가 `hidden` 상태로 남아 어떤 요소도 보이지 않는다. 존재와 닫힘 속성만 검사. 운영 빌드(`pnpm build && start`)에서 수동 확인 필요.
- 접근성 점검: `<summary>` 안에 heading을 넣은 구조는 HTML 규격상 허용(phrasing 아님이지만 summary는 heading 허용)이며 현재 브라우저에서 heading 탐색과 토글이 모두 동작한다. 다만 스크린리더 중 일부는 summary 안 heading 의미를 약하게 읽을 수 있다. 문제 수준은 아님.
- 모바일 터치 영역 44px는 `min-h-11` 코드로만 확인.

## 2단계 QA (삭제 13건 + 접기, 2026-11-27)

승인: 삭제 D-1~D-5, D-7~D-13, D-15. 보류: D-6, D-14, D-16 (해당 문구는 그대로 남아 있음을 확인).

### 실행
- `pnpm exec vitest run`: 965개 통과.
- `pnpm exec playwright test e2e/{fortune,tarot,dream,meal,meal-location,lucky-draw,text-slim}.spec.ts --project=desktop`: 69 통과. 병렬 실행 첫 회에 lucky-draw 3건과 text-slim 1건이 실패했으나, 같은 두 spec을 다시 돌리면 29개 모두 통과. 병렬 부하로 인한 타임아웃으로 판단한다. text-slim 1건은 별도로 고쳤다(아래).
- `biome check e2e unit`: 통과.

### 테스트를 바꾼 이유 (앱 코드는 수정하지 않음)
| 파일 | 변경 | 근거 |
|---|---|---|
| `unit/dream/dream-notice.test.ts` | 상세 안내 6항 -> 2항 | D-10~D-13 |
| `unit/fortune/fortune-notice.test.ts` | 이용 안내 9항 -> 5항 | D-1~D-4 |
| `unit/fortune/fortune-copy.test.ts` | 허브 FAQ 7 -> 6, 사주 차이 FAQ 없음 확인 | D-5 |
| `unit/meal/meal-copy.test.ts` | FAQ 7 -> 6, "추천인가요" 없음 확인 | D-15 (D-14 보류라 6) |
| `unit/tarot/tarot-copy.test.ts` | 필수 질문에서 "분야를 고르면" 제거, 두 화면 모두에 없음 확인 | D-7, D-9 |
| `e2e/meal-location.spec.ts` | 비전송 한 줄(1번)은 보임, 나머지 4줄은 닫힘 상태에서 숨김, 펼치면 보임 | F-6 접기 |
| `e2e/text-slim.spec.ts` | FAQ 접힘 대상을 질문 문장으로 찾음. JSON-LD 비교에서 접기 블록 2개 제외 | 새 접기 블록이 details로 추가됨 |

### 추가한 E2E (text-slim.spec.ts)
- 2단계 AC-1~3: 사주 접기 열고 닫기, "계산 기준" 접히지 않음, 타로 읽는 법·이용 안내 접힘, 상담전화 접히지 않음, 운세 허브 접기, 이용 안내의 책임·만 14세 항목이 details 밖에서 보임(fortune AC-48), 상시 면책 보임.
- 2단계 AC-5: 삭제 문구 6개가 HTML에 없음, 꿈 상세 안내 2항은 있음.
- 2단계 AC-4 (JS 끔): 접힌 타로 읽는 법과 동네 입력 안내가 서버 HTML에 있음. JSON-LD FAQ와 화면 FAQ 일치는 기존 AC-4 테스트가 계속 검사.

### 법적 고지가 의도치 않게 줄었는가
아니오. 삭제된 문구는 모두 남는 문구와 같은 뜻이며, 상시 면책, 결과 하단 면책, 입력칸 비전송·만 14세 안내, 상담전화, 이용 동의, 책임·만 14세 항목은 유지된다. 확인한 사항:
- D-13 "제휴 관계가 없습니다"는 `DREAM_BASIS_TEXT` 안에 그대로 남아 있다(더 긴 문장의 일부).
- 접힌 문구(상담 권고 문장 등)는 삭제가 아니라 접힘이며 서버 HTML에 있다.
- 단, plan의 "그대로 보임" 목록 중 운세 이용 안내의 상담 권고(124항)는 접힌 쪽이다. 기획서 열린 질문 3에 따라 의도된 것이다.

### 남은 이슈
- JS 끔 상태의 펼침 동작은 개발 서버에서 검증 불가(1단계와 동일). 존재만 확인.
- lucky-draw 병렬 실행 타임아웃은 앱 문제가 아니라 부하 문제로 보이나, PM 전체 회귀에서 다시 나오면 알려 달라.

## 3단계 QA (로또 헤더 설명 삭제 D-1, 하단 고지 합치기 D-2~D-4+M-1, 2026-11-27)

### 실행
- `pnpm exec playwright test e2e/lotto.spec.ts e2e/result-next-links.spec.ts --project=desktop`: 12 통과.
- 기존 lotto-notice AC-1 "하단 고지 영역 안에서 보인다"(`footerNotice` 반복문, @smoke)와 result-next-links AC-4 모두 통과.

### 추가한 E2E (e2e/lotto.spec.ts, 1개)
- `/lotto/history` footer 안에 비공식 서비스, "로또 관련 모든 기능의 결과는 참고용이며 당첨을 보장하지 않습니다.", "로또 관련 기능은 만 19세 이상에게만 제공됩니다.", 합친 항목 3문구(정확성·적시성·완전성 / 투자·재정·법률 자문이 아니며 / 이용에 따른 책임은 이용자에게 있습니다)가 보인다.
- footer 항목 수 4개. "스케줄 잡(크론)", "책임 있는 이용을 권장합니다"는 footer에 없다.
- 경고 알림에 "최신 정보는 공식 채널에서 확인하세요", "책임 있는 이용을 권장합니다"가 남아 있다.
- 헤더 제목 "로또 분석실" 보임, 삭제한 설명 문장 없음.

### 법적 고지가 의도치 않게 줄었는가
아니오. 비제휴, 참고용·당첨 비보장, 만 19세, 경고 알림이 모두 유지된다. "지속성 보증 없음"만 plan(D-3)대로 빠졌다.

### 남은 이슈
- 모바일 줄바꿈, 6개 화면 전체의 19세 문구 확인은 하지 않았다(대표 1화면만).

## 4단계 (2026-11-27)

실행: `pnpm exec vitest run unit` 951개 통과. `pnpm exec playwright test e2e/lotto.spec.ts e2e/text-slim.spec.ts e2e/lucky-draw.spec.ts e2e/tarot.spec.ts e2e/meal-location.spec.ts --project=desktop` 전부 통과. 앱 결함 없음.

테스트를 바꾼 사유
- `unit/meal/meal-copy.test.ts`: MEAL_FAQ 6개에서 5개로(D-14 삭제). 삭제된 질문이 없음을 확인하는 검사 추가.
- `e2e/text-slim.spec.ts`: AC-1이 삭제된 질문(타로 원카드, 뭐 먹지 소개)을 찾던 부분을 남은 FAQ 첫 항목으로 변경. 새 테스트 1개 추가: 삭제된 FAQ 5건이 화면·HTML에 없고, 운빨 허브에 FAQ가 1개("운빨 뽑기에는 어떤 도구가 있나요?") 남아 null이 되지 않음. unit/tarot, unit/lucky-draw는 깨지지 않아 그대로 둠.
- `e2e/lotto.spec.ts`: /lotto/generator 대표 흐름 1개 추가. 성인 확인 전 FAQ 없음, 확인 뒤 접힌 질문이 보이고 클릭으로 열림, 화면 FAQ가 FAQPage JSON-LD와 일치, FAQ가 하단 고지보다 위에 있고 고지가 보임.

법적 고지 영향: 없음. 삭제된 5건은 모두 일반 FAQ이고 면책·상담전화·"보장하지 않습니다" 고지는 별도 구성요소에 그대로 있다(기존 고지 검사 통과). 다만 D-14 삭제로 뭐 먹지 FAQ의 "로그인 없이 이용" 설명과 운빨 허브의 "이름은 저장하지 않음" FAQ 답이 사라졌다. 같은 내용은 상시 고지·SEO 설명에 남아 있다.

## 5단계 (2026-11-27)

실행: `pnpm exec playwright test e2e/text-slim.spec.ts e2e/fortune.spec.ts e2e/no-son-days.spec.ts e2e/lucky-draw.spec.ts --project=desktop`. 최종 text-slim 전부 통과, fortune·no-son-days·lucky-draw 통과. 앱 결함 없음. unit은 PM 보고대로 통과로 두고 다시 돌리지 않았다.

테스트를 바꾼 사유
- `e2e/text-slim.spec.ts` 2단계 AC-1~3: 사주 "계산 기준"이 details 밖이라는 검사를, 접힌 details 제목이라는 새 상태(기본 닫힘)로 고쳤다.
- 새 테스트 6개(5단계 a~f): (a) 오늘·별자리 가이드 접힘과 서버 HTML 본문, (b) 사주 "계산 기준 보기" 링크는 접힌 블록 밖에 보이고 누르면 열리며 제목으로 이동, 두 번 눌러도 열린 채 유지, (c) 손 없는 날 규칙·달력 접힘, 월별 목록과 음력 출처 한 줄 보임, 달력 열면 달 이동 버튼 렌더, (d) 뽑기 3화면 "이용 안내 더 보기" 접힘과 "이렇게 이용합니다" 보임, (e) 궁합 "띠 궁합이란"·"등급 규칙" 접힘, note 첫 문장 보임, 열면 표 보임, (f) 입력 미저장 안내와 궁합 상단 면책이 details 밖에서 보임, 이용 동의 화면 details 밖, 320px 가로 스크롤 없음.
- (f)는 처음에 운세 일반 면책과 상담전화 목록을 궁합 입력 화면에서 찾아 실패했다. 테스트 오류였다(궁합은 자체 면책을 쓰고 상담전화 목록은 결과 화면에 있다). 궁합 면책으로 바꾸고 상담전화 검사는 뺐다(상담전화는 기존 AC-6이 검사).

법적 고지 영향: 없음. 상시 면책, 입력 안내, 동의 화면은 접히지 않고 보인다. 사주 계산 기준은 서버 HTML에 남고 입력 단계 링크가 연다. 손 없는 날 음력 출처는 블록 밖에 보인다.

남은 이슈: 사주 계산 기준의 서머타임 문장은 접힘 안이다(plan 결정대로). JS를 끈 사주·손 없는 날 AC-5의 `toBeAttached` 전용 테스트는 만들지 않았고 (a)의 `page.content()` 검사로 대표했다.
