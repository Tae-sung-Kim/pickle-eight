import { NameInputComponent, NameListComponent } from '@/components';
import { InputListSectionPropsType } from '@/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function DrawOrderInputListComponent({
  label,
  placeholder,
  list,
  onAdd,
  onRemove,
}: InputListSectionPropsType) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAdd = () => {
    const value = input.trim();
    if (value) {
      onAdd(value);
      setInput('');
    }
  };

  return (
    <motion.section
      className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        <span className="ml-1 text-xs text-gray-500">({list.length}개)</span>
      </label>

      <div
        className={`flex gap-2 mb-3 transition-all duration-200 ${
          isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''
        }`}
      >
        <NameInputComponent
          value={input}
          onChange={setInput}
          onAdd={handleAdd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isIcon={true}
          placeholder={placeholder}
          className="flex-1 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/50"
          buttonText="추가"
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-md border border-gray-100">
        <NameListComponent
          list={list}
          onRemove={onRemove}
          className="divide-y divide-gray-100"
          itemClassName="px-3 py-2 hover:bg-gray-50 transition-colors"
        />
      </div>

      {list.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          {label === '참가자'
            ? '참가자를 추가해주세요'
            : '추첨할 항목을 추가해주세요'}
        </p>
      )}
    </motion.section>
  );
}

export default DrawOrderInputListComponent;
