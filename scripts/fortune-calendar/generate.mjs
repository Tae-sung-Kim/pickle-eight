// 운세 달력 표 생성 스크립트 (docs/fortune/design.md 4.1)
//
// 실행(사용자가 직접): PowerShell 예
//   $env:DATA_GO_KR_API_KEY='<발급받은 키>'; node scripts/fortune-calendar/generate.mjs
//
// - 음력 1919~2049년: LrsrCldInfoService/getSolCalInfo 월 단위 1,572회 + 2050년 1월 1회
// - 24절기 1920~2028년: SpcdeInfoService/get24DivisionsInfo 연 단위 109회
// - 모두 성공하고 검사를 통과한 뒤에만 두 표 파일을 쓴다(일부만 채운 표를 만들지 않는다).
// - .env 파일을 읽지 않고, 키 값을 출력·기록하지 않는다.

import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildLunarRow,
  formatLunarTable,
  formatSolarTermTable,
  kstTodayText,
  LUNAR_FIRST_YEAR,
  LUNAR_LAST_YEAR,
  pad2,
  parseSolarTermItems,
  SOLAR_TERM_FIRST_YEAR,
  SOLAR_TERM_LAST_YEAR,
  toJdn,
} from './calendar-core.mjs';
import {
  createKasiClient,
  KasiError,
  printMissingKeyGuide,
  readApiKey,
} from './kasi.mjs';

const LUNAR_SERVICE = 'LrsrCldInfoService';
const SOLAR_SERVICE = 'SpcdeInfoService';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const calendarDir = path.resolve(
  scriptDir,
  '../../src/features/fortune/constants/calendar'
);
export const LUNAR_TABLE_PATH = path.join(
  calendarDir,
  'lunar-table.constant.ts'
);
export const SOLAR_TERM_TABLE_PATH = path.join(
  calendarDir,
  'solar-term-table.constant.ts'
);

// ---------------------------------------------------------------------------
// 24절기

async function collectSolarTermYear(client, year, log) {
  const parseOptions = {
    onNormalize: ({ name, from, to }) =>
      log(
        `KASI 원본 kst 2400을 다음 날 00:00으로 정규화: 절기 ${year}년 ${name} (${from} -> ${to})`
      ),
  };
  const first = await client.request(SOLAR_SERVICE, 'get24DivisionsInfo', {
    solYear: year,
    numOfRows: 30,
  });
  if (first.items.length === 24) {
    return parseSolarTermItems(year, first.items, parseOptions);
  }

  // 24건이 아니면 월별로 다시 조회해 채운다(그래도 24건이 아니면 parse가 던져 중단한다)
  const merged = [];
  for (let month = 1; month <= 12; month += 1) {
    const monthly = await client.request(SOLAR_SERVICE, 'get24DivisionsInfo', {
      solYear: year,
      solMonth: pad2(month),
      numOfRows: 10,
    });
    merged.push(...monthly.items);
  }
  return parseSolarTermItems(year, merged, parseOptions);
}

export async function collectSolarTerms(client, log = console.log) {
  const table = {};
  for (
    let year = SOLAR_TERM_FIRST_YEAR;
    year <= SOLAR_TERM_LAST_YEAR;
    year += 1
  ) {
    table[year] = await collectSolarTermYear(client, year, log);
    if (year % 10 === 0 || year === SOLAR_TERM_LAST_YEAR) {
      log(`절기 ${year}년까지 완료 (호출 ${client.callCount}회)`);
    }
  }
  return table;
}

// ---------------------------------------------------------------------------
// 음력

function requireInt(value, label) {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) {
    throw new KasiError(`${label} 값이 숫자가 아닙니다.`);
  }
  return Number(text);
}

/**
 * 음력 (year, month)의 1일을 getSolCalInfo로 조회한다.
 * 윤달이 있는 달은 응답이 평달·윤달 두 건이므로 lunLeapmonth(평/윤)로 나눈다.
 * 반환: { regularJdn, leapJdn | null }
 */
