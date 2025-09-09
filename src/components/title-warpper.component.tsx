import { SECTION_ICON_COLOR } from '@/constants';
import { cn } from '@/lib';
import { MenuSectionKeyType } from '@/types';

export function TitleWrapperComponent({
  type,
  title,
  description,
}: {
  type: MenuSectionKeyType;
  title: string;
  description: string;
}) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-4 text-center">
        <h1
          className={cn(
            'text-4xl sm:text-5xl font-bold tracking-tight',
            SECTION_ICON_COLOR[type]
          )}
        >
          {title}
        </h1>
        <p className="mt-3 text-base sm:text-md text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}
