# 로또 기능 리팩토링

진행 규칙: 계획을 세워서 사용자와 소통한 뒤 모든 결정을 내린다. 기능 판단, 불필요한 기능 삭제 판단 등
혼자 판단하지 않고 서로 의견을 조율해서 정한다.

표기: `[x]` 완료, `[ ]` 남은 일, `(결정 필요)` 사용자와 먼저 상의할 것, `R1`~`R8` 남은 목록 번호 ("R3 진행해줘"처럼 말하면 된다)

---

## 남은 목록 (다음 작업 후보)

- [ ] **R1.** QR 코드 스캔 (번호채점기, 나의 번호) - 용지 QR을 카메라로 읽어 번호 입력
  - 실제 용지 QR 샘플로 형식 검증이 필요하다. 카메라 권한, 스캔 라이브러리 선택도 상의한다.
- [ ] **R2.** 통계/패턴분석 전체 기능 점검 (결정 필요)
  - `analysis/components/hot-cold-tracker.component.tsx`(약 370줄) 분해
  - 핫/콜드 구간(recentWindow)을 요청 파라미터로 받기. 지금은 서버 캐시 때문에 50 고정이다.
- [ ] **R3.** 시뮬레이터 전체 리팩토링 (결정 필요)
  - `simulator/components/root.component.tsx`(약 260줄) 분해
  - `generateRandomDraw`가 만드는 draw 객체의 0 값 필드 중복 정리
- [ ] **R4.** `utils/lotto.util.ts`(400줄 이상) 분리 - CSV, clamp, 통계, 생성기가 한 파일에 섞여 있다.
- [ ] **R5.** 나의 번호 개선 방향 논의 (결정 필요)
  - 저장소가 `localStorage`뿐이라 브라우저 데이터를 지우면 번호가 사라진다. 서버/계정 저장을 할지?
  - 나의 번호 목록도 2단으로 할지? 카드 안에 결과와 버튼이 있어서 이번에는 제외했다.
- [x] **R6.** 브라우저에서 직접 확인 - 완료 (Playwright + Chrome, PC 1280px / 모바일 390px). 남은 캐시 갱신 확인은 R8로 옮겼다.
  - 확인함: 생성기 게임 수 입력(최대 20 제한), 고급 옵션 펼침, 2단 결과, 헤더 '준비 중' 배지, 모든 `/lotto/*` 열림
  - 확인함: 채점 후 '전체 저장' → 나의 번호에 표시, 핫/콜드 범위 모드 결과가 직접 센 값과 같음, 핫/콜드 API 값의 정합성
  - 확인함, 고침: 모바일의 "게임", "생성된 번호" 세로 쪼개짐 / 페이지 제목이 글자 중간에서 끊김(`break-keep`)
  - 확인 방법은 아래 "브라우저 확인 환경" 참고
- [ ] **R7.** SEO 나머지 - 구글, 네이버 URL 관리 (`docs/TODO.md`의 SEO 확인 항목)
- [ ] **R8.** DB 수정이 필요한 작업 - 제일 나중에 한다. 지금은 있는 데이터로만 진행한다. (결정 필요)
  - 핫/콜드 캐시 갱신 확인: `lotto_stats`의 `last_computed_draw_no`를 낮춘 뒤 API를 호출해 다시 계산되는지 본다.
    - `.env`의 Supabase 주소가 하나뿐이고 `NEXT_PUBLIC_SITE_URL`이 운영 도메인이라 운영 DB일 가능성이 높다. 개발용 DB를 따로 둘지, 다음 회차 동기화 때 확인할지, 운영 DB를 직접 고칠지 정해야 한다.
  - 최신 회차 누락 점검: 2026-11-02 기준 DB 최신이 1247회(10-24)이고 10-31 추첨분(1248회)이 없다. 동기화 크론(`vercel.json`, 토요일)이 안 돌았거나 실패한 것으로 보인다.
  - 운영 배포 설정 확인: Vercel의 Production Branch, `CRON_SECRET`, Cron 실행 로그

---

## 1. 로또 번호 생성기 (일반 + 고급 통합)

- 경로: `features/lotto/generator` (페이지는 `app/lotto/generator`)
- [x] 난수 소스: `crypto.getRandomValues` + 거부 샘플링 유지. 더 나은 방식은 없다고 판단했다.
  - 어느 방식이든 당첨 확률은 같다. 차이는 예측 가능성과 화면 설명의 일관성뿐이다.
- [x] 3개 기능(일반, 고급, 시뮬레이터)이 공용 난수 함수를 쓰도록 통일: `src/lib/random.ts`
  - 난수를 1,024개씩 미리 받아 쓰는 버퍼로 속도를 `Math.random` 수준으로 맞췄다. (Node에서 20,000회 약 5ms)
- [x] 게임 수: 슬라이더 + 숫자 입력, 최대 20 (`LOTTO_MAX_GAMES`). 기본값은 5게임(용지 1장).
- [x] 일반/고급 생성기를 한 페이지로 통합. '고급 옵션 사용' 스위치를 켜면 필터와 가중치가 펼쳐진다.
  - 꺼져 있으면 조건 없는 무작위 생성, 켜면 합계·연속·홀짝·구간·고정/제외 번호·가중치를 적용한다.
  - 고급 옵션 기본값은 합계 100~200, 연속 최대 2 (예전 고급 생성기 기본값).
  - 고급에 있던 최대 50게임은 20으로 줄었다.
