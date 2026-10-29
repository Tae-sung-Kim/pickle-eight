import type { Metadata } from 'next';
import { ComingSoonComponent } from '@/components/coming-soon.component';

export const metadata: Metadata = {
  title: '오늘의 타로',
  description: '카드 한 장을 뽑아 오늘의 흐름을 확인하세요. 준비 중입니다.',
  robots: { index: false, follow: true },
};

export default function TarotDailyPage() {
  return (
    <ComingSoonComponent
      type="tarot"
      title="오늘의 타로"
      description="카드 한 장을 뽑아 오늘의 흐름을 확인하는 기능을 준비하고 있습니다."
    />
  );
}
