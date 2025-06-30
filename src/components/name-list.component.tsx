import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NameListComponentPropsType = {
  list: string[];
  title?: string;
  unitTitle?: string;
  className?: string;
  itemClassName?: string;
  onRemove: (index: number) => void;
};

export function NameListComponent({
  list,
  title = '추첨 대상자',
  unitTitle = '명',
  className = '',
  onRemove,
  itemClassName,
}: NameListComponentPropsType) {
  return (
    <div className={cn('p-4 bg-gray-50 rounded', className)}>
      <p className="mb-2">
        {title} ({list.length} {unitTitle}):
      </p>
      <ul className="space-y-1">
        {list.map((name, i) => (
          <li
            key={i}
            className={cn('flex justify-between items-center', itemClassName)}
          >
            <span>{name}</span>
            <Button
              onClick={() => onRemove(i)}
              variant="ghost"
              className="text-red-500 hover:text-red-700"
            >
              ×
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NameListComponent;