async function collectLunarMonthStart(client, year, month) {
  const label = `음력 ${year}-${pad2(month)}`;
  const response = await client.request(LUNAR_SERVICE, 'getSolCalInfo', {
    lunYear: year,
    lunMonth: pad2(month),
    lunDay: '01',
    numOfRows: 10,
  });
  if (response.items.length < 1 || response.items.length > 2) {
    throw new KasiError(
      `${label}: 응답 항목이 ${response.items.length}건입니다(1건 또는 평달·윤달 2건이어야 함).`
    );
  }

  let regularJdn = null;
  let leapJdn = null;
  for (const item of response.items) {
    if (
      requireInt(item.lunYear, `${label} lunYear`) !== year ||
      requireInt(item.lunMonth, `${label} lunMonth`) !== month ||
      requireInt(item.lunDay, `${label} lunDay`) !== 1
    ) {
      throw new KasiError(`${label}: 응답의 음력 날짜가 요청과 다릅니다.`);
    }
    const kind = String(item.lunLeapmonth ?? '').trim();
    const solar = {
      year: requireInt(item.solYear, `${label} solYear`),
      month: requireInt(item.solMonth, `${label} solMonth`),
      day: requireInt(item.solDay, `${label} solDay`),
    };
    const jdn = toJdn(solar.year, solar.month, solar.day);
    if (kind === '평') {
      if (regularJdn !== null)
        throw new KasiError(`${label}: 평달 항목이 2건입니다.`);
      regularJdn = jdn;
    } else if (kind === '윤') {
      if (leapJdn !== null)
        throw new KasiError(`${label}: 윤달 항목이 2건입니다.`);
      leapJdn = jdn;
    } else {
      throw new KasiError(
        `${label}: lunLeapmonth 값이 '평'·'윤'이 아닙니다(실제 값: '${kind}'). 필드 이름·값을 docs/fortune/calendar-verification.md에 적고 스크립트를 맞추세요.`
      );
    }
  }
  if (regularJdn === null) {
    throw new KasiError(`${label}: 평달 항목이 없습니다.`);
  }
  return { regularJdn, leapJdn };
}

