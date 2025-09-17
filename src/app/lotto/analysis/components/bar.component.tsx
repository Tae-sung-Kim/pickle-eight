import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { LOTTO_ANALYSIS_CHART_BUCKET_COLORS, LOTTO_ANALYSIS_VARIANT_ENUM } from "@/constants/lotto.constant";
import { LottoAnalysisVariantValueType } from "@/types/lotto.type";
import { bucketLabel } from "@/utils/lotto.util";

export function LottoAnalysisBarComponent({
  label,
  value,
  max,
  variant = LOTTO_ANALYSIS_VARIANT_ENUM.DEFAULT,
  /** 라벨별로 직접 그라데이션 클래스를 지정하고 싶을 때 사용 */
  colorMap,
}: {
  label: string;
  value: number;
  max: number;
  variant?: LottoAnalysisVariantValueType;
  colorMap?: Readonly<Record<string, string>>;
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  const percentLabel = `${width}%`;

  const gradientFromVariant = (() => {
    if (variant === LOTTO_ANALYSIS_VARIANT_ENUM.BY_NUMBER) {
      const n = parseInt(label, 10);
      if (Number.isNaN(n))
        return 'from-[var(--color-primary)] to-[var(--color-primary)]';
      const b = bucketLabel(n);
      return (
        LOTTO_ANALYSIS_CHART_BUCKET_COLORS[b] ??
        'from-[var(--color-primary)] to-[var(--color-primary)]'
      );
    }
    if (variant === LOTTO_ANALYSIS_VARIANT_ENUM.BY_BUCKET) {
      return (
        LOTTO_ANALYSIS_CHART_BUCKET_COLORS[label] ??
        'from-[var(--color-primary)] to-[var(--color-primary)]'
      );
    }
    return 'from-[var(--color-primary)] to-[var(--color-primary)]';
  })();

  const gradientClass = colorMap?.[label] ?? gradientFromVariant;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-20 shrink-0 text-xs text-muted-foreground"
        title={label}
      >
        {label}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="relative h-3 w-full overflow-hidden rounded bg-muted ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            role="progressbar"
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            tabIndex={0}
          >
            <div
              className={`h-3 rounded bg-gradient-to-r ${gradientClass} transition-[width] duration-500 ease-out`}
              style={{ width: `${width}%` }}
            />
            <span className="sr-only">
              {label}: {value} ({percentLabel})
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          <span className="font-medium">{label}</span>
          <span className="mx-1">·</span>
          <span>{value}</span>
          <span className="ml-1 text-primary-foreground/80">
            ({percentLabel})
          </span>
        </TooltipContent>
      </Tooltip>
      <div className="w-10 shrink-0 text-right text-xs tabular-nums">
        {value}
      </div>
    </div>
  );
}
