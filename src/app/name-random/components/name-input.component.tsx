// src/app/name-picker/components/name-input.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNameRandomStore } from '@/stores';

const nameSchema = z.object({
  names: z.string().min(1, '이름을 입력해주세요'),
});

export function NameInputComponent() {
  const { setNames } = useNameRandomStore();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(nameSchema),
  });

  const onSubmit = (data: { names: string }) => {
    const nameList = data.names
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean);
    setNames(nameList);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
      <label className="block mb-2">
        이름을 입력하세요 (한 줄에 하나씩)
        <textarea
          {...register('names')}
          className="w-full p-2 border rounded mt-1 h-40"
          placeholder="예시:&#10;홍길동&#10;김철수&#10;이영희"
        />
      </label>
    </form>
  );
}

export default NameInputComponent;
