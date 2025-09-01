import type { NextConfig } from 'next';

const csp = [
  "default-src 'self'",
  // Scripts (Applixir + Google + Kakao/Daum AdFit + IMA/DFP + CMP)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.applixir.com https://pagead2.googlesyndication.com https://t1.daumcdn.net https://*.kakaocdn.net https://*.daumcdn.net https://imasdk.googleapis.com https://securepubads.g.doubleclick.net https://sdk.privacy-center.org https://s0.2mdn.net https://www.googletagmanager.com https://vercel.live",
  // Some browsers consult script-src-elem separately
  "script-src-elem 'self' 'unsafe-inline' https://cdn.applixir.com https://pagead2.googlesyndication.com https://t1.daumcdn.net https://*.kakaocdn.net https://*.daumcdn.net https://imasdk.googleapis.com https://securepubads.g.doubleclick.net https://sdk.privacy-center.org https://s0.2mdn.net https://www.googletagmanager.com https://vercel.live",
  // Styles (allow Applixir CSS hosted on S3 and their CDN)
  "style-src 'self' 'unsafe-inline' https://s3.us-east-1.amazonaws.com https://cdn.applixir.com",
  "style-src-elem 'self' 'unsafe-inline' https://s3.us-east-1.amazonaws.com https://cdn.applixir.com",
  // Images used by ads/SDKs
  "img-src 'self' data: blob: https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://*.daumcdn.net https://*.kakaocdn.net https://*.g.doubleclick.net https://securepubads.g.doubleclick.net https://s0.2mdn.net https://cdn.applixir.com",
  // Media (allow Applixir video placeholder)
  "media-src 'self' blob: data: https://cdn.applixir.com https://*.googlevideo.com https://*.gvt1.com",
  // Frames (Applixir player + Google ads + Kakao/Daum frames incl. daumcdn + IMA)
  "frame-src 'self' https://cdn.applixir.com https://*.applixir.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://securepubads.g.doubleclick.net https://imasdk.googleapis.com http://imasdk.googleapis.com https://*.daum.net https://*.kakao.com https://t1.daumcdn.net https://*.daumcdn.net https://*.kakaocdn.net",
  // XHR/WebSocket
  "connect-src 'self' https: https://www.google-analytics.com https://vercel.live",
].join('; ');

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
