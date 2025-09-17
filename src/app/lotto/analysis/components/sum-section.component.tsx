import { LOTTO_ANALYSIS_SUM_COLOR_MAP } from "@/constants/lotto.constant";
import { LottoAnalysisBarComponent } from './bar.component';

export function LottoAnalysisSumSectionComponent({
  sumDistribution,
}: {
  sumDistribution: Record<string, number>;
}) {
  const max = Math.max(...Object.values(sumDistribution));

  return (
    <section>
      <h2 className="text-lg font-medium mb-3">합계 분포</h2>
      <div className="space-y-2">
        {Object.entries(sumDistribution).map(([k, v]) => (
          <LottoAnalysisBarComponent
            key={k}
            label={k}
            value={v}
            max={max}
            colorMap={LOTTO_ANALYSIS_SUM_COLOR_MAP}
          />
        ))}
      </div>
    </section>
  );
}
