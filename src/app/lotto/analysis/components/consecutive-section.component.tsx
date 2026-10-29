export function LottoAnalysisConsecutiveSectionComponent({
  consecutiveCount,
}: {
  consecutiveCount: number;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium mb-3">연속수 발생</h2>
      <p className="text-sm">
        연속된 번호가 포함된 회차 수:{' '}
        <span className="font-medium">{consecutiveCount}</span>
      </p>
    </section>
  );
}
