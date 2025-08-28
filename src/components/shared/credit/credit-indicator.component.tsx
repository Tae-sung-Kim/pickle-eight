import { Coins } from 'lucide-react';
import { cn } from '@/lib';

export type CreditIndicatorType = {
  size?: 'xs' | 'sm';
  showText?: boolean;
  className?: string;
};

export function CreditIndicatorComponent({
  size = 'xs',
  showText = false,
  className,
}: CreditIndicatorType) {
  const iconCls = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textCls = size === 'xs' ? 'text-[11px]' : 'text-xs';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-muted-foreground',
        textCls,
        className
      )}
      aria-label="Requires credits"
      title="크레딧 소모 기능"
    >
      <Coins className={cn(iconCls, 'text-amber-500')} />
      {showText && <span>Credit</span>}
    </span>
  );
}

export default CreditIndicatorComponent;
