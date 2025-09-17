'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmojiTranslationFormType } from "@/types/emoji-translation.type";
import { FormEvent } from 'react';

export function EmojiTranslationFormComponent({
  onSubmit,
  isPending,
}: EmojiTranslationFormType) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const guess = String(formData.get('guess') || '').trim();
    if (!guess) return;
    onSubmit(guess);
    e.currentTarget.reset();
  };

  return (
    <Card className="p-5 sm:p-6 rounded-xl shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:gap-2"
      >
        <Label htmlFor="guess" className="sr-only">
          정답
        </Label>
        <Input
          id="guess"
          name="guess"
          placeholder="정답 입력"
          className="h-11 sm:flex-1"
        />
        <Button
          type="submit"
          variant="secondary"
          className="h-11 px-6"
          disabled={isPending}
        >
          {isPending ? '채점 중...' : '제출'}
        </Button>
      </form>
    </Card>
  );
}
