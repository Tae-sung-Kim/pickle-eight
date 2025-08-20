import { LottoCheckComponent } from './components';
import { LottoWarningAlertComponent } from '@/components/lotto-warning-alert.component';

export default function LottoCheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 번호 채점기</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 확인하세요.
      </p>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

      <LottoCheckComponent />
    </div>
  );
}
