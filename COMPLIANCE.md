# Compliance Checklist (Production)

Last updated: 2026-11-23

This document summarizes legal/commercial and operational compliance items for Pickle-eight prior to production deployment.

## 1) Cookies, Consent, Privacy

- State: Implemented.
  - Global `ConsentProvider` manages `unknown | accepted | declined` with persistence in `localStorage`.
  - Analytics/ads scripts run only when consent is `accepted`.
  - `CookieSettingsButton` in footer allows reopening consent banner.
  - Dream (`/dream/*`): works regardless of cookie consent state. The only input is the topic search text, kept in React state only (never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events). No browser storage key is used. Crisis wording detection runs in the browser only and is never reported anywhere.
  - What-to-eat, 뭐 먹지 (`/meal`; the old `/lunch/today` and `/lunch` redirect permanently with 301): works regardless of cookie consent state. No input is collected. The selected meal, filters and the draw result are kept in React state only (never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events). No browser storage key is used and no location permission is requested. The map links open Kakao Map, Naver Map and Google Maps in a new tab with the menu name as the only query.
  - Tarot (`/tarot/*`): works regardless of consent state. The optional question text is kept in React state only (never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events). The only value stored is today's card in one localStorage key (`<site>_tarot_daily_v1`: date, card number, orientation); stale or corrupted values are deleted on the next visit. Crisis/expert-topic keyword detection runs in the browser only and is never reported anywhere.
  - Fortune (`/fortune/*`): works regardless of cookie consent state. Birth date/time input is kept in React state only (never sent to a server, never stored in localStorage, cookies or URLs, never included in analytics/alert events). The only stored value is the fortune use-consent flag in one sessionStorage key (`<site>_fortune_consent_v1`: version and agreed-at time), which disappears when the browser tab/session ends. Fortune content (copy pools, calendar tables) is loaded only after the user agrees; the hub (`/fortune`) and the server-rendered guide/FAQ/notices are not gated.
- Actions:
  - Confirm Privacy Policy and Terms list third parties (Firebase, analytics, ad networks if used) and data usage.
  - Provide contact email and effective date.

## 2) Age Gate (Lottery)

- State: Implemented.
  - AgeGate shows on `/lotto/*` routes. Verification is kept in sessionStorage (`<site>_age_gate_verified_sess_v1`) per `src/providers/age-gate.provider.tsx`; there is no 30-day TTL in the current code.
  - Mode is controlled by `NEXT_PUBLIC_AGE_GATE_MODE` (`always | session | ttl`). When unset, development defaults to `always` and other environments to `session`.
  - Fortune (`/fortune/*`) does not use AgeGate. It uses its own use-consent gate with a minimum age of 14 (see section 11).
- Actions:
  - Verify copy and jurisdictional messaging where applicable.

## 3) Data Source and Sync (Lotto)

- State: Implemented per design.
  - External API not called on user routes. Server cron syncs via `POST /api/lotto/sync` (requires `x-cron-secret`).
  - Data stored in Firestore `lotto_draws`. Read via internal API `/api/lotto/draws`.
- Scheduling (Preference B):
  - Sat 21:30 KST, Sun 03:00 KST (backup) via Vercel Cron.
- Actions:
  - Review upstream TOS and robots rules periodically.
  - Maintain rate limiting/backoff for sync and export APIs.

## 4) Advertising and Monetization

- State: Implemented.
  - Reward ads and display ads are supported; credit system issues rewards only on completed views and only with user consent.
  - Error states must be surfaced when ads are unavailable or pending approval.
  - Ad labels displayed consistently.
- `ads.txt`:
  - Ensure only active networks (e.g., the ones currently enabled in the product) and correct publisher IDs are listed.
- Actions:
  - Upon any network approval changes, update UI copy and `ads.txt` accordingly.

## 5) Analytics and Telemetry

- State: Implemented and consent-gated.
  - `AnalyticsClientComponent` runs only when consent is `accepted`.
  - Telegram notification is also consent-gated.
- Actions:
  - Confirm anonymization and retention settings match policy.

## 6) Security Headers and CSP

- State: Implemented.
  - `Content-Security-Policy` set in `next.config.ts`.
  - `Reporting-Endpoints` and `Content-Security-Policy-Report-Only` added; reports handled at `/api/csp-report`.
