# 꿈 해몽 법적 문구 초안 (T-16, T-17)

상태: 초안. 사용자 승인 전이며 src/ 와 COMPLIANCE.md 는 아직 고치지 않았다.
근거: plan 법적·정책 요구사항(254~286행), AC-31, AC-32, design 1장 20번, 18 F6. 현재 `src/app/privacy/page.tsx`(시행일 2026-11-16), `src/app/terms/page.tsx`(시행일 2026-11-05), `COMPLIANCE.md` 1장과 11장.

이 문서는 법률 판단이 아니다. 법률 검토가 필요한 항목은 4장에 따로 모았다.

## 1. 개인정보처리방침

### 판단: 변경 필요 (한 곳)

근거
- 꿈 해몽은 개인정보를 받지 않고 검색어도 서버, 저장소, 분석에 보내지 않으므로 실질 수집 항목은 없다. 그래서 수집 항목 목록(1장 목록)과 브라우저 저장소 목록(2장), 외부 서비스(6장)는 바꾸지 않는다.
- 그래도 항목을 넣는 것이 맞다. 이유는 세 가지다. (a) 기존 타로·운세가 같은 이유로 1장에 서비스별 문단을 두었으므로 형식이 같아야 한다. (b) 검색칸에 개인적인 내용이 적힐 수 있어 "보내지도 저장하지도 않는다"는 명시가 이용자에게 의미가 있다. (c) plan AC-31과 design 18 F6이 항목 추가를 요구한다.
- 기존 Vercel Web Analytics 문구(6장)는 "페이지 조회 수 등 집계 정보"를 설명하며, 1장 방문 통계 항목은 "페이지 조회, 유입 경로"를 이미 적고 있다. 꿈 해몽 상세 주소(`/dream/<소재>`)가 조회 대상에 포함되는 것은 기존 설명 범위 안이다. 그래서 이 문구는 바꾸지 않는다(design 1장 20번과 같은 결론). 다만 소재 이름이 주소에 들어가므로 "어떤 소재 페이지를 봤는지"가 집계될 수 있다는 점은 4장 법률 검토 항목에 올린다.

### 위치: 1장 "수집 항목 및 방법" 맨 끝

현재 마지막 문단은 운세 문단("운세 서비스에서 입력한 생년월일과 ... 사라집니다.")이다. 그 뒤에 새 문단 하나를 추가한다. 장 번호는 바뀌지 않는다.

### 추가 문구

```
꿈 해몽 서비스에는 입력받는 개인정보가 없습니다. 소재를 찾기 위해 검색칸에
적은 글자는 이 기기의 화면 안에서만 사용하며, 서버로 전송하거나 저장하지
않고 방문 통계에도 포함하지 않습니다. 브라우저 저장소(localStorage,
sessionStorage)에도 아무 값을 남기지 않습니다. 검색칸에는 개인적인 내용을
적지 않으시기 바랍니다.
```

### 부수 변경
- `EFFECTIVE_DATE`를 배포일로 갱신한다. 날짜는 사용자 결정 사항이다(질문 3).
- 2장 브라우저 저장소 목록, 3장 이용 목적, 6장 외부 서비스는 변경하지 않는다.
- 10장 어린이: 운세만 만 14세 이상 제한이 있다. 꿈 해몽은 입력이 없어 연령 게이트를 두지 않는 것이 기본안이다(plan 열린 질문 12). 그렇다면 10장은 바꾸지 않는다. 연령 제한을 두기로 하면 10장 수정이 추가로 필요하다.

## 2. 이용약관

### 판단: 변경 필요 (두 곳, 장 번호 조정 필요)

타로는 6장, 운세는 7장에 독립 조항이 있고 1장 서비스 개요에도 한 문장씩 있다. 꿈 해몽도 같은 형식으로 간다.

### 2-1. 1장 "서비스 개요" 끝에 문단 추가 (장 번호 변경 없음)

현재 마지막 문단: "또한 본 서비스는 오늘의 운세, 띠별 운세, 별자리 운세, 사주 등 운세 기능을 오락과 참고 목적으로 제공합니다."

추가 문구
```
또한 본 서비스는 꿈 속 소재를 검색하고 민간에서 전해 온 풀이를 읽어 볼 수
있는 꿈 해몽 기능을 오락과 자기 성찰 목적으로 제공합니다.
```

### 2-2. 새 조항 "꿈 해몽 서비스" 추가

위치: 7장 "운세 서비스"와 8장 "광고 및 쿠키" 사이. 새 조항이 8장이 되므로 기존 8~17장이 9~18장으로 한 칸씩 밀린다. 대안은 7장 안에 문단을 덧붙이는 것이지만, 운세와 꿈 해몽은 이용 동의 절차와 대상 연령이 달라 한 조항에 섞으면 읽기 어렵다. 권장안은 새 장 추가다(질문 1).

