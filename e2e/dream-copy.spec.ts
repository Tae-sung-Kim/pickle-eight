import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { CRISIS_TERMS } from '@/constants/crisis-term.constant';
import { DREAM_CATEGORIES } from '@/features/dream/constants/dream-category.constant';
import {
  DREAM_BOAST_PATTERNS,
  DREAM_BOAST_TERMS,
  DREAM_COPY_ALLOWED_SENTENCES,
  DREAM_FORBIDDEN_PATTERNS,
  DREAM_FORBIDDEN_TERMS,
  DREAM_LOTTO_TERMS,
} from '@/features/dream/constants/dream-copy-rule.constant';
import { DREAM_DEATH_SUPPLEMENT_TEXT } from '@/features/dream/constants/dream-notice.constant';
import {
  DREAM_TOPIC_COUNT,
  DREAM_TOPICS,
} from '@/features/dream/constants/dream-topics.constant';
import { hasCrisisSignal, normalizeCrisisText } from '@/lib/crisis-signal';

// 브라우저를 쓰지 않는 데이터 검사. 데스크톱 프로젝트에서만 돌린다.
test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    `데이터 검사는 데스크톱에서만 실행한다 (${browserName})`
  );
});

const EXPECTED_COUNTS: Record<string, number> = {
  animal: 24,
  people: 14,
  body: 12,
  nature: 14,
  action: 24,
  object: 24,
  death: 8,
};

const SLUGS = new Set(DREAM_TOPICS.map((t) => t.slug));

function norm(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripAllowed(text: string): string {
  let out = text;
  for (const s of DREAM_COPY_ALLOWED_SENTENCES) out = out.split(s).join('');
  return out;
}

function topicTexts(t: (typeof DREAM_TOPICS)[number]): string[] {
  const list = [
    t.name,
    t.keywordName,
    ...t.aliases,
    t.summary,
    ...t.folk,
    ...t.reflection,
    ...t.faq.flatMap((f) => [f.question, f.answer]),
  ];
  if (t.sensitivity !== 'none') list.push(...t.soothing);
  return list;
}

function bodyTexts(t: (typeof DREAM_TOPICS)[number]): string[] {
  const list = [...t.folk, ...t.reflection];
  if (t.sensitivity !== 'none') list.push(...t.soothing);
  return list;
}

/** 위반 slug 목록을 메시지로 만든다. 비어 있어야 통과 */
function expectNone(violations: string[]) {
  expect(violations, violations.join('\n')).toEqual([]);
}

test.describe('AC-42, AC-43: 소재 개수·slug·이름·별칭', () => {
  test('AC-42: 소재 120개, 카테고리별 개수', () => {
    expect(DREAM_TOPIC_COUNT).toBe(120);
    expect(DREAM_TOPICS.length).toBe(120);
    expect(DREAM_CATEGORIES.length).toBe(7);
    for (const c of DREAM_CATEGORIES) {
      const n = DREAM_TOPICS.filter((t) => t.category === c.key).length;
      expect(n, `${c.key} 개수`).toBe(EXPECTED_COUNTS[c.key]);
    }
  });

  test('AC-43: slug 형식(영문 소문자·하이픈, 40자 이하)·중복 없음', () => {
    const bad = DREAM_TOPICS.filter(
      (t) => !/^[a-z]+(-[a-z]+)*$/.test(t.slug) || t.slug.length > 40
    ).map((t) => `${t.slug}: slug 형식 오류`);
    expectNone(bad);
    expect(SLUGS.size).toBe(DREAM_TOPICS.length);
  });

  test('AC-43: 별칭 2~5개, 소재 이름·별칭 중복 없음(카테고리 간 포함)', () => {
    const bad: string[] = [];
    const owner = new Map<string, string>();
    const names = new Map<string, string>();
    for (const t of DREAM_TOPICS) {
      if (t.aliases.length < 2 || t.aliases.length > 5)
        bad.push(`${t.slug}: 별칭 ${t.aliases.length}개`);
      for (const key of [t.name, t.keywordName]) {
        const k = norm(key);
        const prev = names.get(k);
        if (prev && prev !== t.slug)
          bad.push(`${t.slug}: 이름 "${key}"이 ${prev}와 중복`);
        names.set(k, t.slug);
      }
    }
    for (const t of DREAM_TOPICS) {
      const own = new Set<string>();
      for (const a of t.aliases) {
        const k = norm(a);
        if (own.has(k)) bad.push(`${t.slug}: 별칭 "${a}" 자체 중복`);
        own.add(k);
        const prev = owner.get(k);
        if (prev && prev !== t.slug)
          bad.push(`${t.slug}: 별칭 "${a}"이 ${prev}와 중복`);
        owner.set(k, t.slug);
        const nm = names.get(k);
        if (nm && nm !== t.slug)
          bad.push(`${t.slug}: 별칭 "${a}"이 ${nm}의 이름과 같음`);
      }
    }
    expectNone(bad);
  });
});

test.describe('AC-10: 문장 수·길이·분량', () => {
  test('AC-10: 한 줄 요약 1문장 20~80자, "."로 끝남', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      const len = [...t.summary].length;
      if (len < 20 || len > 80) bad.push(`${t.slug}: summary ${len}자`);
      if (!t.summary.endsWith('.'))
        bad.push(`${t.slug}: summary가 .로 끝나지 않음`);
      if (splitSentences(t.summary).length !== 1)
        bad.push(
          `${t.slug}: summary 문장 수 ${splitSentences(t.summary).length}`
        );
    }
    expectNone(bad);
  });

  test('AC-10: 민간 풀이 3~5, 생각해 볼 점 2~3, 각 원소 "."로 끝남', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      if (t.folk.length < 3 || t.folk.length > 5)
        bad.push(`${t.slug}: folk ${t.folk.length}문장`);
      if (t.reflection.length < 2 || t.reflection.length > 3)
        bad.push(`${t.slug}: reflection ${t.reflection.length}문장`);
      for (const [i, s] of t.folk.entries())
        if (!s.trim().endsWith('.'))
          bad.push(`${t.slug}: folk[${i}] 마침표 없음`);
      for (const [i, s] of t.reflection.entries())
        if (!s.trim().endsWith('.'))
          bad.push(`${t.slug}: reflection[${i}] 마침표 없음`);
    }
    expectNone(bad);
  });

  test('AC-10: 민간 풀이+생각해 볼 점 분량 공백 포함 300자 이상', () => {
    const bad = DREAM_TOPICS.map((t) => ({
      slug: t.slug,
      len: [...[...t.folk, ...t.reflection].join(' ')].length,
    }))
      .filter((x) => x.len < 300)
      .map((x) => `${x.slug}: ${x.len}자`);
    expectNone(bad);
  });

  test('AC-14: FAQ 2개, 질문·답 비어 있지 않음', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      if (t.faq.length !== 2) bad.push(`${t.slug}: faq ${t.faq.length}개`);
      for (const f of t.faq)
        if (!f.question.trim() || !f.answer.trim())
          bad.push(`${t.slug}: faq 빈 값`);
      for (const f of t.faq)
        if (!f.answer.trim().endsWith('.'))
          bad.push(`${t.slug}: faq 답 마침표 없음`);
    }
    expectNone(bad);
  });
});