export async function collectLunarRows(client, log = console.log) {
  const starts = new Map();
  for (let year = LUNAR_FIRST_YEAR; year <= LUNAR_LAST_YEAR; year += 1) {
    const regularStartJdns = [];
    let leap = null;
    for (let month = 1; month <= 12; month += 1) {
      const start = await collectLunarMonthStart(client, year, month);
      regularStartJdns.push(start.regularJdn);
      if (start.leapJdn !== null) {
        if (leap !== null) {
          throw new KasiError(`음력 ${year}년: 윤달이 2개 이상입니다.`);
        }
        leap = { month, startJdn: start.leapJdn };
      }
    }
    starts.set(year, { regularStartJdns, leap });
    if (year % 10 === 0 || year === LUNAR_LAST_YEAR) {
      log(`음력 ${year}년까지 완료 (호출 ${client.callCount}회)`);
    }
  }

  // 2049년 마지막 달 길이를 정하려고 2050년 1월 1일(설날)을 한 번 더 조회한다
  const finalYear = LUNAR_LAST_YEAR + 1;
  const finalStart = await collectLunarMonthStart(client, finalYear, 1);
  if (finalStart.leapJdn !== null) {
    throw new KasiError(`음력 ${finalYear}-01에 윤달 항목이 있습니다.`);
  }

  const rows = [];
  for (let year = LUNAR_FIRST_YEAR; year <= LUNAR_LAST_YEAR; year += 1) {
    const { regularStartJdns, leap } = starts.get(year);
    const nextNewYearJdn =
      year === LUNAR_LAST_YEAR
        ? finalStart.regularJdn
        : starts.get(year + 1).regularStartJdns[0];
    rows.push(buildLunarRow({ year, regularStartJdns, leap, nextNewYearJdn }));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 구조 검사와 알려진 값 대조

/** 파일을 쓰기 전 마지막 구조 검사. 틀리면 던진다 */
export function assertTableStructure(lunarRows, solarTable) {
  const expectedLunarCount = LUNAR_LAST_YEAR - LUNAR_FIRST_YEAR + 1;
  if (lunarRows.length !== expectedLunarCount) {
    throw new Error(
      `음력 표 행 수가 ${lunarRows.length}입니다(${expectedLunarCount} 필요).`
    );
  }
  lunarRows.forEach((row, index) => {
    if (row.year !== LUNAR_FIRST_YEAR + index) {
      throw new Error(`음력 표 연도가 연속이 아닙니다(${row.year}).`);
    }
    const inRange =
      Number.isInteger(row.newYear) &&
      Number.isInteger(row.leapMonth) &&
      Number.isInteger(row.monthBits) &&
      row.leapMonth >= 0 &&
      row.leapMonth <= 12 &&
      row.monthBits >= 0 &&
      row.monthBits < 1 << 13 &&
      (row.leapMonth !== 0 || ((row.monthBits >> 12) & 1) === 0);
    if (!inRange) {
      throw new Error(`음력 ${row.year}년 행의 값 범위가 올바르지 않습니다.`);
    }
  });
  const solarYears = Object.keys(solarTable).map(Number);
  const expectedSolarCount = SOLAR_TERM_LAST_YEAR - SOLAR_TERM_FIRST_YEAR + 1;
  if (
    solarYears.length !== expectedSolarCount ||
    Math.min(...solarYears) !== SOLAR_TERM_FIRST_YEAR ||
    Math.max(...solarYears) !== SOLAR_TERM_LAST_YEAR
  ) {
    throw new Error('절기 표 연도 범위가 올바르지 않습니다.');
  }
  for (const year of solarYears) {
    if (solarTable[year].length !== 24) {
      throw new Error(`절기 ${year}년 항목이 24개가 아닙니다.`);
    }
  }
}

/** 설계 대조값과 다르면 경고만 한다(KASI 값을 따른다, design.md 4.1) */
export function checkKnownValues(lunarRows, solarTable) {
  const warnings = [];
  const lunar = (year) => lunarRows.find((row) => row.year === year);
  const expectations = [
    ['음력 2000 설날 양력 02-05', lunar(2000)?.newYear === 205],
    ['음력 2025 설날 양력 01-29', lunar(2025)?.newYear === 129],
    ['음력 2023 윤2월', lunar(2023)?.leapMonth === 2],
    ['음력 2025 윤6월', lunar(2025)?.leapMonth === 6],
    ['1920 입춘 02-05 11:26', solarTable[1920]?.[2] === 2051126],
    ['2025 입춘 02-03 23:10', solarTable[2025]?.[2] === 2032310],
    ['2026 입춘 02-04 05:02', solarTable[2026]?.[2] === 2040502],
  ];
  for (const [name, ok] of expectations) {
    if (!ok) warnings.push(name);
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// 파일 쓰기

async function writeAtomically(filePath, content) {
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, content, 'utf8');
  await rename(tempPath, filePath);
}

export async function generateTables(client, log = console.log) {
  const solarTable = await collectSolarTerms(client, log);
  const lunarRows = await collectLunarRows(client, log);
  assertTableStructure(lunarRows, solarTable);
  const generatedAt = kstTodayText();
  return {
    lunarText: formatLunarTable(lunarRows, generatedAt),
    solarText: formatSolarTermTable(solarTable, generatedAt),
    lunarRows,
    solarTable,
  };
}

async function main() {
  const key = readApiKey();
  if (!key) {
    printMissingKeyGuide();
    process.exit(1);
  }

  console.log(
    '달력 표 생성 시작: 예상 호출 약 1,682회(일 한도 10,000건 안). 몇 분 걸립니다.'
  );
  const client = createKasiClient({ key });
  const { lunarText, solarText, lunarRows, solarTable } =
    await generateTables(client);

  for (const name of checkKnownValues(lunarRows, solarTable)) {
    console.warn(
      `경고: 설계 대조값과 다름 - ${name} (KASI 값을 표에 씁니다. BE-1c에서 확인)`
    );
  }

  await mkdir(calendarDir, { recursive: true });
  await writeAtomically(LUNAR_TABLE_PATH, lunarText);
  await writeAtomically(SOLAR_TERM_TABLE_PATH, solarText);
  console.log(`완료: 총 호출 ${client.callCount}회`);
  console.log(`- ${path.relative(process.cwd(), LUNAR_TABLE_PATH)}`);
  console.log(`- ${path.relative(process.cwd(), SOLAR_TERM_TABLE_PATH)}`);
  console.log('다음: node scripts/fortune-calendar/verify.mjs');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(
      `중단: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
    console.error('표 파일을 쓰지 않았습니다.');
    process.exit(1);
  });
}
