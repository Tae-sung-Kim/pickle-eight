import { Button } from '@/components/ui/button';

type NameListComponentProps = {
  names: string[];
  title?: string;
  onRemove: (index: number) => void;
};

export function NameListComponent({
  names,
  title = '추첨 대상자',
  onRemove,
}: NameListComponentProps) {
  return (
    <div className="p-4 bg-gray-50 rounded">
      <p className="mb-2">
        {title} ({names.length}명):
      </p>
      <ul className="space-y-1">
        {names.map((name, i) => (
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
