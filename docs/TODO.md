# 추가 기능

1. QR CODE를 만들어서 입력하지 않고 바로 사진으로 가능하도록
2. 오늘 어디가? 주말어디가? 등 뭔가 이 사이트 맞는 메뉴를 계속 추가


# 나중에 확인할 일
1. readme정리 -> 계속 업데이트 필요
3. 홈 정리 -> 진행중
4. 메뉴 정리 -> 일단은 완료 나중에 더 추가 예정.
5. seo 확인 - 구글, 네이버 url관리
6. 전체적인 문구 정리
7. API 요청 제한 보강 -> 트래픽이 늘거나 CSV 내보내기 남용이 보이면 검토
   - 지금은 서버 메모리(Map)로 세서 Vercel 인스턴스끼리 공유되지 않는다 (`src/app/api/lotto/draws/route.ts`, `export/route.ts`)
   - 순서: Vercel Firewall rate limit 규칙(코드 변경 없음, 요금제 확인) -> 안 되면 Upstash Redis + `@upstash/ratelimit`
