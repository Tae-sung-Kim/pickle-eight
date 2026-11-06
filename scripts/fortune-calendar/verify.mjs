// 운세 달력 표 검증 스크립트 (docs/fortune/design.md 4.1 "생성과 검증")
//
// 실행(사용자가 직접): PowerShell 예
//   $env:DATA_GO_KR_API_KEY='<발급받은 키>'; node scripts/fortune-calendar/verify.mjs
//   (옵션) --count=80  무작위 포함 총 표본 수(60 이상, 기본 80)
//   (옵션) --seed=12345 무작위 시드(같은 값이면 같은 표본)
//   (옵션) --offline   네트워크·키 없이 알려진 값 대조만 실행
//
// - 생성에 쓴 getSolCalInfo(음력->양력)와 다른 API인 getLunCalInfo(양력->음력)로
//   양력 날짜를 다시 조회해, 표로 계산한 음력 날짜·윤달 여부와 비교한다.
// - 같은 응답의 lunIljin(일진)을 2단계 사주 검증용 표본으로 verify-result.json에 저장한다.
//   (lunWolgeon은 음력월 기준이라 절기 월주와 다를 수 있어 비교에 쓰지 않는다)
// - .env 파일을 읽지 않고, 키 값을 출력·기록하지 않는다.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fromJdn,
  kstTodayText,
  LUNAR_FIRST_YEAR,
  LUNAR_LAST_YEAR,
  monthSpans,
  pad2,
  parseLunarTableText,
  parseSolarTermTableText,
  SOLAR_TERM_FIRST_YEAR,
  SOLAR_TERM_LAST_YEAR,
  solarToLunar,
  toJdn,
} from './calendar-core.mjs';
import { LUNAR_TABLE_PATH, SOLAR_TERM_TABLE_PATH } from './generate.mjs';
import {
  createKasiClient,
  KasiError,
  printMissingKeyGuide,
  readApiKey,
} from './kasi.mjs';

const MIN_SAMPLE_COUNT = 60;
const DEFAULT_SAMPLE_COUNT = 80;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const RESULT_PATH = path.join(scriptDir, 'verify-result.json');

function parseArgs(argv) {
  const options = {
    count: DEFAULT_SAMPLE_COUNT,
    seed: Date.now() % 2147483647,
    offline: false,
  };
  for (const arg of argv) {
    if (arg === '--offline') options.offline = true;
    else if (arg.startsWith('--count=')) options.count = Number(arg.slice(8));
    else if (arg.startsWith('--seed=')) options.seed = Number(arg.slice(7));
    else throw new Error(`알 수 없는 옵션: ${arg}`);
  }
  if (!Number.isInteger(options.count) || options.count < MIN_SAMPLE_COUNT) {
    throw new Error(`--count는 ${MIN_SAMPLE_COUNT} 이상의 정수여야 합니다.`);
  }
  if (!Number.isInteger(options.seed)) {
    throw new Error('--seed는 정수여야 합니다.');
  }
  return options;
}

/** mulberry32 시드 난수 */
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ymdText = ({ year, month, day }) => `${year}-${pad2(month)}-${pad2(day)}`;
const lunarText = (lunar) =>
  `${lunar.year}-${pad2(lunar.month)}-${pad2(lunar.day)}${lunar.isLeap ? '(윤)' : ''}`;

// ---------------------------------------------------------------------------
// 표 읽기와 알려진 값 대조 (네트워크 없음)

async function loadTables() {
  let lunarFile;
  let solarFile;
  try {
    lunarFile = await readFile(LUNAR_TABLE_PATH, 'utf8');
    solarFile = await readFile(SOLAR_TERM_TABLE_PATH, 'utf8');
  } catch {
    throw new Error(
      '표 파일이 없습니다. 먼저 node scripts/fortune-calendar/generate.mjs를 실행하세요.'
    );
  }
  const lunarRows = parseLunarTableText(lunarFile);
  const solarTable = parseSolarTermTableText(solarFile);
  if (
    lunarRows.length !== LUNAR_LAST_YEAR - LUNAR_FIRST_YEAR + 1 ||
    lunarRows[0].year !== LUNAR_FIRST_YEAR ||
    lunarRows[lunarRows.length - 1].year !== LUNAR_LAST_YEAR
  ) {
    throw new Error('음력 표 범위가 1919~2049와 다릅니다.');
  }
  const solarYears = Object.keys(solarTable).map(Number);
  if (
    Math.min(...solarYears) !== SOLAR_TERM_FIRST_YEAR ||
    Math.max(...solarYears) !== SOLAR_TERM_LAST_YEAR
  ) {
    throw new Error('절기 표 범위가 1920~2028과 다릅니다.');
  }
  return { lunarRows, solarTable };
}

function termValueText(value) {
  const hhmm = value % 10000;
  const mmdd = Math.floor(value / 10000);
  return `${pad2(Math.floor(mmdd / 100))}-${pad2(mmdd % 100)} ${pad2(Math.floor(hhmm / 100))}:${pad2(hhmm % 100)}`;
}

