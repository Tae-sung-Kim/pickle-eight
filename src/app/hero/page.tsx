import { HeroBanner, HeroTodayMessageComponent } from './components';

/**
 * 메인 홈 페이지 - 더 감각적으로 리팩토링
 */
export default function HeroPage() {
  return (
    <>
      <HeroBanner />
      <HeroTodayMessageComponent />
    </>
  );
}
