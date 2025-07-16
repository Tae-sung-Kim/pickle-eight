import { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { cn } from '@/lib';

type NameInputComponentPropsType = {
  value: string;
  className?: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  isIcon?: boolean;
  disabled?: boolean;
  placeholder?: string;
  buttonText?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function NameInputComponent({
  value,
  className = '',
  onChange,
  onAdd,
  disabled = false,
  isIcon = false,
  placeholder = '이름을 입력하세요',
  buttonText = '추가',
  ...props
}: NameInputComponentPropsType) {
  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        {...props}
      />

      {isIcon ? (
        <Button
          onClick={onAdd}
          disabled={disabled}
          size="icon"
          className="bg-sky-400 text-white hover:bg-sky-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onAdd}
          disabled={disabled}
          className="bg-gradient-to-r from-sky-400 to-blue-400 text-white hover:from-sky-500 hover:to-blue-500 whitespace-nowrap transition-all duration-200 hover:shadow-md active:scale-[0.98]"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
NameInputComponent.displayName = 'NameInputComponent';
export default NameInputComponent;
