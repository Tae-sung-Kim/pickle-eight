import { cn } from '@/lib/utils';

export function ComingSoonBadgeComponent({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground',
        className
      )}
    >
      준비 중
    </span>
  );
}