- [x] URL: `/lotto/generator`. 옛 `/lotto/normal-generator`, `/lotto/advanced-generator`는 308 리다이렉트 (`next.config.ts`).
- [x] 메뉴는 '번호 생성기' 한 항목으로 합쳤다 (`constants/menu.constant.ts`).
- [x] 핫/콜드 가중치는 유지하고 "당첨 확률은 달라지지 않으며 재미로 참고하는 기능" 안내를 항상 표시한다.
  - 문구 위치: `generator/components/weighting-controls.component.tsx`
- [x] 결과 목록 2단 배치 (1024px 이상). 공유하기 이미지도 2단으로 캡처된다.

## 2. 회차별 히스토리

- 경로: `features/lotto/history`
- [x] 페이지 유지 결정. 삭제하지 않는다.
- [x] 목록의 각 회차를 `/lotto/[draw]` 상세 페이지로 링크.
- [ ] 이 이상의 추가 기능은 정한 것이 없다. 필요해지면 상의한다.

## 3. 번호채점기

- 경로: `features/lotto/check`
- [x] 유지 결정. 역할은 "한 번 확인하는 용도"로 정리한다.
- [x] 채점 결과 아래에 '전체 저장'(나의 번호에 저장) 버튼 추가. `shared/components/save-numbers-button.component.tsx` 재사용.
- [x] 채점 결과 목록 2단 배치 (768px 이상).
- [x] 버그 수정: 최신 회차가 늦게 도착하면 `reset()`이 폼 전체를 비워서 그 사이 입력한 번호가 지워졌다. 이제 회차 칸만 채운다 (`check/components/root.component.tsx`).
- [ ] QR 스캔 → R1

## 4. 나의 번호

- 경로: `features/lotto/my-numbers`
- [x] 유지 결정. 저장 목록과 자동 채점만 맡는다. 이번에는 코드 변경이 없다.
- [ ] QR 스캔 → R1
- [ ] 개선 방향 → R5

## 5. 통계/패턴분석

- 경로: `features/lotto/analysis`
- [x] 핫/콜드 정확도 수정 (이번 범위는 핫/콜드만)
  - 서버와 클라이언트가 `utils/hot-cold.util.ts`의 `computeHotCold` 하나를 쓴다.
  - 서버 캐시(`api/lotto/stats/hot-cold/route.ts`)는 TTL이 아니라 `last_computed_draw_no`와 최신 회차를 비교해서 갱신한다.
  - 범위 모드에서 '한 번도 안 나온 번호'와 '가장 오래된 회차에만 나온 번호'가 같은 값이 되던 버그, 구간 길이 1회 오차를 고쳤다.
  - 미출현 기간 정의: `구간 끝 회차 - 마지막 출현 회차`, 구간에서 한 번도 안 나왔으면 구간 길이.
- [x] 범위 모드 결과를 `e2e`에서 독립적으로 직접 센 값(최근 100회)과 비교해 일치함을 확인했다.
- [ ] 새 회차 저장 뒤 캐시 갱신 확인 → R8
- [ ] 전체 기능 점검 → R2

## 6. 로또 고급번호 생성기

- [x] 1번 생성기에 통합됐다. 별도 페이지와 폴더는 없다.
- [x] 난수 통일, 핫/콜드 가중치 안내 문구 → 1번 항목 참고

## 7. 로또 시뮬레이터

- 경로: `features/lotto/simulator/components`
- [x] 난수만 공용 crypto로 교체. 결과 목록은 이미 2단이다.
- [ ] 전체 리팩토링 → R3

---

## 함께 정리된 것 (참고)

- [x] `app/lotto/*`의 feature 코드를 `features/lotto/*`로 이동했다. page는 얇게 두고 조립만 한다.
- [x] 사이트명이 제목에 두 번 붙던 문제 수정 (`lib/seo.ts`의 `buildMetadata`, 일부 페이지의 직접 붙인 사이트명). 사이트명은 루트 레이아웃 `title.template`이 한 번만 붙인다.
- [x] 사용하지 않는 함수 삭제 (`lib/date.ts`에는 `getKoreaTime`만 남김, `lib/cache.ts` 삭제).
- [x] 헤더(PC, 모바일)와 홈에 '준비 중' 배지 추가. 공용 컴포넌트 `components/common/coming-soon-badge.component.tsx`. `MENU_LIST`의 `comingSoon: true`만 보고 자동으로 붙는다.
- [x] 환경변수 오타 수정: `age-gate.provider.tsx`의 `NEXT_PUBLIC_SITE_EGN_NAME` → `ENG`.
- [x] `next.config.ts`에 `agentRules: false`를 넣어 `next dev`가 `AGENTS.md`를 자동 생성하지 않게 했다.

## 브라우저 확인 환경

- Playwright MCP: `.mcp.json`에 등록했다. 새 세션부터 Claude가 브라우저를 직접 조작해 확인할 수 있다 (처음에 승인 필요).
- 스모크/흐름 테스트: `e2e/lotto.smoke.spec.ts`, `e2e/lotto.flow.spec.ts`. 설치된 Chrome을 쓰고 브라우저를 따로 받지 않는다.
- 실행: `pnpm e2e`(PC 폭만), `pnpm e2e:mobile`(모바일 폭), `pnpm e2e:all`(둘 다)
- 요청 제한 주의: `/api/lotto/draws`는 IP당 1분 60회로 제한된다. 연달아 여러 번 돌리면 429로 실패하니, 한 번 돌린 뒤 1분 이상 쉬고 다시 돌린다.
- 개발 모드에서는 성인 확인 창이 매번 뜨고(테스트가 자동으로 통과), 모바일에서는 쿠키 배너가 아래를 덮는다(테스트가 '거부'로 닫는다).
- `핫/콜드 API` 테스트는 DB(Supabase)에 연결된 환경에서만 통과한다.
