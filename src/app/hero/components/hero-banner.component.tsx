import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HERO_BADGE_LIST, HERO_FEATURE_LIST } from '@/constants';
import { BrainCircuit } from 'lucide-react';

export function HeroBanner() {
  return (
    <Alert className="mb-8 bg-gradient-to-r from-yellow-100 to-pink-100 border-0 shadow-lg flex flex-col md:flex-row items-center gap-4 py-6 px-6">
      <div
        className="hidden md:flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-full bg-pink-100 shadow"
        aria-hidden="true"
      >
        <BrainCircuit className="w-7 h-7 text-pink-500" />
      </div>
      <div className="flex-1">
        <AlertTitle className="font-extrabold text-2xl text-pink-600 mb-2 text-center md:text-left line-clamp-none sm:line-clamp-2 md:line-clamp-1 break-keep">
          {process.env.NEXT_PUBLIC_SITE_NAME} — 로또 번호 생성·히스토리·체크 ·
          랜덤 추첨·게임 · AI 퀴즈{' '}
          <span className="ml-2 animate-bounce">🎉</span>
        </AlertTitle>
        <AlertDescription className="text-base text-gray-700 leading-relaxed">
          <span className="block text-sm text-gray-600 mt-1">
            랜덤 추첨·게임, 이름/자리·사다리·주사위, AI 추천·퀴즈까지 한 곳에서!
          </span>
          <span className="block text-xs text-gray-500 mt-1">
            {/* PWA 지원으로 빠르게, 로그인·즐겨찾기와 */}
            결과 공유/저장까지 편리하게.
            {/* 광고/수익화 정책은 투명하게 안내합니다. */}
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
