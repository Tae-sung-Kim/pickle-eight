import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  MEAL_FORBIDDEN_PATTERNS,
  MEAL_FORBIDDEN_TERMS,
} from '@/features/meal/constants/meal-copy-rule.constant';
import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import * as notice from '@/features/meal/constants/meal-notice.constant';

const TAGS = ['snow', 'rain', 'hot', 'cold'] as const;
const RANDOM_TAIL = '결과는 여전히 무작위예요.';

const weatherTexts = (): [string, string][] =>
  Object.entries(notice)
    .filter(([k]) => k.startsWith('MEAL_WEATHER'))
    .flatMap(([k, v]): [string, string][] =>
      typeof v === 'string'
        ? [[k, v]]
        : typeof v === 'object' && v
          ? Object.values(v).map((x): [string, string] => [k, String(x)])
          : []
    );

describe('meal-weather 문구', () => {
  test('날씨 상수 전부가 금지어·패턴을 통과한다', () => {
    const all = weatherTexts();
    expect(all.length).toBeGreaterThan(10);
    const found = all.flatMap(([k, t]) => [
      ...MEAL_FORBIDDEN_TERMS.filter((w) => t.includes(w)).map(
        (w) => `${k}:${w}`
      ),
      ...MEAL_FORBIDDEN_PATTERNS.filter((re) =>
        new RegExp(re.source, re.flags.replace(/[gy]/g, '')).test(t)
      ).map((re) => `${k}:${re}`),
    ]);
    expect(found).toEqual([]);
  });

  test('한 줄 문구 4키, 각 문장에 무작위 꼬리, getMealWeatherLine 일치', () => {
    expect(Object.keys(notice.MEAL_WEATHER_LINES).sort()).toEqual(
      [...TAGS].sort()
    );
    for (const t of TAGS) {
      const line = notice.getMealWeatherLine(t);
      expect(line).toBe(notice.MEAL_WEATHER_LINES[t]);
      expect(line).toContain(RANDOM_TAIL);
    }
  });

  test('안내 2줄, 출처 URL https, 출처 문구 필수 단어', () => {
    expect(notice.MEAL_WEATHER_NOTICE_LINES).toHaveLength(2);
    expect(notice.MEAL_WEATHER_SOURCE_URL.startsWith('https://')).toBe(true);
    for (const w of [
      '기상청',
      '공공데이터포털',
      '공공누리',
      notice.MEAL_WEATHER_SOURCE_URL,
    ]) {
      expect(notice.MEAL_WEATHER_SOURCE_TEXT, w).toContain(w);
    }
  });

  test('FAQ 6개, 질문 중복 없음', () => {
    expect(MEAL_FAQ).toHaveLength(6);
    expect(new Set(MEAL_FAQ.map((f) => f.question)).size).toBe(6);
  });

  test('meal 상수 전체에 "같은 확률"·"추천하거나 평가하지"가 없다', () => {
    const dir = join(process.cwd(), 'src/features/meal/constants');
    const hits = readdirSync(dir)
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => {
        const s = readFileSync(join(dir, f), 'utf8');
        return s.includes('같은 확률') || s.includes('추천하거나 평가하지');
      });
    expect(hits).toEqual([]);
  });
});