test.describe('AC-13, AC-23: 관련 소재·민감 소재', () => {
  test('AC-13: related 2~4개, 실제 slug, 자기 자신 아님, 같은 카테고리, 중복 없음', () => {
    const bad: string[] = [];
    const bySlug = new Map(DREAM_TOPICS.map((t) => [t.slug, t]));
    for (const t of DREAM_TOPICS) {
      if (t.related.length < 2 || t.related.length > 4)
        bad.push(`${t.slug}: related ${t.related.length}개`);
      if (new Set(t.related).size !== t.related.length)
        bad.push(`${t.slug}: related 중복`);
      for (const r of t.related) {
        const target = bySlug.get(r);
        if (!target) bad.push(`${t.slug}: related "${r}" 없는 slug`);
        else if (r === t.slug) bad.push(`${t.slug}: related에 자기 자신`);
        else if (target.category !== t.category)
          bad.push(
            `${t.slug}: related "${r}" 다른 카테고리(${target.category})`
          );
      }
    }
    expectNone(bad);
  });

  test('AC-23: death 카테고리는 모두 민감, 민감 소재 soothing 1~3문장', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      if (t.category === 'death' && t.sensitivity === 'none')
        bad.push(`${t.slug}: death 카테고리인데 sensitivity none`);
      if (t.sensitivity !== 'none') {
        if (t.soothing.length < 1 || t.soothing.length > 3)
          bad.push(`${t.slug}: soothing ${t.soothing.length}문장`);
        for (const s of t.soothing)
          if (!s.trim().endsWith('.'))
            bad.push(`${t.slug}: soothing 마침표 없음`);
      }
    }
    expectNone(bad);
  });

  test('AC-23: 죽음 소재 보충 문장 상수가 있고 sensitivity death 소재가 1개 이상', () => {
    expect(DREAM_DEATH_SUPPLEMENT_TEXT).toContain('실제 죽음');
    expect(DREAM_TOPICS.some((t) => t.sensitivity === 'death')).toBe(true);
  });

  test('12지 동물 11개 isTtiAnimal, 모두 동물, 용·dragon 없음', () => {
    const tti = DREAM_TOPICS.filter((t) => t.isTtiAnimal);
    expect(tti.length).toBe(11);
    const bad: string[] = [];
    for (const t of tti) {
      if (t.category !== 'animal') bad.push(`${t.slug}: 동물이 아님`);
    }
    for (const t of DREAM_TOPICS) {
      const keys = [t.name, t.keywordName, ...t.aliases];
      if (
        /dragon/i.test(t.slug) ||
        keys.some(
          (k) =>
            /용/.test(k) &&
            t.category === 'animal' &&
            /^용(꿈)?$|용꿈|^용 /.test(k)
        )
      )
        bad.push(`${t.slug}: 용·dragon 소재`);
    }
    expectNone(bad);
  });
});

