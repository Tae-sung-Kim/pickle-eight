import { PageHeaderComponent } from '@/components/layouts/page-header.component';
import { Dice5 } from 'lucide-react';
import type { JSX, ReactNode } from 'react';

export default function RandomPickerLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      <PageHeaderComponent
        title="랜덤 도구"
        description="결정이 필요할 때, 공정하고 재미있는 랜덤 도구들을 활용해보세요."
        icon={Dice5}
        breadcrumbs={[{ label: '랜덤 도구' }]}
      />
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">{children}</div>
    </>
  );
}
