import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LatestResultBannerComponent } from '@/features/lotto/components/latest-result-banner.component';

type HeroComponentProps = {
  siteName: string;
  description: string;
};

export function HeroComponent({ siteName, description }: HeroComponentProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {siteName}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/lotto/normal-generator">번호 생성하기</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/lotto/check">당첨 확인하기</Link>
        </Button>
      </div>
      <div className="mt-8">
        <LatestResultBannerComponent />
      </div>
    </section>
  );
}