- Actions:
  - Monitor CSP reports for a few days and tighten domains (reduce wildcards).
  - Consider adding `report-to` JSON structure if needed by older UAs.

## 7) Robots and SEO

- State: Implemented.
  - Programmatic robots via `src/app/robots.ts` with rules:
    - Allow: `/`
    - Disallow: `/api/`, `/api/lotto/sync`
  - Sitemap and host emitted from `NEXT_PUBLIC_SITE_URL`.
- Actions:
  - Remove `public/robots.txt` to avoid confusion; `robots.ts` is source of truth.
  - Confirm JSON-LD (WebSite, BreadcrumbList, ItemList) on major pages.
  - Fortune: the hub and the three feature pages are indexable (no `noindex`) and listed in the sitemap once the menu group is released (`comingSoon` removed). The fortune copy itself is not in the server HTML (it is loaded after consent); the server HTML has the guide, FAQ, notices and calculation basis. `/fortune/saju` is published with the menu release (indexable, in the sitemap).

## 8) Licenses and Notices

- State: Implemented.
  - Project license: MIT (`LICENSE`).
  - Third-party notices: `THIRD_PARTY_NOTICES.md`.
  - Dependency summary: `DEPENDENCY_LICENSES.md` (+ instructions to regenerate full report).
- Actions:
  - For Apache-2.0 deps (Firebase SDKs), include NOTICE obligations if redistributing.

## 9) Environment Variables

- Required:
  - `NEXT_PUBLIC_SITE_URL`
  - `DEVICE_COOKIE_SECRET` (prod required; used by middleware rate-limit/AID)
  - `CRON_SECRET` (for `/api/lotto/sync`)
  - Firebase config vars (client + Admin SDK)
- Optional:
  - `NEXT_PUBLIC_ADFIT_UNIT_ID` or other ad network keys
  - `NEXT_PUBLIC_CREDIT_*` (policy tuning)
  - `LOTTO_DELAY_MS` (artificial delay for `/api/lotto/draws`)

## 10) Operational Runbook

- Monitoring:
  - Enable CSP reporting dashboard (logs from `/api/csp-report`).
  - Track cron success and sync counts.
- Backups:
  - Keep Firestore export scripts/plan (if required).

## 11) Disclaimers

- Non-affiliation notice for lottery organizations.
- Responsible use guidance and age restrictions stated on relevant pages.
- Tarot (`/tarot/daily`, `/tarot/three-card`):
  - Entertainment/self-reflection notice shown directly under the h1 on every tarot page (always visible, never collapsed) and a short notice below the result area. Wording: "본 타로 서비스는 오락 및 엔터테인먼트 목적으로 제공되며, 전문적인 법률·의학·재정적 조언을 대신할 수 없습니다."
  - Results are not presented as predictions or guarantees. Forbidden phrasing (guarantee/accuracy claims, deterministic future statements, trademark names of third-party decks) is listed in `src/features/tarot/constants/tarot-copy-rule.constant.ts` and checked by `e2e/tarot-copy.spec.ts`.
  - Non-affiliation: no affiliation with any tarot deck publisher or author. Card artwork is original (inline SVG, no external deck images or icon sets); interpretation text is original (authorship log: `docs/tarot/copy-log.md`).
  - Crisis guidance: five counseling hotlines are always displayed in the result area: suicide prevention 109, mental health crisis 1577-0199, Korea Lifeline 1588-9191 (national representative number), youth 1388, women's emergency 1366 (all stated as 24h). When crisis wording is detected in the question, 109, 1577-0199 and 1588-9191 are shown before the result. Re-verify every number and operating hour before release. Last verified: 2026-11-05 (web search only); re-confirmed by the project owner on 2026-11-06 and 2026-11-16.
  - No server-side storage of tarot input; only today's card (date, card number, orientation) is stored in the browser and is deleted on the next visit after the day changes.
  - No paid or credit features. Revenue is AdFit display ads only; ads never gate results.
  - Topic selection (v2): the chosen topic only changes which original reading sentences are shown; the card draw is random and independent of the topic. The topic notice states this directly under the topic chips on both tarot pages.
  - Question input (v2): text typed in the question field is not used for card selection or interpretation; it is used only to check whether crisis guidance is needed. It is not sent to a server or stored.
  - Three-card story (v2): the flow story is original text that links the three card meanings, shown as a reference only and never as a prediction or guarantee. A fixed notice is shown below the story (`TAROT_STORY_NOTICE`, allowed as an exception sentence in `tarot-copy-rule.constant.ts`). The word "상담" is not used in the three-card h1, description or intro.
  - No legal review has been obtained for tarot content (accepted risk, see `docs/tarot/plan.md`).
