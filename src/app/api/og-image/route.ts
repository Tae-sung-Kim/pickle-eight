import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

function clamp(input: string, maxLen: number): string {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1) + '…';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || 'Pickle Eight';
  const rawSubtitle =
    searchParams.get('subtitle') ||
    '랜덤 추첨 · 로또 · 자리배정 · 퀴즈의 모든 것';
  const rawTag = searchParams.get('tag') || '';

  const title = clamp(rawTitle, 80);
  const subtitle = clamp(rawSubtitle, 120);
  const tag = clamp(rawTag, 24);

  const brandColor = '#0ea5e9'; // tailwind sky-500 equivalent

  // Build without JSX to keep this file as .ts
  const Root = React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background:
          'linear-gradient(135deg, #FFF7D6 0%, #FFE1F5 50%, #E7E3FF 100%)',
        fontFamily: 'Noto Sans KR, Pretendard, Inter, Arial, sans-serif',
      },
    },
    // overlay
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(1000px 400px at 0% 0%, rgba(255,255,255,0.6), transparent), radial-gradient(800px 300px at 100% 100%, rgba(255,255,255,0.6), transparent)',
      },
    }),
    // content wrapper
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          margin: '0 auto',
          width: 1000,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        },
      },
      // optional tag pill
      tag
        ? React.createElement(
            'div',
            {
              style: {
                padding: '8px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: '#111827',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.2,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              },
            },
            tag
          )
        : null,
      // title
      React.createElement(
        'h1',
        {
          style: {
            fontSize: 72,
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: -1.2,
            color: '#111827',
            margin: 0,
            textShadow: '0 1px 0 rgba(255,255,255,0.7)',
            maxWidth: 1000,
            whiteSpace: 'pre-wrap',
          },
        },
        title
      ),
      // subtitle
      React.createElement(
        'p',
        {
          style: {
            fontSize: 34,
            lineHeight: 1.35,
            fontWeight: 600,
            color: '#374151',
            margin: 0,
            maxWidth: 1000,
            whiteSpace: 'pre-wrap',
          },
        },
        subtitle
      ),
      // brand row
      React.createElement(
        'div',
        {
          style: {
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#6B7280',
            fontSize: 26,
            fontWeight: 600,
          },
        },
        React.createElement(
          'svg',
          { width: 28, height: 28, viewBox: '0 0 24 24', fill: '#6B7280' },
          React.createElement('path', {
            d: 'M12 2C6.48 2 2 5.58 2 10c0 2.53 1.61 4.78 4.07 6.18-.15.56-.54 2.02-.62 2.35-.1.41.15.81.56.91.24.06.48.01.67-.14.28-.21 1.79-1.3 2.52-1.83.73.1 1.48.16 2.27.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z',
          })
        ),
        React.createElement(
          'span',
          null,
          'Pickle Eight · 랜덤 추첨 · 로또 · 자리배정 · 퀴즈'
        ),
        React.createElement(
          'span',
          { style: { color: brandColor, marginLeft: 8 } },
          '|'
        ),
        React.createElement(
          'span',
          { style: { color: brandColor, marginLeft: 8 } },
          'pickle-eight.com'
        )
      )
    )
  );

  return new ImageResponse(Root, {
    width: WIDTH,
    height: HEIGHT,
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
