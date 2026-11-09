# Compliance Checklist (Production)

Last updated: 2026-11-09

This document summarizes legal/commercial and operational compliance items for Pickle-eight prior to production deployment.

## 1) Cookies, Consent, Privacy

- State: Implemented.
  - Global `ConsentProvider` manages `unknown | accepted | declined` with persistence in `localStorage`.
  - Analytics/ads scripts run only when consent is `accepted`.
  - `CookieSettingsButton` in footer allows reopening consent banner.
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
  - Fortune: the hub and the three feature pages are indexable (no `noindex`) and listed in the sitemap once the menu group is released (`comingSoon` removed). The fortune copy itself is not in the server HTML (it is loaded after consent); the server HTML has the guide, FAQ, notices and calculation basis. `/fortune/saju` is not published.

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
  - Crisis guidance: five counseling hotlines are always displayed in the result area: suicide prevention 109, mental health crisis 1577-0199, Korea Lifeline 1588-9191 (national representative number), youth 1388, women's emergency 1366 (all stated as 24h). When crisis wording is detected in the question, 109, 1577-0199 and 1588-9191 are shown before the result. Re-verify every number and operating hour before release. Last verified: 2026-11-05 (web search only); re-confirmed by the project owner on 2026-11-06.
  - No server-side storage of tarot input; only today's card (date, card number, orientation) is stored in the browser and is deleted on the next visit after the day changes.
  - No paid or credit features. Revenue is AdFit display ads only; ads never gate results.
  - Topic selection (v2): the chosen topic only changes which original reading sentences are shown; the card draw is random and independent of the topic. The topic notice states this directly under the topic chips on both tarot pages.
  - Question input (v2): text typed in the question field is not used for card selection or interpretation; it is used only to check whether crisis guidance is needed. It is not sent to a server or stored.
  - Three-card story (v2): the flow story is original text that links the three card meanings, shown as a reference only and never as a prediction or guarantee. A fixed notice is shown below the story (`TAROT_STORY_NOTICE`, allowed as an exception sentence in `tarot-copy-rule.constant.ts`). The word "상담" is not used in the three-card h1, description or intro.
  - No legal review has been obtained for tarot content (accepted risk, see `docs/tarot/plan.md`).
- Fortune (`/fortune`, `/fortune/today`, `/fortune/tti`, `/fortune/star-sign`):
  - Entertainment/self-reflection notice shown near the top of every fortune page and a short notice below the result area. Wording is fixed in `src/features/fortune/constants/fortune-notice.constant.ts`.
  - Results are not presented as predictions or guarantees. Forbidden phrasing (guarantee/accuracy claims, deterministic future statements, health/medical terms, third-party service names) and the rule for the word "사주" (allowed only in whitelisted sentences, with its gloss on first mention) live in `src/features/fortune/constants/fortune-copy-rule.constant.ts` and are checked by `e2e/fortune-copy.spec.ts`.
  - Lotto link: lucky numbers (1 to 10, one or two) may link to the lotto generator (`/lotto/generator`, no query). The notice states there is no relation to winning and no change in probability.
  - Use-consent gate: users must agree before any fortune content is shown; without agreement the service is not provided. Users under 14 are blocked; users 14 and over see a responsibility notice. Supported birth dates are 1920-01-01 to 2028-12-31 (24 solar term data from KASI is provided up to 2028; follow-up F-1, due 2028-12-01).
  - Crisis guidance: the same five hotlines as tarot (shared constants in `src/constants/crisis-phone.constant.ts`), shown below every result area and on the hub. Display: touch devices show a tappable `tel:` link, mouse-and-keyboard devices show plain text (CSS media query only). Re-verify every number and operating hour before release. Last verified: 2026-11-05 (web search only); re-confirmed by the project owner on 2026-11-06.
  - Birth date is never sent to a server or stored; only the consent flag is stored in sessionStorage. No paid or credit features. Revenue is AdFit display ads only.
  - Original copy, authorship log and a sampled web-search similarity check: `docs/fortune/copy-log.md`. Calendar data source: KASI public data (see `THIRD_PARTY_NOTICES.md`, `docs/fortune/calendar-verification.md`).
  - **No legal review has been obtained for the fortune feature; the operator accepts the risk (decided 2026-11-05).** The use-consent gate is the minimum safeguard: it lowers risk but does not remove it. Accepted-risk items: handling of users under 14 and Feb 29 birthdays, consent gate and sessionStorage handling, responsibility notice wording, the lotto link wording, existing full-liability wording in the Terms (chapter 11), legal-basis wording in the Privacy Policy (chapter 4), the age gap in Terms chapter 2, and interpretation of the KASI terms ("usage scope: no restriction" as confirmed by the owner). Non-legal pre-release checks remain: crisis hotline numbers, AdFit policy, final notice wording, final Privacy/Terms check, manual screen-reader check.

All items above should be reviewed before each release. Keep this file updated with changes in dependencies, ad networks, or data sources.
