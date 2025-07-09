'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HERO_BADGE_LIST, HERO_FEATURE_LIST } from '@/constants';
import { Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <Alert className="mb-8 bg-gradient-to-r from-yellow-100 to-pink-100 border-0 shadow-lg flex flex-col md:flex-row items-center gap-4 py-6 px-6">
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 shadow">
        <Sparkles className="w-8 h-8 text-pink-500" />
      </div>
      <div className="flex-1">
        <AlertTitle className="font-extrabold text-2xl text-pink-600 mb-2 text-center md:text-left">
          {process.env.NEXT_PUBLIC_SITE_NAME}에 오신 걸 환영합니다!{' '}
          <span className="ml-2 animate-bounce">🎉</span>
        </AlertTitle>
        <AlertDescription className="text-base text-gray-700 leading-relaxed">
          <span className="font-semibold text-pink-500">
            {process.env.NEXT_PUBLIC_SITE_NAME}는?
          </span>
          누구나 쉽고 재미있게 사용할 수 있는{' '}
          <span className="font-semibold">랜덤 추첨 & 게임 플랫폼입니다.</span>
          <span className="block text-sm text-gray-600 mt-1">
            모임, 행사, 파티, 회식, 학교, 회사 등 다양한 상황에서 활용할 수 있는
            여러 가지 추첨/게임 기능을 제공합니다.
          </span>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-sm text-gray-700">
            {HERO_FEATURE_LIST.map((item, idx) => (
              <li key={idx}>
                {item.description}
                {item.highlight && (
                  <span className={`font-semibold ${item.color}`}>
                    {item.highlight}
                  </span>
                )}
                {item.suffix && item.suffix}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {HERO_BADGE_LIST.map((badge, idx) => (
              <span
                key={idx}
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
