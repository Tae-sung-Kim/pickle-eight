'use client';
import { Card } from '@/components/ui/card';
import type { EmojiTranslationProblemType } from "@/types/emoji-translation.type";

export function EmojiTranslationProblemCardComponent({
  problem,
}: {
  problem: EmojiTranslationProblemType;
}) {
  const categoryBadgeClass: Record<string, string> = {
    영화: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/15 dark:text-violet-300 dark:border-violet-400/30',
    음식: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/30',
    일상: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-400/15 dark:text-slate-300 dark:border-slate-400/30',
    랜덤: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-400/15 dark:text-indigo-300 dark:border-indigo-400/30',
  } as const;

  return (
    <Card className="p-6 rounded-xl shadow-sm text-center">
      <div className="text-6xl sm:text-7xl mb-2">{problem.emojis}</div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span
          className={
            'inline-flex items-center rounded-full border px-2.5 py-0.5 ' +
            (categoryBadgeClass[problem.category] ||
              'bg-muted text-foreground/70 border-muted-foreground/20')
          }
        >
          {problem.category}
        </span>
        {problem.hint && <span>· 힌트 제공</span>}
      </div>
      {problem.hint && (
        <div className="mt-3 inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          힌트: {problem.hint}
        </div>
      )}
    </Card>
  );
}
