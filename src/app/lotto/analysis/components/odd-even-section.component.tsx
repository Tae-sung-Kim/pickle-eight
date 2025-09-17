import { LOTTO_ANALYSIS_ODD_EVEN_COLOR_MAP } from "@/constants/lotto.constant";
import LottoAnalysisBarComponent from './bar.component';

export function LottoAnalysisOddEvenSectionComponent({
  odd,
  even,
}: {
  odd: number;
  even: number;
}) {
  const max = odd + even;

  return (
    <section>
      <h2 className="text-lg font-medium mb-3">홀/짝 분포</h2>
      <div className="space-y-2">
        <LottoAnalysisBarComponent
          label="홀수"
          value={odd}
          max={max}
          colorMap={LOTTO_ANALYSIS_ODD_EVEN_COLOR_MAP}
        />
        <LottoAnalysisBarComponent
          label="짝수"
          value={even}
          max={max}
          colorMap={LOTTO_ANALYSIS_ODD_EVEN_COLOR_MAP}
        />
      </div>
    </section>
  );
}

export default LottoAnalysisOddEvenSectionComponent;