test.describe('AC-17, AC-18, AC-25, AC-26: 표현 규칙', () => {
  test('AC-17: 금지 표현 목록·패턴 0건(허용 문장 제거 후)', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      for (const raw of topicTexts(t)) {
        const text = stripAllowed(raw);
        for (const term of DREAM_FORBIDDEN_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: 금지어 "${term}" in "${raw.slice(0, 30)}"`);
        for (const p of DREAM_FORBIDDEN_PATTERNS)
          if (p.test(text))
            bad.push(`${t.slug}: 금지 패턴 ${p} in "${raw.slice(0, 30)}"`);
      }
    }
    expectNone(bad);
  });

  test('AC-18: 로또 연상어 0건', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of [t.slug, ...topicTexts(t)])
        for (const term of DREAM_LOTTO_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: "${term}" in "${text.slice(0, 30)}"`);
    expectNone(bad);
  });

  test('태몽·용꿈 소재 부재(이름·별칭·slug)', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      const keys = [t.slug, t.name, t.keywordName, ...t.aliases];
      if (keys.some((k) => /태몽|용꿈|taemong|dragon/i.test(k)))
        bad.push(`${t.slug}: 태몽·용꿈 소재`);
    }
    expectNone(bad);
  });

  test('AC-26: 수치 자랑 0건', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of topicTexts(t)) {
        for (const term of DREAM_BOAST_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: "${term}" in "${text.slice(0, 30)}"`);
        for (const p of DREAM_BOAST_PATTERNS)
          if (p.test(text))
            bad.push(`${t.slug}: ${p} in "${text.slice(0, 30)}"`);
      }
    expectNone(bad);
  });

  test('AC-25: 소재 데이터에 위기 표현 0건(정규화 후)', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of topicTexts(t))
        if (hasCrisisSignal(text, CRISIS_TERMS))
          bad.push(
            `${t.slug}: 위기 표현 in "${normalizeCrisisText(text).slice(0, 30)}"`
          );
    expectNone(bad);
  });
});

test.describe('독자성: 소재 사이 같은 문장 없음', () => {
  test('FAQ 답: 답변 전체가 서로 같은 소재 없음 (끝 문장 반복은 허용)', () => {
    const seen = new Map<string, string>();
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const f of t.faq) {
        const key = norm(f.answer);
        const prev = seen.get(key);
        if (prev && prev !== t.slug)
          bad.push(`${t.slug} = ${prev}: "${f.answer.slice(0, 40)}"`);
        else seen.set(key, t.slug);
      }
    expectNone(bad);
  });

  test('본문(요약·풀이·생각해 볼 점·완화): 서로 다른 소재에 같은 문장 없음', () => {
    const seen = new Map<string, string>();
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of [t.summary, ...bodyTexts(t)])
        for (const s of splitSentences(text)) {
          const key = norm(s);
          const prev = seen.get(key);
          if (prev && prev !== t.slug)
            bad.push(`${t.slug} = ${prev}: "${s.slice(0, 40)}"`);
          else seen.set(key, t.slug);
        }
    expectNone(bad);
  });

  test('본문: 이름 자리표시 치환 후에도 같은 문장 없음', () => {
    const seen = new Map<string, string>();
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      const names = [t.keywordName, t.name].sort((a, b) => b.length - a.length);
      for (const text of [t.summary, ...bodyTexts(t)])
        for (const s of splitSentences(text)) {
          let r = s;
          for (const n of names) r = r.split(n).join('{N}');
          const key = norm(r);
          const prev = seen.get(key);
          if (prev && prev !== t.slug)
            bad.push(`${t.slug} ~ ${prev}: "${s.slice(0, 40)}"`);
          else seen.set(key, t.slug);
        }
    }
    expectNone(bad);
  });
});

test.describe('AC-33: copy-log 소재 표', () => {
  const logPath = path.join(process.cwd(), 'docs', 'dream', 'copy-log.md');
  const rows = fs
    .readFileSync(logPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.startsWith('|'))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    )
    .filter(
      (cells) =>
        cells.length >= 10 &&
        cells[0] !== 'slug' &&
        /^[a-z]+(-[a-z]+)*$/.test(cells[0])
    );

  test('AC-33: 소재 행 수 120, slug가 데이터와 한 번씩 일치', () => {
    const slugs = rows.map((r) => r[0]);
    const bad: string[] = [];
    const count = new Map<string, number>();
    for (const s of slugs) count.set(s, (count.get(s) ?? 0) + 1);
    for (const [s, n] of count) if (n > 1) bad.push(`${s}: copy-log ${n}행`);
    for (const s of SLUGS) if (!count.has(s)) bad.push(`${s}: copy-log에 없음`);
    for (const s of count.keys())
      if (!SLUGS.has(s)) bad.push(`${s}: 데이터에 없는 slug`);
    expectNone(bad);
    expect(rows.length).toBe(120);
  });

  test('AC-33: 작성자·작성일·상태 칸이 비어 있지 않음', () => {
    const bad = rows
      .filter((r) => [r[4], r[5], r[8]].some((c) => !c || c === '-'))
      .map((r) => `${r[0]}: 작성자·작성일·상태 중 빈 칸`);
    expectNone(bad);
  });
});
