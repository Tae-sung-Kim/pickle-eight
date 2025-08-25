import { Button } from '@/components/ui/button';
import { FourIdiomQuizDifficultyType } from '@/types';

type FourIdiomQuizDifficultyComponentProps = {
  difficulty: FourIdiomQuizDifficultyType | null;
  isPending: boolean;
  difficultyDisabled: boolean;
  onDifficuly: (value: FourIdiomQuizDifficultyType) => void;
};

export function FourIdiomQuizDifficultyComponent({
  difficulty,
  isPending,
  difficultyDisabled,
  onDifficuly,
}: FourIdiomQuizDifficultyComponentProps) {
  return (
    <div className="mb-3 flex gap-2 items-center">
      <span className="text-xs font-semibold text-muted-foreground">
        난이도:
      </span>
      <Button
        type="button"
        size="sm"
        variant={difficulty === 'easy' ? 'secondary' : 'outline'}
        className="text-xs px-3 py-1"
        onClick={() => onDifficuly('easy')}
        disabled={isPending || difficultyDisabled}
      >
        쉬움
      </Button>
      <Button
        type="button"
        size="sm"
        variant={difficulty === 'normal' ? 'secondary' : 'outline'}
        className="text-xs px-3 py-1"
        onClick={() => onDifficuly('normal')}
        disabled={isPending || difficultyDisabled}
      >
        보통
      </Button>
      <Button
        type="button"
        size="sm"
        variant={difficulty === 'hard' ? 'secondary' : 'outline'}
        className="text-xs px-3 py-1"
        onClick={() => onDifficuly('hard')}
        disabled={isPending || difficultyDisabled}
      >
        어려움
      </Button>
    </div>
  );
}

export default FourIdiomQuizDifficultyComponent;
