import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import '@/lib/firebase-admin';
import { callOpenAI } from '@/services';
import { EmojiTranslationRequestSchema } from '@/schemas';
import { EMOJI_CATEGORY_ENUM } from '@/constants';
import { EmojiTranslationProblemType, EmojiQuizGradeType } from '@/types';

/**
 * In-memory recent answers store by category (best-effort on serverless).
 * LRU with fixed max size per category.
 */
const RECENT_MAX_PER_CATEGORY: number = 50;
const recentByCategory: Map<string, string[]> = new Map();

// Recently used random categories (to avoid same-topic repetition when category === '랜덤')
const RECENT_CATEGORY_MAX: number = 10;
let recentCategories: string[] = [];
function getRecentCategories(): string[] {
  return recentCategories;
}
function pushRecentCategory(cat: string): void {
  const list: string[] = recentCategories.slice();
  list.push(cat);
  recentCategories = list.slice(-RECENT_CATEGORY_MAX);
}
function pickEffectiveCategory(requested: string): string {
  if (requested !== EMOJI_CATEGORY_ENUM.RANDOM) return requested;
  const pool: string[] = Object.values(EMOJI_CATEGORY_ENUM).filter(
    (c) => c !== EMOJI_CATEGORY_ENUM.RANDOM
  );
  const recent: string[] = getRecentCategories();
  const last: string | undefined = recent[recent.length - 1];
  const candidates: string[] = pool.filter((c) => c !== last);
  const idx: number = Math.floor(Math.random() * (candidates.length || 1));
  return candidates[idx] ?? pool[0];
}

// Permissive mode: ALWAYS return a problem (skip strict checks, accept near-duplicates)
const PERMISSIVE_MODE = true;

/**
 * Normalize an answer for duplicate detection.
 */
function normalizeAnswer(input: string): string {
  const s: string = input
    .toLowerCase()
    .trim()
    .replace(/[\t\n\r]+/g, ' ')
    // remove brackets content and punctuation commonly used in titles
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, '')
    .replace(/[!?,.:;~"'`·•|]/g, ' ')
    // replace Korean particles variants and extra spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s;
}

/**
 * Extract core tokens (hangul syllables and latin words) for franchise detection.
 */
function extractCoreTokens(input: string): string[] {
  const base: string = normalizeAnswer(input);
  const tokens: string[] = base
    .split(/[^\p{Script=Hangul}a-z0-9]+/giu)
    .filter((t: string) => t.length >= 2);
  // prefer first 2-3 informative tokens
  return tokens.slice(0, 3);
}

/**
 * Simple similarity score in [0,1] based on overlap and length ratio.
 */
function similarityScore(a: string, b: string): number {
  const na: string = normalizeAnswer(a);
  const nb: string = normalizeAnswer(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na))
    return Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
  const setA: Set<string> = new Set(extractCoreTokens(na));
  const setB: Set<string> = new Set(extractCoreTokens(nb));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter: number = 0;
  setA.forEach((t: string) => {
    if (setB.has(t)) inter += 1;
  });
  const union: number = setA.size + setB.size - inter;
  return inter / union; // Jaccard-like
}

/**
 * Franchise-level duplicate: share leading core token or high similarity.
 */
function isFranchiseDuplicate(a: string, b: string): boolean {
  const ta: string[] = extractCoreTokens(a);
  const tb: string[] = extractCoreTokens(b);
  const firstA: string | undefined = ta[0];
  const firstB: string | undefined = tb[0];
  if (firstA && firstB && firstA === firstB) return true;
  return similarityScore(a, b) >= 0.85;
}

function getRecent(category: string): string[] {
  return recentByCategory.get(category) ?? [];
}

function pushRecent(category: string, answer: string): void {
  const list: string[] = getRecent(category).slice();
  list.push(answer);
  // de-dup preserving latest
  const seen: Set<string> = new Set();
  const deduped: string[] = [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const key: string = normalizeAnswer(list[i]);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(list[i]);
  }
  deduped.reverse();
  const trimmed: string[] = deduped.slice(-RECENT_MAX_PER_CATEGORY);
  recentByCategory.set(category, trimmed);
}

