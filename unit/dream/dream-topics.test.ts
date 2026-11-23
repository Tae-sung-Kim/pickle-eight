import { describe, expect, test } from 'vitest';
import { DREAM_CATEGORIES } from '@/features/dream/constants/dream-category.constant';
import { DREAM_DEATH_SUPPLEMENT_TEXT } from '@/features/dream/constants/dream-notice.constant';
import {
  DREAM_TOPIC_COUNT,
  DREAM_TOPICS,
} from '@/features/dream/constants/dream-topics.constant';

const EXPECTED_COUNTS: Record<string, number> = {
  animal: 24,
  people: 14,
  body: 12,
  nature: 14,
  action: 24,
  object: 24,
  death: 8,
};

function norm(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

describe('AC-5 f: 소재 개수·slug·이름·별칭', () => {
  test('AC-42: 소재 120개, 카테고리별 개수', () => {
    expect(DREAM_TOPIC_COUNT).toBe(120);
    expect(DREAM_TOPICS).toHaveLength(120);
    expect(DREAM_CATEGORIES).toHaveLength(7);
    for (const c of DREAM_CATEGORIES) {
      const n = DREAM_TOPICS.filter((t) => t.category === c.key).length;
      expect(n, `${c.key} 개수`).toBe(EXPECTED_COUNTS[c.key]);
    }
  });

  test('AC-43: slug 형식(영문 소문자·하이픈, 40자 이하)·중복 없음', () => {
    const bad = DREAM_TOPICS.filter(
      (t) => !/^[a-z]+(-[a-z]+)*$/.test(t.slug) || t.slug.length > 40
    ).map((t) => t.slug);
    expect(bad).toEqual([]);
    expect(new Set(DREAM_TOPICS.map((t) => t.slug)).size).toBe(
      DREAM_TOPICS.length
    );
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
    expect(bad).toEqual([]);
  });
});

describe('AC-13, AC-23: 관련 소재·민감 소재', () => {
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
          bad.push(`${t.slug}: related "${r}" 다른 카테고리`);
      }
    }
    expect(bad).toEqual([]);
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
    expect(bad).toEqual([]);
  });

  test('AC-23: 죽음 소재 보충 문장 상수가 있고 sensitivity death 소재가 1개 이상', () => {
    expect(DREAM_DEATH_SUPPLEMENT_TEXT).toContain('실제 죽음');
    expect(DREAM_TOPICS.some((t) => t.sensitivity === 'death')).toBe(true);
  });

  test('12지 동물 11개 isTtiAnimal, 모두 동물, 용·dragon 없음', () => {
    const tti = DREAM_TOPICS.filter((t) => t.isTtiAnimal);
    expect(tti).toHaveLength(11);
    const bad: string[] = [];
    for (const t of tti) {
      if (t.category !== 'animal') bad.push(`${t.slug}: 동물이 아님`);
    }
    for (const t of DREAM_TOPICS) {
      const keys = [t.name, t.keywordName, ...t.aliases];
      if (
        /dragon/i.test(t.slug) ||
        keys.some(
          (k) => t.category === 'animal' && /^용(꿈)?$|용꿈|^용 /.test(k)
        )
      )
        bad.push(`${t.slug}: 용·dragon 소재`);
    }
    expect(bad).toEqual([]);
  });

  test('태몽·용꿈 소재 부재(이름·별칭·slug)', () => {
    const bad = DREAM_TOPICS.filter((t) =>
      [t.slug, t.name, t.keywordName, ...t.aliases].some((k) =>
        /태몽|용꿈|taemong|dragon/i.test(k)
      )
    ).map((t) => t.slug);
    expect(bad).toEqual([]);
  });
});
