import { beforeEach, describe, expect, it, vi } from 'vitest';

const getWeather = vi.fn();
vi.mock('@/features/meal/services/meal-weather.repository', () => ({
  mealWeatherRepository: { getWeather: (r: string) => getWeather(r) },
}));

import { GET } from '@/app/api/meal/weather/route';

let seq = 0;
const newIp = () => `10.0.${Math.floor(++seq / 250)}.${seq % 250}`;
const call = (query: string, ip = newIp()) =>
  GET(
    new Request(`http://localhost/api/meal/weather${query}`, {
      headers: { 'x-forwarded-for': ip },
    })
  );

beforeEach(() => {
  getWeather.mockReset();
  getWeather.mockResolvedValue({
    condition: 'rain',
    forecastDate: '2026-06-10',
    minCelsius: 4,
    maxCelsius: 9,
    currentCelsius: 6,
  });
});

describe('GET /api/meal/weather', () => {
  it.each([
    [''],
    ['?region='],
    ['?region=Seoul'],
    ['?region=%20seoul'],
    ['?region=__proto__'],
  ])('잘못된 region "%s" 는 400 invalid_region', async (q) => {
    const res = await call(q);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_region' });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('정상이면 200과 다섯 키만, 다른 쿼리는 무시', async () => {
    const res = await call('?region=seoul&foo=bar&serviceKey=x');
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual([
      'condition',
      'currentCelsius',
      'forecastDate',
      'maxCelsius',
      'minCelsius',
    ]);
    expect(getWeather).toHaveBeenCalledWith('seoul');
    const text = JSON.stringify(body);
    for (const s of ['seoul', '서울', 'nx', 'ny', 'serviceKey']) {
      expect(text).not.toContain(s);
    }
  });

  it('repository가 throw하면 503 weather_unavailable', async () => {
    getWeather.mockRejectedValue(new Error('secret-key-123'));
    const res = await call('?region=seoul');
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ error: 'weather_unavailable' });
    expect(text).not.toContain('secret-key-123');
  });

  it('같은 IP 31번째는 429, IP가 다르면 분리', async () => {
    const ip = newIp();
    for (let i = 0; i < 30; i++) {
      expect((await call('?region=seoul', ip)).status).toBe(200);
    }
    const res = await call('?region=seoul', ip);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limited' });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect((await call('?region=seoul', newIp())).status).toBe(200);
  });
});
