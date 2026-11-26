import type { NextConfig } from 'next';

const isProd = process.env.VERCEL_ENV === 'production';

function buildCsp(): string {
  const vercelLive = 'https://vercel.live';
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    // Note: 'unsafe-eval' will be added only in development below
    'https://pagead2.googlesyndication.com',
    'https://t1.daumcdn.net',
    'https://*.kakaocdn.net',
    'https://*.daumcdn.net',
    'https://securepubads.g.doubleclick.net',
    'https://sdk.privacy-center.org',
    'https://s0.2mdn.net',
  ];
  const scriptSrcElem = [
    "'self'",
    "'unsafe-inline'",
    'https://pagead2.googlesyndication.com',
    'https://t1.daumcdn.net',
    'https://*.kakaocdn.net',
    'https://*.daumcdn.net',
    'https://securepubads.g.doubleclick.net',
    'https://sdk.privacy-center.org',
    'https://s0.2mdn.net',
  ];
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://s3.us-east-1.amazonaws.com',
    'https://cdn.jsdelivr.net',
  ];
  const fontSrc = ["'self'", 'data:', 'https://cdn.jsdelivr.net'];
  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://*.daumcdn.net',
    'https://*.kakaocdn.net',
    // AdFit 노출·노출 확인(viewable) 신호 이미지
    'https://*.ds.kakao.com',
    'https://*.g.doubleclick.net',
    'https://securepubads.g.doubleclick.net',
    'https://s0.2mdn.net',
  ];
  const mediaSrc = ["'self'", 'blob:', 'data:'];
  const frameSrc = [
    "'self'",
    'https://googleads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://securepubads.g.doubleclick.net',
    'https://*.daum.net',
    'https://*.kakao.com',
    'https://t1.daumcdn.net',
    'https://*.daumcdn.net',
    'https://*.kakaocdn.net',
  ];
  const connectSrc = ["'self'", 'https:'];

  if (!isProd) {
    // Dev-only allowances
    scriptSrc.push("'unsafe-eval'", vercelLive);
    // 개발 모드 <Analytics/>가 debug 스크립트를 여기서 불러온다 (운영은 same-origin)
    scriptSrcElem.push(vercelLive, 'https://va.vercel-scripts.com');
    frameSrc.push(vercelLive);
    connectSrc.push(vercelLive);
    // Allow Pusher (used by vercel.live dev overlay) in development only
    connectSrc.push('wss://*.pusher.com', 'https://*.pusher.com');
  }

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `script-src-elem ${scriptSrcElem.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `style-src-elem ${styleSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `media-src ${mediaSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
  ];
  return directives.join('; ');
}

const csp = buildCsp();
const cspReportOnly = `${csp}; report-uri /api/csp-report`;

const nextConfig: NextConfig = {
  // next dev가 AGENTS.md를 자동 생성하지 않도록 끈다
  agentRules: false,
  async redirects() {
    return [
      {
        source: '/lotto/dashboard',
        destination: '/lotto/my-numbers',
        permanent: true,
      },
      {
        source: '/lotto/normal-generator',
        destination: '/lotto/generator',
        permanent: true,
      },
      {
        source: '/lotto/advanced-generator',
        destination: '/lotto/generator',
        permanent: true,
      },
      // permanent: true는 308을 내므로 검색 색인 이동은 301로 명시한다
      // /lunch 와 그 아래 모든 옛 주소(/lunch/today 포함)
      {
        source: '/lunch/:path*',
        destination: '/meal',
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          { key: 'Content-Security-Policy', value: csp },
          // Reporting endpoints (modern and fallback)
          { key: 'Reporting-Endpoints', value: 'default="/api/csp-report"' },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
        ],
      },
    ];
  },
};

export default nextConfig;
