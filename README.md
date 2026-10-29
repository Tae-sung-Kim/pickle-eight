# 운빨연구소

로또 번호 생성, 회차별 당첨 결과 조회, 번호 채점, 통계 분석, 시뮬레이터를 제공하는 Next.js 웹 애플리케이션입니다.

> **패키지 매니저**: pnpm 사용 (`pnpm install`). Node.js 24 LTS 기준입니다 (`.nvmrc`, `engines`).

## 기능

- 로또 번호 생성기 (일반 / 고급 조건 생성)
- 회차별 당첨 결과 조회, 당첨 번호 채점
- 통계 분석 (빈도, 핫/콜드, 지연 번호)
- 시뮬레이터 (다회 추첨 등수 분포)
- 나의 번호: 생성한 번호 저장, 저장 이후 추첨 회차와 자동 당첨 체크(회차별 등수) (브라우저 localStorage에 저장, 로그인 없음)
- 쿠키 동의 / 연령 확인 / 광고(AdFit) 슬롯

로또 번호는 Web Crypto(`getRandomValues`) 기반 무작위이며, AI 예측이나 당첨을 보장하지 않습니다. 자세한 내용은 [COMPLIANCE.md](COMPLIANCE.md)를 참고하세요.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Radix UI, lucide-react
- TanStack Query v5, Zustand, react-hook-form, zod
- 데이터베이스: Supabase (Postgres)
- 린트 / 포맷: Biome

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev
```

### 환경변수

| 이름                               | 설명                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`            | 사이트 이름                                                |
| `NEXT_PUBLIC_SITE_URL`             | 사이트 절대 URL                                            |
| `NEXT_PUBLIC_ADFIT_UNIT_ID`        | 카카오 AdFit 상단 배너 유닛 ID (없으면 광고 미노출)        |
| `NEXT_PUBLIC_LOTTO_MIN_LOADING_MS` | 로딩 최소 표시 시간(ms)                                    |
| `LOTTO_DELAY_MS`                   | 서버 응답 인위적 지연(ms)                                  |
| `SITEMAP_SKIP_FETCH`               | `1`이면 sitemap 생성 시 회차 목록 조회 생략                |
| `SUPABASE_URL`                     | Supabase 프로젝트 URL (서버 전용)                          |
| `SUPABASE_SERVICE_ROLE_KEY`        | Supabase service role 키 (서버 전용, 클라이언트 노출 금지) |
| `CRON_SECRET`                      | `/api/lotto/sync` 인증 비밀값                              |

### 스크립트

| 명령                          | 설명                   |
| ----------------------------- | ---------------------- |
| `pnpm dev`                    | 개발 서버              |
| `pnpm build` / `pnpm start`   | 프로덕션 빌드 / 실행   |
| `pnpm typecheck`              | TypeScript 검사        |
| `pnpm lint` / `pnpm lint:fix` | Biome 검사 / 자동 수정 |
| `pnpm format`                 | Biome 포맷             |

## 데이터베이스 (Supabase)

스키마는 [supabase/migrations/0001_lotto.sql](supabase/migrations/0001_lotto.sql)에 있습니다.

- `lotto_draws`: 회차별 당첨 정보
- `lotto_stats`: 핫/콜드 통계 캐시 (6시간 TTL)

두 테이블 모두 RLS가 켜져 있고 공개 읽기만 허용합니다. 쓰기는 서버에서 service role로만 합니다.

## 로또 데이터 동기화

사용자 요청 경로에서는 외부 로또 사이트를 직접 호출하지 않습니다. 서버 크론이 외부 데이터를 가져와 Supabase에 저장하고, API는 저장된 데이터만 제공합니다. 이는 상업적 이용 시 외부 서비스 약관 위반 소지를 줄이기 위한 설계입니다.

- `GET|POST /api/lotto/sync` : 최신 회차 1건 동기화
- `?forward` : 저장된 마지막 회차 다음부터 발행된 회차를 순서대로 동기화
- `?from=&to=` : 지정 범위 회차 동기화
- 인증: `Authorization: Bearer ${CRON_SECRET}` 또는 `x-cron-secret: ${CRON_SECRET}` 헤더 필요 (개발 환경 제외)
- 스케줄: [vercel.json](vercel.json)의 cron 설정 (토요일 추첨 이후 UTC 12:00, 16:00)

## API

| 경로                            | 설명                                                |
| ------------------------------- | --------------------------------------------------- |
| `GET /api/lotto/draws`          | `latest=1` 또는 `drwNo=` 또는 `from=&to=`           |
| `GET /api/lotto/export`         | CSV 내보내기 (`from`, `to` 선택, IP 기준 분당 제한) |
| `GET /api/lotto/stats/hot-cold` | 핫/콜드 통계                                        |
| `GET                            | POST /api/lotto/sync`                               | 크론 동기화 |

## 배포

Vercel 배포를 기준으로 합니다. 환경변수를 Vercel 프로젝트에 등록하고, 크론은 `vercel.json`을 따릅니다.

## 문서

- [COMPLIANCE.md](COMPLIANCE.md): 로또 기능 관련 준수 사항
- [DEPENDENCY_LICENSES.md](DEPENDENCY_LICENSES.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): 의존성 라이선스

## 라이선스

[LICENSE](LICENSE) 참고.
