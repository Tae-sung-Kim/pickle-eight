'use client';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

type TeamCountInputPropsType = {
  value: number;
  onChange: (value: number) => void;
};
export function TeamCountInputComponent({
  value,
  onChange,
}: TeamCountInputPropsType) {
  const [inputValue, setInputValue] = useState<string>(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-medium">팀 개수 설정</h3>
      <Input
        type="number"
        min={1}
        value={inputValue}
        onChange={(e) => {
          const raw = e.target.value;
          setInputValue(raw);
          if (/^\d+$/.test(raw) && Number(raw) > 0) {
            onChange(Number(raw));
          }
        }}
      />
    </div>
  );
}
export default TeamCountInputComponent;
