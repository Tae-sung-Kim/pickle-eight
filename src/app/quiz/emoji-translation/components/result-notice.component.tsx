'use client';
import type { EmojiTranslationResultNoticeType } from "@/types/emoji-translation.type";

export function EmojiTranslationResultNoticeComponent({
  error,
  result,
}: EmojiTranslationResultNoticeType) {
  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {error.message}
      </div>
    );
  }
  if (!result) return null;
  return (
    <div
      aria-live="polite"
      className={`rounded-md border p-3 text-sm ${
        result.correct
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      <div className="font-semibold">{result.correct ? '정답!' : '오답'}</div>
      <div>{result.feedback}</div>
    </div>
  );
}
