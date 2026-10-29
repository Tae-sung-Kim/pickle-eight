import Link from 'next/link';
import { SECTION_BADGE_COLOR } from '@/constants/theme.constant';
import { cn } from '@/lib/utils';
import type { MenuSectionKeyType } from '@/types/menu.type';

export function ComingSoonComponent({
  type,
  title,
  description,
}: {
  type: MenuSectionKeyType;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <span
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium',
          SECTION_BADGE_COLOR[type]
        )}
      >
        준비 중
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15"
      >
        홈으로 이동
      </Link>
    </section>
  );
}
