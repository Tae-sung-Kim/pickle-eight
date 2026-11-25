import { describe, expect, test } from 'vitest';
import {
  buildNoSonMonth,
  buildNoSonYear,
  getNoSonDayInfo,
  getNoSonDaysYears,
  getNoSonInitialMonth,
  getNoSonTodayStatus,
  isNoSonLunarDay,
  moveNoSonMonth,
  parseNoSonDaysYear,
} from '@/features/no-son-days/utils/no-son-days.util';
import { fromJulianDayNumber, toJulianDayNumber } from '@/lib/date';

const START = toJulianDayNumber({ year: 2026, month: 1, day: 1 });
const END = toJulianDayNumber({ year: 2049, month: 12, day: 31 });

function allInfos() {
  const out = [];
  for (let jdn = START; jdn <= END; jdn += 1) {
    out.push(getNoSonDayInfo(fromJulianDayNumber(jdn)));
  }
  return out;
}

describe('손 없는 날 규칙', () => {
  test('AC-4, U-1: 음력 끝자리 9·0만 참', () => {
    for (let d = 1; d <= 30; d += 1) {
      expect(isNoSonLunarDay(d), `day ${d}`).toBe(
        [9, 10, 19, 20, 29, 30].includes(d)
      );
    }
  });

  test('AC-4, AC-13, U-2: 2026년 11·12월 손 없는 날이 표와 같다', () => {
    const noSon = (m: number) =>
      (buildNoSonMonth(2026, m)?.days ?? []).filter((d) => d.isNoSonDay);
    expect(noSon(11).map((d) => d.solar.day)).toEqual([8, 17, 18, 27, 28]);
    expect(noSon(12).map((d) => d.solar.day)).toEqual([7, 8, 17, 18, 27, 28]);
    const lunar = (m: number) =>
      noSon(m).map((d) => `${d.lunar.month}.${d.lunar.day}`);
    expect(lunar(11)).toEqual(['9.29', '10.9', '10.10', '10.19', '10.20']);
    expect(lunar(12)).toEqual([
      '10.29',
      '10.30',
      '11.9',
      '11.10',
      '11.19',
      '11.20',
    ]);
  });

  test('AC-4, U-3: 표시 범위 전체가 null이 아니다', () => {
    expect(allInfos().filter((i) => i === null)).toHaveLength(0);
  });

  test('AC-4, U-4: 음력 달별 손 없는 날 개수 (29일 달 5, 30일 달 6)', () => {
    type Acc = { count: number; noSon: number; max: number };
    const months = new Map<string, Acc>();
    const infos = allInfos();
    const keyOf = (l: { year: number; month: number; isLeapMonth: boolean }) =>
      `${l.year}-${l.month}-${l.isLeapMonth}`;
    for (const i of infos) {
      if (!i) continue;
      const key = keyOf(i.lunar);
      const acc = months.get(key) ?? { count: 0, noSon: 0, max: 0 };
      acc.count += 1;
      if (i.isNoSonDay) acc.noSon += 1;
      acc.max = Math.max(acc.max, i.lunar.day);
      months.set(key, acc);
    }
    const firstKey = keyOf(
      infos[0]?.lunar ?? { year: 0, month: 0, isLeapMonth: false }
    );
    const lastKey = keyOf(
      infos[infos.length - 1]?.lunar ?? {
        year: 0,
        month: 0,
        isLeapMonth: false,
      }
    );
    let checked = 0;
    for (const [key, acc] of months) {
      expect(acc.noSon, key).toBeLessThanOrEqual(6);
      if (key === firstKey || key === lastKey) continue;
      expect(acc.count, key).toBe(acc.max);
      expect([29, 30], key).toContain(acc.max);
      expect(acc.noSon, key).toBe(acc.max === 29 ? 5 : 6);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(250);
  });

  test('AC-4, U-5: 윤달 날짜는 isLeapMonth true, 규칙 동일', () => {
    const leap = allInfos().filter(
      (i) => i?.lunar.year === 2028 && i.lunar.isLeapMonth
    );
    expect(leap.length).toBeGreaterThan(0);
    for (const i of leap) {
      expect(i?.lunar.month).toBe(5);
      expect(i?.isNoSonDay).toBe(isNoSonLunarDay(i?.lunar.day ?? 0));
    }
  });

  test('AC-5, U-6: getNoSonTodayStatus', () => {
    const a = getNoSonTodayStatus({ year: 2026, month: 11, day: 25 });
    if (a.kind !== 'in-range') throw new Error('in-range 기대');
    expect(a.today.isNoSonDay).toBe(false);
    expect(a.next?.day.dateKey).toBe('2026-11-27');
    expect(a.next?.daysUntil).toBe(2);

    const b = getNoSonTodayStatus({ year: 2026, month: 11, day: 27 });
    if (b.kind !== 'in-range') throw new Error('in-range 기대');
    expect(b.today.isNoSonDay).toBe(true);
    expect(b.next?.day.dateKey).toBe('2026-11-28');
    expect(b.next?.daysUntil).toBe(1);

    const last = allInfos()
      .filter((i) => i?.isNoSonDay)
      .pop();
    const c = getNoSonTodayStatus(last?.solar ?? { year: 0, month: 1, day: 1 });
    expect(c.kind === 'in-range' && c.next === null).toBe(true);
    const e = getNoSonTodayStatus({ year: 2049, month: 12, day: 31 });
    expect(e.kind === 'in-range' && e.next === null).toBe(true);

    expect(getNoSonTodayStatus({ year: 2050, month: 1, day: 1 }).kind).toBe(
      'out-of-range'
    );
    expect(getNoSonTodayStatus({ year: 2025, month: 12, day: 31 }).kind).toBe(
      'out-of-range'
    );
  });

  test('AC-6, U-7: parseNoSonDaysYear, getNoSonDaysYears', () => {
    expect(parseNoSonDaysYear('2026')).toBe(2026);
    expect(parseNoSonDaysYear('2049')).toBe(2049);
    for (const v of ['2025', '2050', '02027', '2027a', '', ' 2027']) {
      expect(parseNoSonDaysYear(v), v).toBeNull();
    }
    expect(getNoSonDaysYears()).toHaveLength(24);
  });

  test('AC-2, U-8: moveNoSonMonth', () => {
    expect(moveNoSonMonth({ year: 2026, month: 1 }, -1)).toBeNull();
    expect(moveNoSonMonth({ year: 2049, month: 12 }, 1)).toBeNull();
    expect(moveNoSonMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(moveNoSonMonth({ year: 2027, month: 1 }, -1)).toEqual({
      year: 2026,
      month: 12,
    });
  });

  test('AC-3, U-9: buildNoSonYear', () => {
    const y = buildNoSonYear(2027);
    expect(y?.months).toHaveLength(12);
    for (const m of y?.months ?? []) {
      const built = buildNoSonMonth(2027, m.month);
      expect(m.noSonDays).toEqual(built?.days.filter((d) => d.isNoSonDay));
    }
    expect(buildNoSonYear(2025)).toBeNull();
    expect(buildNoSonYear(2050)).toBeNull();
  });

  test('AC-1, 2, 5, U-10: getNoSonInitialMonth', () => {
    const cases: [[number, number, number], [number, number]][] = [
      [
        [2026, 11, 25],
        [2026, 11],
      ],
      [
        [2026, 1, 1],
        [2026, 1],
      ],
      [
        [2049, 12, 31],
        [2049, 12],
      ],
      [
        [2025, 12, 31],
        [2026, 1],
      ],
      [
        [2020, 6, 15],
        [2026, 1],
      ],
      [
        [2050, 1, 1],
        [2049, 12],
      ],
      [
        [2060, 3, 10],
        [2049, 12],
      ],
    ];
    for (const [[year, month, day], [ey, em]] of cases) {
      const cur = getNoSonInitialMonth({ year, month, day });
      expect(cur, `${year}-${month}-${day}`).toEqual({ year: ey, month: em });
      expect(buildNoSonMonth(cur.year, cur.month)).not.toBeNull();
      if (ey === 2026 && em === 1) expect(moveNoSonMonth(cur, -1)).toBeNull();
      if (ey === 2049 && em === 12) expect(moveNoSonMonth(cur, 1)).toBeNull();
    }
  });
});