장 번호가 밀리면 확인할 곳
- 약관 본문 안에서 다른 장을 번호로 가리키는 문구는 현재 없다(「개인정보처리방침을 따릅니다」처럼 문서 이름만 쓴다).
- `COMPLIANCE.md` 11장 운세 항목의 "existing full-liability wording in the Terms (chapter 11)"는 12장으로, "the age gap in Terms chapter 2"는 그대로 2장이다. 11장 문구만 고쳐야 한다. 이것은 T-17에서 PM이 같이 고친다.
- `docs/fortune/`, `docs/tarot/`, e2e 파일에 약관 장 번호를 쓰는 곳이 있는지는 구현 전에 `Terms` `chapter` 문자열로 검색해 확인한다.

현재 문구 → 변경 문구 (제목 번호만)

| 현재 | 변경 |
|---|---|
| 8. 광고 및 쿠키 | 9. 광고 및 쿠키 |
| 9. 금지 행위 | 10. 금지 행위 |
| 10. 지식재산권 | 11. 지식재산권 |
| 11. 책임 제한 및 제3자 서비스 | 12. 책임 제한 및 제3자 서비스 |
| 12. 면책 및 보상 | 13. 면책 및 보상 |
| 13. 서비스 변경 및 중단 | 14. 서비스 변경 및 중단 |
| 14. 약관 변경 | 15. 약관 변경 |
| 15. 준거법 및 분쟁 해결 | 16. 준거법 및 분쟁 해결 |
| 16. 분리가능성 | 17. 분리가능성 |
| 17. 문의 | 18. 문의 |

추가 문구 (8. 꿈 해몽 서비스)
```
8. 꿈 해몽 서비스

꿈 해몽 서비스는 오락과 자기 성찰을 목적으로 제공됩니다. 풀이는 민간에서
전해 온 해몽 관념을 바탕으로 이 서비스가 새로 작성한 문장이며, 과학적으로
입증된 해석이 아닙니다. 꿈의 내용이 현실의 일을 예측하거나 보장하지 않으며,
의학·법률·재정 등 전문적인 판단을 대신할 수 없습니다. 풀이를 따르는 판단과
선택은 이용자 본인의 몫이므로, 중요한 결정은 풀이에 의존하지 마시고 전문가와
상담하시기 바랍니다.

꿈이 자주 반복되어 잠이나 일상생활이 힘들거나 마음이 많이 힘들다면 혼자
견디지 마시고 수면 또는 정신건강 전문가나 서비스에 안내된 상담 기관에
이야기해 보시기 바랍니다. 본 서비스는 특정 해몽서나 사이트, 단체와 제휴·후원
관계가 없습니다. 꿈 해몽 서비스는 로또 등 복권 기능과 연결되어 있지 않으며,
꿈의 내용이 당첨이나 번호와 관련이 있다고 안내하지 않습니다. 검색칸에 입력한
글자는 서버로 전송되거나 저장되지 않으며, 자세한 내용은 개인정보처리방침을
따릅니다.
```

문구 메모
- 기존 타로 6장과 같은 합니다체, 같은 구성(목적, 예측 아님, 전문가 상담, 제휴 없음, 저장 관련)이다. 운세 7장의 이용 동의, 연령, 생년월일 범위 문단은 꿈 해몽에 해당하지 않아 넣지 않았다.
- 죽음 소재 보충문과 소재별 반복 꿈 안내는 화면 문구이며 약관에 넣지 않는다.
- "상담 안내"는 약관에서는 전문가 상담 권유와 상담 기관 안내 두 가지로만 쓴다. 번호는 약관에 적지 않는다. 번호가 바뀌면 약관까지 고쳐야 하므로, 번호는 화면 상수와 COMPLIANCE에만 둔다(질문 2).

## 3. COMPLIANCE.md

### 판단: 변경 필요 (11장 + 1장 한 줄 + 날짜). PM이 직접 반영한다

### 3-1. 11장에 꿈 항목 추가

위치: 11장 Fortune 항목(마지막 줄 "No legal review has been obtained for the fortune feature..." 로 끝나는 블록) 바로 뒤, 문서 맨 아래 "All items above should be reviewed..." 문장 앞. 이 문서가 영어이므로 같은 언어로 쓴다.

