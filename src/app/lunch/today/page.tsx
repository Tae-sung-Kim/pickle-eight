import type { Metadata } from 'next';
import { ComingSoonComponent } from '@/components/coming-soon.component';

export const metadata: Metadata = {
  title: '오늘 뭐 먹지 - 점심 메뉴 추천',
  description:
    '직장인 점심 메뉴를 조건에 맞게 추천하고 룰렛으로 결정하세요. 준비 중입니다.',
  robots: { index: false, follow: true },
};

export default function LunchTodayPage() {
  return (
    <ComingSoonComponent
      type="lunch"
      title="오늘 뭐 먹지"
      description="직장인 점심 메뉴를 조건에 맞게 추천하고 룰렛으로 정하는 기능을 준비하고 있습니다."
    />
  );
}
