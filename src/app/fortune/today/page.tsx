import type { Metadata } from 'next';
import { ComingSoonComponent } from '@/components/coming-soon.component';

export const metadata: Metadata = {
  title: '오늘의 운세',
  description:
    '생년월일로 오늘의 총운과 행운 포인트를 확인하세요. 준비 중입니다.',
  robots: { index: false, follow: true },
};

export default function FortuneTodayPage() {
  return (
    <ComingSoonComponent
      type="fortune"
      title="오늘의 운세"
      description="생년월일로 오늘의 총운과 행운 포인트를 확인하는 기능을 준비하고 있습니다."
    />
  );
}
