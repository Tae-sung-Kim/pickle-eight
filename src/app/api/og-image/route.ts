import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '기본 제목';
  const subtitle =
    searchParams.get('subtitle') || '랜덤 추첨, 게임, AI 퀴즈의 모든 것';

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F3F4F6;" />
          <stop offset="100%" style="stop-color:#E5E7EB;" />
        </linearGradient>
        <style>
          .title { font-family: 'CalSans-SemiBold', 'Inter', sans-serif; font-size: 90px; font-weight: 600; fill: #111827; }
          .subtitle { font-family: 'Inter', sans-serif; font-size: 45px; fill: #4B5563; }
        </style>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGradient)" />
      <g transform="translate(600, 280)">
        <text text-anchor="middle" class="title">${title}</text>
      </g>
      <g transform="translate(600, 360)">
        <text text-anchor="middle" class="subtitle">${subtitle}</text>
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
