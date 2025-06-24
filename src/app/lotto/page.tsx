import { LottoRandomComponent } from './components';

export default function LottoPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight"> 로또 번호 생성기</h1>
        <p className="text-muted-foreground">
          AI가 추천하는 행운의 번호로 당첨의 기회를 잡아보세요!
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <LottoRandomComponent />
      </div>
    </div>
  );
}