추가 문구
```
- Dream interpretation (`/dream`, `/dream/<slug>`):
  - Entertainment/self-reflection notice shown directly under the h1 on the hub and every detail page (always visible, never collapsed), plus a short notice below the content. Wording is fixed in the dream feature constants (see `docs/dream/plan.md`, legal section). Wording is not presented as prediction or guarantee; the notice states that readings are folk interpretations, not scientifically proven, and that decisions are the user's own.
  - No input is collected. The search text is kept in React state only: never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events or console output. No new browser storage key is added. Site-wide Vercel Web Analytics records page paths only (a detail page path includes the topic slug); this is covered by the existing Privacy Policy wording.
  - Lotto separation policy: the dream feature is not linked to lotto. No lucky numbers, no "winning dream" wording, no links to `/lotto/*`, and no lotto-related terms in copy or metadata. This is checked by the copy-rule string checks (AC-17, AC-18, AC-26).
  - Crisis guidance: the same five hotlines as tarot and fortune (shared constants in `src/constants/crisis-phone.constant.ts`) are shown at the bottom of the hub and every detail page. Crisis wording typed in the search box is detected in the browser only (`src/lib/crisis-signal.ts`) and is never reported anywhere. Death-related topics carry an extra note that the dream does not mean an actual death. Re-verify every number and operating hour before release. Last verified: (fill in at release).
  - Content source policy: all interpretation sentences are original text written for this service, based on widely shared folk interpretation notions. No sentences are copied, translated or reordered from classical texts, other sites or modern dream books; classical texts and the National Library of Korea digital materials are not quoted; topic name lists were used as reference only and not transferred wholesale. No external images, stock images or external icon sets. No ranking or user-count claims. Authorship log and similarity check: `docs/dream/copy-log.md`.
  - Non-affiliation: no affiliation with any dream-interpretation book, site or organization.
  - No paid or credit features. Revenue is AdFit display ads only (4 or fewer per page); ads never gate or cover content. AdFit may screen "dream interpretation" content as gambling-related; confirm before release.
  - No legal review has been obtained for the dream feature; the operator accepts the risk (default plan, to be confirmed by the owner). Accepted-risk items: ownership of AI-written copy, wording of the notices, copyright status of topic name lists, the Terms and Privacy Policy wording for the dream feature. Non-legal pre-release checks remain: crisis hotline numbers and hours, AdFit screening, final notice wording, forbidden-wording string checks, lotto-related bill status (reported October 2025, passage unconfirmed).
```

### 3-2. 1장 Cookies, Consent, Privacy 에 한 줄 추가

위치: 1장 Fortune 항목(14행) 뒤.
```
  - Dream (`/dream/*`): works regardless of cookie consent state. The only input is the topic search text, kept in React state only (never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events). No browser storage key is used. Crisis wording detection runs in the browser only and is never reported anywhere.
```

### 3-3. 그 밖의 갱신
- 문서 맨 위 `Last updated` 날짜를 반영일로 바꾼다.
- 7장 Robots and SEO 에 "Dream: hub and detail pages are indexable and listed in the sitemap once released" 취지의 한 줄 추가는 선택이다(sitemap 반영 여부는 T-06 결과에 따른다).
- 운세 항목의 "Terms (chapter 11)"는 2-2에 따라 "chapter 12"로 고친다. 장 번호를 밀지 않기로 하면 고치지 않는다.

## 4. 법률 검토 필요 항목 (판단하지 않고 모음)

기본안은 법률 검토를 받지 않고 운영자가 위험을 수용하는 것이다(plan 286행). 아래는 수용 여부를 사용자가 확인해야 할 항목이다.

1. 처리방침: 소재 이름이 주소에 들어가는 상세 페이지 조회가 방문 통계에 집계되는 것이 "개인정보 아님"으로 충분히 설명되는지. 현재 문구는 "집계 정보"로만 쓴다.
2. 처리방침 4장 처리의 법적 근거(기존 운세 때 수용한 항목과 동일)가 꿈 해몽에도 그대로 적용되는지.
3. 약관 12장(기존 11장) 책임 제한 문구가 꿈 해몽 풀이에 대한 책임 배제로 충분한지(전부 면책 문구의 유효성).
4. "소재 이름 목록"을 참고한 것의 저작권 판단(plan 279행).
5. AI가 작성한 풀이 문구의 권리 귀속.
6. 정신건강·위기 관련 안내 문구가 "의료 조언"으로 해석될 가능성. 이 서비스는 상담 기관 번호만 안내하고 진단이나 치료를 말하지 않는다.
7. 로또 관련 개정안(2025년 10월 발의 보도)의 통과 여부와 꿈 해몽이 로또와 연결되지 않는 점의 충분성.
8. 상담 번호(109, 1577-0199, 1588-9191, 1388, 1366)와 운영 시간. 법률 항목은 아니지만 출시 전 재확인 목록에 넣는다.

## 5. 변경이 필요한 파일

| 파일 | 변경 | 담당 |
|---|---|---|
| `src/app/privacy/page.tsx` | 1장 끝에 문단 1개, 시행일 갱신 | frontend-dev (T-16) |
| `src/app/terms/page.tsx` | 1장 문단 1개, 새 8장 추가, 기존 8~17장 번호 +1, 시행일 갱신 | frontend-dev (T-16) |
| `COMPLIANCE.md` | 11장 꿈 항목, 1장 한 줄, 날짜, 운세 항목의 약관 장 번호 | PM (T-17) |

변경하지 않는 파일: `README.md`, `DEPENDENCY_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `next.config.ts`(T-17 결론과 같다).
