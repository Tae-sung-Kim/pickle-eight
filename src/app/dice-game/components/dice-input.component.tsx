import NameInputComponent from '@/components/name-input.component';
import { useState } from 'react';

const DiceInputComponent = ({
  addName,
}: {
  addName: (name: string) => boolean;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <NameInputComponent
        value={inputValue}
        onAdd={handleAddName}
        onChange={setInputValue}
      />
    </div>
  );
};

export default DiceInputComponent;
