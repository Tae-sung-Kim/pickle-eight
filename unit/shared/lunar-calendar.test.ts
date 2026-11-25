import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { LUNAR_TABLE } from '@/constants/lunar-table.constant';
import { convertLunarToSolar } from '@/features/fortune/utils/fortune-lunar.util';
import { fromJulianDayNumber, toJulianDayNumber } from '@/lib/date';
import { convertSolarToLunar } from '@/lib/lunar-calendar';

const START = toJulianDayNumber({ year: 2026, month: 1, day: 1 });
const END = toJulianDayNumber({ year: 2049, month: 12, day: 31 });

describe('공용 음력 변환', () => {
  test('AC-4, L-1: 2026~2049 매일 양력→음력→양력 왕복', () => {
    const bad: string[] = [];
    for (let jdn = START; jdn <= END; jdn += 1) {
      const s = fromJulianDayNumber(jdn);
      const l = convertSolarToLunar(s);
      if (!l) {
        bad.push(`${s.year}-${s.month}-${s.day}: null`);
        continue;
      }
      const back = convertLunarToSolar(l.year, l.month, l.day, l.isLeapMonth);
      const ok = JSON.stringify(back).includes(
        `"year":${s.year},"month":${s.month},"day":${s.day}`
      );
      if (!ok) bad.push(`${s.year}-${s.month}-${s.day}`);
    }
    expect(bad.slice(0, 5)).toEqual([]);
  });

  test('AC-4, L-2: 연속성, 설날은 표의 newYear', () => {
    let prev = convertSolarToLunar(fromJulianDayNumber(START));
    const bad: string[] = [];
    for (let jdn = START + 1; jdn <= END; jdn += 1) {
      const cur = convertSolarToLunar(fromJulianDayNumber(jdn));
      if (!prev || !cur) {
        bad.push(`null@${jdn}`);
        break;
      }
      const sameMonth =
        cur.year === prev.year &&
        cur.month === prev.month &&
        cur.isLeapMonth === prev.isLeapMonth;
      if (sameMonth) {
        if (cur.day !== prev.day + 1) bad.push(`day@${jdn}`);
      } else if (cur.day !== 1 || ![29, 30].includes(prev.day)) {
        bad.push(`month@${jdn}`);
      }
      prev = cur;
    }
    expect(bad.slice(0, 5)).toEqual([]);
    for (const row of LUNAR_TABLE) {
      if (row.year < 2026 || row.year > 2049) continue;
      expect(
        convertSolarToLunar({
          year: row.year,
          month: Math.floor(row.newYear / 100),
          day: row.newYear % 100,
        })
      ).toEqual({ year: row.year, month: 1, day: 1, isLeapMonth: false });
    }
  });

  // USER-1이 만드는 고정값 파일이 있을 때만 돈다
  const fixture = join(__dirname, 'fixtures', 'kasi-lunar-2026-2049.json');
  test.skipIf(!existsSync(fixture))('AC-13, L-3: KASI 고정값 대조', () => {
    const raw = JSON.parse(readFileSync(fixture, 'utf8'));
    const samples: { sol: string; api: string; match: boolean }[] = raw.samples;
    expect(samples.length).toBeGreaterThan(0);
    expect(raw.mismatched).toBe(0);
    expect(raw.matched).toBe(raw.sampleCount);
    expect(samples).toHaveLength(raw.sampleCount);
    const bad: string[] = [];
    for (const s of samples) {
      const [y, m, d] = s.sol.split('-').map(Number);
      const l = convertSolarToLunar({ year: y, month: m, day: d });
      const got = l
        ? `${l.year}-${String(l.month).padStart(2, '0')}-${String(l.day).padStart(2, '0')}${l.isLeapMonth ? '(윤)' : ''}`
        : 'null';
      if (got !== s.api) bad.push(`${s.sol}: ${got} != ${s.api}`);
    }
    expect(bad).toEqual([]);
  });

  test('L-4: 표 범위 밖은 null', () => {
    expect(convertSolarToLunar({ year: 1919, month: 1, day: 30 })).toBeNull();
    expect(convertSolarToLunar({ year: 1800, month: 1, day: 1 })).toBeNull();
    expect(convertSolarToLunar({ year: 2050, month: 1, day: 23 })).toBeNull();
    expect(convertSolarToLunar({ year: 2060, month: 6, day: 1 })).toBeNull();
  });
});
