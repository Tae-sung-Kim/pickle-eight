import { useState } from 'react';
import { DiceInputComponentPropsType } from '@/types';
import { NameInputComponent } from '@/components';

const DiceInputComponent = ({ addName }: DiceInputComponentPropsType) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <NameInputComponent
          placeholder="이름을 입력하세요"
          className="pr-12 text-base flex-1"
          value={inputValue}
          onChange={(e) => setInputValue(e)}
          onAdd={handleAddName}
          isIcon={true}
          disabled={inputValue.length < 1}
        />
      </div>
    </div>
  );
};

export default DiceInputComponent;