- Fortune (`/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`, `/fortune/saju`):
  - Saju (`/fortune/saju`): the calculation basis (late-night hour rule, 23:00 start, no daylight-saving or standard-time correction, supported range 1920-01-01 to 2028-12-31) is shown in the server HTML and linked from the input steps; the daylight-saving/standard-time notice is shown for the affected years. Birth date and time stay in browser memory only. Wording: `src/features/fortune/constants/fortune-saju-notice.constant.ts`. Copy review of the saju pools is batched before release (`docs/fortune/copy-log.md`).
  - Entertainment/self-reflection notice shown near the top of every fortune page and a short notice below the result area. Wording is fixed in `src/features/fortune/constants/fortune-notice.constant.ts`.
  - Results are not presented as predictions or guarantees. Forbidden phrasing (guarantee/accuracy claims, deterministic future statements, health/medical terms, third-party service names) and the rule for the word "사주" (allowed only in whitelisted sentences, with its gloss on first mention) live in `src/features/fortune/constants/fortune-copy-rule.constant.ts` and are checked by `e2e/fortune-copy.spec.ts`.
  - Lotto link: lucky numbers (1 to 10, one or two) may link to the lotto generator (`/lotto/generator`, no query). The notice states there is no relation to winning and no change in probability.
  - Use-consent gate: users must agree before any fortune content is shown; without agreement the service is not provided. Users under 14 are blocked; users 14 and over see a responsibility notice. Supported birth dates are 1920-01-01 to 2028-12-31 (24 solar term data from KASI is provided up to 2028; follow-up F-1, due 2028-12-01).
  - Crisis guidance: the same five hotlines as tarot (shared constants in `src/constants/crisis-phone.constant.ts`), shown below every result area and on the hub. Display: touch devices show a tappable `tel:` link, mouse-and-keyboard devices show plain text (CSS media query only). Re-verify every number and operating hour before release. Last verified: 2026-11-05 (web search only); re-confirmed by the project owner on 2026-11-06 and 2026-11-16.
  - Birth date is never sent to a server or stored; only the consent flag is stored in sessionStorage. No paid or credit features. Revenue is AdFit display ads only.
  - Original copy, authorship log and a sampled web-search similarity check: `docs/fortune/copy-log.md`. Calendar data source: KASI public data (see `THIRD_PARTY_NOTICES.md`, `docs/fortune/calendar-verification.md`).
  - **No legal review has been obtained for the fortune feature; the operator accepts the risk (decided 2026-11-05).** The use-consent gate is the minimum safeguard: it lowers risk but does not remove it. Accepted-risk items: handling of users under 14 and Feb 29 birthdays, consent gate and sessionStorage handling, responsibility notice wording, the lotto link wording, existing full-liability wording in the Terms (chapter 14), legal-basis wording in the Privacy Policy (chapter 4), the age gap in Terms chapter 2, and interpretation of the KASI terms ("usage scope: no restriction" as confirmed by the owner). Non-legal pre-release checks remain: crisis hotline numbers, AdFit policy, final notice wording, final Privacy/Terms check, manual screen-reader check.
