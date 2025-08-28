import Link from 'next/link';
import { cn } from '@/lib';
import { SECTION_ICON_COLOR } from '@/constants';
import MenuTooltipComponent from './tooltip.component';
import { FeatureItemType } from '@/types';
import { CreditIndicatorComponent } from '@/components';

export function HomeMenuFeatureItemComponent({
  section,
  Icon,
  href,
  label,
  description,
  example,
  className,
  isCredit,
}: FeatureItemType) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 bg-white shadow-sm border border-border transition hover:bg-primary/5 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        className
      )}
      aria-label={label}
    >
      <Icon className={cn('w-8 h-8', SECTION_ICON_COLOR[section])} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[16px] text-foreground truncate">
          {label}
        </div>
        {(description || example) && (
          <MenuTooltipComponent
            description={description ?? ''}
            example={example}
          />
        )}
      </div>
      {isCredit && (
        <span className="ml-2 flex-shrink-0">
          <CreditIndicatorComponent size="xs" showText={false} />
        </span>
      )}
      <span className="ml-2 text-primary/60 text-lg flex-shrink-0">{'>'}</span>
    </Link>
  );
}

export default HomeMenuFeatureItemComponent;
