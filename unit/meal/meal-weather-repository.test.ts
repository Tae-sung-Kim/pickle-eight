import { describe, expect, it, vi } from 'vitest';
import {
  createMealWeatherRepository,
  MealWeatherError,
} from '@/features/meal/services/meal-weather.repository';

const KEY = 'ab%c+d/e==';
const START = Date.parse('2026-06-10T03:00:00Z'); // KST 12:00
const MIN = 60_000;

const ok = (items: unknown[]) => ({
  ok: true,
  json: async () => ({
    response: {
      header: { resultCode: '00' },
      body: { items: { item: items } },
    },
  }),
});
const bad = { ok: false, json: async () => ({}) };
const forecastItems = [
  { category: 'PTY', fcstDate: '20260610', fcstValue: '0' },
  { category: 'TMX', fcstDate: '20260610', fcstValue: '30' },
  { category: 'TMN', fcstDate: '20260610', fcstValue: '22' },
];
const nowcastItems = [
  { category: 'PTY', obsrValue: '1' },
  { category: 'T1H', obsrValue: '20' },
];
const isNowcast = (url: string) => url.includes('getUltraSrtNcst');

function setup(
  handler?: (url: string) => unknown,
  opts: { apiKey?: string } = {}
) {
  let t = START;
  const fetchImpl = vi.fn(async (url: string, _init?: RequestInit) => {
    const custom = handler?.(url);
    if (custom !== undefined) return custom;
    return isNowcast(url) ? ok(nowcastItems) : ok(forecastItems);
  });
  const repo = createMealWeatherRepository({
    apiKey: opts.apiKey ?? KEY,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    now: () => new Date(t),
  });
  return {
    repo,
    fetchImpl,
    setNow: (ms: number) => {
      t = ms;
    },
  };
}