function runKnownValueChecks(lunarRows, solarTable) {
  const lunarRow = (year) => lunarRows.find((row) => row.year === year);
  const expectNewYear = (lunarYear, solarText, mmdd) => ({
    name: `음력 ${lunarYear}-01-01 -> 양력 ${solarText}`,
    actual: lunarRow(lunarYear)?.newYear,
    expected: mmdd,
    show: (v) => String(v),
  });
  const expectTerm = (year, index, name, text) => {
    const [datePart, timePart] = text.split(' ');
    const [mm, dd] = datePart.split('-').map(Number);
    const [hh, mi] = timePart.split(':').map(Number);
    return {
      name: `${year} ${name}(인덱스 ${index}) ${text}`,
      actual: solarTable[year]?.[index],
      expected: (mm * 100 + dd) * 10000 + hh * 100 + mi,
      show: (v) => (v === undefined ? '없음' : termValueText(v)),
    };
  };
  const checks = [
    expectNewYear(2025, '2025-01-29', 129),
    expectNewYear(2000, '2000-02-05', 205),
    expectTerm(1920, 2, '입춘', '02-05 11:26'),
    expectTerm(1950, 2, '입춘', '02-04 18:21'),
    expectTerm(2025, 2, '입춘', '02-03 23:10'),
    expectTerm(2026, 2, '입춘', '02-04 05:02'),
    expectTerm(2024, 5, '춘분', '03-20 12:06'),
    expectTerm(2025, 5, '춘분', '03-20 18:01'),
    expectTerm(2026, 5, '춘분', '03-20 23:46'),
    expectTerm(2027, 5, '춘분', '03-21 05:25'),
  ];
  const lunarChecks = [
    [1920, 2, 5, '1919-12-16'],
    [2026, 2, 4, '2025-12-17'],
  ].map(([y, m, d, expected]) => {
    const lunar = solarToLunar(lunarRows, y, m, d);
    return {
      name: `양력 ${y}-${pad2(m)}-${pad2(d)} -> 음력 ${expected}`,
      actual: lunar ? lunarText(lunar) : null,
      expected,
      show: (v) => String(v),
    };
  });
  const leapCheck = {
    name: '음력 2023년 윤달 번호 2(윤2월)',
    actual: lunarRow(2023)?.leapMonth,
    expected: 2,
    show: (v) => String(v),
  };

  let failed = 0;
  console.log('\n[알려진 값 대조: 표 값 vs 설계 문서 값]');
  for (const check of [...checks, ...lunarChecks, leapCheck]) {
    const ok = check.actual === check.expected;
    if (!ok) failed += 1;
    console.log(
      `${ok ? '일치' : '불일치'} | ${check.name}${ok ? '' : ` | 표 값: ${check.show(check.actual)}`}`
    );
  }
  return failed;
}

// ---------------------------------------------------------------------------
// 양력->음력 표본 대조 (getLunCalInfo)

function pickSamples(lunarRows, count, seed) {
  const random = createRandom(seed);
  const seen = new Set();
  const samples = [];
  const add = (year, month, day, kind) => {
    const key = `${year}-${month}-${day}`;
    if (seen.has(key)) return;
    seen.add(key);
    samples.push({ year, month, day, kind });
  };

  // 경계와 알려진 날짜
  for (const [y, m, d] of [
    [1920, 1, 1],
    [1920, 2, 5],
    [2000, 2, 5],
    [2025, 1, 29],
    [2026, 2, 4],
    [2028, 12, 31],
  ]) {
    add(y, m, d, '고정');
  }

  // 윤달 구간 표본: 윤달이 있는 해 6개를 골라 윤달 안의 날짜 하나씩
  const leapRows = lunarRows.filter(
    (row) => row.leapMonth !== 0 && row.year >= 1920 && row.year <= 2028
  );
  const leapPicks = [...leapRows].sort(() => random() - 0.5).slice(0, 6);
  if (!leapPicks.some((row) => row.year === 2023)) {
    const row2023 = lunarRows.find((row) => row.year === 2023);
    if (row2023?.leapMonth) leapPicks.push(row2023);
  }
  for (const row of leapPicks) {
    const leapSpan = monthSpans(row).find((span) => span.isLeap);
    const jdn = leapSpan.startJdn + Math.floor(random() * leapSpan.length);
    const solar = fromJdn(jdn);
    add(solar.year, solar.month, solar.day, '윤달');
  }

  // 나머지는 1920-01-01 ~ 2028-12-31 무작위
  const startJdn = toJdn(1920, 1, 1);
  const endJdn = toJdn(2028, 12, 31);
  while (samples.length < count) {
    const solar = fromJdn(
      startJdn + Math.floor(random() * (endJdn - startJdn + 1))
    );
    add(solar.year, solar.month, solar.day, '무작위');
  }
  return samples;
}

