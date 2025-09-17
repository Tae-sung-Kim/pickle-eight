import { LOTTO_ANALYSIS_VARIANT_ENUM } from "@/constants/lotto.constant";
import { LottoAnalysisBarComponent } from './bar.component';

export function LottoAnalysisFrequencySectionComponent({
  frequencyByNumber,
}: {
  frequencyByNumber: Record<number, number>;
}) {
  const max = Math.max(...Object.values(frequencyByNumber));
  return (
    <section>
      <h2 className="text-lg font-medium mb-3">번호 빈도 (1-45)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => (
          <LottoAnalysisBarComponent
            key={n}
            label={String(n).padStart(2, '0')}
            value={frequencyByNumber[n] ?? 0}
            max={max}
            variant={LOTTO_ANALYSIS_VARIANT_ENUM.BY_NUMBER}
          />
        ))}
      </div>
    </section>
  );
}
