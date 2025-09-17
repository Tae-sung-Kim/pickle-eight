import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";
import {
    FormState,
    UseFormHandleSubmit,
    UseFormRegister,
} from 'react-hook-form';

type FormValues = { answer: string };

type FourIdiomQuizFormComponentType = {
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onSubmit: (data: FormValues) => void;
  showAnswer: boolean;
  isPending: boolean;
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
};

export function FourIdiomQuizFormComponent({
  handleSubmit,
  onSubmit,
  showAnswer,
  isPending,
  register,
  formState,
}: FourIdiomQuizFormComponentType) {
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 mb-2"
        autoComplete="off"
      >
        <Input
          {...register('answer')}
          className={cn(
            'border border-border px-4 py-2 rounded-lg w-36 text-lg font-semibold focus:ring-2 focus:ring-primary/30 transition',
            showAnswer || isPending ? 'bg-muted' : 'surface-card'
          )}
          placeholder="정답(4글자)"
          disabled={showAnswer || isPending}
          maxLength={4}
        />
        <Button
          type="submit"
          size="lg"
          className="bg-primary text-primary-foreground font-bold shadow"
          disabled={showAnswer || isPending}
        >
          정답 확인
        </Button>
      </form>
      {formState.errors.answer && (
        <div className="text-destructive text-sm mb-3 font-semibold">
          {formState.errors.answer.message}
        </div>
      )}
    </>
  );
}