async function fetchLunarOf(client, sample) {
  const response = await client.request('LrsrCldInfoService', 'getLunCalInfo', {
    solYear: sample.year,
    solMonth: pad2(sample.month),
    solDay: pad2(sample.day),
  });
  if (response.items.length !== 1) {
    throw new KasiError(
      `양력 ${ymdText(sample)}: 응답 항목이 ${response.items.length}건입니다.`
    );
  }
  const item = response.items[0];
  const lunar = {
    year: Number(item.lunYear),
    month: Number(item.lunMonth),
    day: Number(item.lunDay),
    isLeap: String(item.lunLeapmonth ?? '').trim() === '윤',
  };
  const leapText = String(item.lunLeapmonth ?? '').trim();
  if (
    ![lunar.year, lunar.month, lunar.day].every(Number.isInteger) ||
    (leapText !== '평' && leapText !== '윤')
  ) {
    throw new KasiError(
      `양력 ${ymdText(sample)}: 응답의 음력 필드를 읽을 수 없습니다.`
    );
  }
  return {
    lunar,
    lunIljin: String(item.lunIljin ?? '').trim(),
    lunSecha: String(item.lunSecha ?? '').trim(),
    lunWolgeon: String(item.lunWolgeon ?? '').trim(),
  };
}

async function runSampleChecks(client, lunarRows, options) {
  const samples = pickSamples(lunarRows, options.count, options.seed);
  console.log(
    `\n[양력->음력 표본 대조 ${samples.length}건, 시드 ${options.seed}] getLunCalInfo(생성에 쓴 getSolCalInfo와 다른 API)`
  );
  const results = [];
  for (const sample of samples) {
    const table = solarToLunar(
      lunarRows,
      sample.year,
      sample.month,
      sample.day
    );
    const api = await fetchLunarOf(client, sample);
    const match =
      table !== null &&
      table.year === api.lunar.year &&
      table.month === api.lunar.month &&
      table.day === api.lunar.day &&
      table.isLeap === api.lunar.isLeap;
    results.push({
      sol: ymdText(sample),
      jdn: toJdn(sample.year, sample.month, sample.day),
      kind: sample.kind,
      table: table ? lunarText(table) : null,
      api: lunarText(api.lunar),
      match,
      lunIljin: api.lunIljin,
      lunSecha: api.lunSecha,
      lunWolgeon: api.lunWolgeon,
    });
    console.log(
      `${match ? '일치' : '불일치'} | ${ymdText(sample)} (${sample.kind}) | 표 ${table ? lunarText(table) : '범위 밖'} | API ${lunarText(api.lunar)} | 일진 ${api.lunIljin}`
    );
  }
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let client = null;
  if (!options.offline) {
    const key = readApiKey();
    if (!key) {
      printMissingKeyGuide();
      process.exit(1);
    }
    client = createKasiClient({ key });
  }

  const { lunarRows, solarTable } = await loadTables();
  console.log(
    `표 범위: 음력 ${LUNAR_FIRST_YEAR}~${LUNAR_LAST_YEAR}, 절기 ${SOLAR_TERM_FIRST_YEAR}~${SOLAR_TERM_LAST_YEAR}`
  );
  const knownFailed = runKnownValueChecks(lunarRows, solarTable);
  if (options.offline) {
    console.log(
      `\n알려진 값 불일치 ${knownFailed}건 (--offline: 표본 대조 생략)`
    );
    process.exit(knownFailed === 0 ? 0 : 1);
  }

  const results = await runSampleChecks(client, lunarRows, options);
  const mismatches = results.filter((result) => !result.match);

  await writeFile(
    RESULT_PATH,
    `${JSON.stringify(
      {
        verifiedAt: kstTodayText(),
        apis: {
          lunarTableSource: 'LrsrCldInfoService/getSolCalInfo',
          crossCheck: 'LrsrCldInfoService/getLunCalInfo',
        },
        tableRange: {
          lunar: [LUNAR_FIRST_YEAR, LUNAR_LAST_YEAR],
          solarTerm: [SOLAR_TERM_FIRST_YEAR, SOLAR_TERM_LAST_YEAR],
        },
        seed: options.seed,
        sampleCount: results.length,
        matched: results.length - mismatches.length,
        mismatched: mismatches.length,
        knownValueMismatched: knownFailed,
        // 2단계 사주 getDayPillar 검증용 일진 표본(문자열은 KASI 원문)
        samples: results,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    `\n요약: 표본 ${results.length}건 중 일치 ${results.length - mismatches.length}건, 불일치 ${mismatches.length}건. 알려진 값 불일치 ${knownFailed}건. 호출 ${client.callCount}회.`
  );
  console.log(`결과 저장: ${path.relative(process.cwd(), RESULT_PATH)}`);
  process.exit(mismatches.length === 0 && knownFailed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(
    `중단: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
  );
  process.exit(1);
});
