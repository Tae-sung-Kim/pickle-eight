import type { Metadata } from 'next';
import { ComingSoonComponent } from '@/components/coming-soon.component';

export const metadata: Metadata = {
  title: '오늘 어디가 - 나들이 장소 추천',
  description:
    '공공데이터 기반으로 오늘 가볼 만한 곳을 추천해 드립니다. 준비 중입니다.',
  robots: { index: false, follow: true },
};

export default function WhereTodayPage() {
  return (
    <ComingSoonComponent
      type="where"
      title="오늘 어디가"
      description="공공데이터를 연결해 오늘 가볼 만한 곳을 추천하는 기능을 준비하고 있습니다."
    />
  );
}
