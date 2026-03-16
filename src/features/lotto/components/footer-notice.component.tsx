import type { JSX } from 'react';

/**
 * LottoFooterNoticeComponent
 * - Non-affiliation and data source disclaimer for lotto pages
 * - Age restriction notice (19+)
 */
export function LottoFooterNoticeComponent(): JSX.Element {
  return (
    <footer
      aria-label="lotto-disclaimer"
      className="mt-10 rounded-2xl border border-border bg-surface-card p-4 text-xs text-muted-foreground"
    >
      <ul className="list-disc space-y-1 pl-5">
        <li>
          본 서비스는 정부기관/복권 운영사 등과 제휴·후원·승인 관계가 아닌
          비공식 서비스입니다. 표기된 상표·명칭은 각 소유자의 권리에 귀속되며
          식별·설명 목적의 사용입니다.
        </li>
        <li>
          로또 회차·당첨 번호 등 공개 결과 데이터는 서버 측 스케줄 잡(크론)을
          통해 수집·검증 후 Firestore에 저장되며, 클라이언트는 내부 API를
          통해서만 조회합니다. 최신 결과는 공식 채널을 확인하세요.
        </li>
        <li>
          제공 정보는 참고용이며 정확성·적시성·완전성·지속성을 보증하지
          않습니다. 이용에 따른 모든 책임은 이용자에게 있습니다.
        </li>
        <li>로또 관련 기능은 만 19세 이상에게만 제공됩니다.</li>
        <li>
          본 서비스의 정보 및 번호 생성 결과는 투자·재정·법률 자문이 아니며,
          과도한 구매/베팅을 지양하고 책임 있는 이용을 권장합니다.
        </li>
      </ul>
    </footer>
  );
}
