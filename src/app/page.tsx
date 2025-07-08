import HeroPage from './hero/page';
import HomePage from './home/page';
/**
 * 메인 홈 페이지 - 더 감각적으로 리팩토링
 */
export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        <HeroPage />
        <HomePage />
      </div>
    </div>
  );
}
