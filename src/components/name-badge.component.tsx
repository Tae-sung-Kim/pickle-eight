import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type NameBadgeComponentPropsType = {
  list: string[];
  className?: string;
  onRemove: (index: number) => void;
};

export function NameBadgeComponent({
  list,
  className = '',
  onRemove,
}: NameBadgeComponentPropsType) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {list.map((name, idx) => (
        <div
          key={idx}
          className={cn(
            'flex items-center bg-muted px-3 py-1 rounded-full text-sm',
            className
          )}
        >
          <span>{name}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onRemove(idx)}
            className={cn(
              'ml-1 h-5 w-5 p-0 rounded-full',
              'text-muted-foreground hover:text-destructive',
              'hover:bg-destructive/10 transition',
              'focus-visible:ring-2 focus-visible:ring-destructive'
            )}
            aria-label={`${name} 삭제`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default NameBadgeComponent;
