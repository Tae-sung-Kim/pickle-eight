import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HERO_BADGE_LIST } from "@/constants/hero.constant";
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function HeroBannerComponent() {
  return (
    <Alert className="mb-8 surface-card border-0 shadow-lg flex flex-col md:flex-row items-center gap-4 py-4 px-4 sm:py-5 sm:px-6">
      <div
        className="hidden md:flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-full bg-primary/15 shadow"
        aria-hidden="true"
      >
        <BrainCircuit className="w-7 h-7 text-primary" />
      </div>
      <div className="flex-1">
        <AlertTitle className="font-extrabold text-2xl text-primary mb-2 text-center md:text-left line-clamp-none sm:line-clamp-2 md:line-clamp-1 break-keep">
          {process.env.NEXT_PUBLIC_SITE_NAME} — 로또·랜덤 추첨·게임·AI 퀴즈를 한
          곳에서 <span className="ml-2 animate-bounce">🎉</span>
        </AlertTitle>
        <AlertDescription className="text-base text-muted-foreground leading-relaxed">
          <span className="block text-sm text-muted-foreground mt-1">
            로또 번호·분석, 이름/자리 배정, 사다리·주사위, AI 추천·퀴즈까지.
            필요한 랜덤 도구를 빠르게 시작하세요.
          </span>
          <span className="block text-xs text-muted-foreground mt-1">
            일부 고급 분석/생성 기능은 <strong>크레딧 소모</strong>가
            발생합니다.{' '}
            <a href="/credits-policy" className="underline underline-offset-2">
              정책 보기
            </a>
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/lotto/dashboard" aria-label="로또 대시보드 바로가기">
                로또 대시보드 바로가기
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/random-picker" aria-label="랜덤 도구 모아보기">
                랜덤 도구 모아보기
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/quiz" aria-label="AI·퀴즈 모아보기">
                AI·퀴즈 모아보기
              </Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {HERO_BADGE_LIST.slice(0, 3).map((badge, idx) => (
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
