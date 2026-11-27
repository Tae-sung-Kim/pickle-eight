import type { JSX } from 'react';

/**
 * LottoFooterNoticeComponent
 * - Non-affiliation and data source disclaimer for lotto pages
 * - Age restriction notice (19+)
 */
export function LottoFooterNoticeComponent(): JSX.Element {
  return (
    <footer className="mt-10 rounded-2xl border border-border bg-surface-card p-4 text-xs text-muted-foreground">
      <ul className="list-disc space-y-1 pl-5">
        <li>
          본 서비스는 정부기관/복권 운영사 등과 제휴·후원·승인 관계가 아닌
          비공식 서비스입니다. 표기된 상표·명칭은 각 소유자의 권리에 귀속되며
          식별·설명 목적의 사용입니다.
        </li>
        <li>
          공개 결과 데이터는 서버에서 수집해 제공하며, 정확성·적시성·완전성을
          보증하지 않습니다. 투자·재정·법률 자문이 아니며, 과도한 구매/베팅을
          지양하세요. 이용에 따른 책임은 이용자에게 있습니다.
        </li>
        <li>
          로또 관련 모든 기능의 결과는 참고용이며 당첨을 보장하지 않습니다.
        </li>
        <li>로또 관련 기능은 만 19세 이상에게만 제공됩니다.</li>
      </ul>
    </footer>
  );
}
