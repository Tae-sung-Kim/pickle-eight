import { Button } from '@/components/ui/button';

type NameListComponentProps = {
  list: string[];
  title?: string;
  unitTitle?: string;
  onRemove: (index: number) => void;
};

export function NameListComponent({
  list,
  title = '추첨 대상자',
  unitTitle = '명',
  onRemove,
}: NameListComponentProps) {
  return (
    <div className="p-4 bg-gray-50 rounded">
      <p className="mb-2">
        {title} ({list.length} {unitTitle}):
      </p>
      <ul className="space-y-1">
        {list.map((name, i) => (
          <li key={i} className="flex justify-between items-center">
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
