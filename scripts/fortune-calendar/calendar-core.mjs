// 운세 달력 표 생성·검증 스크립트의 공용 순수 함수 (네트워크·파일·환경변수 접근 없음)
// 표 형식은 docs/fortune/design.md 3장(fortune-calendar.type.ts)과 4.1을 따른다.

export const SOLAR_TERM_NAMES = [
  '소한',
  '대한',
  '입춘',
  '우수',
  '경칩',
  '춘분',
  '청명',
  '곡우',
  '입하',
  '소만',
  '망종',
  '하지',
  '소서',
  '대서',
  '입추',
  '처서',
  '백로',
  '추분',
  '한로',
  '상강',
  '입동',
  '소설',
  '대설',
  '동지',
];

export const LUNAR_FIRST_YEAR = 1919;
export const LUNAR_LAST_YEAR = 2049;
export const SOLAR_TERM_FIRST_YEAR = 1920;
export const SOLAR_TERM_LAST_YEAR = 2028;

/** 양력(그레고리력) 날짜 -> 율리우스 일수(JDN) */
export function toJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** JDN -> 양력 { year, month, day } */
export function fromJdn(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    year: 100 * b + d - 4800 + Math.floor(m / 10),
    month: m + 3 - 12 * Math.floor(m / 10),
    day: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

export function isValidSolarDate(year, month, day) {
  if (![year, month, day].every(Number.isInteger)) return false;
  const back = fromJdn(toJdn(year, month, day));
  return back.year === year && back.month === month && back.day === day;
}

export function pad2(value) {
  return String(value).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// 음력 표

/**
 * 음력 한 해의 평·윤달 순서와 길이.
 * 반환: [{ month, isLeap, startJdn, length }] (달 순서대로, 윤달은 같은 번호 평달 바로 뒤)
 */
export function monthSpans(row) {
  const newYearMonth = Math.floor(row.newYear / 100);
  const newYearDay = row.newYear % 100;
  let cursor = toJdn(row.year, newYearMonth, newYearDay);
  const spans = [];
  for (let month = 1; month <= 12; month += 1) {
    const regularLength = (row.monthBits >> (month - 1)) & 1 ? 30 : 29;
    spans.push({
      month,
      isLeap: false,
      startJdn: cursor,
      length: regularLength,
    });
    cursor += regularLength;
    if (row.leapMonth === month) {
      const leapLength = (row.monthBits >> 12) & 1 ? 30 : 29;
      spans.push({ month, isLeap: true, startJdn: cursor, length: leapLength });
      cursor += leapLength;
    }
  }
  return spans;
}

/**
 * KASI 응답에서 모은 한 해의 달 시작일로 표의 한 행을 만든다. 값이 이상하면 던진다.
 * - regularStartJdns: 평달 1~12월 1일의 JDN (길이 12)
 * - leap: { month, startJdn } 또는 null
 * - nextNewYearJdn: 다음 음력 해 1월 1일(설날)의 JDN
 */
export function buildLunarRow({
  year,
  regularStartJdns,
  leap,
  nextNewYearJdn,
}) {
  if (regularStartJdns.length !== 12) {
    throw new Error(`음력 ${year}년: 평달 시작일이 12개가 아닙니다.`);
  }
  const sequence = [];
  for (let month = 1; month <= 12; month += 1) {
    sequence.push({
      month,
      isLeap: false,
      startJdn: regularStartJdns[month - 1],
    });
    if (leap && leap.month === month) {
      sequence.push({ month, isLeap: true, startJdn: leap.startJdn });
    }
  }
  if (leap && !sequence.some((entry) => entry.isLeap)) {
    throw new Error(
      `음력 ${year}년: 윤달 번호(${leap.month})가 올바르지 않습니다.`
    );
  }

  let monthBits = 0;
  let totalDays = 0;
  sequence.forEach((entry, index) => {
    const next =
      index + 1 < sequence.length
        ? sequence[index + 1].startJdn
        : nextNewYearJdn;
    const length = next - entry.startJdn;
    if (length !== 29 && length !== 30) {
      throw new Error(
        `음력 ${year}년 ${entry.month}월${entry.isLeap ? '(윤달)' : ''}: 달 길이 ${length}일은 29·30이 아닙니다.`
      );
    }
    totalDays += length;
    if (length === 30) {
      monthBits |= 1 << (entry.isLeap ? 12 : entry.month - 1);
    }
  });

  const hasLeap = sequence.length === 13;
  const dayRangeOk = hasLeap
    ? totalDays >= 383 && totalDays <= 385
    : totalDays >= 353 && totalDays <= 355;
  if (!dayRangeOk) {
    throw new Error(
      `음력 ${year}년: 한 해 일수 ${totalDays}일이 범위를 벗어났습니다.`
    );
  }

  const newYearDate = fromJdn(regularStartJdns[0]);
  const newYearOk =
    newYearDate.year === year &&
    ((newYearDate.month === 1 && newYearDate.day >= 20) ||
      (newYearDate.month === 2 && newYearDate.day <= 21));
  if (!newYearOk) {
    throw new Error(
      `음력 ${year}년: 설날(양력 ${newYearDate.year}-${pad2(newYearDate.month)}-${pad2(newYearDate.day)})이 1/20~2/21 범위를 벗어났습니다.`
    );
  }

  return {
    year,
    newYear: newYearDate.month * 100 + newYearDate.day,
    leapMonth: leap ? leap.month : 0,
    monthBits,
  };
}

/** 표로 양력 -> 음력. 표 범위 밖이면 null */
export function solarToLunar(rows, year, month, day) {
  const jdn = toJdn(year, month, day);
  for (const row of rows) {
    const spans = monthSpans(row);
    const last = spans[spans.length - 1];
    if (jdn < spans[0].startJdn || jdn >= last.startJdn + last.length) continue;
    for (const span of spans) {
      if (jdn < span.startJdn + span.length) {
        return {
          year: row.year,
          month: span.month,
          isLeap: span.isLeap,
          day: jdn - span.startJdn + 1,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 24절기 표

/**
 * KASI get24DivisionsInfo의 한 해 응답 항목 -> 길이 24 배열(MMDD * 10000 + HHMM).
 * sunLongitude는 비어 있어 쓰지 않고 dateName으로 인덱스를 정한다.
 * kst '2400'만 다음 날 00:00으로 정규화하고(onNormalize로 알림), 그 밖의 범위 밖 시각은 던진다.
 */
export function parseSolarTermItems(year, items, { onNormalize } = {}) {
  if (items.length !== 24) {
    throw new Error(
      `절기 ${year}년: 항목이 ${items.length}건입니다(24건 필요).`
    );
  }
  const values = new Array(24).fill(null);
  for (const item of items) {
    const name = String(item.dateName ?? '').trim();
    const index = SOLAR_TERM_NAMES.indexOf(name);
    if (index < 0) {
      throw new Error(
        `절기 ${year}년: 알 수 없는 절기 이름이 있습니다(${name}).`
      );
    }
    if (values[index] !== null) {
      throw new Error(`절기 ${year}년: 절기 이름 ${name}이 중복됩니다.`);
    }
    const locdate = String(item.locdate ?? '').trim();
    if (!/^\d{8}$/.test(locdate)) {
      throw new Error(`절기 ${year}년 ${name}: locdate 형식 오류.`);
    }
    const locYear = Number(locdate.slice(0, 4));
    const locMonth = Number(locdate.slice(4, 6));
    const locDay = Number(locdate.slice(6, 8));
    if (locYear !== year || !isValidSolarDate(locYear, locMonth, locDay)) {
      throw new Error(
        `절기 ${year}년 ${name}: 날짜(${locdate})가 올바르지 않습니다.`
      );
    }
    if (locMonth !== Math.floor(index / 2) + 1) {
      throw new Error(
        `절기 ${year}년 ${name}: ${locMonth}월은 예상 월과 다릅니다.`
      );
    }
    const kst = String(item.kst ?? '').trim();
    if (!/^\d{4}$/.test(kst)) {
      throw new Error(`절기 ${year}년 ${name}: kst 형식 오류.`);
    }
    let hour = Number(kst.slice(0, 2));
    const minute = Number(kst.slice(2, 4));
    let month = locMonth;
    let day = locDay;
    if (kst === '2400') {
      // KASI 원본에 24:00이 있다(1950년 대한). 같은 날 끝 자정 = 다음 날 00:00으로 정규화한다.
      const next = fromJdn(toJdn(locYear, locMonth, locDay) + 1);
      if (next.year !== year) {
        throw new Error(
          `절기 ${year}년 ${name}: kst 2400을 올리면 다음 해(${next.year})가 되어 이 해의 표에 둘 수 없습니다.`
        );
      }
      month = next.month;
      day = next.day;
      hour = 0;
      onNormalize?.({
        year,
        name,
        from: `${pad2(locMonth)}${pad2(locDay)} 2400`,
        to: `${pad2(month)}${pad2(day)} 0000`,
      });
    } else if (hour > 23 || minute > 59) {
      throw new Error(`절기 ${year}년 ${name}: 시각 범위 오류.`);
    }
    values[index] = (month * 100 + day) * 10000 + hour * 100 + minute;
  }
  for (let index = 1; index < 24; index += 1) {
    if (values[index] <= values[index - 1]) {
      throw new Error(`절기 ${year}년: 절기 시각이 오름차순이 아닙니다.`);
    }
  }
  return values;
}

// ---------------------------------------------------------------------------
// 표 파일 출력·읽기 (형식이 정해져 있어 정규식으로 다시 읽는다)

const FILE_HEAD_IGNORE = '// biome-ignore-all format: 자동 생성 파일';

function buildHeader({ title, apiName, rangeText, generatedAt, formatNote }) {
  return [
    FILE_HEAD_IGNORE,
    `// 자동 생성 파일(${title}). 직접 수정하지 않는다.`,
    '// 생성: scripts/fortune-calendar/generate.mjs로 다시 만든다.',
    `// 생성일: ${generatedAt} (KST)`,
    `// 출처: 한국천문연구원(KASI) ${apiName} (공공데이터포털 Open API)`,
    `// 범위: ${rangeText}`,
    `// 형식: ${formatNote}`,
  ].join('\n');
}

export function formatLunarTable(rows, generatedAt) {
  const header = buildHeader({
    title: '음력 표',
    apiName: '음양력 정보 LrsrCldInfoService/getSolCalInfo',
    rangeText: `음력 ${rows[0].year}~${rows[rows.length - 1].year}년`,
    generatedAt,
    formatNote:
      'newYear = 음력 1월 1일의 양력 MMDD, leapMonth = 윤달 번호(없으면 0), monthBits = 평달 1~12월은 bit0~bit11, 윤달은 bit12 (1이면 30일, 0이면 29일)',
  });
  const body = rows
    .map(
      (row) =>
        `  { year: ${row.year}, newYear: ${row.newYear}, leapMonth: ${row.leapMonth}, monthBits: ${row.monthBits} },`
    )
    .join('\n');
  return `${header}

import type { FortuneLunarYearType } from '@/features/fortune/types/fortune-calendar.type';

export const FORTUNE_LUNAR_TABLE: readonly FortuneLunarYearType[] = [
${body}
];
`;
}

export function formatSolarTermTable(table, generatedAt) {
  const years = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
  const header = buildHeader({
    title: '24절기 표',
    apiName: '특일 정보 SpcdeInfoService/get24DivisionsInfo',
    rangeText: `양력 ${years[0]}~${years[years.length - 1]}년`,
    generatedAt,
    formatNote:
      '연도별 길이 24 배열(인덱스 0 소한 ~ 23 동지). 값 = 월일 * 10000 + 시분(KST). 예: 2032310 = 2월 3일 23:10',
  });
  const body = years
    .map((year) => {
      const values = table[year];
      const lines = [];
      for (let start = 0; start < 24; start += 6) {
        lines.push(`    ${values.slice(start, start + 6).join(', ')},`);
      }
      return `  ${year}: [\n${lines.join('\n')}\n  ],`;
    })
    .join('\n');
  return `${header}

import type { FortuneSolarTermYearType } from '@/features/fortune/types/fortune-calendar.type';

export const FORTUNE_SOLAR_TERM_TABLE: Readonly<
  Record<number, FortuneSolarTermYearType>
> = {
${body}
};
`;
}

export function parseLunarTableText(text) {
  const pattern =
    /\{\s*year:\s*(\d+),\s*newYear:\s*(\d+),\s*leapMonth:\s*(\d+),\s*monthBits:\s*(\d+),?\s*\}/g;
  const rows = [];
  for (const match of text.matchAll(pattern)) {
    rows.push({
      year: Number(match[1]),
      newYear: Number(match[2]),
      leapMonth: Number(match[3]),
      monthBits: Number(match[4]),
    });
  }
  return rows;
}

export function parseSolarTermTableText(text) {
  const pattern = /^\s*(\d{4}):\s*\[([^\]]*)\]/gm;
  const table = {};
  for (const match of text.matchAll(pattern)) {
    table[Number(match[1])] = match[2]
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part !== '')
      .map(Number);
  }
  return table;
}

/** KST 기준 오늘 'YYYY-MM-DD' */
export function kstTodayText(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
