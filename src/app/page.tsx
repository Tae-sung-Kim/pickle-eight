import { Sparkles, Users, CalendarHeart } from 'lucide-react';
import {
  HeroBanner,
  HeroMenuGridComponent,
  HeroTodayMessageComponent,
  HomeIntroCard,
} from './(home)';

/**
 * 메인 홈 페이지 - 더 감각적으로 리팩토링
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        <HeroBanner />
        <HeroTodayMessageComponent />
        <HeroMenuGridComponent />
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          <HomeIntroCard
            title="Pickle-eight이란?"
            icon={<Sparkles className="w-7 h-7 text-pink-500" />}
            description="누구나 쉽고 재미있게 사용할 수 있는 랜덤 추첨 & 게임 플랫폼입니다. 다양한 상황에서 공정하고 즐거운 추첨/게임 경험을 제공합니다."
          />
          <HomeIntroCard
            title="주요 활용 예시"
            icon={<Users className="w-7 h-7 text-purple-500" />}
            description="모임 자리 배정, 경품 추첨, 점심 메뉴 정하기, 행사 순서 정하기, 파티 게임 등 다양한 상황에서 활용할 수 있습니다."
          />
          <HomeIntroCard
            title="계속 발전 중!"
            icon={<CalendarHeart className="w-7 h-7 text-yellow-500" />}
            description="여러분의 피드백과 아이디어로 Pickle-eight은 계속 성장합니다. 불편사항이나 추가 희망 기능이 있다면 언제든 남겨주세요!"
          />
        </div>
      </div>
    </div>
  );
}
