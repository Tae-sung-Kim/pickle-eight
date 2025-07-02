import { HeroBanner, HomeIntroCard } from './(home)';
import { Sparkles, Users, CalendarHeart } from 'lucide-react';

/**
 * Home page
 */
export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <HeroBanner />
      <div className="grid gap-6 md:grid-cols-2">
        <HomeIntroCard
          title="이 홈페이지란?"
          description="다양한 랜덤 추첨, 게임 기능을 한 곳에서 제공합니다. 로또 번호 생성, 자리 배정, 항목 추첨, 사다리 타기 등 재미있고 유용한 도구를 경험해보세요!"
          icon={<Sparkles className="text-yellow-500" />}
        />
        <HomeIntroCard
          title="언제 이용하면 좋나요?"
          description="친구들과의 모임, 회식, 경품 추첨, 자리 배정, 점심 메뉴 추천 등 다양한 상황에서 활용할 수 있습니다."
          icon={<Users className="text-pink-500" />}
        />
        <HomeIntroCard
          title="계속 발전중!"
          description="지속적으로 새로운 기능과 개선이 추가됩니다. 자주 방문해서 새로운 도구를 경험해보세요."
          icon={<CalendarHeart className="text-blue-500" />}
        />
      </div>
    </div>
  );
}