- Dream interpretation (`/dream`, `/dream/<slug>`):
  - Entertainment/self-reflection notice shown directly under the h1 on the hub and every detail page (always visible, never collapsed), plus a short notice below the content. Wording is fixed in the dream feature constants (see `docs/dream/plan.md`, legal section). Wording is not presented as prediction or guarantee; the notice states that readings are folk interpretations, not scientifically proven, and that decisions are the user's own.
  - No input is collected. The search text is kept in React state only: never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events or console output. No new browser storage key is added. Site-wide Vercel Web Analytics records page paths only (a detail page path includes the topic slug); this is covered by the existing Privacy Policy wording.
  - Lotto separation policy: the dream feature is not linked to lotto. No lucky numbers, no "winning dream" wording, no links to `/lotto/*`, and no lotto-related terms in copy or metadata. This is checked by the copy-rule string checks (AC-17, AC-18, AC-26).
  - Crisis guidance: the same five hotlines as tarot and fortune (shared constants in `src/constants/crisis-phone.constant.ts`) are shown at the bottom of the hub and every detail page. Crisis wording typed in the search box is detected in the browser only (`src/lib/crisis-signal.ts`) and is never reported anywhere. Death-related topics carry an extra note that the dream does not mean an actual death. Re-verify every number and operating hour before release. Last verified: (fill in at release).
  - Content source policy: all interpretation sentences are original text written for this service, based on widely shared folk interpretation notions. No sentences are copied, translated or reordered from classical texts, other sites or modern dream books; classical texts and the National Library of Korea digital materials are not quoted; topic name lists were used as reference only and not transferred wholesale. No external images, stock images or external icon sets. No ranking or user-count claims. Authorship log and similarity check: `docs/dream/copy-log.md`.
  - Non-affiliation: no affiliation with any dream-interpretation book, site or organization.
  - No paid or credit features. Revenue is AdFit display ads only (4 or fewer per page); ads never gate or cover content. AdFit may screen "dream interpretation" content as gambling-related; confirm before release.
  - **No legal review has been obtained for the dream feature; the operator accepts the risk (decided 2026-11-19).** Accepted-risk items: ownership of AI-written copy, wording of the notices, copyright status of topic name lists, the Terms and Privacy Policy wording for the dream feature. Non-legal pre-release checks remain: crisis hotline numbers and hours, AdFit screening, final notice wording, forbidden-wording string checks, lotto-related bill status (reported October 2025, passage unconfirmed).

- What-to-eat, 뭐 먹지 (`/meal`): lunch, dinner, breakfast/brunch.
  - Meals: exactly three (lunch, dinner, breakfast/brunch). There is no late-night or drinking-snack meal (the late-night items are a dinner-only category, see below). Menu names, copy, FAQ, metadata and Terms sentences contain no drinking-related words, and string checks block them. Menus that are strongly associated with drinking (the list in `MEAL_ALCOHOL_ASSOCIATED_MENU_NAMES`) are excluded from the breakfast/brunch list only. By the owner's decision on 2026-11-23, they are allowed in the dinner list as late-evening meals, because eating a late meal does not imply drinking; no screen, notice, FAQ, metadata or Terms sentence mentions drinking or drinking snacks. They are grouped in a dinner-only category labeled "야식" (late-night, off by default, exclusive selection, 48 menus; the label is the one exception to the forbidden-word check via `MEAL_ALLOWED_CATEGORY_LABELS`). There is no separate late-night meal. In the lunch list, four menus with a strong drinking-snack image (fried chicken, fried snacks, kkanpunggi, malaxiangguo) were removed on 2026-11-23 and one noodle menu was added.
  - Entertainment notice shown directly under the h1 (always visible, never collapsed); a random-pick and no-reward notice always visible below the roulette area; a short notice below the result. Wording is fixed in `src/features/meal/constants/meal-notice.constant.ts`. The notice states that the result is random, not a recommendation or an evaluation, and that menu and business information is not promised.
  - Random pick, no recommendation: menus are drawn with equal probability among the selected filters (category, broth), excluding the previous pick when two or more candidates remain. Results are never presented as recommendations, rankings or reviews. Forbidden phrasing is listed in `src/features/meal/constants/meal-copy-rule.constant.ts` (check-only, not imported by screen code) and checked by `unit/meal/meal-copy.test.ts`.
  - No reward policy: no cash, goods, points, coupons or prizes are tied to a result. The always-visible notice states: "룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다." No paid or credit features, no ticket or entry mechanics.
  - External map links: Kakao Map (`map.kakao.com`), Naver Map (`map.naver.com`) and Google Maps (`www.google.com`) web search URLs, opened in a new tab (`target="_blank"`, `rel="noopener noreferrer nofollow"`). The query is the menu name only, no location, no user data. No logos, no app deep links, no map API or API key, no affiliate parameters. A notice next to the links states that these are external sites run by Kakao, Naver and Google (Google Maps is run by Google, with no affiliation), that their own terms and policies apply after the move, and that search results and business information follow those services. The Terms (chapter 9) state non-affiliation.
  - No location and no personal data: no location permission is requested (`Permissions-Policy: geolocation=()` stays site-wide, see section 6). No input is collected. Selected filters, the draw result and the animation state stay in React state only: never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics/alert events or console output. No new browser storage key is added. No analytics events for draws or map link clicks (default plan). Site-wide Vercel Web Analytics records page paths only; the page path carries no filter value, and this is covered by the existing Privacy Policy wording.
  - Advertising: revenue is AdFit display ads only. No restaurant ads, affiliate links, delivery or reservation links, or menu sales links. Ads never gate or cover the roulette or the result.
  - Content source: the menu list and all copy are original text written for this service. No public data (no restaurant dataset), no external images or food photos, no external icon sets. No ranking, rating or user-count claims. Authorship logs: `docs/lunch/copy-log.md` and `docs/menu-meals/copy-log.md`.
  - No legal review has been obtained for the meal roulette feature; the operator accepts the risk (default decision recorded 2026-11-19; extended to the dinner and breakfast/brunch meals on 2026-11-23, to be confirmed by the owner). Added accepted-risk items: judgment of drinking-associated dinner menus (the owner decided to include them in the dinner list; the owner confirmed the AdFit policy on 2026-11-23, and if screening objects, the dinner additions listed in `docs/menu-meals/copy-log.md` can be removed), the blocking rule for hangover-type wording, whether food labeling and advertising rules apply to breakfast menus and copy, whether Google Maps Platform terms (3.2.2) apply to plain search links, and how the Terms effective-date change is handled. Accepted-risk items: applicability of location-information rules (no location is requested), applicability of gambling-related rules (no reward is tied to a result), food labeling and advertising rules (menu names only, no health, nutrition or taste claims), policies on map search links and mobile or in-app browser behavior, and the Terms and Privacy Policy wording for the meal roulette. Non-legal pre-release checks remain: final notice wording, forbidden-wording string checks, map link behavior on mobile (Q17), AdFit screening and the current AdFit policy text, the 301 response from `/lunch/today` and `/lunch`, and exclusion of the old addresses from the sitemap.