describe('meal weather repository', () => {
  // 지역당 단기예보+초단기실황 2회 호출이 기본이라 호출 수는 캐시 실패 1회당 2
  it('같은 지역 2회 호출은 기상청 호출 2회(단기예보+실황)만 쓴다', async () => {
    const { repo, fetchImpl } = setup();
    const a = await repo.getWeather('seoul');
    const b = await repo.getWeather('seoul');
    expect(a).toEqual(b);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(a).toEqual({
      condition: 'hot',
      forecastDate: '2026-06-10',
      minCelsius: 22,
      maxCelsius: 30,
      currentCelsius: 20,
    });
  });

  it('단기예보 실패 시 실황으로 대체하고 실황 값으로 분류한다', async () => {
    const { repo, fetchImpl } = setup((u) => (isNowcast(u) ? undefined : bad));
    expect((await repo.getWeather('seoul')).condition).toBe('rain');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    await repo.getWeather('seoul');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('PTY·TMX·TMN이 모두 없으면 실황을 호출한다', async () => {
    const { repo, fetchImpl } = setup((u) =>
      isNowcast(u)
        ? undefined
        : ok([{ category: 'TMP', fcstDate: '20260610', fcstValue: '9' }])
    );
    expect((await repo.getWeather('seoul')).condition).toBe('rain');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('둘 다 실패하면 MealWeatherError', async () => {
    const { repo } = setup(() => bad);
    await expect(repo.getWeather('seoul')).rejects.toBeInstanceOf(
      MealWeatherError
    );
  });

  it('캐시 59분 뒤엔 그대로, 60분 뒤엔 다시 호출한다', async () => {
    const { repo, fetchImpl, setNow } = setup();
    await repo.getWeather('seoul');
    setNow(START + 59 * MIN);
    await repo.getWeather('seoul');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    setNow(START + 60 * MIN);
    await repo.getWeather('seoul');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('다른 지역은 따로 호출한다', async () => {
    const { repo, fetchImpl } = setup();
    await repo.getWeather('seoul');
    await repo.getWeather('busan');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('자정(KST) 전후는 새 호출', async () => {
    const { repo, fetchImpl, setNow } = setup((u) =>
      !isNowcast(u) &&
      u.includes('base_date=20260610') &&
      u.includes('base_time=2300')
        ? ok(forecastItems.map((i) => ({ ...i, fcstDate: '20260611' })))
        : undefined
    );
    setNow(Date.parse('2026-06-10T14:59:00Z'));
    const a = await repo.getWeather('seoul');
    setNow(Date.parse('2026-06-10T15:00:00Z'));
    const b = await repo.getWeather('seoul');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(a.forecastDate).toBe('2026-06-10');
    expect(b.forecastDate).toBe('2026-06-11');
  });

  it('같은 지역 동시 호출 2개는 fetch 2회(한 쌍)', async () => {
    const { repo, fetchImpl } = setup();
    await Promise.all([repo.getWeather('seoul'), repo.getWeather('seoul')]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  const failures: [string, () => unknown][] = [
    [
      '네트워크 오류',
      () => {
        throw new TypeError(`fail ${KEY}`);
      },
    ],
    [
      'resultCode 03',
      () => ({
        ok: true,
        json: async () => ({ response: { header: { resultCode: '03' } } }),
      }),
    ],
    [
      'XML 본문',
      () => ({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      }),
    ],
    ['res.ok false', () => bad],
  ];
  it.each(failures)('%s 는 캐시하지 않는다', async (_n, fail) => {
    let failing = true;
    const { repo, fetchImpl } = setup(() => (failing ? fail() : undefined));
    await expect(repo.getWeather('seoul')).rejects.toBeInstanceOf(
      MealWeatherError
    );
    const calls = fetchImpl.mock.calls.length;
    failing = false;
    await expect(repo.getWeather('seoul')).resolves.toBeDefined();
    expect(fetchImpl.mock.calls.length).toBeGreaterThan(calls);
  });

  it('키가 없으면 fetch 없이 에러', async () => {
    const { repo, fetchImpl } = setup(undefined, { apiKey: '' });
    await expect(repo.getWeather('seoul')).rejects.toBeInstanceOf(
      MealWeatherError
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('에러 메시지에 키·인코딩 키·지역 key가 없다', async () => {
    const { repo } = setup(() => {
      throw new TypeError(`boom ${KEY} ${encodeURIComponent(KEY)}`);
    });
    const err = await repo.getWeather('jeonnam-gwangju').catch((e) => e);
    expect(err).toBeInstanceOf(MealWeatherError);
    for (const s of [KEY, encodeURIComponent(KEY), 'jeonnam-gwangju']) {
      expect(String(err.message)).not.toContain(s);
    }
  });

  it('요청 URL·옵션 검사', async () => {
    const { repo, fetchImpl } = setup((u) => (isNowcast(u) ? undefined : bad));
    await repo.getWeather('seoul');
    const [[fUrl, fOpt], [nUrl]] = fetchImpl.mock.calls;
    const f = new URL(fUrl);
    expect(f.pathname).toMatch(/getVilageFcst$/);
    expect(f.searchParams.get('nx')).toBe('60');
    expect(f.searchParams.get('ny')).toBe('127');
    expect(f.searchParams.get('base_date')).toBe('20260610');
    expect(f.searchParams.get('base_time')).toBe('0200');
    expect(f.searchParams.get('dataType')).toBe('JSON');
    expect(f.searchParams.get('numOfRows')).toBe('1000');
    // 한 번만 인코딩: 디코드하면 원본, 이중 인코딩이면 %25가 남는다
    expect(f.searchParams.get('serviceKey')).toBe(KEY);
    expect(fUrl).not.toContain('%2525');
    expect(fOpt?.cache).toBe('no-store');
    expect(fOpt?.signal).toBeInstanceOf(AbortSignal);
    const n = new URL(nUrl);
    expect(n.pathname).toMatch(/getUltraSrtNcst$/);
    expect(n.searchParams.get('numOfRows')).toBe('10');
    expect(n.searchParams.get('dataType')).toBe('JSON');
    expect(n.searchParams.get('base_date')).toBe('20260610');
    expect(n.searchParams.get('base_time')).toMatch(/^\d{4}$/);
    expect(n.searchParams.get('nx')).toBe('60');
    expect(n.searchParams.get('serviceKey')).toBe(KEY);
  });
});

describe('meal weather repository 기온', () => {
  const fc = (tmn: string, tmx: string) =>
    ok([
      { category: 'PTY', fcstDate: '20260610', fcstValue: '0' },
      { category: 'TMN', fcstDate: '20260610', fcstValue: tmn },
      { category: 'TMX', fcstDate: '20260610', fcstValue: tmx },
    ]);
  const nc = (t1h: string) =>
    ok([
      { category: 'PTY', obsrValue: '0' },
      { category: 'T1H', obsrValue: t1h },
    ]);
  const route = (f: unknown, n: unknown) => (u: string) =>
    isNowcast(u) ? n : f;

  it('단기예보만 성공하면 200이고 currentCelsius는 null', async () => {
    const { repo } = setup(route(undefined, bad));
    expect(await repo.getWeather('seoul')).toEqual({
      condition: 'hot',
      forecastDate: '2026-06-10',
      minCelsius: 22,
      maxCelsius: 30,
      currentCelsius: null,
    });
  });

  it('실황만 성공하면 min/max는 null, 분류는 실황 값', async () => {
    const { repo } = setup(route(bad, undefined));
    expect(await repo.getWeather('seoul')).toEqual({
      condition: 'rain',
      forecastDate: '2026-06-10',
      minCelsius: null,
      maxCelsius: null,
      currentCelsius: 20,
    });
  });

  it('둘 다 자료가 없으면 MealWeatherError', async () => {
    const { repo } = setup(route(ok([]), ok([])));
    await expect(repo.getWeather('seoul')).rejects.toBeInstanceOf(
      MealWeatherError
    );
  });

  it.each([
    ['3.5', 4],
    ['3.4', 3],
    ['-0.4', 0],
    ['28.0', 28],
  ])('실황 %s 는 %i 로 반올림, -0 아님', async (raw, want) => {
    const { repo } = setup(route(bad, nc(raw)));
    const { currentCelsius } = await repo.getWeather('seoul');
    expect(currentCelsius).toBe(want);
    expect(Object.is(currentCelsius, -0)).toBe(false);
  });

  it('단기예보 min/max도 반올림하고 -0이 없다', async () => {
    const { repo } = setup(route(fc('-0.4', '3.5'), bad));
    const r = await repo.getWeather('seoul');
    expect(r.maxCelsius).toBe(4);
    expect(r.minCelsius).toBe(0);
    expect(Object.is(r.minCelsius, -0)).toBe(false);
  });

  it('분류는 반올림 전 값: max 27.6은 normal, 응답은 28', async () => {
    const { repo } = setup(route(fc('10', '27.6'), nc('20')));
    const r = await repo.getWeather('seoul');
    expect(r.condition).toBe('normal');
    expect(r.maxCelsius).toBe(28);
  });
});
