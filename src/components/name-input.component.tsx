import { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type NameInputComponentProps = {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
  buttonText?: string;
};

export function NameInputComponent({
  value,
  onChange,
  onAdd,
  placeholder = '이름을 입력하세요',
  buttonText = '추가',
}: NameInputComponentProps) {
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
        placeholder={placeholder}
        className="flex-1"
      />
      <Button onClick={onAdd} className="whitespace-nowrap">
        {buttonText}
      </Button>
    </div>
  );
}
NameInputComponent.displayName = 'NameInputComponent';
export default NameInputComponent;
