import { NextResponse } from 'next/server';
import { mealWeatherRepository } from '@/features/meal/services/meal-weather.repository';
import { isMealWeatherRegionKey } from '@/features/meal/utils/meal-weather.util';

const RATE_LIMIT_WINDOW_MS = 60_000 as const; // 1 minute
const RATE_LIMIT_MAX = 30 as const; // max requests per IP per window
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for') || '';
  const ip = xf.split(',')[0]?.trim();
  return ip || req.headers.get('x-real-ip') || 'unknown';
}

function checkRate(req: Request): boolean {
  const ip = getClientIp(req);
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now > rec.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

const json = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: NO_STORE });

export async function GET(request: Request) {
  if (!checkRate(request)) return json({ error: 'rate_limited' }, 429);

  const region = new URL(request.url).searchParams.get('region');
  if (!isMealWeatherRegionKey(region)) {
    return json({ error: 'invalid_region' }, 400);
  }

  try {
    return json(await mealWeatherRepository.getWeather(region), 200);
  } catch {
    return json({ error: 'weather_unavailable' }, 503);
  }
}
