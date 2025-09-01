import type { NextConfig } from 'next';

const isProd =
  process.env.VERCEL_ENV === 'production' ||
  process.env.NODE_ENV === 'production';

function buildCsp(): string {
  const vercelLive = 'https://vercel.live';
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://cdn.applixir.com',
    'https://pagead2.googlesyndication.com',
    'https://t1.daumcdn.net',
    'https://*.kakaocdn.net',
    'https://*.daumcdn.net',
    'https://imasdk.googleapis.com',
    'https://securepubads.g.doubleclick.net',
    'https://sdk.privacy-center.org',
    'https://s0.2mdn.net',
    'https://www.googletagmanager.com',
  ];
  const scriptSrcElem = [
    "'self'",
    "'unsafe-inline'",
    'https://cdn.applixir.com',
    'https://pagead2.googlesyndication.com',
    'https://t1.daumcdn.net',
    'https://*.kakaocdn.net',
    'https://*.daumcdn.net',
    'https://imasdk.googleapis.com',
    'https://securepubads.g.doubleclick.net',
    'https://sdk.privacy-center.org',
    'https://s0.2mdn.net',
    'https://www.googletagmanager.com',
  ];
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://s3.us-east-1.amazonaws.com',
    'https://cdn.applixir.com',
  ];
  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://*.daumcdn.net',
    'https://*.kakaocdn.net',
    'https://*.g.doubleclick.net',
    'https://securepubads.g.doubleclick.net',
    'https://s0.2mdn.net',
    'https://cdn.applixir.com',
  ];
  const mediaSrc = [
    "'self'",
    'blob:',
    'data:',
    'https://cdn.applixir.com',
    'https://*.googlevideo.com',
    'https://*.gvt1.com',
  ];
  const frameSrc = [
    "'self'",
    'https://cdn.applixir.com',
    'https://*.applixir.com',
    'https://googleads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://securepubads.g.doubleclick.net',
    'https://imasdk.googleapis.com',
    'http://imasdk.googleapis.com',
    'https://*.daum.net',
    'https://*.kakao.com',
    'https://t1.daumcdn.net',
    'https://*.daumcdn.net',
    'https://*.kakaocdn.net',
  ];
  const connectSrc = ["'self'", 'https:', 'https://www.google-analytics.com'];

  if (!isProd) {
    scriptSrc.push(vercelLive);
    scriptSrcElem.push(vercelLive);
    frameSrc.push(vercelLive);
    connectSrc.push(vercelLive);
  }

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `script-src-elem ${scriptSrcElem.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `style-src-elem ${styleSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `media-src ${mediaSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
  ];
  return directives.join('; ');
}

const csp = buildCsp();

// Restrict vercel.live to non-production if desired
// "connect-src 'self' https: https://www.google-analytics.com #ifdef process.env.NODE_ENV !== 'production' https://vercel.live #endif",

const nextConfig: NextConfig = {
  /* config options here */
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
        ],
      },
    ];
  },
};

export default nextConfig;
