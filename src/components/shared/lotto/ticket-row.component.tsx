import { Button } from '@/components/ui/button';
import { LottoCheckTicketRowType } from "@/types/lotto.type";
import { Trash2 } from 'lucide-react';
import { Fragment } from 'react';

export function LottoCheckTicketRowComponent({
  index,
  renderInput,
  canRemove,
  onRemove,
}: LottoCheckTicketRowType) {
  return (
    <div className="group flex items-center gap-2 rounded-xl border border-muted bg-card/60 p-2 shadow-sm transition hover:bg-card sm:p-3">
      <span className="mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs text-muted-foreground">
        #{index + 1}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {(['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const).map((name) => (
          <Fragment key={name}>{renderInput(name)}</Fragment>
        ))}
      </div>
      <div className="ml-auto">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-600 transition hover:bg-destructive/10 hover:text-red-700"
            onClick={onRemove}
            aria-label={`티켓 #${index + 1} 삭제`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