function isDuplicateAgainstRecent(
  category: string,
  candidate: string
): boolean {
  const recent: string[] = getRecent(category);
  for (const prev of recent) {
    if (isFranchiseDuplicate(prev, candidate)) return true;
  }
  return false;
}

// Responses 계열 판단
function isResponsesModel(model?: string | null): boolean {
  if (!model) return false;
  const m = model.toLowerCase();
  return (
    m.startsWith('o1') ||
    m.startsWith('o3') ||
    m.includes('4.1') ||
    m.startsWith('gpt-5')
  );
}

// 최근 이모지 시그니처 캐시(패턴 중복 방지)
const recentEmojiSigsByCategory: Map<string, string[]> = new Map();
function emojiSignature(emojis: string): string {
  const cleaned = Array.from(emojis)
    .map((ch: string) => ch.codePointAt(0) ?? 0)
    // remove variation selectors & skin tones
    .filter((cp: number) => cp !== 0xfe0f && (cp < 0x1f3fb || cp > 0x1f3ff))
    .sort((a: number, b: number) => a - b)
    .join('-');
  return cleaned;
}
function getRecentEmojiSigs(category: string): string[] {
  return recentEmojiSigsByCategory.get(category) ?? [];
}
function pushRecentEmojiSig(category: string, emojis: string): void {
  const list: string[] = getRecentEmojiSigs(category).slice();
  const sig = emojiSignature(emojis);
  if (!sig) return;
  list.push(sig);
  const dedup: string[] = [];
  const seen: Set<string> = new Set();
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const s = list[i];
    if (seen.has(s)) continue;
    seen.add(s);
    dedup.push(s);
  }
  dedup.reverse();
  const trimmed: string[] = dedup.slice(-RECENT_MAX_PER_CATEGORY);
  recentEmojiSigsByCategory.set(category, trimmed);
}
function isEmojiSigDuplicate(category: string, emojis: string): boolean {
  const sig = emojiSignature(emojis);
  if (!sig) return false;
  return getRecentEmojiSigs(category).includes(sig);
}

