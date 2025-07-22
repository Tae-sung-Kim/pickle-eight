import { cn } from '@/lib';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { FourIdiomType } from '@/types';

export function FourIdiomQuizAnswerComponent({
  isPending,
  showAnswer,
  isCorrect,
  data,
  canUse,
  onNewQuiz,
}: {
  isPending: boolean;
  showAnswer: boolean;
  isCorrect: boolean | null;
  data: FourIdiomType;
  canUse: boolean;
  onNewQuiz: () => void;
}) {
  return (
    <>
      {showAnswer && (
        <div
          className={cn(
            'mt-4 flex items-center gap-3 px-5 py-4 rounded-xl border text-lg font-bold shadow transition-all duration-300',
            isCorrect
              ? 'bg-green-50 border-green-400 text-green-700 animate-in fade-in'
              : 'bg-red-50 border-red-400 text-red-700 animate-in fade-in'
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce" />
              <span>정답입니다!</span>
            </>
          ) : (
            <>
              <XCircle className="w-8 h-8 text-red-500 animate-shake" />
              <span>틀렸습니다.</span>
            </>
          )}
          <span className="ml-4 text-gray-700 font-normal">
            <b>정답:</b>{' '}
            <span className="text-primary font-bold">{data?.answer}</span>
          </span>
          {canUse && (
            <Button
              className="ml-4 text-xs text-blue-500 underline"
              variant="ghost"
              onClick={onNewQuiz}
              type="button"
            >
              새 문제
            </Button>
          )}
        </div>
      )}
      {!showAnswer && (
        <Button
          className="mt-4 text-xs text-gray-500 underline"
          variant="ghost"
          onClick={onNewQuiz}
          type="button"
          disabled={isPending}
        >
          문제 새로고침
        </Button>
      )}
    </>
  );
}

export default FourIdiomQuizAnswerComponent;
