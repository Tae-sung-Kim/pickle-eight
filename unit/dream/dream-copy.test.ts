import { describe, expect, test } from 'vitest';
import { CRISIS_TERMS } from '@/constants/crisis-term.constant';
import {
  DREAM_BOAST_PATTERNS,
  DREAM_BOAST_TERMS,
  DREAM_COPY_ALLOWED_SENTENCES,
  DREAM_FORBIDDEN_PATTERNS,
  DREAM_FORBIDDEN_TERMS,
  DREAM_LOTTO_TERMS,
} from '@/features/dream/constants/dream-copy-rule.constant';
import { DREAM_TOPICS } from '@/features/dream/constants/dream-topics.constant';
import { hasCrisisSignal, normalizeCrisisText } from '@/lib/crisis-signal';

type TopicType = (typeof DREAM_TOPICS)[number];

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

function topicTexts(t: TopicType): string[] {
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

function bodyTexts(t: TopicType): string[] {
  const list = [...t.folk, ...t.reflection];
  if (t.sensitivity !== 'none') list.push(...t.soothing);
  return list;
}

describe('AC-5 f: 문장 수·길이·분량', () => {
  test('AC-10: 한 줄 요약 1문장 20~80자, "."로 끝남', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      const len = [...t.summary].length;
      if (len < 20 || len > 80) bad.push(`${t.slug}: summary ${len}자`);
      if (!t.summary.endsWith('.')) bad.push(`${t.slug}: 마침표 없음`);
      if (splitSentences(t.summary).length !== 1)
        bad.push(`${t.slug}: summary 문장 수`);
    }
    expect(bad).toEqual([]);
  });

  test('AC-10: 민간 풀이 3~5, 생각해 볼 점 2~3, 각 원소 "."로 끝남', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      if (t.folk.length < 3 || t.folk.length > 5)
        bad.push(`${t.slug}: folk ${t.folk.length}문장`);
      if (t.reflection.length < 2 || t.reflection.length > 3)
        bad.push(`${t.slug}: reflection ${t.reflection.length}문장`);
      for (const [i, s] of t.folk.entries())
        if (!s.trim().endsWith('.')) bad.push(`${t.slug}: folk[${i}]`);
      for (const [i, s] of t.reflection.entries())
        if (!s.trim().endsWith('.')) bad.push(`${t.slug}: reflection[${i}]`);
    }
    expect(bad).toEqual([]);
  });

  test('AC-10: 민간 풀이+생각해 볼 점 분량 공백 포함 300자 이상', () => {
    const bad = DREAM_TOPICS.map((t) => ({
      slug: t.slug,
      len: [...[...t.folk, ...t.reflection].join(' ')].length,
    }))
      .filter((x) => x.len < 300)
      .map((x) => `${x.slug}: ${x.len}자`);
    expect(bad).toEqual([]);
  });

  test('AC-14: FAQ 2개, 질문·답 비어 있지 않고 답은 "."로 끝남', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      if (t.faq.length !== 2) bad.push(`${t.slug}: faq ${t.faq.length}개`);
      for (const f of t.faq) {
        if (!f.question.trim() || !f.answer.trim())
          bad.push(`${t.slug}: faq 빈 값`);
        if (!f.answer.trim().endsWith('.'))
          bad.push(`${t.slug}: faq 답 마침표 없음`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('AC-5 f: 표현 규칙', () => {
  test('AC-17: 금지 표현 목록·패턴 0건(허용 문장 제거 후)', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS) {
      for (const raw of topicTexts(t)) {
        const text = stripAllowed(raw);
        for (const term of DREAM_FORBIDDEN_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: 금지어 "${term}" in "${raw.slice(0, 30)}"`);
        for (const p of DREAM_FORBIDDEN_PATTERNS)
          if (new RegExp(p.source, p.flags.replace(/[gy]/g, '')).test(text))
            bad.push(`${t.slug}: 금지 패턴 ${p} in "${raw.slice(0, 30)}"`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('AC-18: 로또 연상어 0건', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of [t.slug, ...topicTexts(t)])
        for (const term of DREAM_LOTTO_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: "${term}" in "${text.slice(0, 30)}"`);
    expect(bad).toEqual([]);
  });

  test('AC-26: 수치 자랑 0건', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of topicTexts(t)) {
        for (const term of DREAM_BOAST_TERMS)
          if (text.includes(term))
            bad.push(`${t.slug}: "${term}" in "${text.slice(0, 30)}"`);
        for (const p of DREAM_BOAST_PATTERNS)
          if (new RegExp(p.source, p.flags.replace(/[gy]/g, '')).test(text))
            bad.push(`${t.slug}: ${p} in "${text.slice(0, 30)}"`);
      }
    expect(bad).toEqual([]);
  });

  test('AC-25: 소재 데이터에 위기 표현 0건(정규화 후)', () => {
    const bad: string[] = [];
    for (const t of DREAM_TOPICS)
      for (const text of topicTexts(t))
        if (hasCrisisSignal(text, CRISIS_TERMS))
          bad.push(`${t.slug}: "${normalizeCrisisText(text).slice(0, 30)}"`);
    expect(bad).toEqual([]);
  });
});

describe('독자성: 소재 사이 같은 문장 없음', () => {
  test('FAQ 답: 답변 전체가 서로 같은 소재 없음', () => {
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
    expect(bad).toEqual([]);
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
    expect(bad).toEqual([]);
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
    expect(bad).toEqual([]);
  });
});
