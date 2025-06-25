import { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type NameInputComponentProps = {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
};

export function NameInputComponent({
  value,
  onChange,
  onAdd,
}: NameInputComponentProps) {
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder="이름 입력"
        className="flex-1 p-2 border rounded"
      />
      <Button onClick={onAdd} disabled={!value.trim()}>
        추가
      </Button>
    </div>
  );
}

export default NameInputComponent;
