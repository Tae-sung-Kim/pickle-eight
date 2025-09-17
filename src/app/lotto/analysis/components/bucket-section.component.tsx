import { LOTTO_ANALYSIS_VARIANT_ENUM } from "@/constants/lotto.constant";
import { LottoAnalysisBarComponent } from './bar.component';

export function LottoAnalysisBucketSectionComponent({
  bucketDistribution,
}: {
  bucketDistribution: Record<string, number>;
}) {
  const max = Math.max(...Object.values(bucketDistribution));
  return (
    <section>
      <h2 className="text-lg font-medium mb-3">구간 분포</h2>
      <div className="space-y-2">
        {Object.entries(bucketDistribution).map(([k, v]) => (
          <LottoAnalysisBarComponent
            key={k}
            label={k}
            value={v}
            max={max}
            variant={LOTTO_ANALYSIS_VARIANT_ENUM.BY_BUCKET}
          />
        ))}
      </div>
    </section>
  );
}
