'use client';
import { NameInputComponent } from '@/components/shared/name/input.component';
import { NameListComponent } from '@/components/shared/name/list.component';
import { InputListSectionPropsType } from '@/types/draw-order.type';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
      className="rounded-2xl border border-border bg-white/70 backdrop-blur p-4 sm:p-5 shadow-sm ring-1 ring-black/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-semibold text-foreground mb-2">
        {label}
        <span className="ml-1 text-xs text-muted-foreground">
          ({list.length}개)
        </span>
      </label>

      <div
        className={`flex gap-2 mb-3 transition-all duration-200 ${
          isFocused ? 'ring-2 ring-primary/30 rounded-xl bg-primary/5' : ''
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
          className="flex-1 bg-muted border-border focus:ring-2 focus:ring-primary/50"
          buttonText="추가"
        />
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-white">
        <NameListComponent
          list={list}
          onRemove={onRemove}
          className="divide-y divide-border"
          itemClassName="px-3 py-2 hover:bg-muted/60 transition-colors"
        />
      </div>

      {list.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {label === '참가자'
            ? '참가자를 추가해주세요'
            : '추첨할 항목을 추가해주세요'}
        </p>
      )}
    </motion.section>
  );
}

export default DrawOrderInputListComponent;
