import { NextResponse } from 'next/server';

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(input: string, maxLen: number): string {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1) + '…';
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? current + ' ' + w : w;
    if (test.length > maxCharsPerLine) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || '기본 제목';
  const rawSubtitle =
    searchParams.get('subtitle') || '랜덤 추첨, 게임, AI 퀴즈의 모든 것';
  const rawTag = searchParams.get('tag') || '';

  // sanitize + clamp
  const title = escapeXml(clamp(rawTitle, 80));
  const subtitle = escapeXml(clamp(rawSubtitle, 120));
  const tag = escapeXml(clamp(rawTag, 24));

  // wrapping
  const titleLines = wrapText(title, 20).slice(0, 3);
  const subtitleLines = wrapText(subtitle, 30).slice(0, 2);

  const titleSvg = titleLines
    .map(
      (line, idx) =>
        `<tspan x="0" dy="${idx === 0 ? 0 : 1.2}em">${line}</tspan>`
    )
    .join('');
  const subtitleSvg = subtitleLines
    .map(
      (line, idx) =>
        `<tspan x="0" dy="${idx === 0 ? 0 : 1.3}em">${line}</tspan>`
    )
    .join('');

  const showTag = Boolean(tag);

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F8FAFC;" />
          <stop offset="100%" style="stop-color:#EEF2FF;" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" stroke-opacity="0.04" stroke-width="1"/>
        </pattern>
        <style>
          .title { font-family: 'Inter', 'Noto Sans KR', system-ui, -apple-system, sans-serif; font-size: 72px; font-weight: 800; fill: #0F172A; letter-spacing: -0.02em; }
          .subtitle { font-family: 'Inter', 'Noto Sans KR', system-ui, -apple-system, sans-serif; font-size: 36px; font-weight: 500; fill: #334155; }
          .brand { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 28px; font-weight: 700; fill: #2563EB; letter-spacing: 0.02em; }
          .pill { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 28px; font-weight: 700; fill: #1E293B; }
        </style>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGradient)" />
      <rect width="1200" height="630" fill="url(#grid)" />

      <!-- tag pill -->
      ${
        showTag
          ? `
      <g transform="translate(64, 90)">
        <rect rx="14" ry="14" width="auto" height="50" fill="rgba(255,255,255,0.8)" stroke="#CBD5E1" stroke-width="1" />
        <text x="0" y="0" class="pill">
          <tspan x="16" dy="1.2em">${tag}</tspan>
        </text>
      </g>`
          : ''
      }

      <!-- title -->
      <g transform="translate(120, ${showTag ? 180 : 140})">
        <text class="title">
          ${titleSvg}
        </text>
      </g>

      <!-- subtitle -->
      <g transform="translate(120, ${showTag ? 380 : 360})">
        <text class="subtitle">
          ${subtitleSvg}
        </text>
      </g>

      <!-- brand footer -->
      <g transform="translate(120, 560)">
        <text class="brand">Pickle Eight</text>
      </g>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // 24시간 캐시
    },
  });
}
