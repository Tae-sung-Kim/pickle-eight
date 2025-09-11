import { cn } from '@/lib';
import { CheckCircle2, XCircle } from 'lucide-react';
import { FourIdiomType } from '@/types';

export function FourIdiomQuizAnswerComponent({
  showAnswer,
  isCorrect,
  data,
}: {
  showAnswer: boolean;
  isCorrect: boolean | null;
  data: FourIdiomType;
}) {
  return (
    <>
      {showAnswer && (
        <div
          className={cn(
            'mt-4 flex items-center gap-3 px-5 py-4 rounded-xl border text-lg font-bold shadow transition-all duration-300',
            isCorrect
              ? 'bg-success/10 border-success/40 text-success animate-in fade-in'
              : 'bg-destructive/10 border-destructive/40 text-destructive animate-in fade-in'
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-8 h-8 text-success animate-bounce" />
              <span>정답입니다!</span>
            </>
          ) : (
            <>
              <XCircle className="w-8 h-8 text-destructive animate-shake" />
              <span>틀렸습니다.</span>
            </>
          )}
          <span className="ml-4 text-muted-foreground font-normal">
            <b>정답:</b>{' '}
            <span className="text-primary font-bold">{data?.answer}</span>
          </span>
        </div>
      )}
    </>
  );
}

export default FourIdiomQuizAnswerComponent;