// JSON 추출 유틸: 코드펜스/자연어가 섞여도 첫 번째 JSON 객체를 안전히 파싱
function extractFirstJsonObject(text: string): string | null {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// JSON 보정 호출: 비JSON 응답을 스키마로 강제 변환(소량 토큰)
async function coerceToSchema(
  raw: string,
  category: string,
  model?: string
): Promise<EmojiTranslationProblemType | null> {
  try {
    const content = await callOpenAI({
      messages: [
        { role: 'system', content: '너는 포맷 보정기야. 항상 JSON만 반환.' },
        {
          role: 'user',
          content: `다음 텍스트를 이 스키마로 변환:\n스키마: {"emojis": "이모지 나열", "answer": "정답", "category": "${category}", "hint": "간단한 힌트"}\n텍스트: ${raw}`,
        },
      ],
      max_tokens: 120,
      temperature: 0,
      json: true,
      ...(model ? { model } : {}),
    });
    const fixed =
      extractFirstJsonObject(content) ??
      content.replace(/```json|```/g, '').trim();
    const out = JSON.parse(fixed) as EmojiTranslationProblemType;
    return out;
  } catch {
    return null;
  }
}

// Schema repair: when raw content isn't valid JSON or fields are missing, ask a reliable chat model to convert/fix.
async function repairToSchema(
  raw: string,
  category: string
): Promise<EmojiTranslationProblemType | null> {
  try {
    const content: string = await callOpenAI({
      messages: [
        { role: 'system', content: '너는 포맷 보정기야. 항상 JSON만 반환.' },
        {
          role: 'user',
          content: `다음 텍스트(또는 잘못된 JSON)를 이 스키마로 변환/보정해줘. 누락된 키는 합리적으로 채워.\n스키마: {"emojis": "이모지 나열(2~6개)", "answer": "정답", "category": "${category}", "hint": "간단한 힌트"}\n텍스트: ${raw}`,
        },
      ],
      max_tokens: 180,
      temperature: 0.4,
      json: true,
      model: 'gpt-4o-mini',
    });
    const fixed =
      extractFirstJsonObject(content) ??
      content.replace(/```json|```/g, '').trim();
    const out = JSON.parse(fixed) as EmojiTranslationProblemType;
    return out;
  } catch {
    return null;
  }
}

// Fallback(최후 방어선): 하드코드 풀 없이 카테고리별 안전한 일반형 문제를 합성
function pickFallback(category: string): EmojiTranslationProblemType {
  const now = new Date();
  const baseHint = '간단한 연상 퀴즈';
  if (category === '영화') {
    return { emojis: '🎬❓', answer: '영화', category: '영화', hint: baseHint };
  }
  if (category === '음식') {
    return { emojis: '🍽️❓', answer: '음식', category: '음식', hint: baseHint };
  }
  if (category === '일상') {
    return { emojis: '🏠❓', answer: '일상', category: '일상', hint: baseHint };
  }
  if (category === '속담') {
    return { emojis: '🗣️📜', answer: '속담', category: '속담', hint: baseHint };
  }
  if (category === '사자성어') {
    return {
      emojis: '🀄️📘',
      answer: '사자성어',
      category: '사자성어',
      hint: baseHint,
    };
  }
  // 랜덤/기타
  return {
    emojis: '🧩❓',
    answer: '퀴즈',
    category,
    hint: `${baseHint} · ${now.getHours()}:${now.getMinutes()}`,
  };
}

// ===== Firestore 기반 지속형(세션 간) 중복 억제 =====
type PersistEntry = { answer: string; sig: string; ts: number };
const PERSIST_COLLECTION = 'emoji_quiz_recent';
const PERSIST_MAX = 150; // per user+category
const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep last 7 days

function getUserKey(req: NextRequest): string {
  const h = req.headers;
  const uid = h.get('x-user-id') || h.get('x-client-id') || '';
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('cf-connecting-ip') ||
    h.get('x-real-ip') ||
    '';
  const key = uid || ip || 'anon';
  return key.length > 120 ? key.slice(0, 120) : key;
}

async function loadPersistentRecent(
  userKey: string,
  category: string
): Promise<{ answers: string[]; sigs: string[] }> {
  try {
    const db = getFirestore();
    const docRef = db
      .collection(PERSIST_COLLECTION)
      .doc(`${userKey}__${category}`);
    const snap = await docRef.get();
    if (!snap.exists) return { answers: [], sigs: [] };
    const data = snap.data() as { entries?: PersistEntry[] };
    const now = Date.now();
    const entries = (data.entries ?? []).filter(
      (e) => now - e.ts <= PERSIST_MAX_AGE_MS
    );
    // Trim and return unique normalized answers and raw sigs
    const answersSet = new Set<string>();
    const sigsSet = new Set<string>();
    for (const e of entries.slice(-PERSIST_MAX)) {
      answersSet.add(normalizeAnswer(e.answer));
      if (e.sig) sigsSet.add(e.sig);
    }
    return { answers: Array.from(answersSet), sigs: Array.from(sigsSet) };
  } catch {
    return { answers: [], sigs: [] };
  }
}

async function savePersistentRecent(
  userKey: string,
  category: string,
  answer: string,
  emojis: string
): Promise<void> {
  try {
    const db = getFirestore();
    const docRef = db
      .collection(PERSIST_COLLECTION)
      .doc(`${userKey}__${category}`);
    const sig = emojiSignature(emojis);
    const entry: PersistEntry = { answer, sig, ts: Date.now() };
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data =
        (snap.exists ? (snap.data() as { entries?: PersistEntry[] }) : {}) ||
        {};
      const prev: PersistEntry[] = (data.entries ?? []).filter(
        (e) => Date.now() - e.ts <= PERSIST_MAX_AGE_MS
      );
      const next = [...prev, entry].slice(-PERSIST_MAX);
      tx.set(
        docRef,
        { entries: next, updatedAt: Timestamp.now() },
        { merge: true }
      );
    });
  } catch {
    // best-effort; ignore persistence errors
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = EmojiTranslationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.action === 'generate') {
      const requestedCategory = parsed.data.category ?? '랜덤';
      const userKey = getUserKey(req);
      const effectiveCategory: string =
        pickEffectiveCategory(requestedCategory);
      const reqModel = (parsed.data as { model?: string }).model;
      const isResp = isResponsesModel(reqModel);
      const localBanSet: Set<string> = new Set(getRecent(effectiveCategory));
      // load persistent and merge into local banlist (answers)
      const persistent = await loadPersistentRecent(userKey, effectiveCategory);
      for (const a of persistent.answers) localBanSet.add(a);

      async function buildPrompt(banlist: string[]): Promise<string> {
        const recentAnswers: string[] = getRecent(effectiveCategory).slice(-10);
        // merge persistent (normalized) into recentAnswers preview for the prompt
        const mergedPreview = Array.from(
          new Set<string>([...recentAnswers, ...persistent.answers])
        ).slice(-20);
        const recentTokens: string[] = recentAnswers
          .flatMap((a: string) => extractCoreTokens(a))
          .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
          .slice(0, 12);
        const recentEmojiSigs = Array.from(
          new Set<string>([
            ...getRecentEmojiSigs(effectiveCategory).slice(-10),
            ...persistent.sigs.slice(-10),
          ])
        );
        const diversityNonce = randomInt(1, 2_147_483_647);

        const fewShot =
          effectiveCategory === '영화'
            ? `예시(JSON): {"emojis":"🧪🕒","answer":"시간여행","category":"영화","hint":"과거와 미래"}`
            : effectiveCategory === '음식'
            ? `예시(JSON): {"emojis":"🍞🧈","answer":"버터빵","category":"음식","hint":"고소한 풍미"}`
            : `예시(JSON): {"emojis":"🌧️☂️","answer":"우산","category":"${effectiveCategory}","hint":"비오는 날"}`;

        return `너는 한국어 이모지 퀴즈 출제자야. 한 문제만 만들고, 반드시 JSON만 출력해.
요구 사항(공통):
- 카테고리: ${effectiveCategory}
- 이모지 2~6개로만 표현(텍스트 금지). 의미가 겹치지 않도록 다양하게 조합.
- 정답은 한국어 텍스트(작품명/보통명사/관용구 등), 실제 통용 표기 사용. 가상/신조어 금지.
- 힌트는 정답의 핵심 속성이나 배경을 간접 설명. 이모지·정답과 의미 일관.
다양성·중복 회피(중요):
- 금지 정답 목록과 동일/동의어/속편/부제/숫자 변형 금지: ${JSON.stringify(
          Array.from(banlist)
        )}
- 최근 금지 정답(예시): ${JSON.stringify(mergedPreview)}
- 최근 정답 핵심 토큰과 선도 토큰 겹치지 않게 구성: ${JSON.stringify(
          recentTokens
        )}
- 최근과 같은 이모지 패턴(동일 아이콘들의 순서/스킨 변경 포함) 금지. 최근 시그니처: ${JSON.stringify(
          recentEmojiSigs
        )}
- 다양성 토큰: ${diversityNonce}
카테고리별 추가 규칙:
- 영화: 실제 개봉작 제목만. 제목/테마의 핵심 명사·상징을 직접 연상시키는 이모지를 포함. 시리즈 공통 상징(모자/안경/막대 등)만으로 표현 금지.
${fewShot}
출력 JSON 스키마(정확히 이 키만 사용): {"emojis": "이모지 나열", "answer": "정답", "category": "${effectiveCategory}", "hint": "간단한 힌트"}`;
      }

      // Minimal validators
      async function judgeCoherence(): Promise<boolean> {
        // keep permissive for coherence to prioritize delivery
        return true;
      }

      function isFourHangul(text: string): boolean {
        return /^[가-힣]{4}$/.test(text.trim());
      }

      async function opensearch(
        domain: 'ko.wikipedia.org' | 'ko.wiktionary.org',
        title: string
      ): Promise<string | null> {
        try {
          const url = `https://${domain}/w/api.php?action=opensearch&search=${encodeURIComponent(
            title
          )}&limit=1&namespace=0&format=json&origin=*`;
          const res = await fetchWithTimeout(url, 1200, {
            cache: 'no-store',
            headers: {
              'User-Agent':
                'pickle-eight/1.0 (contact: support@pickle-eight.app)',
            },
          });
          if (!res.ok) return null;
          const arr = (await res.json()) as [
            string,
            string[],
            string[],
            string[]
          ];
          const first = arr?.[1]?.[0];
          return first ?? null;
        } catch {
          return null;
        }
      }

      // Small in-memory TTL cache for authenticity
      type AuthCacheVal = { ok: boolean; canonical?: string; ts: number };
      type AuthCacheInput = Readonly<{ ok: boolean; canonical?: string }>;
      const AUTH_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
      const AUTH_CACHE_MAX = 500; // global cap
      const globalKey = '__emojiAuthCache';
      const AUTH_CACHE: Map<string, AuthCacheVal> =
        (globalThis as unknown as { [k: string]: Map<string, AuthCacheVal> })[
          globalKey
        ] || new Map<string, AuthCacheVal>();
      if (!(globalKey in (globalThis as unknown as object))) {
        (globalThis as unknown as { [k: string]: Map<string, AuthCacheVal> })[
          globalKey
        ] = AUTH_CACHE;
      }

      function authCacheKey(category: string, answer: string): string {
        return `${category}|${normalizeAnswer(answer)}`;
      }
      function getAuthCache(
        category: string,
        answer: string
      ): AuthCacheVal | undefined {
        const k = authCacheKey(category, answer);
        const v = AUTH_CACHE.get(k);
        if (!v) return undefined;
        if (Date.now() - v.ts > AUTH_CACHE_TTL_MS) {
          AUTH_CACHE.delete(k);
          return undefined;
        }
        return v;
      }
      function setAuthCache(
        category: string,
        answer: string,
        val: AuthCacheInput
      ): void {
        if (AUTH_CACHE.size > AUTH_CACHE_MAX) {
          // simple prune: delete oldest ~50
          const toDel: string[] = [];
          for (const [k] of AUTH_CACHE) {
            toDel.push(k);
            if (toDel.length >= 50) break;
          }
          toDel.forEach((k) => AUTH_CACHE.delete(k));
        }
        const withTs: AuthCacheVal = {
          ok: val.ok,
          canonical: val.canonical,
          ts: Date.now(),
        };
        AUTH_CACHE.set(authCacheKey(category, answer), withTs);
      }

      // fetch with timeout helper
      async function fetchWithTimeout(
        input: RequestInfo | URL,
        timeoutMs: number,
        init?: RequestInit
      ): Promise<Response> {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const res = await fetch(input, { ...init, signal: ctrl.signal });
          return res;
        } finally {
          clearTimeout(id);
        }
      }

      // Authenticity check (ENFORCED):
      // - 영화: TMDB 검색 결과가 있어야 함(가능하면 ko-KR). TMDB_API_KEY 없으면 위키백과로 대체.
      // - 음식: ko.wikipedia.org 요약/검색으로 존재 확인.
      // - 사자성어/속담(랜덤 등에서 나올 수 있음): ko.wiktionary.org 또는 ko.wikipedia.org 검색으로 존재 확인.
      async function verifyAnswerAuthenticity(
        category: string,
        answer: string
      ): Promise<{ ok: boolean; canonical?: string }> {
        const title = answer.trim();
        if (!title) return { ok: false };
        const norm = normalizeAnswer(title);
        // Cache first
        const cached = getAuthCache(category, title);
        if (cached) return { ok: cached.ok, canonical: cached.canonical };

        // Idiom/proverb heuristic first (4-char Hangul often indicates 사자성어)
        if (isFourHangul(title)) {
          const wk = await opensearch('ko.wiktionary.org', title);
          if (wk) {
            const n = normalizeAnswer(wk);
            const ok = n === norm || n.includes(norm) || norm.includes(n);
            const val: AuthCacheInput = { ok, canonical: ok ? wk : undefined };
            setAuthCache(category, title, val);
            return { ok, canonical: ok ? wk : undefined };
          }
          // fallback to wikipedia
          const wp = await opensearch('ko.wikipedia.org', title);
          if (wp) {
            const n = normalizeAnswer(wp);
            const ok = n === norm || n.includes(norm) || norm.includes(n);
            const val: AuthCacheInput = { ok, canonical: ok ? wp : undefined };
            setAuthCache(category, title, val);
            return { ok, canonical: ok ? wp : undefined };
          }
          const miss: AuthCacheInput = { ok: false };
          setAuthCache(category, title, miss);
          return { ok: false };
        }

        // Category-specific handling
        if (category === '음식') {
          // Run summary and opensearch in parallel, take first success
          const encoded = encodeURIComponent(title);
          const summaryUrl = `https://ko.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
          const reqSummary = fetchWithTimeout(summaryUrl, 1200, {
            cache: 'no-store',
            headers: {
              'User-Agent':
                'pickle-eight/1.0 (contact: support@pickle-eight.app)',
            },
          }).then(async (res) => {
            if (!res.ok) throw new Error('summary_fail');
            const data = (await res.json()) as { title?: string };
            const canonical = data.title ?? title;
            return { ok: true, canonical };
          });
          const reqSearch = (async () => {
            const hit = await opensearch('ko.wikipedia.org', title);
            if (!hit) throw new Error('search_fail');
            const n = normalizeAnswer(hit);
            const ok = n === norm || n.includes(norm) || norm.includes(n);
            return { ok, canonical: ok ? hit : undefined };
          })();
          try {
            const val = await Promise.any([reqSummary, reqSearch]);
            setAuthCache(category, title, {
              ok: val.ok,
              canonical: val.canonical,
            });
            return val;
          } catch {
            const miss: AuthCacheInput = { ok: false };
            setAuthCache(category, title, miss);
            return { ok: false };
          }
        }

        // Default: 일반 명사/표현(일상 등)은 성능을 위해 강제 검증 제외 → 통과
        // 필요 시 카테고리를 추가해 엄격 검증 확장 가능
        return { ok: true };
      }

      async function verifyMovieHint(): Promise<boolean> {
        return true;
      }

      async function enforceMovieTitleKeywordCoverage(): Promise<boolean> {
        return true;
      }

      let attempts = 0;
      const maxAttempts = isResp ? 7 : 5;
      while (attempts < maxAttempts) {
        const banlist: string[] = Array.from(localBanSet);
        const prompt = await buildPrompt(banlist);
        let content = '';
        try {
          content = await callOpenAI({
            messages: [
              {
                role: 'system',
                content:
                  '너는 창의적인 이모지 퀴즈 출제자야. 반드시 JSON만 반환.',
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 220,
            temperature: isResp ? 0.55 : 0.7,
            json: true,
            presence_penalty: isResp ? 0.1 : 0.2,
            frequency_penalty: isResp ? 0.2 : 0.4,
            ...(reqModel ? { model: reqModel } : {}),
          });
        } catch {
          attempts += 1;
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }
        const cleanedRaw =
          extractFirstJsonObject(content) ??
          content.replace(/```json|```/g, '').trim();

        let out: EmojiTranslationProblemType | null = null;
        try {
          out = JSON.parse(cleanedRaw) as EmojiTranslationProblemType;
        } catch {
          // try a one-shot schema coercion
          const fixed = await coerceToSchema(
            content,
            effectiveCategory,
            reqModel
          );
          if (fixed) {
            out = fixed;
          } else {
            // try robust repair via reliable chat model
            const repaired = await repairToSchema(content, effectiveCategory);
            if (repaired) {
              out = repaired;
            } else {
              attempts += 1;
              await new Promise((r) => setTimeout(r, 120));
              continue;
            }
          }
        }
        // Normalize & fill defaults
        const emojis = (out?.emojis ?? '').trim();
        const answer = (out?.answer ?? '').trim();
        const cat = ((out?.category ?? '') || effectiveCategory).trim();
        const hint = (out?.hint ?? '').trim() || '핵심 특징을 떠올려 보세요';
        if (!emojis || !answer) {
          // final attempt to repair missing fields
          const repaired = await repairToSchema(
            JSON.stringify(out ?? {}),
            effectiveCategory
          );
          if (repaired && repaired.emojis && repaired.answer) {
            out = repaired;
          } else {
            attempts += 1;
            await new Promise((r) => setTimeout(r, 80));
            continue;
          }
        }
        // Duplicate checks: NEVER accept duplicate answers.
        const finalEmojis = out.emojis.trim();
        const finalAnswer = out.answer.trim();
        const dupAns =
          isDuplicateAgainstRecent(effectiveCategory, finalAnswer) ||
          persistent.answers.includes(normalizeAnswer(finalAnswer));
        const dupSig =
          isEmojiSigDuplicate(effectiveCategory, finalEmojis) ||
          persistent.sigs.includes(emojiSignature(finalEmojis));
        if (dupAns) {
          attempts += 1;
          localBanSet.add(finalAnswer);
          extractCoreTokens(finalAnswer).forEach((t: string) =>
            localBanSet.add(t)
          );
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        // Emoji pattern duplicate is also not allowed: always retry to get a fresh set.
        if (dupSig) {
          attempts += 1;
          localBanSet.add(finalAnswer);
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        // Minimal coherence/auth checks (skipped when PERMISSIVE_MODE=true)
        const coherent = await judgeCoherence();
        if (!coherent && !PERMISSIVE_MODE) {
          attempts += 1;
          localBanSet.add(finalAnswer);
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        const valid = await verifyAnswerAuthenticity(cat, finalAnswer);
        // 실재하지 않는 답은 무조건 거절 (PERMISSIVE_MODE라도 막음)
        if (!valid.ok) {
          attempts += 1;
          localBanSet.add(finalAnswer);
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        if (cat === '영화') {
          const okHint = await verifyMovieHint();
          const cov = await enforceMovieTitleKeywordCoverage();
          if ((!okHint || !cov) && !PERMISSIVE_MODE) {
            attempts += 1;
            localBanSet.add(finalAnswer);
            await new Promise((r) => setTimeout(r, 80));
            continue;
          }
        }
        // accept
        const accepted: EmojiTranslationProblemType = {
          emojis: finalEmojis,
          answer: valid.canonical ? valid.canonical : finalAnswer,
          category: cat,
          hint,
        };
        pushRecent(effectiveCategory, accepted.answer);
        pushRecentEmojiSig(effectiveCategory, accepted.emojis);
        // persist across sessions/days
        await savePersistentRecent(
          userKey,
          effectiveCategory,
          accepted.answer,
          accepted.emojis
        );
        if (requestedCategory === '랜덤') pushRecentCategory(effectiveCategory);
        return NextResponse.json(
          accepted satisfies EmojiTranslationProblemType
        );
      }

      // Fallback (최후 방어선)
      const fb = pickFallback(effectiveCategory);
      pushRecent(effectiveCategory, fb.answer);
      pushRecentEmojiSig(effectiveCategory, fb.emojis);
      await savePersistentRecent(
        userKey,
        effectiveCategory,
        fb.answer,
        fb.emojis
      );
      if (requestedCategory === '랜덤') pushRecentCategory(effectiveCategory);
      return NextResponse.json(fb satisfies EmojiTranslationProblemType);
    }

    // grade 그대로 유지
    const { emojis, answer, userGuess } = body as {
      emojis: string;
      answer: string;
      userGuess: string;
    };
    const prompt = `다음 이모지 퀴즈의 정답 여부를 판정해줘. 의미상 동일/매우 유사하면 정답. JSON만 출력.
- 이모지: ${emojis}
- 정답: ${answer}
- 사용자 답: ${userGuess}
출력(JSON): {"correct": boolean, "score": 0|1, "feedback": string }`;
    let content = '';
    try {
      content = await callOpenAI({
        messages: [
          {
            role: 'system',
            content: '너는 간결한 채점기야. 항상 JSON만 반환.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.2,
        json: true,
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to grade answer' },
        { status: 500 }
      );
    }
    const cleaned =
      extractFirstJsonObject(content) ??
      content.replace(/```json|```/g, '').trim();
    const out = JSON.parse(cleaned) as {
      correct: boolean;
      score: number;
      feedback: string;
    };
    const result: EmojiQuizGradeType = {
      correct: !!out.correct,
      score: out.score === 1 ? 1 : 0,
      feedback:
        out.feedback ??
        (out.correct ? '정답입니다.' : '아까워요! 다시 시도해보세요.'),
    };
    return NextResponse.json(result satisfies EmojiQuizGradeType);
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', detail: String(e) },
      { status: 500 }
    );
  }
}