- Lucky draw (`/lucky-draw`, `/lucky-draw/ladder`, `/lucky-draw/roulette`, `/lucky-draw/lots`):
  - Always-visible notice directly under the h1 and a short notice below the result area. Wording is fixed in `src/features/lucky-draw/constants/lucky-draw-notice.constant.ts`.
  - Randomness: only `crypto.getRandomValues` with rejection sampling is used, with no `Math.random` fallback. Shuffling uses Fisher-Yates. The ladder shuffles the bottom result slots so assignment is uniform. There are no per-slot weights. Checked by `unit/lucky-draw/`.
  - No reward: no entry fee, prize, points or goods are tied to a result. Forbidden wording is listed in `lucky-draw-copy-rule.constant.ts` and checked by `unit/lucky-draw/lucky-draw-copy.test.ts`.
  - Lotto separation: no lotto links or lotto-related words in copy or metadata.
  - Input: typed names and items stay in React state only. Never sent to a server, never stored in localStorage, sessionStorage, cookies or URLs, never included in analytics events or console output. No new browser storage key is added. No location is requested.
  - Advertising: AdFit display ads only. No ads inside the result button or the result area.
  - Terms: chapter 10 covers the lucky draw; the later chapters moved down by one (old 10-19 are now 11-20). The Terms (chapter 14) reference in the fortune item above reflects this.
  - **No legal review has been obtained for the lucky draw feature; the operator accepts the risk (decided 2026-11-23).** Accepted-risk items: interpretation of gambling-related rules (no reward is tied to a result), copyright of the screen layout, children's names typed as input, the wording of Terms chapter 10, and no age gate. Non-legal pre-release checks remain: notice wording, forbidden-wording string checks, AdFit screening of the word "뽑기", sitemap registration, and removing the coming-soon flag.

All items above should be reviewed before each release. Keep this file updated with changes in dependencies, ad networks, or data sources.
